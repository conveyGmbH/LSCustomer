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

    // default settings
    AppData.persistentStatesDefaults = {
        colorSettings: {
            // navigation-color with 100% saturation and brightness
            accentColor: "#fe3600"
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
            https: false,
            hostName: "deimos.convey.de",
            onlinePort: 8080,
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
            serverFailure: false
        }
    };

    // static array of menu groups for the split view pane
    Application.navigationBarGroups = [
        { id: "home", group: 1, svg: "home", disabled: false }
    ];

    // static array of pages for the navigation bar
    Application.navigationBarPages = [
        { id: "home", group: -1, disabled: false }
    ];


    // static array of pages master/detail relations
    Application.navigationMasterDetail = [
    ];

    // init page for app startup
    Application.initPage = Application.getPagePath("home");
    // home page of app
    Application.startPage = Application.getPagePath("home");

    // some more default page navigation handling
    Application.navigateByIdOverride = function (id, event) {
        // ensure login 
        if (AppData && 
            AppData._persistentStates && 
            AppData._persistentStates.odata &&
            (!AppData._persistentStates.odata.login ||
                !AppData._persistentStates.odata.password)) {
            AppData._persistentStates.odata.login = AppData.customer;
            AppData._persistentStates.odata.password = AppData.customerId;
        }
        Log.call(Log.l.trace, "Application.", "id=" + id + " login=" + AppData._persistentStates.odata.login);
        Log.ret(Log.l.trace);
        return id;
    };

    // initiate the page frame class
    var projectName = AppData.customer + "-" + AppData.customerId;
    var pageframe = new Application.PageFrame(projectName);
})();
