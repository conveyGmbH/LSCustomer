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
                    AnredeID: null, /* INITAnredeID: 0,*/
                    Email: "",
                    Name: "",
                    Vorname: "",
                    Position: "",
                        Firmenname: "",
                    privacyPolicyFlag: false,
                    UserTZ: AppData._persistentStates.registerData.UserTZ || moment.tz.guess(),
                    LanguageId: AppData._persistentStates.languageId
                },
                InitAnredeItem: { AnredeID: 0, TITLE: "" },
                registerMessage: "",
                showRegisterMail: true,
                showResendEditableMail: false,
                showReRegisterEventMail: false,
                editDisabled: false,
                resendDisabled: false,
                registerStatus: "", /*Not logged in to Facebook*/
                loginDisabled: true,
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText,
                showEvText: AppBar.scope.binding.showEvText,
                showOffText: AppBar.scope.binding.showOffText
            }, commandList]);

            var that = this;

            this.anrede = null;
            //var register = fragmentElement.querySelector("#register");
            // now do anything...
            var listView = fragmentElement.querySelector("#anredeList.listview");

            var fetchMail = function (response) {
                var vAccessToken = response.authResponse.accessToken;
                if (typeof FB === "object") {
                    FB.api('/me', 'GET', { "fields": "name, first_name, last_name, email", "access_token": vAccessToken },
                        function (response) {
                            var ctrl = document.getElementById("statustext");
                            if (response.email) {
                                that.binding.dataRegister.Email = response.email;
                                if (AppData._persistentStates.registerData &&
                                    AppData._persistentStates.registerData.Email !== that.binding.dataRegister.Email) {
                                    AppData._persistentStates.registerData.Email = that.binding.dataRegister.Email;
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
            }
            this.fetchMail = fetchMail;

            var doLogin = function () {
                if (typeof FB === "object") {
                    FB.login(function (response) {
                        fetchMail(response);
                    }, {
                        scope: 'email', return_scopes: true
                    });
                }
            }
            this.doLogin = doLogin;

            var doLogout = function () {
                if (typeof FB === "object") {
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
            }
            this.doLogout = doLogout;

            var loadData = function () {
                Log.call(Log.l.trace, "Register.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                        Log.print(Log.l.trace, "calling select initAnredeData...");
                    //load the list of INITAnrede for Checkbox
                        return AppData.initAnredeView.select(function (json) {
                            Log.print(Log.l.trace, "initAnredeView: success!");
                            if (json && json.d && json.d.results) {
                                // Now, we call WinJS.Binding.List to get the bindable list
                                var results = json.d.results.filter(function (item, index) {
                                    return (item && (item.INITAnredeID !== 0 && item.INITAnredeID !== 3));
                                });
                            that.anrede = new WinJS.Binding.List(results);
                                if (listView.winControl) {
                                    // add ListView dataSource
                                listView.winControl.itemDataSource = that.anrede.dataSource;
                                }
                            }
                        }, function (errorResponse) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                            AppData.setErrorMsg(that.binding, errorResponse);
                        });
                }).then(function () {
                    // pUUID: window.device && window.device.uuid
                    /*function create_UUID() {
                        var dt = new Date().getTime();
                        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = (dt + Math.random() * 16) % 16 | 0;
                            dt = Math.floor(dt / 16);
                            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                        });
                        return uuid;
                    }*/
                    if (AppData._persistentStates.registerData &&
                        AppData._persistentStates.registerData.Email) {
                        that.binding.dataRegister = copyByValue(AppData._persistentStates.registerData);
                        that.binding.showRegisterMail = false;
                        that.binding.showResendEditableMail = true;

                    }
                    that.binding.dataRegister.AnredeID = 0;
                    /*if (!AppData._persistentStates.registerData.userToken) {
                        AppData._persistentStates.registerData.userToken = create_UUID();
                        Application.pageframe.savePersistentStates();
                    }*/

                    if (typeof AppData._persistentStates.registerData.confirmStatusID === "undefined") {
                        AppData._persistentStates.registerData.confirmStatusID = null;
                    }

                    if (!AppData._persistentStates.registerData.eventId) {
                        AppData._persistentStates.registerData.eventId = that.binding.eventId;
                    }

                    if (AppBar.scope.binding.registerStatus) {
                        that.binding.registerStatus = AppBar.scope.binding.registerStatus;
                    }
                    Application.pageframe.savePersistentStates();
                }).then(function () {
                    that.loadInitSelection();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            // define handlers
            this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    AppData._persistentStates.registerData = copyByValue(that.binding.dataRegister); //backingdata
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
                    that.binding.editDisabled = true;
                    that.binding.resendDisabled = true;
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
                    WinJS.Promise.timeout(5000).then(function() {
                        that.binding.editDisabled = false;
                        that.binding.resendDisabled = false;
                    });

                    AppBar.modified = true;
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                },
                clickChangeEvent: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.binding.editDisabled = true;
                    that.binding.resendDisabled = true;
                    that.binding.showReRegisterEventMail = false;
                    if (typeof AppBar.scope.saveData === "function") {
                        AppBar.scope.saveData(function (response) {
                            // called asynchronously if ok
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
                clickFacebookShare: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    window.open(
                        'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(that.eventLinkToShare()),
                        'facebook-share-dialog');
                    Log.ret(Log.l.trace);
                },
                clickLinkedInShare: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' +
                        encodeURIComponent(that.eventLinkToShare()));
                    Log.ret(Log.l.trace);
                },
                clickXingShare: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    window.open('https://www.xing.com/spi/shares/new?url=' +
                        encodeURIComponent(that.eventLinkToShare()));
                    Log.ret(Log.l.trace);
                }/*,
                clickGooglePlusShare: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    window.open('https://plus.google.com/share?url={' + encodeURIComponent(that.shareEventLink) + '}');
                    Log.ret(Log.l.trace);
                }*/,
                clickTwitterShare: function(event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    window.open('https://twitter.com/share?url=' + encodeURIComponent(that.eventLinkToShare()));
                    Log.ret(Log.l.trace);
                },
                clickEmailShare: function(event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    window.open('mailto:?subject=' + that.binding.dataText.ev_text_detail_name_h1 + '&body=' + encodeURIComponent(that.eventLinkToShare()));
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
                },
                selectOnlyThis: function (event) {
                    //loope über liste
                    Log.call(Log.l.trace, "Register.Controller.");
                    var fields = fragmentElement.querySelectorAll(".anrede");
                    var element = event.currentTarget || event.target;
                    if (element.checked) {
                        for (var i = 0; i < fields.length; i++) {
                            fields[i].checked = false;
                        }
                        element.checked = true;
                        that.binding.dataRegister.AnredeID = parseInt(event.currentTarget.textContent);
                    } else {
                        that.binding.dataRegister.AnredeID = 0;
                    }
                    AppBar.triggerDisableHandlers();
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    that.binding.loginDisabled = AppBar.busy || 
                        !that.binding.dataRegister.Vorname || 
                        !that.binding.dataRegister.Name || 
                        !that.binding.dataRegister.Email || 
                        typeof that.binding.dataRegister.Email === "string" &&
                        !that.binding.dataRegister.Email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) || 
                        !that.binding.dataRegister.privacyPolicyFlag;
                    var loginButton = fragmentElement.querySelector("#loginButton");
                    if (loginButton) {
                        loginButton.disabled = that.binding.loginDisabled;
                    }
                    return that.binding.loginDisabled;
                }
            };

            var eventLinkToShare = function() {
                return window.location.href.split("?")[0] + "?" + createQueryStringFromParameters({
                    eventId: Application.query.eventId
                });
            }
            this.eventLinkToShare = eventLinkToShare;

            var setInitAnredeItem = function (newInitAnredeItem) {
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.InitAnredeItem = newInitAnredeItem;
                that.binding.dataRegister.AnredeID = 0;
                AppBar.modified = false;
                AppBar.notifyModified = prevNotifyModified;
            }
            this.setInitAnredeItem = setInitAnredeItem;

            var loadInitSelection = function () {
                Log.call(Log.l.trace, "Register.Controller.");
                //if (typeof that.binding.dataContact.KontaktVIEWID !== "undefined") {
                    var map, results, curIndex;
                if (typeof that.binding.dataRegister.AnredeID !== "undefined") {
                    Log.print(Log.l.trace, "calling select initAnredeData: Id=" + that.binding.dataRegister.AnredeID + "...");
                        map = AppData.initAnredeView.getMap();
                        results = AppData.initAnredeView.getResults();
                        if (map && results) {
                        curIndex = map[that.binding.dataRegister.AnredeID];
                            if (typeof curIndex !== "undefined") {
                                that.setInitAnredeItem(results[curIndex]);
                            }
                        }
                    }
                Log.ret(Log.l.trace);
                return WinJS.Promise.as();
            }
            this.loadInitSelection = loadInitSelection;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                if (typeof FB === "object") {
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
                }
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



