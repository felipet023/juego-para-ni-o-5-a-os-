import { canSpeak } from '../lib/audio';
import type { Settings } from '../lib/settings';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="switch"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <section className="panel panel--narrow">
        <header className="panel__header">
          <div>
            <p className="panel__subtitle">A tu manera</p>
            <h2 className="panel__title" id="settings-title">
              ⚙️ Ajustes
            </h2>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" aria-label="Cerrar ajustes" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="panel__body">
          <ToggleRow
            label="Sonidos"
            description="Pequeños sonidos al acertar y al tocar botones."
            checked={settings.sound}
            onChange={(value) => onChange({ sound: value })}
          />
          <ToggleRow
            label="Leer en voz alta"
            description={
              canSpeak()
                ? 'El navegador lee la lección con una voz.'
                : 'Tu navegador no tiene voz disponible.'
            }
            checked={settings.voice}
            disabled={!canSpeak()}
            onChange={(value) => onChange({ voice: value })}
          />
          <ToggleRow
            label="Menos movimiento"
            description="La cámara y el personaje se mueven menos."
            checked={settings.reduceMotion}
            onChange={(value) => onChange({ reduceMotion: value })}
          />
          <ToggleRow
            label="Contraste alto"
            description="Colores más fuertes y fondo oscuro."
            checked={settings.highContrast}
            onChange={(value) => onChange({ highContrast: value })}
          />
          <ToggleRow
            label="Joystick en pantalla"
            description="Un mando redondo para caminar con el dedo."
            checked={settings.showJoystick}
            onChange={(value) => onChange({ showJoystick: value })}
          />

          <div className="settings-row">
            <div>
              <strong>Tamaño del texto</strong>
              <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                Más grande es más fácil de leer.
              </p>
            </div>
            <div className="row">
              <button
                type="button"
                className="btn btn--ghost"
                aria-label="Texto más pequeño"
                disabled={settings.textScale <= 0.9}
                onClick={() => onChange({ textScale: Math.max(0.9, settings.textScale - 0.1) })}
              >
                A−
              </button>
              <span className="pill">{Math.round(settings.textScale * 100)}%</span>
              <button
                type="button"
                className="btn btn--ghost"
                aria-label="Texto más grande"
                disabled={settings.textScale >= 1.5}
                onClick={() => onChange({ textScale: Math.min(1.5, settings.textScale + 0.1) })}
              >
                A+
              </button>
            </div>
          </div>

          <p className="muted">
            Los ajustes se guardan solo en este navegador. No se envían a ningún servidor.
          </p>
        </div>

        <footer className="panel__footer">
          <span className="muted">Puedes cambiarlo cuando quieras.</span>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Listo
          </button>
        </footer>
      </section>
    </div>
  );
}
