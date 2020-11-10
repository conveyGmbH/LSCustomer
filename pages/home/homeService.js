// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20619);
            }
        }
    });

    WinJS.Namespace.define("Home", {
        eventView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Home.eventView.");
                var ret = Home._eventView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Home.eventView.");
                var ret = Home._eventView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Home.eventView.");
                var ret = Home._eventView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: Home._eventView.relationName,
            pkName: Home._eventView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (Home._eventView.oDataPkName) {
                        ret = record[Home._eventView.oDataPkName];
                    }
                    if (!ret && Home._eventView.pkName) {
                        ret = record[Home._eventView.pkName];
                    }
                }
                return ret;
            }
        }
    });
})();
