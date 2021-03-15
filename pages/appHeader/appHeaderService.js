// services for page: contact
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("AppHeader", {
        _CR_VERANSTOPTIONView: {
            get: function () {
                return AppData.getFormatView("CR_VERANSTOPTION", 20641, false);
            }
        },
        CR_VERANSTOPTIONView: {
            select: function (complete, error, restriction) {
                Log.call(Log.l.trace, "CR_VERANSTOPTIONView.");
                var ret = AppHeader._CR_VERANSTOPTIONView.select(complete,
                    error,
                    restriction,
                    {
                        ordered: true,
                        orderAttribute: "INITOptionTypeID"
                    });
                Log.ret(Log.l.trace);
                return ret;

            }
        }
    });
})();
