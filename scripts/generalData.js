// general data services 
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/sqlite.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("AppData", {
        getRecordId: function (relationName) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName);
            // check for initial values
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return null;
            }
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            }
            if (typeof AppData._persistentStates.allRecIds[relationName] === "undefined") {
                Log.ret(Log.l.trace, "undefined");
                return null;
            }
            var ret = typeof AppData._persistentStates.allRecIds[relationName] === "string" ? parseInt(AppData._persistentStates.allRecIds[relationName]) : AppData._persistentStates.allRecIds[relationName];
            Log.ret(Log.l.trace, ret);
            return ret;
        },
        setRecordId: function (relationName, newRecordId) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName + " newRecordId=" + newRecordId);
            // check for initial values
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return;
            }
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            }
            if (typeof AppData._persistentStates.allRecIds[relationName] === "undefined" ||
                !newRecordId || AppData._persistentStates.allRecIds[relationName] !== newRecordId) {
                AppData._persistentStates.allRecIds[relationName] = newRecordId;
                if (Application.pageframe) {
                    Application.pageframe.savePersistentStates();
                }
            }
            Log.ret(Log.l.trace);
        },
        getRestriction: function (relationName) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName);
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return null;
            }
            if (typeof AppData._persistentStates.allRestrictions === "undefined") {
                AppData._persistentStates.allRestrictions = {};
            }
            Log.ret(Log.l.trace);
            return AppData._persistentStates.allRestrictions[relationName];
        },
        setRestriction: function (relationName, newRestriction) {
            Log.call(Log.l.trace, ".", "relationName=" + relationName);
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return;
            }
            if (typeof AppData._persistentStates.allRestrictions === "undefined") {
                AppData._persistentStates.allRestrictions = {};
            }
            AppData._persistentStates.allRestrictions[relationName] = newRestriction;
            if (Application.pageframe) {
                Application.pageframe.savePersistentStates();
            }
            Log.ret(Log.l.trace);
        },
        generalData: {
            get: function () {
                var data = AppData._persistentStates;
                data.logTarget = Log.targets.console;
                data.setRecordId = AppData.setRecordId;
                data.getRecordId = AppData.getRecordId;
                data.setRestriction = AppData.setRestriction;
                data.getRestriction = AppData.getRestriction;
                return data;
            }
        },
        _customer: "",
        customer: {
            get: function() {
                Log.print(Log.l.trace, "customer=" + AppData._customer);
                return AppData._customer;
            },
            set: function(newCustomer) {
                AppData._customer = newCustomer;
                Log.print(Log.l.trace, "set new lsCustomer=" + AppData._customer);
            }
        },
        _customerId: "",
        customerId: {
            get: function() {
                Log.print(Log.l.trace, "customerId=" + AppData._customerId);
                return AppData._customerId;
            },
            set: function(newCustomerId) {
                AppData._customerId = newCustomerId;
                Log.print(Log.l.trace, "set new lsCustomer=" + AppData._customerId);
            }
        }
    });

})();