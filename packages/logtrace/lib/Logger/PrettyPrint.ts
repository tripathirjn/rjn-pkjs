import { symbols } from 'pino';
import { prettyFactory as PinoPrettyFactory } from 'pino-pretty';
import { PrettifierMetaWrapper } from '../types';
const {
  chindingsSym,
  parsedChindingsSym,
  serializersSym,
  stringifiersSym,
  needsMetadataGsym,
  redactFmtSym,
  formattersSym,
  messageKeySym,
} = symbols;

/**
 * Pretty print
 */
class PrettyPrint {
  /**
   * Gets prettified stream
   */
  public getPrettifiedStream(args: any = {}) {
    const prettyPrint = args.opts || args.prettyPrint;
    const { prettifier, dest = process.stdout } = args;
    return this.getPrettyStream(prettyPrint, prettifier, dest);
  }
  private getPrettyStream(opts: any, prettifier: any, dest: PrettifierMetaWrapper): any;
  private getPrettyStream(opts: any, prettifier: any, dest: PrettifierMetaWrapper, instance = null): any {
    if (prettifier && typeof prettifier === 'function') {
      prettifier = prettifier.bind(instance);
      return this.prettifierMetaWrapper(prettifier(opts), dest, opts);
    }
    try {
      const prettyFactory = PinoPrettyFactory as (opt: any) => (inputData: any) => string;
      return this.prettifierMetaWrapper(prettyFactory(opts), dest, opts);
    } catch (e) {
      throw e;
    }
  }
  private setMetadataProps(dest: PrettifierMetaWrapper, that: any) {
    if (dest[needsMetadataGsym] === true) {
      dest.lastLevel = that.lastLevel;
      dest.lastMsg = that.lastMsg;
      dest.lastObj = that.lastObj;
      dest.lastTime = that.lastTime;
      dest.lastLogger = that.lastLogger;
    }
  }
  private prettifierMetaWrapper(pretty: any, dest: PrettifierMetaWrapper, opts: any): PrettifierMetaWrapper {
    opts = Object.assign({ suppressFlushSyncWarning: false }, opts);
    let warned = false;
    const scope: PrettyPrint = this;
    return {
      [needsMetadataGsym]: true,
      lastLevel: 0,
      lastMsg: null,
      lastObj: null,
      lastLogger: null,
      lastTime: null,
      flushSync() {
        if (opts.suppressFlushSyncWarning || warned) {
          return;
        }
        warned = true;
        scope.setMetadataProps(dest, this);
        dest.write(
          pretty(
            Object.assign(
              {
                level: 40, // warn
                msg: 'pino.final with prettyPrint does not support flushing',
                time: Date.now(),
              },
              this.chindings(),
            ),
          ),
        );
      },
      chindings() {
        const lastLogger = this.lastLogger as any;
        let chindings = null;

        // protection against flushSync being called before logging
        // anything
        if (!lastLogger) {
          return null;
        }

        if (lastLogger.hasOwnProperty(parsedChindingsSym)) {
          chindings = lastLogger[parsedChindingsSym];
        } else {
          chindings = JSON.parse('{' + lastLogger[chindingsSym].substr(1) + '}');
          lastLogger[parsedChindingsSym] = chindings;
        }

        return chindings;
      },
      write(chunk: any) {
        const lastLogger = this.lastLogger as any;
        const chindings = this.chindings();

        let time = this.lastTime as any;

        /* istanbul ignore next */
        if (typeof time === 'number') {
          // do nothing!
        } else if (time.match(/^\d+/)) {
          time = parseInt(time, undefined);
        } else {
          time = time.slice(1, -1);
        }

        const lastObj = this.lastObj;
        const lastMsg = this.lastMsg;
        const errorProps = null;

        const formatters = lastLogger[formattersSym];
        const formattedObj = formatters.log ? formatters.log(lastObj) : lastObj;

        const messageKey = lastLogger[messageKeySym];
        if (lastMsg && formattedObj && !Object.prototype.hasOwnProperty.call(formattedObj, messageKey)) {
          formattedObj[messageKey] = lastMsg;
        }

        const obj: any = Object.assign(
          {
            level: this.lastLevel,
            time,
          },
          formattedObj,
          errorProps,
        );

        const serializers = lastLogger[serializersSym];
        const keys = Object.keys(serializers);

        for (const key of keys) {
          if (obj[key] !== undefined) {
            obj[key] = serializers[key](obj[key]);
          }
        }

        for (const key in chindings) {
          if (!obj.hasOwnProperty(key)) {
            obj[key] = chindings[key];
          }
        }
        const stringifiers = lastLogger[stringifiersSym];
        const redact = stringifiers[redactFmtSym];

        const formatted = pretty(typeof redact === 'function' ? redact(obj) : obj);
        if (formatted === undefined) return;

        scope.setMetadataProps(dest, this);
        dest.write(formatted);
      },
    } as PrettifierMetaWrapper;
  }
}

export default PrettyPrint;
