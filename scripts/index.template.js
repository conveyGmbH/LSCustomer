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
            privacyPolicyFlag: false
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
        { id: "modSession", group: -3, disabled: false }
    ];


    // static array of pages master/detail relations
    Application.navigationMasterDetail = [
    ];

    Application.query = getQueryStringParameters();

    // init page for app startup
    //Application.initPage = Application.getPagePath("dbinit");
    // home page of app
    Application.startPage = Application.getPagePath("home");


    // some more default page navigation handling
    Application.navigateByIdOverride = function (id, event) {
        Log.call(Log.l.trace, "Application.", "id=" + id + " login=" + AppData._persistentStates.odata.login);
        if (!XMLHttpRequest.prototype._oriOpen) {
            XMLHttpRequest.prototype._oriOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                if (AppData &&
                    AppData._persistentStates &&
                    AppData._persistentStates.odata) {
                    var hookPath = (AppData._persistentStates.odata.https ? "https" : "http") + "://" +
                        AppData._persistentStates.odata.hostName + 
                        (AppData._persistentStates.odata.onlinePort ? ":" + AppData._persistentStates.odata.onlinePort : "") +
                        "/html5client/sockjs/";
                // hook into xhr requests
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
                                        (that.readyState === 4 && that.status === 200 ? " responseText=" + (typeof that.responseText === "string" ? that.responseText.substr(0, 1024) : ""): "" ));
                                    if (typeof Application.hookXhrOnReadyStateChange === "function" 
                                           //&& that.readyState === 4 &&that.status === 200 
                                    ) {
                                        that._newResponseText = null;
                                        Application.hookXhrOnReadyStateChange(that);
                                    } else {
                                        that._newResponseText = that._responseText;
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
                                return that._responseText;  
                            } 
                        }
                    });
                }
                }
                Log.print(Log.l.info, "XMLHttpRequest: method=" + method + " url=" + url);
                return this._oriOpen(method, url, async, user, password);
            };
            XMLHttpRequest.prototype._oriSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function(body) {
                if (this._onreadystatechange &&
                    typeof Application.hookXhrSend === "function") {
                    body = Application.hookXhrSend(body) || body;
                }
                return this._oriSend(body);
            }
        }
        // ensure login 
        if (AppData && 
            AppData._persistentStates && 
            AppData._persistentStates.odata &&
            (!AppData._persistentStates.odata.login ||
                !AppData._persistentStates.odata.password)) {
            AppData._persistentStates.odata.login = AppData.customer;
            AppData._persistentStates.odata.password = AppData.customerId;
        }
        Log.ret(Log.l.trace);
        return id;
    };

    // initiate the page frame class
    var projectName = AppData.customer + "-" + AppData.customerId;
    var pageframe = new Application.PageFrame(projectName);
})();
