import type { DeviceItem } from '../types/device';

type Props = { device: DeviceItem };

export function SpecPanel({ device }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Specs</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">{device.brand} {device.name}</h2>
      <p className="mt-1 text-sm text-slate-600">{device.tagline}</p>
      <div className="mt-4 space-y-2">
        {device.specs.map((spec) => (
          <div key={spec.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-sm text-slate-500">{spec.label}</span>
            <span className="text-sm font-medium text-slate-800">{spec.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
