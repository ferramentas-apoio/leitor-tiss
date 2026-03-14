/**
 * Servico de logging singleton para o sistema Leitor TISS.
 * Armazena logs em memoria com limite configuravel e exibe no console.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly data?: unknown;
  readonly timestamp: Date;
  readonly source: string;
}

/** Interface publica do logger com source pre-definido */
export interface SourceLogger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

const LEVEL_LABELS: Readonly<Record<LogLevel, string>> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE',
};

class Logger {
  private static instance: Logger;
  private level: LogLevel = LogLevel.DEBUG;
  private readonly logs: LogEntry[] = [];
  private readonly maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  getLogs(): readonly LogEntry[] {
    return this.logs;
  }

  clear(): void {
    this.logs.length = 0;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private addLog(level: LogLevel, message: string, data: unknown, source: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      source,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = `[${LEVEL_LABELS[level]}] [${source}]`;
    const args: unknown[] = data !== undefined ? [data] : [];

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, data?: unknown, source = 'App'): void {
    this.addLog(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: unknown, source = 'App'): void {
    this.addLog(LogLevel.INFO, message, data, source);
  }

  warn(message: string, data?: unknown, source = 'App'): void {
    this.addLog(LogLevel.WARN, message, data, source);
  }

  error(message: string, data?: unknown, source = 'App'): void {
    this.addLog(LogLevel.ERROR, message, data, source);
  }
}

export const logger = Logger.getInstance();

/**
 * Cria uma instancia de logger com source pre-definido.
 * Uso: `const log = createLogger('MeuModulo');`
 */
export function createLogger(source: string): SourceLogger {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, data, source),
    info: (message: string, data?: unknown) => logger.info(message, data, source),
    warn: (message: string, data?: unknown) => logger.warn(message, data, source),
    error: (message: string, data?: unknown) => logger.error(message, data, source),
  };
}
