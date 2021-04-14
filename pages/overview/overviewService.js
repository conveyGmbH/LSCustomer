// service for page: start
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Overview", {
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
        textView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "eventView.");
                var restriction = {
                    VeranstaltungID: null,
                    DokVerwendungID: 1,
                    LanguageSpecID: AppData.getLanguageId()
                };
                var ret = Overview._textView.select(complete, error, restriction, {
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
                var ret = Overview._medienView.select(complete, error, restriction, {
                    ordered: true
                    //orderAttribute: "Sortierung"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        _eventView: {
            get: function () {
                return AppData.getFormatView("Veranstaltung", 20647); //selektiere aus andere view
            }
        },
        eventView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "eventView.");
                var ret = Overview._eventView.select(complete, error, restriction, {
                    ordered: true,
                    orderAttribute: "Startdatum"
                });
                Log.ret(Log.l.trace);
                return ret;
            }/*,
            defaultValue: {
                Name: "",
                Titel: "",
                Untertitel: ""
            }*/
        }
    });
})();
