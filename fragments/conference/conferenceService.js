// service for page: imgSketch
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Conference", {
        videoExtList: [
            "mpg", "mpeg", "m1v", "mp2", "mpe", "mpv2", "mp4", "m4v",
            "mp4v", "ogg", "ogv", "asf", "avi", "mov", "wmv"
        ],
        questionnaireView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "questionnaireView.");
                var ret = AppData.call("PRC_BBBQuestionData", {
                    pVeranstaltungID: eventId,
                    pLanguageSpecID: AppData.getLanguageId()
                }, complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            pkName: "QuestionID",
            defaultValue: {
                QuestionID: 0,
                QuestionText: "",
                Answer01Text: "",
                Answer02Text: "",
                Answer03Text: "",
                Answer04Text: "",
                Answer05Text: "",
                Answer01Code: "",
                Answer02Code: "",
                Answer03Code: "",
                Answer04Code: "",
                Answer05Code: ""
            }
        },
        presenterVideoUrlView: {
            select: function (complete, error, eventId) {
                Log.call(Log.l.trace, "questionnaireView.");
                var ret = AppData.call("PRC_BBBPresenterVideoUrl", {
                    pVeranstaltungID: eventId,
                    pLanguageSpecID: AppData.getLanguageId()
                }, complete, error);
                Log.ret(Log.l.trace);
                return ret;
            },
            pkName: "MandantDokumentVIEWID",
            defaultValue: {
                MandantDokumentVIEWID: 0,
                AddIndex: 0,
                Title: "",
                Url: ""
            }
        }
    });
})();
