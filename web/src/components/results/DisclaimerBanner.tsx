import { AlertIcon, ShieldIcon } from '../Icons';

interface Props {
  title: string;
  message: string;
  variant?: 'warning' | 'info' | 'cosmetic';
}

const VARIANTS = {
  warning: {
    container: 'bg-amber-50 border-amber-300',
    icon: 'bg-amber-500',
    title: 'text-amber-900',
    text: 'text-amber-800',
  },
  info: {
    container: 'bg-slate-50 border-slate-200',
    icon: 'bg-slate-500',
    title: 'text-slate-800',
    text: 'text-slate-600',
  },
  cosmetic: {
    container: 'bg-brand-50 border-brand-200',
    icon: 'bg-brand-500',
    title: 'text-brand-800',
    text: 'text-brand-700',
  },
};

export function DisclaimerBanner({ title, message, variant = 'warning' }: Props) {
  const styles = VARIANTS[variant];
  const Icon = variant === 'cosmetic' ? ShieldIcon : AlertIcon;

  return (
    <div className={`rounded-2xl p-5 border-l-4 border-l-current ${styles.container}`} role="note">
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`font-bold text-sm sm:text-base mb-1.5 ${styles.title}`}>{title}</h3>
          <p className={`text-sm leading-relaxed ${styles.text}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
