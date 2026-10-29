import { useState } from 'react';
import { api, ApiError } from '../api/client';
import { playTone } from '../lib/audio';
import type { Settings } from '../lib/settings';
import type { AttemptResult, LessonState, Mission } from '../types';
import { FeedbackBanner } from './FeedbackBanner';
import { DataTable } from './DataTable';
import { ChoiceView } from './missions/ChoiceView';
import { PickCellView } from './missions/PickCellView';
import { BuildQueryView } from './missions/BuildQueryView';
import { JoinMatchView } from './missions/JoinMatchView';
import { LabView } from './missions/LabView';

interface MissionRunnerProps {
  lesson: LessonState;
  step: 'mission' | 'practice';
  mission: Mission;
  settings: Settings;
  alreadyDone: boolean;
  onRefresh: () => Promise<void>;
  onContinue: () => void;
  continueLabel: string;
  notify: (message: string) => void;
}

/**
 * Envía la respuesta al servidor y muestra el resultado.
 * El cliente nunca decide si el niño acertó: solo pinta lo que responde la API.
 */
export function MissionRunner({
  lesson,
  step,
  mission,
  settings,
  alreadyDone,
  onRefresh,
  onContinue,
  continueLabel,
  notify,
}: MissionRunnerProps) {
  const [outcome, setOutcome] = useState<AttemptResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(answer: unknown) {
    if (busy || outcome?.correct) return;
    setBusy(true);
    try {
      const result = await api.attempt(lesson.id, step, answer);
      setOutcome(result);
      if (result.correct) {
        playTone('star', settings.sound);
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

  return (
    <div className="stack">
      <div className="lesson-block">
        <h3>
          <span aria-hidden="true">{step === 'mission' ? '🎯' : '🔁'}</span>{' '}
          {step === 'mission' ? 'Misión' : 'Práctica'}
          {alreadyDone && <span className="pill">✅ ya lo lograste</span>}
        </h3>
        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{mission.prompt}</p>

        {mission.kind === 'choice' && (
          <ChoiceView mission={mission} outcome={outcome} busy={busy} onSubmit={handleSubmit} />
        )}
        {mission.kind === 'pick-cell' && (
          <PickCellView mission={mission} outcome={outcome} busy={busy} onSubmit={handleSubmit} />
        )}
        {mission.kind === 'build-query' && (
          <BuildQueryView mission={mission} outcome={outcome} busy={busy} onSubmit={handleSubmit} />
        )}
        {mission.kind === 'join-match' && (
          <JoinMatchView mission={mission} outcome={outcome} busy={busy} onSubmit={handleSubmit} />
        )}
        {mission.kind === 'lab-action' && (
          <LabView
            mission={mission}
            outcome={outcome}
            busy={busy}
            onSubmit={handleSubmit}
            notify={notify}
          />
        )}
      </div>

      {outcome && (
        <FeedbackBanner correct={outcome.correct}>
          <strong>{outcome.correct ? '¡Muy bien!' : 'Casi. Vamos otra vez.'}</strong>{' '}
          {outcome.feedback}
        </FeedbackBanner>
      )}

      {outcome?.result && outcome.result.rows.length > 0 && (
        <DataTable
          snapshot={{ columns: outcome.result.columns, rows: outcome.result.rows }}
          caption="Resultado de tu consulta"
        />
      )}

      {outcome?.correct && (
        <button type="button" className="btn btn--primary btn--huge btn--block" onClick={onContinue}>
          {continueLabel}
        </button>
      )}
    </div>
  );
}
