import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.shortcuts import get_object_or_404
from django.utils.crypto import constant_time_compare
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView

from catalogo.models import Reloj
from .models import Orden, DetalleOrden
from .serializers import OrdenSerializer
from .views import _serializar_carrito

logger = logging.getLogger(__name__)

MAX_ITEMS_POR_ORDEN = 20
MAX_CANTIDAD_POR_LINEA = 50
MAX_LEN = {
    'cliente_nombre': 150,
    'cliente_email': 254,
    'cliente_telefono': 30,
    'direccion_envio': 500,
    'ciudad': 100,
    'pais': 100,
    'notas': 2000,
}


def _texto(data, clave, requerido=True, default=''):
    """Extrae un campo de texto validando tipo y longitud. Devuelve (valor, error)."""
    valor = data.get(clave, default)
    if valor is None:
        valor = ''
    if not isinstance(valor, str):
        return None, f"El campo '{clave}' debe ser un texto."
    valor = valor.strip()
    if requerido and not valor:
        return None, f"El campo '{clave}' es obligatorio."
    if len(valor) > MAX_LEN.get(clave, 500):
        return None, f"El campo '{clave}' excede la longitud máxima permitida."
    return valor, None


class CheckoutAPIView(APIView):
    """
    Endpoint REST para el protocolo académico de adquisición desde React SPA.
    NO procesa un pago bancario real: registra una solicitud/protocolo de
    adquisición y emite el comprobante de la orden.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        if not isinstance(data, dict):
            return Response(
                {'error': 'El cuerpo de la solicitud debe ser un objeto JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cliente_nombre, err = _texto(data, 'cliente_nombre')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        cliente_email, err = _texto(data, 'cliente_email')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(cliente_email)
        except DjangoValidationError:
            return Response(
                {'error': 'El correo electrónico no tiene un formato válido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cliente_telefono, err = _texto(data, 'cliente_telefono')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        direccion_envio, err = _texto(data, 'direccion_envio')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        ciudad, err = _texto(data, 'ciudad', requerido=False, default='San Isidro, Lima')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        pais, err = _texto(data, 'pais', requerido=False, default='Perú')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
        notas, err = _texto(data, 'notas', requerido=False, default='')
        if err:
            return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

        # P5: la aceptación de términos/garantía de la orden también se exige en backend.
        garantia = data.get('garantia_aceptada', False)
        if isinstance(garantia, str):
            garantia = garantia.strip().lower() in ('true', '1', 'yes', 'si', 'sí', 'on')
        if garantia is not True:
            return Response(
                {'error': 'Debe aceptar los términos de la orden para continuar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = data.get('items', [])
        if not isinstance(items, list) or not items:
            return Response(
                {'error': 'La selección de piezas en bolsa está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(items) > MAX_ITEMS_POR_ORDEN:
            return Response(
                {'error': f'La orden supera el máximo de {MAX_ITEMS_POR_ORDEN} líneas permitido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # P4: validación estricta de IDs y cantidades (sin provocar 500).
        item_qty_map = {}
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                return Response(
                    {'error': f'La línea {idx + 1} tiene un formato inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            rid_raw = item.get('reloj_id', item.get('id', None))
            qty_raw = item.get('cantidad', 1)
            try:
                rid = int(rid_raw)
            except (TypeError, ValueError):
                return Response(
                    {'error': f'La línea {idx + 1} tiene un ID de reloj inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                qty = int(qty_raw)
            except (TypeError, ValueError):
                return Response(
                    {'error': f'La línea {idx + 1} tiene una cantidad inválida.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if rid <= 0:
                return Response(
                    {'error': f'La línea {idx + 1} tiene un ID de reloj inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if qty < 1 or qty > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La línea {idx + 1} tiene una cantidad fuera de rango (1-{MAX_CANTIDAD_POR_LINEA}).'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Consolidar duplicados sumando cantidades.
            item_qty_map[rid] = item_qty_map.get(rid, 0) + qty
            if item_qty_map[rid] > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La pieza con ID {rid} supera la cantidad máxima por orden.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reloj_ids = list(item_qty_map.keys())
        if not reloj_ids:
            return Response(
                {'error': 'No se encontraron piezas válidas para procesar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                relojes_qs = Reloj.objects.select_for_update().filter(id__in=reloj_ids)
                reloj_map = {r.id: r for r in relojes_qs}

                # 1. Validar existencia y stock de cada pieza
                for rid, qty in item_qty_map.items():
                    reloj = reloj_map.get(rid)
                    if not reloj:
                        return Response(
                            {'error': f"La pieza con ID {rid} ya no se encuentra en el inventario activo."},
                            status=status.HTTP_404_NOT_FOUND,
                        )
                    if reloj.stock < qty:
                        return Response(
                            {
                                'error': f"Disponibilidad insuficiente para '{reloj.marca.nombre} {reloj.nombre}'. "
                                         f"Quedan {reloj.stock} unidad(es) en bóveda."
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                # 2. Crear Orden como SOLICITUD académica (no es un pago bancario real).
                orden = Orden.objects.create(
                    cliente_nombre=cliente_nombre,
                    cliente_email=cliente_email,
                    cliente_telefono=cliente_telefono,
                    direccion_envio=direccion_envio,
                    ciudad=ciudad or 'San Isidro, Lima',
                    pais=pais or 'Perú',
                    notas=notas,
                    garantia_aceptada=True,
                    estado=Orden.EstadoOrden.SOLICITADA,
                    usuario=request.user if request.user.is_authenticated else None,
                )

                # 3. Crear detalles y descontar inventario físico
                for rid, qty in item_qty_map.items():
                    reloj = reloj_map[rid]
                    DetalleOrden.objects.create(
                        orden=orden,
                        reloj=reloj,
                        precio_unitario=reloj.precio,
                        cantidad=qty,
                    )
                    reloj.stock -= qty
                    reloj.save(update_fields=['stock'])

                orden.actualizar_total()

                # Limpiar sesión en caso se haya usado también sesión de Django
                if hasattr(request, 'session') and 'carrito' in request.session:
                    request.session['carrito'] = {}
                    request.session.modified = True

                serializer = OrdenSerializer(orden)
                response_data = {
                    'success': True,
                    'mensaje': f"Solicitud registrada con éxito. Comprobante {serializer.data['codigo_orden']}. "
                               f"Protocolo académico: no se ha procesado ningún pago bancario real.",
                    'orden': serializer.data,
                }
                if not request.user.is_authenticated:
                    response_data['token_acceso'] = str(orden.token_acceso)
                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception:
            logger.exception('Error al procesar la solicitud de adquisición en bóveda')
            return Response(
                {'error': 'Ocurrió un error al procesar la solicitud. Por favor intente nuevamente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class OrdenDetailAPIView(APIView):
    """
    Endpoint para recuperar el comprobante de una orden emitida.
    GET /api/pedidos/ordenes/<id>/?token=<token_acceso>

    El token se entrega en la respuesta del checkout y es necesario para
    visualizar el comprobante. Sin token válido se responde 404 genérico
    para no confirmar la existencia de la orden ni exponer datos personales.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        token = request.query_params.get('token', '')
        if not token:
            return Response(
                {'error': 'Comprobante no disponible.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            orden = get_object_or_404(
                Orden.objects.prefetch_related('detalles__reloj__marca', 'detalles__reloj__categorias'),
                pk=pk,
            )
        except Exception:
            return Response(
                {'error': 'Comprobante no disponible.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not constant_time_compare(str(orden.token_acceso), str(token)):
            return Response(
                {'error': 'Comprobante no disponible.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrdenSerializer(orden)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CarritoValidateAPIView(APIView):
    """
    Valida un carrito del frontend (localStorage) contra precios y stock
    vigentes en el backend, sin modificar inventario.
    POST /api/pedidos/carrito/validar/
    Body: {"items": [{"reloj_id": 1, "cantidad": 2}]}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data if isinstance(request.data, dict) else {}
        items = data.get('items', [])
        if not isinstance(items, list) or not items:
            return Response(
                {'error': 'La selección de piezas está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(items) > MAX_ITEMS_POR_ORDEN:
            return Response(
                {'error': f'La selección supera el máximo de {MAX_ITEMS_POR_ORDEN} líneas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qty_map = {}
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                return Response(
                    {'error': f'La línea {idx + 1} tiene un formato inválido.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                rid = int(item.get('reloj_id', item.get('id', 0)))
                qty = int(item.get('cantidad', 1))
            except (TypeError, ValueError):
                return Response(
                    {'error': f'La línea {idx + 1} tiene ID o cantidad inválidos.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if rid <= 0 or qty < 1 or qty > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La línea {idx + 1} tiene valores fuera de rango.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qty_map[rid] = qty_map.get(rid, 0) + qty
            if qty_map[rid] > MAX_CANTIDAD_POR_LINEA:
                return Response(
                    {'error': f'La pieza con ID {rid} supera la cantidad máxima por orden.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            relojes = Reloj.objects.select_related('marca').filter(id__in=list(qty_map.keys()))
            reloj_map = {r.id: r for r in relojes}
        except Exception:
            logger.exception('Error al validar el carrito')
            return Response(
                {'error': 'No fue posible validar la selección. Intente nuevamente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        validados = []
        incidencias = []
        total = 0
        for rid, qty in qty_map.items():
            reloj = reloj_map.get(rid)
            if not reloj:
                incidencias.append(f'La pieza con ID {rid} ya no está disponible y fue retirada.')
                continue
            if reloj.stock <= 0:
                incidencias.append(f"'{reloj.marca.nombre} {reloj.nombre}' se encuentra agotada y fue retirada.")
                continue
            qty_final = min(qty, reloj.stock)
            if qty_final < qty:
                incidencias.append(
                    f"'{reloj.marca.nombre} {reloj.nombre}' ajustada a {qty_final} unidad(es) por stock disponible."
                )
            subtotal = float(reloj.precio) * qty_final
            total += subtotal
            validados.append({
                'id': reloj.id,
                'nombre': reloj.nombre,
                'marca_nombre': reloj.marca.nombre,
                'precio': float(reloj.precio),
                'stock': reloj.stock,
                'cantidad': qty_final,
                'subtotal': subtotal,
                'imagen_url': reloj.imagen_url,
            })

        return Response(
            {'items': validados, 'total': total, 'incidencias': incidencias},
            status=status.HTTP_200_OK,
        )


class CarritoSyncAPIView(APIView):
    """
    Endpoint para sincronizar el estado del carrito en sesión o validar piezas contra stock.
    GET /api/pedidos/carrito/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_serializar_carrito(request), status=status.HTTP_200_OK)


class MisOrdenesAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrdenSerializer

    def get_queryset(self):
        return Orden.objects.filter(usuario=self.request.user).prefetch_related(
            'detalles__reloj__marca', 'detalles__reloj__categorias'
        )


class MiOrdenDetailAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrdenSerializer

    def get_queryset(self):
        return Orden.objects.filter(usuario=self.request.user).prefetch_related(
            'detalles__reloj__marca', 'detalles__reloj__categorias'
        )
