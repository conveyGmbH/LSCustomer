// controller for page: speakerSession
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/lib/convey/scripts/pageController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/speakerSession/speakerSessionService.js" />

(function () {
    "use strict";

    var useSnapScroll = !!Application._useSnapScroll;
    var nav = WinJS.Navigation;

    WinJS.Namespace.define("SpeakerSession", {
        Controller: WinJS.Class.derive(Application.Controller, function Controller(pageElement, commandList) {
            Log.call(Log.l.trace, "SpeakerSession.Controller.");

            function isChildElement(parent, element) {
                if (parent && element) {
                    var childElement = parent.firstElementChild;
                    while (childElement) {
                        if (childElement === element) {
                            return true;
                        }
                        childElement = childElement.nextElementSibling;
                    }
                }
                return false;
            }
            if (Application.query && Application.query.eventId) {
                AppData.setRecordId("Veranstaltung", Application.query.eventId);
            }

            Application.Controller.apply(this, [pageElement, {
                showConference: false,
                eventId: AppData.getRecordId("Veranstaltung"),
                dataEvent: {},
                dataText: {},
                dataDoc: getEmptyDefaultValue(SpeakerSession.medienView.defaultValue),
                dataDocText: {}
            }, commandList]);

            var onScrollResizePromise = null;
            var contentArea = pageElement.querySelector(".contentarea");
            var magicStart = "&lt;!--";
            var magicStop = "--&gt;";

            var that = this;

            var setDataEvent = function (newDataEvent) {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                var prevNotifyModified = AppBar.notifyModified;
                AppBar.notifyModified = false;
                that.binding.dataEvent = newDataEvent;
                // convert Startdatum 
                that.binding.dataEvent.dateBegin = getDateObject(newDataEvent.Startdatum);
                that.binding.dataEvent.dateStartDatum = getDateObject(newDataEvent.LiveStartDatum);
                that.binding.dataEvent.dateEndDatum = getDateObject(newDataEvent.LiveEndDatum);
                if (AppData._persistentStates.registerData.dateBegin !== that.binding.dataEvent.dateBegin) {
                    AppData._persistentStates.registerData.dateBegin = that.binding.dataEvent.dateBegin;
                    Application.pageframe.savePersistentStates();
                }
                AppBar.modified = false;
                if (newDataEvent.VeranstaltungVIEWID && Application.query && window.history) {
                    var state = {};
                    var title = "";
                    Application.query.eventId = newDataEvent.VeranstaltungVIEWID;
                    var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                    window.history.replaceState(state, title, location);
                }
                AppBar.notifyModified = prevNotifyModified;
                AppBar.triggerDisableHandlers();
                Log.ret(Log.l.trace);
            };
            this.setDataEvent = setDataEvent;

            var setDataText = function (results) {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                var newDataText = {};
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
                that.binding.dataText = newDataText;
                Log.ret(Log.l.trace);
            }
            this.setDataText = setDataText;

            var setDataDoc = function (results) {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                var newDataDoc = getEmptyDefaultValue(SpeakerSession.medienView.defaultValue);
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    if (row.LabelTitle) {
                        if (row.DocContentDOCCNT1) {
                            var sub = row.DocContentDOCCNT1.search("\r\n\r\n");
                            if (sub >= 0) {
                                var data = row.DocContentDOCCNT1.substr(sub + 4);
                                if (data && data !== "null") {
                                    row.DocContentDOCCNT1 = "data:image/jpeg;base64," + data;
                                } else {
                                    row.DocContentDOCCNT1 = "";
                                }
                            } else {
                                row.DocContentDOCCNT1 = "";
                            }
                        } else {
                            row.DocContentDOCCNT1 = "";
                        }
                        newDataDoc[row.LabelTitle] = row.DocContentDOCCNT1 ? row.DocContentDOCCNT1 : "";
                    }
                }
                that.binding.dataDoc = newDataDoc;
                Log.ret(Log.l.trace);
            }
            this.setDataDoc = setDataDoc;

            var setDataDocText = function (results) {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
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

            // define handlers
            this.eventHandlers = {
                clickBack: function (event) {
                    Log.call(Log.l.trace, "SpeakerSession.Controller.");
                    if (WinJS.Navigation.canGoBack === true) {
                        WinJS.Navigation.back(1).done( /* Your success and error handlers */);
                    }
                    Log.ret(Log.l.trace);
                },
                clickHome: function (event) {
                    Log.call(Log.l.trace, "SpeakerSession.Controller.");
                    Application.navigateById("home", event);
                    Log.ret(Log.l.trace);
                },
                clickOk: function (event) {
                    Log.call(Log.l.trace, "SpeakerSession.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogin: function (event) {
                    Log.call(Log.l.trace, "SpeakerSession.Controller.");
                    that.doLogin(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                clickFacebookLogout: function (event) {
                    Log.call(Log.l.trace, "SpeakerSession.Controller.");
                    that.doLogout(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                },
                onScroll: function (event) {
                    Log.call(Log.l.u1, "SpeakerSession.Controller.");
                    if (contentArea) {
                        var headerHeight = 0;
                        var headerHost = document.querySelector("#headerhost");
                        if (headerHost && headerHost.firstElementChild) {
                            var stickyHeader = headerHost.querySelector(".sticky-header-pinned-fixed");
                            if (stickyHeader) {
                                headerHeight = stickyHeader.clientHeight;
                            }
                            if (contentArea.scrollTop > 0) {
                                if (!WinJS.Utilities.hasClass(headerHost.firstElementChild, "sticky-scrolled")) {
                                    WinJS.Utilities.addClass(headerHost.firstElementChild, "sticky-scrolled");
                                }
                            } else {
                                if (WinJS.Utilities.hasClass(headerHost.firstElementChild, "sticky-scrolled")) {
                                    WinJS.Utilities.removeClass(headerHost.firstElementChild, "sticky-scrolled");
                                }
                            }
                        }
                        if (useSnapScroll && !that.mouseDown) {
                            var content = null;
                            if (that.binding.showRecordedContent) {
                                content = contentArea.querySelector(".recordedContent-fragmenthost");
                            } else if (that.binding.showConference) {
                                content = contentArea.querySelector(".conference-fragmenthost");
                            }
                            if (content) {
                                var scrollTop = contentArea.scrollTop;
                                var offsetTop = scrollTop - (content.offsetTop - headerHeight);
                                if (Math.abs(offsetTop) < (content.offsetTop - headerHeight) / 2) {
                                    if (!that.inSnap) {
                                        that.inSnap = true;
                                        contentArea.scrollTop = offsetTop - (1.05 * offsetTop - offsetTop * offsetTop * offsetTop / 40000)/2 + content.offsetTop - headerHeight;
                                        Log.print(Log.l.trace, "scrollTop=" + scrollTop + " offsetTop=" + content.offsetTop + " => scrollTop=" + contentArea.scrollTop );
                                        that.noMomentumScroll = true;
                                        WinJS.Promise.timeout(5).then(function() {
                                            that.inSnap = false;
                                        });
                                    }
                                }
                            }
                        }
                        var pageControl = pageElement.winControl;
                        if (pageControl) {
                            pageControl.prevWidth = 0;
                            pageControl.prevHeight = 0;
                            pageControl.updateLayout.call(pageControl, pageElement);
                        }
                    }
                    if (onScrollResizePromise) {
                        onScrollResizePromise.cancel();
                    }
                    onScrollResizePromise = WinJS.Promise.timeout(20).then(function () {
                        var resizeEvent = document.createEvent('uievent');
                        resizeEvent.initEvent('resize', true, true);
                        window.dispatchEvent(resizeEvent);
                    });
                    Log.ret(Log.l.u1);
                },
                onTouchMove: function(event) {
                    Log.call(Log.l.u1, "SpeakerSession.Controller.");
                    if (event && that.noMomentumScroll) {
                        event.preventDefault();
                        WinJS.Promise.timeout(20).then(function() {
                            that.noMomentumScroll = false;
                        });
                    }
                    Log.ret(Log.l.u1);
                },
                onWheel: function(event) {
                    Log.call(Log.l.u1, "SpeakerSession.Controller.");
                    Log.print(Log.l.trace, "deltaMode=" + (event && event.deltaMode) + " deltaX=" + (event && event.deltaX) + " deltaY=" + (event && event.deltaY));
                    if (event && that.noMomentumScroll) {
                        event.preventDefault();
                        WinJS.Promise.timeout(20).then(function() {
                            that.noMomentumScroll = false;
                        });
                    }
                    Log.ret(Log.l.u1);
                },
                clickLogOffEvent: function (event) {
                    Log.call(Log.l.trace, "SpeakerSession.Controller.");
                    var logOffButton = pageElement.querySelector("#closeConnection");
                    // that.binding.registerEmail = AppData._persistentStates.registerData.Email;
                    // Email vom Moderator?!
                    var confirmTitle = getResourceText("event.labelLogOff") + " ";
                    confirm(confirmTitle, function (result) {
                        if (result) {
                            AppBar.busy = true;
                            Log.print(Log.l.trace, "clickLogOffEvent: user choice OK");
                            Application.navigateById("home");
                            that.binding.showLogOffEventMail = false;
                        } else {
                            Log.print(Log.l.trace, "clickDelete: user choice CANCEL");
                        }
                    }, logOffButton);
                    Log.ret(Log.l.trace);
                }
            };

            // page command disable handler
            this.disableHandlers = {
                clickBack: function () {
                    if (WinJS.Navigation.canGoBack === true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };

            var getFragmentByName = function (fragmentName) {
                var fragmentController;
                var ret = new WinJS.Promise.as().then(function () {
                    fragmentController = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath(fragmentName));
                    if (!fragmentController) {
                        var parentElement = pageElement.querySelector("#" + fragmentName + "host");
                        if (parentElement && that.binding.eventId) {
                            return Application.loadFragmentById(parentElement, fragmentName, { eventId: that.binding.eventId, dataEvent: that.binding.dataEvent });
                        } else {
                            return WinJS.Promise.as();
                        }
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (!fragmentController) {
                        var pageControl = pageElement.winControl;
                        if (pageControl) {
                            pageControl.prevWidth = 0;
                            pageControl.prevHeight = 0;
                            pageControl.updateLayout.call(pageControl, pageElement);
                        }
                        fragmentController = Application.navigator.getFragmentControlFromLocation(Application.getFragmentPath(fragmentName));
                    }
                    return fragmentController;
                });
                return ret;
            }
            this.getFragmentByName = getFragmentByName;

            var loadData = function () {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                var modToken;
                if (Application.query.UserToken) {
                    modToken = Application.query.UserToken;
                }
                AppData.setErrorMsg(that.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select eventView...");
                        return SpeakerSession.eventView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "eventView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataEvent(json.d);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select textView...");
                        return SpeakerSession.textView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "labelView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataText(json.d.results);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select medienView...");
                        return SpeakerSession.medienView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "labelView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataDoc(json.d.results);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    if (that.binding.eventId) {
                        //load of format relation record data
                        Log.print(Log.l.trace, "calling select medienTextView...");
                        return SpeakerSession.medienTextView.select(function (json) {
                            AppData.setErrorMsg(that.binding);
                            Log.print(Log.l.trace, "labelView: success!");
                            if (json && json.d) {
                                // now always edit!
                                that.setDataDocText(json.d.results);
                            }
                        }, function (errorResponse) {
                            AppData.setErrorMsg(that.binding, errorResponse);
                        }, that.binding.eventId);
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    return that.updateFragment();
                }).then(function (conferenceFragment) {
                    conferenceFragment.controller.setCommandMessageHandler("sessionEndRequested", function (param) {
                        var mediaContainer = pageElement.querySelector("#conference.mediaview #layout");
                        var meetingEndMessage = pageElement.querySelector(".meeting-end-message");
                        if (mediaContainer && meetingEndMessage && !isChildElement(mediaContainer, meetingEndMessage)) {
                            mediaContainer.appendChild(meetingEndMessage);
                        }
                        WinJS.Utilities.addClass(pageElement, "session-ended");
                    });
                }).then(function () {
                    AppBar.notifyModified = true;
                    return WinJS.Promise.timeout(1000);
                }).then(function () {
                    Application.navigator._resized();
                    return WinJS.Promise.timeout(50);
                }).then(function () {
                    return that.adjustContainerSize();
                });
                Log.ret(Log.l.trace);
                return ret;
            };
            this.loadData = loadData;

            var saveData = function (complete, error) {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                AppData.setErrorMsg(that.binding);
                //var location = window.location.href;
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;

            if (contentArea) {
                this.addRemovableEventListener(contentArea, "scroll", this.eventHandlers.onScroll.bind(this));
                if (useSnapScroll) {
                    this.addRemovableEventListener(contentArea, "touchmove", this.eventHandlers.onTouchMove.bind(this));
                    this.addRemovableEventListener(contentArea, "wheel", this.eventHandlers.onWheel.bind(this));
                }
            }

            var adjustContainerSize = function () {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                var ret = new WinJS.Promise.as().then(function () {
                    var headerHost = document.querySelector("#headerhost");
                    if (contentArea && headerHost) {
                        var stickyHeader = headerHost.querySelector(".sticky-header-pinned-fixed");
                        if (contentArea.style && stickyHeader) {
                            contentArea.style.paddingTop = stickyHeader.clientHeight.toString() + "px";
                        }
                        var firstElementChild = headerHost.firstElementChild;
                        while (firstElementChild) {
                            var styles = getComputedStyle(firstElementChild);
                            if (styles && styles.getPropertyValue("position") === "fixed") {
                                if (firstElementChild.style) {
                                    var scrollBarWidth = contentArea.offsetWidth - contentArea.clientWidth;
                                    var maxWidth = "calc(100% - " + (firstElementChild.offsetLeft + scrollBarWidth).toString() + "px)";
                                    firstElementChild.style.maxWidth = maxWidth;
                                }
                                break;
                            }
                            firstElementChild = firstElementChild.firstElementChild;
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.adjustContainerSize = adjustContainerSize;

            var updateFragment = function () {
                Log.call(Log.l.trace, "SpeakerSession.Controller.");
                var ret = that.getFragmentByName("conference");
                Log.ret(Log.l.trace);
                return ret;
            }
            this.updateFragment = updateFragment;

            // finally, load the data
            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete, now load data");
                return that.loadData();
            }).then(function () {
                Application.showBodyContentBottom(pageElement, true);
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();
