// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/modSession/modSessionController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("modSession");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.
            var contentarea = element.querySelector(".contentarea");
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
            }
            // insert body-content
            var contentHeader = element.querySelector(".content-header");
            if (contentHeader && contentHeader.parentElement) {
                var bodyContent = Application.navigator.pageElement &&
                    Application.navigator.pageElement.querySelector(".body-content");
                if (bodyContent) {
                    bodyContent.parentElement.removeChild(bodyContent);
                } else {
                    bodyContent = document.createElement("DIV");
                    bodyContent.setAttribute("class", "body-content");
                    var sibling = document.body.firstElementChild;
                    while (sibling && sibling.id !== "ls-customer-host") {
                        var nextSibling = sibling.nextElementSibling;
                        document.body.removeChild(sibling);
                        bodyContent.appendChild(sibling);
                        sibling = nextSibling;
                    }
                }
                contentHeader.parentElement.insertBefore(bodyContent, contentHeader);
            }

            this.inResize = 0;
            this.prevWidth = 0;
            this.prevHeight = 0;

            var commandList = [];

            this.controller = new ModSession.Controller(element, commandList);
            if (this.controller.eventHandlers) {
                // general event listener for hardware back button, too!
                this.controller.addRemovableEventListener(document, "backbutton", this.controller.eventHandlers.clickBack.bind(this.controller));
            }
            document.body.style.overflowY = "visible";
            Log.ret(Log.l.trace);
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
            Log.call(Log.l.u1, pageName + ".");
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
            Log.ret(Log.l.u1);
        }
    });
})();
