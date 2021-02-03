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

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Event", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Event.Controller.");

            if (Application.query && Application.query.eventID) {
                AppData.setRecordId("Veranstaltung", Application.query.eventID);
            }

            Application.Controller.apply(this, [pageElement, {
                showTeaser: true,
                showRegister: true,
                showCountdown: false,
                showConference: false,
                showRecordedContent: false,
                registerStatus: "",
                //showRegisterConfirm: false,
                eventId: AppData.getRecordId("Veranstaltung"),
                dataEvent: {},
                dataText: {}
            }, commandList]);

            var that = this;

            var setDataEvent = function (newDataEvent) {
                Log.call(Log.l.trace, "Event.Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEvent = newDataEvent;
                // convert Startdatum 
                that.binding.dataEvent.dateBegin = getDateObject(newDataEvent.Startdatum);
                if (AppData._persistentStates.registerData.dateBegin !== that.binding.dataEvent.dateBegin) {
                    AppData._persistentStates.registerData.dateBegin = that.binding.dataEvent.dateBegin;
                    Application.pageframe.savePersistentStates();
                }
                AppBar.modified = false;
                if (newDataEvent.VeranstaltungVIEWID && Application.query && window.history) {
                    var state = {};
                    var title = "";
                    Application.query.eventID = newDataEvent.VeranstaltungVIEWID;
                    var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                    window.history.pushState(state, title, location);
                }
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
                Log.ret(Log.l.trace);
            };
            this.setDataEvent = setDataEvent;

            var setDataText = function(results) {
                Log.call(Log.l.trace, "Event.Controller.");
                var newDataText = {};
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        newDataText[row.LabelTitle] = row.Title ? row.Title : "";
                    }
                    if (row.LabelDescription) {
                        newDataText[row.LabelDescription] = row.Description ? row.Description : "";
                    }
                    if (row.LabelMainTitle) {
                        newDataText[row.LabelMainTitle] = row.MainTitle ? row.MainTitle : "";
                    }
                    if (row.LabelSubTitle) {
                        newDataText[row.LabelSubTitle] = row.SubTitle ? row.SubTitle : "";
                    }
                    if (row.LabelSummary) {
                        newDataText[row.LabelSummary] = row.Summary ? row.Summary : "";
                    }
                    if (row.LabelBody) {
                        newDataText[row.LabelBody] = row.Body ? row.Body : "";
                    }
                }
                that.binding.dataText = newDataText;
                Log.ret(Log.l.trace);
            }
            this.setDataText = setDataText;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
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

            var loadTeaser = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var parentElement = pageElement.querySelector("#teaserhost");
                    if (parentElement && that.binding.eventId) {
                        return Application.loadFragmentById(parentElement, "teaser", { eventId: that.binding.eventId });
                    } else {
                        WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadTeaser = loadTeaser;

            var loadCountdown = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var parentElement = pageElement.querySelector("#countdownhost");
                    if (parentElement && that.binding.eventId) {
                        return Application.loadFragmentById(parentElement, "countdown", { eventId: that.binding.eventId });
                    } else {
                        WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadCountdown = loadCountdown;

            var loadConference = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var parentElement = pageElement.querySelector("#conferencehost");
                    if (parentElement && that.binding.eventId) {
                        return Application.loadFragmentById(parentElement, "conference", { eventId: that.binding.eventId });
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadConference = loadConference;

            var loadRegister = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var parentElement = pageElement.querySelector("#registerhost");
                    if (parentElement && that.binding.eventId) {
                        return Application.loadFragmentById(parentElement, "register", { eventId: that.binding.eventId });
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadRegister = loadRegister;

            var loadData = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select eventView...");
                        return Event.eventView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "eventView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEvent(json.d);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select eventView...");
                        return Event.textView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "labelView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataText(json.d.results);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    // Falls in query eine Email enthalten ist dann  verwende diese
                    if (Application.query.UserToken && Application.query.eventID) {
                        if (Application.query.UserToken !== AppData._persistentStates.registerData.userToken) {
                            AppData._persistentStates.registerData.userToken = Application.query.UserToken;
                            AppData._persistentStates.registerData.tokenFromLink = true;
                        }
                        if (that.binding.eventID !== AppData._persistentStates.registerData.eventID) {
                            AppData._persistentStates.registerData.eventID = that.binding.eventID;
                        }
                        if (Application.query.eventID && Application.query.eventID !== AppData._persistentStates.registerData.eventID) {
                            AppData._persistentStates.registerData.eventID = Application.query.eventID;
                        }
                        Application.pageframe.savePersistentStates();
                        Log.print(Log.l.trace, "calling PRC_RegisterContact...");
                        return AppData.call("PRC_RegisterContact",
                            {
                                pVeranstaltungID: AppData._persistentStates.registerData.eventID,
                                pUserToken: AppData._persistentStates.registerData.userToken,
                                pEMail: null, //wenn über Link bestätigt, dann übergebe Email null 
                                pAddressData: null,
                                pBaseURL: window.location.href
                            },
                            function (json) {
                                if (json && json.d && json.d.results) {
                                    var result = json.d.results[0];
                                    if (result.UserToken &&
                                        result.UserToken !== AppData._persistentStates.registerData.userToken) {
                                        AppData._persistentStates.registerData.userToken = result.UserToken;
                                    }
                                    if (result.VeranstaltungID &&
                                        result.VeranstaltungID !==
                                        AppData._persistentStates.registerData.eventID) {
                                        AppData._persistentStates.registerData.eventID = result.VeranstaltungID;
                                    }
                                    if (result.ConfirmStatusID !==
                                        AppData._persistentStates.registerData.confirmStatusID) {
                                        AppData._persistentStates.registerData.confirmStatusID = result.ConfirmStatusID;
                                    }
                                    if (result.EMail && result.EMail !== AppData._persistentStates.registerData.email) {
                                        AppData._persistentStates.registerData.email = result.EMail;
                                    }
                                    if (result.ResultMessage) {
                                        that.binding.registerStatus = result.ResultMessage;
                                    }
                                    Application.pageframe.savePersistentStates();
                                }
                                AppBar.busy = false;
                                Log.print(Log.l.trace, "PRC_RegisterContact success!");
                            },
                            function (error) {
                                Log.print(Log.l.error, "PRC_RegisterContact error! ");
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    //Lade Confi oder Countdown wenn über Link gegangen wurde mit query.Token und query.event
                    if ((AppData._persistentStates.registerData.confirmStatusID === 10 ||
                        AppData._persistentStates.registerData.confirmStatusID === 11)) {
                        that.binding.showTeaser = false;
                        that.binding.showRegister = false;
                        that.binding.showCountdown = false;
                        return that.loadConference();
                    } else {
                        return that.updateFragment();
                    }
                    return WinJS.Promise.as();
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                var err;
                Log.call(Log.l.trace, "Register.Controller.");
                AppData.setErrorMsg(that.binding);
                var registerFragment = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("register"));
                var location = window.location.href;
                var copyToken = null;
                if (AppData._persistentStates.registerData.confirmStatusID === 21) {
                    copyToken = AppData._persistentStates.registerData.userToken;
                }
                AppBar.busy = true;
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: AppData._persistentStates.registerData.userToken,
                    pEMail: AppData._persistentStates.registerData.email, 
                    pAddressData: null,
                    pBaseURL: location,
                    pCopyToken: copyToken
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                        if (result.UserToken && result.UserToken !== AppData._persistentStates.registerData.userToken) {
                            AppData._persistentStates.registerData.userToken = result.UserToken;
                        }
                        if (result.VeranstaltungID && result.VeranstaltungID !== AppData._persistentStates.registerData.eventID) {
                            AppData._persistentStates.registerData.eventID = result.VeranstaltungID;
                        }
                        if (result.ConfirmStatusID !== AppData._persistentStates.registerData.confirmStatusID) {
                            AppData._persistentStates.registerData.confirmStatusID = result.ConfirmStatusID;
                        }
                        if (result.Email && result.Email !== AppData._persistentStates.registerData.email) {
                            AppData._persistentStates.registerData.email = result.email;
                        }
                        if (result.ResultMessage) {
                            if (registerFragment && registerFragment.controller)
                                registerFragment.controller.binding.registerStatus = result.ResultMessage;
                        }
                        if (!AppData._persistentStates.registerData.email &&
                            AppData._persistentStates.registerData.email !== registerFragment.controller.binding.dataRegister.Email) {
                            AppData._persistentStates.registerData.email = registerFragment.controller.binding.dataRegister.Email;
                        }
                        Application.pageframe.savePersistentStates();
                    }
                    AppBar.busy = false;
                    complete({});
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (error) {
                    error({});
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var updateFragment = function () {
                Log.call(Log.l.trace, "Register.Controller.");
                var registerFragment = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath("register"));
                var ret = new WinJS.Promise.as().then(function () {
                    if (AppData._persistentStates.registerData.confirmStatusID === null) {
                        that.binding.showRegister = false;
                        registerFragment.controller.binding.showRegisterMail = false;
                        registerFragment.controller.binding.showResendEditableMail = false;
                        // zeige countdown wenn datum in zukunft ist
                        that.binding.showCountdown = false;
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 0 ||
                        AppData._persistentStates.registerData.confirmStatusID === 1) {
                        that.binding.showRegister = true;
                        registerFragment.controller.binding.showRegisterMail = false; //false
                        registerFragment.controller.binding.showResendEditableMail = true;
                        registerFragment.controller.binding.registerMessage = getResourceText("register.sendEmailMessage");
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 10 ||
                        AppData._persistentStates.registerData.confirmStatusID === 11) {
                        that.binding.showRegister = false;
                        registerFragment.controller.binding.showRegisterMail = false;
                        registerFragment.controller.binding.showResendEditableMail = false;
                        that.binding.showCountdown = true;
                    } else {
                        that.binding.showCountdown = false;
                        that.binding.showConference = true;
                    }
                    //in persistenstate eine Session enthalten ist dann lade Conference
                    if ((AppData._persistentStates.registerData.confirmStatusID === 10 ||
                        AppData._persistentStates.registerData.confirmStatusID === 11) &&
                        AppData._persistentStates.registerData.urlbbb) {
                        that.binding.showTeaser = false;
                        that.binding.showRegister = false;
                        that.binding.showCountdown = false;
                        that.loadConference();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.updateFragment = updateFragment;

            // finally, load the data
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Calling updateFragment");
                //Lade fragmente
                // lade alle fragmente! außer conference
                that.loadTeaser();
                that.loadRegister();
                that.loadCountdown();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
