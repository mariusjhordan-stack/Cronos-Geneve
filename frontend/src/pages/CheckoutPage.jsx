import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { api } from '@/services/api';

export function CheckoutPage() {
  const { items, totalUnidades, totalMonto, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    direccion_envio: '',
    ciudad: 'San Isidro, Lima',
    pais: 'Perú',
    notas: '',
    garantia_aceptada: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Su selección de piezas en bolsa se encuentra vacía.');
      return;
    }

    if (!formData.garantia_aceptada) {
      setErrorMsg('Debe aceptar la declaración de custodia notarial para continuar.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        cliente_nombre: formData.cliente_nombre,
        cliente_email: formData.cliente_email,
        cliente_telefono: formData.cliente_telefono,
        direccion_envio: formData.direccion_envio,
        ciudad: formData.ciudad,
        pais: formData.pais,
        notas: formData.notas,
        items: items.map((it) => ({
          reloj_id: it.id,
          cantidad: it.cantidad,
        })),
      };

      const result = await api.checkout(payload);

      // Successfully processed: clear local cart and navigate to confirmation
      clearCart();
      const orderId = result.orden?.id || result.orden_id;
      navigate(`/confirmacion/${orderId}`);
    } catch (err) {
      setErrorMsg(err.message || 'Error al procesar la adquisición en bóveda');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="border border-cronos-line p-6 bg-cronos-surface mb-6">
          <ShoppingBag className="h-10 w-10 text-cronos-muted mx-auto mb-3 stroke-[1.2]" />
          <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase block mb-1">
            BÓVEDA VACÍA
          </span>
          <h2 className="font-serif text-2xl text-white mb-2">
            No hay piezas reservadas para adquisición
          </h2>
          <p className="text-xs text-cronos-muted font-sans max-w-sm mx-auto leading-relaxed mb-6">
            Para iniciar el protocolo notarial de transferencia, seleccione primero guardatiempos en nuestro catálogo.
          </p>
          <Link to="/">
            <Button size="default">
              EXPLORAR CATÁLOGO &rarr;
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado Editorial */}
      <div className="mb-8 pb-6 border-b border-cronos-line">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          REGISTRE DE CUSTODIE ET TITULARITÉ
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-wide mb-2">
          PROTOCOLE D'ACQUISITION
        </h1>
        <p className="text-xs text-cronos-muted font-sans tracking-wide">
          Consignación oficial de procedencia y emisión de certificado notarial de manufactura.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 border border-red-900/60 bg-red-950/30 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <div className="text-xs text-red-300 font-sans leading-relaxed">
            {errorMsg}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Columna Izquierda: Formulario Notarial de Titularidad (7 cols) */}
        <div className="lg:col-span-7">
          <div className="border border-cronos-line bg-cronos-surface p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-cronos-line">
              <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-1">
                TITULAR DEL REGISTRO
              </span>
              <h2 className="font-serif text-xl text-white">
                DATOS OFICIALES DE CUSTODIA
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                  NOMBRE Y APELLIDOS DEL TITULAR *
                </label>
                <Input
                  name="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
                  placeholder="Ej: Dr. Fernando de Almenara y Riva"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    CORREO ELECTRÓNICO CONFIDENCIAL *
                  </label>
                  <Input
                    type="email"
                    name="cliente_email"
                    value={formData.cliente_email}
                    onChange={handleChange}
                    placeholder="titular@manufactura.ch"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    TELÉFONO DE ENLACE SEGURO *
                  </label>
                  <Input
                    type="tel"
                    name="cliente_telefono"
                    value={formData.cliente_telefono}
                    onChange={handleChange}
                    placeholder="+41 22 819 0000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                  DIRECCIÓN DE ENTREGA O BÓVEDA PRIVADA *
                </label>
                <textarea
                  name="direccion_envio"
                  value={formData.direccion_envio}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-cronos-line bg-transparent p-3 text-xs text-white placeholder:text-cronos-muted/40 focus:border-cronos-bronze focus:outline-none font-sans"
                  placeholder="Avenida, residencia o bóveda corporativa..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    CIUDAD / JURISDICCIÓN
                  </label>
                  <Input
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                    MODALIDAD DE DESPACHO
                  </label>
                  <input
                    type="text"
                    value="Transporte Blindado con Custodia"
                    readOnly
                    className="h-11 w-full border border-cronos-line bg-cronos-surface-2 px-3 text-xs text-cronos-muted font-sans cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase mb-1.5">
                  INSTRUCCIONES NOTARIALES O PROTOCOLO ESPECIAL
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-cronos-line bg-transparent p-3 text-xs text-white placeholder:text-cronos-muted/40 focus:border-cronos-bronze focus:outline-none font-sans"
                  placeholder="Instrucciones confidenciales de entrega personal..."
                />
              </div>

              {/* Declaración de Custodia Notarial */}
              <div className="border border-cronos-line bg-cronos-surface-2 p-4 text-[11px] font-sans text-cronos-muted leading-relaxed">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="garantia_aceptada"
                    checked={formData.garantia_aceptada}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded-none border-cronos-line bg-cronos-bg text-cronos-bronze focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Declaro conocer que las piezas seleccionadas serán debitadas de la bóveda de inventario y se emitirá el Certificado Oficial de Autenticidad suiza con número de registro único e inmutable.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-xs font-semibold tracking-[0.24em] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>PROCESANDO EN BÓVEDA...</span>
                ) : (
                  <>
                    <span>CONFIRMAR ADQUISICIÓN EN BÓVEDA</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Resumen de la Selección (5 cols) */}
        <div className="lg:col-span-5">
          <div className="border border-cronos-line bg-cronos-surface p-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cronos-line">
              <span className="font-mono text-[10px] tracking-widest text-cronos-bronze uppercase">
                RESUMEN DE BÓVEDA
              </span>
              <span className="font-mono text-xs text-white">
                {totalUnidades} {totalUnidades === 1 ? 'PIEZA' : 'PIEZAS'}
              </span>
            </div>

            {/* List of items */}
            <div className="divide-y divide-cronos-line/60 max-h-72 overflow-y-auto mb-6 pr-2">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="h-12 w-12 shrink-0 bg-black/40 border border-cronos-line flex items-center justify-center p-1">
                      {item.imagen_url && (
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] text-cronos-bronze block uppercase">
                        {item.marca_nombre}
                      </span>
                      <h4 className="font-serif text-white truncate" title={item.nombre}>
                        {item.nombre}
                      </h4>
                      <span className="font-mono text-[10px] text-cronos-muted">
                        {item.cantidad} x {formatPrice(item.precio)}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-right text-white shrink-0">
                    {formatPrice(item.precio * item.cantidad)}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Total */}
            <div className="border-t border-cronos-line pt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-cronos-muted">
                <span>SUBTOTAL:</span>
                <span className="text-white">{formatPrice(totalMonto)}</span>
              </div>
              <div className="flex justify-between text-cronos-muted">
                <span>SEGURO DE TRÁNSITO INTERNACIONAL:</span>
                <span className="text-cronos-bronze">INCLUIDO (0.00 USD)</span>
              </div>
              <div className="flex justify-between text-cronos-muted">
                <span>PROTOCOLIZACIÓN NOTARIAL:</span>
                <span className="text-cronos-bronze">INCLUIDA</span>
              </div>
              <div className="flex justify-between text-sm text-white pt-3 border-t border-cronos-line font-medium">
                <span>TOTAL A LIQUIDAR:</span>
                <span className="text-base text-cronos-bronze font-bold">{formatPrice(totalMonto)} USD</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cronos-line/40 flex items-center gap-2.5 text-[10px] font-mono text-cronos-muted">
              <ShieldCheck className="h-4 w-4 text-cronos-bronze shrink-0" />
              <span>Transacción cifrada y resguardada bajo secreto bancario suizo.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
