import type { DeviceItem } from '../types/device';

type Props = {
  items: DeviceItem[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function TimelineNav({ items, selectedId, onSelect }: Props) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-card backdrop-blur">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">Timeline</p>
      <div className="space-y-2">
        {items.map((item) => {
          const active = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              <div className="text-xs opacity-70">{item.year} · {item.era}</div>
              <div className="text-sm font-medium">{item.name}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
