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
        _textDocView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20634);
            }
        },
        _eventSeriesId: -1,
        _afterSelectEventViewHook: null,
        afterSelectEventViewHook: {
            get: function() {
                return Events._afterSelectEventViewHook;
            },
            set: function(f) {
                Events._afterSelectEventViewHook = f;
            }
        }
    });

    WinJS.Namespace.define("Events", {
        eventView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Events.eventView.");
                if (!restriction) {
                    restriction = {};
                }
                restriction.MandantSerieID = Events._eventSeriesId;
                var ret = Events._eventView.select(function(json) {
                    if (typeof complete === "function") {
                        complete(json);
                    }
                    if (typeof Events.afterSelectEventViewHook === "function") {
                        Events.afterSelectEventViewHook(json);
                    }
                }, error, restriction, {
                    ordered: true,
                    orderAttribute: "Sortierung" 
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
                var ret = Events._eventView.selectNext(function(json) {
                    if (typeof complete === "function") {
                        complete(json);
                    }
                    if (typeof Events.afterSelectEventViewHook === "function") {
                        Events.afterSelectEventViewHook(json);
                    }
                }, error, response, nextUrl);
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
                    // don't use serie-specific VA-Text for the time being:
                } else {
                    restriction.VeranstaltungID = "NULL";
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
                ser_text_event_time_h3: "",
                ser_text_event_name_h2: "",
                ser_text_event_summary: ""
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
                } else {
                    restriction.VeranstaltungID = "NULL";
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
                ser_doc_event: ""
            }
        },
        textDocView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    MandantSerieID: Events._eventSeriesId,
                    DokVerwendungID: 2,
                    LanguageSpecID: AppData.getLanguageId(),
                    NameLanguageID: 1033
                };
                /*if (eventId) {
                    restriction.VeranstaltungID = eventId;
                    // don't use serie-specific VA-Text for the time being:
                } else {
                    restriction.VeranstaltungID = "NULL";
                }*/
                restriction.VeranstaltungID = "NOT NULL";
                var viewOptions = {
                    ordered: true,
                    orderAttribute: "Sortierung"
                };
                if (eventId && eventId.length) {
                    viewOptions.orderAttribute = "VeranstaltungID";
                }
                var ret = Events._textDocView.select(complete, error, restriction, viewOptions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                ser_doc_event_alt: "",
                ser_doc_event_title: "",
                ser_doc_event_descr: ""
            }
        }
    });
})();
