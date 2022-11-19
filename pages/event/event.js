// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/event/eventController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("event");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;
            /*var contentarea = element.querySelector(".contentarea");
            if (contentarea && contentarea.style) {
                if (Colors.isDarkTheme) {
                    var bkg = Colors.hex2rgb(Colors.tileBackgroundColor);
                    var bkgHsv = Colors.rgb2hsv(bkg);
                    bkgHsv.s = Math.min(255, bkgHsv.s * 4);
                    bkgHsv.v /= 4;
                    var darkBkg = Colors.hsv2rgb(bkgHsv);
                    contentarea.style.backgroundColor = Colors.rgb2hex(darkBkg);
                } else {
                    contentarea.style.backgroundColor = Colors.tileBackgroundColor;
                }
            }*/
            Application.insertBodyContent(element, ".customer-top-header", ".hero-footer");

            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            Colors.loadSVGImageElements(element, "action-image", 16, "#ffffff", null, null, {home:{strokeWidth: 400}});

            var commandList = [];
            this.controller = new Event.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            document.body.style.overflowY = "visible";
            Log.ret(Log.l.trace);
        },

        canUnload: function (complete, error) {
            var that = this;
            Log.call(Log.l.trace, pageName + ".");
            var ret = WinJS.Promise.as().then(function (response) {
                // reset query string and other event-specific settings!
                if (Application.query && window.history) {
                    Application.hookXhrOnReadyStateChange = null;
                    Application.hookXhrSend = null;
                    var state = {};
                    var title = "";
                    if (Application.query.eventId) {
                        delete Application.query.eventId;
                    }
                    if (Application.query.sessionToken) {
                        delete Application.query.sessionToken;
                    }
                    if (Application.query.meetingId) {
                        delete Application.query.meetingId;
                    }
                    if (Application.query.UserToken) {
                        delete Application.query.UserToken;
                    }
                    var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                    window.history.replaceState(state, title, location);
                }
                complete(response);
            });
            Log.ret(Log.l.trace);
            return ret;
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            this.controller = null;
            var splitViewRoot = Application.navigator && Application.navigator.splitViewRoot;
            if (splitViewRoot && splitViewRoot.style) {
                splitViewRoot.style.height = "";
                document.body.style.overflowY = "";
            }
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            var ret = null;
            var that = this;
            Log.call(Log.l.u1, pageName + ".");
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
            if (element && !that.inResize) {
                that.inResize = 1;
                ret = WinJS.Promise.timeout(0).then(function() {
                    if (that.controller) {
                        var contentArea = element.querySelector(".contentarea");
                        if (contentArea) {
                            var width = contentArea.clientWidth;
                            var height = contentArea.clientHeight;
                            if (width > 0 && width !== that.prevWidth || height > 0 && height !== that.prevHeight) {
                                function adjustContentHeight(content) {
                                    if (content && content.style) {
                                        var offsetTop = Math.max(content.offsetTop - contentArea.scrollTop,0);
                                        if (content.clientHeight !== height - offsetTop) {
                                            var headerHeight = 0;
                                            var headerHost = document.querySelector("#headerhost");
                                            if (headerHost) {
                                                var stickyHeader = headerHost.querySelector(".sticky-header-pinned-fixed");
                                                if (stickyHeader) {
                                                    headerHeight = stickyHeader.clientHeight;
                                                }
                                            }
                                            var contentHeight;
                                            if (WinJS.Utilities.hasClass(content, "recordedContent-fragmenthost")) {
                                                contentHeight = Math.max(height - (offsetTop + headerHeight), 400);
                                            } else {
                                                contentHeight = Math.max(Math.min(height - headerHeight,height - offsetTop), 400);
                                            }
                                            content.style.height = contentHeight.toString() + "px";
                                            var fragmentElement = content.firstElementChild;
                                            if (fragmentElement) {
                                                var fragmentControl = fragmentElement.winControl;
                                                if (fragmentControl) {
                                                    fragmentControl.updateLayout.call(fragmentControl, fragmentElement);
                                                }
                                            }
                                        }
                                    }
                                }
                                var contents = contentArea.querySelectorAll(".recordedContent-fragmenthost, .conference-fragmenthost");
                                if (contents) for (var i = 0; i < contents.length; i++) {
                                    adjustContentHeight(contents[i]);
                                }
                                var doAdjustContainerSize = false;
                                if (width > 0 && that.prevWidth !== width) {
                                    that.prevWidth = width;
                                    doAdjustContainerSize = true;
                                }
                                if (height > 0 && that.prevHeight !== height) {
                                    that.prevHeight = height;
                                    doAdjustContainerSize = true;
                                }
                                if (doAdjustContainerSize &&
                                    typeof that.controller.adjustContainerSize === "function") {
                                    that.controller.adjustContainerSize();
                                }
                                if (height <= Application._maxViewSize.small &&
                                    !WinJS.Utilities.hasClass(element, "view-size-small")) {
                                    if (WinJS.Utilities.hasClass(element, "view-size-medium-small")) {
                                        WinJS.Utilities.removeClass(element, "view-size-medium-small");
                                    }
                                    if (WinJS.Utilities.hasClass(element, "view-size-medium")) {
                                        WinJS.Utilities.removeClass(element, "view-size-medium");
                                    }
                                } else {
                                    if (width <= Application.maxViewSize.mediumSmall &&
                                        !WinJS.Utilities.hasClass(element, "view-size-medium-small")) {
                                        // add class: view-size-medium-small    
                                        WinJS.Utilities.addClass(element, "view-size-medium-small");
                                    }
                                    if (width <= Application.maxViewSize.medium && 
                                        !WinJS.Utilities.hasClass(element, "view-size-medium")) {
                                        // add class: view-size-medium
                                        WinJS.Utilities.addClass(element, "view-size-medium");
                                    }
                                }
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
