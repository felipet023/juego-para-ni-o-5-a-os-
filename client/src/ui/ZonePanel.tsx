import type { LessonState } from '../types';
import type { ZoneVisual } from '../world/zoneLayout';

interface ZonePanelProps {
  zone: ZoneVisual;
  lessons: LessonState[];
  onOpenLesson: (id: string) => void;
  onClose: () => void;
}

const STATUS_LABEL: Record<LessonState['status'], string> = {
  locked: '🔒 Bloqueada',
  available: '✨ Nueva',
  in_progress: '🚶 En curso',
  mastered: '🏅 Dominada',
};

/** Lista de lecciones de una zona. También sirve como alternativa al mundo 3D. */
export function ZonePanel({ zone, lessons, onOpenLesson, onClose }: ZonePanelProps) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="zone-title">
      <section className="panel">
        <header className="panel__header">
          <div>
            <p className="panel__subtitle">Zona de la isla</p>
            <h2 className="panel__title" id="zone-title">
              <span aria-hidden="true">{zone.emoji}</span> {zone.name}
            </h2>
            <p className="panel__subtitle">
              {lessons.filter((lesson) => lesson.status === 'mastered').length} de {lessons.length}{' '}
              lecciones dominadas
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            aria-label="Cerrar zona"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="panel__body">
          {lessons.length === 0 ? (
            <p className="empty">Esta zona todavía no tiene lecciones.</p>
          ) : (
            <div className="stack">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  className={`zone-card ${lesson.status === 'locked' ? 'zone-card--locked' : ''}`}
                  disabled={lesson.status === 'locked'}
                  onClick={() => onOpenLesson(lesson.id)}
                >
                  <span className="zone-card__emoji" aria-hidden="true">
                    {lesson.status === 'mastered' ? '🏅' : lesson.status === 'locked' ? '🔒' : '📘'}
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong>{lesson.title}</strong>
                    <span className="zone-card__meta" style={{ display: 'block' }}>
                      {lesson.concept} · {STATUS_LABEL[lesson.status]} · {'⭐'.repeat(lesson.stars)}
                    </span>
                  </span>
                  {lesson.status !== 'locked' && <span aria-hidden="true">›</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="panel__footer">
          <span className="muted">
            {lessons.some((lesson) => lesson.status === 'locked')
              ? 'Termina la lección anterior para abrir las demás.'
              : 'Todas las lecciones de esta zona están abiertas.'}
          </span>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Volver a la isla
          </button>
        </footer>
      </section>
    </div>
  );
}
