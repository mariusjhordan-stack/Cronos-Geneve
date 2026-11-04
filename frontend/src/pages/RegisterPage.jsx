import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const [passwordStarted, setPasswordStarted] = useState(false);
  const [confirmationStarted, setConfirmationStarted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Si el usuario ya está autenticado, redirigir a perfil
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/perfil', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') setPasswordStarted(true);
    if (name === 'password_confirm') setConfirmationStarted(true);
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (error) setError('');
  };

  const passwordRules = [
    { label: 'Al menos 8 caracteres', passed: form.password.length >= 8, started: passwordStarted },
    { label: 'Al menos una mayúscula', passed: /[A-Z]/.test(form.password), started: passwordStarted },
    { label: 'Al menos una minúscula', passed: /[a-z]/.test(form.password), started: passwordStarted },
    { label: 'Al menos un número', passed: /[0-9]/.test(form.password), started: passwordStarted },
    { label: 'Al menos un símbolo especial', passed: /[^A-Za-z0-9\s]/.test(form.password), started: passwordStarted },
    {
      label: 'Confirmación: ambas contraseñas coinciden',
      passed: Boolean(form.password && form.password_confirm && form.password === form.password_confirm),
      started: passwordStarted || confirmationStarted,
    },
  ];
  const passwordRequirementsMet = passwordRules.every((rule) => rule.passed);

  const validateForm = () => {
    const errors = {};
    if (!form.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio.';
    } else if (form.username.length > 150) {
      errors.username = 'El nombre de usuario no puede exceder 150 caracteres.';
    }

    if (!form.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Por favor, ingrese un formato de correo electrónico válido.';
    }

    if (!passwordRules.slice(0, 5).every((rule) => rule.passed)) {
      errors.password = 'La contraseña debe cumplir todos los requisitos de seguridad.';
    }

    if (!form.password_confirm) {
      errors.password_confirm = 'Por favor, confirme su contraseña.';
    } else if (!passwordRules[5].passed) {
      errors.password_confirm = 'Las contraseñas no coinciden.';
    }

    return errors;
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError('Por favor, revise los campos señalados antes de continuar.');
      return;
    }

    setFieldErrors({});
    setBusy(true);

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
      });
      toast.success('Cuenta creada exitosamente. Bienvenido a Cronos Genève.');
      navigate('/perfil', { replace: true });
    } catch (err) {
      const msg = err.message || 'No fue posible crear la cuenta.';
      setError(msg);

      // Mapeo sutil de errores conocidos del backend hacia campos específicos
      const newFieldErrors = {};
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('nombre de usuario') || lowerMsg.includes('username')) {
        newFieldErrors.username = msg;
      } else if (lowerMsg.includes('correo') || lowerMsg.includes('email')) {
        newFieldErrors.email = msg;
      } else if (lowerMsg.includes('contraseña') || lowerMsg.includes('password')) {
        if (lowerMsg.includes('coinciden')) {
          newFieldErrors.password_confirm = msg;
        } else {
          newFieldErrors.password = msg;
        }
      }
      setFieldErrors(newFieldErrors);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:py-24 sm:px-6">
      {/* Encabezado Editorial */}
      <div className="text-center mb-10">
        <span className="font-mono text-[10px] tracking-widest-brand text-cronos-bronze uppercase block mb-3">
          ESPACE CLIENT &bull; REGISTRO DE TITULAR
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-cronos-text tracking-[0.02em] uppercase mb-3 font-normal">
          CREAR CUENTA
        </h1>
        <p className="text-xs sm:text-sm text-cronos-muted font-sans max-w-sm mx-auto leading-relaxed">
          Registre sus datos para acceder a su selección privada de piezas, historial de pedidos y domicilios de entrega.
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

        <form onSubmit={submit} className="space-y-5">
          {/* Nombre de Usuario */}
          <div className="space-y-1.5">
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
              maxLength={150}
              disabled={busy}
              value={form.username}
              onChange={handleChange}
              placeholder="Ej: falmenara"
              className={`w-full ${fieldErrors.username ? 'border-red-400 focus:border-red-600' : ''}`}
            />
            {fieldErrors.username && (
              <span className="block font-mono text-[10px] text-red-600 mt-1">
                {fieldErrors.username}
              </span>
            )}
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase"
            >
              CORREO ELECTRÓNICO *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={busy}
              value={form.email}
              onChange={handleChange}
              placeholder="titular@ejemplo.com"
              className={`w-full ${fieldErrors.email ? 'border-red-400 focus:border-red-600' : ''}`}
            />
            {fieldErrors.email && (
              <span className="block font-mono text-[10px] text-red-600 mt-1">
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <ul className="list-disc space-y-0.5 pl-4 font-sans text-[10px] leading-relaxed sm:text-[11px]">
              {passwordRules.slice(0, 5).map((rule) => {
                const statusStyle = !rule.started
                  ? 'text-cronos-muted'
                  : rule.passed
                    ? 'text-emerald-700'
                    : 'text-red-600';
                return (
                  <li key={rule.label} className={statusStyle}>{rule.label}</li>
                );
              })}
            </ul>
            <label
              htmlFor="password"
              className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase"
            >
              CONTRASEÑA *
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={busy}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className={`w-full pr-11 ${fieldErrors.password ? 'border-red-400 focus:border-red-600' : ''}`}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-controls="password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={busy}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cronos-muted transition-colors hover:text-cronos-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text disabled:opacity-40"
              >
                {showPassword
                  ? <EyeOff aria-hidden="true" className="h-4 w-4 stroke-[1.4]" />
                  : <Eye aria-hidden="true" className="h-4 w-4 stroke-[1.4]" />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="block font-mono text-[10px] text-red-600 mt-1">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-1.5">
            {passwordRules[5].passed && (
              <p className="font-sans text-[11px] text-emerald-700">
                ✓ Las contraseñas coinciden
              </p>
            )}
            <label
              htmlFor="password_confirm"
              className="block font-mono text-[10px] tracking-widest text-cronos-muted uppercase"
            >
              CONFIRMAR CONTRASEÑA *
            </label>
            <div className="relative">
              <Input
                id="password_confirm"
                name="password_confirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                disabled={busy}
                value={form.password_confirm}
                onChange={handleChange}
                placeholder="••••••••••••"
                className={`w-full pr-11 ${fieldErrors.password_confirm ? 'border-red-400 focus:border-red-600' : ''}`}
              />
              <button
                type="button"
                aria-label={showPasswordConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                aria-controls="password_confirm"
                aria-pressed={showPasswordConfirm}
                onClick={() => setShowPasswordConfirm((visible) => !visible)}
                disabled={busy}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cronos-muted transition-colors hover:text-cronos-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cronos-text disabled:opacity-40"
              >
                {showPasswordConfirm
                  ? <EyeOff aria-hidden="true" className="h-4 w-4 stroke-[1.4]" />
                  : <Eye aria-hidden="true" className="h-4 w-4 stroke-[1.4]" />}
              </button>
            </div>
            {fieldErrors.password_confirm && (
              <span className="block font-mono text-[10px] text-red-600 mt-1">
                {fieldErrors.password_confirm}
              </span>
            )}
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={busy || !passwordRequirementsMet}
              className="w-full py-4 text-xs font-semibold tracking-[0.2em] font-mono flex items-center justify-center gap-2 uppercase"
            >
              {busy ? (
                <span>CREANDO CUENTA…</span>
              ) : (
                <>
                  <span>CREAR CUENTA</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Enlace hacia Inicio de Sesión */}
        <div className="mt-8 pt-6 border-t border-cronos-line/60 text-center font-sans text-xs text-cronos-muted">
          <span>¿Ya dispone de una cuenta? </span>
          <Link
            to="/login"
            className="text-cronos-bronze hover:text-cronos-text font-mono text-[11px] tracking-wider uppercase transition-colors ml-1 font-medium underline underline-offset-4"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
