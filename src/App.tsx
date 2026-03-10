import { TimelineNav } from './components/TimelineNav';
import { DeviceShowcase } from './components/DeviceShowcase';
import { SpecPanel } from './components/SpecPanel';
import { MusicPlayerCard } from './components/MusicPlayerCard';
import { useDeviceSelection } from './hooks/useDeviceSelection';
import { useDeviceInteraction } from './hooks/useDeviceInteraction';

export default function App() {
  const { devices, selected, selectedId, setSelectedId } = useDeviceSelection();
  const { onDeviceTap, onModelReady } = useDeviceInteraction();

  return (
    <div className="min-h-screen bg-slate-100 px-5 py-6 md:px-8 lg:px-12">
      <header className="mx-auto mb-6 max-w-7xl">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Personal Device Museum</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          My Digital Devices Timeline
        </h1>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_340px]">
        <TimelineNav items={devices} selectedId={selectedId} onSelect={setSelectedId} />

        <DeviceShowcase device={selected} onTapDevice={onDeviceTap} onModelReady={onModelReady} />

        <div className="space-y-5">
          <SpecPanel device={selected} />
          <MusicPlayerCard device={selected} />
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
            <p className="font-medium text-slate-700">Future-ready Architecture</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>可替换为真实 glTF / GLB 模型加载</li>
              <li>可扩展设备按钮/旋钮/屏幕交互逻辑</li>
              <li>可接入设备故事、图片与音频素材</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
