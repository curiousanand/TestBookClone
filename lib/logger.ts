/**
 * Logging System for TestBook Clone
 * 
 * Provides structured logging with different levels, formatting, and persistence options.
 * Supports both client-side and server-side logging with appropriate configurations.
 */

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  environment?: string;
  version?: string;
  [key: string]: any;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageEntries: number;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  context?: Partial<LogContext>;
}

// =============================================================================
// LOG LEVELS
// =============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#6B7280',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
  fatal: '#DC2626',
};

// =============================================================================
// LOGGER CLASS
// =============================================================================

class Logger {
  private config: LoggerConfig;
  private context: LogContext;
  private logQueue: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      enableConsole: true,
      enableStorage: typeof window !== 'undefined',
      enableRemote: process.env.NODE_ENV === 'production',
      maxStorageEntries: 1000,
      remoteEndpoint: '/api/logs',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    this.context = {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      ...config.context,
    };

    // Set up periodic flushing for remote logging
    if (this.config.enableRemote && typeof window !== 'undefined') {
      this.startPeriodicFlush();
    }

    // Set up browser unload handler to flush remaining logs
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  // =============================================================================
  // CORE LOGGING METHODS
  // =============================================================================

  debug(message: string, data?: any, context?: Partial<LogContext>): void {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: Partial<LogContext>): void {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: Partial<LogContext>): void {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: Partial<LogContext>): void {
    this.log('error', message, data, context);
  }

  fatal(message: string, data?: any, context?: Partial<LogContext>): void {
    this.log('fatal', message, data, context);
  }

  // Log errors with automatic error object parsing
  logError(error: Error | unknown, message?: string, context?: Partial<LogContext>): void {
    let errorData: any;
    let errorMessage = message || 'An error occurred';

    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      if (!message) {
        errorMessage = error.message;
      }
    } else {
      errorData = { error };
    }

    this.log('error', errorMessage, errorData, context);
  }

  // =============================================================================
  // PRIVATE LOGGING IMPLEMENTATION
  // =============================================================================

  private log(level: LogLevel, message: string, data?: any, context?: Partial<LogContext>): void {
    // Check if log level should be processed
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.level]) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context: { ...this.context, ...context },
    };

    // Extract error information if data contains an error
    if (data?.error instanceof Error) {
      logEntry.error = {
        name: data.error.name,
        message: data.error.message,
        stack: data.error.stack,
      };
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Local storage logging
    if (this.config.enableStorage) {
      this.logToStorage(logEntry);
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.logToRemote(logEntry);
    }
  }

  // =============================================================================
  // CONSOLE LOGGING
  // =============================================================================

  private logToConsole(entry: LogEntry): void {
    if (typeof window === 'undefined') {
      // Server-side console logging
      console[entry.level === 'fatal' ? 'error' : entry.level](
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.data ? entry.data : ''
      );
      return;
    }

    // Client-side console logging with colors
    const color = LOG_COLORS[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    console.group(
      `%c[${timestamp}] ${entry.level.toUpperCase()}%c ${entry.message}`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit;'
    );

    if (entry.data) {
      console.log('Data:', entry.data);
    }

    if (entry.error) {
      console.error('Error:', entry.error);
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('Context:', entry.context);
    }

    console.groupEnd();
  }

  // =============================================================================
  // LOCAL STORAGE LOGGING
  // =============================================================================

  private logToStorage(entry: LogEntry): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = 'testbook_logs';
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      existingLogs.push(entry);

      // Maintain max entries limit
      if (existingLogs.length > this.config.maxStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.config.maxStorageEntries);
      }

      localStorage.setItem(storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      // If localStorage is full or unavailable, just log to console
      console.warn('Failed to store log entry:', error);
    }
  }

  // =============================================================================
  // REMOTE LOGGING
  // =============================================================================

  private logToRemote(entry: LogEntry): void {
    this.logQueue.push(entry);

    // Flush if batch size is reached
    if (this.logQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.logQueue.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    // Send logs to remote endpoint
    this.sendLogsToRemote(logsToSend).catch(error => {
      // If sending fails, add logs back to queue (with limit)
      this.logQueue.unshift(...logsToSend.slice(-this.config.batchSize));
      console.warn('Failed to send logs to remote endpoint:', error);
    });
  }

  private async sendLogsToRemote(logs: LogEntry[]): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      throw error;
    }
  }

  private startPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): LogContext {
    return { ...this.context };
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getStoredLogs(): LogEntry[] {
    if (typeof window === 'undefined') return [];

    try {
      const storageKey = 'testbook_logs';
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  }

  clearStoredLogs(): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = 'testbook_logs';
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }

  downloadLogs(): void {
    if (typeof window === 'undefined') return;

    const logs = this.getStoredLogs();
    const logsJson = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `testbook-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Create child logger with additional context
  child(context: Partial<LogContext>): Logger {
    return new Logger({
      ...this.config,
      context: { ...this.context, ...context },
    });
  }

  // =============================================================================
  // PERFORMANCE LOGGING
  // =============================================================================

  time(label: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = performance.now();
      (window as any)[`__logger_timer_${label}`] = startTime;
    }
  }

  timeEnd(label: string, context?: Partial<LogContext>): void {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = (window as any)[`__logger_timer_${label}`];
      if (startTime !== undefined) {
        const duration = performance.now() - startTime;
        this.info(`Timer ${label}`, { duration: `${duration.toFixed(2)}ms` }, context);
        delete (window as any)[`__logger_timer_${label}`];
      }
    }
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// =============================================================================
// DEFAULT LOGGER INSTANCE
// =============================================================================

export const logger = new Logger();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}

export function setLogContext(context: Partial<LogContext>): void {
  logger.setContext(context);
}

// =============================================================================
// REACT HOOKS
// =============================================================================

export function useLogger(component?: string) {
  if (typeof window !== 'undefined' && component) {
    return logger.child({ component });
  }
  return logger;
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add logger to window for debugging
  (window as any).__logger = logger;
  
  // Add helpful console commands
  (window as any).__downloadLogs = () => logger.downloadLogs();
  (window as any).__clearLogs = () => logger.clearStoredLogs();
  (window as any).__showLogs = () => console.table(logger.getStoredLogs());
}