import { useState } from 'react';
import type { AttemptResult, ChoiceMission } from '../../types';

interface ChoiceViewProps {
  mission: ChoiceMission;
  outcome: AttemptResult | null;
  busy: boolean;
  onSubmit: (answer: unknown) => void;
}

export function ChoiceView({ mission, outcome, busy, onSubmit }: ChoiceViewProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const done = outcome?.correct === true;

  return (
    <div className="option-grid" role="group" aria-label="Elige una opción">
      {mission.options.map((option) => {
        const isPicked = picked === option.id;
        const classes = ['option'];
        if (isPicked) {
          classes.push(outcome ? (outcome.correct ? 'option--ok' : 'option--no') : 'option--picked');
        }
        return (
          <button
            key={option.id}
            type="button"
            className={classes.join(' ')}
            disabled={busy || done}
            aria-pressed={isPicked}
            onClick={() => {
              setPicked(option.id);
              onSubmit({ optionId: option.id });
            }}
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
  );
}
