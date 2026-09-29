from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from .models import Reloj, Marca, Categoria


def catalogo_index(request):
    """
    Vista principal del catálogo comercial.
    Procesa filtros dinámicos por marca, movimiento, búsqueda y ordenación vía GET.
    """
    relojes = Reloj.objects.select_related('marca').prefetch_related('categorias').all()
    marcas = Marca.objects.all().order_by('nombre')
    movimientos = Reloj.TipoMovimiento.choices

    # Captura de parámetros GET
    filtro_marca = request.GET.get('marca', '')
    filtro_movimiento = request.GET.get('movimiento', '')
    filtro_orden = request.GET.get('orden', '')
    busqueda = request.GET.get('q', '').strip()

    # Aplicación de filtros
    if filtro_marca:
        relojes = relojes.filter(marca_id=filtro_marca)

    if filtro_movimiento:
        relojes = relojes.filter(movimiento=filtro_movimiento)

    if busqueda:
        relojes = relojes.filter(
            Q(nombre__icontains=busqueda) |
            Q(marca__nombre__icontains=busqueda) |
            Q(material_correa__icontains=busqueda) |
            Q(descripcion__icontains=busqueda)
        )

    # Ordenamiento
    if filtro_orden == 'precio_asc':
        relojes = relojes.order_by('precio')
    elif filtro_orden == 'precio_desc':
        relojes = relojes.order_by('-precio')
    elif filtro_orden == 'nombre_asc':
        relojes = relojes.order_by('nombre')
    elif filtro_orden == 'novedades':
        relojes = relojes.order_by('-creado_en')
    else:
        relojes = relojes.order_by('-creado_en')

    context = {
        'relojes': relojes,
        'marcas': marcas,
        'movimientos': movimientos,
        'filtro_marca': filtro_marca,
        'filtro_movimiento': filtro_movimiento,
        'filtro_orden': filtro_orden,
        'busqueda': busqueda,
        'total_resultados': relojes.count(),
    }
    return render(request, 'catalogo/index.html', context)


def catalogo_detalle(request, pk):
    """
    Ficha técnica y comercial individual de una pieza horológica.
    """
    reloj = get_object_or_404(
        Reloj.objects.select_related('marca').prefetch_related('categorias'),
        pk=pk
    )
    # Piezas recomendadas de la misma marca o con movimiento similar
    piezas_relacionadas = Reloj.objects.filter(
        Q(marca=reloj.marca) | Q(movimiento=reloj.movimiento)
    ).exclude(pk=reloj.pk)[:3]

    context = {
        'reloj': reloj,
        'piezas_relacionadas': piezas_relacionadas,
    }
    return render(request, 'catalogo/detalle.html', context)


def comparador_relojes(request):
    """
    Herramienta analítica para contrastar de 2 a 3 piezas horológicas lado a lado.
    Permite recibir IDs separados por comas (?ids=1,2,3) desde la barra flotante
    o parámetros individuales (?reloj_1=X&reloj_2=Y&reloj_3=Z).
    """
    todos_los_relojes = Reloj.objects.select_related('marca').all().order_by('marca__nombre', 'nombre')

    # 1. Extracción de IDs desde query params
    id_list = []
    raw_ids = request.GET.get('ids', '').strip()
    if raw_ids:
        for x in raw_ids.split(','):
            x = x.strip()
            if x.isdigit():
                id_list.append(int(x))
    else:
        for key in ['reloj_1', 'reloj_2', 'reloj_3']:
            val = request.GET.get(key)
            if val and val.isdigit():
                id_list.append(int(val))

    # Mantener unicidad y limitar a máximo 3 piezas
    id_list = list(dict.fromkeys(id_list))[:3]

    relojes_qs = Reloj.objects.select_related('marca').prefetch_related('categorias').filter(id__in=id_list)
    reloj_map = {r.id: r for r in relojes_qs}
    relojes_comparados = [reloj_map[i] for i in id_list if i in reloj_map]

    context = {
        'todos_los_relojes': todos_los_relojes,
        'relojes_comparados': relojes_comparados,
        'total_comparados': len(relojes_comparados),
        'id_reloj_1': id_list[0] if len(id_list) > 0 else None,
        'id_reloj_2': id_list[1] if len(id_list) > 1 else None,
        'id_reloj_3': id_list[2] if len(id_list) > 2 else None,
    }
    return render(request, 'catalogo/comparador.html', context)

