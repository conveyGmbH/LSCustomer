// controller for page: home
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/event/eventService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Event", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Event.Controller.");

            Application.Controller.apply(this, [pageElement, {
                showConference: true
            }, commandList]);

            var that = this;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                }
            };

            // page command disable handler
            this.disableHandlers = {
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var loadConference = function() {
                var ret;
                Log.call(Log.l.trace, "Event.Controller.");
                var eventId = AppData.getRecordId("Veranstaltung");
                if (eventId) {
                    var parentElement = pageElement.querySelector("#conferencehost");
                    if (parentElement) {
                        ret = Application.loadFragmentById(parentElement, "conference", { eventId: eventId });
                    }
                }
                Log.ret(Log.l.trace);
                return ret || WinJS.Promise.as();
            }
            this.loadConference = loadConference;

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadConference();
            }).then(function () {
                Log.print(Log.l.trace, "Conference loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







