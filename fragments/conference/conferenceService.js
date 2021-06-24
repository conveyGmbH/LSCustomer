// service for page: imgSketch
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Conference", {
        _questionnaireView: {
            get: function () {
                return AppData.getFormatView("Fragebogenzeile", 20653);
            }
        },
        questionnaireView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "questionnaireView.");
                var ret = Conference._questionnaireView.select(complete, error, {
                    VeranstaltungID: eventId
                }, {
                    ordered: true,
                    orderAttribute: "SORTIERUNG"
                });
                Log.ret(Log.l.trace);
                return ret;
            }
        },
        defaultValue: {
            FragebogenzeileVIEWID: 0,
            SS01: "",
            SS02: "",
            SS03: "",
            SS04: "",
            SS05: ""
        }
    });
})();
