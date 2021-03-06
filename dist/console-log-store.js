"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
        LogLevel[LogLevel["INFO"] = 1] = "INFO";
        LogLevel[LogLevel["DEFAULT"] = 2] = "DEFAULT";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    })(LogLevel || (LogLevel = {}));
    ;

    var BUFFER_LENGTH_LIMIT = 100;

    var Logger = function () {
        function Logger(consoleObj) {
            var _this = this;

            _classCallCheck(this, Logger);

            this.debug = function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                _this.consoleDebug.apply(_this.console, args);
                _this.storeLogMessage.apply(_this, [LogLevel.DEBUG].concat(args));
            };
            this.error = function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                _this.consoleError.apply(_this.console, args);
                _this.storeLogMessage.apply(_this, [LogLevel.ERROR].concat(args));
            };
            this.info = function () {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                _this.consoleInfo.apply(_this.console, args);
                _this.storeLogMessage.apply(_this, [LogLevel.INFO].concat(args));
            };
            this.warn = function () {
                for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                }

                _this.consoleWarn.apply(_this.console, args);
                _this.storeLogMessage.apply(_this, [LogLevel.WARN].concat(args));
            };
            this.log = function () {
                for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                    args[_key5] = arguments[_key5];
                }

                _this.consoleLog.apply(_this.console, args);
                _this.storeLogMessage.apply(_this, [LogLevel.DEFAULT].concat(args));
            };
            this.console = consoleObj;
            this.consoleLog = consoleObj.log;
            this.consoleDebug = consoleObj.debug;
            this.consoleError = consoleObj.error;
            this.consoleInfo = consoleObj.info;
            this.consoleWarn = consoleObj.warn;
            this.clear();
        }

        _createClass(Logger, [{
            key: "setListener",
            value: function setListener(callback) {
                this.listener = callback;
            }
        }, {
            key: "list",
            value: function list() {
                return this.buffer;
            }
        }, {
            key: "clear",
            value: function clear() {
                this.buffer = [];
            }
        }, {
            key: "stringify",
            value: function stringify(obj) {
                var isString = typeof obj === 'string';
                if (isString) return obj;
                var isObject = obj instanceof Object;
                var isArray = isObject && obj.constructor === Array;
                if (isObject && !isArray) {
                    var str = String(obj);
                    if (str !== '[object Object]') return str;
                }
                var cache = [];
                var limit = 20;
                var count = 0;
                var json = JSON.stringify(obj, function (key, value) {
                    count += 1;
                    if (count >= limit) return;
                    if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            return '[Circular]';
                        }
                        cache.push(value);
                    }
                    return value;
                });
                if (count < limit) return json;
                return json + (" (" + (count - limit) + " values discarded)");
            }
        }, {
            key: "stringifySafe",
            value: function stringifySafe(obj) {
                try {
                    return this.stringify(obj);
                } catch (error) {
                    return 'stringify failed: ' + error.toString();
                }
            }
        }, {
            key: "storeLogMessage",
            value: function storeLogMessage(level) {
                var _this2 = this;

                for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
                    args[_key6 - 1] = arguments[_key6];
                }

                var message = args.map(function (arg) {
                    return _this2.stringifySafe(arg);
                }).join(' ');
                var entry = {
                    level: LogLevel[level],
                    date: new Date(),
                    message: message
                };
                this.buffer.push(entry);
                if (this.listener) this.listener(entry);
                if (this.buffer.length > BUFFER_LENGTH_LIMIT) {
                    this.buffer.splice(0, 10);
                }
            }
        }], [{
            key: "install",
            value: function install(consoleObj) {
                if (Logger.instance) throw new Error('can only be installed once');
                var logger = Logger.instance || new Logger(consoleObj);
                consoleObj.log = logger.log;
                consoleObj.debug = logger.debug;
                consoleObj.error = logger.error;
                consoleObj.info = logger.info;
                consoleObj.warn = logger.log;
                return logger;
            }
        }]);

        return Logger;
    }();

    Logger.instance = undefined;

    window.Logger = Logger.install(window.console);
})();
