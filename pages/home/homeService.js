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
        _eventStartId: null
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
                    restriction.DokVerwendungID = 3;
                    // don't use start-specific VA-Text for the time being:
                    restriction.MandantStartID = null;
                }
                if (seriesId) {
                    restriction.MandantSerieID = seriesId;
                    restriction.DokVerwendungID = 2;
                    // don't use start-specific VA-Text for the time being:
                    restriction.MandantStartID = null;
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
                ev_text_detail_name_h1: "",
                ev_text_detail_time_h2: "",
                ev_text_detail_summary: ""
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
                    restriction.DokVerwendungID = 3;
                    // don't use start-specific VA-Text for the time being:
                    restriction.MandantStartID = null;
                    //restriction.AddIndex = 1;
                }
                if (seriesId) {
                    restriction.MandantSerieID = seriesId;
                    restriction.DokVerwendungID = 2;
                    // don't use start-specific VA-Text for the time being:
                    restriction.MandantStartID = null;
                    //restriction.AddIndex = 1;
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
                ev_doc: ""
            },
            defaultGroupValue: {
                ser_doc: ""
            }
        }
    });
})();
