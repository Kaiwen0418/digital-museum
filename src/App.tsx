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

const TIMELINE_DETAIL_TICKS = [-0.8, -0.45, -0.2, 0.35, 0.7, 1.35, 1.7, 2.35, 2.7, 3.2, 3.5, 3.8];
const SNAP_THRESHOLD = 0.52;
const PREVIEW_RANGE = 0.86;
const SNAP_CAPTURE_RADIUS = 0.24;

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
  const targetProgressRef = useRef(progress);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.35, 5);

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
      mesh.scale.setScalar(1.22);
      mesh.position.y = -idx * spacing;
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

    canvas.__updateProgress = (value: number) => {
      targetProgressRef.current = value;
    };

    let raf = 0;
    let currentProgress = targetProgressRef.current;
    let velocity = 0;
    const tick = () => {
      const delta = targetProgressRef.current - currentProgress;
      velocity = velocity * 0.8 + delta * 0.022;
      velocity = clamp(velocity, -0.08, 0.08);
      currentProgress += velocity;

      if (Math.abs(delta) < 0.0015 && Math.abs(velocity) < 0.0015) {
        currentProgress = targetProgressRef.current;
        velocity = 0;
      }

      rail.position.y = currentProgress * spacing;

      deviceMeshes.forEach((mesh, idx) => {
        const local = currentProgress - idx;
        const nearCenter = 1 - clamp(Math.abs(local), 0, 1);

        if (local <= 0) {
          const align = smoothstep(0, 1, nearCenter);
          mesh.rotation.x = Math.PI / 2 * (1 - align);
        } else {
          const back = smoothstep(0, 1, clamp(local, 0, 1));
          mesh.rotation.x = -Math.PI * 0.2 * back;
        }

        mesh.rotation.y = Math.PI * 0.06 * local;
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
  }, [canvasRef, darkMode]);

  useEffect(() => {
    canvasRef.current?.__updateProgress?.(progress);
  }, [canvasRef, progress]);
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [centeredIndex, setCenteredIndex] = useState(0);
  const [isScrollInteracting, setIsScrollInteracting] = useState(false);
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const canvasRef = useRef<ProgressCanvas | null>(null);
  const scrollIdleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      setIsScrollInteracting(true);
      if (scrollIdleTimeoutRef.current !== null) {
        window.clearTimeout(scrollIdleTimeoutRef.current);
      }
      scrollIdleTimeoutRef.current = window.setTimeout(() => {
        setIsScrollInteracting(false);
        scrollIdleTimeoutRef.current = null;
      }, 140);

      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        setScrollProgress(ratio * (DEVICES.length - 1));
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollIdleTimeoutRef.current !== null) {
        window.clearTimeout(scrollIdleTimeoutRef.current);
      }
    };
  }, []);

  const nearestIndex = clamp(Math.round(scrollProgress), 0, DEVICES.length - 1);
  const isInSnapZone = Math.abs(scrollProgress - nearestIndex) <= SNAP_CAPTURE_RADIUS;

  useEffect(() => {
    if (isInSnapZone) {
      setCenteredIndex(nearestIndex);
    }
  }, [isInSnapZone, nearestIndex]);

  const current = useMemo(() => DEVICES[centeredIndex], [centeredIndex]);

  useEffect(() => {
    setCardAnimKey((value) => value + 1);
  }, [centeredIndex]);

  const phase = scrollProgress - centeredIndex;
  const previewPhase = clamp((phase / SNAP_THRESHOLD) * PREVIEW_RANGE, -PREVIEW_RANGE, PREVIEW_RANGE);
  const visualProgress = isScrollInteracting
    ? centeredIndex + previewPhase
    : isInSnapZone
      ? centeredIndex
      : scrollProgress;
  const transitionAmount = Math.min(Math.abs(phase) / SNAP_THRESHOLD, 1);
  const displayPhase = visualProgress - centeredIndex;
  const leftMotionY = -displayPhase * 36;
  const leftMotionGlow = 1 - Math.min(Math.abs(displayPhase) / PREVIEW_RANGE, 1) * 0.55;
  const playerMotionY = -displayPhase * 36;
  const playerMotionGlow = 1 - Math.min(Math.abs(displayPhase) / PREVIEW_RANGE, 1) * 0.55;
  const summary = `${current.year} · ${current.era} · ${current.specs.map(([k, v]) => `${k} ${v}`).join(' / ')}`;
  const timelineSpacing = 86;

  useBackgroundThree(canvasRef, visualProgress, darkMode);

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
        <section className="left-rail">
          <section className="spec-left" style={{ transform: `translateY(${leftMotionY}px)`, opacity: leftMotionGlow }}>
            <h1 key={`title-${cardAnimKey}`} className="model-title fade-card">
              {current.name}
            </h1>
            <p key={`summary-${cardAnimKey}`} className="model-summary fade-card">
              {summary}
            </p>
          </section>

          <section className="timeline-rail-wrap" aria-label="Device timeline">
            <span className="timeline-axis" />
            <span className="timeline-focus" />
            {TIMELINE_DETAIL_TICKS.map((tick, idx) => (
              <span
                key={`detail-${idx}`}
                className="timeline-detail-tick"
                style={{ top: `calc(50% + ${tick * timelineSpacing}px)` }}
                aria-hidden="true"
              />
            ))}
            {DEVICES.map((item, idx) => {
              const offset = idx - visualProgress;
              const distance = Math.min(Math.abs(offset), 2.4);
              const opacity = Math.max(0.18, 1 - distance * 0.34);
              const scale = Math.max(0.72, 1 - distance * 0.12);
              const rotate = offset * -18;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpToDevice(idx)}
                  className={`timeline-tick ${idx === centeredIndex ? 'active' : ''}`}
                  style={{
                    top: '50%',
                    transform: `translateY(${offset * timelineSpacing}px) rotateX(${rotate}deg) scale(${scale})`,
                    opacity
                  }}
                  aria-current={idx === centeredIndex}
                >
                  <span className="tick-year">{item.year}</span>
                  <span className="tick-mark" />
                </button>
              );
            })}
          </section>
        </section>

      </main>

      <section
        className="player-right card-xl player-layer"
        key={`player-${cardAnimKey}`}
        style={{ transform: `translateY(calc(-50% + ${playerMotionY}px))`, opacity: playerMotionGlow }}
      >
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

      <section className="scroll-track">
        {DEVICES.map((item, idx) => (
          <section key={item.id} id={`scene-${idx}`} className="scroll-section" aria-hidden="true" />
        ))}
      </section>
    </div>
  );
}
