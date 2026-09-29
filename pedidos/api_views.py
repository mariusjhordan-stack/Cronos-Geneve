from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal

from catalogo.models import Reloj
from .models import Orden, DetalleOrden
from .serializers import OrdenSerializer
from .views import _serializar_carrito


class CheckoutAPIView(APIView):
    """
    Endpoint REST para procesamiento de adquisiciones desde React SPA.
    Valida inventario en bóveda mediante bloqueo pesimista y genera
    la orden con su certificado notarial oficial.
    """
    def post(self, request):
        data = request.data
        cliente_nombre = data.get('cliente_nombre', '').strip()
        cliente_email = data.get('cliente_email', '').strip()
        cliente_telefono = data.get('cliente_telefono', '').strip()
        direccion_envio = data.get('direccion_envio', '').strip()
        ciudad = data.get('ciudad', 'San Isidro, Lima').strip()
        pais = data.get('pais', 'Perú').strip()
        notas = data.get('notas', '').strip()
        items = data.get('items', [])

        if not all([cliente_nombre, cliente_email, cliente_telefono, direccion_envio]):
            return Response(
                {'error': 'Todos los campos de titularidad y custodia son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not items or not isinstance(items, list):
            return Response(
                {'error': 'La selección de piezas en bolsa está vacía.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reloj_ids = []
        item_qty_map = {}
        for item in items:
            rid = item.get('reloj_id') or item.get('id')
            qty = int(item.get('cantidad', 1))
            if rid and qty > 0:
                reloj_ids.append(int(rid))
                item_qty_map[int(rid)] = qty

        if not reloj_ids:
            return Response(
                {'error': 'No se encontraron piezas válidas para procesar.'},
                status=status.HTTP_400_BAD_REQUEST
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
                            status=status.HTTP_404_NOT_FOUND
                        )
                    if reloj.stock < qty:
                        return Response(
                            {
                                'error': f"Disponibilidad insuficiente para '{reloj.marca.nombre} {reloj.nombre}'. "
                                         f"Quedan {reloj.stock} unidad(es) en bóveda."
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # 2. Crear Orden
                orden = Orden.objects.create(
                    cliente_nombre=cliente_nombre,
                    cliente_email=cliente_email,
                    cliente_telefono=cliente_telefono,
                    direccion_envio=direccion_envio,
                    ciudad=ciudad,
                    pais=pais,
                    notas=notas,
                    estado=Orden.EstadoOrden.PAGADO,
                )

                # 3. Crear detalles y descontar inventario físico
                for rid, qty in item_qty_map.items():
                    reloj = reloj_map[rid]
                    DetalleOrden.objects.create(
                        orden=orden,
                        reloj=reloj,
                        precio_unitario=reloj.precio,
                        cantidad=qty
                    )
                    reloj.stock -= qty
                    reloj.save(update_fields=['stock'])

                orden.actualizar_total()

                # Limpiar sesión en caso se haya usado también sesión de Django
                if hasattr(request, 'session') and 'carrito' in request.session:
                    request.session['carrito'] = {}
                    request.session.modified = True

                serializer = OrdenSerializer(orden)
                return Response(
                    {
                        'success': True,
                        'mensaje': f'Adquisición registrada con éxito. Certificado {serializer.data["codigo_orden"]}.',
                        'orden': serializer.data,
                    },
                    status=status.HTTP_201_CREATED
                )

        except Exception as err:
            return Response(
                {'error': f'Error al procesar la transacción en bóveda: {str(err)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrdenDetailAPIView(APIView):
    """
    Endpoint para recuperar el certificado de una orden emitida.
    GET /api/pedidos/ordenes/<id>/
    """
    def get(self, request, pk):
        orden = get_object_or_404(
            Orden.objects.prefetch_related('detalles__reloj__marca', 'detalles__reloj__categorias'),
            pk=pk
        )
        serializer = OrdenSerializer(orden)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CarritoSyncAPIView(APIView):
    """
    Endpoint para sincronizar el estado del carrito en sesión o validar piezas contra stock.
    GET /api/pedidos/carrito/
    """
    def get(self, request):
        return Response(_serializar_carrito(request), status=status.HTTP_200_OK)
