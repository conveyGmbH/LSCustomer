// controller for page: recordedVideo
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/recordedVideo/recordedVideoService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    var typeIndex = [
        "video/webm",
        "video/mp4"
    ];

    WinJS.Namespace.define("RecordedVideo", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "RecordedVideo.Controller.", "eventId=" + (options && options.eventId));

            var sources = {};
            var qualities = [];
            var sourceElements = [];

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataRegister: {
                    Email: "",
                    Name: "",
                    ErfassungsStatus: 0,
                    Freischaltung: 0
                },
                countdown: {
                    day: "",
                    hour: "",
                    minute: "",
                    second: ""
                },
                dataConference: {
                    media: ""
                },
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText,
                showEvText: AppBar.scope.binding.showEvText,
                showOffText: AppBar.scope.binding.showOffText,
                showDelayContent: true
            }, commandList]);

            var that = this;

            that.dispose = function () {
                Log.call(Log.l.trace, "RecordedVideo.Controller.");
                Log.ret(Log.l.trace);
            }

            var recordedVideo = fragmentElement.querySelector("#recordedVideo");

            var loadData = function () {
                Log.call(Log.l.trace, "RecordedVideo.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var url = null;
                    if (AppBar.scope.binding.recordedLink) {
                        url = AppBar.scope.binding.recordedLink;
                    }
                    if (url) {
                        options.url = url.replace(/https?:\/\/[\.a-zA-Z0-9]+\/recording/g, '/recording');
                    }
                    if (!options.url) {
                        Log.print(Log.l.error, "no url!");
                        return WinJS.Promise.as();
                    } 
                    // look for videos
                    var xhrOptions = {
                        type: "GET",
                        url: options.url
                    };
                    Log.print(Log.l.trace, "calling url=" + xhrOptions.url);
                    return WinJS.xhr(xhrOptions);
                }).then(function (response) {
                    if (response && response.responseText) {
                        sources = {};
                        qualities = [];
                        sourceElements = [];
                        var results = response.responseText.split("\n");
                        for (var l = 0; l < results.length; l++) {
                            var fileName = results[l];
                            if (fileName) {
                                Log.print(Log.l.trace, "file[" + l + "]='" + results[l] + "'");
                                var pQuality = fileName.lastIndexOf("-");
                                var pExt = fileName.lastIndexOf(".");
                                if (pQuality > 0 && pExt > pQuality + 1) {
                                    var type = "video/" + fileName.substr(pExt + 1);
                                    var idx = typeIndex.indexOf(type);
                                    if (idx >= 0) {
                                        var src = options.url.replace(/files\.txt/g, fileName);
                                        var quality = parseInt(fileName.substr(pQuality + 1, pExt - pQuality - 1));
                                        if (!sources[quality]) {
                                            sources[quality] = [];
                                            qualities.push(quality);
                                        }
                                        sources[quality].push({
                                            src: src,
                                            type: type,
                                            priority: idx+1
                                        });
                                    }
                                }
                            }
                        }
                        if (recordedVideo && qualities.length > 0) {
                            var videoElement = recordedVideo.querySelector("video");
                            if (videoElement) {
                                recordedVideo.removeChild();
                            }
                            qualities.sort((a, b) => a - b);
                            var curQuality = qualities[qualities.length - 1];
                            var source = sources[curQuality];
                            if (source && source.length > 0) {
                                source.sort((a, b) => a.priority - b.priority);
                                videoElement = document.createElement("video");
                                videoElement.disablePictureInPicture = true;
                                videoElement.controls = true;
                                for (var i = 0; i < source.length; i++) {
                                    var sourceElement = document.createElement("source");
                                    sourceElement.src = source[i].src;
                                    sourceElement.type = source[i].type;
                                    videoElement.appendChild(sourceElement);
                                    sourceElements[i] = sourceElement;
                                }
                                recordedVideo.appendChild(videoElement);
                                that.binding.showDelayContent = false;
                            } else {
                                videoElement = null;
                                that.binding.showDelayContent = true;
                            }
                            recordedVideo.scrollIntoView(videoElement);
                        }
                    } else {
                        Log.print(Log.l.error, "no response");
                    }
                    return WinJS.Promise.as();
                }, function (errorResponse) {
                    Log.print(Log.l.error, "error=" + AppData.getErrorMsgFromResponse(errorResponse));
                    AppData.setErrorMsg(AppBar.scope.binding, errorResponse);
                    return WinJS.Promise.as();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



