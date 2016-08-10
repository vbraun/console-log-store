

import {Logger as Logger} from './logger';

declare const window: any;

window.Logger = Logger.install(window.console);

