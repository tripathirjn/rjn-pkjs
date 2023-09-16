import LogConfig from './LogConfig';
import Logger from './Logger';

class LogManager {
  /**
   * Logger instance of log manager
   */
  private static loggerInstance: { [key: string]: Logger } = {};

  /**
   * Gets logger
   * @param loggerName
   * @returns
   */
  public static getLogger(loggerName: string) {
    let logger: Logger | null = null;
    const existingLogger = (LogManager.loggerInstance && Object.keys(LogManager.loggerInstance)) || [];
    if (existingLogger?.length === 0 || !existingLogger?.includes(loggerName)) {
      logger = new Logger(loggerName, new LogConfig(loggerName));
      LogManager.loggerInstance[loggerName] = logger;
    } else {
      logger = LogManager.loggerInstance[loggerName];
    }
    return logger;
  }
}

export default LogManager;
