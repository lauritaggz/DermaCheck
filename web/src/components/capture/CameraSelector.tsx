import type { ResolvedCamera } from '../../utils/cameraDevices';

interface Props {
  resolvedCameras: ResolvedCamera[];
  selectedDeviceId: string;
  activeTrackLabel: string | null;
  isLoading: boolean;
  onSelect: (deviceId: string) => void;
  onSelectIriun: () => void;
  onRefresh: () => void;
}

export function CameraSelector({
  resolvedCameras,
  selectedDeviceId,
  activeTrackLabel,
  isLoading,
  onSelect,
  onSelectIriun,
  onRefresh,
}: Props) {
  const iriun = resolvedCameras.find((c) => c.isIriun);
  const selected = resolvedCameras.find((c) => c.deviceId === selectedDeviceId);
  const usingIriun = selected?.isIriun || activeTrackLabel?.toLowerCase().includes('iriun');

  return (
    <div className="mb-4 space-y-3">
      {/* Botón destacado para Iriun */}
      {iriun && !usingIriun && (
        <button
          type="button"
          onClick={onSelectIriun}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm transition-all shadow-lg disabled:opacity-50"
        >
          📱 Usar cámara del móvil (Iriun)
        </button>
      )}

      {usingIriun && (
        <div className="py-2.5 px-4 rounded-xl bg-teal-500/20 border-2 border-teal-400 text-teal-100 text-sm font-semibold text-center">
          ✓ Usando cámara del móvil — Iriun
        </div>
      )}

      {activeTrackLabel && (
        <p className="text-xs text-white/70 px-1">
          Señal activa: <strong className="text-white">{activeTrackLabel}</strong>
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/50 uppercase">Todas las cámaras</p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs font-semibold text-teal-300 hover:text-teal-200 disabled:opacity-50"
        >
          {isLoading ? 'Buscando…' : '↻ Actualizar'}
        </button>
      </div>

      {!iriun && resolvedCameras.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-100 text-xs">
          <strong>Iriun no detectado.</strong> Abre la app en el móvil y el cliente en el PC.
          Cuando diga «conectado», pulsa «Actualizar».
        </div>
      )}

      {resolvedCameras.length === 0 ? (
        <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 text-xs">
          Sin cámaras. Permite acceso en el navegador.
        </div>
      ) : (
        <div className="space-y-1 rounded-xl border border-white/15 bg-black/20 p-1 max-h-40 overflow-y-auto">
          {resolvedCameras.map((cam) => {
            const isSelected = cam.deviceId === selectedDeviceId;
            return (
              <button
                key={cam.deviceId}
                type="button"
                onClick={() => onSelect(cam.deviceId)}
                disabled={isLoading}
                className={`w-full px-3 py-2.5 rounded-lg text-left text-sm flex items-center justify-between ${
                  isSelected ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="truncate">
                  {cam.isIriun && '📱 '}
                  {cam.isBuiltIn && '💻 '}
                  {cam.label}
                </span>
                {isSelected && <span className="text-teal-300 text-xs ml-2">●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
