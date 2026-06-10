interface Props {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export function CheckboxRow({ checked, onToggle, label }: Props) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            checked
              ? 'bg-hero-gradient border-transparent'
              : 'border-slate-300 bg-white group-hover:border-brand-400'
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-textSecondary leading-relaxed group-hover:text-brand-800 transition-colors">
        {label}
      </span>
    </label>
  );
}
