﻿(function () {
    "use strict";

    window.rootElementId = "ls-customer-host";

    function loadApplication() {

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
                        var r = fnc() || include();
                        if (r && typeof r.setNext === "function" &&
                            n && typeof n.next === "function") {
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
            } else if (!fnc) {
                window.setTimeout(function() {
                    e.load();
                }, 0);
            }
            return e;
        };
        var includeJoined = function(values) {
            var e = include(null, function() {
                return include();
            });
            var pending = values.length;
            values.forEach(function(value) {
                value.then(function() {
                    if (--pending === 0) {
                        window.setTimeout(function() {
                            e.load();
                        }, 0);
                    }
                });
            });
            return e;
        }

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

        function saveBodyContent() {
            var customerElement = document.querySelector("#" + rootElementId);
            if (customerElement && customerElement.parentElement) {
                var mainBottomElement = null;
                var customerRootElement = customerElement;
                while (customerRootElement.parentElement && customerRootElement.parentElement !== document.body) {
                    if (customerRootElement.parentElement.parentElement === document.body && 
                        customerRootElement.nextElementSibling) {
                        var nextElementSibling = customerRootElement.nextElementSibling;
                        mainBottomElement = document.createElement(customerRootElement.parentElement.tagName);
                        if (mainBottomElement) while (nextElementSibling) {
                            mainBottomElement.appendChild(nextElementSibling);
                            nextElementSibling = nextElementSibling.nextElementSibling;
                        }
                    }
                    customerRootElement = customerRootElement.parentElement;
                }
                // save customer page content
                var bodyContentTop = document.createElement("DIV");
                bodyContentTop.setAttribute("class", "saved-body-content-top");
                var bodyContentBottom = document.createElement("DIV");
                bodyContentBottom.setAttribute("class", "saved-body-content-bottom");
                bodyContentBottom.setAttribute("style", "visibility: hidden");
                var nextBodyChild;
                var curBodyChild = document.body.firstElementChild;
                while (curBodyChild && curBodyChild !== customerRootElement) {
                    nextBodyChild = curBodyChild.nextElementSibling;
                    if (curBodyChild.tagName && 
                        curBodyChild.tagName.toLowerCase() !== "script" &&
                        curBodyChild.tagName.toLowerCase() !== "link") {
                        bodyContentTop.appendChild(curBodyChild);
                    }
                    curBodyChild = nextBodyChild;
                }
                if (mainBottomElement) {
                    bodyContentBottom.appendChild(mainBottomElement);
                }
                curBodyChild = customerRootElement.nextElementSibling;
                while (curBodyChild) {
                    nextBodyChild = curBodyChild.nextElementSibling;
                    if (curBodyChild.tagName && 
                        curBodyChild.tagName.toLowerCase() !== "script" &&
                        curBodyChild.tagName.toLowerCase() !== "link") {
                        bodyContentBottom.appendChild(curBodyChild);
                    }
                    curBodyChild = nextBodyChild;
                }
                document.body.insertBefore(bodyContentTop, customerRootElement);
                document.body.appendChild(bodyContentBottom);
                bodyContentTop.appendChild(customerRootElement);
            }
        }
        var extraPath = null;
        function extraStartup() {
            var customerElement = document.querySelector("#" + rootElementId);
            if (customerElement) {
                var data = getDataset(customerElement);
                if (data) {
                    if (typeof data.extra === "string" &&
                        typeof crc32 === "object") {
                        var extraCrc32 = crc32.compute(data.extra);
                        var extraCrc32Hex = extraCrc32.toString(16);
                        extraPath = "extra/" + extraCrc32Hex + "/";
                    }
                }
            }
            if (extraPath) {
                return include(extraPath + "scripts/startup.js");
            } else {
                saveBodyContent();
                return include();
            }
        }
        function createRootElement() {
            var customerElement = document.querySelector("#" + rootElementId);
            if (customerElement && customerElement.parentElement) {
                var data = getDataset(customerElement);
                if (data) {
                    AppData.customer = data.customer;
                    AppData.customerId = data.customerid;
                    AppData.onlinePath = data.onlinepath;
                    if (data.language) {
                        Application.language = data.language;
                    }
                    if (data.theme) {
                        Application.theme = data.theme;
                    }
                    if (typeof data.extra === "string") {
                        Application.extra = data.extra;
                    }
                    if (typeof extraPath === "string") {
                        Application.extraPath = extraPath;
                    }
                    Log.print(Log.l.info, "customer=" + AppData.customer + 
                        "customerId=" + AppData.customerId + 
                        " language=" + Application.language + 
                        " theme=" + Application.theme + 
                        " extra=" + Application.extra + 
                        " extraPath=" + Application.extraPath);
                }

                var customerRootElement = customerElement;
                while (customerRootElement.parentElement && customerRootElement.parentElement !== document.body) {
                    customerRootElement = customerRootElement.parentElement;
                }

                // Page-Navigationbar Templates
                var barHorizontalTemplate = document.createElement("DIV");
                barHorizontalTemplate.setAttribute("class", "navigationbar-horizontal-template");
                barHorizontalTemplate.setAttribute("data-win-control", "WinJS.Binding.Template");
                barHorizontalTemplate.style.display = "none";
                var barHorizontalItem = document.createElement("DIV");
                barHorizontalItem.setAttribute("class", "navigationbar-item navigationbar-horizontal-item win-type-subtitle");
                barHorizontalItem.setAttribute("data-win-bind", "disabled: disabled");
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
                barVerticalItem.setAttribute("data-win-bind", "disabled: disabled");
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
            if (newBaseHref &&
                typeof Application === "object" &&
                !Application.baseHref) {
                Application.baseHref = newBaseHref;
            }
            window.setTimeout(function () {
                if (!document.body || 
                    typeof Application !== "object" || 
                    !Application.pageframe ||
                    !AppData._persistentStates ||
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
        var js = [];
        var css = [];
        include("lib/crc32/scripts/crc32.js").then(function() {
            js.push(include("lib/WinJS/scripts/base.min.js"));
            js.push(extraStartup());
            return includeJoined(js);
        }).then(function() {
            js = [];
            js.push(include("lib/WinJS/scripts/ui.js"));
            js.push(include("lib/jquery/scripts/jquery.min.js"));
            js.push(include("lib/moment/scripts/moment-with-locales.min.js"));
            js.push(include("lib/ics/ics.js"));
            js.push(include("lib/FileSaver/scripts/FileSaver.js"));
            js.push(include("lib/blob/Blob.js"));
            return includeJoined(js);
        }).then(function() {
            js = [];
            js.push(include("lib/jquery/scripts/jquery-ui.min.js"));
            js.push(include("lib/convey/scripts/logging.js"));
            js.push(include("lib/convey/scripts/strings.js"));
            js.push(include("lib/convey/scripts/dbinit.js"));
            js.push(include("lib/convey/scripts/dataService.js"));
            js.push(include("lib/convey/scripts/navigator.js"));
            //js.push(include("lib/convey/scripts/sqlite.js")) not used here!;
            js.push(include("lib/convey/scripts/appSettings.js"));
            //js.push(include("lib/convey/scripts/replService.js")) not used here!;
            js.push(include("lib/convey/scripts/colors.js"));
            js.push(include("lib/convey/scripts/appbar.js"));
            js.push(include("lib/convey/scripts/pageFrame.js"));
            js.push(include("lib/convey/scripts/pageController.js"));
            js.push(include("lib/convey/scripts/fragmentController.js"));
            js.push(include("lib/convey/scripts/inertia.js"));
            js.push(include("lib/convey/scripts/winjs-es6promise.js"));
            js.push(include("lib/moment/scripts/moment-timezone-with-data-10-year-range.js"));
            js.push(include("lib/fontawesome/js/all.js"));
            js.push(include("lib/fontawesome/js/fontawesome.js"));
            js.push(include("lib/fontawesome/js/brands.min.js"));
            js.push(include("scripts/generalData.js"));
            return includeJoined(js);
        }).then(function () {
            css.push(Colors.loadCSSfile("lib/fontawesome/css/brands.css"));
            css.push(Colors.loadCSSfile("lib/fontawesome/css/solid.css"));
            css.push(Colors.loadCSSfile("lib/fontawesome/css/fontawesome.css"));
            return includeJoined(css);
        }).then(function () {
            createRootElement();
            return include("scripts/index.js");
        }).then(function() {
            checkForDeviceReady();
        });
    }

    var onLoadCalled = false;
    var loadApplicationCalled = false;
    var retryCounter = 50;
    function checkForRootElement() {
        window.setTimeout(function () {
            if (!loadApplicationCalled) {
                if (!document.querySelector("#" + rootElementId) ||
                    !(document.readyState === "complete")) {
                    //cancel processing if no root element present!
                    if (!onLoadCalled && --retryCounter > 0) {
                        checkForRootElement();
                    }
                    return;
                }
                loadApplicationCalled = true;
                loadApplication();
            }
        }, 50);
    }
    /*var prevOnLoadHandler = window.onload;
    window.onload = function (event) {
        onLoadCalled = true;
        if (typeof prevOnLoadHandler === "function") {
            prevOnLoadHandler(event);
        }
        checkForRootElement();
    }
    window.setTimeout(function () {
        checkForRootElement();
    }, 10);
    */
    document.addEventListener("readystatechange", function (event) {
        if (document.readyState === "complete") {
            checkForRootElement();
        }
    });
})();
