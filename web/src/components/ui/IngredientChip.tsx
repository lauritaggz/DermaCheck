interface Props {
  label: string;
}

export function IngredientChip({ label }: Props) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
      {label}
    </span>
  );
}
