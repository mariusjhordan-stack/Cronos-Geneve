from decimal import Decimal
from catalogo.models import Reloj


def carrito_context(request):
    """
    Context processor global que inyecta el estado actual del carrito de compras
    (almacenado en sesión) en todas las plantillas del proyecto.
    """
    carrito = request.session.get('carrito', {})
    relojes_ids = [int(rid) for rid in carrito.keys() if str(rid).isdigit()]

    items = []
    total = Decimal('0.00')
    total_unidades = 0

    if relojes_ids:
        relojes = Reloj.objects.select_related('marca').filter(id__in=relojes_ids)
        reloj_map = {r.id: r for r in relojes}

        for rid_str, cant in carrito.items():
            try:
                rid = int(rid_str)
                if rid in reloj_map:
                    reloj = reloj_map[rid]
                    cantidad = int(cant)
                    # Respetar el límite de stock real
                    if cantidad > reloj.stock and reloj.stock > 0:
                        cantidad = reloj.stock
                    elif reloj.stock <= 0:
                        cantidad = 0

                    if cantidad > 0:
                        subtotal = reloj.precio * cantidad
                        total += subtotal
                        total_unidades += cantidad
                        items.append({
                            'reloj': reloj,
                            'cantidad': cantidad,
                            'subtotal': subtotal,
                        })
            except (ValueError, TypeError):
                continue

    return {
        'carrito_global': {
            'items': items,
            'total': total,
            'total_unidades': total_unidades,
            'tiene_items': total_unidades > 0,
        }
    }
