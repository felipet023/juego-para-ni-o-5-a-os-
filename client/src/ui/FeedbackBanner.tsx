import type { ReactNode } from 'react';

interface FeedbackBannerProps {
  correct: boolean;
  children: ReactNode;
}

/** Mensaje amable: nunca dice «mal», siempre invita a intentarlo otra vez. */
export function FeedbackBanner({ correct, children }: FeedbackBannerProps) {
  return (
    <div className={`feedback ${correct ? 'feedback--ok' : 'feedback--no'}`} role="status" aria-live="polite">
      <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>
        {correct ? '🎉' : '💡'}
      </span>
      <div>{children}</div>
    </div>
  );
}
