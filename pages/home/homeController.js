﻿// controller for page: home
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/home/homeService.js" />

(function () {
    "use strict";

    WinJS.Namespace.define("Home", {
        Controller: WinJS.Class.derive(Application.RecordsetController, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "Home.Controller.");

            if (Application.query && Application.query.eventStartId) {
                Home._eventStartId = Application.query.eventStartId;
            }

            // ListView control
            var listView = pageElement.querySelector("#events.listview");

            Application.RecordsetController.apply(this, [pageElement, {
                dataText: {
                    ov_text_h1: "",
                    ov_text_free_body: ""
                },
                dataDoc: {
                    ov_doc: ""
                },
                count: 0
            }, commandList, false, Home.eventView, null, listView]);

            this.recordsGrouped = null;

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
                layout = new Application.HomeListLayout.HomeLayout;
                listView.winControl.layout = {
                    type: layout,
                    orientation: WinJS.UI.Orientation.vertical
                };
            }

            var maxLeadingPages = 0;
            var maxTrailingPages = 0;

            // result-set returns non-unique recordIds!!!
            var allScopesFromRecordId = function (recordId) {
                var ret = [];
                Log.call(Log.l.trace, "Home.", "recordId=" + recordId);
                if (that.records && that.showView && recordId) {
                    var i, item = null;
                    for (i = 0; i < that.records.length; i++) {
                        var record = that.records.getAt(i);
                        if (record && typeof record === "object" &&
                            that.showView.getRecordId(record) === recordId) {
                            item = record;
                            ret.push({ index: i, item: item });
                        }
                    }
                    if (!ret.length) {
                        Log.print(Log.l.trace, "not found");
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.allScopesFromRecordId = allScopesFromRecordId;

            var allScopesFromSeriesId = function (seriesId) {
                var ret = [];
                Log.call(Log.l.trace, "Home.", "seriesId=" + seriesId);
                if (that.records && that.showView && seriesId) {
                    var i, item = null;
                    for (i = 0; i < that.records.length; i++) {
                        var record = that.records.getAt(i);
                        if (record && typeof record === "object" &&
                            record.MandantSerieID === seriesId) {
                            item = record;
                            ret.push({ index: i, item: item });
                        }
                    }
                    if (!ret.length) {
                        Log.print(Log.l.trace, "not found");
                    }
                }
                Log.ret(Log.l.trace, ret);
                return ret;
            }
            this.allScopesFromSeriesId = allScopesFromSeriesId;

            var resultConverter = function(item, index) {
                Log.call(Log.l.trace, "Home.Controller.");
                item.dataText = getEmptyDefaultValue(Home.textView.defaultValue);
                item.dataText.done = false;
                item.dataGroupText = getEmptyDefaultValue(Home.textView.defaultGroupValue);
                item.dataGroupText.done = false;
                item.dataDoc = getEmptyDefaultValue(Home.docView.defaultValue);
                item.dataDoc.done = false;
                item.dataGroupDoc = getEmptyDefaultValue(Home.docView.defaultGroupValue);
                item.dataGroupDoc.done = false;
                Log.ret(Log.l.trace);
            }
            this.resultConverter = resultConverter;

            var setDataText = function (results, item, isGroup) {
                Log.call(Log.l.trace, "Home.Controller.");
                var newDataText = isGroup ? 
                    getEmptyDefaultValue(Home.textView.defaultGroupValue) : 
                    getEmptyDefaultValue(Home.textView.defaultValue);
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
                    if (isGroup) {
                        item.dataGroupText = newDataText;
                    } else {
                        item.dataText = newDataText;
                    }
                } else {
                    that.binding.dataText = newDataText;
                }
                Log.ret(Log.l.trace);
            }
            this.setDataText = setDataText;

            var setDataDoc = function (results, item, isGroup) {
                Log.call(Log.l.trace, "Home.Controller.");
                var newDataDoc = isGroup ? 
                    getEmptyDefaultValue(Home.docView.defaultGroupValue) :
                    getEmptyDefaultValue(Home.docView.defaultValue);
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
                    if (isGroup) {
                        item.dataGroupDoc = newDataDoc;
                    } else {
                        item.dataDoc = newDataDoc;
                    }
                } else {
                    that.binding.dataDoc = newDataDoc;
                }
                Log.ret(Log.l.trace);
            }
            this.setDataDoc = setDataDoc;

            var loadText = function () {
                Log.call(Log.l.trace, "Home.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select textView...");
                    return Home.textView.select(function (json) {
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

            var loadEventText = function (eventIds) {
                var i, j, dataText;
                var eventId = 0;
                var curScopes, curScope = null;
                Log.call(Log.l.trace, "Event.Controller.");
                if (!eventIds || !eventIds.length) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return WinJS.Promise.as();
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    for (i = 0; i < eventIds.length; i++) {
                        eventId = eventIds[i];
                        curScopes = that.allScopesFromRecordId(eventId);
                        for (j = 0; j < curScopes.length; j++) {
                            curScope = curScopes[j];
                            if (curScope && curScope.item && curScope.item.dataText) {
                                curScope.item.dataText.done = true;
                                that.records.setAt(curScope.index, curScope.item);
                            }
                        }
                    }
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select textView...");
                    return Home.textView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "textView: success!");
                        if (json && json.d && json.d.results) {
                            var results = [];
                            eventId = 0;
                            curScope = null;
                            for (i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.VeranstaltungID) {
                                    if (eventId !== row.VeranstaltungID) {
                                        if (results.length > 0) {
                                            curScopes = that.allScopesFromRecordId(eventId);
                                            for (j = 0, dataText = null; j < curScopes.length; j++) {
                                                curScope = curScopes[j];
                                                if (curScope && curScope.item && curScope.item.dataText) {
                                                    if (!dataText) {
                                                        that.setDataText(results, curScope.item);
                                                        curScope.item.dataText.done = true;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                        dataText = curScope.item;
                                                    } else {
                                                        curScope.item.dataText = dataText;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                    }
                                                }
                                            }
                                            results = [];
                                        }
                                        eventId = row.VeranstaltungID;
                                    }
                                    results.push(row);
                                }
                            }
                            if (results.length > 0) {
                                curScopes = that.allScopesFromRecordId(eventId);
                                for (j = 0, dataText = null; j < curScopes.length; j++) {
                                                curScope = curScopes[j];
                                                if (curScope && curScope.item && curScope.item.dataText) {
                                                    if (!dataText) {
                                                        that.setDataText(results, curScope.item);
                                                        curScope.item.dataText.done = true;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                        dataText = curScope.item;
                                                    } else {
                                                        curScope.item.dataText = dataText;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                    }
                                                }
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
            this.loadEventText = loadEventText;

            var loadSeriesText = function (seriesIds) {
                var i, j, dataGroupText;
                var seriesId = 0;
                var curScopes, curScope = null;
                Log.call(Log.l.trace, "Event.Controller.");
                if (!seriesIds || !seriesIds.length) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return WinJS.Promise.as();
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    for (i = 0; i < seriesIds.length; i++) {
                        seriesId = seriesIds[i];
                        curScopes = that.allScopesFromSeriesId(seriesId);
                        for (j = 0; j < curScopes.length; j++) {
                            curScope = curScopes[j];
                            if (curScope && curScope.item && curScope.item.dataGroupText) {
                                curScope.item.dataGroupText.done = true;
                                that.records.setAt(curScope.index, curScope.item);
                            }
                        }
                    }
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select textView...");
                    return Home.textView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "textView: success!");
                        if (json && json.d && json.d.results) {
                            var results = [];
                            seriesId = 0;
                            curScope = null;
                            for (i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.MandantSerieID) {
                                    if (seriesId !== row.MandantSerieID) {
                                        if (results.length > 0) {
                                            curScopes = that.allScopesFromSeriesId(seriesId);
                                            for (j = 0, dataGroupText = null; j < curScopes.length; j++) {
                                                curScope = curScopes[j];
                                                if (curScope && curScope.item && curScope.item.dataGroupText) {
                                                    if (!dataGroupText) {
                                                        that.setDataText(results, curScope.item, true);
                                                        curScope.item.dataGroupText.done = true;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                        dataGroupText = curScope.item.dataGroupText;
                                                    } else {
                                                        curScope.item.dataGroupText = dataGroupText;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                    }
                                                }
                                            }
                                            results = [];
                                        }
                                        seriesId = row.MandantSerieID;
                                    }
                                    results.push(row);
                                }
                            }
                            if (results.length > 0) {
                                curScopes = that.allScopesFromSeriesId(seriesId);
                                for (j = 0, dataGroupText = null; j < curScopes.length; j++) {
                                    curScope = curScopes[j];
                                    if (curScope && curScope.item && curScope.item.dataGroupText) {
                                        if (!dataGroupText) {
                                            that.setDataText(results, curScope.item, true);
                                            curScope.item.dataGroupText.done = true;
                                            that.records.setAt(curScope.index, curScope.item);
                                            dataGroupText = curScope.item.dataGroupText;
                                        } else {
                                            curScope.item.dataGroupText = dataGroupText;
                                            that.records.setAt(curScope.index, curScope.item);
                                        }
                                    }
                                }
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, null, seriesIds);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadSeriesText = loadSeriesText;

            var loadDoc = function () {
                Log.call(Log.l.trace, "Home.Controller.");
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select docView...");
                    return Home.docView.select(function (json) {
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
                var i, j;
                var eventId = 0;
                var curScopes = null, curScope = null;
                Log.call(Log.l.trace, "Event.Controller.");
                if (!eventIds || !eventIds.length) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return WinJS.Promise.as();
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    for (i = 0; i < eventIds.length; i++) {
                        eventId = eventIds[i];
                        curScopes = that.allScopesFromRecordId(eventId);
                        for (j = 0; j < curScopes.length; j++) {
                            curScope = curScopes[j];
                            if (curScope && curScope.item && curScope.item.dataDoc) {
                                curScope.item.dataDoc.done = true;
                                that.records.setAt(curScope.index, curScope.item);
                            }
                        }
                    }
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select docView...");
                    return Home.docView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "docView: success!");
                        if (json && json.d && json.d.results) {
                            var results = [];
                            eventId = 0;
                            curScope = null;
                            for (var i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.VeranstaltungID) {
                                    if (eventId !== row.VeranstaltungID) {
                                        if (results.length > 0) {
                                            curScopes = that.allScopesFromRecordId(eventId);
                                            for (j = 0; j < curScopes.length; j++) {
                                                curScope = curScopes[j];
                                                if (curScope && curScope.item && curScope.item.dataDoc) {
                                                    that.setDataDoc(results, curScope.item);
                                                    curScope.item.dataDoc.done = true;
                                                    that.records.setAt(curScope.index, curScope.item);
                                                }
                                            }
                                            results = [];
                                        }
                                        eventId = row.VeranstaltungID;
                                    }
                                    results.push(row);
                                }
                            }
                            if (results.length > 0) {
                                curScopes = that.allScopesFromRecordId(eventId);
                                for (j = 0; j < curScopes.length; j++) {
                                    curScope = curScopes[j];
                                    if (curScope && curScope.item && curScope.item.dataDoc) {
                                        that.setDataDoc(results, curScope.item);
                                        curScope.item.dataDoc.done = true;
                                        that.records.setAt(curScope.index, curScope.item);
                                    }
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

            var loadSeriesDocs = function (seriesIds) {
                var i, j, dataGroupDoc;
                var seriesId = 0;
                var curScopes = null, curScope = null;
                Log.call(Log.l.trace, "Event.Controller.");
                if (!seriesIds || !seriesIds.length) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return WinJS.Promise.as();
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    for (i = 0; i < seriesIds.length; i++) {
                        seriesId = seriesIds[i];
                        curScopes = that.allScopesFromSeriesId(seriesId);
                        for (j = 0; j < curScopes.length; j++) {
                            curScope = curScopes[j];
                            if (curScope && curScope.item && curScope.item.dataGroupDoc) {
                                curScope.item.dataGroupDoc.done = true;
                                that.records.setAt(curScope.index, curScope.item);
                            }
                        }
                    }
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select docView...");
                    return Home.docView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "docView: success!");
                        if (json && json.d && json.d.results) {
                            var results = [];
                            seriesId = 0;
                            curScope = null;
                            for (var i = 0; i < json.d.results.length; i++) {
                                var row = json.d.results[i];
                                if (row && row.MandantSerieID) {
                                    if (seriesId !== row.MandantSerieID) {
                                        if (results.length > 0) {
                                            curScopes = that.allScopesFromSeriesId(seriesId);
                                            for (j = 0, dataGroupDoc = null; j < curScopes.length; j++) {
                                                curScope = curScopes[j];
                                                if (curScope && curScope.item && curScope.item.dataGroupDoc) {
                                                    if (!dataGroupDoc) {
                                                        that.setDataDoc(results, curScope.item, true);
                                                        curScope.item.dataGroupDoc.done = true;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                        dataGroupDoc = curScope.item.dataGroupDoc;
                                                    } else {
                                                        curScope.item.dataGroupDoc = dataGroupDoc;
                                                        that.records.setAt(curScope.index, curScope.item);
                                                    }
                                                }
                                            }
                                            results = [];
                                        }
                                        seriesId = row.MandantSerieID;
                                    }
                                    results.push(row);
                                }
                            }
                            if (results.length > 0) {
                                curScopes = that.allScopesFromRecordId(seriesId);
                                for (j = 0, dataGroupDoc = null; j < curScopes.length; j++) {
                                    curScope = curScopes[j];
                                    if (curScope && curScope.item && curScope.item.dataGroupDoc) {
                                        if (!dataGroupDoc) {
                                            that.setDataDoc(results, curScope.item, true);
                                            curScope.item.dataGroupDoc.done = true;
                                            that.records.setAt(curScope.index, curScope.item);
                                            dataGroupDoc = curScope.item.dataGroupDoc;
                                        } else {
                                            curScope.item.dataGroupDoc = dataGroupDoc;
                                            that.records.setAt(curScope.index, curScope.item);
                                        }
                                    }
                                }
                            }
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, null, seriesIds);
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadSeriesDocs = loadSeriesDocs;

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                onItemInvoked: function (eventInfo) {
                    Log.call(Log.l.trace, "Home.Controller.");
                    if (eventInfo && eventInfo.detail && that.records) {
                        Log.print(Log.l.trace, "itemIndex=" + eventInfo.detail.itemIndex);
                        var item = that.records.getAt(eventInfo.detail.itemIndex);
                        if (item && item.VeranstaltungVIEWID) {
                            if (Application.query) {
                                Application.query.eventID = item.VeranstaltungVIEWID;
                            } else {
                                AppData.setRecordId("Veranstaltung", item.VeranstaltungVIEWID);
                            }
                            Application.navigateById("event", eventInfo);
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Home.Controller.");
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
                            var indexOfFirstVisible = listView.winControl.indexOfFirstVisible;
                            var indexOfLastVisible = listView.winControl.indexOfLastVisible;
                            var eventIdsText = [];
                            var eventIdsDocs = [];
                            var seriesIdsText = [];
                            var seriesIdsDocs = [];
                            if (that.records) for (var i = indexOfFirstVisible; i <= indexOfLastVisible; i++) {
                                var record = that.records.getAt(i);
                                if (record && typeof record === "object") {
                                    if (record.dataText && !record.dataText.done) {
                                        eventIdsText.push(record.VeranstaltungVIEWID);
                                    }
                                    if (record.dataDoc && !record.dataDoc.done) {
                                        eventIdsDocs.push(record.VeranstaltungVIEWID);
                                    }
                                    if (record.dataGroupText && !record.dataGroupText.done &&
                                        seriesIdsText.indexOf(record.MandantSerieID) < 0) {
                                        seriesIdsText.push(record.MandantSerieID);
                                    }
                                    if (record.dataGroupDoc && !record.dataGroupDoc.done &&
                                        seriesIdsDocs.indexOf(record.MandantSerieID) < 0) {
                                        seriesIdsDocs.push(record.MandantSerieID);
                                    }
                                }
                            }
                            if (eventIdsText.length > 0) {
                                that.loadEventText(eventIdsText);
                            }
                            if (eventIdsDocs.length > 0) {
                                that.loadEventDocs(eventIdsDocs);
                            }
                            if (seriesIdsText.length > 0) {
                                that.loadSeriesText(seriesIdsText);
                            }
                            if (seriesIdsDocs.length > 0) {
                                that.loadSeriesDocs(seriesIdsDocs);
                            }
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
                    Log.call(Log.l.trace, "Home.Controller.");
                    if (eventInfo && eventInfo.detail) {
                        var visible = eventInfo.detail.visible;
                        if (visible) {
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onFooterVisibilityChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Home.Controller.");
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
            }

            // create grouped binding list in advance
            var groupIndex = function (item) {
                return (item && item.SerieSortierung) || 0;
            };

            var groupKey = function (item) {
                var index = groupIndex(item);
                // always return string!
                return index.toString();
            };

            var groupData = function (item) {
                if (item.dataGroupText && 
                    !item.dataGroupText.ser_text_name_h1 &&
                    item.SerieTitel) {
                    item.dataGroupText.ser_text_name_h1 = item.SerieTitel;
                }
                return item;
            };

            var groupSorter = function (left, right) {
                return groupIndex(left) - groupIndex(right);
            };

            that.records = new WinJS.Binding.List([]);
            that.recordsGrouped = that.records.createGrouped(groupKey, groupData, groupSorter);
            if (listView && listView.winControl) {
                listView.winControl.itemDataSource = that.recordsGrouped.dataSource;
                listView.winControl.groupDataSource = that.recordsGrouped.groups.dataSource;
            }

            // finally, load the data
            that.processAll().then(function() {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                that.loading = true;
                that.loadText();
                that.loadDoc();
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();







