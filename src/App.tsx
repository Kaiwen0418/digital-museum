import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

type ModelConfig = {
  path: string;
  scale: number;
  lift: number;
  yaw?: number;
  pitch?: number;
  offsetX?: number;
  brightness?: number;
  emissiveIntensity?: number;
  roughnessScale?: number;
  metalnessScale?: number;
};

const DEVICES: Device[] = [
  { id: 'MI-BAND', year: 2008, name: 'CASIO F-91W', era: 'Digital Watches', specs: [['Display', 'LCD'], ['Functions', 'Alarm + Stopwatch'], ['Battery', 'Long Life Quartz']] },
  { id: 'SONY-WALKMAN', year: 2009, name: 'SONY WALKMAN', era: 'Portable Audio', specs: [['Format', 'Cassette'], ['Focus', 'Record + Playback'], ['Build', 'Field Recorder']] },
  { id: 'NOKIA-3310', year: 2010, name: 'NOKIA 3310', era: 'Early Mobile', specs: [['Display', '84×48'], ['Network', '2G GSM'], ['Battery', '900mAh']] },
  { id: 'IPOD-NANO', year: 2012, name: 'IPOD NANO', era: 'Portable Music', specs: [['Storage', '16GB'], ['Input', 'Touch'], ['Focus', 'Music']] },
  { id: 'SAMSUNG-GALAXY', year: 2014, name: 'SAMSUNG GALAXY MINI II', era: 'Android Phones', specs: [['Display', '3.27-inch TFT'], ['System', 'Android'], ['Focus', 'Compact Smartphone']] },
  { id: 'WACOM-TABLET', year: 2016, name: 'WACOM TABLET', era: 'Creative Tools', specs: [['Input', 'Pen'], ['Use', 'Drawing'], ['Connect', 'USB/BT']] },
  { id: 'MACBOOK-M4', year: 2025, name: 'MACBOOK M4', era: 'Personal Computing', specs: [['Chip', 'Apple M4'], ['Form', 'Laptop'], ['Focus', 'Work + Create']] }
];

const TIMELINE_DETAIL_TICKS = [-0.8, -0.45, -0.2, 0.35, 0.7, 1.35, 1.7, 2.35, 2.7, 3.2, 3.5, 3.8];
const SNAP_THRESHOLD = 1.92;
const PREVIEW_RANGE = 0.86;
const SNAP_CAPTURE_RADIUS = 0.54;
const MODEL_CONFIGS: Partial<Record<Device['id'], ModelConfig>> = {
  'MI-BAND': { path: 'models/casio_f-91w/scene.gltf', scale: 1.7, lift: 0.4, yaw: Math.PI * 1.22, pitch: Math.PI * 0.5 },
  'NOKIA-3310': { path: 'models/nokia_3310/scene.gltf', scale: 2.55, lift: 0.04, yaw: Math.PI * 0.14 },
  'SONY-WALKMAN': { path: 'models/sony_walkman_professional_wm-d6c/scene.gltf', scale: 3.2, lift: 0.02, yaw: Math.PI * 0.52, offsetX: -0.98 },
  'IPOD-NANO': { path: 'models/ipod/scene.gltf', scale: 2.85, lift: 0.02, yaw: Math.PI * 0.42, pitch: Math.PI * 0.5 },
  'SAMSUNG-GALAXY': {
    path: 'models/samsung_galaxy_s4/scene.gltf',
    scale: 3.25,
    lift: 0.03,
    yaw: Math.PI * 0.28
  },
  'WACOM-TABLET': { path: 'models/wacom_intuos_ctl-4100k-n/scene.gltf', scale: 3.9, lift: 0.02, yaw: Math.PI * 0.44 },
  'MACBOOK-M4': { path: 'models/macbook_m4/scene.gltf', scale: 3.5, lift: 0.2, yaw: Math.PI * 0.8, pitch: Math.PI * 0.2 }
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function createDeviceMesh(id: string, darkMode: boolean) {
  const colorMap: Record<string, string> = {
    'MI-BAND': darkMode ? '#86b3d1' : '#1f4f6b',
    'NOKIA-3310': darkMode ? '#8ba0bf' : '#34435a',
    'SONY-WALKMAN': darkMode ? '#8f96a4' : '#505866',
    'IPOD-NANO': darkMode ? '#2d3f62' : '#1e2a41',
    'SAMSUNG-GALAXY': darkMode ? '#a8b4d0' : '#68748f',
    'WACOM-TABLET': darkMode ? '#7f86cf' : '#454fb0',
    'MACBOOK-M4': darkMode ? '#9aa5bf' : '#6d7792'
  };

  const material = new THREE.MeshStandardMaterial({
    color: colorMap[id],
    roughness: 0.42,
    metalness: 0.24
  });

  if (id === 'NOKIA-3310') return new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.5, 0.28), material);
  if (id === 'SONY-WALKMAN') return new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.25, 0.55), material);
  if (id === 'IPOD-NANO') return new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.3), material);
  if (id === 'MI-BAND') return new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 24, 80), material);
  if (id === 'SAMSUNG-GALAXY') return new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.2, 0.28), material);
  return new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.1), material);
}

function createDeviceObject(id: string, darkMode: boolean) {
  const group = new THREE.Group();
  const mesh = createDeviceMesh(id, darkMode);
  mesh.scale.setScalar(1.22);
  group.add(mesh);
  return group;
}

function tuneModelMaterials(root: any, darkMode: boolean, modelConfig?: ModelConfig) {
  const brightness = modelConfig?.brightness ?? (darkMode ? 1.18 : 1.12);
  const roughnessScale = modelConfig?.roughnessScale ?? 0.88;
  const metalnessScale = modelConfig?.metalnessScale ?? 0.75;
  const emissiveIntensity = modelConfig?.emissiveIntensity;

  root.traverse((child: any) => {
    if (!child.isMesh || !child.material) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material: any) => {
      if (material.color) {
        material.color.multiplyScalar(brightness);
      }
      if (typeof material.roughness === 'number') {
        material.roughness = Math.max(0.18, material.roughness * roughnessScale);
      }
      if (typeof material.metalness === 'number') {
        material.metalness = Math.min(0.22, material.metalness * metalnessScale);
      }
      if (typeof material.emissiveIntensity === 'number' && typeof emissiveIntensity === 'number') {
        material.emissiveIntensity = emissiveIntensity;
      }
      material.needsUpdate = true;
    });
  });
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
    renderer.shadowMap.enabled = !darkMode;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.AmbientLight(0xffffff, darkMode ? 0.75 : 0.9));

    const key = new THREE.DirectionalLight('#c2d9ff', 1.45);
    key.position.set(4, 2, 3);
    key.castShadow = !darkMode;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0008;
    scene.add(key);

    const fill = new THREE.DirectionalLight('#ffffff', darkMode ? 0.6 : 0.42);
    fill.position.set(-5, 2, 4);
    scene.add(fill);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 14),
      new THREE.ShadowMaterial({ color: '#94a3b8', opacity: darkMode ? 0 : 0.2 })
    );
    shadowPlane.position.set(0, 0.85, -1.8);
    shadowPlane.receiveShadow = !darkMode;
    scene.add(shadowPlane);

    const rail = new THREE.Group();
    const spacing = 4.2;
    const deviceMeshes: any[] = [];
    const loader = new GLTFLoader();
    let isDisposed = false;

    DEVICES.forEach((item, idx) => {
      const placeholder = createDeviceObject(item.id, darkMode);
      placeholder.position.y = -idx * spacing;
      placeholder.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = !darkMode;
          child.receiveShadow = !darkMode;
        }
      });
      rail.add(placeholder);
      deviceMeshes.push(placeholder);

      const modelConfig = MODEL_CONFIGS[item.id];
      if (!modelConfig) return;

      loader.load(
        `${import.meta.env.BASE_URL}${modelConfig.path}`,
        (gltf: any) => {
          if (isDisposed) return;

          const modelGroup = new THREE.Group();
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();

          box.getSize(size);
          box.getCenter(center);

          model.position.sub(center);

          tuneModelMaterials(model, darkMode, modelConfig);

          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const normalizedScale = modelConfig.scale / maxDim;
          model.scale.setScalar(normalizedScale);

          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledSize = new THREE.Vector3();
          const scaledCenter = new THREE.Vector3();
          scaledBox.getSize(scaledSize);
          scaledBox.getCenter(scaledCenter);

          model.position.x -= scaledCenter.x;
          model.position.y -= scaledCenter.y - scaledSize.y * modelConfig.lift;
          model.position.z -= scaledCenter.z;
          model.position.x += modelConfig.offsetX ?? 0;
          model.rotation.y = modelConfig.yaw ?? 0;
          model.rotation.x = modelConfig.pitch ?? 0;
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = !darkMode;
              child.receiveShadow = !darkMode;
            }
          });

          modelGroup.add(model);
          modelGroup.position.y = -idx * spacing;

          rail.remove(placeholder);
          rail.add(modelGroup);
          deviceMeshes[idx] = modelGroup;
        },
        undefined,
        () => {
          // Keep placeholder geometry if the external asset fails to load.
        }
      );
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
        const shadowActive = !darkMode && Math.abs(local) < 0.55;

        mesh.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = shadowActive;
            child.receiveShadow = shadowActive;
          }
        });

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
      isDisposed = true;
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
  const [darkMode, setDarkMode] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [museumReveal, setMuseumReveal] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [centeredIndex, setCenteredIndex] = useState(0);
  const [isScrollInteracting, setIsScrollInteracting] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const canvasRef = useRef<ProgressCanvas | null>(null);
  const scrollIdleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
        const heroHeight = viewportHeight;
        const reveal = clamp(window.scrollY / (heroHeight * 0.92), 0, 1);
        const museumScroll = Math.max(window.scrollY - heroHeight, 0);
        const museumMax = Math.max(document.documentElement.scrollHeight - window.innerHeight - heroHeight, 1);
        const ratio = museumMax > 0 ? museumScroll / museumMax : 0;

        setMuseumReveal(reveal);
        setScrollProgress(clamp(ratio, 0, 1) * (DEVICES.length - 1));
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
  }, [viewportHeight]);

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
  const targetVisualProgress = isScrollInteracting
    ? centeredIndex + previewPhase
    : isInSnapZone
      ? centeredIndex
      : scrollProgress;

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      setDisplayedProgress((currentValue) => {
        const nextValue = currentValue + (targetVisualProgress - currentValue) * 0.16;
        return Math.abs(targetVisualProgress - nextValue) < 0.0015 ? targetVisualProgress : nextValue;
      });
      raf = window.requestAnimationFrame(tick);
    };

    tick();

    return () => window.cancelAnimationFrame(raf);
  }, [targetVisualProgress]);

  const displayPhase = displayedProgress - centeredIndex;
  const leftMotionY = -displayPhase * 36;
  const leftMotionGlow = 1 - Math.min(Math.abs(displayPhase) / PREVIEW_RANGE, 1) * 0.55;
  const playerMotionY = -displayPhase * 36;
  const playerMotionGlow = 1 - Math.min(Math.abs(displayPhase) / PREVIEW_RANGE, 1) * 0.55;
  const summary = `${current.year} · ${current.era} · ${current.specs.map(([k, v]) => `${k} ${v}`).join(' / ')}`;
  const timelineSpacing = 86;
  const museumOpacity = smoothstep(0.18, 0.88, museumReveal);
  const heroOpacity = 1 - smoothstep(0.08, 0.72, museumReveal);

  useBackgroundThree(canvasRef, displayedProgress, darkMode);

  const jumpToDevice = (idx: number) => {
    document.getElementById(`scene-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const enterMuseum = () => {
    window.scrollTo({ top: viewportHeight, behavior: 'smooth' });
  };

  return (
    <div className="page">
      <canvas ref={canvasRef} className="bg-canvas" style={{ opacity: museumOpacity }} />

      <section className="hero-page" style={{ opacity: heroOpacity }}>
        <div className="hero-inner">
          <div className="hero-meta">
            <span className="hero-kicker">Personal Device Museum</span>
            <span className="hero-stamp">BBS ONLINE</span>
          </div>
          <div className="hero-frame">
            <div className="hero-ornament" aria-hidden="true" />
            <p className="hero-yearline">SYSOP LOG / 2008-2025 / DEVICE ARCHIVE</p>
            <h1 className="hero-title">WELCOME TO THE PERSONAL DEVICE MUSEUM BBS</h1>
            <p className="hero-copy">
              Dial into a scrolling archive of handsets, cassette machines, watches, tablets, and portable computers.
              Each page records a device that once felt immediate, modern, and necessary.
            </p>
            <div className="hero-notes">
              <span className="hero-note">[PHONE]</span>
              <span className="hero-note">[AUDIO]</span>
              <span className="hero-note">[WATCH]</span>
              <span className="hero-note">[COMPUTER]</span>
            </div>
            <div className="hero-console" aria-hidden="true">
              <span>&gt; guest login accepted</span>
              <span>&gt; archive nodes: 07</span>
              <span>&gt; scroll to enter timeline</span>
            </div>
            <button type="button" className="hero-cta" onClick={enterMuseum}>
              ENTER TIMELINE
            </button>
          </div>
        </div>
      </section>

      <button
        className="mode-btn overlay"
        style={{ opacity: museumOpacity, pointerEvents: museumOpacity > 0.4 ? 'auto' : 'none' }}
        onClick={() => setDarkMode((value) => !value)}
      >
        {darkMode ? 'LIGHT' : 'DARK'}
      </button>

      <main className="layout overlay" style={{ opacity: museumOpacity, pointerEvents: museumOpacity > 0.4 ? 'auto' : 'none' }}>
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
              const offset = idx - displayedProgress;
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
        style={{
          transform: `translateY(calc(-50% + ${playerMotionY}px))`,
          opacity: playerMotionGlow * museumOpacity,
          pointerEvents: museumOpacity > 0.4 ? 'auto' : 'none'
        }}
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
        <section className="hero-spacer" aria-hidden="true" />
        {DEVICES.map((item, idx) => (
          <section key={item.id} id={`scene-${idx}`} className="scroll-section" aria-hidden="true" />
        ))}
      </section>
    </div>
  );
}
