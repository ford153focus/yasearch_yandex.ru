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
}([ function(module, exports, __webpack_require__) {
    __webpack_require__(2), module.exports = __webpack_require__(4);
}, , function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(3), eventChannelFactory = utils.eventChannelFactory, callbackExecutorFactory = utils.callbackExecutorFactory;
    if ("undefined" == typeof chrome.runtime.onMessageExternal && (chrome.runtime.onMessageExternal = eventChannelFactory()), 
    "string" != typeof chrome.runtime.PlatformOs) {
        var platformOs = window.navigator.platform.toLowerCase();
        platformOs.indexOf("win") !== -1 && (platformOs = "win"), platformOs.indexOf("mac") !== -1 && (platformOs = "mac"), 
        platformOs.indexOf("linux") !== -1 && (platformOs = "linux"), chrome.runtime.PlatformOs = platformOs;
    }
    "undefined" == typeof chrome.management && (chrome.management = {}, [ "onInstalled", "onUninstalled", "onEnabled", "onDisabled" ].forEach(function(eventName) {
        chrome.management[eventName] = eventChannelFactory();
    }), [ [ "getAll", [] ], [ "get", null ], [ "getSelf", {} ], [ "getPermissionWarningsById", [] ], [ "getPermissionWarningsByManifest", [] ], [ "setEnabled" ], [ "uninstall" ], [ "uninstallSelf" ], [ "launchApp" ], [ "createAppShortcut" ], [ "setLaunchType" ], [ "generateAppForLink", {} ] ].forEach(function(config) {
        var method = config.shift();
        chrome.management[method] = callbackExecutorFactory.apply(null, config);
    })), "undefined" != typeof chrome.bookmarks && ("undefined" == typeof chrome.bookmarks.onImportBegan && (chrome.bookmarks.onImportBegan = eventChannelFactory()), 
    "undefined" == typeof chrome.bookmarks.onImportEnded && (chrome.bookmarks.onImportEnded = eventChannelFactory()));
}, function(module, exports) {
    "use strict";
    exports.callbackExecutorFactory = function() {
        var yields = arguments;
        return function() {
            var callback = arguments[arguments.length - 1];
            "function" == typeof callback && setTimeout(function() {
                callback.apply(null, yields);
            }, 0);
        };
    }, exports.eventChannelFactory = function() {
        return {
            addListener: function() {},
            removeListener: function() {}
        };
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function setYabrowserPreferences() {
        browser.isYabrowser() && (preferences.setDefault("showTextAlert", !1), preferences.set("showTextAlert", !1));
    }
    function sendIncognitoStats() {
        Clicker.send({
            action: "incognito",
            feature: config.get("clckFeature"),
            platform: browser.getBrowser()
        });
    }
    function setupUncaughtLogger() {
        uncaughtLogger.run(Logger.create("uncaught"));
    }
    var config = __webpack_require__(5), preferences = __webpack_require__(6), branding = __webpack_require__(30), platform = __webpack_require__(11), booster = __webpack_require__(49), browser = __webpack_require__(12), authManager = __webpack_require__(234), welcome = __webpack_require__(240), mailto = __webpack_require__(241), audio = __webpack_require__(243), Migration = __webpack_require__(244), counter = __webpack_require__(246), buttonController = __webpack_require__(247), incognitoBlocker = __webpack_require__(249), Clicker = __webpack_require__(104), statHelpers = (__webpack_require__(238), 
    __webpack_require__(92)), outerDispatcher = __webpack_require__(242), innerDispatcher = __webpack_require__(9), optionsObserver = __webpack_require__(250), clickerObserver = __webpack_require__(258), notification = __webpack_require__(239), uncaughtLogger = __webpack_require__(259), Logger = __webpack_require__(13);
    config.update({
        name: "mail",
        yasoft: "mailchrome",
        clckFeature: "yamail"
    }), statHelpers.register({
        notificationStatus: function() {
            return preferences.get("showTextAlert");
        },
        authStatus: function() {
            return authManager.hasAuthUsers();
        },
        loginCount: function() {
            return authManager.countAuthUsers();
        }
    }), platform.status === platform.UPGRADE && Migration.up(), preferences.defaults({
        "application.sign-in.remember": !0,
        "application.mail.selected": null,
        "application.mail.accounts": [],
        "application.mail-protocol-hook": !0,
        "application.open-portal": !1,
        playSoundAlert: !1,
        showTextAlert: !0,
        allAccountsCounter: !0
    }), incognitoBlocker.before(sendIncognitoStats), booster.appendToInit([ incognitoBlocker, outerDispatcher ]), 
    booster.appendToRun([ optionsObserver, clickerObserver ]), booster.run(function() {
        setYabrowserPreferences(), setupUncaughtLogger(), notification.init(), buttonController.init(), 
        mailto.init(), counter.init(), audio.init(), authManager.init(innerDispatcher, branding.get()), 
        welcome.init();
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var preferences = __webpack_require__(6), utils = __webpack_require__(7), platform = __webpack_require__(11), branding = __webpack_require__(30), vendor = __webpack_require__(45), dispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), crossMessaging = __webpack_require__(46), sharedData = __webpack_require__(48), buildInfo = __webpack_require__(44);
    module.exports = {
        INSTALL_DATE_OPTION: "application.installDate",
        NOTIFY_ENABLED_OPTION: "application.notifications.enabled",
        ENABLE_STAT_OPTION: "application.tab.opinions.enabled",
        STAT_OPTION_CHANGED: "application.opinions.pref.changed",
        YANDEX_UI_OPTION: "yandex.statistics.yandexUi",
        UI_OPTION: "yandex.statistics.ui",
        BUILD_NUMBER_OPTION: "application.build",
        BUILD_SHA_OPTION: "application.sha",
        VERSION_DATE_OPTION: "application.versionDate",
        options: {
            yasoft: "",
            name: "nano",
            clckFeature: "",
            captureFeatures: []
        },
        tldMap: {
            yandex: "ru",
            tb: "com.tr",
            ua: "ua"
        },
        versionRule: /^(\d+)\.(\d+).(\d+)$/i,
        init: function(callback) {
            this._listenElection(), this._setStatOption(), this._setBuildInfo(), this._setInstallDate(), 
            utils.isFunction(callback) && callback();
        },
        update: function(data) {
            Object.keys(data).forEach(function(key) {
                this.options[key] = data[key];
            }, this);
        },
        get: function(property) {
            return this.options[property];
        },
        synchronize: function() {
            crossMessaging.set("yasoft", this.get("yasoft")), crossMessaging.set("version", this.version), 
            crossMessaging.set("captureFeatures", this.get("captureFeatures")), crossMessaging.set("ui", this.ui), 
            crossMessaging.set("uninstallUrl", this.uninstallUrl), crossMessaging.set("yandexUi", preferences.get("yandex.statistics.is-yandex-ui") ? this.ui : "");
            var clid1 = vendor.get(1);
            clid1 && crossMessaging.set("clid1", clid1);
        },
        _setInstallDate: function() {
            var date = preferences.get(this.INSTALL_DATE_OPTION);
            date || (date = Math.round(new Date().getTime() / 1e3), preferences.setDefault(this.INSTALL_DATE_OPTION, date));
        },
        _listenElection: function() {
            dispatcher.on(AppEvent.ELECTION_COMPLETED, this._onElectionCompleted, this);
        },
        _onElectionCompleted: function() {
            sharedData.weakSet(this.ENABLE_STAT_OPTION, preferences.get(this.ENABLE_STAT_OPTION));
        },
        _setStatOption: function() {
            var enableStatOption = preferences.getDefault(this.ENABLE_STAT_OPTION);
            utils.isDefined(enableStatOption) || preferences.setDefault(this.ENABLE_STAT_OPTION, !1);
        },
        _setBuildInfo: function() {
            preferences.set(this.BUILD_NUMBER_OPTION, buildInfo.build), preferences.set(this.BUILD_SHA_OPTION, buildInfo.sha), 
            preferences.set(this.VERSION_DATE_OPTION, buildInfo.date);
        },
        _getUIFromPreferences: function() {
            return preferences.get(this.UI_OPTION) || preferences.set(this.UI_OPTION, utils.getUI()), 
            preferences.get(this.UI_OPTION);
        },
        _getUIFromSharedData: function() {
            return sharedData.get(this.YANDEX_UI_OPTION) || sharedData.get(this.UI_OPTION);
        },
        get buildNumber() {
            return preferences.get(this.BUILD_NUMBER_OPTION);
        },
        get buildSha() {
            return preferences.get(this.BUILD_SHA_OPTION);
        },
        get versionDate() {
            return preferences.get(this.VERSION_DATE_OPTION);
        },
        get production() {
            return "undefined" != typeof PRODUCTION;
        },
        get ui() {
            return this._getUIFromSharedData() || this._getUIFromPreferences();
        },
        get uninstallUrl() {
            var params = {
                yasoft: this.get("yasoft") + platform.yasoftPostfix,
                ui: this.ui,
                ver: this.version,
                os: platform.platform,
                stat: "uninstall",
                brandID: branding.get(),
                clid: vendor.get(1)
            };
            return preferences.get("disable.share.uninstall") ? null : utils.generateUrl(branding.url("soft-export.url"), params);
        },
        get installDate() {
            var date = preferences.get(this.INSTALL_DATE_OPTION);
            return date || (date = Math.round(new Date().getTime() / 1e3), preferences.setDefault(this.INSTALL_DATE_OPTION, date)), 
            date;
        },
        get version() {
            return platform.appInfo.version;
        },
        get smallVersion() {
            return this.version.replace(this.versionRule, "$1.$2");
        },
        get platform() {
            return platform.platform;
        },
        get branding() {
            return branding.get();
        },
        get tld() {
            return this.tldMap[this.branding] || this.tldMap.yandex;
        }
    };
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports, __webpack_require__) {
    "use strict";
    var appInfo, appStatus, upgradeStatus, upgradedVersion, browser = __webpack_require__(12), preferences = __webpack_require__(6), Logger = __webpack_require__(13), utils = __webpack_require__(7), versionKey = "application.version", logger = Logger.create("Platform"), Platform = function() {
        appInfo = chrome.runtime.getManifest(), this.updateStatus(), logger.log("App status: %s", appStatus), 
        logger.log("App version: %s", this.appInfo.version);
    };
    Platform.prototype = {
        REFRESH: "refresh",
        INSTALL: "install",
        UPGRADE: "upgrade",
        UPGRADE_MAJOR: "major",
        UPGRADE_MINOR: "minor",
        UPGRADE_PATCH: "patch",
        WIN_PLATFORM: "winnt",
        MAC_PLATFORM: "darwin",
        name: "chrome",
        updateStatus: function() {
            var previousVersion = preferences.get(versionKey), currentVersion = this.appInfo.version;
            previousVersion ? (previousVersion !== currentVersion ? (appStatus = this.UPGRADE, 
            upgradedVersion = previousVersion, upgradeStatus = this._getUpgradeStatus(currentVersion, previousVersion)) : appStatus = this.REFRESH, 
            this.appInfo.previousVersion = previousVersion) : appStatus = this.INSTALL, preferences.set(versionKey, currentVersion);
        },
        isBackgroundProcess: function() {
            return this.backgroundProcess === window;
        },
        uninstall: function(message, callback) {
            browser.isYabrowser() || (window.alert(message), chrome.management.uninstall(this.id, {
                showConfirmDialog: !1
            }, callback));
        },
        setUninstallUrl: function(url) {
            var support = !1;
            return "function" == typeof chrome.runtime.setUninstallUrl && (chrome.runtime.setUninstallUrl(url), 
            support = !0), support;
        },
        onUninstall: function(callback) {
            chrome.management.onUninstalled.addListener(callback);
        },
        isWindows: function() {
            return this.platform === this.WIN_PLATFORM;
        },
        isMac: function() {
            return this.platform === this.MAC_PLATFORM;
        },
        get isInstall() {
            return this.status === this.INSTALL;
        },
        get isUpgrade() {
            return this.status === this.UPGRADE;
        },
        get isUpgradeMajor() {
            return this.upgradeStatus === this.UPGRADE_MAJOR;
        },
        get isUpgradeMinor() {
            return this.upgradeStatus === this.UPGRADE_MINOR;
        },
        get isUpgradePatch() {
            return this.upgradeStatus === this.UPGRADE_PATCH;
        },
        get upgradedVersion() {
            return upgradedVersion;
        },
        get upgradedMajMinVersion() {
            return upgradedVersion && utils.getMajMinVersion(upgradedVersion);
        },
        get majMinVersion() {
            return utils.getMajMinVersion(this.appInfo.version);
        },
        get isRefresh() {
            return this.status === this.REFRESH;
        },
        get appInfo() {
            return appInfo;
        },
        get baseUri() {
            return chrome.extension.getURL("/");
        },
        get id() {
            return chrome.runtime.id;
        },
        get backgroundProcess() {
            return chrome.extension.getBackgroundPage();
        },
        get versionKey() {
            return versionKey;
        },
        get status() {
            return appStatus;
        },
        get upgradeStatus() {
            return upgradeStatus;
        },
        get platform() {
            var platform = window.navigator.platform;
            return platform.toLowerCase().indexOf("win") >= 0 && (platform = this.WIN_PLATFORM), 
            platform.toLowerCase().indexOf("mac") >= 0 && (platform = this.MAC_PLATFORM), platform;
        },
        get yasoftPostfix() {
            return browser.isFirefox() ? "_ff" : browser.isOpera() ? "_opr" : browser.isYabrowser() ? "_ybr" : browser.isChrome() ? "_chr" : "_oth";
        },
        _getUpgradeStatus: function(currentVersion, previousVersion) {
            var current = currentVersion.split("."), previous = previousVersion.split(".");
            return current[0] !== previous[0] ? this.UPGRADE_MAJOR : current[1] !== previous[1] ? this.UPGRADE_MINOR : current[2] !== previous[2] ? this.UPGRADE_PATCH : "";
        }
    }, module.exports = new Platform();
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
    "use strict";
    var lggr = __webpack_require__(14), options = __webpack_require__(28), logger = new lggr.Logger("core", options);
    logger.create = logger.clone.bind(logger), module.exports = logger;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) return obj;
        var newObj = {};
        if (null != obj) for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
        return newObj.default = obj, newObj;
    }
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _logger = __webpack_require__(15), _logger2 = _interopRequireDefault(_logger), _utilsReplacer = __webpack_require__(17), _utilsReplacer2 = _interopRequireDefault(_utilsReplacer), _writersConsole = __webpack_require__(18), _writersConsole2 = _interopRequireDefault(_writersConsole), _writersWebFile = __webpack_require__(19), _writersWebFile2 = _interopRequireDefault(_writersWebFile), _formattersDate = __webpack_require__(21), _formattersDate2 = _interopRequireDefault(_formattersDate), _formattersMethod = __webpack_require__(22), _formattersMethod2 = _interopRequireDefault(_formattersMethod), _formattersPrefix = __webpack_require__(23), _formattersPrefix2 = _interopRequireDefault(_formattersPrefix), _formattersPlaceholders = __webpack_require__(24), _formattersPlaceholders2 = _interopRequireDefault(_formattersPlaceholders), _formattersPlaceholdersNormalizer = __webpack_require__(25), _formattersPlaceholdersNormalizer2 = _interopRequireDefault(_formattersPlaceholdersNormalizer), _formattersJoin = __webpack_require__(26), _formattersJoin2 = _interopRequireDefault(_formattersJoin), _formattersJoinFirst = __webpack_require__(27), _formattersJoinFirst2 = _interopRequireDefault(_formattersJoinFirst), _utilsWebFile = __webpack_require__(20), _utilsWebFile2 = _interopRequireDefault(_utilsWebFile), _utils = __webpack_require__(16), utils = _interopRequireWildcard(_utils), combineFormatters = utils.combineFormatters;
    exports.Logger = _logger2.default, exports.Replacer = _utilsReplacer2.default, exports.WebFile = _utilsWebFile2.default, 
    exports.createConsoleWriter = _writersConsole2.default, exports.createWebFileWriter = _writersWebFile2.default, 
    exports.createDateFormatter = _formattersDate2.default, exports.createMethodFormatter = _formattersMethod2.default, 
    exports.createPrefixFormatter = _formattersPrefix2.default, exports.createPlaceholdersFormatter = _formattersPlaceholders2.default, 
    exports.createNormalFormatter = _formattersPlaceholdersNormalizer2.default, exports.createJoinFormatter = _formattersJoin2.default, 
    exports.createJoinFirstFormatter = _formattersJoinFirst2.default, exports.combineFormatters = combineFormatters, 
    exports.utils = utils;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function isMethodAllowed(method, levels) {
        return !Array.isArray(levels) || levels.indexOf(method) !== -1;
    }
    function assertOptions(options) {
        if (!options) throw new Error('You must specify "options" parameter for Logger');
        REQUIRED_OPTIONS.forEach(function(name) {
            if (void 0 === options[name]) throw new Error('You must specify "options.' + name + '" parameter for Logger');
        });
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _utils = __webpack_require__(16), REQUIRED_OPTIONS = [ "levels", "writers", "formatters", "methods" ], Logger = function() {
        function Logger(prefix, options) {
            _classCallCheck(this, Logger), assertOptions(options), this._clones = [], this._prefix = prefix, 
            this._opt = options, this._createMethods(this._opt.methods);
        }
        return _createClass(Logger, [ {
            key: "clone",
            value: function clone(prefix) {
                var clone = this.fork(prefix);
                return this._clones.push(clone), clone;
            }
        }, {
            key: "fork",
            value: function(prefix) {
                var Constructor = this.constructor ? this.constructor : Logger;
                return new Constructor(prefix, (0, _utils.shallowCopyObject)(this._opt));
            }
        }, {
            key: "message",
            value: function(method) {
                for (var _this = this, _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) args[_key - 1] = arguments[_key];
                this._forEachWriter(function(name, write, format, levels) {
                    isMethodAllowed(method, levels) && write(method, _this._prefix, format ? format(method, _this._prefix, args.slice()) : args);
                });
            }
        }, {
            key: "setLevels",
            value: function(name, levels) {
                this._opt.levels[name] = levels, this._updateClones("setLevels", name, levels);
            }
        }, {
            key: "addWriter",
            value: function(name, writer) {
                this._opt.writers[name] = writer, this._updateClones("addWriter", name, writer);
            }
        }, {
            key: "removeWriter",
            value: function(name) {
                this._opt.writers[name] && delete this._opt.writers[name], this._updateClones("removeWriter", name);
            }
        }, {
            key: "addFormatter",
            value: function(name, formatter) {
                this._opt.formatters[name] = formatter, this._updateClones("addFormatter", name, formatter);
            }
        }, {
            key: "removeFormatter",
            value: function(name) {
                this._opt.formatters[name] && delete this._opt.formatters[name], this._updateClones("removeFormatter", name);
            }
        }, {
            key: "_createMethods",
            value: function(methods) {
                var _this2 = this;
                methods.forEach(function(method) {
                    _this2[method] = _this2.message.bind(_this2, method);
                });
            }
        }, {
            key: "_forEachWriter",
            value: function(method) {
                var _this3 = this;
                Object.keys(this._opt.writers).forEach(function(name) {
                    method(name, _this3._opt.writers[name], _this3._opt.formatters[name], _this3._opt.levels[name]);
                });
            }
        }, {
            key: "_updateClones",
            value: function(method) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) args[_key2 - 1] = arguments[_key2];
                this._clones.forEach(function(clone) {
                    clone[method].apply(clone, args);
                });
            }
        } ]), Logger;
    }();
    exports.default = Logger, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function replacePlaceholders(replacer, args) {
        return "string" == typeof args[0] ? [ replacer.replace(args[0], args.slice(1)) ] : args;
    }
    function shallowCopyObject(object) {
        return Object.keys(object).reduce(function(result, key) {
            var subObject = object[key];
            return Array.isArray(subObject) ? result[key] = subObject.slice() : "function" == typeof subObject ? result[key] = subObject.bind(object) : "object" == typeof subObject ? result[key] = Object.assign({}, subObject) : result[key] = subObject, 
            result;
        }, {});
    }
    function toString(args) {
        var delimiter = arguments.length <= 1 || void 0 === arguments[1] ? " " : arguments[1];
        return 0 === args.length ? "undefined" : args.map(function(item) {
            return void 0 === item ? "undefined" : "string" == typeof item ? item : stringify(item);
        }).join(delimiter);
    }
    function stringify(item) {
        try {
            return JSON.stringify(item);
        } catch (e) {
            return String(item);
        }
    }
    function combineFormatters(formatters) {
        return function(method, prefix, args) {
            return formatters.reduce(function(formattedArgs, format) {
                return format(method, prefix, formattedArgs);
            }, args);
        };
    }
    function identity(data) {
        return data;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.replacePlaceholders = replacePlaceholders, exports.shallowCopyObject = shallowCopyObject, 
    exports.toString = toString, exports.combineFormatters = combineFormatters, exports.identity = identity;
}, function(module, exports) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function createDefaultFormats(options) {
        return {
            o: formatJSON,
            j: formatJSON,
            s: formatString,
            l: formatLimitedString.bind(null, options.limitStringLength),
            i: formatIntegerNumber.bind(null, options.nanString),
            d: formatIntegerNumber.bind(null, options.nanString),
            f: formatFloatNumber.bind(null, options.nanString),
            "%": function() {
                return "%";
            }
        };
    }
    function formatString(data) {
        return String(data);
    }
    function formatLimitedString(limitLength, data) {
        return String(data).substr(0, limitLength);
    }
    function formatIntegerNumber(nanString, data) {
        return "number" == typeof data ? String(Math.floor(data)) : nanString;
    }
    function formatFloatNumber(nanString, data) {
        return "number" == typeof data ? String(Number(data)) : nanString;
    }
    function formatJSON(data) {
        try {
            return JSON.stringify(data || "", null, 1);
        } catch (e) {
            return String(e);
        }
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), REG_EXP = /%(.)/gm, OPTIONS = {
        limitStringLength: 300,
        nanString: "NaN"
    }, Replacer = function() {
        function Replacer() {
            var options = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0];
            _classCallCheck(this, Replacer), options = Object.assign({}, OPTIONS, options), 
            this._formats = options.formats || createDefaultFormats(options), this._limitStringLength = options.limitStringLength, 
            this._nanString = options.nanString, this._regExp = REG_EXP;
        }
        return _createClass(Replacer, [ {
            key: "replace",
            value: function(string, data) {
                var _this = this, placeholderIndex = -1;
                return string.replace(this._regExp, function(total, match) {
                    return placeholderIndex += 1, _this._formatItem(match, data[placeholderIndex]);
                });
            }
        }, {
            key: "addPlaceholder",
            value: function(placeholder, formatter) {
                this._formats[placeholder] = formatter;
            }
        }, {
            key: "removePlaceholder",
            value: function(placeholder) {
                this._formats[placeholder] && delete this._formats[placeholder];
            }
        }, {
            key: "_formatItem",
            value: function(placeholder, item) {
                var formatter = this._formats[placeholder];
                return formatter ? formatter(item) : "%" + placeholder;
            }
        } ]), Replacer;
    }();
    exports.default = Replacer, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function create() {
        var apply = Function.prototype.apply, _console = console ? console : {};
        return function(method, prefix, formattedArgs) {
            _console[method] && apply.call(_console[method], _console, formattedArgs);
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function create(file, options) {
        var webFile = file || new _utilsWebFile2.default(options);
        return function(method, prefix, formattedArgs) {
            webFile.push(formattedArgs[0]);
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _utilsWebFile = __webpack_require__(20), _utilsWebFile2 = _interopRequireDefault(_utilsWebFile);
    module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), WebFile = function() {
        function WebFile(options) {
            _classCallCheck(this, WebFile), this._fileName = options.fileName, this._oldFileName = options.oldFileName, 
            this._maxSize = options.maxSize, this._messagesQueue = [], this._isRunning = !1, 
            this._fsLink = null;
        }
        return _createClass(WebFile, [ {
            key: "push",
            value: function(string) {
                this._messagesQueue.push(string), this._isRunning || (this._isRunning = !0, this._writeAttempt());
            }
        }, {
            key: "_writeAttempt",
            value: function() {
                var _this = this;
                this._requestFile(function(windowFsLink, fileEntry, fileWriter) {
                    fileWriter.onwriteend = _this._onWriteEnd.bind(_this), fileWriter.length > _this._maxSize ? _this._rotateLogs(windowFsLink, fileEntry, fileWriter) : (_this._appendQueueData(fileWriter), 
                    _this._messagesQueue = []);
                });
            }
        }, {
            key: "_onWriteEnd",
            value: function() {
                this._messagesQueue.length ? this._writeAttempt() : this._isRunning = !1;
            }
        }, {
            key: "_requestFile",
            value: function(callback) {
                var _this2 = this;
                this._requestFileSystem(function(fsLink) {
                    return _this2._requestFileWriter(fsLink, callback);
                });
            }
        }, {
            key: "_requestFileSystem",
            value: function(callback) {
                if (this._fsLink) return void callback(this._fsLink);
                try {
                    var requestFs = window.requestFileSystem || window.webkitRequestFileSystem;
                    requestFs(window.PERSISTENT, 0, callback);
                } catch (e) {}
            }
        }, {
            key: "_requestFileWriter",
            value: function(windowFsLink, callback) {
                windowFsLink.root.getFile(this._fileName, {
                    create: !0,
                    exclusive: !1
                }, function(fileEntry) {
                    return fileEntry.createWriter(function(fileWriter) {
                        return callback(windowFsLink, fileEntry, fileWriter);
                    });
                });
            }
        }, {
            key: "_rotateLogs",
            value: function(windowFsLink, fileEntry, fileWriter) {
                this._copy(windowFsLink.root, fileEntry, this._oldFileName, function() {
                    return fileWriter.truncate(0);
                });
            }
        }, {
            key: "_copy",
            value: function(cwd, fileEntry, newPath, callback) {
                fileEntry.copyTo(cwd, newPath, function(error) {
                    return callback(null, error);
                }, function(result) {
                    return callback(result);
                });
            }
        }, {
            key: "_appendQueueData",
            value: function(fileWriter) {
                fileWriter.seek(fileWriter.length), fileWriter.write(new Blob([ "\n" + this._messagesQueue.join("\n") ], {
                    type: "text/plain"
                }));
            }
        } ]), WebFile;
    }();
    exports.default = WebFile, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    }
    function create() {
        var createDate = arguments.length <= 0 || void 0 === arguments[0] ? createDatePart : arguments[0];
        return function(method, prefix, args) {
            return [ createDate() ].concat(_toConsumableArray(args));
        };
    }
    function createDatePart() {
        var timeZoneOffset = 6e4 * new Date().getTimezoneOffset(), dateWithReversedOffset = new Date(Date.now() - timeZoneOffset);
        return dateWithReversedOffset.toISOString().slice(0, -1);
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    }
    function create() {
        var mutator = arguments.length <= 0 || void 0 === arguments[0] ? _utils.identity : arguments[0];
        return function(method, prefix, args) {
            return [ mutator(method) ].concat(_toConsumableArray(args));
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _utils = __webpack_require__(16);
    module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    }
    function create() {
        var mutator = arguments.length <= 0 || void 0 === arguments[0] ? _utils.identity : arguments[0];
        return function(method, prefix, args) {
            return [ mutator(prefix) ].concat(_toConsumableArray(args));
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _utils = __webpack_require__(16);
    module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) return obj;
        var newObj = {};
        if (null != obj) for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
        return newObj.default = obj, newObj;
    }
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function create() {
        var replacer = arguments.length <= 0 || void 0 === arguments[0] ? new _utilsReplacer2.default() : arguments[0];
        return function(method, prefix, args) {
            return utils.replacePlaceholders(replacer, args);
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _utilsReplacer = __webpack_require__(17), _utilsReplacer2 = _interopRequireDefault(_utilsReplacer), _utils = __webpack_require__(16), utils = _interopRequireWildcard(_utils);
    module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function create() {
        var placeholders = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0], regList = createRegExpList(placeholders);
        return function(method, prefix, args) {
            return normalizePlaceholders(args, regList);
        };
    }
    function createRegExpList(placeholders) {
        return Object.keys(placeholders).map(function(placeholder) {
            return {
                normalPlaceholder: placeholders[placeholder],
                regExp: new RegExp("%" + placeholder, "g")
            };
        });
    }
    function normalizePlaceholders(args, regList) {
        return "string" == typeof args[0] && regList.forEach(function(item) {
            args[0] = args[0].replace(item.regExp, "%" + item.normalPlaceholder);
        }), args;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function create(delimiter) {
        return function(method, prefix, args) {
            return [ (0, _utils.toString)(args, delimiter) ];
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _utils = __webpack_require__(16);
    module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    }
    function create(count, delimiter) {
        return function(method, prefix, args) {
            return [ (0, _utils.toString)(args.slice(0, count), delimiter) ].concat(_toConsumableArray(args.slice(count)));
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _utils = __webpack_require__(16);
    module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var lggr = __webpack_require__(14), utils = __webpack_require__(29), logMethods = [ "log", "info", "warn", "error" ], logWriters = {}, logFormatters = {}, logLevels = {}, file = new lggr.WebFile({
        fileName: "debug.log",
        oldFileName: "debug-old.log",
        maxSize: 5242880
    });
    logWriters.platform = lggr.createWebFileWriter(file), logFormatters.platform = utils.fileFormatter, 
    logLevels.platform = [ "log", "info", "warn", "error" ], module.exports = {
        methods: logMethods,
        writers: logWriters,
        formatters: logFormatters,
        levels: logLevels
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function toUpperCase(str) {
        return str ? str.toUpperCase() : "";
    }
    function toLowerCase(str) {
        return str ? str.toLowerCase() : "";
    }
    var lggr = __webpack_require__(14), normalizePlaceholders = lggr.createNormalFormatter({
        j: "o",
        l: "s"
    }), mutatePrefix = function(prefix) {
        return "[" + prefix.toLowerCase() + "]";
    };
    module.exports = {
        toUpperCase: toUpperCase,
        toLowerCase: toLowerCase,
        normalizePlaceholders: normalizePlaceholders,
        consoleFormatter: lggr.combineFormatters([ normalizePlaceholders, lggr.createPrefixFormatter(mutatePrefix), lggr.createJoinFirstFormatter(2) ]),
        fileFormatter: lggr.combineFormatters([ lggr.createPlaceholdersFormatter(), lggr.createPrefixFormatter(mutatePrefix), lggr.createMethodFormatter(toUpperCase), lggr.createDateFormatter(), lggr.createJoinFormatter() ]),
        metrikaFormatter: lggr.combineFormatters([ lggr.createPlaceholdersFormatter(), lggr.createPrefixFormatter(mutatePrefix), lggr.createJoinFormatter() ]),
        transferFormatter: lggr.createPlaceholdersFormatter()
    };
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
    function get(object, path, defaultValue) {
        var result = null == object ? void 0 : baseGet(object, toPath(path), path + "");
        return void 0 === result ? defaultValue : result;
    }
    var baseGet = __webpack_require__(32), toPath = __webpack_require__(35);
    module.exports = get;
}, function(module, exports, __webpack_require__) {
    function baseGet(object, path, pathKey) {
        if (null != object) {
            void 0 !== pathKey && pathKey in toObject(object) && (path = [ pathKey ]);
            for (var index = 0, length = path.length; null != object && index < length; ) object = object[path[index++]];
            return index && index == length ? object : void 0;
        }
    }
    var toObject = __webpack_require__(33);
    module.exports = baseGet;
}, function(module, exports, __webpack_require__) {
    function toObject(value) {
        return isObject(value) ? value : Object(value);
    }
    var isObject = __webpack_require__(34);
    module.exports = toObject;
}, function(module, exports) {
    function isObject(value) {
        var type = typeof value;
        return !!value && ("object" == type || "function" == type);
    }
    module.exports = isObject;
}, function(module, exports, __webpack_require__) {
    function toPath(value) {
        if (isArray(value)) return value;
        var result = [];
        return baseToString(value).replace(rePropName, function(match, number, quote, string) {
            result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
        }), result;
    }
    var baseToString = __webpack_require__(36), isArray = __webpack_require__(37), rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g, reEscapeChar = /\\(\\)?/g;
    module.exports = toPath;
}, function(module, exports) {
    function baseToString(value) {
        return null == value ? "" : value + "";
    }
    module.exports = baseToString;
}, function(module, exports, __webpack_require__) {
    var getNative = __webpack_require__(38), isLength = __webpack_require__(42), isObjectLike = __webpack_require__(41), arrayTag = "[object Array]", objectProto = Object.prototype, objToString = objectProto.toString, nativeIsArray = getNative(Array, "isArray"), isArray = nativeIsArray || function(value) {
        return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
    };
    module.exports = isArray;
}, function(module, exports, __webpack_require__) {
    function getNative(object, key) {
        var value = null == object ? void 0 : object[key];
        return isNative(value) ? value : void 0;
    }
    var isNative = __webpack_require__(39);
    module.exports = getNative;
}, function(module, exports, __webpack_require__) {
    function isNative(value) {
        return null != value && (isFunction(value) ? reIsNative.test(fnToString.call(value)) : isObjectLike(value) && reIsHostCtor.test(value));
    }
    var isFunction = __webpack_require__(40), isObjectLike = __webpack_require__(41), reIsHostCtor = /^\[object .+?Constructor\]$/, objectProto = Object.prototype, fnToString = Function.prototype.toString, hasOwnProperty = objectProto.hasOwnProperty, reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    module.exports = isNative;
}, function(module, exports, __webpack_require__) {
    function isFunction(value) {
        return isObject(value) && objToString.call(value) == funcTag;
    }
    var isObject = __webpack_require__(34), funcTag = "[object Function]", objectProto = Object.prototype, objToString = objectProto.toString;
    module.exports = isFunction;
}, function(module, exports) {
    function isObjectLike(value) {
        return !!value && "object" == typeof value;
    }
    module.exports = isObjectLike;
}, function(module, exports) {
    function isLength(value) {
        return "number" == typeof value && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    var MAX_SAFE_INTEGER = 9007199254740991;
    module.exports = isLength;
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(7), preferences = __webpack_require__(6), clidSet = __webpack_require__(44).clid;
    module.exports = {
        CLID: "clid",
        PROPERTY_TEMPLATE: "yandex.statistics.clid.{clid}",
        init: function(callback) {
            utils.isFunction(callback) && callback();
        },
        get: function(clid) {
            return this._fromStorage(clid) || this._fromVendor(clid);
        },
        _fromStorage: function(clid) {
            return preferences.get(this.PROPERTY_TEMPLATE.replace("{clid}", clid));
        },
        _fromVendor: function(clid) {
            return clidSet[clid];
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var extensions = __webpack_require__(47), CrossMessaging = function() {
        this.info = {
            id: chrome.runtime.id,
            enabled: !0,
            protocol: this.PROTOCOL_VER
        }, this.protocol = this.PROTOCOL_VER, this.extinfo = {};
    };
    CrossMessaging.prototype = {
        PROTOCOL_VER: 2,
        HELLO_EVENT: "application.hello",
        WELCOME_EVENT: "application.welcome",
        set: function(key, value) {
            this.info[key] = value;
        },
        updateExtInfo: function(key, value) {
            var self = this;
            Object.keys(this.extinfo).forEach(function(extensionId) {
                self.extinfo[extensionId].hasOwnProperty(key) && (self.extinfo[extensionId][key] = value);
            });
        },
        run: function() {
            this._observeHelloMessages(), this._observeWelcomeMessages(), this._observeDisableEvent(), 
            extensions.notify(this.HELLO_EVENT, this.info, {
                transmit: !0
            });
        },
        addExtInfo: function(receivedData) {
            receivedData && (receivedData.protocol = receivedData.protocol || 0, receivedData.enabled = !("enabled" in receivedData) || receivedData.enabled, 
            !receivedData.yasoft && receivedData.uninstallUrl && (receivedData.yasoft = (receivedData.uninstallUrl.match(/yasoft=([\w\-]*)/i) || [])[1]), 
            this.extinfo[receivedData.id] = receivedData);
        },
        getFeaturedExtensions: function(feature, enabledOnly) {
            var searchExtensions = enabledOnly ? this.enabledExtensions : this.extinfo;
            return this.getFeaturedExtensionsFor(searchExtensions, feature);
        },
        getFeaturedExtensionsFor: function(extInfo, feature) {
            return Object.keys(extInfo).reduce(function(result, extensionId) {
                return extInfo[extensionId][feature] && (result[extensionId] = extInfo[extensionId]), 
                result;
            }, {});
        },
        _observeHelloMessages: function() {
            extensions.observe(this.HELLO_EVENT, this._helloMessageHandler.bind(this));
        },
        _helloMessageHandler: function(topic, data) {
            this.addExtInfo(data), extensions.notify(this.WELCOME_EVENT, this.info, {
                transmit: !0
            });
        },
        _observeWelcomeMessages: function() {
            extensions.observe(this.WELCOME_EVENT, this._welcomeMessageHandler.bind(this));
        },
        _welcomeMessageHandler: function(topic, data) {
            this.addExtInfo(data);
        },
        _observeDisableEvent: function() {
            chrome.management.onDisabled.addListener(this._disabledHandler.bind(this));
        },
        _disabledHandler: function(info) {
            this.extinfo[info.id] && (this.extinfo[info.id].enabled = !1);
        },
        get enabledExtensions() {
            var self = this, enabledExtensions = {};
            return Object.keys(this.extinfo).forEach(function(extensionId) {
                self.extinfo[extensionId].enabled && (enabledExtensions[extensionId] = self.extinfo[extensionId]);
            }), enabledExtensions;
        }
    }, module.exports = new CrossMessaging();
}, function(module, exports) {
    "use strict";
    function callFilter(func, params, timeout) {
        "function" == typeof func && setTimeout(function() {
            func.apply(null, params);
        }, timeout);
    }
    var Extensions = function() {
        this._listeners = {}, this._listenExternalMessages();
    };
    Extensions.prototype = {
        observe: function(topic, listener, options) {
            topic in this._listeners || (this._listeners[topic] = []), options = options || {}, 
            this._listeners[topic].push({
                listener: listener,
                once: Boolean(options.once),
                filter: Boolean(options.filter)
            });
        },
        notify: function(topic, data, options) {
            data = void 0 === data ? {} : data, options = options || {}, options.senderId || (options.senderId = chrome.runtime.id), 
            this._listeners[topic] && (this._listeners[topic] = this._listeners[topic].filter(function(observer) {
                return "function" == typeof observer.listener && (observer.filter ? callFilter(observer.listener, [ topic, data, options ], 10) : observer.listener(topic, data, options)), 
                !observer.once;
            })), options.transmit !== !1 && this.transmit(topic, data, options);
        },
        transmit: function(topic, data) {
            var self = this, args = {
                topic: topic,
                data: data,
                transmitter: this.id
            };
            chrome.management.getAll(function(all) {
                var extensions = self._getActualExtensions(all);
                extensions.forEach(function(extension) {
                    chrome.runtime.sendMessage(extension.id, args);
                });
            });
        },
        flush: function() {
            this._listeners = {};
        },
        _listenExternalMessages: function() {
            var onMessageExternal = chrome.runtime.onMessageExternal || chrome.extension.onMessageExternal;
            onMessageExternal.addListener(this._externalMessageHandler.bind(this));
        },
        _externalMessageHandler: function(request, sender) {
            sender.id !== chrome.runtime.id && this.notify(request.topic, request.data, {
                transmit: !1,
                senderId: sender.id
            });
        },
        _getActualExtensions: function(extensions) {
            return extensions.filter(function(extension) {
                return extension.id !== chrome.runtime.id && "extension" === extension.type && extension.enabled;
            });
        },
        get listeners() {
            return this._listeners;
        }
    }, module.exports = new Extensions();
}, function(module, exports) {
    "use strict";
    var notify = chrome.runtime.sendMessage, observer = chrome.runtime.onMessageExternal, logger = {
        info: function() {},
        log: function() {},
        warn: function() {},
        error: function() {}
    }, save = function() {}, messages = {
        SUCCESS: "success",
        NOT_MODIFIED: "not modified",
        INCORRECT_DATA: "incorrect data",
        INCORRECT_TOPIC: "incorrect topic",
        REJECTED: "rejected",
        TIMEOUT: "timeout",
        SYNC_RESPONSE: "sync response",
        UNKNOWN: "unknown"
    };
    module.exports = {
        init: function(options, callback) {
            options && (void 0 !== options.logger && (logger = options.logger), void 0 !== options.save && (save = options.save), 
            void 0 !== options.syncTimeout && (this._syncTimeout = options.syncTimeout)), this._observe(), 
            this._pull(callback);
        },
        weakSet: function(name, value) {
            void 0 === this.get(name) && this.set(name, value);
        },
        set: function(name, value, saveData, setTimestamp) {
            var updatedData;
            updatedData = "string" == typeof name ? this.setByName(name, value) : this.setObject(name), 
            updatedData && (saveData !== !1 && save(updatedData), setTimestamp !== !1 && (this._data._timestamp = updatedData._timestamp = Date.now()), 
            logger.log("Start notification logic for update: %j", updatedData), this._notifyLocal({
                topic: "yandex.shared.updated.local",
                data: updatedData
            }), this._push({
                topic: "yandex.shared.updated.remote",
                data: updatedData
            }, this._pushById.bind(this)));
        },
        setByName: function(name, value) {
            logger.log("Setting data by name: %s %j", name, value), this._data[name] = value;
            var updatedData = {};
            return updatedData[name] = value, updatedData;
        },
        setObject: function(data) {
            logger.log("Setting batch data: %j", data);
            var emptyObject = !0;
            for (var key in data) data.hasOwnProperty(key) && (emptyObject = !1, this.setByName(key, data[key]));
            return emptyObject ? null : data;
        },
        get: function(name) {
            return this._data[name];
        },
        addListener: function(listener) {
            for (var i = 0; i < this._listeners.length; i++) if (this._listeners[i] === listener) return;
            this._listeners.push(listener), logger.log("Add listener: %d", this._listeners.length);
        },
        removeListener: function(listener) {
            for (var i = 0; i < this._listeners.length; i++) if (this._listeners[i] === listener) return void this._listeners.splice(i, 1);
        },
        _data: {},
        _listeners: [],
        _syncTimeout: 500,
        _pull: function(callback) {
            logger.log("Start pull logic");
            var results = {};
            this._push({
                topic: "yandex.shared.sync-request"
            }, function(id, options) {
                notify(id, options, function(response) {
                    response && response.message === messages.SYNC_RESPONSE && (logger.log("Sync response from: %s %j", id, response), 
                    results[id] = response.data || {});
                }.bind(this));
            }.bind(this)), setTimeout(function() {
                var resultId;
                for (var id in results) results.hasOwnProperty(id) && (resultId || (resultId = id), 
                results[id]._timestamp > results[resultId]._timestamp && (resultId = id));
                var resultData = results[resultId];
                logger.info("Sync result data: %j", resultData), this.set(resultData, null, !0, !1), 
                callback && callback();
            }.bind(this), this._syncTimeout);
        },
        _merge: function(received) {
            var updatedData, notModified = !0, error = !1, message = messages.SUCCESS;
            if (received) if (this._data) {
                updatedData = {};
                for (var name in received) if (received.hasOwnProperty(name)) {
                    var newValue = received[name];
                    logger.log("Merging new data: %s %j %j", name, newValue, this._data[name]), this._data[name] !== newValue && ("_timestamp" !== name && (notModified = !1), 
                    this._data[name] = updatedData[name] = newValue);
                }
                message = notModified ? messages.NOT_MODIFIED : messages.SUCCESS;
            } else this._data = updatedData = received; else error = !0, message = messages.INCORRECT_DATA;
            return message === messages.SUCCESS && (save(updatedData), this._notifyLocal({
                topic: "yandex.shared.updated.remote",
                data: updatedData
            })), {
                error: error,
                message: message,
                updatedData: updatedData
            };
        },
        _observe: function() {
            observer.addListener(function(request, sender, sendResponse) {
                if (sender.id === chrome.runtime.id) return !1;
                switch (request.topic) {
                  case "yandex.shared.updated.remote":
                    this._onNewDataReceived(request.data, sendResponse);
                    break;

                  case "yandex.shared.sync-request":
                    logger.log("Response on sync request: %j", this._data), sendResponse({
                        message: messages.SYNC_RESPONSE,
                        data: this._data
                    });
                }
                return !0;
            }.bind(this));
        },
        _onNewDataReceived: function(data, sendResponse) {
            logger.log("Receive new data: %j", data);
            var mergeResult = this._merge(data);
            sendResponse({
                error: mergeResult.error,
                message: mergeResult.message
            });
        },
        _notifyLocal: function(options) {
            logger.log("Notify local listeners: %d %j", this._listeners.length, options), this._listeners.forEach(function(listener) {
                listener(options);
            });
        },
        _push: function(options, notifyMethod) {
            chrome.management.getAll(function(exts) {
                var actual = this._getActualExtensions(exts);
                logger.log("Remote extensions: %d", actual.length);
                for (var i = actual.length; i--; ) notifyMethod(actual[i].id, options);
            }.bind(this));
        },
        _pushById: function(id, options, repeat) {
            logger.log("Send notification to: %s %s %j", id, options.topic, options.data), notify(id, options, function(response) {
                if (!failedByTimeout) {
                    if (logger.log("Response from: %s %j", id, response), clearTimeout(failTimeout), 
                    !response || response.error) return void this._onPushFail(id, options, response ? response.message : messages.UNKNOWN, repeat);
                    switch (response.message) {
                      case messages.SUCCESS:
                      case messages.NOT_MODIFIED:
                        this._onPushSuccess(id);
                        break;

                      default:
                        this._onPushFail(id, options, response.message || messages.UNKNOWN, repeat);
                    }
                }
            }.bind(this));
            var failedByTimeout = !1, failTimeout = setTimeout(function() {
                failedByTimeout = !0, this._onPushFail(id, options, messages.TIMEOUT, repeat);
            }.bind(this), 3e3);
        },
        _onPushSuccess: function(id) {
            logger.log("Successful update for id: %s", id);
        },
        _onPushFail: function(id, options, message, repeat) {
            switch (logger.log("Failed update: %s; for id: %s", message, id), message) {
              case messages.UNKNOWN:
              case messages.TIMEOUT:
                repeat !== !1 && setTimeout(this._pushById.bind(this, id, options, !1), 100);
                break;

              default:
                logger.error("Can't handle this fail!");
            }
        },
        _getActualExtensions: function(exts) {
            for (var actual = [], i = exts.length; i--; ) {
                var ext = exts[i];
                ext.id !== chrome.runtime.id && "extension" === ext.type && ext.enabled && actual.push(ext);
            }
            return actual;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var config = __webpack_require__(5), crossMessaging = __webpack_require__(46), sharedDataWrapper = __webpack_require__(50), primary = __webpack_require__(51), async = __webpack_require__(64), utils = __webpack_require__(7), initer = __webpack_require__(68), runner = __webpack_require__(69), externalModules = __webpack_require__(70), AppEvent = __webpack_require__(10), dispatcher = __webpack_require__(9), sharedData = __webpack_require__(48), options = __webpack_require__(102), Logger = __webpack_require__(13), logger = Logger.create("Booster");
    module.exports = {
        initableModules: [ config ],
        runnableModules: [ sharedDataWrapper ],
        dynamicModules: {},
        requireDynamicModules: !0,
        initModules: !0,
        runModules: !0,
        runElections: !0,
        initializationListeners: [],
        inited: !1,
        run: function(callback) {
            dispatcher.once(AppEvent.ELECTION_COMPLETED, function() {
                var idForUi = primary.selectByFeature("ui", !0), ui = crossMessaging.extinfo[idForUi].ui;
                logger.info("Sync extension ui from %s. Ui is %s", idForUi, ui), sharedData.set(options.UI, crossMessaging.extinfo[idForUi].ui);
            }), async.series(this._getTasks(), this._onRunCompleted.bind(this, callback));
        },
        appendToRun: function(runnableModules) {
            utils.isArray(runnableModules) && (this.runnableModules = this.runnableModules.concat(runnableModules));
        },
        appendToInit: function(initableModules) {
            utils.isArray(initableModules) && (this.initableModules = this.initableModules.concat(initableModules));
        },
        onInitializationCompleted: function(listener) {
            this.inited ? listener() : this.initializationListeners.push(listener);
        },
        _onRunCompleted: function(callback, results) {
            this.inited = !0, this._callInitializationListeners(), utils.isFunction(callback) && callback(results);
        },
        _callInitializationListeners: function() {
            this.initializationListeners.forEach(function(listener) {
                listener();
            });
        },
        _initModules: function(done) {
            initer(this.initableModules, done);
        },
        _runModules: function(done) {
            runner(this.runnableModules), done();
        },
        _runExternalModules: function(done) {
            externalModules.runExternalModules(), this.dynamicModules = externalModules.modules, 
            done();
        },
        _getTasks: function() {
            var self = this, tasks = [ function(done) {
                externalModules.prepareExternalModules(), done();
            } ];
            return this.initModules && tasks.push(function(done) {
                return self._initModules(done);
            }), this.runModules && tasks.push(function(done) {
                return self._runModules(done);
            }), this.requireDynamicModules && tasks.push(function(done) {
                return self._runExternalModules(done);
            }), this.runElections && tasks.push(function(done) {
                config.synchronize(), primary.run(), crossMessaging.run(), done();
            }), tasks;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function save(data) {
        Object.keys(data).forEach(function(name) {
            preferences.store(name, JSON.stringify(data[name]));
        });
    }
    var preferences = __webpack_require__(6), sharedData = __webpack_require__(48), Logger = __webpack_require__(13), logger = Logger.create("SharedData");
    module.exports = {
        run: function() {
            sharedData.init({
                save: save,
                syncTimeout: 500,
                logger: logger
            });
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function getElectionProtocol(extInfo, currentProtocol) {
        return Object.keys(extInfo).reduce(function(protocol, extId) {
            return extInfo[extId].protocol < protocol ? extInfo[extId].protocol : protocol;
        }, currentProtocol);
    }
    function getPrimaryIdByTime(extInfo, byOldest) {
        var sortMethod = byOldest ? Math.min : Math.max;
        return Object.keys(extInfo).reduce(function(primaryId, extensionId) {
            if (!primaryId) return extensionId;
            var primaryDate = extInfo[primaryId].installDate || 0, itemDate = extInfo[extensionId].installDate || 0;
            return itemDate === primaryDate ? extensionId < primaryId ? extensionId : primaryId : sortMethod(itemDate, primaryDate) === itemDate ? extensionId : primaryId;
        }, null);
    }
    function getFeaturedExtensionId(extInfo, feature, byOldest) {
        byOldest = void 0 === byOldest || byOldest;
        var featuredExtensions = crossMessaging.getFeaturedExtensionsFor(extInfo, feature);
        return getPrimaryIdByTime(featuredExtensions, byOldest);
    }
    function getFeaturedInvaderId(extInfo, feature, byOldest) {
        var extensions = getInvadersForFeature(extInfo, feature);
        return isEmpty(extensions) ? getFeaturedExtensionId(extInfo, feature, byOldest) : (logger.info("%s feature is captured", feature), 
        getPrimaryIdByTime(extensions, !1));
    }
    function checkFeatureCaptureSupport(extInfo) {
        return Object.keys(extInfo).every(function(extId) {
            var extData = extInfo[extId];
            return void 0 !== extData.captureFeatures;
        });
    }
    function getInvadersForFeature(extInfo, feature) {
        return Object.keys(extInfo).reduce(function(result, key) {
            var extData = extInfo[key];
            return isInvaderForFeature(extData, feature) && (result[key] = extData), result;
        }, {});
    }
    function isInvaderForFeature(extData, feature) {
        return extData[feature] && extData.captureFeatures && extData.captureFeatures.indexOf(feature) !== -1;
    }
    var legacySelection = __webpack_require__(52), extensions = __webpack_require__(47), crossMessaging = __webpack_require__(46), config = __webpack_require__(5), Logger = __webpack_require__(13), AppEvent = __webpack_require__(10), dispatcher = __webpack_require__(9), isEmpty = __webpack_require__(54), logger = Logger.create("Primary"), Primary = function() {
        this.id = String(Math.random()), this.isPrimary = !1, this.electionCompleted = !1;
    };
    Primary.prototype = {
        INSTALL_DATE: "installDate",
        HELLO_EVENT: "application.hello",
        HELLO_REASON: "hello",
        DISABLED_REASON: "onDisabled",
        UNINSTALL_REASON: "onUninstalled",
        POSSIBLE_PRIMARY: "application.primary.possible",
        timeout: 1200,
        run: function() {
            crossMessaging.set(this.INSTALL_DATE, config.installDate), this._observeEvents();
        },
        chooseElectionMethod: function() {
            var enabledExtensions = crossMessaging.enabledExtensions, electionProtocol = getElectionProtocol(enabledExtensions, crossMessaging.protocol);
            switch (electionProtocol) {
              case 0:
                logger.info("Select main primary via legacy"), this.selectLegacy();
                break;

              case 1:
              case 2:
                logger.info("Select main primary by oldest"), this.selectByTime(!0);
                break;

              case 3:
                logger.info("Select main primary by newest"), this.selectByTime(!1);
            }
        },
        selectByTime: function(byOldest) {
            var primaryId = getPrimaryIdByTime(crossMessaging.enabledExtensions, byOldest);
            this.isPrimary = chrome.runtime.id === primaryId, logger.info("Primary id: %s, isPrimary: %s", primaryId, this.isPrimary), 
            this._triggerEvent(AppEvent.ELECTION_COMPLETED, {
                primary: this.isPrimary,
                id: primaryId
            }), this.electionCompleted = !0;
        },
        selectByFeature: function(feature, byOldest) {
            var extInfo = crossMessaging.enabledExtensions, id = checkFeatureCaptureSupport(extInfo) ? getFeaturedInvaderId(extInfo, feature, byOldest) : getFeaturedExtensionId(extInfo, feature, byOldest), yasoft = extInfo[id] && extInfo[id].yasoft;
            return logger.info("%s - %s (byOldest: %s)", feature, yasoft, byOldest), id;
        },
        isPrimaryForFeature: function(feature) {
            var primaryId = this.selectByFeature(feature, !0);
            return chrome.runtime.id === primaryId;
        },
        selectLegacy: function() {
            var self = this;
            legacySelection.getPrimary(function(primaryId) {
                self.isPrimary = chrome.runtime.id === primaryId, self._triggerEvent(AppEvent.ELECTION_COMPLETED, {
                    primary: self.isPrimary,
                    id: primaryId
                }), self.electionCompleted = !0;
            });
        },
        _observeEvents: function() {
            extensions.observe(this.HELLO_EVENT, this._callElection.bind(this, this.HELLO_REASON)), 
            chrome.management.onDisabled.addListener(this._callElection.bind(this, this.DISABLED_REASON)), 
            chrome.management.onUninstalled.addListener(this._callElection.bind(this, this.UNINSTALL_REASON));
        },
        _callElection: function(reason) {
            var self = this;
            setTimeout(function() {
                self.chooseElectionMethod(reason);
            }, self.timeout);
        },
        _triggerEvent: function(topic, data) {
            dispatcher.trigger(topic, data);
        }
    }, module.exports = new Primary();
}, function(module, exports, __webpack_require__) {
    "use strict";
    var series = __webpack_require__(53), AppEvent = __webpack_require__(10);
    module.exports = {
        handler: null,
        getPrimary: function(callback) {
            this.handler = callback, chrome.management.getAll(this._extensionsHandler.bind(this));
        },
        _extensionsHandler: function(extensionsList) {
            series(this._getTasks(extensionsList), this._onTasksComplete, this);
        },
        _getTasks: function(extensionsList) {
            var tasks = {}, self = this;
            return extensionsList.forEach(function(extension) {
                tasks[extension.id] = function(done) {
                    self._sendMessage(extension, done);
                };
            }), tasks;
        },
        _sendMessage: function(extension, done) {
            var message = {
                topic: AppEvent.ELECTION_COMPLETED
            };
            return extension.id === chrome.runtime.id ? done(!0) : extension.enabled && "extension" === extension.type ? chrome.runtime.sendMessage(extension.id, message, this._responseHandler.bind(this, done)) : void done(!1);
        },
        _responseHandler: function(done, result) {
            done(Boolean(result));
        },
        _onTasksComplete: function(results) {
            var extensions = Object.keys(results).filter(function(id) {
                return results[id];
            });
            extensions.sort(), "function" == typeof this.handler && this.handler(extensions[0]);
        }
    };
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
    function isEmpty(value) {
        return null == value || (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice)) ? !value.length : !keys(value).length);
    }
    var isArguments = __webpack_require__(55), isArray = __webpack_require__(37), isArrayLike = __webpack_require__(56), isFunction = __webpack_require__(40), isObjectLike = __webpack_require__(41), isString = __webpack_require__(59), keys = __webpack_require__(60);
    module.exports = isEmpty;
}, function(module, exports, __webpack_require__) {
    function isArguments(value) {
        return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    }
    var isArrayLike = __webpack_require__(56), isObjectLike = __webpack_require__(41), objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty, propertyIsEnumerable = objectProto.propertyIsEnumerable;
    module.exports = isArguments;
}, function(module, exports, __webpack_require__) {
    function isArrayLike(value) {
        return null != value && isLength(getLength(value));
    }
    var getLength = __webpack_require__(57), isLength = __webpack_require__(42);
    module.exports = isArrayLike;
}, function(module, exports, __webpack_require__) {
    var baseProperty = __webpack_require__(58), getLength = baseProperty("length");
    module.exports = getLength;
}, function(module, exports) {
    function baseProperty(key) {
        return function(object) {
            return null == object ? void 0 : object[key];
        };
    }
    module.exports = baseProperty;
}, function(module, exports, __webpack_require__) {
    function isString(value) {
        return "string" == typeof value || isObjectLike(value) && objToString.call(value) == stringTag;
    }
    var isObjectLike = __webpack_require__(41), stringTag = "[object String]", objectProto = Object.prototype, objToString = objectProto.toString;
    module.exports = isString;
}, function(module, exports, __webpack_require__) {
    var getNative = __webpack_require__(38), isArrayLike = __webpack_require__(56), isObject = __webpack_require__(34), shimKeys = __webpack_require__(61), nativeKeys = getNative(Object, "keys"), keys = nativeKeys ? function(object) {
        var Ctor = null == object ? void 0 : object.constructor;
        return "function" == typeof Ctor && Ctor.prototype === object || "function" != typeof object && isArrayLike(object) ? shimKeys(object) : isObject(object) ? nativeKeys(object) : [];
    } : shimKeys;
    module.exports = keys;
}, function(module, exports, __webpack_require__) {
    function shimKeys(object) {
        for (var props = keysIn(object), propsLength = props.length, length = propsLength && object.length, allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object)), index = -1, result = []; ++index < propsLength; ) {
            var key = props[index];
            (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) && result.push(key);
        }
        return result;
    }
    var isArguments = __webpack_require__(55), isArray = __webpack_require__(37), isIndex = __webpack_require__(62), isLength = __webpack_require__(42), keysIn = __webpack_require__(63), objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty;
    module.exports = shimKeys;
}, function(module, exports) {
    function isIndex(value, length) {
        return value = "number" == typeof value || reIsUint.test(value) ? +value : -1, length = null == length ? MAX_SAFE_INTEGER : length, 
        value > -1 && value % 1 == 0 && value < length;
    }
    var reIsUint = /^\d+$/, MAX_SAFE_INTEGER = 9007199254740991;
    module.exports = isIndex;
}, function(module, exports, __webpack_require__) {
    function keysIn(object) {
        if (null == object) return [];
        isObject(object) || (object = Object(object));
        var length = object.length;
        length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;
        for (var Ctor = object.constructor, index = -1, isProto = "function" == typeof Ctor && Ctor.prototype === object, result = Array(length), skipIndexes = length > 0; ++index < length; ) result[index] = index + "";
        for (var key in object) skipIndexes && isIndex(key, length) || "constructor" == key && (isProto || !hasOwnProperty.call(object, key)) || result.push(key);
        return result;
    }
    var isArguments = __webpack_require__(55), isArray = __webpack_require__(37), isIndex = __webpack_require__(62), isLength = __webpack_require__(42), isObject = __webpack_require__(34), objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty;
    module.exports = keysIn;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var parallel = __webpack_require__(65), series = __webpack_require__(53), waterfall = __webpack_require__(66), each = __webpack_require__(67);
    module.exports = {
        parallel: parallel,
        series: series,
        waterfall: waterfall,
        each: each
    };
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
    "use strict";
    var utils = __webpack_require__(7);
    module.exports = function(modules) {
        modules.forEach(function(module) {
            module && utils.isFunction(module.run) && module.run();
        });
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function callMethods(methodName, callback) {
        Object.keys(modules).forEach(function(key) {
            var externalModule = modules[key];
            externalModule.default && "function" == typeof externalModule.default[methodName] && externalModule.default[methodName](), 
            "function" == typeof externalModule[methodName] && externalModule[methodName]();
        }), "function" == typeof callback && callback();
    }
    var modules = __webpack_require__(71);
    module.exports = {
        runExternalModules: function(configPath, callback) {
            callMethods("run", callback);
        },
        prepareExternalModules: function(configPath, callback) {
            callMethods("prepare", callback);
        }
    };
}, function(module, exports, __webpack_require__) {
    module.exports = {
        0: __webpack_require__(72),
        1: __webpack_require__(77),
        2: __webpack_require__(87),
        3: __webpack_require__(91),
        4: __webpack_require__(103),
        5: __webpack_require__(123),
        6: __webpack_require__(125),
        7: __webpack_require__(127),
        8: __webpack_require__(147),
        9: __webpack_require__(149),
        10: __webpack_require__(232)
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var ys = __webpack_require__(73), dispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), config = __webpack_require__(5), Logger = __webpack_require__(13), logger = Logger.create("ys");
    module.exports = {
        run: function() {
            dispatcher.once(AppEvent.ELECTION_COMPLETED, this._patchCookie, this);
        },
        _patchCookie: function() {
            logger.info("election completed, update ys cookie"), ys.run(config.get("yasoft"), chrome.runtime.getManifest().version.split(".").join("-"));
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var delay = __webpack_require__(74), Logger = __webpack_require__(13), logger = Logger.create("ycookie");
    module.exports = {
        timeoutId: 0,
        DOMAINS: [ ".yandex.ru", ".yandex.kz", ".yandex.ua", ".yandex.by", ".yandex.net", ".yandex.com", ".yandex.com.tr", ".ya.ru", ".narod.ru" ],
        COOKIE_NAME: "ys",
        DELIMITER: "#",
        NAME_VERSION_SEPARATOR: ".",
        run: function(appName, version) {
            var self = this;
            this.appName = appName, this.version = version, logger.info("run with yasoft - %s, version - %s", appName, version), 
            delay(function() {
                self._update(), self._listenCookieChange();
            }, Math.ceil(100 * Math.random()));
        },
        _update: function(domain) {
            this._eachDomain(this._updateCookie, domain);
        },
        _updateCookie: function(cookie, url) {
            var cookieValue = this.appName + this.NAME_VERSION_SEPARATOR + this.version;
            cookie && cookie.value && (cookieValue = this._getPatchValue(cookie.value)), logger.info("set ys for url %s, value - %s", url, cookieValue), 
            chrome.cookies.set({
                url: url,
                name: this.COOKIE_NAME,
                value: cookieValue
            });
        },
        _getPatchValue: function(value) {
            var cookieValue = this.appName + this.NAME_VERSION_SEPARATOR + this.version, parts = value.split(this.DELIMITER).filter(function(part) {
                return part !== cookieValue;
            });
            return parts.unshift(cookieValue), parts = this._removeDuplicateItems(parts), parts.join(this.DELIMITER);
        },
        _listenCookieChange: function() {
            var self = this;
            chrome.cookies.onChanged.addListener(function(changeInfo) {
                changeInfo.removed && "explicit" === changeInfo.cause && changeInfo.cookie.name === self.COOKIE_NAME && (logger.info("handle cookie change %j", changeInfo), 
                delay(function() {
                    self._update(changeInfo.cookie.domain);
                }, Math.ceil(100 * Math.random())));
            });
        },
        _getUrl: function(domain) {
            return "http://" + domain + "/";
        },
        _eachDomain: function(callback, domain) {
            this.DOMAINS.forEach(function(trustedDomain) {
                var self = this;
                if (!domain || domain === trustedDomain) {
                    var params = {
                        url: this._getUrl(trustedDomain),
                        name: this.COOKIE_NAME
                    };
                    chrome.cookies.get(params, function(cookie) {
                        callback.call(self, cookie, params.url);
                    });
                }
            }, this);
        },
        _removeDuplicateItems: function(parts) {
            var withoutDuplicates = [], names = [];
            return parts.forEach(function(part) {
                var name = part.split(this.NAME_VERSION_SEPARATOR)[0];
                names.indexOf(name) < 0 && (names.push(name), withoutDuplicates.push(part));
            }, this), withoutDuplicates;
        }
    };
}, function(module, exports, __webpack_require__) {
    var baseDelay = __webpack_require__(75), restParam = __webpack_require__(76), delay = restParam(function(func, wait, args) {
        return baseDelay(func, wait, args);
    });
    module.exports = delay;
}, function(module, exports) {
    function baseDelay(func, wait, args) {
        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
        return setTimeout(function() {
            func.apply(void 0, args);
        }, wait);
    }
    var FUNC_ERROR_TEXT = "Expected a function";
    module.exports = baseDelay;
}, function(module, exports) {
    function restParam(func, start) {
        if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
        return start = nativeMax(void 0 === start ? func.length - 1 : +start || 0, 0), function() {
            for (var args = arguments, index = -1, length = nativeMax(args.length - start, 0), rest = Array(length); ++index < length; ) rest[index] = args[start + index];
            switch (start) {
              case 0:
                return func.call(this, rest);

              case 1:
                return func.call(this, args[0], rest);

              case 2:
                return func.call(this, args[0], args[1], rest);
            }
            var otherArgs = Array(start + 1);
            for (index = -1; ++index < start; ) otherArgs[index] = args[index];
            return otherArgs[start] = rest, func.apply(this, otherArgs);
        };
    }
    var FUNC_ERROR_TEXT = "Expected a function", nativeMax = Math.max;
    module.exports = restParam;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var tabs = __webpack_require__(78), serializeSpeedMetrics = __webpack_require__(81), preferences = __webpack_require__(6), config = __webpack_require__(5), vendor = __webpack_require__(45), dispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), sharedData = __webpack_require__(48), utils = __webpack_require__(7), Request = __webpack_require__(82), Logger = __webpack_require__(13), branding = __webpack_require__(30), logger = Logger.create("Bar-navig"), SPEED_METRICS_URLS = [ /yandex\./, /ya\.ru/, /moikrug\.ru/, /google\.((ru)|(com))/, /mail\.ru/, /rambler\.ru/ ];
    module.exports = {
        CONTENT_MESSAGE_METRICS: "GET_TAB_SPEED_METRICS",
        CONTENT_MESSAGE_INFO: "GET_TAB_INFO",
        CLOSED_TABS_TIMEOUT_MS: 5e3,
        CONTENT_SCRIPT_RESPONSE_TIMEOUT_MS: 3e3,
        EXCLUDES: [ /^https:\/\/www\.google\.[a-z]+\/_\/chrome\/newtab.*/i, /^https:\/\/www\.google\.[a-z]+\/webhp\?sourceid=chrome-instant/i, /^chrome:\/\/newtab.*/i ],
        _params: {},
        _closedTabs: [],
        _closedTimeout: null,
        _isPrimary: !1,
        _isRunning: !1,
        run: function() {
            this._isRunning || (this._setParams(), this._assertParams() && (this._observePrimary(), 
            this._observeUiChange(), this._observeTabs(), this._isRunning = !0));
        },
        _isSpeedMetrcisUrl: function(url) {
            return SPEED_METRICS_URLS.some(function(regExp) {
                return regExp.test(url);
            });
        },
        _setParams: function() {
            this._params = {
                yasoft: config.get("yasoft"),
                ui: config.ui,
                clid: vendor.get(1),
                brandID: config.branding,
                ver: config.version
            };
        },
        _assertParams: function() {
            return ![ "clid", "yasoft", "ver", "ui", "brandID" ].some(function(paramName) {
                if (!utils.isDefined(this._params[paramName])) return logger.error("Param %s is required for Bar-navig", paramName), 
                !0;
            }, this);
        },
        _observePrimary: function() {
            dispatcher.on(AppEvent.ELECTION_COMPLETED, this._primaryHandler, this);
        },
        _observeUiChange: function() {
            sharedData.addListener(this._onSharedDataUpdate.bind(this));
        },
        _observeTabs: function() {
            tabs.init(), tabs.onComplete.addListener(this._onNavigateComplete.bind(this)), tabs.onClosed.addListener(this._tabCloseHandler.bind(this));
        },
        _primaryHandler: function(data) {
            this._isPrimary = Boolean(data.primary);
        },
        _onSharedDataUpdate: function(event) {
            var data = event.data || {}, ui = data[config.UI_OPTION] || data[config.YANDEX_UI_OPTION];
            ui && this._updateParams({
                ui: ui
            });
        },
        _updateParams: function(newParams) {
            Object.keys(newParams).forEach(function(paramName) {
                this._params[paramName] = newParams[paramName];
            }, this);
        },
        _onNavigateComplete: function(tabId, tabData) {
            var url = tabData.urls[tabData.urls.length - 1];
            this._isGoodUrl(url) && this._isEnabled() && this._getDataFromContentScript(tabId, tabData);
        },
        _getDataFromContentScript: function(tabId, tabData) {
            chrome.tabs.sendMessage(tabId, this.CONTENT_MESSAGE_INFO, function(csTabInfo) {
                var responseHandler = this._csRespHandlerFactory(tabId, tabData, csTabInfo);
                chrome.tabs.sendMessage(tabId, this.CONTENT_MESSAGE_METRICS, responseHandler), setTimeout(responseHandler, this.CONTENT_SCRIPT_RESPONSE_TIMEOUT_MS);
            }.bind(this));
        },
        _csRespHandlerFactory: function(tabId, tabData, csTabInfo) {
            return utils.onceCall(function(metrics) {
                var params = utils.objectUpdate({
                    title: csTabInfo ? csTabInfo.title : tabData.title,
                    url: csTabInfo ? csTabInfo.url : tabData.urls[tabData.urls.length - 1]
                }, metrics || {});
                csTabInfo && csTabInfo.referer && (params.referer = csTabInfo.referer), tabData.realRef && (params["real-referer"] = tabData.realRef), 
                tabData.uuid && (params["tab-id"] = tabData.uuid.replace(/\-/g, "")), this._isSpeedMetrcisUrl(params.url) || (delete params.t, 
                delete params.tv), this._sendStats(tabId, params);
            }, this);
        },
        _tabCloseHandler: function(tabId, tabData) {
            var url = tabData.urls[tabData.urls.length - 1];
            this._isGoodUrl(url) && this._isEnabled() && this._closedTabs.push(tabData.uuid.replace(/\-/g, "")), 
            this._closedTimeout && clearTimeout(this._closedTimeout), this._closedTimeout = setTimeout(this._sendClosedStats.bind(this), this.CLOSED_TABS_TIMEOUT_MS);
        },
        _sendClosedStats: function() {
            if (this._closedTabs.length) {
                var params = this._getParams();
                params = this._clearCloseParams(params), params["ctab-ids"] = this._closedTabs.join("."), 
                this._send(params);
            }
            this._closedTabs = [], this._closedTimeout = null;
        },
        _clearCloseParams: function(params) {
            return delete params.brandID, delete params.post, delete params.tv, params;
        },
        _sendStats: function(tabId, params) {
            params.t && (params.t = serializeSpeedMetrics(params.t), params.tv = 6), params = utils.clearObj(utils.mix(params, this._getParams()), [ "" ]), 
            this._isEnabled() && this._send(params);
        },
        _isEnabled: function() {
            return this._isPrimary && preferences.get(config.ENABLE_STAT_OPTION);
        },
        _send: function(params) {
            new Request().data(utils.clearObj(params), [ "" ]).post(this._getUrl());
        },
        _getParams: function() {
            return utils.objectUpdate({
                show: 1
            }, this._params);
        },
        _isGoodUrl: function(url) {
            return !this.EXCLUDES.some(function(excludePattern) {
                return excludePattern.test(url);
            });
        },
        _getUrl: function() {
            return branding.url("bar-navig.url");
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function initEmptyTabObject() {
        return {
            urls: [],
            possibleReferrers: [],
            uuid: utils.uuid()
        };
    }
    function populate(windows) {
        windows.forEach(function(window) {
            window.incognito || window.tabs.forEach(function(tab) {
                if (tab && tab.id && !tab.incognito) {
                    var mytab = tabs[tab.id] = initEmptyTabObject();
                    mytab.urls = [ tab.url ], mytab.status = "complete", mytab.windowId = tab.windowId, 
                    mytab.title = tab.title, mytab.favIconUrl = tab.favIconUrl;
                }
            });
        });
    }
    function isBadReferrer(referrer) {
        return [ "chrome://newtab/" ].indexOf(referrer) !== -1;
    }
    function onReferrerMessage(message, sender) {
        if ("real-referrer" === message.topic && sender.tab) {
            var tabId = sender.tab.id;
            tabs[tabId] = tabs[tabId] || initEmptyTabObject(), message.url ? tabs[tabId].possibleReferrers.push(message.url) : tabs[tabId].possibleReferrers.push(sender.tab.url);
        }
    }
    function onUpdated(tabId, updateInfo, tabData) {
        if (!tabData.incognito) {
            var url = tabData.url;
            if ("loading" === updateInfo.status) {
                tabs[tabId] = tabs[tabId] || initEmptyTabObject();
                var stackRef, possibleRef;
                if (tabs[tabId].status) "complete" === tabs[tabId].status ? (stackRef = tabs[tabId].urls.pop(), 
                possibleRef = tabs[tabId].possibleReferrers.pop(), stackRef === possibleRef ? tabs[tabId].realRef = stackRef : tabs[tabId].realRef = null, 
                tabs[tabId].urls = [ url ], tabs[tabId].possibleReferrers = [], tabs[tabId].navInExistingTab = !0) : tabs[tabId].urls.indexOf(url) === -1 && tabs[tabId].urls.push(url); else {
                    tabs[tabId].urls = [ url ];
                    var opener = tabs[tabData.openerTabId];
                    opener && (stackRef = opener.urls[opener.urls.length - 1], possibleRef = opener.possibleReferrers[opener.possibleReferrers.length - 1], 
                    stackRef === possibleRef ? (tabs[tabId].realRef = stackRef, opener.possibleReferrers.pop()) : tabs[tabId].realRef = null);
                }
                isBadReferrer(tabs[tabId].realRef) && (tabs[tabId].realRef = null), tabs[tabId].status = "loading", 
                tabs[tabId].timeout && clearTimeout(tabs[tabId].timeout), delete tabs[tabId].timeout;
            } else "complete" === updateInfo.status && (tabs[tabId] = tabs[tabId] || initEmptyTabObject(), 
            tabs[tabId].urls.indexOf(url) === -1 && tabs[tabId].urls.push(url), tabs[tabId].timeout && clearTimeout(tabs[tabId].timeout), 
            tabs[tabId].windowId = tabData.windowId, tabs[tabId].favIconUrl = tabData.favIconUrl, 
            tabs[tabId].title = tabData.title, tabs[tabId].status = "loading", tabs[tabId].timeout = setTimeout(function(tabId) {
                tabs[tabId] && (delete tabs[tabId].timeout, tabs[tabId].status = "complete", tabs[tabId].possibleReferrers = [], 
                tabModule.onComplete.dispatchToListener(tabId, tabs[tabId]));
            }.bind(null, tabId), tabData.active ? JS_REDIRECTS_WAIT_MS : JS_REDIRECTS_WAIT_INACTIVE_MS));
        }
    }
    function onRemoved(tabId, removeInfo) {
        tabs[tabId] && ("complete" === tabs[tabId].status && tabModule.onClosed.dispatchToListener(tabId, tabs[tabId], removeInfo), 
        delete tabs[tabId]);
    }
    function onReplaced(addedTabId, removedTabId) {
        tabs[addedTabId] = tabs[removedTabId], delete tabs[removedTabId];
    }
    var utils = __webpack_require__(79), Signal = __webpack_require__(80), JS_REDIRECTS_WAIT_MS = 3e3, JS_REDIRECTS_WAIT_INACTIVE_MS = 6e3, tabs = {}, tabModule = module.exports = {
        inited: !1,
        init: function(params) {
            params && (JS_REDIRECTS_WAIT_MS = params.activeTimeout, JS_REDIRECTS_WAIT_INACTIVE_MS = params.inactiveTimeout), 
            this.inited || (chrome.windows.getAll({
                populate: !0
            }, populate), chrome.tabs.onUpdated.addListener(onUpdated), chrome.tabs.onRemoved.addListener(onRemoved), 
            chrome.tabs.onReplaced.addListener(onReplaced), chrome.runtime.onMessage.addListener(onReferrerMessage), 
            this.inited = !0);
        },
        stop: function() {
            chrome.tabs.onUpdated.removeListener(onUpdated), chrome.tabs.onRemoved.removeListener(onRemoved), 
            chrome.tabs.onReplaced.removeListener(onReplaced), chrome.runtime.onMessage.removeListener(onReferrerMessage);
        },
        log: utils.noop,
        getTabInfo: function(tabId) {
            return tabId ? tabs[tabId] : tabs;
        },
        onComplete: new Signal("Tabs.onComplete"),
        onClosed: new Signal("Tabs.onClosed")
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        noop: function() {},
        uuid: function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = 16 * Math.random() | 0, v = "x" === c ? r : 3 & r | 8;
                return v.toString(16);
            });
        },
        escapeRegExp: function(str) {
            return str.replace(/([\|\!\[\]\^\$\(\)\{\}\+\=\?\.\*\\])/g, "\\$1");
        },
        loadResource: function(options, ctx) {
            var timeoutId, xhr = new XMLHttpRequest(), method = options.body ? "POST" : "GET";
            if (options.responseType && (xhr.responseType = options.responseType), options.withCredentials) try {
                xhr.withCredentials = !0;
            } catch (ex) {}
            return xhr.open(method, options.url, !0), xhr.onload = function(evt) {
                /^2/.test(xhr.status) || /^3/.test(xhr.status) ? (window.clearTimeout(timeoutId), 
                options.onload && options.onload.call(ctx || this, evt)) : xhr.onerror(evt);
            }, xhr.onabort = xhr.onerror = function(evt) {
                window.clearTimeout(timeoutId), options.onerror && options.onerror.call(ctx || this, evt);
            }, options.bypassCache && xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT"), 
            options.body && xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"), 
            xhr.send(options.body || null), timeoutId = window.setTimeout(function() {
                xhr.abort();
            }, options.timeout || 25e3), xhr;
        },
        encodeQueryParams: function(obj, sep, eq) {
            sep = sep || "&", eq = eq || "=";
            var parts = [], mapFn = function(val) {
                return val = val || "", key + eq + val;
            };
            for (var key in obj) Array.isArray(obj[key]) ? (obj[key] = obj[key].map(mapFn), 
            parts.push.apply(parts, obj[key])) : (void 0 !== obj[key] && null !== obj[key] || (obj[key] = ""), 
            parts.push(encodeURIComponent(key) + eq + encodeURIComponent(obj[key])));
            return parts.join(sep);
        },
        parseQueryParams: function(str, sep, eq) {
            sep = sep || "&", eq = eq || "=";
            var parts = str.split(sep), output = {};
            if (!str.length) return output;
            for (var filterFn = function(val) {
                return val && val.length > 0;
            }, i = 0; i < parts.length; i++) {
                var splitted = parts[i].split(eq), key = splitted.shift(), value = splitted.filter(filterFn).join(eq);
                output[key] ? Array.isArray(output[key]) ? output[key].push(value) : output[key] = [ output[key], value ] : output[key] = value;
            }
            return output;
        }
    };
}, function(module, exports) {
    "use strict";
    var Signal = function(name) {
        if ("string" != typeof name) throw new Error("Argument error. You should specify event name");
        this.name = name, this.listeners = [], this.onAddedTrigger = null, this.onRemovedTrigger = null;
    };
    Signal.prototype = {
        addListener: function(callback) {
            this.hasListener(callback) || (this.listeners.push(callback), "function" == typeof this.onAddedTrigger && this.onAddedTrigger.call(null, callback));
        },
        removeListener: function(callback) {
            var index = this.listeners.indexOf(callback);
            index >= 0 && (this.listeners.splice(index, 1), "function" == typeof this.onRemovedTrigger && this.onRemovedTrigger.call(null, callback));
        },
        hasListener: function(callback) {
            return this.listeners.indexOf(callback) >= 0;
        },
        hasListeners: function() {
            return this.listeners.length > 0;
        },
        dispatchToListener: function() {
            for (var args = new Array(arguments.length), i = 0; i < args.length; ++i) args[i] = arguments[i];
            this.listeners.forEach(function(listener) {
                listener.apply(null, args);
            });
        },
        onAdded: function(callback) {
            this.onAddedTrigger = callback;
        },
        onRemoved: function(callback) {
            this.onRemovedTrigger = callback;
        }
    }, module.exports = Signal;
}, function(module, exports) {
    "use strict";
    var metrics = {
        names: [ "dns", "tcp", "ttfb", "html", "html-total", "ttfp", "ttfp-total" ],
        ids: [ "1037", "1038", "1039", "1040", "1040.906", "1041", "1041.906" ]
    };
    module.exports = function(timingData) {
        if (!timingData) return null;
        for (var result = [], i = 0, len = metrics.names.length; i < len; i++) {
            var paramName = metrics.names[i], paramId = metrics.ids[i];
            timingData.hasOwnProperty(paramName) && result.push(paramId + "-" + timingData[paramName]);
        }
        return result.join("_");
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var Response = __webpack_require__(83), ResponseTypes = __webpack_require__(85), HttpMethods = __webpack_require__(86), ContentTypes = __webpack_require__(84), stub = function() {}, isFunction = function(param) {
        return "function" == typeof param;
    }, isObject = function(param) {
        return "object" == typeof param && !Array.isArray(param) && null !== param;
    }, isString = function(param) {
        return "string" == typeof param;
    }, Request = function() {
        this._xhr = null, this._formData = null, this._headers = {}, this._params = {}, 
        this._data = {}, this._url = "", this._responseType = ResponseTypes.DEFAULT, this._queryTimeout = 25e3, 
        this._withCredentials = !1, this._method = HttpMethods.GET, this._requestType = ContentTypes.json, 
        this._callback = stub, this._onProgress = stub(), this._onUploadProgress = stub(), 
        this._onUpload = stub(), this._timeoutId = 0;
    };
    Request.prototype = {
        set: function(header, value) {
            return this._headers[header] = value, this;
        },
        type: function(type) {
            return this.set("Content-Type", ContentTypes[type] || type), this._requestType = type, 
            this;
        },
        params: function(params) {
            return this._params = params, this;
        },
        data: function(data) {
            return this._data = data, this;
        },
        noCache: function() {
            return this.set("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT"), this;
        },
        auth: function(user, password) {
            var hash = window.btoa(user + ":" + password);
            return this.set("Authorization", "Basic " + hash), this;
        },
        oauth: function(token) {
            return this.set("Authorization", "OAuth {token}".replace("{token}", token)), this;
        },
        setMethod: function(method) {
            return this._method = method, this;
        },
        timeout: function(value) {
            return this._queryTimeout = value, this;
        },
        withCredentials: function() {
            return this._withCredentials = !0, this;
        },
        setUrl: function(url) {
            return isString(url) && (this._url = url), this;
        },
        field: function(name, value) {
            return this._formData || (this._formData = new FormData()), this._formData.append(name, value), 
            this;
        },
        blob: function(blob) {
            return this._formData = blob, this;
        },
        responseType: function(responseType) {
            return this._responseType = responseType, this;
        },
        onProgress: function(callback) {
            return isFunction(callback) && (this._onProgress = callback), this;
        },
        onUploadProgress: function(callback) {
            return isFunction(callback) && (this._onUploadProgress = callback), this;
        },
        onUpload: function(callback) {
            return isFunction(callback) && (this._onUpload = callback), this;
        },
        abort: function() {
            return this._xhr && this._xhr.readyState < 4 && this._xhr.abort(), this;
        },
        serialize: function(obj) {
            if (!isObject(obj)) return obj;
            var pairs = [];
            return Object.keys(obj).forEach(function(key) {
                pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
            }), pairs.join("&");
        },
        deserialize: function(url) {
            var pairs, parts, obj = {}, rule = /^https?.+\?(.+)/i;
            return isString(url) && url.length > 0 && (pairs = url.replace(rule, "$1").split("&")), 
            pairs && pairs.length > 0 && pairs.forEach(function(pair) {
                parts = pair.split("="), obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }), obj;
        },
        get: function(url, callback) {
            return this.setMethod(HttpMethods.GET).setUrl(url).send(callback);
        },
        post: function(url, callback) {
            return this.type(ContentTypes.urlencoded).setMethod(HttpMethods.POST).setUrl(url).send(callback);
        },
        put: function(url, callback) {
            return this.setUrl(url).setMethod(HttpMethods.PUT).send(callback);
        },
        send: function(handler) {
            var url = this._createUrl(), body = this._createBody();
            return this._createRequest(), this._setCompleteHandler(handler), this._bindEvents(), 
            this._setupTimeout(), this._openRequest(url), this._sendRequest(body), this;
        },
        _createRequest: function() {
            this._xhr = new XMLHttpRequest();
        },
        _setCompleteHandler: function(handler) {
            isFunction(handler) && (this._callback = handler);
        },
        _createUrl: function() {
            var url = this._url, query = this.query, urlPostfix = this._url.indexOf("?") > 0 ? "&" : "?";
            return query && (url = this._url + urlPostfix + query), url;
        },
        _createBody: function() {
            return this._formData || this.serialize(this._data);
        },
        _bindEvents: function() {
            this._bindCompleteEvents(), this._bindProgressEvents(), this._bindUploadEvent(), 
            this._bindAbortEvent();
        },
        _bindCompleteEvents: function() {
            var handler = this._onRequestComplete.bind(this);
            this._xhr.onload = handler, this._xhr.onerror = handler;
        },
        _bindProgressEvents: function() {
            this._xhr.onprogress = this._onProgress, this._xhr.upload.onprogress = this._onUploadProgress;
        },
        _bindUploadEvent: function() {
            this._xhr.upload.onload = this._onUpload;
        },
        _bindAbortEvent: function() {
            var self = this;
            this.xhr.onabort = function() {
                self.aborted = !0, self._onRequestComplete();
            };
        },
        _setupTimeout: function() {
            var self = this;
            this._queryTimeout > 0 && (this._timeoutId = setTimeout(function() {
                self.xhr.abort(), self.timeoutExpired = !0;
            }, this._queryTimeout));
        },
        _openRequest: function(url) {
            this._xhr.responseType = this._responseType, this._xhr.open(this._method, url, !0), 
            this._applyHeaders(), this._applyCredentials();
        },
        _applyHeaders: function() {
            Object.keys(this._headers).forEach(function(header) {
                this.xhr.setRequestHeader(header, this._headers[header]);
            }, this);
        },
        _applyCredentials: function() {
            if (this._withCredentials) try {
                this.xhr.withCredentials = !0;
            } catch (e) {}
        },
        _sendRequest: function(body) {
            this._xhr.send(body);
        },
        _onRequestComplete: function() {
            clearTimeout(this._timeoutId), this._callback.call(this, new Response(this));
        },
        get status() {
            return this._xhr.status;
        },
        get responseHeaders() {
            return this._xhr.getAllResponseHeaders();
        },
        get query() {
            return this.serialize(this._params);
        },
        get method() {
            return this._method;
        },
        get requestType() {
            return this._requestType;
        },
        get xhr() {
            return this._xhr;
        }
    }, module.exports = Request;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var ContentTypes = __webpack_require__(84), Response = function(request) {
        this.request = request, this.status = request.xhr.status, this.headers = {}, this._setHeaders(), 
        this._setStatus();
    };
    Response.prototype = {
        _setHeaders: function() {
            this.headers = this._parseHeaders(this.request.xhr.getAllResponseHeaders()), this.headers["content-type"] = this.request.xhr.getResponseHeader("content-type");
        },
        _parseHeaders: function(headers) {
            var index, field, val, lines = headers.split(/\r?\n/), fields = {}, lastElement = lines[lines.length - 1];
            return lastElement.length < 3 && lines.pop(), lines.forEach(function(line) {
                index = line.indexOf(":"), field = line.slice(0, index).toLowerCase(), val = line.slice(index + 1).trim(), 
                fields[field] = val;
            }), fields;
        },
        _setStatus: function() {
            this._setCommonStatus(), this._setDetailStatus();
        },
        _setCommonStatus: function() {
            var type = Math.floor(this.status / 100) || 0;
            this.aborted = Boolean(this.request.aborted), this.timeout = Boolean(this.request.timeoutExpired), 
            this.info = 1 === type, this.ok = 2 === type, this.clientError = 4 === type, this.serverError = 5 === type, 
            this.error = 4 === type || 5 === type, this.success = this.status >= 200 && this.status < 300;
        },
        _setDetailStatus: function() {
            this.created = 201 === this.status, this.accepted = 202 === this.status, this.noContent = 204 === this.status, 
            this.badRequest = 400 === this.status, this.unauthorized = 401 === this.status, 
            this.forbidden = 403 === this.status, this.notFound = 404 === this.status, this.notAcceptable = 406 === this.status, 
            this.toManyRequests = 429 === this.status;
        },
        get contentType() {
            var ct = this.headers["content-type"] || "", targetType = "";
            return Object.keys(ContentTypes).forEach(function(type) {
                ct === ContentTypes[type] && (targetType = ContentTypes[type]);
            }), targetType;
        },
        get json() {
            try {
                return JSON.parse(this.request.xhr.responseText);
            } catch (e) {}
            return {};
        },
        get xml() {
            return this.request.xhr.responseXML;
        },
        get data() {
            return this.contentType === ContentTypes.json ? this.json : this.contentType === ContentTypes.xml ? this.xml : this.request.xhr.responseText;
        },
        get response() {
            return this.request.xhr.response;
        }
    }, module.exports = Response;
}, function(module, exports) {
    "use strict";
    module.exports = {
        html: "text/html",
        json: "application/json",
        xml: "application/xml",
        urlencoded: "application/x-www-form-urlencoded",
        form: "application/x-www-form-urlencoded"
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        DEFAULT: "",
        JSON: "json",
        ARRAY_BUFFER: "arraybuffer",
        BLOB: "blob",
        DOCUMENT: "document",
        TEXT: "document"
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
        DELETE: "DELETE",
        HEAD: "HEAD",
        PATCH: "PATCH"
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var sender = __webpack_require__(88), bookmarks = __webpack_require__(90), dispatcher = __webpack_require__(9), utils = __webpack_require__(7), crossMessaging = __webpack_require__(46), primary = __webpack_require__(51), AppEvent = __webpack_require__(10);
    module.exports = {
        CREATE: "create",
        CHANGE: "edit",
        REMOVE: "delete",
        BROWSE_CLICK: "bmclick.bmbrowse",
        CLICK: "bmclick.click",
        feature: "bm-stats",
        isPrimary: !1,
        isSync: !1,
        isRunning: !1,
        navTransitionType: {},
        run: function() {
            this.isRunning || (this._initialize(), this._bindHandlers(), dispatcher.on(AppEvent.ELECTION_COMPLETED, this._onPrimarySelect, this), 
            this.isRunning = !0);
        },
        _bindHandlers: function() {
            this._onCreatedWrapper = this._onCreatedHandler.bind(this), this._onChangedWrapper = this._onChangedHandler.bind(this), 
            this._onRemovedWrapper = this._onRemovedHandler.bind(this), this._onNavigationWrapper = this._onNavigationCommit.bind(this), 
            this._onTabsWrapper = this._onTabUpdated.bind(this);
        },
        _initialize: function() {
            crossMessaging.set(this.feature, !0), chrome.bookmarks.getTree(function(tree) {
                bookmarks.parse(tree), chrome.bookmarks.onImportBegan.addListener(this._onImportBegan.bind(this)), 
                chrome.bookmarks.onImportEnded.addListener(this._onImportEnded.bind(this));
            }.bind(this));
        },
        _onPrimarySelect: function() {
            this.isPrimary = primary.isPrimaryForFeature(this.feature), sender.isEnabled = this.isPrimary, 
            this._toggle();
        },
        _toggle: function() {
            this.isPrimary ? this._observeEvents() : this._ignoreEvents();
        },
        _observeEvents: function() {
            this._ignoreEvents(), chrome.bookmarks.onCreated.addListener(this._onCreatedWrapper), 
            chrome.bookmarks.onRemoved.addListener(this._onRemovedWrapper), chrome.bookmarks.onChanged.addListener(this._onChangedWrapper), 
            chrome.webNavigation.onCommitted.addListener(this._onNavigationWrapper), chrome.tabs.onUpdated.addListener(this._onTabsWrapper);
        },
        _ignoreEvents: function() {
            chrome.bookmarks.onCreated.removeListener(this._onCreatedWrapper), chrome.bookmarks.onRemoved.removeListener(this._onRemovedWrapper), 
            chrome.bookmarks.onChanged.removeListener(this._onChangedWrapper), chrome.webNavigation.onCommitted.removeListener(this._onNavigationWrapper), 
            chrome.tabs.onUpdated.removeListener(this._onTabsWrapper);
        },
        _onCreatedHandler: function(id, bookmark) {
            bookmarks.add(bookmark), this._sendStatistics(bookmark, this.CREATE);
        },
        _onRemovedHandler: function(id) {
            var bookmark = bookmarks.get(id);
            this._sendStatistics(bookmark, this.REMOVE), bookmarks.remove(id);
        },
        _onChangedHandler: function(id) {
            var bookmark = bookmarks.get(id);
            this._sendStatistics(bookmark, this.CHANGE);
        },
        _onImportBegan: function() {
            sender.flush(), this._ignoreEvents();
        },
        _onImportEnded: function() {
            this._observeEvents(), chrome.bookmarks.getTree(function(tree) {
                bookmarks.folders = [], bookmarks.bookmarks = [], bookmarks.parse(tree);
            });
        },
        _sendStatistics: function(bookmark, type) {
            bookmarks.isFolder(bookmark) ? sender.sendFolder(type) : utils.isBrowserProtocol(bookmark.url) || sender.sendBookmark(type);
        },
        _sendClick: function(type, url) {
            utils.isBrowserProtocol(url) || sender.sendClick(type, url);
        },
        _onNavigationCommit: function(details) {
            details.tabId && !details.frameId && (this.navTransitionType[details.tabId] = details.transitionType);
        },
        _onTabUpdated: function(id, info, tab) {
            setTimeout(function() {
                bookmarks.getByUrl(tab.url) && "loading" === info.status && ("auto_bookmark" === this.navTransitionType[id] || "typed" === this.navTransitionType[id] ? this._sendClick(this.CLICK, tab.url) : tab.openerTabId || "link" !== this.navTransitionType[id] || this._sendClick(this.BROWSE_CLICK, tab.url));
            }.bind(this), 200);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var http = __webpack_require__(89), browser = __webpack_require__(12), branding = __webpack_require__(30);
    module.exports = {
        _url: branding.url("bookmarks.url"),
        _timeout: 5e3,
        _timeoutId: 0,
        _bmCache: {},
        _folderCache: {},
        _clickCache: {},
        isEnabled: !1,
        sendClick: function(type, url) {
            this._clickCache[url] = type, this._timeoutId || (this._timeoutId = setTimeout(this._send.bind(this), this._timeout));
        },
        sendBookmark: function(param) {
            this._addToCache(this._bmCache, param);
        },
        sendFolder: function(param) {
            this._addToCache(this._folderCache, param);
        },
        flush: function() {
            this._bmCache = {}, this._clickCache = {}, this._folderCache = {};
        },
        _addToCache: function(cache, param) {
            this._timeoutId || (this._timeoutId = setTimeout(this._send.bind(this), this._timeout)), 
            cache[param] || (cache[param] = 0), cache[param] += 1;
        },
        _send: function() {
            clearTimeout(this._timeoutId), this._timeoutId = 0, this._sendBookmarks(), this._sendFolders(), 
            this._sendClicks(), this.flush();
        },
        _sendBookmarks: function() {
            var prefix = "bm.", postfix = ".group";
            Object.keys(this._bmCache).forEach(function(param) {
                var data = prefix + param;
                this._bmCache[param] > 1 && (data += postfix), this._sendRequest(data);
            }, this);
        },
        _sendFolders: function() {
            var prefix = "bmfolder.", postfix = ".group";
            Object.keys(this._folderCache).forEach(function(param) {
                var data = prefix + param;
                this._folderCache[param] > 1 && (data += postfix), this._sendRequest(data);
            }, this);
        },
        _sendClicks: function() {
            Object.keys(this._clickCache).forEach(function(url) {
                var type = this._clickCache[url];
                this._sendRequest(type);
            }, this);
        },
        _sendRequest: function(param) {
            this.isEnabled && new http.Request().get(this._url.replace("{param}", param).replace("{browserId}", browser.getBrowser()));
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    module.exports = {
        Request: __webpack_require__(82),
        Response: __webpack_require__(83),
        ResponseTypes: __webpack_require__(85),
        HttpMethods: __webpack_require__(86),
        ContentTypes: __webpack_require__(84)
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        folders: [],
        bookmarks: [],
        add: function(bookmark) {
            this.isFolder(bookmark) ? this.folders.push(bookmark) : this.bookmarks.push(bookmark);
        },
        get: function(id) {
            return this.getBookmark(id) || this.getFolder(id);
        },
        getByUrl: function(url) {
            return this.bookmarks.filter(function(bookmark) {
                return bookmark.url === url;
            }).pop() || null;
        },
        getBookmark: function(id) {
            return this.search(id, this.bookmarks);
        },
        getFolder: function(id) {
            return this.search(id, this.folders);
        },
        isFolder: function(bookmark) {
            return !bookmark.url;
        },
        search: function(id, list) {
            return list.filter(function(bookmark) {
                return bookmark.id === id;
            }).pop() || null;
        },
        remove: function(id) {
            return this._removeFromList(id, this.bookmarks) || this._removeFromList(id, this.folders);
        },
        parse: function(tree) {
            this._walkTreeNodes(tree);
        },
        _walkTreeNodes: function(nodes) {
            nodes.forEach(function(node) {
                this.add(node), this._hasNodeChildren(node) && this._walkTreeNodes(node.children);
            }, this);
        },
        _hasNodeChildren: function(node) {
            return this.isFolder(node) && Array.isArray(node.children) && node.children.length > 0;
        },
        _removeFromList: function(id, list) {
            var index = this._getIndex(id, list);
            return index >= 0 && (list.splice(index, 1), !0);
        },
        _getIndex: function(id, list) {
            var bookmarkIndex = -1;
            return list.forEach(function(bookmark, index) {
                bookmark.id === id && (bookmarkIndex = index);
            }), bookmarkIndex;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var Logger = __webpack_require__(13), config = __webpack_require__(5), statHelpers = __webpack_require__(92), dispatcher = __webpack_require__(9), preferences = __webpack_require__(6), branding = __webpack_require__(30), primary = __webpack_require__(51), i18n = __webpack_require__(93), browser = __webpack_require__(12), statUtils = __webpack_require__(99), utils = __webpack_require__(7), crossMessaging = __webpack_require__(46), extensionDispatcher = __webpack_require__(100), ticker = __webpack_require__(101), AppEvent = __webpack_require__(10), Request = __webpack_require__(82), STAT_URL = branding.url("dayuse-json.url"), logger = Logger.create("DayuseJson"), SEC_IN_DAY = 86400, MAX_BOOKMARK_COUNT = 99999;
    module.exports = {
        extensionsData: [],
        isRunning: !1,
        run: function() {
            this.isRunning || (this._sendStatDebounce = utils.debounce(this._sendStat.bind(this), 2e3), 
            this._attachEvents(), crossMessaging.set("productStat", !0), ticker.run(), this.isRunning = !0);
        },
        _attachEvents: function() {
            extensionDispatcher.init(), extensionDispatcher.on(AppEvent.STAT_TAKE_PRODUCT, this._onTakeProduct, this), 
            extensionDispatcher.on(AppEvent.STAT_GIVE_PRODUCT, this._onGiveProduct, this), dispatcher.on(AppEvent.SOFT_EXPORT_TICK, this._onStatTick, this), 
            dispatcher.on(AppEvent.ELECTION_COMPLETED, this._onPrimarySelect, this);
        },
        _onPrimarySelect: function() {
            this.sendProductStat = primary.isPrimaryForFeature("productStat"), logger.log("Primary for sending product stat: %s", this.sendProductStat);
        },
        _onStatTick: function() {
            this.sendProductStat && (this.extensionsData = [], logger.log("Sending give-product event to extensions"), 
            this._onTakeProduct("yandex.statistics.take-product", this._createExtensionRelatedStat()), 
            extensionDispatcher.trigger("yandex.statistics.give-product"));
        },
        _onTakeProduct: function(topic, data) {
            this.sendProductStat && (logger.log("Received response with stat data"), this.extensionsData.push(data), 
            this._sendStatDebounce(this.extensionsData));
        },
        _onGiveProduct: function() {
            logger.log("Received request for stat data"), extensionDispatcher.trigger("yandex.statistics.take-product", this._createExtensionRelatedStat());
        },
        _createExtensionRelatedStat: function() {
            var statData = this._createExtensionStatDataObject(), sendAllStats = preferences.get(config.ENABLE_STAT_OPTION);
            return this._addDayuseElmntCtag(statData.children), this._addNotifCtag(statData.children), 
            this._addAuthCtag(statData.children), sendAllStats && this._addAccountsCtag(statData.children), 
            statData;
        },
        _createExtensionStatDataObject: function() {
            return {
                ctag: config.get("name"),
                children: []
            };
        },
        _addDayuseElmntCtag: function(ctagsList) {
            ctagsList.push({
                ctag: "dayuseelmnt",
                vars: {
                    count: this._calculateDaysCount()
                }
            });
        },
        _calculateDaysCount: function() {
            var installTime = config.installDate, now = Date.now() / 1e3, endOfInstallDayTime = statUtils.getEndOfDayTime(installTime);
            return Math.floor((now - endOfInstallDayTime) / SEC_IN_DAY);
        },
        _addNotifCtag: function(ctagsList) {
            var notifEnabled = statHelpers.get("notificationStatus");
            null !== notifEnabled && ctagsList.push({
                ctag: notifEnabled ? "wnotifon" : "wnotifoff"
            });
        },
        _addAuthCtag: function(ctagsList) {
            var auth = statHelpers.get("authStatus");
            null !== auth && ctagsList.push({
                ctag: auth ? "wauthon" : "wauthoff"
            });
        },
        _addAccountsCtag: function(ctagsList) {
            var storedAccounts = statHelpers.get("loginCount");
            storedAccounts > 0 && ctagsList.push({
                ctag: "yalogin",
                vars: {
                    count: storedAccounts
                }
            });
        },
        _createAdditionalStat: function(callback) {
            var sendAllStats = preferences.get(config.ENABLE_STAT_OPTION), statArray = [ {
                ctag: sendAllStats ? "stsendon" : "stsendoff"
            }, {
                ctag: "local",
                vars: {
                    brand: branding.get(),
                    lang: i18n.locale
                }
            } ];
            sendAllStats ? this._addBookmarksInfo(statArray, callback) : callback(statArray);
        },
        _addBookmarksInfo: function(statArray, callback) {
            chrome.bookmarks.getRecent(MAX_BOOKMARK_COUNT, function(data) {
                data && statArray.push({
                    ctag: "bmcount",
                    vars: {
                        count: this._roundBookmarksCount(data.length)
                    }
                }), callback(statArray);
            }.bind(this));
        },
        _roundBookmarksCount: function(count) {
            var roundStep, remainder;
            if (count < 101) roundStep = 5; else if (count < 201) roundStep = 20; else {
                if (!(count < 501)) return 501;
                roundStep = 50;
            }
            return remainder = count % roundStep, count - remainder + (0 === remainder ? 0 : roundStep);
        },
        _sendStat: function(extensionsData) {
            this._createAdditionalStat(function(additionalStat) {
                var preparedCounters = this._prepareCounters(extensionsData, additionalStat);
                preparedCounters && (logger.log("Send stat: %s, url: %s", preparedCounters, STAT_URL), 
                new Request().data({
                    path: "/batch",
                    counters: preparedCounters
                }).post(STAT_URL));
            }.bind(this));
        },
        _prepareCounters: function(extensionsData, additionalStat) {
            var elmntChildren = [ {
                ctag: "widgets",
                children: extensionsData
            } ], counters = [ {
                "parent-path": browser.getBrowser(),
                children: [ {
                    ctag: "elmnt",
                    children: elmntChildren.concat(additionalStat)
                } ]
            } ];
            try {
                counters = JSON.stringify(counters);
            } catch (error) {
                return void logger.error("Can't stringify counters!");
            }
            return counters;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var config = __webpack_require__(5), preferences = __webpack_require__(6), is = __webpack_require__(8), defaults = {
        loginCount: 0,
        authStatus: null,
        notificationStatus: function() {
            var option = preferences.get(config.NOTIFY_ENABLED_OPTION);
            return void 0 === option ? null : Boolean(option);
        }
    };
    module.exports = {
        _helpers: {},
        register: function(helpers) {
            helpers && Object.keys(helpers).forEach(function(key) {
                defaults.hasOwnProperty(key) && (this._helpers[key] = helpers[key]);
            }, this);
        },
        get: function(helperName) {
            var helper = this._helpers[helperName], defaultHelper = defaults[helperName];
            return this._getHelperValue(void 0 === helper ? defaultHelper : helper);
        },
        _getHelperValue: function(helper) {
            return is.isFunction(helper) ? helper() : helper;
        }
    };
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports) {
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
}, function(module, exports) {
    "use strict";
    module.exports = {
        END_OF_DAY_HOUR: 3,
        SEC_IN_DAY: 86400,
        getEndOfDayTime: function(currentTime) {
            var now = new Date(1e3 * currentTime), dateNumber = now.getHours() < this.END_OF_DAY_HOUR ? now.getDate() - 1 : now.getDate(), treeAMDate = new Date(now.getFullYear(), now.getMonth(), dateNumber, this.END_OF_DAY_HOUR);
            return parseInt(treeAMDate / 1e3, 10);
        },
        getDaysAfterInstall: function(installTime) {
            var now = Date.now() / 1e3, endOfInstallDayTime = this.getEndOfDayTime(installTime);
            return Math.floor((now - endOfInstallDayTime) / this.SEC_IN_DAY);
        }
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        events: {},
        moduleId: chrome.runtime.id,
        inited: !1,
        init: function(callback) {
            this.inited || (chrome.runtime.onMessageExternal.addListener(this._chromeMessageHandler.bind(this)), 
            this.inited = !0), "function" == typeof callback && callback();
        },
        trigger: function(topic, data, options, responseCallback) {
            var self = this;
            chrome.management.getAll(function(extensionsList) {
                extensionsList.forEach(function(extension) {
                    self.sendTo(extension.id, topic, data, options, responseCallback, extensionsList);
                }, self);
            });
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
        sendTo: function(id, topic, data, options, responseCallback, extensions) {
            var message = {
                topic: topic,
                data: data,
                options: options,
                transmitter: this.moduleId
            };
            this._validExtension(id, extensions, function(ok) {
                ok && this._sendMessage(id, message, responseCallback);
            });
        },
        flush: function() {
            Object.keys(this.events).forEach(function(event) {
                this.events[event] = [];
            }, this);
        },
        _chromeMessageHandler: function(message, sender, sendResponse) {
            if (message && message.topic && message.transmitter && message.transmitter !== this.moduleId) {
                var topic = message.topic, data = message.data || {}, options = message.options || {};
                return options.sendResponse = sendResponse, this._internalTrigger(topic, data, options), 
                Boolean(options.asyncResponse);
            }
        },
        _internalTrigger: function(topic, data, options) {
            var triggers = [];
            this.events[topic] && (this.events[topic] = this.events[topic].filter(function(event) {
                return event.handler && triggers.push(event), !event.once;
            }), triggers.forEach(function(event) {
                event.handler.call(event.ctx, topic, data, options);
            }));
        },
        _validExtension: function(id, extensions, callback) {
            this._getExtensions(extensions, function(list) {
                var valid = list.some(function(extension) {
                    return extension.id === id && extension.enabled && extension.id !== this.moduleId;
                }, this);
                callback.call(this, valid);
            });
        },
        _getExtensions: function(extensions, callback) {
            var self = this;
            return extensions ? callback.call(this, extensions) : void chrome.management.getAll(function(extensionsList) {
                callback.call(self, extensionsList);
            });
        },
        _sendMessage: function(id, message, responseCallback) {
            responseCallback ? chrome.runtime.sendMessage(id, message, responseCallback) : chrome.runtime.sendMessage(id, message);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var options = __webpack_require__(102), browser = __webpack_require__(12), dispatcher = __webpack_require__(9), preferences = __webpack_require__(6), AppEvent = __webpack_require__(10), statUtils = __webpack_require__(99);
    module.exports = {
        TWO_HOURS: 72e5,
        START_DELAY: 1e4,
        ONE_DAY: 86400,
        isRunning: !1,
        browserContextAvailable: !1,
        run: function() {
            this._tick = this._tick.bind(this), this.isRunning || this._runStatistics();
        },
        _runStatistics: function() {
            this.isRunning = !0, setTimeout(this._tick, this.START_DELAY), setInterval(this._tick, this.TWO_HOURS);
        },
        _tick: function() {
            this._waitBrowser(this._contextHandler.bind(this));
        },
        _waitBrowser: function(callback) {
            return this.browserContextAvailable ? void callback() : browser.whenBrowserContextAvailable(callback);
        },
        _contextHandler: function() {
            this.browserContextAvailable = !0;
            var last = preferences.get(options.SOFT_EXPORT_TIME);
            last || this._triggerStat(Date.now() / 1e3), this._checkLastTriggerDate(last);
        },
        _checkLastTriggerDate: function(last) {
            var now = Date.now() / 1e3;
            last < statUtils.getEndOfDayTime(now) && this._triggerStat(now);
        },
        _triggerStat: function(now) {
            dispatcher.trigger(AppEvent.SOFT_EXPORT_TICK), preferences.set(options.SOFT_EXPORT_TIME, now);
        }
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        UI: "yandex.statistics.ui",
        YANDEX_UI: "yandex.statistics.yandexUi",
        IS_YANDEX_UI: "yandex.statistics.is-yandex-ui",
        SOFT_EXPORT_TIME: "yandex.statistics.time",
        INSTALL_DATE: "application.installDate",
        DAYUSE_TIME: "yandex.dayuse.json.time",
        DAYUSE_STAT_TIME: "yandex.dayuse-stat.time",
        MIGRATION_KEY: "application.migration.state",
        BANNER_ID: "application.banner.id",
        BANNER_INIT_COMPLETED: "application.banner.initCompleted",
        CONTEXT_MENU: "application.context-menu.enabled",
        BAR_NAVIG: "application.tab.opinions.enabled",
        GPAUTO: "application.geolocation.enabled",
        ADVERTISEMENT: "application.advertisement.enabled"
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var Logger = __webpack_require__(13), dispatcher = __webpack_require__(9), browser = __webpack_require__(12), crossMessaging = __webpack_require__(46), primary = __webpack_require__(51), Clicker = __webpack_require__(104), AppEvent = __webpack_require__(10), ticker = __webpack_require__(101), clicker = new Clicker({
        pid: 278,
        cid: 72364
    }), logger = Logger.create("AppStatistics");
    module.exports = {
        _timeoutId: null,
        _timeoutMs: 5e3,
        _useTimeout: !1,
        _sendAppStat: !1,
        _isRunning: !1,
        _yaAppIds: [ "akkhkcocfnopiccplnimkefmaejepdlj", "lbhlpghmmkknfalanfimbfjlllianmdj" ],
        run: function() {
            browser.isChrome() && !this._isRunning && chrome.permissions.contains({
                permissions: [ "management" ]
            }, this._permissionsHandler.bind(this));
        },
        _permissionsHandler: function(hasPermission) {
            hasPermission && (this._listenAppEvents(), this._listenEnabledEvents(), this._start());
        },
        _listenAppEvents: function() {
            dispatcher.on(AppEvent.SOFT_EXPORT_TICK, this._onStatTick, this), dispatcher.on(AppEvent.ELECTION_COMPLETED, this._onPrimarySelect, this);
        },
        _listenEnabledEvents: function() {
            chrome.management.onEnabled.addListener(function() {
                this._useTimeout = !0;
            }.bind(this));
        },
        _start: function() {
            crossMessaging.set("appStat", !0), ticker.run(), this._isRunning = !0;
        },
        _onPrimarySelect: function() {
            this._sendAppStat = primary.isPrimaryForFeature("appStat"), logger.log("Primary for sending app stat: %s", this._sendAppStat);
        },
        _onStatTick: function() {
            clearTimeout(this._timeoutId), this._useTimeout ? this._timeoutId = setTimeout(this._onStatTick.bind(this), this._timeoutMs) : this._sendAppsStatistics(), 
            this._useTimeout = !1;
        },
        _sendAppsStatistics: function() {
            this._sendAppStat && chrome.management.getAll(function(apps) {
                this._calcAppsCount(apps, function(appsCount, packagedAppsCount) {
                    clicker.sendPath("numa." + appsCount), clicker.sendPath("nump." + packagedAppsCount), 
                    logger.log("Send stat, numa: %i; nump: %i", appsCount, packagedAppsCount);
                });
            }.bind(this));
        },
        _calcAppsCount: function(apps, callback) {
            var appsCount = 0, packagedAppsCount = 0, ourIds = Object.keys(crossMessaging.extinfo).concat(this._yaAppIds);
            apps.forEach(function(app) {
                app.enabled && ourIds.indexOf(app.id) === -1 && (appsCount++, "packaged_app" === app.type && packagedAppsCount++);
            }, this), callback(appsCount, packagedAppsCount);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function sendPath(path, pid, cid, vars) {
        if ("undefined" == typeof path) throw new TypeError("path is undefined");
        base.send(merge(defaults(), {
            pid: pid,
            cid: cid,
            path: path,
            vars: vars
        }));
    }
    var base = __webpack_require__(105), browser = __webpack_require__(12), merge = __webpack_require__(107), defaults = function() {
        return {
            pid: 12,
            cid: 72359,
            platform: browser.getBrowser(),
            version: chrome.runtime.getManifest().version.split(".").join("-")
        };
    }, Clicker = function(settings) {
        this._settings = merge(defaults(), settings);
    };
    Clicker.prototype = {
        send: function(data, withoutPatch) {
            if ("string" == typeof data) {
                var settings = merge(this._settings, {
                    action: data
                });
                return base.send(settings, withoutPatch);
            }
            return "object" == typeof data ? base.send(merge(this.settings, data), withoutPatch) : base.send(this.settings, withoutPatch);
        },
        sendPath: function(path, pid, cid, vars) {
            sendPath(path, pid || this._settings.pid, cid || this._settings.cid, vars);
        },
        get settings() {
            return merge({}, this._settings);
        }
    }, Clicker.send = function(data, common) {
        var settings = merge(defaults(), data);
        base.send(settings, common);
    }, Clicker.sendPath = sendPath, module.exports = Clicker;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function isSendEnabled() {
        return !browser.isFirefox() || preferences.get(config.ENABLE_STAT_OPTION);
    }
    function createUrl(data, withoutPatch) {
        return URL_PATTERN.replace("{pid}", encodeURIComponent(data.pid)).replace("{cid}", encodeURIComponent(data.cid)).replace("{path}", data.path || path.get(data, withoutPatch)).replace("{vars}", varsToString(data.vars));
    }
    function varsToString(vars) {
        return vars ? "/" + varsToQuery(vars) : "";
    }
    function varsToQuery(vars) {
        return Object.keys(vars).map(function(key) {
            return Array.isArray(vars[key]) ? encodeURIComponent(key) + "=" + vars[key].map(encodeURIComponent).join(valuesDelimiter) : encodeURIComponent(key) + "=" + encodeURIComponent(vars[key]);
        }).filter(Boolean).join(objectDelimiter);
    }
    var browser = __webpack_require__(12), preferences = __webpack_require__(6), config = __webpack_require__(5), branding = __webpack_require__(30), URL_PATTERN = branding.url("clicker.url"), Request = __webpack_require__(82), path = __webpack_require__(106), objectDelimiter = "/", valuesDelimiter = ".";
    exports.send = function(data, withoutPatch) {
        if (isSendEnabled()) return new Request().get(createUrl(data, withoutPatch));
    };
}, function(module, exports) {
    "use strict";
    var QUEUE = [ "platform", "feature", "version", "action" ];
    exports.get = function(data, withoutPatch) {
        return QUEUE.map(function(key) {
            return withoutPatch && "version" === key ? data[key].replace(/^(\d+)\-(\d+)\-(\d+)$/, "$1-$2") : data[key];
        }).filter(Boolean).join(".");
    };
}, function(module, exports, __webpack_require__) {
    var baseMerge = __webpack_require__(108), createAssigner = __webpack_require__(119), merge = createAssigner(baseMerge);
    module.exports = merge;
}, function(module, exports, __webpack_require__) {
    function baseMerge(object, source, customizer, stackA, stackB) {
        if (!isObject(object)) return object;
        var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)), props = isSrcArr ? void 0 : keys(source);
        return arrayEach(props || source, function(srcValue, key) {
            if (props && (key = srcValue, srcValue = source[key]), isObjectLike(srcValue)) stackA || (stackA = []), 
            stackB || (stackB = []), baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB); else {
                var value = object[key], result = customizer ? customizer(value, srcValue, key, object, source) : void 0, isCommon = void 0 === result;
                isCommon && (result = srcValue), void 0 === result && (!isSrcArr || key in object) || !isCommon && (result === result ? result === value : value !== value) || (object[key] = result);
            }
        }), object;
    }
    var arrayEach = __webpack_require__(109), baseMergeDeep = __webpack_require__(110), isArray = __webpack_require__(37), isArrayLike = __webpack_require__(56), isObject = __webpack_require__(34), isObjectLike = __webpack_require__(41), isTypedArray = __webpack_require__(116), keys = __webpack_require__(60);
    module.exports = baseMerge;
}, function(module, exports) {
    function arrayEach(array, iteratee) {
        for (var index = -1, length = array.length; ++index < length && iteratee(array[index], index, array) !== !1; ) ;
        return array;
    }
    module.exports = arrayEach;
}, function(module, exports, __webpack_require__) {
    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
        for (var length = stackA.length, srcValue = source[key]; length--; ) if (stackA[length] == srcValue) return void (object[key] = stackB[length]);
        var value = object[key], result = customizer ? customizer(value, srcValue, key, object, source) : void 0, isCommon = void 0 === result;
        isCommon && (result = srcValue, isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue)) ? result = isArray(value) ? value : isArrayLike(value) ? arrayCopy(value) : [] : isPlainObject(srcValue) || isArguments(srcValue) ? result = isArguments(value) ? toPlainObject(value) : isPlainObject(value) ? value : {} : isCommon = !1), 
        stackA.push(srcValue), stackB.push(result), isCommon ? object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB) : (result === result ? result !== value : value === value) && (object[key] = result);
    }
    var arrayCopy = __webpack_require__(111), isArguments = __webpack_require__(55), isArray = __webpack_require__(37), isArrayLike = __webpack_require__(56), isPlainObject = __webpack_require__(112), isTypedArray = __webpack_require__(116), toPlainObject = __webpack_require__(117);
    module.exports = baseMergeDeep;
}, function(module, exports) {
    function arrayCopy(source, array) {
        var index = -1, length = source.length;
        for (array || (array = Array(length)); ++index < length; ) array[index] = source[index];
        return array;
    }
    module.exports = arrayCopy;
}, function(module, exports, __webpack_require__) {
    function isPlainObject(value) {
        var Ctor;
        if (!isObjectLike(value) || objToString.call(value) != objectTag || isArguments(value) || !hasOwnProperty.call(value, "constructor") && (Ctor = value.constructor, 
        "function" == typeof Ctor && !(Ctor instanceof Ctor))) return !1;
        var result;
        return baseForIn(value, function(subValue, key) {
            result = key;
        }), void 0 === result || hasOwnProperty.call(value, result);
    }
    var baseForIn = __webpack_require__(113), isArguments = __webpack_require__(55), isObjectLike = __webpack_require__(41), objectTag = "[object Object]", objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty, objToString = objectProto.toString;
    module.exports = isPlainObject;
}, function(module, exports, __webpack_require__) {
    function baseForIn(object, iteratee) {
        return baseFor(object, iteratee, keysIn);
    }
    var baseFor = __webpack_require__(114), keysIn = __webpack_require__(63);
    module.exports = baseForIn;
}, function(module, exports, __webpack_require__) {
    var createBaseFor = __webpack_require__(115), baseFor = createBaseFor();
    module.exports = baseFor;
}, function(module, exports, __webpack_require__) {
    function createBaseFor(fromRight) {
        return function(object, iteratee, keysFunc) {
            for (var iterable = toObject(object), props = keysFunc(object), length = props.length, index = fromRight ? length : -1; fromRight ? index-- : ++index < length; ) {
                var key = props[index];
                if (iteratee(iterable[key], key, iterable) === !1) break;
            }
            return object;
        };
    }
    var toObject = __webpack_require__(33);
    module.exports = createBaseFor;
}, function(module, exports, __webpack_require__) {
    function isTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
    }
    var isLength = __webpack_require__(42), isObjectLike = __webpack_require__(41), argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]", arrayBufferTag = "[object ArrayBuffer]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]", typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = !0, 
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = !1;
    var objectProto = Object.prototype, objToString = objectProto.toString;
    module.exports = isTypedArray;
}, function(module, exports, __webpack_require__) {
    function toPlainObject(value) {
        return baseCopy(value, keysIn(value));
    }
    var baseCopy = __webpack_require__(118), keysIn = __webpack_require__(63);
    module.exports = toPlainObject;
}, function(module, exports) {
    function baseCopy(source, props, object) {
        object || (object = {});
        for (var index = -1, length = props.length; ++index < length; ) {
            var key = props[index];
            object[key] = source[key];
        }
        return object;
    }
    module.exports = baseCopy;
}, function(module, exports, __webpack_require__) {
    function createAssigner(assigner) {
        return restParam(function(object, sources) {
            var index = -1, length = null == object ? 0 : sources.length, customizer = length > 2 ? sources[length - 2] : void 0, guard = length > 2 ? sources[2] : void 0, thisArg = length > 1 ? sources[length - 1] : void 0;
            for ("function" == typeof customizer ? (customizer = bindCallback(customizer, thisArg, 5), 
            length -= 2) : (customizer = "function" == typeof thisArg ? thisArg : void 0, length -= customizer ? 1 : 0), 
            guard && isIterateeCall(sources[0], sources[1], guard) && (customizer = length < 3 ? void 0 : customizer, 
            length = 1); ++index < length; ) {
                var source = sources[index];
                source && assigner(object, source, customizer);
            }
            return object;
        });
    }
    var bindCallback = __webpack_require__(120), isIterateeCall = __webpack_require__(122), restParam = __webpack_require__(76);
    module.exports = createAssigner;
}, function(module, exports, __webpack_require__) {
    function bindCallback(func, thisArg, argCount) {
        if ("function" != typeof func) return identity;
        if (void 0 === thisArg) return func;
        switch (argCount) {
          case 1:
            return function(value) {
                return func.call(thisArg, value);
            };

          case 3:
            return function(value, index, collection) {
                return func.call(thisArg, value, index, collection);
            };

          case 4:
            return function(accumulator, value, index, collection) {
                return func.call(thisArg, accumulator, value, index, collection);
            };

          case 5:
            return function(value, other, key, object, source) {
                return func.call(thisArg, value, other, key, object, source);
            };
        }
        return function() {
            return func.apply(thisArg, arguments);
        };
    }
    var identity = __webpack_require__(121);
    module.exports = bindCallback;
}, function(module, exports) {
    function identity(value) {
        return value;
    }
    module.exports = identity;
}, function(module, exports, __webpack_require__) {
    function isIterateeCall(value, index, object) {
        if (!isObject(object)) return !1;
        var type = typeof index;
        if ("number" == type ? isArrayLike(object) && isIndex(index, object.length) : "string" == type && index in object) {
            var other = object[index];
            return value === value ? value === other : other !== other;
        }
        return !1;
    }
    var isArrayLike = __webpack_require__(56), isIndex = __webpack_require__(62), isObject = __webpack_require__(34);
    module.exports = isIterateeCall;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var clicker, Logger = __webpack_require__(13), dispatcher = __webpack_require__(9), primary = __webpack_require__(51), platform = __webpack_require__(11), crossMessaging = __webpack_require__(46), Clicker = __webpack_require__(104), AppEvent = __webpack_require__(10), TimeInterval = __webpack_require__(124), logger = Logger.create("HistoryStatistics"), MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
    module.exports = {
        _usedDays: 0,
        run: function() {
            clicker = new Clicker({
                cid: 72510
            }), crossMessaging.set("historyStat", !0), dispatcher.once(AppEvent.ELECTION_COMPLETED, this._onPrimarySelect, this);
        },
        _onPrimarySelect: function() {
            this.primary = primary.isPrimaryForFeature("historyStat"), logger.log("Primary for sending history stat: %s", this.primary), 
            this._checkHistoryPermission(function() {
                this._getBrowserHistory(this._handleBrowserHistory.bind(this));
            }.bind(this));
        },
        _checkHistoryPermission: function(callback) {
            chrome.permissions.contains({
                permissions: [ "history" ]
            }, function(hasPermission) {
                hasPermission && chrome.history && callback();
            });
        },
        _getBrowserHistory: function(callback) {
            this.primary && platform.status === platform.INSTALL && chrome.history.search({
                text: "",
                startTime: 0,
                maxResults: MAX_SAFE_INTEGER
            }, callback);
        },
        _handleBrowserHistory: function(arr) {
            arr && this._getAllAndUsedDays(arr, this._sendHistoryStat.bind(this, arr.length));
        },
        _sendHistoryStat: function(historyLength, allDays, usedDays) {
            var roundedHistoryLength = this._getRoundedHistoryLength(historyLength);
            logger.log("Send allDays: %i, usedDays: %i, historyLength: %i", allDays, usedDays, roundedHistoryLength), 
            clicker.send("browseruse." + allDays + "." + usedDays + "." + roundedHistoryLength);
        },
        _getRoundedHistoryLength: function(length) {
            if (0 === length) return 0;
            var roundStep = length >= 1e3 ? 200 : 100, remainder = length % roundStep;
            return length - remainder + (0 === remainder ? 0 : roundStep);
        },
        _getAllAndUsedDays: function(arr, callback) {
            return 0 === arr.length ? void callback(0, 0) : void chrome.history.getVisits({
                url: arr[arr.length - 1].url
            }, this._handleHistoryItemVisits.bind(this, callback));
        },
        _handleHistoryItemVisits: function(callback, visits) {
            var time = visits[0].visitTime, currentTime = Date.now(), allDays = this._calculateAllDays(time), bindedCallback = this._onHistorySearch.bind(this);
            currentTime - time > TimeInterval.HALF_YEAR.MS && (time = currentTime - TimeInterval.HALF_YEAR.MS);
            do currentTime - time < TimeInterval.DAY.MS && (bindedCallback = this._onHistorySearchFinish.bind(this, callback, allDays)), 
            chrome.history.search({
                text: "",
                startTime: time,
                endTime: time + TimeInterval.DAY.MS,
                maxResults: 1
            }, bindedCallback), time += TimeInterval.DAY.MS; while (currentTime - time >= 0);
        },
        _calculateAllDays: function(startTime) {
            var remainder, daysCount = Math.ceil((Date.now() - startTime) / TimeInterval.DAY.MS);
            return daysCount < 61 ? (remainder = daysCount % 10, daysCount - remainder + (0 === remainder ? 0 : 10)) : daysCount < 361 ? (remainder = daysCount % 20, 
            daysCount - remainder + (0 === remainder ? 0 : 20)) : 361;
        },
        _onHistorySearch: function(result) {
            result && 0 !== result.length && this._usedDays++;
        },
        _onHistorySearchFinish: function(callback, allDays, result) {
            this._onHistorySearch(result);
            var roundStep;
            roundStep = allDays < 61 ? 5 : allDays < 361 ? 10 : 20;
            var remainder = this._usedDays % roundStep;
            callback(allDays, this._usedDays - remainder + (0 === remainder ? 0 : roundStep));
        }
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        FIVE_SECONDS: {
            S: 5,
            MS: 5e3
        },
        TEN_SECONDS: {
            S: 10,
            MS: 1e4
        },
        MINUTE: {
            S: 60,
            MS: 6e4
        },
        HOUR: {
            S: 3600,
            MS: 36e5
        },
        TWO_HOURS: {
            S: 7200,
            MS: 72e5
        },
        DAY: {
            S: 86400,
            MS: 864e5
        },
        WEEK: {
            S: 604800,
            MS: 6048e5
        },
        HALF_YEAR: {
            S: 15811200,
            MS: 158112e5
        },
        YEAR: {
            S: 31536e3,
            MS: 31536e6
        },
        LEAP_YEAR: {
            S: 31622400,
            MS: 316224e5
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var dispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), platform = __webpack_require__(11), config = __webpack_require__(5), vendor = __webpack_require__(45), browser = __webpack_require__(12), SoftExport = __webpack_require__(126);
    module.exports = {
        run: function() {
            dispatcher.once(AppEvent.ELECTION_COMPLETED, this._handleComplete, this);
        },
        _handleComplete: function() {
            this.softExport = new SoftExport(this._createConfig()), this.softExport.run();
        },
        _createConfig: function() {
            return {
                yasoft: config.get("yasoft") + platform.yasoftPostfix,
                version: chrome.runtime.getManifest().version,
                ui: config.ui,
                clid: vendor.get(1),
                name: config.get("yasoft"),
                installDate: config.installDate,
                bn: browser.getBrowser(),
                bv: browser.version
            };
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var merge = __webpack_require__(107), preferences = __webpack_require__(6), http = __webpack_require__(89), platform = __webpack_require__(11), branding = __webpack_require__(30), ticker = __webpack_require__(101), AppEvent = __webpack_require__(10), dispatcher = __webpack_require__(9), options = __webpack_require__(102), LightSoftExport = function(config) {
        this.config = config;
    };
    LightSoftExport.prototype = {
        APP_INSTALL: "install",
        DAY_USE: "dayuse",
        run: function() {
            ticker.run(), dispatcher.on(AppEvent.SOFT_EXPORT_TICK, this._send, this);
        },
        _send: function() {
            var last = preferences.get(options.SOFT_EXPORT_TIME);
            return last ? void this._sendQuery(this.DAY_USE) : this._sendQuery(this.APP_INSTALL);
        },
        _sendQuery: function(type) {
            var params = {
                yasoft: this.config.yasoft,
                ui: this.config.ui,
                ver: this.config.version,
                bn: this.config.bn,
                bv: this.config.bv,
                os: platform.platform,
                stat: type,
                brandID: branding.get()
            };
            this.config.clid && (params.clid = this.config.clid), this.config.params && merge(params, this.config.params), 
            this.config.install && type === this.APP_INSTALL && merge(params, this.config.install), 
            this.config.dayuse && type === this.DAY_USE && merge(params, this.config.dayuse), 
            new http.Request().noCache().params(params).get(branding.url("soft-export.url"));
        }
    }, module.exports = LightSoftExport;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var dispatcher = __webpack_require__(9), AppEvent = __webpack_require__(10), goodbye = __webpack_require__(128), config = __webpack_require__(5), platform = __webpack_require__(11);
    module.exports = {
        run: function() {
            dispatcher.once(AppEvent.ELECTION_COMPLETED, this._handleCompleteEvent, this);
        },
        _handleCompleteEvent: function() {
            var params = {
                yasoft: config.get("yasoft") + platform.yasoftPostfix,
                ui: config.ui
            };
            goodbye.setup(params);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var thenChrome = __webpack_require__(129), omit = __webpack_require__(134), branding = __webpack_require__(30), platform = __webpack_require__(11).platform, vendor = __webpack_require__(45), browser = __webpack_require__(12), utils = __webpack_require__(7), preferences = __webpack_require__(6), options = __webpack_require__(102), Logger = __webpack_require__(13), GOODBYE_URL = branding.url("goodbye.url"), logger = Logger.create("goodbye");
    module.exports = {
        MAX_LENGTH: 255,
        setup: function(data) {
            var params = utils.objectMerge(this._getDefaults(), data), url = this._createUrl(params);
            logger.info("set goodbye page %s", url), thenChrome.runtime.setUninstallURL(url).catch(function(err) {
                logger.error("setUninstall url error %s, %j", url, err);
            });
        },
        _getDefaults: function() {
            return {
                ver: chrome.runtime.getManifest().version,
                os: platform,
                stat: "uninstall",
                brandID: branding.get(),
                clid: vendor.get(1),
                dateinstall: this._getInstallDate(),
                bn: browser.getBrowser(),
                bv: browser.version
            };
        },
        _getInstallDate: function() {
            var date = new Date(1e3 * parseInt(preferences.get(options.INSTALL_DATE), 10));
            return utils.dateToString(date);
        },
        _createUrl: function(params) {
            var goodbyeUrl = this._getUrl(params), removes = [ "bnrd", "gchid", "brandID", "os", "ver", "bn", "bv" ];
            if (goodbyeUrl.length <= this.MAX_LENGTH) return goodbyeUrl;
            for (var i = 0; i < removes.length; i++) {
                var paramsForRemove = removes.slice(0, i + 1);
                if (logger.warn("goodbye page url too long %s", goodbyeUrl), logger.info("try remove %s", paramsForRemove.join(", ")), 
                goodbyeUrl = this._getUrl(omit(params, paramsForRemove)), goodbyeUrl.length <= this.MAX_LENGTH) return goodbyeUrl;
            }
            return goodbyeUrl;
        },
        _getUrl: function(params) {
            return GOODBYE_URL + "?" + utils.serializeUrl(params);
        }
    };
}, function(module, exports, __webpack_require__) {
    (function(global) {
        "use strict";
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                default: obj
            };
        }
        function getNativePromise() {
            return "undefined" != typeof window && window.Promise ? window.Promise : "undefined" != typeof global && global.Promise ? global.Promise : void 0;
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        var _api = __webpack_require__(130), _api2 = _interopRequireDefault(_api), Thenable = getNativePromise();
        if (!Thenable) throw new TypeError("Native promise does not support in your environment. Use /out/api function directly");
        exports.default = (0, _api2.default)(Thenable), module.exports = exports.default;
    }).call(exports, function() {
        return this;
    }());
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function create(Thenable) {
        return Object.keys(_config2.default).reduce(function(result, namespace) {
            return createNamespace(result, namespace), wrapMethods(result, namespace, _config2.default[namespace], Thenable);
        }, {});
    }
    function createNamespace(obj, namespace) {
        var chromeNamespace = (0, _object.get)(obj, namespace);
        return chromeNamespace || (0, _object.set)(obj, namespace), obj;
    }
    function wrapMethods(obj, namespace, data, Promise) {
        return (0, _wrapper.wrapAsyncMethods)(obj, namespace, data.async, Promise), (0, 
        _wrapper.wrapSyncMethods)(obj, namespace, data.sync, Promise), obj;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = create;
    var _config = __webpack_require__(131), _config2 = _interopRequireDefault(_config), _wrapper = __webpack_require__(132), _object = __webpack_require__(133);
    module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = {
        alarms: {
            async: [ "get", "getAll", "clear", "clearAll" ],
            sync: [ "create" ]
        },
        bookmarks: {
            async: [ "get", "getChildren", "getRecent", "getTree", "getSubTree", "search", "create", "move", "update", "remove", "removeTree" ]
        },
        browserAction: {
            async: [ "getTitle", "setIcon", "getPopup", "getBadgeText", "getBadgeBackgroundColor" ],
            sync: [ "setTitle", "setPopup", "setBadgeText", "setBadgeBackgroundColor", "enable", "disable" ]
        },
        browsingData: {
            async: [ "settings", "remove", "removeAppcache", "removeCache", "removeCookies", "removeDownloads", "removeFileSystems", "removeFormData", "removeHistory", "removeIndexedDB", "removeLocalStorage", "removePluginData", "removePasswords", "removeWebSQL" ]
        },
        commands: {
            async: [ "getAll" ]
        },
        contextMenus: {
            async: [ "create", "update", "remove", "removeAll" ]
        },
        cookies: {
            async: [ "get", "getAll", "set", "remove", "getAllCookieStores" ]
        },
        debugger: {
            async: [ "attach", "detach", "sendCommand", "getTargets" ]
        },
        desktopCapture: {
            async: [ "chooseDesktopMedia" ],
            sync: [ "cancelChooseDesktopMedia" ]
        },
        "devtools.inspectedWindow": {
            async: [ "eval", "getResources" ],
            sync: [ "reload" ]
        },
        "devtools.network": {
            async: [ "getHAR" ]
        },
        "devtools.panels": {
            async: [ "create", "setOpenResourceHandler", "openResource" ]
        },
        dial: {
            async: [ "discoverNow", "fetchDeviceDescription" ]
        },
        downloads: {
            async: [ "download", "search", "pause", "resume", "cancel", "getFileIcon", "erase", "removeFile", "acceptDanger" ],
            sync: [ "open", "show", "showDefaultFolder", "drag", "setShelfEnabled" ]
        },
        extension: {
            async: [ "isAllowedIncognitoAccess", "isAllowedFileSchemeAccess" ],
            sync: [ "getURL", "getViews", "getBackgroundPage", "getExtensionTabs", "setUpdateUrlData" ]
        },
        fontSettings: {
            async: [ "clearFont", "getFont", "setFont", "getFontList", "clearDefaultFontSize", "getDefaultFontSize", "setDefaultFontSize", "clearDefaultFixedFontSize", "getDefaultFixedFontSize", "setDefaultFixedFontSize", "clearMinimumFontSize", "getMinimumFontSize", "setMinimumFontSize" ]
        },
        gcm: {
            async: [ "register", "unregister", "send" ]
        },
        history: {
            async: [ "search", "getVisits", "addUrl", "deleteUrl", "deleteRange", "deleteAll" ]
        },
        i18n: {
            async: [ "getAcceptLanguages", "detectLanguage" ],
            sync: [ "getMessage", "getUILanguage" ]
        },
        identity: {
            async: [ "getAccounts", "getAuthToken", "getProfileUserInfo", "removeCachedAuthToken", "launchWebAuthFlow" ],
            sync: [ "getRedirectURL" ]
        },
        idle: {
            async: [ "queryState" ],
            sync: [ "setDetectionInterval" ]
        },
        instanceID: {
            async: [ "getID", "getCreationTime", "getToken", "deleteToken", "deleteID" ]
        },
        management: {
            async: [ "getAll", "get", "getSelf", "getPermissionWarningsById", "getPermissionWarningsByManifest", "setEnabled", "uninstall", "uninstallSelf", "launchApp", "createAppShortcut", "setLaunchType", "generateAppForLink" ]
        },
        notifications: {
            async: [ "create", "update", "clear", "getAll", "getPermissionLevel" ]
        },
        omnibox: {
            sync: [ "setDefaultSuggestion" ]
        },
        pageAction: {
            async: [ "getTitle", "setIcon", "getPopup" ],
            sync: [ "show", "hide", "setTitle", "setPopup" ]
        },
        pageCapture: {
            async: [ "saveAsMHTML" ]
        },
        permissions: {
            async: [ "getAll", "contains", "request", "remove" ]
        },
        "privacy.network.networkPredictionEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.alternateErrorPagesEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.autofillEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.passwordSavingEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.safeBrowsingEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.searchSuggestEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.spellingServiceEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.services.translationServiceEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.websites.hyperlinkAuditingEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.websites.referrersEnabled": {
            async: [ "get", "set", "clear" ]
        },
        "privacy.websites.thirdPartyCookiesAllowed": {
            async: [ "get", "set", "clear" ]
        },
        "proxy.settings": {
            async: [ "get", "set", "clear" ]
        },
        runtime: {
            async: [ "getBackgroundPage", "openOptionsPage", "setUninstallURL", "requestUpdateCheck", "sendMessage", "sendNativeMessage", "getPlatformInfo", "getPackageDirectoryEntry" ],
            sync: [ "getManifest", "getURL", "reload", "restart", "connect", "connectNative" ]
        },
        sessions: {
            async: [ "getRecentlyClosed", "getDevices", "restore" ]
        },
        "storage.local": {
            async: [ "clear", "get", "set", "remove", "getBytesInUse" ]
        },
        "storage.managed": {
            async: [ "clear", "get", "set", "remove", "getBytesInUse" ]
        },
        "storage.sync": {
            async: [ "clear", "get", "set", "remove", "getBytesInUse" ]
        },
        "system.cpu": {
            async: [ "getInfo" ]
        },
        "system.memory": {
            async: [ "getInfo" ]
        },
        "system.storage": {
            async: [ "getInfo", "ejectDevice", "getAvailableCapacity" ]
        },
        tabCapture: {
            async: [ "capture", "getCapturedTabs" ]
        },
        tabs: {
            async: [ "get", "getCurrent", "sendRequest", "sendMessage", "getSelected", "getAllInWindow", "create", "duplicate", "query", "highlight", "update", "move", "reload", "remove", "detectLanguage", "captureVisibleTab", "executeScript", "insertCSS", "setZoom", "getZoom", "setZoomSettings", "getZoomSettings" ],
            sync: [ "connect" ]
        },
        topSites: {
            async: [ "get" ]
        },
        tts: {
            async: [ "speak", "isSpeaking", "getVoices" ],
            sync: [ "stop", "pause", "resume" ]
        },
        webNavigation: {
            async: [ "getFrame", "getAllFrames" ]
        },
        webRequest: {
            async: [ "handlerBehaviorChanged" ]
        },
        windows: {
            async: [ "get", "getCurrent", "getLastFocused", "getAll", "create", "update", "remove" ]
        }
    }, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    (function(global) {
        "use strict";
        function wrapAsyncMethods(obj, namespace, asyncMethods, Thenable) {
            return void 0 === asyncMethods && (asyncMethods = []), asyncMethods.reduce(function(result, method) {
                return appendAsyncMethod(obj, namespace, method, Thenable);
            }, obj);
        }
        function wrapSyncMethods(obj, namespace, syncMethods, Thenable) {
            return void 0 === syncMethods && (syncMethods = []), syncMethods.reduce(function(result, method) {
                return appendSyncMethod(obj, namespace, method, Thenable);
            }, obj);
        }
        function getChromeApi() {
            return "undefined" != typeof window && window.chrome ? window.chrome : "undefined" != typeof global && global.chrome ? global.chrome : void 0;
        }
        function appendAsyncMethod(obj, namespace, method, Thenable) {
            var data = (0, _object.get)(obj, namespace);
            return Object.defineProperty(data, method, {
                get: function() {
                    return wrapAsyncMethod(Thenable, namespace, method);
                }
            }), obj;
        }
        function wrapAsyncMethod(Thenable, namespace, method) {
            var _this = this;
            return function() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                return new Thenable(function(resolve, reject) {
                    var chromeNamespace = (0, _object.get)(chromeApi, namespace);
                    args.push(getResolver(resolve, reject, _this)), apply(chromeNamespace[method], chromeNamespace, args);
                });
            };
        }
        function getResolver(resolve, reject, context) {
            return function() {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
                return chromeApi.runtime.lastError ? reject(chromeApi.runtime.lastError) : apply(resolve, context, args);
            };
        }
        function appendSyncMethod(obj, namespace, method, PromiseConstructor) {
            var data = (0, _object.get)(obj, namespace);
            return Object.defineProperty(data, method, {
                get: function() {
                    return wrapSyncMethod(PromiseConstructor, namespace, method);
                }
            }), obj;
        }
        function wrapSyncMethod(Thenable, namespace, method) {
            return function() {
                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) args[_key3] = arguments[_key3];
                return new Thenable(function(resolve, reject) {
                    var chromeNamespace = (0, _object.get)(chromeApi, namespace);
                    try {
                        return resolve(apply(chromeNamespace[method], chromeNamespace, args));
                    } catch (e) {
                        return reject(e);
                    }
                });
            };
        }
        function apply(method, context, args) {
            return Function.prototype.apply.call(method, context, args);
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.wrapAsyncMethods = wrapAsyncMethods, exports.wrapSyncMethods = wrapSyncMethods;
        var _object = __webpack_require__(133), chromeApi = getChromeApi();
    }).call(exports, function() {
        return this;
    }());
}, function(module, exports) {
    "use strict";
    function get(object, path) {
        for (var delimiter = arguments.length <= 2 || void 0 === arguments[2] ? "." : arguments[2], keys = path.split(delimiter), data = object, i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!data[key]) return null;
            data = data[key];
        }
        return data;
    }
    function set(obj, path) {
        var delimiter = arguments.length <= 2 || void 0 === arguments[2] ? "." : arguments[2];
        return createNestedObject(obj, path.split(delimiter));
    }
    function createNestedObject(obj, keys) {
        if (keys.length) {
            var nested = obj[keys[0]] = "undefined" == typeof obj[keys[0]] ? {} : obj[keys[0]];
            createNestedObject(nested, keys.slice(1, keys.length));
        }
        return obj;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.get = get, exports.set = set;
}, function(module, exports, __webpack_require__) {
    var arrayMap = __webpack_require__(135), baseDifference = __webpack_require__(136), baseFlatten = __webpack_require__(143), bindCallback = __webpack_require__(120), keysIn = __webpack_require__(63), pickByArray = __webpack_require__(145), pickByCallback = __webpack_require__(146), restParam = __webpack_require__(76), omit = restParam(function(object, props) {
        if (null == object) return {};
        if ("function" != typeof props[0]) {
            var props = arrayMap(baseFlatten(props), String);
            return pickByArray(object, baseDifference(keysIn(object), props));
        }
        var predicate = bindCallback(props[0], props[1], 3);
        return pickByCallback(object, function(value, key, object) {
            return !predicate(value, key, object);
        });
    });
    module.exports = omit;
}, function(module, exports) {
    function arrayMap(array, iteratee) {
        for (var index = -1, length = array.length, result = Array(length); ++index < length; ) result[index] = iteratee(array[index], index, array);
        return result;
    }
    module.exports = arrayMap;
}, function(module, exports, __webpack_require__) {
    function baseDifference(array, values) {
        var length = array ? array.length : 0, result = [];
        if (!length) return result;
        var index = -1, indexOf = baseIndexOf, isCommon = !0, cache = isCommon && values.length >= LARGE_ARRAY_SIZE ? createCache(values) : null, valuesLength = values.length;
        cache && (indexOf = cacheIndexOf, isCommon = !1, values = cache);
        outer: for (;++index < length; ) {
            var value = array[index];
            if (isCommon && value === value) {
                for (var valuesIndex = valuesLength; valuesIndex--; ) if (values[valuesIndex] === value) continue outer;
                result.push(value);
            } else indexOf(values, value, 0) < 0 && result.push(value);
        }
        return result;
    }
    var baseIndexOf = __webpack_require__(137), cacheIndexOf = __webpack_require__(139), createCache = __webpack_require__(140), LARGE_ARRAY_SIZE = 200;
    module.exports = baseDifference;
}, function(module, exports, __webpack_require__) {
    function baseIndexOf(array, value, fromIndex) {
        if (value !== value) return indexOfNaN(array, fromIndex);
        for (var index = fromIndex - 1, length = array.length; ++index < length; ) if (array[index] === value) return index;
        return -1;
    }
    var indexOfNaN = __webpack_require__(138);
    module.exports = baseIndexOf;
}, function(module, exports) {
    function indexOfNaN(array, fromIndex, fromRight) {
        for (var length = array.length, index = fromIndex + (fromRight ? 0 : -1); fromRight ? index-- : ++index < length; ) {
            var other = array[index];
            if (other !== other) return index;
        }
        return -1;
    }
    module.exports = indexOfNaN;
}, function(module, exports, __webpack_require__) {
    function cacheIndexOf(cache, value) {
        var data = cache.data, result = "string" == typeof value || isObject(value) ? data.set.has(value) : data.hash[value];
        return result ? 0 : -1;
    }
    var isObject = __webpack_require__(34);
    module.exports = cacheIndexOf;
}, function(module, exports, __webpack_require__) {
    (function(global) {
        function createCache(values) {
            return nativeCreate && Set ? new SetCache(values) : null;
        }
        var SetCache = __webpack_require__(141), getNative = __webpack_require__(38), Set = getNative(global, "Set"), nativeCreate = getNative(Object, "create");
        module.exports = createCache;
    }).call(exports, function() {
        return this;
    }());
}, function(module, exports, __webpack_require__) {
    (function(global) {
        function SetCache(values) {
            var length = values ? values.length : 0;
            for (this.data = {
                hash: nativeCreate(null),
                set: new Set()
            }; length--; ) this.push(values[length]);
        }
        var cachePush = __webpack_require__(142), getNative = __webpack_require__(38), Set = getNative(global, "Set"), nativeCreate = getNative(Object, "create");
        SetCache.prototype.push = cachePush, module.exports = SetCache;
    }).call(exports, function() {
        return this;
    }());
}, function(module, exports, __webpack_require__) {
    function cachePush(value) {
        var data = this.data;
        "string" == typeof value || isObject(value) ? data.set.add(value) : data.hash[value] = !0;
    }
    var isObject = __webpack_require__(34);
    module.exports = cachePush;
}, function(module, exports, __webpack_require__) {
    function baseFlatten(array, isDeep, isStrict, result) {
        result || (result = []);
        for (var index = -1, length = array.length; ++index < length; ) {
            var value = array[index];
            isObjectLike(value) && isArrayLike(value) && (isStrict || isArray(value) || isArguments(value)) ? isDeep ? baseFlatten(value, isDeep, isStrict, result) : arrayPush(result, value) : isStrict || (result[result.length] = value);
        }
        return result;
    }
    var arrayPush = __webpack_require__(144), isArguments = __webpack_require__(55), isArray = __webpack_require__(37), isArrayLike = __webpack_require__(56), isObjectLike = __webpack_require__(41);
    module.exports = baseFlatten;
}, function(module, exports) {
    function arrayPush(array, values) {
        for (var index = -1, length = values.length, offset = array.length; ++index < length; ) array[offset + index] = values[index];
        return array;
    }
    module.exports = arrayPush;
}, function(module, exports, __webpack_require__) {
    function pickByArray(object, props) {
        object = toObject(object);
        for (var index = -1, length = props.length, result = {}; ++index < length; ) {
            var key = props[index];
            key in object && (result[key] = object[key]);
        }
        return result;
    }
    var toObject = __webpack_require__(33);
    module.exports = pickByArray;
}, function(module, exports, __webpack_require__) {
    function pickByCallback(object, predicate) {
        var result = {};
        return baseForIn(object, function(value, key, object) {
            predicate(value, key, object) && (result[key] = value);
        }), result;
    }
    var baseForIn = __webpack_require__(113);
    module.exports = pickByCallback;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var config = __webpack_require__(5), preferences = __webpack_require__(6), dispatcher = __webpack_require__(9), utils = __webpack_require__(7), Logger = __webpack_require__(13), i18n = __webpack_require__(93), branding = __webpack_require__(30), browser = __webpack_require__(12), sharedData = __webpack_require__(48), ClckStatistics = __webpack_require__(104), crossMessaging = __webpack_require__(46), redirectCatcherXHR = __webpack_require__(148), primary = __webpack_require__(51), vendor = __webpack_require__(45), AppEvent = __webpack_require__(10);
    module.exports = {
        CONTEXT_MENU_OPTION: "application.context-menu.enabled",
        SEARCH_LABEL: "context-menu.search.label",
        CROSS_MESSAGING_FEATURE: "contextMenuSearch",
        menus: {
            image: null,
            selection: null
        },
        enabled: !0,
        isPrimary: !1,
        postSearchTabId: null,
        run: function() {
            this._setup(), this._setupStatistics(), this._observeEvents();
        },
        _setup: function() {
            redirectCatcherXHR.init({
                logger: Logger.create("RedirectXHR")
            }), preferences.setDefault(this.CONTEXT_MENU_OPTION, !0), crossMessaging.set(this.CROSS_MESSAGING_FEATURE, !0);
        },
        _setupStatistics: function() {
            this.statistics = new ClckStatistics({
                platform: browser.getBrowser(),
                cid: 72558,
                common: !0
            });
        },
        _observeEvents: function() {
            this._observePrimary(), this._observeSharedData();
        },
        _observePrimary: function() {
            dispatcher.on(AppEvent.ELECTION_COMPLETED, this._onPrimaryHandler, this);
        },
        _onPrimaryHandler: function() {
            this.isPrimary = chrome.runtime.id === primary.selectByFeature(this.CROSS_MESSAGING_FEATURE, !0), 
            sharedData.weakSet(this.CONTEXT_MENU_OPTION, preferences.get(this.CONTEXT_MENU_OPTION)), 
            this._toggle();
        },
        _toggle: function() {
            this.isPrimary && sharedData.get(this.CONTEXT_MENU_OPTION) ? this._createMenu() : this._removeMenu();
        },
        _createMenu: function() {
            this._removeAll(), this._createSelectionMenu(), this._createImageMenu();
        },
        _createSelectionMenu: function() {
            this.menus.selection || (this.menus.selection = chrome.contextMenus.create({
                id: "yandex.search",
                title: i18n.message(this.SEARCH_LABEL, [ "%s" ]),
                type: "normal",
                contexts: [ "selection" ],
                onclick: this._selectionClickHandler.bind(this)
            }));
        },
        _selectionClickHandler: function(info) {
            this.statistics.send("searchyandexclick"), browser.navigate(this._getContextMenuSearchUrl(info.selectionText));
        },
        _createImageMenu: function() {
            this.menus.image || "tb" === config.branding || (this.menus.image = chrome.contextMenus.create({
                id: "yandex.imgSearch",
                title: i18n.message("context-menu.imgSearch.label"),
                type: "normal",
                contexts: [ "image" ],
                onclick: this._imageClickHandler.bind(this)
            }));
        },
        _imageClickHandler: function(info) {
            info && info.srcUrl && (this.statistics.send("searchpicclick"), info.srcUrl.indexOf("data:image") >= 0 ? this._openPostSearchTab(info.srcUrl) : this._searchImage(info.srcUrl));
        },
        _searchImage: function(src) {
            browser.navigate(branding.url("context-menu.imgSearch.getUrl") + encodeURIComponent(src));
        },
        _openPostSearchTab: function(imageData) {
            chrome.tabs.create({
                url: chrome.runtime.getURL("nano/src/dynamic-modules/context-menu/post-search.html"),
                active: !0
            }, function(tab) {
                this.postSearchTabId = tab.id, this._uploadImage(imageData);
            }.bind(this));
        },
        _uploadImage: function(imageData) {
            var postUrl = branding.url("context-menu.imgSearch.postUrl"), form = new FormData(), xhr = new XMLHttpRequest();
            form.append("upfile", utils.dataUriToBlob(imageData)), xhr.open("POST", postUrl), 
            this.postRedirectListener || (this.postRedirectListener = this._onRedirectComplete.bind(this, postUrl), 
            redirectCatcherXHR.onCompleted.addListener(this.postRedirectListener)), redirectCatcherXHR.startFor(postUrl, !0), 
            xhr.send(form);
        },
        _onRedirectComplete: function(postUrl, event) {
            if (event.initialUrl === postUrl) {
                redirectCatcherXHR.stopFor(postUrl);
                var getUrl = event.urls.pop();
                getUrl && getUrl !== postUrl || (getUrl = branding.url("context-menu.imgSearch.getUrl") + "?%22http%3A%2F%2F"), 
                this.postSearchTabId && chrome.tabs.update(this.postSearchTabId, {
                    url: getUrl
                }), this.postSearchTabId = null;
            }
        },
        _removeMenu: function() {
            var self = this;
            Object.keys(this.menus).forEach(function(key) {
                self.menus[key] && (chrome.contextMenus.remove(self.menus[key]), self.menus[key] = null);
            });
        },
        _removeAll: function() {
            this._removeMenu(), chrome.contextMenus.removeAll();
        },
        _observeSharedData: function() {
            sharedData.addListener(this._onSharedDataChange.bind(this));
        },
        _onSharedDataChange: function(event) {
            utils.isDefined(event.data[this.CONTEXT_MENU_OPTION]) && this._toggle();
        },
        _getContextMenuSearchUrl: function(searchString) {
            var url = branding.url("context-menu.search.url") + "search/", params = {
                text: searchString,
                clid: vendor.get(10),
                lr: 213
            };
            return utils.generateUrl(url, params);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function findUrl(list, urlToFind) {
        for (var i = 0, l = list.length; i < l; i++) {
            var urlFromList = list[i];
            if (0 === urlToFind.indexOf(urlFromList)) return urlFromList;
        }
        return null;
    }
    function onBeforeRequestXHR(details) {
        var initialUrl, request = requests[details.requestId], resolution = {
            cancel: !1
        };
        return request ? (initialUrl = request.initialUrl, blockingUrlsMap[initialUrl] && "GET" === details.method && (resolution.cancel = !0), 
        request.urls.push(details.url), logger.log("onBeforeRequest, id: %s, url: %s", details.requestId, details.url)) : (initialUrl = findUrl(urlPatterns, details.url), 
        initialUrl && (requests[details.requestId] = {
            initialUrl: initialUrl,
            urls: [ details.url ]
        }, logger.log("onBeforeRequest, id: %s, url: %s", details.requestId, details.url))), 
        resolution;
    }
    function onCompletedXHR(details) {
        var request = requests[details.requestId];
        request && (logger.log("onCompletedXHR, id: %s, url: %s", details.requestId, details.url), 
        redirect.onCompleted.dispatchToListener(request, details), delete requests[details.requestId]);
    }
    var logger, FlatEvent = __webpack_require__(80), urlPatterns = [], blockingUrlsMap = {}, requests = {}, redirect = {
        init: function(params) {
            urlPatterns = [], requests = {}, params = params || {}, logger = params.logger || {
                log: function() {}
            };
        },
        startFor: function(initialUrl, blockRedirects) {
            var filter = {
                urls: [ "<all_urls>" ],
                types: [ "xmlhttprequest" ]
            };
            0 === urlPatterns.length && (chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestXHR, filter, [ "blocking" ]), 
            chrome.webRequest.onCompleted.addListener(onCompletedXHR, filter), chrome.webRequest.onErrorOccurred.addListener(onCompletedXHR, filter)), 
            blockRedirects && (blockingUrlsMap[initialUrl] = !0), urlPatterns.push(initialUrl);
        },
        stopFor: function(initialUrl) {
            for (var i = urlPatterns.length; i--; ) if (urlPatterns[i] === initialUrl) {
                urlPatterns.splice(i, 1);
                break;
            }
            delete blockingUrlsMap[initialUrl], 0 === urlPatterns.length && (chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestXHR), 
            chrome.webRequest.onCompleted.removeListener(onCompletedXHR), chrome.webRequest.onErrorOccurred.removeListener(onCompletedXHR));
        },
        onCompleted: new FlatEvent("redirectXHR.onCompleted")
    };
    module.exports = redirect;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function getConfig() {
        return {
            name: config.get("yasoft"),
            ui: config.ui,
            installDate: config.installDate,
            clid: vendor.get(1)
        };
    }
    var config = __webpack_require__(5), vendor = __webpack_require__(45), DayuseStat = __webpack_require__(150), AppEvent = __webpack_require__(10), dispatcher = __webpack_require__(9), ticker = __webpack_require__(101), experiments = __webpack_require__(151);
    module.exports = {
        run: function() {
            this._waitStatisticsTick(), ticker.run();
        },
        _waitStatisticsTick: function() {
            dispatcher.on(AppEvent.SOFT_EXPORT_TICK, this._sendStats, this);
        },
        _sendStats: function() {
            DayuseStat.send(getConfig(), experiments.getExperiments());
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function assertConfig(config) {
        REQUIRED_FIELDS.forEach(function(field) {
            if (!config.hasOwnProperty(field)) throw new Error("Property " + field + " required for dayuse.json statistics");
        });
    }
    function createUrl(config, experiments) {
        var url = branding.url("dayuse-stat.url"), vars = createVarsSection(config), slots = createSlotsSection(experiments);
        return url.replace("{vars}", vars).replace("{slots}", slots);
    }
    function createVarsSection(config) {
        var vars = {
            dayuse: statUtils.getDaysAfterInstall(config.installDate),
            bro: browser.getBrowser(),
            productname: config.name,
            ver: getFormattedVersion(),
            ui: config.ui,
            brandID: branding.get()
        };
        return config.clid && (vars.clid1 = config.clid), config.params && Object.keys(config.params).forEach(function(key) {
            vars[key] = config.params[key];
        }), Object.keys(vars).map(function(key) {
            return "-" + key + "=" + encodeURIComponent(vars[key]);
        }).join(",");
    }
    function createSlotsSection(experiments) {
        var slots = extractSlots(experiments) || [ 0, 0, 0 ];
        return slots.map(encodeURIComponent).join(",");
    }
    function extractSlots(experiments) {
        if (Array.isArray(experiments)) {
            var currentExperiment = experiments[0];
            if (currentExperiment) return [ currentExperiment.testId, currentExperiment.testId, currentExperiment.bucket ];
        }
        return null;
    }
    function getFormattedVersion() {
        var version = chrome.runtime.getManifest().version;
        return version.split(".").join("-");
    }
    var Request = __webpack_require__(82), statUtils = __webpack_require__(99), browser = __webpack_require__(12), AppEvent = __webpack_require__(10), dispatcher = __webpack_require__(9), ticker = __webpack_require__(101), branding = __webpack_require__(30), REQUIRED_FIELDS = [ "name", "ui", "installDate" ], DayuseStat = function(config, getExperiments) {
        assertConfig(config), this._config = config, this._getExperiments = getExperiments;
    };
    DayuseStat.send = function(config, experiments) {
        assertConfig(config), new Request().get(createUrl(config, experiments));
    }, DayuseStat.prototype = {
        run: function() {
            this._waitStatisticsTick(), ticker.run();
        },
        _waitStatisticsTick: function() {
            dispatcher.on(AppEvent.SOFT_EXPORT_TICK, this._sendStats, this);
        },
        _sendStats: function() {
            var experiments = this._getExperiments ? this._getExperiments() : null, url = createUrl(this._config, experiments);
            new Request().get(url);
        }
    }, module.exports = DayuseStat;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function updateExperiments(isInstall) {
        var experimentator = new Experimentator(), configs = getConfigs();
        state.updateExperiments(experimentator, configs, Boolean(isInstall)), logExistingExperiments();
    }
    function getConfigs() {
        return buildInfo.get(CONFIG_NAME);
    }
    function logExistingExperiments() {
        logger.info("Current experiments: %j", exports.getExperiments());
    }
    var Experimentator = __webpack_require__(152).experiments.Experimentator, Logger = __webpack_require__(13), buildInfo = __webpack_require__(230), platform = __webpack_require__(11), state = __webpack_require__(231), logger = Logger.create("experiments"), CONFIG_NAME = "experimentConfigs", UPDATE_INTERVAL_MS = 36e5;
    exports.run = function() {
        logger.info("Configs: %j", getConfigs()), updateExperiments(platform.isInstall), 
        setInterval(updateExperiments, UPDATE_INTERVAL_MS);
    }, exports.getExperiments = state.getExperiments.bind(state), exports.getExperimentByName = state.getExperimentByName.bind(state);
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _atom = __webpack_require__(153), _atom2 = _interopRequireDefault(_atom), _cookies = __webpack_require__(192), _cookies2 = _interopRequireDefault(_cookies), _experiments = __webpack_require__(202), _experiments2 = _interopRequireDefault(_experiments), _location = __webpack_require__(206), _location2 = _interopRequireDefault(_location), _metrika = __webpack_require__(211), _metrika2 = _interopRequireDefault(_metrika), _metrikaLoggerWriter = __webpack_require__(212), _metrikaLoggerWriter2 = _interopRequireDefault(_metrikaLoggerWriter), _notification = __webpack_require__(213), _notification2 = _interopRequireDefault(_notification), _storage = __webpack_require__(216), _storage2 = _interopRequireDefault(_storage), _tabsWatcher = __webpack_require__(218), _tabsWatcher2 = _interopRequireDefault(_tabsWatcher), _channel = __webpack_require__(229), _channel2 = _interopRequireDefault(_channel);
    exports.default = {
        Atom: _atom2.default,
        cookies: _cookies2.default,
        experiments: _experiments2.default,
        location: _location2.default,
        Metrika: _metrika2.default,
        metrikaLoggerWriter: _metrikaLoggerWriter2.default,
        Notification: _notification2.default,
        Storage: _storage2.default,
        TabsWatcher: _tabsWatcher2.default,
        Channel: _channel2.default
    }, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _defaults = __webpack_require__(154), _defaults2 = _interopRequireDefault(_defaults), _response = __webpack_require__(160), _response2 = _interopRequireDefault(_response), _urijs = __webpack_require__(187), _urijs2 = _interopRequireDefault(_urijs), Atom = function() {
        function Atom(url) {
            var settings = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            _classCallCheck(this, Atom), this.url = url, this.settings = (0, _defaults2.default)({}, settings, {
                lang: "ru",
                tld: ".ru"
            });
        }
        return _createClass(Atom, [ {
            key: "getContent",
            value: function() {
                var _this = this, params = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, headers = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, url = this._getAtomUrl((0, 
                _defaults2.default)(params, this.settings)), data = {
                    credentials: "include",
                    headers: headers
                };
                return fetch(url, data).then(function(response) {
                    return _this._processAtomResponse(response);
                }).then(function(json) {
                    return new _response2.default(json);
                });
            }
        }, {
            key: "_getAtomUrl",
            value: function(params) {
                return new _urijs2.default(this.url).search(params).href();
            }
        }, {
            key: "_processAtomResponse",
            value: function(response) {
                return response.ok ? response.json() : Promise.reject(response.statusText);
            }
        } ]), Atom;
    }();
    exports.default = Atom, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    var assign = __webpack_require__(155), assignDefaults = __webpack_require__(158), createDefaults = __webpack_require__(159), defaults = createDefaults(assign, assignDefaults);
    module.exports = defaults;
}, function(module, exports, __webpack_require__) {
    var assignWith = __webpack_require__(156), baseAssign = __webpack_require__(157), createAssigner = __webpack_require__(119), assign = createAssigner(function(object, source, customizer) {
        return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
    });
    module.exports = assign;
}, function(module, exports, __webpack_require__) {
    function assignWith(object, source, customizer) {
        for (var index = -1, props = keys(source), length = props.length; ++index < length; ) {
            var key = props[index], value = object[key], result = customizer(value, source[key], key, object, source);
            (result === result ? result === value : value !== value) && (void 0 !== value || key in object) || (object[key] = result);
        }
        return object;
    }
    var keys = __webpack_require__(60);
    module.exports = assignWith;
}, function(module, exports, __webpack_require__) {
    function baseAssign(object, source) {
        return null == source ? object : baseCopy(source, keys(source), object);
    }
    var baseCopy = __webpack_require__(118), keys = __webpack_require__(60);
    module.exports = baseAssign;
}, function(module, exports) {
    function assignDefaults(objectValue, sourceValue) {
        return void 0 === objectValue ? sourceValue : objectValue;
    }
    module.exports = assignDefaults;
}, function(module, exports, __webpack_require__) {
    function createDefaults(assigner, customizer) {
        return restParam(function(args) {
            var object = args[0];
            return null == object ? object : (args.push(customizer), assigner.apply(void 0, args));
        });
    }
    var restParam = __webpack_require__(76);
    module.exports = createDefaults;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _findWhere = __webpack_require__(161), _findWhere2 = _interopRequireDefault(_findWhere), _get = __webpack_require__(31), _get2 = _interopRequireDefault(_get), AtomResponse = function() {
        function AtomResponse(jsonResponse) {
            _classCallCheck(this, AtomResponse), this.response = jsonResponse;
        }
        return _createClass(AtomResponse, [ {
            key: "getConfig",
            value: function(blockName) {
                var config = (0, _findWhere2.default)(this.response["client-results"], {
                    name: blockName
                });
                return config && config.docs ? config : null;
            }
        }, {
            key: "getConfigDoc",
            value: function(blockName) {
                var config = this.getConfig(blockName), doc = (0, _get2.default)(config, "docs[0]");
                return doc || null;
            }
        }, {
            key: "getConfigSource",
            value: function(blockName) {
                var doc = this.getConfigDoc(blockName);
                return doc ? doc["source-aux"] : null;
            }
        } ]), AtomResponse;
    }();
    exports.default = AtomResponse, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    function findWhere(collection, source) {
        return find(collection, baseMatches(source));
    }
    var baseMatches = __webpack_require__(162), find = __webpack_require__(173);
    module.exports = findWhere;
}, function(module, exports, __webpack_require__) {
    function baseMatches(source) {
        var matchData = getMatchData(source);
        if (1 == matchData.length && matchData[0][2]) {
            var key = matchData[0][0], value = matchData[0][1];
            return function(object) {
                return null != object && (object[key] === value && (void 0 !== value || key in toObject(object)));
            };
        }
        return function(object) {
            return baseIsMatch(object, matchData);
        };
    }
    var baseIsMatch = __webpack_require__(163), getMatchData = __webpack_require__(170), toObject = __webpack_require__(33);
    module.exports = baseMatches;
}, function(module, exports, __webpack_require__) {
    function baseIsMatch(object, matchData, customizer) {
        var index = matchData.length, length = index, noCustomizer = !customizer;
        if (null == object) return !length;
        for (object = toObject(object); index--; ) {
            var data = matchData[index];
            if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) return !1;
        }
        for (;++index < length; ) {
            data = matchData[index];
            var key = data[0], objValue = object[key], srcValue = data[1];
            if (noCustomizer && data[2]) {
                if (void 0 === objValue && !(key in object)) return !1;
            } else {
                var result = customizer ? customizer(objValue, srcValue, key) : void 0;
                if (!(void 0 === result ? baseIsEqual(srcValue, objValue, customizer, !0) : result)) return !1;
            }
        }
        return !0;
    }
    var baseIsEqual = __webpack_require__(164), toObject = __webpack_require__(33);
    module.exports = baseIsMatch;
}, function(module, exports, __webpack_require__) {
    function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
        return value === other || (null == value || null == other || !isObject(value) && !isObjectLike(other) ? value !== value && other !== other : baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB));
    }
    var baseIsEqualDeep = __webpack_require__(165), isObject = __webpack_require__(34), isObjectLike = __webpack_require__(41);
    module.exports = baseIsEqual;
}, function(module, exports, __webpack_require__) {
    function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
        objIsArr || (objTag = objToString.call(object), objTag == argsTag ? objTag = objectTag : objTag != objectTag && (objIsArr = isTypedArray(object))), 
        othIsArr || (othTag = objToString.call(other), othTag == argsTag ? othTag = objectTag : othTag != objectTag && (othIsArr = isTypedArray(other)));
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && !objIsArr && !objIsObj) return equalByTag(object, other, objTag);
        if (!isLoose) {
            var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
            if (objIsWrapped || othIsWrapped) return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
        }
        if (!isSameTag) return !1;
        stackA || (stackA = []), stackB || (stackB = []);
        for (var length = stackA.length; length--; ) if (stackA[length] == object) return stackB[length] == other;
        stackA.push(object), stackB.push(other);
        var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
        return stackA.pop(), stackB.pop(), result;
    }
    var equalArrays = __webpack_require__(166), equalByTag = __webpack_require__(168), equalObjects = __webpack_require__(169), isArray = __webpack_require__(37), isTypedArray = __webpack_require__(116), argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]", objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty, objToString = objectProto.toString;
    module.exports = baseIsEqualDeep;
}, function(module, exports, __webpack_require__) {
    function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
        var index = -1, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isLoose && othLength > arrLength)) return !1;
        for (;++index < arrLength; ) {
            var arrValue = array[index], othValue = other[index], result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : void 0;
            if (void 0 !== result) {
                if (result) continue;
                return !1;
            }
            if (isLoose) {
                if (!arraySome(other, function(othValue) {
                    return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
                })) return !1;
            } else if (arrValue !== othValue && !equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB)) return !1;
        }
        return !0;
    }
    var arraySome = __webpack_require__(167);
    module.exports = equalArrays;
}, function(module, exports) {
    function arraySome(array, predicate) {
        for (var index = -1, length = array.length; ++index < length; ) if (predicate(array[index], index, array)) return !0;
        return !1;
    }
    module.exports = arraySome;
}, function(module, exports) {
    function equalByTag(object, other, tag) {
        switch (tag) {
          case boolTag:
          case dateTag:
            return +object == +other;

          case errorTag:
            return object.name == other.name && object.message == other.message;

          case numberTag:
            return object != +object ? other != +other : object == +other;

          case regexpTag:
          case stringTag:
            return object == other + "";
        }
        return !1;
    }
    var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", numberTag = "[object Number]", regexpTag = "[object RegExp]", stringTag = "[object String]";
    module.exports = equalByTag;
}, function(module, exports, __webpack_require__) {
    function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
        var objProps = keys(object), objLength = objProps.length, othProps = keys(other), othLength = othProps.length;
        if (objLength != othLength && !isLoose) return !1;
        for (var index = objLength; index--; ) {
            var key = objProps[index];
            if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) return !1;
        }
        for (var skipCtor = isLoose; ++index < objLength; ) {
            key = objProps[index];
            var objValue = object[key], othValue = other[key], result = customizer ? customizer(isLoose ? othValue : objValue, isLoose ? objValue : othValue, key) : void 0;
            if (!(void 0 === result ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) return !1;
            skipCtor || (skipCtor = "constructor" == key);
        }
        if (!skipCtor) {
            var objCtor = object.constructor, othCtor = other.constructor;
            if (objCtor != othCtor && "constructor" in object && "constructor" in other && !("function" == typeof objCtor && objCtor instanceof objCtor && "function" == typeof othCtor && othCtor instanceof othCtor)) return !1;
        }
        return !0;
    }
    var keys = __webpack_require__(60), objectProto = Object.prototype, hasOwnProperty = objectProto.hasOwnProperty;
    module.exports = equalObjects;
}, function(module, exports, __webpack_require__) {
    function getMatchData(object) {
        for (var result = pairs(object), length = result.length; length--; ) result[length][2] = isStrictComparable(result[length][1]);
        return result;
    }
    var isStrictComparable = __webpack_require__(171), pairs = __webpack_require__(172);
    module.exports = getMatchData;
}, function(module, exports, __webpack_require__) {
    function isStrictComparable(value) {
        return value === value && !isObject(value);
    }
    var isObject = __webpack_require__(34);
    module.exports = isStrictComparable;
}, function(module, exports, __webpack_require__) {
    function pairs(object) {
        object = toObject(object);
        for (var index = -1, props = keys(object), length = props.length, result = Array(length); ++index < length; ) {
            var key = props[index];
            result[index] = [ key, object[key] ];
        }
        return result;
    }
    var keys = __webpack_require__(60), toObject = __webpack_require__(33);
    module.exports = pairs;
}, function(module, exports, __webpack_require__) {
    var baseEach = __webpack_require__(174), createFind = __webpack_require__(177), find = createFind(baseEach);
    module.exports = find;
}, function(module, exports, __webpack_require__) {
    var baseForOwn = __webpack_require__(175), createBaseEach = __webpack_require__(176), baseEach = createBaseEach(baseForOwn);
    module.exports = baseEach;
}, function(module, exports, __webpack_require__) {
    function baseForOwn(object, iteratee) {
        return baseFor(object, iteratee, keys);
    }
    var baseFor = __webpack_require__(114), keys = __webpack_require__(60);
    module.exports = baseForOwn;
}, function(module, exports, __webpack_require__) {
    function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee) {
            var length = collection ? getLength(collection) : 0;
            if (!isLength(length)) return eachFunc(collection, iteratee);
            for (var index = fromRight ? length : -1, iterable = toObject(collection); (fromRight ? index-- : ++index < length) && iteratee(iterable[index], index, iterable) !== !1; ) ;
            return collection;
        };
    }
    var getLength = __webpack_require__(57), isLength = __webpack_require__(42), toObject = __webpack_require__(33);
    module.exports = createBaseEach;
}, function(module, exports, __webpack_require__) {
    function createFind(eachFunc, fromRight) {
        return function(collection, predicate, thisArg) {
            if (predicate = baseCallback(predicate, thisArg, 3), isArray(collection)) {
                var index = baseFindIndex(collection, predicate, fromRight);
                return index > -1 ? collection[index] : void 0;
            }
            return baseFind(collection, predicate, eachFunc);
        };
    }
    var baseCallback = __webpack_require__(178), baseFind = __webpack_require__(185), baseFindIndex = __webpack_require__(186), isArray = __webpack_require__(37);
    module.exports = createFind;
}, function(module, exports, __webpack_require__) {
    function baseCallback(func, thisArg, argCount) {
        var type = typeof func;
        return "function" == type ? void 0 === thisArg ? func : bindCallback(func, thisArg, argCount) : null == func ? identity : "object" == type ? baseMatches(func) : void 0 === thisArg ? property(func) : baseMatchesProperty(func, thisArg);
    }
    var baseMatches = __webpack_require__(162), baseMatchesProperty = __webpack_require__(179), bindCallback = __webpack_require__(120), identity = __webpack_require__(121), property = __webpack_require__(183);
    module.exports = baseCallback;
}, function(module, exports, __webpack_require__) {
    function baseMatchesProperty(path, srcValue) {
        var isArr = isArray(path), isCommon = isKey(path) && isStrictComparable(srcValue), pathKey = path + "";
        return path = toPath(path), function(object) {
            if (null == object) return !1;
            var key = pathKey;
            if (object = toObject(object), (isArr || !isCommon) && !(key in object)) {
                if (object = 1 == path.length ? object : baseGet(object, baseSlice(path, 0, -1)), 
                null == object) return !1;
                key = last(path), object = toObject(object);
            }
            return object[key] === srcValue ? void 0 !== srcValue || key in object : baseIsEqual(srcValue, object[key], void 0, !0);
        };
    }
    var baseGet = __webpack_require__(32), baseIsEqual = __webpack_require__(164), baseSlice = __webpack_require__(180), isArray = __webpack_require__(37), isKey = __webpack_require__(181), isStrictComparable = __webpack_require__(171), last = __webpack_require__(182), toObject = __webpack_require__(33), toPath = __webpack_require__(35);
    module.exports = baseMatchesProperty;
}, function(module, exports) {
    function baseSlice(array, start, end) {
        var index = -1, length = array.length;
        start = null == start ? 0 : +start || 0, start < 0 && (start = -start > length ? 0 : length + start), 
        end = void 0 === end || end > length ? length : +end || 0, end < 0 && (end += length), 
        length = start > end ? 0 : end - start >>> 0, start >>>= 0;
        for (var result = Array(length); ++index < length; ) result[index] = array[index + start];
        return result;
    }
    module.exports = baseSlice;
}, function(module, exports, __webpack_require__) {
    function isKey(value, object) {
        var type = typeof value;
        if ("string" == type && reIsPlainProp.test(value) || "number" == type) return !0;
        if (isArray(value)) return !1;
        var result = !reIsDeepProp.test(value);
        return result || null != object && value in toObject(object);
    }
    var isArray = __webpack_require__(37), toObject = __webpack_require__(33), reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
    module.exports = isKey;
}, function(module, exports) {
    function last(array) {
        var length = array ? array.length : 0;
        return length ? array[length - 1] : void 0;
    }
    module.exports = last;
}, function(module, exports, __webpack_require__) {
    function property(path) {
        return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
    }
    var baseProperty = __webpack_require__(58), basePropertyDeep = __webpack_require__(184), isKey = __webpack_require__(181);
    module.exports = property;
}, function(module, exports, __webpack_require__) {
    function basePropertyDeep(path) {
        var pathKey = path + "";
        return path = toPath(path), function(object) {
            return baseGet(object, path, pathKey);
        };
    }
    var baseGet = __webpack_require__(32), toPath = __webpack_require__(35);
    module.exports = basePropertyDeep;
}, function(module, exports) {
    function baseFind(collection, predicate, eachFunc, retKey) {
        var result;
        return eachFunc(collection, function(value, key, collection) {
            if (predicate(value, key, collection)) return result = retKey ? key : value, !1;
        }), result;
    }
    module.exports = baseFind;
}, function(module, exports) {
    function baseFindIndex(array, predicate, fromRight) {
        for (var length = array.length, index = fromRight ? length : -1; fromRight ? index-- : ++index < length; ) if (predicate(array[index], index, array)) return index;
        return -1;
    }
    module.exports = baseFindIndex;
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    !function(root, factory) {
        "use strict";
        "object" == typeof module && module.exports ? module.exports = factory(__webpack_require__(188), __webpack_require__(190), __webpack_require__(191)) : (__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(188), __webpack_require__(190), __webpack_require__(191) ], 
        __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof __WEBPACK_AMD_DEFINE_FACTORY__ ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, 
        !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)));
    }(this, function(punycode, IPv6, SLD, root) {
        "use strict";
        function URI(url, base) {
            var _urlSupplied = arguments.length >= 1, _baseSupplied = arguments.length >= 2;
            if (!(this instanceof URI)) return _urlSupplied ? _baseSupplied ? new URI(url, base) : new URI(url) : new URI();
            if (void 0 === url) {
                if (_urlSupplied) throw new TypeError("undefined is not a valid argument for URI");
                url = "undefined" != typeof location ? location.href + "" : "";
            }
            if (null === url && _urlSupplied) throw new TypeError("null is not a valid argument for URI");
            return this.href(url), void 0 !== base ? this.absoluteTo(base) : this;
        }
        function isInteger(value) {
            return /^[0-9]+$/.test(value);
        }
        function escapeRegEx(string) {
            return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
        }
        function getType(value) {
            return void 0 === value ? "Undefined" : String(Object.prototype.toString.call(value)).slice(8, -1);
        }
        function isArray(obj) {
            return "Array" === getType(obj);
        }
        function filterArrayValues(data, value) {
            var i, length, lookup = {};
            if ("RegExp" === getType(value)) lookup = null; else if (isArray(value)) for (i = 0, 
            length = value.length; i < length; i++) lookup[value[i]] = !0; else lookup[value] = !0;
            for (i = 0, length = data.length; i < length; i++) {
                var _match = lookup && void 0 !== lookup[data[i]] || !lookup && value.test(data[i]);
                _match && (data.splice(i, 1), length--, i--);
            }
            return data;
        }
        function arrayContains(list, value) {
            var i, length;
            if (isArray(value)) {
                for (i = 0, length = value.length; i < length; i++) if (!arrayContains(list, value[i])) return !1;
                return !0;
            }
            var _type = getType(value);
            for (i = 0, length = list.length; i < length; i++) if ("RegExp" === _type) {
                if ("string" == typeof list[i] && list[i].match(value)) return !0;
            } else if (list[i] === value) return !0;
            return !1;
        }
        function arraysEqual(one, two) {
            if (!isArray(one) || !isArray(two)) return !1;
            if (one.length !== two.length) return !1;
            one.sort(), two.sort();
            for (var i = 0, l = one.length; i < l; i++) if (one[i] !== two[i]) return !1;
            return !0;
        }
        function trimSlashes(text) {
            var trim_expression = /^\/+|\/+$/g;
            return text.replace(trim_expression, "");
        }
        function escapeForDumbFirefox36(value) {
            return escape(value);
        }
        function strictEncodeURIComponent(string) {
            return encodeURIComponent(string).replace(/[!'()*]/g, escapeForDumbFirefox36).replace(/\*/g, "%2A");
        }
        function generateSimpleAccessor(_part) {
            return function(v, build) {
                return void 0 === v ? this._parts[_part] || "" : (this._parts[_part] = v || null, 
                this.build(!build), this);
            };
        }
        function generatePrefixAccessor(_part, _key) {
            return function(v, build) {
                return void 0 === v ? this._parts[_part] || "" : (null !== v && (v += "", v.charAt(0) === _key && (v = v.substring(1))), 
                this._parts[_part] = v, this.build(!build), this);
            };
        }
        var _URI = root && root.URI;
        URI.version = "1.18.12";
        var p = URI.prototype, hasOwn = Object.prototype.hasOwnProperty;
        URI._parts = function() {
            return {
                protocol: null,
                username: null,
                password: null,
                hostname: null,
                urn: null,
                port: null,
                path: null,
                query: null,
                fragment: null,
                duplicateQueryParameters: URI.duplicateQueryParameters,
                escapeQuerySpace: URI.escapeQuerySpace
            };
        }, URI.duplicateQueryParameters = !1, URI.escapeQuerySpace = !0, URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i, 
        URI.idn_expression = /[^a-z0-9\._-]/i, URI.punycode_expression = /(xn--)/i, URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 
        URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/, 
        URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi, 
        URI.findUri = {
            start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
            end: /[\s\r\n]|$/,
            trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/,
            parens: /(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g
        }, URI.defaultPorts = {
            http: "80",
            https: "443",
            ftp: "21",
            gopher: "70",
            ws: "80",
            wss: "443"
        }, URI.hostProtocols = [ "http", "https" ], URI.invalid_hostname_characters = /[^a-zA-Z0-9\.\-:_]/, 
        URI.domAttributes = {
            a: "href",
            blockquote: "cite",
            link: "href",
            base: "href",
            script: "src",
            form: "action",
            img: "src",
            area: "href",
            iframe: "src",
            embed: "src",
            source: "src",
            track: "src",
            input: "src",
            audio: "src",
            video: "src"
        }, URI.getDomAttribute = function(node) {
            if (node && node.nodeName) {
                var nodeName = node.nodeName.toLowerCase();
                if ("input" !== nodeName || "image" === node.type) return URI.domAttributes[nodeName];
            }
        }, URI.encode = strictEncodeURIComponent, URI.decode = decodeURIComponent, URI.iso8859 = function() {
            URI.encode = escape, URI.decode = unescape;
        }, URI.unicode = function() {
            URI.encode = strictEncodeURIComponent, URI.decode = decodeURIComponent;
        }, URI.characters = {
            pathname: {
                encode: {
                    expression: /%(24|26|2B|2C|3B|3D|3A|40)/gi,
                    map: {
                        "%24": "$",
                        "%26": "&",
                        "%2B": "+",
                        "%2C": ",",
                        "%3B": ";",
                        "%3D": "=",
                        "%3A": ":",
                        "%40": "@"
                    }
                },
                decode: {
                    expression: /[\/\?#]/g,
                    map: {
                        "/": "%2F",
                        "?": "%3F",
                        "#": "%23"
                    }
                }
            },
            reserved: {
                encode: {
                    expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/gi,
                    map: {
                        "%3A": ":",
                        "%2F": "/",
                        "%3F": "?",
                        "%23": "#",
                        "%5B": "[",
                        "%5D": "]",
                        "%40": "@",
                        "%21": "!",
                        "%24": "$",
                        "%26": "&",
                        "%27": "'",
                        "%28": "(",
                        "%29": ")",
                        "%2A": "*",
                        "%2B": "+",
                        "%2C": ",",
                        "%3B": ";",
                        "%3D": "="
                    }
                }
            },
            urnpath: {
                encode: {
                    expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/gi,
                    map: {
                        "%21": "!",
                        "%24": "$",
                        "%27": "'",
                        "%28": "(",
                        "%29": ")",
                        "%2A": "*",
                        "%2B": "+",
                        "%2C": ",",
                        "%3B": ";",
                        "%3D": "=",
                        "%40": "@"
                    }
                },
                decode: {
                    expression: /[\/\?#:]/g,
                    map: {
                        "/": "%2F",
                        "?": "%3F",
                        "#": "%23",
                        ":": "%3A"
                    }
                }
            }
        }, URI.encodeQuery = function(string, escapeQuerySpace) {
            var escaped = URI.encode(string + "");
            return void 0 === escapeQuerySpace && (escapeQuerySpace = URI.escapeQuerySpace), 
            escapeQuerySpace ? escaped.replace(/%20/g, "+") : escaped;
        }, URI.decodeQuery = function(string, escapeQuerySpace) {
            string += "", void 0 === escapeQuerySpace && (escapeQuerySpace = URI.escapeQuerySpace);
            try {
                return URI.decode(escapeQuerySpace ? string.replace(/\+/g, "%20") : string);
            } catch (e) {
                return string;
            }
        };
        var _part, _parts = {
            encode: "encode",
            decode: "decode"
        }, generateAccessor = function(_group, _part) {
            return function(string) {
                try {
                    return URI[_part](string + "").replace(URI.characters[_group][_part].expression, function(c) {
                        return URI.characters[_group][_part].map[c];
                    });
                } catch (e) {
                    return string;
                }
            };
        };
        for (_part in _parts) URI[_part + "PathSegment"] = generateAccessor("pathname", _parts[_part]), 
        URI[_part + "UrnPathSegment"] = generateAccessor("urnpath", _parts[_part]);
        var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
            return function(string) {
                var actualCodingFunc;
                actualCodingFunc = _innerCodingFuncName ? function(string) {
                    return URI[_codingFuncName](URI[_innerCodingFuncName](string));
                } : URI[_codingFuncName];
                for (var segments = (string + "").split(_sep), i = 0, length = segments.length; i < length; i++) segments[i] = actualCodingFunc(segments[i]);
                return segments.join(_sep);
            };
        };
        URI.decodePath = generateSegmentedPathFunction("/", "decodePathSegment"), URI.decodeUrnPath = generateSegmentedPathFunction(":", "decodeUrnPathSegment"), 
        URI.recodePath = generateSegmentedPathFunction("/", "encodePathSegment", "decode"), 
        URI.recodeUrnPath = generateSegmentedPathFunction(":", "encodeUrnPathSegment", "decode"), 
        URI.encodeReserved = generateAccessor("reserved", "encode"), URI.parse = function(string, parts) {
            var pos;
            return parts || (parts = {}), pos = string.indexOf("#"), pos > -1 && (parts.fragment = string.substring(pos + 1) || null, 
            string = string.substring(0, pos)), pos = string.indexOf("?"), pos > -1 && (parts.query = string.substring(pos + 1) || null, 
            string = string.substring(0, pos)), "//" === string.substring(0, 2) ? (parts.protocol = null, 
            string = string.substring(2), string = URI.parseAuthority(string, parts)) : (pos = string.indexOf(":"), 
            pos > -1 && (parts.protocol = string.substring(0, pos) || null, parts.protocol && !parts.protocol.match(URI.protocol_expression) ? parts.protocol = void 0 : "//" === string.substring(pos + 1, pos + 3) ? (string = string.substring(pos + 3), 
            string = URI.parseAuthority(string, parts)) : (string = string.substring(pos + 1), 
            parts.urn = !0))), parts.path = string, parts;
        }, URI.parseHost = function(string, parts) {
            string = string.replace(/\\/g, "/");
            var bracketPos, t, pos = string.indexOf("/");
            if (pos === -1 && (pos = string.length), "[" === string.charAt(0)) bracketPos = string.indexOf("]"), 
            parts.hostname = string.substring(1, bracketPos) || null, parts.port = string.substring(bracketPos + 2, pos) || null, 
            "/" === parts.port && (parts.port = null); else {
                var firstColon = string.indexOf(":"), firstSlash = string.indexOf("/"), nextColon = string.indexOf(":", firstColon + 1);
                nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash) ? (parts.hostname = string.substring(0, pos) || null, 
                parts.port = null) : (t = string.substring(0, pos).split(":"), parts.hostname = t[0] || null, 
                parts.port = t[1] || null);
            }
            return parts.hostname && "/" !== string.substring(pos).charAt(0) && (pos++, string = "/" + string), 
            URI.ensureValidHostname(parts.hostname, parts.protocol), parts.port && URI.ensureValidPort(parts.port), 
            string.substring(pos) || "/";
        }, URI.parseAuthority = function(string, parts) {
            return string = URI.parseUserinfo(string, parts), URI.parseHost(string, parts);
        }, URI.parseUserinfo = function(string, parts) {
            var t, firstSlash = string.indexOf("/"), pos = string.lastIndexOf("@", firstSlash > -1 ? firstSlash : string.length - 1);
            return pos > -1 && (firstSlash === -1 || pos < firstSlash) ? (t = string.substring(0, pos).split(":"), 
            parts.username = t[0] ? URI.decode(t[0]) : null, t.shift(), parts.password = t[0] ? URI.decode(t.join(":")) : null, 
            string = string.substring(pos + 1)) : (parts.username = null, parts.password = null), 
            string;
        }, URI.parseQuery = function(string, escapeQuerySpace) {
            if (!string) return {};
            if (string = string.replace(/&+/g, "&").replace(/^\?*&*|&+$/g, ""), !string) return {};
            for (var v, name, value, items = {}, splits = string.split("&"), length = splits.length, i = 0; i < length; i++) v = splits[i].split("="), 
            name = URI.decodeQuery(v.shift(), escapeQuerySpace), value = v.length ? URI.decodeQuery(v.join("="), escapeQuerySpace) : null, 
            hasOwn.call(items, name) ? ("string" != typeof items[name] && null !== items[name] || (items[name] = [ items[name] ]), 
            items[name].push(value)) : items[name] = value;
            return items;
        }, URI.build = function(parts) {
            var t = "";
            return parts.protocol && (t += parts.protocol + ":"), parts.urn || !t && !parts.hostname || (t += "//"), 
            t += URI.buildAuthority(parts) || "", "string" == typeof parts.path && ("/" !== parts.path.charAt(0) && "string" == typeof parts.hostname && (t += "/"), 
            t += parts.path), "string" == typeof parts.query && parts.query && (t += "?" + parts.query), 
            "string" == typeof parts.fragment && parts.fragment && (t += "#" + parts.fragment), 
            t;
        }, URI.buildHost = function(parts) {
            var t = "";
            return parts.hostname ? (t += URI.ip6_expression.test(parts.hostname) ? "[" + parts.hostname + "]" : parts.hostname, 
            parts.port && (t += ":" + parts.port), t) : "";
        }, URI.buildAuthority = function(parts) {
            return URI.buildUserinfo(parts) + URI.buildHost(parts);
        }, URI.buildUserinfo = function(parts) {
            var t = "";
            return parts.username && (t += URI.encode(parts.username)), parts.password && (t += ":" + URI.encode(parts.password)), 
            t && (t += "@"), t;
        }, URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
            var unique, key, i, length, t = "";
            for (key in data) if (hasOwn.call(data, key) && key) if (isArray(data[key])) for (unique = {}, 
            i = 0, length = data[key].length; i < length; i++) void 0 !== data[key][i] && void 0 === unique[data[key][i] + ""] && (t += "&" + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace), 
            duplicateQueryParameters !== !0 && (unique[data[key][i] + ""] = !0)); else void 0 !== data[key] && (t += "&" + URI.buildQueryParameter(key, data[key], escapeQuerySpace));
            return t.substring(1);
        }, URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
            return URI.encodeQuery(name, escapeQuerySpace) + (null !== value ? "=" + URI.encodeQuery(value, escapeQuerySpace) : "");
        }, URI.addQuery = function(data, name, value) {
            if ("object" == typeof name) for (var key in name) hasOwn.call(name, key) && URI.addQuery(data, key, name[key]); else {
                if ("string" != typeof name) throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
                if (void 0 === data[name]) return void (data[name] = value);
                "string" == typeof data[name] && (data[name] = [ data[name] ]), isArray(value) || (value = [ value ]), 
                data[name] = (data[name] || []).concat(value);
            }
        }, URI.removeQuery = function(data, name, value) {
            var i, length, key;
            if (isArray(name)) for (i = 0, length = name.length; i < length; i++) data[name[i]] = void 0; else if ("RegExp" === getType(name)) for (key in data) name.test(key) && (data[key] = void 0); else if ("object" == typeof name) for (key in name) hasOwn.call(name, key) && URI.removeQuery(data, key, name[key]); else {
                if ("string" != typeof name) throw new TypeError("URI.removeQuery() accepts an object, string, RegExp as the first parameter");
                void 0 !== value ? "RegExp" === getType(value) ? !isArray(data[name]) && value.test(data[name]) ? data[name] = void 0 : data[name] = filterArrayValues(data[name], value) : data[name] !== String(value) || isArray(value) && 1 !== value.length ? isArray(data[name]) && (data[name] = filterArrayValues(data[name], value)) : data[name] = void 0 : data[name] = void 0;
            }
        }, URI.hasQuery = function(data, name, value, withinArray) {
            switch (getType(name)) {
              case "String":
                break;

              case "RegExp":
                for (var key in data) if (hasOwn.call(data, key) && name.test(key) && (void 0 === value || URI.hasQuery(data, key, value))) return !0;
                return !1;

              case "Object":
                for (var _key in name) if (hasOwn.call(name, _key) && !URI.hasQuery(data, _key, name[_key])) return !1;
                return !0;

              default:
                throw new TypeError("URI.hasQuery() accepts a string, regular expression or object as the name parameter");
            }
            switch (getType(value)) {
              case "Undefined":
                return name in data;

              case "Boolean":
                var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
                return value === _booly;

              case "Function":
                return !!value(data[name], name, data);

              case "Array":
                if (!isArray(data[name])) return !1;
                var op = withinArray ? arrayContains : arraysEqual;
                return op(data[name], value);

              case "RegExp":
                return isArray(data[name]) ? !!withinArray && arrayContains(data[name], value) : Boolean(data[name] && data[name].match(value));

              case "Number":
                value = String(value);

              case "String":
                return isArray(data[name]) ? !!withinArray && arrayContains(data[name], value) : data[name] === value;

              default:
                throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");
            }
        }, URI.joinPaths = function() {
            for (var input = [], segments = [], nonEmptySegments = 0, i = 0; i < arguments.length; i++) {
                var url = new URI(arguments[i]);
                input.push(url);
                for (var _segments = url.segment(), s = 0; s < _segments.length; s++) "string" == typeof _segments[s] && segments.push(_segments[s]), 
                _segments[s] && nonEmptySegments++;
            }
            if (!segments.length || !nonEmptySegments) return new URI("");
            var uri = new URI("").segment(segments);
            return "" !== input[0].path() && "/" !== input[0].path().slice(0, 1) || uri.path("/" + uri.path()), 
            uri.normalize();
        }, URI.commonPath = function(one, two) {
            var pos, length = Math.min(one.length, two.length);
            for (pos = 0; pos < length; pos++) if (one.charAt(pos) !== two.charAt(pos)) {
                pos--;
                break;
            }
            return pos < 1 ? one.charAt(0) === two.charAt(0) && "/" === one.charAt(0) ? "/" : "" : ("/" === one.charAt(pos) && "/" === two.charAt(pos) || (pos = one.substring(0, pos).lastIndexOf("/")), 
            one.substring(0, pos + 1));
        }, URI.withinString = function(string, callback, options) {
            options || (options = {});
            var _start = options.start || URI.findUri.start, _end = options.end || URI.findUri.end, _trim = options.trim || URI.findUri.trim, _parens = options.parens || URI.findUri.parens, _attributeOpen = /[a-z0-9-]=["']?$/i;
            for (_start.lastIndex = 0; ;) {
                var match = _start.exec(string);
                if (!match) break;
                var start = match.index;
                if (options.ignoreHtml) {
                    var attributeOpen = string.slice(Math.max(start - 3, 0), start);
                    if (attributeOpen && _attributeOpen.test(attributeOpen)) continue;
                }
                for (var end = start + string.slice(start).search(_end), slice = string.slice(start, end), parensEnd = -1; ;) {
                    var parensMatch = _parens.exec(slice);
                    if (!parensMatch) break;
                    var parensMatchEnd = parensMatch.index + parensMatch[0].length;
                    parensEnd = Math.max(parensEnd, parensMatchEnd);
                }
                if (slice = parensEnd > -1 ? slice.slice(0, parensEnd) + slice.slice(parensEnd).replace(_trim, "") : slice.replace(_trim, ""), 
                !(slice.length <= match[0].length || options.ignore && options.ignore.test(slice))) {
                    end = start + slice.length;
                    var result = callback(slice, start, end, string);
                    void 0 !== result ? (result = String(result), string = string.slice(0, start) + result + string.slice(end), 
                    _start.lastIndex = start + result.length) : _start.lastIndex = end;
                }
            }
            return _start.lastIndex = 0, string;
        }, URI.ensureValidHostname = function(v, protocol) {
            var hasHostname = !!v, hasProtocol = !!protocol, rejectEmptyHostname = !1;
            if (hasProtocol && (rejectEmptyHostname = arrayContains(URI.hostProtocols, protocol)), 
            rejectEmptyHostname && !hasHostname) throw new TypeError("Hostname cannot be empty, if protocol is " + protocol);
            if (v && v.match(URI.invalid_hostname_characters)) {
                if (!punycode) throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_] and Punycode.js is not available');
                if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_]');
            }
        }, URI.ensureValidPort = function(v) {
            if (v) {
                var port = Number(v);
                if (!(isInteger(port) && port > 0 && port < 65536)) throw new TypeError('Port "' + v + '" is not a valid port');
            }
        }, URI.noConflict = function(removeAll) {
            if (removeAll) {
                var unconflicted = {
                    URI: this.noConflict()
                };
                return root.URITemplate && "function" == typeof root.URITemplate.noConflict && (unconflicted.URITemplate = root.URITemplate.noConflict()), 
                root.IPv6 && "function" == typeof root.IPv6.noConflict && (unconflicted.IPv6 = root.IPv6.noConflict()), 
                root.SecondLevelDomains && "function" == typeof root.SecondLevelDomains.noConflict && (unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict()), 
                unconflicted;
            }
            return root.URI === this && (root.URI = _URI), this;
        }, p.build = function(deferBuild) {
            return deferBuild === !0 ? this._deferred_build = !0 : (void 0 === deferBuild || this._deferred_build) && (this._string = URI.build(this._parts), 
            this._deferred_build = !1), this;
        }, p.clone = function() {
            return new URI(this);
        }, p.valueOf = p.toString = function() {
            return this.build(!1)._string;
        }, p.protocol = generateSimpleAccessor("protocol"), p.username = generateSimpleAccessor("username"), 
        p.password = generateSimpleAccessor("password"), p.hostname = generateSimpleAccessor("hostname"), 
        p.port = generateSimpleAccessor("port"), p.query = generatePrefixAccessor("query", "?"), 
        p.fragment = generatePrefixAccessor("fragment", "#"), p.search = function(v, build) {
            var t = this.query(v, build);
            return "string" == typeof t && t.length ? "?" + t : t;
        }, p.hash = function(v, build) {
            var t = this.fragment(v, build);
            return "string" == typeof t && t.length ? "#" + t : t;
        }, p.pathname = function(v, build) {
            if (void 0 === v || v === !0) {
                var res = this._parts.path || (this._parts.hostname ? "/" : "");
                return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
            }
            return this._parts.urn ? this._parts.path = v ? URI.recodeUrnPath(v) : "" : this._parts.path = v ? URI.recodePath(v) : "/", 
            this.build(!build), this;
        }, p.path = p.pathname, p.href = function(href, build) {
            var key;
            if (void 0 === href) return this.toString();
            this._string = "", this._parts = URI._parts();
            var _URI = href instanceof URI, _object = "object" == typeof href && (href.hostname || href.path || href.pathname);
            if (href.nodeName) {
                var attribute = URI.getDomAttribute(href);
                href = href[attribute] || "", _object = !1;
            }
            if (!_URI && _object && void 0 !== href.pathname && (href = href.toString()), "string" == typeof href || href instanceof String) this._parts = URI.parse(String(href), this._parts); else {
                if (!_URI && !_object) throw new TypeError("invalid input");
                var src = _URI ? href._parts : href;
                for (key in src) hasOwn.call(this._parts, key) && (this._parts[key] = src[key]);
            }
            return this.build(!build), this;
        }, p.is = function(what) {
            var ip = !1, ip4 = !1, ip6 = !1, name = !1, sld = !1, idn = !1, punycode = !1, relative = !this._parts.urn;
            switch (this._parts.hostname && (relative = !1, ip4 = URI.ip4_expression.test(this._parts.hostname), 
            ip6 = URI.ip6_expression.test(this._parts.hostname), ip = ip4 || ip6, name = !ip, 
            sld = name && SLD && SLD.has(this._parts.hostname), idn = name && URI.idn_expression.test(this._parts.hostname), 
            punycode = name && URI.punycode_expression.test(this._parts.hostname)), what.toLowerCase()) {
              case "relative":
                return relative;

              case "absolute":
                return !relative;

              case "domain":
              case "name":
                return name;

              case "sld":
                return sld;

              case "ip":
                return ip;

              case "ip4":
              case "ipv4":
              case "inet4":
                return ip4;

              case "ip6":
              case "ipv6":
              case "inet6":
                return ip6;

              case "idn":
                return idn;

              case "url":
                return !this._parts.urn;

              case "urn":
                return !!this._parts.urn;

              case "punycode":
                return punycode;
            }
            return null;
        };
        var _protocol = p.protocol, _port = p.port, _hostname = p.hostname;
        p.protocol = function(v, build) {
            if (void 0 !== v && v && (v = v.replace(/:(\/\/)?$/, ""), !v.match(URI.protocol_expression))) throw new TypeError('Protocol "' + v + "\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");
            return _protocol.call(this, v, build);
        }, p.scheme = p.protocol, p.port = function(v, build) {
            return this._parts.urn ? void 0 === v ? "" : this : (void 0 !== v && (0 === v && (v = null), 
            v && (v += "", ":" === v.charAt(0) && (v = v.substring(1)), URI.ensureValidPort(v))), 
            _port.call(this, v, build));
        }, p.hostname = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 !== v) {
                var x = {}, res = URI.parseHost(v, x);
                if ("/" !== res) throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
                v = x.hostname, URI.ensureValidHostname(v, this._parts.protocol);
            }
            return _hostname.call(this, v, build);
        }, p.origin = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v) {
                var protocol = this.protocol(), authority = this.authority();
                return authority ? (protocol ? protocol + "://" : "") + this.authority() : "";
            }
            var origin = URI(v);
            return this.protocol(origin.protocol()).authority(origin.authority()).build(!build), 
            this;
        }, p.host = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v) return this._parts.hostname ? URI.buildHost(this._parts) : "";
            var res = URI.parseHost(v, this._parts);
            if ("/" !== res) throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
            return this.build(!build), this;
        }, p.authority = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v) return this._parts.hostname ? URI.buildAuthority(this._parts) : "";
            var res = URI.parseAuthority(v, this._parts);
            if ("/" !== res) throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
            return this.build(!build), this;
        }, p.userinfo = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v) {
                var t = URI.buildUserinfo(this._parts);
                return t ? t.substring(0, t.length - 1) : t;
            }
            return "@" !== v[v.length - 1] && (v += "@"), URI.parseUserinfo(v, this._parts), 
            this.build(!build), this;
        }, p.resource = function(v, build) {
            var parts;
            return void 0 === v ? this.path() + this.search() + this.hash() : (parts = URI.parse(v), 
            this._parts.path = parts.path, this._parts.query = parts.query, this._parts.fragment = parts.fragment, 
            this.build(!build), this);
        }, p.subdomain = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v) {
                if (!this._parts.hostname || this.is("IP")) return "";
                var end = this._parts.hostname.length - this.domain().length - 1;
                return this._parts.hostname.substring(0, end) || "";
            }
            var e = this._parts.hostname.length - this.domain().length, sub = this._parts.hostname.substring(0, e), replace = new RegExp("^" + escapeRegEx(sub));
            if (v && "." !== v.charAt(v.length - 1) && (v += "."), v.indexOf(":") !== -1) throw new TypeError("Domains cannot contain colons");
            return v && URI.ensureValidHostname(v, this._parts.protocol), this._parts.hostname = this._parts.hostname.replace(replace, v), 
            this.build(!build), this;
        }, p.domain = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if ("boolean" == typeof v && (build = v, v = void 0), void 0 === v) {
                if (!this._parts.hostname || this.is("IP")) return "";
                var t = this._parts.hostname.match(/\./g);
                if (t && t.length < 2) return this._parts.hostname;
                var end = this._parts.hostname.length - this.tld(build).length - 1;
                return end = this._parts.hostname.lastIndexOf(".", end - 1) + 1, this._parts.hostname.substring(end) || "";
            }
            if (!v) throw new TypeError("cannot set domain empty");
            if (v.indexOf(":") !== -1) throw new TypeError("Domains cannot contain colons");
            if (URI.ensureValidHostname(v, this._parts.protocol), !this._parts.hostname || this.is("IP")) this._parts.hostname = v; else {
                var replace = new RegExp(escapeRegEx(this.domain()) + "$");
                this._parts.hostname = this._parts.hostname.replace(replace, v);
            }
            return this.build(!build), this;
        }, p.tld = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if ("boolean" == typeof v && (build = v, v = void 0), void 0 === v) {
                if (!this._parts.hostname || this.is("IP")) return "";
                var pos = this._parts.hostname.lastIndexOf("."), tld = this._parts.hostname.substring(pos + 1);
                return build !== !0 && SLD && SLD.list[tld.toLowerCase()] ? SLD.get(this._parts.hostname) || tld : tld;
            }
            var replace;
            if (!v) throw new TypeError("cannot set TLD empty");
            if (v.match(/[^a-zA-Z0-9-]/)) {
                if (!SLD || !SLD.is(v)) throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
                replace = new RegExp(escapeRegEx(this.tld()) + "$"), this._parts.hostname = this._parts.hostname.replace(replace, v);
            } else {
                if (!this._parts.hostname || this.is("IP")) throw new ReferenceError("cannot set TLD on non-domain host");
                replace = new RegExp(escapeRegEx(this.tld()) + "$"), this._parts.hostname = this._parts.hostname.replace(replace, v);
            }
            return this.build(!build), this;
        }, p.directory = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v || v === !0) {
                if (!this._parts.path && !this._parts.hostname) return "";
                if ("/" === this._parts.path) return "/";
                var end = this._parts.path.length - this.filename().length - 1, res = this._parts.path.substring(0, end) || (this._parts.hostname ? "/" : "");
                return v ? URI.decodePath(res) : res;
            }
            var e = this._parts.path.length - this.filename().length, directory = this._parts.path.substring(0, e), replace = new RegExp("^" + escapeRegEx(directory));
            return this.is("relative") || (v || (v = "/"), "/" !== v.charAt(0) && (v = "/" + v)), 
            v && "/" !== v.charAt(v.length - 1) && (v += "/"), v = URI.recodePath(v), this._parts.path = this._parts.path.replace(replace, v), 
            this.build(!build), this;
        }, p.filename = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if ("string" != typeof v) {
                if (!this._parts.path || "/" === this._parts.path) return "";
                var pos = this._parts.path.lastIndexOf("/"), res = this._parts.path.substring(pos + 1);
                return v ? URI.decodePathSegment(res) : res;
            }
            var mutatedDirectory = !1;
            "/" === v.charAt(0) && (v = v.substring(1)), v.match(/\.?\//) && (mutatedDirectory = !0);
            var replace = new RegExp(escapeRegEx(this.filename()) + "$");
            return v = URI.recodePath(v), this._parts.path = this._parts.path.replace(replace, v), 
            mutatedDirectory ? this.normalizePath(build) : this.build(!build), this;
        }, p.suffix = function(v, build) {
            if (this._parts.urn) return void 0 === v ? "" : this;
            if (void 0 === v || v === !0) {
                if (!this._parts.path || "/" === this._parts.path) return "";
                var s, res, filename = this.filename(), pos = filename.lastIndexOf(".");
                return pos === -1 ? "" : (s = filename.substring(pos + 1), res = /^[a-z0-9%]+$/i.test(s) ? s : "", 
                v ? URI.decodePathSegment(res) : res);
            }
            "." === v.charAt(0) && (v = v.substring(1));
            var replace, suffix = this.suffix();
            if (suffix) replace = v ? new RegExp(escapeRegEx(suffix) + "$") : new RegExp(escapeRegEx("." + suffix) + "$"); else {
                if (!v) return this;
                this._parts.path += "." + URI.recodePath(v);
            }
            return replace && (v = URI.recodePath(v), this._parts.path = this._parts.path.replace(replace, v)), 
            this.build(!build), this;
        }, p.segment = function(segment, v, build) {
            var separator = this._parts.urn ? ":" : "/", path = this.path(), absolute = "/" === path.substring(0, 1), segments = path.split(separator);
            if (void 0 !== segment && "number" != typeof segment && (build = v, v = segment, 
            segment = void 0), void 0 !== segment && "number" != typeof segment) throw new Error('Bad segment "' + segment + '", must be 0-based integer');
            if (absolute && segments.shift(), segment < 0 && (segment = Math.max(segments.length + segment, 0)), 
            void 0 === v) return void 0 === segment ? segments : segments[segment];
            if (null === segment || void 0 === segments[segment]) if (isArray(v)) {
                segments = [];
                for (var i = 0, l = v.length; i < l; i++) (v[i].length || segments.length && segments[segments.length - 1].length) && (segments.length && !segments[segments.length - 1].length && segments.pop(), 
                segments.push(trimSlashes(v[i])));
            } else (v || "string" == typeof v) && (v = trimSlashes(v), "" === segments[segments.length - 1] ? segments[segments.length - 1] = v : segments.push(v)); else v ? segments[segment] = trimSlashes(v) : segments.splice(segment, 1);
            return absolute && segments.unshift(""), this.path(segments.join(separator), build);
        }, p.segmentCoded = function(segment, v, build) {
            var segments, i, l;
            if ("number" != typeof segment && (build = v, v = segment, segment = void 0), void 0 === v) {
                if (segments = this.segment(segment, v, build), isArray(segments)) for (i = 0, l = segments.length; i < l; i++) segments[i] = URI.decode(segments[i]); else segments = void 0 !== segments ? URI.decode(segments) : void 0;
                return segments;
            }
            if (isArray(v)) for (i = 0, l = v.length; i < l; i++) v[i] = URI.encode(v[i]); else v = "string" == typeof v || v instanceof String ? URI.encode(v) : v;
            return this.segment(segment, v, build);
        };
        var q = p.query;
        return p.query = function(v, build) {
            if (v === !0) return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
            if ("function" == typeof v) {
                var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace), result = v.call(this, data);
                return this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), 
                this.build(!build), this;
            }
            return void 0 !== v && "string" != typeof v ? (this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), 
            this.build(!build), this) : q.call(this, v, build);
        }, p.setQuery = function(name, value, build) {
            var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
            if ("string" == typeof name || name instanceof String) data[name] = void 0 !== value ? value : null; else {
                if ("object" != typeof name) throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
                for (var key in name) hasOwn.call(name, key) && (data[key] = name[key]);
            }
            return this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), 
            "string" != typeof name && (build = value), this.build(!build), this;
        }, p.addQuery = function(name, value, build) {
            var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
            return URI.addQuery(data, name, void 0 === value ? null : value), this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), 
            "string" != typeof name && (build = value), this.build(!build), this;
        }, p.removeQuery = function(name, value, build) {
            var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
            return URI.removeQuery(data, name, value), this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace), 
            "string" != typeof name && (build = value), this.build(!build), this;
        }, p.hasQuery = function(name, value, withinArray) {
            var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
            return URI.hasQuery(data, name, value, withinArray);
        }, p.setSearch = p.setQuery, p.addSearch = p.addQuery, p.removeSearch = p.removeQuery, 
        p.hasSearch = p.hasQuery, p.normalize = function() {
            return this._parts.urn ? this.normalizeProtocol(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build() : this.normalizeProtocol(!1).normalizeHostname(!1).normalizePort(!1).normalizePath(!1).normalizeQuery(!1).normalizeFragment(!1).build();
        }, p.normalizeProtocol = function(build) {
            return "string" == typeof this._parts.protocol && (this._parts.protocol = this._parts.protocol.toLowerCase(), 
            this.build(!build)), this;
        }, p.normalizeHostname = function(build) {
            return this._parts.hostname && (this.is("IDN") && punycode ? this._parts.hostname = punycode.toASCII(this._parts.hostname) : this.is("IPv6") && IPv6 && (this._parts.hostname = IPv6.best(this._parts.hostname)), 
            this._parts.hostname = this._parts.hostname.toLowerCase(), this.build(!build)), 
            this;
        }, p.normalizePort = function(build) {
            return "string" == typeof this._parts.protocol && this._parts.port === URI.defaultPorts[this._parts.protocol] && (this._parts.port = null, 
            this.build(!build)), this;
        }, p.normalizePath = function(build) {
            var _path = this._parts.path;
            if (!_path) return this;
            if (this._parts.urn) return this._parts.path = URI.recodeUrnPath(this._parts.path), 
            this.build(!build), this;
            if ("/" === this._parts.path) return this;
            _path = URI.recodePath(_path);
            var _was_relative, _parent, _pos, _leadingParents = "";
            for ("/" !== _path.charAt(0) && (_was_relative = !0, _path = "/" + _path), "/.." !== _path.slice(-3) && "/." !== _path.slice(-2) || (_path += "/"), 
            _path = _path.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/"), _was_relative && (_leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || "", 
            _leadingParents && (_leadingParents = _leadingParents[0])); ;) {
                if (_parent = _path.search(/\/\.\.(\/|$)/), _parent === -1) break;
                0 !== _parent ? (_pos = _path.substring(0, _parent).lastIndexOf("/"), _pos === -1 && (_pos = _parent), 
                _path = _path.substring(0, _pos) + _path.substring(_parent + 3)) : _path = _path.substring(3);
            }
            return _was_relative && this.is("relative") && (_path = _leadingParents + _path.substring(1)), 
            this._parts.path = _path, this.build(!build), this;
        }, p.normalizePathname = p.normalizePath, p.normalizeQuery = function(build) {
            return "string" == typeof this._parts.query && (this._parts.query.length ? this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace)) : this._parts.query = null, 
            this.build(!build)), this;
        }, p.normalizeFragment = function(build) {
            return this._parts.fragment || (this._parts.fragment = null, this.build(!build)), 
            this;
        }, p.normalizeSearch = p.normalizeQuery, p.normalizeHash = p.normalizeFragment, 
        p.iso8859 = function() {
            var e = URI.encode, d = URI.decode;
            URI.encode = escape, URI.decode = decodeURIComponent;
            try {
                this.normalize();
            } finally {
                URI.encode = e, URI.decode = d;
            }
            return this;
        }, p.unicode = function() {
            var e = URI.encode, d = URI.decode;
            URI.encode = strictEncodeURIComponent, URI.decode = unescape;
            try {
                this.normalize();
            } finally {
                URI.encode = e, URI.decode = d;
            }
            return this;
        }, p.readable = function() {
            var uri = this.clone();
            uri.username("").password("").normalize();
            var t = "";
            if (uri._parts.protocol && (t += uri._parts.protocol + "://"), uri._parts.hostname && (uri.is("punycode") && punycode ? (t += punycode.toUnicode(uri._parts.hostname), 
            uri._parts.port && (t += ":" + uri._parts.port)) : t += uri.host()), uri._parts.hostname && uri._parts.path && "/" !== uri._parts.path.charAt(0) && (t += "/"), 
            t += uri.path(!0), uri._parts.query) {
                for (var q = "", i = 0, qp = uri._parts.query.split("&"), l = qp.length; i < l; i++) {
                    var kv = (qp[i] || "").split("=");
                    q += "&" + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace).replace(/&/g, "%26"), 
                    void 0 !== kv[1] && (q += "=" + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace).replace(/&/g, "%26"));
                }
                t += "?" + q.substring(1);
            }
            return t += URI.decodeQuery(uri.hash(), !0);
        }, p.absoluteTo = function(base) {
            var basedir, i, p, resolved = this.clone(), properties = [ "protocol", "username", "password", "hostname", "port" ];
            if (this._parts.urn) throw new Error("URNs do not have any generally defined hierarchical components");
            if (base instanceof URI || (base = new URI(base)), resolved._parts.protocol) return resolved;
            if (resolved._parts.protocol = base._parts.protocol, this._parts.hostname) return resolved;
            for (i = 0; p = properties[i]; i++) resolved._parts[p] = base._parts[p];
            return resolved._parts.path ? (".." === resolved._parts.path.substring(-2) && (resolved._parts.path += "/"), 
            "/" !== resolved.path().charAt(0) && (basedir = base.directory(), basedir = basedir ? basedir : 0 === base.path().indexOf("/") ? "/" : "", 
            resolved._parts.path = (basedir ? basedir + "/" : "") + resolved._parts.path, resolved.normalizePath())) : (resolved._parts.path = base._parts.path, 
            resolved._parts.query || (resolved._parts.query = base._parts.query)), resolved.build(), 
            resolved;
        }, p.relativeTo = function(base) {
            var relativeParts, baseParts, common, relativePath, basePath, relative = this.clone().normalize();
            if (relative._parts.urn) throw new Error("URNs do not have any generally defined hierarchical components");
            if (base = new URI(base).normalize(), relativeParts = relative._parts, baseParts = base._parts, 
            relativePath = relative.path(), basePath = base.path(), "/" !== relativePath.charAt(0)) throw new Error("URI is already relative");
            if ("/" !== basePath.charAt(0)) throw new Error("Cannot calculate a URI relative to another relative URI");
            if (relativeParts.protocol === baseParts.protocol && (relativeParts.protocol = null), 
            relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) return relative.build();
            if (null !== relativeParts.protocol || null !== relativeParts.username || null !== relativeParts.password) return relative.build();
            if (relativeParts.hostname !== baseParts.hostname || relativeParts.port !== baseParts.port) return relative.build();
            if (relativeParts.hostname = null, relativeParts.port = null, relativePath === basePath) return relativeParts.path = "", 
            relative.build();
            if (common = URI.commonPath(relativePath, basePath), !common) return relative.build();
            var parents = baseParts.path.substring(common.length).replace(/[^\/]*$/, "").replace(/.*?\//g, "../");
            return relativeParts.path = parents + relativeParts.path.substring(common.length) || "./", 
            relative.build();
        }, p.equals = function(uri) {
            var one_query, two_query, key, one = this.clone(), two = new URI(uri), one_map = {}, two_map = {}, checked = {};
            if (one.normalize(), two.normalize(), one.toString() === two.toString()) return !0;
            if (one_query = one.query(), two_query = two.query(), one.query(""), two.query(""), 
            one.toString() !== two.toString()) return !1;
            if (one_query.length !== two_query.length) return !1;
            one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace), two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);
            for (key in one_map) if (hasOwn.call(one_map, key)) {
                if (isArray(one_map[key])) {
                    if (!arraysEqual(one_map[key], two_map[key])) return !1;
                } else if (one_map[key] !== two_map[key]) return !1;
                checked[key] = !0;
            }
            for (key in two_map) if (hasOwn.call(two_map, key) && !checked[key]) return !1;
            return !0;
        }, p.duplicateQueryParameters = function(v) {
            return this._parts.duplicateQueryParameters = !!v, this;
        }, p.escapeQuerySpace = function(v) {
            return this._parts.escapeQuerySpace = !!v, this;
        }, URI;
    });
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function(module, global) {
        !function(root) {
            function error(type) {
                throw new RangeError(errors[type]);
            }
            function map(array, fn) {
                for (var length = array.length, result = []; length--; ) result[length] = fn(array[length]);
                return result;
            }
            function mapDomain(string, fn) {
                var parts = string.split("@"), result = "";
                parts.length > 1 && (result = parts[0] + "@", string = parts[1]), string = string.replace(regexSeparators, ".");
                var labels = string.split("."), encoded = map(labels, fn).join(".");
                return result + encoded;
            }
            function ucs2decode(string) {
                for (var value, extra, output = [], counter = 0, length = string.length; counter < length; ) value = string.charCodeAt(counter++), 
                value >= 55296 && value <= 56319 && counter < length ? (extra = string.charCodeAt(counter++), 
                56320 == (64512 & extra) ? output.push(((1023 & value) << 10) + (1023 & extra) + 65536) : (output.push(value), 
                counter--)) : output.push(value);
                return output;
            }
            function ucs2encode(array) {
                return map(array, function(value) {
                    var output = "";
                    return value > 65535 && (value -= 65536, output += stringFromCharCode(value >>> 10 & 1023 | 55296), 
                    value = 56320 | 1023 & value), output += stringFromCharCode(value);
                }).join("");
            }
            function basicToDigit(codePoint) {
                return codePoint - 48 < 10 ? codePoint - 22 : codePoint - 65 < 26 ? codePoint - 65 : codePoint - 97 < 26 ? codePoint - 97 : base;
            }
            function digitToBasic(digit, flag) {
                return digit + 22 + 75 * (digit < 26) - ((0 != flag) << 5);
            }
            function adapt(delta, numPoints, firstTime) {
                var k = 0;
                for (delta = firstTime ? floor(delta / damp) : delta >> 1, delta += floor(delta / numPoints); delta > baseMinusTMin * tMax >> 1; k += base) delta = floor(delta / baseMinusTMin);
                return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
            }
            function decode(input) {
                var out, basic, j, index, oldi, w, k, digit, t, baseMinusT, output = [], inputLength = input.length, i = 0, n = initialN, bias = initialBias;
                for (basic = input.lastIndexOf(delimiter), basic < 0 && (basic = 0), j = 0; j < basic; ++j) input.charCodeAt(j) >= 128 && error("not-basic"), 
                output.push(input.charCodeAt(j));
                for (index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
                    for (oldi = i, w = 1, k = base; index >= inputLength && error("invalid-input"), 
                    digit = basicToDigit(input.charCodeAt(index++)), (digit >= base || digit > floor((maxInt - i) / w)) && error("overflow"), 
                    i += digit * w, t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias, !(digit < t); k += base) baseMinusT = base - t, 
                    w > floor(maxInt / baseMinusT) && error("overflow"), w *= baseMinusT;
                    out = output.length + 1, bias = adapt(i - oldi, out, 0 == oldi), floor(i / out) > maxInt - n && error("overflow"), 
                    n += floor(i / out), i %= out, output.splice(i++, 0, n);
                }
                return ucs2encode(output);
            }
            function encode(input) {
                var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, inputLength, handledCPCountPlusOne, baseMinusT, qMinusT, output = [];
                for (input = ucs2decode(input), inputLength = input.length, n = initialN, delta = 0, 
                bias = initialBias, j = 0; j < inputLength; ++j) currentValue = input[j], currentValue < 128 && output.push(stringFromCharCode(currentValue));
                for (handledCPCount = basicLength = output.length, basicLength && output.push(delimiter); handledCPCount < inputLength; ) {
                    for (m = maxInt, j = 0; j < inputLength; ++j) currentValue = input[j], currentValue >= n && currentValue < m && (m = currentValue);
                    for (handledCPCountPlusOne = handledCPCount + 1, m - n > floor((maxInt - delta) / handledCPCountPlusOne) && error("overflow"), 
                    delta += (m - n) * handledCPCountPlusOne, n = m, j = 0; j < inputLength; ++j) if (currentValue = input[j], 
                    currentValue < n && ++delta > maxInt && error("overflow"), currentValue == n) {
                        for (q = delta, k = base; t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias, 
                        !(q < t); k += base) qMinusT = q - t, baseMinusT = base - t, output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))), 
                        q = floor(qMinusT / baseMinusT);
                        output.push(stringFromCharCode(digitToBasic(q, 0))), bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength), 
                        delta = 0, ++handledCPCount;
                    }
                    ++delta, ++n;
                }
                return output.join("");
            }
            function toUnicode(input) {
                return mapDomain(input, function(string) {
                    return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
                });
            }
            function toASCII(input) {
                return mapDomain(input, function(string) {
                    return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
                });
            }
            var freeGlobal = ("object" == typeof exports && exports && !exports.nodeType && exports, 
            "object" == typeof module && module && !module.nodeType && module, "object" == typeof global && global);
            freeGlobal.global !== freeGlobal && freeGlobal.window !== freeGlobal && freeGlobal.self !== freeGlobal || (root = freeGlobal);
            var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
                overflow: "Overflow: input needs wider integers to process",
                "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                "invalid-input": "Invalid input"
            }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode;
            punycode = {
                version: "1.3.2",
                ucs2: {
                    decode: ucs2decode,
                    encode: ucs2encode
                },
                decode: decode,
                encode: encode,
                toASCII: toASCII,
                toUnicode: toUnicode
            }, __WEBPACK_AMD_DEFINE_RESULT__ = function() {
                return punycode;
            }.call(exports, __webpack_require__, exports, module), !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        }(this);
    }).call(exports, __webpack_require__(189)(module), function() {
        return this;
    }());
}, function(module, exports) {
    module.exports = function(module) {
        return module.webpackPolyfill || (module.deprecate = function() {}, module.paths = [], 
        module.children = [], module.webpackPolyfill = 1), module;
    };
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;
    !function(root, factory) {
        "use strict";
        "object" == typeof module && module.exports ? module.exports = factory() : (__WEBPACK_AMD_DEFINE_FACTORY__ = factory, 
        __WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof __WEBPACK_AMD_DEFINE_FACTORY__ ? __WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module) : __WEBPACK_AMD_DEFINE_FACTORY__, 
        !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)));
    }(this, function(root) {
        "use strict";
        function bestPresentation(address) {
            var _address = address.toLowerCase(), segments = _address.split(":"), length = segments.length, total = 8;
            "" === segments[0] && "" === segments[1] && "" === segments[2] ? (segments.shift(), 
            segments.shift()) : "" === segments[0] && "" === segments[1] ? segments.shift() : "" === segments[length - 1] && "" === segments[length - 2] && segments.pop(), 
            length = segments.length, segments[length - 1].indexOf(".") !== -1 && (total = 7);
            var pos;
            for (pos = 0; pos < length && "" !== segments[pos]; pos++) ;
            if (pos < total) for (segments.splice(pos, 1, "0000"); segments.length < total; ) segments.splice(pos, 0, "0000");
            for (var _segments, i = 0; i < total; i++) {
                _segments = segments[i].split("");
                for (var j = 0; j < 3 && ("0" === _segments[0] && _segments.length > 1); j++) _segments.splice(0, 1);
                segments[i] = _segments.join("");
            }
            var best = -1, _best = 0, _current = 0, current = -1, inzeroes = !1;
            for (i = 0; i < total; i++) inzeroes ? "0" === segments[i] ? _current += 1 : (inzeroes = !1, 
            _current > _best && (best = current, _best = _current)) : "0" === segments[i] && (inzeroes = !0, 
            current = i, _current = 1);
            _current > _best && (best = current, _best = _current), _best > 1 && segments.splice(best, _best, ""), 
            length = segments.length;
            var result = "";
            for ("" === segments[0] && (result = ":"), i = 0; i < length && (result += segments[i], 
            i !== length - 1); i++) result += ":";
            return "" === segments[length - 1] && (result += ":"), result;
        }
        function noConflict() {
            return root.IPv6 === this && (root.IPv6 = _IPv6), this;
        }
        var _IPv6 = root && root.IPv6;
        return {
            best: bestPresentation,
            noConflict: noConflict
        };
    });
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;
    !function(root, factory) {
        "use strict";
        "object" == typeof module && module.exports ? module.exports = factory() : (__WEBPACK_AMD_DEFINE_FACTORY__ = factory, 
        __WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof __WEBPACK_AMD_DEFINE_FACTORY__ ? __WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module) : __WEBPACK_AMD_DEFINE_FACTORY__, 
        !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)));
    }(this, function(root) {
        "use strict";
        var _SecondLevelDomains = root && root.SecondLevelDomains, SLD = {
            list: {
                ac: " com gov mil net org ",
                ae: " ac co gov mil name net org pro sch ",
                af: " com edu gov net org ",
                al: " com edu gov mil net org ",
                ao: " co ed gv it og pb ",
                ar: " com edu gob gov int mil net org tur ",
                at: " ac co gv or ",
                au: " asn com csiro edu gov id net org ",
                ba: " co com edu gov mil net org rs unbi unmo unsa untz unze ",
                bb: " biz co com edu gov info net org store tv ",
                bh: " biz cc com edu gov info net org ",
                bn: " com edu gov net org ",
                bo: " com edu gob gov int mil net org tv ",
                br: " adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ",
                bs: " com edu gov net org ",
                bz: " du et om ov rg ",
                ca: " ab bc mb nb nf nl ns nt nu on pe qc sk yk ",
                ck: " biz co edu gen gov info net org ",
                cn: " ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ",
                co: " com edu gov mil net nom org ",
                cr: " ac c co ed fi go or sa ",
                cy: " ac biz com ekloges gov ltd name net org parliament press pro tm ",
                do: " art com edu gob gov mil net org sld web ",
                dz: " art asso com edu gov net org pol ",
                ec: " com edu fin gov info med mil net org pro ",
                eg: " com edu eun gov mil name net org sci ",
                er: " com edu gov ind mil net org rochest w ",
                es: " com edu gob nom org ",
                et: " biz com edu gov info name net org ",
                fj: " ac biz com info mil name net org pro ",
                fk: " ac co gov net nom org ",
                fr: " asso com f gouv nom prd presse tm ",
                gg: " co net org ",
                gh: " com edu gov mil org ",
                gn: " ac com gov net org ",
                gr: " com edu gov mil net org ",
                gt: " com edu gob ind mil net org ",
                gu: " com edu gov net org ",
                hk: " com edu gov idv net org ",
                hu: " 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ",
                id: " ac co go mil net or sch web ",
                il: " ac co gov idf k12 muni net org ",
                in: " ac co edu ernet firm gen gov i ind mil net nic org res ",
                iq: " com edu gov i mil net org ",
                ir: " ac co dnssec gov i id net org sch ",
                it: " edu gov ",
                je: " co net org ",
                jo: " com edu gov mil name net org sch ",
                jp: " ac ad co ed go gr lg ne or ",
                ke: " ac co go info me mobi ne or sc ",
                kh: " com edu gov mil net org per ",
                ki: " biz com de edu gov info mob net org tel ",
                km: " asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ",
                kn: " edu gov net org ",
                kr: " ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ",
                kw: " com edu gov net org ",
                ky: " com edu gov net org ",
                kz: " com edu gov mil net org ",
                lb: " com edu gov net org ",
                lk: " assn com edu gov grp hotel int ltd net ngo org sch soc web ",
                lr: " com edu gov net org ",
                lv: " asn com conf edu gov id mil net org ",
                ly: " com edu gov id med net org plc sch ",
                ma: " ac co gov m net org press ",
                mc: " asso tm ",
                me: " ac co edu gov its net org priv ",
                mg: " com edu gov mil nom org prd tm ",
                mk: " com edu gov inf name net org pro ",
                ml: " com edu gov net org presse ",
                mn: " edu gov org ",
                mo: " com edu gov net org ",
                mt: " com edu gov net org ",
                mv: " aero biz com coop edu gov info int mil museum name net org pro ",
                mw: " ac co com coop edu gov int museum net org ",
                mx: " com edu gob net org ",
                my: " com edu gov mil name net org sch ",
                nf: " arts com firm info net other per rec store web ",
                ng: " biz com edu gov mil mobi name net org sch ",
                ni: " ac co com edu gob mil net nom org ",
                np: " com edu gov mil net org ",
                nr: " biz com edu gov info net org ",
                om: " ac biz co com edu gov med mil museum net org pro sch ",
                pe: " com edu gob mil net nom org sld ",
                ph: " com edu gov i mil net ngo org ",
                pk: " biz com edu fam gob gok gon gop gos gov net org web ",
                pl: " art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ",
                pr: " ac biz com edu est gov info isla name net org pro prof ",
                ps: " com edu gov net org plo sec ",
                pw: " belau co ed go ne or ",
                ro: " arts com firm info nom nt org rec store tm www ",
                rs: " ac co edu gov in org ",
                sb: " com edu gov net org ",
                sc: " com edu gov net org ",
                sh: " co com edu gov net nom org ",
                sl: " com edu gov net org ",
                st: " co com consulado edu embaixada gov mil net org principe saotome store ",
                sv: " com edu gob org red ",
                sz: " ac co org ",
                tr: " av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ",
                tt: " aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ",
                tw: " club com ebiz edu game gov idv mil net org ",
                mu: " ac co com gov net or org ",
                mz: " ac co edu gov org ",
                na: " co com ",
                nz: " ac co cri geek gen govt health iwi maori mil net org parliament school ",
                pa: " abo ac com edu gob ing med net nom org sld ",
                pt: " com edu gov int net nome org publ ",
                py: " com edu gov mil net org ",
                qa: " com edu gov mil net org ",
                re: " asso com nom ",
                ru: " ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ",
                rw: " ac co com edu gouv gov int mil net ",
                sa: " com edu gov med net org pub sch ",
                sd: " com edu gov info med net org tv ",
                se: " a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ",
                sg: " com edu gov idn net org per ",
                sn: " art com edu gouv org perso univ ",
                sy: " com edu gov mil net news org ",
                th: " ac co go in mi net or ",
                tj: " ac biz co com edu go gov info int mil name net nic org test web ",
                tn: " agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ",
                tz: " ac co go ne or ",
                ua: " biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ",
                ug: " ac co go ne or org sc ",
                uk: " ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ",
                us: " dni fed isa kids nsn ",
                uy: " com edu gub mil net org ",
                ve: " co com edu gob info mil net org web ",
                vi: " co com k12 net org ",
                vn: " ac biz com edu gov health info int name net org pro ",
                ye: " co com gov ltd me net org plc ",
                yu: " ac co edu gov org ",
                za: " ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ",
                zm: " ac co com edu gov net org sch ",
                com: "ar br cn de eu gb gr hu jpn kr no qc ru sa se uk us uy za ",
                net: "gb jp se uk ",
                org: "ae",
                de: "com "
            },
            has: function(domain) {
                var tldOffset = domain.lastIndexOf(".");
                if (tldOffset <= 0 || tldOffset >= domain.length - 1) return !1;
                var sldOffset = domain.lastIndexOf(".", tldOffset - 1);
                if (sldOffset <= 0 || sldOffset >= tldOffset - 1) return !1;
                var sldList = SLD.list[domain.slice(tldOffset + 1)];
                return !!sldList && sldList.indexOf(" " + domain.slice(sldOffset + 1, tldOffset) + " ") >= 0;
            },
            is: function(domain) {
                var tldOffset = domain.lastIndexOf(".");
                if (tldOffset <= 0 || tldOffset >= domain.length - 1) return !1;
                var sldOffset = domain.lastIndexOf(".", tldOffset - 1);
                if (sldOffset >= 0) return !1;
                var sldList = SLD.list[domain.slice(tldOffset + 1)];
                return !!sldList && sldList.indexOf(" " + domain.slice(0, tldOffset) + " ") >= 0;
            },
            get: function(domain) {
                var tldOffset = domain.lastIndexOf(".");
                if (tldOffset <= 0 || tldOffset >= domain.length - 1) return null;
                var sldOffset = domain.lastIndexOf(".", tldOffset - 1);
                if (sldOffset <= 0 || sldOffset >= tldOffset - 1) return null;
                var sldList = SLD.list[domain.slice(tldOffset + 1)];
                return sldList ? sldList.indexOf(" " + domain.slice(sldOffset + 1, tldOffset) + " ") < 0 ? null : domain.slice(sldOffset + 1) : null;
            },
            noConflict: function() {
                return root.SecondLevelDomains === this && (root.SecondLevelDomains = _SecondLevelDomains), 
                this;
            }
        };
        return SLD;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _bannerId = __webpack_require__(193), _bannerId2 = _interopRequireDefault(_bannerId), _gpauto = __webpack_require__(197), _gpauto2 = _interopRequireDefault(_gpauto), _ypCookie = __webpack_require__(198), _ypCookie2 = _interopRequireDefault(_ypCookie), _ypSerializer = __webpack_require__(199), _ypSerializer2 = _interopRequireDefault(_ypSerializer), _ysCookie = __webpack_require__(200), _ysCookie2 = _interopRequireDefault(_ysCookie), _ysSerializer = __webpack_require__(201), _ysSerializer2 = _interopRequireDefault(_ysSerializer);
    exports.default = {
        BannerID: _bannerId2.default,
        LocationWriter: _gpauto2.default,
        YpCookie: _ypCookie2.default,
        YpSerializer: _ypSerializer2.default,
        YsCookie: _ysCookie2.default,
        YsSerializer: _ysSerializer2.default
    }, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _defaults = __webpack_require__(154), _defaults2 = _interopRequireDefault(_defaults), _filter = __webpack_require__(194), _filter2 = _interopRequireDefault(_filter), _find = __webpack_require__(173), _find2 = _interopRequireDefault(_find), DEFAULT_OPTIONS = {
        cookieName: "ys",
        cookiePart: "bnrd"
    }, BannerID = function() {
        function BannerID(options, YsCookie) {
            _classCallCheck(this, BannerID), options = (0, _defaults2.default)(options, DEFAULT_OPTIONS), 
            this._cookieName = options.cookieName, this._cookiePart = options.cookiePart, this._domainsQueue = options.domainsQueue, 
            this._YsCookie = YsCookie;
        }
        return _createClass(BannerID, [ {
            key: "run",
            value: function() {
                var cookies = this._createCookiesForDomains();
                return this._updateBannerId(cookies);
            }
        }, {
            key: "_createCookiesForDomains",
            value: function() {
                var _this = this;
                return this._domainsQueue.map(function(domain) {
                    return new _this._YsCookie(domain);
                });
            }
        }, {
            key: "_updateBannerId",
            value: function(cookies) {
                var _this2 = this;
                return this._getBannerIdValues(cookies).then(function(results) {
                    var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                    try {
                        for (var _step, _loop = function() {
                            var domain = _step.value, data = _this2._findCookieForDomain(domain, results);
                            if (data) return {
                                v: data.cookie.deletePart(_this2._cookiePart).then(function() {
                                    return Promise.resolve(data.bannerId);
                                })
                            };
                        }, _iterator = _this2._domainsQueue[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                            var _ret = _loop();
                            if ("object" === ("undefined" == typeof _ret ? "undefined" : _typeof(_ret))) return _ret.v;
                        }
                    } catch (err) {
                        _didIteratorError = !0, _iteratorError = err;
                    } finally {
                        try {
                            !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                        } finally {
                            if (_didIteratorError) throw _iteratorError;
                        }
                    }
                    return Promise.resolve(null);
                });
            }
        }, {
            key: "_getBannerIdValues",
            value: function(cookies) {
                var _this3 = this, tasks = cookies.map(function(cookie) {
                    return cookie.getValue(_this3._cookiePart).then(function(bannerId) {
                        return {
                            cookie: cookie,
                            bannerId: bannerId
                        };
                    });
                });
                return Promise.all(tasks).then(function(values) {
                    return (0, _filter2.default)(values, "bannerId");
                });
            }
        }, {
            key: "_findCookieForDomain",
            value: function(domain, data) {
                return (0, _find2.default)(data, function(result) {
                    return result.cookie.domain === domain;
                });
            }
        } ]), BannerID;
    }();
    exports.default = BannerID, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    function filter(collection, predicate, thisArg) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return predicate = baseCallback(predicate, thisArg, 3), func(collection, predicate);
    }
    var arrayFilter = __webpack_require__(195), baseCallback = __webpack_require__(178), baseFilter = __webpack_require__(196), isArray = __webpack_require__(37);
    module.exports = filter;
}, function(module, exports) {
    function arrayFilter(array, predicate) {
        for (var index = -1, length = array.length, resIndex = -1, result = []; ++index < length; ) {
            var value = array[index];
            predicate(value, index, array) && (result[++resIndex] = value);
        }
        return result;
    }
    module.exports = arrayFilter;
}, function(module, exports, __webpack_require__) {
    function baseFilter(collection, predicate) {
        var result = [];
        return baseEach(collection, function(value, index, collection) {
            predicate(value, index, collection) && result.push(value);
        }), result;
    }
    var baseEach = __webpack_require__(174);
    module.exports = baseFilter;
}, function(module, exports) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function isValueExpired(value, expirationTime) {
        return Math.abs(Date.now() - value) > expirationTime;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), COOKIE_PART = "gpauto", COOKIE_EXPIRES = 1728e5, POSITION_EXPIRES = 6e5, LocationWriter = function() {
        function LocationWriter(options) {
            _classCallCheck(this, LocationWriter), this._locationParser = options.locationParser, 
            this._cookiePart = options.cookiePart || COOKIE_PART, this._cookieExpires = options.cookieExpires || COOKIE_EXPIRES, 
            this._positionExpires = options.positionExpires || POSITION_EXPIRES;
        }
        return _createClass(LocationWriter, [ {
            key: "updatePosition",
            value: function(position, cookie) {
                var _this = this;
                return this._getPositionData(cookie).then(function(positionData) {
                    var isExpired = _this._isPositionExpired(positionData);
                    return isExpired ? _this._writePosition(position, cookie) : null;
                });
            }
        }, {
            key: "_getPositionData",
            value: function(cookie) {
                var _this2 = this;
                return cookie.getValue(this._cookiePart).then(function(position) {
                    return _this2._parsePosition(position);
                });
            }
        }, {
            key: "_parsePosition",
            value: function(positionData) {
                return positionData && positionData.value ? {
                    value: this._locationParser.parseFromString(positionData.value),
                    expires: positionData.expires
                } : {
                    value: null,
                    expires: null
                };
            }
        }, {
            key: "_isPositionExpired",
            value: function(positionData) {
                var position = positionData.value;
                return !position || (isValueExpired(position.timestamp, this._positionExpires) || isValueExpired(1e3 * positionData.expires, this._cookieExpires));
            }
        }, {
            key: "_writePosition",
            value: function(position, cookie) {
                var expires = this._getCookieExpiresValue(), stringPosition = this._locationParser.parseToString(position);
                return cookie.upsertPart(this._cookiePart, stringPosition, expires);
            }
        }, {
            key: "_getCookieExpiresValue",
            value: function() {
                return Math.round((Date.now() + this._cookieExpires) / 1e3);
            }
        } ]), LocationWriter;
    }();
    exports.default = LocationWriter, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _thenChrome = __webpack_require__(129), _thenChrome2 = _interopRequireDefault(_thenChrome), _find = __webpack_require__(173), _find2 = _interopRequireDefault(_find), _ypSerializer = __webpack_require__(199), _ypSerializer2 = _interopRequireDefault(_ypSerializer), YP_COOKIE_NAME = "yp", YP_COOKIE_PROTOCOL = "https", EXPIRATION_DATE = Math.ceil(new Date(2038, 0).getTime() / 1e3), YpCookie = function() {
        function YpCookie(domain) {
            _classCallCheck(this, YpCookie), this.domain = domain, this.name = YP_COOKIE_NAME, 
            this.protocol = YP_COOKIE_PROTOCOL, this.expirationDate = EXPIRATION_DATE, this._ypSerializer = new _ypSerializer2.default();
        }
        return _createClass(YpCookie, [ {
            key: "getCookie",
            value: function() {
                var params = {
                    domain: this.domain,
                    name: this.name
                };
                return _thenChrome2.default.cookies.getAll(params).then(this._getFirstCookie.bind(this));
            }
        }, {
            key: "addPart",
            value: function(key, value, expires) {
                var _this = this;
                return this.getCookie().then(function(cookie) {
                    var existingValue = cookie ? cookie.value : "", newValue = _this._ypSerializer.addPart(existingValue, key, value, expires);
                    return _this._saveIfChanged(newValue, existingValue, key);
                });
            }
        }, {
            key: "deletePart",
            value: function(key) {
                var _this2 = this;
                return this.getCookie().then(function(cookie) {
                    if (cookie) {
                        var existingValue = cookie.value, newValue = _this2._ypSerializer.deletePart(existingValue, key);
                        return _this2._saveIfChanged(newValue, existingValue, key);
                    }
                    return null;
                });
            }
        }, {
            key: "updatePart",
            value: function(key, value, expires) {
                var _this3 = this;
                return this.getCookie().then(function(cookie) {
                    if (cookie) {
                        var existingValue = cookie.value, newValue = _this3._ypSerializer.updatePart(existingValue, key, value, expires);
                        return _this3._saveIfChanged(newValue, existingValue, key);
                    }
                    return null;
                });
            }
        }, {
            key: "upsertPart",
            value: function(key, value, expires) {
                var _this4 = this;
                return this.getCookie().then(function(cookie) {
                    var existingValue = cookie ? cookie.value : "", newValue = _this4._ypSerializer.upsertPart(existingValue, key, value, expires);
                    return _this4._saveIfChanged(newValue, existingValue, key);
                });
            }
        }, {
            key: "getValue",
            value: function(key) {
                var _this5 = this;
                return this.getCookie().then(function(cookie) {
                    return cookie ? _this5._ypSerializer.getValue(cookie.value, key) : null;
                });
            }
        }, {
            key: "_saveIfChanged",
            value: function(newCookieValue, oldCookieValue, changedPart) {
                return this._ypSerializer.isPartChanged(newCookieValue, oldCookieValue, changedPart) ? this._saveCookie(newCookieValue) : Promise.resolve(newCookieValue);
            }
        }, {
            key: "_saveCookie",
            value: function(cookieValue) {
                return this._setCookie(cookieValue).then(function() {
                    return Promise.resolve(cookieValue);
                });
            }
        }, {
            key: "_getFirstCookie",
            value: function(cookies) {
                return (0, _find2.default)(cookies, function(cookie) {
                    return cookie.hostOnly === !1;
                }) || cookies[0];
            }
        }, {
            key: "_setCookie",
            value: function(cookieValue) {
                return _thenChrome2.default.cookies.set({
                    url: this.protocol + "://" + this.domain.replace(/^\./, "") + "/",
                    domain: this.domain,
                    name: this.name,
                    value: cookieValue,
                    expirationDate: this.expirationDate
                });
            }
        } ]), YpCookie;
    }();
    exports.default = YpCookie, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _slicedToArray = function() {
        function sliceIterator(arr, i) {
            var _arr = [], _n = !0, _d = !1, _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                !i || _arr.length !== i); _n = !0) ;
            } catch (err) {
                _d = !0, _e = err;
            } finally {
                try {
                    !_n && _i.return && _i.return();
                } finally {
                    if (_d) throw _e;
                }
            }
            return _arr;
        }
        return function(arr, i) {
            if (Array.isArray(arr)) return arr;
            if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        };
    }(), _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _defaults = __webpack_require__(154), _defaults2 = _interopRequireDefault(_defaults), DEFAULT_OPTIONS = {
        partsDelimiter: "#",
        keyValueDelimiter: "."
    }, YpSerializer = function() {
        function YpSerializer(options) {
            _classCallCheck(this, YpSerializer), options = (0, _defaults2.default)({}, options, DEFAULT_OPTIONS), 
            this._partsDelimiter = options.partsDelimiter, this._keyValueDelimiter = options.keyValueDelimiter;
        }
        return _createClass(YpSerializer, [ {
            key: "getParts",
            value: function(cookieValue) {
                return cookieValue.split(this._partsDelimiter).filter(Boolean);
            }
        }, {
            key: "addPart",
            value: function(cookieValue, key, value, expires) {
                var data = this.getParts(cookieValue);
                return data.push(this._createPart(key, value, expires)), this._toCookieValue(data);
            }
        }, {
            key: "deletePart",
            value: function(cookieValue, key) {
                var data = this.getParts(cookieValue).filter(function(part) {
                    var _part$split = part.split(this._keyValueDelimiter), _part$split2 = _slicedToArray(_part$split, 2), keyPart = _part$split2[1];
                    return key !== keyPart;
                }, this);
                return this._toCookieValue(data);
            }
        }, {
            key: "updatePart",
            value: function(cookieValue, key, value, expires) {
                var _this = this, data = this.getParts(cookieValue).map(function(part) {
                    var _part$split3 = part.split(_this._keyValueDelimiter), _part$split4 = _slicedToArray(_part$split3, 2), keyPart = _part$split4[1];
                    return keyPart === key ? _this._createPart(keyPart, value, expires) : part;
                });
                return this._toCookieValue(data);
            }
        }, {
            key: "upsertPart",
            value: function(cookieValue, key, value, expires) {
                var existingValue = this.getValue(cookieValue, key);
                return existingValue ? this.updatePart(cookieValue, key, value, expires) : this.addPart(cookieValue, key, value, expires);
            }
        }, {
            key: "getValue",
            value: function(cookieValue, key) {
                var parts = this.getParts(cookieValue), _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                try {
                    for (var _step, _iterator = parts[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                        var cookiePart = _step.value, _cookiePart$split = cookiePart.split(this._keyValueDelimiter), _cookiePart$split2 = _slicedToArray(_cookiePart$split, 3), expiresPart = _cookiePart$split2[0], keyPart = _cookiePart$split2[1], valuePart = _cookiePart$split2[2];
                        if (keyPart === key) return {
                            value: decodeURIComponent(valuePart),
                            expires: parseInt(expiresPart, 10)
                        };
                    }
                } catch (err) {
                    _didIteratorError = !0, _iteratorError = err;
                } finally {
                    try {
                        !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                    } finally {
                        if (_didIteratorError) throw _iteratorError;
                    }
                }
                return null;
            }
        }, {
            key: "isPartChanged",
            value: function(newCookieValue, oldCookieValue, part) {
                var oldValue = this.getValue(oldCookieValue, part), newValue = this.getValue(newCookieValue, part);
                return oldValue && newValue ? oldValue.value !== newValue.value || oldValue.expires !== newValue.expires : oldValue !== newValue;
            }
        }, {
            key: "_createPart",
            value: function(key, value, expires) {
                return [ expires, key, encodeURIComponent(value) ].join(this._keyValueDelimiter);
            }
        }, {
            key: "_toCookieValue",
            value: function(data) {
                return data.join(this._partsDelimiter);
            }
        } ]), YpSerializer;
    }();
    exports.default = YpSerializer, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _thenChrome = __webpack_require__(129), _thenChrome2 = _interopRequireDefault(_thenChrome), _find = __webpack_require__(173), _find2 = _interopRequireDefault(_find), _ysSerializer = __webpack_require__(201), _ysSerializer2 = _interopRequireDefault(_ysSerializer), YS_COOKIE_NAME = "ys", YS_COOKIE_PROTOCOL = "https", YsCookie = function() {
        function YsCookie(domain) {
            _classCallCheck(this, YsCookie), this.domain = domain, this.name = YS_COOKIE_NAME, 
            this.protocol = YS_COOKIE_PROTOCOL, this._ysSerializer = new _ysSerializer2.default();
        }
        return _createClass(YsCookie, [ {
            key: "getCookie",
            value: function() {
                var params = {
                    domain: this.domain,
                    name: this.name
                };
                return _thenChrome2.default.cookies.getAll(params).then(this._getFirstCookie.bind(this));
            }
        }, {
            key: "addPart",
            value: function(key, value) {
                var _this = this;
                return this.getCookie().then(function(cookie) {
                    var existingValue = cookie ? cookie.value : "", newValue = _this._ysSerializer.addPart(existingValue, key, value);
                    return _this._saveIfChanged(newValue, existingValue, key);
                });
            }
        }, {
            key: "deletePart",
            value: function(key) {
                var _this2 = this;
                return this.getCookie().then(function(cookie) {
                    if (cookie) {
                        var existingValue = cookie.value, newValue = _this2._ysSerializer.deletePart(existingValue, key);
                        return _this2._saveIfChanged(newValue, existingValue, key);
                    }
                    return null;
                });
            }
        }, {
            key: "updatePart",
            value: function(key, value) {
                var _this3 = this;
                return this.getCookie().then(function(cookie) {
                    if (cookie) {
                        var existingValue = cookie.value, newValue = _this3._ysSerializer.updatePart(existingValue, key, value);
                        return _this3._saveIfChanged(newValue, existingValue, key);
                    }
                    return null;
                });
            }
        }, {
            key: "upsertPart",
            value: function(key, value) {
                var _this4 = this;
                return this.getCookie().then(function(cookie) {
                    var existingValue = cookie ? cookie.value : "", newValue = _this4._ysSerializer.upsertPart(existingValue, key, value);
                    return _this4._saveIfChanged(newValue, existingValue, key);
                });
            }
        }, {
            key: "getValue",
            value: function(key) {
                var _this5 = this;
                return this.getCookie().then(function(cookie) {
                    return cookie ? _this5._ysSerializer.getValue(cookie.value, key) : null;
                });
            }
        }, {
            key: "_saveIfChanged",
            value: function(newCookieValue, oldCookieValue, changedPart) {
                return this._ysSerializer.isPartChanged(newCookieValue, oldCookieValue, changedPart) ? this._saveCookie(newCookieValue) : Promise.resolve(newCookieValue);
            }
        }, {
            key: "_saveCookie",
            value: function(cookieValue) {
                return this._setCookie(cookieValue).then(function() {
                    return Promise.resolve(cookieValue);
                });
            }
        }, {
            key: "_getFirstCookie",
            value: function(cookies) {
                return (0, _find2.default)(cookies, function(cookie) {
                    return cookie.hostOnly === !1;
                }) || cookies[0];
            }
        }, {
            key: "_setCookie",
            value: function(cookieValue) {
                return _thenChrome2.default.cookies.set({
                    url: this.protocol + "://" + this.domain.replace(/^\./, "") + "/",
                    domain: this.domain,
                    name: this.name,
                    value: cookieValue
                });
            }
        } ]), YsCookie;
    }();
    exports.default = YsCookie, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _slicedToArray = function() {
        function sliceIterator(arr, i) {
            var _arr = [], _n = !0, _d = !1, _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                !i || _arr.length !== i); _n = !0) ;
            } catch (err) {
                _d = !0, _e = err;
            } finally {
                try {
                    !_n && _i.return && _i.return();
                } finally {
                    if (_d) throw _e;
                }
            }
            return _arr;
        }
        return function(arr, i) {
            if (Array.isArray(arr)) return arr;
            if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        };
    }(), _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _defaults = __webpack_require__(154), _defaults2 = _interopRequireDefault(_defaults), DEFAULT_OPTIONS = {
        partsDelimiter: "#",
        keyValueDelimiter: "."
    }, YsSerializer = function() {
        function YsSerializer(options) {
            _classCallCheck(this, YsSerializer), options = (0, _defaults2.default)({}, options, DEFAULT_OPTIONS), 
            this._partsDelimiter = options.partsDelimiter, this._keyValueDelimiter = options.keyValueDelimiter;
        }
        return _createClass(YsSerializer, [ {
            key: "getParts",
            value: function(cookieValue) {
                return cookieValue.split(this._partsDelimiter).filter(Boolean);
            }
        }, {
            key: "addPart",
            value: function(cookieValue, key, value) {
                var data = this.getParts(cookieValue);
                return data.push(this._createPart(key, value)), this._toCookieValue(data);
            }
        }, {
            key: "deletePart",
            value: function(cookieValue, key) {
                var data = this.getParts(cookieValue).filter(function(part) {
                    var _part$split = part.split(this._keyValueDelimiter), _part$split2 = _slicedToArray(_part$split, 1), keyPart = _part$split2[0];
                    return key !== keyPart;
                }, this);
                return this._toCookieValue(data);
            }
        }, {
            key: "updatePart",
            value: function(cookieValue, key, value) {
                var _this = this, data = this.getParts(cookieValue).map(function(part) {
                    var _part$split3 = part.split(_this._keyValueDelimiter), _part$split4 = _slicedToArray(_part$split3, 1), keyPart = _part$split4[0];
                    return keyPart === key ? _this._createPart(keyPart, value) : part;
                });
                return this._toCookieValue(data);
            }
        }, {
            key: "upsertPart",
            value: function(cookieValue, key, value) {
                var existingValue = this.getValue(cookieValue, key);
                return existingValue ? this.updatePart(cookieValue, key, value) : this.addPart(cookieValue, key, value);
            }
        }, {
            key: "getValue",
            value: function(cookieValue, key) {
                var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                try {
                    for (var _step, _iterator = this.getParts(cookieValue)[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                        var cookiePart = _step.value, keyValue = this._parsePart(cookiePart);
                        if (keyValue.key === key) return keyValue.value;
                    }
                } catch (err) {
                    _didIteratorError = !0, _iteratorError = err;
                } finally {
                    try {
                        !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                    } finally {
                        if (_didIteratorError) throw _iteratorError;
                    }
                }
                return null;
            }
        }, {
            key: "getValues",
            value: function(cookieValue) {
                return this.getParts(cookieValue).map(this._parsePart, this);
            }
        }, {
            key: "isPartChanged",
            value: function(newCookieValue, oldCookieValue, part) {
                var oldValue = this.getValue(oldCookieValue, part), newValue = this.getValue(newCookieValue, part);
                return newValue !== oldValue;
            }
        }, {
            key: "_createPart",
            value: function(key, value) {
                return key + this._keyValueDelimiter + encodeURIComponent(value);
            }
        }, {
            key: "_toCookieValue",
            value: function(data) {
                return data.join(this._partsDelimiter);
            }
        }, {
            key: "_parsePart",
            value: function(part) {
                var pos = part.indexOf(this._keyValueDelimiter), key = pos === -1 ? part : part.substr(0, pos), value = pos === -1 ? null : part.substr(pos + 1);
                return {
                    key: key,
                    value: value ? decodeURIComponent(value) : "",
                    source: part
                };
            }
        } ]), YsSerializer;
    }();
    exports.default = YsSerializer, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _experiment = __webpack_require__(203), _experiment2 = _interopRequireDefault(_experiment), _experimentConfig = __webpack_require__(204), _experimentConfig2 = _interopRequireDefault(_experimentConfig), _experimentator = __webpack_require__(205), _experimentator2 = _interopRequireDefault(_experimentator);
    exports.default = {
        Experiment: _experiment2.default,
        ExperimentConfig: _experimentConfig2.default,
        Experimentator: _experimentator2.default
    }, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var Experiment = function Experiment(params) {
        _classCallCheck(this, Experiment), this.name = params.name, this.testId = params.testId, 
        this.bucket = params.bucket, this.data = params.data, this.config = params.config;
    };
    exports.default = Experiment, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function assertConfig(config) {
        if (!config || !isPropsExist(config, REQUIRED_PROPS)) throw new Error("Config must be correct!");
    }
    function isPropsExist(config, props) {
        return props.every(function(propName) {
            return void 0 !== config[propName];
        });
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var ExperimentConfig = function ExperimentConfig(config) {
        _classCallCheck(this, ExperimentConfig), assertConfig(config), this.name = config.name, 
        this.types = config.types, this.percent = config.percent || 100, this.startTime = config.startTime || 0, 
        this.endTime = config.endTime, this.installOnly = config.installOnly;
    };
    exports.default = ExperimentConfig;
    var REQUIRED_PROPS = [ "name", "types", "endTime" ];
    module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function isDisabledByTime(config) {
        var now = Date.now();
        return now < config.startTime || now > config.endTime;
    }
    function chooseExperiment(expTypes) {
        var idList = Object.keys(expTypes), variantsCount = idList.length, testId = idList[Math.floor(Math.random() * variantsCount)];
        return [ testId, expTypes[testId] ];
    }
    function generateBucket() {
        return Math.floor(1 + 100 * Math.random());
    }
    function filterByPercent(configs) {
        var random = getRandomPercent(), upper = 0, _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
        try {
            for (var _step, _iterator = configs[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                var config = _step.value;
                if (upper += config.percent, random <= upper) return [ config ];
            }
        } catch (err) {
            _didIteratorError = !0, _iteratorError = err;
        } finally {
            try {
                !_iteratorNormalCompletion && _iterator.return && _iterator.return();
            } finally {
                if (_didIteratorError) throw _iteratorError;
            }
        }
        return [];
    }
    function isDisabledByRunState(expConfig, isInstall) {
        return expConfig.installOnly && !isInstall;
    }
    function getRandomPercent() {
        return 100 * Math.random();
    }
    function assertPercentSum(configs) {
        var sum = configs.reduce(function(res, config) {
            return res + config.percent;
        }, 0);
        if (sum > 100) throw new Error("Experiments percent sum must be <= 100, you have: " + sum);
    }
    function isExperimentTestIdInConfigs(experiment, configs) {
        return configs.some(function(config) {
            return String(experiment.testId) in config.types;
        });
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _slicedToArray = function() {
        function sliceIterator(arr, i) {
            var _arr = [], _n = !0, _d = !1, _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                !i || _arr.length !== i); _n = !0) ;
            } catch (err) {
                _d = !0, _e = err;
            } finally {
                try {
                    !_n && _i.return && _i.return();
                } finally {
                    if (_d) throw _e;
                }
            }
            return _arr;
        }
        return function(arr, i) {
            if (Array.isArray(arr)) return arr;
            if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        };
    }(), _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _experiment = __webpack_require__(203), _experiment2 = _interopRequireDefault(_experiment), Experimentator = function() {
        function Experimentator() {
            _classCallCheck(this, Experimentator);
        }
        return _createClass(Experimentator, [ {
            key: "createExperiments",
            value: function(experimentConfigs) {
                var existingExperiments = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [], options = arguments[2], actualExistingExperiments = this.getActualExistingExperiments(existingExperiments, experimentConfigs);
                if (actualExistingExperiments.length) return actualExistingExperiments;
                var newExperiment = this.createNewExperiment(experimentConfigs, options);
                return newExperiment ? [ newExperiment ] : [];
            }
        }, {
            key: "createNewExperiment",
            value: function(experimentConfigs, options) {
                var actualExperimentConfigs = experimentConfigs.filter(function(config) {
                    return !isDisabledByRunState(config, options.isInstall);
                }).filter(function(config) {
                    return !isDisabledByTime(config);
                });
                assertPercentSum(actualExperimentConfigs);
                var filtered = filterByPercent(actualExperimentConfigs);
                return filtered.length ? this._createExperiment(filtered[0]) : null;
            }
        }, {
            key: "getActualExistingExperiments",
            value: function(existingExperiments, experimentConfigs) {
                return existingExperiments.filter(function(experiment) {
                    return !isDisabledByTime(experiment.config);
                }).filter(function(experiment) {
                    return isExperimentTestIdInConfigs(experiment, experimentConfigs);
                });
            }
        }, {
            key: "createExperimentInstance",
            value: function(config) {
                return new _experiment2.default(config);
            }
        }, {
            key: "_createExperiment",
            value: function(config) {
                var _chooseExperiment = chooseExperiment(config.types), _chooseExperiment2 = _slicedToArray(_chooseExperiment, 2), testId = _chooseExperiment2[0], testData = _chooseExperiment2[1];
                return this.createExperimentInstance({
                    name: config.name,
                    testId: testId,
                    data: testData,
                    bucket: generateBucket(),
                    config: config
                });
            }
        } ]), Experimentator;
    }();
    exports.default = Experimentator, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _parser = __webpack_require__(207), _parser2 = _interopRequireDefault(_parser), _timer = __webpack_require__(208), _timer2 = _interopRequireDefault(_timer), _watcher = __webpack_require__(210), _watcher2 = _interopRequireDefault(_watcher);
    exports.default = {
        PositionParser: _parser2.default,
        LocationTimer: _timer2.default,
        LocationWatcher: _watcher2.default
    }, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _defaults = __webpack_require__(154), _defaults2 = _interopRequireDefault(_defaults), GEO_DELIMITER = ":", DEFAULT_OPTIONS = {
        deviceId: 3,
        timestampRoundValue: 1e3
    }, PositionParser = function() {
        function PositionParser(options) {
            _classCallCheck(this, PositionParser), options = (0, _defaults2.default)({}, options, DEFAULT_OPTIONS), 
            this._deviceId = options.deviceId, this._timestampRoundValue = options.timestampRoundValue;
        }
        return _createClass(PositionParser, [ {
            key: "parseToString",
            value: function(position) {
                return [ this._numberToString(position.coords.latitude), this._numberToString(position.coords.longitude), this._numberToString(position.coords.accuracy), this._deviceId, Math.round(Date.now() / this._timestampRoundValue) ].join(GEO_DELIMITER);
            }
        }, {
            key: "parseFromString",
            value: function(value) {
                var parts = value.split(GEO_DELIMITER);
                return {
                    coords: {
                        latitude: this._numberFromString(parts[0]),
                        longitude: this._numberFromString(parts[1]),
                        accuracy: this._numberFromString(parts[2])
                    },
                    deviceId: this._numberFromString(parts[3]),
                    timestamp: 1e3 * this._numberFromString(parts[4])
                };
            }
        }, {
            key: "_numberToString",
            value: function(number) {
                return "undefined" != typeof number && null !== number || (number = 0), number.toString().replace(".", "_");
            }
        }, {
            key: "_numberFromString",
            value: function(string) {
                var result = Number(string.replace("_", "."));
                if (!isNaN(result)) return result;
            }
        } ]), PositionParser;
    }();
    exports.default = PositionParser, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), DEFAULT_TIMEOUT = 6e5, LocationTimer = function() {
        function LocationTimer(watcher, timeout) {
            _classCallCheck(this, LocationTimer), this.onChange = new _signals2.default(), this.onError = new _signals2.default(), 
            this._watcher = watcher, this._timeout = timeout || DEFAULT_TIMEOUT, this._position = null, 
            this._intervalId = null;
        }
        return _createClass(LocationTimer, [ {
            key: "start",
            value: function() {
                this.stop(), this._intervalId = setInterval(this._handleIntervalEvent.bind(this), this._timeout), 
                this._startWatcher();
            }
        }, {
            key: "stop",
            value: function() {
                clearInterval(this._intervalId), this._intervalId = null, this._stopWatcher();
            }
        }, {
            key: "_startWatcher",
            value: function() {
                this._watcher.onChange.add(this._handleChangeEvent, this), this._watcher.onError.add(this._handleErrorEvent, this), 
                this._watcher.start();
            }
        }, {
            key: "_stopWatcher",
            value: function() {
                this._watcher.onChange.remove(this._handleChangeEvent, this), this._watcher.onError.remove(this._handleErrorEvent, this), 
                this._watcher.stop();
            }
        }, {
            key: "_handleChangeEvent",
            value: function(position) {
                this._position || this._dispatchChange(position), this._position = position;
            }
        }, {
            key: "_handleErrorEvent",
            value: function(error) {
                this.onError.dispatch(error);
            }
        }, {
            key: "_handleIntervalEvent",
            value: function() {
                this._position && this._dispatchChange(this._position);
            }
        }, {
            key: "_dispatchChange",
            value: function(position) {
                this.onChange.dispatch(position);
            }
        } ]), LocationTimer;
    }();
    exports.default = LocationTimer, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    !function(global) {
        function SignalBinding(signal, listener, isOnce, listenerContext, priority) {
            this._listener = listener, this._isOnce = isOnce, this.context = listenerContext, 
            this._signal = signal, this._priority = priority || 0;
        }
        function validateListener(listener, fnName) {
            if ("function" != typeof listener) throw new Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}", fnName));
        }
        function Signal() {
            this._bindings = [], this._prevParams = null;
            var self = this;
            this.dispatch = function() {
                Signal.prototype.dispatch.apply(self, arguments);
            };
        }
        SignalBinding.prototype = {
            active: !0,
            params: null,
            execute: function(paramsArr) {
                var handlerReturn, params;
                return this.active && this._listener && (params = this.params ? this.params.concat(paramsArr) : paramsArr, 
                handlerReturn = this._listener.apply(this.context, params), this._isOnce && this.detach()), 
                handlerReturn;
            },
            detach: function() {
                return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
            },
            isBound: function() {
                return !!this._signal && !!this._listener;
            },
            isOnce: function() {
                return this._isOnce;
            },
            getListener: function() {
                return this._listener;
            },
            getSignal: function() {
                return this._signal;
            },
            _destroy: function() {
                delete this._signal, delete this._listener, delete this.context;
            },
            toString: function() {
                return "[SignalBinding isOnce:" + this._isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]";
            }
        }, Signal.prototype = {
            VERSION: "1.0.0",
            memorize: !1,
            _shouldPropagate: !0,
            active: !0,
            _registerListener: function(listener, isOnce, listenerContext, priority) {
                var binding, prevIndex = this._indexOfListener(listener, listenerContext);
                if (prevIndex !== -1) {
                    if (binding = this._bindings[prevIndex], binding.isOnce() !== isOnce) throw new Error("You cannot add" + (isOnce ? "" : "Once") + "() then add" + (isOnce ? "Once" : "") + "() the same listener without removing the relationship first.");
                } else binding = new SignalBinding(this, listener, isOnce, listenerContext, priority), 
                this._addBinding(binding);
                return this.memorize && this._prevParams && binding.execute(this._prevParams), binding;
            },
            _addBinding: function(binding) {
                var n = this._bindings.length;
                do --n; while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
                this._bindings.splice(n + 1, 0, binding);
            },
            _indexOfListener: function(listener, context) {
                for (var cur, n = this._bindings.length; n--; ) if (cur = this._bindings[n], cur._listener === listener && cur.context === context) return n;
                return -1;
            },
            has: function(listener, context) {
                return this._indexOfListener(listener, context) !== -1;
            },
            add: function(listener, listenerContext, priority) {
                return validateListener(listener, "add"), this._registerListener(listener, !1, listenerContext, priority);
            },
            addOnce: function(listener, listenerContext, priority) {
                return validateListener(listener, "addOnce"), this._registerListener(listener, !0, listenerContext, priority);
            },
            remove: function(listener, context) {
                validateListener(listener, "remove");
                var i = this._indexOfListener(listener, context);
                return i !== -1 && (this._bindings[i]._destroy(), this._bindings.splice(i, 1)), 
                listener;
            },
            removeAll: function() {
                for (var n = this._bindings.length; n--; ) this._bindings[n]._destroy();
                this._bindings.length = 0;
            },
            getNumListeners: function() {
                return this._bindings.length;
            },
            halt: function() {
                this._shouldPropagate = !1;
            },
            dispatch: function(params) {
                if (this.active) {
                    var bindings, paramsArr = Array.prototype.slice.call(arguments), n = this._bindings.length;
                    if (this.memorize && (this._prevParams = paramsArr), n) {
                        bindings = this._bindings.slice(), this._shouldPropagate = !0;
                        do n--; while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== !1);
                    }
                }
            },
            forget: function() {
                this._prevParams = null;
            },
            dispose: function() {
                this.removeAll(), delete this._bindings, delete this._prevParams;
            },
            toString: function() {
                return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]";
            }
        };
        var signals = Signal;
        signals.Signal = Signal, __WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return signals;
        }.call(exports, __webpack_require__, exports, module), !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }(this);
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), LocationWatcher = function() {
        function LocationWatcher(geolocation, options) {
            _classCallCheck(this, LocationWatcher), this.onChange = new _signals2.default(), 
            this.onError = new _signals2.default(), this._geo = geolocation, this._geoOptions = options || {}, 
            this._watchId = null;
        }
        return _createClass(LocationWatcher, [ {
            key: "start",
            value: function() {
                this._geo ? (this.stop(), this._watchId = this._watchPosition()) : this.onError.dispatch(new Error("Geolocation is not supported"));
            }
        }, {
            key: "stop",
            value: function() {
                this._watchId && (this._geo.clearWatch(this._watchId), this._watchId = null);
            }
        }, {
            key: "_watchPosition",
            value: function() {
                return this._geo.watchPosition(this._handlePositionChangeSuccess.bind(this), this._handlePositionChangeError.bind(this), this._geoOptions);
            }
        }, {
            key: "_handlePositionChangeSuccess",
            value: function(position) {
                position && position.coords && this.onChange.dispatch(position);
            }
        }, {
            key: "_handlePositionChangeError",
            value: function(error) {
                error && this.onError.dispatch(error);
            }
        } ]), LocationWatcher;
    }();
    exports.default = LocationWatcher, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function processParam(subbuffer, param, isLastParam) {
        return subbuffer.hasOwnProperty(param) ? processExistingParam(subbuffer, param, isLastParam) : addParamToSubbuffer(subbuffer, param, isLastParam);
    }
    function addParamToSubbuffer(subbuffer, param, isLastParam) {
        return isLastParam ? subbuffer[param] = 1 : (subbuffer[param] = {}, subbuffer = subbuffer[param]), 
        subbuffer;
    }
    function processExistingParam(subbuffer, param, isLastParam) {
        return isLastParam ? subbuffer[param]++ : subbuffer = subbuffer[param], subbuffer;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _isEmpty = __webpack_require__(54), _isEmpty2 = _interopRequireDefault(_isEmpty), SEND_PAUSE_TIME = 6e4, SLEEP_MODE_DURATION = 500, Metrika = function() {
        function Metrika(metrikaCounter, url, paramsKeysList) {
            _classCallCheck(this, Metrika), this._counter = metrikaCounter, this._url = url, 
            this._paramsKeysList = paramsKeysList, this._pauseTimerId = null, this._buffer = {}, 
            this._sleepMode = !1;
        }
        return _createClass(Metrika, [ {
            key: "send",
            value: function(params) {
                this._sleepMode || (this._saveParamsInBuffer(params), this._pauseTimerId || this._sendBuffer());
            }
        }, {
            key: "_saveParamsInBuffer",
            value: function(params) {
                var _this = this;
                if (this._checkParams(params)) {
                    var currentParamsSubbuffer = this._buffer;
                    this._paramsKeysList.forEach(function(currentParamKey, index) {
                        var currentParam = params[currentParamKey], isLastParam = index === _this._paramsKeysList.length - 1;
                        currentParamsSubbuffer = processParam(currentParamsSubbuffer, currentParam, isLastParam);
                    });
                }
            }
        }, {
            key: "_checkParams",
            value: function(params) {
                return this._paramsKeysList.every(function(paramKey) {
                    return params.hasOwnProperty(paramKey);
                });
            }
        }, {
            key: "_sendBuffer",
            value: function() {
                var _this2 = this;
                (0, _isEmpty2.default)(this._buffer) ? this._pauseTimerId = null : (this._sleepMode = !0, 
                this._counter.hit(this._url, {
                    params: this._buffer
                }), this._buffer = {}, setTimeout(function() {
                    return _this2._awake();
                }, SLEEP_MODE_DURATION), this._pauseTimerId = setTimeout(function() {
                    return _this2._sendBuffer();
                }, SEND_PAUSE_TIME));
            }
        }, {
            key: "_awake",
            value: function() {
                this._sleepMode = !1;
            }
        } ]), Metrika;
    }();
    exports.default = Metrika, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = {
        paramsKeysList: [ "version", "yasoft", "distribution", "branding", "gchid", "message" ],
        create: function(metrika, options) {
            return function(method, prefix, formattedArgs) {
                var metrikaParams = {
                    version: options.version,
                    yasoft: options.yasoft,
                    distribution: options.distribution,
                    branding: options.branding,
                    gchid: options.gchid,
                    message: formattedArgs[0]
                };
                metrika.send(metrikaParams);
            };
        }
    }, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), _manager = __webpack_require__(214), _manager2 = _interopRequireDefault(_manager), _closeReason = __webpack_require__(215), _closeReason2 = _interopRequireDefault(_closeReason), Notification = function() {
        function Notification(options, closeTimeout) {
            _classCallCheck(this, Notification), this.options = options, this.closeTimeout = closeTimeout, 
            this.onClick = new _signals2.default(), this.onTimeout = new _signals2.default(), 
            this.onManualClose = new _signals2.default(), this.onButtonClick = new _signals2.default(), 
            this.notificationId = null;
        }
        return _createClass(Notification, null, [ {
            key: "manager",
            get: function() {
                return Notification._manager || (Notification._manager = new _manager2.default()), 
                Notification._manager;
            }
        } ]), _createClass(Notification, [ {
            key: "create",
            value: function() {
                var _this = this;
                return Notification.manager.create(this.options, this.closeTimeout).then(function(id) {
                    return _this.notificationId = id;
                }).then(function() {
                    return _this._processManagerSignals();
                });
            }
        }, {
            key: "clear",
            value: function() {
                this.onClick.removeAll(), this.onTimeout.removeAll(), this.onManualClose.removeAll(), 
                this.onButtonClick.removeAll();
            }
        }, {
            key: "_processManagerSignals",
            value: function() {
                Notification.manager.onClick.add(this._clickHandler, this), Notification.manager.onButtonClick.add(this._buttonClickHandler, this), 
                Notification.manager.onClose.add(this._closeHandler, this);
            }
        }, {
            key: "_closeHandler",
            value: function(id, reason) {
                this._isMyNotification(id) && (reason === _closeReason2.default.TIMEOUT && this.onTimeout.dispatch(id), 
                reason === _closeReason2.default.MANUAL_CLOSE && this.onManualClose.dispatch(id), 
                this.clear());
            }
        }, {
            key: "_clickHandler",
            value: function(id) {
                this._isMyNotification(id) && (this.onClick.dispatch(id), this.clear());
            }
        }, {
            key: "_buttonClickHandler",
            value: function(id, buttonIndex) {
                this._isMyNotification(id) && (this.onButtonClick.dispatch(id, buttonIndex), this.clear());
            }
        }, {
            key: "_isMyNotification",
            value: function(id) {
                return this.notificationId === id;
            }
        } ]), Notification;
    }();
    exports.default = Notification, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _thenChrome = __webpack_require__(129), _thenChrome2 = _interopRequireDefault(_thenChrome), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), _closeReason = __webpack_require__(215), _closeReason2 = _interopRequireDefault(_closeReason), DEFAULT_CLOSE_TIMEOUT = 8e3, NotificationManager = function() {
        function NotificationManager() {
            _classCallCheck(this, NotificationManager), this.pool = new Map(), this.onClick = new _signals2.default(), 
            this.onClose = new _signals2.default(), this.onButtonClick = new _signals2.default(), 
            this._listenChromeEvents();
        }
        return _createClass(NotificationManager, [ {
            key: "create",
            value: function(options) {
                var _this = this, closeTimeout = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : DEFAULT_CLOSE_TIMEOUT;
                return _thenChrome2.default.notifications.create("", options).then(function(id) {
                    return _this._appendNotification(id, closeTimeout);
                });
            }
        }, {
            key: "clear",
            value: function() {
                return this.pool.forEach(function(value) {
                    return clearTimeout(value);
                }), this.pool.clear(), _thenChrome2.default.notifications.clear();
            }
        }, {
            key: "_appendNotification",
            value: function(id, closeTimeout) {
                var _this2 = this;
                return this.pool.set(id, setTimeout(function() {
                    return _this2._applyTimeout(id);
                }, closeTimeout)), this._listenChromeEvents(), id;
            }
        }, {
            key: "_removeNotification",
            value: function(id) {
                return clearTimeout(this.pool.get(id)), this.pool.delete(id), _thenChrome2.default.notifications.clear(id);
            }
        }, {
            key: "_applyTimeout",
            value: function(id) {
                var _this3 = this;
                return _thenChrome2.default.notifications.getAll().then(function(items) {
                    id in items && (_this3.onClose.dispatch(id, _closeReason2.default.TIMEOUT), _this3._removeNotification(id));
                });
            }
        }, {
            key: "_clickHandler",
            value: function(id) {
                this.onClick.dispatch(id), this._removeNotification(id);
            }
        }, {
            key: "_closeHandler",
            value: function(id) {
                this.onClose.dispatch(id, _closeReason2.default.MANUAL_CLOSE), this._removeNotification(id);
            }
        }, {
            key: "_buttonClickHandler",
            value: function(id, buttonIndex) {
                this.onButtonClick.dispatch(id, buttonIndex), this._removeNotification(id);
            }
        }, {
            key: "_listenChromeEvents",
            value: function() {
                chrome.notifications.onClicked.addListener(this._clickHandler.bind(this)), chrome.notifications.onClosed.addListener(this._closeHandler.bind(this)), 
                chrome.notifications.onButtonClicked.addListener(this._buttonClickHandler.bind(this));
            }
        } ]), NotificationManager;
    }();
    exports.default = NotificationManager, module.exports = exports.default;
}, function(module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.default = {
        CLICK: "reason.click",
        TIMEOUT: "reason.timeout",
        MANUAL_CLOSE: "reason.manual.close"
    }, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function backendWeakSet(backend, key, value) {
        if ((0, _isEqual2.default)(backend.get(key), value)) return Promise.resolve();
        for (var _len5 = arguments.length, args = Array(_len5 > 3 ? _len5 - 3 : 0), _key5 = 3; _key5 < _len5; _key5++) args[_key5 - 3] = arguments[_key5];
        return backendSet.apply(void 0, [ backend, key, value ].concat(args));
    }
    function backendSet(backend, key, value) {
        for (var _len6 = arguments.length, args = Array(_len6 > 3 ? _len6 - 3 : 0), _key6 = 3; _key6 < _len6; _key6++) args[_key6 - 3] = arguments[_key6];
        return promiseCall(function() {
            return backend.set.apply(backend, [ key, value ].concat(args));
        }).catch(function(error) {
            throw error = error || new Error(), error.backend = backend, error;
        });
    }
    function promiseCall(action) {
        try {
            return Promise.resolve(action());
        } catch (error) {
            return Promise.reject(error);
        }
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), _isEqual = __webpack_require__(217), _isEqual2 = _interopRequireDefault(_isEqual), defaultOptions = {
        defaultBackend: "default"
    }, Storage = function() {
        function Storage(options) {
            _classCallCheck(this, Storage), options = Object.assign({}, defaultOptions, options), 
            this._backends = {}, this._routingTable = {}, this._defaultBackendName = options.defaultBackend, 
            this.onChanged = new _signals2.default();
        }
        return _createClass(Storage, [ {
            key: "registerBackend",
            value: function(name, backend) {
                var _this = this;
                this._backends[name] = backend, backend.onInternalChange && backend.onInternalChange.add(function(key, value) {
                    return _this._handleBackendChange(name, key, value);
                });
            }
        }, {
            key: "registerKey",
            value: function(keyName, backendName) {
                var keyBackends = this._routingTable[keyName] || [];
                keyBackends.push(this._backends[backendName]), this._routingTable[keyName] = keyBackends;
            }
        }, {
            key: "fillBackends",
            value: function() {
                var _this2 = this;
                return Promise.all(Object.keys(this._routingTable).map(function(key) {
                    var value = _this2.get(key), backends = _this2._routingTable[key];
                    return Promise.all(backends.map(function(backend) {
                        return backendWeakSet(backend, key, value);
                    }));
                }));
            }
        }, {
            key: "set",
            value: function(key, value) {
                var backends = this._routingTable[key];
                if (backends) {
                    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
                    return this._setForBackends.apply(this, [ backends, key, value ].concat(args));
                }
                return Promise.reject(new Error("No backends for key: " + key));
            }
        }, {
            key: "get",
            value: function(key) {
                var backends = this._routingTable[key];
                if (backends) {
                    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) args[_key2 - 1] = arguments[_key2];
                    var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                    try {
                        for (var _step, _iterator = backends[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                            var backend = _step.value, value = backend.get.apply(backend, [ key ].concat(args));
                            if (void 0 !== value) return value;
                        }
                    } catch (err) {
                        _didIteratorError = !0, _iteratorError = err;
                    } finally {
                        try {
                            !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                        } finally {
                            if (_didIteratorError) throw _iteratorError;
                        }
                    }
                }
            }
        }, {
            key: "getDefault",
            value: function(key) {
                var defaultBackend = this._backends[this._defaultBackendName];
                if (defaultBackend) {
                    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) args[_key3 - 1] = arguments[_key3];
                    return defaultBackend.get.apply(defaultBackend, [ key ].concat(args));
                }
            }
        }, {
            key: "_setForBackends",
            value: function(backends, key, value) {
                for (var _len4 = arguments.length, args = Array(_len4 > 3 ? _len4 - 3 : 0), _key4 = 3; _key4 < _len4; _key4++) args[_key4 - 3] = arguments[_key4];
                var backendsToChange = backends.filter(function(backend) {
                    return !(0, _isEqual2.default)(backend.get(key), value);
                }), promise = Promise.all(backendsToChange.map(function(backend) {
                    return backendSet.apply(void 0, [ backend, key, value ].concat(args));
                }));
                return 0 !== backendsToChange.length && this.onChanged.dispatch(key, value), promise;
            }
        }, {
            key: "_handleBackendChange",
            value: function(backendName, key, value) {
                var changedBackend = this._backends[backendName], backendsForKey = this._routingTable[key];
                backendsForKey && this._setForBackends(backendsForKey.filter(function(backend) {
                    return backend !== changedBackend;
                }), key, value);
            }
        } ]), Storage;
    }();
    exports.default = Storage, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    function isEqual(value, other, customizer, thisArg) {
        customizer = "function" == typeof customizer ? bindCallback(customizer, thisArg, 3) : void 0;
        var result = customizer ? customizer(value, other) : void 0;
        return void 0 === result ? baseIsEqual(value, other, customizer) : !!result;
    }
    var baseIsEqual = __webpack_require__(164), bindCallback = __webpack_require__(120);
    module.exports = isEqual;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function _defineProperty(obj, key, value) {
        return key in obj ? Object.defineProperty(obj, key, {
            value: value,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : obj[key] = value, obj;
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _eventToSignalMap, _slicedToArray = function() {
        function sliceIterator(arr, i) {
            var _arr = [], _n = !0, _d = !1, _e = void 0;
            try {
                for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                !i || _arr.length !== i); _n = !0) ;
            } catch (err) {
                _d = !0, _e = err;
            } finally {
                try {
                    !_n && _i.return && _i.return();
                } finally {
                    if (_d) throw _e;
                }
            }
            return _arr;
        }
        return function(arr, i) {
            if (Array.isArray(arr)) return arr;
            if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        };
    }(), _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), _thenChrome = __webpack_require__(129), _thenChrome2 = _interopRequireDefault(_thenChrome), _tab = __webpack_require__(219), _tab2 = _interopRequireDefault(_tab), _storage = __webpack_require__(225), _storage2 = _interopRequireDefault(_storage), _collection = __webpack_require__(227), _collection2 = _interopRequireDefault(_collection), _navListener = __webpack_require__(228), _navListener2 = _interopRequireDefault(_navListener), _navigation = __webpack_require__(221), eventToSignalMap = (_eventToSignalMap = {}, 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.BEFORE_NAVIGATE, "onBeforeNavigate"), 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.COMMITTED, "onCommitted"), 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.DOM_CONTENT_LOADED, "onDOMContentLoaded"), 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.COMPLETED, "onCompleted"), 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.ERROR_OCCURRED, "onErrorOccurred"), 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.HISTORY_STATE_UPDATED, "onHistoryStatusUpdated"), 
    _defineProperty(_eventToSignalMap, _navigation.NAVIGATION_STATUS.REFERENCE_FRAGMENT_UPDATED, "onReferenceFragmentUpdated"), 
    _eventToSignalMap), TabsWatcher = function() {
        function TabsWatcher() {
            _classCallCheck(this, TabsWatcher), this.storage = new _storage2.default(_collection2.default), 
            this.public = {}, this._createSignals(this), this._createSignals(this.public), this._createNavListener(), 
            this._createTabActionListeners(), this._createWindowActionListeners(), this._readExistingTabs(), 
            this.activeTabId = {}, this.replacedTabs = {}, this.currentWindowId = null;
        }
        return _createClass(TabsWatcher, [ {
            key: "getTabData",
            value: function(tabId) {
                return this.storage.getById(tabId);
            }
        }, {
            key: "_createSignals",
            value: function(scope) {
                scope.onCreated = new _signals2.default(), scope.onUpdated = new _signals2.default(), 
                scope.onActivated = new _signals2.default(), scope.onRemoved = new _signals2.default(), 
                scope.onAttached = new _signals2.default(), scope.onReplaced = new _signals2.default(), 
                scope.onBeforeNavigate = new _signals2.default(), scope.onCommitted = new _signals2.default(), 
                scope.onCompleted = new _signals2.default(), scope.onErrorOccurred = new _signals2.default(), 
                scope.onDOMContentLoaded = new _signals2.default(), scope.onHistoryStateUpdated = new _signals2.default(), 
                scope.onReferenceFragmentUpdated = new _signals2.default();
            }
        }, {
            key: "_createNavListener",
            value: function() {
                this.navListener = new _navListener2.default(), this._updateNavigation = this._updateNavigation.bind(this), 
                this.navListener.onNavigationUpdated.add(this._updateNavigation);
            }
        }, {
            key: "_createTabActionListeners",
            value: function() {
                this._onCreated = this._onCreated.bind(this), this._onRemoved = this._onRemoved.bind(this), 
                this._onUpdated = this._onUpdated.bind(this), this._onActivated = this._onActivated.bind(this), 
                this._onAttached = this._onAttached.bind(this), this._onReplaced = this._onReplaced.bind(this), 
                chrome.tabs.onCreated.addListener(this._onCreated), chrome.tabs.onRemoved.addListener(this._onRemoved), 
                chrome.tabs.onUpdated.addListener(this._onUpdated), chrome.tabs.onActivated.addListener(this._onActivated), 
                chrome.tabs.onAttached.addListener(this._onAttached), chrome.tabs.onReplaced.addListener(this._onReplaced);
            }
        }, {
            key: "_createWindowActionListeners",
            value: function() {
                this._onWindowFocusChanged = this._onWindowFocusChanged.bind(this), chrome.windows.onFocusChanged.addListener(this._onWindowFocusChanged);
            }
        }, {
            key: "_readExistingTabs",
            value: function() {
                var _this = this;
                _thenChrome2.default.windows.getAll({
                    populate: !0
                }).then(function(windows) {
                    return _this._readTabsFromExistingWindows(windows);
                }).then(function(tabs) {
                    return _this._saveTabsToStorage(tabs);
                }).catch(function(error) {
                    throw error;
                });
            }
        }, {
            key: "_readTabsFromExistingWindows",
            value: function(windows) {
                var currentWindow = windows.filter(function(window) {
                    return window.focused;
                })[0];
                return this.currentWindowId = currentWindow ? currentWindow.id : null, windows.reduce(function(res, win) {
                    return res.concat(win.tabs);
                }, []);
            }
        }, {
            key: "_saveTabsToStorage",
            value: function(tabs) {
                var _this2 = this, wrappers = tabs.map(function(tab) {
                    return tab.active && (_this2.activeTabId[tab.windowId] = tab.id), tab.isInCurrentWindow = tab.windowId === _this2.currentWindowId, 
                    new _tab2.default(tab);
                });
                this.storage.update(wrappers);
            }
        }, {
            key: "_updateNavigation",
            value: function(navigation) {
                var _this3 = this, tabId = navigation.tabId;
                _thenChrome2.default.tabs.get(tabId).then(function(data) {
                    var diff = _this3.storage.getDiffObject(tabId, {
                        data: data,
                        navigation: navigation
                    }), tab = _this3.storage.merge(diff);
                    _this3._dispatch(eventToSignalMap[navigation.status], tabId, tab, navigation);
                }).catch(function() {});
            }
        }, {
            key: "_onCreated",
            value: function(tab) {
                tab.navInNewWindow = 0 === this.storage.snapshot(function(_ref) {
                    var data = _ref.data;
                    return data.windowId === tab.windowId;
                }).size, tab.isInCurrentWindow = tab.windowId === this.currentWindowId, tab = new _tab2.default(tab), 
                this.storage.update(tab), this._dispatch("onCreated", tab.id, tab);
            }
        }, {
            key: "_onReplaced",
            value: function(addedTabId, removedTabId) {
                this.storage.remove(removedTabId), this.replacedTabs[addedTabId] = !0;
            }
        }, {
            key: "_onAttached",
            value: function(tabId, _ref2) {
                var newWindowId = _ref2.newWindowId, newPosition = _ref2.newPosition, diff = this.storage.getDiffObject(tabId, {
                    data: {
                        windowId: newWindowId,
                        index: newPosition,
                        isInCurrentWindow: newWindowId === this.currentWindowId
                    }
                }), tab = this.storage.merge(diff);
                this._dispatch("onAttached", tabId, tab, {
                    newWindowId: newWindowId,
                    newPosition: newPosition
                });
            }
        }, {
            key: "_onUpdated",
            value: function(tabId, updateInfo) {
                if (!updateInfo.status) {
                    var diff = this.storage.getDiffObject(tabId, {
                        data: updateInfo
                    }), tab = this.storage.merge(diff);
                    this._dispatch("onUpdated", tabId, tab, updateInfo);
                }
            }
        }, {
            key: "_onActivated",
            value: function(_ref3) {
                var tabId = _ref3.tabId, windowId = _ref3.windowId;
                if (this.replacedTabs[tabId]) this._replaceTab(tabId, windowId); else {
                    var _activateTab2 = this._activateTab(tabId, windowId), _activateTab3 = _slicedToArray(_activateTab2, 2), activatedTab = _activateTab3[0], deactivatedTab = _activateTab3[1];
                    this._dispatch("onActivated", tabId, activatedTab, windowId, deactivatedTab);
                }
            }
        }, {
            key: "_replaceTab",
            value: function(tabId, windowId) {
                var _this4 = this;
                delete this.replacedTabs[tabId], _thenChrome2.default.tabs.get(tabId).then(function(tab) {
                    tab.isInCurrentWindow = windowId === _this4.currentWindowId, _this4.storage.update(new _tab2.default(tab)), 
                    _this4._onActivated({
                        tabId: tabId,
                        windowId: windowId
                    });
                }).catch(function() {});
            }
        }, {
            key: "_activateTab",
            value: function(tabId, windowId) {
                var activeTabId = this.activeTabId[windowId], diffs = [ this.storage.getDiffObject(tabId, {
                    data: {
                        active: !0
                    }
                }) ];
                return this.activeTabId[windowId] = tabId, activeTabId && diffs.push(this.storage.getDiffObject(activeTabId, {
                    data: {
                        active: !1
                    }
                })), this.storage.merge(diffs);
            }
        }, {
            key: "_onRemoved",
            value: function(tabId, removeInfo) {
                var windowId = removeInfo.windowId;
                this.activeTabId[windowId] === tabId && delete this.activeTabId[windowId];
                var removedTab = this.storage.remove(tabId);
                this._dispatch("onRemoved", tabId, removedTab, removeInfo);
            }
        }, {
            key: "_onWindowFocusChanged",
            value: function(windowId) {
                var _this5 = this;
                if (windowId !== chrome.windows.WINDOW_ID_NONE) {
                    var diff = this.storage.snapshot(function(_ref4) {
                        var data = _ref4.data;
                        return data.windowId === windowId || data.windowId === _this5.currentWindowId;
                    }).map(function(_ref5) {
                        var id = _ref5.id, data = _ref5.data;
                        return _this5.storage.getDiffObject(id, {
                            data: {
                                isInCurrentWindow: data.windowId === windowId
                            }
                        });
                    });
                    this.storage.merge(diff), this.currentWindowId = windowId;
                }
            }
        }, {
            key: "_tabsInCurrentWindowQuery",
            value: function(_ref6) {
                var data = _ref6.data;
                return data.windowId === this.currentWindowId;
            }
        }, {
            key: "_dispatch",
            value: function(signalName, tabId, tabData) {
                for (var isIncognito = tabData.data.incognito, _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) args[_key - 3] = arguments[_key];
                if (this[signalName] instanceof _signals2.default) {
                    var _signalName;
                    (_signalName = this[signalName]).dispatch.apply(_signalName, [ tabId, tabData ].concat(args));
                }
                if (!isIncognito && this.public[signalName] instanceof _signals2.default) {
                    var _public$signalName;
                    (_public$signalName = this.public[signalName]).dispatch.apply(_public$signalName, [ tabId, tabData ].concat(args));
                }
            }
        }, {
            key: "destroy",
            value: function() {
                this.storage.clear(), this._removeEventListeners(this), this._removeEventListeners(this.public), 
                chrome.tabs.onCreated.removeListener(this._onCreated), chrome.tabs.onRemoved.removeListener(this._onRemoved), 
                chrome.tabs.onUpdated.removeListener(this._onUpdated), chrome.tabs.onActivated.removeListener(this._onActivated), 
                chrome.tabs.onAttached.removeListener(this._onAttached), chrome.tabs.onReplaced.removeListener(this._onReplaced), 
                this.navListener.onNavigationUpdated.remove(this._updateNavigation), chrome.windows.onFocusChanged.removeListener(this._onWindowFocusChanged);
            }
        }, {
            key: "_removeEventListeners",
            value: function(scope) {
                scope.onCreated.removeAll(), scope.onUpdated.removeAll(), scope.onActivated.removeAll(), 
                scope.onRemoved.removeAll(), scope.onAttached.removeAll(), scope.onBeforeNavigate.removeAll(), 
                scope.onCommitted.removeAll(), scope.onCompleted.removeAll(), scope.onErrorOccurred.removeAll(), 
                scope.onDOMContentLoaded.removeAll(), scope.onHistoryStateUpdated.removeAll(), scope.onReferenceFragmentUpdated.removeAll();
            }
        } ]), TabsWatcher;
    }();
    exports.default = TabsWatcher, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    function _possibleConstructorReturn(self, call) {
        if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !call || "object" != typeof call && "function" != typeof call ? self : call;
    }
    function _inherits(subClass, superClass) {
        if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass);
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _pick = __webpack_require__(220), _pick2 = _interopRequireDefault(_pick), _navigation = __webpack_require__(221), _navigation2 = _interopRequireDefault(_navigation), _model = __webpack_require__(224), _model2 = _interopRequireDefault(_model), _isEmpty = __webpack_require__(54), _isEmpty2 = _interopRequireDefault(_isEmpty), props = [ "id", "windowId", "openerTabId", "active", "isInCurrentWindow", "audible", "mutedInfo", "title", "favIconUrl", "status", "incognito", "sessionId", "url", "navInNewWindow", "navInExistingTab" ], navProps = [ "transitionType", "transitionQualifiers", "url", "status" ], COMPLETE = "complete", LOADING = "loading", COMPLETED = _navigation.NAVIGATION_STATUS.COMPLETED, COMMITTED = _navigation.NAVIGATION_STATUS.COMMITTED, Tab = function(_Model) {
        function Tab(tab, navigation) {
            _classCallCheck(this, Tab);
            var _this = _possibleConstructorReturn(this, (Tab.__proto__ || Object.getPrototypeOf(Tab)).call(this));
            return _this.id = tab.id, _this.data = {
                navInExistingTab: !1
            }, _this.updateData(tab), navigation || (0, _isEmpty2.default)(tab.url) ? _this.navigation = new _navigation2.default(navigation) : _this.navigation = new _navigation2.default({
                url: tab.url,
                status: tab.status === COMPLETE ? COMPLETED : COMMITTED
            }), _this;
        }
        return _inherits(Tab, _Model), _createClass(Tab, [ {
            key: "updateData",
            value: function(tabData) {
                return Object.assign(this.data, (0, _pick2.default)(tabData, props)), this;
            }
        }, {
            key: "merge",
            value: function() {
                var _ref = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, data = _ref.data, navigation = _ref.navigation;
                return data && this.updateData(data), navigation && this.updateNavigation(navigation), 
                this;
            }
        }, {
            key: "updateNavigation",
            value: function(data) {
                var navData = (0, _pick2.default)(data, navProps);
                return this.data.navInExistingTab = !this.navigation.isEmpty, this.navigation.update(navData), 
                this.data.url = navData.url, this.data.status = this.isComplete ? COMPLETE : LOADING, 
                this;
            }
        }, {
            key: "clone",
            value: function() {
                var data = Object.assign({}, this.data);
                return data.mutedInfo = Object.assign({}, data.mutedInfo), new Tab(data, this.navigation);
            }
        }, {
            key: "getId",
            value: function() {
                return this.id;
            }
        }, {
            key: "isComplete",
            get: function() {
                return this.navigation.isFinished;
            }
        }, {
            key: "isCurrent",
            get: function() {
                return this.data.isInCurrentWindow && this.data.active;
            }
        } ]), Tab;
    }(_model2.default);
    exports.default = Tab, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    var baseFlatten = __webpack_require__(143), bindCallback = __webpack_require__(120), pickByArray = __webpack_require__(145), pickByCallback = __webpack_require__(146), restParam = __webpack_require__(76), pick = restParam(function(object, props) {
        return null == object ? {} : "function" == typeof props[0] ? pickByCallback(object, bindCallback(props[0], props[1], 3)) : pickByArray(object, baseFlatten(props));
    });
    module.exports = pick;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    }), exports.NAVIGATION_STATUS = void 0;
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _last = __webpack_require__(182), _last2 = _interopRequireDefault(_last), _uuid = __webpack_require__(222), _uuid2 = _interopRequireDefault(_uuid), NAVIGATION_STATUS = exports.NAVIGATION_STATUS = {
        EMPTY: -1,
        BEFORE_NAVIGATE: 0,
        COMMITTED: 1,
        DOM_CONTENT_LOADED: 2,
        COMPLETED: 3,
        ERROR_OCCURRED: 4,
        HISTORY_STATE_UPDATED: 5,
        REFERENCE_FRAGMENT_UPDATED: 6
    }, EMPTY = NAVIGATION_STATUS.EMPTY, BEFORE_NAVIGATE = NAVIGATION_STATUS.BEFORE_NAVIGATE, COMMITTED = NAVIGATION_STATUS.COMMITTED, DOM_CONTENT_LOADED = NAVIGATION_STATUS.DOM_CONTENT_LOADED, COMPLETED = NAVIGATION_STATUS.COMPLETED, ERROR_OCCURRED = NAVIGATION_STATUS.ERROR_OCCURRED, HISTORY_STATE_UPDATED = NAVIGATION_STATUS.HISTORY_STATE_UPDATED, POSSIBLE_STATUSES = [ BEFORE_NAVIGATE, COMMITTED, COMPLETED, ERROR_OCCURRED ], CLIENT_REDIRECT = "client_redirect", SERVER_REDIRECT = "server_redirect", Navigation = function() {
        function Navigation() {
            var _ref = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, url = _ref.url, _ref$stack = _ref.stack, stack = void 0 === _ref$stack ? [] : _ref$stack, _ref$previousUrl = _ref.previousUrl, previousUrl = void 0 === _ref$previousUrl ? null : _ref$previousUrl, _ref$previousRedirect = _ref.previousRedirectChain, previousRedirectChain = void 0 === _ref$previousRedirect ? [] : _ref$previousRedirect, _ref$redirectChain = _ref.redirectChain, redirectChain = void 0 === _ref$redirectChain ? [] : _ref$redirectChain, _ref$status = _ref.status, status = void 0 === _ref$status ? EMPTY : _ref$status, navigationId = _ref.uuid;
            if (_classCallCheck(this, Navigation), this.stack = stack.concat(), this.status = status, 
            void 0 !== url) this.url = url; else {
                var lastNavigation = (0, _last2.default)(this.stack);
                this.url = lastNavigation ? lastNavigation.url : null;
            }
            this.uuid = navigationId || _uuid2.default.v4(), this.redirectChain = redirectChain, 
            this.previousUrl = previousUrl, this.previousRedirectChain = previousRedirectChain.concat();
        }
        return _createClass(Navigation, [ {
            key: "update",
            value: function(navData) {
                return navData.status === DOM_CONTENT_LOADED && this.url !== navData.url ? this : navData.status === COMPLETED && this.url !== navData.url ? this : (navData.status === BEFORE_NAVIGATE && (this.previousUrl = this.url, 
                this.previousRedirectChain = this.redirectChain.concat(), this.clear(), this.uuid = _uuid2.default.v4()), 
                navData.status === COMMITTED && this._onCommitted(navData), navData.status === HISTORY_STATE_UPDATED && this._onHistoryStateUpdated(), 
                this.stack.push(navData), this._updateStatus(navData), this.url = navData.url, this);
            }
        }, {
            key: "_onHistoryStateUpdated",
            value: function() {
                this.isCompleted || this.redirectChain.push((0, _last2.default)(this.stack).url);
            }
        }, {
            key: "getNavigationStack",
            value: function() {
                return this.redirectChain.concat(this.url);
            }
        }, {
            key: "_onCommitted",
            value: function(navData) {
                var lastNavState = (0, _last2.default)(this.stack);
                if (navData.transitionQualifiers) {
                    if (this._wasClientRedirect(navData)) {
                        var _redirectChain;
                        (_redirectChain = this.redirectChain).push.apply(_redirectChain, _toConsumableArray(this.previousRedirectChain).concat([ this.previousUrl ]));
                    }
                    this._wasServerRedirect(navData) && this.redirectChain.push(lastNavState.url);
                }
                lastNavState && lastNavState.status === BEFORE_NAVIGATE || (this.previousUrl = this.url, 
                this.previousRedirectChain = this.redirectChain.concat(), this.clear(), this.uuid = _uuid2.default.v4());
            }
        }, {
            key: "_wasClientRedirect",
            value: function(navData) {
                return navData.transitionQualifiers.indexOf(CLIENT_REDIRECT) !== -1;
            }
        }, {
            key: "_wasServerRedirect",
            value: function(navData) {
                return navData.transitionQualifiers.indexOf(SERVER_REDIRECT) !== -1;
            }
        }, {
            key: "clear",
            value: function() {
                return this.url = null, this.stack.length = 0, this.redirectChain.length = 0, this.uuid = _uuid2.default.v4(), 
                this;
            }
        }, {
            key: "_updateStatus",
            value: function(_ref2) {
                var status = _ref2.status;
                POSSIBLE_STATUSES.indexOf(status) !== -1 && (this.status = status);
            }
        }, {
            key: "isEmpty",
            get: function() {
                return this.status === EMPTY;
            }
        }, {
            key: "isStarted",
            get: function() {
                return this.status === BEFORE_NAVIGATE;
            }
        }, {
            key: "isCompleted",
            get: function() {
                return this.status === COMPLETED;
            }
        }, {
            key: "isFinished",
            get: function() {
                return this.isCompleted || this.isError;
            }
        }, {
            key: "isError",
            get: function() {
                return this.status === ERROR_OCCURRED;
            }
        } ]), Navigation;
    }();
    exports.default = Navigation;
}, function(module, exports, __webpack_require__) {
    function parse(s, buf, offset) {
        var i = buf && offset || 0, ii = 0;
        for (buf = buf || [], s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
            ii < 16 && (buf[i + ii++] = _hexToByte[oct]);
        }); ii < 16; ) buf[i + ii++] = 0;
        return buf;
    }
    function unparse(buf, offset) {
        var i = offset || 0, bth = _byteToHex;
        return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
    }
    function v1(options, buf, offset) {
        var i = buf && offset || 0, b = buf || [];
        options = options || {};
        var clockseq = void 0 !== options.clockseq ? options.clockseq : _clockseq, msecs = void 0 !== options.msecs ? options.msecs : new Date().getTime(), nsecs = void 0 !== options.nsecs ? options.nsecs : _lastNSecs + 1, dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
        if (dt < 0 && void 0 === options.clockseq && (clockseq = clockseq + 1 & 16383), 
        (dt < 0 || msecs > _lastMSecs) && void 0 === options.nsecs && (nsecs = 0), nsecs >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
        _lastMSecs = msecs, _lastNSecs = nsecs, _clockseq = clockseq, msecs += 122192928e5;
        var tl = (1e4 * (268435455 & msecs) + nsecs) % 4294967296;
        b[i++] = tl >>> 24 & 255, b[i++] = tl >>> 16 & 255, b[i++] = tl >>> 8 & 255, b[i++] = 255 & tl;
        var tmh = msecs / 4294967296 * 1e4 & 268435455;
        b[i++] = tmh >>> 8 & 255, b[i++] = 255 & tmh, b[i++] = tmh >>> 24 & 15 | 16, b[i++] = tmh >>> 16 & 255, 
        b[i++] = clockseq >>> 8 | 128, b[i++] = 255 & clockseq;
        for (var node = options.node || _nodeId, n = 0; n < 6; n++) b[i + n] = node[n];
        return buf ? buf : unparse(b);
    }
    function v4(options, buf, offset) {
        var i = buf && offset || 0;
        "string" == typeof options && (buf = "binary" == options ? new Array(16) : null, 
        options = null), options = options || {};
        var rnds = options.random || (options.rng || _rng)();
        if (rnds[6] = 15 & rnds[6] | 64, rnds[8] = 63 & rnds[8] | 128, buf) for (var ii = 0; ii < 16; ii++) buf[i + ii] = rnds[ii];
        return buf || unparse(rnds);
    }
    for (var _rng = __webpack_require__(223), _byteToHex = [], _hexToByte = {}, i = 0; i < 256; i++) _byteToHex[i] = (i + 256).toString(16).substr(1), 
    _hexToByte[_byteToHex[i]] = i;
    var _seedBytes = _rng(), _nodeId = [ 1 | _seedBytes[0], _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5] ], _clockseq = 16383 & (_seedBytes[6] << 8 | _seedBytes[7]), _lastMSecs = 0, _lastNSecs = 0, uuid = v4;
    uuid.v1 = v1, uuid.v4 = v4, uuid.parse = parse, uuid.unparse = unparse, module.exports = uuid;
}, function(module, exports) {
    (function(global) {
        var rng, crypto = global.crypto || global.msCrypto;
        if (crypto && crypto.getRandomValues) {
            var _rnds8 = new Uint8Array(16);
            rng = function() {
                return crypto.getRandomValues(_rnds8), _rnds8;
            };
        }
        if (!rng) {
            var _rnds = new Array(16);
            rng = function() {
                for (var r, i = 0; i < 16; i++) 0 === (3 & i) && (r = 4294967296 * Math.random()), 
                _rnds[i] = r >>> ((3 & i) << 3) & 255;
                return _rnds;
            };
        }
        module.exports = rng;
    }).call(exports, function() {
        return this;
    }());
}, function(module, exports) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), Model = function() {
        function Model() {
            _classCallCheck(this, Model), this.removed = !1;
        }
        return _createClass(Model, [ {
            key: "getId",
            value: function() {
                throw new Error("Not implemented");
            }
        }, {
            key: "merge",
            value: function() {
                throw new Error("Not implemented");
            }
        }, {
            key: "clone",
            value: function() {
                throw new Error("Not implemented");
            }
        } ]), Model;
    }();
    exports.default = Model, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _lodash = __webpack_require__(226), _lodash2 = _interopRequireDefault(_lodash), Storage = function() {
        function Storage(CollectionConstructor) {
            _classCallCheck(this, Storage), this.cache = new Map(), this.collections = [], this.collectionConstructor = CollectionConstructor;
        }
        return _createClass(Storage, [ {
            key: "query",
            value: function(_query) {
                var collection = this._collectionFactory(_query);
                return this.collections.push(collection), collection;
            }
        }, {
            key: "snapshot",
            value: function(query) {
                return this._collectionFactory(query);
            }
        }, {
            key: "_collectionFactory",
            value: function(query) {
                var collection = new this.collectionConstructor(this, query);
                return collection.update(this.cache.values()), collection;
            }
        }, {
            key: "getById",
            value: function(id) {
                return this.cache.has(id) ? this.cache.get(id).clone() : null;
            }
        }, {
            key: "update",
            value: function() {
                var _this = this, items = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                return Array.isArray(items) || (items = [ items ]), items.forEach(function(item) {
                    _this.cache.set(item.getId(), item);
                }), this._updateCollections(items), this;
            }
        }, {
            key: "merge",
            value: function() {
                var _this2 = this, dataDiff = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], isArray = !0;
                Array.isArray(dataDiff) || (dataDiff = [ dataDiff ], isArray = !1);
                var items = (0, _lodash2.default)(dataDiff).filter(function(_ref) {
                    var id = _ref.id;
                    return _this2.cache.has(id);
                }).map(function(_ref2) {
                    var id = _ref2.id, diff = _ref2.diff, item = _this2.cache.get(id).clone().merge(diff);
                    return _this2.cache.set(id, item), item;
                }).value();
                return this._updateCollections(items), isArray ? items : items[0] || null;
            }
        }, {
            key: "getDiffObject",
            value: function(id, data) {
                return {
                    id: id,
                    diff: data
                };
            }
        }, {
            key: "remove",
            value: function() {
                var _this3 = this, ids = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], isArray = !0;
                Array.isArray(ids) || (ids = [ ids ], isArray = !1);
                var items = (0, _lodash2.default)(ids).filter(function(id) {
                    return _this3.cache.has(id);
                }).map(function(id) {
                    var item = _this3.cache.get(id);
                    return item.removed = !0, _this3.cache.delete(id), item;
                }).value();
                return this._updateCollections(ids, "remove"), isArray ? items : items[0];
            }
        }, {
            key: "activateCollection",
            value: function(collection) {
                return this.collections.indexOf(collection) === -1 && this.collections.push(collection), 
                this.reloadCollection(collection);
            }
        }, {
            key: "reloadCollection",
            value: function(collection) {
                return collection.enabled ? (collection.update(this.cache.values()), collection) : collection;
            }
        }, {
            key: "removeCollection",
            value: function(collection) {
                var indexOfCollection = this.collections.indexOf(collection);
                indexOfCollection !== -1 && this.collections.splice(indexOfCollection, 1);
            }
        }, {
            key: "_updateCollections",
            value: function(items) {
                var method = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "update";
                this.collections.forEach(function(collection) {
                    collection.enabled && collection[method](items);
                });
            }
        }, {
            key: "clear",
            value: function() {
                this.collections.length = 0, this.cache.clear();
            }
        } ]), Storage;
    }();
    exports.default = Storage, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function(module, global) {
        (function() {
            function baseCompareAscending(value, other) {
                if (value !== other) {
                    var valIsNull = null === value, valIsUndef = value === undefined, valIsReflexive = value === value, othIsNull = null === other, othIsUndef = other === undefined, othIsReflexive = other === other;
                    if (value > other && !othIsNull || !valIsReflexive || valIsNull && !othIsUndef && othIsReflexive || valIsUndef && othIsReflexive) return 1;
                    if (value < other && !valIsNull || !othIsReflexive || othIsNull && !valIsUndef && valIsReflexive || othIsUndef && valIsReflexive) return -1;
                }
                return 0;
            }
            function baseFindIndex(array, predicate, fromRight) {
                for (var length = array.length, index = fromRight ? length : -1; fromRight ? index-- : ++index < length; ) if (predicate(array[index], index, array)) return index;
                return -1;
            }
            function baseIndexOf(array, value, fromIndex) {
                if (value !== value) return indexOfNaN(array, fromIndex);
                for (var index = fromIndex - 1, length = array.length; ++index < length; ) if (array[index] === value) return index;
                return -1;
            }
            function baseIsFunction(value) {
                return "function" == typeof value || !1;
            }
            function baseToString(value) {
                return null == value ? "" : value + "";
            }
            function charsLeftIndex(string, chars) {
                for (var index = -1, length = string.length; ++index < length && chars.indexOf(string.charAt(index)) > -1; ) ;
                return index;
            }
            function charsRightIndex(string, chars) {
                for (var index = string.length; index-- && chars.indexOf(string.charAt(index)) > -1; ) ;
                return index;
            }
            function compareAscending(object, other) {
                return baseCompareAscending(object.criteria, other.criteria) || object.index - other.index;
            }
            function compareMultiple(object, other, orders) {
                for (var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length; ++index < length; ) {
                    var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
                    if (result) {
                        if (index >= ordersLength) return result;
                        var order = orders[index];
                        return result * ("asc" === order || order === !0 ? 1 : -1);
                    }
                }
                return object.index - other.index;
            }
            function deburrLetter(letter) {
                return deburredLetters[letter];
            }
            function escapeHtmlChar(chr) {
                return htmlEscapes[chr];
            }
            function escapeRegExpChar(chr, leadingChar, whitespaceChar) {
                return leadingChar ? chr = regexpEscapes[chr] : whitespaceChar && (chr = stringEscapes[chr]), 
                "\\" + chr;
            }
            function escapeStringChar(chr) {
                return "\\" + stringEscapes[chr];
            }
            function indexOfNaN(array, fromIndex, fromRight) {
                for (var length = array.length, index = fromIndex + (fromRight ? 0 : -1); fromRight ? index-- : ++index < length; ) {
                    var other = array[index];
                    if (other !== other) return index;
                }
                return -1;
            }
            function isObjectLike(value) {
                return !!value && "object" == typeof value;
            }
            function isSpace(charCode) {
                return charCode <= 160 && charCode >= 9 && charCode <= 13 || 32 == charCode || 160 == charCode || 5760 == charCode || 6158 == charCode || charCode >= 8192 && (charCode <= 8202 || 8232 == charCode || 8233 == charCode || 8239 == charCode || 8287 == charCode || 12288 == charCode || 65279 == charCode);
            }
            function replaceHolders(array, placeholder) {
                for (var index = -1, length = array.length, resIndex = -1, result = []; ++index < length; ) array[index] === placeholder && (array[index] = PLACEHOLDER, 
                result[++resIndex] = index);
                return result;
            }
            function sortedUniq(array, iteratee) {
                for (var seen, index = -1, length = array.length, resIndex = -1, result = []; ++index < length; ) {
                    var value = array[index], computed = iteratee ? iteratee(value, index, array) : value;
                    index && seen === computed || (seen = computed, result[++resIndex] = value);
                }
                return result;
            }
            function trimmedLeftIndex(string) {
                for (var index = -1, length = string.length; ++index < length && isSpace(string.charCodeAt(index)); ) ;
                return index;
            }
            function trimmedRightIndex(string) {
                for (var index = string.length; index-- && isSpace(string.charCodeAt(index)); ) ;
                return index;
            }
            function unescapeHtmlChar(chr) {
                return htmlUnescapes[chr];
            }
            function runInContext(context) {
                function lodash(value) {
                    if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
                        if (value instanceof LodashWrapper) return value;
                        if (hasOwnProperty.call(value, "__chain__") && hasOwnProperty.call(value, "__wrapped__")) return wrapperClone(value);
                    }
                    return new LodashWrapper(value);
                }
                function baseLodash() {}
                function LodashWrapper(value, chainAll, actions) {
                    this.__wrapped__ = value, this.__actions__ = actions || [], this.__chain__ = !!chainAll;
                }
                function LazyWrapper(value) {
                    this.__wrapped__ = value, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, 
                    this.__iteratees__ = [], this.__takeCount__ = POSITIVE_INFINITY, this.__views__ = [];
                }
                function lazyClone() {
                    var result = new LazyWrapper(this.__wrapped__);
                    return result.__actions__ = arrayCopy(this.__actions__), result.__dir__ = this.__dir__, 
                    result.__filtered__ = this.__filtered__, result.__iteratees__ = arrayCopy(this.__iteratees__), 
                    result.__takeCount__ = this.__takeCount__, result.__views__ = arrayCopy(this.__views__), 
                    result;
                }
                function lazyReverse() {
                    if (this.__filtered__) {
                        var result = new LazyWrapper(this);
                        result.__dir__ = -1, result.__filtered__ = !0;
                    } else result = this.clone(), result.__dir__ *= -1;
                    return result;
                }
                function lazyValue() {
                    var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
                    if (!isArr || arrLength < LARGE_ARRAY_SIZE || arrLength == length && takeCount == length) return baseWrapperValue(isRight && isArr ? array.reverse() : array, this.__actions__);
                    var result = [];
                    outer: for (;length-- && resIndex < takeCount; ) {
                        index += dir;
                        for (var iterIndex = -1, value = array[index]; ++iterIndex < iterLength; ) {
                            var data = iteratees[iterIndex], iteratee = data.iteratee, type = data.type, computed = iteratee(value);
                            if (type == LAZY_MAP_FLAG) value = computed; else if (!computed) {
                                if (type == LAZY_FILTER_FLAG) continue outer;
                                break outer;
                            }
                        }
                        result[resIndex++] = value;
                    }
                    return result;
                }
                function MapCache() {
                    this.__data__ = {};
                }
                function mapDelete(key) {
                    return this.has(key) && delete this.__data__[key];
                }
                function mapGet(key) {
                    return "__proto__" == key ? undefined : this.__data__[key];
                }
                function mapHas(key) {
                    return "__proto__" != key && hasOwnProperty.call(this.__data__, key);
                }
                function mapSet(key, value) {
                    return "__proto__" != key && (this.__data__[key] = value), this;
                }
                function SetCache(values) {
                    var length = values ? values.length : 0;
                    for (this.data = {
                        hash: nativeCreate(null),
                        set: new Set()
                    }; length--; ) this.push(values[length]);
                }
                function cacheIndexOf(cache, value) {
                    var data = cache.data, result = "string" == typeof value || isObject(value) ? data.set.has(value) : data.hash[value];
                    return result ? 0 : -1;
                }
                function cachePush(value) {
                    var data = this.data;
                    "string" == typeof value || isObject(value) ? data.set.add(value) : data.hash[value] = !0;
                }
                function arrayConcat(array, other) {
                    for (var index = -1, length = array.length, othIndex = -1, othLength = other.length, result = Array(length + othLength); ++index < length; ) result[index] = array[index];
                    for (;++othIndex < othLength; ) result[index++] = other[othIndex];
                    return result;
                }
                function arrayCopy(source, array) {
                    var index = -1, length = source.length;
                    for (array || (array = Array(length)); ++index < length; ) array[index] = source[index];
                    return array;
                }
                function arrayEach(array, iteratee) {
                    for (var index = -1, length = array.length; ++index < length && iteratee(array[index], index, array) !== !1; ) ;
                    return array;
                }
                function arrayEachRight(array, iteratee) {
                    for (var length = array.length; length-- && iteratee(array[length], length, array) !== !1; ) ;
                    return array;
                }
                function arrayEvery(array, predicate) {
                    for (var index = -1, length = array.length; ++index < length; ) if (!predicate(array[index], index, array)) return !1;
                    return !0;
                }
                function arrayExtremum(array, iteratee, comparator, exValue) {
                    for (var index = -1, length = array.length, computed = exValue, result = computed; ++index < length; ) {
                        var value = array[index], current = +iteratee(value);
                        comparator(current, computed) && (computed = current, result = value);
                    }
                    return result;
                }
                function arrayFilter(array, predicate) {
                    for (var index = -1, length = array.length, resIndex = -1, result = []; ++index < length; ) {
                        var value = array[index];
                        predicate(value, index, array) && (result[++resIndex] = value);
                    }
                    return result;
                }
                function arrayMap(array, iteratee) {
                    for (var index = -1, length = array.length, result = Array(length); ++index < length; ) result[index] = iteratee(array[index], index, array);
                    return result;
                }
                function arrayPush(array, values) {
                    for (var index = -1, length = values.length, offset = array.length; ++index < length; ) array[offset + index] = values[index];
                    return array;
                }
                function arrayReduce(array, iteratee, accumulator, initFromArray) {
                    var index = -1, length = array.length;
                    for (initFromArray && length && (accumulator = array[++index]); ++index < length; ) accumulator = iteratee(accumulator, array[index], index, array);
                    return accumulator;
                }
                function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
                    var length = array.length;
                    for (initFromArray && length && (accumulator = array[--length]); length--; ) accumulator = iteratee(accumulator, array[length], length, array);
                    return accumulator;
                }
                function arraySome(array, predicate) {
                    for (var index = -1, length = array.length; ++index < length; ) if (predicate(array[index], index, array)) return !0;
                    return !1;
                }
                function arraySum(array, iteratee) {
                    for (var length = array.length, result = 0; length--; ) result += +iteratee(array[length]) || 0;
                    return result;
                }
                function assignDefaults(objectValue, sourceValue) {
                    return objectValue === undefined ? sourceValue : objectValue;
                }
                function assignOwnDefaults(objectValue, sourceValue, key, object) {
                    return objectValue !== undefined && hasOwnProperty.call(object, key) ? objectValue : sourceValue;
                }
                function assignWith(object, source, customizer) {
                    for (var index = -1, props = keys(source), length = props.length; ++index < length; ) {
                        var key = props[index], value = object[key], result = customizer(value, source[key], key, object, source);
                        (result === result ? result === value : value !== value) && (value !== undefined || key in object) || (object[key] = result);
                    }
                    return object;
                }
                function baseAssign(object, source) {
                    return null == source ? object : baseCopy(source, keys(source), object);
                }
                function baseAt(collection, props) {
                    for (var index = -1, isNil = null == collection, isArr = !isNil && isArrayLike(collection), length = isArr ? collection.length : 0, propsLength = props.length, result = Array(propsLength); ++index < propsLength; ) {
                        var key = props[index];
                        isArr ? result[index] = isIndex(key, length) ? collection[key] : undefined : result[index] = isNil ? undefined : collection[key];
                    }
                    return result;
                }
                function baseCopy(source, props, object) {
                    object || (object = {});
                    for (var index = -1, length = props.length; ++index < length; ) {
                        var key = props[index];
                        object[key] = source[key];
                    }
                    return object;
                }
                function baseCallback(func, thisArg, argCount) {
                    var type = typeof func;
                    return "function" == type ? thisArg === undefined ? func : bindCallback(func, thisArg, argCount) : null == func ? identity : "object" == type ? baseMatches(func) : thisArg === undefined ? property(func) : baseMatchesProperty(func, thisArg);
                }
                function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
                    var result;
                    if (customizer && (result = object ? customizer(value, key, object) : customizer(value)), 
                    result !== undefined) return result;
                    if (!isObject(value)) return value;
                    var isArr = isArray(value);
                    if (isArr) {
                        if (result = initCloneArray(value), !isDeep) return arrayCopy(value, result);
                    } else {
                        var tag = objToString.call(value), isFunc = tag == funcTag;
                        if (tag != objectTag && tag != argsTag && (!isFunc || object)) return cloneableTags[tag] ? initCloneByTag(value, tag, isDeep) : object ? value : {};
                        if (result = initCloneObject(isFunc ? {} : value), !isDeep) return baseAssign(result, value);
                    }
                    stackA || (stackA = []), stackB || (stackB = []);
                    for (var length = stackA.length; length--; ) if (stackA[length] == value) return stackB[length];
                    return stackA.push(value), stackB.push(result), (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
                        result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
                    }), result;
                }
                function baseDelay(func, wait, args) {
                    if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                    return setTimeout(function() {
                        func.apply(undefined, args);
                    }, wait);
                }
                function baseDifference(array, values) {
                    var length = array ? array.length : 0, result = [];
                    if (!length) return result;
                    var index = -1, indexOf = getIndexOf(), isCommon = indexOf == baseIndexOf, cache = isCommon && values.length >= LARGE_ARRAY_SIZE ? createCache(values) : null, valuesLength = values.length;
                    cache && (indexOf = cacheIndexOf, isCommon = !1, values = cache);
                    outer: for (;++index < length; ) {
                        var value = array[index];
                        if (isCommon && value === value) {
                            for (var valuesIndex = valuesLength; valuesIndex--; ) if (values[valuesIndex] === value) continue outer;
                            result.push(value);
                        } else indexOf(values, value, 0) < 0 && result.push(value);
                    }
                    return result;
                }
                function baseEvery(collection, predicate) {
                    var result = !0;
                    return baseEach(collection, function(value, index, collection) {
                        return result = !!predicate(value, index, collection);
                    }), result;
                }
                function baseExtremum(collection, iteratee, comparator, exValue) {
                    var computed = exValue, result = computed;
                    return baseEach(collection, function(value, index, collection) {
                        var current = +iteratee(value, index, collection);
                        (comparator(current, computed) || current === exValue && current === result) && (computed = current, 
                        result = value);
                    }), result;
                }
                function baseFill(array, value, start, end) {
                    var length = array.length;
                    for (start = null == start ? 0 : +start || 0, start < 0 && (start = -start > length ? 0 : length + start), 
                    end = end === undefined || end > length ? length : +end || 0, end < 0 && (end += length), 
                    length = start > end ? 0 : end >>> 0, start >>>= 0; start < length; ) array[start++] = value;
                    return array;
                }
                function baseFilter(collection, predicate) {
                    var result = [];
                    return baseEach(collection, function(value, index, collection) {
                        predicate(value, index, collection) && result.push(value);
                    }), result;
                }
                function baseFind(collection, predicate, eachFunc, retKey) {
                    var result;
                    return eachFunc(collection, function(value, key, collection) {
                        if (predicate(value, key, collection)) return result = retKey ? key : value, !1;
                    }), result;
                }
                function baseFlatten(array, isDeep, isStrict, result) {
                    result || (result = []);
                    for (var index = -1, length = array.length; ++index < length; ) {
                        var value = array[index];
                        isObjectLike(value) && isArrayLike(value) && (isStrict || isArray(value) || isArguments(value)) ? isDeep ? baseFlatten(value, isDeep, isStrict, result) : arrayPush(result, value) : isStrict || (result[result.length] = value);
                    }
                    return result;
                }
                function baseForIn(object, iteratee) {
                    return baseFor(object, iteratee, keysIn);
                }
                function baseForOwn(object, iteratee) {
                    return baseFor(object, iteratee, keys);
                }
                function baseForOwnRight(object, iteratee) {
                    return baseForRight(object, iteratee, keys);
                }
                function baseFunctions(object, props) {
                    for (var index = -1, length = props.length, resIndex = -1, result = []; ++index < length; ) {
                        var key = props[index];
                        isFunction(object[key]) && (result[++resIndex] = key);
                    }
                    return result;
                }
                function baseGet(object, path, pathKey) {
                    if (null != object) {
                        pathKey !== undefined && pathKey in toObject(object) && (path = [ pathKey ]);
                        for (var index = 0, length = path.length; null != object && index < length; ) object = object[path[index++]];
                        return index && index == length ? object : undefined;
                    }
                }
                function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
                    return value === other || (null == value || null == other || !isObject(value) && !isObjectLike(other) ? value !== value && other !== other : baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB));
                }
                function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
                    var objIsArr = isArray(object), othIsArr = isArray(other), objTag = arrayTag, othTag = arrayTag;
                    objIsArr || (objTag = objToString.call(object), objTag == argsTag ? objTag = objectTag : objTag != objectTag && (objIsArr = isTypedArray(object))), 
                    othIsArr || (othTag = objToString.call(other), othTag == argsTag ? othTag = objectTag : othTag != objectTag && (othIsArr = isTypedArray(other)));
                    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
                    if (isSameTag && !objIsArr && !objIsObj) return equalByTag(object, other, objTag);
                    if (!isLoose) {
                        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
                        if (objIsWrapped || othIsWrapped) return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
                    }
                    if (!isSameTag) return !1;
                    stackA || (stackA = []), stackB || (stackB = []);
                    for (var length = stackA.length; length--; ) if (stackA[length] == object) return stackB[length] == other;
                    stackA.push(object), stackB.push(other);
                    var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
                    return stackA.pop(), stackB.pop(), result;
                }
                function baseIsMatch(object, matchData, customizer) {
                    var index = matchData.length, length = index, noCustomizer = !customizer;
                    if (null == object) return !length;
                    for (object = toObject(object); index--; ) {
                        var data = matchData[index];
                        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) return !1;
                    }
                    for (;++index < length; ) {
                        data = matchData[index];
                        var key = data[0], objValue = object[key], srcValue = data[1];
                        if (noCustomizer && data[2]) {
                            if (objValue === undefined && !(key in object)) return !1;
                        } else {
                            var result = customizer ? customizer(objValue, srcValue, key) : undefined;
                            if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, !0) : result)) return !1;
                        }
                    }
                    return !0;
                }
                function baseMap(collection, iteratee) {
                    var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
                    return baseEach(collection, function(value, key, collection) {
                        result[++index] = iteratee(value, key, collection);
                    }), result;
                }
                function baseMatches(source) {
                    var matchData = getMatchData(source);
                    if (1 == matchData.length && matchData[0][2]) {
                        var key = matchData[0][0], value = matchData[0][1];
                        return function(object) {
                            return null != object && (object[key] === value && (value !== undefined || key in toObject(object)));
                        };
                    }
                    return function(object) {
                        return baseIsMatch(object, matchData);
                    };
                }
                function baseMatchesProperty(path, srcValue) {
                    var isArr = isArray(path), isCommon = isKey(path) && isStrictComparable(srcValue), pathKey = path + "";
                    return path = toPath(path), function(object) {
                        if (null == object) return !1;
                        var key = pathKey;
                        if (object = toObject(object), (isArr || !isCommon) && !(key in object)) {
                            if (object = 1 == path.length ? object : baseGet(object, baseSlice(path, 0, -1)), 
                            null == object) return !1;
                            key = last(path), object = toObject(object);
                        }
                        return object[key] === srcValue ? srcValue !== undefined || key in object : baseIsEqual(srcValue, object[key], undefined, !0);
                    };
                }
                function baseMerge(object, source, customizer, stackA, stackB) {
                    if (!isObject(object)) return object;
                    var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)), props = isSrcArr ? undefined : keys(source);
                    return arrayEach(props || source, function(srcValue, key) {
                        if (props && (key = srcValue, srcValue = source[key]), isObjectLike(srcValue)) stackA || (stackA = []), 
                        stackB || (stackB = []), baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB); else {
                            var value = object[key], result = customizer ? customizer(value, srcValue, key, object, source) : undefined, isCommon = result === undefined;
                            isCommon && (result = srcValue), result === undefined && (!isSrcArr || key in object) || !isCommon && (result === result ? result === value : value !== value) || (object[key] = result);
                        }
                    }), object;
                }
                function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
                    for (var length = stackA.length, srcValue = source[key]; length--; ) if (stackA[length] == srcValue) return void (object[key] = stackB[length]);
                    var value = object[key], result = customizer ? customizer(value, srcValue, key, object, source) : undefined, isCommon = result === undefined;
                    isCommon && (result = srcValue, isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue)) ? result = isArray(value) ? value : isArrayLike(value) ? arrayCopy(value) : [] : isPlainObject(srcValue) || isArguments(srcValue) ? result = isArguments(value) ? toPlainObject(value) : isPlainObject(value) ? value : {} : isCommon = !1), 
                    stackA.push(srcValue), stackB.push(result), isCommon ? object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB) : (result === result ? result !== value : value === value) && (object[key] = result);
                }
                function baseProperty(key) {
                    return function(object) {
                        return null == object ? undefined : object[key];
                    };
                }
                function basePropertyDeep(path) {
                    var pathKey = path + "";
                    return path = toPath(path), function(object) {
                        return baseGet(object, path, pathKey);
                    };
                }
                function basePullAt(array, indexes) {
                    for (var length = array ? indexes.length : 0; length--; ) {
                        var index = indexes[length];
                        if (index != previous && isIndex(index)) {
                            var previous = index;
                            splice.call(array, index, 1);
                        }
                    }
                    return array;
                }
                function baseRandom(min, max) {
                    return min + nativeFloor(nativeRandom() * (max - min + 1));
                }
                function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
                    return eachFunc(collection, function(value, index, collection) {
                        accumulator = initFromCollection ? (initFromCollection = !1, value) : iteratee(accumulator, value, index, collection);
                    }), accumulator;
                }
                function baseSlice(array, start, end) {
                    var index = -1, length = array.length;
                    start = null == start ? 0 : +start || 0, start < 0 && (start = -start > length ? 0 : length + start), 
                    end = end === undefined || end > length ? length : +end || 0, end < 0 && (end += length), 
                    length = start > end ? 0 : end - start >>> 0, start >>>= 0;
                    for (var result = Array(length); ++index < length; ) result[index] = array[index + start];
                    return result;
                }
                function baseSome(collection, predicate) {
                    var result;
                    return baseEach(collection, function(value, index, collection) {
                        return result = predicate(value, index, collection), !result;
                    }), !!result;
                }
                function baseSortBy(array, comparer) {
                    var length = array.length;
                    for (array.sort(comparer); length--; ) array[length] = array[length].value;
                    return array;
                }
                function baseSortByOrder(collection, iteratees, orders) {
                    var callback = getCallback(), index = -1;
                    iteratees = arrayMap(iteratees, function(iteratee) {
                        return callback(iteratee);
                    });
                    var result = baseMap(collection, function(value) {
                        var criteria = arrayMap(iteratees, function(iteratee) {
                            return iteratee(value);
                        });
                        return {
                            criteria: criteria,
                            index: ++index,
                            value: value
                        };
                    });
                    return baseSortBy(result, function(object, other) {
                        return compareMultiple(object, other, orders);
                    });
                }
                function baseSum(collection, iteratee) {
                    var result = 0;
                    return baseEach(collection, function(value, index, collection) {
                        result += +iteratee(value, index, collection) || 0;
                    }), result;
                }
                function baseUniq(array, iteratee) {
                    var index = -1, indexOf = getIndexOf(), length = array.length, isCommon = indexOf == baseIndexOf, isLarge = isCommon && length >= LARGE_ARRAY_SIZE, seen = isLarge ? createCache() : null, result = [];
                    seen ? (indexOf = cacheIndexOf, isCommon = !1) : (isLarge = !1, seen = iteratee ? [] : result);
                    outer: for (;++index < length; ) {
                        var value = array[index], computed = iteratee ? iteratee(value, index, array) : value;
                        if (isCommon && value === value) {
                            for (var seenIndex = seen.length; seenIndex--; ) if (seen[seenIndex] === computed) continue outer;
                            iteratee && seen.push(computed), result.push(value);
                        } else indexOf(seen, computed, 0) < 0 && ((iteratee || isLarge) && seen.push(computed), 
                        result.push(value));
                    }
                    return result;
                }
                function baseValues(object, props) {
                    for (var index = -1, length = props.length, result = Array(length); ++index < length; ) result[index] = object[props[index]];
                    return result;
                }
                function baseWhile(array, predicate, isDrop, fromRight) {
                    for (var length = array.length, index = fromRight ? length : -1; (fromRight ? index-- : ++index < length) && predicate(array[index], index, array); ) ;
                    return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
                }
                function baseWrapperValue(value, actions) {
                    var result = value;
                    result instanceof LazyWrapper && (result = result.value());
                    for (var index = -1, length = actions.length; ++index < length; ) {
                        var action = actions[index];
                        result = action.func.apply(action.thisArg, arrayPush([ result ], action.args));
                    }
                    return result;
                }
                function binaryIndex(array, value, retHighest) {
                    var low = 0, high = array ? array.length : low;
                    if ("number" == typeof value && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
                        for (;low < high; ) {
                            var mid = low + high >>> 1, computed = array[mid];
                            (retHighest ? computed <= value : computed < value) && null !== computed ? low = mid + 1 : high = mid;
                        }
                        return high;
                    }
                    return binaryIndexBy(array, value, identity, retHighest);
                }
                function binaryIndexBy(array, value, iteratee, retHighest) {
                    value = iteratee(value);
                    for (var low = 0, high = array ? array.length : 0, valIsNaN = value !== value, valIsNull = null === value, valIsUndef = value === undefined; low < high; ) {
                        var mid = nativeFloor((low + high) / 2), computed = iteratee(array[mid]), isDef = computed !== undefined, isReflexive = computed === computed;
                        if (valIsNaN) var setLow = isReflexive || retHighest; else setLow = valIsNull ? isReflexive && isDef && (retHighest || null != computed) : valIsUndef ? isReflexive && (retHighest || isDef) : null != computed && (retHighest ? computed <= value : computed < value);
                        setLow ? low = mid + 1 : high = mid;
                    }
                    return nativeMin(high, MAX_ARRAY_INDEX);
                }
                function bindCallback(func, thisArg, argCount) {
                    if ("function" != typeof func) return identity;
                    if (thisArg === undefined) return func;
                    switch (argCount) {
                      case 1:
                        return function(value) {
                            return func.call(thisArg, value);
                        };

                      case 3:
                        return function(value, index, collection) {
                            return func.call(thisArg, value, index, collection);
                        };

                      case 4:
                        return function(accumulator, value, index, collection) {
                            return func.call(thisArg, accumulator, value, index, collection);
                        };

                      case 5:
                        return function(value, other, key, object, source) {
                            return func.call(thisArg, value, other, key, object, source);
                        };
                    }
                    return function() {
                        return func.apply(thisArg, arguments);
                    };
                }
                function bufferClone(buffer) {
                    var result = new ArrayBuffer(buffer.byteLength), view = new Uint8Array(result);
                    return view.set(new Uint8Array(buffer)), result;
                }
                function composeArgs(args, partials, holders) {
                    for (var holdersLength = holders.length, argsIndex = -1, argsLength = nativeMax(args.length - holdersLength, 0), leftIndex = -1, leftLength = partials.length, result = Array(leftLength + argsLength); ++leftIndex < leftLength; ) result[leftIndex] = partials[leftIndex];
                    for (;++argsIndex < holdersLength; ) result[holders[argsIndex]] = args[argsIndex];
                    for (;argsLength--; ) result[leftIndex++] = args[argsIndex++];
                    return result;
                }
                function composeArgsRight(args, partials, holders) {
                    for (var holdersIndex = -1, holdersLength = holders.length, argsIndex = -1, argsLength = nativeMax(args.length - holdersLength, 0), rightIndex = -1, rightLength = partials.length, result = Array(argsLength + rightLength); ++argsIndex < argsLength; ) result[argsIndex] = args[argsIndex];
                    for (var offset = argsIndex; ++rightIndex < rightLength; ) result[offset + rightIndex] = partials[rightIndex];
                    for (;++holdersIndex < holdersLength; ) result[offset + holders[holdersIndex]] = args[argsIndex++];
                    return result;
                }
                function createAggregator(setter, initializer) {
                    return function(collection, iteratee, thisArg) {
                        var result = initializer ? initializer() : {};
                        if (iteratee = getCallback(iteratee, thisArg, 3), isArray(collection)) for (var index = -1, length = collection.length; ++index < length; ) {
                            var value = collection[index];
                            setter(result, value, iteratee(value, index, collection), collection);
                        } else baseEach(collection, function(value, key, collection) {
                            setter(result, value, iteratee(value, key, collection), collection);
                        });
                        return result;
                    };
                }
                function createAssigner(assigner) {
                    return restParam(function(object, sources) {
                        var index = -1, length = null == object ? 0 : sources.length, customizer = length > 2 ? sources[length - 2] : undefined, guard = length > 2 ? sources[2] : undefined, thisArg = length > 1 ? sources[length - 1] : undefined;
                        for ("function" == typeof customizer ? (customizer = bindCallback(customizer, thisArg, 5), 
                        length -= 2) : (customizer = "function" == typeof thisArg ? thisArg : undefined, 
                        length -= customizer ? 1 : 0), guard && isIterateeCall(sources[0], sources[1], guard) && (customizer = length < 3 ? undefined : customizer, 
                        length = 1); ++index < length; ) {
                            var source = sources[index];
                            source && assigner(object, source, customizer);
                        }
                        return object;
                    });
                }
                function createBaseEach(eachFunc, fromRight) {
                    return function(collection, iteratee) {
                        var length = collection ? getLength(collection) : 0;
                        if (!isLength(length)) return eachFunc(collection, iteratee);
                        for (var index = fromRight ? length : -1, iterable = toObject(collection); (fromRight ? index-- : ++index < length) && iteratee(iterable[index], index, iterable) !== !1; ) ;
                        return collection;
                    };
                }
                function createBaseFor(fromRight) {
                    return function(object, iteratee, keysFunc) {
                        for (var iterable = toObject(object), props = keysFunc(object), length = props.length, index = fromRight ? length : -1; fromRight ? index-- : ++index < length; ) {
                            var key = props[index];
                            if (iteratee(iterable[key], key, iterable) === !1) break;
                        }
                        return object;
                    };
                }
                function createBindWrapper(func, thisArg) {
                    function wrapper() {
                        var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                        return fn.apply(thisArg, arguments);
                    }
                    var Ctor = createCtorWrapper(func);
                    return wrapper;
                }
                function createCache(values) {
                    return nativeCreate && Set ? new SetCache(values) : null;
                }
                function createCompounder(callback) {
                    return function(string) {
                        for (var index = -1, array = words(deburr(string)), length = array.length, result = ""; ++index < length; ) result = callback(result, array[index], index);
                        return result;
                    };
                }
                function createCtorWrapper(Ctor) {
                    return function() {
                        var args = arguments;
                        switch (args.length) {
                          case 0:
                            return new Ctor();

                          case 1:
                            return new Ctor(args[0]);

                          case 2:
                            return new Ctor(args[0], args[1]);

                          case 3:
                            return new Ctor(args[0], args[1], args[2]);

                          case 4:
                            return new Ctor(args[0], args[1], args[2], args[3]);

                          case 5:
                            return new Ctor(args[0], args[1], args[2], args[3], args[4]);

                          case 6:
                            return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);

                          case 7:
                            return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                        }
                        var thisBinding = baseCreate(Ctor.prototype), result = Ctor.apply(thisBinding, args);
                        return isObject(result) ? result : thisBinding;
                    };
                }
                function createCurry(flag) {
                    function curryFunc(func, arity, guard) {
                        guard && isIterateeCall(func, arity, guard) && (arity = undefined);
                        var result = createWrapper(func, flag, undefined, undefined, undefined, undefined, undefined, arity);
                        return result.placeholder = curryFunc.placeholder, result;
                    }
                    return curryFunc;
                }
                function createDefaults(assigner, customizer) {
                    return restParam(function(args) {
                        var object = args[0];
                        return null == object ? object : (args.push(customizer), assigner.apply(undefined, args));
                    });
                }
                function createExtremum(comparator, exValue) {
                    return function(collection, iteratee, thisArg) {
                        if (thisArg && isIterateeCall(collection, iteratee, thisArg) && (iteratee = undefined), 
                        iteratee = getCallback(iteratee, thisArg, 3), 1 == iteratee.length) {
                            collection = isArray(collection) ? collection : toIterable(collection);
                            var result = arrayExtremum(collection, iteratee, comparator, exValue);
                            if (!collection.length || result !== exValue) return result;
                        }
                        return baseExtremum(collection, iteratee, comparator, exValue);
                    };
                }
                function createFind(eachFunc, fromRight) {
                    return function(collection, predicate, thisArg) {
                        if (predicate = getCallback(predicate, thisArg, 3), isArray(collection)) {
                            var index = baseFindIndex(collection, predicate, fromRight);
                            return index > -1 ? collection[index] : undefined;
                        }
                        return baseFind(collection, predicate, eachFunc);
                    };
                }
                function createFindIndex(fromRight) {
                    return function(array, predicate, thisArg) {
                        return array && array.length ? (predicate = getCallback(predicate, thisArg, 3), 
                        baseFindIndex(array, predicate, fromRight)) : -1;
                    };
                }
                function createFindKey(objectFunc) {
                    return function(object, predicate, thisArg) {
                        return predicate = getCallback(predicate, thisArg, 3), baseFind(object, predicate, objectFunc, !0);
                    };
                }
                function createFlow(fromRight) {
                    return function() {
                        for (var wrapper, length = arguments.length, index = fromRight ? length : -1, leftIndex = 0, funcs = Array(length); fromRight ? index-- : ++index < length; ) {
                            var func = funcs[leftIndex++] = arguments[index];
                            if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                            !wrapper && LodashWrapper.prototype.thru && "wrapper" == getFuncName(func) && (wrapper = new LodashWrapper([], !0));
                        }
                        for (index = wrapper ? -1 : length; ++index < length; ) {
                            func = funcs[index];
                            var funcName = getFuncName(func), data = "wrapper" == funcName ? getData(func) : undefined;
                            wrapper = data && isLaziable(data[0]) && data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) && !data[4].length && 1 == data[9] ? wrapper[getFuncName(data[0])].apply(wrapper, data[3]) : 1 == func.length && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
                        }
                        return function() {
                            var args = arguments, value = args[0];
                            if (wrapper && 1 == args.length && isArray(value) && value.length >= LARGE_ARRAY_SIZE) return wrapper.plant(value).value();
                            for (var index = 0, result = length ? funcs[index].apply(this, args) : value; ++index < length; ) result = funcs[index].call(this, result);
                            return result;
                        };
                    };
                }
                function createForEach(arrayFunc, eachFunc) {
                    return function(collection, iteratee, thisArg) {
                        return "function" == typeof iteratee && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee) : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
                    };
                }
                function createForIn(objectFunc) {
                    return function(object, iteratee, thisArg) {
                        return "function" == typeof iteratee && thisArg === undefined || (iteratee = bindCallback(iteratee, thisArg, 3)), 
                        objectFunc(object, iteratee, keysIn);
                    };
                }
                function createForOwn(objectFunc) {
                    return function(object, iteratee, thisArg) {
                        return "function" == typeof iteratee && thisArg === undefined || (iteratee = bindCallback(iteratee, thisArg, 3)), 
                        objectFunc(object, iteratee);
                    };
                }
                function createObjectMapper(isMapKeys) {
                    return function(object, iteratee, thisArg) {
                        var result = {};
                        return iteratee = getCallback(iteratee, thisArg, 3), baseForOwn(object, function(value, key, object) {
                            var mapped = iteratee(value, key, object);
                            key = isMapKeys ? mapped : key, value = isMapKeys ? value : mapped, result[key] = value;
                        }), result;
                    };
                }
                function createPadDir(fromRight) {
                    return function(string, length, chars) {
                        return string = baseToString(string), (fromRight ? string : "") + createPadding(string, length, chars) + (fromRight ? "" : string);
                    };
                }
                function createPartial(flag) {
                    var partialFunc = restParam(function(func, partials) {
                        var holders = replaceHolders(partials, partialFunc.placeholder);
                        return createWrapper(func, flag, undefined, partials, holders);
                    });
                    return partialFunc;
                }
                function createReduce(arrayFunc, eachFunc) {
                    return function(collection, iteratee, accumulator, thisArg) {
                        var initFromArray = arguments.length < 3;
                        return "function" == typeof iteratee && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee, accumulator, initFromArray) : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
                    };
                }
                function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
                    function wrapper() {
                        for (var length = arguments.length, index = length, args = Array(length); index--; ) args[index] = arguments[index];
                        if (partials && (args = composeArgs(args, partials, holders)), partialsRight && (args = composeArgsRight(args, partialsRight, holdersRight)), 
                        isCurry || isCurryRight) {
                            var placeholder = wrapper.placeholder, argsHolders = replaceHolders(args, placeholder);
                            if (length -= argsHolders.length, length < arity) {
                                var newArgPos = argPos ? arrayCopy(argPos) : undefined, newArity = nativeMax(arity - length, 0), newsHolders = isCurry ? argsHolders : undefined, newHoldersRight = isCurry ? undefined : argsHolders, newPartials = isCurry ? args : undefined, newPartialsRight = isCurry ? undefined : args;
                                bitmask |= isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG, bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG), 
                                isCurryBound || (bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG));
                                var newData = [ func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity ], result = createHybridWrapper.apply(undefined, newData);
                                return isLaziable(func) && setData(result, newData), result.placeholder = placeholder, 
                                result;
                            }
                        }
                        var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
                        return argPos && (args = reorder(args, argPos)), isAry && ary < args.length && (args.length = ary), 
                        this && this !== root && this instanceof wrapper && (fn = Ctor || createCtorWrapper(func)), 
                        fn.apply(thisBinding, args);
                    }
                    var isAry = bitmask & ARY_FLAG, isBind = bitmask & BIND_FLAG, isBindKey = bitmask & BIND_KEY_FLAG, isCurry = bitmask & CURRY_FLAG, isCurryBound = bitmask & CURRY_BOUND_FLAG, isCurryRight = bitmask & CURRY_RIGHT_FLAG, Ctor = isBindKey ? undefined : createCtorWrapper(func);
                    return wrapper;
                }
                function createPadding(string, length, chars) {
                    var strLength = string.length;
                    if (length = +length, strLength >= length || !nativeIsFinite(length)) return "";
                    var padLength = length - strLength;
                    return chars = null == chars ? " " : chars + "", repeat(chars, nativeCeil(padLength / chars.length)).slice(0, padLength);
                }
                function createPartialWrapper(func, bitmask, thisArg, partials) {
                    function wrapper() {
                        for (var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength); ++leftIndex < leftLength; ) args[leftIndex] = partials[leftIndex];
                        for (;argsLength--; ) args[leftIndex++] = arguments[++argsIndex];
                        var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
                        return fn.apply(isBind ? thisArg : this, args);
                    }
                    var isBind = bitmask & BIND_FLAG, Ctor = createCtorWrapper(func);
                    return wrapper;
                }
                function createRound(methodName) {
                    var func = Math[methodName];
                    return function(number, precision) {
                        return precision = precision === undefined ? 0 : +precision || 0, precision ? (precision = pow(10, precision), 
                        func(number * precision) / precision) : func(number);
                    };
                }
                function createSortedIndex(retHighest) {
                    return function(array, value, iteratee, thisArg) {
                        var callback = getCallback(iteratee);
                        return null == iteratee && callback === baseCallback ? binaryIndex(array, value, retHighest) : binaryIndexBy(array, value, callback(iteratee, thisArg, 1), retHighest);
                    };
                }
                function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
                    var isBindKey = bitmask & BIND_KEY_FLAG;
                    if (!isBindKey && "function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                    var length = partials ? partials.length : 0;
                    if (length || (bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG), partials = holders = undefined), 
                    length -= holders ? holders.length : 0, bitmask & PARTIAL_RIGHT_FLAG) {
                        var partialsRight = partials, holdersRight = holders;
                        partials = holders = undefined;
                    }
                    var data = isBindKey ? undefined : getData(func), newData = [ func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity ];
                    if (data && (mergeData(newData, data), bitmask = newData[1], arity = newData[9]), 
                    newData[9] = null == arity ? isBindKey ? 0 : func.length : nativeMax(arity - length, 0) || 0, 
                    bitmask == BIND_FLAG) var result = createBindWrapper(newData[0], newData[2]); else result = bitmask != PARTIAL_FLAG && bitmask != (BIND_FLAG | PARTIAL_FLAG) || newData[4].length ? createHybridWrapper.apply(undefined, newData) : createPartialWrapper.apply(undefined, newData);
                    var setter = data ? baseSetData : setData;
                    return setter(result, newData);
                }
                function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
                    var index = -1, arrLength = array.length, othLength = other.length;
                    if (arrLength != othLength && !(isLoose && othLength > arrLength)) return !1;
                    for (;++index < arrLength; ) {
                        var arrValue = array[index], othValue = other[index], result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
                        if (result !== undefined) {
                            if (result) continue;
                            return !1;
                        }
                        if (isLoose) {
                            if (!arraySome(other, function(othValue) {
                                return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
                            })) return !1;
                        } else if (arrValue !== othValue && !equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB)) return !1;
                    }
                    return !0;
                }
                function equalByTag(object, other, tag) {
                    switch (tag) {
                      case boolTag:
                      case dateTag:
                        return +object == +other;

                      case errorTag:
                        return object.name == other.name && object.message == other.message;

                      case numberTag:
                        return object != +object ? other != +other : object == +other;

                      case regexpTag:
                      case stringTag:
                        return object == other + "";
                    }
                    return !1;
                }
                function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
                    var objProps = keys(object), objLength = objProps.length, othProps = keys(other), othLength = othProps.length;
                    if (objLength != othLength && !isLoose) return !1;
                    for (var index = objLength; index--; ) {
                        var key = objProps[index];
                        if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) return !1;
                    }
                    for (var skipCtor = isLoose; ++index < objLength; ) {
                        key = objProps[index];
                        var objValue = object[key], othValue = other[key], result = customizer ? customizer(isLoose ? othValue : objValue, isLoose ? objValue : othValue, key) : undefined;
                        if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) return !1;
                        skipCtor || (skipCtor = "constructor" == key);
                    }
                    if (!skipCtor) {
                        var objCtor = object.constructor, othCtor = other.constructor;
                        if (objCtor != othCtor && "constructor" in object && "constructor" in other && !("function" == typeof objCtor && objCtor instanceof objCtor && "function" == typeof othCtor && othCtor instanceof othCtor)) return !1;
                    }
                    return !0;
                }
                function getCallback(func, thisArg, argCount) {
                    var result = lodash.callback || callback;
                    return result = result === callback ? baseCallback : result, argCount ? result(func, thisArg, argCount) : result;
                }
                function getFuncName(func) {
                    for (var result = func.name, array = realNames[result], length = array ? array.length : 0; length--; ) {
                        var data = array[length], otherFunc = data.func;
                        if (null == otherFunc || otherFunc == func) return data.name;
                    }
                    return result;
                }
                function getIndexOf(collection, target, fromIndex) {
                    var result = lodash.indexOf || indexOf;
                    return result = result === indexOf ? baseIndexOf : result, collection ? result(collection, target, fromIndex) : result;
                }
                function getMatchData(object) {
                    for (var result = pairs(object), length = result.length; length--; ) result[length][2] = isStrictComparable(result[length][1]);
                    return result;
                }
                function getNative(object, key) {
                    var value = null == object ? undefined : object[key];
                    return isNative(value) ? value : undefined;
                }
                function getView(start, end, transforms) {
                    for (var index = -1, length = transforms.length; ++index < length; ) {
                        var data = transforms[index], size = data.size;
                        switch (data.type) {
                          case "drop":
                            start += size;
                            break;

                          case "dropRight":
                            end -= size;
                            break;

                          case "take":
                            end = nativeMin(end, start + size);
                            break;

                          case "takeRight":
                            start = nativeMax(start, end - size);
                        }
                    }
                    return {
                        start: start,
                        end: end
                    };
                }
                function initCloneArray(array) {
                    var length = array.length, result = new array.constructor(length);
                    return length && "string" == typeof array[0] && hasOwnProperty.call(array, "index") && (result.index = array.index, 
                    result.input = array.input), result;
                }
                function initCloneObject(object) {
                    var Ctor = object.constructor;
                    return "function" == typeof Ctor && Ctor instanceof Ctor || (Ctor = Object), new Ctor();
                }
                function initCloneByTag(object, tag, isDeep) {
                    var Ctor = object.constructor;
                    switch (tag) {
                      case arrayBufferTag:
                        return bufferClone(object);

                      case boolTag:
                      case dateTag:
                        return new Ctor(+object);

                      case float32Tag:
                      case float64Tag:
                      case int8Tag:
                      case int16Tag:
                      case int32Tag:
                      case uint8Tag:
                      case uint8ClampedTag:
                      case uint16Tag:
                      case uint32Tag:
                        var buffer = object.buffer;
                        return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

                      case numberTag:
                      case stringTag:
                        return new Ctor(object);

                      case regexpTag:
                        var result = new Ctor(object.source, reFlags.exec(object));
                        result.lastIndex = object.lastIndex;
                    }
                    return result;
                }
                function invokePath(object, path, args) {
                    null == object || isKey(path, object) || (path = toPath(path), object = 1 == path.length ? object : baseGet(object, baseSlice(path, 0, -1)), 
                    path = last(path));
                    var func = null == object ? object : object[path];
                    return null == func ? undefined : func.apply(object, args);
                }
                function isArrayLike(value) {
                    return null != value && isLength(getLength(value));
                }
                function isIndex(value, length) {
                    return value = "number" == typeof value || reIsUint.test(value) ? +value : -1, length = null == length ? MAX_SAFE_INTEGER : length, 
                    value > -1 && value % 1 == 0 && value < length;
                }
                function isIterateeCall(value, index, object) {
                    if (!isObject(object)) return !1;
                    var type = typeof index;
                    if ("number" == type ? isArrayLike(object) && isIndex(index, object.length) : "string" == type && index in object) {
                        var other = object[index];
                        return value === value ? value === other : other !== other;
                    }
                    return !1;
                }
                function isKey(value, object) {
                    var type = typeof value;
                    if ("string" == type && reIsPlainProp.test(value) || "number" == type) return !0;
                    if (isArray(value)) return !1;
                    var result = !reIsDeepProp.test(value);
                    return result || null != object && value in toObject(object);
                }
                function isLaziable(func) {
                    var funcName = getFuncName(func);
                    if (!(funcName in LazyWrapper.prototype)) return !1;
                    var other = lodash[funcName];
                    if (func === other) return !0;
                    var data = getData(other);
                    return !!data && func === data[0];
                }
                function isLength(value) {
                    return "number" == typeof value && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
                }
                function isStrictComparable(value) {
                    return value === value && !isObject(value);
                }
                function mergeData(data, source) {
                    var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < ARY_FLAG, isCombo = srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG || srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8] || srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG;
                    if (!isCommon && !isCombo) return data;
                    srcBitmask & BIND_FLAG && (data[2] = source[2], newBitmask |= bitmask & BIND_FLAG ? 0 : CURRY_BOUND_FLAG);
                    var value = source[3];
                    if (value) {
                        var partials = data[3];
                        data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value), 
                        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
                    }
                    return value = source[5], value && (partials = data[5], data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value), 
                    data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6])), 
                    value = source[7], value && (data[7] = arrayCopy(value)), srcBitmask & ARY_FLAG && (data[8] = null == data[8] ? source[8] : nativeMin(data[8], source[8])), 
                    null == data[9] && (data[9] = source[9]), data[0] = source[0], data[1] = newBitmask, 
                    data;
                }
                function mergeDefaults(objectValue, sourceValue) {
                    return objectValue === undefined ? sourceValue : merge(objectValue, sourceValue, mergeDefaults);
                }
                function pickByArray(object, props) {
                    object = toObject(object);
                    for (var index = -1, length = props.length, result = {}; ++index < length; ) {
                        var key = props[index];
                        key in object && (result[key] = object[key]);
                    }
                    return result;
                }
                function pickByCallback(object, predicate) {
                    var result = {};
                    return baseForIn(object, function(value, key, object) {
                        predicate(value, key, object) && (result[key] = value);
                    }), result;
                }
                function reorder(array, indexes) {
                    for (var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = arrayCopy(array); length--; ) {
                        var index = indexes[length];
                        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
                    }
                    return array;
                }
                function shimKeys(object) {
                    for (var props = keysIn(object), propsLength = props.length, length = propsLength && object.length, allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object)), index = -1, result = []; ++index < propsLength; ) {
                        var key = props[index];
                        (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) && result.push(key);
                    }
                    return result;
                }
                function toIterable(value) {
                    return null == value ? [] : isArrayLike(value) ? isObject(value) ? value : Object(value) : values(value);
                }
                function toObject(value) {
                    return isObject(value) ? value : Object(value);
                }
                function toPath(value) {
                    if (isArray(value)) return value;
                    var result = [];
                    return baseToString(value).replace(rePropName, function(match, number, quote, string) {
                        result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
                    }), result;
                }
                function wrapperClone(wrapper) {
                    return wrapper instanceof LazyWrapper ? wrapper.clone() : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
                }
                function chunk(array, size, guard) {
                    size = (guard ? isIterateeCall(array, size, guard) : null == size) ? 1 : nativeMax(nativeFloor(size) || 1, 1);
                    for (var index = 0, length = array ? array.length : 0, resIndex = -1, result = Array(nativeCeil(length / size)); index < length; ) result[++resIndex] = baseSlice(array, index, index += size);
                    return result;
                }
                function compact(array) {
                    for (var index = -1, length = array ? array.length : 0, resIndex = -1, result = []; ++index < length; ) {
                        var value = array[index];
                        value && (result[++resIndex] = value);
                    }
                    return result;
                }
                function drop(array, n, guard) {
                    var length = array ? array.length : 0;
                    return length ? ((guard ? isIterateeCall(array, n, guard) : null == n) && (n = 1), 
                    baseSlice(array, n < 0 ? 0 : n)) : [];
                }
                function dropRight(array, n, guard) {
                    var length = array ? array.length : 0;
                    return length ? ((guard ? isIterateeCall(array, n, guard) : null == n) && (n = 1), 
                    n = length - (+n || 0), baseSlice(array, 0, n < 0 ? 0 : n)) : [];
                }
                function dropRightWhile(array, predicate, thisArg) {
                    return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3), !0, !0) : [];
                }
                function dropWhile(array, predicate, thisArg) {
                    return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3), !0) : [];
                }
                function fill(array, value, start, end) {
                    var length = array ? array.length : 0;
                    return length ? (start && "number" != typeof start && isIterateeCall(array, value, start) && (start = 0, 
                    end = length), baseFill(array, value, start, end)) : [];
                }
                function first(array) {
                    return array ? array[0] : undefined;
                }
                function flatten(array, isDeep, guard) {
                    var length = array ? array.length : 0;
                    return guard && isIterateeCall(array, isDeep, guard) && (isDeep = !1), length ? baseFlatten(array, isDeep) : [];
                }
                function flattenDeep(array) {
                    var length = array ? array.length : 0;
                    return length ? baseFlatten(array, !0) : [];
                }
                function indexOf(array, value, fromIndex) {
                    var length = array ? array.length : 0;
                    if (!length) return -1;
                    if ("number" == typeof fromIndex) fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex; else if (fromIndex) {
                        var index = binaryIndex(array, value);
                        return index < length && (value === value ? value === array[index] : array[index] !== array[index]) ? index : -1;
                    }
                    return baseIndexOf(array, value, fromIndex || 0);
                }
                function initial(array) {
                    return dropRight(array, 1);
                }
                function last(array) {
                    var length = array ? array.length : 0;
                    return length ? array[length - 1] : undefined;
                }
                function lastIndexOf(array, value, fromIndex) {
                    var length = array ? array.length : 0;
                    if (!length) return -1;
                    var index = length;
                    if ("number" == typeof fromIndex) index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1; else if (fromIndex) {
                        index = binaryIndex(array, value, !0) - 1;
                        var other = array[index];
                        return (value === value ? value === other : other !== other) ? index : -1;
                    }
                    if (value !== value) return indexOfNaN(array, index, !0);
                    for (;index--; ) if (array[index] === value) return index;
                    return -1;
                }
                function pull() {
                    var args = arguments, array = args[0];
                    if (!array || !array.length) return array;
                    for (var index = 0, indexOf = getIndexOf(), length = args.length; ++index < length; ) for (var fromIndex = 0, value = args[index]; (fromIndex = indexOf(array, value, fromIndex)) > -1; ) splice.call(array, fromIndex, 1);
                    return array;
                }
                function remove(array, predicate, thisArg) {
                    var result = [];
                    if (!array || !array.length) return result;
                    var index = -1, indexes = [], length = array.length;
                    for (predicate = getCallback(predicate, thisArg, 3); ++index < length; ) {
                        var value = array[index];
                        predicate(value, index, array) && (result.push(value), indexes.push(index));
                    }
                    return basePullAt(array, indexes), result;
                }
                function rest(array) {
                    return drop(array, 1);
                }
                function slice(array, start, end) {
                    var length = array ? array.length : 0;
                    return length ? (end && "number" != typeof end && isIterateeCall(array, start, end) && (start = 0, 
                    end = length), baseSlice(array, start, end)) : [];
                }
                function take(array, n, guard) {
                    var length = array ? array.length : 0;
                    return length ? ((guard ? isIterateeCall(array, n, guard) : null == n) && (n = 1), 
                    baseSlice(array, 0, n < 0 ? 0 : n)) : [];
                }
                function takeRight(array, n, guard) {
                    var length = array ? array.length : 0;
                    return length ? ((guard ? isIterateeCall(array, n, guard) : null == n) && (n = 1), 
                    n = length - (+n || 0), baseSlice(array, n < 0 ? 0 : n)) : [];
                }
                function takeRightWhile(array, predicate, thisArg) {
                    return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3), !1, !0) : [];
                }
                function takeWhile(array, predicate, thisArg) {
                    return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3)) : [];
                }
                function uniq(array, isSorted, iteratee, thisArg) {
                    var length = array ? array.length : 0;
                    if (!length) return [];
                    null != isSorted && "boolean" != typeof isSorted && (thisArg = iteratee, iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted, 
                    isSorted = !1);
                    var callback = getCallback();
                    return null == iteratee && callback === baseCallback || (iteratee = callback(iteratee, thisArg, 3)), 
                    isSorted && getIndexOf() == baseIndexOf ? sortedUniq(array, iteratee) : baseUniq(array, iteratee);
                }
                function unzip(array) {
                    if (!array || !array.length) return [];
                    var index = -1, length = 0;
                    array = arrayFilter(array, function(group) {
                        if (isArrayLike(group)) return length = nativeMax(group.length, length), !0;
                    });
                    for (var result = Array(length); ++index < length; ) result[index] = arrayMap(array, baseProperty(index));
                    return result;
                }
                function unzipWith(array, iteratee, thisArg) {
                    var length = array ? array.length : 0;
                    if (!length) return [];
                    var result = unzip(array);
                    return null == iteratee ? result : (iteratee = bindCallback(iteratee, thisArg, 4), 
                    arrayMap(result, function(group) {
                        return arrayReduce(group, iteratee, undefined, !0);
                    }));
                }
                function xor() {
                    for (var index = -1, length = arguments.length; ++index < length; ) {
                        var array = arguments[index];
                        if (isArrayLike(array)) var result = result ? arrayPush(baseDifference(result, array), baseDifference(array, result)) : array;
                    }
                    return result ? baseUniq(result) : [];
                }
                function zipObject(props, values) {
                    var index = -1, length = props ? props.length : 0, result = {};
                    for (!length || values || isArray(props[0]) || (values = []); ++index < length; ) {
                        var key = props[index];
                        values ? result[key] = values[index] : key && (result[key[0]] = key[1]);
                    }
                    return result;
                }
                function chain(value) {
                    var result = lodash(value);
                    return result.__chain__ = !0, result;
                }
                function tap(value, interceptor, thisArg) {
                    return interceptor.call(thisArg, value), value;
                }
                function thru(value, interceptor, thisArg) {
                    return interceptor.call(thisArg, value);
                }
                function wrapperChain() {
                    return chain(this);
                }
                function wrapperCommit() {
                    return new LodashWrapper(this.value(), this.__chain__);
                }
                function wrapperPlant(value) {
                    for (var result, parent = this; parent instanceof baseLodash; ) {
                        var clone = wrapperClone(parent);
                        result ? previous.__wrapped__ = clone : result = clone;
                        var previous = clone;
                        parent = parent.__wrapped__;
                    }
                    return previous.__wrapped__ = value, result;
                }
                function wrapperReverse() {
                    var value = this.__wrapped__, interceptor = function(value) {
                        return wrapped && wrapped.__dir__ < 0 ? value : value.reverse();
                    };
                    if (value instanceof LazyWrapper) {
                        var wrapped = value;
                        return this.__actions__.length && (wrapped = new LazyWrapper(this)), wrapped = wrapped.reverse(), 
                        wrapped.__actions__.push({
                            func: thru,
                            args: [ interceptor ],
                            thisArg: undefined
                        }), new LodashWrapper(wrapped, this.__chain__);
                    }
                    return this.thru(interceptor);
                }
                function wrapperToString() {
                    return this.value() + "";
                }
                function wrapperValue() {
                    return baseWrapperValue(this.__wrapped__, this.__actions__);
                }
                function every(collection, predicate, thisArg) {
                    var func = isArray(collection) ? arrayEvery : baseEvery;
                    return thisArg && isIterateeCall(collection, predicate, thisArg) && (predicate = undefined), 
                    "function" == typeof predicate && thisArg === undefined || (predicate = getCallback(predicate, thisArg, 3)), 
                    func(collection, predicate);
                }
                function filter(collection, predicate, thisArg) {
                    var func = isArray(collection) ? arrayFilter : baseFilter;
                    return predicate = getCallback(predicate, thisArg, 3), func(collection, predicate);
                }
                function findWhere(collection, source) {
                    return find(collection, baseMatches(source));
                }
                function includes(collection, target, fromIndex, guard) {
                    var length = collection ? getLength(collection) : 0;
                    return isLength(length) || (collection = values(collection), length = collection.length), 
                    fromIndex = "number" != typeof fromIndex || guard && isIterateeCall(target, fromIndex, guard) ? 0 : fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex || 0, 
                    "string" == typeof collection || !isArray(collection) && isString(collection) ? fromIndex <= length && collection.indexOf(target, fromIndex) > -1 : !!length && getIndexOf(collection, target, fromIndex) > -1;
                }
                function map(collection, iteratee, thisArg) {
                    var func = isArray(collection) ? arrayMap : baseMap;
                    return iteratee = getCallback(iteratee, thisArg, 3), func(collection, iteratee);
                }
                function pluck(collection, path) {
                    return map(collection, property(path));
                }
                function reject(collection, predicate, thisArg) {
                    var func = isArray(collection) ? arrayFilter : baseFilter;
                    return predicate = getCallback(predicate, thisArg, 3), func(collection, function(value, index, collection) {
                        return !predicate(value, index, collection);
                    });
                }
                function sample(collection, n, guard) {
                    if (guard ? isIterateeCall(collection, n, guard) : null == n) {
                        collection = toIterable(collection);
                        var length = collection.length;
                        return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
                    }
                    var index = -1, result = toArray(collection), length = result.length, lastIndex = length - 1;
                    for (n = nativeMin(n < 0 ? 0 : +n || 0, length); ++index < n; ) {
                        var rand = baseRandom(index, lastIndex), value = result[rand];
                        result[rand] = result[index], result[index] = value;
                    }
                    return result.length = n, result;
                }
                function shuffle(collection) {
                    return sample(collection, POSITIVE_INFINITY);
                }
                function size(collection) {
                    var length = collection ? getLength(collection) : 0;
                    return isLength(length) ? length : keys(collection).length;
                }
                function some(collection, predicate, thisArg) {
                    var func = isArray(collection) ? arraySome : baseSome;
                    return thisArg && isIterateeCall(collection, predicate, thisArg) && (predicate = undefined), 
                    "function" == typeof predicate && thisArg === undefined || (predicate = getCallback(predicate, thisArg, 3)), 
                    func(collection, predicate);
                }
                function sortBy(collection, iteratee, thisArg) {
                    if (null == collection) return [];
                    thisArg && isIterateeCall(collection, iteratee, thisArg) && (iteratee = undefined);
                    var index = -1;
                    iteratee = getCallback(iteratee, thisArg, 3);
                    var result = baseMap(collection, function(value, key, collection) {
                        return {
                            criteria: iteratee(value, key, collection),
                            index: ++index,
                            value: value
                        };
                    });
                    return baseSortBy(result, compareAscending);
                }
                function sortByOrder(collection, iteratees, orders, guard) {
                    return null == collection ? [] : (guard && isIterateeCall(iteratees, orders, guard) && (orders = undefined), 
                    isArray(iteratees) || (iteratees = null == iteratees ? [] : [ iteratees ]), isArray(orders) || (orders = null == orders ? [] : [ orders ]), 
                    baseSortByOrder(collection, iteratees, orders));
                }
                function where(collection, source) {
                    return filter(collection, baseMatches(source));
                }
                function after(n, func) {
                    if ("function" != typeof func) {
                        if ("function" != typeof n) throw new TypeError(FUNC_ERROR_TEXT);
                        var temp = n;
                        n = func, func = temp;
                    }
                    return n = nativeIsFinite(n = +n) ? n : 0, function() {
                        if (--n < 1) return func.apply(this, arguments);
                    };
                }
                function ary(func, n, guard) {
                    return guard && isIterateeCall(func, n, guard) && (n = undefined), n = func && null == n ? func.length : nativeMax(+n || 0, 0), 
                    createWrapper(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
                }
                function before(n, func) {
                    var result;
                    if ("function" != typeof func) {
                        if ("function" != typeof n) throw new TypeError(FUNC_ERROR_TEXT);
                        var temp = n;
                        n = func, func = temp;
                    }
                    return function() {
                        return --n > 0 && (result = func.apply(this, arguments)), n <= 1 && (func = undefined), 
                        result;
                    };
                }
                function debounce(func, wait, options) {
                    function cancel() {
                        timeoutId && clearTimeout(timeoutId), maxTimeoutId && clearTimeout(maxTimeoutId), 
                        lastCalled = 0, maxTimeoutId = timeoutId = trailingCall = undefined;
                    }
                    function complete(isCalled, id) {
                        id && clearTimeout(id), maxTimeoutId = timeoutId = trailingCall = undefined, isCalled && (lastCalled = now(), 
                        result = func.apply(thisArg, args), timeoutId || maxTimeoutId || (args = thisArg = undefined));
                    }
                    function delayed() {
                        var remaining = wait - (now() - stamp);
                        remaining <= 0 || remaining > wait ? complete(trailingCall, maxTimeoutId) : timeoutId = setTimeout(delayed, remaining);
                    }
                    function maxDelayed() {
                        complete(trailing, timeoutId);
                    }
                    function debounced() {
                        if (args = arguments, stamp = now(), thisArg = this, trailingCall = trailing && (timeoutId || !leading), 
                        maxWait === !1) var leadingCall = leading && !timeoutId; else {
                            maxTimeoutId || leading || (lastCalled = stamp);
                            var remaining = maxWait - (stamp - lastCalled), isCalled = remaining <= 0 || remaining > maxWait;
                            isCalled ? (maxTimeoutId && (maxTimeoutId = clearTimeout(maxTimeoutId)), lastCalled = stamp, 
                            result = func.apply(thisArg, args)) : maxTimeoutId || (maxTimeoutId = setTimeout(maxDelayed, remaining));
                        }
                        return isCalled && timeoutId ? timeoutId = clearTimeout(timeoutId) : timeoutId || wait === maxWait || (timeoutId = setTimeout(delayed, wait)), 
                        leadingCall && (isCalled = !0, result = func.apply(thisArg, args)), !isCalled || timeoutId || maxTimeoutId || (args = thisArg = undefined), 
                        result;
                    }
                    var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled = 0, maxWait = !1, trailing = !0;
                    if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                    if (wait = wait < 0 ? 0 : +wait || 0, options === !0) {
                        var leading = !0;
                        trailing = !1;
                    } else isObject(options) && (leading = !!options.leading, maxWait = "maxWait" in options && nativeMax(+options.maxWait || 0, wait), 
                    trailing = "trailing" in options ? !!options.trailing : trailing);
                    return debounced.cancel = cancel, debounced;
                }
                function memoize(func, resolver) {
                    if ("function" != typeof func || resolver && "function" != typeof resolver) throw new TypeError(FUNC_ERROR_TEXT);
                    var memoized = function() {
                        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
                        if (cache.has(key)) return cache.get(key);
                        var result = func.apply(this, args);
                        return memoized.cache = cache.set(key, result), result;
                    };
                    return memoized.cache = new memoize.Cache(), memoized;
                }
                function negate(predicate) {
                    if ("function" != typeof predicate) throw new TypeError(FUNC_ERROR_TEXT);
                    return function() {
                        return !predicate.apply(this, arguments);
                    };
                }
                function once(func) {
                    return before(2, func);
                }
                function restParam(func, start) {
                    if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                    return start = nativeMax(start === undefined ? func.length - 1 : +start || 0, 0), 
                    function() {
                        for (var args = arguments, index = -1, length = nativeMax(args.length - start, 0), rest = Array(length); ++index < length; ) rest[index] = args[start + index];
                        switch (start) {
                          case 0:
                            return func.call(this, rest);

                          case 1:
                            return func.call(this, args[0], rest);

                          case 2:
                            return func.call(this, args[0], args[1], rest);
                        }
                        var otherArgs = Array(start + 1);
                        for (index = -1; ++index < start; ) otherArgs[index] = args[index];
                        return otherArgs[start] = rest, func.apply(this, otherArgs);
                    };
                }
                function spread(func) {
                    if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                    return function(array) {
                        return func.apply(this, array);
                    };
                }
                function throttle(func, wait, options) {
                    var leading = !0, trailing = !0;
                    if ("function" != typeof func) throw new TypeError(FUNC_ERROR_TEXT);
                    return options === !1 ? leading = !1 : isObject(options) && (leading = "leading" in options ? !!options.leading : leading, 
                    trailing = "trailing" in options ? !!options.trailing : trailing), debounce(func, wait, {
                        leading: leading,
                        maxWait: +wait,
                        trailing: trailing
                    });
                }
                function wrap(value, wrapper) {
                    return wrapper = null == wrapper ? identity : wrapper, createWrapper(wrapper, PARTIAL_FLAG, undefined, [ value ], []);
                }
                function clone(value, isDeep, customizer, thisArg) {
                    return isDeep && "boolean" != typeof isDeep && isIterateeCall(value, isDeep, customizer) ? isDeep = !1 : "function" == typeof isDeep && (thisArg = customizer, 
                    customizer = isDeep, isDeep = !1), "function" == typeof customizer ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 1)) : baseClone(value, isDeep);
                }
                function cloneDeep(value, customizer, thisArg) {
                    return "function" == typeof customizer ? baseClone(value, !0, bindCallback(customizer, thisArg, 1)) : baseClone(value, !0);
                }
                function gt(value, other) {
                    return value > other;
                }
                function gte(value, other) {
                    return value >= other;
                }
                function isArguments(value) {
                    return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
                }
                function isBoolean(value) {
                    return value === !0 || value === !1 || isObjectLike(value) && objToString.call(value) == boolTag;
                }
                function isDate(value) {
                    return isObjectLike(value) && objToString.call(value) == dateTag;
                }
                function isElement(value) {
                    return !!value && 1 === value.nodeType && isObjectLike(value) && !isPlainObject(value);
                }
                function isEmpty(value) {
                    return null == value || (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice)) ? !value.length : !keys(value).length);
                }
                function isEqual(value, other, customizer, thisArg) {
                    customizer = "function" == typeof customizer ? bindCallback(customizer, thisArg, 3) : undefined;
                    var result = customizer ? customizer(value, other) : undefined;
                    return result === undefined ? baseIsEqual(value, other, customizer) : !!result;
                }
                function isError(value) {
                    return isObjectLike(value) && "string" == typeof value.message && objToString.call(value) == errorTag;
                }
                function isFinite(value) {
                    return "number" == typeof value && nativeIsFinite(value);
                }
                function isFunction(value) {
                    return isObject(value) && objToString.call(value) == funcTag;
                }
                function isObject(value) {
                    var type = typeof value;
                    return !!value && ("object" == type || "function" == type);
                }
                function isMatch(object, source, customizer, thisArg) {
                    return customizer = "function" == typeof customizer ? bindCallback(customizer, thisArg, 3) : undefined, 
                    baseIsMatch(object, getMatchData(source), customizer);
                }
                function isNaN(value) {
                    return isNumber(value) && value != +value;
                }
                function isNative(value) {
                    return null != value && (isFunction(value) ? reIsNative.test(fnToString.call(value)) : isObjectLike(value) && reIsHostCtor.test(value));
                }
                function isNull(value) {
                    return null === value;
                }
                function isNumber(value) {
                    return "number" == typeof value || isObjectLike(value) && objToString.call(value) == numberTag;
                }
                function isPlainObject(value) {
                    var Ctor;
                    if (!isObjectLike(value) || objToString.call(value) != objectTag || isArguments(value) || !hasOwnProperty.call(value, "constructor") && (Ctor = value.constructor, 
                    "function" == typeof Ctor && !(Ctor instanceof Ctor))) return !1;
                    var result;
                    return baseForIn(value, function(subValue, key) {
                        result = key;
                    }), result === undefined || hasOwnProperty.call(value, result);
                }
                function isRegExp(value) {
                    return isObject(value) && objToString.call(value) == regexpTag;
                }
                function isString(value) {
                    return "string" == typeof value || isObjectLike(value) && objToString.call(value) == stringTag;
                }
                function isTypedArray(value) {
                    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
                }
                function isUndefined(value) {
                    return value === undefined;
                }
                function lt(value, other) {
                    return value < other;
                }
                function lte(value, other) {
                    return value <= other;
                }
                function toArray(value) {
                    var length = value ? getLength(value) : 0;
                    return isLength(length) ? length ? arrayCopy(value) : [] : values(value);
                }
                function toPlainObject(value) {
                    return baseCopy(value, keysIn(value));
                }
                function create(prototype, properties, guard) {
                    var result = baseCreate(prototype);
                    return guard && isIterateeCall(prototype, properties, guard) && (properties = undefined), 
                    properties ? baseAssign(result, properties) : result;
                }
                function functions(object) {
                    return baseFunctions(object, keysIn(object));
                }
                function get(object, path, defaultValue) {
                    var result = null == object ? undefined : baseGet(object, toPath(path), path + "");
                    return result === undefined ? defaultValue : result;
                }
                function has(object, path) {
                    if (null == object) return !1;
                    var result = hasOwnProperty.call(object, path);
                    if (!result && !isKey(path)) {
                        if (path = toPath(path), object = 1 == path.length ? object : baseGet(object, baseSlice(path, 0, -1)), 
                        null == object) return !1;
                        path = last(path), result = hasOwnProperty.call(object, path);
                    }
                    return result || isLength(object.length) && isIndex(path, object.length) && (isArray(object) || isArguments(object));
                }
                function invert(object, multiValue, guard) {
                    guard && isIterateeCall(object, multiValue, guard) && (multiValue = undefined);
                    for (var index = -1, props = keys(object), length = props.length, result = {}; ++index < length; ) {
                        var key = props[index], value = object[key];
                        multiValue ? hasOwnProperty.call(result, value) ? result[value].push(key) : result[value] = [ key ] : result[value] = key;
                    }
                    return result;
                }
                function keysIn(object) {
                    if (null == object) return [];
                    isObject(object) || (object = Object(object));
                    var length = object.length;
                    length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;
                    for (var Ctor = object.constructor, index = -1, isProto = "function" == typeof Ctor && Ctor.prototype === object, result = Array(length), skipIndexes = length > 0; ++index < length; ) result[index] = index + "";
                    for (var key in object) skipIndexes && isIndex(key, length) || "constructor" == key && (isProto || !hasOwnProperty.call(object, key)) || result.push(key);
                    return result;
                }
                function pairs(object) {
                    object = toObject(object);
                    for (var index = -1, props = keys(object), length = props.length, result = Array(length); ++index < length; ) {
                        var key = props[index];
                        result[index] = [ key, object[key] ];
                    }
                    return result;
                }
                function result(object, path, defaultValue) {
                    var result = null == object ? undefined : object[path];
                    return result === undefined && (null == object || isKey(path, object) || (path = toPath(path), 
                    object = 1 == path.length ? object : baseGet(object, baseSlice(path, 0, -1)), result = null == object ? undefined : object[last(path)]), 
                    result = result === undefined ? defaultValue : result), isFunction(result) ? result.call(object) : result;
                }
                function set(object, path, value) {
                    if (null == object) return object;
                    var pathKey = path + "";
                    path = null != object[pathKey] || isKey(path, object) ? [ pathKey ] : toPath(path);
                    for (var index = -1, length = path.length, lastIndex = length - 1, nested = object; null != nested && ++index < length; ) {
                        var key = path[index];
                        isObject(nested) && (index == lastIndex ? nested[key] = value : null == nested[key] && (nested[key] = isIndex(path[index + 1]) ? [] : {})), 
                        nested = nested[key];
                    }
                    return object;
                }
                function transform(object, iteratee, accumulator, thisArg) {
                    var isArr = isArray(object) || isTypedArray(object);
                    if (iteratee = getCallback(iteratee, thisArg, 4), null == accumulator) if (isArr || isObject(object)) {
                        var Ctor = object.constructor;
                        accumulator = isArr ? isArray(object) ? new Ctor() : [] : baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
                    } else accumulator = {};
                    return (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
                        return iteratee(accumulator, value, index, object);
                    }), accumulator;
                }
                function values(object) {
                    return baseValues(object, keys(object));
                }
                function valuesIn(object) {
                    return baseValues(object, keysIn(object));
                }
                function inRange(value, start, end) {
                    return start = +start || 0, end === undefined ? (end = start, start = 0) : end = +end || 0, 
                    value >= nativeMin(start, end) && value < nativeMax(start, end);
                }
                function random(min, max, floating) {
                    floating && isIterateeCall(min, max, floating) && (max = floating = undefined);
                    var noMin = null == min, noMax = null == max;
                    if (null == floating && (noMax && "boolean" == typeof min ? (floating = min, min = 1) : "boolean" == typeof max && (floating = max, 
                    noMax = !0)), noMin && noMax && (max = 1, noMax = !1), min = +min || 0, noMax ? (max = min, 
                    min = 0) : max = +max || 0, floating || min % 1 || max % 1) {
                        var rand = nativeRandom();
                        return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);
                    }
                    return baseRandom(min, max);
                }
                function capitalize(string) {
                    return string = baseToString(string), string && string.charAt(0).toUpperCase() + string.slice(1);
                }
                function deburr(string) {
                    return string = baseToString(string), string && string.replace(reLatin1, deburrLetter).replace(reComboMark, "");
                }
                function endsWith(string, target, position) {
                    string = baseToString(string), target += "";
                    var length = string.length;
                    return position = position === undefined ? length : nativeMin(position < 0 ? 0 : +position || 0, length), 
                    position -= target.length, position >= 0 && string.indexOf(target, position) == position;
                }
                function escape(string) {
                    return string = baseToString(string), string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
                }
                function escapeRegExp(string) {
                    return string = baseToString(string), string && reHasRegExpChars.test(string) ? string.replace(reRegExpChars, escapeRegExpChar) : string || "(?:)";
                }
                function pad(string, length, chars) {
                    string = baseToString(string), length = +length;
                    var strLength = string.length;
                    if (strLength >= length || !nativeIsFinite(length)) return string;
                    var mid = (length - strLength) / 2, leftLength = nativeFloor(mid), rightLength = nativeCeil(mid);
                    return chars = createPadding("", rightLength, chars), chars.slice(0, leftLength) + string + chars;
                }
                function parseInt(string, radix, guard) {
                    return (guard ? isIterateeCall(string, radix, guard) : null == radix) ? radix = 0 : radix && (radix = +radix), 
                    string = trim(string), nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
                }
                function repeat(string, n) {
                    var result = "";
                    if (string = baseToString(string), n = +n, n < 1 || !string || !nativeIsFinite(n)) return result;
                    do n % 2 && (result += string), n = nativeFloor(n / 2), string += string; while (n);
                    return result;
                }
                function startsWith(string, target, position) {
                    return string = baseToString(string), position = null == position ? 0 : nativeMin(position < 0 ? 0 : +position || 0, string.length), 
                    string.lastIndexOf(target, position) == position;
                }
                function template(string, options, otherOptions) {
                    var settings = lodash.templateSettings;
                    otherOptions && isIterateeCall(string, options, otherOptions) && (options = otherOptions = undefined), 
                    string = baseToString(string), options = assignWith(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);
                    var isEscaping, isEvaluating, imports = assignWith(baseAssign({}, options.imports), settings.imports, assignOwnDefaults), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys), index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '", reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g"), sourceURL = "//# sourceURL=" + ("sourceURL" in options ? options.sourceURL : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
                    string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
                        return interpolateValue || (interpolateValue = esTemplateValue), source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar), 
                        escapeValue && (isEscaping = !0, source += "' +\n__e(" + escapeValue + ") +\n'"), 
                        evaluateValue && (isEvaluating = !0, source += "';\n" + evaluateValue + ";\n__p += '"), 
                        interpolateValue && (source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'"), 
                        index = offset + match.length, match;
                    }), source += "';\n";
                    var variable = options.variable;
                    variable || (source = "with (obj) {\n" + source + "\n}\n"), source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;"), 
                    source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
                    var result = attempt(function() {
                        return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);
                    });
                    if (result.source = source, isError(result)) throw result;
                    return result;
                }
                function trim(string, chars, guard) {
                    var value = string;
                    return (string = baseToString(string)) ? (guard ? isIterateeCall(value, chars, guard) : null == chars) ? string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1) : (chars += "", 
                    string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1)) : string;
                }
                function trimLeft(string, chars, guard) {
                    var value = string;
                    return string = baseToString(string), string ? (guard ? isIterateeCall(value, chars, guard) : null == chars) ? string.slice(trimmedLeftIndex(string)) : string.slice(charsLeftIndex(string, chars + "")) : string;
                }
                function trimRight(string, chars, guard) {
                    var value = string;
                    return string = baseToString(string), string ? (guard ? isIterateeCall(value, chars, guard) : null == chars) ? string.slice(0, trimmedRightIndex(string) + 1) : string.slice(0, charsRightIndex(string, chars + "") + 1) : string;
                }
                function trunc(string, options, guard) {
                    guard && isIterateeCall(string, options, guard) && (options = undefined);
                    var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
                    if (null != options) if (isObject(options)) {
                        var separator = "separator" in options ? options.separator : separator;
                        length = "length" in options ? +options.length || 0 : length, omission = "omission" in options ? baseToString(options.omission) : omission;
                    } else length = +options || 0;
                    if (string = baseToString(string), length >= string.length) return string;
                    var end = length - omission.length;
                    if (end < 1) return omission;
                    var result = string.slice(0, end);
                    if (null == separator) return result + omission;
                    if (isRegExp(separator)) {
                        if (string.slice(end).search(separator)) {
                            var match, newEnd, substring = string.slice(0, end);
                            for (separator.global || (separator = RegExp(separator.source, (reFlags.exec(separator) || "") + "g")), 
                            separator.lastIndex = 0; match = separator.exec(substring); ) newEnd = match.index;
                            result = result.slice(0, null == newEnd ? end : newEnd);
                        }
                    } else if (string.indexOf(separator, end) != end) {
                        var index = result.lastIndexOf(separator);
                        index > -1 && (result = result.slice(0, index));
                    }
                    return result + omission;
                }
                function unescape(string) {
                    return string = baseToString(string), string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
                }
                function words(string, pattern, guard) {
                    return guard && isIterateeCall(string, pattern, guard) && (pattern = undefined), 
                    string = baseToString(string), string.match(pattern || reWords) || [];
                }
                function callback(func, thisArg, guard) {
                    return guard && isIterateeCall(func, thisArg, guard) && (thisArg = undefined), isObjectLike(func) ? matches(func) : baseCallback(func, thisArg);
                }
                function constant(value) {
                    return function() {
                        return value;
                    };
                }
                function identity(value) {
                    return value;
                }
                function matches(source) {
                    return baseMatches(baseClone(source, !0));
                }
                function matchesProperty(path, srcValue) {
                    return baseMatchesProperty(path, baseClone(srcValue, !0));
                }
                function mixin(object, source, options) {
                    if (null == options) {
                        var isObj = isObject(source), props = isObj ? keys(source) : undefined, methodNames = props && props.length ? baseFunctions(source, props) : undefined;
                        (methodNames ? methodNames.length : isObj) || (methodNames = !1, options = source, 
                        source = object, object = this);
                    }
                    methodNames || (methodNames = baseFunctions(source, keys(source)));
                    var chain = !0, index = -1, isFunc = isFunction(object), length = methodNames.length;
                    options === !1 ? chain = !1 : isObject(options) && "chain" in options && (chain = options.chain);
                    for (;++index < length; ) {
                        var methodName = methodNames[index], func = source[methodName];
                        object[methodName] = func, isFunc && (object.prototype[methodName] = function(func) {
                            return function() {
                                var chainAll = this.__chain__;
                                if (chain || chainAll) {
                                    var result = object(this.__wrapped__), actions = result.__actions__ = arrayCopy(this.__actions__);
                                    return actions.push({
                                        func: func,
                                        args: arguments,
                                        thisArg: object
                                    }), result.__chain__ = chainAll, result;
                                }
                                return func.apply(object, arrayPush([ this.value() ], arguments));
                            };
                        }(func));
                    }
                    return object;
                }
                function noConflict() {
                    return root._ = oldDash, this;
                }
                function noop() {}
                function property(path) {
                    return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
                }
                function propertyOf(object) {
                    return function(path) {
                        return baseGet(object, toPath(path), path + "");
                    };
                }
                function range(start, end, step) {
                    step && isIterateeCall(start, end, step) && (end = step = undefined), start = +start || 0, 
                    step = null == step ? 1 : +step || 0, null == end ? (end = start, start = 0) : end = +end || 0;
                    for (var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result = Array(length); ++index < length; ) result[index] = start, 
                    start += step;
                    return result;
                }
                function times(n, iteratee, thisArg) {
                    if (n = nativeFloor(n), n < 1 || !nativeIsFinite(n)) return [];
                    var index = -1, result = Array(nativeMin(n, MAX_ARRAY_LENGTH));
                    for (iteratee = bindCallback(iteratee, thisArg, 1); ++index < n; ) index < MAX_ARRAY_LENGTH ? result[index] = iteratee(index) : iteratee(index);
                    return result;
                }
                function uniqueId(prefix) {
                    var id = ++idCounter;
                    return baseToString(prefix) + id;
                }
                function add(augend, addend) {
                    return (+augend || 0) + (+addend || 0);
                }
                function sum(collection, iteratee, thisArg) {
                    return thisArg && isIterateeCall(collection, iteratee, thisArg) && (iteratee = undefined), 
                    iteratee = getCallback(iteratee, thisArg, 3), 1 == iteratee.length ? arraySum(isArray(collection) ? collection : toIterable(collection), iteratee) : baseSum(collection, iteratee);
                }
                context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
                var Array = context.Array, Date = context.Date, Error = context.Error, Function = context.Function, Math = context.Math, Number = context.Number, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError, arrayProto = Array.prototype, objectProto = Object.prototype, stringProto = String.prototype, fnToString = Function.prototype.toString, hasOwnProperty = objectProto.hasOwnProperty, idCounter = 0, objToString = objectProto.toString, oldDash = root._, reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), ArrayBuffer = context.ArrayBuffer, clearTimeout = context.clearTimeout, parseFloat = context.parseFloat, pow = Math.pow, propertyIsEnumerable = objectProto.propertyIsEnumerable, Set = getNative(context, "Set"), setTimeout = context.setTimeout, splice = arrayProto.splice, Uint8Array = context.Uint8Array, WeakMap = getNative(context, "WeakMap"), nativeCeil = Math.ceil, nativeCreate = getNative(Object, "create"), nativeFloor = Math.floor, nativeIsArray = getNative(Array, "isArray"), nativeIsFinite = context.isFinite, nativeKeys = getNative(Object, "keys"), nativeMax = Math.max, nativeMin = Math.min, nativeNow = getNative(Date, "now"), nativeParseInt = context.parseInt, nativeRandom = Math.random, NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, POSITIVE_INFINITY = Number.POSITIVE_INFINITY, MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1, MAX_SAFE_INTEGER = 9007199254740991, metaMap = WeakMap && new WeakMap(), realNames = {};
                lodash.support = {};
                lodash.templateSettings = {
                    escape: reEscape,
                    evaluate: reEvaluate,
                    interpolate: reInterpolate,
                    variable: "",
                    imports: {
                        _: lodash
                    }
                };
                var baseCreate = function() {
                    function object() {}
                    return function(prototype) {
                        if (isObject(prototype)) {
                            object.prototype = prototype;
                            var result = new object();
                            object.prototype = undefined;
                        }
                        return result || {};
                    };
                }(), baseEach = createBaseEach(baseForOwn), baseEachRight = createBaseEach(baseForOwnRight, !0), baseFor = createBaseFor(), baseForRight = createBaseFor(!0), baseSetData = metaMap ? function(func, data) {
                    return metaMap.set(func, data), func;
                } : identity, getData = metaMap ? function(func) {
                    return metaMap.get(func);
                } : noop, getLength = baseProperty("length"), setData = function() {
                    var count = 0, lastCalled = 0;
                    return function(key, value) {
                        var stamp = now(), remaining = HOT_SPAN - (stamp - lastCalled);
                        if (lastCalled = stamp, remaining > 0) {
                            if (++count >= HOT_COUNT) return key;
                        } else count = 0;
                        return baseSetData(key, value);
                    };
                }(), difference = restParam(function(array, values) {
                    return isObjectLike(array) && isArrayLike(array) ? baseDifference(array, baseFlatten(values, !1, !0)) : [];
                }), findIndex = createFindIndex(), findLastIndex = createFindIndex(!0), intersection = restParam(function(arrays) {
                    for (var othLength = arrays.length, othIndex = othLength, caches = Array(length), indexOf = getIndexOf(), isCommon = indexOf == baseIndexOf, result = []; othIndex--; ) {
                        var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
                        caches[othIndex] = isCommon && value.length >= 120 ? createCache(othIndex && value) : null;
                    }
                    var array = arrays[0], index = -1, length = array ? array.length : 0, seen = caches[0];
                    outer: for (;++index < length; ) if (value = array[index], (seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
                        for (var othIndex = othLength; --othIndex; ) {
                            var cache = caches[othIndex];
                            if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) continue outer;
                        }
                        seen && seen.push(value), result.push(value);
                    }
                    return result;
                }), pullAt = restParam(function(array, indexes) {
                    indexes = baseFlatten(indexes);
                    var result = baseAt(array, indexes);
                    return basePullAt(array, indexes.sort(baseCompareAscending)), result;
                }), sortedIndex = createSortedIndex(), sortedLastIndex = createSortedIndex(!0), union = restParam(function(arrays) {
                    return baseUniq(baseFlatten(arrays, !1, !0));
                }), without = restParam(function(array, values) {
                    return isArrayLike(array) ? baseDifference(array, values) : [];
                }), zip = restParam(unzip), zipWith = restParam(function(arrays) {
                    var length = arrays.length, iteratee = length > 2 ? arrays[length - 2] : undefined, thisArg = length > 1 ? arrays[length - 1] : undefined;
                    return length > 2 && "function" == typeof iteratee ? length -= 2 : (iteratee = length > 1 && "function" == typeof thisArg ? (--length, 
                    thisArg) : undefined, thisArg = undefined), arrays.length = length, unzipWith(arrays, iteratee, thisArg);
                }), wrapperConcat = restParam(function(values) {
                    return values = baseFlatten(values), this.thru(function(array) {
                        return arrayConcat(isArray(array) ? array : [ toObject(array) ], values);
                    });
                }), at = restParam(function(collection, props) {
                    return baseAt(collection, baseFlatten(props));
                }), countBy = createAggregator(function(result, value, key) {
                    hasOwnProperty.call(result, key) ? ++result[key] : result[key] = 1;
                }), find = createFind(baseEach), findLast = createFind(baseEachRight, !0), forEach = createForEach(arrayEach, baseEach), forEachRight = createForEach(arrayEachRight, baseEachRight), groupBy = createAggregator(function(result, value, key) {
                    hasOwnProperty.call(result, key) ? result[key].push(value) : result[key] = [ value ];
                }), indexBy = createAggregator(function(result, value, key) {
                    result[key] = value;
                }), invoke = restParam(function(collection, path, args) {
                    var index = -1, isFunc = "function" == typeof path, isProp = isKey(path), result = isArrayLike(collection) ? Array(collection.length) : [];
                    return baseEach(collection, function(value) {
                        var func = isFunc ? path : isProp && null != value ? value[path] : undefined;
                        result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
                    }), result;
                }), partition = createAggregator(function(result, value, key) {
                    result[key ? 0 : 1].push(value);
                }, function() {
                    return [ [], [] ];
                }), reduce = createReduce(arrayReduce, baseEach), reduceRight = createReduce(arrayReduceRight, baseEachRight), sortByAll = restParam(function(collection, iteratees) {
                    if (null == collection) return [];
                    var guard = iteratees[2];
                    return guard && isIterateeCall(iteratees[0], iteratees[1], guard) && (iteratees.length = 1), 
                    baseSortByOrder(collection, baseFlatten(iteratees), []);
                }), now = nativeNow || function() {
                    return new Date().getTime();
                }, bind = restParam(function(func, thisArg, partials) {
                    var bitmask = BIND_FLAG;
                    if (partials.length) {
                        var holders = replaceHolders(partials, bind.placeholder);
                        bitmask |= PARTIAL_FLAG;
                    }
                    return createWrapper(func, bitmask, thisArg, partials, holders);
                }), bindAll = restParam(function(object, methodNames) {
                    methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);
                    for (var index = -1, length = methodNames.length; ++index < length; ) {
                        var key = methodNames[index];
                        object[key] = createWrapper(object[key], BIND_FLAG, object);
                    }
                    return object;
                }), bindKey = restParam(function(object, key, partials) {
                    var bitmask = BIND_FLAG | BIND_KEY_FLAG;
                    if (partials.length) {
                        var holders = replaceHolders(partials, bindKey.placeholder);
                        bitmask |= PARTIAL_FLAG;
                    }
                    return createWrapper(key, bitmask, object, partials, holders);
                }), curry = createCurry(CURRY_FLAG), curryRight = createCurry(CURRY_RIGHT_FLAG), defer = restParam(function(func, args) {
                    return baseDelay(func, 1, args);
                }), delay = restParam(function(func, wait, args) {
                    return baseDelay(func, wait, args);
                }), flow = createFlow(), flowRight = createFlow(!0), modArgs = restParam(function(func, transforms) {
                    if (transforms = baseFlatten(transforms), "function" != typeof func || !arrayEvery(transforms, baseIsFunction)) throw new TypeError(FUNC_ERROR_TEXT);
                    var length = transforms.length;
                    return restParam(function(args) {
                        for (var index = nativeMin(args.length, length); index--; ) args[index] = transforms[index](args[index]);
                        return func.apply(this, args);
                    });
                }), partial = createPartial(PARTIAL_FLAG), partialRight = createPartial(PARTIAL_RIGHT_FLAG), rearg = restParam(function(func, indexes) {
                    return createWrapper(func, REARG_FLAG, undefined, undefined, undefined, baseFlatten(indexes));
                }), isArray = nativeIsArray || function(value) {
                    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
                }, merge = createAssigner(baseMerge), assign = createAssigner(function(object, source, customizer) {
                    return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
                }), defaults = createDefaults(assign, assignDefaults), defaultsDeep = createDefaults(merge, mergeDefaults), findKey = createFindKey(baseForOwn), findLastKey = createFindKey(baseForOwnRight), forIn = createForIn(baseFor), forInRight = createForIn(baseForRight), forOwn = createForOwn(baseForOwn), forOwnRight = createForOwn(baseForOwnRight), keys = nativeKeys ? function(object) {
                    var Ctor = null == object ? undefined : object.constructor;
                    return "function" == typeof Ctor && Ctor.prototype === object || "function" != typeof object && isArrayLike(object) ? shimKeys(object) : isObject(object) ? nativeKeys(object) : [];
                } : shimKeys, mapKeys = createObjectMapper(!0), mapValues = createObjectMapper(), omit = restParam(function(object, props) {
                    if (null == object) return {};
                    if ("function" != typeof props[0]) {
                        var props = arrayMap(baseFlatten(props), String);
                        return pickByArray(object, baseDifference(keysIn(object), props));
                    }
                    var predicate = bindCallback(props[0], props[1], 3);
                    return pickByCallback(object, function(value, key, object) {
                        return !predicate(value, key, object);
                    });
                }), pick = restParam(function(object, props) {
                    return null == object ? {} : "function" == typeof props[0] ? pickByCallback(object, bindCallback(props[0], props[1], 3)) : pickByArray(object, baseFlatten(props));
                }), camelCase = createCompounder(function(result, word, index) {
                    return word = word.toLowerCase(), result + (index ? word.charAt(0).toUpperCase() + word.slice(1) : word);
                }), kebabCase = createCompounder(function(result, word, index) {
                    return result + (index ? "-" : "") + word.toLowerCase();
                }), padLeft = createPadDir(), padRight = createPadDir(!0), snakeCase = createCompounder(function(result, word, index) {
                    return result + (index ? "_" : "") + word.toLowerCase();
                }), startCase = createCompounder(function(result, word, index) {
                    return result + (index ? " " : "") + (word.charAt(0).toUpperCase() + word.slice(1));
                }), attempt = restParam(function(func, args) {
                    try {
                        return func.apply(undefined, args);
                    } catch (e) {
                        return isError(e) ? e : new Error(e);
                    }
                }), method = restParam(function(path, args) {
                    return function(object) {
                        return invokePath(object, path, args);
                    };
                }), methodOf = restParam(function(object, args) {
                    return function(path) {
                        return invokePath(object, path, args);
                    };
                }), ceil = createRound("ceil"), floor = createRound("floor"), max = createExtremum(gt, NEGATIVE_INFINITY), min = createExtremum(lt, POSITIVE_INFINITY), round = createRound("round");
                return lodash.prototype = baseLodash.prototype, LodashWrapper.prototype = baseCreate(baseLodash.prototype), 
                LodashWrapper.prototype.constructor = LodashWrapper, LazyWrapper.prototype = baseCreate(baseLodash.prototype), 
                LazyWrapper.prototype.constructor = LazyWrapper, MapCache.prototype.delete = mapDelete, 
                MapCache.prototype.get = mapGet, MapCache.prototype.has = mapHas, MapCache.prototype.set = mapSet, 
                SetCache.prototype.push = cachePush, memoize.Cache = MapCache, lodash.after = after, 
                lodash.ary = ary, lodash.assign = assign, lodash.at = at, lodash.before = before, 
                lodash.bind = bind, lodash.bindAll = bindAll, lodash.bindKey = bindKey, lodash.callback = callback, 
                lodash.chain = chain, lodash.chunk = chunk, lodash.compact = compact, lodash.constant = constant, 
                lodash.countBy = countBy, lodash.create = create, lodash.curry = curry, lodash.curryRight = curryRight, 
                lodash.debounce = debounce, lodash.defaults = defaults, lodash.defaultsDeep = defaultsDeep, 
                lodash.defer = defer, lodash.delay = delay, lodash.difference = difference, lodash.drop = drop, 
                lodash.dropRight = dropRight, lodash.dropRightWhile = dropRightWhile, lodash.dropWhile = dropWhile, 
                lodash.fill = fill, lodash.filter = filter, lodash.flatten = flatten, lodash.flattenDeep = flattenDeep, 
                lodash.flow = flow, lodash.flowRight = flowRight, lodash.forEach = forEach, lodash.forEachRight = forEachRight, 
                lodash.forIn = forIn, lodash.forInRight = forInRight, lodash.forOwn = forOwn, lodash.forOwnRight = forOwnRight, 
                lodash.functions = functions, lodash.groupBy = groupBy, lodash.indexBy = indexBy, 
                lodash.initial = initial, lodash.intersection = intersection, lodash.invert = invert, 
                lodash.invoke = invoke, lodash.keys = keys, lodash.keysIn = keysIn, lodash.map = map, 
                lodash.mapKeys = mapKeys, lodash.mapValues = mapValues, lodash.matches = matches, 
                lodash.matchesProperty = matchesProperty, lodash.memoize = memoize, lodash.merge = merge, 
                lodash.method = method, lodash.methodOf = methodOf, lodash.mixin = mixin, lodash.modArgs = modArgs, 
                lodash.negate = negate, lodash.omit = omit, lodash.once = once, lodash.pairs = pairs, 
                lodash.partial = partial, lodash.partialRight = partialRight, lodash.partition = partition, 
                lodash.pick = pick, lodash.pluck = pluck, lodash.property = property, lodash.propertyOf = propertyOf, 
                lodash.pull = pull, lodash.pullAt = pullAt, lodash.range = range, lodash.rearg = rearg, 
                lodash.reject = reject, lodash.remove = remove, lodash.rest = rest, lodash.restParam = restParam, 
                lodash.set = set, lodash.shuffle = shuffle, lodash.slice = slice, lodash.sortBy = sortBy, 
                lodash.sortByAll = sortByAll, lodash.sortByOrder = sortByOrder, lodash.spread = spread, 
                lodash.take = take, lodash.takeRight = takeRight, lodash.takeRightWhile = takeRightWhile, 
                lodash.takeWhile = takeWhile, lodash.tap = tap, lodash.throttle = throttle, lodash.thru = thru, 
                lodash.times = times, lodash.toArray = toArray, lodash.toPlainObject = toPlainObject, 
                lodash.transform = transform, lodash.union = union, lodash.uniq = uniq, lodash.unzip = unzip, 
                lodash.unzipWith = unzipWith, lodash.values = values, lodash.valuesIn = valuesIn, 
                lodash.where = where, lodash.without = without, lodash.wrap = wrap, lodash.xor = xor, 
                lodash.zip = zip, lodash.zipObject = zipObject, lodash.zipWith = zipWith, lodash.backflow = flowRight, 
                lodash.collect = map, lodash.compose = flowRight, lodash.each = forEach, lodash.eachRight = forEachRight, 
                lodash.extend = assign, lodash.iteratee = callback, lodash.methods = functions, 
                lodash.object = zipObject, lodash.select = filter, lodash.tail = rest, lodash.unique = uniq, 
                mixin(lodash, lodash), lodash.add = add, lodash.attempt = attempt, lodash.camelCase = camelCase, 
                lodash.capitalize = capitalize, lodash.ceil = ceil, lodash.clone = clone, lodash.cloneDeep = cloneDeep, 
                lodash.deburr = deburr, lodash.endsWith = endsWith, lodash.escape = escape, lodash.escapeRegExp = escapeRegExp, 
                lodash.every = every, lodash.find = find, lodash.findIndex = findIndex, lodash.findKey = findKey, 
                lodash.findLast = findLast, lodash.findLastIndex = findLastIndex, lodash.findLastKey = findLastKey, 
                lodash.findWhere = findWhere, lodash.first = first, lodash.floor = floor, lodash.get = get, 
                lodash.gt = gt, lodash.gte = gte, lodash.has = has, lodash.identity = identity, 
                lodash.includes = includes, lodash.indexOf = indexOf, lodash.inRange = inRange, 
                lodash.isArguments = isArguments, lodash.isArray = isArray, lodash.isBoolean = isBoolean, 
                lodash.isDate = isDate, lodash.isElement = isElement, lodash.isEmpty = isEmpty, 
                lodash.isEqual = isEqual, lodash.isError = isError, lodash.isFinite = isFinite, 
                lodash.isFunction = isFunction, lodash.isMatch = isMatch, lodash.isNaN = isNaN, 
                lodash.isNative = isNative, lodash.isNull = isNull, lodash.isNumber = isNumber, 
                lodash.isObject = isObject, lodash.isPlainObject = isPlainObject, lodash.isRegExp = isRegExp, 
                lodash.isString = isString, lodash.isTypedArray = isTypedArray, lodash.isUndefined = isUndefined, 
                lodash.kebabCase = kebabCase, lodash.last = last, lodash.lastIndexOf = lastIndexOf, 
                lodash.lt = lt, lodash.lte = lte, lodash.max = max, lodash.min = min, lodash.noConflict = noConflict, 
                lodash.noop = noop, lodash.now = now, lodash.pad = pad, lodash.padLeft = padLeft, 
                lodash.padRight = padRight, lodash.parseInt = parseInt, lodash.random = random, 
                lodash.reduce = reduce, lodash.reduceRight = reduceRight, lodash.repeat = repeat, 
                lodash.result = result, lodash.round = round, lodash.runInContext = runInContext, 
                lodash.size = size, lodash.snakeCase = snakeCase, lodash.some = some, lodash.sortedIndex = sortedIndex, 
                lodash.sortedLastIndex = sortedLastIndex, lodash.startCase = startCase, lodash.startsWith = startsWith, 
                lodash.sum = sum, lodash.template = template, lodash.trim = trim, lodash.trimLeft = trimLeft, 
                lodash.trimRight = trimRight, lodash.trunc = trunc, lodash.unescape = unescape, 
                lodash.uniqueId = uniqueId, lodash.words = words, lodash.all = every, lodash.any = some, 
                lodash.contains = includes, lodash.eq = isEqual, lodash.detect = find, lodash.foldl = reduce, 
                lodash.foldr = reduceRight, lodash.head = first, lodash.include = includes, lodash.inject = reduce, 
                mixin(lodash, function() {
                    var source = {};
                    return baseForOwn(lodash, function(func, methodName) {
                        lodash.prototype[methodName] || (source[methodName] = func);
                    }), source;
                }(), !1), lodash.sample = sample, lodash.prototype.sample = function(n) {
                    return this.__chain__ || null != n ? this.thru(function(value) {
                        return sample(value, n);
                    }) : sample(this.value());
                }, lodash.VERSION = VERSION, arrayEach([ "bind", "bindKey", "curry", "curryRight", "partial", "partialRight" ], function(methodName) {
                    lodash[methodName].placeholder = lodash;
                }), arrayEach([ "drop", "take" ], function(methodName, index) {
                    LazyWrapper.prototype[methodName] = function(n) {
                        var filtered = this.__filtered__;
                        if (filtered && !index) return new LazyWrapper(this);
                        n = null == n ? 1 : nativeMax(nativeFloor(n) || 0, 0);
                        var result = this.clone();
                        return filtered ? result.__takeCount__ = nativeMin(result.__takeCount__, n) : result.__views__.push({
                            size: n,
                            type: methodName + (result.__dir__ < 0 ? "Right" : "")
                        }), result;
                    }, LazyWrapper.prototype[methodName + "Right"] = function(n) {
                        return this.reverse()[methodName](n).reverse();
                    };
                }), arrayEach([ "filter", "map", "takeWhile" ], function(methodName, index) {
                    var type = index + 1, isFilter = type != LAZY_MAP_FLAG;
                    LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
                        var result = this.clone();
                        return result.__iteratees__.push({
                            iteratee: getCallback(iteratee, thisArg, 1),
                            type: type
                        }), result.__filtered__ = result.__filtered__ || isFilter, result;
                    };
                }), arrayEach([ "first", "last" ], function(methodName, index) {
                    var takeName = "take" + (index ? "Right" : "");
                    LazyWrapper.prototype[methodName] = function() {
                        return this[takeName](1).value()[0];
                    };
                }), arrayEach([ "initial", "rest" ], function(methodName, index) {
                    var dropName = "drop" + (index ? "" : "Right");
                    LazyWrapper.prototype[methodName] = function() {
                        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
                    };
                }), arrayEach([ "pluck", "where" ], function(methodName, index) {
                    var operationName = index ? "filter" : "map", createCallback = index ? baseMatches : property;
                    LazyWrapper.prototype[methodName] = function(value) {
                        return this[operationName](createCallback(value));
                    };
                }), LazyWrapper.prototype.compact = function() {
                    return this.filter(identity);
                }, LazyWrapper.prototype.reject = function(predicate, thisArg) {
                    return predicate = getCallback(predicate, thisArg, 1), this.filter(function(value) {
                        return !predicate(value);
                    });
                }, LazyWrapper.prototype.slice = function(start, end) {
                    start = null == start ? 0 : +start || 0;
                    var result = this;
                    return result.__filtered__ && (start > 0 || end < 0) ? new LazyWrapper(result) : (start < 0 ? result = result.takeRight(-start) : start && (result = result.drop(start)), 
                    end !== undefined && (end = +end || 0, result = end < 0 ? result.dropRight(-end) : result.take(end - start)), 
                    result);
                }, LazyWrapper.prototype.takeRightWhile = function(predicate, thisArg) {
                    return this.reverse().takeWhile(predicate, thisArg).reverse();
                }, LazyWrapper.prototype.toArray = function() {
                    return this.take(POSITIVE_INFINITY);
                }, baseForOwn(LazyWrapper.prototype, function(func, methodName) {
                    var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName), retUnwrapped = /^(?:first|last)$/.test(methodName), lodashFunc = lodash[retUnwrapped ? "take" + ("last" == methodName ? "Right" : "") : methodName];
                    lodashFunc && (lodash.prototype[methodName] = function() {
                        var args = retUnwrapped ? [ 1 ] : arguments, chainAll = this.__chain__, value = this.__wrapped__, isHybrid = !!this.__actions__.length, isLazy = value instanceof LazyWrapper, iteratee = args[0], useLazy = isLazy || isArray(value);
                        useLazy && checkIteratee && "function" == typeof iteratee && 1 != iteratee.length && (isLazy = useLazy = !1);
                        var interceptor = function(value) {
                            return retUnwrapped && chainAll ? lodashFunc(value, 1)[0] : lodashFunc.apply(undefined, arrayPush([ value ], args));
                        }, action = {
                            func: thru,
                            args: [ interceptor ],
                            thisArg: undefined
                        }, onlyLazy = isLazy && !isHybrid;
                        if (retUnwrapped && !chainAll) return onlyLazy ? (value = value.clone(), value.__actions__.push(action), 
                        func.call(value)) : lodashFunc.call(undefined, this.value())[0];
                        if (!retUnwrapped && useLazy) {
                            value = onlyLazy ? value : new LazyWrapper(this);
                            var result = func.apply(value, args);
                            return result.__actions__.push(action), new LodashWrapper(result, chainAll);
                        }
                        return this.thru(interceptor);
                    });
                }), arrayEach([ "join", "pop", "push", "replace", "shift", "sort", "splice", "split", "unshift" ], function(methodName) {
                    var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);
                    lodash.prototype[methodName] = function() {
                        var args = arguments;
                        return retUnwrapped && !this.__chain__ ? func.apply(this.value(), args) : this[chainName](function(value) {
                            return func.apply(value, args);
                        });
                    };
                }), baseForOwn(LazyWrapper.prototype, function(func, methodName) {
                    var lodashFunc = lodash[methodName];
                    if (lodashFunc) {
                        var key = lodashFunc.name, names = realNames[key] || (realNames[key] = []);
                        names.push({
                            name: methodName,
                            func: lodashFunc
                        });
                    }
                }), realNames[createHybridWrapper(undefined, BIND_KEY_FLAG).name] = [ {
                    name: "wrapper",
                    func: undefined
                } ], LazyWrapper.prototype.clone = lazyClone, LazyWrapper.prototype.reverse = lazyReverse, 
                LazyWrapper.prototype.value = lazyValue, lodash.prototype.chain = wrapperChain, 
                lodash.prototype.commit = wrapperCommit, lodash.prototype.concat = wrapperConcat, 
                lodash.prototype.plant = wrapperPlant, lodash.prototype.reverse = wrapperReverse, 
                lodash.prototype.toString = wrapperToString, lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue, 
                lodash.prototype.collect = lodash.prototype.map, lodash.prototype.head = lodash.prototype.first, 
                lodash.prototype.select = lodash.prototype.filter, lodash.prototype.tail = lodash.prototype.rest, 
                lodash;
            }
            var undefined, VERSION = "3.10.1", BIND_FLAG = 1, BIND_KEY_FLAG = 2, CURRY_BOUND_FLAG = 4, CURRY_FLAG = 8, CURRY_RIGHT_FLAG = 16, PARTIAL_FLAG = 32, PARTIAL_RIGHT_FLAG = 64, ARY_FLAG = 128, REARG_FLAG = 256, DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...", HOT_COUNT = 150, HOT_SPAN = 16, LARGE_ARRAY_SIZE = 200, LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, FUNC_ERROR_TEXT = "Expected a function", PLACEHOLDER = "__lodash_placeholder__", argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]", arrayBufferTag = "[object ArrayBuffer]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]", reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g, reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g, reUnescapedHtml = /[&<>"'`]/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source), reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g, reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g, reRegExpChars = /^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g, reHasRegExpChars = RegExp(reRegExpChars.source), reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g, reEscapeChar = /\\(\\)?/g, reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, reFlags = /\w*$/, reHasHexPrefix = /^0[xX]/, reIsHostCtor = /^\[object .+?Constructor\]$/, reIsUint = /^\d+$/, reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g, reNoMatch = /($^)/, reUnescapedString = /['\n\r\u2028\u2029\\]/g, reWords = function() {
                var upper = "[A-Z\\xc0-\\xd6\\xd8-\\xde]", lower = "[a-z\\xdf-\\xf6\\xf8-\\xff]+";
                return RegExp(upper + "+(?=" + upper + lower + ")|" + upper + "?" + lower + "|" + upper + "+|[0-9]+", "g");
            }(), contextProps = [ "Array", "ArrayBuffer", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Math", "Number", "Object", "RegExp", "Set", "String", "_", "clearTimeout", "isFinite", "parseFloat", "parseInt", "setTimeout", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap" ], templateCounter = -1, typedArrayTags = {};
            typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = !0, 
            typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = !1;
            var cloneableTags = {};
            cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = !0, 
            cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[mapTag] = cloneableTags[setTag] = cloneableTags[weakMapTag] = !1;
            var deburredLetters = {
                "À": "A",
                "Á": "A",
                "Â": "A",
                "Ã": "A",
                "Ä": "A",
                "Å": "A",
                "à": "a",
                "á": "a",
                "â": "a",
                "ã": "a",
                "ä": "a",
                "å": "a",
                "Ç": "C",
                "ç": "c",
                "Ð": "D",
                "ð": "d",
                "È": "E",
                "É": "E",
                "Ê": "E",
                "Ë": "E",
                "è": "e",
                "é": "e",
                "ê": "e",
                "ë": "e",
                "Ì": "I",
                "Í": "I",
                "Î": "I",
                "Ï": "I",
                "ì": "i",
                "í": "i",
                "î": "i",
                "ï": "i",
                "Ñ": "N",
                "ñ": "n",
                "Ò": "O",
                "Ó": "O",
                "Ô": "O",
                "Õ": "O",
                "Ö": "O",
                "Ø": "O",
                "ò": "o",
                "ó": "o",
                "ô": "o",
                "õ": "o",
                "ö": "o",
                "ø": "o",
                "Ù": "U",
                "Ú": "U",
                "Û": "U",
                "Ü": "U",
                "ù": "u",
                "ú": "u",
                "û": "u",
                "ü": "u",
                "Ý": "Y",
                "ý": "y",
                "ÿ": "y",
                "Æ": "Ae",
                "æ": "ae",
                "Þ": "Th",
                "þ": "th",
                "ß": "ss"
            }, htmlEscapes = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
                "`": "&#96;"
            }, htmlUnescapes = {
                "&amp;": "&",
                "&lt;": "<",
                "&gt;": ">",
                "&quot;": '"',
                "&#39;": "'",
                "&#96;": "`"
            }, objectTypes = {
                function: !0,
                object: !0
            }, regexpEscapes = {
                "0": "x30",
                "1": "x31",
                "2": "x32",
                "3": "x33",
                "4": "x34",
                "5": "x35",
                "6": "x36",
                "7": "x37",
                "8": "x38",
                "9": "x39",
                A: "x41",
                B: "x42",
                C: "x43",
                D: "x44",
                E: "x45",
                F: "x46",
                a: "x61",
                b: "x62",
                c: "x63",
                d: "x64",
                e: "x65",
                f: "x66",
                n: "x6e",
                r: "x72",
                t: "x74",
                u: "x75",
                v: "x76",
                x: "x78"
            }, stringEscapes = {
                "\\": "\\",
                "'": "'",
                "\n": "n",
                "\r": "r",
                "\u2028": "u2028",
                "\u2029": "u2029"
            }, freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports, freeModule = objectTypes[typeof module] && module && !module.nodeType && module, freeGlobal = freeExports && freeModule && "object" == typeof global && global && global.Object && global, freeSelf = objectTypes[typeof self] && self && self.Object && self, freeWindow = objectTypes[typeof window] && window && window.Object && window, root = (freeModule && freeModule.exports === freeExports && freeExports, 
            freeGlobal || freeWindow !== (this && this.window) && freeWindow || freeSelf || this), _ = runInContext();
            root._ = _, __WEBPACK_AMD_DEFINE_RESULT__ = function() {
                return _;
            }.call(exports, __webpack_require__, exports, module), !(__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        }).call(this);
    }).call(exports, __webpack_require__(189)(module), function() {
        return this;
    }());
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), Collection = function() {
        function Collection(storage, query) {
            _classCallCheck(this, Collection), this.onUpdated = new _signals2.default(), this.storage = storage, 
            this.cache = new Map(), this.enabled = !0, this.query = query;
        }
        return _createClass(Collection, [ {
            key: "update",
            value: function() {
                var items = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], old = [], inserted = [], updated = [], excluded = [], _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                try {
                    for (var _step, _iterator = items[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                        var item = _step.value;
                        this._processItem(item, inserted, excluded, updated, old);
                    }
                } catch (err) {
                    _didIteratorError = !0, _iteratorError = err;
                } finally {
                    try {
                        !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                    } finally {
                        if (_didIteratorError) throw _iteratorError;
                    }
                }
                var wasUpdated = [ inserted, updated, excluded ].some(function(collection) {
                    return collection.length;
                });
                return wasUpdated && this.onUpdated.dispatch(this, {
                    inserted: inserted,
                    excluded: excluded,
                    updated: updated,
                    old: old
                }), this;
            }
        }, {
            key: "_processItem",
            value: function(item, inserted, excluded, updated, old) {
                var id = item.getId(), isExists = this.cache.has(id), isAcceptable = this.query(item);
                if (isAcceptable || isExists) return isExists ? isAcceptable ? void this._updateItem(id, item, updated, old) : void this._excludeItem(id, excluded) : void this._insertItem(id, item, inserted);
            }
        }, {
            key: "_insertItem",
            value: function(id, item, inserted) {
                item = item.clone(), this.cache.set(id, item), inserted.push(item);
            }
        }, {
            key: "_excludeItem",
            value: function(id, excluded) {
                var oldItem = this.cache.get(id);
                excluded.push(oldItem), this.cache.delete(id);
            }
        }, {
            key: "_updateItem",
            value: function(id, item, updated, old) {
                var oldItem = this.cache.get(id);
                item = item.clone(), old.push(oldItem), updated.push(item), this.cache.set(id, item);
            }
        }, {
            key: "remove",
            value: function() {
                var _this = this, ids = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [], removed = [];
                return ids.forEach(function(id) {
                    _this.cache.has(id) && (removed.push(_this.cache.get(id)), _this.cache.delete(id));
                }), removed.length && this.onUpdated.dispatch(this, {
                    removed: removed
                }), this;
            }
        }, {
            key: "reload",
            value: function() {
                return this.storage.reloadCollection(this), this;
            }
        }, {
            key: "destroy",
            value: function() {
                return this.storage.removeCollection(this), this.onUpdated.removeAll(), this.cache.clear(), 
                this;
            }
        }, {
            key: "enable",
            value: function() {
                return this.enabled = !0, this.storage.activateCollection(this), this;
            }
        }, {
            key: "disable",
            value: function() {
                return this.enabled = !1, this;
            }
        }, {
            key: "forEach",
            value: function(callback, scope) {
                this.toArray().forEach(callback, scope);
            }
        }, {
            key: "map",
            value: function(callback, scope) {
                return this.toArray().map(callback, scope);
            }
        }, {
            key: "reduce",
            value: function(callback, initialValue) {
                return this.toArray().reduce(callback, initialValue);
            }
        }, {
            key: "some",
            value: function(callback, scope) {
                return this.toArray().some(callback, scope);
            }
        }, {
            key: "every",
            value: function(callback, scope) {
                return this.toArray().every(callback, scope);
            }
        }, {
            key: "toArray",
            value: function() {
                return [].concat(_toConsumableArray(this.values));
            }
        }, {
            key: "values",
            get: function() {
                return this.cache.values();
            }
        }, {
            key: "size",
            get: function() {
                return this.cache.size;
            }
        } ]), Collection;
    }();
    exports.default = Collection, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _signals = __webpack_require__(209), _signals2 = _interopRequireDefault(_signals), _navigation = __webpack_require__(221), BEFORE_NAVIGATE = _navigation.NAVIGATION_STATUS.BEFORE_NAVIGATE, COMMITTED = _navigation.NAVIGATION_STATUS.COMMITTED, DOM_CONTENT_LOADED = _navigation.NAVIGATION_STATUS.DOM_CONTENT_LOADED, COMPLETED = _navigation.NAVIGATION_STATUS.COMPLETED, ERROR_OCCURRED = _navigation.NAVIGATION_STATUS.ERROR_OCCURRED, HISTORY_STATE_UPDATED = _navigation.NAVIGATION_STATUS.HISTORY_STATE_UPDATED, REFERENCE_FRAGMENT_UPDATED = _navigation.NAVIGATION_STATUS.REFERENCE_FRAGMENT_UPDATED, NavListener = function() {
        function NavListener() {
            _classCallCheck(this, NavListener), this._createSignals(), this._listenNav();
        }
        return _createClass(NavListener, [ {
            key: "_createSignals",
            value: function() {
                this.onNavigationUpdated = new _signals2.default();
            }
        }, {
            key: "_listenNav",
            value: function() {
                chrome.webNavigation.onBeforeNavigate.addListener(this._onBeforeNavigate.bind(this)), 
                chrome.webNavigation.onCommitted.addListener(this._onCommitted.bind(this)), chrome.webNavigation.onDOMContentLoaded.addListener(this._onDOMContentLoaded.bind(this)), 
                chrome.webNavigation.onCompleted.addListener(this._onCompleted.bind(this)), chrome.webNavigation.onErrorOccurred.addListener(this._onErrorOccurred.bind(this)), 
                chrome.webNavigation.onReferenceFragmentUpdated && chrome.webNavigation.onReferenceFragmentUpdated.addListener(this._onNavigationUpdated.bind(this, REFERENCE_FRAGMENT_UPDATED)), 
                chrome.webNavigation.onHistoryStateUpdated && chrome.webNavigation.onHistoryStateUpdated.addListener(this._onNavigationUpdated.bind(this, HISTORY_STATE_UPDATED));
            }
        }, {
            key: "_onNavigationUpdated",
            value: function(status, details) {
                this._onCommitted(details, status);
            }
        }, {
            key: "_onErrorOccurred",
            value: function(_ref) {
                var frameId = _ref.frameId, url = _ref.url, tabId = _ref.tabId, error = _ref.error;
                0 === frameId && this.onNavigationUpdated.dispatch({
                    tabId: tabId,
                    error: error,
                    url: url,
                    status: ERROR_OCCURRED
                });
            }
        }, {
            key: "_onCompleted",
            value: function(_ref2) {
                var frameId = _ref2.frameId, tabId = _ref2.tabId, url = _ref2.url;
                0 === frameId && this.onNavigationUpdated.dispatch({
                    tabId: tabId,
                    url: url,
                    status: COMPLETED
                });
            }
        }, {
            key: "_onDOMContentLoaded",
            value: function(_ref3) {
                var frameId = _ref3.frameId, url = _ref3.url, tabId = _ref3.tabId;
                0 === frameId && this.onNavigationUpdated.dispatch({
                    tabId: tabId,
                    url: url,
                    status: DOM_CONTENT_LOADED
                });
            }
        }, {
            key: "_onCommitted",
            value: function(_ref4) {
                var frameId = _ref4.frameId, transitionType = _ref4.transitionType, transitionQualifiers = _ref4.transitionQualifiers, url = _ref4.url, tabId = _ref4.tabId, status = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : COMMITTED;
                0 === frameId && this.onNavigationUpdated.dispatch({
                    tabId: tabId,
                    transitionType: transitionType,
                    transitionQualifiers: transitionQualifiers,
                    url: url,
                    status: status
                });
            }
        }, {
            key: "_onBeforeNavigate",
            value: function(_ref5) {
                var frameId = _ref5.frameId, tabId = _ref5.tabId, url = _ref5.url;
                0 === frameId && this.onNavigationUpdated.dispatch({
                    tabId: tabId,
                    url: url,
                    status: BEFORE_NAVIGATE
                });
            }
        } ]), NavListener;
    }();
    exports.default = NavListener, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    Object.defineProperty(exports, "__esModule", {
        value: !0
    });
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
            Constructor;
        };
    }(), _lodash = __webpack_require__(226), _lodash2 = _interopRequireDefault(_lodash), innerEvents = [ "onListenerAdded", "onListenerRemoved", "onFirstListenerAdded", "onLastListenerRemoved" ], Channel = function() {
        function Channel(name, noInnerEvents) {
            var _this = this;
            _classCallCheck(this, Channel), this._listeners = [], this._mute = !1, this._name = name || "", 
            this._noInnerEvents = Boolean(noInnerEvents), noInnerEvents || innerEvents.forEach(function(eventName) {
                return _this[eventName] = new Channel(eventName, !0);
            });
        }
        return _createClass(Channel, [ {
            key: "addListener",
            value: function(callback, context) {
                this._ensureFunction(callback), this._listeners.push({
                    callback: callback,
                    context: context
                }), this._dispatchInnerAddEvents(callback, context);
            }
        }, {
            key: "removeListener",
            value: function(callback, context) {
                this._ensureFunction(callback);
                var index = this._indexOfListener(callback, context);
                index >= 0 && this._listeners.splice(index, 1), this._dispatchInnerRemoveEvents(callback, context);
            }
        }, {
            key: "hasListener",
            value: function(callback, context) {
                return this._ensureFunction(callback), this._indexOfListener(callback, context) >= 0;
            }
        }, {
            key: "hasListeners",
            value: function() {
                return this._listeners.length > 0;
            }
        }, {
            key: "dispatch",
            value: function() {
                var _arguments = arguments;
                this._mute || this._listeners.forEach(function(listener) {
                    listener.callback.apply(listener.context, _arguments);
                });
            }
        }, {
            key: "mute",
            value: function() {
                this._mute = !0;
            }
        }, {
            key: "unmute",
            value: function() {
                this._mute = !1;
            }
        }, {
            key: "_ensureFunction",
            value: function(callback) {
                if ("function" != typeof callback) throw new Error("Channel " + this._name + ": listener is not a function");
            }
        }, {
            key: "_dispatchInnerAddEvents",
            value: function(callback, context) {
                this._noInnerEvents || (this.onListenerAdded.dispatch(callback, context), 1 === this._listeners.length && this.onFirstListenerAdded.dispatch(callback, context));
            }
        }, {
            key: "_dispatchInnerRemoveEvents",
            value: function(callback, context) {
                this._noInnerEvents || (this.onListenerRemoved.dispatch(callback, context), 0 === this._listeners.length && this.onLastListenerRemoved.dispatch(callback, context));
            }
        }, {
            key: "_indexOfListener",
            value: function(callback, context) {
                return _lodash2.default.findIndex(this._listeners, {
                    callback: callback,
                    context: context
                });
            }
        } ]), Channel;
    }();
    exports.default = Channel, module.exports = exports.default;
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports, __webpack_require__) {
    "use strict";
    function storeExperiments(experiments) {
        preferences.set(EXPERIMENTS_PREF, experiments);
    }
    function isExperimentInConfigs(experiment, configs) {
        return configs.some(function(config) {
            return String(experiment.testId) in config.types;
        });
    }
    var find = __webpack_require__(173), preferences = __webpack_require__(6), EXPERIMENTS_PREF = "application.experiments";
    exports.getExperiments = function() {
        return preferences.get(EXPERIMENTS_PREF) || [];
    }, exports.getExperimentByName = function(experimentName) {
        var experiment = find(exports.getExperiments(), {
            name: experimentName
        });
        return experiment ? experiment.data : null;
    }, exports.updateExperiments = function(experimentator, configs, isInstall) {
        var existingExperiments = exports.getExperiments().filter(function(experiment) {
            return isExperimentInConfigs(experiment, configs);
        }), experiments = experimentator.createExperiments(configs, existingExperiments, {
            isInstall: isInstall
        });
        storeExperiments(experiments);
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var Metrika = __webpack_require__(152).Metrika, metrikaLoggerWriter = __webpack_require__(152).metrikaLoggerWriter, backgroundLogger = __webpack_require__(13), loggerUtils = __webpack_require__(29), Ya = __webpack_require__(233), buildInfo = __webpack_require__(230);
    module.exports = {
        run: function() {
            var version = chrome.runtime.getManifest().version, yasoft = buildInfo.get("yasoft"), distribution = buildInfo.get("distribution"), branding = buildInfo.get("branding"), gchid = chrome.runtime.id, metrikaCounterId = buildInfo.get("metrika-counter-id"), metrikaCounter = new Ya.Metrika({
                id: metrikaCounterId,
                clickmap: !1,
                trackLinks: !1,
                accurateTrackBounce: !0,
                defer: !0
            }), metrika = new Metrika(metrikaCounter, document.URL, metrikaLoggerWriter.paramsKeysList), metrikaWriter = metrikaLoggerWriter.create(metrika, {
                version: version,
                yasoft: yasoft,
                distribution: distribution,
                branding: branding,
                gchid: gchid
            });
            metrikaCounterId ? (backgroundLogger.addWriter("metrika", metrikaWriter), backgroundLogger.addFormatter("metrika", loggerUtils.metrikaFormatter), 
            backgroundLogger.setLevels("metrika", [ "error" ])) : backgroundLogger.error("Can't attach metrika-logger, because there isn't counter id in config");
        }
    };
}, function(module, exports) {
    (function() {
        !function(g, h, Y) {
            function lb(a, b, c, d) {
                function e(a) {
                    var b = new Date().getTime();
                    a && b < a && (U += a - b + 20), f.setTimeout(function() {
                        e(b);
                    }, 20, "timeCorrector");
                }
                function l() {
                    var a = new Date().getTime() + U;
                    return a < R && (a = R + 10), R = a;
                }
                function m() {
                    return Math.round((l() - Z) / 50);
                }
                function ja(a, b) {
                    b = Math.max(0, Math.min(b, 65535)), f.mergeArrays(a, [ b >> 8, 255 & b ]);
                }
                function q(a, b) {
                    f.mergeArrays(a, [ 255 & b ]);
                }
                function p(a, b) {
                    for (b = Math.max(0, 0 | b); 127 < b; ) f.mergeArrays(a, [ 127 & b | 128 ]), b >>= 7;
                    f.mergeArrays(a, [ b ]);
                }
                function r(a, b) {
                    255 < b.length && (b = b.substr(0, 255)), f.mergeArrays(a, [ b.length ]);
                    for (var c = 0; c < b.length; c++) ja(a, b.charCodeAt(c));
                }
                function A(a, b) {
                    p(a, b.length);
                    for (var c = 0; c < b.length; c++) p(a, b.charCodeAt(c));
                }
                function x(a, b, c, d, e, f) {
                    for (var u; c && (u = n.getElementSize(c)) && (!u[0] || !u[1]); ) c = n.getElementParent(c);
                    if (!c) return null;
                    if (u = c[H], !u || 0 > u) return null;
                    var l = {
                        mousemove: 2,
                        click: 32,
                        dblclick: 33,
                        mousedown: 4,
                        mouseup: 30,
                        touch: 12
                    }[b];
                    if (!l) return null;
                    var Ma = n.getElementXY(c);
                    return c = [], q(c, l), p(c, a), p(c, u), p(c, Math.max(0, d[0] - Ma[0])), p(c, Math.max(0, d[1] - Ma[1])), 
                    /^mouse(up|down)|click$/.test(b) && (a = e || f, q(c, 2 > a ? 1 : a == (e ? 2 : 4) ? 4 : 2)), 
                    c;
                }
                function G(a, b, c, d) {
                    if (b = b[H], !b || 0 > b) return null;
                    var e = [];
                    return q(e, 31), p(e, a), p(e, b), p(e, c[0]), p(e, c[1]), q(e, 0), q(e, 0), q(e, d), 
                    e;
                }
                function E(a, b) {
                    var c = [];
                    return q(c, 3), p(c, a), p(c, b[0]), p(c, b[1]), c;
                }
                function nb(a, b, c) {
                    var d = [];
                    return c = c[H], !c || 0 > c ? null : (q(d, 16), p(d, a), p(d, b[0]), p(d, b[1]), 
                    p(d, c), d);
                }
                function K(a, b, c) {
                    var d = [];
                    return q(d, 28), p(d, a), p(d, b[0]), p(d, b[1]), p(d, c[0]), p(d, c[1]), d;
                }
                function F(a, b, c, d) {
                    var e = [];
                    return q(e, 5), p(e, a), ja(e, b), q(e, c), a = d[H], (!a || 0 > a) && (a = 0), 
                    p(e, a), e;
                }
                function P(a, b) {
                    var c, d;
                    0 == b.length ? d = c = "" : 100 >= b.length ? (c = b, d = "") : 200 >= b.length ? (c = b.substr(0, 100), 
                    d = b.substr(100)) : (c = b.substr(0, 97), d = b.substr(b.length - 97));
                    var e = [];
                    return q(e, 29), p(e, a), A(e, c), A(e, d), e;
                }
                function Da(a) {
                    var b = [];
                    return q(b, 27), p(b, a), b;
                }
                function y(a) {
                    var b = [];
                    return q(b, 14), p(b, a), b;
                }
                function S(a) {
                    var b = [];
                    return q(b, 15), p(b, a), b;
                }
                function N(a, b) {
                    var c = [];
                    return q(c, 17), p(c, a), p(c, b[H]), c;
                }
                function Y(a, b) {
                    var c = [];
                    return q(c, 18), p(c, a), p(c, b[H]), c;
                }
                function M(a, b, c) {
                    var d = [];
                    return q(d, 19), p(d, a), p(d, b[H]), r(d, String(c)), d;
                }
                function da(a) {
                    var b = a[H];
                    if (!b || 0 > b || !/^INPUT|SELECT|TEXTAREA$/.test(a.nodeName) || !a.form || ka(a.form)) return null;
                    var c = n.getFormNumber(a.form);
                    if (0 > c) return null;
                    var d;
                    if (d = "INPUT" == a.nodeName ? {
                        text: 0,
                        color: 0,
                        date: 0,
                        datetime: 0,
                        "datetime-local": 0,
                        email: 0,
                        number: 0,
                        range: 0,
                        search: 0,
                        tel: 0,
                        time: 0,
                        url: 0,
                        month: 0,
                        week: 0,
                        password: 2,
                        radio: 3,
                        checkbox: 4,
                        file: 6,
                        image: 7
                    }[a.type] : {
                        SELECT: 1,
                        TEXTAREA: 5
                    }[a.nodeName], "number" != typeof d) return null;
                    for (var e = -1, u = a.form.elements, f = u.length, l = 0, m = 0; l < f; l++) if (u[l].name == a.name) {
                        if (u[l] == a) {
                            e = m;
                            break;
                        }
                        m++;
                    }
                    return 0 > e ? null : (u = [], q(u, 7), p(u, b), p(u, c), p(u, d), A(u, a.name || ""), 
                    p(u, e), u);
                }
                function ga(a, b) {
                    var c = n.getFormNumber(b);
                    if (0 > c) return null;
                    for (var d = b.elements, e = d.length, u = [], l = 0; l < e; l++) if (!n.isEmptyField(d[l])) {
                        var m = d[l][H];
                        m && 0 < m && f.mergeArrays(u, [ m ]);
                    }
                    for (d = [], q(d, 11), p(d, a), p(d, c), p(d, u.length), c = 0; c < u.length; c++) p(d, u[c]);
                    return d;
                }
                function ia() {
                    var a = [];
                    return q(a, 13), a;
                }
                function B(a, b, c) {
                    a = a.apply(g, b), na.append(a, c);
                }
                function I(a) {
                    if (a[H]) a: {
                        var b = m(), c = a[H];
                        if (0 < c) {
                            var d = [];
                            a = n.getElementRegion(a);
                            var e = xa[c], f = a[0] + "x" + a[1], l = a[2] + "x" + a[3];
                            if (f != e.pos && (e.pos = f, q(d, 9), p(d, b), p(d, c), p(d, a[0]), p(d, a[1])), 
                            l != e.size && (e.size = l, q(d, 10), p(d, b), p(d, c), p(d, a[2]), p(d, a[3])), 
                            d.length) {
                                a = d;
                                break a;
                            }
                        }
                        a = null;
                    } else {
                        if ((c = n.getElementParent(a)) && I(c), a[H] = aa, xa[aa] = {}, aa++, a.nodeName) if (c = +a[H], 
                        !isFinite(c) || 0 >= c) b = null; else {
                            var d = 64, e = 0, u = n.getElementParent(a), f = u && u[H] ? u[H] : 0;
                            0 > f && (f = 0);
                            var l = a.nodeName.toUpperCase(), g = ob[l];
                            g || (d |= 2);
                            var h = n.getElementNeighborPosition(a);
                            h || (d |= 4);
                            var v = n.getElementRegion(a);
                            (u = u ? n.getElementRegion(u) : null) && v[0] == u[0] && v[1] == u[1] && v[2] == u[2] && v[3] == u[3] && (d |= 8), 
                            xa[c].pos = v[0] + "x" + v[1], xa[c].size = v[2] + "x" + v[3], a.id && "string" == typeof a.id && (d |= 32), 
                            (u = n.calcTextChecksum(a)) && (d |= 16);
                            var L = n.calcAttribChecksum(a);
                            L && (e |= 2);
                            var k;
                            b: {
                                k = n.getElementChildren(n.getElementParent(a), a.tagName);
                                for (var C = 0; C < k.length; C++) if ((!k[C].id || "string" != typeof k[C].id) && n.calcAttribChecksum(k[C]) == L && n.calcTextChecksum(k[C]) == u) {
                                    k = !0;
                                    break b;
                                }
                                k = !1;
                            }
                            k && (d |= 1, b = n.calcChildrenChecksum(a)), k = [], q(k, 1), p(k, c), q(k, d), 
                            p(k, f), g ? q(k, g) : r(k, l), h && p(k, h), 8 & d || (p(k, v[0]), p(k, v[1]), 
                            p(k, v[2]), p(k, v[3])), 32 & d && r(k, a.id), u && ja(k, u), 1 & d && ja(k, b), 
                            q(k, e), L && ja(k, L), b = k;
                        } else a[H] = -1, b = null;
                        na.append(b, void 0), a = da(a);
                    }
                    na.append(a, void 0);
                }
                function oa(a, b) {
                    var c = a && n.classNameExists(a, "(ym-disable-keys|-metrika-nokeys)");
                    return b && a && (c = c || !!n.getElementsByClassName("(ym-disable-keys|-metrika-nokeys)", a).length), 
                    c;
                }
                function ka(a) {
                    return a && n.classNameExists(a, "(ym-disable-submit|-metrika-noform)");
                }
                function la(a) {
                    var b = w.getTarget(a);
                    if (b && "SCROLLBAR" != b.nodeName) {
                        if (/^INPUT|SELECT|TEXTAREA|BUTTON$/.test(b.tagName)) if (b[H]) I(b); else {
                            var c = b.form;
                            if (c) for (var c = c.elements, d = c.length, e = 0; e < d; e++) /^INPUT|SELECT|TEXTAREA|BUTTON$/.test(c[e].tagName) && !c[e][H] && I(c[e]); else I(b);
                        } else I(b);
                        B(x, [ m(), a.type, b, w.getPos(a), a.which, a.button ]);
                    }
                }
                function O(a) {
                    la(a);
                    a: {
                        var b, c;
                        if (g.getSelection) {
                            try {
                                var d = g.getSelection();
                            } catch (mb) {
                                break a;
                            }
                            b = d.toString(), c = d.anchorNode;
                        } else h.selection && h.selection.createRange && (a = h.selection.createRange(), 
                        b = a.text, c = a.parentElement());
                        if ("string" == typeof b) {
                            try {
                                for (;c && 1 != c.nodeType; ) c = c.parentNode;
                            } catch (mb) {
                                break a;
                            }
                            c && Ea(c) || oa(c, !0) || b == fa || (fa = b, B(P, [ m(), b ]));
                        }
                    }
                }
                function L(a) {
                    var b = l(), c = b - W;
                    if (!(10 > c)) {
                        var d = w.getPos(a), e = ba[0] - d[0], f = ba[1] - d[1], e = e * e + f * f;
                        0 >= e || 16 > e && 100 > c || 20 > c && 256 > e || (W = b, ba = d, la(a));
                    }
                }
                function v() {
                    var a = n.getDocumentScroll(), b = l();
                    10 > b - ea || 10 > Math.abs(a[0] - T[0]) && 10 > Math.abs(a[1] - T[1]) || (ea = b, 
                    T = a, B(E, [ m(), a ]));
                }
                function C(a) {
                    if (a = w.getTarget(a)) {
                        var b = Math.random(), c = [ a.scrollLeft, a.scrollTop ];
                        if (a.localId) {
                            if (b = ca[a.localId], !b || 10 > Math.abs(c[0] - b[0]) && 10 > Math.abs(c[1] - b[1])) return;
                        } else {
                            for (;ca[b]; ) b = Math.random();
                            a.localId = b;
                        }
                        ca[a.localId] = c, a !== h && (I(a), B(nb, [ m(), c, a ]));
                    }
                }
                function J() {
                    B(K, [ m(), n.getViewportSize(), n.getDocumentSize() ]);
                }
                function D() {
                    B(ia, [], !0);
                }
                function ma(a) {
                    return (a.shiftKey ? 2 : 0) | (a.ctrlKey ? 4 : 0) | (a.altKey ? 1 : 0) | (a.metaKey ? 8 : 0) | (a.ctrlKey || a.altKey ? 16 : 0);
                }
                function Ea(a) {
                    return "INPUT" == a.tagName && ("password" == a.type || a.name && X.test(a.name) || a.id && X.test(a.id));
                }
                function Na(a, b, c) {
                    !(a = w.getTarget(a)) || Ea(a) || oa(a) || (I(a), B(F, [ m(), b, c, a ]));
                }
                function Oa(a) {
                    var b = a.keyCode, c = ma(a);
                    (({
                        3: 1,
                        8: 1,
                        9: 1,
                        13: 1,
                        16: 1,
                        17: 1,
                        18: 1,
                        19: 1,
                        20: 1,
                        27: 1,
                        33: 1,
                        34: 1,
                        35: 1,
                        36: 1,
                        37: 1,
                        38: 1,
                        39: 1,
                        40: 1,
                        45: 1,
                        46: 1,
                        91: 1,
                        92: 1,
                        93: 1,
                        106: 1,
                        110: 1,
                        111: 1,
                        144: 1,
                        145: 1
                    })[b] || 112 <= b && 123 >= b || 96 <= b && 105 >= b || 16 & c) && (19 == b && 4 == (c & -17) && (b = 144), 
                    Na(a, b, 16 | c), Q = !1, f.setTimeout(function() {
                        Q = !0;
                    }, 1), !(67 == b && 4 & c) || 1 & c || 2 & c || Fa());
                }
                function Pa(a) {
                    Q && !V && 0 !== a.which && (Na(a, a.charCode || a.keyCode, ma(a)), V = !0, f.setTimeout(function() {
                        V = !1;
                    }, 1));
                }
                function Fa() {
                    ha || (ha = !0, fa && B(Da, [ m() ]), f.setTimeout(function() {
                        ha = !1;
                    }, 1));
                }
                function Ga() {
                    ra || (ra = !0, B(y, [ m() ]));
                }
                function sa() {
                    ra && (ra = !1, B(S, [ m() ]));
                }
                function Qa(a) {
                    (!ra || a && !a.fromElement) && Ga();
                }
                function Ra(a) {
                    a && !a.toElement && sa();
                }
                function ya(a) {
                    if ((a = w.getTarget(a)) && /^INPUT|SELECT|TEXTAREA|BUTTON$/.test(a.tagName)) {
                        if (a[H]) I(a); else {
                            var b = a.form;
                            if (b) for (var b = b.elements, c = b.length, d = 0; d < c; d++) /^INPUT|SELECT|TEXTAREA|BUTTON$/.test(b[d].tagName) && !b[d][H] && I(b[d]); else I(a);
                        }
                        B(N, [ m(), a ]);
                    }
                }
                function za(a) {
                    (a = w.getTarget(a)) && /^INPUT|SELECT|TEXTAREA|BUTTON$/.test(a.tagName) && (I(a), 
                    B(Y, [ m(), a ]));
                }
                function Aa(a) {
                    if ((a = w.getTarget(a)) && !Ea(a) && !oa(a) && /^INPUT|SELECT|TEXTAREA$/.test(a.tagName)) {
                        var b = /^(checkbox|radio)$/.test(a.type) ? a.checked : a.value;
                        I(a), B(M, [ m(), a, b ]);
                    }
                }
                function ta(a) {
                    if ((a = w.getTarget(a)) && !ka(a) && "FORM" == a.nodeName) {
                        for (var b = a.elements, c = 0; c < b.length; c++) n.isEmptyField(b[c]) || I(b[c]);
                        B(ga, [ m(), a ], !0);
                    }
                }
                function Ha(a) {
                    if (v(), a.touches && a.touches.length) {
                        var b = w.getTarget(a);
                        if (b && b != h) {
                            I(b);
                            for (var c = 0; c < a.touches.length; c++) B(x, [ m(), "touch", b, [ a.touches[c].pageX, a.touches[c].pageY ], 0, 0 ]);
                        }
                    }
                }
                function Ba(a) {
                    var b = w.getTarget(a);
                    if (b) {
                        var c;
                        "wheel" == a.type ? c = 0 < a.deltaY ? 1 : 0 > a.deltaY ? 2 : 0 : "mousewheel" == a.type && (c = 0 < a.wheelDelta ? 2 : 0 > a.wheelDelta ? 1 : 0), 
                        c && (I(b), B(G, [ m(), b, w.getPos(a), c ]));
                    }
                }
                function Sa(a) {
                    (a = w.getTarget(a)) && "BODY" == a.tagName && na.append([], !0);
                }
                var na = new Ta({
                    protocol: a,
                    counterId: b,
                    counterType: c,
                    meta: {
                        url: z().href,
                        hitId: d,
                        timezone: ua,
                        timestamp: va
                    }
                }), ob = {
                    A: 1,
                    ABBR: 2,
                    ACRONYM: 3,
                    ADDRESS: 4,
                    APPLET: 5,
                    AREA: 6,
                    B: 7,
                    BASE: 8,
                    BASEFONT: 9,
                    BDO: 10,
                    BIG: 11,
                    BLOCKQUOTE: 12,
                    BODY: 13,
                    BR: 14,
                    BUTTON: 15,
                    CAPTION: 16,
                    CENTER: 17,
                    CITE: 18,
                    CODE: 19,
                    COL: 20,
                    COLGROUP: 21,
                    DD: 22,
                    DEL: 23,
                    DFN: 24,
                    DIR: 25,
                    DIV: 26,
                    DL: 27,
                    DT: 28,
                    EM: 29,
                    FIELDSET: 30,
                    FONT: 31,
                    FORM: 32,
                    FRAME: 33,
                    FRAMESET: 34,
                    H1: 35,
                    H2: 36,
                    H3: 37,
                    H4: 38,
                    H5: 39,
                    H6: 40,
                    HEAD: 41,
                    HR: 42,
                    HTML: 43,
                    I: 44,
                    IFRAME: 45,
                    IMG: 46,
                    INPUT: 47,
                    INS: 48,
                    ISINDEX: 49,
                    KBD: 50,
                    LABEL: 51,
                    LEGEND: 52,
                    LI: 53,
                    LINK: 54,
                    MAP: 55,
                    MENU: 56,
                    META: 57,
                    NOFRAMES: 58,
                    NOSCRIPT: 59,
                    OBJECT: 60,
                    OL: 61,
                    OPTGROUP: 62,
                    OPTION: 63,
                    P: 64,
                    PARAM: 65,
                    PRE: 66,
                    Q: 67,
                    S: 68,
                    SAMP: 69,
                    SCRIPT: 70,
                    SELECT: 71,
                    SMALL: 72,
                    SPAN: 73,
                    STRIKE: 74,
                    STRONG: 75,
                    STYLE: 76,
                    SUB: 77,
                    SUP: 78,
                    TABLE: 79,
                    TBODY: 80,
                    TD: 81,
                    TEXTAREA: 82,
                    TFOOT: 83,
                    TH: 84,
                    THEAD: 85,
                    TITLE: 86,
                    TR: 87,
                    TT: 88,
                    U: 89,
                    UL: 90,
                    VAR: 91,
                    NOINDEX: 100
                }, U = 0, R = 0;
                e(0);
                var aa = 1, W = 0, ba = [ 0, 0 ], ea = 0, T = [ 0, 0 ], ca = {}, X = /^(password|passwd|pswd)$/, Q = !0, V = !1, fa = "", ha = !1, ra = !0, Z = l(), H = "metrikaId_" + Math.random(), xa = {}, Ca = ":submit" + Math.random();
                return f.isMetrikaPlayer() || (k.on(h, "mousemove", L), k.on(h, "click,dblclick,mousedown", la), 
                k.on(h, "mouseup", O), k.on(g, "scroll", v), "onmousewheel" in h ? k.on(h, "mousewheel", Ba) : k.on(h, "wheel", Ba), 
                k.on(g, "beforeunload", D), pb || k.on(g, "unload", D), k.on(g, "resize", J), k.on(h, "keydown", Oa), 
                k.on(h, "keypress", Pa), k.on(h, "copy", Fa), k.on(h, "touchmove,touchstart", Ha), 
                h.body && k.on(h, "mouseleave", Sa), h.attachEvent && !g.opera ? (k.on(h, "focusin", Qa), 
                k.on(h, "focusout", Ra)) : (k.on(g, "focus", Ga), k.on(g, "blur", sa), k.on(h, "blur", sa)), 
                h.addEventListener ? (k.on(h, "scroll", C), k.on(h, "focus", ya), k.on(h, "blur", za), 
                k.on(h, "change", Aa), k.on(h, "submit", ta)) : h.attachEvent && (k.on(h, "focusin", ya), 
                k.on(h, "focusout", za), function() {
                    for (var a = h.getElementsByTagName("form"), b = 0; b < a.length; b++) {
                        for (var c = a[b].getElementsByTagName("*"), d = 0; d < c.length; d++) /^INPUT|SELECT|TEXTAREA$/.test(c[d].tagName) && k.on(c[d], "change", Aa);
                        k.on(a[b], "submit", ta);
                    }
                }()), function() {
                    var a = h.getElementsByTagName("form");
                    if (a.length) for (var b = 0; b < a.length; b++) {
                        var c = a[b].submit;
                        ("function" == typeof c || "object" == typeof c && /^\s*function submit\(\)/.test(String(c))) && (a[b][Ca] = c, 
                        a[b].submit = function() {
                            return ta({
                                target: this
                            }), this[Ca]();
                        });
                    }
                }(), "0:0" != n.getDocumentScroll().join(":") && v(), J()), {
                    start: function() {
                        na.activate();
                    },
                    stop: function() {
                        na.clear(), k.un(h, "mousemove", L), k.un(h, "click,dblclick,mousedown", la), k.un(h, "mouseup", O), 
                        k.un(h, "mousewheel", Ba), k.un(h, "wheel", Ba), k.un(g, "scroll", v), k.un(g, "beforeunload", D), 
                        k.un(g, "unload", D), k.un(g, "resize", J), k.un(h, "keydown", Oa), k.un(h, "keypress", Pa), 
                        k.un(h, "copy", Fa), k.un(h, "touchmove", Ha), k.un(h, "touchstart", Ha), h.body && k.un(h, "mouseleave", Sa), 
                        k.un(h, "focusin", Qa), k.un(h, "focusout", Ra), k.un(g, "focus", Ga), k.un(g, "blur", sa), 
                        k.un(h, "blur", sa), h.removeEventListener ? (k.un(h, "scroll", C), k.un(h, "focus", ya), 
                        k.un(h, "blur", za), k.un(h, "change", Aa), k.un(h, "submit", ta)) : h.detachEvent && (k.un(h, "focusin", ya), 
                        k.un(h, "focusout", za), function() {
                            for (var a = h.getElementsByTagName("form"), b = 0; b < a.length; b++) {
                                for (var c = a[b].getElementsByTagName("*"), d = 0; d < c.length; d++) /^INPUT|SELECT|TEXTAREA$/.test(c[d].tagName) && k.un(c[d], "change", Aa);
                                k.un(a[b], "submit", ta);
                            }
                        }()), function() {
                            for (var a = h.getElementsByTagName("form"), b = 0; b < a.length; b++) a[b][Ca] && (a[b].submit = a[b][Ca]);
                        }();
                    },
                    uploadPages: function(a, b) {
                        function c() {
                            k.un(h, "DOMContentLoaded", c), k.un(g, "load", c);
                            for (var e = a.split(/\n/), f = z().href, l = /regexp:/, m = 0; m < e.length; m++) {
                                var p = e[m];
                                if (p) if (l.test(p)) {
                                    p = Ua(p.replace(l, ""));
                                    try {
                                        var v = new RegExp(p);
                                    } catch (Lb) {}
                                    if (v && v.test(f)) {
                                        d.uploadPage(b);
                                        break;
                                    }
                                } else if (-1 !== f.indexOf(p)) {
                                    d.uploadPage(b);
                                    break;
                                }
                            }
                        }
                        var d = this;
                        "complete" == h.readyState ? c() : (k.on(h, "DOMContentLoaded", c), k.on(g, "load", c));
                    },
                    uploadPage: t(function(e) {
                        if ("function" == typeof g.toStaticHTML && -1 < g.toStaticHTML.toString().indexOf("NoScript")) return !1;
                        var f = h.documentElement;
                        if (f && 19e4 < ("" + f.innerHTML).length) return !1;
                        var l = g.XMLHttpRequest ? new g.XMLHttpRequest() : new ActiveXObject("Msxml2.XMLHTTP"), m = n.getDocumentCharset(), p = "text/html" + (m ? ";charset=" + m : ""), v = new qb({
                            protocol: a,
                            counterId: b,
                            counterType: c
                        });
                        return "html" == e ? (e = RegExp("<script [^>]*?//mc\\.yandex\\.ru/watch/.*?</script>", "gi"), 
                        v.sendContent(n.getDocumentHTML().replace(e, ""), p, d, ua, va), !0) : (l && (l.open("get", z().href, !0), 
                        l.onreadystatechange = t(function() {
                            if (4 == l.readyState) {
                                var a = l.getResponseHeader("content-type") || "";
                                m && -1 === a.indexOf("charset=") && (a = p), v.sendContent(l.responseText, a, d, ua, va);
                            }
                        }, "updatePage.1"), l.overrideMimeType && m && l.overrideMimeType(p), l.send(null)), 
                        !0);
                    }, "uploadPage")
                };
            }
            function t(a, b, c) {
                return function() {
                    try {
                        return a.apply(this, arguments);
                    } catch (d) {
                        c || Va(d, b);
                    }
                };
            }
            function Va(a, b) {
                var c;
                if (.01 > Math.random()) try {
                    new X().log("jserrs", O, a.message, b, A.href, "", "string" == typeof a.stack && a.stack.replace(/\n/g, "\\n"));
                } catch (d) {
                    c = [ "cp: " + b, a.name + ": " + a.message, "debug: ", "code: " + O, "stack: " + a.stack ], 
                    new Image().src = "//an.yandex.ru/jserr/101500?cnt-class=100&errmsg=" + encodeURIComponent(c.join("; ").replace(/\r?\n/g, "\\n"));
                }
            }
            function rb(a, b, c) {
                return g.setTimeout(t(a, c || "setTimeout"), b);
            }
            function z() {
                for (var e, f, a = {}, b = "hash host hostname href pathname port protocol search".split(" "), c = b.length, d = c; d--; ) a[b[d]] = "";
                try {
                    for (e = g.location, d = c; d--; ) f = b[d], a[f] = "" + e[f];
                } catch (m) {
                    A && (a = A);
                }
                return a;
            }
            function Ua(a) {
                return a ? ("" + a).replace(/^\s+/, "").replace(/\s+$/, "") : "";
            }
            function Wa() {
                return -1 != z().hostname.search(/(?:^|\.)(?:ya|yandex)\.(?:\w+|com\.\w+)$/);
            }
            function Z(a) {
                return -1 !== ("" + g.navigator.userAgent).toLowerCase().search(a);
            }
            function Q(a) {
                var b, c = a.length, d = "";
                for (b = 0; b < c; b++) d += String.fromCharCode(a.charCodeAt(b) + 50);
                return G.encode(U.encode(d));
            }
            function E(a) {
                var b, c, d = "";
                for (a = G.decode(a), b = 0, c = a.length; b < c; b++) d += String.fromCharCode(a.charCodeAt(b) - 50);
                return d;
            }
            function Xa(a) {
                return Ua(a && a.innerHTML && a.innerHTML.replace(/<\/?[^>]+>/gi, ""));
            }
            function Za(a, b) {
                var c, d;
                if (!a || !b) return !1;
                for (c = [], d = 0; d < b.length; d++) c.push(b[d].replace(/\^/g, "\\^").replace(/\$/g, "\\$").replace(/\./g, "\\.").replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\|/g, "\\|").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\?/g, "\\?").replace(/\*/g, "\\*").replace(/\+/g, "\\+").replace(/\{/g, "\\{").replace(/\}/g, "\\}"));
                return new RegExp("\\.(" + c.join("|") + ")$", "i").test(a);
            }
            function sb(a) {
                a = a.target || a.srcElement;
                var b;
                if (!a) return !1;
                for (3 == a.nodeType && (a = a.parentNode), b = a && a.nodeName && a.nodeName.toString().toLowerCase(); a && a.parentNode && a.parentNode.nodeName && ("a" != b && "area" != b || !a.href); ) b = (a = a.parentNode) && a.nodeName && a.nodeName.toString().toLowerCase();
                return !!a.href && a;
            }
            function tb(a, b) {
                return (a ? a.replace(/^www\./, "") : "").toLowerCase() == (b ? b.replace(/^www\./, "") : "").toLowerCase();
            }
            function ub(a, b) {
                function c(a) {
                    return a = a.split(":"), a = a[1] || "", a = a.replace(/^\/*/, "").replace(/^www\./, ""), 
                    a.split("/")[0];
                }
                return a && b ? c(a) == c(b) : !a && !b;
            }
            function $a() {
                var b, a = g.performance || g.webkitPerformance, c = [];
                if ((a = a && a.timing) && (b = a.navigationStart)) for (c = [ a.domainLookupEnd - a.domainLookupStart, a.connectEnd - a.connectStart, a.responseStart - a.requestStart, a.responseEnd - a.responseStart, a.fetchStart - b, a.redirectEnd - a.redirectStart, a.redirectCount ], 
                c.push(a.domInteractive && a.domLoading ? a.domInteractive - a.domLoading : null), 
                c.push(a.domContentLoadedEventStart && a.domContentLoadedEventEnd ? a.domContentLoadedEventEnd - a.domContentLoadedEventStart : null), 
                c.push(a.domComplete ? a.domComplete - b : null), c.push(a.loadEventStart ? a.loadEventStart - b : null), 
                c.push(a.loadEventStart && a.loadEventEnd ? a.loadEventEnd - a.loadEventStart : null), 
                c.push(a.domContentLoadedEventStart ? a.domContentLoadedEventStart - b : null), 
                a = 0; a < c.length; a++) b = c[a], null !== b && (0 > b || 36e5 < b) && (c[a] = null);
                return c;
            }
            function vb(a) {
                var e, f, b = [], c = a._lastPerformanceTiming, d = $a();
                if (c) for (e = 0, f = c.length; e < f; e++) null === d[e] ? b.push(d[e]) : b.push(c[e] === d[e] ? "" : d[e]); else b = d;
                return a._lastPerformanceTiming = d, b.join(",");
            }
            function wb() {
                var a;
                if ("object" == typeof g.chrome && g.chrome.loadTimes) {
                    if (a = g.chrome.loadTimes(), a.requestTime && a.firstPaintTime) return ~~(1e3 * (a.firstPaintTime - a.requestTime));
                } else if (g.performance && g.performance.timing && (a = g.performance.timing, a.navigationStart && a.msFirstPaint)) return a.msFirstPaint - a.navigationStart;
                return null;
            }
            function xb(a) {
                var c, d, e, l, m, b = h.referrer || "";
                if (new RegExp("^https?://" + A.host + "/").test(b)) return !1;
                for (c = a.patterns, l = 0; l < c.length; l++) if (d = new RegExp(c[l], "i"), b.match(d)) {
                    if (d = a.params || [], !d.length) return !0;
                    for (e = f.safeDecodeURIComponent((RegExp.$1 || "").replace(/\+/g, "%20")), m = 0; m < d.length; m++) if (e == f.safeDecodeURIComponent(d[m])) return !0;
                }
                return !1;
            }
            function ab(a, b) {
                var d, e, f, m, c = !1;
                if (a && "string" != typeof a && a.length) for (m = 0; m < a.length; m++) if (d = a[m].selector, 
                e = a[m].text, f = d.charAt(0), d = d.slice(1), "#" == f) (f = h.getElementById(d)) && (c = !0, 
                b && R.unshift([ f, f.innerHTML ]), f.innerHTML = e); else if ("." == f) for (f = n.getElementsByClassName(d), 
                d = 0; d < f.length; d++) {
                    var c = !0, g = f[d], k = e;
                    b && R.unshift([ g, g.innerHTML ]), g.innerHTML = k;
                }
                return c;
            }
            function bb() {
                var a;
                for (a = 0; a < R.length; a++) R[a][0].innerHTML = R[a][1];
            }
            function yb(a, b) {
                var c, d, l, m, g, e = "";
                if (a = a && a.replace(/^\?/, ""), b = b && b.replace(/^#/, "") || "", a) for (d = a.split("&"), 
                c = 0; c < d.length; c++) g = d[c].split("="), "_openstat" === g[0] && (e = g[1]);
                for (l = b.split("?"), c = 0; c < l.length; c++) for (m = l[c].split("&"), d = 0; d < m.length; d++) g = m[d].split("="), 
                "_openstat" === g[0] && (e = g[1]);
                return e && (e = -1 < e.indexOf(";") ? f.safeDecodeURIComponent(e) : U.decode(G.decode(e.replace(/[-*_]/g, function(a) {
                    return {
                        "*": "+",
                        "-": "/",
                        _: "="
                    }[a] || a;
                })))), e && (c = e.split(";"), 4 == c.length) ? {
                    service: c[0],
                    campaign: c[1],
                    ad: c[2],
                    source: c[3]
                } : null;
            }
            var f = {
                mixin: function(a) {
                    var b, c;
                    for (b = 1; b < arguments.length; b++) if (arguments[b]) {
                        for (c in arguments[b]) arguments[b].hasOwnProperty(c) && (a[c] = arguments[b][c]);
                        arguments[b].hasOwnProperty("toString") && (a.toString = arguments[b].toString);
                    }
                    return a;
                }
            }, x = function(a) {
                a = a || {}, f.mixin(this, a), this._initComponent();
            };
            x.prototype._initComponent = function() {}, x.inherit = function(a) {
                var b, c;
                return a = a || {}, b = "function" == typeof this ? this : Object, a.hasOwnProperty("constructor") || (a.constructor = function() {
                    b.apply(this, arguments);
                }), c = function() {}, c.prototype = b.prototype, a.constructor.prototype = new c(), 
                f.mixin(a.constructor.prototype, a), a.constructor.prototype.constructor = a.constructor, 
                a.constructor.superclass = b.prototype, a.constructor.inherit = x.inherit, a.constructor;
            }, f.isArray = function(a) {
                return "function" == typeof Array.isArray ? Array.isArray(a) : "[object Array]" == Object.prototype.toString.call(a);
            }, f.mergeArrays = function(a) {
                var b, c, e, d = arguments.length;
                for (b = 1; b < d; b++) if (e = arguments[b], f.isArray(e) || e && "[object Arguments]" === e.toString()) for (c = 0; c < e.length; c++) a[a.length] = e[c];
                return a;
            }, f.getNativeFunction = function(a, b) {
                var c;
                return b = b || g, (c = b.constructor && b.constructor.prototype && b.constructor.prototype[a] || b[a]) && "apply" in c ? function() {
                    return c.apply(b, arguments);
                } : function() {};
            }, f.setTimeout = function(a, b, c) {
                return f.getNativeFunction("setTimeout")(t(a, c || "setTimeout"), b);
            }, f.defer = function(a, b, c, d, e) {
                return f.setTimeout(function() {
                    a.apply(c, d || []);
                }, b, e);
            }, f.throttle = function(a, b, c, d) {
                var e, l, m;
                return function() {
                    l = arguments, m = this, e || function() {
                        e = null, l && (a.apply(c || m, l), l = null, e = f.setTimeout(arguments.callee, b, d));
                    }();
                };
            };
            var cb = x.inherit({
                storage: null,
                storageKey: "dataBuffer",
                maxBufferSize: 255,
                flushTimeout: 1e4,
                active: !0,
                meta: null,
                onFlush: function() {},
                onFlushCtx: null,
                bufferExpireTime: 864e5,
                _initComponent: function() {
                    var a;
                    cb.superclass._initComponent.apply(this, arguments), this._data = [], this._packetNumber = 0, 
                    this._flushTID = null, this._saveToStorageThrottled = f.throttle(this._saveToStorage, 300, this, "DataBuffer._saveToStorage"), 
                    this.storage && ((a = this.storage.get(this.storageKey)) && a.data && a.meta && a.time && a.time + this.bufferExpireTime > +new Date() && this.onFlush.call(this.onFlushCtx || this, a.data, a.meta, a.pnum), 
                    this.clear());
                },
                getFlushSize: function() {
                    return this._data.length;
                },
                append: function(a, b) {
                    f.mergeArrays(this._data, a), this._saveToStorageThrottled(), this.active && ((b || this.getFlushSize() >= this.maxBufferSize) && this._flush(), 
                    this._flushTID || (this._flushTID = f.defer(this._flush, this.flushTimeout, this, [], "DataBuffer._flush")));
                },
                activate: function() {
                    this.active || (this.active = !0, this.append([]));
                },
                clear: function() {
                    this._data.length = 0, this._flushTID = null, this.storage && this.storage.remove(this.storageKey);
                },
                _flush: function() {
                    this.onFlush.call(this.onFlushCtx || this, this._data, this.meta, this._packetNumber), 
                    this._packetNumber++, this.clear();
                },
                _saveToStorage: function() {
                    this.storage && this._data.length && this.storage.set(this.storageKey, {
                        data: this._data,
                        meta: this.meta,
                        pnum: this._packetNumber,
                        time: +new Date()
                    });
                }
            }), pa = x.inherit({
                transports: [],
                postParams: [],
                dontSendRequests: !1,
                send: function(a, b, c, d) {
                    c = c || function() {}, this.dontSendRequests ? c.call(d) : function l(f) {
                        var m;
                        if (f < this.transports.length) try {
                            m = new this.transports[f]({
                                postParams: this.postParams
                            }), m.request(a, b, function(a, b, m) {
                                a ? c.call(d, b, m) : l.call(this, f + 1);
                            }, this);
                        } catch (q) {
                            Va(q, "send by " + (m && m.id)), l.call(this, f + 1);
                        }
                    }.call(this, 0);
                }
            }), aa = {
                stringify: function(a) {
                    var c, d, e, b = [];
                    for (c in a) if (a.hasOwnProperty(c)) if (d = a[c], f.isArray(d)) for (e = 0; e < d.length; e++) b.push(encodeURIComponent(c) + "=" + encodeURIComponent(String(d[e]))); else b.push(encodeURIComponent(c) + "=" + encodeURIComponent(String(d)));
                    return b.join("&");
                }
            };
            f.forEachKey = function(a, b, c) {
                for (var d in a) a.hasOwnProperty(d) && b.call(c, d, a[d], a);
            }, f.inArray = function(a, b) {
                var c;
                for (c = 0; c < a.length; c++) if (a[c] == b) return !0;
                return !1;
            };
            var V = x.inherit({
                postParams: [],
                _buildUrl: function(a, b) {
                    var c = aa.stringify(b);
                    return a + (-1 < a.indexOf("?") ? "&" : c ? "?" : "") + c;
                },
                _splitParams: function(a) {
                    var b = {}, c = {};
                    return f.forEachKey(a, function(a, e) {
                        f.inArray(this.postParams, a) ? c[a] = e : b[a] = e;
                    }, this), {
                        get: b,
                        post: c
                    };
                }
            }), qa = V.inherit({
                id: "XHR",
                method: "POST",
                withCredentials: !0,
                request: function(a, b, c, d) {
                    var e, f;
                    if (/[^a-z0-9.:-]/.test(A.host) && g.opera && "function" == typeof g.opera.version && (e = g.opera.version(), 
                    "string" == typeof e && "12" == e.split(".")[0])) return c.call(d, !1);
                    if (g.XMLHttpRequest && (f = new XMLHttpRequest(), "withCredentials" in f)) {
                        b = this._splitParams(b), a = this._buildUrl(a, b.get);
                        try {
                            f.open(this.method, a, !0);
                        } catch (m) {
                            return c.call(d, !1);
                        }
                        return f.withCredentials = this.withCredentials, this._setHeaders(f), f.send(this._preparePostParams(b)), 
                        void (f.onreadystatechange = function() {
                            4 == f.readyState && c.call(d, 200 == f.status, f.responseText);
                        });
                    }
                    c.call(d, !1);
                },
                setMethod: function(a) {
                    this.method = a;
                },
                _preparePostParams: function(a) {
                    return aa.stringify(a.post);
                },
                _setHeaders: function(a) {
                    a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                }
            });
            f.random = function(a, b) {
                return 2 > arguments.length && (b = a, a = 0), 1 > arguments.length && (b = 1073741824), 
                Math.floor(Math.random() * (b - a)) + a;
            };
            var W = V.inherit({
                id: "form",
                enctype: "application/x-www-form-urlencoded",
                htmlfileOnly: !1,
                _initComponent: function() {
                    W.superclass._initComponent.apply(this, arguments), "_htmlfile" in W.prototype || (W.prototype._htmlfile = this._createHtmlfile()), 
                    this._doc = this._htmlfile || (this.htmlfileOnly ? null : h);
                },
                request: function(a, b, c, d) {
                    var l, m, g, h, e = this._doc;
                    return e ? (b = this._splitParams(b), l = "ifr" + f.random(), m = e.createElement("div"), 
                    m.style.position = "absolute", m.style.left = "-99999px", m.style.top = "-99999px", 
                    g = [ '<iframe name="', l, '"></iframe>', '<form action="', this._buildUrl(a, b.get), '" method="post" target="', l, '" enctype="', this.enctype, '">' ], 
                    f.forEachKey(b.post, function(a) {
                        f.mergeArrays(g, [ '<input type="hidden" autocomplete="off" autocorrect="off"', ' autocapitalize="off" spellcheck="false" name="', a, '"/>' ]);
                    }), f.mergeArrays(g, [ "</form>" ]), m.innerHTML = g.join(""), e.body.appendChild(m), 
                    h = m.getElementsByTagName("form")[0], f.forEachKey(b.post, function(a, b) {
                        h[a].value = b;
                    }), h.submit(), f.setTimeout(function() {
                        e.body.removeChild(m);
                    }, 1e4, "TransportForm.request.2"), c.call(d, !0)) : c.call(d, !1);
                },
                _createHtmlfile: function() {
                    var a;
                    try {
                        if (g.ActiveXObject) return a = new ActiveXObject("htmlfile"), a.open(), a.write("<html><body></body></html>"), 
                        a.close(), a;
                    } catch (b) {}
                    return null;
                }
            }), zb = W.inherit({
                id: "htmlfile",
                htmlfileOnly: !0
            }), wa = V.inherit({
                id: "img",
                request: function(a, b, c, d) {
                    a = this._buildUrl(a, b), b = h.createElement("img"), c = c || function() {}, b.onload = t(function() {
                        c.call(d, !0);
                    }, "TransportImage.request"), b.onerror = t(function() {
                        c.call(d, !1);
                    }, "TransportImage.request"), b.src = a;
                }
            }), ba = {
                stringify: function(a) {
                    try {
                        return JSON.stringify(a);
                    } catch (b) {
                        return "null";
                    }
                }
            };
            f.toJSON = function(a) {
                var b, c, d;
                if (a === Y) return "";
                if (null === a) return "null";
                switch (a.constructor) {
                  case Boolean:
                    return a.toString();

                  case Number:
                    return isFinite(a) ? a.toString() : "null";

                  case String:
                    return '"' + a.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';

                  case Array:
                    for (b = [], c = 0, d = a.length; c < d; c++) b[b.length] = f.toJSON(a[c]);
                    return "[" + b.join(",") + "]";

                  case Object:
                    b = [];
                    for (c in a) a.hasOwnProperty(c) && a[c] !== Y && (b[b.length] = f.toJSON(c) + ":" + f.toJSON(a[c]));
                    return "{" + b.join(",") + "}";

                  default:
                    ba.stringify(a);
                }
            };
            var P = x.inherit({
                counterId: "",
                _initComponent: function() {
                    P.superclass._initComponent.apply(this, arguments), this._ls = null;
                    try {
                        this._ls = g.localStorage;
                    } catch (a) {}
                },
                set: function(a, b) {
                    if (this.isEnabled()) try {
                        !b || b && f.isArray(b) && !b.length ? this.remove(a) : this._ls.setItem(this._getLsKey(a), f.toJSON(b));
                    } catch (c) {}
                },
                get: function(a) {
                    if (this.isEnabled()) try {
                        return JSON.parse(this._ls.getItem(this._getLsKey(a)));
                    } catch (b) {}
                    return null;
                },
                remove: function(a) {
                    if (this.isEnabled()) try {
                        this._ls.removeItem(this._getLsKey(a));
                    } catch (b) {}
                },
                isEnabled: function() {
                    return this._ls && g.JSON && "object" == typeof this._ls && "object" == typeof g.JSON;
                },
                getStorageId: function() {
                    var a = this.get("lsid");
                    return a || (a = Math.round(Math.random() * new Date()), this.set("lsid", a)), a;
                },
                clearStorageId: function() {
                    this.remove("lsid");
                },
                _getLsKey: function(a) {
                    return "_ym" + this.counterId + "_" + a;
                }
            }), S = x.inherit({
                counterId: "",
                onlyCurrentDomain: !1,
                skipPrefix: !1,
                _initComponent: function() {
                    var a, b;
                    if (S.superclass._initComponent.apply(this, arguments), this._domain = null, !this.onlyCurrentDomain) for (a = A.host.split("."), 
                    b = 2; ;) {
                        if (!(b <= a.length)) {
                            this._domain = null;
                            break;
                        }
                        if (this._domain = "." + a.slice(-b).join("."), b++, this.isEnabled()) break;
                    }
                },
                create: function(a, b, c) {
                    a = [ this._prepareName(a) + "=" + encodeURIComponent(b) ], c && (b = new Date(), 
                    b.setTime(b.getTime() + 6e4 * c), a.push("expires=" + b.toGMTString())), this._domain && a.push("domain=" + this._domain), 
                    a.push("path=/");
                    try {
                        h.cookie = a.join(";");
                    } catch (d) {}
                },
                read: function(a) {
                    var b;
                    try {
                        b = h.cookie;
                    } catch (c) {}
                    return b && b.match(new RegExp("(?:^|;\\s*)" + this._prepareName(a) + "=([^;]*)")) ? decodeURIComponent(RegExp.$1) : null;
                },
                erase: function(a) {
                    this.create(a, "", -1);
                },
                isEnabled: function() {
                    var a;
                    return this.create("metrika_enabled", "1", 60), a = !!this.read("metrika_enabled"), 
                    this.erase("metrika_enabled"), a;
                },
                _prepareName: function(a) {
                    return (this.skipPrefix ? "" : "_ym_") + a + (this.counterId ? "_" + this.counterId : "");
                }
            });
            S.isEnabled = function() {
                return new S({
                    onlyCurrentDomain: !0
                }).isEnabled();
            };
            var F = pa.inherit({
                protocol: "",
                host: "mc.yandex.ru",
                resource: "",
                counterId: "",
                counterType: 0,
                retry: !1,
                transports: [ qa, wa, zb ],
                _initComponent: function() {
                    F.superclass._initComponent.apply(this, arguments), this.retry && (this._storage = new P());
                },
                send: function(a, b, c, d) {
                    var e = this._registerRequest(a, b);
                    this._sendSavedRequest(e, a, b, c, d);
                },
                _sendSavedRequest: function(a, b, c, d, e) {
                    var m, h, l = g.Ya._metrika.firstReqStatus;
                    return "process" != l ? (l || (g.Ya._metrika.firstReqStatus = "process"), l = {}, 
                    this.counterType && (l["cnt-class"] = this.counterType), f.mixin(l, b), c.st = Math.round(new Date().getTime() / 1e3), 
                    c.u = F._userID, m = [ this.protocol, "//", this.host, "/" + this.resource + "/" + this.counterId ].join(""), 
                    h = [], c && (f.forEachKey(c, function(a, b) {
                        "t" != a && f.mergeArrays(h, [ a, b ]);
                    }), c.t && f.mergeArrays(h, [ "t", c.t ])), h.length && (l["browser-info"] = h.join(":")), 
                    F.superclass.send.call(this, m, l, function() {
                        var b, c;
                        if (g.Ya._metrika.firstReqStatus = "complete", this._unregisterRequest(a), b = g.Ya._metrika.firstReqCallbacks, 
                        g.Ya._metrika.firstReqCallbacks = null, b) for (c = 0; c < b.length; c++) b[c][0]._sendSavedRequest.apply(b[c][0], b[c][1]);
                        d && d.apply(e, arguments);
                    }, this)) : void (g.Ya._metrika.firstReqCallbacks = f.mergeArrays(g.Ya._metrika.firstReqCallbacks || [], [ [ this, arguments ] ]));
                },
                _isRetryEnabled: function() {
                    return this.retry && this._storage && this._storage.isEnabled();
                },
                _registerRequest: function(a, b) {
                    var c, d;
                    if (this._isRetryEnabled()) {
                        for (b.rqnl = b.rqnl || 0, b.rqnl++, c = this._storage.get("retryReqs") || {}, d = 1; c[d]; ) d++;
                        return c[d] = {
                            protocol: this.protocol,
                            host: this.host,
                            resource: this.resource,
                            counterId: this.counterId,
                            counterType: this.counterType,
                            postParams: this.postParams,
                            params: a,
                            browserInfo: b,
                            ghid: Ya._globalMetrikaHitId,
                            time: +new Date()
                        }, this._storage.set("retryReqs", c), d;
                    }
                },
                _unregisterRequest: function(a) {
                    var b;
                    a && this._isRetryEnabled() && (b = this._storage.get("retryReqs") || {}, b[a] && (delete b[a], 
                    this._storage.set("retryReqs", b)));
                },
                _getVersion: t(function() {
                    return O;
                }, "", !0)
            });
            F.initCookie = function() {
                var a = new S(), b = a.read("uid");
                b || (b = Math.round(new Date().getTime() / 1e3), b = b + "" + f.random(), a.create("uid", b, 1036800)), 
                F._userID = b;
            }, F.retransmit = function() {
                var c, a = new P(), b = a.get("retryReqs") || {};
                a.remove("retryReqs"), f.forEachKey(b, function(a, b) {
                    g.Ya._metrika.firstReqStatus || (g.Ya._metrika.firstReqStatus = "complete"), b.ghid && b.ghid != Ya._globalMetrikaHitId && b.time && b.time + 864e5 > +new Date() && 2 >= b.browserInfo.rqnl && (c = new F({
                        protocol: b.protocol,
                        host: b.host,
                        resource: b.resource,
                        counterId: b.counterId,
                        counterType: b.counterType,
                        postParams: b.postParams || [],
                        retry: !0
                    }), c.send(b.params, b.browserInfo));
                });
            }, f.fletcher = function(a) {
                for (var f, m, g, b = a.length, c = 0, d = 255, e = 255; b; ) {
                    f = 21 < b ? 21 : b, b -= f;
                    do m = "string" == typeof a ? a.charCodeAt(c) : a[c], c++, 255 < m && (g = m >> 8, 
                    m &= 255, m ^= g), d += m, e += d; while (--f);
                    d = (255 & d) + (d >> 8), e = (255 & e) + (e >> 8);
                }
                return a = (255 & d) + (d >> 8) << 8 | (255 & e) + (e >> 8), 65535 == a ? 0 : a;
            };
            var G = {
                abc: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                tail: "+/=",
                tailSafe: "*-_",
                encode: function(a, b) {
                    var m, g, c = (G.abc + (b ? G.tailSafe : G.tail)).split(""), d = a.length, e = [], l = d - d % 3;
                    for (g = 0; g < l; g += 3) m = (a[g] << 16) + (a[g + 1] << 8) + a[g + 2], f.mergeArrays(e, [ c[m >> 18 & 63], c[m >> 12 & 63], c[m >> 6 & 63], c[63 & m] ]);
                    switch (d - l) {
                      case 1:
                        m = a[l] << 4, f.mergeArrays(e, [ c[m >> 6 & 63], c[63 & m], c[64], c[64] ]);
                        break;

                      case 2:
                        m = (a[l] << 10) + (a[l + 1] << 2), f.mergeArrays(e, [ c[m >> 12 & 63], c[m >> 6 & 63], c[63 & m], c[64] ]);
                    }
                    return e.join("");
                }
            };
            f.trim = function(a, b) {
                return a = String(a).replace(/^\s+|\s+$/g, ""), b && a.length > b && (a = a.substr(0, b)), 
                a;
            }, f.isFunction = function(a) {
                return "function" == typeof a;
            }, f.isString = function(a) {
                return "[object String]" == Object.prototype.toString.call(a);
            }, f.arrayIndexOf = function(a, b) {
                var c;
                for (c = 0; c < a.length; c++) if (a[c] === b) return c;
                return -1;
            }, f.isObject = function(a) {
                try {
                    return a && null !== a && "[object Object]" == Object.prototype.toString.call(a);
                } catch (b) {
                    return !1;
                }
            }, f._playerRegexp = /^.+\.mtproxy\.yandex\.net$/, f.isMetrikaPlayer = function() {
                return "MetrikaPlayer" == g.name || this._playerRegexp.test(g.location.hostname);
            };
            var n = {
                getDocumentCharset: function() {
                    return ("" + (h.characterSet || h.charset || "")).toLowerCase();
                },
                getRootElement: function() {
                    var a = h.documentElement;
                    return "CSS1Compat" == h.compatMode ? a : h.body || a;
                },
                getViewportSize: function() {
                    var a = n.getRootElement();
                    return [ a.clientWidth || g.innerWidth, a.clientHeight || g.innerHeight ];
                },
                getDocumentTitle: function() {
                    var a = h.title;
                    return "string" != typeof a && (a = (a = h.getElementsByTagName("title")) && a.length ? a[0].innerHTML : ""), 
                    a;
                }
            }, r = {
                _silverlightVersion: "",
                getSilverlightVersion: function() {
                    var a, b, c, d;
                    if (!r._silverlightVersion) if (g.ActiveXObject) try {
                        c = new ActiveXObject("AgControl.AgControl"), a = function(a, c, d, f) {
                            for (;b(a, c); ) c[d] += f;
                            c[d] -= f;
                        }, b = function(a, b) {
                            return a.isVersionSupported(b[0] + "." + b[1] + "." + b[2] + "." + b[3]);
                        }, d = [ 1, 0, 0, 0 ], a(c, d, 0, 1), a(c, d, 1, 1), a(c, d, 2, 1e4), a(c, d, 2, 1e3), 
                        a(c, d, 2, 100), a(c, d, 2, 10), a(c, d, 2, 1), a(c, d, 3, 1), r._silverlightVersion = d.join(".");
                    } catch (e) {} else a = g.navigator, (a = a.plugins && a.plugins["Silverlight Plug-In"]) && (r._silverlightVersion = a.description);
                    return r._silverlightVersion || "";
                },
                _flashVersion: 0,
                getFlashVersion: function() {
                    var a, b, c;
                    if (!r._flashVersion) if (a = g.navigator, "undefined" != typeof a.plugins && "object" == typeof a.plugins["Shockwave Flash"]) b = a.plugins["Shockwave Flash"], 
                    c = b.version, ((b = b.description) || c) && (a = a.mimeTypes, ("undefined" == typeof a || !a["application/x-shockwave-flash"] || a["application/x-shockwave-flash"].enabledPlugin) && (c ? r._flashVersion = c : b && (r._flashVersion = b.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".")))); else if ("undefined" != typeof g.ActiveXObject) try {
                        c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"), (b = c.GetVariable("$version")) && (r._flashVersion = b.split(" ")[1].replace(/,/g, ".").replace(/[^.\d]/g, ""));
                    } catch (d) {}
                    return r._flashVersion;
                },
                getLanguage: function() {
                    return (g.navigator ? navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage : "").toLowerCase();
                },
                getJavaEnabled: function() {
                    try {
                        return navigator.javaEnabled();
                    } catch (a) {
                        return !1;
                    }
                }
            };
            f.fnv32a = function(a) {
                var c, d, b = 2166136261;
                for (c = 0, d = a.length; c < d; ++c) b ^= a.charCodeAt(c), b += (b << 1) + (b << 4) + (b << 7) + (b << 8) + (b << 24);
                return b >>> 0;
            }, r.getFingerPrint = function() {
                var b, c, a = [];
                if (navigator.plugins && navigator.plugins.length) for (c = 0; c < navigator.plugins.length; c++) b = navigator.plugins[c], 
                f.mergeArrays(a, [ b.name, b.version, b.description, b.filename ]);
                if (navigator.mimeTypes && navigator.mimeTypes.length) for (c = 0; c < navigator.mimeTypes.length; c++) b = navigator.mimeTypes[c], 
                f.mergeArrays(a, [ b.type, b.description, b.suffixes ]);
                return f.fnv32a(a.join(";")) + "01";
            }, r.getPlatform = function() {
                var a = "";
                try {
                    a = "" + navigator.platform;
                } catch (b) {}
                return a;
            }, r.getNotificationPermission = function() {
                var a;
                try {
                    a = Notification.permission;
                } catch (b) {}
                switch (a) {
                  case "denied":
                    return 1;

                  case "granted":
                    return 2;
                }
            }, r.isIframe = function() {
                try {
                    return g.top != g.self;
                } catch (a) {
                    return !1;
                }
            }, r._nMap = {
                other: "0",
                none: "1",
                unknown: "2",
                wifi: "3",
                ethernet: "4",
                bluetooth: "5",
                cellular: "6",
                wimax: "7",
                mixed: "8"
            }, r.netType = function() {
                var a = (navigator.connection || {
                    type: ""
                }).type;
                return r._nMap[a] || a;
            }, r.isSafari = function() {
                try {
                    return navigator.vendor && -1 < navigator.vendor.indexOf("Apple") && navigator.userAgent && !navigator.userAgent.match("CriOS");
                } catch (a) {}
                return !1;
            }, n.removeNode = function(a) {
                var b = a && a.parentNode;
                b && b.removeChild(a);
            };
            var db = {
                url: "https://mc.yandex.ru/metrika/",
                _value: null,
                init: function() {
                    var a = this._getLs().read("isad");
                    a ? this._set(a) : this._getReqStatus() || this._send();
                },
                getVal: function() {
                    return this._value;
                },
                _set: function(a) {
                    this._value = "1" == a || "2" == a ? a : null;
                },
                _send: function() {
                    var a = h.createElement("img"), b = this;
                    a.onload = function() {
                        b._saveReq(!1), n.removeNode(this);
                    }, a.onerror = function() {
                        b._saveReq(!0), n.removeNode(this);
                    }, this._setReqStatus("process"), a.src = this.url + String.fromCharCode(97, 100, 118, 101, 114, 116, 46, 103, 105, 102), 
                    r.isSafari() && (a.style.position = "absolute", a.style.visibility = "hidden", a.style.width = "0px", 
                    a.style.height = "0px", n.getRootElement().appendChild(a));
                },
                _saveReq: function(a) {
                    this._value = a = a ? "1" : "2", this._setReqStatus("complete"), this._getLs().create("isad", a, 1200);
                },
                _setReqStatus: function(a) {
                    try {
                        g.Ya._metrika.adStatus = a;
                    } catch (b) {}
                },
                _getReqStatus: function() {
                    try {
                        return g.Ya._metrika.adStatus;
                    } catch (a) {
                        return "complete";
                    }
                },
                _getLs: function() {
                    return this._ls || (this._ls = new S()), this._ls;
                }
            }, U = {
                encode: function(a) {
                    var c, d, e, b = [];
                    for (c = 0, e = a.length; c < e; c++) d = a.charCodeAt(c), 128 > d ? b.push(d) : (127 < d && 2048 > d ? b.push(d >> 6 | 192) : (b.push(d >> 12 | 224), 
                    b.push(d >> 6 & 63 | 128)), b.push(63 & d | 128));
                    return b;
                },
                decode: function(a) {
                    for (var d, e, f, b = "", c = 0; c < a.length; ) d = a.charCodeAt(c), 128 > d ? (b += String.fromCharCode(d), 
                    c++) : 191 < d && 224 > d ? (e = a.charCodeAt(c + 1), b += String.fromCharCode((31 & d) << 6 | 63 & e), 
                    c += 2) : (e = a.charCodeAt(c + 1), f = a.charCodeAt(c + 2), b += String.fromCharCode((15 & d) << 12 | (63 & e) << 6 | 63 & f), 
                    c += 3);
                    return b;
                }
            };
            G.decode = function(a, b) {
                for (var f, g, h, k, p, c = G.abc + (b ? G.tailSafe : G.tail), d = 0, e = ""; a.length % 4; ) a += "=";
                do {
                    if (f = c.indexOf(a.charAt(d++)), g = c.indexOf(a.charAt(d++)), k = c.indexOf(a.charAt(d++)), 
                    p = c.indexOf(a.charAt(d++)), 0 > f || 0 > g || 0 > k || 0 > p) return null;
                    h = f << 18 | g << 12 | k << 6 | p, f = h >> 16 & 255, g = h >> 8 & 255, h &= 255, 
                    e = 64 == k ? e + String.fromCharCode(f) : 64 == p ? e + String.fromCharCode(f, g) : e + String.fromCharCode(f, g, h);
                } while (d < a.length);
                return e;
            }, ba.parse = function(a) {
                try {
                    return JSON.parse(a);
                } catch (b) {
                    return null;
                }
            };
            var ea = F.inherit({
                hitId: 0,
                trackHash: !1,
                trimParams: !1,
                webvisor: !1,
                counter: null,
                counterNum: 0,
                resource: "watch",
                retry: !0,
                postParams: [ "site-info" ],
                countersNoTitle: "22836271 1143050 29626870 9928105 26128362 29850769".split(" "),
                fake: !1,
                sendTitle: !0,
                _initComponent: function() {
                    ea.superclass._initComponent.apply(this, arguments), this._trackHash = this.trackHash, 
                    this._vid = [ E("Y2VkY2hr"), E("qJ0=") ], this._mue = [ E("ZGNpZ2U="), E("n5ObnqSn"), E("p6WXpJefk5ue") ], 
                    this._oid = [ E("Y2ZjZ2Nr"), E("VZqhoZ2RdZiZkXWnpKSXoKaHpZek"), E("oZuW") ], this._aid = [ E("ZWZkZmNrYmc="), E("maGhmZ6XppOZ"), E("oqeUk5al"), E("mZemhpOkmZemm6CZ"), E("h6Wblg==") ], 
                    "0" == "" + this.counterType && (this.sendTitle = -1 === f.arrayIndexOf(this.countersNoTitle, "" + this.counterId));
                },
                setTrackHash: function(a) {
                    this._trackHash = a;
                },
                sendHit: function(a) {
                    this._hitExt({
                        url: a.url,
                        title: a.title,
                        referrer: a.referrer,
                        vParams: a.vParams,
                        modes: {
                            ar: !0,
                            saveRef: !0,
                            pv: !0
                        },
                        callback: a.callback,
                        ctx: a.ctx
                    });
                },
                sendExperiments: function(a) {
                    this._hitExt({
                        url: z().href,
                        title: "",
                        referrer: "",
                        modes: {
                            ex: !0,
                            ar: !0
                        },
                        experiments: a.experiments,
                        callback: a.callback,
                        ctx: a.ctx
                    });
                },
                sendPrerenderHit: function(a) {
                    this._hitExt({
                        url: a.url,
                        title: a.title,
                        referrer: a.referrer,
                        modes: {
                            ar: !0,
                            pq: !0
                        }
                    });
                },
                sendAjaxHit: function(a) {
                    this._hitExt({
                        url: a.url,
                        title: a.title,
                        referrer: a.referrer,
                        modes: a.modes
                    });
                },
                sendParams: function(a, b, c) {
                    this._hitExt({
                        url: z().href,
                        title: "",
                        referrer: "",
                        vParams: a,
                        modes: {
                            ar: !0,
                            pa: !0,
                            onlyData: !0
                        },
                        callback: b,
                        ctx: c
                    });
                },
                sendGoal: function(a, b) {
                    var c, d, e;
                    /[\/&=?#]/.test(a) || (c = a ? "goal://" + z().hostname + "/" + encodeURIComponent(a) : z().href, 
                    d = n.getDocumentTitle(), e = a ? z().href : h.referrer, this._hitExt({
                        url: c,
                        title: d,
                        referrer: e,
                        vParams: b.vParams,
                        modes: {
                            ar: !0
                        },
                        callback: b.callback,
                        ctx: b.ctx
                    }));
                },
                sendClickLink: function(a) {
                    this._hitExt({
                        url: a.url,
                        title: a.title,
                        referrer: z().href,
                        modes: a.modes
                    });
                },
                sendExtLink: function(a) {
                    this._hitExt({
                        url: a.url,
                        title: a.title || "",
                        referrer: z().href,
                        vParams: a.vParams,
                        modes: {
                            ar: !0,
                            ln: !0,
                            ut: Ia
                        },
                        callback: a.callback,
                        ctx: a.ctx
                    });
                },
                sendFileUpload: function(a) {
                    this._hitExt({
                        url: a.url,
                        title: a.title || "",
                        referrer: z().href,
                        vParams: a.vParams,
                        modes: {
                            ar: !0,
                            ln: !0,
                            dl: !0
                        },
                        callback: a.callback,
                        ctx: a.ctx
                    });
                },
                sendNotBounce: function(a, b) {
                    this._hitExt({
                        url: z().href,
                        title: "",
                        referrer: "",
                        modes: {
                            cl: a,
                            ar: !0,
                            nb: !0,
                            onlyData: !0
                        },
                        callback: b.callback,
                        ctx: b.ctx
                    });
                },
                sendDevice: function(a) {
                    this._hitExt({
                        browserInfo: {
                            di: a.data,
                            dip: a.port
                        },
                        callback: a.callback,
                        ctx: a.ctx
                    });
                },
                _hitExt: function(a) {
                    function b(a, b) {
                        b && (h[a] = b);
                    }
                    var c, d, e, g, m, h, k;
                    f.isMetrikaPlayer() || (c = a.modes || {}, d = a.browserInfo || {}, g = "undefined" != typeof a.referrer ? a.referrer : fa.lastReferrer, 
                    m = a.url || "", h = {}, c.ar && !c.onlyData && (g = null === g || "" === g ? "" : this._prepareHitUrl(g), 
                    m = this._prepareHitUrl(a.url)), b("page-ref", f.trim(g, Ja)), b("page-url", f.trim(m, Ja)), 
                    Wa() ? b("ut", Ia) : "undefined" != typeof c.ut && b("ut", f.trim(c.ut, Ab)), b("exp", a.experiments), 
                    a.vParams && (m = f.toJSON(a.vParams), this.trimParams && m.length > Bb ? k = !0 : b("site-info", m)), 
                    c.saveRef && (fa.lastReferrer = g), this.fake || (e = this._getTechInfo(a.title, c, this.counterId, a.ts, a.tz, this._trackHash, this.hitId, this.webvisor, this.counter)), 
                    f.mixin(d, e, {}), this.send(h, d, function() {
                        k && this.counter.params(a.vParams), a.userParams && this.counter.userParams(a.userParams), 
                        f.isFunction(a.callback) && a.callback.apply(a.ctx, arguments);
                    }, this));
                },
                _prepareHitUrl: function(a) {
                    var d, b = z(), c = b.host, b = b.href;
                    return f.isString(a) ? -1 != a.search(/^\w+:\/\//) ? a : (d = a.charAt(0), "?" == d ? (d = b.search(/\?/), 
                    -1 == d ? b + a : b.substr(0, d) + a) : "#" == d ? (d = b.search(/#/), -1 == d ? b + a : b.substr(0, d) + a) : "/" != d ? (c = b.split("/"), 
                    c[c.length - 1] = a, c.join("/")) : (d = b.search(c), -1 != d ? b.substr(0, d + c.length) + a : a)) : b;
                },
                _getTechInfo: function(a, b, c, d, e, h, m, k, q) {
                    function l(a, b) {
                        a && b && (t[a] = b);
                    }
                    function ja(a) {
                        b[a] && l(a, "1");
                    }
                    var z, A, w, x, K, E, F, t = {};
                    b = b || {}, d = d || N.getTimestamp(), e = e || N.getTimezone(), l("j", r.getJavaEnabled() ? "1" : ""), 
                    l("nt", r.netType()), T && l("s", T.width + "x" + T.height + "x" + (T.colorDepth || T.pixelDepth)), 
                    g.devicePixelRatio && l("sk", g.devicePixelRatio), r.isIframe() && l("ifr", "1"), 
                    l("adb", db.getVal()), l("f", r.getFlashVersion()), l("l", r.getSilverlightVersion()), 
                    l("fpr", r.getFingerPrint()), l("cn", this.counterNum), b.pa || (z = n.getViewportSize(), 
                    l("w", z[0] + "x" + z[1]));
                    try {
                        A = this._vid, w = this.counterType, x = this.counterId, x == A[0] && 1 == w && f.isObject(g[A[1]]) && f.isNumber(g[A[1]].id) && l("vid", Q("" + g[A[1]].id)), 
                        K = this._mue, x == K[0] && 1 == w && f.isObject(g[K[1]]) && g[K[1]][K[2]] && l("mue", Q("" + g[K[1]][K[2]])), 
                        E = this._oid, x == E[0] && 1 == w && l("oid", Q(JSON.parse($(E[1]).contents()[0].data)[E[2]])), 
                        F = this._aid, x == F[0] && 0 == w && l("aid", Q(g[F[1]][F[2]]()[F[3]](F[4])[0]));
                    } catch (Da) {}
                    for (l("z", e), l("i", d), l("et", Math.round(new Date().getTime() / 1e3)), l("en", n.getDocumentCharset()), 
                    l("v", O), l("c", navigator.cookieEnabled ? "1" : ""), l("la", r.getLanguage()), 
                    l("ntf", r.getNotificationPermission()), f.random(100) || l("np", G.encode(U.encode(f.trim(r.getPlatform(), 100)))), 
                    h && l("wh", "1"), e = "ar ln dl ad nb pa pq pv ex".split(" "), d = 0; d < e.length; d++) ja(e[d]);
                    for (e = [ "va", "vt", "sn", "sa", "he" ], b.nb && e.push("cl"), d = 0; d < e.length; d++) h = e[d], 
                    l(h, b[h]);
                    if (e = new P({
                        counterId: c
                    }), e.isEnabled() && (c = e.getStorageId(), (d = e.get("reqNum")) ? d++ : d = 1, 
                    e.set("reqNum", d), e.get("reqNum") == d ? (l("ls", c), l("rqn", d)) : (e.remove("reqNum"), 
                    e.clearStorageId(), 1 < d && (l("ls", c), l("rqn", 0)))), l("rn", f.random()), l("hid", m), 
                    l("ds", vb(q)), q._firstPaint || (q._firstPaint = wb(), l("fp", q._firstPaint)), 
                    k) {
                        g.name || (g.name = Math.round(65535 * Math.random())), (m = +g.name) && (0 > m && (m *= -1), 
                        m %= 65535), l("wn", m || f.fletcher(g.name));
                        try {
                            g.history && l("hl", String(g.history.length));
                        } catch (Da) {}
                    }
                    return m = "", this.sendTitle && (m = this._getTitle(a)), l("t", m), t;
                },
                _getTitle: function(a) {
                    return a = "undefined" == typeof a ? (a = n.getDocumentTitle()) ? f.trim(a, eb) : "" : f.trim(a, eb);
                }
            });
            f.array2Props = function(a) {
                var e, f, b = a.length, c = {}, d = c;
                for (e = 0; e < b - 1; e++) f = a[e], d[f] = {}, e < b - 2 && (d = d[f]);
                return d[f] = a[b - 1], c;
            };
            var X = x.inherit({
                sampling: 1,
                counterId: 26302566,
                _initComponent: function() {
                    X.superclass._initComponent.apply(this, arguments), this._sender = new ea({
                        protocol: "https:",
                        counterId: this.counterId,
                        retry: !1,
                        counter: {}
                    });
                },
                log: function() {
                    this.logParams(f.array2Props(arguments));
                },
                logParams: function(a) {
                    Math.random() < this.sampling && this._sender.sendHit({
                        url: A.href,
                        title: "",
                        referrer: "",
                        vParams: a
                    });
                }
            }), Cb = F.inherit({
                resource: "webvisor",
                retry: !0,
                postParams: [ "wv-data" ],
                sendPacket: function(a, b, c, d, e, l, h, k) {
                    var m, p;
                    return !(!a || !a.length) && (m = G.encode(a, !0), 0 == m.indexOf("AAAAAAAAADw") && g.Error && (p = Error(), 
                    "string" == typeof p.stack && new X({
                        sampling: .1
                    }).log("bad visor packet 5", 1)), a = {
                        rn: f.random(),
                        "page-url": b,
                        wmode: 0,
                        "wv-type": 0,
                        "wv-hit": c,
                        "wv-part": d + 1,
                        "wv-check": f.fletcher(a),
                        "wv-data": m
                    }, e = {
                        v: this._getVersion(),
                        z: e,
                        i: l
                    }, this.send(a, e, h, k));
                }
            }), Ta = cb.inherit({
                protocol: "",
                counterId: "",
                counterType: "",
                meta: null,
                maxBufferSize: 7500,
                flushTimeout: 3e4,
                storageKey: "visorbuff",
                active: !1,
                _initComponent: function() {
                    this.storage = new P({
                        counterId: this.counterId
                    }), this._sender = new Cb({
                        protocol: this.protocol,
                        counterId: this.counterId,
                        counterType: this.counterType
                    }), Ta.superclass._initComponent.apply(this, arguments);
                },
                onFlush: function(a, b, c) {
                    this._sender.sendPacket(a, b.url, b.hitId, c, b.timezone, b.timestamp);
                }
            }), qb = F.inherit({
                resource: "webvisor",
                transports: [ qa, W ],
                postParams: [ "wv-data" ],
                sendContent: function(a, b, c, d, e, f, g) {
                    return !!a && (-1 < a.indexOf("\r") && (a = a.replace(/\r\n/g, "\n")), a = {
                        "wv-type": 1,
                        "page-url": z().href,
                        "wv-hit": c,
                        "wv-data": G.encode(U.encode(a))
                    }, !(245e3 < a["wv-data"].length) && this.send(a, {
                        z: d,
                        i: e,
                        pct: b || ""
                    }, f, g));
                }
            });
            f.isEqual = function(a, b) {
                var c = !0;
                return f.forEachKey(a, function(a, e) {
                    b.hasOwnProperty(a) && b[a] === e || (c = !1);
                }), c ? (f.forEachKey(b, function(b, e) {
                    a.hasOwnProperty(b) && a[b] === e || (c = !1);
                }), c) : c;
            };
            var k = x.inherit({
                _initComponent: function() {
                    k.superclass._initComponent.apply(this, arguments), this._listeners = [];
                },
                on: function(a, b, c, d, e) {
                    e = k._getOpts(e), b = b.split(",");
                    var n, q, p, f = b.length, h = this._listeners;
                    for (p = 0; p < f; p++) n = b[p], q = t(function(a) {
                        c.call(d || this, a || g.event);
                    }, "on" + n), h[h.length] = [ a, n, c, d, e, q ], a.addEventListener ? a.addEventListener(n, q, k._prepOpts(e)) : a.attachEvent && a.attachEvent("on" + n, q);
                },
                un: function(a, b, c, d, e) {
                    e = k._getOpts(e);
                    var n, q, g = this._listeners, h = g.length;
                    for (n = 0; n < h; n++) if (q = g[n], q[0] == a && q[1] == b && q[2] == c && q[3] == d && f.isEqual(q[4], e)) {
                        g.splice(n, 1), this._removeListener(a, b, q[5], e);
                        break;
                    }
                },
                unAll: function() {
                    var c, d, a = this._listeners, b = a.length;
                    for (d = 0; d < b; d++) c = a[d], this._removeListener(c[0], c[1], c[5], c[4]);
                    a.length = 0;
                },
                _removeListener: function(a, b, c, d) {
                    a.removeEventListener ? a.removeEventListener(b, c, k._prepOpts(d)) : a.detachEvent && a.detachEvent("on" + b, c);
                }
            });
            k.supportsPassive = function() {
                var a;
                if (k._supportsPassive !== Y) return k._supportsPassive;
                k._supportsPassive = !1;
                try {
                    a = Object.defineProperty({}, "passive", {
                        get: function() {
                            k._supportsPassive = !0;
                        }
                    }), g.addEventListener("test", null, a);
                } catch (b) {}
                return k._supportsPassive;
            }, k._getOpts = function(a) {
                return f.mixin({
                    capture: !0,
                    passive: !0
                }, a || {});
            }, k._prepOpts = function(a) {
                return k.supportsPassive() ? a : !!a.capture;
            }, k.on = function() {
                k._instance || (k._instance = new k()), k._instance.on.apply(k._instance, arguments);
            }, k.un = function() {
                k._instance && k._instance.un.apply(k._instance, arguments);
            }, n.getDocumentHTML = function() {
                var a, b = "";
                a = h.documentElement;
                var d, e, f, c = a.outerHTML;
                if (c) a = c; else {
                    for (c = a.attributes, d = "", e = 0; e < c.length; e++) (f = c[e]) && (d += " " + f.name + '="' + (f.value || "") + '"');
                    a = "<html" + d + ">" + a.innerHTML + "</html>";
                }
                return (c = h.doctype) && (b = c.publicId ? ' PUBLIC "' + c.publicId + '"' : "", 
                d = c.systemId ? ' "' + c.systemId + '"' : "", b = "<!DOCTYPE " + c.name + b + d + ">\n"), 
                b + a;
            }, n.getDocumentScroll = function() {
                return [ g.pageXOffset || h.documentElement && h.documentElement.scrollLeft || h.body && h.body.scrollLeft || 0, g.pageYOffset || h.documentElement && h.documentElement.scrollTop || h.body && h.body.scrollTop || 0 ];
            }, n.getElementParent = function(a) {
                var b;
                if (!a || a == h.documentElement) return null;
                if (a == h.body) return h.documentElement;
                b = null;
                try {
                    b = a.parentNode;
                } catch (c) {}
                return b;
            }, n.getElementChildren = function(a, b) {
                var d, e, g, h, k, c = [];
                if (a && (d = a.childNodes)) for (h = 0, k = d.length; h < k; h++) e = d[h], (g = "INPUT" == e.nodeName && e.type && "hidden" == e.type.toLocaleLowerCase()) || b && e.nodeName != b || f.mergeArrays(c, [ e ]);
                return c;
            }, n.getElementNeighborPosition = function(a) {
                var c, d, e, f, b = n.getElementParent(a);
                if (b) for (e = 0, b = b.childNodes, d = a && a.nodeName, f = 0; f < b.length; f++) if (c = b[f] && b[f].nodeName, 
                d == c) {
                    if (a == b[f]) return e;
                    e++;
                }
                return 0;
            }, n.getElementXY = function(a) {
                var b, c;
                if (!a || !a.ownerDocument || "PARAM" == a.tagName || a == h.body || a == h.documentElement) return [ 0, 0 ];
                if (a.getBoundingClientRect) return a = a.getBoundingClientRect(), b = n.getDocumentScroll(), 
                [ Math.round(a.left + b[0]), Math.round(a.top + b[1]) ];
                for (c = b = 0; a; ) b += a.offsetLeft, c += a.offsetTop, a = a.offsetParent;
                return [ b, c ];
            }, n.getDocumentSize = function() {
                var a = n.getRootElement(), b = n.getViewportSize();
                return [ Math.max(a.scrollWidth, b[0]), Math.max(a.scrollHeight, b[1]) ];
            }, n.getElementSize = function(a) {
                var b;
                return a == h.body || a == h.documentElement ? n.getDocumentSize() : (b = a.getBoundingClientRect && a.getBoundingClientRect()) ? [ b.width, b.height ] : [ a.offsetWidth, a.offsetHeight ];
            }, n.getElementRegion = function(a) {
                var b = n.getElementXY(a);
                return a = n.getElementSize(a), [ b[0], b[1], a[0], a[1] ];
            }, n.calcChildrenChecksum = function(a) {
                return f.fletcher((a.innerHTML || "").replace(/(<[^>]*>|[\u0000-\u0020])/g, ""));
            }, n.getFormNumber = function(a) {
                var c, d, b = h.getElementsByTagName("form");
                for (c = 0, d = b.length; c < d; c++) if (b[c] == a) return c;
                return -1;
            }, n.isEmptyField = function(a) {
                return "INPUT" == a.nodeName && "submit" != a.type && "image" != a.type && "hidden" != a.type ? "radio" == a.type || "checkbox" == a.type ? !a.checked : !a.value : "TEXTAREA" == a.nodeName ? !a.value : "SELECT" != a.nodeName || 0 > a.selectedIndex;
            }, n.calcTextChecksum = function(a) {
                var b = "";
                a = a.childNodes;
                var c, d;
                for (c = 0, d = a.length; c < d; c++) a[c] && 3 == a[c].nodeType && (b += a[c].nodeValue);
                return f.fletcher(b.replace(/[\u0000-\u0020]+/g, ""));
            }, n.calcAttribChecksum = function(a) {
                var d, b = "", c = "width height align title alt name".split(" ");
                for ("IMG" == a.tagName && (b += a.src.toLowerCase()), "A" == a.tagName && (b += a.href.toLowerCase()), 
                b += String(a.className || "").toLowerCase(), d = 0; d < c.length; d++) a.getAttribute && (b += String(a.getAttribute(c[d]) || "").toLowerCase());
                return f.fletcher(b.replace(/[\u0000-\u0020]+/g, ""));
            }, n.classNameExists = function(a, b) {
                try {
                    return new RegExp("(?:^|\\s)" + b + "(?:\\s|$)").test(a.className);
                } catch (c) {
                    return !1;
                }
            }, n.getElementsByClassName = function(a, b) {
                var c, d, e;
                for (b = b || h, c = b.getElementsByTagName("*"), d = [], e = 0; e < c.length; e++) n.classNameExists(c[e], a) && d.push(c[e]);
                return d;
            };
            var pb = !Z(/webkit/) && Z(/gecko/), fb = x.inherit({
                hid: 0,
                tz: 0,
                ts: 0,
                counterId: 0,
                counterType: 0,
                url: "",
                protocol: "",
                enabled: !1,
                _initComponent: function() {
                    var a, b;
                    this.isEnabled() && (a = this._getStorage(), b = a.read("visorc"), "b" != b && "w" != b && (b = ""), 
                    a.isEnabled() && !Z("opera mini") || (b = "b"), this._vc = b, "b" != b && (this._recorder = new lb(this.protocol, this.counterId, this.counterType, this.hid, this.counter)), 
                    fb.superclass._initComponent.apply(this, arguments));
                },
                start: function(a) {
                    var b, c;
                    this.isEnabled() && this._recorder && (a = a || {}, b = +a.recp, (!isFinite(b) || 0 > b || 1 < b) && (c = "w"), 
                    c || (c = this.hid % 1e4 / 1e4 < b ? "w" : "b"), this._getStorage().create("visorc", c, 30), 
                    "w" == c ? (this._recorder.start(), b = a.arch_type, (a = a.urls) && b && "none" != b && this._recorder.uploadPages(a, b)) : this._recorder.stop());
                },
                isEnabled: function() {
                    return this.enabled;
                },
                getVc: function() {
                    return this._vc;
                },
                _getStorage: function() {
                    return this._storage || (this._storage = new S({
                        counterId: this.counterId
                    })), this._storage;
                }
            }), gb = qa.inherit({
                id: "RawBodyXHR",
                postParams: [ "body" ],
                _setHeaders: function() {},
                _preparePostParams: function(a) {
                    return a.post.body || "";
                }
            });
            f.arrayFilter = function(a, b, c) {
                var e, d = [];
                for (e = 0; e < a.length; e++) b.call(c, a[e], e, a) && d.push(a[e]);
                return d;
            }, f.arrDiff = function(a, b) {
                return f.arrayFilter(a, function(a) {
                    return -1 === f.arrayIndexOf(b, a);
                });
            }, f.getTld = function() {
                var a;
                return this._tld || (a = A.hostname.split("."), this._tld = a[a.length - 1]), this._tld;
            };
            var pa = V.inherit({
                id: "script",
                request: function(a, b, c, d) {
                    var e, l = f.getNativeFunction("createElement", h)("script");
                    return l ? (e = "_ymjsp" + f.random(), g[e] = t(function() {
                        try {
                            delete g[e];
                        } catch (m) {
                            g[e] = Y;
                        }
                        c.apply(d, f.mergeArrays([ !0 ], arguments)), l.parentNode && l.parentNode.removeChild(l);
                    }, "transport.script"), l.type = "text/javascript", l.src = this._buildUrl(a, f.mixin({
                        wmode: 5,
                        callback: e
                    }, b)), a = h.getElementsByTagName("head")[0], a || (a = h.createElement("head"), 
                    h.documentElement.appendChild(a)), a.insertBefore(l, a.firstChild), !0) : (c.call(d, !1), 
                    !1);
                }
            }), Ka = ea.inherit({
                transports: [ pa ],
                trimParams: !0,
                _initComponent: function() {
                    Ka.superclass._initComponent.apply(this, arguments), this._ilStorage = new P({
                        counterId: this.counterId
                    });
                },
                sendHit: function(a) {
                    var b = {}, c = this._ilStorage.get("il");
                    a.visitColor && (b.vc = a.visitColor), a.hasPrerender && (b.pr = 1), c && (this._ilStorage.remove("il"), 
                    b.ilt = G.encode(U.encode(f.trim(c, hb)))), this._hitExt({
                        url: a.url,
                        title: a.title,
                        referrer: a.referrer,
                        vParams: a.vParams,
                        userParams: a.userParams,
                        experiments: a.experiments,
                        modes: a.modes,
                        browserInfo: b,
                        ts: a.ts,
                        tz: a.tz,
                        callback: a.callback,
                        ctx: a.ctx
                    });
                }
            }), Db = x.inherit({
                cid: 3,
                cnt: 0,
                _initComponent: function() {
                    this._storage = new P();
                },
                hit: function(a) {
                    var b = this, c = this._storage.get("wasSynced");
                    c && c.time + 864e5 > +new Date() || g.Ya._metrika.fakeHit ? a() : (g.Ya._metrika.fakeHit = !0, 
                    this._getSender().sendHit({
                        callback: function() {
                            b._storage.set("wasSynced", {
                                time: +new Date()
                            }), a();
                        }
                    }));
                },
                _getSender: function() {
                    return this._sender || (this._sender = new Ka({
                        protocol: "https:",
                        counterType: this.cnt,
                        counterId: this.cid,
                        sendTitle: !1,
                        dontSendRequests: this.dontSendRequests,
                        fake: !0
                    })), this._sender;
                }
            }), Eb = x.inherit({
                baseUrl: "https://mc.yandex.",
                baseTld: "ru",
                syncTlds: [ "ua", "by", "kz", "com.tr" ],
                langToDomain: {
                    uk: "ua",
                    be: "by",
                    tr: "com.tr",
                    kk: "kz"
                },
                sync: function(a) {
                    var b = this, c = this._need();
                    !this._is() && c ? (this._setStatus(!0), Wa() ? this._getCn().hit(function() {
                        b._sync(c, a);
                    }) : a(function() {
                        b._sync(c);
                    })) : a();
                },
                _is: function() {
                    try {
                        return !!g.Ya._metrika.startSync;
                    } catch (a) {
                        return !1;
                    }
                },
                _setStatus: function(a) {
                    try {
                        g.Ya._metrika.startSync = a;
                    } catch (b) {}
                },
                _need: function() {
                    var c, a = this._getDomainByLang(), b = this._getTld(), d = [];
                    return -1 != f.arrayIndexOf(this.syncTlds, a) && d.push(a), -1 != f.arrayIndexOf(this.syncTlds, b) && -1 == f.arrayIndexOf(d, b) && d.push(b), 
                    c = this._getLs().get("synced") || {}, d = f.arrayFilter(d, function(a) {
                        return (c[a] || 1) + 864e5 < +new Date();
                    }), d.length && d || !1;
                },
                _sync: function(a, b) {
                    var c, d, e = this;
                    a.length ? (d = new gb({
                        method: "GET"
                    }), b = b || function() {}, d.request(this.baseUrl + this.baseTld + "/sync_cookie_get", null, function(g, h) {
                        var l, k, m, t, n = 0, r = 0;
                        if (g) {
                            l = ba.parse(h);
                            try {
                                k = l.sync_token, t = l.sync_ok;
                            } catch (Kb) {
                                return b(), !1;
                            }
                            if (d.setMethod("POST"), c = f.arrDiff(a, t), n = c.length) for (m = e._getLs(), 
                            l = 0; l < c.length; l++) (function(a) {
                                d.request(e.baseUrl + a + "/sync_cookie_decide", {
                                    body: k
                                }, function(c, f) {
                                    c ? d.request(e.baseUrl + e.baseTld + "/sync_cookie_decide_ok", {
                                        body: f
                                    }, function(c) {
                                        r++, n === r && b(), c && (c = m.get("synced") || {}, c[a] = +new Date(), m.set("synced", c));
                                    }) : (r++, n === r && b());
                                });
                            })(c[l]); else b();
                        } else b();
                    })) : b();
                },
                _getCn: function() {
                    return this._cn || (this._cn = new Db({
                        fake: !0,
                        dontSendRequests: this.dontSendRequests
                    })), this._cn;
                },
                _getLs: function() {
                    return this._ls || (this._ls = new P()), this._ls;
                },
                _getTld: function() {
                    var a = f.getTld();
                    return {
                        tr: "com.tr",
                        "укр": "ua",
                        "xn--j1amh": "ua",
                        "бел": "by",
                        "xn--90ais": "by"
                    }[a] || a;
                },
                _getDomainByLang: function() {
                    var a;
                    if (!g.navigator) return "ru";
                    try {
                        a = navigator.languages ? navigator.languages[0] : r.getLanguage();
                    } catch (b) {}
                    return a = (a || "").toLowerCase().split("-")[0], this.langToDomain[a] || "ru";
                }
            });
            r.isAndroid = t(function() {
                var a = navigator.userAgent.toLowerCase();
                return -1 < a.indexOf("android") && -1 < a.indexOf("mobile") && navigator.platform.match(/^android|linux armv/i);
            }, "", !0), f.isDev = function() {
                var a;
                if (f._isDevSetted) return f._isDev;
                try {
                    f._isDevSetted = !0, a = new Image(), Object.defineProperty(a, "id", {
                        get: function() {
                            f._isDev = !0;
                        }
                    });
                } catch (b) {}
            };
            var N = {
                getMinutes: function() {
                    return Math.floor(+new Date() / 1e3 / 60);
                }
            }, ca = {
                _url: "https://mc.yandex.ru/user_storage_set?",
                _params: {},
                init: function(a) {
                    this._params = a || {};
                },
                save: function(a, b) {
                    this._getReq().request(this._url + aa.stringify({
                        key: a,
                        value: f.toJSON(b)
                    })), this._getLs().set(a, b);
                },
                get: function(a) {
                    return {
                        remote: this._params[a],
                        local: this._getLs().get(a)
                    };
                },
                getNum: function(a) {
                    return a = this.get(a), Math.max(+a.remote || 0, +a.local || 0);
                },
                _getLs: function() {
                    return this._ls || (this._ls = new P()), this._ls;
                },
                _getReq: function() {
                    return this._req || (this._req = new wa()), this._req;
                }
            }, Fb = {
                sync: t(function() {
                    var c, d, a = [ "30102", "29009" ], b = {
                        t: 'UV|L7,!"T[rwe&D_>ZIb\\aW#98Y.PC6k'
                    };
                    this._enabled() && (this._setStatus(!0), c = new gb({
                        method: "GET",
                        withCredentials: !1
                    }), d = a.length, function l(f) {
                        var g = a[f];
                        f < d ? c.request("http://127.0.0.1:" + g + "/p", b, function(a, b) {
                            a ? this._save(a, b, g) : l.call(this, f + 1);
                        }, this) : this._save(!1);
                    }.call(this, 0));
                }, "ds"),
                _save: function(a, b, c) {
                    a && new ea({
                        protocol: "https:",
                        counterType: 0,
                        counterId: 42822899,
                        sendTitle: !1,
                        fake: !0
                    }).sendDevice({
                        data: f.trim(b),
                        port: c
                    }), ca.save("ds", N.getMinutes());
                },
                _is: function() {
                    try {
                        return !!g.Ya._metrika.dSync;
                    } catch (a) {
                        return !1;
                    }
                },
                _enabled: function() {
                    return 60 < N.getMinutes() - ca.getNum("ds") && 0 == z().hostname.search(/^(.*\.)?((ya|yandex(\-team)?)\.(com\.)?\w+|(auto|kinopoisk)\.ru|yadi\.sk|yastatic\.net)$/) && !this._is() && r.isAndroid() && !f.isDev();
                },
                _setStatus: function(a) {
                    try {
                        g.Ya._metrika.dSync = a;
                    } catch (b) {}
                }
            }, w = {
                getPos: function(a) {
                    var b = n.getRootElement(), c = n.getDocumentScroll();
                    return [ a.pageX || a.clientX + c[0] - (b.clientLeft || 0) || 0, a.pageY || a.clientY + c[1] - (b.clientTop || 0) || 0 ];
                },
                getTarget: function(a) {
                    var b = null;
                    try {
                        (b = a.target || a.srcElement) && !b.ownerDocument && b.documentElement && (b = b.documentElement);
                    } catch (c) {}
                    return b;
                },
                getMouseButton: function(a) {
                    return a.which || a.button == Y ? a.which : 1 & a.button ? 1 : 2 & a.button ? 3 : 4 & a.button ? 2 : 0;
                },
                prevent: function(a) {
                    a = a || g.event, a.preventDefault ? a.preventDefault() : a.returnValue = !1;
                }
            };
            w.dispatchCustomEvent = t(function(a, b) {
                var c;
                b = b || h, (c = f.getNativeFunction("createEvent", h)("Event")) && (c.initEvent(a, !1, !1), 
                f.getNativeFunction("dispatchEvent", b)(c));
            }, "evt.dispatch"), k.ready = function(a) {
                var c, b = g.performance;
                "object" == typeof b && b.timing && b.timing.domContentLoadedEventStart ? a() : (c = function() {
                    k.un(h, "DOMContentLoaded", c), k.un(g, "load", c), a();
                }, k.on(h, "DOMContentLoaded", c), k.on(g, "load", c));
            };
            var fa = {
                lastReferrer: null
            };
            f.isNumber = function(a) {
                return isFinite(a) && !isNaN(a) && "[object Number]" == Object.prototype.toString.call(a);
            }, f.clearTimeout = function(a) {
                return f.getNativeFunction("clearTimeout")(a);
            }, f._urlParser = null, f.parseUrl = function(a) {
                if (!this._urlParser) try {
                    this._urlParser = h.createElement("a");
                } catch (b) {}
                return this._urlParser ? (this._urlParser.href = a, {
                    protocol: this._urlParser.protocol,
                    host: this._urlParser.host,
                    port: this._urlParser.port,
                    hostname: this._urlParser.hostname,
                    hash: this._urlParser.hash,
                    search: this._urlParser.search,
                    query: this._urlParser.search.replace(/^\?/, ""),
                    pathname: this._urlParser.pathname || "/",
                    path: (this._urlParser.pathname || "/") + this._urlParser.search,
                    href: this._urlParser.href
                }) : {};
            }, r.isIE = function() {
                return h && !h.addEventListener || !1;
            };
            var ga = {};
            ga._cookie = new S({
                onlyCurrentDomain: !0
            }), ga.log = t(function() {
                var a = -1 < A.href.indexOf("_ym_debug=1") || g._ym_debug;
                a && this._cookie.create("debug", "1"), g.console && console.log && (a || "1" === this._cookie.read("debug")) && void 0;
            }, "DebugConsole.log");
            var Gb = F.inherit({
                resource: "clmap",
                retry: !0,
                transports: [ wa ],
                sendClick: function(a, b, c, d) {
                    this.send({
                        "page-url": a,
                        "pointer-click": b
                    }, {}, c, d);
                }
            }), Hb = x.inherit({
                filter: null,
                ignoreTags: [],
                quota: 0,
                isTrackHash: !1,
                protocol: "",
                counterId: 0,
                counterType: 0,
                startTime: 0,
                dontSendRequests: !1,
                MAX_LEN_PATH: 128,
                TIMEOUT_CLICK: 50,
                TIMEOUT_SAME_CLICKS: 1e3,
                DELTA_SAME_CLICKS: 2,
                tags: "A B BIG BODY BUTTON DD DIV DL DT EM FIELDSET FORM H1 H2 H3 H4 H5 H6 HR I IMG INPUT LI OL P PRE SELECT SMALL SPAN STRONG SUB SUP TABLE TBODY TD TEXTAREA TFOOT TH THEAD TR U UL ABBR AREA BLOCKQUOTE CAPTION CENTER CITE CODE CANVAS DFN EMBED FONT INS KBD LEGEND LABEL MAP OBJECT Q S SAMP STRIKE TT ARTICLE AUDIO ASIDE FOOTER HEADER MENU METER NAV PROGRESS SECTION TIME VIDEO NOINDEX NOBR MAIN".split(" "),
                _initComponent: function() {
                    var a, b, c;
                    if (this._lastClick = null, this.hasQuota = !!this.quota, this._quota = this.quota, 
                    this._ignoreTags = [], this.ignoreTags) for (a = 0; a < this.ignoreTags.length; a++) this.ignoreTags[a] && f.mergeArrays(this._ignoreTags, [ String(this.ignoreTags[a]).toUpperCase() ]);
                    for (this._cacheTags = {}, a = 59, b = String.fromCharCode, c = 0; c < this.tags.length; c++) this._cacheTags[this.tags[c]] = b(a), 
                    b(a), a++;
                    this._sender = new Gb({
                        dontSendRequests: this.dontSendRequests,
                        protocol: this.protocol,
                        counterId: this.counterId,
                        counterType: this.counterType
                    }), this._start = !1, this.start();
                },
                destroy: function() {
                    this.stop();
                },
                start: function() {
                    this._start || k.on(h, "click", this._handler, this), this._start = !0;
                },
                stop: function() {
                    this._start && k.un(h, "click", this._handler, this), this._start = !1;
                },
                setTrackHash: function(a) {
                    this.isTrackHash = a;
                },
                _isIgnore: function(a) {
                    return n.classNameExists(a, "(ym-disable-clickmap|ym-clickmap-ignore)");
                },
                _handler: function(a) {
                    a = {
                        el: w.getTarget(a),
                        pos: w.getPos(a),
                        button: w.getMouseButton(a),
                        time: +new Date()
                    };
                    var b, c;
                    this._isTrackingClick(a) && (b = n.getElementSize(a.el), c = n.getElementXY(a.el), 
                    b = [ "rn", f.random(), "x", Math.floor(65535 * (a.pos[0] - c[0]) / (b[0] || 1)), "y", Math.floor(65535 * (a.pos[1] - c[1]) / (b[1] || 1)), "t", Math.floor((a.time - this.startTime) / 100), "p", this._getElPath(a.el) ], 
                    c = z().href, this.isTrackHash ? f.mergeArrays(b, [ "wh", "1" ]) : c = c.split("#")[0], 
                    this._sender.sendClick(f.trim(c, Ja), b.join(":")), this._lastClick = a);
                },
                _isTrackingClick: function(a) {
                    var b, c, d;
                    if (g.ymDisabledClickmap || f.isMetrikaPlayer() || !a.el) return !1;
                    if (b = a.el.tagName, (2 == a.button || 3 == a.button) && "A" != b || this.filter && !this.filter(a.el, b)) return !1;
                    for (c = 0; c < this._ignoreTags.length; c++) if (this._ignoreTags[c] == b) return !1;
                    for (b = a.el; b; ) {
                        if (this._isIgnore(b)) return !1;
                        b = b.parentNode;
                    }
                    if (this._lastClick) {
                        if (a.time - this._lastClick.time < this.TIMEOUT_CLICK) return !1;
                        if (b = Math.abs(this._lastClick.pos[0] - a.pos[0]), c = Math.abs(this._lastClick.pos[1] - a.pos[1]), 
                        d = a.time - this._lastClick.time, this._lastClick.el == a.el && b < this.DELTA_SAME_CLICKS && c < this.DELTA_SAME_CLICKS && d < this.TIMEOUT_SAME_CLICKS) return !1;
                    }
                    if (this.hasQuota) {
                        if (!this._quota) return !1;
                        this._quota--;
                    }
                    return !0;
                },
                _getElPath: function(a) {
                    for (var b = ""; a && a.parentNode && "BODY" != a.tagName && "HTML" != a.tagName; ) b += this._cacheTags[a.tagName] || "*", 
                    b += n.getElementNeighborPosition(a) || "", a = a.parentNode;
                    return f.trim(b, this.MAX_LEN_PATH);
                }
            });
            n.loadScript = function(a, b) {
                b = b || g;
                var k, n, c = f.mixin({
                    type: "text/javascript",
                    charset: "utf-8",
                    async: !0
                }, a), d = b.document, e = f.getNativeFunction("createElement", d), h = e("script");
                if (h) {
                    h.type = c.type, h.charset = c.charset, h.src = c.src, c.async && (h.async = !0);
                    try {
                        return k = d.getElementsByTagName("head")[0], k || (n = d.getElementsByTagName("html")[0], 
                        k = e("head"), n && n.appendChild(k)), k.insertBefore(h, k.firstChild), h;
                    } catch (q) {}
                }
            };
            var ib = x.inherit({
                _initComponent: function() {
                    ib.superclass._initComponent.apply(this, arguments), this._executedMsgs = {}, k.on(g, "message", this._onMessage, this);
                },
                _buildRemoteIframe: function(a) {
                    var d, b = f.getNativeFunction("createElement", h)("div"), c = h.body || h.documentElement;
                    c && (b.innerHTML = '<iframe name="RemoteIframe" allowtransparency="true" style="position: absolute; left: -999px; top: -999px; width: 1px; height: 1px;"></iframe>', 
                    d = b.firstChild, d.onload = function() {
                        n.loadScript({
                            src: a
                        }, d.contentWindow);
                    }, g._ym__remoteIframeEl = d, b.createShadowRoot || b.webkitCreateShadowRoot ? (c.appendChild(b), 
                    b.removeChild(d), (c = b.createShadowRoot ? b.createShadowRoot() : b.webkitCreateShadowRoot()) && c.appendChild(d), 
                    g._ym__remoteIframeContainer = b) : (c.appendChild(d), g._ym__remoteIframeContainer = d));
                },
                _isAllowedLang: function(a) {
                    return -1 !== f.arrayIndexOf([ "ru", "uk", "en", "tr" ], a);
                },
                _isAllowedOrigin: function(a) {
                    return /^http:\/\/(.+\.)?webvisor\.com\/?$/.test(a);
                },
                _isAllowedStatic: function(a) {
                    return /^https?:\/\/(((.+\.)?dev\.webvisor\.com)|(yastatic\.net))(\/.*)?$/.test(a);
                },
                _onMessage: function(a) {
                    var b;
                    try {
                        b = a.origin;
                    } catch (c) {}
                    b && this._isAllowedOrigin(b) && (b = ba.parse(a.data)) && "appendremote" === b.action && this._isAllowedStatic(b.domain) && this._isAllowedLang(b.lang) && !this._executedMsgs[b.id] && (this._executedMsgs[b.id] = !0, 
                    g._ym__postMessageEvent = a, g._ym__inpageMode = b.inpageMode, g._ym__initMessage = b.initMessage, 
                    this._buildRemoteIframe(b.domain + "/cdn/inpage-remote/inpage-remote." + b.lang + ".js"));
                }
            });
            f.pad = function(a) {
                return (10 > a ? "0" : "") + a;
            }, N.getTimestamp = function() {
                var c, a = new Date(), a = [ a.getFullYear(), a.getMonth() + 1, a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds() ], b = "";
                for (c = 0; c < a.length; c++) b += f.pad(a[c]);
                return b;
            }, N.getTimezone = function() {
                return -new Date().getTimezoneOffset();
            }, f.bind = function(a, b) {
                return function() {
                    return a.apply(b || this, arguments);
                };
            };
            var jb = x.inherit({
                counter: null,
                prefsEcommerce: null,
                dataLayerName: "dataLayer",
                allowedEvents: [ "add", "delete", "remove", "purchase", "detail" ],
                _initComponent: function() {
                    var a = "customArr";
                    jb.superclass._initComponent.apply(this, arguments), this._overridePush(this.prefsEcommerce) || (f.isString(this.prefsEcommerce) && (this.dataLayerName = this.prefsEcommerce), 
                    a = this.dataLayerName, this._tryTimeout = f.bind(this._tryTimeout, this), this._tryTimeout()), 
                    this.counter._ecommerce = a;
                },
                _overridePush: function(a) {
                    var b, c;
                    return !(!a || "function" != typeof a.push) && (b = this, b._send(a), c = a.push, 
                    a.push = function() {
                        b._send([].slice.call(arguments, 0)), c.apply(this, arguments);
                    }, !0);
                },
                _tryTimeout: function() {
                    this._overridePush(g[this.dataLayerName]) || f.setTimeout(this._tryTimeout, 1e3, "dlObserver");
                },
                _send: function(a) {
                    var d, e, g, h, k, b = [], c = this.allowedEvents;
                    for (d = 0, k = a.length; d < k; d++) (e = a[d]) && e.ecommerce && (g = {}, h = !1, 
                    f.forEachKey(e.ecommerce, function(a, b) {
                        0 <= f.arrayIndexOf(c, a) && (h = !0, g[a] = b);
                    }), h && b.push(g));
                    b.length && this.counter.params({
                        __ym: {
                            ecommerce: b
                        }
                    });
                }
            }), Ib = {
                match: function() {
                    this.enabled() && k.ready(function() {
                        var a = f.getNativeFunction("createElement", h)("iframe");
                        a.onload = function() {
                            ca.save("cm", N.getMinutes()), n.removeNode(a);
                        }, a.setAttribute("style", "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;visibility:hidden"), 
                        a.src = "https://mc.yandex.ru/metrika/watch_match.html", h.documentElement.appendChild(a);
                    });
                },
                enabled: function() {
                    return 1440 < N.getMinutes() - ca.getNum("cm") && "tr" == f.getTld();
                }
            };
            f.safeDecodeURIComponent = function(a) {
                try {
                    return decodeURIComponent(a);
                } catch (b) {
                    return "";
                }
            }, aa.parse = function(a, b) {
                var d, e, g, h, c = {};
                if (a = a && a.replace(/^\?/, "") || "", a.length) for (d = a.split("&"), h = 0; h < d.length; h++) d[h] && (e = d[h].split("="), 
                e[0] && (g = f.safeDecodeURIComponent(e[0]), e = f.safeDecodeURIComponent((e[1] || "").replace(/\+/g, "%20")), 
                b && g in c ? f.isArray(c[g]) ? c[g].push(e) : c[g] = [ c[g], e ] : c[g] = e));
                return c;
            };
            var La, ha, ia, R = [], A = z(), ua = N.getTimezone(), va = N.getTimestamp(), T = g.screen, O = "784", Ab = 64, Ja = r.isIE() ? 512 : 2048, Bb = r.isIE() ? 512 : 2048, eb = r.isIE() ? 100 : 400, hb = 100, Ia = "noindex", kb = /\.(3gp|7z|aac|ac3|acs|ai|avi|ape|apk|asf|bmp|bz2|cab|cdr|crc32|css|csv|cue|divx|dmg|djvu?|doc(x|m|b)?|emf|eps|exe|flac?|flv|iso|swf|gif|t?gz|jpe?g?|js|m3u8?|m4a|mp(3|4|e?g?)|m4v|md5|mkv|mov|msi|ods|og(g|m|v)|psd|rar|rss|rtf|sea|sfv|sit|sha1|svg|tar|tif?f|torrent|ts|txt|vob|wave?|wma|wmv|wmf|webm|ppt(x|m|b)?|xls(x|m|b)?|pdf|phps|png|xpi|g?zip)$/i, Jb = +new Date();
            g.Ya = g.Ya || {}, Ya._metrika = Ya._metrika || {}, Ya._metrika.counters = Ya._metrika.counters || {}, 
            Ya._metrika.hitParam = Ya._metrika.hitParam || {}, Ya._metrika.counterNum = Ya._metrika.counterNum || 0, 
            Ya._metrika.hitId = Ya._metrika.hitId || f.random(), Ya._globalMetrikaHitId = f.random(), 
            Ya._metrika.v = O, ia = !!Ya._metrika.oo, g.Ya.Metrika = function(a, b, c, d) {
                var e = this;
                return t(function() {
                    function l(l) {
                        var L, J, v = !1;
                        if (Ya._metrika.hitParam[K]) {
                            if (1 != c || Ya._metrika.counters[K]) return !1;
                            v = !0;
                        }
                        Ya._metrika.counters[K] = e, Ya._metrika.hitParam[K] = 1, e._webvisor = !d && !ia && (y && y.webvisor || !1), 
                        e._directCampaign = y && y.directCampaign, y && y.trackHash && R(!0), d || v || (L = new fb({
                            protocol: "https:",
                            counterId: a,
                            counterType: c,
                            hid: ka,
                            tz: ua,
                            ts: va,
                            url: A.href,
                            enabled: e._webvisor
                        }), e.replacePhones(), v = new Eb({
                            dontSendRequests: ia
                        }), J = function(d) {
                            var v = new Ka({
                                protocol: "https:",
                                counterType: c,
                                counterId: a,
                                trackHash: B,
                                hitId: ka,
                                webvisor: e._webvisor,
                                counter: e,
                                dontSendRequests: ia,
                                counterNum: Z
                            }), m = {
                                ut: Q,
                                he: y ? ~~y.httpError : 0,
                                ad: 1 == c && g.Ya && g.Ya.Direct,
                                pv: !0,
                                saveRef: !0
                            };
                            La = +new Date(), v.sendHit({
                                url: A.href,
                                title: n.getDocumentTitle(),
                                referrer: h.referrer,
                                vParams: b,
                                userParams: V,
                                experiments: U,
                                modes: m,
                                visitColor: L.getVc(),
                                hasPrerender: l,
                                ts: va,
                                tz: ua,
                                callback: function(c, v) {
                                    ca.init(v), Ib.match(), Fb.sync(), ga.log("PageView. Counter ", a, ". URL: ", A.href, ". Referrer: " + h.referrer, ". Params: ", b), 
                                    ha || (ha = +new Date()), c = c || {}, L.start(c.webvisor);
                                    var m, n, l = c.mp2;
                                    if (n = new S({
                                        counterId: a
                                    }), n.erase("mp2_substs"), l) {
                                        b: {
                                            m = l.conditions;
                                            var p;
                                            if (m && m.length) for (p = 0; p < m.length; p++) {
                                                var C;
                                                if (C = m[p], "ref" == C.type) C = xb(C); else if ("adv" == C.type) {
                                                    var J, q, r, t, D;
                                                    J = C, t = Ya._metrika.counter._directCampaign, q = J.ServiceNamePattern;
                                                    var ma = J.RefererPattern;
                                                    C = t ? J.direct_orders : J.direct_camp;
                                                    var z = h.referrer, x = aa.parse(A.search), w = yb(A.search, A.hash), y = {};
                                                    for (r = [ "source", "medium", "campaign", "term", "content" ], D = 0; D < r.length; D++) x["utm_" + r[D]] && (y[r[D]] = x["utm_" + r[D]]);
                                                    var B = t ? "direct.yandex.ru" : w && w.service || y.source;
                                                    if (D = !1, !D && q && q.length) for (r = 0; r < q.length; r++) if (new RegExp(q[r], "i").test(B)) {
                                                        D = !0;
                                                        break;
                                                    }
                                                    if (!D && !J.yandex_direct && ma && ma.length) for (q = 0; q < ma.length; q++) if (new RegExp(ma[q], "i").test(z)) {
                                                        D = !0;
                                                        break;
                                                    }
                                                    if (!D && J.google_adwords && x.gclid && (D = !0), D && C && C.length && (D = !1, 
                                                    t = t || w && w.campaign || y && y.campaign)) for (J = 0; J < C.length; J++) if (C[J] == t) {
                                                        D = !0;
                                                        break;
                                                    }
                                                    C = D;
                                                } else C = !1;
                                                if (C) {
                                                    m[p].track_id && n.create("mp2_track", m[p].track_id, 43200);
                                                    break b;
                                                }
                                            }
                                        }
                                        m = n.read("mp2_track"), l = l.substs && l.substs[m], m && l ? (n.create("mp2_substs", f.toJSON(l)), 
                                        n = ab(l), e.params("__ym", n ? "mp_trackid" : "mp_trackid_bad", m)) : bb();
                                    } else bb();
                                    k.on(g, "load", e.replacePhones, e), e._inited = !0, d && d();
                                }
                            });
                        }, v.sync(J)), x(), y && (y.enableAll ? (m(!0), p(!0), G()) : (y.clickmap && p(y.clickmap), 
                        y.trackLinks && m(y.trackLinks), y.accurateTrackBounce && G(y.accurateTrackBounce)), 
                        (y.ecommerce || y.useDataLayer) && new jb({
                            counter: e,
                            prefsEcommerce: y.ecommerce
                        }), y.triggerEvent && rb(function() {
                            w.dispatchCustomEvent("yacounter" + a + "inited");
                        }, 0));
                    }
                    function m(a) {
                        var b = {};
                        switch (typeof a) {
                          case "string":
                            b.on = !0;
                            break;

                          case "object":
                            b.on = !0;
                            break;

                          case "boolean":
                            b.on = a;
                            break;

                          default:
                            return;
                        }
                        e._trackLinks = b;
                    }
                    function x() {
                        m(!1), k.on(h, "click", function(a) {
                            e._trackLinks && e._trackLinks.on && q(a);
                        });
                    }
                    function q(a) {
                        var c, d, e, g, b = sb(a);
                        b && (a = !1, d = (c = "" + b.href) ? c.split(/\?/)[0] : "", e = function(a) {
                            var d = Xa(b);
                            M.sendClickLink({
                                url: c,
                                title: c == d ? "" : d,
                                modes: a
                            });
                        }, (kb.test(d) || kb.test(c) || Za(c, da) || Za(d, da)) && (a = !0), g = n.classNameExists(b, "ym-disable-tracklink"), 
                        d = n.classNameExists(b, "ym-external-link"), g || (g = {
                            ln: !0,
                            dl: a
                        }, d ? e(g) : (d = b.hostname || f.parseUrl(b.href).hostname || "", tb(z().hostname, d) ? a ? (g.ln = !1, 
                        e(g)) : (a = Xa(b)) && a != c && qa.set("il", f.trim(a, hb)) : c && -1 != c.search(/^ *(data|javascript):/i) || (g.ut = Ia, 
                        e(g)))));
                    }
                    function p(b) {
                        "undefined" == typeof b && (b = !0), !0 === b && (b = {}), e._clickmap && e._clickmap.destroy(), 
                        b && (e._clickmap = new Hb({
                            dontSendRequests: ia,
                            filter: b.filter,
                            ignoreTags: b.ignoreTags,
                            quota: b.quota,
                            isTrackHash: b.isTrackHash,
                            protocol: "https:",
                            counterId: a,
                            counterType: c,
                            startTime: Jb
                        }));
                    }
                    function E(a, b) {
                        function c() {
                            var c;
                            q || (p && f.clearTimeout(p), c = v ? n : n + +new Date() - L, c = b - c, 0 > c && (c = 0), 
                            p = f.setTimeout(function() {
                                q = !0, e(!1), a();
                            }, c, "trackUserTime"));
                        }
                        function d() {
                            m || (l = !0, v = !1, m = !0, c());
                        }
                        function e(a) {
                            var b;
                            for (b = 0; b < t.length; b += 3) a ? k.on(t[b], t[b + 1], t[b + 2]) : k.un(t[b], t[b + 1], t[b + 2]);
                        }
                        var t, l = !1, m = !1, v = !0, n = 0, L = +new Date(), p = null, q = !1;
                        r.isIE() ? f.setTimeout(a, b, "trackUserTime") : (t = [ g, "blur", function() {
                            v = l = m = !0, n += +new Date() - L, L = +new Date(), c();
                        }, g, "focus", function() {
                            l || m || (n = 0), L = +new Date(), l = m = !0, v = !1, c();
                        }, h, "click", d, h, "mousemove", d, h, "keydown", d, h, "scroll", d ], e(!0), c());
                    }
                    function G(b) {
                        var c, d;
                        "number" != typeof b && (b = 15e3), e._isAccurateTrackBounce || (e._isAccurateTrackBounce = !0, 
                        c = new P({
                            counterId: a
                        }), d = c.get("lastHit"), c.set("lastHit", +new Date()), ((c = c.get("lastHit")) && (!d || d < c - 18e5) || !ub(h.referrer, z().href) || .1 > Math.random()) && E(function() {
                            e.notBounce();
                        }, b));
                    }
                    function N(a) {
                        var c, b = function() {
                            var b, a = z().hash.split("#")[1];
                            return "undefined" != typeof a && (b = a.indexOf("?"), 0 < b && (a = a.substring(0, b)), 
                            a);
                        };
                        c = b(), function D() {
                            var d = b();
                            d !== c && (a(), c = d), la = f.setTimeout(D, 200, "trackHash");
                        }();
                    }
                    function R(a) {
                        !1 === a ? B && ("onhashchange" in g ? k.un(g, "hashchange", T) : f.clearTimeout(la), 
                        B = !1) : (a = T, B || ("onhashchange" in g ? k.on(g, "hashchange", a) : N(a), B = !0)), 
                        M.setTrackHash(B), e._trackHash = B;
                    }
                    function T() {
                        var a = {
                            ut: Q,
                            ad: 1 == c && g.Ya && g.Ya.Direct,
                            wh: !0,
                            saveRef: !0,
                            pv: !0
                        };
                        W = fa.lastReferrer = X, M.sendAjaxHit({
                            url: z().href,
                            title: n.getDocumentTitle(),
                            referrer: W,
                            modes: a
                        }), X = z().href;
                    }
                    function O(a, b, c) {
                        a = wa.parseValidate(a, b), b = [], a && (b.push(a), c = c || {}, f.isFunction(c.callback) && (b.push(c.callback), 
                        c.ctx && b.push(c.ctx))), b.length && e.params.apply(e, b);
                    }
                    var K, U, V, y, Z, M, da, pa, qa, B, I, oa, ka, Q = "", W = "", X = fa.lastReferrer = A.href;
                    if (Ya._metrika.counter || (Ya._metrika.counter = e), "object" == typeof a && (y = a, 
                    d = a.defer, Q = a.ut, c = a.type, b = a.params, V = a.userParams, U = y.experiments, 
                    oa = y.nck, a = a.id), a = a || 0, /^\d+$/.test(a) || (a = 0), c = c || 0, K = a + ":" + c, 
                    Ya._metrika.counters[K]) return Ya._metrika.counters[K];
                    ka = Ya._metrika.hitId, Ya._metrika.counterNum++, Z = Ya._metrika.counterNum, oa || (F.initCookie(), 
                    db.init()), F.retransmit(), M = new ea({
                        protocol: "https:",
                        counterType: c,
                        counterId: a,
                        hitId: ka,
                        counter: e,
                        dontSendRequests: ia,
                        counterNum: Z
                    }), e.replacePhones = t(function() {
                        var b, c;
                        try {
                            (b = new S({
                                counterId: a
                            }).read("mp2_substs")) && (c = ba.parse(b)) && ab(c, !0);
                        } catch (C) {}
                        return e;
                    }, "counter.replacePhones"), e.reachGoal = t(function(b, c, d, f) {
                        return 2 <= arguments.length && "function" == typeof c && (f = d, d = c, c = Y), 
                        ga.log("Reach goal. Counter: " + a + ". Goal id: " + b + ". Params: ", c), M.sendGoal(b, {
                            vParams: c,
                            callback: d,
                            ctx: f
                        }), e;
                    }, "counter.reachGoal"), e.trackLinks = t(function(a) {
                        return m(a), e;
                    }, "counter.trackLinks"), qa = new P({
                        counterId: a
                    }), e.hit = t(function(b, c, d, g, h, k) {
                        return b && (f.isObject(c) && (d = c.referer, g = c.params, h = c.callback, k = c.ctx, 
                        c = c.title), ga.log("PageView. Counter " + a, ". URL: " + b, ". Referrer: " + d, ". Params: ", g), 
                        M.sendHit({
                            url: b,
                            title: c,
                            referrer: d,
                            vParams: g,
                            callback: h,
                            ctx: k
                        })), e;
                    }, "counter.hit"), e.params = t(function(b) {
                        var g, h, c = arguments.length, d = c, k = [].slice.call(arguments, 0);
                        return b && (1 < arguments.length && (f.isFunction(arguments[c - 1]) ? (g = arguments[c - 1], 
                        d = c - 1) : f.isFunction(arguments[c - 2]) && (g = arguments[c - 2], h = arguments[c - 1], 
                        d = c - 2), k = [].slice.call(k, 0, d), 1 < k.length && (k = [ f.array2Props(k) ])), 
                        ga.log("User params. Counter " + a + ". Params: ", k[0]), M.sendParams(k[0], g, h)), 
                        e;
                    }, "counter.params"), e.file = t(function(a, b) {
                        return a && (b = b || {}, M.sendFileUpload({
                            url: a,
                            title: b.title,
                            vParams: b.params,
                            callback: b.callback,
                            ctx: b.ctx
                        })), e;
                    }, "counter.file"), e.extLink = t(function(a, b) {
                        return a && (b = b || {}, M.sendExtLink({
                            url: a,
                            title: b.title,
                            vParams: b.params,
                            callback: b.callback,
                            ctx: b.ctx
                        })), e;
                    }, "counter.extLink"), e.notBounce = t(function(a) {
                        var b = 0;
                        return a = a || {}, La && ha && (b = ha - La), M.sendNotBounce(b, {
                            callback: a.callback,
                            ctx: a.ctx
                        }), e;
                    }, "counter.notBounce"), da = [], e.addFileExtension = function(a) {
                        return "string" == typeof a ? da.push(a) : da = da.concat(a), e;
                    }, e.clickmap = function(a) {
                        return p(a), e;
                    }, e.accurateTrackBounce = function(a) {
                        return G(a), e;
                    };
                    var la = null;
                    B = !1, e.trackHash = function(a) {
                        return R(a), e;
                    }, f.arrayEvery = function(a, b, c) {
                        var d;
                        for (d = 0; d < a.length; d++) if (!b.call(c, a[d], d, a)) return !1;
                        return !0;
                    };
                    var wa = {
                        requiredEcommerceFields: [ "currency", "goods" ],
                        parseValidate: function(a, b) {
                            var d, c = this.validate(a, b);
                            if (!c.isValid) return console && void 0, !1;
                            c = {}, c[a] = {}, b.currency && (c.currencyCode = b.currency), b.goods && (c[a].products = b.goods);
                            for (d in b) b.hasOwnProperty(d) && -1 === f.arrayIndexOf(this.requiredEcommerceFields, d) && (c[a].actionField || (c[a].actionField = {}), 
                            c[a].actionField[d] = b[d]);
                            return {
                                __ym: {
                                    ecommerce: [ c ]
                                }
                            };
                        },
                        validate: function(a, b) {
                            var c = !1, d = "";
                            if (f.isObject(b)) switch (a) {
                              case "detail":
                              case "add":
                              case "remove":
                                f.isArray(b.goods) && b.goods.length ? (c = f.arrayEvery(b.goods, function(a) {
                                    return f.isObject(a) && (f.isString(a.id) || f.isNumber(a.id) || f.isString(a.name) || f.isString(a.name));
                                })) || (d = "All items in 'goods' should be objects and contain 'id' or 'name' field") : d = "Ecommerce data should contain 'goods' non-empty array";
                                break;

                              case "purchase":
                                f.isNumber(b.id) || f.isString(b.id) ? c = !0 : d = "Purchase object should contain string or number 'id' field";
                            } else d = "Ecommerce data should be an object";
                            return {
                                isValid: c,
                                message: d
                            };
                        }
                    };
                    e.ecommerceDetail = t(function(a, b) {
                        return O("detail", a, b), e;
                    }, "ecommerce.detail"), e.ecommerceAdd = t(function(a, b) {
                        return O("add", a, b), e;
                    }, "ecommerce.add"), e.ecommerceRemove = t(function(a, b) {
                        return O("remove", a, b), e;
                    }, "ecommerce.remove"), e.ecommercePurchase = t(function(a, b) {
                        return O("purchase", a, b), e;
                    }, "ecommerce.purchase"), e.userParams = t(function(a, b, c) {
                        return f.isObject(a) && e.params({
                            __ymu: a
                        }, b || function() {}, c), e;
                    }, "uparams"), e.experiments = t(function(a, b, c) {
                        return M.sendExperiments({
                            callback: b,
                            ctx: c,
                            experiments: a
                        }), e;
                    }, "exps"), e.id = e.setUserID = t(function(a, b, c) {
                        return (f.isString(a) || f.isNumber(a)) && e.params({
                            __ym: {
                                user_id: a
                            }
                        }, b || function() {}, c), e;
                    }, "id"), pa = new S(), e.getClientID = t(function() {
                        return pa.read("uid");
                    }, "guid"), e.enableAll = function() {
                        return m(!0), p(!0), G(), e;
                    }, e.uploadPage = function() {}, e._performanceTiming = $a, a && ("prerender" == h.webkitVisibilityState ? (M.sendPrerenderHit({
                        url: A.href,
                        title: n.getDocumentTitle(),
                        referrer: h.referrer
                    }), I = function() {
                        "prerender" != h.webkitVisibilityState && (k.un(h, "webkitvisibilitychange", I), 
                        l(!0));
                    }, k.on(h, "webkitvisibilitychange", I)) : l(!1));
                }, "init")();
            }, function() {
                if (g.performance && "function" == typeof performance.getEntries) {
                    var d, e, h, k, a = {
                        2343947156: 1,
                        1996539654: 1,
                        2065498185: 1,
                        823651274: 1,
                        12282461: 1,
                        1555719328: 1,
                        1417229093: 1,
                        138396985: 1
                    }, b = performance.getEntries(), c = {};
                    for (k = 0; k < b.length; k++) d = b[k], e = d.name.replace(/^https?:\/\//, "").split("?")[0], 
                    h = f.fnv32a(e), a[h] && !c[e] && 0 < d.duration && (c[e] = {
                        dns: Math.round(d.domainLookupEnd - d.domainLookupStart),
                        tcp: Math.round(d.connectEnd - d.connectStart),
                        duration: Math.round(d.duration),
                        response: Math.round(d.responseEnd - d.requestStart),
                        pages: A.href
                    });
                    new X({
                        sampling: .001
                    }).logParams({
                        timings8: c
                    });
                }
            }(), g.Ya._metrika.remoteCtrlInited || (g.Ya._metrika.remoteCtrlInited = !0, new ib()), 
            g.Ya.Metrika.counters = function() {
                var a = [];
                return f.forEachKey(g.Ya._metrika.counters, function(b, c) {
                    var d = b.split(":");
                    a.push({
                        id: +d[0],
                        type: +d[1],
                        accurateTrackBounce: c._isAccurateTrackBounce,
                        clickmap: c._clickmap && c._clickmap._start,
                        oldCode: !!g.ya_cid,
                        trackHash: !!c._trackHash,
                        trackLinks: c._trackLinks && c._trackLinks.on,
                        webvisor: !!c._webvisor
                    });
                }), a;
            }, g.ya_cid && Ya.Metrika && new Ya.Metrika(g.ya_cid, g.ya_params, g.ya_class), 
            g.ya_cid && !g.ya_hit && (g.ya_hit = function(a, b) {
                Ya._metrika.counter && Ya._metrika.counter.reachGoal(a, b);
            }), function() {
                function a(a) {
                    try {
                        delete g[a];
                    } catch (l) {
                        g[a] = Y;
                    }
                }
                var d, b = g.yandex_metrika_callback, c = g.yandex_metrika_callbacks;
                if ("function" == typeof b && b(), "object" == typeof c) for (b = 0; b < c.length; b++) (d = c[b]) && (c[b] = null, 
                d());
                a("yandex_metrika_callback"), a("yandex_metrika_callbacks");
            }(), g.Ya.Metrika.informer = function(a) {
                var b = !!Ya.Metrika._informer;
                Ya.Metrika._informer = a, b || n.loadScript({
                    src: "https://informer.yandex.ru/metrika/informer.js"
                });
            }, k.on(h, "click", t(function(a) {
                var c, d, b = w.getTarget(a);
                b && "ym-advanced-informer" == b.className && (c = b.getAttribute("data-lang"), 
                d = b.getAttribute("data-cid"), Ya.Metrika.informer({
                    i: b,
                    id: +d,
                    lang: c
                }), w.prevent(a));
            }, "adv-inf"), null, {
                passive: !1
            });
        }(this, this.document), module.exports = Ya;
    }).call(window);
}, function(module, exports, __webpack_require__) {
    "use strict";
    function loadUsers() {
        if (users) return void logger.log("loadUsers: users already loaded");
        var str = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        try {
            users = JSON.parse(str);
        } catch (e) {
            logger.log("Error loading users");
        }
        users = Array.isArray(users) ? users : [], logger.log("Loaded local users: %j", users);
    }
    function saveUsers() {
        var usersToSave = users.filter(function(user) {
            return user.username;
        });
        localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(usersToSave));
    }
    function isSameUser(user, account) {
        return user.uid ? user.uid === account.uid : normalizeLogin(user.username) === normalizeLogin(account.login);
    }
    function normalizeLogin(login) {
        return login = login || "", login = login.toLowerCase(), login.replace(/\./g, "-");
    }
    function account2User(account, user, defaultUid) {
        return user.uid = account.uid, user.username = account.login.split("@")[0], user.domain = account.login.split("@")[1], 
        user.displayName = account.displayName && account.displayName.name || account.login, 
        user.status = account.uid === defaultUid ? USER_STATUS.AUTH_ACTIVE : USER_STATUS.AUTH, 
        user.key && delete user.key, user.status === USER_STATUS.AUTH_ACTIVE && (user.lastAuthTime = Date.now()), 
        user;
    }
    function updateUsersStatus() {
        yauthAccounts.update(function(result) {
            return result.accounts ? (logger.log("Accounts response %j", result), loadUsers(), 
            users.forEach(function(user) {
                var isOldAccount = !user.uid, account = result.accounts.filter(function(a) {
                    return isSameUser(user, a);
                })[0], wasAuthorized = user.status !== USER_STATUS.NO_AUTH;
                account ? account2User(account, user, result.default_uid) : user.status = USER_STATUS.NO_AUTH;
                var isAuthorized = user.status !== USER_STATUS.NO_AUTH;
                user.status === USER_STATUS.AUTH_ACTIVE && (user.lastAuthTime = Date.now()), wasAuthorized !== isAuthorized && (isOldAccount || sendClickerRequest(isAuthorized ? "auth.done.total" : "auth.exit.total"));
            }), result.accounts.forEach(function(account) {
                var exists = users.some(function(user) {
                    return account.uid === user.uid;
                });
                if (!exists) {
                    var user = account2User(account, {}, result.default_uid);
                    users.push(user), sendClickerRequest("auth.done.total");
                }
            }), logger.log("Users authorized: %s", result.accounts.map(function(account) {
                return account.login + (account.uid === result.default_uid ? " (active)" : "");
            }).join(", ")), saveUsers(), void auth.notifyUI()) : (logger.log("Accounts: response is empty %j", result), 
            logger.log("Accounts: set noAuth status"), void setUserStatusNoAuth(""));
        });
    }
    function setUserStatusNoAuth() {
        loadUsers(), users.forEach(function(user) {
            user.status !== USER_STATUS.NO_AUTH && (user.status = USER_STATUS.NO_AUTH, sendClickerRequest("auth.exit.total"));
        }), saveUsers(), auth.notifyUI(), auth.dispatcher.trigger("auth:data", {
            hasAuth: !1
        });
    }
    function sendClickerRequest() {}
    function detectTld(brandId) {
        switch (brandId) {
          case "tb":
            return {
                passportTld: "com.tr",
                tld: "com.tr"
            };

          case "ua":
            return {
                passportTld: "ru",
                tld: "ua"
            };

          default:
            return {
                passportTld: "ru",
                tld: "ru"
            };
        }
    }
    function getUserById(users, id) {
        for (var i = 0, l = users.length; i < l; i++) {
            var user = users[i];
            if (user.uid === id || user.key === id) return user;
        }
        return null;
    }
    function postRequest(data) {
        var form = document.createElement("form");
        form.setAttribute("method", "POST"), form.setAttribute("action", data.url), data.target && form.setAttribute("target", data.target);
        var params = data.params;
        for (var key in params) if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden"), hiddenField.setAttribute("name", key), 
            hiddenField.setAttribute("value", params[key]), form.appendChild(hiddenField);
        }
        document.body.appendChild(form), form.submit();
    }
    function getIframe() {
        var iframe = document.querySelector("#iframe");
        return iframe || (iframe = document.createElement("iframe"), iframe.setAttribute("id", "iframe"), 
        iframe.setAttribute("name", "iframe"), document.body.appendChild(iframe)), iframe;
    }
    function getUserLogin(user) {
        var login = "";
        return user && (login = user.username || "", user.domain && (login += "@" + user.domain)), 
        login;
    }
    function listenEmbeddedauthError(tldInfo) {
        var passportUrl = PASSPORT_URL.replace("{tld}", tldInfo.passportTld), passportUrlPattern = PASSPORT_URL_PATTERN.replace("{tld}", tldInfo.passportTld);
        chrome.webRequest.onHeadersReceived.addListener(function(details) {
            return details.url.indexOf("mode=embeddedauth") >= 0 && details.tabId === -1 && 200 !== details.statusCode && 302 !== details.statusCode && chrome.tabs.create({
                url: passportUrl
            }), details;
        }, {
            urls: [ passportUrlPattern ]
        });
    }
    var users, yauth = __webpack_require__(235), yauthAccounts = __webpack_require__(237), yauthCookies = __webpack_require__(236), branding = __webpack_require__(30), Logger = __webpack_require__(13), slicePlatform = __webpack_require__(238), ACCOUNTS_RECCONECT_MS = 6e4, STORAGE_KEY_ACCOUNTS = "application.mail.accounts", MAIL_URL = "https://mail.yandex.{tld}", MORDA_URL = "https://yandex.{tld}", FAKE_URL = "http://api.browser.yandex.{tld}/elements/embeddedauth.html", PASSPORT_URL = "https://passport.yandex.{tld}/passport", POSTREGISTRATION_URL = "https://passport.yandex.{tld}/passport?from=mail&mode=postregistration", PASSPORT_URL_PATTERN = "*://passport.yandex.{tld}/passport*", tldInfo = {
        passportTld: "ru",
        tld: "ru"
    }, logger = Logger.create("AuthManager"), USER_STATUS = {
        NO_AUTH: 0,
        AUTH: 1,
        AUTH_ACTIVE: 2
    }, auth = {
        init: function(dispatcher, brandId) {
            this.dispatcher = dispatcher, this.dispatcher.on("user:login", this.handleUserLoginEvent, this), 
            this.dispatcher.on("user:logout", this.handleUserLogoutEvent, this), this.dispatcher.on("user:delete", this.handleUserDeleteEvent, this), 
            this.dispatcher.on("user:get-all", this.handleUserGetAllEvent, this), this.dispatcher.on("user:token-change", this.handleUserTokenChangeEvent, this), 
            this.dispatcher.on("user:auth-error", this.handleUserAuthErrorEvent, this), tldInfo = detectTld(brandId), 
            MAIL_URL = MAIL_URL.replace("{tld}", tldInfo.tld), MORDA_URL = MORDA_URL.replace("{tld}", tldInfo.tld), 
            FAKE_URL = FAKE_URL.replace("{tld}", tldInfo.tld), listenEmbeddedauthError(tldInfo), 
            yauthCookies.onChanged.addListener(this.handleCookieChange.bind(this)), yauth.init({
                tld: tldInfo.passportTld,
                postRequest: function(tabId, url, params) {
                    var iframe = getIframe();
                    postRequest({
                        url: url,
                        params: params,
                        target: iframe.getAttribute("name")
                    });
                },
                debug: !1
            }), yauthAccounts.init({
                tld: tldInfo.passportTld,
                debug: !1,
                reconnectTimeout: ACCOUNTS_RECCONECT_MS
            }), yauthCookies.init({
                tld: tldInfo.passportTld,
                debug: !1
            }), yauthCookies.check();
        },
        proposeDomain: function() {
            if (!users) return "";
            for (var i = 0, l = users.length; i < l; i++) if (users[i].status === USER_STATUS.AUTH_ACTIVE) return users[i].domain || "";
            return "";
        },
        handleUserLoginEvent: function(data) {
            var user = getUserById(users, data ? data.uid : "");
            if (data.uid && user) {
                if (user.status === USER_STATUS.AUTH_ACTIVE) return;
                if (user.status === USER_STATUS.AUTH) return chrome.webRequest.onCompleted.removeListener(this._redirectToPostregistration), 
                user.username || chrome.webRequest.onCompleted.addListener(this._redirectToPostregistration, {
                    urls: [ FAKE_URL.replace("{tld}", tldInfo.passportTld) + "*" ]
                }), yauth.setRetpath(FAKE_URL), void yauth.setActive(null, data.uid, user ? user.username : "");
            }
            yauth.setRetpath(MAIL_URL), yauth.login(null, getUserLogin(user));
        },
        handleUserAuthErrorEvent: function(data) {
            this.handleUserLogoutEvent(data, {
                useEmbeddedAuth: !0
            });
        },
        handleUserLogoutEvent: function(data, options) {
            var user = getUserById(users, data ? data.uid : ""), authUsersCount = this.countAuthUsers(), useEmbeddedAuth = !!options && options.useEmbeddedAuth;
            user && (useEmbeddedAuth || authUsersCount > 1) ? (yauth.setRetpath(FAKE_URL), yauth.logout(null, data.uid, user ? user.username : "")) : (yauth.setRetpath(MORDA_URL), 
            yauth.logoutAll());
        },
        handleUserDeleteEvent: function(data) {
            var user = getUserById(users, data ? data.uid : ""), userIndex = users.indexOf(user);
            user && userIndex >= 0 && (users.splice(userIndex, 1), saveUsers(), auth.notifyUI());
        },
        handleUserGetAllEvent: function() {
            logger.log("handleUserGetAllEvent"), this.notifyUI();
        },
        handleUserTokenChangeEvent: function(data) {
            var user = getUserById(users, data && data.uid || "");
            user && (user.token = data.token, saveUsers());
        },
        handleCookieChange: function(cookieExists) {
            logger.log("handleCookieChange: %s", cookieExists.toString()), cookieExists ? updateUsersStatus() : setUserStatusNoAuth("");
        },
        hasAuthUsers: function() {
            return this.countAuthUsers() > 0;
        },
        countAuthUsers: function() {
            var count = 0;
            if (!users) return 0;
            for (var i = 0, l = users.length; i < l; i++) users[i].status && count++;
            return count;
        },
        getDefaultUid: function() {
            return users ? users.reduce(function(r, user) {
                return user.status === USER_STATUS.AUTH_ACTIVE ? user.uid || user.key : r;
            }, null) : null;
        },
        notifyUI: function() {
            if (users && 0 !== users.length) {
                var defaultUid = this.getDefaultUid(), data = {
                    domain: branding.data("@domain"),
                    defaultUid: defaultUid,
                    list: users.map(function(user) {
                        return {
                            uid: user.uid || user.key,
                            login: user.username + (user.domain ? "@" + user.domain : ""),
                            displayName: user.displayName,
                            isAuthorized: Boolean(user.status),
                            token: user.token
                        };
                    })
                };
                logger.log("NotifyUI: %j", data), slicePlatform.notifySlice("user:all", data);
                var hasAuth = null !== defaultUid;
                logger.log("hasAuth: %s", hasAuth.toString()), this.dispatcher.trigger("auth:data", {
                    hasAuth: hasAuth
                }), hasAuth || slicePlatform.notifySlice("slice:close");
            }
        },
        _redirectToPostregistration: function() {
            chrome.tabs.create({
                url: POSTREGISTRATION_URL.replace("{tld}", tldInfo.passportTld)
            }), chrome.webRequest.onCompleted.removeListener(auth._redirectToPostregistration);
        }
    };
    module.exports = auth;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function getUrl(tpl, params) {
        var url = tpl.replace("{tld}", tld);
        if (debug && (url = url.replace("https://passport.", "https://passport-rc.")), params) {
            var sep = url.indexOf("?") >= 0 ? "&" : "?";
            url += sep + utils.encodeQueryParams(params);
        }
        return url;
    }
    function uidAction(tabId, uid, action) {
        yauthCookies.getYandexuidCookie(function(yandexuid) {
            if (yandexuid) {
                var params = {
                    uid: uid,
                    action: action,
                    yu: yandexuid,
                    retpath: getUrl(FAKE_RETPATH_URL)
                };
                postRequest(tabId, getUrl(EMBEDED_URL), params);
            }
        });
    }
    function catchRetpath(details) {
        if (!tld) return void (lastRedirectDetails = details);
        if (chrome.history.deleteUrl({
            url: details.url
        }, utils.noop), details.transitionQualifiers.indexOf("forward_back") >= 0) return void yauth.onChanged.dispatchToListener(null);
        var result = {
            action: lastAction,
            tabId: details.tabId,
            url: details.url
        }, query = details.url.split("?")[1];
        query && (result.response = utils.parseQueryParams(query)), yauth.onChanged.dispatchToListener(result);
    }
    function openUrl(url, tabId) {
        tabId ? chrome.tabs.update(tabId, {
            url: url
        }) : chrome.tabs.create({
            url: url
        });
    }
    var tld, postRequest, lastLogin, lastAction, lastRedirectDetails, utils = __webpack_require__(79), Signal = __webpack_require__(80), yauthCookies = __webpack_require__(236), debug = !1, FAKE_RETPATH_URL = "http://api.browser.yandex.{tld}/elements/embeddedauth.html", EMBEDED_URL = "https://passport.yandex.{tld}/passport?mode=embeddedauth", LOGIN_URL = "https://passport.yandex.{tld}/auth", LOGOUT_URL = "https://passport.yandex.{tld}/passport?mode=logout", yauth = {
        init: function(params) {
            params = params || {}, tld = params.tld, postRequest = params.postRequest, debug = params.debug, 
            FAKE_RETPATH_URL && (lastRedirectDetails ? (catchRetpath(lastRedirectDetails), lastRedirectDetails = null) : chrome.tabs.query({
                active: !0
            }, function(tabs) {
                var tab = tabs[0];
                tab && 0 === tab.url.indexOf(getUrl(FAKE_RETPATH_URL)) && catchRetpath({
                    url: tab.url,
                    tabId: tab.id,
                    transitionQualifiers: []
                });
            }));
        },
        login: function(tabId, login) {
            lastLogin = login, lastAction = "login";
            var params = {
                login: login || "",
                retpath: getUrl(FAKE_RETPATH_URL),
                domik: 1
            }, url = getUrl(LOGIN_URL, params);
            openUrl(url, tabId);
        },
        logoutAll: function(tabId) {
            lastAction = "logoutAll", yauthCookies.getYandexuidCookie(function(yandexuid) {
                if (yandexuid) {
                    var params = {
                        yu: yandexuid,
                        retpath: getUrl(FAKE_RETPATH_URL)
                    }, url = getUrl(LOGOUT_URL, params);
                    openUrl(url, tabId);
                }
            });
        },
        logout: function(tabId, uid, login) {
            lastLogin = login, lastAction = "logout", uidAction(tabId, uid, lastAction);
        },
        setActive: function(tabId, uid, login) {
            lastLogin = login, lastAction = "change_default", uidAction(tabId, uid, lastAction);
        },
        setRetpath: function(retpath) {
            if (chrome.webNavigation.onCommitted.hasListener(catchRetpath) && chrome.webNavigation.onCommitted.removeListener(catchRetpath), 
            FAKE_RETPATH_URL = retpath) {
                var urlRules = FAKE_RETPATH_URL.indexOf("{tld}") === -1 ? [ {
                    urlPrefix: FAKE_RETPATH_URL
                } ] : [ {
                    urlPrefix: FAKE_RETPATH_URL.replace("{tld}", "ru")
                }, {
                    urlPrefix: FAKE_RETPATH_URL.replace("{tld}", "ua")
                }, {
                    urlPrefix: FAKE_RETPATH_URL.replace("{tld}", "com.tr")
                }, {
                    urlPrefix: FAKE_RETPATH_URL.replace("{tld}", "com")
                } ];
                chrome.webNavigation.onCommitted.addListener(catchRetpath, {
                    url: urlRules
                });
            }
        },
        onChanged: new Signal("auth.onChanged")
    };
    yauth.setRetpath(FAKE_RETPATH_URL), module.exports = yauth;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function attachCookieListener() {
        chrome.cookies.onChanged.hasListener(onCookieChanged) || chrome.cookies.onChanged.addListener(onCookieChanged);
    }
    function onCookieChanged(changeInfo) {
        var cookie = changeInfo.cookie;
        cookie.name === SESSION_COOKIE_NAME && cookie.domain === SESSION_COOKIE_DOMAIN && cookie.path === SESSION_COOKIE_PATH && processSessionCookie(!changeInfo.removed);
    }
    function processSessionCookie(cookieExists) {
        clearTimeout(cookieChangeTimeout), cookieChangeTimeout = setTimeout(function() {
            yauthCookies.onChanged.dispatchToListener(cookieExists);
        }, COOKIE_TIMEOUT_MS);
    }
    function checkCookie(domain) {
        chrome.cookies.getAll({
            name: SESSION_COOKIE_NAME,
            domain: domain,
            path: SESSION_COOKIE_PATH
        }, function(cookies) {
            var error = chrome.runtime.lastError;
            return error || !cookies ? void checkCookieAfterTimeout(domain) : void processSessionCookie(cookies.length > 0);
        });
    }
    function checkCookieAfterTimeout(domain) {
        setTimeout(checkCookie.bind(null, domain), RECHECK_COOKIE_TIMEOUT);
    }
    function processDomain(tld, template) {
        return template.replace("{tld}", tld || "ru");
    }
    var cookieChangeTimeout, debug, Signal = __webpack_require__(80), DOMAIN_TEMPLATE = ".yandex.{tld}", SESSION_COOKIE_DOMAIN = ".yandex.ru", SESSION_COOKIE_NAME = "Session_id", SESSION_COOKIE_PATH = "/", RECHECK_COOKIE_TIMEOUT = 1e4, COOKIE_TIMEOUT_MS = 100, yauthCookies = {
        init: function(params) {
            params = params || {}, SESSION_COOKIE_DOMAIN = processDomain(params.tld, DOMAIN_TEMPLATE), 
            debug = params.debug, attachCookieListener();
        },
        check: function() {
            checkCookie(SESSION_COOKIE_DOMAIN);
        },
        checkForCustomDomain: function(tld) {
            checkCookie(processDomain(tld, DOMAIN_TEMPLATE));
        },
        getYandexuidCookie: function(callback) {
            chrome.cookies.getAll({
                name: "yandexuid",
                domain: SESSION_COOKIE_DOMAIN,
                path: "/"
            }, function(cookies) {
                var value;
                cookies && cookies[0] && (value = cookies[0].value), callback(value);
            });
        },
        onChanged: new Signal("yauthCookies.onChanged")
    };
    module.exports = yauthCookies;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function getUrl(yandexuid) {
        var url = "https://pass.yandex.{tld}/accounts?yu={yandexuid}";
        return debug && (url = url.replace("https://pass.", "https://pass-rc.")), url.replace("{tld}", tld).replace("{yandexuid}", yandexuid);
    }
    function updateAfterTimeout(callback, error) {
        return void 0 === reconnectTimeout ? void callback(error ? error.type : "error") : void setTimeout(update.bind(null, callback), reconnectTimeout);
    }
    function update(callback) {
        yauthCookies.getYandexuidCookie(function(yandexuid) {
            return yandexuid ? void utils.loadResource({
                url: getUrl(yandexuid),
                onload: function() {
                    var json;
                    try {
                        json = JSON.parse(this.responseText);
                    } catch (ex) {
                        return void updateAfterTimeout(callback);
                    }
                    callback(json);
                },
                onerror: function(error) {
                    updateAfterTimeout(callback, error);
                }
            }) : void updateAfterTimeout(callback);
        });
    }
    var tld, reconnectTimeout, utils = __webpack_require__(79), yauthCookies = __webpack_require__(236), debug = !1;
    module.exports = {
        init: function(params) {
            params = params || {}, tld = params.tld, debug = params.debug, reconnectTimeout = params.reconnectTimeout;
        },
        update: function(callback) {
            callback = callback || utils.noop, update(callback);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var thenChrome = __webpack_require__(129), config = __webpack_require__(5), Logger = __webpack_require__(13), branding = __webpack_require__(30), preferences = __webpack_require__(6), browser = __webpack_require__(12), notification = __webpack_require__(239), i18n = __webpack_require__(93), ClckStatistics = __webpack_require__(104), innerDispatcher = __webpack_require__(9), api = window.api = module.exports = {
        init: function(adapter) {
            this._adapter = adapter, this._initClckStatistics(), this._addListenersFromBuffer();
        },
        addListener: function(topic, callback, ctx) {
            this._adapter ? this._adapter.addListener(topic, callback, ctx) : this._listenersBuffer.push({
                topic: topic,
                callback: callback,
                ctx: ctx
            });
        },
        notifySlice: function(topic, data, callback) {
            this._adapter && this._adapter.sendMessage(topic, data, callback);
        },
        notifyNano: function(topic, data, callback) {
            var options = {
                slice: !0
            };
            innerDispatcher.trigger(topic, data, options, callback);
        },
        _CLCK_FALLBACK_CID: 72359,
        _clckCid: 0,
        sendClickerStatistics: function(options) {
            this.clckStatistics.cid = options.cid || this._clckCid, this.clckStatistics.feature = options.statisticsId || config.get("clckFeature"), 
            this.clckStatistics.send({
                action: options.param,
                feature: options.statisticsId || config.get("clckFeature"),
                cid: options.cid || this._clckCid
            });
        },
        getCurrentTabUrl: function(callback) {
            browser.getCurrentTab(function(tab) {
                callback(tab ? tab.url : "");
            });
        },
        isCurrentWindowMinimized: function(callback) {
            thenChrome.windows.getCurrent().then(function(windowData) {
                callback("minimized" === windowData.state);
            });
        },
        logger: Logger.create("Slice"),
        navigate: function(url, target) {
            browser.navigate(url, target);
        },
        openSettings: function() {
            browser.openSettings();
        },
        options: preferences,
        notify: notification,
        i18n: {
            get locale() {
                return i18n.locale;
            },
            getString: function(key, placeholders) {
                return i18n.message(key, placeholders);
            }
        },
        branding: {
            getId: branding.get.bind(branding)
        },
        config: {
            getUI: function() {
                return config.ui;
            }
        },
        cookie: {
            get: function(domain, name, path, httpOnly, callback, ctx) {
                var options = {
                    domain: domain,
                    name: name
                };
                path && (options.path = path), chrome.cookies.getAll(options, function(cookies) {
                    if (cookies) for (var i = 0, l = cookies.length; i < l; i++) {
                        var coo = cookies[i];
                        if (coo.httpOnly === httpOnly) return void callback.call(ctx, coo.value);
                    }
                    this.logger.log("cookie with name %s and domain %s not found", name, domain);
                }.bind(api));
            }
        },
        _listenersBuffer: [],
        _addListenersFromBuffer: function() {
            this._listenersBuffer.forEach(function(listener) {
                this._adapter.addListener(listener.topic, listener.callback, listener.ctx);
            }, this), this._listenersBuffer = [];
        },
        _initClckStatistics: function() {
            this.clckStatistics = new ClckStatistics({
                feature: config.get("clckFeature"),
                platform: browser.getBrowser()
            }), this._clckCid = this.clckStatistics.cid || this._CLCK_FALLBACK_CID;
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var dispatcher = __webpack_require__(9), utils = __webpack_require__(7), Logger = __webpack_require__(13), AppEvent = __webpack_require__(10), logger = Logger.create("Notifications");
    module.exports = {
        CLICK_TARGET_OTHER: 1,
        CLICK_TARGET_TITLE: 2,
        CLICK_TARGET_OPTIONS: 3,
        CLICK_TARGET_CLOSE: 4,
        CLOSE_REASON_TIMEOUT: 1,
        CLOSE_REASON_CLOSED_BY_USER: 2,
        TEMPLATE_MESSAGE: 1,
        TEMPLATE_MAIL: 2,
        TEMPLATE_GROUP: 3,
        TIMEOUT: 8e3,
        CLEAR_SHOWN_TIMEOUT: 6048e5,
        _listeners: [],
        _shown: {},
        inited: !1,
        init: function() {
            this.inited || (this._addChromeListeners(), this._listeners = [], this._shown = {}, 
            this.inited = !0);
        },
        create: function(notificationData) {
            var data = this._prepareData(notificationData), notifSupport = this._notifSupport();
            return "rich" === notifSupport ? this._createChromeNotification(data) : "web" === notifSupport ? this._createWebNotification(data) : void logger.error("Cannot create notification. Browser does not support notifications");
        },
        addListener: function(listeners) {
            this._listeners.indexOf(listeners) === -1 && this._listeners.push(listeners);
        },
        removeListener: function(listeners) {
            var index = this._listeners.indexOf(listeners);
            index >= 0 && this._listeners.splice(index, 1);
        },
        _prepareData: function(notificationData) {
            return notificationData.template === this.TEMPLATE_GROUP ? utils.objectUpdate(notificationData, {
                title: notificationData.defaultTitle,
                message: notificationData.mainText || notificationData.title,
                webMessage: notificationData.text || notificationData.title
            }) : utils.objectUpdate(notificationData, {
                title: notificationData.title,
                message: notificationData.mainText,
                webMessage: notificationData.text,
                contextMessage: notificationData.subText
            });
        },
        _createWebNotification: function(data) {
            var id = Date.now(), notification = new window.Notification(data.title, {
                body: data.webMessage,
                icon: data.icon,
                tag: id
            });
            return this._onShow(data, id, notification), notification.addEventListener("click", this._onClicked.bind(this, id)), 
            notification.addEventListener("close", this._onClose.bind(this, id, !0)), notification;
        },
        _createChromeNotification: function(data) {
            var options = {
                type: "basic",
                iconUrl: data.icon,
                title: data.title,
                message: data.message
            };
            data.contextMessage && (options.contextMessage = data.contextMessage), data.buttons && (options.buttons = data.buttons), 
            chrome.notifications.create("", options, this._onShow.bind(this, data));
        },
        _notifSupport: function() {
            return chrome.notifications ? "rich" : window.Notification ? "web" : "none";
        },
        _addChromeListeners: function() {
            chrome.notifications && (chrome.notifications.onClosed.addListener(this._onClose.bind(this)), 
            chrome.notifications.onClicked.addListener(this._onClicked.bind(this)), chrome.notifications.onButtonClicked.addListener(this._onButtonClicked.bind(this)));
        },
        _onShow: function(data, id, webNotification) {
            chrome.runtime.lastError && logger.warn("there was an error during last operations: %j", chrome.runtime.lastError), 
            data.showTime = Date.now(), data.processed = !1, data.webNotification = webNotification, 
            this._shown[id] = data, dispatcher.trigger(AppEvent.NOTIFICATION_SHOW, data), setTimeout(this._onTimeout.bind(this, id), this.TIMEOUT);
        },
        _onClose: function(id, byUser) {
            var notification = this._shown[id];
            notification && notification.processed === !1 && (notification.processed = !0, this._listeners.forEach(function(listeners) {
                byUser ? utils.isFunction(listeners.notificationClicked) && listeners.notificationClicked(id, notification, this.CLICK_TARGET_CLOSE) : utils.isFunction(listeners.notificationClosed) && listeners.notificationClosed(id, notification, this.CLOSE_REASON_TIMEOUT);
            }, this)), this._clearShown();
        },
        _onTimeout: function(id) {
            var notification = this._shown[id];
            notification && notification.processed === !1 && (notification.processed = !0, this._listeners.forEach(function(listeners) {
                utils.isFunction(listeners.notificationClosed) && listeners.notificationClosed(id, notification, this.CLOSE_REASON_TIMEOUT);
            }, this), this._tryCloseWebNotification(notification)), this._clearShown();
        },
        _onClicked: function(id) {
            var notification = this._shown[id];
            notification && (notification.processed = !0, this._listeners.forEach(function(listeners) {
                utils.isFunction(listeners.notificationClicked) && listeners.notificationClicked(id, notification, this.CLICK_TARGET_TITLE);
            }, this)), this._clearShown(), "rich" === this._notifSupport() && chrome.notifications.clear(id);
        },
        _onButtonClicked: function(id, buttonIndex) {
            var notification = this._shown[id];
            notification && (notification.processed = !0, this._listeners.forEach(function(listeners) {
                utils.isFunction(listeners.notificationButtonClicked) && listeners.notificationButtonClicked(id, notification, buttonIndex);
            }, this)), this._clearShown(), chrome.notifications.clear(id);
        },
        _clearShown: function() {
            var date = Date.now();
            Object.keys(this._shown).forEach(function(id) {
                date - this._shown[id].showTime > this.CLEAR_SHOWN_TIMEOUT && delete this._shown[id];
            }, this);
        },
        _tryCloseWebNotification: function(notificationData) {
            var webNotification = notificationData.webNotification;
            webNotification && utils.isFunction(webNotification.close) && webNotification.close();
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var browser = __webpack_require__(12), platform = __webpack_require__(11);
    module.exports = {
        init: function() {
            var canOpen = !1;
            canOpen && (platform.isInstall || platform.isUpgrade && "8.23.0" === platform.upgradedVersion) && chrome.windows.getAll({
                windowTypes: [ "normal" ]
            }, function(wins) {
                wins.length ? this._openWelcome() : chrome.windows.onCreated.addListener(function(win) {
                    "normal" === win.type && this._openWelcome();
                }.bind(this));
            }.bind(this));
        },
        _openWelcome: function() {
            browser.navigate("https://yandex.ru/soft/element/");
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function createMailToUrl(email) {
        email = email.replace(/^mailto:/, "");
        var url, domain = authManager.proposeDomain();
        return url = domain ? branding.data("mail-api-domain") + "/for/" + domain : branding.data("mail-redir-domain"), 
        url + "/compose?mailto=" + encodeURIComponent(email);
    }
    var browser = __webpack_require__(12), dispatcher = __webpack_require__(242), branding = __webpack_require__(30), preferences = __webpack_require__(6), authManager = __webpack_require__(234), mailToPrefName = "application.mail-protocol-hook";
    module.exports = {
        init: function() {
            dispatcher.on("yandex.mail.compose", this.handleMailComposeEvent.bind(this)), dispatcher.on("yandex.mail.get-mailto-value", this.handleGetMailtoEvent.bind(this)), 
            dispatcher.on("wdgt.preferences.setted", this.resendDataToContentScripts.bind(this));
        },
        handleMailComposeEvent: function(topic, data) {
            var email = data.url, url = createMailToUrl(email);
            browser.navigate(url, browser.NEW_TAB);
        },
        handleGetMailtoEvent: function(topic, data, options) {
            data && options.tab && this.sendMessageWithPreference(options.tab);
        },
        resendDataToContentScripts: function(topic, data) {
            data.name === mailToPrefName && chrome.tabs.query({
                url: "<all_urls>"
            }, function(tabs) {
                Array.isArray(tabs) && tabs.forEach(this.sendMessageWithPreference, this);
            }.bind(this));
        },
        sendMessageWithPreference: function(tab) {
            browser.sendMessage(tab.id, {
                topic: "wdgt.preferences.getted",
                data: {
                    name: mailToPrefName,
                    value: preferences.get(mailToPrefName)
                }
            });
        }
    };
}, function(module, exports) {
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
}, function(module, exports, __webpack_require__) {
    "use strict";
    function setupNotificationSounds() {
        dispatcher.on("counter:increased", handleCounterIncreasedEvent), audioElement = new Audio(chrome.runtime.getURL("audio/message.mp3"));
    }
    function handleCounterIncreasedEvent() {
        browser.getCurrentTab(function(tab) {
            tab && mailUrlRegExp.test(tab.url) !== !1 || playSound();
        });
    }
    function playSound() {
        preferences.get("playSoundAlert") && audioElement.play();
    }
    var audioElement, dispatcher = __webpack_require__(9), preferences = __webpack_require__(6), browser = __webpack_require__(12), mailUrlRegExp = /^https?:\/\/(www\.)?mail\.yandex\..*/;
    module.exports = {
        init: function() {
            setupNotificationSounds();
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function fixNotificationShowOptions() {
        var showOption = storage.getItem(oldKey);
        showOption && (storage.setItem(newKey, showOption), storage.removeItem(oldKey));
    }
    var Migration = __webpack_require__(245);
    Migration.add("2.9.0", function(callback) {
        fixNotificationShowOptions(), "function" == typeof callback && callback.call();
    });
    var oldKey = "yandex.mail.push.enable", newKey = "showTextAlert", storage = window.localStorage;
    module.exports = Migration;
}, function(module, exports, __webpack_require__) {
    "use strict";
    var preferences = __webpack_require__(6), series = __webpack_require__(53), options = __webpack_require__(102);
    module.exports = {
        migrations: [],
        add: function(version, migrationHandler) {
            this.migrations.push({
                version: version,
                handler: migrationHandler
            }), this.migrations = this.migrations.sort(this._sortMigrations);
        },
        up: function(callback) {
            var migrations = this.actualMigrations;
            migrations.length > 0 && this._applyMigrations(migrations, callback);
        },
        flush: function() {
            this.migrations = [];
        },
        _applyMigrations: function(migrations, callback) {
            var tasks = migrations.map(function(migration) {
                return this._apply(migration);
            }, this);
            return series(tasks, callback);
        },
        _apply: function(migration) {
            return function(done) {
                preferences.set(options.MIGRATION_KEY, migration.version), migration.handler(done);
            };
        },
        get actualMigrations() {
            var lastVersion = preferences.get(options.MIGRATION_KEY), startIndex = 0;
            return lastVersion && this.migrations.forEach(function(migration, index) {
                migration.version === lastVersion && (startIndex = index + 1);
            }), this.migrations.slice(startIndex);
        },
        _sortMigrations: function(m1, m2) {
            return m1.version.localeCompare(m2.version);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function handleMailDataEvent(data) {
        data = data || {};
        var counter = data.count;
        dispatcher.trigger(COUNTER_UPDATED_EVENT, {
            count: counter
        }), notifyIncreasedCounter(counter);
    }
    var dispatcher = __webpack_require__(9), preferences = __webpack_require__(6), authManager = __webpack_require__(234), utils = __webpack_require__(7), COUNTER_PREF = "mail.counter", SHOW_ALL_COUNTERS_OPTION_PREF = "allAccountsCounter", DEFAULT_UID_PREF = "mail.accounts-def-uid", COUNTER_UPDATED_EVENT = "counter:updated", COUNTER_INCREASED_EVENT = "counter:increased", INCREASED_DEBOUNCE_TIMEOUT = 2e3, savedShowAllCountersOption = preferences.get(SHOW_ALL_COUNTERS_OPTION_PREF), notifyIncreasedCounter = utils.debounce(function(counter) {
        var prevCounter = preferences.get(COUNTER_PREF), showAllCountersOption = preferences.get(SHOW_ALL_COUNTERS_OPTION_PREF), defaultUid = authManager.getDefaultUid(), prevDefaultUid = preferences.get(DEFAULT_UID_PREF);
        preferences.set(COUNTER_PREF, counter), preferences.set(DEFAULT_UID_PREF, defaultUid), 
        counter > prevCounter && savedShowAllCountersOption === showAllCountersOption && prevDefaultUid === defaultUid && dispatcher.trigger(COUNTER_INCREASED_EVENT, {
            count: counter
        }), savedShowAllCountersOption = showAllCountersOption;
    }, INCREASED_DEBOUNCE_TIMEOUT);
    module.exports = {
        init: function() {
            dispatcher.on("mail:data", handleMailDataEvent);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var browser = __webpack_require__(12), dispatcher = __webpack_require__(9), i18n = __webpack_require__(93), branding = __webpack_require__(30), button = __webpack_require__(248), preferences = __webpack_require__(6), Logger = __webpack_require__(13), authManager = __webpack_require__(234), AppEvent = __webpack_require__(10), logger = Logger.create("Button");
    module.exports = {
        ICONS: {
            NO_CONNECTION: "mail_no_connect",
            NO_LOGIN: "mail_no_login",
            NORMAL: "mail"
        },
        BADGE_COLOR: "#94acdf",
        OPEN_PORTAL_PREFERENCE: "application.open-portal",
        COUNTER_OPTION_NAME: "allAccountsCounter",
        init: function() {
            this.currentUrl = "", button.setBadge(""), button.setBadgeBackgroundColor(this.BADGE_COLOR), 
            button.setTitle(i18n.message("button.noauth")), this.image(this.ICONS.NO_LOGIN), 
            button.onClick(this.onButtonClick.bind(this)), dispatcher.on("wdgt.preferences.setted", this.onPreference, this), 
            dispatcher.on("counter:updated", this.handleCounterUpdatedEvent, this), dispatcher.on("auth:data", this.handleAuthDataEvent, this), 
            this.updateButtonUrl(this.currentUrl, preferences.get(this.OPEN_PORTAL_PREFERENCE));
        },
        onButtonClick: function() {
            logger.log("Handle click"), this.trySendButtonRedirStat(), this.openPortal();
        },
        trySendButtonRedirStat: function() {
            var action = "button";
            preferences.get(this.OPEN_PORTAL_PREFERENCE) && (action = "buttonredir"), dispatcher.trigger(AppEvent.CLICKER, {
                action: action
            });
        },
        openPortal: function() {
            var domain = authManager.proposeDomain(), domainPart = domain ? "/for/" + domain : "", url = branding.data("mail-redir-domain") + domainPart + "/?origin=elmt_mailchrome";
            logger.log("Navigate to url: %s", url), browser.navigate(url);
        },
        handleCounterUpdatedEvent: function(data) {
            this._showCounter(data.count);
        },
        handleAuthDataEvent: function(data) {
            data = data || {}, data.hasAuth ? (this.currentUrl = "slice/index.html", logger.log("handleAuthDataEvent - has auth, show slice on click")) : (button.setBadge(""), 
            this.image(this.ICONS.NO_LOGIN), button.setTitle(i18n.message("button.noauth")), 
            this.currentUrl = "", logger.log("handleAuthDataEvent - no auth, handle click in background")), 
            this.updateButtonUrl(this.currentUrl, preferences.get(this.OPEN_PORTAL_PREFERENCE));
        },
        _showCounter: function(count) {
            var countStr = String(count);
            (isNaN(count) || count <= 0) && (count = 0, countStr = ""), count > 9e3 && (countStr = "9K+"), 
            this.image(this.ICONS.NORMAL), button.setBadge(countStr);
            var title = i18n.pluralMessage("button.new-msg", count);
            button.setTitle(title);
        },
        onPreference: function(data) {
            switch (data.name) {
              case this.OPEN_PORTAL_PREFERENCE:
                this.updateButtonUrl(this.currentUrl, data.value);
                break;

              case this.COUNTER_OPTION_NAME:
                chrome.runtime.sendMessage({
                    message: "options:change",
                    data: data
                });
            }
        },
        updateButtonUrl: function(url, openPortalFlag) {
            !url || openPortalFlag ? this.url("") : this.url(url);
        },
        url: function(url) {
            button.setPopup(url);
        },
        image: function(code) {
            button.setImage("/button/img/" + code + ".png");
        }
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        onClick: function(handler) {
            return chrome.browserAction.onClicked.addListener(handler);
        },
        setImage: function(src, bigSrc) {
            var path = src;
            bigSrc && (path = {
                19: src,
                38: bigSrc
            }), chrome.browserAction.setIcon({
                path: path
            });
        },
        setTitle: function(title) {
            chrome.browserAction.setTitle({
                title: title
            });
        },
        setBadgeText: function(text) {
            chrome.browserAction.setBadgeText({
                text: text
            });
        },
        setBadgeBackgroundColor: function(color) {
            chrome.browserAction.setBadgeBackgroundColor({
                color: color
            });
        },
        setBadge: function(text, backgroundColor) {
            "string" == typeof text && this.setBadgeText(text), (Array.isArray(backgroundColor) || "string" == typeof backgroundColor) && this.setBadgeBackgroundColor(backgroundColor);
        },
        setPopup: function(src, tabId) {
            var details = {
                popup: src
            };
            "number" == typeof tabId && (details.tabId = tabId), chrome.browserAction.setPopup(details);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var browser = __webpack_require__(12), i18n = __webpack_require__(93);
    module.exports = {
        beforeCallback: null,
        before: function(func) {
            this.beforeCallback = func;
        },
        init: function(done) {
            return browser.incognito ? (this._callBefore(), this._throwError()) : void done();
        },
        _callBefore: function() {
            "function" == typeof this.beforeCallback && this.beforeCallback();
        },
        _throwError: function() {
            var msg = i18n.message("forbidden-in-incognito");
            throw window.alert(msg), new Error(msg);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var clicker, browser = __webpack_require__(12), preferences = __webpack_require__(6), sharedData = __webpack_require__(48), dispatcher = __webpack_require__(242), config = __webpack_require__(5), OptionEvent = __webpack_require__(251), LogViewer = __webpack_require__(252), Clicker = __webpack_require__(104);
    module.exports = {
        run: function() {
            this._logViewer = new LogViewer(), this._listenOptionEvents(), this._createStatistics();
        },
        _createStatistics: function() {
            var version = chrome.runtime.getManifest().version.replace(/\./g, "-");
            clicker = new Clicker({
                platform: browser.getBrowser(),
                feature: config.get("clckFeature"),
                version: version
            });
        },
        _listenOptionEvents: function() {
            dispatcher.on(OptionEvent.UPDATE_PREFERENCE, this._updatePreferenceHandler, this), 
            dispatcher.on(OptionEvent.UPDATE_SHARED_DATA, this._updateSharedHandler, this), 
            dispatcher.on(OptionEvent.SHOW_LOG, this._logHandler, this), dispatcher.on(OptionEvent.CLICKER, this._clickerHandler, this), 
            dispatcher.on(OptionEvent.NAVIGATE, this._navigateHandler, this), dispatcher.on(OptionEvent.RESTORE_DEFAULTS, this._restoreHandler, this);
        },
        _updatePreferenceHandler: function(topic, data) {
            preferences.set(data.key, data.value);
        },
        _updateSharedHandler: function(topic, data) {
            sharedData.set(data);
        },
        _logHandler: function() {
            this._logViewer.view();
        },
        _clickerHandler: function(topic, data) {
            clicker.send(data);
        },
        _navigateHandler: function(topic, data) {
            browser.navigate(data.url);
        },
        _restoreHandler: function(topic, sharedItems) {
            preferences.restoreDefaults();
            var sharedObject = sharedItems.reduce(function(obj, current) {
                return obj[current] = preferences.getDefault(current), obj;
            }, {});
            sharedData.set(sharedObject);
        }
    };
}, function(module, exports) {
    "use strict";
    module.exports = {
        UPDATE_PREFERENCE: "options.update.preferences",
        UPDATE_SHARED_DATA: "options.update.shared.data",
        CLICKER: "options.send.statistics",
        NAVIGATE: "options.navigate",
        SHOW_LOG: "options.show.log",
        RESTORE_DEFAULTS: "options.restore.defaults"
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function LogViewer(logFilePath, archiveLogFilePath) {
        this._logFilePath = logFilePath ? logFilePath : "debug.log", this._archiveLogFilePath = archiveLogFilePath ? archiveLogFilePath : "debug-old.log";
    }
    function createPage(data) {
        var html = createHtml(data), pageUrl = createObjectURL(html);
        chrome.tabs.create({
            url: pageUrl
        });
    }
    function createHtml(data) {
        var content = createContent(data), layoutLocals = {
            dataURL: createObjectURL(content),
            content: content
        };
        return logLayoutTemplate(layoutLocals);
    }
    function createContent(data) {
        var contentLocals = {
            entries: createEntries(data)
        };
        return logContentTemplate(contentLocals);
    }
    function createEntries(data) {
        if (data) {
            var list = data.trim().split("\n");
            return list.map(createEntryWithStyle);
        }
        return [];
    }
    function createObjectURL(data) {
        return URL.createObjectURL(new Blob([ data ], {
            type: "text/html"
        }));
    }
    function createEntryWithStyle(entry) {
        for (var stylePrefix in itemStyles) if (entry.indexOf(stylePrefix) !== -1) return {
            style: itemStyles[stylePrefix],
            content: entry
        };
        return {
            style: "",
            content: entry
        };
    }
    function processError(error) {
        logger.error("Error during log reading: %j", error);
    }
    var Logger = __webpack_require__(13), fs = __webpack_require__(253), logLayoutTemplate = __webpack_require__(254), logContentTemplate = __webpack_require__(257), logger = Logger.create("log-viewer"), itemStyles = {
        INFO: "color: blue",
        ERROR: "background-color: pink; color: darkred; font-weight: bold",
        WARN: "background-color: lightyellow; color: orangered; font-weight: bold"
    };
    LogViewer.prototype.view = function() {
        this._concatFiles().then(createPage).catch(processError);
    }, LogViewer.prototype._concatFiles = function() {
        return Promise.all([ fs.getFileContent(this._archiveLogFilePath), fs.getFileContent(this._logFilePath) ]).then(function(results) {
            return results.join("");
        });
    }, module.exports = LogViewer;
}, function(module, exports) {
    "use strict";
    function getRequestFileSystemMethod() {
        return window.webkitRequestFileSystem || window.requestFileSystem;
    }
    function getFileFromFileSystem(resolve, path, windowFsLink) {
        windowFsLink.root.getFile(path, {
            create: !0,
            exclusive: !1
        }, getFileFromFileEntry.bind(null, resolve));
    }
    function getFileFromFileEntry(resolve, fileEntry) {
        fileEntry.file(readFile.bind(null, resolve));
    }
    function readFile(resolve, file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            resolve(reader.result);
        }, reader.readAsText(file);
    }
    module.exports = {
        getFileContent: function(path) {
            return new Promise(function(resolve, reject) {
                var requestFileSystem = getRequestFileSystemMethod();
                requestFileSystem(window.PERSISTENT, 0, getFileFromFileSystem.bind(null, resolve, path), reject);
            });
        }
    };
}, function(module, exports, __webpack_require__) {
    var jade = __webpack_require__(255);
    module.exports = function(locals) {
        var jade_interp, buf = [], locals_for_with = locals || {};
        return function(content, dataURL) {
            buf.push('<!DOCTYPE html><html><head><title>Logs</title><meta charset="utf-8"></head><body><button style="margin-left: 50px; font-size: 22px"><a' + jade.attr("href", dataURL, !0, !0) + ' download="log.html">Download</a></button>' + (null == (jade_interp = content) ? "" : jade_interp) + "</body></html>");
        }.call(this, "content" in locals_for_with ? locals_for_with.content : "undefined" != typeof content ? content : void 0, "dataURL" in locals_for_with ? locals_for_with.dataURL : "undefined" != typeof dataURL ? dataURL : void 0), 
        buf.join("");
    };
}, function(module, exports, __webpack_require__) {
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
}, function(module, exports) {}, function(module, exports, __webpack_require__) {
    var jade = __webpack_require__(255);
    module.exports = function(locals) {
        var jade_interp, buf = [], locals_for_with = locals || {};
        return function(entries, undefined) {
            buf.push('<pre style="padding: 5px 10px 10px 30px; word-wrap: break-word; white-space: pre-wrap;"><ol>'), 
            function() {
                var $$obj = entries;
                if ("number" == typeof $$obj.length) for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
                    var item = $$obj[$index];
                    buf.push("<li" + jade.attr("style", item.style, !0, !1) + ">" + jade.escape(null == (jade_interp = item.content) ? "" : jade_interp) + "</li>");
                } else {
                    var $$l = 0;
                    for (var $index in $$obj) {
                        $$l++;
                        var item = $$obj[$index];
                        buf.push("<li" + jade.attr("style", item.style, !0, !1) + ">" + jade.escape(null == (jade_interp = item.content) ? "" : jade_interp) + "</li>");
                    }
                }
            }.call(this), buf.push("</ol></pre>");
        }.call(this, "entries" in locals_for_with ? locals_for_with.entries : "undefined" != typeof entries ? entries : void 0, "undefined" in locals_for_with ? locals_for_with.undefined : void 0), 
        buf.join("");
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var Clicker = __webpack_require__(104), dispatcher = __webpack_require__(9), outerDispatcher = __webpack_require__(242), AppEvent = __webpack_require__(10), browser = __webpack_require__(12), config = __webpack_require__(5);
    module.exports = {
        isRunning: !1,
        run: function() {
            this.isRunning || (this._createStatistics(), this.isRunning = !0);
        },
        _createStatistics: function() {
            this.clicker = new Clicker({
                feature: config.get("clckFeature"),
                platform: browser.getBrowser()
            }), dispatcher.on(AppEvent.CLICKER, this._sendClicker, this), outerDispatcher.on(AppEvent.CLICKER, this._clickHandler, this);
        },
        _clickHandler: function(topic, data) {
            this._sendClicker(data);
        },
        _sendClicker: function(data) {
            this.clicker.send(data);
        }
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    function uncaughtErrorHandler(error, event) {
        event ? event instanceof ErrorEvent ? logger.error(getErrorDescriptionString(event, error)) : event instanceof PromiseRejectionEvent ? logger.error(getRejectionDescriptionString(error)) : logger.error("unhandled exception or promise rejection was catched, event object is unknown") : logger.error("unhandled exception or promise rejection was catched, event object is empty");
    }
    function getErrorDescriptionString(event, error) {
        return error ? error.stack && error.message ? fillErrorDescriptionTemplate(event, error.message) : fillErrorDescriptionTemplate(event, convertErrorToString(error)) : fillErrorDescriptionTemplate(event, event.message);
    }
    function fillErrorDescriptionTemplate(event, informationMessage) {
        return ERROR_DESCRIPTION_TEMPLATE.replace("%1", event.filename).replace("%2", event.lineno).replace("%3", event.colno).replace("%4", informationMessage);
    }
    function getRejectionDescriptionString(error) {
        return error ? fillRejectionDescriptionTemplate(error.stack ? error.stack : convertErrorToString(error)) : "unhandled promise rejection catched";
    }
    function fillRejectionDescriptionTemplate(informationMessage) {
        return REJECTION_DESCRIPTION_TEMPLATE.replace("%1", informationMessage);
    }
    function convertErrorToString(error) {
        try {
            return JSON.stringify(error);
        } catch (e) {
            return String(error);
        }
    }
    var uncaught = __webpack_require__(260), ERROR_DESCRIPTION_TEMPLATE = "unhandled exception from %1: line: %2, column: %3, information: %4", REJECTION_DESCRIPTION_TEMPLATE = "unhandled promise rejection: %1", logger = null;
    exports.run = function(errorsLogger) {
        logger = errorsLogger, uncaught.start(), uncaught.addListener(uncaughtErrorHandler);
    };
}, function(module, exports, __webpack_require__) {
    (function(process) {
        !function(root, factory) {
            module.exports = factory();
        }(this, function() {
            return function(modules) {
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
            }([ function(module, exports) {
                "use strict";
                function browserErrorHandler(event) {
                    var error = event ? event.error : void 0;
                    callListeners(error, event);
                }
                function browserRejectionHandler(event) {
                    var error = event ? event.reason : void 0;
                    callListeners(error, event);
                }
                function nodeErrorHandler(error) {
                    handlersAreTurnedOn && callListeners(error, null);
                }
                function nodeRejectionHandler(reason) {
                    handlersAreTurnedOn && callListeners(reason, null);
                }
                function callListeners(error, event) {
                    listeners.forEach(function(listener) {
                        listener(error, event);
                    });
                }
                var isBrowser = "undefined" != typeof window, listeners = [], handlersAreRegistered = !1, handlersAreTurnedOn = !1;
                module.exports = {
                    start: function() {
                        handlersAreTurnedOn || (handlersAreRegistered || (isBrowser ? (window.addEventListener("error", browserErrorHandler), 
                        window.addEventListener("unhandledrejection", browserRejectionHandler)) : (process.on("uncaughtException", nodeErrorHandler), 
                        process.on("unhandledRejection", nodeRejectionHandler)), handlersAreRegistered = !0), 
                        handlersAreTurnedOn = !0);
                    },
                    stop: function() {
                        handlersAreTurnedOn && (isBrowser && (window.removeEventListener("error", browserErrorHandler), 
                        window.removeEventListener("unhandledrejection", browserRejectionHandler), handlersAreRegistered = !1), 
                        handlersAreTurnedOn = !1);
                    },
                    addListener: function(listener) {
                        "function" == typeof listener && listeners.push(listener);
                    },
                    removeListener: function(listener) {
                        var index = listeners.indexOf(listener);
                        index > -1 && listeners.splice(index, 1);
                    },
                    removeAllListeners: function() {
                        listeners.length = 0;
                    },
                    flush: function() {
                        this.removeAllListeners(), this.stop();
                    }
                };
            } ]);
        });
    }).call(exports, __webpack_require__(261));
}, function(module, exports) {
    function defaultSetTimout() {
        throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
        throw new Error("clearTimeout has not been defined");
    }
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) return cachedSetTimeout = setTimeout, 
        setTimeout(fun, 0);
        try {
            return cachedSetTimeout(fun, 0);
        } catch (e) {
            try {
                return cachedSetTimeout.call(null, fun, 0);
            } catch (e) {
                return cachedSetTimeout.call(this, fun, 0);
            }
        }
    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) return cachedClearTimeout = clearTimeout, 
        clearTimeout(marker);
        try {
            return cachedClearTimeout(marker);
        } catch (e) {
            try {
                return cachedClearTimeout.call(null, marker);
            } catch (e) {
                return cachedClearTimeout.call(this, marker);
            }
        }
    }
    function cleanUpNextTick() {
        draining && currentQueue && (draining = !1, currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1, 
        queue.length && drainQueue());
    }
    function drainQueue() {
        if (!draining) {
            var timeout = runTimeout(cleanUpNextTick);
            draining = !0;
            for (var len = queue.length; len; ) {
                for (currentQueue = queue, queue = []; ++queueIndex < len; ) currentQueue && currentQueue[queueIndex].run();
                queueIndex = -1, len = queue.length;
            }
            currentQueue = null, draining = !1, runClearTimeout(timeout);
        }
    }
    function Item(fun, array) {
        this.fun = fun, this.array = array;
    }
    function noop() {}
    var cachedSetTimeout, cachedClearTimeout, process = module.exports = {};
    !function() {
        try {
            cachedSetTimeout = "function" == typeof setTimeout ? setTimeout : defaultSetTimout;
        } catch (e) {
            cachedSetTimeout = defaultSetTimout;
        }
        try {
            cachedClearTimeout = "function" == typeof clearTimeout ? clearTimeout : defaultClearTimeout;
        } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
        }
    }();
    var currentQueue, queue = [], draining = !1, queueIndex = -1;
    process.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
        queue.push(new Item(fun, args)), 1 !== queue.length || draining || runTimeout(drainQueue);
    }, Item.prototype.run = function() {
        this.fun.apply(null, this.array);
    }, process.title = "browser", process.browser = !0, process.env = {}, process.argv = [], 
    process.version = "", process.versions = {}, process.on = noop, process.addListener = noop, 
    process.once = noop, process.off = noop, process.removeListener = noop, process.removeAllListeners = noop, 
    process.emit = noop, process.prependListener = noop, process.prependOnceListener = noop, 
    process.listeners = function(name) {
        return [];
    }, process.binding = function(name) {
        throw new Error("process.binding is not supported");
    }, process.cwd = function() {
        return "/";
    }, process.chdir = function(dir) {
        throw new Error("process.chdir is not supported");
    }, process.umask = function() {
        return 0;
    };
} ]);