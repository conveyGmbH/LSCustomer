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
                //showRegisterConfirm: false,
                eventId: AppData.getRecordId("Veranstaltung"),
                dataEvent: {}
            }, commandList]);

            var that = this;

            var setDataEvent = function (newDataEvent) {
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
            };
            this.setDataEvent = setDataEvent;

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

            var loadRegisterConfirm = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var parentElement = pageElement.querySelector("#registerConfirmhost");
                    if (parentElement && that.binding.eventId) {
                        return Application.loadFragmentById(parentElement, "registerConfirm", { eventId: that.binding.eventId });
                    } else {
                        WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadRegisterConfirm = loadRegisterConfirm;

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
                    // Falls in query eine Email enthalten ist dann  verwende diese
                    if (AppData._persistentStates.registerData.Email &&
                        Application.query.UserToken) { 
                        if (Application.query.UserToken !== AppData._persistentStates.registerData.uuid) {
                            AppData._persistentStates.registerData.uuid = Application.query.UserToken;
                            AppData._persistentStates.registerData.uuidFromLink = true;

                        }
                        if (that.binding.eventID !== AppData._persistentStates.registerData.eventIDregister) {
                            AppData._persistentStates.registerData.eventIDregister = that.binding.eventID;
                        }
                        Application.pageframe.savePersistentStates();
                        Log.print(Log.l.trace, "calling PRC_RegisterContact...");
                        return AppData.call("PRC_RegisterContact",
                            {
                                pVeranstaltungID: AppData._persistentStates.registerData.eventIDregister,
                                pUserToken: AppData._persistentStates.registerData.uuid,
                                pEMail: AppData._persistentStates.registerData.Email, //that.binding.dataRegister.Email
                                pAddressData: null,
                                pBaseURL: window.location.href
                            },
                            function (json) {
                                if (json && json.d && json.d.results) {
                                    var result = json.d.results[0];
                                    if (result.UserToken &&
                                        result.UserToken !== AppData._persistentStates.registerData.uuid) {
                                        AppData._persistentStates.registerData.uuid = result.UserToken;
                                    }
                                    if (result.VeranstaltungID &&
                                        result.VeranstaltungID !==
                                        AppData._persistentStates.registerData.eventIDregister) {
                                        AppData._persistentStates.registerData.eventIDregister = result.VeranstaltungID;
                                    }
                                    if (result.ConfirmStatusID !==
                                        AppData._persistentStates.registerData.confirmStatusID) {
                                        AppData._persistentStates.registerData.confirmStatusID = result.ConfirmStatusID;
                                    }
                                    if (result.ResultMessage) {
                                        that.binding.registerMessage = result.ResultMessage;
                                    }
                                    Application.pageframe.savePersistentStates();
                                }
                                AppBar.busy = false;
                                that.binding.showRegister = false;
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
                            AppData._persistentStates.registerData.confirmStatusID === 11) &&
                        AppData._persistentStates.registerData.bbbsession) {
                        return that.loadConference();
                    } else {
                        if (AppData._persistentStates.registerData.dateBegin)
                            return that.loadCountdown();
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
                AppBar.busy = true;
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: AppData._persistentStates.registerData.uuid,
                    pEMail: "", //that.binding.dataRegister.Email
                    pAddressData: null
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                    }
                    // wenn in dem result die sessiontoken drinen ist dann rufe loadfragment auf

                    AppBar.busy = false;
                    //that.binding.dataRegister.Email = "";
                    that.binding.showRegister = false;
                    that.binding.showRegisterConfirm = true;
                    //Event.Controller.binding.showRegister = false;
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (error) {
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                if (!AppData._persistentStates.registerData.confirmStatusID ||
                    AppData._persistentStates.registerData.confirmStatusID === 0 ||
                    AppData._persistentStates.registerData.confirmStatusID === 1) {
                return that.loadTeaser();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                if (!AppData._persistentStates.registerData.confirmStatusID ||
                    AppData._persistentStates.registerData.confirmStatusID === 0 ||
                    AppData._persistentStates.registerData.confirmStatusID === 1) {
                    return that.loadRegister();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                //in persistenstate eine Session enthalten ist dann lade Conference
                if ((AppData._persistentStates.registerData.confirmStatusID === 10 || 
                    AppData._persistentStates.registerData.confirmStatusID === 11) &&
                    AppData._persistentStates.registerData.bbbsession) {
                return that.loadConference();
                } else {
                    return that.loadCountdown();
                }
            }).then(function () {
                    Log.print(Log.l.trace, "Conference loaded");
                });
            Log.ret(Log.l.trace);
        })
    });
})();







