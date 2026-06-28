const DEFAULT_OFFSET = 24;
const EXPAND_SCROLL_RETRY_MS = 320;

/** Mantiene un bloque visible al expandir contenido (evita saltos de scroll). */
export function scrollToStableView(
  element: HTMLElement | null,
  offsetTop = DEFAULT_OFFSET,
  behavior: ScrollBehavior = 'smooth',
) {
  if (!element) return;

  const run = () => {
    const top = element.getBoundingClientRect().top + window.scrollY - offsetTop;
    window.scrollTo({ top: Math.max(0, top), behavior });
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
}

export function scrollToStableViewAfterExpand(
  element: HTMLElement | null,
  offsetTop = DEFAULT_OFFSET,
) {
  scrollToStableView(element, offsetTop, 'smooth');
  window.setTimeout(() => {
    scrollToStableView(element, offsetTop, 'smooth');
  }, EXPAND_SCROLL_RETRY_MS);
}
