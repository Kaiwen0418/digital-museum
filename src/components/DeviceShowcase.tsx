import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox } from '@react-three/drei';
import type { DeviceItem, DeviceKind } from '../types/device';

type Props = {
  device: DeviceItem;
  onTapDevice?: () => void;
  onModelReady?: () => void;
};

function PlaceholderModel({ kind, onTap, onModelReady }: { kind: DeviceKind; onTap?: () => void; onModelReady?: () => void }) {
  const color = {
    phone: '#334155',
    music: '#111827',
    wearable: '#0f172a',
    tablet: '#1f2937'
  }[kind];

  return (
    <group onClick={onTap} onPointerOver={onModelReady}>
      {kind === 'phone' && (
        <Float speed={2} rotationIntensity={0.2}>
          <RoundedBox args={[1.3, 2.5, 0.28]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color={color} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.35, 0.16]}>
            <planeGeometry args={[0.95, 1.1]} />
            <meshStandardMaterial color="#0b1220" />
          </mesh>
        </Float>
      )}

      {kind === 'music' && (
        <Float speed={2} rotationIntensity={0.2}>
          <RoundedBox args={[1.6, 1.6, 0.32]} radius={0.16} smoothness={4}>
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, -0.2, 0.17]}>
            <ringGeometry args={[0.3, 0.58, 64]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </Float>
      )}

      {kind === 'wearable' && (
        <Float speed={2} rotationIntensity={0.2}>
          <mesh rotation={[0.2, 0.4, 0]}>
            <torusGeometry args={[0.95, 0.16, 24, 80]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
          <RoundedBox args={[0.8, 0.45, 0.2]} radius={0.08} position={[0, 0, 0.14]}>
            <meshStandardMaterial color="#0b1220" />
          </RoundedBox>
        </Float>
      )}

      {kind === 'tablet' && (
        <Float speed={2} rotationIntensity={0.15}>
          <RoundedBox args={[2.2, 1.5, 0.1]} radius={0.07} smoothness={4} rotation={[0.18, -0.5, 0]}>
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} />
          </RoundedBox>
        </Float>
      )}
    </group>
  );
}

export function DeviceShowcase({ device, onTapDevice, onModelReady }: Props) {
  return (
    <section className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-100 shadow-card">
      <div className="absolute left-5 top-5 z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">3D Showcase</p>
        <h3 className="text-lg font-semibold text-slate-900">{device.name}</h3>
      </div>
      <div className="h-[420px] w-full">
        <Canvas camera={{ position: [0, 0.5, 4], fov: 38 }}>
          <color attach="background" args={['#f8fafc']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[4, 6, 3]} intensity={1.2} />
          <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#a5f3fc" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
            <circleGeometry args={[5, 64]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <PlaceholderModel kind={device.kind} onTap={onTapDevice} onModelReady={onModelReady} />
          <OrbitControls enablePan={false} minDistance={2.6} maxDistance={7} />
        </Canvas>
      </div>
    </section>
  );
}
