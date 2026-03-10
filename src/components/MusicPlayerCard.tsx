import type { DeviceItem } from '../types/device';

type Props = { device: DeviceItem };

export function MusicPlayerCard({ device }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Now Playing</p>
      <div className="mt-4 flex gap-4">
        <img src={device.albumCover} alt="album cover" className="h-20 w-20 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">Memory Lane.fm</p>
          <p className="truncate text-sm text-slate-500">{device.name} era mix</p>
          <div className="mt-3 h-1.5 rounded-full bg-slate-200">
            <div className="h-full w-2/5 rounded-full bg-slate-900" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>01:12</span>
            <span>03:45</span>
          </div>
        </div>
      </div>
    </section>
  );
}
