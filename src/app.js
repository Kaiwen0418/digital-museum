import React, { useEffect, useRef, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import htm from 'https://esm.sh/htm@3.1.1';
import { mountNokiaScene } from './three/nokiaScene.js';

const html = htm.bind(React.createElement);

function App() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    sceneRef.current = mountNokiaScene(canvasRef.current, (next) => setValue(next));
    return () => sceneRef.current?.dispose();
  }, []);

  return html`
    <main className="relative w-screen h-screen overflow-hidden">
      <canvas ref=${canvasRef} className="block w-full h-full"></canvas>

      <section className="absolute top-4 left-4 z-10 max-w-xs rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Nokia 经典款（React + Tailwind）</h1>
        <p className="mt-2 text-sm text-slate-300">拖拽旋转模型，点击 3D 按键输入数字。</p>
        <div className="mt-3 text-lg text-slate-200">当前输入：
          <span id="value" className="ml-1 font-semibold text-cyan-300">${value || '-'}</span>
        </div>
        <button
          id="clear"
          className="mt-3 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
          onClick=${() => sceneRef.current?.clearInput()}
        >
          清空
        </button>
      </section>
    </main>
  `;
}

createRoot(document.getElementById('root')).render(html`<${App} />`);
