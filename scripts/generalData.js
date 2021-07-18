// general data services 
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/sqlite.js" />
/// <reference path="~/www/lib/convey/scripts/strings.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dbinit.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Application", {
        insertBodyContent: function(element, headerClassName, footerClassName) {
            Log.call(Log.l.trace, "AppData.", "headerClassName=" + headerClassName + " footerClassName=" + footerClassName);
            if (!element) {
                Log.ret(Log.l.error, "parent element not specified!");
                return;
            }
            var sibling,nextSibling;
            var listHeader = element.querySelector(headerClassName);
            if (listHeader) {
                var bodyContentTop = Application.navigator.pageElement &&
                    Application.navigator.pageElement.querySelector(".body-content-top");
                if (bodyContentTop) {
                    bodyContentTop.parentElement.removeChild(bodyContentTop);
                } else {
                    bodyContentTop = document.createElement("DIV");
                    bodyContentTop.setAttribute("class", "body-content-top");
                    var savedBodyContentTop = document.querySelector(".saved-body-content-top");
                    if (savedBodyContentTop) {
                        sibling = savedBodyContentTop.firstElementChild;
                        while (sibling) {
                            nextSibling = sibling.nextElementSibling;
                            var hasFixedChild = false;
                            var firstElementChild = sibling.firstElementChild;
                            while (firstElementChild) {
                                var styles = getComputedStyle(firstElementChild);
                                if (styles && styles.getPropertyValue("position") === "fixed") {
                                    hasFixedChild = true;
                                    break;
                                }
                                firstElementChild = firstElementChild.firstElementChild;
                            }
                            if (!hasFixedChild) {
                                savedBodyContentTop.removeChild(sibling);
                                bodyContentTop.appendChild(sibling);
                            }
                            sibling = nextSibling;
                        }
                    }
                }
                listHeader.insertBefore(bodyContentTop, listHeader.firstElementChild);
            }
            var listFooter = element.querySelector(footerClassName);
            if (listFooter) {
                var bodyContentBottom = Application.navigator.pageElement &&
                    Application.navigator.pageElement.querySelector(".body-content-bottom");
                if (bodyContentBottom) {
                    bodyContentBottom.parentElement.removeChild(bodyContentBottom);
                } else {
                    bodyContentBottom = document.createElement("DIV");
                    bodyContentBottom.setAttribute("class", "body-content-bottom");
                    var savedBodyContentBottom = document.querySelector(".saved-body-content-bottom");
                    if (savedBodyContentBottom) {
                        sibling = savedBodyContentBottom.firstElementChild;
                        while (sibling) {
                            nextSibling = sibling.nextElementSibling;
                            savedBodyContentBottom.removeChild(sibling);
                            bodyContentBottom.appendChild(sibling);
                            sibling = nextSibling;
                        }
                    }
                }
                listFooter.appendChild(bodyContentBottom);
            }
            Log.ret(Log.l.trace);
        },
        showBodyContentBottom: function(element, show) {
            Log.call(Log.l.trace, "AppData.", "show=" + show);
            if (!element) {
                Log.ret(Log.l.error, "parent element not specified!");
                return;
            }
            var bodyContentBottom = element.querySelector(".body-content-bottom");
            if (bodyContentBottom && bodyContentBottom.style) {
                bodyContentBottom.style.visibility = show ? "visible" : "hidden";
            }
            Log.ret(Log.l.trace);
        }
    });

    WinJS.Namespace.define("AppData", {
        getRecordId: function (relationName) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName);
            // check for initial values
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return null;
            }
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            }
            if (typeof AppData._persistentStates.allRecIds[relationName] === "undefined") {
                Log.ret(Log.l.trace, "undefined");
                return null;
            }
            var ret = typeof AppData._persistentStates.allRecIds[relationName] === "string" ? parseInt(AppData._persistentStates.allRecIds[relationName]) : AppData._persistentStates.allRecIds[relationName];
            Log.ret(Log.l.trace, ret);
            return ret;
        },
        setRecordId: function (relationName, newRecordId) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName + " newRecordId=" + newRecordId);
            // check for initial values
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return;
            }
            if (typeof AppData._persistentStates.allRecIds === "undefined") {
                AppData._persistentStates.allRecIds = {};
            }
            if (typeof AppData._persistentStates.allRecIds[relationName] === "undefined" ||
                !newRecordId || AppData._persistentStates.allRecIds[relationName] !== newRecordId) {
                AppData._persistentStates.allRecIds[relationName] = newRecordId;
                if (Application.pageframe) {
                    Application.pageframe.savePersistentStates();
                }
            }
            Log.ret(Log.l.trace);
        },
        getRestriction: function (relationName) {
            Log.call(Log.l.trace, "AppData.", "relationName=" + relationName);
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return null;
            }
            if (typeof AppData._persistentStates.allRestrictions === "undefined") {
                AppData._persistentStates.allRestrictions = {};
            }
            Log.ret(Log.l.trace);
            return AppData._persistentStates.allRestrictions[relationName];
        },
        setRestriction: function (relationName, newRestriction) {
            Log.call(Log.l.trace, ".", "relationName=" + relationName);
            if (!AppData._persistentStates) {
                Log.ret(Log.l.trace, "AppData._persistentStates undefined");
                return;
            }
            if (typeof AppData._persistentStates.allRestrictions === "undefined") {
                AppData._persistentStates.allRestrictions = {};
            }
            AppData._persistentStates.allRestrictions[relationName] = newRestriction;
            if (Application.pageframe) {
                Application.pageframe.savePersistentStates();
            }
            Log.ret(Log.l.trace);
        },
        generalData: {
            get: function () {
                var data = AppData._persistentStates;
                data.logTarget = Log.targets.console;
                data.setRecordId = AppData.setRecordId;
                data.getRecordId = AppData.getRecordId;
                data.setRestriction = AppData.setRestriction;
                data.getRestriction = AppData.getRestriction;
                return data;
            }
        },
        _customer: "",
        customer: {
            get: function() {
                Log.print(Log.l.trace, "customer=" + AppData._customer);
                return AppData._customer;
            },
            set: function(newCustomer) {
                AppData._customer = newCustomer;
                Log.print(Log.l.trace, "set new lsCustomer=" + AppData._customer);
            }
        },
        _customerId: "",
        customerId: {
            get: function() {
                Log.print(Log.l.trace, "customerId=" + AppData._customerId);
                return AppData._customerId;
            },
            set: function(newCustomerId) {
                AppData._customerId = newCustomerId;
                Log.print(Log.l.trace, "set new lsCustomer=" + AppData._customerId);
            }
        },
        getPropertyFromInitoptionTypeID: function (item) {
            Log.call(Log.l.u1, "AppData.");
            var color;
            var property = "";
            switch (item.INITOptionTypeID) {
                case 10:
                    item.colorPickerId = "individualColors";
                    property = item.colorPickerId;
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.individualColors = true;
                    } else if (AppData._persistentStates.individualColors) {
                        AppData._persistentStates.individualColors = false;
                        WinJS.Promise.timeout(0).then(function () {
                            AppData._persistentStates.colorSettings = copyByValue(AppData.persistentStatesDefaults.colorSettings);
                            var colors = new Colors.ColorsClass(AppData._persistentStates.colorSettings);
                            promise.then(function() {
                                AppBar.loadIcons();
                                NavigationBar.groups = Application.navigationBarGroups;
                            });
                        });
                    }
                    break;
                case 11:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "accentColor";
                        property = "accentColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 12:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "backgroundColor";
                        property = "backgroundColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 13:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "navigationColor";
                        property = "navigationColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 46:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "dashboardColor";
                        property = "dashboardColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 14:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "textColor";
                        property = "textColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 15:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "labelColor";
                        property = "labelColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 16:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "tileTextColor";
                        property = "tileTextColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 17:
                    if (AppData._persistentStates.individualColors) {
                        item.colorPickerId = "tileBackgroundColor";
                        property = "tileBackgroundColor";
                        if (!item.LocalValue && AppData.persistentStatesDefaults.colorSettings) {
                            color = AppData.persistentStatesDefaults.colorSettings[property];
                            item.LocalValue = color && color.replace("#", "");
                        }
                    }
                    break;
                case 18:
                    if (AppData._persistentStates.individualColors) {
                        if (item.LocalValue === "1") {
                            AppData._persistentStates.isDarkTheme = true;
                        } else {
                            AppData._persistentStates.isDarkTheme = false;
                        }
                        Colors.isDarkTheme = AppData._persistentStates.isDarkTheme;
                    }
                    break;
                case 19:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideCameraQuestionnaire = true;
                    } else {
                        AppData._persistentStates.hideCameraQuestionnaire = false;
                    }
                    break;
                case 20:
                    item.pageProperty = "questionnaire";
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideQuestionnaire = true;
                    } else {
                        AppData._persistentStates.hideQuestionnaire = false;
                    }
                    break;
                case 21:
                    item.pageProperty = "sketch";
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideSketch = true;
                    } else {
                        AppData._persistentStates.hideSketch = false;
                    }
                    break;
                case 23:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideBarcodeScan = true;
                    } else {
                        AppData._persistentStates.hideBarcodeScan = false;
                    }
                    break;
                case 24:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.hideCameraScan = true;
                    } else {
                        AppData._persistentStates.hideCameraScan = false;
                    }
                    break;
                case 30:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.productMailOn = true;
                    } else {
                        AppData._persistentStates.productMailOn = false;
                    }
                    break;
                case 31:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.thankYouMailOn = true;
                    } else {
                        AppData._persistentStates.thankYouMailOn = false;
                    }
                    break;
                case 34:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.privacyPolicySVGVisible = true;
                    } else {
                        AppData._persistentStates.privacyPolicySVGVisible = false;
                    }
                    break;
                case 35:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.nachbearbeitetFlagAutoSetToNull = true;
                    } else {
                        AppData._persistentStates.nachbearbeitetFlagAutoSetToNull = false;
                    }
                    break;
                case 38:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.showQRCode = true;
                    } else {
                        AppData._persistentStates.showQRCode = false;
                    }
                    break;
                case 39:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.showNameInHeader = true;
                    } else {
                        AppData._persistentStates.showNameInHeader = false;
                    }
                    break;
                case 44:
                    // Enable bzw. disable wird hier behandelt, da umgekehrte Logik mit Anzeigewert
                    if (parseInt(item.LocalValue) === 1 || parseInt(item.LocalValue) === 2) {
                        AppData._persistentStates.showvisitorFlow = parseInt(item.LocalValue);
                        /* NavigationBar.enablePage("visitorFlowDashboard");
                         NavigationBar.enablePage("visitorFlowEntExt");
                         NavigationBar.enablePage("employeeVisitorFlow");/*pagename muss wahrscheinlich nochmal geändert werden, jenachdem wie die seite heisst*/
                    } else {
                        AppData._persistentStates.showvisitorFlow = 0;
                        /*NavigationBar.disablePage("visitorFlowDashboard");
                        NavigationBar.disablePage("visitorFlowEntExt");
                        NavigationBar.disablePage("employeeVisitorFlow");*/
                    }
                    break;
                case 45:
                    if (item.LocalValue === "1") {
                        AppData._persistentStates.visitorFlowPremium = true;
                    } else {
                        AppData._persistentStates.visitorFlowPremium = false;
                    }
                    break;
                default:
                // defaultvalues
            }
            if (item.pageProperty) {
                if (item.LocalValue === "1") {
                    NavigationBar.disablePage(item.pageProperty);
                } else {
                    NavigationBar.enablePage(item.pageProperty);
                }
            }
            Log.ret(Log.l.u1, property);
            return property;
        },
        applyColorSetting: function (colorProperty, color) {
            Log.call(Log.l.u1, "AppData.", "colorProperty=" + colorProperty + " color=" + color);
            Colors[colorProperty] = color;
            switch (colorProperty) {
            case "accentColor":
            // fall through...
            case "navigationColor":
                AppBar.loadIcons();
                NavigationBar.groups = Application.navigationBarGroups;
                break;
            }
            Log.ret(Log.l.u1);
        },
        setSeoText: function (confirmStatus, dataText) {
            Log.call(Log.l.u1, "AppData.");
            var title = document.getElementsByTagName('title');
            var metas = document.getElementsByTagName('meta');

            // if confirmStatus === 'nach veranstaltung'
            if (confirmStatus && confirmStatus > 20) {
                for (var i = 0; i < title.length; i++) {
                    title[i].text = dataText.off_text_detail_title; //gesetzt ist text
                }
                for (var i = 0; i < metas.length; i++) {
                    if (metas[i].getAttribute('name')) {
                        var name = metas[i].getAttribute('name');
                        if (name === "description") {
                            //dataDocText.ev_text_detail_desc
                            metas[i].content = dataText.off_text_detail_descr;
                        }
                    }
                }
            } else {
                for (var i = 0; i < title.length; i++) {
                    title[i].text = dataText.ev_text_detail_title; //gesetzt ist text
                }
                for (var i = 0; i < metas.length; i++) {
                    if (metas[i].getAttribute('name')) {
                        var name = metas[i].getAttribute('name');
                        if (name === "description") {
                            //dataDocText.ev_text_detail_desc
                            metas[i].content = dataText.ev_text_detail_descr;
                        }
                    }
                }
            }

            Log.ret(Log.l.u1);
        },
        _initAnredeView: {
            get: function () {
                return AppData.getLgntInit("LGNTINITAnrede");
            }
        },
        initAnredeView: {
            select: function (complete, error, recordId) {
                Log.call(Log.l.trace, "AppData.initAnredeView.");
                var ret = AppData._initAnredeView.select(complete, error, recordId, { ordered: true, orderByValue: true });
                Log.ret(Log.l.trace);
                return ret;
            },
            getResults: function () {
                Log.call(Log.l.trace, "AppData.initAnredeView.");
                var ret = AppData._initAnredeView.results;
                Log.ret(Log.l.trace);
                return ret;
            },
            getMap: function () {
                Log.call(Log.l.trace, "AppData.initAnredeView.");
                var ret = AppData._initAnredeView.map;
                Log.ret(Log.l.trace);
                return ret;
            }
        }
    });

})();