// controller for page: home
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/modSession/modSessionService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("ModSession", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "ModSession.Controller.");

            if (Application.query && Application.query.eventID) {
                AppData.setRecordId("Veranstaltung", Application.query.eventID);
            }

            Application.Controller.apply(this, [pageElement, {
                showConference: false,
                modSessionLink: null
            }, commandList]);

            var that = this;

            var setDataEvent = function (newDataEvent) {
                Log.call(Log.l.trace, "ModSession.Controller.");
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
                Log.call(Log.l.trace, "ModSession.Controller.");
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
                Log.call(Log.l.trace, "ModSession.Controller.");
                var newDataDoc = {};
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        var docContent = row.DocContentDOCCNT1
                            ? row.DocContentDOCCNT1
                            : row.DocContentDOCCNT1;
                        if (docContent) {
                            var sub = docContent.search("\r\n\r\n");
                            if (sub >= 0) {
                                var data = docContent.substr(sub + 4);
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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "ModSession.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickHome: function(event) {
                    Log.call(Log.l.trace, "ModSession.Controller.");
                    Application.navigateById("home", event);
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "ModSession.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogin: function (event) {
                    Log.call(Log.l.trace, "ModSession.Controller.");
                    that.doLogin(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogout: function (event) {
                    Log.call(Log.l.trace, "ModSession.Controller.");
                    that.doLogout(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickSessionInNewWindow: function(event) {
                    Log.call(Log.l.trace, "ModSession.Controller.");
                    if (that.binding.modSessionLink) {
                        window.open(that.binding.modSessionLink);
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
                        if (parentElement) {
                            return Application.loadFragmentById(parentElement, fragmentName, null);
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
                Log.call(Log.l.trace, "ModSession.Controller.");
                var modToken;
                if (Application.query.UserToken) {
                    modToken = Application.query.UserToken;
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as()/*.then(function () {
                    return AppData.call("PRC_BBBModeratorLink", {
                        pVeranstaltungID: 0,
                        pAlias: null,
                        pUserToken: modToken //aus startlink 
                    }, function (json) {
                        if (json && json.d && json.d.results) {
                            that.binding.dataConference = json.d.results[0];
                            var modSessionLink = that.binding.dataConference.URL;
                            if (modSessionLink) {
                                window.open(modSessionLink);
                            }
                            AppBar.scope.binding.showConference = true;
                        }
                        Log.print(Log.l.trace, "PRC_BBBConferenceLink success!");
                    }, function (error) {
                        Log.print(Log.l.error, "PRC_BBBConferenceLink error! ");
                    });
                })*/.then(function () {
                    return that.updateFragment();
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "ModSession.Controller.");
                AppData.setErrorMsg(that.binding);
                //var location = window.location.href;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            var updateFragment = function () {
                Log.call(Log.l.trace, "ModSession.Controller.");
                var ret = that.getFragmentByName("conference");
                Log.ret(Log.l.trace);
                return ret;
            }
            this.updateFragment = updateFragment;

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
