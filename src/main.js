import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

const DEVICES = [
  { id: 'nokia', year: 2004, name: 'Nokia 3310', era: 'Early Mobile', specs: [['Display', '84×48'], ['Network', '2G'], ['Battery', '900mAh']] },
  { id: 'ipod', year: 2010, name: 'iPod nano', era: 'Portable Music', specs: [['Storage', '16GB'], ['Input', 'Touch'], ['Focus', 'Music']] },
  { id: 'miband', year: 2018, name: 'Mi Band', era: 'Wearables', specs: [['Display', 'AMOLED'], ['Sensors', 'HR+Steps'], ['Battery', '20 days']] },
  { id: 'wacom', year: 2021, name: 'Wacom Tablet', era: 'Creative Tools', specs: [['Input', 'Pen'], ['Use', 'Drawing'], ['Connect', 'USB/BT']] }
];

function createDeviceMesh(id, darkMode) {
  const colorMap = {
    nokia: darkMode ? '#64748b' : '#334155',
    ipod: darkMode ? '#1f2937' : '#111827',
    miband: darkMode ? '#334155' : '#0f172a',
    wacom: darkMode ? '#475569' : '#1f2937'
  };
  const material = new THREE.MeshStandardMaterial({ color: colorMap[id], roughness: 0.45, metalness: 0.2 });
  if (id === 'nokia') return new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.5, 0.28), material);
  if (id === 'ipod') return new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.3), material);
  if (id === 'miband') return new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 24, 80), material);
  return new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.1), material);
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

    scene.add(new THREE.AmbientLight(0xffffff, darkMode ? 0.8 : 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 6, 3);
    scene.add(key);

    const timelineLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 16, 16),
      new THREE.MeshStandardMaterial({ color: darkMode ? '#334155' : '#94a3b8' })
    );
    timelineLine.position.set(0, -4.5, -1.4);
    scene.add(timelineLine);

    const rail = new THREE.Group();
    const spacing = 4.2;
    DEVICES.forEach((item, idx) => {
      const mesh = createDeviceMesh(item.id, darkMode);
      mesh.position.y = -idx * spacing;
      rail.add(mesh);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({ color: darkMode ? '#64748b' : '#64748b' })
      );
      dot.position.set(0, -idx * spacing, -1.4);
      rail.add(dot);
    });
    scene.add(rail);

    const cursor = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.02, 12, 32),
      new THREE.MeshStandardMaterial({ color: darkMode ? '#e2e8f0' : '#0f172a' })
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
      rail.position.y = progressRef.current * spacing;
      cursor.position.y = progressRef.current * spacing;
      rail.children.forEach((obj, i) => {
        if (i % 2 === 0) obj.rotation.y += 0.006;
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
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const jumpToIndex = (index) => {
    const section = document.querySelector(`#scene-${index}`);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return React.createElement(
    'div',
    { className: 'page' },
    React.createElement('canvas', { ref: canvasRef, className: 'bg-canvas' }),

    React.createElement(
      'header',
      { className: 'title overlay' },
      React.createElement('div', null,
        React.createElement('p', null, 'Personal Device Museum'),
        React.createElement('h1', null, 'My Digital Devices Timeline')
      ),
      React.createElement('button', { className: 'mode-btn', onClick: () => setDarkMode((v) => !v) }, darkMode ? '切换浅色' : '切换深色')
    ),

    React.createElement(
      'main',
      { className: 'layout overlay' },
      React.createElement(
        'section',
        { className: 'card timeline' },
        DEVICES.map((item, idx) =>
          React.createElement(
            'button',
            { key: item.id, className: idx === activeIndex ? 'active' : '', onClick: () => jumpToIndex(idx) },
            React.createElement('div', { style: { fontSize: '12px', opacity: 0.7 } }, `${item.year} · ${item.era}`),
            React.createElement('div', { style: { fontWeight: 600 } }, item.name)
          )
        )
      ),


      React.createElement(
        'section',
        { className: 'side-col' },
        React.createElement(
          'div',
          { className: 'card' },
          React.createElement('div', { style: { fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' } }, 'Specs'),
          React.createElement('h3', { style: { margin: '8px 0 4px' } }, current.name),
          current.specs.map(([k, v]) => React.createElement('div', { className: 'spec-row', key: k }, React.createElement('span', null, k), React.createElement('strong', null, v)))
        ),
        React.createElement(
          'div',
          { className: 'card' },
          React.createElement('div', { style: { fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' } }, 'Now Playing'),
          React.createElement('div', { style: { display: 'flex', gap: '12px', marginTop: '12px' } },
            React.createElement('img', { className: 'cover', src: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80' }),
            React.createElement('div', null,
              React.createElement('div', { style: { fontWeight: 600 } }, 'Memory Lane.fm'),
              React.createElement('div', { style: { color: 'var(--muted)', fontSize: 14 } }, `${current.name} era mix`)
            )
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
