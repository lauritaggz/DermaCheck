export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEvent {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const MAX_LOG_EVENTS = 50;
const REMOTE_BATCH_SIZE = 10;
const REMOTE_ENDPOINT = '/api/v1/logs/events';
const REMOTE_FLUSH_DELAY_MS = 4000;

declare global {
  interface Window {
    __DERMACHECK_LOGS__?: LogEvent[];
    __DERMACHECK_REMOTE_LOG_QUEUE__?: LogEvent[];
    __DERMACHECK_REMOTE_LOG_FLUSHING__?: boolean;
    __DERMACHECK_REMOTE_LOG_TIMER__?: number;
  }
}

function getStore(): LogEvent[] {
  if (!window.__DERMACHECK_LOGS__) {
    window.__DERMACHECK_LOGS__ = [];
  }
  return window.__DERMACHECK_LOGS__;
}

function getRemoteQueue(): LogEvent[] {
  if (!window.__DERMACHECK_REMOTE_LOG_QUEUE__) {
    window.__DERMACHECK_REMOTE_LOG_QUEUE__ = [];
  }
  return window.__DERMACHECK_REMOTE_LOG_QUEUE__;
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '';
}

function scheduleRemoteFlush(): void {
  if (window.__DERMACHECK_REMOTE_LOG_TIMER__) return;
  window.__DERMACHECK_REMOTE_LOG_TIMER__ = window.setTimeout(() => {
    window.__DERMACHECK_REMOTE_LOG_TIMER__ = undefined;
    void flushRemoteLogs(true);
  }, REMOTE_FLUSH_DELAY_MS);
}

async function flushRemoteLogs(force: boolean = false): Promise<void> {
  if (window.__DERMACHECK_REMOTE_LOG_FLUSHING__) return;
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return;

  const queue = getRemoteQueue();
  if (!force && queue.length < REMOTE_BATCH_SIZE) return;
  if (queue.length === 0) return;

  window.__DERMACHECK_REMOTE_LOG_FLUSHING__ = true;
  const batchSize = force ? Math.min(queue.length, REMOTE_BATCH_SIZE) : REMOTE_BATCH_SIZE;
  const batch = queue.slice(0, batchSize);

  try {
    const response = await fetch(`${baseUrl}${REMOTE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: batch,
        source: 'web',
      }),
      keepalive: true,
    });

    if (response.ok) {
      queue.splice(0, batchSize);
      if (queue.length >= REMOTE_BATCH_SIZE) {
        void flushRemoteLogs(false);
      }
    }
  } catch {
    // Intencionalmente silencioso para no romper flujo de UI por telemetría.
  } finally {
    window.__DERMACHECK_REMOTE_LOG_FLUSHING__ = false;
  }
}

function pushLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const event: LogEvent = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  const store = getStore();
  store.push(event);
  if (store.length > MAX_LOG_EVENTS) {
    store.splice(0, store.length - MAX_LOG_EVENTS);
  }

  const remoteQueue = getRemoteQueue();
  remoteQueue.push(event);
  if (remoteQueue.length >= REMOTE_BATCH_SIZE) {
    void flushRemoteLogs(false);
    return;
  }
  scheduleRemoteFlush();
}

export const loggerService = {
  info(message: string, context?: Record<string, unknown>) {
    pushLog('INFO', message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    pushLog('WARN', message, context);
  },
  error(message: string, context?: Record<string, unknown>) {
    pushLog('ERROR', message, context);
  },
  getLogs(): LogEvent[] {
    return [...getStore()];
  },
  clear() {
    getStore().length = 0;
    getRemoteQueue().length = 0;
  },
};
