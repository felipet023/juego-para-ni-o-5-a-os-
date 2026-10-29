import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { GameScreen } from './screens/GameScreen';
import { AdminScreen } from './screens/AdminScreen';

export default function App() {
  const phase = useAppStore((state) => state.phase);
  const bootstrap = useAppStore((state) => state.bootstrap);
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${Math.round(18 * settings.textScale)}px`;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = settings.reduceMotion ? 'reduced' : 'normal';
  }, [settings]);

  if (phase === 'boot') {
    return (
      <div className="loading" role="status" aria-live="polite">
        <div>
          <div className="spinner" />
          Despertando la isla…
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<GameScreen />} />
      <Route path="/admin" element={<AdminScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
