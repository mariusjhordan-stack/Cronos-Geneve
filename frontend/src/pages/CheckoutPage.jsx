import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle, ShoppingBag, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const LISTA_PAISES = [
  'Perú',
  'Argentina',
  'Bolivia',
  'Brasil',
  'Canadá',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'España',
  'Estados Unidos',
  'México',
  'Panamá',
  'Paraguay',
  'Uruguay',
  'Venezuela',
  'Suiza',
  'Reino Unido',
  'Francia',
  'Italia',
  'Alemania',
  'Japón',
  'Australia',
];

function formatAddressLine(addr) {
  const parts = [
    addr.direccion?.trim(),
    addr.region?.trim(),
    addr.codigo_postal?.trim(),
  ].filter(Boolean);
  return parts.join(', ');
}

export function CheckoutPage() {
  const { items, totalUnidades, totalMonto, clearCart, replaceCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    direccion_envio: '',
    ciudad: 'Lima',
    pais: 'Perú',
    notas: '',
    garantia_aceptada: true,
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [notices, setNotices] = useState([]);

  // Carga e inicialización de direcciones para usuarios autenticados
  useEffect(() => {
    let active = true;

    async function initializeCheckout() {
      if (isAuthenticated && user) {
        let addresses = [];
        try {
          const res = await api.getDirecciones();
          addresses = Array.isArray(res) ? res : res.results || [];
        } catch {
          addresses = [];
        }

        if (!active) return;
        setSavedAddresses(addresses);

        const defaultAddr = addresses.find((a) => a.es_predeterminada) || (addresses.length === 1 ? addresses[0] : null);

        if (defaultAddr) {
          setSelectedAddressId(String(defaultAddr.id));
          setFormData((prev) => ({
            ...prev,
            cliente_nombre: defaultAddr.destinatario || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
            cliente_email: user.email || '',
            cliente_telefono: defaultAddr.telefono || user.perfil?.telefono || '',
            direccion_envio: formatAddressLine(defaultAddr),
            ciudad: defaultAddr.ciudad || 'Lima',
            pais: defaultAddr.pais || 'Perú',
          }));
        } else {
          setSelectedAddressId('manual');
          setFormData((prev) => ({
            ...prev,
            cliente_nombre: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
            cliente_email: user.email || '',
            cliente_telefono: user.perfil?.telefono || '',
          }));
        }
      }
    }

    initializeCheckout();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  // Lista dinámica de países garantizando que cualquier valor histórico permanezca visible
  const availableCountries = useMemo(() => {
    if (formData.pais && !LISTA_PAISES.includes(formData.pais)) {
      return [formData.pais, ...LISTA_PAISES];
    }
    return LISTA_PAISES;
  }, [formData.pais]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectSavedAddress = (e) => {
    const val = e.target.value;
    setSelectedAddressId(val);

    if (val === 'manual' || !val) {
      return;
    }

    const addr = savedAddresses.find((a) => String(a.id) === String(val));
    if (addr) {
      setFormData((prev) => ({
        ...prev,
        cliente_nombre: addr.destinatario || prev.cliente_nombre,
        cliente_telefono: addr.telefono || prev.cliente_telefono,
        direccion_envio: formatAddressLine(addr),
        ciudad: addr.ciudad || 'Lima',
        pais: addr.pais || 'Perú',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (items.length === 0) {
      setErrorMsg('Su selección de piezas en bolsa se encuentra vacía.');
      return;
    }

    if (!formData.garantia_aceptada) {
      setErrorMsg('Debe aceptar los términos de garantía aplicables para continuar.');
      return;
    }

    if (
      !formData.cliente_nombre.trim() ||
      !formData.cliente_email.trim() ||
      !formData.cliente_telefono.trim() ||
      !formData.direccion_envio.trim() ||
      !formData.ciudad.trim() ||
      !formData.pais.trim()
    ) {
      setErrorMsg('Por favor complete los campos obligatorios marcados con asterisco (*).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setNotices([]);

    try {
      // 1. Validación previa de stock y disponibilidad en backend
      setValidating(true);
      const validation = await api.validateCart(
        items.map((it) => ({ reloj_id: it.id, cantidad: it.cantidad }))
      );
      setValidating(false);

      const currentSig = items.map((it) => `${it.id}:${it.cantidad}`).sort().join('|');
      const freshSig = (validation.items || []).map((it) => `${it.id}:${it.cantidad}`).sort().join('|');
      if (currentSig !== freshSig || (validation.incidencias || []).length > 0) {
        replaceCart(validation.items || []);
        setNotices(validation.incidencias || []);
        setErrorMsg(
          'Su selección fue actualizada según la disponibilidad vigente de inventario. Revise los ajustes antes de confirmar el pedido.'
        );
        setSubmitting(false);
        return;
      }

      // 2. Envío de la orden con valores limpios del formulario
      const payload = {
        cliente_nombre: formData.cliente_nombre.trim(),
        cliente_email: formData.cliente_email.trim(),
        cliente_telefono: formData.cliente_telefono.trim(),
        direccion_envio: formData.direccion_envio.trim(),
        ciudad: formData.ciudad.trim(),
        pais: formData.pais.trim(),
        notas: formData.notas.trim(),
        garantia_aceptada: formData.garantia_aceptada,
        items: items.map((it) => ({
          reloj_id: it.id,
          cantidad: it.cantidad,
        })),
      };

      const result = await api.checkout(payload);

      // 3. Registro exitoso: vaciar bolsa y navegar a confirmación
      clearCart();
      const orderId = result.orden?.id || result.orden_id;
      const token = result.token_acceso || result.orden?.token_acceso || '';
      navigate(token ? `/confirmacion/${orderId}?token=${encodeURIComponent(token)}` : `/confirmacion/${orderId}`);
    } catch (err) {
      setValidating(false);
      setErrorMsg(err.message || 'Error al procesar la solicitud de pedido');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="border border-cronos-line p-8 bg-white shadow-xs">
          <ShoppingBag className="h-10 w-10 text-cronos-muted/40 mx-auto mb-4 stroke-[1.2]" />
          <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-1">
            CRONOS GENÈVE / PRIVATE WATCH BAG
          </span>
          <h2 className="font-serif text-2xl text-cronos-text mb-3 font-normal">
            No hay piezas seleccionadas para adquisición
          </h2>
          <p className="text-xs text-cronos-muted font-sans max-w-sm mx-auto leading-relaxed mb-6">
            Para continuar con el proceso de adquisición, seleccione primero los guardatiempos deseados en nuestra colección.
          </p>
          <Link to="/#catalogo">
            <Button size="default">
              EXPLORAR COLECCIÓN &rarr;
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. ENCABEZADO */}
      <div className="mb-10 pb-6 border-b border-cronos-line">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          CRONOS GENÈVE &bull; CHECKOUT
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.03em] mb-2 uppercase font-normal">
          SOLICITUD DE ADQUISICIÓN
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-2xl leading-relaxed">
          Complete la información de contacto y entrega para registrar su orden de adquisición. Proyecto académico: no se efectúan cobros bancarios reales.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0 stroke-[1.4]" />
          <div className="text-xs text-red-700 font-sans leading-relaxed">
            {errorMsg}
          </div>
        </div>
      )}

      {notices.length > 0 && (
        <div className="mb-8 border border-cronos-line bg-white p-4 shadow-xs">
          <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-2">
            ACTUALIZACIÓN DE DISPONIBILIDAD EN INVENTARIO
          </span>
          <ul className="text-xs text-cronos-muted font-sans leading-relaxed list-disc pl-5 space-y-1">
            {notices.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. COMPOSICIÓN DE DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Columna Izquierda: Formulario de Datos y Envío (7 cols) */}
        <div className="lg:col-span-7">
          <div className="border border-cronos-line bg-white p-6 sm:p-8 shadow-xs">
            <div className="mb-6 pb-4 border-b border-cronos-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-0.5">
                  DATOS DE LA ORDEN
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-cronos-text uppercase font-normal">
                  DATOS DEL CLIENTE Y ENVÍO
                </h2>
              </div>
              {isAuthenticated && user && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-cronos-bronze bg-cronos-surface-1 border border-cronos-line px-2.5 py-1">
                  <UserCheck className="h-3 w-3" />
                  <span>SESIÓN: {user.username}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selector de direcciones guardadas para usuarios autenticados */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="space-y-1.5 pb-4 border-b border-cronos-line/60">
                  <div className="flex items-center justify-between">
                    <label htmlFor="checkout_saved_address" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                      DIRECCIÓN GUARDADA
                    </label>
                    <Link
                      to="/direcciones"
                      className="font-mono text-[9px] tracking-widest text-cronos-bronze hover:underline uppercase"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      [ Administrar direcciones ]
                    </Link>
                  </div>
                  <Select
                    id="checkout_saved_address"
                    value={selectedAddressId}
                    onChange={handleSelectSavedAddress}
                    disabled={submitting}
                  >
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={String(addr.id)} className="bg-white text-cronos-text">
                        {addr.etiqueta} {addr.es_predeterminada ? '(Predeterminada)' : ''} — {addr.destinatario}, {addr.direccion}
                      </option>
                    ))}
                    <option value="manual" className="bg-white text-cronos-text">
                      [ Ingresar dirección manualmente ]
                    </option>
                  </Select>
                  <span className="text-[10px] font-sans text-cronos-muted block mt-1">
                    Puede modificar cualquier campo a continuación para esta orden específica.
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="checkout_nombre" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                  NOMBRE Y APELLIDOS *
                </label>
                <Input
                  id="checkout_nombre"
                  name="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
                  placeholder="Nombre y apellidos"
                  required
                  disabled={submitting}
                  maxLength={150}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout_email" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    CORREO ELECTRÓNICO *
                  </label>
                  <Input
                    id="checkout_email"
                    type="email"
                    name="cliente_email"
                    value={formData.cliente_email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                    disabled={submitting}
                    maxLength={254}
                  />
                </div>
                <div>
                  <label htmlFor="checkout_telefono" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    TELÉFONO DE CONTACTO *
                  </label>
                  <Input
                    id="checkout_telefono"
                    type="tel"
                    name="cliente_telefono"
                    value={formData.cliente_telefono}
                    onChange={handleChange}
                    placeholder="+51 999 000 000"
                    required
                    disabled={submitting}
                    maxLength={30}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout_direccion" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                  DIRECCIÓN DE ENVÍO *
                </label>
                <textarea
                  id="checkout_direccion"
                  name="direccion_envio"
                  value={formData.direccion_envio}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-cronos-line bg-white p-3 text-xs text-cronos-text placeholder:text-cronos-muted/50 focus:border-cronos-bronze focus:outline-none font-sans rounded-none transition-colors"
                  placeholder="Dirección completa, calle, número, urbanización..."
                  required
                  disabled={submitting}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout_ciudad" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    CIUDAD *
                  </label>
                  <Input
                    id="checkout_ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label htmlFor="checkout_pais" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    PAÍS *
                  </label>
                  <Select
                    id="checkout_pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    {availableCountries.map((c) => (
                      <option key={c} value={c} className="bg-white text-cronos-text">
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="checkout_notas" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                  NOTAS ADICIONALES (OPCIONAL)
                </label>
                <textarea
                  id="checkout_notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-cronos-line bg-white p-3 text-xs text-cronos-text placeholder:text-cronos-muted/50 focus:border-cronos-bronze focus:outline-none font-sans rounded-none transition-colors"
                  placeholder="Instrucciones o indicaciones adicionales para la entrega..."
                  disabled={submitting}
                  maxLength={2000}
                />
              </div>

              {/* Términos de Garantía */}
              <div className="border border-cronos-line bg-cronos-surface-1 p-4 text-[11px] font-sans text-cronos-muted leading-relaxed">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="garantia_aceptada"
                    checked={formData.garantia_aceptada}
                    onChange={handleChange}
                    disabled={submitting}
                    className="mt-0.5 h-4 w-4 rounded-none border-cronos-line bg-white text-cronos-text focus:ring-0 cursor-pointer"
                  />
                  <span>
                    He revisado y acepto los términos de garantía aplicables a la orden.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-auto min-h-[48px] py-3.5 px-4 text-xs font-semibold tracking-[0.16em] sm:tracking-[0.2em] font-mono flex items-center justify-center gap-2 uppercase leading-relaxed text-center"
                >
                  {submitting ? (
                    <span className="text-center">{validating ? 'VALIDANDO DISPONIBILIDAD...' : 'PROCESANDO SOLICITUD...'}</span>
                  ) : (
                    <>
                      <span className="text-center">CONFIRMAR SOLICITUD DE ADQUISICIÓN</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </>
                  )}
                </Button>
                <p className="text-center font-mono text-[10px] tracking-widest text-cronos-muted uppercase mt-3">
                  Proyecto académico — sin cobro bancario real
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Resumen de la Selección (5 cols) */}
        <div className="lg:col-span-5">
          <div className="border border-cronos-line bg-white p-6 sm:p-8 sticky top-24 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cronos-line">
              <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase">
                RESUMEN DE LA ORDEN
              </span>
              <span className="font-mono text-xs text-cronos-muted uppercase tracking-wider">
                {totalUnidades} {totalUnidades === 1 ? 'PIEZA' : 'PIEZAS'}
              </span>
            </div>

            {/* Lista de guardatiempos en bolsa */}
            <div className="divide-y divide-cronos-line/60 max-h-80 overflow-y-auto mb-6 pr-2">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="h-14 w-14 shrink-0 bg-cronos-surface-1 border border-cronos-line flex items-center justify-center p-1">
                      {item.imagen_url ? (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-[8px] text-cronos-muted">[ S/R ]</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] tracking-widest text-cronos-bronze block uppercase">
                        {item.marca_nombre}
                      </span>
                      <h4 className="font-serif text-sm text-cronos-text truncate" title={item.nombre}>
                        {item.nombre}
                      </h4>
                      <span className="font-mono text-[10px] text-cronos-muted">
                        {item.cantidad} &times; {formatPrice(item.precio)}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-right text-cronos-text shrink-0 text-xs font-medium">
                    {formatPrice(item.precio * item.cantidad)} <span className="text-[9px] text-cronos-muted">USD</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal y Total */}
            <div className="border-t border-cronos-line pt-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-cronos-muted">
                <span>SUBTOTAL:</span>
                <span className="text-cronos-text">{formatPrice(totalMonto)} USD</span>
              </div>
              <div className="flex justify-between text-sm text-cronos-text pt-3 border-t border-cronos-line font-medium">
                <span className="uppercase tracking-wider">TOTAL:</span>
                <span className="text-base text-cronos-text font-bold">{formatPrice(totalMonto)} USD</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cronos-line/60 flex items-center gap-2.5 text-[10px] font-mono text-cronos-muted">
              <ShieldCheck className="h-4 w-4 text-cronos-bronze shrink-0 stroke-[1.4]" />
              <span>Solicitud académica resguardada; no se procesa pago bancario real.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
