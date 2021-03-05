﻿// controller for page: Register
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/register/registerService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Register", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Register.Controller.", "eventId=" + (options && options.eventId));

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataRegister: {
                    Email: "",
                    Name: ""
                },
                showRegisterMail: true,
                showResendEditableMail: false,
                showReRegisterEventMail: false,
                editDisabled: false,
                resendDisabled: false,
                registerStatus: "", /*Not logged in to Facebook*/
                loginDisabled: true,
                scopeEventBinding: AppBar.scope.binding.dataText,
                scopeMedienBinding: AppBar.scope.binding.dataMedien
            }, commandList]);

            var that = this;

            var register = fragmentElement.querySelector("#register");

            window.fbAsyncInit = function () {
                FB.init({
                    appId: '1889799884567520',
                    autoLogAppEvents: true,
                    xfbml: false, // Only needed for "Social Plugins"
                    version: 'v9.0',
                    status: true
                });
                FB.getLoginStatus(function (response) {
                    if (response.status === "connected") {
                        var ctrl = document.getElementById("statustext");
                        if (ctrl) {
                            ctrl.innerHTML = "Fetching data...";
                        }
                        that.binding.registerStatus = "Fetching data...";
                        // Everything's alright, fetch user's mail address...
                        that.fetchMail(response);
                    } else if (response.status === "not_authorized") {
                        // User logged in to Facebook but application is not (yet) authorized
                        var ctrl = document.getElementById("statustext");
                        if (ctrl) {
                            ctrl.innerHTML = "App not authorized";
                        }
                        that.binding.registerStatus = "App not authorized";
                    } else {
                        // User is not logged in to Facebook
                        var ctrl = document.getElementById("statustext");
                        if (ctrl) {
                            ctrl.innerHTML = "Not logged in to Facebook";
                        }
                        that.binding.registerStatus = ""; /*Not logged in to Facebook*/
                    }
                });
            };

            var fetchMail = function (response) {
                var vAccessToken = response.authResponse.accessToken;
                FB.api('/me', 'GET', { "fields": "name, first_name, last_name, email", "access_token": vAccessToken },
                    function (response) {
                        var ctrl = document.getElementById("statustext");
                        if (response.email) {
                            that.binding.dataRegister.Email = response.email;
                            if (AppData._persistentStates.registerData.email !== that.binding.dataRegister.Email) {
                                AppData._persistentStates.registerData.email = that.binding.dataRegister.Email;
                            }
                            that.binding.dataRegister.Name = response.name;
                            if (ctrl) {
                                ctrl.innerHTML = "Hello " + that.binding.dataRegister.Name + ", your mail address is " + that.binding.dataRegister.Email;
                            }
                            ctrl = document.getElementById("loginFBbutton");
                            ctrl.style.display = "none";

                            ctrl = document.getElementById("logoutbutton");
                            ctrl.style.display = "";
                        } else {
                            ctrl.innerHTML = "Hello " + response.name + ", your mail address is not accessible, please log in once more";
                        }
                    }
                );
            }
            this.fetchMail = fetchMail;

            var doLogin = function () {
                FB.login(function (response) {
                    fetchMail(response);
                }, {
                        scope: 'email', return_scopes: true
                    });
            }
            this.doLogin = doLogin;

            var doLogout = function () {
                FB.logout(function (response) {
                    var ctrl = document.getElementById("loginFBbutton");
                    ctrl.style.display = "";

                    ctrl = document.getElementById("logoutbutton");
                    ctrl.style.display = "none";

                    ctrl = document.getElementById("statustext");
                    if (ctrl) {
                        ctrl.innerHTML = "You are now logged out.";
                    }
                    that.binding.dataRegister.Email = "";
                    that.binding.dataRegister.Name = "";
                });
            }
            this.doLogout = doLogout;

            var loadData = function () {
                Log.call(Log.l.trace, "Register.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    // pUUID: window.device && window.device.uuid
                    function create_UUID() {
                        var dt = new Date().getTime();
                        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = (dt + Math.random() * 16) % 16 | 0;
                            dt = Math.floor(dt / 16);
                            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                        });
                        return uuid;
                    }
                    if (AppData._persistentStates.registerData.email) {
                        that.binding.dataRegister.Email = AppData._persistentStates.registerData.email;
                        //showRegisterMail: true,
                        //showResendEditableMail: false,
                        //    editDisabled: false,
                        //    resendDisabled: false,
                        that.binding.showRegisterMail = false;
                        that.binding.showResendEditableMail = true;

                    }
                    if (!AppData._persistentStates.registerData.userToken) {
                        AppData._persistentStates.registerData.userToken = create_UUID();
                        Application.pageframe.savePersistentStates();
                    }

                    if (typeof AppData._persistentStates.registerData.confirmStatusID === "undefined") {
                        AppData._persistentStates.registerData.confirmStatusID = null;
                        Application.pageframe.savePersistentStates();
                    }

                    if (!AppData._persistentStates.registerData.eventID) {
                        AppData._persistentStates.registerData.eventID = that.binding.eventId;
                    }

                    if (AppBar.scope.binding.registerStatus) {
                        that.binding.registerStatus = AppBar.scope.binding.registerStatus;
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    AppData._persistentStates.registerData.email = that.binding.dataRegister.Email;
                    Application.pageframe.savePersistentStates();
                    that.binding.editDisabled = false;
                    that.binding.resendDisabled = false;
                    that.binding.showResendEditableMail = true;
                    if (typeof AppBar.scope.saveData === "function") {
                        AppBar.scope.saveData(function (response) {
                            // called asynchronously if ok
                            that.binding.registerMessage = AppBar.scope.binding.registerMessage;
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                            // called asynchronously on error
                        }).then(function () {
                            if (typeof AppBar.scope.updateFragment === "function") {
                                AppBar.scope.updateFragment();
                            }
                        });
                    }

                    AppBar.modified = true;
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickResend: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.binding.editDisabled = false;
                    that.binding.resendDisabled = false;
                    that.binding.showResendEditableMail = true;
                    if (typeof AppBar.scope.reSendEmail === "function") {
                        AppBar.scope.reSendEmail(function (response) {
                            // called asynchronously if ok
                            that.binding.registerMessage = AppBar.scope.binding.registerMessage;
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                            // called asynchronously on error
                        }).then(function () {
                            if (typeof AppBar.scope.updateFragment === "function") {
                                AppBar.scope.updateFragment();
                            }
                        });
                    }
                    AppBar.modified = true;
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickChangeEvent: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.binding.editDisabled = true;
                    that.binding.resendDisabled = true;
                    if (typeof AppBar.scope.saveData === "function") {
                        AppBar.scope.saveData(function (response) {
                            // called asynchronously if ok
                            return WinJS.Promise.as();
                        }, function (errorResponse) {
                            // called asynchronously on error
                        });
                    }
                    AppBar.modified = true;
                    that.binding.registerMessage = getResourceText("register.resendEmailMessage");
                    WinJS.Promise.timeout(2000).then(function () {
                        that.binding.editDisabled = false;
                        that.binding.resendDisabled = false;
                        if (typeof AppBar.scope.loadData === "function") {
                            AppBar.scope.loadData();
                        }
                    });
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickEdit: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    AppBar.scope.binding.showTeaser = true;
                    that.binding.showRegisterMail = true;
                    that.binding.showResendEditableMail = false;
                    that.binding.editDisabled = true;
                    that.binding.resendDisabled = true;
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogin: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.doLogin(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogout: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.doLogout(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    that.binding.loginDisabled = AppBar.busy || that.binding.dataRegister.Email.length === 0;
                    return that.binding.loginDisabled;
                }
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



