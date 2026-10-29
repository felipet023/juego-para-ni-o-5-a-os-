import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import { playTone, speak, stopSpeaking } from '../lib/audio';
import type { Settings } from '../lib/settings';
import type { CheckResult, LessonState } from '../types';
import { ZONE_BY_ID } from '../world/zoneLayout';
import { ChecksRunner } from './ChecksRunner';
import { MissionRunner } from './MissionRunner';

type Step = 'aprender' | 'mision' | 'practica' | 'comprobar';

interface LessonPanelProps {
  lesson: LessonState;
  nextLessonId: string | null;
  settings: Settings;
  onClose: () => void;
  onOpenLesson: (id: string) => void;
  onRefresh: () => Promise<void>;
  notify: (message: string) => void;
}

interface Celebration {
  stars: number;
  badge?: { key: string; label: string; emoji: string };
}

const TABS: { id: Step; label: string }[] = [
  { id: 'aprender', label: '📖 Aprender' },
  { id: 'mision', label: '🎯 Misión' },
  { id: 'practica', label: '🔁 Práctica' },
  { id: 'comprobar', label: '🧠 Comprobar' },
];

function initialStep(lesson: LessonState): Step {
  if (lesson.status === 'mastered') return 'aprender';
  if (lesson.practiceDone) return 'comprobar';
  if (lesson.missionDone) return 'practica';
  if (lesson.attempts > 0) return 'mision';
  return 'aprender';
}

/** Panel de una lección: leer, misión, práctica y tres preguntas. */
export function LessonPanel({
  lesson,
  nextLessonId,
  settings,
  onClose,
  onOpenLesson,
  onRefresh,
  notify,
}: LessonPanelProps) {
  const [step, setStep] = useState<Step>(() => initialStep(lesson));
  const [hintIndex, setHintIndex] = useState(lesson.hintsUsed);
  const [asking, setAsking] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const zone = ZONE_BY_ID.get(lesson.zone);

  useEffect(() => () => stopSpeaking(), []);

  function readAloud() {
    const text = [
      lesson.title,
      lesson.concept,
      lesson.analogy,
      ...lesson.demo.map((demo) => `${demo.title}. ${demo.text}`),
    ].join('. ');
    speak(text, settings.voice);
  }

  async function askHint() {
    if (asking) return;
    setAsking(true);
    try {
      const response = await api.hint(lesson.id, hintIndex);
      setHintIndex(response.hintsUsed);
      playTone('click', settings.sound);
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'No pudimos abrir una pista.');
    } finally {
      setAsking(false);
    }
  }

  function handleMastered(result: CheckResult) {
    playTone('star', settings.sound);
    setCelebration({ stars: result.stars, badge: result.badge });
  }

  const showHints = step !== 'aprender' && hintIndex > 0;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
      <section className="panel">
        <header className="panel__header">
          <div>
            <p className="panel__subtitle">
              {zone?.emoji} {zone?.name ?? 'Isla'} · Lección {lesson.order + 1}
            </p>
            <h2 className="panel__title" id="lesson-title">
              {lesson.title}
            </h2>
            <p className="panel__subtitle">
              {lesson.concept} · <span aria-hidden="true">{'⭐'.repeat(lesson.stars)}</span>
              <span className="sr-only">{lesson.stars} de 3 estrellas</span>
            </p>
          </div>
          <div className="row">
            {settings.voice && (
              <button
                type="button"
                className="btn btn--ghost btn--icon"
                aria-label="Leer la lección en voz alta"
                onClick={readAloud}
              >
                🔊
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              aria-label="Cerrar lección"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </header>

        <div className="panel__body">
          <div className="tabs" role="group" aria-label="Partes de la lección">
            {TABS.map((tab) => {
              const disabled =
                (tab.id === 'practica' && !lesson.missionDone) ||
                (tab.id === 'comprobar' && !lesson.practiceDone);
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab ${step === tab.id ? 'tab--active' : ''}`}
                  aria-pressed={step === tab.id}
                  disabled={disabled}
                  onClick={() => {
                    stopSpeaking();
                    setStep(tab.id);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {step === 'aprender' && (
            <div className="stack">
              <div className="lesson-block">
                <h3>
                  <span aria-hidden="true">🎯</span> ¿Qué vas a aprender?
                </h3>
                <p>{lesson.objective}</p>
              </div>
              <div className="lesson-block">
                <h3>
                  <span aria-hidden="true">💡</span> Imagina que…
                </h3>
                <p>{lesson.analogy}</p>
              </div>
              <div className="lesson-block">
                <h3>
                  <span aria-hidden="true">👀</span> Vamos a verlo
                </h3>
                {lesson.demo.map((demo, index) => (
                  <div className="demo-step" key={demo.title}>
                    <span className="demo-step__index" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <strong>{demo.title}</strong>
                      <p style={{ margin: '0.2rem 0 0' }}>{demo.text}</p>
                      {demo.sql && <code className="sql">{demo.sql}</code>}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn--primary btn--huge btn--block"
                onClick={() => setStep('mision')}
              >
                🎯 Ir a la misión
              </button>
            </div>
          )}

          {step === 'mision' && (
            <MissionRunner
              lesson={lesson}
              step="mission"
              mission={lesson.mission}
              settings={settings}
              alreadyDone={lesson.missionDone}
              onRefresh={onRefresh}
              onContinue={() => setStep('practica')}
              continueLabel="🔁 Ahora practica"
              notify={notify}
            />
          )}

          {step === 'practica' && (
            <MissionRunner
              lesson={lesson}
              step="practice"
              mission={lesson.practice}
              settings={settings}
              alreadyDone={lesson.practiceDone}
              onRefresh={onRefresh}
              onContinue={() => setStep('comprobar')}
              continueLabel="🧠 Ahora comprueba"
              notify={notify}
            />
          )}

          {step === 'comprobar' && (
            <ChecksRunner
              lesson={lesson}
              settings={settings}
              onRefresh={onRefresh}
              onMastered={handleMastered}
              notify={notify}
            />
          )}

          {showHints && (
            <ul className="hint-list">
              {lesson.hints.slice(0, hintIndex).map((hint, index) => (
                <li className="hint" key={hint}>
                  <span aria-hidden="true">💡</span> {hint}
                  <span className="sr-only"> (pista {index + 1})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="panel__footer">
          <span className="pill">
            ⭐ {lesson.stars}/3
            {lesson.status === 'mastered' && ` · ${lesson.badge.emoji} ${lesson.badge.label}`}
          </span>
          <div className="row">
            {step !== 'aprender' && hintIndex < 3 && (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={asking}
                onClick={() => void askHint()}
              >
                💡 Pedir pista
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Salir
            </button>
          </div>
        </footer>
      </section>

      {celebration && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
          <div className="panel panel--narrow">
            <div className="panel__body">
              <div className="celebration">
                <span className="celebration__emoji" aria-hidden="true">
                  🎉
                </span>
                <h2 id="celebrate-title">¡Lo lograste!</h2>
                <p className="celebration__stars" aria-label={`${celebration.stars} de 3 estrellas`}>
                  {'⭐'.repeat(celebration.stars)}
                  {'☆'.repeat(Math.max(0, 3 - celebration.stars))}
                </p>
                {celebration.badge && (
                  <p className="pill">
                    {celebration.badge.emoji} {celebration.badge.label}
                  </p>
                )}
                <p>Byte el Ajolote está muy contento contigo.</p>
              </div>
            </div>
            <div className="panel__footer">
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Seguir explorando
              </button>
              {nextLessonId && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setCelebration(null);
                    onOpenLesson(nextLessonId);
                  }}
                >
                  Siguiente lección →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
