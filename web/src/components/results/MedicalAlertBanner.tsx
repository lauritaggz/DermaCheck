import { ShieldIcon } from '../Icons';

interface Props {
  warnings: string[];
}

export function MedicalAlertBanner({ warnings }: Props) {
  return (
    <div className="rounded-2xl p-5 border-2 border-red-300 bg-red-50" role="alert">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
          <ShieldIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-red-800 text-sm sm:text-base mb-2">
            Se recomienda evaluación médica presencial
          </h3>
          {warnings.map((adv, idx) => (
            <p key={idx} className="text-sm text-red-700 leading-relaxed mb-1">
              {adv}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
