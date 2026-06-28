import { useCallback, useRef, useState, type PointerEvent } from 'react';
import {
  getSavedCaptureButtonPosition,
  saveCaptureButtonPosition,
} from '../../utils/cameraPreferences';

interface Props {
  disabled: boolean;
  isReady: boolean;
  capturing: boolean;
  onCapture: () => void;
  ariaLabel: string;
}

export function DraggableCaptureButton({
  disabled,
  isReady,
  capturing,
  onCapture,
  ariaLabel,
}: Props) {
  const saved = getSavedCaptureButtonPosition();
  const [position, setPosition] = useState(saved);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const movedRef = useRef(false);

  const clamp = useCallback((value: number) => Math.min(92, Math.max(8, value)), []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: position.xPercent,
        originY: position.yPercent,
      };
      movedRef.current = false;
    },
    [disabled, position.xPercent, position.yPercent],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (!dragRef.current) return;
      const container = event.currentTarget.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        movedRef.current = true;
      }

      const nextX = clamp(dragRef.current.originX + (dx / rect.width) * 100);
      const nextY = clamp(dragRef.current.originY + (dy / rect.height) * 100);
      setPosition({ xPercent: nextX, yPercent: nextY });
    },
    [clamp],
  );

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    saveCaptureButtonPosition(position.xPercent, position.yPercent);

    if (!movedRef.current && !disabled && !capturing) {
      onCapture();
    }
  }, [capturing, disabled, onCapture, position.xPercent, position.yPercent]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${position.xPercent}%`,
        top: `${position.yPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute z-20 touch-none w-16 h-16 rounded-full border-4 disabled:opacity-40 transition-colors ${
        isReady ? 'bg-emerald-500 border-emerald-300' : 'bg-white/20 border-white/40'
      } ${capturing ? 'scale-95' : ''}`}
    />
  );
}
