import { useEffect, useMemo, useRef, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { DEVICES, PREVIEW_RANGE, SNAP_CAPTURE_RADIUS, SNAP_THRESHOLD, TIMELINE_DETAIL_TICKS } from './data/devices';
import { useBackgroundThree } from './hooks/useBackgroundThree';
import { clamp, smoothstep } from './lib/math';
import type { ProgressCanvas } from './types/device';

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

      <HeroSection opacity={heroOpacity} onEnter={enterMuseum} />

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
