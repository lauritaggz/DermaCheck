import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer, TextField } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { authService } from '../services/authService';

export function LoginScreen() {
  const { setUser, consent } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError(null);
    setLoading(true);
    
    const result = await authService.login({ email, password });
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
      <ScreenContainer maxWidth="lg" className="bg-gradient-to-br from-surface via-white to-secondary/20">
        <div className="flex flex-col items-center justify-center min-h-screen py-6">
          <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-borderLight">
            <h1 className="text-2xl font-bold text-primary mb-1">DermaCheck</h1>
            <p className="text-sm text-textSecondary mb-5">
              Inicia sesión con tu cuenta
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
              
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <PrimaryButton
                label={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full mb-3 py-3 text-base"
              />

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="w-full text-primary text-sm font-medium hover:underline"
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </form>
          </div>
        </div>
      </ScreenContainer>
    </PageTransition>
  );
}
