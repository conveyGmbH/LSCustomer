// controller for page: Conference
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/conference/conferenceService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Conference", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Conference.Controller.", "eventId=" + (options && options.eventId));

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId: null,
                dataConference: {}
            }, commandList]);

            var that = this;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



