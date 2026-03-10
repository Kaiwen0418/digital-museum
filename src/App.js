import { createElement, useEffect, useRef, useState } from 'react';
import { mountNokiaScene } from './three/nokiaScene.js';

export default function App() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    sceneRef.current = mountNokiaScene(canvasRef.current, (next) => setValue(next));
    return () => sceneRef.current?.dispose();
  }, []);

  return createElement(
    'main',
    { className: 'relative h-screen w-screen overflow-hidden' },
    createElement('canvas', { ref: canvasRef, className: 'block h-full w-full' }),
    createElement(
      'section',
      { className: 'absolute left-4 top-4 z-10 max-w-xs rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 text-slate-100 shadow-xl backdrop-blur' },
      createElement('h1', { className: 'text-2xl font-bold tracking-tight' }, 'Nokia 经典款（React + Tailwind）'),
      createElement('p', { className: 'mt-2 text-sm text-slate-300' }, '拖拽旋转模型，点击 3D 按键输入数字。'),
      createElement(
        'div',
        { className: 'mt-3 text-lg text-slate-200' },
        '当前输入：',
        createElement('span', { id: 'value', className: 'ml-1 font-semibold text-cyan-300' }, value || '-')
      ),
      createElement(
        'button',
        {
          id: 'clear',
          className: 'mt-3 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400',
          onClick: () => sceneRef.current?.clearInput()
        },
        '清空'
      )
    )
  );
}
