// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        _eventView: {
            get: function () {
                var ret = AppData.getFormatView("Veranstaltung", 20650);
                //ret.maxPageSize = 20;
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
        _eventStartId: null,
        _afterSelectEventViewHook: null,
        afterSelectEventViewHook: {
            get: function() {
                return Home._afterSelectEventViewHook;
            },
            set: function(f) {
                Home._afterSelectEventViewHook = f;
            }
        }
    });

    WinJS.Namespace.define("Home", {
        eventView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "Home.eventView.");
                if (!restriction) {
                    restriction = {};
                }
                restriction.MandantStartID = Home._eventStartId;
                restriction.LanguageSpecID = AppData.getLanguageId();
                var ret = Home._eventView.select(function(json) {
                    if (typeof complete === "function") {
                        complete(json);
                    }
                    if (typeof Home.afterSelectEventViewHook === "function") {
                        Home.afterSelectEventViewHook(json);
                    }
                }, error, restriction, {
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
                var ret = Home._eventView.selectNext(function(json) {
                    if (typeof complete === "function") {
                        complete(json);
                    }
                    if (typeof Home.afterSelectEventViewHook === "function") {
                        Home.afterSelectEventViewHook(json);
                    }
                }, error, response, nextUrl);
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
            },
            defaultGroupValue: {
                expandFlag: 0
            }
        },
        textView: {
            select: function (complete, error, eventId, seriesId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    DokVerwendungID: 1,
                    LanguageSpecID: AppData.getLanguageId(),
                    NameLanguageID: 1033
                };
                if (Home._eventStartId) {
                    restriction.MandantStartID = Home._eventStartId;
                }
                if (eventId) {
                    restriction.VeranstaltungID = eventId;
                    if (seriesId) {
                        restriction.MandantSerieID = seriesId;
                    }
                } else {
                    restriction.VeranstaltungID = "NULL";
                    if (seriesId) {
                        restriction.MandantSerieID = seriesId;
                        restriction.DokVerwendungID = 2;
                        // don't use start-specific VA-Text for the time being:
                        restriction.MandantStartID = null;
                    }
                }
                var viewOptions = {
                    ordered: true,
                    orderAttribute: "Sortierung"
                };
                if (eventId && eventId.length) {
                    viewOptions.orderAttribute = "VeranstaltungID";
                }
                var ret = Home._textView.select(complete, error, restriction, viewOptions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                ov_text_h1: "",
                ov_text_free_body: "",
                ov_text_event_name_h2: "",
                ov_text_event_time_h3: "",
                ov_text_event_summary: ""
            },
            defaultGroupValue: {
                ser_text_name_h1: "",
                ser_text_subtitle_h2: "",
                ser_text_free_body: ""
            }
        },
        docView: {
            select: function (complete, error, eventId, seriesId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    MandantStartID: Home._eventStartId,
                    DokVerwendungID: 1,
                    AddIndex: "NULL"
                };
                if (eventId) {
                    restriction.VeranstaltungID = eventId;
                    if (seriesId) {
                        restriction.MandantSerieID = seriesId;
                    }
                } else {
                    restriction.VeranstaltungID = "NULL";
                    if (seriesId) {
                        restriction.MandantSerieID = seriesId;
                        restriction.DokVerwendungID = 2;
                        // don't use start-specific VA-Text for the time being:
                        restriction.MandantStartID = null;
                    }
                }
                var viewOptions = {
                    ordered: true,
                    orderAttribute: "AddIndex"
                };
                if (eventId && eventId.length) {
                    viewOptions.orderAttribute = "VeranstaltungID";
                }
                var ret = Home._docView.select(complete, error, restriction, viewOptions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                showDoc: false,
                ov_doc: "images/dotclear.gif",
                ov_doc_event: "images/dotclear.gif"
            },
            defaultGroupValue: {
                ser_doc: "images/dotclear.gif"
            }
        },
        textDocView: {
            select: function (complete, error, eventId, seriesId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    MandantSerieID: Home._eventStartId,
                    DokVerwendungID: 1,
                    LanguageSpecID: AppData.getLanguageId(),
                    NameLanguageID: 1033
                };
                if (eventId) {
                    restriction.VeranstaltungID = eventId;
                    if (seriesId) {
                        restriction.MandantSerieID = seriesId;
                    }
                } else {
                    restriction.VeranstaltungID = "NULL";
                    if (seriesId) {
                        restriction.MandantSerieID = seriesId;
                        restriction.DokVerwendungID = 2;
                        // don't use start-specific VA-Text for the time being:
                        restriction.MandantStartID = null;
                    }
                }
                var viewOptions = {
                    ordered: true,
                    orderAttribute: "Sortierung"
                };
                if (eventId && eventId.length) {
                    viewOptions.orderAttribute = "VeranstaltungID";
                }
                var ret = Home._textDocView.select(complete, error, restriction, viewOptions);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                ov_doc_alt: "",
                ov_doc_title: "",
                ov_doc_descr: "",
                ov_doc_event_alt: "",
                ov_doc_event_title: "",
                ov_doc_event_descr: ""
            },
            defaultGroupValue: {
                ser_doc_alt: "",
                ser_doc_title: "",
                ser_doc_descr: ""
            }
        }
    });
})();
