// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/fragments/conference/conferenceController.js" />

(function () {
    "use strict";

    var fragmentName = Application.getFragmentPath("conference");

    Fragments.define(fragmentName, {
        // This function is called whenever a user navigates to this fragment. It
        // populates the fragment elements with the app"s data.
        ready: function (element, options) {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Initialize the fragment here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            Colors.loadSVGImageElements(element, "presenter-mode-image", 42, "#ffffff");
            Colors.loadSVGImageElements(element, "show-button-image", 20, null, null, null, {
                presentation: { strokeWidth: 900 },
                camera_user: { strokeWidth: 900 },
                media: { strokeWidth: 900 },
                raise_hand: { strokeWidth: 900 },
                desk_share: { strokeWidth: 900 },
                team: { strokeWidth: 900 },
                chat: { strokeWidth: 900 },
                notes: { strokeWidth: 900 },
                presenter_management: { strokeWidth: 900 },
                microphone_on: { strokeWidth: 900 },
                camera_on: { strokeWidth: 900 },
                phone_receiver_horizontal: { strokeWidth: 900 },
                loudspeaker_on: { strokeWidth: 900 },
                navigate_up: { strokeWidth: 400, color: "#2A2F3D" }
            });

            // add page specific commands to AppBar
            var commandList = [];
            this.controller = new Conference.Controller(element, options, commandList);

            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, fragmentName + ".");
            // TODO: Respond to navigations away from this page.
            var contentGrid = document.querySelector(".event .content-grid");
            if (contentGrid && WinJS.Utilities.hasClass(contentGrid, "content-grid-full-width")) {
                WinJS.Utilities.removeClass(contentGrid, "content-grid-full-width")
            }
            this.controller = null;
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            Log.call(Log.l.u1, fragmentName + ".");
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function () {
                    var docContainer = element.querySelector(".doc-container");
                    if (docContainer && docContainer.style) {
                        var fragment = element.querySelector(".contentarea");
                        if (fragment && fragment.parentElement) {
                            var width = fragment.parentElement.clientWidth;
                            var height = fragment.parentElement.clientHeight;
                            var doResizeContent = false;
                            if (width > 0 && width !== that.prevWidth) {
                                that.prevWidth = width;
                                fragment.style.width = width.toString() + "px";
                                docContainer.style.width = width.toString() + "px";
                                doResizeContent = true;
                            }
                            if (height > 0 && height !== that.prevHeight) {
                                that.prevHeight = height;
                                //fragment.style.height = height.toString() + "px";
                                docContainer.style.height = height.toString() + "px";
                                doResizeContent = true;
                            }
                            if (doResizeContent && that.controller) {
                                that.controller.adjustContentPositions();
                            }
                        }
                    }
                    that.inResize = 0;
                });
            }
            Log.ret(Log.l.u1);
            return ret;
        }
    });
})();