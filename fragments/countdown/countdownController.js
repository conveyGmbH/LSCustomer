// controller for page: countdown
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/countdown/countdownService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Countdown", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Countdown.Controller.", "eventId=" + (options && options.eventId));

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataRegister: {
                    Email: "",
                    Name: "",
                    ErfassungsStatus: 0,
                    Freischaltung: 0
                },
                countdown: {
                    day: "",
                    hour: "",
                    minute: "",
                    second: ""
                },
                countdownIsOver: false,
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText
            }, commandList]);

            var that = this;
            var countDown = null;

            that.dispose = function() {
                Log.call(Log.l.trace, "Countdown.Controller.");
                if (countDown) {
                    clearInterval(countDown);
                    countDown = null;
                }
                Log.ret(Log.l.trace);
            }

            //var registerConfirm = fragmentElement.querySelector("#registerConfirm");

            var loadData = function () {
                Log.call(Log.l.trace, "Countdown.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (!countDown) {
                        countDown = setInterval(function () {
                            var countDownDate = AppBar.scope.binding.dataEvent && AppBar.scope.binding.dataEvent.dateStartDatum;
                            if (countDownDate) {
                                var now = new Date();
                                var timeleft = countDownDate.getTime() - now.getTime();
                                that.binding.countdown.day = Math.floor(timeleft / (1000 * 60 * 60 * 24));
                                that.binding.countdown.hour = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                that.binding.countdown.minute = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
                                that.binding.countdown.second = Math.floor((timeleft % (1000 * 60)) / 1000);
                                if (timeleft < 0) {
                                    if (countDown) {
                                        clearInterval(countDown);
                                        countDown = null;
                                    }
                                    that.binding.countdown.day = 0;
                                    that.binding.countdown.hour = 0;
                                    that.binding.countdown.minute = 0;
                                    that.binding.countdown.second = 0;
                                    that.binding.countdownIsOver = true;
                                    AppBar.scope.binding.showCountdown = false;
                                    //AppBar.scope.binding.showConference = true;
                                    if (typeof AppBar.scope.loadData === "function") {
                                        AppBar.scope.loadData();
                                    }
                                } 
                            }
                        }, 1000);
                    }
                })/*.then(function() {
                    if (typeof AppBar.scope.loadData === "function") {
                        AppBar.scope.loadData();
                    }
                })*/;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var saveData = function (complete, error) {
                var err;
                Log.call(Log.l.trace, "Countdown.Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            // define handlers
           /* this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "RegisterConfirm.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                }
            };*/

            this.disableHandlers = {
                /*clickOk: function () {
                    that.binding.loginDisabled = AppBar.busy || that.binding.dataRegister.Email.length === 0;
                    return that.binding.loginDisabled;
                }*/
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



