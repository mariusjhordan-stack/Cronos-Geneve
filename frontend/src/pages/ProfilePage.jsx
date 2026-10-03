import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, User, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { AddressManager } from '@/components/profile/AddressManager';

export function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Estados del perfil
  const [profile, setProfile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Estados de carga y feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Carga inicial del perfil
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profileData = await api.getPerfil();
        if (active) {
          setProfile(profileData);
          setFirstName(profileData.first_name || user?.first_name || '');
          setLastName(profileData.last_name || user?.last_name || '');
          setPhone(profileData.telefono || user?.perfil?.telefono || '');
        }
      } catch (err) {
        if (active) setError(err.message || 'No fue posible cargar la información de la cuenta.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await api.getPerfil();
      setProfile(profileData);
      setFirstName(profileData.first_name || user?.first_name || '');
      setLastName(profileData.last_name || user?.last_name || '');
      setPhone(profileData.telefono || user?.perfil?.telefono || '');
    } catch (err) {
      setError(err.message || 'No fue posible cargar la información de la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  // Detectar si existen modificaciones sin guardar
  const hasChanges =
    firstName.trim() !== (profile?.first_name || '') ||
    lastName.trim() !== (profile?.last_name || '') ||
    phone.trim() !== (profile?.telefono || '');

  // Guardar cambios en el perfil (first_name, last_name, telefono)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setSavingProfile(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        telefono: phone.trim(),
      };
      const updated = await api.updatePerfil(payload);
      setProfile(updated);
      setFirstName(updated.first_name || '');
      setLastName(updated.last_name || '');
      setPhone(updated.telefono || '');

      // Sincronizar de inmediato el usuario en el contexto de autenticación global
      if (updateUser) {
        updateUser({
          first_name: updated.first_name,
          last_name: updated.last_name,
          perfil: updated.perfil || { ...(user?.perfil || {}), telefono: updated.telefono },
        });
      }

      toast.success('Perfil actualizado correctamente.');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Formato editorial de fecha de registro
  const rawDate = profile?.date_joined || profile?.creado_en || user?.date_joined;
  const memberSince = rawDate
    ? new Date(rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-28 text-center sm:px-6 lg:px-8">
        <span className="font-mono text-xs tracking-widest-brand text-cronos-bronze uppercase block animate-pulse">
          CONSULTANDO INFORMACIÓN DE CUENTA…
        </span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="border border-cronos-line bg-cronos-surface p-8 sm:p-10">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4 stroke-[1.2]" />
          <h2 className="font-serif text-2xl text-cronos-text mb-2 uppercase">ERROR AL CARGAR CUENTA</h2>
          <p className="text-xs text-cronos-muted font-sans max-w-md mx-auto mb-6 leading-relaxed">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2 font-mono text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>REINTENTAR</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* 1. ENCABEZADO DE LA PÁGINA */}
      <div className="border-b border-cronos-line pb-6">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-2">
          PANORAMA &bull; MI CUENTA
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.03em] uppercase mb-2 font-normal">
          MI CUENTA
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-2xl leading-relaxed">
          Gestione los datos de su cuenta y la libreta de direcciones.
        </p>
      </div>

      {/* 2. SUBNAVEGACIÓN DE CUENTA */}
      <nav
        aria-label="Navegación de Cuenta"
        className="flex items-center gap-4 sm:gap-6 border-b border-cronos-line pb-3 text-[11px] font-mono tracking-widest uppercase overflow-x-auto max-w-full"
      >
        <span className="shrink-0 whitespace-nowrap text-cronos-text border-b-2 border-cronos-bronze pb-1 font-medium">
          [ 01 &bull; PERFIL DE USUARIO ]
        </span>
        <Link
          to="/direcciones"
          className="shrink-0 whitespace-nowrap text-cronos-muted hover:text-cronos-text transition-colors py-1"
        >
          [ 02 &bull; LIBRETA DE DIRECCIONES ]
        </Link>
        <Link
          to="/mis-ordenes"
          className="shrink-0 whitespace-nowrap text-cronos-muted hover:text-cronos-text transition-colors py-1"
        >
          [ 03 &bull; HISTORIAL DE ÓRDENES ]
        </Link>
      </nav>

      {/* 3. SECCIÓN 01: PERFIL DE USUARIO (DATOS DE LA CUENTA + INFORMACIÓN PERSONAL) */}
      <section aria-labelledby="section-profile-title" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-cronos-line/60">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-cronos-bronze uppercase block mb-1">
              SECCIÓN 01
            </span>
            <h2 id="section-profile-title" className="font-serif text-2xl text-cronos-text tracking-wide uppercase font-normal">
              PERFIL Y CONTACTO
            </h2>
          </div>
          <span className="text-[11px] font-sans text-cronos-muted">
            Datos de la cuenta e información de contacto.
          </span>
        </div>

        {/* 3.1. BLOQUE A: DATOS DE LA CUENTA (SOLO LECTURA) */}
        <div className="border border-cronos-line bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cronos-line/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-cronos-bronze stroke-[1.4]" />
              <h3 className="font-mono text-xs tracking-widest text-cronos-text uppercase font-semibold">
                DATOS DE LA CUENTA
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-widest text-cronos-muted bg-cronos-surface-1 border border-cronos-line px-2.5 py-0.5 uppercase font-medium">
              [ SOLO LECTURA ]
            </span>
          </div>

          <p className="text-xs text-cronos-muted font-sans leading-relaxed">
            El nombre de usuario y correo electrónico no se pueden modificar desde este panel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="border border-cronos-line bg-cronos-surface-1 p-4">
              <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                NOMBRE DE USUARIO
              </span>
              <span className="font-mono text-xs text-cronos-text block font-medium">
                @{profile?.username || user?.username}
              </span>
            </div>

            <div className="border border-cronos-line bg-cronos-surface-1 p-4">
              <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                CORREO ELECTRÓNICO
              </span>
              <span className="font-mono text-xs text-cronos-text block truncate">
                {profile?.email || user?.email}
              </span>
            </div>

            <div className="border border-cronos-line bg-cronos-surface-1 p-4">
              <span className="block font-mono text-[9px] tracking-widest text-cronos-muted uppercase mb-1">
                FECHA DE REGISTRO
              </span>
              <span className="font-sans text-xs text-cronos-muted block capitalize">
                {memberSince ? `Registrado el ${memberSince}` : 'Registro activo'}
              </span>
            </div>
          </div>
        </div>

        {/* 3.2. BLOQUE B: INFORMACIÓN PERSONAL EDITABLE */}
        <form onSubmit={handleUpdateProfile} className="border border-cronos-line bg-white p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cronos-line/50">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-cronos-bronze stroke-[1.4]" />
              <h3 className="font-mono text-xs tracking-widest text-cronos-text uppercase font-semibold">
                INFORMACIÓN PERSONAL
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cronos-bronze tracking-wider uppercase">
              CAMPOS EDITABLES
            </span>
          </div>

          <p className="text-xs text-cronos-muted font-sans leading-relaxed">
            Actualice su nombre, apellidos y teléfono de contacto para sus pedidos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="profile_first_name" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                NOMBRE
              </label>
              <Input
                id="profile_first_name"
                name="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
                disabled={savingProfile}
                maxLength={150}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile_last_name" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
                APELLIDOS
              </label>
              <Input
                id="profile_last_name"
                name="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellidos"
                disabled={savingProfile}
                maxLength={150}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile_telefono" className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase">
              TELÉFONO DE CONTACTO
            </label>
            <Input
              id="profile_telefono"
              name="telefono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+51 999 000 000"
              disabled={savingProfile}
              maxLength={30}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-cronos-line/50">
            <span className="text-[11px] font-sans text-cronos-muted">
              {hasChanges ? 'Hay cambios pendientes de confirmación.' : 'No se detectan cambios sin guardar.'}
            </span>
            <Button
              type="submit"
              size="default"
              disabled={savingProfile || !hasChanges}
              className="tracking-[0.2em] font-mono text-xs uppercase shrink-0"
            >
              {savingProfile ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}
            </Button>
          </div>
        </form>
      </section>

      {/* 4. SECCIÓN 02: LIBRETA DE DIRECCIONES */}
      <div className="pt-4 border-t border-cronos-line/60">
        <AddressManager showTitle={true} showFullPageLink={true} />
      </div>
    </div>
  );
}

export default ProfilePage;
