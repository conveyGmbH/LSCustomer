(function () {
    "use strict";

    var rootElementId = "ls-customer-host";

    function loadAppIntoRootElement() {

        var newBaseHref = null;
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i] && scripts[i].src) {
                var pos = scripts[i].src.indexOf("scripts/convey.js");
                if (pos > 0) {
                    newBaseHref = scripts[i].src.substr(0, pos);
                    break;
                }
            }
        }

        var prevBaseHref = "";
        if (newBaseHref) {
            var head = document.head || document.getElementsByTagName("base")[0];
            var base = document.getElementsByTagName("base")[0] || document.getElementsByTagName("BASE")[0];
            if (base) {
                prevBaseHref = base.getAttribute("href");
                base.setAttribute("href", newBaseHref);
            } else if (head) {
                base = document.createElement("base");
                base.setAttribute("href", newBaseHref);
                head.insertBefore(base, head.firstElementChild);
            }
        } else {
            newBaseHref = "";
        }

        var include = function(file, fnc) {
            var n, s, l, e = {
                setNext: function(next) {
                    return n = next;
                },
                load: function() {
                    if (s && l) {
                        s.removeEventListener("load", l);
                        l = null;
                    }
                    if (n && typeof n.next === "function") {
                        window.setTimeout(function() {
                            n.next();
                        }, 0);
                    }
                },
                next: function() {
                    if (typeof fnc === "function") {
                        var r = fnc();
                        if (n && typeof n.next === "function") {
                            r.setNext(n);
                            n = null;
                        }
                    } 
                },
                then: function(f) {
                    n = include(null, f);
                    return n;
                }
            }
            if (typeof file === "string") {
                window.setTimeout(function() {
                    s = document.createElement("SCRIPT");
                    s.type = "text/javascript";
                    s.src = newBaseHref + file;
                    l = e.load;
                    s.addEventListener("load", l);
                    document.head.appendChild(s);
                }, 0);
            }
            return e;
        };

        function getDataset(element) {
            var data = element.dataset;
            if (!data && element.attributes) {
                data = {};
                for (var i = 0; i < element.attributes.length; i++) {
                    if (element.attributes[i].name &&
                        element.attributes[i].name.substr(0, 5) === "data-") {
                        data[element.attributes[i].name] = element.attributes[i].value;
                    }
                }
            }
            return data;
        }
        function createRootElement() {
            var customerElement = document.querySelector("#"+rootElementId);
            if (customerElement && customerElement.parentElement) {
                var customerRootElement = customerElement;
                while (customerRootElement.parentElement && customerRootElement.parentElement !== document.body) {
                    customerRootElement = customerRootElement.parentElement;
                }
                var data = getDataset(customerElement);
                if (data) {
                    AppData.customer = data.customer;
                    AppData.customerId = data.customerid;
                    if (data.language) {
                        Application.language = data.language;
                    }
                    Log.print(Log.l.info, "customer=" + AppData.customer + "customerId=" + AppData.customerId + " language=" + Application.language);
                }

                // Page-Navigationbar Templates
                var barHorizontalTemplate = document.createElement("DIV");
                barHorizontalTemplate.setAttribute("class", "navigationbar-horizontal-template");
                barHorizontalTemplate.setAttribute("data-win-control", "WinJS.Binding.Template");
                barHorizontalTemplate.style.display = "none";
                var barHorizontalItem = document.createElement("DIV");
                barHorizontalItem.setAttribute("class", "navigationbar-item navigationbar-horizontal-item win-type-subtitle");
                var barHorizontalText = document.createElement("DIV");
                barHorizontalText.setAttribute("class", "navigationbar-text navigationbar-horizontal-text");
                barHorizontalText.setAttribute("data-win-bind", "style.display: disabled Binding.Converter.toDisplayNone");
                var barHorizontalInnerText = document.createElement("SPAN");
                barHorizontalInnerText.setAttribute("class", "navigationbar-inner-text");
                barHorizontalInnerText.setAttribute("data-win-bind", "textContent: text");
                barHorizontalText.appendChild(barHorizontalInnerText);
                barHorizontalItem.appendChild(barHorizontalText);
                var barHorizontalTextGray = document.createElement("DIV");
                barHorizontalTextGray.setAttribute("class", "navigationbar-text navigationbar-horizontal-text navigationbar-text-gray");
                barHorizontalTextGray.setAttribute("data-win-bind", "style.display: disabled Binding.Converter.toDisplayNone");
                var barHorizontalInnerTextGray = document.createElement("SPAN");
                barHorizontalInnerTextGray.setAttribute("class", "navigationbar-inner-text");
                barHorizontalInnerTextGray.setAttribute("data-win-bind", "textContent: text");
                barHorizontalTextGray.appendChild(barHorizontalInnerTextGray);
                barHorizontalItem.appendChild(barHorizontalTextGray);
                barHorizontalTemplate.appendChild(barHorizontalItem);
                document.body.insertBefore(barHorizontalTemplate, customerRootElement.nextElementSibling);

                var barVerticalTemplate = document.createElement("DIV");
                barVerticalTemplate.setAttribute("class", "navigationbar-vertical-template");
                barVerticalTemplate.setAttribute("data-win-control", "WinJS.Binding.Template");
                barVerticalTemplate.style.display = "none";
                var barVerticalItem = document.createElement("DIV");
                barVerticalItem.setAttribute("class", "navigationbar-item navigationbar-vertical-item win-type-subtitle");
                var barVerticalText = document.createElement("DIV");
                barVerticalText.setAttribute("class", "navigationbar-text navigationbar-vertical-text");
                barVerticalText.setAttribute("data-win-bind", "style.display: disabled Binding.Converter.toDisplayNone");
                var barVerticalInnerText = document.createElement("SPAN");
                barVerticalInnerText.setAttribute("class", "navigationbar-inner-text");
                barVerticalInnerText.setAttribute("data-win-bind", "textContent: text");
                barVerticalText.appendChild(barVerticalInnerText);
                barVerticalItem.appendChild(barVerticalText);
                var barVerticalTextGray = document.createElement("DIV");
                barVerticalTextGray.setAttribute("class", "navigationbar-text navigationbar-vertical-text navigationbar-text-gray");
                barVerticalTextGray.setAttribute("data-win-bind", "style.display: disabled Binding.Converter.toDisplayNone");
                var barVerticalInnerTextGray = document.createElement("SPAN");
                barVerticalInnerTextGray.setAttribute("class", "navigationbar-inner-text");
                barVerticalInnerTextGray.setAttribute("data-win-bind", "textContent: text");
                barVerticalTextGray.appendChild(barVerticalInnerTextGray);
                barVerticalItem.appendChild(barVerticalTextGray);
                barVerticalTemplate.appendChild(barVerticalItem);
                document.body.insertBefore(barVerticalTemplate, barHorizontalTemplate.nextElementSibling);

                // App Header 
                var appHeader = document.createElement("DIV");
                appHeader.id = "headerhost";
                appHeader.setAttribute("class", "headerhost-container");
                document.body.insertBefore(appHeader, barVerticalTemplate.nextElementSibling);

                var splitView = document.createElement("DIV");
                splitView.id = "root-split-view";
                splitView.setAttribute("class", "win-splitview splitView");
                var splitViewContent = document.createElement("DIV");
                splitViewContent.setAttribute("class", "win-splitview-content");

                // Content area for Master + Page Navigationbar + Content 
                var masterhost = document.createElement("DIV");
                masterhost.id = "masterhost";
                masterhost.setAttribute("class", "masterhost-container");
                splitViewContent.appendChild(masterhost);

                // Page Navigationbar
                var barHorizontalContainer = document.createElement("DIV");
                barHorizontalContainer.setAttribute("class", "navigationbar-container navigationbar-container-horizontal");
                var barHorizontal = document.createElement("DIV");
                barHorizontal.id = "navigationbar_horizontal";
                barHorizontal.setAttribute("class", "win-selectionstylefilled navigationbar");
                barHorizontal.setAttribute("data-win-control", "WinJS.UI.ListView");
                barHorizontal.setAttribute("data-win-options", "{ itemDataSource: NavigationBar.data.dataSource,itemTemplate: select('.navigationbar-horizontal-template'),selectionMode: WinJS.UI.SelectionMode.single,tapBehavior: WinJS.UI.TapBehavior.directSelect,layout: { type: WinJS.UI.GridLayout } }");
                barHorizontalContainer.appendChild(barHorizontal);
                splitViewContent.appendChild(barHorizontalContainer);

                var barVerticalContainer = document.createElement("DIV");
                barVerticalContainer.setAttribute("class", "navigationbar-container navigationbar-container-vertical");
                var barVertical = document.createElement("DIV");
                barVertical.id = "navigationbar_vertical";
                barVertical.setAttribute("class", "win-selectionstylefilled navigationbar");
                barVertical.setAttribute("data-win-control", "WinJS.UI.ListView");
                barVertical.setAttribute("data-win-options", "{ itemDataSource: NavigationBar.data.dataSource,itemTemplate: select('.navigationbar-vertical-template'),selectionMode: WinJS.UI.SelectionMode.single,tapBehavior: WinJS.UI.TapBehavior.directSelect,layout: { type: WinJS.UI.ListLayout } }");
                barVerticalContainer.appendChild(barVertical);
                splitViewContent.appendChild(barVerticalContainer);

                // Page Content
                var contenthost = document.createElement("DIV");
                contenthost.id = "contenthost";
                contenthost.setAttribute("class", "contenthost-container");
                contenthost.setAttribute("data-win-control", "Application.PageControlNavigator");
                contenthost.setAttribute("data-win-options", "{home: Application.startPage}");
                splitViewContent.appendChild(contenthost);

                splitView.appendChild(splitViewContent);
                document.body.insertBefore(splitView, appHeader.nextElementSibling);

                // AppBar for Page Commands
                var appbar = document.createElement("DIV");
                appbar.id = "appbar";
                appbar.setAttribute("data-win-control", "WinJS.UI.AppBar");
                appbar.setAttribute("data-win-options", "{placement: 'bottom',closedDisplayMode: 'none'}");
                var dummyButton = document.createElement("BUTTON");
                dummyButton.id = "dummyButton";
                dummyButton.setAttribute("data-win-control", "WinJS.UI.AppBarCommand");
                dummyButton.style.display = "none";
                appbar.appendChild(dummyButton);
                document.body.appendChild(appbar);

                // Flyout for Alert / Confirm Boxes
                var alertFlyout = document.createElement("DIV");
                alertFlyout.id = "alertFlyout";
                alertFlyout.setAttribute("data-win-control", "WinJS.UI.Flyout");
                alertFlyout.style.display = "none";
                var alertText = document.createElement("DIV");
                alertText.id = "alertText";
                alertFlyout.appendChild(alertText);
                var okButton = document.createElement("BUTTON");
                okButton.id = "okButton";
                okButton.setAttribute("class", "win-button");
                okButton.setAttribute("data-win-res", "{textContent: 'flyout.ok'}");
                alertFlyout.appendChild(okButton);
                var cancelButton = document.createElement("BUTTON");
                cancelButton.id = "cancelButton";
                cancelButton.setAttribute("class", "win-button");
                cancelButton.setAttribute("data-win-res", "{textContent: 'flyout.cancel'}");
                alertFlyout.appendChild(cancelButton);
                document.body.appendChild(alertFlyout);
            }
        }
        function checkForDeviceReady() {
            window.setTimeout(function () {
                if (!document.body || typeof Application !== "object" || !Application.pageframe ||
                    !document.querySelector("#contenthost")) {
                    checkForDeviceReady();
                } else {
                    var event; // The custom event that will be created

                    if (document.createEvent) {
                        event = document.createEvent("HTMLEvents");
                        event.initEvent("deviceready", true, true);
                    } else {
                        event = document.createEventObject();
                        event.eventType = "deviceready";
                    }
                    event.eventName = "deviceready";

                    if (document.dispatchEvent) {
                        document.dispatchEvent(event);
                    } else {
                        document.fireEvent("on" + event.eventType, event);
                    }
                }
            }, 20);
        }

        // WinJS references 
        include("lib/WinJS/scripts/base.min.js").then(function() {
            return include("lib/WinJS/scripts/ui.js");
        }).then(function() {
            return include("lib/jquery/scripts/jquery.min.js");
        }).then(function() {
            return include("lib/jquery/scripts/jquery-ui.min.js");
        }).then(function() {
            return include("lib/moment/scripts/moment-with-locales.min.js");
        }).then(function () {
            return include("lib/moment/scripts/moment-timezone-with-data-10-year-range.js");
        }).then(function() {
            return include("lib/ics/ics.js");
        }).then(function () {
            return include("lib/FileSaver/scripts/FileSaver.js");
        }).then(function () {
            return include("lib/blob/Blob.js");
        }).then(function() {
            return include("lib/convey/scripts/logging.js");
        }).then(function() {
            return include("lib/convey/scripts/winjs-es6promise.js");
        }).then(function() {
            return include("lib/convey/scripts/inertia.js");
        }).then(function() {
            return include("lib/convey/scripts/strings.js");
        }).then(function() {
            return include("lib/convey/scripts/sqlite.js");
        }).then(function() {
            return include("lib/convey/scripts/appSettings.js");
        }).then(function() {
            return include("lib/convey/scripts/replService.js");
        }).then(function() {
            return include("lib/convey/scripts/dbinit.js");
        }).then(function() {
            return include("lib/convey/scripts/dataService.js");
        }).then(function() {
            return include("lib/convey/scripts/colors.js");
        }).then(function() {
            return include("lib/convey/scripts/navigator.js");
        }).then(function() {
            return include("lib/convey/scripts/appbar.js");
        }).then(function() {
            return include("lib/convey/scripts/pageFrame.js");
        }).then(function() {
            return include("lib/convey/scripts/pageController.js");
        }).then(function() {
            return include("lib/convey/scripts/fragmentController.js");
        }).then(function() {
            return include("scripts/generalData.js");
        }).then(function () {
            createRootElement();
            return include("scripts/index.js");
        }).then(function() {
            checkForDeviceReady();
            Application.baseHref = newBaseHref;
        });
    }

    var prevChildCount = 0;
    function waitForCallerPageCompletion() {
        if (document.body.childElementCount !== prevChildCount) {
            prevChildCount = document.body.childElementCount;
            window.setTimeout(function() { waitForCallerPageCompletion(); }, 20);
            return false;
        } else {
            loadAppIntoRootElement();
            return true;
        }
    }

    function checkForRootElement() {
        if (!document.querySelector("#"+rootElementId)) {
            //cancel processing if no root element present!
            return;
        }
        waitForCallerPageCompletion();
    }

    var prevOnLoadHandler = window.onload;
    window.onload = function(event) {
        if (typeof prevOnLoadHandler === "function") {
            prevOnLoadHandler(event);
        }
        checkForRootElement();
    }
})();
