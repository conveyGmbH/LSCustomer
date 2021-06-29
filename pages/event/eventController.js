﻿// controller for page: event
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
                showICS: false,
                showShare: false,
                showTeaser: false,
                showRegister: false,
                showCountdown: false,
                showConference: false,
                showRecordedContent: false,
                showLogOffEventMail: false,
                showEvText: false,
                showOffText: false,
                showMaintenance: false,
                registerStatus: "",
                recordedLink: null,
                eventId: AppData.getRecordId("Veranstaltung"),
                dataEvent: {},
                dataText: {},
                dataDoc: getEmptyDefaultValue(Event.medienView.defaultValue),
                dataDocText: {},
                link: window.location.href,
                registerEmail: null,
                conferenceLink: null
            }, commandList]);

            var onScrollResizePromise = null;
            var contentArea = pageElement.querySelector(".contentarea");
            var speakerLines = pageElement.querySelector("#speakerLines");
            this.refreshWaitTimeMs = 10000;
            this.refreshResultsPromise = null;
            this.inLoadData = false;

            this.refreshMaintenanceTimeMs = 10000 + (Math.random() * 20 * 1000);
            this.refreshMaintenanceResultsPromise = null;

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

            var setDataSpeaker = function(results) {
                Log.call(Log.l.trace, "Event.Controller.");
                if (results && speakerLines && speakerLines.winControl) {
                    var speakerData = new WinJS.Binding.List([]);
                    results.forEach(function(item, index) {
                        if (item && item.SpeakerIDX > 0) {
                            speakerData.push({
                                dataEvent: that.binding.dataEvent,
                                dataDoc: {
                                    ev_doc_mod: that.binding.dataDoc["ev_doc_mod" + item.SpeakerIDX] ? 
                                        that.binding.dataDoc["ev_doc_mod" + item.SpeakerIDX] : "images/user.svg"
                                },
                                dataDocText: {
                                    ev_doc_mod_alt: that.binding.dataDocText["ev_doc_mod" + item.SpeakerIDX + "_alt"],
                                    ev_doc_mod_title: that.binding.dataDocText["ev_doc_mod" + item.SpeakerIDX + "_title"],
                                    ev_doc_mod_descr: that.binding.dataDocText["ev_doc_mod" + item.SpeakerIDX + "_descr"]
                                },
                                dataText: {
                                    ev_text_mod_name: that.binding.dataText["ev_text_mod" + item.SpeakerIDX + "_name"],
                                    ev_text_mod_expertise: that.binding.dataText["ev_text_mod" + item.SpeakerIDX + "_expertise"],
                                    ev_text_mod_homepage: that.binding.dataText["ev_text_mod" + item.SpeakerIDX + "_homepage"],
                                    ev_text_mod_cv: that.binding.dataText["ev_text_mod" + item.SpeakerIDX + "_cv"]
                                }
                            });
                        }
                    });
                    speakerLines.winControl.data = speakerData;
                }
                Log.ret(Log.l.trace);
            }
            this.setDataSpeaker = setDataSpeaker;

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
                    cal.calendar();
                    cal.download(that.binding.dataEvent.Name);
                    Log.ret(Log.l.trace);
                },
                onScroll: function (event) {
                    Log.call(Log.l.u1, "Event.Controller.");
                    var pageControl = pageElement.winControl;
                    if (pageControl) {
                        pageControl.prevWidth = 0;
                        pageControl.prevHeight = 0;
                        pageControl.updateLayout.call(pageControl, pageElement);
                    }
                    if (contentArea) {
                        var headerHost = document.querySelector("#headerhost");
                        if (headerHost && headerHost.firstElementChild) {
                            if (contentArea.scrollTop > 0) {
                                if (!WinJS.Utilities.hasClass(headerHost.firstElementChild,"sticky-scrolled")) {
                                    WinJS.Utilities.addClass(headerHost.firstElementChild, "sticky-scrolled");
                                }
                            } else {
                                if (WinJS.Utilities.hasClass(headerHost.firstElementChild,"sticky-scrolled")) {
                                    WinJS.Utilities.removeClass(headerHost.firstElementChild, "sticky-scrolled");
                                }
                            }
                        }
                    }
                    if (onScrollResizePromise) {
                        onScrollResizePromise.cancel();
                    }
                    onScrollResizePromise = WinJS.Promise.timeout(20).then(function() {
                        var resizeEvent = document.createEvent('uievent');
                        resizeEvent.initEvent('resize', true, true);
                        window.dispatchEvent(resizeEvent);
                    });
                    Log.ret(Log.l.u1);
                },
                clickLogOffEvent: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    var logOffButton = pageElement.querySelector("#logOffButton");
                    that.binding.registerEmail = AppData._persistentStates.registerData.Email || "";
                    var confirmTitle = getResourceText("event.labelLogOff") + " " + that.binding.registerEmail;
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            AppBar.busy = true;
                            Log.print(Log.l.trace, "clickLogOff: user choice OK");
                            if (AppData._persistentStates.registerData) {
                                AppData._persistentStates.registerData.AnredeID = null;
                                AppData._persistentStates.registerData.Email = null;
                                AppData._persistentStates.registerData.Firmenname = null;
                                AppData._persistentStates.registerData.Name = null;
                                AppData._persistentStates.registerData.Vorname = null;
                                AppData._persistentStates.registerData.Position = null;
                                AppData._persistentStates.registerData.privacyPolicyFlag = false;
                                AppData._persistentStates.registerData.confirmStatusID = 0;
                                AppData._persistentStates.registerData.userToken = null;
                                AppData._persistentStates.registerData.resultMessage = "";
                                AppData._persistentStates.registerData.UserTZ = "";
                                AppData._persistentStates.registerData.eventId = null;
                                AppData._persistentStates.registerData.dateBegin = null;
                                Application.pageframe.savePersistentStates();
                            }
                            Application.navigateById("home");
                            that.binding.showLogOffEventMail = false;
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    }, logOffButton);
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
                        var pageControl = pageElement.winControl;
                        if (pageControl) {
                            pageControl.prevWidth = 0;
                            pageControl.prevHeight = 0;
                            pageControl.updateLayout.call(pageControl, pageElement);
                        }
                        fragmentController = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath(fragmentName));
                    }
                    return fragmentController;
                });
                return ret;
            }
            this.getFragmentByName = getFragmentByName;

            var resultConverter = function(json) {
                Log.call(Log.l.trace, "Event.Controller.");
                if (json && json.d && json.d.results) {
                    var result = json.d.results[0];
                    //Absicherung wenn 
                    if (result.resultCode === 21) {
                        //copyToken = AppData._persistentStates.registerData.userToken;
                        AppData._persistentStates.registerData.userToken = null;
                    }
                    if (result.UserToken !== AppData._persistentStates.registerData.userToken) {
                        AppData._persistentStates.registerData.userToken = result.UserToken;
                    }
                    if (result.VeranstaltungID &&
                        result.VeranstaltungID !== AppData._persistentStates.registerData.eventId) {
                        AppData._persistentStates.registerData.eventId = result.VeranstaltungID;
                    }
                    if (result.ConfirmStatusID !== AppData._persistentStates.registerData.confirmStatusID) {
                        AppData._persistentStates.registerData.confirmStatusID = result.ConfirmStatusID;
                    }
                    if (result.EMail && result.EMail !== AppData._persistentStates.registerData.Email) {
                        AppData._persistentStates.registerData.Email = result.EMail;
                        that.binding.registerEmail = result.EMail;
                    }
                    if (result.ConferenceLink && result.ConferenceLink !== that.binding.conferenceLink) {
                        that.binding.conferenceLink = result.ConferenceLink;
                    }

                    if (result.ConfirmStatusID === 20) {
                        that.binding.recordedLink = result.ConferenceLink;
                        if (that.binding.recordedLink) {
                            var url = that.binding.recordedLink;
                            var query = getQueryStringParameters(url);
                            if (window.history && query && Application.query) {
                                var state = {};
                                var title = "";
                                for (var key in query) {
                                    if (query.hasOwnProperty(key)) {
                                        var value = query[key];
                                        Log.print(Log.l.trace, "added "+ key + "=" + value);
                                        Application.query[key] = value;
                                    }
                                }
                                var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                                window.history.pushState(state, title, location);
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
                Log.ret(Log.l.trace);
            }
            that.resultConverter = resultConverter;

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
                            Log.print(Log.l.trace, "textView: success!");
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
                            Log.print(Log.l.trace, "medienView: success!");
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
                            Log.print(Log.l.trace, "medienTextView: success!");
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
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select speakerView...");
                        return Event.speakerView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "speakerView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataSpeaker(json.d.results);
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
                                AppBar.busy = false;
                                Log.print(Log.l.trace, "PRC_RegisterContact success!");
                                that.resultConverter(json);
                                if (json && json.d && json.d.results) {
                                    var result = json.d.results[0];
                                    if (result.ResultCode !== AppData._persistentStates.registerData.resultCode) {
                                        AppData._persistentStates.registerData.resultCode = result.ResultCode;
                                    }
                                    if (result.ResultMessage) {
                                        that.binding.registerStatus = result.ResultMessage;
                                    }
                                    Application.pageframe.savePersistentStates();
                                }
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
                    return WinJS.Promise.timeout(50);
                }).then(function () {
                    return that.adjustContainerSize();
                }).then(function () {
                    that.inLoadData = false;
                    if (!that.binding.conferenceLink && AppData._persistentStates.registerData.resultCode !== 13 && AppData._persistentStates.registerData.confirmStatusID === 15) {
                        that.refreshMaintenanceResultsPromise = WinJS.Promise.timeout(that.refreshMaintenanceTimeMs).then(function () {
                            that.loadData();
                        });
                    }
                    that.addDisposablePromise(that.refreshMaintenanceResultsPromise);
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
                    AppBar.busy = false;
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                    that.resultConverter(json);
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
                    complete({});
                }, function (errorResponse) {
                    AppData.setErrorMsg(that.binding, errorResponse);
                    error({});
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                }).then(function () {
                    if (contentArea && contentArea.scrollTop > 0) {
                        contentArea.scrollTop = 0;
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var reSendEmail = function(complete, error) {
                Log.call(Log.l.trace, "Event.Controller.");
                AppData.setErrorMsg(that.binding);
                var userToken = AppData._persistentStates.registerData.userToken;
                var email = AppData._persistentStates.registerData.Email;
                AppBar.busy = true;
                var ret = AppData.call("PRC_ResendVAMail", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: userToken,
                    pUserMail: email
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                        if (result.ResultCode !== AppData._persistentStates.registerData.resultCode) {
                            AppData._persistentStates.registerData.resultCode = result.ResultCode;
                        }
                        if (result.ResultMessage) {
                            that.binding.registerStatus = result.ResultMessage;
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
                var ret = new WinJS.Promise.as().then(function () {
                    var dateBegin = that.binding.dataEvent.dateBegin;
                    var dateEnd = that.binding.dataEvent.dateEndDatum;
                    var now = new Date().getTime();
                    var remainderTime = dateBegin - now;
                    if (remainderTime > 0) {
                        that.binding.showICS = true;
                    } else {
                        that.binding.showICS = false;
                    }
                    remainderTime = dateEnd - now;
                    if (remainderTime > 0) {
                        that.binding.showEvText = true;
                        that.binding.showOffText = false;
                    } else {
                            that.binding.showEvText = false;
                            that.binding.showOffText = true;
                        }
                }).then(function () {
                    return that.getFragmentByName("teaser");
                }).then(function (teaserFragment) {
                    that.binding.showRegister = false;
                    that.binding.showTeaser = false;
                    that.binding.showCountdown = false;
                    that.binding.showConference = false;
                    that.binding.showMaintenance = false;
                    //Behandlung welches Bild in teaser-fragment angezeigt wird
                    if (teaserFragment &&
                        teaserFragment.controller &&
                        teaserFragment.controller.binding) {
                        if (AppData._persistentStates.registerData.confirmStatusID > 0 && AppData._persistentStates.registerData.confirmStatusID < 15) {
                            teaserFragment.controller.binding.showEvDoc = false;
                            teaserFragment.controller.binding.showOnDoc = true;
                            teaserFragment.controller.binding.showOffDoc = false;
                        } else if (AppData._persistentStates.registerData.confirmStatusID === 15) {
                            // Status = 15 bedeutet Event zuende und recordedContent noch nicht da
                            teaserFragment.controller.binding.showEvDoc = false;
                            teaserFragment.controller.binding.showOnDoc = false;
                            teaserFragment.controller.binding.showOffDoc = true;
                            //that.binding.showMaintenance = true;
                            return that.getFragmentByName("recordedContent").then(function (recordedContentFragment) {
                                if (recordedContentFragment &&
                                    recordedContentFragment.controller &&
                                    recordedContentFragment.controller.binding) {
                                    recordedContentFragment.controller.binding.showDelayContent = true;
                                }
                            });
                        } else if (AppData._persistentStates.registerData.confirmStatusID > 15) {
                            // Status = 15 bedeutet Event zuende und recordedContent da
                            teaserFragment.controller.binding.showEvDoc = false;
                            teaserFragment.controller.binding.showOnDoc = false;
                            teaserFragment.controller.binding.showOffDoc = true;
                            that.binding.showMaintenance = false;
                        } else {
                            var dateEnd = that.binding.dataEvent.dateEndDatum;
                            var now = new Date().getTime();
                            var remainderTime = dateEnd - now;
                            if (remainderTime > 0) {
                            teaserFragment.controller.binding.showEvDoc = true;
                            teaserFragment.controller.binding.showOnDoc = false;
                            teaserFragment.controller.binding.showOffDoc = false;
                            } else {
                                teaserFragment.controller.binding.showEvDoc = false;
                                teaserFragment.controller.binding.showOnDoc = false;
                                teaserFragment.controller.binding.showOffDoc = true;
                            }
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
                            if (AppData._persistentStates.registerData.resultCode === 21) {
                                // Stand 15.6 setze showRegisterMail auf true und tuhe so als müssen der user neu registrieren
                                // Feature showReRegisterEventMail erstmal deaktiviert dadurch
                                registerFragment.controller.binding.showReRegisterEventMail = false;
                                registerFragment.controller.binding.showRegisterMail = true;
                                registerFragment.controller.binding.showResendEditableMail = false;
                                //registerFragment.controller.binding.registerStatus = getResourceText("register.re_registerMessage");
                            } else {
                                registerFragment.controller.binding.showRegisterMail = false;
                                registerFragment.controller.binding.showResendEditableMail = true;
                            }
                            //registerFragment.controller.binding.registerStatus = getResourceText("register.sendEmailMessage");
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
                        that.binding.showLogOffEventMail = true;

                        //AppData._persistentStates.registerData.dateBegin > date heute 
                        var countDownDate = that.binding.dataEvent.dateBegin;
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
                            return that.getFragmentByName("conference").then(function(conferenceFragment) {
                                conferenceFragment.controller.setCommandMessageHandler("sessionEndRequested", function (param) {
                                    alert("sessionEndRequested received: " + (param ? param : ""));
                                    // bzw. irgendwas sinnvolles machen wenn man das Kommando "sessionEndRequested" empfängt...
                                    // call PRC_RegisterContact?!
                                    that.loadData();
                                });
                            });
                        }
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 15) {
                        // session noch nicht da 
                        that.binding.showRegister = false;
                        that.binding.showTeaser = false;
                        that.binding.showCountdown = false;
                        that.binding.showConference = false;
                        that.binding.showMaintenance = true;
                        return that.getFragmentByName("maintenance");
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 20) {
                        that.binding.showRegister = false;
                        that.binding.showTeaser = false;
                        that.binding.showCountdown = false;
                        that.binding.showConference = false;
                        that.binding.showRecordedContent = true;
                        that.binding.showLogOffEventMail = true;
                    } else if (AppData._persistentStates.registerData.confirmStatusID === 403) {
                        that.binding.showICS = true;
                        if (registerFragment &&
                            registerFragment.controller &&
                            registerFragment.controller.binding) {
                            that.binding.showTeaser = true;
                            that.binding.showLogOffEventMail = true;
                            registerFragment.controller.binding.showReRegisterEventMail = false;
                            registerFragment.controller.binding.showRegisterMail = false;
                            registerFragment.controller.binding.showResendEditableMail = false;
                            registerFragment.controller.binding.registerStatus =
                                getResourceText("register.eventNotStartedYet");

                        }
                        return WinJS.Promise.as();
                    } /*else if (AppData._persistentStates.registerData.confirmStatusID === 30) {
                         that.getFragmentByName("teaser").then(function (teaserFragment) {
                             teaserFragment.controller.binding.showEvDoc = false;
                             teaserFragment.controller.binding.showOnDoc = false;
                             teaserFragment.controller.binding.showOffDoc = true;
                         });
                          that.binding.showRegister = false;
                          that.binding.showCountdown = false;
                          that.binding.showConference = true;
                          that.binding.showTeaser = false;
                    }*/ else {
                        if (AppData._persistentStates.registerData.resultCode === 0 || AppData._persistentStates.registerData.resultCode === 13) {
                        that.binding.showRegister = true;
                        that.binding.showTeaser = true;
                        that.binding.showLogOffEventMail = false;
                            that.binding.showMaintenance = false;
                        } else if (AppData._persistentStates.registerData.confirmStatusID === null && !that.binding.conferenceLink) {
                            that.binding.showRegister = false;
                            that.binding.showTeaser = false;
                            that.binding.showLogOffEventMail = true;

                            that.binding.showCountdown = false;
                            that.binding.showConference = false;
                            that.binding.showTeaser = false;
                            that.binding.showMaintenance = true;
                            return that.getFragmentByName("maintenance");
                        }
                        if (registerFragment &&
                            registerFragment.controller &&
                            registerFragment.controller.binding) {
                            registerFragment.controller.binding.showRegisterMail = true;
                            registerFragment.controller.binding.showResendEditableMail = false;
                            registerFragment.controller.binding.showReRegisterEventMail = false;
                        }
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.updateFragment = updateFragment;

            var showEvOffText = function () {
                if (that.inLoadData) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return WinJS.Promise.as();
                }
                that.inLoadData = true;
                if (that.refreshResultsPromise) {
                    that.refreshResultsPromise.cancel();
                    that.removeDisposablePromise(that.refreshResultsPromise);
                }
                var ret = new WinJS.Promise.as().then(function () {
                    var dateEnd = that.binding.dataEvent.dateEndDatum;
                    var now = new Date().getTime();
                    var timeleft = dateEnd - now;
                    if (timeleft < 0) {
                       /* AppData._persistentStates.registerData.confirmStatusID = 15;
                        Application.pageframe.savePersistentStates();*/
                        that.binding.showEvText = false;
                        that.binding.showOffText = true;
                    } else {
                        that.binding.showEvText = true;
                        that.binding.showOffText = false;
                    }
                }).then(function () {
                    that.inLoadData = false;
                    if (that.binding.showEvText) {
                    that.refreshResultsPromise = WinJS.Promise.timeout(that.refreshWaitTimeMs).then(function () {
                        that.showEvOffText();
                    });
                    }
                    that.addDisposablePromise(that.refreshResultsPromise);
                });
                return ret;
            }
            that.showEvOffText = showEvOffText;

            if (contentArea) {
                this.addRemovableEventListener(contentArea, "scroll", this.eventHandlers.onScroll.bind(this));
            }

            var adjustContainerSize = function() {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function() {
                    var headerHost = document.querySelector("#headerhost");
                    if (contentArea && headerHost) {
                        var stickyHeader = headerHost.querySelector(".sticky-header-pinned-fixed");
                        if (contentArea.style && stickyHeader) {
                            contentArea.style.paddingTop = stickyHeader.clientHeight.toString() + "px";
                        }
                        var firstElementChild = headerHost.firstElementChild;
                        while (firstElementChild) {
                            var styles = getComputedStyle(firstElementChild);
                            if (styles && styles.getPropertyValue("position") === "fixed") {
                                if (firstElementChild.style) {
                                    var scrollBarWidth = contentArea.offsetWidth - contentArea.clientWidth;
                                    var maxWidth = "calc(100% - " + (firstElementChild.offsetLeft + scrollBarWidth).toString() + "px)";
                                    firstElementChild.style.maxWidth = maxWidth;
                                }
                                break;
                            }
                            firstElementChild = firstElementChild.firstElementChild;
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.adjustContainerSize = adjustContainerSize;

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                AppData.setSeoText(AppData._persistentStates.registerData.confirmStatusID, that.binding.dataText);
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                Application.showBodyContentBottom(pageElement, true);
                that.binding.showShare = true;
            }).then(function () {
                return that.showEvOffText();
            });
            Log.ret(Log.l.trace);
        })
    });
})();
