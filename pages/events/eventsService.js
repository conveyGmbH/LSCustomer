// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Events", {
        _eventView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20647);
                ret.maxPageSize = 20;
                return ret;
            }
        },
        _textView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        _docView: {
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
                if (!restriction) {
                    restriction = {};
                }
                restriction.MandantSerieID = Events._eventSeriesId;
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
                if (eventId) {
                    restriction.VeranstaltungID = eventId;
                    restriction.DokVerwendungID = 3;
                    // don't use serie-specific VA-Text for the time being:
                    restriction.MandantSerieID = null;
                }
                var viewOptions = {
                    ordered: true,
                    orderAttribute: "Sortierung"
                };
                if (eventId && eventId.length) {
                    viewOptions.orderAttribute = "VeranstaltungID";
                }
                var ret = Events._textView.select(complete, error, restriction, viewOptions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                done: false,
                ev_text_detail_name_h1: "",
                ev_text_detail_time_h2: "",
                ev_text_detail_summary: ""
            }
        },
        docView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    MandantSerieID: Events._eventSeriesId,
                    DokVerwendungID: 2,
                    AddIndex: "NULL"
                };
                if (eventId) {
                    restriction.VeranstaltungID = eventId;
                    restriction.DokVerwendungID = 3;
                    // don't use serie-specific VA-Text for the time being:
                    restriction.MandantSerieID = null;
                    //restriction.AddIndex = 1;
                }
                var viewOptions = {
                    ordered: true,
                    orderAttribute: "AddIndex"
                };
                if (eventId && eventId.length) {
                    viewOptions.orderAttribute = "VeranstaltungID";
                }
                var ret = Events._docView.select(complete, error, restriction, viewOptions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                done: false,
                ev_doc: ""
            }
        }
    });
})();
