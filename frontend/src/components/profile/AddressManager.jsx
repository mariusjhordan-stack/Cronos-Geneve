import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const initialAddressState = {
  etiqueta: '',
  destinatario: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  region: '',
  codigo_postal: '',
  pais: 'Perú',
  es_predeterminada: false,
};

export function AddressManager({ showTitle = true, showFullPageLink = false }) {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales de creación / edición
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(initialAddressState);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormError, setAddressFormError] = useState('');

  // Estados de modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Carga inicial de direcciones
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const addressData = await api.getDirecciones();
        if (active) {
          setAddresses(Array.isArray(addressData) ? addressData : addressData.results || []);
        }
      } catch (err) {
        if (active) setError(err.message || 'No fue posible cargar la libreta de direcciones.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const addressData = await api.getDirecciones();
      setAddresses(Array.isArray(addressData) ? addressData : addressData.results || []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar la libreta de direcciones.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear nueva dirección
  const handleOpenCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...initialAddressState,
      destinatario: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '',
      telefono: user?.perfil?.telefono || '',
    });
    setAddressFormError('');
    setAddressModalOpen(true);
  };

  // Abrir modal para editar dirección existente
  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      etiqueta: addr.etiqueta || '',
      destinatario: addr.destinatario || '',
      telefono: addr.telefono || '',
      direccion: addr.direccion || '',
      ciudad: addr.ciudad || '',
      region: addr.region || '',
      codigo_postal: addr.codigo_postal || '',
      pais: addr.pais || 'Perú',
      es_predeterminada: Boolean(addr.es_predeterminada),
    });
    setAddressFormError('');
    setAddressModalOpen(true);
  };

  // Guardar dirección (Crear o Editar vía PATCH)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressFormError('');

    if (
      !addressForm.etiqueta.trim() ||
      !addressForm.destinatario.trim() ||
      !addressForm.telefono.trim() ||
      !addressForm.direccion.trim() ||
      !addressForm.ciudad.trim() ||
      !addressForm.pais.trim()
    ) {
      setAddressFormError('Por favor complete los campos obligatorios marcados con asterisco (*).');
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        etiqueta: addressForm.etiqueta.trim(),
        destinatario: addressForm.destinatario.trim(),
        telefono: addressForm.telefono.trim(),
        direccion: addressForm.direccion.trim(),
        ciudad: addressForm.ciudad.trim(),
        region: addressForm.region.trim(),
        codigo_postal: addressForm.codigo_postal.trim(),
        pais: addressForm.pais.trim(),
        es_predeterminada: addressForm.es_predeterminada,
      };

      if (editingAddressId) {
        await api.updateDireccion(editingAddressId, payload);
        toast.success('Dirección actualizada correctamente.');
      } else {
        await api.createDireccion(payload);
        toast.success('Dirección guardada exitosamente.');
      }

      // Recargar direcciones para sincronización determinista con backend
      const freshAddresses = await api.getDirecciones();
      setAddresses(Array.isArray(freshAddresses) ? freshAddresses : freshAddresses.results || []);
      setAddressModalOpen(false);
    } catch (err) {
      setAddressFormError(err.message || 'Error al guardar la dirección.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Establecer como predeterminada directamente
  const handleSetDefaultAddress = async (addr) => {
    try {
      await api.updateDireccion(addr.id, { es_predeterminada: true });
      toast.success(`"${addr.etiqueta}" establecida como predeterminada.`);
      const freshAddresses = await api.getDirecciones();
      setAddresses(Array.isArray(freshAddresses) ? freshAddresses : freshAddresses.results || []);
    } catch (err) {
      toast.error(err.message || 'No fue posible actualizar la dirección predeterminada.');
    }
  };

  // Abrir modal de confirmación de eliminación
  const handleOpenDeleteConfirm = (addr) => {
    setAddressToDelete(addr);
    setDeleteModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setDeleting(true);
    try {
      await api.deleteDireccion(addressToDelete.id);
      toast.success('Dirección eliminada correctamente.');
      // Recargar para que cualquier promoción automática de predeterminada (Caso D) se refleje
      const freshAddresses = await api.getDirecciones();
      setAddresses(Array.isArray(freshAddresses) ? freshAddresses : freshAddresses.results || []);
      setDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la dirección.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-cronos-line bg-white p-12 text-center shadow-xs">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CONSULTANDO LIBRETA DE DIRECCIONES…
        </span>
      </div>
    );
  }

  if (error && addresses.length === 0) {
    return (
      <div className="border border-cronos-line bg-white p-8 text-center shadow-xs">
        <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-3 stroke-[1.2]" />
        <h3 className="font-serif text-lg text-cronos-text mb-2 uppercase">ERROR AL CARGAR DIRECCIONES</h3>
        <p className="text-xs text-cronos-muted font-sans max-w-md mx-auto mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2 font-mono text-xs">
          <RefreshCw className="h-3 w-3" />
          <span>REINTENTAR</span>
        </Button>
      </div>
    );
  }

  return (
    <section aria-labelledby="section-addresses-heading" className="space-y-6">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-cronos-line/60">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-1">
              LIBRETA DE DIRECCIONES
            </span>
            <h2 id="section-addresses-heading" className="font-serif text-2xl text-cronos-text tracking-wide uppercase">
              DIRECCIONES DE ENTREGA
            </h2>
            <p className="text-xs text-cronos-muted font-sans mt-0.5">
              Administre las direcciones de entrega para sus pedidos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {showFullPageLink && (
              <Link
                to="/direcciones"
                className="font-mono text-[10px] tracking-widest text-cronos-bronze hover:underline uppercase transition-colors"
              >
                [ PÁGINA DE DIRECCIONES &rarr; ]
              </Link>
            )}
            <Button
              type="button"
              onClick={handleOpenCreateAddress}
              className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>NUEVA DIRECCIÓN</span>
            </Button>
          </div>
        </div>
      )}

      {/* Listado de direcciones */}
      {addresses.length === 0 ? (
        <div className="border border-cronos-line bg-white p-10 sm:p-14 text-center shadow-xs">
          <div className="h-12 w-12 border border-cronos-line mx-auto mb-4 flex items-center justify-center bg-cronos-surface-1 text-cronos-muted">
            <MapPin className="h-6 w-6 stroke-[1.2]" />
          </div>
          <h3 className="font-serif text-xl text-cronos-text uppercase tracking-wide mb-2">
            NO HAY DIRECCIONES GUARDADAS
          </h3>
          <p className="text-xs text-cronos-muted font-sans max-w-sm mx-auto mb-6 leading-relaxed">
            Añada una dirección para agilizar la entrega de sus órdenes.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateAddress}
            className="gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>NUEVA DIRECCIÓN</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((item) => (
            <article
              key={item.id}
              className="border border-cronos-line bg-white p-6 sm:p-7 flex flex-col justify-between transition-colors shadow-xs hover:border-cronos-line relative"
            >
              <div>
                {/* Encabezado: Etiqueta y Badge Predeterminada */}
                <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-cronos-line">
                  <span className="font-mono text-xs tracking-widest text-cronos-text uppercase font-semibold">
                    {item.etiqueta}
                  </span>
                  {item.es_predeterminada && (
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-widest text-cronos-bronze bg-cronos-surface-1 border border-cronos-line px-2.5 py-0.5 uppercase shrink-0 font-medium">
                      <CheckCircle2 className="h-3 w-3 stroke-[1.8]" />
                      <span>PREDETERMINADA</span>
                    </span>
                  )}
                </div>

                {/* Datos de envío */}
                <div className="space-y-2 text-xs font-sans">
                  <div>
                    <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                      DESTINATARIO
                    </span>
                    <span className="text-cronos-text font-serif text-sm block">
                      {item.destinatario}
                    </span>
                  </div>

                  <div>
                    <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                      DIRECCIÓN
                    </span>
                    <span className="text-cronos-text block font-medium">
                      {item.direccion}
                    </span>
                    <span className="text-cronos-muted block text-[11px] mt-0.5">
                      {item.ciudad}
                      {item.region ? `, ${item.region}` : ''}
                      {item.codigo_postal ? ` (${item.codigo_postal})` : ''} &bull; {item.pais}
                    </span>
                  </div>

                  <div>
                    <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase">
                      TELÉFONO
                    </span>
                    <span className="font-mono text-xs text-cronos-muted block">
                      {item.telefono}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones de la tarjeta */}
              <div className="pt-4 mt-6 border-t border-cronos-line flex flex-wrap items-center justify-between gap-2">
                <div>
                  {!item.es_predeterminada && (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAddress(item)}
                      className="font-mono text-[10px] tracking-widest text-cronos-bronze hover:text-cronos-text uppercase transition-colors cursor-pointer"
                    >
                      [ ESTABLECER COMO PREDETERMINADA ]
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEditAddress(item)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-cronos-muted hover:text-cronos-text uppercase transition-colors cursor-pointer"
                    aria-label={`Editar dirección ${item.etiqueta}`}
                  >
                    <Pencil className="h-3 w-3" />
                    <span>EDITAR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteConfirm(item)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-cronos-muted hover:text-red-600 uppercase transition-colors cursor-pointer"
                    aria-label={`Eliminar dirección ${item.etiqueta}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>ELIMINAR</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Crear / Editar Dirección */}
      <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
        <DialogHeader onClose={() => setAddressModalOpen(false)}>
          <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-1">
            LIBRETA DE DIRECCIONES
          </span>
          <DialogTitle>
            {editingAddressId ? 'EDITAR DIRECCIÓN' : 'NUEVA DIRECCIÓN'}
          </DialogTitle>
        </DialogHeader>

        {addressFormError && (
          <div role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0 stroke-[1.4]" />
            <span>{addressFormError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAddress} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="addr_etiqueta" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                ETIQUETA (CASA, OFICINA…) *
              </label>
              <Input
                id="addr_etiqueta"
                name="etiqueta"
                value={addressForm.etiqueta}
                onChange={(e) => setAddressForm({ ...addressForm, etiqueta: e.target.value })}
                required
                maxLength={60}
                placeholder="Ej: Casa, Oficina"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr_destinatario" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                DESTINATARIO *
              </label>
              <Input
                id="addr_destinatario"
                name="destinatario"
                value={addressForm.destinatario}
                onChange={(e) => setAddressForm({ ...addressForm, destinatario: e.target.value })}
                required
                maxLength={150}
                placeholder="Nombre completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="addr_telefono" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                TELÉFONO DE CONTACTO *
              </label>
              <Input
                id="addr_telefono"
                name="telefono"
                type="tel"
                value={addressForm.telefono}
                onChange={(e) => setAddressForm({ ...addressForm, telefono: e.target.value })}
                required
                maxLength={30}
                placeholder="+51 999 000 000"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr_pais" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                PAÍS *
              </label>
              <Input
                id="addr_pais"
                name="pais"
                value={addressForm.pais}
                onChange={(e) => setAddressForm({ ...addressForm, pais: e.target.value })}
                required
                maxLength={100}
                placeholder="Perú"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="addr_direccion" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
              DIRECCIÓN COMPLETA *
            </label>
            <Input
              id="addr_direccion"
              name="direccion"
              value={addressForm.direccion}
              onChange={(e) => setAddressForm({ ...addressForm, direccion: e.target.value })}
              required
              maxLength={300}
              placeholder="Calle, número, departamento, urbanización..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="addr_ciudad" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                CIUDAD *
              </label>
              <Input
                id="addr_ciudad"
                name="ciudad"
                value={addressForm.ciudad}
                onChange={(e) => setAddressForm({ ...addressForm, ciudad: e.target.value })}
                required
                maxLength={100}
                placeholder="Lima"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr_region" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                REGIÓN (OPCIONAL)
              </label>
              <Input
                id="addr_region"
                name="region"
                value={addressForm.region}
                onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })}
                maxLength={100}
                placeholder="Lima"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr_codigo_postal" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                CÓDIGO POSTAL
              </label>
              <Input
                id="addr_codigo_postal"
                name="codigo_postal"
                value={addressForm.codigo_postal}
                onChange={(e) => setAddressForm({ ...addressForm, codigo_postal: e.target.value })}
                maxLength={20}
                placeholder="15036"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-cronos-muted select-none">
              <input
                type="checkbox"
                name="es_predeterminada"
                checked={addressForm.es_predeterminada}
                onChange={(e) => setAddressForm({ ...addressForm, es_predeterminada: e.target.checked })}
                className="h-4 w-4 rounded-none border-cronos-line bg-white text-cronos-bronze focus:ring-0 cursor-pointer"
              />
              <span>Establecer como dirección predeterminada</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-cronos-line mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={savingAddress}
              onClick={() => setAddressModalOpen(false)}
            >
              CANCELAR
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={savingAddress}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {savingAddress ? 'GUARDANDO…' : (editingAddressId ? 'ACTUALIZAR' : 'GUARDAR DIRECCIÓN')}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Confirmación de Eliminación */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogHeader onClose={() => setDeleteModalOpen(false)}>
          <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-1">
            CONFIRMACIÓN REQUERIDA
          </span>
          <DialogTitle>ELIMINAR DIRECCIÓN</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3 font-sans text-xs text-cronos-muted leading-relaxed">
          <p>
            ¿Desea eliminar la dirección <strong className="text-cronos-text font-serif">{addressToDelete?.etiqueta}</strong>?
          </p>
          <div className="p-3 border border-cronos-line bg-cronos-surface-1 text-[11px] text-cronos-muted">
            <p className="text-cronos-text font-medium">{addressToDelete?.destinatario}</p>
            <p>{addressToDelete?.direccion}, {addressToDelete?.ciudad}, {addressToDelete?.pais}</p>
          </div>
          <p className="text-[11px]">Esta acción no se puede deshacer.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-cronos-line mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={() => setDeleteModalOpen(false)}
          >
            CANCELAR
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={deleting}
            onClick={handleConfirmDelete}
            className="bg-red-600 border border-red-700 text-white hover:bg-red-700 tracking-wider font-mono text-xs uppercase"
          >
            {deleting ? 'ELIMINANDO…' : 'ELIMINAR'}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
