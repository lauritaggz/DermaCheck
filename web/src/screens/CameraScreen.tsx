import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, ScreenContainer } from '../components';
import { PageTransition } from '../components/PageTransition';
import { useAppState } from '../context/AppContext';

export function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const { setPendingImage } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    async function getDevices() {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        setError('No se pudo acceder a los dispositivos de cámara');
      }
    }
    getDevices();
  }, [selectedDeviceId]);

  useEffect(() => {
    async function startCamera() {
      if (!selectedDeviceId) return;

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user',
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setError(null);
      } catch (err) {
        setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  async function captureImage() {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Error al capturar la imagen');
        setCapturing(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      setPendingImage({
        uri: url,
        width: canvas.width,
        height: canvas.height,
        source: 'camera',
      });

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      navigate('/preview');
    }, 'image/jpeg', 0.95);
  }

  function switchCamera() {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  }

  return (
    <PageTransition>
      <ScreenContainer className="bg-black">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative w-full max-w-4xl">
          {error && (
            <div className="absolute top-4 left-4 right-4 p-4 bg-red-500 text-white rounded-lg z-10">
              {error}
            </div>
          )}

          <div className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[90%] border-4 border-white/30 rounded-[50%] shadow-lg" />
              </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4">
              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  title="Cambiar cámara"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}

              <button
                onClick={captureImage}
                disabled={capturing || !!error}
                className="w-20 h-20 bg-white rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl border-4 border-white/50"
              />

              <button
                onClick={() => navigate('/home')}
                className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Cancelar"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-6 text-center text-white">
            <p className="text-lg font-medium mb-2">Centra tu rostro en el óvalo</p>
            <p className="text-sm text-gray-300">
              Asegúrate de tener buena iluminación y el rostro completamente visible
            </p>
          </div>
        </div>
      </div>
    </ScreenContainer>
    </PageTransition>
  );
}
