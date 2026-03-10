import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

const DEVICES = [
  { id: 'NOKIA-3310', year: 2004, name: 'NOKIA 3310', era: 'Early Mobile', specs: [['Display', '84×48'], ['Network', '2G GSM'], ['Battery', '900mAh']] },
  { id: 'IPOD-NANO', year: 2010, name: 'IPOD NANO', era: 'Portable Music', specs: [['Storage', '16GB'], ['Input', 'Touch'], ['Focus', 'Music']] },
  { id: 'MI-BAND', year: 2018, name: 'MI BAND', era: 'Wearables', specs: [['Display', 'AMOLED'], ['Sensors', 'HR+Steps'], ['Battery', '20 days']] },
  { id: 'WACOM-TABLET', year: 2021, name: 'WACOM TABLET', era: 'Creative Tools', specs: [['Input', 'Pen'], ['Use', 'Drawing'], ['Connect', 'USB/BT']] }
];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function createDeviceMesh(id, darkMode) {
  const colorMap = {
    'NOKIA-3310': darkMode ? '#8ba0bf' : '#34435a',
    'IPOD-NANO': darkMode ? '#2d3f62' : '#1e2a41',
    'MI-BAND': darkMode ? '#86b3d1' : '#1f4f6b',
    'WACOM-TABLET': darkMode ? '#7f86cf' : '#454fb0'
  };

  const mat = new THREE.MeshStandardMaterial({ color: colorMap[id], roughness: 0.42, metalness: 0.24 });
  if (id === 'NOKIA-3310') return new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.5, 0.28), mat);
  if (id === 'IPOD-NANO') return new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.3), mat);
  if (id === 'MI-BAND') return new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 24, 80), mat);
  return new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.1), mat);
}

function useBackgroundThree(canvasRef, progress, darkMode) {
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

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

    const timelineLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 16, 16),
      new THREE.MeshStandardMaterial({ color: darkMode ? '#3d4f79' : '#8597bd' })
    );
    timelineLine.position.set(0, 6.2, -1.4);
    scene.add(timelineLine);

    const rail = new THREE.Group();
    const spacing = 4.2;
    const deviceMeshes = [];

    DEVICES.forEach((item, idx) => {
      const mesh = createDeviceMesh(item.id, darkMode);
      mesh.position.y = idx * spacing;
      rail.add(mesh);
      deviceMeshes.push(mesh);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({ color: darkMode ? '#7084b5' : '#64748b' })
      );
      dot.position.set(0, idx * spacing, -1.4);
      rail.add(dot);
    });
    scene.add(rail);

    const cursor = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.022, 12, 32),
      new THREE.MeshStandardMaterial({ color: darkMode ? '#e5f0ff' : '#111827' })
    );
    cursor.rotation.x = Math.PI / 2;
    cursor.position.set(0, 0, -1.4);
    scene.add(cursor);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    onResize();
    window.addEventListener('resize', onResize);

    const progressRef = { current: progress };
    canvas.__updateProgress = (v) => (progressRef.current = v);

    let raf = 0;
    const tick = () => {
      const p = progressRef.current;
      rail.position.y = -p * spacing;
      cursor.position.y = p * spacing;

      deviceMeshes.forEach((mesh, idx) => {
        const local = idx - p;
        const nearCenter = 1 - clamp(Math.abs(local), 0, 1);

        if (local >= 0) {
          const align = smoothstep(0, 1, nearCenter);
          mesh.rotation.x = -Math.PI / 2 * (1 - align);
        } else {
          const back = smoothstep(0, 1, clamp(-local, 0, 1));
          mesh.rotation.x = Math.PI * 0.2 * back;
        }

        mesh.rotation.y = Math.PI * 0.06 * local;
        mesh.position.z = -Math.abs(local) * 0.25;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [canvasRef, darkMode]);

  useEffect(() => {
    if (canvasRef.current?.__updateProgress) canvasRef.current.__updateProgress(progress);
  }, [canvasRef, progress]);
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const canvasRef = useRef(null);

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

  const activeIndex = Math.max(0, Math.min(DEVICES.length - 1, Math.round(progress)));
  const current = useMemo(() => DEVICES[activeIndex], [activeIndex]);

  useEffect(() => {
    setCardAnimKey((k) => k + 1);
  }, [activeIndex]);

  return React.createElement(
    'div',
    { className: 'page' },
    React.createElement('canvas', { ref: canvasRef, className: 'bg-canvas' }),

    React.createElement(
      'button',
      { className: 'mode-btn overlay', onClick: () => setDarkMode((v) => !v) },
      darkMode ? 'LIGHT' : 'DARK'
    ),

    React.createElement(
      'main',
      { className: 'layout overlay' },
      React.createElement(
        'section',
        { className: 'spec-left' },
        React.createElement('p', { className: 'small-caption' }, `${current.year} · ${current.era}`),
        React.createElement('h1', { key: `title-${cardAnimKey}`, className: 'model-title fade-card' }, current.name),
        React.createElement(
          'div',
          { key: `params-${cardAnimKey}`, className: 'param-grid fade-card' },
          current.specs.map(([k, v]) =>
            React.createElement('div', { className: 'param-row', key: k },
              React.createElement('span', { className: 'param-k' }, k),
              React.createElement('span', { className: 'param-v' }, v)
            )
          )
        )
      ),

      React.createElement(
        'section',
        { className: 'player-right card-xl', key: `player-${cardAnimKey}` },
        React.createElement('div', { className: 'small-caption' }, 'NOW PLAYING'),
        React.createElement('div', { className: 'player-wrap' },
          React.createElement('img', { className: 'cover-lg', src: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80' }),
          React.createElement('div', null,
            React.createElement('div', { className: 'track-title' }, 'Memory Lane.fm'),
            React.createElement('div', { className: 'track-sub' }, `${current.name} era mix`),
            React.createElement('div', { className: 'bar' }, React.createElement('div', { className: 'bar-fill' })),
            React.createElement('div', { className: 'times' }, React.createElement('span', null, '01:26'), React.createElement('span', null, '03:58'))
          )
        )
      )
    ),

    React.createElement('section', { className: 'scroll-track' }, DEVICES.map((item, idx) =>
      React.createElement('section', { key: item.id, id: `scene-${idx}`, className: 'scroll-section' },
        React.createElement('div', { className: 'scroll-year' }, `${item.year}`)
      )
    ))
  );
}

createRoot(document.getElementById('root')).render(React.createElement(App));
