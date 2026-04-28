interface Props {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export function CheckboxRow({ checked, onToggle, label }: Props) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-5 h-5 text-primary bg-white border-2 border-border rounded cursor-pointer
                     focus:ring-2 focus:ring-primary focus:ring-offset-2
                     checked:bg-primary checked:border-primary"
        />
      </div>
      <span className="text-sm text-textSecondary group-hover:text-text transition-colors">
        {label}
      </span>
    </label>
  );
}
