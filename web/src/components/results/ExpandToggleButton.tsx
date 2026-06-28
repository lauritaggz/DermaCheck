import type { RefObject } from 'react';
import { scrollToStableViewAfterExpand } from '../../utils/scrollAnchor';

interface Props {
  expanded: boolean;
  onToggle: () => void;
  className?: string;
  id?: string;
  /** Ancla que debe quedar visible al expandir (evita saltos de scroll). */
  scrollAnchorRef?: RefObject<HTMLElement | null>;
}

export function ExpandToggleButton({
  expanded,
  onToggle,
  className = '',
  id,
  scrollAnchorRef,
}: Props) {
  function handleClick() {
    const willExpand = !expanded;
    onToggle();
    if (willExpand && scrollAnchorRef?.current) {
      scrollToStableViewAfterExpand(scrollAnchorRef.current);
    }
  }

  return (
    <button
      type="button"
      id={id}
      onClick={handleClick}
      aria-expanded={expanded}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 active:scale-95 transition-all duration-200 ${className}`}
    >
      <span
        key={expanded ? 'less' : 'more'}
        className="animate-[fadeIn_0.2s_ease-out]"
      >
        {expanded ? 'Ver menos' : 'Ver más'}
      </span>
      <svg
        className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-out ${
          expanded ? 'rotate-180' : 'rotate-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
