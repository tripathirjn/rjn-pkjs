import { pino } from 'pino';
import LogConfig from './LogConfig';
import dayjs from 'dayjs';
import { ILogger, Level, LogLabel } from '../types';

/**
 * Logger
 */
class Logger implements ILogger {
  /**
   * Logger config of logger
   */
  private loggerConfig: LogConfig;

  /**
   * Logger  of logger
   */
  private logger: any;

  /**
   * Date time format of logger
   */
  private dateTimeFormat: string = 'YYYY-MM-DD HH:mm:ss';

  /**
   * Creates an instance of logger.
   * @param [loggerName]
   * @param loggerConfig
   */
  constructor(loggerName: string = 'logger', loggerConfig: LogConfig) {
    this.loggerConfig = loggerConfig;

    this.logger = pino(
      {
        name: loggerName,
        enabled: true,
        level: 'trace',
        timestamp: () => `,"time":"${dayjs().format(this.dateTimeFormat)}"`,
        messageKey: 'message',
        mixin(_context, level) {
          return { logger: loggerName, logLevel: pino.levels.labels[level] };
        },
        formatters: {
          level(label, _logNumber) {
            return { level: label?.toUpperCase() };
          },
          bindings(bindings) {
            return { pid: bindings.pid, hostname: bindings.hostname };
          },
        },
      },
      pino.multistream(this.loggerConfig.getStreamList(), { dedupe: true }),
    );
  }

  /**
   * Exceptions logger
   * @param level
   * @param error
   * @param extra
   */
  public exception(level: Level, error: Error | string, extra: any): void {
    const globalData = global as any;
    const req: any = globalData?.reqInfo;
    if (typeof error === 'string') error = new Error(error);
    const frame = error?.stack?.split('\n')[1]?.split(' ');
    const filePath = frame && frame[frame?.length - 1]?.split('/');
    const fileInfo = filePath && filePath[filePath?.length - 1]?.split(':');
    const fileName = fileInfo && fileInfo[0];
    const lineNumber = fileInfo && `${fileInfo[1]}:${fileInfo[2].replace(')', '')}`;

    const errorInfo = {
      // If we have a request object then parse it otherwise it is null
      reqInfo: req
        ? {
            req: {
              req: req?.method,
              path: req?.path,
              body: req?.body,
              query: req?.query,
              params: req?.params,
              host: req?.headers?.host,
            },
            user: req?.user
              ? {
                  id: req.user.id,
                  name: req.user.name,
                }
              : null,
            server: {
              ip: req.ip,
              servertime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            },
          }
        : {},
      message: error?.message,
      fileName,
      lineNumber,
      errorType: error?.name,
      stack: error?.stack || error,
      env: process.env.NODE_ENV || 'development',
    };
    this.log(level, errorInfo);
  }

  /**
   * Trace logger
   * @param args
   */
  public trace(...args: any[]): void {
    this.log(LogLabel.TRACE, ...args);
  }

  /**
   * Info logger
   * @param args
   */
  public info(...args: any[]): void {
    this.log(LogLabel.INFO, ...args);
  }

  /**
   * Warn logger
   * @param args
   */
  public warn(...args: any[]): void {
    this.log(LogLabel.WARN, ...args);
  }

  /**
   * Debug logger
   * @param args
   */
  public debug(...args: any[]): void {
    this.log(LogLabel.DEBUG, ...args);
  }

  /**
   * Error logger
   * @param args
   */
  public error(...args: any[]): void {
    this.log(LogLabel.ERROR, ...args);
  }

  /**
   * Log logger
   * @param level
   * @param args
   */
  public log(level: Level, ...args: any[]): void {
    this.logger[level](...args);
  }
}

export default Logger;
