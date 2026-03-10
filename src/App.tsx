import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';

type Device = {
  id: string;
  year: number;
  name: string;
  era: string;
  specs: [string, string][];
};

type ProgressCanvas = HTMLCanvasElement & {
  __updateProgress?: (value: number) => void;
};

const DEVICES: Device[] = [
  { id: 'NOKIA-3310', year: 2004, name: 'NOKIA 3310', era: 'Early Mobile', specs: [['Display', '84×48'], ['Network', '2G GSM'], ['Battery', '900mAh']] },
  { id: 'IPOD-NANO', year: 2010, name: 'IPOD NANO', era: 'Portable Music', specs: [['Storage', '16GB'], ['Input', 'Touch'], ['Focus', 'Music']] },
  { id: 'MI-BAND', year: 2018, name: 'MI BAND', era: 'Wearables', specs: [['Display', 'AMOLED'], ['Sensors', 'HR+Steps'], ['Battery', '20 days']] },
  { id: 'WACOM-TABLET', year: 2021, name: 'WACOM TABLET', era: 'Creative Tools', specs: [['Input', 'Pen'], ['Use', 'Drawing'], ['Connect', 'USB/BT']] }
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function createDeviceMesh(id: string, darkMode: boolean) {
  const colorMap: Record<string, string> = {
    'NOKIA-3310': darkMode ? '#8ba0bf' : '#34435a',
    'IPOD-NANO': darkMode ? '#2d3f62' : '#1e2a41',
    'MI-BAND': darkMode ? '#86b3d1' : '#1f4f6b',
    'WACOM-TABLET': darkMode ? '#7f86cf' : '#454fb0'
  };

  const material = new THREE.MeshStandardMaterial({
    color: colorMap[id],
    roughness: 0.42,
    metalness: 0.24
  });

  if (id === 'NOKIA-3310') return new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.5, 0.28), material);
  if (id === 'IPOD-NANO') return new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.3), material);
  if (id === 'MI-BAND') return new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 24, 80), material);
  return new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.1), material);
}

function useBackgroundThree(canvasRef: RefObject<ProgressCanvas | null>, progress: number, darkMode: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.5, 6.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, darkMode ? 0.75 : 0.9));

    const key = new THREE.DirectionalLight('#c2d9ff', 1.25);
    key.position.set(4, 6, 3);
    scene.add(key);

    const rail = new THREE.Group();
    const spacing = 4.2;
    const deviceMeshes: any[] = [];

    DEVICES.forEach((item, idx) => {
      const mesh = createDeviceMesh(item.id, darkMode);
      mesh.position.y = idx * spacing;
      rail.add(mesh);
      deviceMeshes.push(mesh);
    });
    scene.add(rail);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };

    onResize();
    window.addEventListener('resize', onResize);

    const progressRef = { current: progress };
    canvas.__updateProgress = (value: number) => {
      progressRef.current = value;
    };

    let raf = 0;
    const tick = () => {
      const currentProgress = progressRef.current;
      rail.position.y = -currentProgress * spacing;

      deviceMeshes.forEach((mesh, idx) => {
        const local = idx - currentProgress;
        const nearCenter = 1 - clamp(Math.abs(local), 0, 1);

        if (local >= 0) {
          const align = smoothstep(0, 1, nearCenter);
          mesh.rotation.x = -Math.PI / 2 * (1 - align);
        } else {
          const back = smoothstep(0, 1, clamp(-local, 0, 1));
          mesh.rotation.x = Math.PI * 0.2 * back;
        }

        mesh.rotation.y = -Math.PI * 0.06 * local;
        mesh.position.z = -Math.abs(local) * 0.25;
      });

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      canvas.__updateProgress = undefined;
      renderer.dispose();
    };
  }, [canvasRef, darkMode, progress]);

  useEffect(() => {
    canvasRef.current?.__updateProgress?.(progress);
  }, [canvasRef, progress]);
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const canvasRef = useRef<ProgressCanvas | null>(null);

  useBackgroundThree(canvasRef, progress, darkMode);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      setProgress(ratio * (DEVICES.length - 1));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeIndex = clamp(Math.round(progress), 0, DEVICES.length - 1);
  const current = useMemo(() => DEVICES[activeIndex], [activeIndex]);

  useEffect(() => {
    setCardAnimKey((value) => value + 1);
  }, [activeIndex]);

  const phase = progress - activeIndex;
  const transitionAmount = Math.min(Math.abs(phase), 1);
  const leftMotionY = -phase * 36;
  const leftMotionGlow = 1 - transitionAmount * 0.55;
  const summary = `${current.year} · ${current.era} · ${current.specs.map(([k, v]) => `${k} ${v}`).join(' / ')}`;

  const jumpToDevice = (idx: number) => {
    document.getElementById(`scene-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page">
      <canvas ref={canvasRef} className="bg-canvas" />

      <button className="mode-btn overlay" onClick={() => setDarkMode((value) => !value)}>
        {darkMode ? 'LIGHT' : 'DARK'}
      </button>

      <main className="layout overlay">
        <section className="spec-left" style={{ transform: `translateY(${leftMotionY}px)`, opacity: leftMotionGlow }}>
          <h1 key={`title-${cardAnimKey}`} className="model-title fade-card">
            {current.name}
          </h1>
          <p key={`summary-${cardAnimKey}`} className="model-summary fade-card">
            {summary}
          </p>
        </section>

        <section className="timeline-rail-wrap" aria-label="Device timeline">
          {DEVICES.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => jumpToDevice(idx)}
              className={`timeline-tick ${idx === activeIndex ? 'active' : ''}`}
              style={{ top: `${(idx / (DEVICES.length - 1)) * 100}%` }}
              aria-current={idx === activeIndex}
            >
              <span className="tick-mark" />
              <span className="tick-label">{item.year}</span>
            </button>
          ))}
        </section>

        <section className="player-right card-xl" key={`player-${cardAnimKey}`}>
          <div className="small-caption">NOW PLAYING</div>
          <div className="player-wrap">
            <img
              className="cover-lg"
              src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80"
              alt={`${current.name} era artwork`}
            />
            <div>
              <div className="track-title">Memory Lane.fm</div>
              <div className="track-sub">{current.name} era mix</div>
              <div className="bar">
                <div className="bar-fill" />
              </div>
              <div className="times">
                <span>01:26</span>
                <span>03:58</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="scroll-track">
        {DEVICES.map((item, idx) => (
          <section key={item.id} id={`scene-${idx}`} className="scroll-section">
            <div className="scroll-year">{item.year}</div>
          </section>
        ))}
      </section>
    </div>
  );
}
