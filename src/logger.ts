
import {LogLevel} from './log-level';


export interface LogEntry {
    level: string;
    date: Date;
    message: string;
}


const BUFFER_LENGTH_LIMIT: number = 100;


export class Logger {

    /**
     * Buffer of log messages, with newest entry last.
     */
    private buffer: LogEntry[];

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

    private storeLogMessage(level: LogLevel, ...args): void {
        const message: string = args.map(
            (arg) => String(arg)
        ).join(' ');
        this.buffer.push({
            level: LogLevel[level],
            date: new Date(),
            message: message,
        });
        if (this.buffer.length > BUFFER_LENGTH_LIMIT) {
            this.buffer.splice(0, 10);
        }
    }
        
    
}

