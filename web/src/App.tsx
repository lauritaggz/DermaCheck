import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppState } from './context/AppContext';

// Eager loading para pantallas críticas
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ConsentScreen } from './screens/ConsentScreen';

// Lazy loading para pantallas secundarias
const RegisterScreen = lazy(() => import('./screens/RegisterScreen').then(m => ({ default: m.RegisterScreen })));
const HomeScreen = lazy(() => import('./screens/HomeScreen').then(m => ({ default: m.HomeScreen })));
const InstructionsScreen = lazy(() => import('./screens/InstructionsScreen').then(m => ({ default: m.InstructionsScreen })));
const ImagePickerScreen = lazy(() => import('./screens/ImagePickerScreen').then(m => ({ default: m.ImagePickerScreen })));
const CameraScreen = lazy(() => import('./screens/CameraScreen').then(m => ({ default: m.CameraScreen })));
const PreviewScreen = lazy(() => import('./screens/PreviewScreen').then(m => ({ default: m.PreviewScreen })));
const ProcessingScreen = lazy(() => import('./screens/ProcessingScreen').then(m => ({ default: m.ProcessingScreen })));
const ResultsScreen = lazy(() => import('./screens/ResultsScreen').then(m => ({ default: m.ResultsScreen })));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppState();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppState();
  return !user ? <>{children}</> : <Navigate to="/home" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
        <Route path="/consent" element={<ProtectedRoute><ConsentScreen /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
        <Route path="/instructions" element={<ProtectedRoute><InstructionsScreen /></ProtectedRoute>} />
        <Route path="/image-picker" element={<ProtectedRoute><ImagePickerScreen /></ProtectedRoute>} />
        <Route path="/camera" element={<ProtectedRoute><CameraScreen /></ProtectedRoute>} />
        <Route path="/preview" element={<ProtectedRoute><PreviewScreen /></ProtectedRoute>} />
        <Route path="/processing" element={<ProtectedRoute><ProcessingScreen /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsScreen /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
