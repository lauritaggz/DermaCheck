export type SeverityLevel = 'ninguna' | 'leve' | 'moderada' | 'severa';

const SEVERITY_GRADIENT: Record<SeverityLevel, string> = {
  ninguna: 'from-severity-none to-emerald-600',
  leve: 'from-severity-low to-cyan-600',
  moderada: 'from-severity-moderate to-amber-600',
  severa: 'from-severity-high to-red-600',
};

const SEVERITY_BG: Record<SeverityLevel, string> = {
  ninguna: 'bg-severity-none/10 border-severity-none/30 text-emerald-900',
  leve: 'bg-severity-low/10 border-severity-low/30 text-cyan-900',
  moderada: 'bg-severity-moderate/10 border-severity-moderate/30 text-amber-900',
  severa: 'bg-severity-high/10 border-severity-high/30 text-red-900',
};

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  ninguna: 'Sin hallazgos',
  leve: 'Leve',
  moderada: 'Moderada',
  severa: 'Severa',
};

const CONDITION_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-400/40 text-blue-900',
  amber: 'bg-amber-500/10 border-amber-400/40 text-amber-900',
  green: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-900',
  red: 'bg-red-500/10 border-red-400/40 text-red-900',
  purple: 'bg-violet-500/10 border-violet-400/40 text-violet-900',
};

const CONDITION_DOT: Record<string, string> = {
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  purple: 'bg-violet-500',
};

export function getSeverityGradient(severidad: string): string {
  return SEVERITY_GRADIENT[severidad as SeverityLevel] ?? SEVERITY_GRADIENT.leve;
}

export function getSeverityBg(severidad: string): string {
  return SEVERITY_BG[severidad as SeverityLevel] ?? SEVERITY_BG.leve;
}

export function getSeverityLabel(severidad: string): string {
  return SEVERITY_LABEL[severidad as SeverityLevel] ?? severidad;
}

export function getConditionColorClasses(color: string): string {
  return CONDITION_COLORS[color] ?? CONDITION_COLORS.blue;
}

export function getConditionDotClass(color: string): string {
  return CONDITION_DOT[color] ?? CONDITION_DOT.blue;
}
