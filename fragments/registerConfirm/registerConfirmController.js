// controller for page: Register
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/registerConfirm/registerConfirmService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("RegisterConfirm", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "RegisterConfirm.Controller.", "eventId=" + (options && options.eventId));

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
                }
            }, commandList]);

            var that = this;

            //var registerConfirm = fragmentElement.querySelector("#registerConfirm");

            var getEmailOkFlag = function () {
                if (that.binding.dataRegister &&
                (that.binding.dataRegister.ErfassungsStatus === 1 ||
                    that.binding.dataRegister.Freischaltung > 0)) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.getEmailOkFlag = getEmailOkFlag;

            var getRegisterOkFlag = function () {
                if (that.binding.dataRegister &&
                    that.binding.dataRegister.Freischaltung === 3 &&
                    that.binding.dataRegister.ErfassungsStatus === 1) {
                    return 1;
                } else {
                    return null;
                }
            };
            this.getRegisterOkFlag = getRegisterOkFlag;

            var setDataRegister = function (newDataRegister) {
                var i, registerEmail, registerAddress, registerComplete;
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.emailOkFlag = that.getEmailOkFlag();
                that.binding.registerOkFlag = that.getRegisterOkFlag();
                if (that.binding.dataRegister.ErfassungsStatus === 1 &&
                    that.binding.dataRegister.Freischaltung === 0) {
                    that.binding.dataRegister.Freischaltung = 2;
                    registerEmail = pageElement.querySelectorAll(".register-email");
                    if (registerEmail && registerEmail.length > 0) {
                        WinJS.UI.Animation.exitContent(registerEmail, null).then(function () {
                            for (i = 0; i < registerEmail.length; i++) {
                                if (registerEmail[i].style) {
                                    registerEmail[i].style.visibility = "hidden";
                                    registerEmail[i].style.display = "none";
                                }
                            }
                        });
                    }
                    registerAddress = pageElement.querySelectorAll(".register-address");
                    if (registerAddress && registerAddress.length > 0) {
                        for (i = 0; i < registerAddress.length; i++) {
                            if (registerAddress[i].style) {
                                registerAddress[i].style.display = "inline";
                                registerAddress[i].style.visibility = "visible";
                            }
                        }
                        //WinJS.UI.Animation.enterContent(registerAddress, null, { mechanism: "transition" });
                        WinJS.UI.Animation.slideUp(registerAddress);
                    }
                }
                if (that.binding.dataRegister.Freischaltung === 3) {
                    registerAddress = pageElement.querySelectorAll(".register-address");
                    if (registerAddress && registerAddress.length > 0) {
                        WinJS.UI.Animation.exitContent(registerAddress, null).then(function () {
                            for (i = 0; i < registerAddress.length; i++) {
                                if (registerAddress[i].style) {
                                    registerAddress[i].style.visibility = "hidden";
                                    registerAddress[i].style.display = "none";
                                }
                            }
                        });
                    }
                    registerComplete = pageElement.querySelectorAll(".register-complete");
                    if (registerComplete && registerComplete.length > 0) {
                        for (i = 0; i < registerComplete.length; i++) {
                            if (registerComplete[i].style) {
                                registerComplete[i].style.display = "inline";
                                registerComplete[i].style.visibility = "visible";
                            }
                        }
                        //WinJS.UI.Animation.enterContent(registerComplete, null, { mechanism: "transition" });
                        WinJS.UI.Animation.slideUp(registerComplete);
                    }
                }
                if (that.binding.dataRegister.MessageText) {
                    AppData.setErrorMsg(that.binding, that.binding.dataRegister.MessageText);
                }
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setDataRegister = setDataRegister;

            var loadData = function () {
                Log.call(Log.l.trace, "RegisterConfirm.Controller.");
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
                Log.call(Log.l.trace, "RegisterConfirm.Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: AppData._persistentStates.registerData.uuid,
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



