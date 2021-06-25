// service for page: imgSketch
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Conference", {
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
                Answer01Text: "",
                Answer01Text: "",
                Answer01Text: "",
                Answer01Text: ""
            }
        }
    });
})();
