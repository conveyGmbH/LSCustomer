// controller for page: Teaser
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/teaser/teaserService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Teaser", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Teaser.Controller.", "eventId=" + (options && options.eventId));

            Fragments.Controller.apply(this, [fragmentElement, {

            }, commandList]);

            var that = this;

            var teaser = fragmentElement.querySelector("#teaser");

            var loadData = function () {
                Log.call(Log.l.trace, "Teaser.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {

                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var saveData = function (complete, error) {
                var err;
                Log.call(Log.l.trace, "Teaser.Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            // define handlers
            this.eventHandlers = {
                
            };

            this.disableHandlers = {

            };

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



