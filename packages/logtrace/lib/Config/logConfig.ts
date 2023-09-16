import { LoggerConfig } from '../types';

const logConfig: LoggerConfig = {
  logDir: 'logs',
  target: {
    console: {
      singleLine: false,
      colorize: true,
      hideObject: true,
    },
    file: {
      fileName: '%fileName%-%DATE%',
      ext: 'log',
      maxLogs: '10d',
      frequency: 'daily',
      maxSize: '1mb',
      dateFormat: 'YYYY-MM-DD',
      prettyPrint: {
        singleLine: false,
        colorize: false,
        hideObject: true,
      },
    },
    remote: {
      url: '',
      method: 'POST',
      format: '',
      prettyPrint: {
        singleLine: false,
        colorize: false,
      },
    },
  },
  rules: [
    { loggerName: '*', level: 'info', outputMode: 'console' },
    { loggerName: '*', level: 'debug', outputMode: 'console' },
    { loggerName: '*', level: 'debug', outputMode: 'file' },
    { loggerName: '*', level: 'error', outputMode: 'file' },
  ],
  disableLogger: [],
};

export default logConfig;
