// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Event", {
        _textView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20628);
            }
        },
        //MandantDokumentVIEW_20633
        _medienView: {
            get: function () {
                return AppData.getFormatView("MandantDokument", 20635);
            }
        },
        /**
         * LangMandantDokument_20634
         */
        _medienTextView: {
            get: function () {
                return AppData.getFormatView("LangMandantDokument", 20634);
            }
        },
        textView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    VeranstaltungID: eventId,
                    LanguageSpecID: AppData.getLanguageId()
                };
                var ret = Event._textView.select(complete, error, restriction, {
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
                var ret = Event._medienView.select(complete, error, restriction, {
                    ordered: true
                    //orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        medienTextView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    VeranstaltungID: eventId,
                    DokVerwendungID: 3,
                    LanguageSpecID: AppData.getLanguageId()
                };
                var ret = Event._medienTextView.select(complete, error, restriction, {
                    ordered: true
                    //orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20620);
            }
        },
        eventView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "eventView.");
                var ret = Event._eventView.selectById(complete, error, recordId);
                Log.ret(Log.l.trace);
                return ret;
            },
            defaultValue: {
                Name: "",
                Titel: "",
                Untertitel: ""
            }
        }
    });
})();
