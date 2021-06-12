// controller for page: events
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/events/eventsService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Events", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Events.Controller.");

            if (Application.query && Application.query.eventSeriesId) {
                Events._eventSeriesId = Application.query.eventSeriesId;
            } else {
                Events._eventSeriesId = AppData.getRecordId("MandantSerie");
            }

            // ListView control
            var listView = pageElement.querySelector("#events.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                dataText: {
                    ser_text_name_h1: "",
                    ser_text_subtitle_h2: "",
                    ser_text_free_body: ""
                },
                dataDoc: {
                     ser_doc: ""
                },
                dataDocText: {},
                count: 0
            }, commandList, false, Events.eventView, null, listView]);

            var that = this;

            this.dispose = function() {
                if (listView && listView.winControl) {
                    listView.winControl.itemDataSource = null;
                }
            }

            var progress = null;
            var counter = null;
            var layout = null;

            if (listView && listView.winControl) {
                layout = new Application.EventListLayout.EventsLayout;
                listView.winControl.layout = {
                    type: layout,
                    orientation: WinJS.UI.Orientation.vertical
                };
            }

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            var resultConverter = function(item, index) {
                Log.call(Log.l.trace, "Events.Controller.");
                item.dataText = getEmptyDefaultValue(Events.textView.defaultValue);
                item.dataText.done = false;
                item.dataDoc = getEmptyDefaultValue(Events.docView.defaultValue);
                item.dataDoc.done = false;
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var setDataText = function (results, item) {
                Log.call(Log.l.trace, "Events.Controller.");
                var newDataText = getEmptyDefaultValue(Events.textView.defaultValue);
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        newDataText[row.LabelTitle] = row.Title ? row.Title : "";
                    }
                    if (row.LabelDescription) {
                        newDataText[row.LabelDescription] = row.Description ? row.Description : "";
                    }
                    if (row.LabelMainTitle) {
                        newDataText[row.LabelMainTitle] = row.MainTitle ? row.MainTitle : "";
                    }
                    if (row.LabelSubTitle) {
                        newDataText[row.LabelSubTitle] = row.SubTitle ? row.SubTitle : "";
                    }
                    if (row.LabelSummary) {
                        newDataText[row.LabelSummary] = row.Summary ? row.Summary : "";
                    }
                    if (row.LabelBody) {
                        newDataText[row.LabelBody] = row.Body ? row.Body : "";
                    }
                }
                if (item) {
                    item.dataText = newDataText;
                } else {
                    that.binding.dataText = newDataText;
                }
                Log.ret(Log.l.trace);
            }
            this.setDataText = setDataText;

            var setDataDoc = function (results, item) {
                Log.call(Log.l.trace, "Events.Controller.");
                var newDataDoc = getEmptyDefaultValue(Events.docView.defaultValue);
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle && row.DocFormat && row.DocContentDOCCNT1) {
                        var labelTitle = row.LabelTitle;
                        var labelWidth = labelTitle + "_width";
                        var labelHeight = labelTitle + "_height";
                        var docFormatInfo = AppData.getDocFormatInfo(row.DocFormat);
                        if (docFormatInfo) {
                            var imgSrcDataType = "data:" + docFormatInfo.mimeType + ";base64,";
                            var docContent = row.DocContentDOCCNT1;
                            if (docContent) {
                                var sub = docContent.search("\r\n\r\n");
                                if (sub >= 0) {
                                    var data = docContent.substr(sub + 4);
                                    if (data && data !== "null") {
                                        newDataDoc[labelTitle] = imgSrcDataType + data;
                                    } else {
                                        newDataDoc[labelTitle] = "";
                                    }
                                } else {
                                    newDataDoc[labelTitle] = "";
                                }
                            } else {
                                newDataDoc[labelTitle] = "";
                            }
                        } else {
                            newDataDoc[labelTitle] = "";
                        }
                        newDataDoc[labelWidth] = row.Width;
                        newDataDoc[labelHeight] = row.Height;
                    }
                }
                if (item) {
                    item.dataDoc = newDataDoc;
                } else {
                    that.binding.dataDoc = newDataDoc;
                }
                Log.ret(Log.l.trace);
            }
            this.setDataDoc = setDataDoc;

            var setDataDocText = function (results) {
                Log.call(Log.l.trace, "Events.Controller.");
                var newDataDocText = {};
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        newDataDocText[row.LabelTitle] = row.Title ? row.Title : "";
                    }
                    if (row.LabelDescription) {
                        newDataDocText[row.LabelDescription] = row.Description ? row.Description : "";
                    }
                    if (row.LabelMainTitle) {
                        newDataDocText[row.LabelMainTitle] = row.MainTitle ? row.MainTitle : "";
                    }
                    if (row.LabelSubTitle) {
                        newDataDocText[row.LabelSubTitle] = row.SubTitle ? row.SubTitle : "";
                    }
                    if (row.LabelSummary) {
                        newDataDocText[row.LabelSummary] = row.Summary ? row.Summary : "";
                    }
                    if (row.LabelBody) {
                        newDataDocText[row.LabelBody] = row.Body ? row.Body : "";
                    }
                }
                that.binding.dataDocText = newDataDocText;
                Log.ret(Log.l.trace);
            }
            this.setDataDocText = setDataDocText;

            var loadText = function () {
                Log.call(Log.l.trace, "Events.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select textView...");
                    return Events.textView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "textView: success!");
                        if (json && json.d) {
                            // now always edit!
                            that.setDataText(json.d.results);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadText = loadText;

            var loadTextDoc = function () {
                Log.call(Log.l.trace, "Events.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select textView...");
                    return Events.textDocView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "textView: success!");
                        if (json && json.d) {
                            // now always edit!
                            that.setDataDocText(json.d.results);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadTextDoc = loadTextDoc;

            var loadEventText = function (eventIds) {
                Log.call(Log.l.trace, "Events.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select textView...");
                    return Events.textView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "textView: success!");
                        if (json && json.d && json.d.results) {
                            var results = [];
                            var eventId = 0;
                            var curScope = null;
                            for (var i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.VeranstaltungID) {
                                    if (eventId !== row.VeranstaltungID) {
                                        if (results.length > 0) {
                                            curScope = that.scopeFromRecordId(eventId);
                                            if (curScope && curScope.item && curScope.item.dataText) {
                                                that.setDataText(results, curScope.item);
                                                curScope.item.dataText.done = true;
                                                that.records.setAt(curScope.index, curScope.item);
                                            }
                                            results = [];
                                        }
                                        eventId = row.VeranstaltungID;
                                    }
                                    results.push(row);
                                }
                            }
                            if (results.length > 0) {
                                curScope = that.scopeFromRecordId(eventId);
                                if (curScope && curScope.item && curScope.item.dataText) {
                                    that.setDataText(results, curScope.item);
                                    curScope.item.dataText.done = true;
                                    that.records.setAt(curScope.index, curScope.item);
                                }
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, eventIds);
                }).then(function() {
                    return that.adjustContainerSize();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadEventText = loadEventText;

            var adjustContainerSize = function() {
                Log.call(Log.l.trace, "Events.Controller.");
                var i;
                var ret = new WinJS.Promise.as().then(function() {
                    if (listView) {
                        var headerHost = document.querySelector("#headerhost");
                        if (headerHost) {
                            var winHeaderContainer = listView.querySelector(".win-headercontainer");
                            var stickyHeader = headerHost.querySelector(".sticky-header-pinned-fixed");
                            if (stickyHeader && winHeaderContainer && winHeaderContainer.style) {
                                winHeaderContainer.style.marginTop = stickyHeader.clientHeight.toString() + "px";
                            }
                        }
                        var winSurface = listView.querySelector(".win-surface");
                        if (winSurface) {
                            var clientWidth = winSurface.clientWidth - 20;
                            var winGroupHeaderContainers = listView.querySelectorAll(".win-groupheadercontainer");
                            if (winGroupHeaderContainers) {
                                for (i = 0; i < winGroupHeaderContainers.length; i++) {
                                    var winGroupHeaderContainer = winGroupHeaderContainers[i];
                                    if (winGroupHeaderContainer && winGroupHeaderContainer.style) {
                                        winGroupHeaderContainer.style.width = clientWidth.toString() + "px";
                                        var winGroupHeader = winGroupHeaderContainer.querySelector(".group-header");
                                        if (winGroupHeader) {
                                            var heightGroupHeader = winGroupHeader.clientHeight + 40;
                                            winGroupHeaderContainer.style.height = heightGroupHeader.toString() + "px";
                                        }
                                    }
                                }
                            }
                            var winItemsContainers = listView.querySelectorAll(".win-itemscontainer");
                            if (winItemsContainers) {
                                for (i = 0; i < winItemsContainers.length; i++) {
                                    var winItemsContainer = winItemsContainers[i];
                                    if (winItemsContainer && winItemsContainer.style) {
                                        winItemsContainer.style.width = clientWidth.toString() + "px";
                                    }
                                }
                            }
                            var eventItems = listView.querySelectorAll(".event-item");
                            if (eventItems) {
                                var tilesPerRow = 4;
                                var margin = 15;
                                if (WinJS.Utilities.hasClass(pageElement, "view-size-biggest")) {
                                    tilesPerRow = 3;
                                }
                                if (WinJS.Utilities.hasClass(pageElement, "view-size-bigger")) {
                                    tilesPerRow = 2;
                                }
                                if (WinJS.Utilities.hasClass(pageElement, "view-size-medium")) {
                                    margin = 10;
                                }
                                if (WinJS.Utilities.hasClass(pageElement, "view-size-medium-small")) {
                                    tilesPerRow = 1;
                                }
                                var tileWidth = clientWidth / tilesPerRow - 2*margin;
                                for (i = 0; i < eventItems.length; i++) {
                                    var eventItem = eventItems[i];
                                    if (eventItem && eventItem.style) {
                                        eventItem.style.width = tileWidth.toString() + "px";
                                    }
                                }
                            }
                        }
                    }
                    return WinJS.Promise.timeout(1000);
                }).then(function () {
                    Application.navigator._resized();
                    return WinJS.Promise.timeout(50);
                }).then(function () {
                    if (listView) {
                        var headerHost = document.querySelector("#headerhost");
                        var viewPort = listView.querySelector(".win-viewport");
                        if (viewPort && headerHost) {
                            var firstElementChild = headerHost.firstElementChild;
                            while (firstElementChild) {
                                var styles = getComputedStyle(firstElementChild);
                                if (styles && styles.getPropertyValue("position") === "fixed") {
                                    if (firstElementChild.style) {
                                        var scrollBarWidth = viewPort.offsetWidth - viewPort.clientWidth;
                                        var maxWidth = "calc(100% - " + (firstElementChild.offsetLeft + scrollBarWidth).toString() + "px)";
                                        firstElementChild.style.maxWidth = maxWidth;
                                    }
                                    break;
                                }
                                firstElementChild = firstElementChild.firstElementChild;
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.adjustContainerSize = adjustContainerSize;

            var loadDoc = function () {
                Log.call(Log.l.trace, "Events.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select docView...");
                    return Events.docView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "docView: success!");
                        if (json && json.d) {
                            // now always edit!
                            that.setDataDoc(json.d.results);
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadDoc = loadDoc;

            var loadEventDocs = function (eventIds) {
                Log.call(Log.l.trace, "Events.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select docView...");
                    return Events.docView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "docView: success!");
                        if (json && json.d && json.d.results) {
                            var results = [];
                            var eventId = 0;
                            var curScope = null;
                            for (var i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.VeranstaltungID) {
                                    if (eventId !== row.VeranstaltungID) {
                                        if (results.length > 0) {
                                            curScope = that.scopeFromRecordId(eventId);
                                            if (curScope && curScope.item && curScope.item.dataDoc) {
                                                that.setDataDoc(results, curScope.item);
                                                curScope.item.dataDoc.done = true;
                                                that.records.setAt(curScope.index, curScope.item);
                                            }
                                            results = [];
                                        }
                                        eventId = row.VeranstaltungID;
                                    }
                                    results.push(row);
                                }
                            }
                            if (results.length > 0) {
                                curScope = that.scopeFromRecordId(eventId);
                                if (curScope && curScope.item && curScope.item.dataDoc) {
                                    that.setDataDoc(results, curScope.item);
                                    curScope.item.dataDoc.done = true;
                                    that.records.setAt(curScope.index, curScope.item);
                                }
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, eventIds);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadEventDocs = loadEventDocs;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Events.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickHome: function(event) {
                    Log.call(Log.l.trace, "Events.Controller.");
                    Application.navigateById("home", event);
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "Events.Controller.");
                    if (eventInfo && eventInfo.detail && that.records) {
                        Log.print(Log.l.trace, "itemIndex=" + eventInfo.detail.itemIndex);
                        var item = that.records.getAt(eventInfo.detail.itemIndex);
                        if (item && item.VeranstaltungVIEWID) {
                            if (Application.query) {
                                Application.query.eventId = item.VeranstaltungVIEWID;
                            } else {
                                AppData.setRecordId("Veranstaltung", item.VeranstaltungVIEWID);
                            }
                            Application.navigateById("event", eventInfo);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Events.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.single) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.single;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.directSelect) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.directSelect;
                        }
                        // Double the size of the buffers on both sides
                        if (!maxLeadingPages) {
                            maxLeadingPages = listView.winControl.maxLeadingPages * 2;
                            listView.winControl.maxLeadingPages = maxLeadingPages;
                        }
                        if (!maxTrailingPages) {
                            maxTrailingPages = listView.winControl.maxTrailingPages * 2;
                            listView.winControl.maxTrailingPages = maxTrailingPages;
                        }
                        if (listView.winControl.loadingState === "itemsLoaded") {
                            that.adjustContainerSize();
                        } else if (listView.winControl.loadingState === "complete") {
                            if (that.loading) {
                                progress = listView.querySelector(".list-footer .progress");
                                counter = listView.querySelector(".list-footer .counter");
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                                that.loading = false;
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onHeaderVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Events.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Events.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        progress = listView.querySelector(".list-footer .progress");
                        counter = listView.querySelector(".list-footer .counter");
                        var visible = eventInfo.detail.visible;
                        if (visible && that.nextUrl) {
                            that.loading = true;
                            if (progress && progress.style) {
                                progress.style.display = "inline";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "none";
                            }
                            that.loadNext(function (json) {
                                // this callback will be called asynchronously
                                // when the response is available
                                Log.print(Log.l.trace, "loadNext: success!");
                            }, function (errorResponse) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                                AppData.setErrorMsg(that.binding, errorResponse);
                                if (progress && progress.style) {
                                    progress.style.display = "none";
                                }
                                if (counter && counter.style) {
                                    counter.style.display = "inline";
                                }
                            });
                        } else {
                            if (progress && progress.style) {
                                progress.style.display = "none";
                            }
                            if (counter && counter.style) {
                                counter.style.display = "inline";
                            }
                            that.loading = false;
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onScroll: function (event) {
                    Log.call(Log.l.u1, "Events.Controller.");
                    if (listView && listView.winControl) {
                        var headerHost = document.querySelector("#headerhost");
                        if (headerHost && headerHost.firstElementChild) {
                            if (listView.winControl.scrollPosition > 0) {
                                if (!WinJS.Utilities.hasClass(headerHost.firstElementChild,"sticky-scrolled")) {
                                    WinJS.Utilities.addClass(headerHost.firstElementChild, "sticky-scrolled");
                                }
                            } else {
                                if (WinJS.Utilities.hasClass(headerHost.firstElementChild,"sticky-scrolled")) {
                                    WinJS.Utilities.removeClass(headerHost.firstElementChild, "sticky-scrolled");
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.u1);
                }
            };

            // page command disable handler
            this.disableHandlers = {
                clickBack: function() {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            // add ListView event handler
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onLoadingStateChanged.bind(this));
                this.addRemovableEventListener(listView, "footervisibilitychanged", this.eventHandlers.onFooterVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "headervisibilitychanged", this.eventHandlers.onHeaderVisibilityChanged.bind(this));
                this.addRemovableEventListener(listView, "iteminvoked", this.eventHandlers.onItemInvoked.bind(this));
                var viewPort = listView.querySelector(".win-viewport");
                if (viewPort) {
                    this.addRemovableEventListener(viewPort, "scroll", this.eventHandlers.onScroll.bind(this));
                }
            }

            Events.afterSelectEventViewHook = function(json) {
                Log.call(Log.l.trace, "Events.Controller.");
                if (that.records) {
                    var eventIdsText = [];
                    var eventIdsDocs = [];
                    for (var i = 0; i < that.records.length; i++) {
                        var record = that.records.getAt(i);
                        if (record && typeof record === "object") {
                            if (record.dataText && !record.dataText.done) {
                                eventIdsText.push(record.VeranstaltungVIEWID);
                            }
                            if (record.dataDoc && !record.dataDoc.done) {
                                eventIdsDocs.push(record.VeranstaltungVIEWID);
                            }
                        }
                    }
                    if (eventIdsText.length > 0) {
                        that.loadEventText(eventIdsText);
                    }
                    if (eventIdsDocs.length > 0) {
                        that.loadEventDocs(eventIdsDocs);
                    }
                }
                Log.ret(Log.l.trace);
            }

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                that.loadText();
                that.loadDoc();
                that.loadTextDoc();
                that.loading = true;
                return that.loadData();
            }).then(function () {
                Application.showBodyContentBottom(pageElement, true);
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







