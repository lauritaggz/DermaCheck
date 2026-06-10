import { ScanIcon } from '../Icons';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  light?: boolean;
}

const SIZES = {
  sm: { icon: 'w-8 h-8', iconInner: 'w-4 h-4', title: 'text-lg', sub: 'text-xs' },
  md: { icon: 'w-11 h-11', iconInner: 'w-6 h-6', title: 'text-2xl', sub: 'text-sm' },
  lg: { icon: 'w-14 h-14', iconInner: 'w-7 h-7', title: 'text-3xl sm:text-4xl', sub: 'text-base' },
};

export function BrandLogo({ size = 'md', subtitle, light = false }: Props) {
  const s = SIZES[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.icon} rounded-2xl bg-hero-gradient flex items-center justify-center shadow-glow flex-shrink-0`}
      >
        <ScanIcon className={`${s.iconInner} text-white`} />
      </div>
      <div>
        <h1 className={`${s.title} font-bold tracking-tight ${light ? 'text-white' : 'text-brand-gradient'}`}>
          DermaCheck
        </h1>
        {subtitle && (
          <p className={`${s.sub} ${light ? 'text-white/80' : 'text-textSecondary'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
