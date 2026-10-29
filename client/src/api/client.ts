import type {
  AdminLesson,
  AdminOverview,
  AdminPlayer,
  AttemptResult,
  AuditEntry,
  CheckResult,
  GameState,
  LabToy,
  QueryResult,
  QuerySpec,
  TableSnapshot,
  User,
} from '../types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const payload = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)
      ?.error;
    throw new ApiError(
      response.status,
      payload?.code ?? 'error',
      payload?.message ?? 'Algo falló. Inténtalo otra vez.',
      payload?.details,
    );
  }

  return data as T;
}

function json(body: unknown): RequestInit {
  return { method: 'POST', body: JSON.stringify(body) };
}

export const api = {
  session: () => request<{ user: User | null }>('/auth/session'),
  login: (username: string, password: string) =>
    request<{ user: User }>('/auth/login', json({ username, password })),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),

  state: () => request<GameState>('/game/state'),
  table: (name: string) => request<TableSnapshot>(`/game/tables/${encodeURIComponent(name)}`),
  attempt: (lessonId: string, step: 'mission' | 'practice', answer: unknown) =>
    request<AttemptResult>(`/game/lessons/${encodeURIComponent(lessonId)}/attempts`, json({ step, answer })),
  check: (lessonId: string, index: number, optionId: string) =>
    request<CheckResult>(`/game/lessons/${encodeURIComponent(lessonId)}/checks`, json({ index, optionId })),
  hint: (lessonId: string, index: number) =>
    request<{ hintsUsed: number }>(`/game/lessons/${encodeURIComponent(lessonId)}/hints`, json({ index })),
  preview: (query: QuerySpec) =>
    request<{ result: QueryResult }>('/game/query/preview', json({ query })),
  lab: () => request<{ toys: LabToy[] }>('/game/lab'),
  resetLab: () => request<{ toys: LabToy[] }>('/game/lab/reset', { method: 'POST' }),

  adminOverview: () => request<AdminOverview>('/admin/overview'),
  adminPlayers: () => request<{ players: AdminPlayer[] }>('/admin/players'),
  adminCreatePlayer: (payload: {
    username: string;
    displayName: string;
    password: string;
    avatar: string;
  }) => request<{ id: number; username: string }>('/admin/players', json(payload)),
  adminTogglePlayer: (id: number, isActive: boolean) =>
    request<{ ok: true }>(`/admin/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  adminResetPassword: (id: number, password: string) =>
    request<{ ok: true }>(`/admin/players/${id}/reset-password`, json({ password })),
  adminResetProgress: (id: number) =>
    request<{ ok: true }>(`/admin/players/${id}/reset-progress`, json({ confirm: true })),
  adminLessons: () => request<{ lessons: AdminLesson[] }>('/admin/lessons'),
  adminUpdateLesson: (id: string, payload: { title?: string; isActive?: boolean }) =>
    request<{ ok: true }>(`/admin/lessons/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminAudit: () => request<{ entries: AuditEntry[] }>('/admin/audit'),
  adminExportUrl: '/api/admin/export',
};
