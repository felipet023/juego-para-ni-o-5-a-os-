import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LoginScreen } from './LoginScreen';
import { World } from '../world/World';
import { detectWebGL, ZONE_BY_ID } from '../world/zoneLayout';
import type { ZoneId } from '../types';
import { TopBar } from '../ui/TopBar';
import { Joystick } from '../ui/Joystick';
import { ZonePanel } from '../ui/ZonePanel';
import { MapPanel } from '../ui/MapPanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { LessonPanel } from '../ui/LessonPanel';

export function GameScreen() {
  const phase = useAppStore((state) => state.phase);
  const user = useAppStore((state) => state.user);
  const game = useAppStore((state) => state.game);
  const settings = useAppStore((state) => state.settings);
  const refresh = useAppStore((state) => state.refresh);
  const logout = useAppStore((state) => state.logout);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [nearZone, setNearZone] = useState<ZoneId | null>(null);
  const [openZoneId, setOpenZoneId] = useState<ZoneId | null>(null);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const webgl = useMemo(() => detectWebGL(), []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const lesson = game?.lessons.find((item) => item.id === openLessonId) ?? null;
  const zone = openZoneId ? ZONE_BY_ID.get(openZoneId) ?? null : null;
  const overlayOpen = Boolean(zone || lesson || mapOpen || settingsOpen);

  const openZone = useCallback((zoneId: ZoneId) => {
    setOpenZoneId(zoneId);
    setMapOpen(false);
  }, []);

  const openLesson = useCallback((lessonId: string) => {
    setOpenLessonId(lessonId);
  }, []);

  if (phase !== 'ready' || !user || !game) {
    return <LoginScreen />;
  }

  const zoneLessons = zone ? game.lessons.filter((item) => item.zone === zone.id) : [];
  const nextLesson =
    lesson
      ? game.lessons.find((item) => item.order === lesson.order + 1 && item.status !== 'locked') ?? null
      : null;

  async function handleLogout() {
    await logout();
  }

  if (!webgl) {
    return (
      <div className="shell" style={{ background: 'var(--sky)' }}>
        <TopBar
          user={user}
          game={game}
          onOpenMap={() => setMapOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogout={() => void handleLogout()}
        />
        <MapPanel
          lessons={game.lessons}
          onOpenZone={openZone}
          onClose={() => setMapOpen(false)}
          standalone
        />
        {zone && (
          <ZonePanel
            zone={zone}
            lessons={zoneLessons}
            onOpenLesson={openLesson}
            onClose={() => setOpenZoneId(null)}
          />
        )}
        {lesson && (
          <LessonPanel
            lesson={lesson}
            nextLessonId={nextLesson?.id ?? null}
            settings={settings}
            onClose={() => setOpenLessonId(null)}
            onOpenLesson={openLesson}
            onRefresh={refresh}
            notify={notify}
          />
        )}
        {settingsOpen && (
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="shell">
      <World
        lessons={game.lessons}
        nearZone={nearZone}
        onNearChange={setNearZone}
        onEnterZone={openZone}
        paused={overlayOpen}
        reduceMotion={settings.reduceMotion}
      />

      <TopBar
        user={user}
        game={game}
        onOpenMap={() => setMapOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={() => void handleLogout()}
      />

      {settings.showJoystick && !overlayOpen && <Joystick />}

      {nearZone && !overlayOpen && (
        <div className="prompt">
          <span className="prompt__hint">
            {ZONE_BY_ID.get(nearZone)?.emoji} Estás en {ZONE_BY_ID.get(nearZone)?.name}
          </span>
          <button
            type="button"
            className="btn btn--primary btn--huge"
            onClick={() => openZone(nearZone)}
          >
            Entrar aquí
          </button>
        </div>
      )}

      {!nearZone && !overlayOpen && (
        <div className="prompt">
          <span className="prompt__hint">Camina con las flechas o el joystick</span>
        </div>
      )}

      {zone && (
        <ZonePanel
          zone={zone}
          lessons={zoneLessons}
          onOpenLesson={openLesson}
          onClose={() => setOpenZoneId(null)}
        />
      )}

      {mapOpen && (
        <MapPanel lessons={game.lessons} onOpenZone={openZone} onClose={() => setMapOpen(false)} />
      )}

      {lesson && (
        <LessonPanel
          lesson={lesson}
          nextLessonId={nextLesson?.id ?? null}
          settings={settings}
          onClose={() => setOpenLessonId(null)}
          onOpenLesson={openLesson}
          onRefresh={refresh}
          notify={notify}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
