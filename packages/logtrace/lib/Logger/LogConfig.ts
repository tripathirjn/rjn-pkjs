import { getStream } from 'file-stream-rotator';
import path from 'path';
import { stdout } from 'process';
import { default as logConfig } from '../Config/index';
import Utility from '../Utility';
import {
  FileTargetConfig,
  LogLevel,
  LogMode,
  LoggerRule,
  LoggerTargets,
  PrettyPrintConfig,
  TargetOpts,
  TargetParser,
} from '../types';
import PrettyPrint from './PrettyPrint';
import dayjs from 'dayjs';
const ROOT_DIR = process.cwd();

const defaultPrettyPrintConfig = {
  translateTime: 'yyyy-mm-dd hh:MM:ss',
  colorize: true,
  singleLine: false,
  levelFirst: false,
  ignore: 'logLevel',
};

/**
 * Log config
 */
class LogConfig {
  private stream: any[] = [];
  private disableLogger: any[] = [];
  private target: LoggerTargets;
  private rules: LoggerRule[];
  private logDir: string;
  private logPath: string;
  private targetParser: TargetParser;

  constructor(loggerName: string = 'log') {
    this.target = logConfig?.target;
    this.rules = logConfig?.rules;
    this.logDir = logConfig?.logDir || 'logs';
    this.disableLogger = logConfig?.disableLogger || [];
    this.logPath = path.join(ROOT_DIR, this.logDir);

    if (!this.rules || this.rules?.length === 0) {
      throw new Error('rules not defined for logger.');
    }
    if (!this.target) {
      throw new Error('targets are not configured.');
    }
    this.targetParser = {
      logPath: '',
      file: this.getFileTarget,
      console: this.getConsoleTarget,
      remote: this.getRemoteTarget,
    };
    this.refactorRules(loggerName);
    this.ensureLoggerDIR();
    this.applyLogRules();
  }

  /**
   * Refactors rules
   * @param loggerName
   */
  private refactorRules(loggerName: string): void {
    const loggerRules = this.rules.filter((rule) => rule.loggerName !== '*' && rule.loggerName === loggerName);
    const rulesCopy = [...this.rules];
    const ruleList = rulesCopy.filter(
      (rule) =>
        !loggerRules.find((t) => rule.level === t.level && rule.loggerName === '*') &&
        (rule.loggerName === loggerName || rule.loggerName === '*'),
    );
    this.rules = [...ruleList];
  }

  /**
   * Ensures logger dir
   */
  private ensureLoggerDIR(): void {
    this.targetParser.logPath = this.logPath;
    Utility.ensureDirSync(this.logPath);
  }

  /**
   * Apply log rules
   */
  private applyLogRules(): void {
    let fileName: string = '';
    let outputType: LogMode[] = [];
    const streamRules = [];
    for (const { loggerName, level, outputMode } of this.rules) {
      fileName = Utility.toFileNameCase(loggerName === '*' ? level : loggerName);
      outputType = outputMode?.split(',') as LogMode[];
      for (const outMode of outputType) {
        const destination = this.getOutputModeTarget(fileName, outMode);
        if (destination && destination.dest) {
          streamRules.push(this.getStream({ level, ...destination }));
        }
      }
    }
    this.stream = streamRules;
  }

  /**
   * Gets output mode target
   * @param loggerName
   * @param [outMode]
   * @returns
   */
  private getOutputModeTarget(loggerName: string, outMode: LogMode = 'console') {
    const targetModes = Object.keys(this.target);
    if (!targetModes?.includes(outMode)) {
      throw new Error(`Output mode: ${outMode} not defined in target config.`);
    }

    switch (outMode) {
      case 'file':
        return this.targetParser.file(loggerName, this.target.file);
      //   case 'remote':
      // return this.targetParser.remote(loggerName, this.target[outMode]);
      case 'console':
      default:
        return this.targetParser.console(loggerName, this.target.console);
    }
  }

  /**
   * Gets console target
   * @param [loggerName]
   * @param [config]
   * @returns
   */
  private getConsoleTarget(
    loggerName: string,
    config: PrettyPrintConfig = { singleLine: true, colorize: true, hideObject: true },
  ): TargetOpts {
    return {
      dest: stdout,
      prettyPrint: Object.assign(
        {
          customPrettifiers: {
            time: () => `[${dayjs().format('YYYY-MM-DD-hh:MM:ss')}]`,
          },
        },
        {
          hideObject: true,
          messageFormat: (log: any, messageKey: string) => {
            return `[${(log.logger || '').trim()}] ${(log[messageKey] || log?.message || '').trim()}`;
          },
          ...config,
        },
      ),
    };
  }

  /**
   * Gets file target
   * @param loggerName
   * @param opts
   * @returns file target
   */
  private getFileTarget(loggerName: string, opts: FileTargetConfig): TargetOpts {
    const {
      fileName = '%fileName%-%DATE%',
      ext = 'log',
      dateFormat,
      maxLogs,
      prettyPrint,
      ...rest
    }: FileTargetConfig = opts;
    const logFileName = fileName.replace('%fileName%', loggerName);
    return {
      dest: getStream({
        filename: `${this.logPath}/${logFileName}`,
        extension: `.${ext}`,
        verbose: false,
        date_format: dateFormat,
        max_logs: maxLogs,
        ...rest,
      }),
      prettyPrint: Object.assign(defaultPrettyPrintConfig, {
        hideObject: true,
        ...prettyPrint,
        messageFormat(log: any, messageKey: string) {
          return `${log.message?.trim()}`;
        },
      }),
    };
  }

  /**
   * Gets remote target
   * @returns remote target
   */
  private getRemoteTarget(): any {
    return {};
  }

  /**
   * Gets stream
   * @param config
   * @returns
   */
  private getStream(
    config: {
      level: LogLevel;
    } & TargetOpts,
  ) {
    const { level, dest, prettyPrint } = config;
    return {
      level,
      stream: prettyPrint ? new PrettyPrint().getPrettifiedStream({ dest, prettyPrint }) : dest,
    };
  }

  /**
   * Gets stream list
   * @returns
   */
  public getStreamList() {
    return this.stream;
  }

  /**
   * Gets disabled logger
   * @returns
   */
  public getDisabledLogger() {
    return this.disableLogger;
  }
}

export default LogConfig;
