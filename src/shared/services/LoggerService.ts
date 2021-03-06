import { Env } from './../../shared/Env';
import * as winston from 'winston';
import * as chalk from 'chalk';
import * as PrettyError from 'pretty-error'; // it's really handy to make your life easier
import { LoggerInstance, LoggerOptions, Transport } from 'winston';
import { Component } from '@nestjs/common';

@Component()
export class LoggerService {
    private readonly logger: LoggerInstance;
    private readonly prettyError = new PrettyError();
    public static loggerOptions: LoggerOptions = {
        transports: [
            new winston.transports.File({
                filename: Env('LOG_FILE', 'app.dev.log'), // i will explain this later
                json: true,
                prettyPrint: true,
                timestamp: true,
            }),
        ],
    };
    constructor(private context: string, transport?) {
        this.logger = (winston as any).createLogger(LoggerService.loggerOptions);
        this.prettyError.skipNodeFiles();
        this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
    }
    get Logger(): LoggerInstance {
        return this.logger; // idk why i have this in my code !
    }
    static configGlobal(options?: LoggerOptions) {
        this.loggerOptions = options;
    }
    debug(message: string): void {
        const currentDate = new Date();
        this.logger.debug(message, {
            timestamp: currentDate.toISOString(),
            context: this.context,
        });
        this.formatedLog('debug', message);
    }
    info(message: string): void {
        this.log(message);
    }
    log(message: string): void {
        const currentDate = new Date();
        this.logger.info(message, {
            timestamp: currentDate.toISOString(),
            context: this.context,
        });
        this.formatedLog('info', message);
    }
    error(message: string, trace?: any): void {
        const currentDate = new Date();
        // i think the trace should be JSON Stringified
        this.logger.error(`${message} -> (${trace || 'trace not provided !'})`, {
            timestamp: currentDate.toISOString(),
            context: this.context,
        });
        this.formatedLog('error', message, trace);
    }
    warn(message: string): void {
        const currentDate = new Date();
        this.logger.warn(message, {
            timestamp: currentDate.toISOString(),
            context: this.context,
        });
        this.formatedLog('warn', message);
    }
    overrideOptions(options: LoggerOptions) {
        this.logger.configure(options);
    }
    // this method just for printing a cool log in your terminal , using chalk
    private formatedLog(level: string, message: string, error?): void {
        let result = '';
        const color = chalk.default;
        const currentDate = new Date();
        const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

        switch (level) {
            case 'debug':
                result = `[${color.magenta('DEBUG')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
                    this.context,
                )}] ${message}`;
                break;
            case 'info':
                result = `[${color.blue('INFO')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
                    this.context,
                )}] ${message}`;
                break;
            case 'error':
                result = `[${color.red('ERROR')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
                    this.context,
                )}] ${message}`;
                if (error && Env('NODE_ENV') === 'dev') this.prettyError.render(error, true);
                break;
            case 'warn':
                result = `[${color.yellow('WARNING')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
                    this.context,
                )}] ${message}`;
                break;
            default:
                break;
        }
        console.log(result);
    }
}