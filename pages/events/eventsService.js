﻿// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Events", {
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20647);
            }
        },
        _textView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        _medienView: {
            get: function () {
                return AppData.getFormatView("MandantDokument", 20635);
            }
        },
        _eventSeriesId: -1
    });

    WinJS.Namespace.define("Events", {
        eventView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = Events._eventView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Startdatum"
                });
                Log.ret(Log.l.trace);
                return ret;
            },
            getNextUrl: function (response) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = Events._eventView.getNextUrl(response);
                Log.ret(Log.l.trace);
                return ret;
            },
            selectNext: function (complete, error, response, nextUrl) {
                Log.call(Log.l.trace, "Events.eventView.");
                var ret = Events._eventView.selectNext(complete, error, response, nextUrl);
                // this will return a promise to controller
                Log.ret(Log.l.trace);
                return ret;
            },
            relationName: Events._eventView.relationName,
            pkName: Events._eventView.oDataPkName,
            getRecordId: function (record) {
                var ret = null;
                if (record) {
                    if (Events._eventView.oDataPkName) {
                        ret = record[Events._eventView.oDataPkName];
                    }
                    if (!ret && Events._eventView.pkName) {
                        ret = record[Events._eventView.pkName];
                    }
                }
                return ret;
            }
        },
        textView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    MandantSerieID: Events._eventSeriesId,
                    DokVerwendungID: 2,
                    LanguageSpecID: AppData.getLanguageId(),
                    NameLanguageID: 1033
                };
                var ret = Events._textView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        medienView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    VeranstaltungID: eventId
                    //LanguageSpecID: AppData.getLanguageId()
                };
                var ret = Events._medienView.select(complete, error, restriction, {
                    ordered: true
                    //orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });
})();
