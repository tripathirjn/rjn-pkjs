import FileStreamRotator from 'file-stream-rotator/lib/FileStreamRotator';
import { Writable } from 'stream';

export enum LogLabel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
  TRACE = 'trace',
}

export type LogExt = 'log' | 'txt';
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
export type LogMode = 'console' | 'file' | 'remote';
export type LogLevel = 'info' | 'warn' | 'debug' | 'error' | 'trace' | 'fatal';
export type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type PrettyPrintConfigType = {
  translateTime: string;
  ignore: string;
  colorize: boolean;
  singleLine: boolean;
  levelFirst: boolean;
};

export type FileTargetConfig = {
  fileName: string;
  ext: LogExt;
  maxLogs: string;
  frequency: string;
  maxSize: string;
  dateFormat: string;
  prettyPrint: PrettyPrintConfig;
};

export type RemoteTargetConfig = {
  url: string;
  method: HttpMethod;
  format: string;
  prettyPrint: PrettyPrintConfig;
};

export type PrettyPrintConfig = {
  singleLine: boolean;
  colorize: boolean;
  hideObject?: boolean;
};
export type PrettyPrintOpts = PrettyPrintConfig & {
  hideObject: boolean;
  messageFormat?: (log: any, messageKey: string) => string;
};
export type LoggerTargets = {
  console: PrettyPrintConfig;
  file: FileTargetConfig;
  remote: RemoteTargetConfig;
};

export type LoggerRule = {
  loggerName: string;
  level: LogLevel;
  outputMode: LogMode;
};

export type LoggerConfig = {
  logDir: string;
  target: LoggerTargets;
  disableLogger: string[] | any[];
  rules: LoggerRule[];
};

export type TargetOpts = {
  dest: Writable | FileStreamRotator;
  prettyPrint: PrettyPrintOpts;
};

export type ConsoleTargetParserFn = (loggerName: string, opts: PrettyPrintConfig) => TargetOpts;
export type FileTargetParserFn = (loggerName: string, opts: FileTargetConfig) => TargetOpts;
export type RemoteTargetParserFn = (loggerName: string, opts: RemoteTargetConfig) => TargetOpts;

export type TargetParser = {
  logPath: string;
  file: FileTargetParserFn;
  console: ConsoleTargetParserFn;
  remote?: RemoteTargetParserFn;
};

export type PrettifierMetaWrapper = {
  lastLevel: number;
  lastMsg: null | string;
  lastObj: null | object;
  lastLogger: null | string;
  lastTime: null | Date;
  flushSync: () => void;
  chindings: () => any;
  write: (chunk: any) => void;
} & { [key: symbol]: boolean };

export interface ILogger {
  trace(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  debug(...args: any[]): void;
  error(...args: any[]): void;
  log(level: Level, ...args: any[]): void;
  exception(level: Level, error: Error, extra: any): void;
}
