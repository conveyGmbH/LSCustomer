// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/navigator.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/pages/appHeader/appHeaderController.js" />

(function () {
    "use strict";

    var pageName = Application.getPagePath("appHeader");

    WinJS.UI.Pages.define(pageName, {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Initialize the page here.

            // insert body-content
            var hasFixedChild = false;
            var sibling,nextSibling,firstElementChild,styles;
            var appHeader = element.firstElementChild.firstElementChild || element.firstElementChild || element;
            var savedBodyContentTop = document.querySelector(".saved-body-content-top");
            if (savedBodyContentTop) {
                sibling = savedBodyContentTop.firstElementChild;
                while (sibling) {
                    nextSibling = sibling.nextElementSibling;
                    firstElementChild = sibling;
                    while (firstElementChild) {
                        styles = getComputedStyle(firstElementChild);
                        if (styles && styles.getPropertyValue("position") === "fixed" &&
                            styles.getPropertyValue("top") && styles.getPropertyValue("top")[0] === "0") {
                            WinJS.Utilities.addClass(firstElementChild, "sticky-header-pinned-fixed");
                            hasFixedChild = true;
                            break;
                        }
                        firstElementChild = firstElementChild.firstElementChild;
                    }
                    if (hasFixedChild) {
                        savedBodyContentTop.removeChild(sibling);
                        appHeader.appendChild(sibling);
                        if (appHeader.parentNode && appHeader.parentNode.style) {
                            appHeader.parentNode.style.position = "absolute";
                        }
                    }
                    sibling = nextSibling;
                }
            }
            if (!hasFixedChild) {
                var savedBodyContentBottom = document.querySelector(".saved-body-content-bottom");
                if (savedBodyContentBottom) {
                    sibling = savedBodyContentBottom.firstElementChild;
                    while (sibling) {
                        nextSibling = sibling.nextElementSibling;
                        firstElementChild = sibling;
                        while (firstElementChild) {
                            styles = getComputedStyle(firstElementChild);
                            if (styles && styles.getPropertyValue("position") === "fixed" &&
                                styles.getPropertyValue("top") && styles.getPropertyValue("top")[0] === "0") {
                                WinJS.Utilities.addClass(firstElementChild, "sticky-header-pinned-fixed");
                                hasFixedChild = true;
                                break;
                            }
                            firstElementChild = firstElementChild.firstElementChild;
                        }
                        if (hasFixedChild) {
                            savedBodyContentBottom.removeChild(sibling);
                            appHeader.appendChild(sibling);
                            if (appHeader.parentNode && appHeader.parentNode.style) {
                                appHeader.parentNode.style.position = "absolute";
                            }
                        }
                        sibling = nextSibling;
                    }
                }
            }

            this.controller = new AppHeader.Controller(element);
            Log.ret(Log.l.trace);
        },

        unload: function () {
            Log.call(Log.l.trace, pageName + ".");
            // TODO: Respond to navigations away from this page.
            Log.ret(Log.l.trace);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />
            // TODO: Respond to changes in viewState.
        }
    });
})();
