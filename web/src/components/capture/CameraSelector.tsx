import { useState } from 'react';
import type { ResolvedCamera } from '../../utils/cameraDevices';

interface Props {
  resolvedCameras: ResolvedCamera[];
  selectedDeviceId: string;
  activeTrackLabel: string | null;
  isLoading: boolean;
  onSelect: (deviceId: string) => void;
  onRefresh: () => void;
}

export function CameraSelector({
  resolvedCameras,
  selectedDeviceId,
  activeTrackLabel,
  isLoading,
  onSelect,
  onRefresh,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const selected = resolvedCameras.find((c) => c.deviceId === selectedDeviceId);
  const displayLabel = activeTrackLabel || selected?.label || 'Sin cámara';

  return (
    <div className="mb-4 rounded-xl border border-white/15 bg-black/25 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Cámara</p>
          <p className="text-sm text-white truncate">
            {displayLabel}
            {selected?.isFront && (
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/30 text-teal-100 border border-teal-400/40">
                Frontal
              </span>
            )}
          </p>
        </div>
        <span className="text-white/60 text-xs shrink-0">{expanded ? '▴' : '▾'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs font-semibold text-teal-300 hover:text-teal-200 disabled:opacity-50"
            >
              {isLoading ? 'Buscando…' : '↻ Actualizar'}
            </button>
          </div>

          {resolvedCameras.length === 0 ? (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 text-xs">
              Sin cámaras. Permite acceso en el navegador.
            </div>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {resolvedCameras.map((cam) => {
                const isSelected = cam.deviceId === selectedDeviceId;
                return (
                  <button
                    key={cam.deviceId}
                    type="button"
                    onClick={() => onSelect(cam.deviceId)}
                    disabled={isLoading}
                    className={`w-full px-3 py-2.5 rounded-lg text-left text-sm flex items-center justify-between gap-2 ${
                      isSelected ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{cam.label}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {cam.isFront && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-100">
                          Frontal
                        </span>
                      )}
                      {isSelected && <span className="text-teal-300 text-xs">●</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
