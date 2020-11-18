
import {LogLevel} from './log-level';


export interface LogEntry {
    level: string;
    date: Date;
    message: string;
}


export type LogListener = (LogEntry) => void;


const BUFFER_LENGTH_LIMIT: number = 100;


export class Logger {

    /**
     * Buffer of log messages, with newest entry last.
     */
    private buffer: LogEntry[];

    private listener: LogListener;
    
    private console: Console;
    private consoleLog: (...args) => void;
    private consoleDebug: (...args) => void;
    private consoleError: (...args) => void;
    private consoleInfo: (...args) => void;
    private consoleWarn: (...args) => void;

    private static instance: Logger = undefined;
    
    constructor(consoleObj: Console) {
        this.console = consoleObj;
        this.consoleLog   = consoleObj.log;
        this.consoleDebug = consoleObj.debug;
        this.consoleError = consoleObj.error;
        this.consoleInfo  = consoleObj.info;
        this.consoleWarn  = consoleObj.warn;
        this.clear();
    }

    public static install(consoleObj: Console) {
        if (Logger.instance)
            throw new Error('can only be installed once');
        const logger = Logger.instance || new Logger(consoleObj);
        consoleObj.log   = logger.log;
        consoleObj.debug = logger.debug;
        consoleObj.error = logger.error;
        consoleObj.info  = logger.info;
        consoleObj.warn  = logger.log;
        return logger;
    }

    public setListener(callback: LogListener) {
        this.listener = callback;
    }
    
    public list(): LogEntry[] {
        return this.buffer;
    }

    public clear(): void {
        this.buffer = [];
    }
    
    public debug = (...args) => {
        this.consoleDebug.apply(this.console, args);
        this.storeLogMessage(LogLevel.DEBUG, ...args);
    }

    public error = (...args) => {
        this.consoleError.apply(this.console, args);
        this.storeLogMessage(LogLevel.ERROR, ...args);
    }

    public info = (...args) => {
        this.consoleInfo.apply(this.console, args);
        this.storeLogMessage(LogLevel.INFO, ...args);
    }

    public warn = (...args) => {
        this.consoleWarn.apply(this.console, args);
        this.storeLogMessage(LogLevel.WARN, ...args);
    }

    public log = (...args) => {
        this.consoleLog.apply(this.console, args);
        this.storeLogMessage(LogLevel.DEFAULT, ...args);
    }

    private stringify(obj: any): string {
        // Return strings unchanged
        const isString = (typeof obj === 'string');
        if (isString)
            return obj;
        // Hope that there is a useful obj.toString() method
        // Array.toString() sucks and is excluded
        const isObject = (obj instanceof Object);
        const isArray = (isObject && obj.constructor === Array);
        if (isObject && !isArray) {
            const str = String(obj);
            if (str !== '[object Object]')
                return str;
        }
        // Use JSON.stringify but handle circular references
        const cache = [];
        const limit = 20;
        let count = 0;
        const json = JSON.stringify(obj, function(key, value) {
            count += 1;
            if (count >= limit)
                return;
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    return '[Circular]';
                }
                cache.push(value);
            }
            return value;
        });
        if (count < limit)
            return json;
        return json + ` (${count - limit} values discarded)`;
    }

    private stringifySafe(obj: any): string {
        try {
            return this.stringify(obj);
        } catch (error) {
            // Rarely stringify can raise,
            // e.g. stringify(window.document) can throw a
            // DOMException: Blocked a frame with origin "..." from
            // accessing a cross-origin frame
            return 'stringify failed: ' + error.toString();
        }
    }
    
    private storeLogMessage(level: LogLevel, ...args): void {
        const message: string = args.map(
            (arg) => this.stringifySafe(arg)
        ).join(' ');
        const entry: LogEntry = {
            level: LogLevel[level],
            date: new Date(),
            message: message,
        };
        this.buffer.push(entry);
        if (this.listener)
            this.listener(entry);
        if (this.buffer.length > BUFFER_LENGTH_LIMIT) {
            this.buffer.splice(0, 10);
        }
    }
        
    
}

