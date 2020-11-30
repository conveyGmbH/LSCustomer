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
                dataConference: {}
            }, commandList]);

            var that = this;

            var loaddata = function () {
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
                    })*///WinJS.Promise.as().then(function () {

                //https://conference.germanywestcentral.cloudapp.azure.com/bigbluebutton/api/
                //https://conference.germanywestcentral.cloudapp.azure.com/bigbluebutton/api/create?allowStartStopRecording=true&attendeePW=ap&autoStartRecording=false&lockSettingsLockedLayout=true&logoutURL=https%3A%2F%2Fsecure.convey.de%2Fbbb%2F&meetingID=random-2448579&moderatorPW=mp&name=random-2448579&record=true&voiceBridge=75209&welcome=%3Cbr%3EWelcome+to+%3Cb%3E%25%25CONFNAME%25%25%3C%2Fb%3E%21&checksum=4cda190f6de04150a35bf846bc8d94b24e9c9ab9
                //https://conference.germanywestcentral.cloudapp.azure.com/bigbluebutton/api/join?fullName=Moderator+User&lockSettingsDisablePublicChat=false&meetingID=random-2448579&password=mp&redirect=true&checksum=3153ee8c140cba204a705fa565e3a6e8f11a4da0
                var options = {
                    type: "GET",
                    url: "https://conference.germanywestcentral.cloudapp.azure.com/bigbluebutton/api/"
                };
                return WinJS.xhr(options).then(function xhrSuccess(response) {
                    var err;
                    Log.print(Log.l.trace, "GET success!");
                    try {
                        var obj = response;

                    } catch (exception) {
                        that.errorCount++;
                        Log.print(Log.l.error, "resource parse error " + (exception && exception.message) + " success / " + " errors");
                        that.timestamp = new Date();
                        err = { status: 500, statusText: "data parse error " + (exception && exception.message) };
                    }
                    return WinJS.Promise.as();
                }, function (errorResponse) {
                    that.errorCount++;
                    Log.print(Log.l.error, "error status=" + errorResponse.status + " statusText=" + errorResponse.statusText);
                    that.timestamp = new Date();
                });
                //});
                return ret;
            }
            this.loaddata = loaddata;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                return that.loaddata();
            });
            Log.ret(Log.l.trace);
        })
    });
})();



