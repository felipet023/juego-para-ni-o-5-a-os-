import { useState } from 'react';
import { api, ApiError } from '../api/client';
import { playTone } from '../lib/audio';
import type { Settings } from '../lib/settings';
import type { CheckResult, LessonState } from '../types';
import { FeedbackBanner } from './FeedbackBanner';

interface ChecksRunnerProps {
  lesson: LessonState;
  settings: Settings;
  onRefresh: () => Promise<void>;
  onMastered: (result: CheckResult) => void;
  notify: (message: string) => void;
}

function firstPending(mask: number): number {
  let index = 0;
  while (index < 3 && (mask & (1 << index)) !== 0) index += 1;
  return Math.min(index, 2);
}

/** Tres preguntas cortas. Al responder las tres, la lección queda dominada. */
export function ChecksRunner({ lesson, settings, onRefresh, onMastered, notify }: ChecksRunnerProps) {
  const [index, setIndex] = useState(() => firstPending(lesson.checksPassed));
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<CheckResult | null>(null);
  const [busy, setBusy] = useState(false);

  const check = lesson.checks[index];
  const allDone = lesson.checksPassed === 7;

  async function answer(optionId: string) {
    if (busy || feedback?.correct) return;
    setPicked(optionId);
    setBusy(true);
    try {
      const result = await api.check(lesson.id, index, optionId);
      setFeedback(result);
      if (result.correct) {
        playTone('ok', settings.sound);
        await onRefresh();
      } else {
        playTone('error', settings.sound);
      }
    } catch (caught) {
      playTone('error', settings.sound);
      notify(caught instanceof ApiError ? caught.message : 'No pudimos comprobar tu respuesta.');
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (feedback?.mastered) {
      onMastered(feedback);
      return;
    }
    setFeedback(null);
    setPicked(null);
    setIndex((current) => Math.min(current + 1, 2));
  }

  if (allDone) {
    return (
      <div className="lesson-block">
        <h3>
          <span aria-hidden="true">🏅</span> ¡Ya respondiste las tres preguntas!
        </h3>
        <p className="muted">Esta lección está dominada. Puedes volver a leerla o seguir explorando.</p>
      </div>
    );
  }

  if (!check) {
    return <p className="muted">No hay preguntas en esta lección.</p>;
  }

  return (
    <div className="stack">
      <div className="row" aria-label={`Pregunta ${index + 1} de 3`}>
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="pill"
            style={{ opacity: dot === index ? 1 : 0.55 }}
            aria-hidden="true"
          >
            {dot < index || (lesson.checksPassed & (1 << dot)) !== 0 ? '⭐' : dot === index ? '👉' : '⚪'}
          </span>
        ))}
        <span className="muted">
          Pregunta {index + 1} de 3
        </span>
      </div>

      <div className="lesson-block">
        <h3>{check.question}</h3>
        <div className="option-grid" role="group" aria-label="Opciones">
          {check.options.map((option) => {
            const isPicked = picked === option.id;
            const classes = ['option'];
            if (isPicked) {
              classes.push(feedback ? (feedback.correct ? 'option--ok' : 'option--no') : 'option--picked');
            }
            return (
              <button
                key={option.id}
                type="button"
                className={classes.join(' ')}
                aria-pressed={isPicked}
                disabled={busy || feedback?.correct === true}
                onClick={() => void answer(option.id)}
              >
                {option.emoji && (
                  <span className="option__emoji" aria-hidden="true">
                    {option.emoji}
                  </span>
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <FeedbackBanner correct={feedback.correct}>
          <strong>{feedback.correct ? '¡Correcto!' : 'Casi. Prueba otra vez.'}</strong>{' '}
          {feedback.correct ? feedback.explanation : 'Lee la pregunta con calma y elige otra opción.'}
        </FeedbackBanner>
      )}

      {feedback?.correct && (
        <button type="button" className="btn btn--primary btn--huge btn--block" onClick={next}>
          {feedback.mastered ? 'Ver mi premio 🏅' : 'Siguiente pregunta →'}
        </button>
      )}
    </div>
  );
}
