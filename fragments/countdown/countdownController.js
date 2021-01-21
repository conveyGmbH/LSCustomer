// controller for page: Register
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
                countdownIsOver: false
            }, commandList]);

            var that = this;

            //var registerConfirm = fragmentElement.querySelector("#registerConfirm");

            var loadData = function () {
                Log.call(Log.l.trace, "Countdown.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var countDownDate = AppBar.scope.binding.dataEvent.dateBegin;
                    var timeleft = 0;
                    var countDown = setInterval(function () {
                        var now = new Date().getTime();
                        timeleft = countDownDate - now;
                        that.binding.countdown.day = Math.floor(timeleft / (1000 * 60 * 60 * 24));
                        that.binding.countdown.hour = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        that.binding.countdown.minute = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
                        that.binding.countdown.second = Math.floor((timeleft % (1000 * 60)) / 1000);

                        if (timeleft < 0) {
                            clearInterval(countDown);
                            that.binding.countdown.day = 0;
                            that.binding.countdown.hour = 0;
                            that.binding.countdown.minute = 0;
                            that.binding.countdown.second = 0;
                            that.binding.countdownIsOver = true;
                            AppBar.scope.binding.showCountdown = true;
                            AppBar.scope.binding.showConference = true;
                            //lade fragment mediathek
                        }
                    }, 1000);
                }).then(function () {
                    // rufe loaddata auf von event -> AppBar.scope.loaddata();
                    //that.binding.showRegister = false;

                    //AppBar.scope.loadRegister();
                });
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



