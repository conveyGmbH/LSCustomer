// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints,
// and then run "window.location.reload()" in the JavaScript Console.
/// <reference path="~/www/lib/WinJS/scripts/base.min.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/pageFrame.js" />
/// <reference path="~/www/scripts/generalData.js" />

(function () {
    "use strict";

    Application.rootElementId = "ls-customer-host";
    Colors.corsAwareCssRuleAccess = true;

    // default settings
    AppData.persistentStatesDefaults = {
        colorSettings: {
            // navigation-color with 100% saturation and brightness
            //accentColor: "#fe3600"
            accentColor: "#c2d63e"
        },
        logEnabled: true,
        logLevel: 3,
        logGroup: false,
        logNoStack: true,
        logWinJS: false,
        inputBorder: 1,
        inputBorderRadius: 2,
        inputBorderBottom: true,
        iconStrokeWidth: 150,
        loadRemoteResource: true,
        manualTheme: true,
        odata: {
            https: true,
            hostName: "leadsuccess.convey.de",
            onlinePort: 443,
            urlSuffix: null,
            onlinePath: "odata_online", // serviceRoot online requests
            login: "",
            password: "",
            privacyPolicyFlag: false,
            privacyPolicydisabled: true,
            registerPath: "odata_register", // serviceRoot register requests
            registerLogin: "AppRegister",
            registerPassword: "6530bv6OIUed3",
            useOffline: false,
            replActive: false,
            replInterval: 30,
            replPrevPostMs: 0,
            replPrevSelectMs: 0,
            replPrevFlowSpecId: 0,
            dbSiteId: 0,
            timeZoneAdjustment: 0,
            timeZoneRemoteAdjustment: null,
            timeZoneRemoteDiffMs: 0,
            serverFailure: false,
            corsQuirks: true
        }, registerData: {
            AnredeID: null, /* INITAnredeID: 0,*/
            Email: null,
            Name: "",
            Vorname: "",
            Position: "",
            Firmenname: "",
            UserTZ: moment.tz.guess(),
            privacyPolicyFlag: false,
            LanguageId: null,
            joinedSessionDate: null
        }
    };

    // static array of menu groups for the split view pane
    Application.navigationBarGroups = [
        { id: "home", group: 1, svg: "home", disabled: false },
        { id: "events", group: 2, svg: "calendar_clock", disabled: false }
    ];

    // static array of pages for the navigation bar
    Application.navigationBarPages = [
        { id: "home", group: -1, disabled: false },
        { id: "events", group: -2, disabled: false },
        { id: "event", group: -2, disabled: false },
        { id: "modSession", group: -3, disabled: false },
	    { id: "speakerSession", group: -4, disabled: false }
    ];


    // static array of pages master/detail relations
    Application.navigationMasterDetail = [
    ];

    var newQuery = getQueryStringParameters();
    if (newQuery && newQuery.pageId) {
        Application.query = newQuery;
    }

    // init page for app startup
    //Application.initPage = Application.getPagePath("dbinit");
    // home page of app
    Application.startPage = Application.getPagePath("home");

    var xhrOpen = null, xhrSend = null, WsCtor = null;

    var a = document.createElement("a");
    a.href = "/";
    function abs(uri) {
        a.href = uri;
        return a.href;
    }
    Application.wssUrl = "";
    Application.httpsUrl = "";
    var wssSrc = "wss://" + a.host + "/";
    var httpsSrc = "https://" + a.host + "/";
    // some more default page navigation handling
    Application.navigateByIdOverride = function (id, event) {
        Log.call(Log.l.trace, "Application.", "id=" + id + " login=" + AppData._persistentStates.odata.login);
        if (!WsCtor && window.WebSocket) {
            WsCtor = window.WebSocket;
            window.WebSocket = WinJS.Class.define(function constructor(url, protocols) {
                this._hook = false;
                if (AppData &&
                    AppData._persistentStates &&
                    AppData._persistentStates.odata) {
                    var hookPath = (AppData._persistentStates.odata.https ? "wss" : "ws") + "://" +
                        AppData._persistentStates.odata.hostName +
                        (AppData._persistentStates.odata.onlinePort &&
                            !(AppData._persistentStates.odata.https && AppData._persistentStates.odata.onlinePort === 443 ||
                                AppData._persistentStates.odata.onlinePort === 80) ? ":" + AppData._persistentStates.odata.onlinePort : "") +
                        "/html5client/sockjs/";
                    if (url && url.substr(0, hookPath.length) === hookPath) {
                        this._hook = true;
				    }
                }
                Log.print(Log.l.info, (this._hook ? "hooked " : "") + "WebSocket url=" + url);
                this._ws = new WsCtor(url, protocols);
            }, {
                binaryType: {
                    get: function() {
                        return this._ws.binaryType;
                    },
                    set: function(value) {
                        this._ws.binaryType = value;
                    }
                },
                bufferedAmount: {
                    get: function() {
                        return this._ws.bufferedAmount;
                    }
                },
                extensions: {
                    get: function() {
                        return this._ws.extensions;
                    }
                },
                onclose: {
                    get: function() {
                        return this._ws.onclose;
                    },
                    set: function(value) {
                        this._ws.onclose = value;
                    }
                },
                onerror: {
                    get: function() {
                        return this._ws.onerror;
                    },
                    set: function(value) {
                        this._ws.onerror = value;
                    }
                },
                onmessage: {
                    get: function() {
                        return this._ws.onmessage;
                    },
                    set: function(handler) {
                        var that = this;
                        this._ws.onmessage = function(ev) {
                            if (that._hook) {
                                that.hookOnMessage(ev, handler);
                            } else if (typeof handler === "function") {
                                handler(ev);
                            }
                        };
                    }
                },
                onopen: {
                    get: function() {
                        return this._ws.onopen;
                    },
                    set: function(value) {
                        this._ws.onopen = value;
                    }
                },
                protocol: {
                    get: function() {
                        return this._ws.protocol;
                    }
                },
                readyState: {
                    get: function() {
                        return this._ws.readyState;
                    }
                },
                url: {
                    get: function() {
                        return this._ws.url;
                    }
                },
                URL: {
                    get: function() {
                        return this._ws.URL;
                    }
                },
                close: function(code, reason) {
                    this._ws.close(code, reason);
                },
                send: function(data) {
                    if (this._hook &&
                        typeof Application.hookXhrSend === "function" &&
                        typeof data === "string") {
                        Log.print(Log.l.trace, "send data=" + data.substr(0, 8192));
                        var newData = Application.hookXhrSend(data);
                        if (newData) {
                            data = newData;
                        }
                    }
                    return this._ws.send(data);
                },
                addEventListener: function(eventName, handler, options) {
                    if (this._hook && eventName === "message") {
                        var that = this;
                        this._ws.addEventListener(eventName, function(ev) {
                            that.hookOnMessage(ev, handler);
                        }, options);
                    } else {
                        this._ws.addEventListener(eventName, handler, options);
                    }
                },
                removeEventListener: function(eventName, handler, options) {
                    if (this._hook && eventName === "message") {
                        var that = this;
                        this._ws.removeEventListener(eventName, function(ev) {
                            that.hookOnMessage(ev, handler);
                        }, options);
                    } else {
                        this._ws.removeEventListener(eventName, handler, options);
                    }
                },
                hookOnMessage: function(ev, handler) {
                    if (typeof Application.hookXhrOnReadyStateChange === "function" &&
                        typeof ev.data === "string") {
                        Log.print(Log.l.trace, "onmessage url="+ this.url + " data=" + ev.data.substr(0, 8192));
                        var responseText;
                        if (Application.wssUrl) {
                            var regExprWssSrc = new RegExp("wss://" + Application.wssUrl + "/", "g");
                            responseText = ev.data.replace(regExprWssSrc, wssSrc);
                        } else {
                            responseText = ev.data;
                        }
                        if (Application.httpsUrl) {
                            var regExprHttpsSrc = new RegExp("https://" + Application.httpsUrl + "/", "g");
                            responseText = responseText.replace(regExprHttpsSrc, httpsSrc);
                        }
                        var res = {
                            readyState: 4,
                            status: 200,
                            responseText: responseText
                        };
                        Application.hookXhrOnReadyStateChange(res);
                        if (ev.data !== res.responseText) {
                            var newEvent = new Event("MessageEvent");
                            newEvent.data = res.responseText;
                            newEvent.origin = ev.origin;
                            newEvent.lastEventId = ev.lastEventId;
                            newEvent.source = ev.source;
                            newEvent.ports = ev.ports;
                            ev = newEvent;
                        };
                    }
                    if (typeof handler === "function") {
                        handler(ev);
                    }
                }
            }, {
                CONNECTING: 0,
                OPEN: 1,
                CLOSING: 2,
                CLOSED: 3
            });
        }
        if (!xhrOpen) {
            xhrOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                Log.print(Log.l.info, "XMLHttpRequest: method=" + method + " url=" + url);
                if (AppData &&
                    AppData._persistentStates &&
                    AppData._persistentStates.odata) {
                    var hookPath = (AppData._persistentStates.odata.https ? "https" : "http") + "://" +
                        AppData._persistentStates.odata.hostName + 
                        (AppData._persistentStates.odata.onlinePort &&
                            !(AppData._persistentStates.odata.https && AppData._persistentStates.odata.onlinePort === 443 ||
                                AppData._persistentStates.odata.onlinePort === 80) ? ":" + AppData._persistentStates.odata.onlinePort : "") +
                        "/html5client/sockjs/";
                // hook into xhr requests
                    if (typeof this.__lookupGetter__ !== "function" || typeof this.__lookupSetter__ !== "function") {
                        if (typeof window.require !== "function") {
                            window.require = WinJS.Utilities._require;
                        }
                        if (typeof this.__lookupGetter__ !== "function") {
                            require("../lib/core-js/modules/es.object.lookup-getter.js");
                        }
                        if (typeof this.__lookupSetter__ !== "function") {
                            require("../lib/core-js/modules/es.object.lookup-setter.js");
                        }
                    }
                    if (url && url.substr(0, hookPath.length) === hookPath &&
                        !this._onreadystatechange &&
                        this.__lookupSetter__ && this.__lookupGetter__) {
                    var that = this;
                    var oriOnreadystatechangeSet = this.__lookupSetter__("onreadystatechange");
                    var oriOnreadystatechangeGet = this.__lookupGetter__("onreadystatechange");
                    if (oriOnreadystatechangeSet && oriOnreadystatechangeGet) {
                        Object.defineProperty(this, "_onreadystatechange", {
                            set: oriOnreadystatechangeSet,
                            get: oriOnreadystatechangeGet
                        });
                        Object.defineProperty(this, "onreadystatechange", {
                            set: function (newOnreadystatechange) {
                                that._onreadystatechange = function() {
                                    Log.print(Log.l.trace, "onreadystatechange readyState=" + that.readyState + " status=" + that.status + " responseURL="+ that.responseURL +
                                            (that.readyState === 4 && that.status === 200 ? " responseText=" + (typeof that.responseText === "string" ? that.responseText.substr(0, 8192) : ""): "" ));
                                    if (typeof Application.hookXhrOnReadyStateChange === "function" 
                                           //&& that.readyState === 4 &&that.status === 200 
                                    ) {
                                        that._newResponseText = null;
                                        Application.hookXhrOnReadyStateChange(that);
                                    } else {
                                            var responseText;
                                            if (Application.wssUrl) {
                                                var regExprWssSrc = new RegExp("wss://" + Application.wssUrl + "/", "g");
                                                responseText = that._responseText.replace(regExprWssSrc, wssSrc);
                                            } else {
                                                responseText = that._responseText;
                                            }
                                            if (Application.httpsUrl) {
                                                var regExprHttpsSrc = new RegExp("https://" + Application.httpsUrl + "/", "g");
                                                responseText = responseText.replace(regExprHttpsSrc, httpsSrc);
                                            }
                                            that._newResponseText = responseText;
                                    }
                                    if (typeof newOnreadystatechange === "function") {
                                        newOnreadystatechange();
                                    }
                                };
                            },
                            get: function() {
                                return that._onreadystatechange;
                            }
                        });
                    }
                    var oriResponseTextGet = this.__lookupGetter__("responseText");
                    if (oriResponseTextGet) {
                        this._newResponseText = null;
                        Object.defineProperty(this, "_responseText", {
                            get: oriResponseTextGet
                        });
                    }
                    Object.defineProperty(this, "responseText", {
                        set: function (newResponseText) {
                            that._newResponseText = newResponseText;
                        },
                        get: function() {
                            if (typeof that._newResponseText === "string") {
                                return that._newResponseText;
                            } else {
                                    var responseText;
                                    if (Application.wssUrl) {
                                        var regExprWssSrc = new RegExp("wss://" + Application.wssUrl + "/", "g");
                                        responseText = that._responseText.replace(regExprWssSrc, wssSrc);
                                    } else {
                                        responseText = that._responseText;
                                    }
                                    if (Application.httpsUrl) {
                                        var regExprHttpsSrc = new RegExp("https://" + Application.httpsUrl + "/", "g");
                                        responseText = responseText.replace(regExprHttpsSrc, httpsSrc);
                                    }
                                    return responseText;  
                            } 
                        }
                    });
                }
                }
                return xhrOpen.apply(this, arguments);
            };
            xhrSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function(body) {
                if (this._onreadystatechange &&
                    typeof Application.hookXhrSend === "function") {
                    Log.print(Log.l.trace, "send body=" + (typeof body === "string" ? body.substr(0, 8192) : ""));
                    arguments[0] = Application.hookXhrSend(body) || body;
                }
                return xhrSend.apply(this, arguments);
            }
        }
        // ensure login 
        if (AppData && 
            AppData._persistentStates && 
            AppData._persistentStates.odata) {
            if (!AppData._persistentStates.odata.login ||
                !AppData._persistentStates.odata.password) {
                AppData._persistentStates.odata.login = AppData.customer;
                AppData._persistentStates.odata.password = AppData.customerId;
            }
            if (AppData.onlinePath &&
                AppData.onlinePath !== AppData._persistentStates.odata.onlinePath) {
                AppData._persistentStates.odata.onlinePath = AppData.onlinePath;
            }
        }
        Log.ret(Log.l.trace);
        return id;
    };

    // initiate the page frame class
    var projectName = AppData.customer + "-" + AppData.customerId;
    var pageframe = new Application.PageFrame(projectName);
})();
