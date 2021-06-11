// controller for page: contentRecordOnlyRegister
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/contentRecordedOnlyRegister/contentRecordedOnlyRegisterService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("ContentRecordedOnlyRegister", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "ContentRecordedOnlyRegister.Controller.", "eventId=" + (options && options.eventId));

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
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText
            }, commandList]);

            var that = this;

            //var registerConfirm = fragmentElement.querySelector("#registerConfirm");

            var loadData = function () {
                Log.call(Log.l.trace, "ContentRecordedOnlyRegister.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.binding.eventId) {
                        return AppData.call("PRC_RegisterContact",
                            {
                                pVeranstaltungID: that.binding.eventId,
                                pUserToken: '0b24e593-127e-46f6-b034-c2cc178d8c71',
                                pEMail: that.binding.dataRegister.Email,
                                pAddressData: null,
                                pBaseURL: AppData.getBaseURL(AppData.appSettings.odata.onlinePort)
                            },
                            function (json) {
                                if (json && json.d && json.d.results) {
                                    // that.binding.dataRegister = json.d.results[0];
                                    var result = json.d.results[0];
                                }
                                //that.binding.dataRegister.Email = "";
                                Log.print(Log.l.trace, "PRC_RegisterContact success!");
                            },
                            function (error) {
                                Log.print(Log.l.error, "PRC_RegisterContact error! ");
                            });
                    } else {
                        return WinJS.Promise.as();
                    }

                }).then(function () {
                    var countDownDate = new Date("Jan 14, 2021 13:20:00").getTime();
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
                        }
                    }, 1000);
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
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: AppData._persistentStates.registerData.userToken,
                    pEMail: that.binding.dataRegister.Email,
                    pAddressData: null,
                    pBaseURL: ''
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                    }
                    AppBar.busy = false;
                    //that.binding.dataRegister.Email = "";
                    Register.controller.binding.dataRegister.Email = "";
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (error) {
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
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

           // that.setDataRegister(getEmptyDefaultValue(Register.registerView.defaultValue));

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



