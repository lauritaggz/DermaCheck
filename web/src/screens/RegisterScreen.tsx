import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer, TextField } from '../components';
import { PageTransition } from '../components/PageTransition';
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
      <ScreenContainer>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-primary mb-2">Crear cuenta</h1>
          <p className="text-textSecondary mb-6">
            Regístrate para comenzar tu análisis dermatológico
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nombre completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />

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
              placeholder="Mínimo 6 caracteres"
            />

            <PrimaryButton
              label={loading ? 'Creando cuenta...' : 'Registrarse'}
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full mb-4"
            />

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-primary text-sm font-medium hover:underline"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </form>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
