// controller for page: Conference
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/conference/conferenceService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Conference", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Conference.Controller.", "eventId=" + (options && options.eventId));

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataConference: {
                    media: ""
                }
            }, commandList]);

            var that = this;

            var loadData = function () {
                Log.call(Log.l.trace, "Conference.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                // Ersetze mit neuer Prozedur
                /*var ret = AppData.call("PRC_STARTCARDOCREX",
                    {
                        pAktionStatus: pAktionStatus
                    },
                    function (json) {
                        Log.print(Log.l.trace, "PRC_STARTCARDOCREX success!");

                    },
                    function (error) {
                        Log.print(Log.l.error, "PRC_STARTCARDOCREX error! ");
                    })*/
                var meetingUrl = "";
                var options = {
                    type: "GET",
                    url: ""
                };
                var ret = new WinJS.Promise.as().then(function () {
                /*    options.url = "https://conference.germanywestcentral.cloudapp.azure.com/bigbluebutton/api/create?allowStartStopRecording=true&attendeePW=ap&autoStartRecording=false&lockSettingsLockedLayout=true&logoutURL=https%3A%2F%2Fsecure.convey.de%2Fbbb%2F&meetingID=random-2448579&moderatorPW=mp&name=random-2448579&record=true&voiceBridge=75209&welcome=%3Cbr%3EWelcome+to+%3Cb%3E%25%25CONFNAME%25%25%3C%2Fb%3E%21&checksum=4cda190f6de04150a35bf846bc8d94b24e9c9ab9";
                    return WinJS.xhr(options).then(function xhrSuccess(response) {
                        Log.print(Log.l.trace, "GET create? success!");
                    }, function (errorResponse) {
                        AppData.setErrorMsg(AppBar.scope.binding, errorResponse);
                    });
                }).then(function () {*/
                    options.url = "https://conference.germanywestcentral.cloudapp.azure.com/bigbluebutton/api/join?fullName=Attendee+Frame&lockSettingsDisablePublicChat=true&meetingID=random-2448579&password=ap&redirect=false&checksum=acdd99ffd9ee1bfaa3b6c3db7950d939e2d235f3";
                    return WinJS.xhr(options).then(function xhrSuccess(response) {
                        Log.print(Log.l.trace, "GET join? success!");
                        try {
                            if (response) {
                                var parser = new DOMParser();
                                var xmlDoc = parser.parseFromString(response.responseText, "text/xml");
                                meetingUrl = xmlDoc.getElementsByTagName("url")[0] &&
                                    xmlDoc.getElementsByTagName("url")[0].childNodes &&
                                    xmlDoc.getElementsByTagName("url")[0].childNodes[0] &&
                                    xmlDoc.getElementsByTagName("url")[0].childNodes[0].nodeValue;
                            }
                        } catch (exception) {
                            Log.print(Log.l.error, "resource parse error " + (exception && exception.message) + " success / " + " errors");
                            var err = { status: 500, statusText: "data parse error " + (exception && exception.message) };
                            AppData.setErrorMsg(AppBar.scope.binding, err);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(AppBar.scope.binding, errorResponse);
                    });
                }).then(function () {
                    if (meetingUrl) {
                        options.url = meetingUrl;
                        return WinJS.xhr(options).then(function xhrSuccess(response) {
                            Log.print(Log.l.trace, "GET url? success!");
                            try {
                                if (response) {
                                    that.binding.dataConference.media = response.responseText;
                                }
                            } catch (exception) {
                                Log.print(Log.l.error, "resource parse error " + (exception && exception.message) + " success / " + " errors");
                                var err = { status: 500, statusText: "data parse error " + (exception && exception.message) };
                                AppData.setErrorMsg(AppBar.scope.binding, err);
                            }
                        },
                        function(errorResponse) {
                            AppData.setErrorMsg(AppBar.scope.binding, errorResponse);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.loadData();
            });
            Log.ret(Log.l.trace);
        })
    });
})();



