import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, TextField } from '../components';
import { PageTransition } from '../components/PageTransition';
import { AppShell } from '../components/layout/AppShell';
import { AuthCard } from '../components/layout/AuthCard';
import { useAppState } from '../context/AppContext';
import { authService } from '../services/authService';

export function RegisterScreen() {
  const { setUser, consent } = useAppState();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await authService.register({ name, email, password });
    setLoading(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setUser(result.user);
    navigate(consent.accepted ? '/home' : '/consent');
  }

  return (
    <PageTransition>
      <AppShell>
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <AuthCard title="Crea tu cuenta" description="Comienza tu análisis dermatológico con IA">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <TextField label="Nombre completo" type="text" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              <TextField label="Correo electrónico" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
              <TextField label="Contraseña" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              <PrimaryButton label={loading ? 'Creando cuenta…' : 'Registrarse'}
                type="submit" loading={loading} disabled={loading} className="w-full mb-4" />
              <button type="button" onClick={() => navigate('/login')}
                className="w-full text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors">
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </form>
          </AuthCard>
        </div>
      </AppShell>
    </PageTransition>
  );
}
