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

            if (Application.query && Application.query.eventId) {
                AppData.setRecordId("Veranstaltung", Application.query.eventId);
            }

            Application.Controller.apply(this, [pageElement, {
                showShare: false,
                showTeaser: false,
                showRegister: false,
                showCountdown: false,
                showConference: false,
                showRecordedContent: false,
                registerStatus: "",
                //showRegisterConfirm: false,
                recordedLink: null,
                eventId: AppData.getRecordId("Veranstaltung"),
                dataEvent: {},
                dataText: {},
                dataDoc: getEmptyDefaultValue(Event.medienView.defaultValue),
                dataDocText: {},
                link: window.location.href
            }, commandList]);


            var that = this;

            var setDataEvent = function (newDataEvent) {
                Log.call(Log.l.trace, "Event.Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEvent = newDataEvent;
                // convert Startdatum 
                that.binding.dataEvent.dateBegin = getDateObject(newDataEvent.Startdatum);
                that.binding.dataEvent.dateStartDatum = getDateObject(newDataEvent.LiveStartDatum);
                that.binding.dataEvent.dateEndDatum = getDateObject(newDataEvent.LiveEndDatum);
                if (AppData._persistentStates.registerData.dateBegin !== that.binding.dataEvent.dateBegin) {
                    AppData._persistentStates.registerData.dateBegin = that.binding.dataEvent.dateBegin;
                    Application.pageframe.savePersistentStates();
                }
                AppBar.modified = false;
                if (newDataEvent.VeranstaltungVIEWID && Application.query && window.history) {
                    var state = {};
                    var title = "";
                    Application.query.eventId = newDataEvent.VeranstaltungVIEWID;
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

            var setDataDoc = function(results) {
                Log.call(Log.l.trace, "Event.Controller.");
                var newDataDoc = getEmptyDefaultValue(Event.medienView.defaultValue);
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        if (row.DocContentDOCCNT1) {
                            var sub = row.DocContentDOCCNT1.search("\r\n\r\n");
                            if (sub >= 0) {
                                var data = row.DocContentDOCCNT1.substr(sub + 4);
                                if (data && data !== "null") {
                                    row.DocContentDOCCNT1 = "data:image/jpeg;base64," + data;
                                } else {
                                    row.DocContentDOCCNT1 = "";
                                }
                            } else {
                                row.DocContentDOCCNT1 = "";
                            }
                        } else {
                            row.DocContentDOCCNT1 = "";
                        }
                        newDataDoc[row.LabelTitle] = row.DocContentDOCCNT1 ? row.DocContentDOCCNT1 : "";
                    }
                }
                that.binding.dataDoc = newDataDoc;
                Log.ret(Log.l.trace);
            }
            this.setDataDoc = setDataDoc;

            var setDataDocText = function (results) {
                Log.call(Log.l.trace, "Event.Controller.");
                var newDataDocText = {};
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        newDataDocText[row.LabelTitle] = row.Title ? row.Title : "";
                    }
                    if (row.LabelDescription) {
                        newDataDocText[row.LabelDescription] = row.Description ? row.Description : "";
                    }
                    if (row.LabelMainTitle) {
                        newDataDocText[row.LabelMainTitle] = row.MainTitle ? row.MainTitle : "";
                    }
                    if (row.LabelSubTitle) {
                        newDataDocText[row.LabelSubTitle] = row.SubTitle ? row.SubTitle : "";
                    }
                    if (row.LabelSummary) {
                        newDataDocText[row.LabelSummary] = row.Summary ? row.Summary : "";
                    }
                    if (row.LabelBody) {
                        newDataDocText[row.LabelBody] = row.Body ? row.Body : "";
                    }
                }
                that.binding.dataDocText = newDataDocText;
                Log.ret(Log.l.trace);
            }
            this.setDataDocText = setDataDocText;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickHome: function(event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    Application.navigateById("home", event);
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogin: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    that.doLogin(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogout: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    that.doLogout(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickCreateIcs: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var cal = ics();
                    cal.addEvent(that.binding.dataEvent.Name, that.binding.dataEvent.LiveTyp, "", that.binding.dataEvent.dateStartDatum, that.binding.dataEvent.dateEndDatum);
                    var calendar_ics = cal.calendar();
                    //window.open("data:text/calendar;charset=utf8," + escape(calendar_ics));
                    cal.download(that.binding.dataEvent.Name);
                    /*cal.addEvent('Demo Event', 'This is thirty minute event', 'Nome, AK', '8/7/2013 5:30 pm', '8/7/2013 6:00 pm');*/
                    Log.ret(Log.l.trace);
                },
                onScroll: function (event) {
                    Log.call(Log.l.trace, "Event.Controller.");
                    var pageControl = pageElement.winControl;
                    if (pageControl) {
                        pageControl.prevWidth = 0;
                        pageControl.prevHeight = 0;
                        pageControl.updateLayout.call(pageControl, pageElement);
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

            var getFragmentByName = function(fragmentName) {
                var fragmentController;
                var ret = new WinJS.Promise.as().then(function() {
                    fragmentController = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath(fragmentName));
                    if (!fragmentController) {
                        var parentElement = pageElement.querySelector("#"+fragmentName+"host");
                        if (parentElement && that.binding.eventId) {
                            return Application.loadFragmentById(parentElement, fragmentName, { eventId: that.binding.eventId, dataEvent: that.binding.dataEvent });
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!fragmentController) {
                        fragmentController = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath(fragmentName));
                    }
                    return fragmentController;
                });
                return ret;
            }
            this.getFragmentByName = getFragmentByName;

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
                        Log.print(Log.l.trace, "calling select textView...");
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
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select medienView...");
                        return Event.medienView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "labelView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataDoc(json.d.results);
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
                        Log.print(Log.l.trace, "calling select medienTextView...");
                        return Event.medienTextView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "labelView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataDocText(json.d.results);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (Application.query.eventId) {
                        if (Application.query.UserToken && Application.query.UserToken !== AppData._persistentStates.registerData.userToken) {
                            AppData._persistentStates.registerData.userToken = Application.query.UserToken;
                            AppData._persistentStates.registerData.tokenFromLink = true;
                        }
                        if (that.binding.eventId !== AppData._persistentStates.registerData.eventId) {
                            AppData._persistentStates.registerData.eventId = that.binding.eventId;
                        }
                        if (Application.query.eventId && Application.query.eventId !== AppData._persistentStates.registerData.eventId) {
                            AppData._persistentStates.registerData.eventId = Application.query.eventId;
                        }
                        Application.pageframe.savePersistentStates();
                        Log.print(Log.l.trace, "calling PRC_RegisterContact...");
                        return AppData.call("PRC_RegisterContact",
                            {
                                pVeranstaltungID: AppData._persistentStates.registerData.eventId,
                                pUserToken: AppData._persistentStates.registerData.userToken,
                                pEMail: AppData._persistentStates.registerData.Email, //wenn über Link bestätigt, dann übergebe Email null 
                                pAddressData: null,
                                pBaseURL: window.location.href,
                                pCopyToken: null
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
                                        AppData._persistentStates.registerData.eventId) {
                                        AppData._persistentStates.registerData.eventId = result.VeranstaltungID;
                                    }
                                    /*if (result.ResultCode !== AppData._persistentStates.registerData.resultCode) {
                                        AppData._persistentStates.registerData.resultCode = result.ResultCode;
                                    }*/
                                    if (result.ConfirmStatusID !==
                                        AppData._persistentStates.registerData.confirmStatusID) {
                                        AppData._persistentStates.registerData.confirmStatusID = result.ConfirmStatusID;
                                    }
                                    if (result.EMail && result.EMail !== AppData._persistentStates.registerData.Email) {
                                        AppData._persistentStates.registerData.Email = result.EMail;
                                    }
                                    if (result.ConfirmStatusID === 20) {
                                        that.binding.recordedLink = result.ConferenceLink;
                                        if (that.binding.recordedLink) {
                                            var url = that.binding.recordedLink;
                                            var query = url.split("?")[1];
                                            if (window.history && query && Application.query) {
                                                var state = {};
                                                var title = "";
                                                var key = query.split("=")[0];
                                                var value = query.split("=")[1];
                                                if (key && value) {
                                                    Application.query[key] = value;
                                                    var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                                                    window.history.pushState(state, title, location);
                                                }
                                            };
                                        } else {
                                            // wenn keine recordedContent vorhanden dann zeige meldung -> recordedContent läuft noch nicht -> zurück button auf events
                                            // setze manuell auf ein ungültigen Status
                                            AppData._persistentStates.registerData.confirmStatusID = 403;
                                        }
                                    }
                                    if (result.ResultMessage) {
                                        AppData._persistentStates.registerData.resultMessage = result.ResultMessage;
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
                    return that.updateFragment();
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.timeout(1000);
                }).then(function () {
                    Application.navigator._resized();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var location = window.location.href;
                var userToken = AppData._persistentStates.registerData.userToken;
                var copyToken = null;

                if (AppData._persistentStates.registerData.resultCode === 21) {
                    copyToken = AppData._persistentStates.registerData.userToken;
                    userToken = null;
                }
                var addressData = JSON.stringify(AppData._persistentStates.registerData);
                AppBar.busy = true;
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: userToken,
                    pEMail: AppData._persistentStates.registerData.Email,
                    pAddressData: addressData, /**/
                    pBaseURL: location,
                    pCopyToken: copyToken
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                        if (result.UserToken && result.UserToken !== AppData._persistentStates.registerData.userToken) {
                            AppData._persistentStates.registerData.userToken = result.UserToken;
                        }
                        if (result.VeranstaltungID && result.VeranstaltungID !== AppData._persistentStates.registerData.eventId) {
                            AppData._persistentStates.registerData.eventId = result.VeranstaltungID;
                        }
                        if (result.ResultCode !== AppData._persistentStates.registerData.resultCode) {
                            AppData._persistentStates.registerData.resultCode = result.ResultCode;
                        }
                        if (result.ConfirmStatusID !== AppData._persistentStates.registerData.confirmStatusID) {
                            AppData._persistentStates.registerData.confirmStatusID = result.ConfirmStatusID;
                        }
                        if (result.Email && result.Email !== AppData._persistentStates.registerData.Email) {
                            AppData._persistentStates.registerData.Email = result.email;
                        }
                        if (result.ResultMessage) {
                            that.binding.registerStatus = result.ResultMessage;
                            if (result.ResultCode === 21) {
                                AppData._persistentStates.registerData.resultCode = result.ResultCode;
                            }
                        }
                        Application.pageframe.savePersistentStates();
                    }
                    AppBar.busy = false;
                    complete({});
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (errorResponse) {
                    AppData.setErrorMsg(that.binding, errorResponse);
                    error({});
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var reSendEmail = function(complete, error) {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var userToken = AppData._persistentStates.registerData.userToken;
                AppBar.busy = true;
                var ret = AppData.call("PRC_ResendVAMail", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: userToken
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                        if (result.ResultCode !== AppData._persistentStates.registerData.resultCode) {
                            AppData._persistentStates.registerData.resultCode = result.ResultCode;
                        }
                        if (result.ResultMessage) {
                            that.binding.registerStatus = result.ResultMessage;
                            if (result.ResultCode === 21) {
                                AppData._persistentStates.registerData.resultCode = result.ResultCode;
                            }
                        }
                        Application.pageframe.savePersistentStates();
                    }
                    AppBar.busy = false;
                    complete({});
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (errorResponse) {
                    AppData.setErrorMsg(that.binding, errorResponse);
                    error({});
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.reSendEmail = reSendEmail;

            var updateFragment = function () {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = that.getFragmentByName("teaser").then(function (teaserFragment) {
                    that.binding.showRegister = false;
                    that.binding.showTeaser = false;
                    that.binding.showCountdown = false;
                    that.binding.showConference = false;
                    if (teaserFragment &&
                        teaserFragment.controller &&
                        teaserFragment.controller.binding) {
                        if (AppData._persistentStates.registerData.resultCode === 21 ||
                            AppData._persistentStates.registerData.confirmStatusID > 0) {
                            teaserFragment.controller.binding.showEvDoc = false;
                            teaserFragment.controller.binding.showOnDoc = true;
                        } else {
                            teaserFragment.controller.binding.showEvDoc = true;
                            teaserFragment.controller.binding.showOnDoc = false;
                        }
                    }
                    return that.getFragmentByName("register");
                }).then(function (registerFragment) {
                    if (AppData._persistentStates.registerData.resultCode === 21 ||
                        AppData._persistentStates.registerData.confirmStatusID === 1 ||
                        AppData._persistentStates.registerData.confirmStatusID === 2) {
                        that.binding.showRegister = true;
                        that.binding.showTeaser = true;
                        if (registerFragment &&
                            registerFragment.controller &&
                            registerFragment.controller.binding) {
                            registerFragment.controller.binding.showRegisterMail = false;
                            registerFragment.controller.binding.showResendEditableMail = true;
                            registerFragment.controller.binding.registerStatus = getResourceText("register.sendEmailMessage");
                            if (AppData._persistentStates.registerData.resultCode === 21) {
                                registerFragment.controller.binding.showReRegisterEventMail = true;
                                registerFragment.controller.binding.showRegisterMail = false;
                                registerFragment.controller.binding.showResendEditableMail = false;
                                registerFragment.controller.binding.registerStatus =
                                    getResourceText("register.re_registerMessage");
                            }
                        }
                        return WinJS.Promise.as();
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 10 ||
                        AppData._persistentStates.registerData.confirmStatusID === 11) {
                        if (registerFragment &&
                            registerFragment.controller &&
                            registerFragment.controller.binding) {
                            registerFragment.controller.binding.showRegisterMail = false;
                            registerFragment.controller.binding.showResendEditableMail = false;
                        }
                        that.binding.showRegister = false;
                        // Fehlt Bedingung für wann countdown geladen wird
                        // AppData._persistentStates.registerData.urlbb
                        //im prinzip könnte man sessionToken hernehmen 

                        //AppData._persistentStates.registerData.dateBegin > date heute 
                        var countDownDate = AppData._persistentStates.registerData.dateBegin;
                        var now = new Date().getTime();
                        var timeleft = countDownDate - now;
                        if (timeleft > 0) {
                            that.binding.showCountdown = true;
                            that.binding.showConference = false;
                            that.binding.showTeaser = true;
                            return that.getFragmentByName("countdown");
                        } else {
                            that.binding.showCountdown = false;
                            that.binding.showConference = true;
                            that.binding.showTeaser = false;
                            return that.getFragmentByName("conference");
                        }
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 403) {
                        if (registerFragment &&
                            registerFragment.controller &&
                            registerFragment.controller.binding) {
                            that.binding.showTeaser = true;
                            registerFragment.controller.binding.showReRegisterEventMail = false;
                            registerFragment.controller.binding.showRegisterMail = false;
                            registerFragment.controller.binding.showResendEditableMail = false;
                            registerFragment.controller.binding.registerStatus =
                                getResourceText("register.eventNotStartedYet");

                        }
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 20) {
                        that.binding.showRegister = false;
                        that.binding.showTeaser = false;
                        that.binding.showCountdown = false;
                        that.binding.showConference = false;
                        that.binding.showRecordedContent = true;
                        return that.getFragmentByName("recordedContent");
                    } else {
                        that.binding.showRegister = true;
                        that.binding.showTeaser = true;
                        if (registerFragment &&
                            registerFragment.controller &&
                            registerFragment.controller.binding) {
                            registerFragment.controller.binding.showRegisterMail = true;
                            registerFragment.controller.binding.showResendEditableMail = false;
                            registerFragment.controller.binding.showReRegisterEventMail = false;
                        }
                        return WinJS.Promise.as();
                        //return that.getFragmentByName("teaser");
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.updateFragment = updateFragment;

            var contentArea = pageElement.querySelector(".contentarea");
            if (contentArea) {
                this.addRemovableEventListener(contentArea, "scroll", this.eventHandlers.onScroll.bind(this));
            }

            var heroHeader = pageElement.querySelector(".hero-header");
            if (heroHeader) {
                var firstElementChild = heroHeader.firstElementChild;
                while (firstElementChild) {
                    var styles = getComputedStyle(firstElementChild);
                    if (styles && styles.getPropertyValue("position") === "fixed") {
                        if (firstElementChild.style) {
                            firstElementChild.style.maxWidth = "";
                        }
                        break;
                    }
                    firstElementChild = firstElementChild.firstElementChild;
                }
            }

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                AppData.setSeoText(AppData._persistentStates.registerData.confirmStatusID, that.binding.dataText);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                that.binding.showShare = true;
            });
            Log.ret(Log.l.trace);
        })
    });
})();
