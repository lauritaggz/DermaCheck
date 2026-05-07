import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';
import { useCameraStream } from '../hooks/useCameraStream';
import { useLiveImageQuality } from '../hooks/useLiveImageQuality';
import { loggerService } from '../services/loggerService';

export function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const { setPendingImage } = useAppState();
  const navigate = useNavigate();
  const {
    stream,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isLoading,
    error,
    stopStream,
  } = useCameraStream();
  const imageQuality = useLiveImageQuality({
    videoRef,
    isEnabled: Boolean(stream) && !isLoading,
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) return;

    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = async () => {
      try {
        await videoElement.play();
      } catch (err) {
        loggerService.warn('No se pudo reproducir el stream de video', {
          error: err instanceof Error ? err.message : 'video_play_error',
        });
      }
    };
  }, [stream]);

  async function captureImage() {
    if (!videoRef.current || !canvasRef.current) return;
    if (!imageQuality?.isGood) return;

    setCapturing(true);
    loggerService.info('Inicio de captura de imagen desde cámara', {
      selectedDeviceId,
      quality: imageQuality,
    });

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        loggerService.error('Error al convertir canvas a blob');
        setCapturing(false);
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      setPendingImage({
        blob,
        objectUrl,
        width: canvas.width,
        height: canvas.height,
        source: 'camera',
      });

      stopStream();
      loggerService.info('Captura de imagen completada', {
        width: canvas.width,
        height: canvas.height,
      });

      navigate('/preview');
    }, 'image/jpeg', 0.95);
  }

  function switchCamera() {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  }

  function selectCamera(deviceId: string) {
    loggerService.info('Cambio manual de cámara', {
      previousDeviceId: selectedDeviceId,
      nextDeviceId: deviceId,
    });
    setSelectedDeviceId(deviceId);
    setShowCameraSelector(false);
  }

  function getCameraLabel(device: MediaDeviceInfo, index: number): string {
    if (device.label) {
      return device.label;
    }
    return `Cámara ${index + 1}`;
  }

  return (
    <PageTransition>
      <ScreenContainer className="bg-black">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <button
            onClick={() => {
              stopStream();
              navigate('/image-picker');
            }}
            className="absolute top-4 left-4 z-30 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            title="Volver"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

        <div className="relative w-full max-w-4xl">
          {/* Camera Selector */}
          {devices.length > 1 && !isLoading && (
            <div className="mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowCameraSelector(!showCameraSelector)}
                  className="w-full bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-xs text-textMuted">Cámara seleccionada:</p>
                      <p className="text-sm font-semibold text-text">
                        {getCameraLabel(devices.find(d => d.deviceId === selectedDeviceId) || devices[0], devices.findIndex(d => d.deviceId === selectedDeviceId))}
                      </p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-primary transition-transform ${showCameraSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCameraSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden z-40 max-h-64 overflow-y-auto">
                    {devices.map((device, index) => (
                      <button
                        key={device.deviceId}
                        onClick={() => selectCamera(device.deviceId)}
                        className={`w-full px-6 py-4 text-left hover:bg-primary/5 transition-colors flex items-center gap-3 ${
                          device.deviceId === selectedDeviceId ? 'bg-primary/10' : ''
                        }`}
                      >
                        <svg className={`w-5 h-5 ${device.deviceId === selectedDeviceId ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${device.deviceId === selectedDeviceId ? 'text-primary' : 'text-text'}`}>
                            {getCameraLabel(device, index)}
                          </p>
                          {device.label && device.label.includes('USB') && (
                            <p className="text-xs text-textMuted">Cámara externa</p>
                          )}
                        </div>
                        {device.deviceId === selectedDeviceId && (
                          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {error ? (
            <div className="absolute top-4 left-4 right-4 p-4 bg-red-500 text-white rounded-lg z-10">
              {error}
            </div>
          ) : null}

          <div className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white">Iniciando cámara...</p>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-[80%] h-[90%] border-4 rounded-[50%] shadow-lg transition-colors ${
                  imageQuality?.isGood 
                    ? 'border-green-500/50' 
                    : 'border-red-500/50'
                }`} />
              </div>

              {imageQuality && (
                <div className="absolute top-4 left-4 right-4 pointer-events-auto">
                  <div className={`p-4 rounded-lg backdrop-blur-sm ${
                    imageQuality.isGood 
                      ? 'bg-green-500/20 border border-green-500/50' 
                      : 'bg-red-500/20 border border-red-500/50'
                  }`}>
                    {imageQuality.isGood ? (
                      <div className="flex items-center gap-2 text-green-100">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Calidad buena - Listo para capturar</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 text-red-100 mb-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Mejora la calidad:</span>
                        </div>
                        <ul className="text-sm text-red-100 space-y-1">
                          {imageQuality.issues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-0.5">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4">
              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  disabled={isLoading}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors disabled:opacity-50"
                  title="Cambiar cámara"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}

              <button
                onClick={captureImage}
                disabled={capturing || !!error || isLoading || !imageQuality?.isGood}
                className={`w-20 h-20 rounded-full transition-all disabled:opacity-50 shadow-xl border-4 ${
                  imageQuality?.isGood 
                    ? 'bg-green-500 border-green-400 hover:bg-green-600' 
                    : 'bg-white border-white/50 hover:bg-gray-200'
                }`}
                title={imageQuality?.isGood ? 'Capturar foto' : 'Mejora la calidad para capturar'}
              />
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-6 text-center text-white">
            <p className="text-lg font-medium mb-2">Centra tu rostro en el óvalo</p>
            <p className="text-sm text-gray-300">
              La cámara verificará automáticamente la calidad de la imagen
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Iluminación • Nitidez • Contraste
            </p>
          </div>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
