import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const loadOrders = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMisOrdenes(pageToLoad);
      if (Array.isArray(data)) {
        setOrders(data);
        setTotalCount(data.length);
        setHasNext(false);
        setHasPrev(false);
      } else {
        setOrders(data.results || []);
        setTotalCount(data.count || 0);
        setHasNext(Boolean(data.next));
        setHasPrev(Boolean(data.previous));
      }
      setPage(pageToLoad);
    } catch (err) {
      setError(err.message || 'No fue posible consultar el archivo de órdenes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getMisOrdenes(1);
        if (active) {
          if (Array.isArray(data)) {
            setOrders(data);
            setTotalCount(data.length);
            setHasNext(false);
            setHasPrev(false);
          } else {
            setOrders(data.results || []);
            setTotalCount(data.count || 0);
            setHasNext(Boolean(data.next));
            setHasPrev(Boolean(data.previous));
          }
          setPage(1);
        }
      } catch (err) {
        if (active) setError(err.message || 'No fue posible consultar el archivo de órdenes.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handlePageChange = (newPage) => {
    loadOrders(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (estado, display) => {
    const label = display || estado?.toUpperCase() || 'DESCONOCIDO';
    switch (estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center rounded-none border border-amber-300 bg-amber-50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-amber-800">
            {label}
          </span>
        );
      case 'confirmado':
        return (
          <span className="inline-flex items-center rounded-none border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-emerald-800">
            {label}
          </span>
        );
      case 'enviado':
        return (
          <span className="inline-flex items-center rounded-none border border-sky-300 bg-sky-50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-sky-800">
            {label}
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center rounded-none border border-cronos-line bg-cronos-surface-1 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-cronos-text">
            {label}
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center rounded-none border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-red-700">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-none border border-cronos-line bg-cronos-surface-1 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-cronos-muted">
            {label}
          </span>
        );
    }
  };

  const totalPages = Math.ceil(totalCount / 12) || 1;

  if (loading && orders.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-28 text-center sm:px-6 lg:px-8">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CONSULTANDO ARCHIVO DE ADQUISICIONES…
        </span>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="border border-cronos-line bg-white p-8 sm:p-10 shadow-xs">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4 stroke-[1.2]" />
          <h2 className="font-serif text-2xl text-cronos-text mb-2 uppercase">ERROR AL CONSULTAR ARCHIVO</h2>
          <p className="text-xs text-cronos-muted font-sans max-w-md mx-auto mb-6 leading-relaxed">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => loadOrders(page)} className="gap-2 font-mono text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>REINTENTAR</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* 1. ENCABEZADO EDITORIAL DE LA PÁGINA */}
      <div className="border-b border-cronos-line pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
            01 · ARCHIVE CLIENT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.04em] uppercase mb-2">
            MIS ÓRDENES
          </h1>
          <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-2xl leading-relaxed">
            Historial de pedidos y detalle de tus adquisiciones.
          </p>
        </div>
        {totalCount > 0 && (
          <span className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
            [ {totalCount} {totalCount === 1 ? 'ORDEN' : 'ÓRDENES'} EN ARCHIVO ]
          </span>
        )}
      </div>

      {/* Subnavegación de cuenta */}
      <nav aria-label="Navegación de cuenta" className="overflow-x-auto border-b border-cronos-line">
        <ul className="flex min-w-max items-center gap-8 text-[11px] font-mono tracking-widest uppercase">
          <li>
            <Link
              to="/perfil"
              className="inline-block py-3 text-cronos-muted transition-colors hover:text-cronos-text"
            >
              01 &middot; PERFIL DE USUARIO
            </Link>
          </li>
          <li>
            <Link
              to="/direcciones"
              className="inline-block py-3 text-cronos-muted transition-colors hover:text-cronos-text"
            >
              02 &middot; LIBRETA DE DIRECCIONES
            </Link>
          </li>
          <li>
            <span
              className="inline-block border-b-2 border-cronos-text py-3 font-semibold text-cronos-text"
              aria-current="page"
            >
              03 &middot; HISTORIAL DE &Oacute;RDENES
            </span>
          </li>
        </ul>
      </nav>

      {/* 2. ESTADO VACÍO */}
      {orders.length === 0 ? (
        <div className="border border-cronos-line bg-white p-12 sm:p-16 text-center shadow-xs">
          <Package className="h-10 w-10 text-cronos-bronze mx-auto mb-4 stroke-[1.2]" />
          <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-2">
            ARCHIVE VIDE
          </span>
          <h2 className="font-serif text-2xl text-cronos-text mb-3 uppercase">
            NO HAY ÓRDENES REGISTRADAS
          </h2>
          <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-md mx-auto mb-8 leading-relaxed">
            Aún no se han registrado adquisiciones en su archivo personal. Cuando adquiera una pieza de manufactura, su comprobante y registro histórico se registrarán aquí.
          </p>
          <Link to="/#catalogo">
            <Button variant="outline" size="sm" className="font-mono text-xs tracking-widest">
              EXPLORAR CATÁLOGO &rarr;
            </Button>
          </Link>
        </div>
      ) : (
        /* 3. LISTADO DE ÓRDENES */
        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = order.creado_en
              ? new Date(order.creado_en).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'FECHA NO DISPONIBLE';

            return (
              <article
                key={order.id}
                className="border border-cronos-line bg-white p-6 sm:p-8 transition-colors shadow-xs hover:border-cronos-line"
              >
                {/* Cabecera de la orden */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cronos-line pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm tracking-wider text-cronos-text font-medium">
                        {order.codigo_orden || `ORDEN #${order.id}`}
                      </span>
                      {getStatusBadge(order.estado, order.estado_display)}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-cronos-muted">
                      <span>{formattedDate}</span>
                      {order.numero_serie && (
                        <>
                          <span>&bull;</span>
                          <span className="text-cronos-bronze tracking-widest uppercase">
                            N° SERIE: {order.numero_serie}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-mono text-[10px] tracking-widest text-cronos-muted uppercase block">
                      TOTAL ADQUISICIÓN
                    </span>
                    <span className="font-mono text-base sm:text-lg text-cronos-text tracking-wider">
                      {formatPrice(order.total)}{' '}
                      <span className="text-[10px] text-cronos-muted">USD</span>
                    </span>
                  </div>
                </div>

                {/* Previsualización de piezas adquiridas */}
                {Array.isArray(order.detalles) && order.detalles.length > 0 && (
                  <div className="divide-y divide-cronos-line py-4 my-1">
                    {order.detalles.map((detalle) => {
                      const watch = detalle.reloj_detalle;
                      const brandName =
                        detalle.reloj_marca || watch?.marca_nombre || 'Manufactura Suiza';
                      const watchName =
                        detalle.reloj_nombre || watch?.nombre || `Guardatiempo #${detalle.reloj}`;
                      const watchImg = watch?.imagen_url;

                      return (
                        <div
                          key={detalle.id}
                          className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {watchImg ? (
                              <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 border border-cronos-line bg-cronos-surface-1 p-1 flex items-center justify-center">
                                <img
                                  src={watchImg}
                                  alt={watchName}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 border border-cronos-line bg-cronos-surface-1 flex items-center justify-center">
                                <Package className="h-5 w-5 text-cronos-muted stroke-[1.2]" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block truncate">
                                {brandName}
                              </span>
                              <h3 className="font-serif text-sm sm:text-base text-cronos-text truncate">
                                {detalle.reloj ? (
                                  <Link
                                    to={`/reloj/${detalle.reloj}`}
                                    className="hover:text-cronos-bronze transition-colors"
                                  >
                                    {watchName}
                                  </Link>
                                ) : (
                                  watchName
                                )}
                              </h3>
                              <div className="font-mono text-[10px] text-cronos-muted mt-0.5">
                                <span>Cant: {detalle.cantidad}</span>
                                {watch?.movimiento_display && (
                                  <>
                                    <span className="mx-1.5">&bull;</span>
                                    <span>{watch.movimiento_display}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="font-mono text-xs sm:text-sm text-cronos-text tracking-wider block">
                              {formatPrice(detalle.subtotal || detalle.precio_unitario * detalle.cantidad)}
                            </span>
                            <span className="font-mono text-[10px] text-cronos-muted">
                              {formatPrice(detalle.precio_unitario)} c/u
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Destino y acción */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-cronos-line pt-4 mt-2">
                  <div className="font-mono text-[10px] text-cronos-muted">
                    {order.direccion_envio ? (
                      <span>
                        ENVÍO:{' '}
                        <span className="text-cronos-text">
                          {order.direccion_envio}
                          {order.ciudad ? `, ${order.ciudad}` : ''}
                          {order.pais ? `, ${order.pais}` : ''}
                        </span>
                      </span>
                    ) : (
                      <span>DESTINO: REGISTRADO EN COMPROBANTE</span>
                    )}
                  </div>

                  <Link
                    to={`/confirmacion/${order.id}`}
                    className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-cronos-bronze hover:text-cronos-text uppercase transition-colors"
                  >
                    <span>VER DETALLE</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}

          {/* 4. CONTROLES DE PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-cronos-line pt-6 font-mono text-xs">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev || page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>ANTERIOR</span>
              </Button>

              <span className="text-cronos-muted tracking-widest text-[11px]">
                PÁGINA <span className="text-cronos-text">{page}</span> DE{' '}
                <span className="text-cronos-text">{totalPages}</span>
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasNext || page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>SIGUIENTE</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
