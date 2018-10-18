!function(modules) {
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: !1
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.loaded = !0, module.exports;
    }
    var installedModules = {};
    return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
    __webpack_require__.p = "", __webpack_require__(0);
}({
    0: function(module, exports, __webpack_require__) {
        "use strict";
        function run() {
            render();
        }
        function render() {
            var options = config.get(getModules());
            options.title = i18n.message("options.label") + ": " + i18n.message("extension.title"), 
            options.name = i18n.message("extension.title");
            var html = template(options);
            optionsPage.render(html, i18n.message("extension.title"));
        }
        function getModules() {
            return Object.keys(buildInfo.get("modules"));
        }
        var initer = __webpack_require__(68), dispatcher = __webpack_require__(242), buildInfo = __webpack_require__(230), i18n = __webpack_require__(93), config = __webpack_require__(263), optionsPage = __webpack_require__(264), template = __webpack_require__(268);
        initer([ dispatcher ], function() {
            run();
        });
    },
    6: function(module, exports, __webpack_require__) {
        (function(global) {
            "use strict";
            var utils = __webpack_require__(7), innerDispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), globalScope = "undefined" == typeof window ? global : window, defaultPostfix = ":default", nanoId = "_chrome-nano_", Preferences = function() {
                this.set(nanoId, !0);
            };
            Preferences.prototype = {
                get: function(name, defaults) {
                    var value = this.restore(name);
                    return "undefined" == typeof value && (value = this.restore(name + defaultPostfix)), 
                    utils.isDefined(value) ? this.processValue(value) : defaults;
                },
                set: function(name, value) {
                    var data = {
                        name: name,
                        value: value
                    };
                    this._triggerEvent(AppEvent.PREFERENCE_SET, data), this.restore(name) !== JSON.stringify(value) && (this.store(name, JSON.stringify(value)), 
                    this._triggerEvent(AppEvent.PREFERENCE_CHANGED, data));
                },
                remove: function(name) {
                    this.set(name, void 0);
                },
                weakSet: function(name, value) {
                    this.get(name) || this.set(name, value);
                },
                store: function(name, value) {
                    return "undefined" != typeof value ? globalScope.localStorage.setItem(name, value) : globalScope.localStorage.removeItem(name), 
                    value;
                },
                restore: function(name) {
                    if (name in globalScope.localStorage) return globalScope.localStorage.getItem(name);
                },
                defaults: function(defaults) {
                    var data;
                    "string" == typeof defaults ? (data = {}, data[arguments[0]] = arguments[1]) : data = defaults, 
                    Object.keys(data).forEach(function(name) {
                        this.restore(name + defaultPostfix) || this.set(name + defaultPostfix, data[name]);
                    }.bind(this));
                },
                dump: function(data) {
                    Object.keys(data).forEach(function(key) {
                        this.set(key, data[key]);
                    }.bind(this));
                },
                names: function() {
                    return Object.keys(globalScope.localStorage);
                },
                migrate: function(name, transform, condition) {
                    var value = this.get(name);
                    condition && "type" in condition && typeof value !== condition.type || (value = transform.call(this, value), 
                    this.set(name, value));
                },
                restoreDefaults: function() {
                    var _this = this, names = this.names();
                    names.forEach(function(key) {
                        _this._restore(key);
                    });
                },
                getDefault: function(key) {
                    var value = this.restore(key + defaultPostfix);
                    return utils.isDefined(value) ? this.processValue(value) : void 0;
                },
                setDefault: function(key, value) {
                    this.store(key + defaultPostfix, value);
                },
                processValue: function(value) {
                    try {
                        return JSON.parse(value);
                    } catch (e) {}
                    return value;
                },
                _restore: function(key) {
                    var clearKey = this._getClearKey(key);
                    if (clearKey) {
                        var oldValue = this.get(clearKey), newValue = this.get(key), data = {
                            name: clearKey,
                            value: newValue
                        };
                        this.store(clearKey), this._triggerEvent(AppEvent.PREFERENCE_SET, data), newValue !== oldValue && this._triggerEvent(AppEvent.PREFERENCE_CHANGED, data);
                    }
                },
                _getClearKey: function(key) {
                    var position = key.indexOf(defaultPostfix);
                    return position >= 0 && position === key.length - defaultPostfix.length ? key.substr(0, position) : null;
                },
                _triggerEvent: function(event, data) {
                    innerDispatcher.trigger(event, data);
                }
            }, module.exports = new Preferences();
        }).call(exports, function() {
            return this;
        }());
    },
    7: function(module, exports, __webpack_require__) {
        "use strict";
        var Is = __webpack_require__(8);
        module.exports = {
            httpRule: /^http(s)?:\/\/.*/i,
            browserProtocol: /^(chrome|chrome-extension|opera|browser):\/\/.*/i,
            isString: Is.isString,
            isNumber: Is.isNumber,
            isArray: Is.isArray,
            isObject: Is.isObject,
            isFunction: Is.isFunction,
            isDefined: function(param) {
                return "undefined" != typeof param && null !== param;
            },
            isRegexp: Is.isRegexp,
            isEmpty: Is.isEmpty,
            objectMerge: function(object, data) {
                return this.isObject(object) && this.isObject(data) && Object.keys(data).forEach(function(key) {
                    object[key] = data[key];
                }), object;
            },
            isHttp: function(url) {
                return this.httpRule.test(url);
            },
            isBrowserProtocol: function(url) {
                return this.browserProtocol.test(url);
            },
            objectUpdate: function(object) {
                var self = this;
                return Array.prototype.slice.call(arguments, 1).forEach(function(data) {
                    Is.isObject(data) && Object.keys(data).forEach(function(key) {
                        var value = data[key];
                        value && self.isObject(value) ? (object[key] && self.isObject(object[key]) || (object[key] = {}), 
                        self.objectUpdate(object[key], value)) : object[key] = value;
                    });
                }), object;
            },
            flatObject: function(object, delimiter, parent) {
                delimiter = delimiter || ".", parent = parent || "";
                var flat = {}, self = this;
                return this.isObject(object) ? (Object.keys(object).forEach(function(key) {
                    var compositeKey = parent + key;
                    if (self.isString(object[key]) || self.isNumber(object[key])) flat[compositeKey] = object[key]; else {
                        var path = compositeKey + delimiter;
                        flat = self.objectMerge(flat, self.flatObject(object[key], delimiter, path));
                    }
                }), flat) : object;
            },
            clamp: function(value, min, max) {
                return value < min ? min : value > max ? max : value;
            },
            getUI: function() {
                for (var ui = "{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}", mask = "0123456789ABCDEF"; ui.indexOf("x") !== -1; ) ui = ui.replace("x", mask[Math.floor(16 * Math.random())]);
                return ui;
            },
            serializeUrl: function(obj) {
                if (!this.isObject(obj)) return obj;
                var pairs = [];
                return Object.keys(obj).forEach(function(key) {
                    pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
                }), pairs.join("&");
            },
            deserializeUrl: function(url) {
                var pairs, parts, obj = {}, rule = /^https?.+\?(.+)/i;
                return this.isString(url) && url.length > 0 && (pairs = url.replace(rule, "$1").split("&")), 
                pairs && pairs.length > 0 && pairs.forEach(function(pair) {
                    parts = pair.split("="), obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
                }), obj;
            },
            generateUrl: function(url, params) {
                return url + "?" + this.serializeUrl(params);
            },
            dataUriToBlob: function(uri) {
                var pair = uri.split(","), hash = null, dataString = null, buffer = null, uIntArray = null, mimeString = null;
                pair.length > 1 && (hash = pair[1]);
                try {
                    mimeString = pair[0].split(":")[1].split(";")[0];
                } catch (e) {
                    mimeString = "image";
                }
                if (hash) try {
                    dataString = atob(hash);
                } catch (e) {}
                dataString && (buffer = new ArrayBuffer(dataString.length)), buffer && (uIntArray = new Uint8Array(buffer));
                for (var i = 0, max = dataString.length; i < max; i++) uIntArray[i] = dataString.charCodeAt(i);
                return new Blob([ uIntArray ], {
                    type: mimeString
                });
            },
            path: function(obj, path, delimiter) {
                delimiter = delimiter || ".";
                for (var parts = path.split(delimiter), node = obj, i = 0; i < parts.length; i++) if (node = node[parts[i]], 
                void 0 === node) return;
                return node;
            },
            isEqualArrays: function(a, b) {
                return !(!this.isArray(a) || !this.isArray(b)) && (a.length === b.length && (a = a.sort(), 
                b = b.sort(), a.every(function(item, index) {
                    return item === b[index];
                })));
            },
            toArray: function(data) {
                return [].slice.call(data);
            },
            cleanArray: function(array) {
                var self = this;
                return this.isArray(array) ? array.filter(function(item) {
                    return self.isDefined(item);
                }) : array;
            },
            toClipBoard: function(string) {
                var div = document.createElement("div");
                div.contentEditable = !0, document.body.appendChild(div), div.innerHTML = string, 
                div.unselectable = "off", div.focus(), document.execCommand("SelectAll"), document.execCommand("Copy", !1, null), 
                document.body.removeChild(div);
            },
            debounce: function(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments, later = function() {
                        timeout = null, immediate || func.apply(context, args);
                    }, callNow = immediate && !timeout;
                    clearTimeout(timeout), timeout = setTimeout(later, wait), callNow && func.apply(context, args);
                };
            },
            dateToString: function(date) {
                return [ this.leadingZeros(date.getDate()), this.leadingZeros(date.getMonth() + 1), date.getFullYear() ].join(".");
            },
            leadingZeros: function(number) {
                return (number < 10 && number >= 0 ? "0" : "") + number;
            },
            random: function(min, max) {
                if (min > max) throw new Error("illegal arguments for random");
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
            chance: function(probability) {
                return this.random(1, 100) <= this.clamp(probability, 0, 100);
            },
            removeDuplicates: function(arr) {
                var cleanArray = [];
                return arr.forEach(function(item) {
                    cleanArray.indexOf(item) < 0 && cleanArray.push(item);
                }), cleanArray;
            },
            onceCall: function(func, context) {
                var called = !1;
                return function() {
                    if (!called) return called = !0, func.apply(context, Array.prototype.slice.call(arguments));
                };
            },
            mix: function(obj, mixin) {
                return Object.keys(mixin).forEach(function(key) {
                    obj[key] || null === mixin[key] || "undefined" == typeof mixin[key] || (obj[key] = mixin[key]);
                }), obj;
            },
            clearObj: function(obj, values) {
                return this.isArray(values) || (values = []), Object.keys(obj).forEach(function(key) {
                    ("undefined" == typeof obj[key] || null === obj[key] || values.indexOf(obj[key]) >= 0) && delete obj[key];
                }), obj;
            },
            getMajMinVersion: function(version, separator) {
                return separator = separator || ".", version.split(separator).slice(0, 2).join(separator);
            }
        };
    },
    8: function(module, exports) {
        "use strict";
        module.exports = {
            isString: function(param) {
                return "string" == typeof param;
            },
            isNumber: function(param) {
                return "number" == typeof param;
            },
            isArray: function(param) {
                return Array.isArray(param);
            },
            isObject: function(param) {
                return "object" == typeof param && Boolean(param) && !this.isArray(param);
            },
            isFunction: function(param) {
                return "function" == typeof param;
            },
            isDefined: function(param) {
                return "undefined" != typeof param && null !== param;
            },
            isRegexp: function(param) {
                return param instanceof RegExp;
            },
            isEmpty: function(data) {
                if (this.isArray(data)) return 0 === data.length;
                if (this.isObject(data)) return 0 === Object.keys(data).length;
                throw new Error("data must be object or array");
            }
        };
    },
    9: function(module, exports) {
        "use strict";
        module.exports = {
            events: {},
            trigger: function(type, data) {
                var triggers = [];
                this.events[type] && (this.events[type] = this.events[type].filter(function(event) {
                    return triggers.push(event), !event.once;
                }), triggers.forEach(function(event) {
                    event.handler.call(event.ctx, data);
                }));
            },
            on: function(type, handler, ctx, once) {
                this.events[type] || (this.events[type] = []), this.events[type].push({
                    type: type,
                    handler: handler,
                    ctx: ctx || null,
                    once: Boolean(once)
                });
            },
            once: function(type, handler, ctx) {
                this.on(type, handler, ctx, !0);
            },
            off: function(type, handler) {
                this.events[type] && (this.events[type] = this.events[type].filter(function(event) {
                    return event.type !== type || event.handler !== handler;
                }));
            },
            ignoreEvent: function(type) {
                this.events[type] && (this.events[type] = this.events[type].filter(function(event) {
                    return type !== event.type;
                }));
            },
            hasListener: function(type, handler) {
                return !!this.events[type] && this.events[type].some(function(event) {
                    return event.type === type && event.handler === handler;
                });
            },
            willTrigger: function(type) {
                return Boolean(this.events[type]) && this.events[type].length > 0;
            },
            flush: function() {
                this.events = {};
            }
        };
    },
    10: function(module, exports) {
        "use strict";
        module.exports = {
            NOTIFICATION_SHOW: "notification.show",
            STAT_TAKE_PRODUCT: "yandex.statistics.take-product",
            STAT_GIVE_PRODUCT: "yandex.statistics.give-product",
            PREFERENCE_CHANGED: "wdgt.preferences.changed",
            PREFERENCE_SET: "wdgt.preferences.setted",
            ONLINE: "user.online",
            OFFLINE: "user.offline",
            ELECTION_COMPLETED: "wdgt.primary.select",
            SOFT_EXPORT_READY: "yandex.statistics.ready",
            SOFT_EXPORT_TICK: "statistics.tick",
            HELLO: "application.hello",
            CLICKER: "application.send.clicker",
            SHARED_DATA_SET: "application.shared.data.set"
        };
    },
    12: function(module, exports, __webpack_require__) {
        "use strict";
        var innerDispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), browser = {
            newTabUrls: [ "https://www.google.ru/_/chrome/newtab", "chrome://newtab/" ],
            CHROME: "chrome",
            YABROWSER: "yabrowser",
            OPERA: "opera",
            CHROMIUM: "chromium",
            FIREFOX: "firefox",
            ONLINE: "online",
            OFFLINE: "offline",
            CURRENT_TAB: "current tab",
            NEW_TAB: "new tab",
            NEW_WINDOW: "new window",
            NEW_POPUP: "new popup",
            BROWSER_OPEN_CHECK_TIME: 1e4,
            run: function() {
                window.addEventListener("online", this._onLineHandler.bind(this)), window.addEventListener("offline", this._offlineHandler.bind(this));
            },
            isChrome: function() {
                return this._isChrome() && !this.isOpera() && !this.isYabrowser();
            },
            isYabrowser: function() {
                var appVersion = window.navigator.appVersion;
                return /YaBrowser/.test(appVersion);
            },
            isFirefox: function() {
                var userAgent = window.navigator.userAgent;
                return /Gecko\/[\d.]* Firefox\/[\d.]*/.test(userAgent);
            },
            isOpera: function() {
                var appVersion = window.navigator.appVersion;
                return /OPR\//.test(appVersion);
            },
            getBrowser: function() {
                return this.isFirefox() ? this.FIREFOX : this.isOpera() ? this.OPERA : this.isYabrowser() ? this.YABROWSER : this.isChrome() ? this.CHROME : this.CHROMIUM;
            },
            whenBrowserContextAvailable: function(callback) {
                return chrome.cookies ? void chrome.cookies.getAll({
                    domain: "ya.ru",
                    name: "test",
                    path: "/"
                }, function() {
                    chrome.runtime.lastError ? setTimeout(this.whenBrowserContextAvailable.bind(this, callback), this.BROWSER_OPEN_CHECK_TIME) : callback();
                }.bind(this)) : setTimeout(callback, this.BROWSER_OPEN_CHECK_TIME);
            },
            getChromeVersion: function() {
                var matches = window.navigator.appVersion.match(/Chrome\/(\d+)\./);
                return matches && matches.length >= 1 ? parseInt(matches[1], 10) : 0;
            },
            getOperaVersion: function() {
                var matches = window.navigator.appVersion.match(/OPR\/(\d+)\./);
                return matches && matches.length >= 1 ? parseInt(matches[1], 10) : 0;
            },
            getFirefoxVersion: function() {
                var matches = window.navigator.userAgent.match(/Firefox\/(\d+)\./);
                return matches && matches.length >= 1 ? parseInt(matches[1], 10) : 0;
            },
            navigate: function(url, target) {
                switch (target = target || this.NEW_TAB) {
                  case this.CURRENT_TAB:
                    chrome.tabs.update({
                        url: url,
                        active: !0
                    }, function(tab) {
                        chrome.windows.update(tab.windowId, {
                            focused: !0
                        });
                    });
                    break;

                  case this.NEW_TAB:
                    chrome.tabs.create({
                        url: url,
                        active: !0
                    }, function(tab) {
                        chrome.windows.update(tab.windowId, {
                            focused: !0
                        });
                    });
                    break;

                  case this.NEW_WINDOW:
                    chrome.windows.create({
                        url: url,
                        focused: !0,
                        type: "normal"
                    });
                    break;

                  case this.NEW_POPUP:
                    chrome.windows.create({
                        url: url,
                        focused: !0,
                        type: "popup"
                    });
                }
            },
            navigateToSettings: function() {
                var url = "chrome-extension://" + chrome.runtime.id + "/options/options.html";
                this.navigate(url);
            },
            openSettings: function() {
                this.navigate(chrome.extension.getURL("/options/options.html"), "new tab");
            },
            createTab: function(params, callback) {
                chrome.tabs.create(params, callback);
            },
            getTab: function(tabId, callback) {
                chrome.tabs.get(tabId, callback);
            },
            getCurrentTab: function(callback) {
                chrome.tabs.query({
                    active: !0,
                    url: "<all_urls>"
                }, function(tabs) {
                    callback(tabs ? tabs[0] : null);
                });
            },
            reloadTab: function(tabId) {
                chrome.tabs.reload(tabId);
            },
            isNewTab: function(url) {
                return this.newTabUrls.some(function(compareUrl) {
                    return url.indexOf(compareUrl) > -1;
                });
            },
            sendMessage: function(tabId, message) {
                chrome.tabs.sendMessage(tabId, message);
            },
            removeTab: function(tabId, callback) {
                return chrome.tabs.remove(tabId, callback);
            },
            openWindow: function(params, callback) {
                chrome.windows.create(params, callback);
            },
            closeWindow: function(windowId) {
                chrome.windows.remove(windowId);
            },
            get version() {
                return this.isFirefox() ? this.getFirefoxVersion() : this.getChromeVersion();
            },
            get incognito() {
                return Boolean(chrome.extension.inIncognitoContext);
            },
            _onLineHandler: function() {
                this._triggerEvent(AppEvent.ONLINE);
            },
            _offlineHandler: function() {
                this._triggerEvent(AppEvent.OFFLINE);
            },
            _isChrome: function() {
                var vendor = window.navigator.vendor, userAgent = window.navigator.userAgent;
                return /Google Inc/.test(vendor) && /Chrome/.test(userAgent) && !/MRCHROME|Comodo/.test(userAgent);
            },
            _triggerEvent: function(event) {
                innerDispatcher.trigger(event);
            },
            get status() {
                return window.navigator.onLine ? this.ONLINE : this.OFFLINE;
            }
        };
        browser.run(), module.exports = browser;
    },
    30: function(module, exports, __webpack_require__) {
        "use strict";
        var get = __webpack_require__(31), brandingData = __webpack_require__(43);
        module.exports = {
            id: __webpack_require__(44).branding,
            YANDEX: "yandex",
            TURKEY: "tb",
            UKRAINE: "ua",
            KAZAKHSTAN: "kz",
            BELARUS: "by",
            BRANDS: [ "yandex", "tb", "ua" ],
            tldMap: {
                ru: "ru",
                uk: "ua",
                tr: "com.tr",
                kz: "kz",
                by: "by"
            },
            get: function() {
                return this.isTurkish() ? this.TURKEY : this.isYandex() ? this.YANDEX : this.isUkraine() ? this.UKRAINE : this.isKazakhstan() ? this.KAZAKHSTAN : this.isBelarus() ? this.BELARUS : this.id;
            },
            data: function(key) {
                return get(brandingData, key);
            },
            url: function(key) {
                var url = this.data(key);
                return "string" == typeof url ? url.replace("{tld}", this.tld) : url;
            },
            isTurkish: function() {
                return this.id === this.TURKEY || /^tb_.*/i.test(this.id);
            },
            isUkraine: function() {
                return this.id === this.UKRAINE || /^ua_.*/i.test(this.id);
            },
            isYandex: function() {
                return this.id === this.YANDEX || /^(ya_)|(yandex_).*/i.test(this.id);
            },
            isKazakhstan: function() {
                return this.id === this.KAZAKHSTAN || /^kz_.*/i.test(this.id);
            },
            isBelarus: function() {
                return this.id === this.BELARUS || /^by_.*/i.test(this.id);
            },
            get tld() {
                var locale = chrome.i18n.getMessage("locale");
                return this.tldMap[locale] ? this.tldMap[locale] : this.tldMap.ru;
            },
            get portal() {
                return this.url("portal.http-url");
            }
        };
    },
    31: function(module, exports, __webpack_require__) {
        function get(object, path, defaultValue) {
            var result = null == object ? void 0 : baseGet(object, toPath(path), path + "");
            return void 0 === result ? defaultValue : result;
        }
        var baseGet = __webpack_require__(32), toPath = __webpack_require__(35);
        module.exports = get;
    },
    32: function(module, exports, __webpack_require__) {
        function baseGet(object, path, pathKey) {
            if (null != object) {
                void 0 !== pathKey && pathKey in toObject(object) && (path = [ pathKey ]);
                for (var index = 0, length = path.length; null != object && index < length; ) object = object[path[index++]];
                return index && index == length ? object : void 0;
            }
        }
        var toObject = __webpack_require__(33);
        module.exports = baseGet;
    },
    33: function(module, exports, __webpack_require__) {
        function toObject(value) {
            return isObject(value) ? value : Object(value);
        }
        var isObject = __webpack_require__(34);
        module.exports = toObject;
    },
    34: function(module, exports) {
        function isObject(value) {
            var type = typeof value;
            return !!value && ("object" == type || "function" == type);
        }
        module.exports = isObject;
    },
    35: function(module, exports, __webpack_require__) {
        function toPath(value) {
            if (isArray(value)) return value;
            var result = [];
            return baseToString(value).replace(rePropName, function(match, number, quote, string) {
                result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
            }), result;
        }
        var baseToString = __webpack_require__(36), isArray = __webpack_require__(37), rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g, reEscapeChar = /\\(\\)?/g;
        module.exports = toPath;
    },
    36: function(module, exports) {
        function baseToString(value) {
            return null == value ? "" : value + "";
        }
        module.exports = baseToString;
    },
    37: function(module, exports, __webpack_require__) {
        var getNative = __webpack_require__(38), isLength = __webpack_require__(42), isObjectLike = __webpack_require__(41), arrayTag = "[object Array]", objectProto = Object.prototype, objToString = objectProto.toString, nativeIsArray = getNative(Array, "isArray"), isArray = nativeIsArray || function(value) {
            return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
        };
        module.exports = isArray;
    },
    38: function(module, exports, __webpack_require__) {
        function getNative(object, key) {
            var value = null == object ? void 0 : object[key];
            return isNative(value) ? value : void 0;
        }
        var isNative = __webpack_require__(39);
        module.exports = getNative;
    },
    39: function(module, exports, __webpack_require__) {
        function isNative(value) {
            return null != value && (isFunction(value) ? reIsNative.test(fnToString.call(value)) : isObjectLike(value) && reIsHostCtor.test(value));
        }
        var isFunction = __webpack_require__(40), isObjectLike = __webpack_require__(41), reIsHostCtor = /^\[object .+?Constructor\]$/, objectProto = Object.prototype, fnToString = Function.prototype.toString, hasOwnProperty = objectProto.hasOwnProperty, reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
        module.exports = isNative;
    },
    40: function(module, exports, __webpack_require__) {
        function isFunction(value) {
            return isObject(value) && objToString.call(value) == funcTag;
        }
        var isObject = __webpack_require__(34), funcTag = "[object Function]", objectProto = Object.prototype, objToString = objectProto.toString;
        module.exports = isFunction;
    },
    41: function(module, exports) {
        function isObjectLike(value) {
            return !!value && "object" == typeof value;
        }
        module.exports = isObjectLike;
    },
    42: function(module, exports) {
        function isLength(value) {
            return "number" == typeof value && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }
        var MAX_SAFE_INTEGER = 9007199254740991;
        module.exports = isLength;
    },
    43: function(module, exports) {
        module.exports = {
            portal: {
                "http-url": "http://yandex.ru",
                "https-url": "https://yandex.ru"
            },
            license: {
                url: "https://yandex.ru/legal/desktop_software_agreement/"
            },
            support: {
                url: "https://yandex.ru/support/element/troubleshooting.xml"
            },
            "bar-navig": {
                url: "https://bar-navig.yandex.ru/u"
            },
            "dayuse-json": {
                url: "https://clck.yandex.ru/click/dtype=elduse/product=elmnt/path=batch/*"
            },
            bookmarks: {
                url: "https://clck.yandex.ru/click/dtype=stred/pid=12/cid=72508/path={browserId}.{param}/*"
            },
            clicker: {
                url: "https://clck.yandex.ru/click/dtype=stred/pid={pid}/cid={cid}/path={path}{vars}/*"
            },
            "dayuse-stat": {
                url: "https://yandex.ru/clck/click/dtype=elduse/path=tech.yaelements.dayuse/vars={vars}/slots={slots}/*"
            },
            "soft-export": {
                url: "https://soft.export.yandex.ru/status.xml"
            },
            homepage: {
                url: "http://element.yandex.ru/chrome"
            },
            developer: {
                name: "ООО «ЯНДЕКС»",
                url: "http://yandex.ru"
            },
            "context-menu": {
                search: {
                    url: "http://yandex.ru/"
                },
                imgSearch: {
                    getUrl: "http://yandex.ru/images/search?rpt=imageview&img_url=",
                    postUrl: "http://yandex.ru/images/search?rpt=imageview&prg=1"
                }
            },
            goodbye: {
                url: "https://yandex.ru/soft/extensions/goodbye"
            },
            soft: {
                url: "http://soft.yandex.ru/?from=el_sett"
            },
            "@domain": "yandex.ru",
            "mail-api-domain": "https://mail.yandex.ru",
            "mail-redir-domain": "https://mail.yandex.ru"
        };
    },
    44: function(module, exports) {
        module.exports = {
            date: 1512115580,
            build: "56",
            sha: "97600a",
            distribution: "firefox",
            branding: "yandex",
            version: "8.23.2",
            clid: {
                "1": "1917055",
                "2": "1917056",
                "4": "1917057",
                "5": "1917058",
                "6": "1917059",
                "7": "1917060",
                "8": "1917061",
                "9": "1917062",
                "10": "1917063",
                "11": "1917064",
                "12": "1917065",
                "13": "1917066",
                "14": "1917067",
                "15": "2087573",
                "17": "2165188",
                "18": "2165189",
                "20": "2161601",
                "21": "2215132"
            },
            vendor: "vendor-firefox-yandex",
            modules: {
                ys: "nano/cookies/ys",
                opinions: "nano/statistics/bar-navig",
                "bm-statistics": "nano/statistics/bookmarks",
                "dayuse-json": "nano/statistics/dayuse/json",
                "apps-count": "nano/statistics/app",
                "history-stat": "nano/statistics/history",
                "soft-export": "nano/statistics/soft-export",
                goodbye: "nano/statistics/goodbye",
                contextMenu: "nano/dynamic-modules/context-menu",
                "dayuse-url": "nano/statistics/dayuse/url",
                "metrika-logger": "nano/dynamic-modules/metrika-logger"
            },
            yasoft: "mailchrome",
            "clicker-feature": "yamail",
            "metrika-counter-id": 39273630
        };
    },
    53: function(module, exports, __webpack_require__) {
        "use strict";
        var Is = __webpack_require__(8), Series = function(tasks, completeHandler, ctx) {
            this.completeHandler = completeHandler, this.ctx = ctx || null, this.keys = [], 
            this.tasks = tasks, this.total = 0, this.done = 0, this.result = null, this.indexedTasks = null;
        };
        Series.prototype = {
            run: function() {
                Is.isObject(this.tasks) && (this.total = Object.keys(this.tasks).length, this._proceedObjectTasks()), 
                Is.isArray(this.tasks) && (this.total = this.tasks.length, this._proceedArrayTasks()), 
                Is.isArray(this.tasks) || Is.isObject(this.tasks) || this._onComplete();
            },
            _proceedObjectTasks: function() {
                this.indexedTasks = Object.keys(this.tasks).map(function(key) {
                    return key;
                }), this.result = {}, this._nextTask();
            },
            _proceedArrayTasks: function() {
                this.indexedTasks = this.tasks.map(function(task, index) {
                    return index;
                }), this.result = new Array(this.tasks.length), this._nextTask();
            },
            _proceedTask: function(task, callback) {
                Is.isFunction(task) ? task.call(this.ctx, callback) : callback();
            },
            _nextTask: function() {
                var self = this, index = this._getTaskIndex();
                this._proceedTask(this.tasks[index], function(result) {
                    self.result[index] = result, self._onLocalComplete();
                });
            },
            _getTaskIndex: function() {
                return this.indexedTasks[this.done];
            },
            _onLocalComplete: function() {
                this.done += 1, this.done >= this.total ? this._onComplete() : this._nextTask();
            },
            _onComplete: function() {
                Is.isFunction(this.completeHandler) && this.completeHandler.call(this.ctx, this.result);
            }
        }, module.exports = function(tasks, completeHandler, ctx) {
            var queue = new Series(tasks, completeHandler, ctx);
            queue.run();
        };
    },
    64: function(module, exports, __webpack_require__) {
        "use strict";
        var parallel = __webpack_require__(65), series = __webpack_require__(53), waterfall = __webpack_require__(66), each = __webpack_require__(67);
        module.exports = {
            parallel: parallel,
            series: series,
            waterfall: waterfall,
            each: each
        };
    },
    65: function(module, exports, __webpack_require__) {
        "use strict";
        var Is = __webpack_require__(8), Parallel = function(tasks, completeHandler, ctx) {
            this.completeHandler = completeHandler, this.ctx = ctx || null, this.keys = [], 
            this.tasks = tasks, this.total = 0, this.done = 0, this.result = null;
        };
        Parallel.prototype = {
            run: function() {
                Is.isObject(this.tasks) && (this.total = Object.keys(this.tasks).length, this._processObjectTasks()), 
                Is.isArray(this.tasks) && (this.total = this.tasks.length, this._proceedArrayTasks()), 
                Is.isArray(this.tasks) || Is.isObject(this.tasks) || this._onComplete(), Is.isEmpty(this.tasks) && this._onComplete();
            },
            _processObjectTasks: function() {
                var self = this;
                this.result = {}, Object.keys(this.tasks).forEach(function(key) {
                    Is.isFunction(this.tasks[key]) && this.tasks[key].call(this.ctx, function(localResult) {
                        self.result[key] = localResult, self._onLocalComplete();
                    });
                }, this);
            },
            _proceedArrayTasks: function() {
                var self = this;
                this.result = new Array(this.tasks.length), this.tasks.forEach(function(task, index) {
                    Is.isFunction(task) && task.call(this.ctx, function(localResult) {
                        self.result[index] = localResult, self._onLocalComplete();
                    });
                }, this);
            },
            _onLocalComplete: function() {
                this.done += 1, this.done >= this.total && this._onComplete();
            },
            _onComplete: function() {
                Is.isFunction(this.completeHandler) && this.completeHandler.call(this.ctx, this.result);
            }
        }, module.exports = function(tasks, completeHandler, ctx) {
            var queue = new Parallel(tasks, completeHandler, ctx);
            queue.run();
        };
    },
    66: function(module, exports, __webpack_require__) {
        "use strict";
        var Is = __webpack_require__(8), Waterfall = function(tasks, completeHandler, ctx) {
            this.completeHandler = completeHandler, this.ctx = ctx || null, this.keys = [], 
            this.tasks = tasks, this.total = 0, this.done = 0, this.result = [], this.indexedTasks = null;
        };
        Waterfall.prototype = {
            run: function() {
                Is.isArray(this.tasks) && (this.total = this.tasks.length, this._proceedArrayTasks()), 
                Is.isArray(this.tasks) || this._onComplete();
            },
            _proceedArrayTasks: function() {
                this.indexedTasks = this.tasks.map(function(task, index) {
                    return index;
                }), this._nextTask();
            },
            _nextTask: function() {
                var self = this, index = this._getTaskIndex();
                this._proceedTask(this.tasks[index], function() {
                    self.result = [].slice.call(arguments), self._onLocalComplete();
                });
            },
            _proceedTask: function(task, callback) {
                Is.isFunction(task) ? task.apply(this.ctx, this._processArgs(this.result, callback)) : callback();
            },
            _getTaskIndex: function() {
                return this.indexedTasks[this.done];
            },
            _onLocalComplete: function() {
                this.done += 1, this.done >= this.total ? this._onComplete() : this._nextTask();
            },
            _onComplete: function() {
                Is.isFunction(this.completeHandler) && this.completeHandler.apply(this.ctx, [].slice.call(this.result));
            },
            _processArgs: function(result, callback) {
                return result.push(callback), result.filter(function(item) {
                    return Is.isDefined(item);
                });
            }
        }, module.exports = function(tasks, completeHandler, ctx) {
            var queue = new Waterfall(tasks, completeHandler, ctx);
            queue.run();
        };
    },
    67: function(module, exports, __webpack_require__) {
        "use strict";
        var Is = __webpack_require__(8), Each = function(items, iterator, callback) {
            this.items = items, this.iterator = iterator, this.callback = callback, this.results = [], 
            this.current = 0;
        };
        Each.prototype = {
            run: function() {
                return !Is.isArray(this.items) || this.items.length < 1 ? this._completeHandler() : void this._callNextTask();
            },
            _callNextTask: function() {
                this.iterator(this.items[this.current], function(result) {
                    this.current++, this.results.push(result), this.current < this.items.length ? this._callNextTask() : this._completeHandler();
                }.bind(this));
            },
            _completeHandler: function() {
                Is.isFunction(this.callback) && this.callback(this.results);
            }
        }, module.exports = function(items, iterator, callback) {
            return new Each(items, iterator, callback).run();
        };
    },
    68: function(module, exports, __webpack_require__) {
        "use strict";
        var async = __webpack_require__(64), utils = __webpack_require__(7), Initer = function(callback) {
            this.modules = [], this.callback = callback;
        };
        Initer.prototype.add = function(modules) {
            utils.isArray(modules) && (this.modules = this.modules.concat(modules));
        }, Initer.prototype.init = function() {
            return this.modules.length > 0 ? async.each(this.modules, this._initModule.bind(this), this._onInitComplete.bind(this)) : void this._onInitComplete();
        }, Initer.prototype._initModule = function(module, done) {
            module.init(done);
        }, Initer.prototype._onInitComplete = function() {
            "function" == typeof this.callback && this.callback();
        }, module.exports = function(modules, callback) {
            var initer = new Initer(callback);
            initer.add(modules), initer.init();
        };
    },
    93: function(module, exports, __webpack_require__) {
        "use strict";
        var pluralRules = __webpack_require__(94), get = __webpack_require__(31), localesData = {
            ru: __webpack_require__(95),
            en: __webpack_require__(96),
            tr: __webpack_require__(97),
            uk: __webpack_require__(98)
        };
        module.exports = {
            message: function(key, placeholders) {
                var message = get(this.messages, key);
                return message ? (Array.isArray(placeholders) && placeholders.forEach(function(value, index) {
                    for (;message.indexOf("[" + index + "]") >= 0; ) message = message.replace("[" + index + "]", placeholders[index] || "");
                }), message) : key;
            },
            dot: function(key) {
                return get(this.messages, key) || key;
            },
            pluralize: function(amount, forms) {
                var idx;
                if (0 === amount && forms.length > 3) idx = 3; else {
                    var pluralRule = pluralRules.get(this.locale);
                    idx = Math.min(forms.length - 1, pluralRule(amount));
                }
                return forms[idx];
            },
            pluralMessage: function(key, placeholder) {
                var forms = this.dot(key);
                if (!Array.isArray(forms)) throw new Error("Key " + key + " should have plural forms!");
                return this.pluralize(placeholder, forms).replace(/\[0]/g, placeholder);
            },
            get locale() {
                return chrome.i18n.getMessage("locale");
            },
            get messages() {
                return localesData[this.locale] || localesData.ru;
            }
        };
    },
    94: function(module, exports) {
        "use strict";
        var DEF_PLURAL_RULE_NUM = 0, pluralConfig = [ [ "en,de,et,no,el,it", function(n) {
            return 1 !== n ? 1 : 0;
        } ], [ "fr,uz,tg", function(n) {
            return n > 1 ? 1 : 0;
        } ], [ "ru,uk,be,hr,sr,bs", function(amount) {
            var normalizeAmount = Math.abs(amount), mode10 = normalizeAmount % 10, mode100 = normalizeAmount % 100, variant = 0;
            return variant = 1 === mode10 && 11 !== mode100 ? 0 : mode10 >= 2 && mode10 <= 4 && !(mode100 > 10 && mode100 < 20) ? 1 : 2;
        } ] ];
        module.exports = {
            _rulesForLocale: {},
            get: function(locale) {
                if (!this._rulesForLocale[locale]) {
                    this._rulesForLocale[locale] = pluralConfig[DEF_PLURAL_RULE_NUM];
                    for (var i = 0; i < pluralConfig.length; ++i) if (pluralConfig[i][0].indexOf(locale) >= 0) {
                        this._rulesForLocale[locale] = pluralConfig[i];
                        break;
                    }
                }
                return this._rulesForLocale[locale][1];
            }
        };
    },
    95: function(module, exports) {
        module.exports = {
            adv: {
                "options-text": "Предлагать полезные дополнения и приложения Яндекса",
                search: {
                    disabled: {
                        more: "Включить",
                        text: "Включите расширение и спрашивайте Яндекс в адресной строке вашего браузера.",
                        title: "Быстрый доступ к поиску Яндекса"
                    },
                    notInstalled: {
                        more: "Узнать подробнее",
                        text: "Сделайте Яндекс поиском по умолчанию и вводите запросы в адресную строку браузера.",
                        title: "Быстрый доступ к поиску Яндекса"
                    }
                },
                startpage: {
                    disabled: {
                        more: "Включить",
                        text: "Включите расширение, и при запуске браузера вас будет встречать главная страница Яндекса.",
                        title: "Быстрый доступ к Яндексу"
                    },
                    notInstalled: {
                        more: "Узнать подробнее",
                        text: "При запуске браузера вас встретит Яндекс — сделайте его стартовой страницей.",
                        title: "День начинается с Яндекса"
                    }
                },
                vb: {
                    disabled: {
                        more: "Включить",
                        text: "Быстрый доступ к вашим любимым сайтам — достаточно открыть новую вкладку.",
                        title: "У вас есть Визуальные закладки"
                    },
                    notInstalled: {
                        more: "Узнать подробнее",
                        text: "Красивые фоны и возможность настроить 25 любимых закладок",
                        title: "Попробуйте Визуальные закладки"
                    }
                }
            },
            altsearch: {
                "engine-names": {
                    bing: "Bing",
                    google: "Google",
                    mail: "Mail.ru",
                    yahoo: "Yahoo",
                    yandex: "Яндекс"
                },
                "options-text": "Показывать панель альтернативного поиска",
                "panel-text": "Искать «[0]» в других поисковых системах:"
            },
            "context-menu": {
                imgSearch: {
                    label: "Искать по этой картинке в Яндексе"
                },
                "options-text": "Добавить пункты контекстного меню «Искать в Яндексе»",
                "page-title": "Яндекс.Картинки: поиск по картинке",
                search: {
                    label: "Найти в Яндексе «[0]»"
                }
            },
            error: {
                net: "Нет подключения к интернету",
                refresh: "При обновлении произошла ошибка",
                server: "Отсутствует связь с сервером"
            },
            "forbidden-in-incognito": "Расширение не поддерживает режим 'Инкогнито'.",
            "forbidden-in-yabrowser": "Установка невозможна. Браузер Yandex уже содержит это расширение.",
            geolocation: {
                "options-text": "Учитывать мое местоположение в сервисах Яндекса"
            },
            infobar: {
                agree: "Да",
                close: "Закрыть",
                fb: {
                    label: "Хотите получать уведомления о новых сообщениях от друзей из [0] Facebook?"
                },
                ok: {
                    label: "Хотите получать уведомления о новых сообщениях от друзей из [0] Одноклассников?"
                },
                "options-text": "Показывать контекстные предложения кнопок Элементов Яндекса",
                video: {
                    install: "Установить Яндекс.Браузер",
                    label: "Режим Турбо ускорит загрузку роликов на [0] при медленном интернете"
                },
                vk: {
                    label: "Хотите получать уведомления о новых сообщениях от друзей из [0] Вконтакте?"
                }
            },
            legal: {
                dateFormat: "%d.%m.%Y",
                version: "Версия [0] от [1]",
                yandex: "ООО «ЯНДЕКС»"
            },
            license: {
                label: "Лицензионное соглашение"
            },
            options: {
                label: "Настройки",
                logout: "Выйти из профиля...",
                "logout-confirm": "Вы уверены, что хотите выйти из профиля?",
                logs: "Логи расширения",
                opinions: {
                    label: "Принять участие в улучшении сервисов Яндекса: автоматически отправлять анонимную статистику использования браузера"
                },
                restore: {
                    label: "Восстановить исходные настройки"
                },
                header: "Настройки: Безопасность",
                interval: {
                    label: "Интервал обновления",
                    min: "мин."
                },
                "mail-protocol-hook": "Открывать ссылки «mailto:» в Яндекс.Почте",
                "mail-push-enable": "Показывать уведомления о новых письмах",
                "mail-show-all-counter": "Показывать сумму входящих писем для всех авторизованных пользователей"
            },
            soft: {
                label: "Другие программы"
            },
            support: {
                label: "Служба поддержки"
            },
            addmail: "Подключить другой ящик",
            "addmail-desc": "вы всегда сможете в настройках почты",
            attach: "С вложением",
            bar: {
                button: {
                    close: {
                        label: "Закрыть",
                        tooltip: "Скрыть уведомление"
                    },
                    leave: "Уйти с сайта",
                    settings: {
                        label: "Настройки"
                    },
                    transfer: "Да, перейти"
                },
                warning: "Осторожно! Сайт может быть связан с мошенничеством. Вы хотите перейти на настоящий [0]?",
                warningnouri: "Осторожно! Сайт может быть связан с мошенничеством."
            },
            button: {
                "new-msg": [ "[0] новое сообщение", "[0] новых сообщения", "[0] новых сообщений", "Нет новых сообщений" ],
                noauth: "Пожалуйста, авторизуйтесь",
                noinfo: "Нет данных о сообщениях"
            },
            continuewm: "Продолжить работу с почтой",
            create: "Написать",
            "create-email": "Завести ящик на Яндекс.Почте",
            delete: "Удалить",
            extension: {
                description: "Уведомления о новых письмах и быстрый доступ к Яндекс.Почте.",
                "sd-title": "Яндекс.Почта для Экспресс-панели",
                title: "Элементы Яндекса: Почта"
            },
            folder: {
                draft: "Черновики",
                inbox: "Входящие",
                sent: "Отправленные",
                spam: "Спам",
                trash: "Удаленные"
            },
            ft: {
                unread: "Непрочитанные"
            },
            login_other: "Войти в другой почтовый ящик",
            logo: "Яндекс Почта",
            logout: "Выход",
            logout_all: "Выйти из всех ящиков",
            mail: {
                alert: {
                    sound: {
                        label: "Проигрывать звуковые уведомления о новых письмах",
                        preview: {
                            label: "Прослушать"
                        },
                        select: {
                            label: "Выбрать"
                        }
                    },
                    text: {
                        label: "Показывать текстовые уведомления о новых письмах"
                    }
                },
                integration: {
                    label: 'Открывать ссылки  "mailto:" в Яндекс.Почте'
                },
                login: {
                    button: "Войти",
                    "dont-remember": "чужой компьютер",
                    error: {
                        "empty-login": "Введите логин",
                        "empty-password": "Введите пароль",
                        net: "Проверьте сетевое подключение",
                        server: "Отсутствует связь с сервером",
                        "use-passport": "Попробуйте войти через [Яндекс.Паспорт]([0])",
                        "wrong-password": "Проверьте правильность логина и пароля"
                    },
                    mfd: {
                        label: "Войти в почтовый ящик на моём домене"
                    },
                    "placeholder-login": "логин",
                    "placeholder-password": "пароль",
                    register: "Зарегистрироваться",
                    restore: "вспомнить пароль",
                    social: "Войти при помощи",
                    yandex: {
                        label: "Войти в Яндекс.Почту"
                    }
                },
                logout: {
                    label: "Завершить работу с почтовым ящиком"
                },
                name: "Почта",
                noauthtooltiptext: "Показывает новые сообщения в вашей почте",
                open: {
                    label: "Читать письма"
                },
                openAdBook: {
                    label: "Открыть адресную книгу"
                },
                openServiceOnClick: {
                    label: "По нажатию на кнопку открывать страницу сервиса"
                },
                reloadCounter: {
                    label: "Проверить почту"
                },
                send: {
                    accesskey: "ч",
                    image: {
                        label: "Отправить ссылку на изображение по почте"
                    },
                    page: {
                        label: "Отправить ссылку на текущую страницу по почте"
                    },
                    selected: {
                        label: "Отправить выделенный текст по почте"
                    }
                },
                sendPage: {
                    label: "Рассказать о странице"
                },
                tooltip: {
                    from: "От:",
                    subject: "Тема:"
                },
                tooltiptext: "Новые сообщения в вашей почте",
                uri: {
                    open: {
                        new: {
                            label: "Открывать страницу только с новыми письмами"
                        }
                    }
                },
                writeMail: {
                    label: "Написать письмо"
                }
            },
            mails: "Подключенные почтовые ящики",
            malware: {
                body: {
                    ext: {
                        label: "Страница сайта [0] пытается загрузить данные с заражённого сайта [1]. По нашим данным, на [1] был размещён вредоносный программный код. Это могло произойти как по желанию владельцев сайта, так и без их ведома — в результате действий злоумышленников."
                    },
                    label: "По нашим данным, на страницах сайта был размещён вредоносный программный код. Это могло произойти как по желанию владельцев сайта, так и без их ведома — в результате действий злоумышленников."
                },
                button: {
                    back: {
                        label: "Уйти со страницы"
                    },
                    proceed: {
                        label: "Игнорировать это предупреждение"
                    }
                },
                head: {
                    label: "Сайт [0] может угрожать безопасности вашего компьютера."
                },
                info: {
                    label: "Более подробную информацию об угрозе или безопасную копию сайта можно посмотреть на [0]странице с полными данными о заражении[1]."
                }
            },
            "month-format": "[0] [1]",
            month: {
                g1: "Января",
                g10: "Октября",
                g11: "Ноября",
                g12: "Декабря",
                g2: "Февраля",
                g3: "Марта",
                g4: "Апреля",
                g5: "Мая",
                g6: "Июня",
                g7: "Июля",
                g8: "Августа",
                g9: "Сентября"
            },
            notify: {
                "cumulative-event": [ "У Вас [0] новое письмо", "У Вас [0] новых письма", "У Вас [0] новых писем", "У Вас нет новых писем" ]
            },
            nounread: "У вас нет непрочитанных писем",
            refresh: "Обновить",
            retry: "Попробуйте еще раз",
            setreaded: "Отметить как прочитанное",
            settings: "Настройки виджета",
            spam: "Отметить как спам",
            total: "всего [0]",
            tt: {
                create: "Написать новое письмо",
                logo: "Перейти в Я.Почту",
                refresh: "Обновить список писем"
            },
            wait: "Секундочку...",
            yabrowser: {
                description: "Кнопка на панели браузера уведомит вас о новых письмах в Яндекс.Почте",
                title: "Кнопка Яндекс.Почты"
            }
        };
    },
    96: function(module, exports) {
        module.exports = {
            adv: {
                "options-text": "Suggest useful extensions and Yandex applications",
                search: {
                    disabled: {
                        more: "Turn on",
                        text: "Turn on the extension and pitch your question to Yandex in your browser address bar.",
                        title: "Instant access to Yandex.Search"
                    },
                    notInstalled: {
                        more: "Find out more",
                        text: "Make Yandex your default search engine and enter searches in your browser's address bar.",
                        title: "Instant access to Yandex.Search"
                    }
                },
                startpage: {
                    disabled: {
                        more: "Turn on",
                        text: "By using the extension, you'll see Yandex's homepage when you launch your browser.",
                        title: "Instant access to Yandex"
                    },
                    notInstalled: {
                        more: "Find out more",
                        text: "Make Yandex your homepage and it will be the first thing you see when you launch your browser.",
                        title: "Your day starts with Yandex"
                    }
                },
                vb: {
                    disabled: {
                        more: "Turn on",
                        text: "Just open a new tab to get instant access to your favorite sites.",
                        title: "You have Visual Bookmarks"
                    },
                    notInstalled: {
                        more: "Find out more",
                        text: "Visually-appealing backgrounds and custom selection of your 25 favorite bookmarks",
                        title: "Try Visual Bookmarks"
                    }
                }
            },
            altsearch: {
                "engine-names": {
                    bing: "Bing",
                    google: "Google",
                    mail: "Mail.ru",
                    yahoo: "Yahoo",
                    yandex: "Yandex"
                },
                "options-text": "Show alternative search engines options panel",
                "panel-text": 'Search for "[0]" in other search engines:'
            },
            "context-menu": {
                imgSearch: {
                    label: "Search for this image on Yandex"
                },
                "options-text": "Add «Search in Yandex» to context menu entries",
                "page-title": "Yandex.Images: search by image",
                search: {
                    label: 'Search for "[0]" on Yandex'
                }
            },
            error: {
                net: "No internet connection",
                refresh: "An error occurred while updating",
                server: "No connection to server"
            },
            "forbidden-in-incognito": "The extension does not support incognito mode.",
            "forbidden-in-yabrowser": "Unable to install. Yandex.Browser already contains this extension.",
            geolocation: {
                "options-text": "Use my location for Yandex's services"
            },
            infobar: {
                agree: "Yes",
                close: "Close",
                fb: {
                    label: "Do you want to receive notifications about new messages from your friends on [0] Facebook?"
                },
                ok: {
                    label: "Do you want to receive notifications about new messages from your friends on [0] Odnoklassniki?"
                },
                "options-text": "Show contextual ads on Yandex.Elements buttons",
                video: {
                    install: "Install Yandex.Browser",
                    label: "Turbo mode speeds up video downloads on [0] when the internet is slow"
                },
                vk: {
                    label: "Do you want to receive notifications about new messages from your friends on [0] VK?"
                }
            },
            legal: {
                dateFormat: "%d.%m.%Y",
                version: "Version [0] released [1]",
                yandex: "YANDEX"
            },
            license: {
                label: "License Agreement"
            },
            options: {
                label: "Settings",
                logout: "Log out...",
                "logout-confirm": "Are you sure you want to log out?",
                logs: "Extension logs",
                opinions: {
                    label: "Help us improve Yandex services by sharing anonymous browser usage data"
                },
                restore: {
                    label: "Restore default settings"
                },
                header: "Settings: Security",
                interval: {
                    label: "Update interval",
                    min: "min."
                },
                "mail-protocol-hook": "Open «mailto:» links in Yandex.Mail",
                "mail-push-enable": "Show new message notifications",
                "mail-show-all-counter": "Show the total number of inbox messages for all signed-in users"
            },
            soft: {
                label: "Other software"
            },
            support: {
                label: "Support service"
            },
            addmail: "You can always add another mailbox",
            "addmail-desc": "in the mail settings menu",
            attach: "With attachment",
            bar: {
                button: {
                    close: {
                        label: "Close",
                        tooltip: "Hide notification"
                    },
                    leave: "Leave this site",
                    settings: {
                        label: "Settings"
                    },
                    transfer: "Go"
                },
                warning: "Warning! This site may be fraudulent. Do you want to go to the real [0]?",
                warningnouri: "Warning! This site may be fraudulent."
            },
            button: {
                "new-msg": [ "[0] new message", "[0] new messages", "[0] new messages", "No new messages" ],
                noauth: "Please log in",
                noinfo: "No information about messages"
            },
            continuewm: "Continue managing your mail",
            create: "Compose",
            "create-email": "Get a Yandex.Mail account",
            delete: "Remove",
            extension: {
                description: "Get new message notifications and quick access to Yandex.Mail.",
                "sd-title": "Yandex.Mail for Speed Dial",
                title: "Yandex Elements: Mail"
            },
            folder: {
                draft: "Drafts",
                inbox: "Inbox",
                sent: "Sent",
                spam: "Spam",
                trash: "Deleted"
            },
            ft: {
                unread: "Unread"
            },
            login_other: "Log in to another account",
            logo: "Yandex Mail",
            logout: "Log&#160;out",
            logout_all: "Log out of all mail accounts",
            mail: {
                alert: {
                    sound: {
                        label: "Play sound notifications for new letters",
                        preview: {
                            label: "Listen"
                        },
                        select: {
                            label: "Select"
                        }
                    },
                    text: {
                        label: "Show text notifications for new letters"
                    }
                },
                integration: {
                    label: 'Open links "mailto:" in Yandex.Mail'
                },
                login: {
                    button: "Login",
                    "dont-remember": "Don't remember me",
                    error: {
                        "empty-login": "Enter user name",
                        "empty-password": "Enter password",
                        net: "Check your network connection",
                        server: "No connection to server",
                        "use-passport": "Trying logging in through [Yandex.Passport]([0])",
                        "wrong-password": "Make sure the user name and password are correct"
                    },
                    mfd: {
                        label: "Log in to the mail box at my domain"
                    },
                    "placeholder-login": "user name",
                    "placeholder-password": "password",
                    register: "Register",
                    restore: "remember password",
                    social: "Login using",
                    yandex: {
                        label: "Log in to Yandex.Mail"
                    }
                },
                logout: {
                    label: "Log out of the mail box"
                },
                name: "Mail",
                noauthtooltiptext: "Shows new letters in Yandex.Mail",
                open: {
                    label: "Read mail"
                },
                openAdBook: {
                    label: "Open address book"
                },
                openServiceOnClick: {
                    label: "Click on button to go to service webpage"
                },
                reloadCounter: {
                    label: "Get mail"
                },
                send: {
                    accesskey: "e",
                    image: {
                        label: "E-mail image link"
                    },
                    page: {
                        label: "E-mail current page link"
                    },
                    selected: {
                        label: "E-mail selected text"
                    }
                },
                sendPage: {
                    label: "Share page"
                },
                tooltip: {
                    from: "From:",
                    subject: "Subject:"
                },
                tooltiptext: "New letters in Yandex.Mail",
                uri: {
                    open: {
                        new: {
                            label: "Open Inbox page with unread messages only"
                        }
                    }
                },
                writeMail: {
                    label: "Compose new letter"
                }
            },
            mails: "Mailboxes",
            malware: {
                body: {
                    ext: {
                        label: "A webpage on [0] is attempting to download information from [1], which contains malware. The owner of the site may be completely unaware of any malware installed on the site by hackers."
                    },
                    label: "We have detected malware on the pages of this site. The owner of the site may be completely unaware of any malware installed on the site by hackers."
                },
                button: {
                    back: {
                        label: "Leave this page"
                    },
                    proceed: {
                        label: "Ignore warning"
                    }
                },
                head: {
                    label: "Visiting [0] may harm your computer."
                },
                info: {
                    label: "You can see more detailed information about the threat or a secure cached version of the site on the [0]threat information page[1]."
                }
            },
            "month-format": "[0] [1]",
            month: {
                g1: "January",
                g10: "October",
                g11: "November",
                g12: "December",
                g2: "February",
                g3: "March",
                g4: "April",
                g5: "May",
                g6: "June",
                g7: "July",
                g8: "August",
                g9: "September"
            },
            notify: {
                "cumulative-event": [ "You have [0] new message", "You have [0] new messages", "You have [0] new messages", "You have no new messages" ]
            },
            nounread: "You have no unread mail",
            refresh: "Update",
            retry: "Try again",
            setreaded: "Mark as read",
            settings: "Widget settings",
            spam: "Mark as spam",
            total: "[0] in total",
            tt: {
                create: "Compose message",
                logo: "Go to Yandex.Mail",
                refresh: "Refresh message list"
            },
            wait: "Please wait...",
            yabrowser: {
                description: "This button in the browser panel notifies you about new messages in Yandex.Mail",
                title: "Yandex.Mail Button"
            }
        };
    },
    97: function(module, exports) {
        module.exports = {
            adv: {
                "options-text": "Yararlı Yandex uzantıları ve uygulamaları öner",
                search: {
                    disabled: {
                        more: "Etkinleştir",
                        text: "Uzantıyı etkinleştirerek sorgularınızı Yandex'e tarayıcınızın adres satırının üzerinden doğrudan göndermeye başlayın.",
                        title: "Yandex arama motoruna hızlı erişim"
                    },
                    notInstalled: {
                        more: "Daha fazla bilgi",
                        text: "Yandex'i varsayılan arama motorunuz yaparak sorgularınızı tarayıcınızın adres satırının üzerinden girin.",
                        title: "Yandex arama motoruna hızlı erişim"
                    }
                },
                startpage: {
                    disabled: {
                        more: "Etkinleştir",
                        text: "Uzantıyı etkinleştirin, tarayıcınız Yandex'in baş sayfasından çalışmaya başlasın.",
                        title: "Yandex'e hızlı erişim"
                    },
                    notInstalled: {
                        more: "Daha fazla bilgi",
                        text: "Tarayıcınızı her açtığınızda Yandex'i görmek için onu başlangıç sayfanız yapın.",
                        title: "Gününüz Yandex'le başlıyor"
                    }
                },
                vb: {
                    disabled: {
                        more: "Etkinleştir",
                        text: "Favori sitelerinize hızlı erişim: Yeni sekme açmanız yeterli.",
                        title: "Görsel Favoriler'iniz var"
                    },
                    notInstalled: {
                        more: "Daha fazla bilgi",
                        text: "Güzel arkaplan seçenekleri ve 25 favori bağlantısı ayarlama olanağı",
                        title: "Görsel Favoriler'i deneyin"
                    }
                }
            },
            altsearch: {
                "engine-names": {
                    bing: "Bing",
                    google: "Google",
                    mail: "Mail.ru",
                    yahoo: "Yahoo",
                    yandex: "Yandex"
                },
                "options-text": "Alternatif arama panelini göster",
                "panel-text": '"[0]" sorgusunu diğer arama motorlarında ara:'
            },
            "context-menu": {
                imgSearch: {
                    label: "Yandex'te bu resme göre arama yap"
                },
                "options-text": "«Yandex'te bul» içerik menüsü öğelerini ekle",
                "page-title": "Yandex.Görsel: görsele göre arama",
                search: {
                    label: '"[0]" sorgusunu Yandex\'te bul'
                }
            },
            error: {
                net: "İnternet bağlantısı yok",
                refresh: "Güncelleme sırasında hata oluştu",
                server: "Sunucuyla bağlantı yok"
            },
            "forbidden-in-incognito": "Eklenti 'Gizli' modu desteklemiyor.",
            "forbidden-in-yabrowser": "Kurulum yapılamaz. Yandex.Browser zaten bu eklentiye sahip.",
            geolocation: {
                "options-text": "Yandex servisleri için konumumu belirle"
            },
            infobar: {
                agree: "Evet",
                close: "Kapat",
                fb: {
                    label: "[0] Facebook'taki arkadaşlarınızdan yeni mesajlar ile ilgili bildirimleri almak istiyor musunuz?"
                },
                ok: {
                    label: "[0] Odnoklasniki'deki arkadaşlarınızdan yeni mesajlar ile ilgili bildirimleri almak istiyor musunuz?"
                },
                "options-text": "Yandex Elements'in içerik butonu önerilerini göster",
                video: {
                    install: "Yandex.Browser'ı kur",
                    label: "İnternet bağlantısı yavaş olduğunda Turbo modu [0] sitesinde videoların yüklenmesini hızlandırır"
                },
                vk: {
                    label: "[0] VK'deki arkadaşlarınızdan yeni mesajlar ile ilgili bildirimleri almak istiyor musunuz?"
                }
            },
            legal: {
                dateFormat: "%d.%m.%Y",
                version: "[1] tarihli [0] sürümü",
                yandex: "YANDEX"
            },
            license: {
                label: "Lisans sözleşmesi"
            },
            options: {
                label: "Ayarlar",
                logout: "Profilden çıkış yap...",
                "logout-confirm": "Profilden çıkmak istediğinizden emin misiniz?",
                logs: "Uzantının kayıt dosyaları",
                opinions: {
                    label: "Yandex servislerinin iyileştirilmesi için tarayıcının kullanım istatistiklerini otomatik ve anonim olarak paylaş"
                },
                restore: {
                    label: "Varsayılan ayarlara geri dön"
                },
                header: "Ayarlar: Güvenlik",
                interval: {
                    label: "Güncelleme sıklığı",
                    min: "dk."
                },
                "mail-protocol-hook": "«mailto:» bağlantılarını Yandex.Mail'de aç",
                "mail-push-enable": "Yeni gelen e-posta bildirimlerini göster",
                "mail-show-all-counter": "Kullanıcı girişi yapan tüm kullanıcıların gelen e-postalarının toplam sayısını göster"
            },
            soft: {
                label: "Diğer programlar"
            },
            support: {
                label: "Destek Ekibi"
            },
            addmail: "Başka e-posta hesabı bağla",
            "addmail-desc": "mail ayarlarından her zaman yapılabilir",
            attach: "Ekli ",
            bar: {
                button: {
                    close: {
                        label: "Kapat",
                        tooltip: "Bildirimi gizle"
                    },
                    leave: "Siteyi terk et",
                    settings: {
                        label: "Ayarlar"
                    },
                    transfer: "Evet, geçiş yap"
                },
                warning: "Dikkat! Site sahte olabilir. Buraya mı geçiş yapmak istiyorsunuz: [0]?",
                warningnouri: "Dikkat! Site sahte olabilir."
            },
            button: {
                "new-msg": [ "[0] yeni e-posta", "[0] yeni e-posta", "[0] yeni e-posta", "Yeni e-posta yok" ],
                noauth: "Lütfen giriş yapın",
                noinfo: "E-posta bilgisi yok"
            },
            continuewm: "Mail'i kullanmaya devam et",
            create: "E-posta yaz ",
            "create-email": "Yandex.Mail'de hesap aç",
            delete: "Sil ",
            extension: {
                description: "Yeni e-postalarla ilgili bildirimler ve Yandex.Mail’e hızlı erişim.",
                "sd-title": "Araç çubuğu için Yandex.Mail",
                title: "Yandex Elements: Mail"
            },
            folder: {
                draft: "Taslaklar",
                inbox: "Gelen kutusu",
                sent: "Gönderilmiş Öğeler",
                spam: "Spam",
                trash: "Silinenler"
            },
            ft: {
                unread: "Okunmamış "
            },
            login_other: "Diğer hesaba giriş yap",
            logo: "Yandex Mail",
            logout: "Çıkış ",
            logout_all: "Tüm hesaplardan çıkış yap",
            mail: {
                alert: {
                    sound: {
                        label: "Yeni e-posta bildirimlerinde sesli uyar",
                        preview: {
                            label: "Dinle "
                        },
                        select: {
                            label: "Seç "
                        }
                    },
                    text: {
                        label: "Yeni gelen e-postalar için yazılı bildirim göster "
                    }
                },
                integration: {
                    label: "mailto: bağlantısını Yandex.Mail ile aç"
                },
                login: {
                    button: "Giriş yap",
                    "dont-remember": "beni hatırlama",
                    error: {
                        "empty-login": "Kullanıcı adınızı girin",
                        "empty-password": "Şifre boş bırakılamaz ",
                        net: "Ağ bağlantınızı kontrol edin",
                        server: "Sunucuyla bağlantı yok",
                        "use-passport": "Bununla girmeyi deneyin: [Yandex.Pasaport]([0])",
                        "wrong-password": "Kullanıcı adı ve şifrenin doğruluğunu kontrol edin"
                    },
                    mfd: {
                        label: "E-posta kutusuna benim alanımdan gir"
                    },
                    "placeholder-login": "kullanıcı adı",
                    "placeholder-password": "şifre",
                    register: "Kaydol",
                    restore: "şifremi unuttum",
                    social: "Bu hesaplarla giriş yap",
                    yandex: {
                        label: "Yandex.Mail'e giriş yap"
                    }
                },
                logout: {
                    label: "E-posta kutusundaki işlemi bitir"
                },
                name: "Mail",
                noauthtooltiptext: "Hesabınızdaki yeni e-postaları gösterir",
                open: {
                    label: "E-posta oku"
                },
                openAdBook: {
                    label: "Adres defterini aç "
                },
                openServiceOnClick: {
                    label: "Butonuna tıklandığında servis sayfasını aç"
                },
                reloadCounter: {
                    label: "E-postayı kontrol et "
                },
                send: {
                    accesskey: "e",
                    image: {
                        label: "Görsel için bağlantıyı e-posta ile gönder"
                    },
                    page: {
                        label: "Bu sayfa için bağlantıyı e-posta ile gönder"
                    },
                    selected: {
                        label: "Seçilen metni e-posta ile gönder"
                    }
                },
                sendPage: {
                    label: "Sayfadan bahset "
                },
                tooltip: {
                    from: "Kimden:",
                    subject: "Konu:  "
                },
                tooltiptext: "Hesabınızdaki yeni e-postalar",
                uri: {
                    open: {
                        new: {
                            label: "Sadece yeni e-postaları içeren sayfayı aç"
                        }
                    }
                },
                writeMail: {
                    label: "E-posta yaz "
                }
            },
            mails: "Bağlı e-posta hesapları",
            malware: {
                body: {
                    ext: {
                        label: "[0] sitesinin sayfası, virüslü [1] sitesinden veri yüklemeye çalışıyor. Elimizdeki verilere göre, [1] sitesinin sayfalarına kötü amaçlı program kodu yerleştirilmiş. Bunu sitenin sahibi bilerek yapmış olabileceği gibi, sahibinin haberi olmadan kötü niyetli kişiler de yapmış olabilir."
                    },
                    label: "Elimizdeki verilere göre, sitenin sayfalarına kötü amaçlı program kodu yerleştirilmiş. Bunu sitenin sahibi bilerek yapmış olabileceği gibi, sahibinin haberi olmadan kötü niyetli kişiler de yapmış olabilir."
                },
                button: {
                    back: {
                        label: "Sayfadan çık"
                    },
                    proceed: {
                        label: "Bu uyarıyı yoksay"
                    }
                },
                head: {
                    label: "[0] sitesi, bilgisayarınıza zarar verebilir."
                },
                info: {
                    label: "[0]Burada, risk hakkında daha ayrıntılı bilgi[1] ya da sitenin güvenli kopyasını bulabilirsiniz."
                }
            },
            "month-format": "[0] [1]",
            month: {
                g1: "Ocak",
                g10: "Ekim",
                g11: "Kasım",
                g12: "Aralık",
                g2: "Şubat",
                g3: "Mart",
                g4: "Nisan",
                g5: "Mayıs",
                g6: "Haziran",
                g7: "Temmuz",
                g8: "Ağustos",
                g9: "Eylül"
            },
            notify: {
                "cumulative-event": [ "[0] yeni e-postanız var", "[0] yeni e-postanız var", "[0] yeni e-postanız var", "Yeni e-postanız yok" ]
            },
            nounread: "Okunmamış e-postanız yok",
            refresh: "Güncelle ",
            retry: "Tekrar deneyin",
            setreaded: "Okundu olarak işaretle",
            settings: "Widget ayarları ",
            spam: "Spam olarak işaretle",
            total: "toplam [0]",
            tt: {
                create: "E-posta yaz",
                logo: "Yandex.Mail'e git",
                refresh: "Mesaj listesini güncelle"
            },
            wait: "Lütfen bekleyin... ",
            yabrowser: {
                description: "Tarayıcının panelinde bulunan buton Yandex.Mail'e gelen yeni e-postaları size bildirir",
                title: "Yandex.Mail butonu"
            }
        };
    },
    98: function(module, exports) {
        module.exports = {
            adv: {
                "options-text": "Пропонувати корисні доповнення та програми Яндекса",
                search: {
                    disabled: {
                        more: "Увімкнути",
                        text: "Увімкніть розширення і запитуйте Яндекс в адресному рядку вашого браузера.",
                        title: "Швидкий доступ до пошуку Яндекса"
                    },
                    notInstalled: {
                        more: "Дізнатися докладніше",
                        text: "Зробіть Яндекс пошуком за замовчуванням і вводьте запити в адресний рядок браузера.",
                        title: "Швидкий доступ до пошуку Яндекса"
                    }
                },
                startpage: {
                    disabled: {
                        more: "Увімкнути",
                        text: "Увімкніть розширення, і під час запуску браузера вас зустрічатиме головна сторінка Яндекса.",
                        title: "Швидкий доступ до Яндекса"
                    },
                    notInstalled: {
                        more: "Дізнатися докладніше",
                        text: "Під час запуску браузера вас зустріне Яндекс — зробіть його стартовою сторінкою.",
                        title: "День починається з Яндекса"
                    }
                },
                vb: {
                    disabled: {
                        more: "Увімкнути",
                        text: "Швидкий доступ до ваших улюблених сайтів — досить відкрити нову вкладку.",
                        title: "У вас є Візуальні закладки"
                    },
                    notInstalled: {
                        more: "Дізнатися докладніше",
                        text: "Гарне тло і можливість налаштувати 25 улюблених закладок",
                        title: "Спробуйте Візуальні закладки"
                    }
                }
            },
            altsearch: {
                "engine-names": {
                    bing: "Bing",
                    google: "Google",
                    mail: "Mail.ru",
                    yahoo: "Yahoo",
                    yandex: "Яндекс"
                },
                "options-text": "Показувати панель альтернативного пошуку",
                "panel-text": "Шукати «[0]» в інших пошукових системах:"
            },
            "context-menu": {
                imgSearch: {
                    label: "Шукати за цим зображенням у Яндексі"
                },
                "options-text": "Додавати пункти контекстного меню «Шукати у Яндексі»",
                "page-title": "Яндекс.Зображення: пошук за зображенням",
                search: {
                    label: "Знайти в Яндексі «[0]»"
                }
            },
            error: {
                net: "Немає підключення до інтернету",
                refresh: "Під час оновлення сталася помилка",
                server: "Немає зв'язку з сервером"
            },
            "forbidden-in-incognito": "Розширення не підтримує режим 'Інкогніто'.",
            "forbidden-in-yabrowser": "Встановлення неможливе. Браузер Yandex уже містить це розширення.",
            geolocation: {
                "options-text": "Враховувати моє місце розташування на сервісах Яндекса"
            },
            infobar: {
                agree: "Так",
                close: "Закрити",
                fb: {
                    label: "Хочете отримувати сповіщення про нові повідомлення від друзів із [0] Facebook?"
                },
                ok: {
                    label: "Хочете отримувати сповіщення про нові повідомлення від друзів з [0] Однокласників?"
                },
                "options-text": "Показувати контекстні пропозиції кнопок Елементів Яндекса",
                video: {
                    install: "Встановити Яндекс.Браузер",
                    label: "Режим Турбо прискорить завантаження роликів на [0] у разі повільного інтернету"
                },
                vk: {
                    label: "Хочете отримувати сповіщення про нові повідомлення від друзів із [0] Вконтакті?"
                }
            },
            legal: {
                dateFormat: "%d.%m.%Y",
                version: "Версія [0] від [1]",
                yandex: "ООО «ЯНДЕКС»"
            },
            license: {
                label: "Ліцензійна угода"
            },
            options: {
                label: "Налаштування",
                logout: "Вийти з профілю...",
                "logout-confirm": "Ви впевнені, що хочете вийти з профілю?",
                logs: "Логи розширення",
                opinions: {
                    label: "Взяти участь у покращенні сервісів Яндекса: автоматично надсилати анонімну статистику використання браузера"
                },
                restore: {
                    label: "Відновити вихідні налаштування"
                },
                header: "Налаштування: Безпека",
                interval: {
                    label: "Інтервал оновлення",
                    min: "хв"
                },
                "mail-protocol-hook": "Відкривати посилання «mailto:» в Яндекс.Пошті",
                "mail-push-enable": "Показувати повідомлення про нові листи",
                "mail-show-all-counter": "Показувати суму вхідних листів для усіх авторизованих користувачів"
            },
            soft: {
                label: "Інші програми"
            },
            support: {
                label: "Служба підтримки"
            },
            addmail: "Підключити іншу скриньку",
            "addmail-desc": "ви завжди зможете в налаштуваннях пошти",
            attach: "Із вкладенням",
            bar: {
                button: {
                    close: {
                        label: "Закрити",
                        tooltip: "Приховати сповіщення"
                    },
                    leave: "Піти із сайту",
                    settings: {
                        label: "Налаштування"
                    },
                    transfer: "Так, перейти"
                },
                warning: "Обережно! Сайт може бути пов'язаний із шахрайством. Ви хочете перейти на справжній [0]?",
                warningnouri: "Обережно! Сайт може бути пов'язаний із шахрайством."
            },
            button: {
                "new-msg": [ "[0] нове повідомлення", "[0] нові повідомлення", "[0] нових повідомлень", "Немає нових повідомлень" ],
                noauth: "Будь ласка, авторизуйтеся",
                noinfo: "Немає даних про повідомлення"
            },
            continuewm: "Продовжити роботу з поштою",
            create: "Написати",
            "create-email": "Завести скриньку на Яндекс.Пошті",
            delete: "Видалити",
            extension: {
                description: "Сповіщення про нові листи і швидкий доступ до Яндекс.Пошти.",
                "sd-title": "Яндекс.Пошта для Експрес-панелі",
                title: "Елементи Яндекса: Пошта"
            },
            folder: {
                draft: "Чернетки",
                inbox: "Вхідні",
                sent: "Надіслані",
                spam: "Спам",
                trash: "Видалені"
            },
            ft: {
                unread: "Непрочитані"
            },
            login_other: "Увійти в іншу поштову скриньку",
            logo: "Яндекс Пошта",
            logout: "Вихід",
            logout_all: "Вийти з усіх скриньок",
            mail: {
                alert: {
                    sound: {
                        label: "Програвати звукові сповіщення про нові листи",
                        preview: {
                            label: "Прослухати"
                        },
                        select: {
                            label: "Вибрати"
                        }
                    },
                    text: {
                        label: "Показувати текстові сповіщення про нові листи"
                    }
                },
                integration: {
                    label: 'Відкривати посилання "mailto:" в Яндекс.Пошті'
                },
                login: {
                    button: "Увійти",
                    "dont-remember": "чужий комп'ютер",
                    error: {
                        "empty-login": "Введіть логін",
                        "empty-password": "Введіть пароль",
                        net: "Перевірте мережеве підключення",
                        server: "Немає зв'язку з сервером",
                        "use-passport": "Спробуйте ввійти через [Яндекс.Паспорт]([0])",
                        "wrong-password": "Перевірте правильність логіна та пароля"
                    },
                    mfd: {
                        label: "Увійти в поштову скриньку на моєму домені"
                    },
                    "placeholder-login": "логін",
                    "placeholder-password": "пароль",
                    register: "Зареєструватися",
                    restore: "згадати пароль",
                    social: "Увійти за допомогою",
                    yandex: {
                        label: "Увійти в Яндекс.Пошту"
                    }
                },
                logout: {
                    label: "Завершити роботу з поштовою скринькою"
                },
                name: "Пошта",
                noauthtooltiptext: "Показує нові повідомлення у вашій пошті",
                open: {
                    label: "Читати листи"
                },
                openAdBook: {
                    label: "Відкрити адресну книгу"
                },
                openServiceOnClick: {
                    label: "Після натискання на кнопку відкривати сторінку сервісу"
                },
                reloadCounter: {
                    label: "Перевірити пошту"
                },
                send: {
                    accesskey: "т",
                    image: {
                        label: "Надіслати посилання на зображення поштою"
                    },
                    page: {
                        label: "Надіслати посилання на поточну сторінку поштою"
                    },
                    selected: {
                        label: "Надіслати виділений текст поштою"
                    }
                },
                sendPage: {
                    label: "Розповісти про сторінку"
                },
                tooltip: {
                    from: "Від:",
                    subject: "Тема:"
                },
                tooltiptext: "Нові повідомлення у вашій пошті",
                uri: {
                    open: {
                        new: {
                            label: "Відкривати сторінку лише з новими листами"
                        }
                    }
                },
                writeMail: {
                    label: "Написати лист"
                }
            },
            mails: "Підключені поштові скриньки",
            malware: {
                body: {
                    ext: {
                        label: "Сторінка сайту [0] намагається завантажити дані із зараженого сайту [1]. За нашими даними, на [1] було розміщено шкідливий програмний код. Це могло статися як за бажанням власників сайту, так і без їхнього відома — в результаті дій зловмисників."
                    },
                    label: "За нашими даними, на сторінках сайту було розміщено шкідливий програмний код. Це могло статися як за бажанням власників сайту, так і без їхнього відома — в результаті дій зловмисників."
                },
                button: {
                    back: {
                        label: "Піти зі сторінки"
                    },
                    proceed: {
                        label: "Ігнорувати це попередження"
                    }
                },
                head: {
                    label: "Сайт [0] може загрожувати безпеці вашого комп’ютера."
                },
                info: {
                    label: "Докладнішу інформацію про загрозу або безпечну копію сайту можна подивитися на [0]сторінці з повними даними про зараження[1]."
                }
            },
            "month-format": "[0] [1]",
            month: {
                g1: "Cічня",
                g10: "Жовтня",
                g11: "Листопада",
                g12: "Грудня",
                g2: "Лютого",
                g3: "Березня",
                g4: "Квітня",
                g5: "Травня",
                g6: "Червня",
                g7: "Липня",
                g8: "Серпня",
                g9: "Вересня"
            },
            notify: {
                "cumulative-event": [ "У Вас [0] новий лист", "У Вас [0] нові листи", "У Вас [0] нових листів", "У Вас немає нових листів" ]
            },
            nounread: "У вас немає непрочитаних листів",
            refresh: "Оновити",
            retry: "Спробуйте ще раз",
            setreaded: "Позначити як прочитане",
            settings: "Налаштування віджета",
            spam: "Позначити як спам",
            total: "всього [0]",
            tt: {
                create: "Написати новий лист",
                logo: "Перейти у Я.Пошту",
                refresh: "Оновити список листів"
            },
            wait: "Секундочку...",
            yabrowser: {
                description: "Кнопка на панелі браузера сповістить вас про нові листи в Яндекс.Пошті",
                title: "Кнопка Яндекс.Пошти"
            }
        };
    },
    230: function(module, exports, __webpack_require__) {
        "use strict";
        var get = __webpack_require__(31), info = __webpack_require__(44);
        module.exports = {
            init: function(callback) {
                callback();
            },
            get: function(property) {
                return get(info, property);
            }
        };
    },
    242: function(module, exports) {
        "use strict";
        module.exports = {
            events: {},
            moduleId: Math.random(),
            init: function(callback) {
                chrome.runtime.onMessage.addListener(this._chromeMessageHandler.bind(this)), "function" == typeof callback && callback();
            },
            trigger: function(topic, data, options, responseCallback) {
                var message = {
                    topic: topic,
                    data: data,
                    options: options || {},
                    transmitter: this.moduleId,
                    nano: !0
                };
                responseCallback ? chrome.runtime.sendMessage(message, responseCallback) : chrome.runtime.sendMessage(message);
            },
            on: function(topic, handler, ctx, once) {
                this.events[topic] || (this.events[topic] = []), this.events[topic].push({
                    topic: topic,
                    handler: handler,
                    ctx: ctx,
                    once: Boolean(once)
                });
            },
            once: function(topic, handler, ctx) {
                this.on(topic, handler, ctx, !0);
            },
            off: function(topic, handler) {
                this.events[topic] && (this.events[topic] = this.events[topic].filter(function(event) {
                    return event.topic !== topic || event.handler !== handler;
                }));
            },
            ignoreEvent: function(topic) {
                this.events[topic] && (this.events[topic] = this.events[topic].filter(function(event) {
                    return event.topic !== topic;
                }));
            },
            willTrigger: function(topic) {
                return Boolean(this.events[topic]) && this.events[topic].length > 0;
            },
            hasListener: function(topic, handler) {
                return !!this.events[topic] && this.events[topic].some(function(event) {
                    return event.topic === topic && event.handler === handler;
                });
            },
            sendToAllTabs: function(topic, data, options) {
                var message = {
                    topic: topic,
                    data: data,
                    options: options || {}
                }, tabsQuery = {
                    currentWindow: !0
                };
                chrome.tabs.query(tabsQuery, function(tabs) {
                    tabs && tabs.length && tabs.forEach(function(tab) {
                        chrome.tabs.sendMessage(tab.id, message);
                    });
                });
            },
            sendToActiveTab: function(topic, data, options) {
                var message = {
                    topic: topic,
                    data: data,
                    options: options
                }, tabsQuery = {
                    currentWindow: !0,
                    active: !0
                };
                chrome.tabs.query(tabsQuery, function(tabs) {
                    tabs && tabs.length && chrome.tabs.sendMessage(tabs[0].id, message);
                });
            },
            sendToTab: function(tabId, topic, data, options, responseCallback) {
                var message = {
                    topic: topic,
                    data: data,
                    options: options
                };
                responseCallback ? chrome.tabs.sendMessage(tabId, message, responseCallback) : chrome.tabs.sendMessage(tabId, message);
            },
            flush: function() {
                Object.keys(this.events).forEach(function(event) {
                    this.events[event] = [];
                }, this);
            },
            _chromeMessageHandler: function(message, sender, sendResponse) {
                if (message && message.topic && message.transmitter !== this.moduleId) {
                    var topic = message.topic, data = message.data || {}, options = message.options || {};
                    return options.tab = sender ? sender.tab : null, options.sendResponse = sendResponse, 
                    this._internalTrigger(topic, data, options), Boolean(options.asyncResponse);
                }
            },
            _internalTrigger: function(topic, data, options) {
                var triggers = [];
                this.events[topic] && (this.events[topic] = this.events[topic].filter(function(event) {
                    return event.handler && triggers.push(event), !event.once;
                }), triggers.forEach(function(event) {
                    event.handler.call(event.ctx, topic, data, options);
                }));
            }
        };
    },
    251: function(module, exports) {
        "use strict";
        module.exports = {
            UPDATE_PREFERENCE: "options.update.preferences",
            UPDATE_SHARED_DATA: "options.update.shared.data",
            CLICKER: "options.send.statistics",
            NAVIGATE: "options.navigate",
            SHOW_LOG: "options.show.log",
            RESTORE_DEFAULTS: "options.restore.defaults"
        };
    },
    255: function(module, exports, __webpack_require__) {
        "use strict";
        function nulls(val) {
            return null != val && "" !== val;
        }
        function joinClasses(val) {
            return (Array.isArray(val) ? val.map(joinClasses) : val && "object" == typeof val ? Object.keys(val).filter(function(key) {
                return val[key];
            }) : [ val ]).filter(nulls).join(" ");
        }
        function jade_encode_char(c) {
            return jade_encode_html_rules[c] || c;
        }
        function jade_escape(html) {
            var result = String(html).replace(jade_match_html, jade_encode_char);
            return result === "" + html ? html : result;
        }
        exports.merge = function merge(a, b) {
            if (1 === arguments.length) {
                for (var attrs = a[0], i = 1; i < a.length; i++) attrs = merge(attrs, a[i]);
                return attrs;
            }
            var ac = a.class, bc = b.class;
            (ac || bc) && (ac = ac || [], bc = bc || [], Array.isArray(ac) || (ac = [ ac ]), 
            Array.isArray(bc) || (bc = [ bc ]), a.class = ac.concat(bc).filter(nulls));
            for (var key in b) "class" != key && (a[key] = b[key]);
            return a;
        }, exports.joinClasses = joinClasses, exports.cls = function(classes, escaped) {
            for (var buf = [], i = 0; i < classes.length; i++) escaped && escaped[i] ? buf.push(exports.escape(joinClasses([ classes[i] ]))) : buf.push(joinClasses(classes[i]));
            var text = joinClasses(buf);
            return text.length ? ' class="' + text + '"' : "";
        }, exports.style = function(val) {
            return val && "object" == typeof val ? Object.keys(val).map(function(style) {
                return style + ":" + val[style];
            }).join(";") : val;
        }, exports.attr = function(key, val, escaped, terse) {
            return "style" === key && (val = exports.style(val)), "boolean" == typeof val || null == val ? val ? " " + (terse ? key : key + '="' + key + '"') : "" : 0 == key.indexOf("data") && "string" != typeof val ? (JSON.stringify(val).indexOf("&") !== -1, 
            val && "function" == typeof val.toISOString, " " + key + "='" + JSON.stringify(val).replace(/'/g, "&apos;") + "'") : escaped ? (val && "function" == typeof val.toISOString, 
            " " + key + '="' + exports.escape(val) + '"') : (val && "function" == typeof val.toISOString, 
            " " + key + '="' + val + '"');
        }, exports.attrs = function(obj, terse) {
            var buf = [], keys = Object.keys(obj);
            if (keys.length) for (var i = 0; i < keys.length; ++i) {
                var key = keys[i], val = obj[key];
                "class" == key ? (val = joinClasses(val)) && buf.push(" " + key + '="' + val + '"') : buf.push(exports.attr(key, val, !1, terse));
            }
            return buf.join("");
        };
        var jade_encode_html_rules = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }, jade_match_html = /[&<>"]/g;
        exports.escape = jade_escape, exports.rethrow = function rethrow(err, filename, lineno, str) {
            if (!(err instanceof Error)) throw err;
            if (!("undefined" == typeof window && filename || str)) throw err.message += " on line " + lineno, 
            err;
            try {
                str = str || __webpack_require__(256).readFileSync(filename, "utf8");
            } catch (ex) {
                rethrow(err, null, lineno);
            }
            var context = 3, lines = str.split("\n"), start = Math.max(lineno - context, 0), end = Math.min(lines.length, lineno + context), context = lines.slice(start, end).map(function(line, i) {
                var curr = i + start + 1;
                return (curr == lineno ? "  > " : "    ") + curr + "| " + line;
            }).join("\n");
            throw err.path = filename, err.message = (filename || "Jade") + ":" + lineno + "\n" + context + "\n\n" + err.message, 
            err;
        }, exports.DebugItem = function(lineno, filename) {
            this.lineno = lineno, this.filename = filename;
        };
    },
    256: function(module, exports) {},
    263: function(module, exports, __webpack_require__) {
        "use strict";
        function locale() {
            return i18n.message.apply(i18n, [].slice.call(arguments));
        }
        function brandingUrl() {
            return branding.data.apply(i18n, [].slice.call(arguments));
        }
        function getVersionDate() {
            var date = new Date(1e3 * parseInt(buildInfo.get("date")));
            return utils.dateToString(date);
        }
        function getVersion() {
            return buildInfo.get("version") + "-" + buildInfo.get("build") + " (" + buildInfo.get("sha").replace("\n", "") + ")";
        }
        var i18n = __webpack_require__(93), branding = __webpack_require__(30), buildInfo = __webpack_require__(230), preferences = __webpack_require__(6), browser = __webpack_require__(12), utils = __webpack_require__(7), disabled = "Disabled";
        module.exports = {
            get: function(modules) {
                var config = this._getDefaultConfig();
                return modules.forEach(function(module) {
                    config[module + disabled] = !1;
                }), config;
            },
            _getDefaultConfig: function() {
                return {
                    i18n: locale,
                    branding: brandingUrl,
                    brid: branding.get(),
                    dist: buildInfo.get("distribution"),
                    versionDate: getVersionDate(),
                    pref: preferences,
                    version: getVersion(),
                    firstYear: 2013,
                    lastYear: new Date().getFullYear(),
                    yabrowser: browser.isYabrowser(),
                    altsearchDisabled: !0,
                    contextMenuDisabled: !0,
                    gpautoDisabled: !0,
                    opinionsDisabled: !0,
                    infobarDisabled: !0,
                    logsDisabled: browser.isFirefox()
                };
            }
        };
    },
    264: function(module, exports, __webpack_require__) {
        "use strict";
        var buildInfo = __webpack_require__(230), browser = __webpack_require__(12), OptionsStats = __webpack_require__(265), optionUtils = __webpack_require__(266), optionsModel = __webpack_require__(267);
        module.exports = {
            REFRESH_HASH: "#refresh",
            render: function(html, title) {
                this._renderTemplate(html, title), this.firstShow && optionsModel.sendClicker({
                    action: OptionsStats.SHOW
                });
            },
            _renderTemplate: function(html, title) {
                return document.body ? this._render(html, title) : void document.addEventListener("DOMContentLoaded", this._render.bind(this, html, title));
            },
            _render: function(html, title) {
                this._appendContent(html, title), this._listenUserActions();
            },
            _appendContent: function(html, title) {
                document.title = title, document.body.innerHTML = html, document.body.classList.add(browser.getBrowser()), 
                document.body.classList.add(buildInfo.get("branding"));
            },
            _listenUserActions: function() {
                this._listenRestoreEvent(), this._listenLogEvent(), this._listenClick(), this._listenChangeEvent();
            },
            _listenRestoreEvent: function() {
                var restoreLink = document.getElementById("restore");
                restoreLink && restoreLink.addEventListener("click", this._restoreClickHandler.bind(this));
            },
            _restoreClickHandler: function(event) {
                event.preventDefault(), event.stopImmediatePropagation(), this._restoreSharedData(), 
                this._reloadPage();
            },
            _restoreSharedData: function() {
                var sharedSettings = this._getSharedSettings();
                optionsModel.restore(sharedSettings);
            },
            _getSharedSettings: function() {
                var sharedInputs = document.querySelectorAll("[data-shared='true']"), sharedOptions = [];
                return Array.prototype.forEach.call(sharedInputs, function(input) {
                    var setting = input.getAttribute("preference");
                    setting && sharedOptions.push(setting);
                }), sharedOptions;
            },
            _reloadPage: function() {
                window.location.hash = this.REFRESH_HASH, window.location.reload();
            },
            _listenLogEvent: function() {
                var logLink = document.getElementById("log-link");
                logLink && logLink.addEventListener("click", this._logHandler.bind(this));
            },
            _logHandler: function(event) {
                event.preventDefault(), event.stopImmediatePropagation(), optionsModel.showLog();
            },
            _listenClick: function() {
                document.addEventListener("click", this._clickHandler.bind(this));
            },
            _clickHandler: function(event) {
                event.stopImmediatePropagation(), "a" === event.target.tagName.toLowerCase() && (event.preventDefault(), 
                browser.navigate(event.target.href));
            },
            _listenChangeEvent: function() {
                document.addEventListener("change", this._changeHandler.bind(this));
            },
            _changeHandler: function(event) {
                var preference = event.target.getAttribute("preference"), isShared = Boolean(event.target.dataset && event.target.dataset.shared), value = optionUtils.getInputValue(event.target), preset = event.target.getAttribute("preset");
                preference && optionsModel.changeOptions(preference, value), preference && isShared && optionsModel.changeSharedOptions(preference, value), 
                preset && this._triggerClickerEvent(preset, value);
            },
            _triggerClickerEvent: function(preset, value) {
                var action = preset + (value ? ".on" : ".off");
                optionsModel.sendClicker({
                    action: action,
                    cid: 72359,
                    feature: "presets"
                });
            },
            get firstShow() {
                return window.location.hash !== this.REFRESH_HASH;
            }
        };
    },
    265: function(module, exports) {
        "use strict";
        module.exports = {
            SHOW: "settings"
        };
    },
    266: function(module, exports) {
        "use strict";
        module.exports = {
            getInputValue: function(input) {
                var type = input.getAttribute("type"), value = input.value;
                return "checkbox" === type && (value = Boolean(input.checked)), "number" === type && (value = this.getNumberInputValue(input), 
                input.value = value), value;
            },
            getNumberInputValue: function(input) {
                var min = parseInt(input.getAttribute("min"), 10), max = parseInt(input.getAttribute("max"), 10), value = parseInt(input.value, 10);
                return isNaN(value) && (value = 1), min && value < parseInt(min, 10) ? min : max && value > parseInt(max, 10) ? max : value;
            }
        };
    },
    267: function(module, exports, __webpack_require__) {
        "use strict";
        var dispatcher = __webpack_require__(242), OptionEvent = __webpack_require__(251);
        module.exports = {
            restore: function(sharedItems) {
                dispatcher.trigger(OptionEvent.RESTORE_DEFAULTS, sharedItems);
            },
            changeOptions: function(key, value) {
                dispatcher.trigger(OptionEvent.UPDATE_PREFERENCE, {
                    key: key,
                    value: value
                });
            },
            changeSharedOptions: function(key, value) {
                var data = {};
                data[key] = value, dispatcher.trigger(OptionEvent.UPDATE_SHARED_DATA, data);
            },
            sendClicker: function(data) {
                dispatcher.trigger(OptionEvent.CLICKER, data);
            },
            showLog: function() {
                dispatcher.trigger(OptionEvent.SHOW_LOG);
            }
        };
    },
    268: function(module, exports, __webpack_require__) {
        var jade = __webpack_require__(255);
        module.exports = function(locals) {
            var jade_interp, buf = [], locals_for_with = locals || {};
            return function(branding, contextMenuDisabled, firstYear, gpautoDisabled, i18n, lastYear, logsDisabled, name, opinionsDisabled, option, pref, restoreDisabled, title, version, versionDate, yabrowser) {
                buf.push('<div class="header">' + jade.escape(null == (jade_interp = title) ? "" : jade_interp) + '</div><hr/><div class="group checkbox"><label>'), 
                option = "application.mail-protocol-hook", buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + '/><div class="title">' + jade.escape(null == (jade_interp = i18n("options.mail-protocol-hook")) ? "" : jade_interp) + "</div></label></div>"), 
                yabrowser || (buf.push('<div class="group checkbox"><label>'), option = "showTextAlert", 
                buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + '/><div class="title">' + jade.escape(null == (jade_interp = i18n("options.mail-push-enable")) ? "" : jade_interp) + '</div></label></div><div class="group checkbox"><label>'), 
                option = "playSoundAlert", buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + ' preset="mailsound"/><div class="title">' + jade.escape(null == (jade_interp = i18n("mail.alert.sound.label")) ? "" : jade_interp) + "</div></label></div>")), 
                buf.push('<div class="group checkbox"><label>'), option = "allAccountsCounter", 
                buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + ' preset="sumcount"/><div class="title">' + jade.escape(null == (jade_interp = i18n("options.mail-show-all-counter")) ? "" : jade_interp) + '</div></label></div><div class="group checkbox"><label>'), 
                option = "application.open-portal", buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + '/><div class="title">' + jade.escape(null == (jade_interp = i18n("mail.openServiceOnClick.label")) ? "" : jade_interp) + "</div></label></div>"), 
                contextMenuDisabled || (buf.push('<div class="group checkbox"><label>'), option = "application.context-menu.enabled", 
                buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + ' data-shared="true" preset="context_menu"/><div class="title">' + jade.escape(null == (jade_interp = i18n("context-menu.options-text")) ? "" : jade_interp) + "</div></label></div>")), 
                opinionsDisabled || (buf.push('<div class="group checkbox"><label>'), option = "application.tab.opinions.enabled", 
                buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + ' data-shared="true" preset="barnavig"/><div class="title">' + jade.escape(null == (jade_interp = i18n("options.opinions.label")) ? "" : jade_interp) + "</div></label></div>")), 
                gpautoDisabled || (buf.push('<div class="group checkbox"><label>'), option = "application.geolocation.enabled", 
                buf.push('<input type="checkbox"' + jade.attr("checked", pref.get(option), !0, !1) + jade.attr("preference", option, !0, !1) + ' data-shared="true" preset="location"/><div class="title">' + jade.escape(null == (jade_interp = i18n("geolocation.options-text")) ? "" : jade_interp) + "</div></label></div>")), 
                "undefined" != typeof restoreDisabled && restoreDisabled !== !1 || buf.push('<div style="margin-top: 30px" class="group"><a id="restore" href="#">' + jade.escape(null == (jade_interp = i18n("options.restore.label")) ? "" : jade_interp) + "</a></div>"), 
                logsDisabled || buf.push('<div class="group"><a id="log-link" href="">' + jade.escape(null == (jade_interp = i18n("options.logs")) ? "" : jade_interp) + "</a></div>"), 
                buf.push('<div style="margin-top: 30px" class="group"><a' + jade.attr("href", branding("soft.url"), !0, !1) + ' target="_blank">' + jade.escape(null == (jade_interp = i18n("soft.label")) ? "" : jade_interp) + '</a></div><div class="group"><a' + jade.attr("href", branding("support.url"), !0, !1) + ' target="_blank">' + jade.escape(null == (jade_interp = i18n("support.label")) ? "" : jade_interp) + '</a></div><div class="group"><a' + jade.attr("href", branding("license.url"), !0, !1) + ' target="_blank">' + jade.escape(null == (jade_interp = i18n("license.label")) ? "" : jade_interp) + '</a></div><div style="font-size: 1em" class="group">' + jade.escape(null == (jade_interp = name) ? "" : jade_interp) + "<br/>" + jade.escape(null == (jade_interp = i18n("legal.version", [ version, versionDate ])) ? "" : jade_interp) + "<br/>&copy; " + jade.escape(null == (jade_interp = firstYear) ? "" : jade_interp) + jade.escape(null == (jade_interp = lastYear > firstYear ? "-" + lastYear : "") ? "" : jade_interp) + " " + jade.escape(null == (jade_interp = i18n("legal.yandex")) ? "" : jade_interp) + "</div>");
            }.call(this, "branding" in locals_for_with ? locals_for_with.branding : "undefined" != typeof branding ? branding : void 0, "contextMenuDisabled" in locals_for_with ? locals_for_with.contextMenuDisabled : "undefined" != typeof contextMenuDisabled ? contextMenuDisabled : void 0, "firstYear" in locals_for_with ? locals_for_with.firstYear : "undefined" != typeof firstYear ? firstYear : void 0, "gpautoDisabled" in locals_for_with ? locals_for_with.gpautoDisabled : "undefined" != typeof gpautoDisabled ? gpautoDisabled : void 0, "i18n" in locals_for_with ? locals_for_with.i18n : "undefined" != typeof i18n ? i18n : void 0, "lastYear" in locals_for_with ? locals_for_with.lastYear : "undefined" != typeof lastYear ? lastYear : void 0, "logsDisabled" in locals_for_with ? locals_for_with.logsDisabled : "undefined" != typeof logsDisabled ? logsDisabled : void 0, "name" in locals_for_with ? locals_for_with.name : "undefined" != typeof name ? name : void 0, "opinionsDisabled" in locals_for_with ? locals_for_with.opinionsDisabled : "undefined" != typeof opinionsDisabled ? opinionsDisabled : void 0, "option" in locals_for_with ? locals_for_with.option : "undefined" != typeof option ? option : void 0, "pref" in locals_for_with ? locals_for_with.pref : "undefined" != typeof pref ? pref : void 0, "restoreDisabled" in locals_for_with ? locals_for_with.restoreDisabled : "undefined" != typeof restoreDisabled ? restoreDisabled : void 0, "title" in locals_for_with ? locals_for_with.title : "undefined" != typeof title ? title : void 0, "version" in locals_for_with ? locals_for_with.version : "undefined" != typeof version ? version : void 0, "versionDate" in locals_for_with ? locals_for_with.versionDate : "undefined" != typeof versionDate ? versionDate : void 0, "yabrowser" in locals_for_with ? locals_for_with.yabrowser : "undefined" != typeof yabrowser ? yabrowser : void 0), 
            buf.join("");
        };
    }
});