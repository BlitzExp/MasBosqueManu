import { logger } from 'react-native-logs';
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://66419009b5198c74a744673a0ecb6cb1@o4510443059871744.ingest.us.sentry.io/4510443062165504',
  enableInExpoDevelopment: true,
  debug: typeof __DEV__ !== 'undefined' ? (__DEV__ as boolean) : false,
});

const log = logger.createLogger({
  severity: 'debug', 
  transportOptions: ({
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
      debug: 'magenta',
    },
  } as any),
});

class SentryLogger {
  static logEvent(message: string, data: Record<string, any> = {}): void {
    log.info(`[EVENT][SENTRY]: ${message}`, data);
    if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.captureMessage === 'function') {
      (Sentry as any).Native.captureMessage(`${message} | ${JSON.stringify(data)}`);
    }
  }

  static logError(error: Error, context: Record<string, any> = {}): void {
    log.error(`[ERROR][SENTRY]: ${error.message}`, context);
    if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.captureException === 'function') {
      (Sentry as any).Native.captureException(error);
    }
  }

  static logWarning(message: string, data: Record<string, any> = {}): void {
    log.warn(`[WARN][SENTRY]: ${message}`, data);
    if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.captureMessage === 'function') {
      (Sentry as any).Native.captureMessage(`${message} | ${JSON.stringify(data)}`);
    }
  }

  static logDebug(message: string, data: Record<string, any> = {}): void {
    log.debug(`[DEBUG][SENTRY]: ${message}`, data);
  }

  static addBreadcrumb(message: string, data: Record<string, any> = {}): void {
    try {
      log.debug(`[BREADCRUMB][SENTRY]: ${message}`, data);
      if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.addBreadcrumb === 'function') {
        (Sentry as any).Native.addBreadcrumb({ message, data });
      }
    } catch (e) {
      log.error('Failed to add breadcrumb to Sentry', { err: e });
    }
  }

  static captureException(err: any, context: Record<string, any> = {}): void {
    try {
      log.error('[EXCEPTION][SENTRY]:', { err, ...context } as any);
      if (err instanceof Error) {
        if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.captureException === 'function') {
          (Sentry as any).Native.captureException(err);
        }
      } else {
        if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.captureMessage === 'function') {
          (Sentry as any).Native.captureMessage(`Non-Error exception: ${JSON.stringify(err)}`);
        }
      }
    } catch (e) {
      log.error('Failed to capture exception in Sentry', { err: e });
    }
  }

  static setUser(user: { id?: string; email?: string; username?: string } = {}): void {
    try {
      if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.setUser === 'function') {
        (Sentry as any).Native.setUser(user as any);
      }
    } catch (e) {
      log.error('Failed to set Sentry user', { err: e });
    }
  }

  static setContext(name: string, context: Record<string, any> = {}): void {
    try {
      if (Sentry && (Sentry as any).Native && typeof (Sentry as any).Native.setContext === 'function') {
        (Sentry as any).Native.setContext(name, context as any);
      }
    } catch (e) {
      log.error('Failed to set Sentry context', { err: e });
    }
  }
}

export { SentryLogger };

export const LoggingService: any = {
  init(options?: { dsn?: string; enableSentry?: boolean }) {
    if (options?.enableSentry && typeof (Sentry as any).init === 'function') {
      try {
        (Sentry as any).init({ dsn: options.dsn });
        log.info('LoggingService', 'Sentry initialized');
      } catch (e) {
        console.warn('Sentry init failed', e);
        log.warn('LoggingService', 'Sentry init failed', e);
      }
    }
  },
  debug: (tag: string, msg: any) => SentryLogger.logDebug(`${tag}: ${String(msg)}`, { msg }),
  info: (tag: string, msg: any) => SentryLogger.logEvent(`${tag}: ${String(msg)}`, { msg }),
  warn: (tag: string, msg: any, err?: any) => {
    SentryLogger.logWarning(`${tag}: ${String(msg)}`, { err });
    if (err) SentryLogger.captureException(err);
  },
  error: (tag: string, msg: any, err?: any) => {
    if (err instanceof Error) SentryLogger.logError(err, { tag, msg });
    else SentryLogger.logEvent(`${tag}: ${String(msg)}`, {});
  },
  addBreadcrumb: SentryLogger.addBreadcrumb.bind(SentryLogger),
  captureException: SentryLogger.captureException.bind(SentryLogger),
  setUser: SentryLogger.setUser.bind(SentryLogger),
  setContext: SentryLogger.setContext.bind(SentryLogger),
};
