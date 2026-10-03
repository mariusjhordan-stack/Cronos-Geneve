import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const resolveDestination = (from) => {
    if (!from) return '/perfil';
    if (typeof from === 'string') return from;
    if (from.pathname) {
      return `${from.pathname}${from.search || ''}${from.hash || ''}`;
    }
    return '/perfil';
  };

  // Si el usuario ya está autenticado, redirigir a perfil (o ruta previa si venía de ProtectedRoute)
  useEffect(() => {
    if (isAuthenticated) {
      const destination = resolveDestination(location.state?.from);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Por favor, ingrese su usuario y contraseña.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await login(form);
      toast.success('Sesión iniciada correctamente.');
      const destination = resolveDestination(location.state?.from);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión. Verifique sus credenciales.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:py-24 sm:px-6">
      {/* Encabezado Editorial */}
      <div className="text-center mb-10">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-3">
          ESPACE CLIENT &bull; ACCÈS PRIVÉ
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.02em] uppercase mb-3 font-normal">
          INICIAR SESIÓN
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-sm mx-auto leading-relaxed">
          Acceda a su cuenta para consultar su selección privada, estado de pedidos y direcciones de entrega.
        </p>
      </div>

      {/* Contenedor del Formulario */}
      <div className="border border-cronos-line bg-white p-7 sm:p-10 shadow-xs relative">
        {error && (
          <div
            role="alert"
            className="mb-6 border border-red-200 bg-red-50 p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0 stroke-[1.4]" />
            <div className="text-xs text-red-700 font-sans leading-relaxed">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase"
            >
              NOMBRE DE USUARIO *
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={busy}
              value={form.username}
              onChange={handleChange}
              placeholder="Ej: falmenara"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase"
              >
                CONTRASEÑA *
              </label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={busy}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pr-11"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cronos-muted hover:text-cronos-text transition-colors p-1 cursor-pointer focus:outline-none disabled:opacity-40"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 stroke-[1.4]" />
                ) : (
                  <Eye className="h-4 w-4 stroke-[1.4]" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={busy}
              className="w-full py-4 text-xs font-semibold tracking-[0.2em] font-mono flex items-center justify-center gap-2 uppercase"
            >
              {busy ? (
                <span>VERIFICANDO CREDENCIALES…</span>
              ) : (
                <>
                  <span>ENTRAR</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Enlace hacia Registro */}
        <div className="mt-8 pt-6 border-t border-cronos-line/60 text-center font-sans text-xs text-cronos-muted">
          <span>¿Primera visita a la Maison? </span>
          <Link
            to="/register"
            className="text-cronos-bronze hover:text-cronos-text font-mono text-[11px] tracking-wider uppercase transition-colors ml-1 font-medium underline underline-offset-4"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}
