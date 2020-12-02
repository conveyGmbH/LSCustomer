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

    WinJS.Namespace.define("Event", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Event.Controller.");

            Application.Controller.apply(this, [pageElement, {
                showConference: true,
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
                AppBar.modified = false;
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

            var loadConference = function() {
                Log.call(Log.l.trace, "Event.Controller.");
                var ret = new WinJS.Promise.as().then(function() {
                    var parentElement = pageElement.querySelector("#conferencehost");
                    if (parentElement && that.binding.eventId) {
                        return Application.loadFragmentById(parentElement, "conference", { eventId: that.binding.eventId });
                    } else {
                        WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadConference = loadConference;

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
                    AppBar.notifyModified = true;
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.loadConference();
            }).then(function () {
                Log.print(Log.l.trace, "Conference loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







