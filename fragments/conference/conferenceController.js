// controller for page: Conference
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/conference/conferenceService.js" />
var __meteor_runtime_config__;
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    var elementSelectors = {
        closeDesc: "#conference.mediaview button[aria-describedby=\"closeDesc\"]",
        restoreDesc: "#conference.mediaview .right--DUFDc button.lg--Q7ufB.buttonWrapper--x8uow.button--ZzeTUF"
    };

    var magicStart = "&lt;!--";
    var magicStop = "--&gt;";

    WinJS.Namespace.define("Conference", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Conference.Controller.", "eventId=" + (options && options.eventId));

            var videoListDefaults = {
                aspect: 4.0/3.0,
                width: 192,
                height: 144,
                left: "left",
                right: "right",
                default: "default",
                direction: null,
                videoListWidth: 0,
                videoListHeight: 0,
                closeDesc: null,
                restoreDesc: null,
                hideInactive: false,
                hideMuted: false,
                contentActivity: [],
                inactivityDelay: 7000,
                activeVideoCount: 0,
                mediaContainerObserver: null,
                videoListObserver: null,
                contentObserver: null
            };
            var userListDefaults = {
                show: true,
                onlyModerators: false,
                userListObserver: null,
                toggleBtnObserver: null,
                toggleUserList: null
            };

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataEvent: options ? options.dataEvent : {},
                dataConference: {
                    media: ""
                },
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText,
                showConference: false,
                showPresentation: true,
                showVideoList: true,
                labelShowPresentation: getResourceText("event.showPresentation"),
                labelShowVideoList: getResourceText("event.showVideoList"),
                labelOn: getResourceText("label.on"),
                labelOff: getResourceText("label.off")
            }, commandList]);

            var conference = fragmentElement.querySelector("#conference");
            var presenterButtonContainer = fragmentElement.querySelector(".modSession .presenter-button-container");
            var showPresentationToggleContainer = fragmentElement.querySelector(".show-presentation-toggle-container");
            var showVideoListToggleContainer = fragmentElement.querySelector(".show-videolist-toggle-container");

            this.sendResizePromise = null;
            this.showUserListPromise = null;
            this.adjustContentPositionsPromise = null;
            this.checkForInactiveVideoPromise = null;
            this.filterModeratorsPromise = null;
            this.observeToggleUserListBtnPromise = null;
            this.submitCommandMessagePromise = null;
            this.meetingDoc = null;
            this.commandQueue = [];
            this.deviceList = [];
            
            this.showUserListFailedCount = 0;
            this.adjustContentPositionsFailedCount = 0;

            var that = this;

            that.dispose = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (that.sendResizePromise) {
                    that.sendResizePromise.cancel();
                    that.sendResizePromise = null;
                }
                if (that.showUserListPromise) {
                    that.showUserListPromise.cancel();
                    that.showUserListPromise = null;
                }
                if (that.adjustContentPositionsPromise) {
                    that.adjustContentPositionsPromise.cancel();
                    that.adjustContentPositionsPromise = null;
                }
                if (that.checkForInactiveVideoPromise) {
                    that.checkForInactiveVideoPromise.cancel();
                    that.checkForInactiveVideoPromise = null;
                }
                if (that.filterModeratorsPromise) {
                    that.filterModeratorsPromise.cancel();
                    that.filterModeratorsPromise = null;
                }
                if (that.observeToggleUserListBtnPromise) {
                    that.observeToggleUserListBtnPromise.cancel();
                    that.observeToggleUserListBtnPromise = null;
                }
                if (that.submitCommandMessagePromise) {
                    that.submitCommandMessagePromise.cancel();
                    that.submitCommandMessagePromise = null;
                }
                conference = null;
                videoListDefaults = {};
                userListDefaults = {};
                Log.ret(Log.l.trace);
            }

            var forEach = function (arrayLikeValue, action) {
                for (var i = 0, l = arrayLikeValue.length; i < l; i++) {
                    action(arrayLikeValue[i], i);
                }
            };
            var head = document.head || document.getElementsByTagName("head")[0];
            var scripts = {};
            var styles = {};
            var links = {};
            var initialized = false;
            var cacheStore = {};
            var uniqueId = 1;
            var a = document.createElement("a");
            a.href = "/";

            var getScriptFromSrcXhr = function (href) {
                return WinJS.xhr({ url: href }).then(function (req) {
                    a.href = "/";
                    var reBase = "function rebase(url){if(!url||typeof url!=\"string\"||url.indexOf(\""+a.hostname+"\")>=0)return url;let p=url.indexOf(\"://\"),q=(p>=0)?url.substr(p+3).substr(url.substr(p+3).indexOf(\"/\")):url;return q};";
                    var newHostname = "(function(){return\"" + a.hostname + "\"})()";
                    var newHref = "(function(){return\"" + a.href + "\"})()";
                    var eGetImageUri = "let t=(function(){"+reBase+"let et=rebase(e.imageUri);Log.print(Log.l.info,\"et=\"+JSON.stringify(et));return et})(),n=e.svgWidth,r=e.svgHeight;";
                    var aGetImageUri = "s,u=(function(){"+reBase+"let au=rebase(a.imageUri);Log.print(Log.l.info,\"au=\"+JSON.stringify(au));return au})(),m=a.content;";
                    var uGetImageUri = "k,{imageUri:(function(){"+reBase+"let uu=rebase(u);Log.print(Log.l.info,\"uu=\"+JSON.stringify(uu));return uu})(),";
                    var scriptText = req.responseText
                        .replace(/window\.document\.location\.hostname/g, newHostname)
                        .replace(/window\.location\.hostname/g, newHostname)
                        .replace(/window\.location\.href/g, newHref)
                        .replace(/let\{imageUri:t,svgWidth:n,svgHeight:r\}=e;/g, eGetImageUri)
                        .replace(/s,\{imageUri:u,content:m\}=a;/g, aGetImageUri)
                        .replace(/k,\{imageUri:u,/g, uGetImageUri)
                        ;
                    return scriptText;
                });
            }

            var addScript = function(scriptTag, fragmentHref, position, lastNonInlineScriptPromise, target, isBody) {
                // We synthesize a name for inline scripts because today we put the
                // inline scripts in the same processing pipeline as src scripts. If
                // we seperated inline scripts into their own logic, we could simplify
                // this somewhat.
                //
                var src = scriptTag.src;
                var inline = !src;
                if (inline) {
                    src = fragmentHref + "script[" + position + "]";
                }
                src = src.toLowerCase();

                if (!(src in scripts)) {
                    var promise = null;

                    scripts[src] = true;
                    var n = document.createElement("script");
                    if (scriptTag.language) {
                        n.setAttribute("language", "javascript");
                    }
                    n.setAttribute("type", scriptTag.type);
                    n.setAttribute("async", "false");
                    if (scriptTag.id) {
                        n.setAttribute("id", scriptTag.id);
                    }
                    if (inline) {
                        var text = scriptTag.text;
                        promise = lastNonInlineScriptPromise.then(function() {
                            n.text = text;
                        }).then(null, function() {
                            // eat error
                        });
                    } else {
                        if (!isBody) {
                            promise = new WinJS.Promise(function(c) {
                                n.onload = n.onerror = function() {
                                    c();
                                };

                                // Using scriptTag.src to maintain the original casing
                                n.setAttribute("src", scriptTag.src);
                            });
                        } else {
                            promise = getScriptFromSrcXhr(scriptTag.src).then(function(scriptText) {
                                n.text = scriptText;
                            }).then(null, function() {
                                // eat error
                            });
                        }
                    }
                    if (target) {
                        target.appendChild(n);
                    } else {
                        head.appendChild(n);
                    }

                    return {
                        promise: promise,
                        inline: inline
                    };
                }
            }

            var addStyle = function (styleTag, fragmentHref, position) {
                var src = (fragmentHref + "script[" + position + "]").toLowerCase();
                if (!(src in styles)) {
                    styles[src] = true;
                    head.appendChild(styleTag.cloneNode(true));
                }
            }

            var addLink = function (styleTag) {
                var src = styleTag.href.toLowerCase();
                if (!(src in links)) {
                    links[src] = true;
                    var n = styleTag.cloneNode(false);

                    // Using scriptTag.href  to maintain the original casing
                    n.href = styleTag.href;
                    head.appendChild(n);
                }
            }
            var processDocument = function (href, state) {
                // Once the control's static state has been loaded in the temporary iframe,
                // this method spelunks the iframe's document to retrieve all relevant information. Also,
                // this performs any needed fixups on the DOM (like adjusting relative URLs).

                var cd = state.document;
                var h = cd.head;
                var b = cd.body;
                var sp = [];

                forEach(cd.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]'), addLink);
                forEach(cd.getElementsByTagName('style'), function (e, i) { addStyle(e, href, i); });

                // In DOCMODE 11 IE moved to the standards based script loading behavior of
                // having out-of-line script elements which are dynamically added to the DOM
                // asynchronously load. This raises two problems for our fragment loader,
                //
                //  1) out-of-line scripts need to execute in order
                //
                //  2) so do in-line scripts.
                //
                // In order to mitigate this behavior we do two things:
                //
                //  A) We mark all scripts with the attribute async='false' which makes
                //     out-of-line scripts respect DOM append order for execution when they
                //     are eventually retrieved
                //
                //  B) We chain the setting of in-line script element's 'text' property
                //     on the completion of the previous out-of-line script's execution.
                //     This relies on the fact that the out-of-line script elements will
                //     synchronously run their onload handler immediately after executing
                //     thus assuring that the in-line script will run before the next
                //     trailing out-of-line script.
                //
                var lastNonInlineScriptPromise = WinJS.Promise.as();
                state.headScripts = h.getElementsByTagName('script');
                forEach(state.headScripts, function (e, i) {
                    var result = addScript(e, href, i, lastNonInlineScriptPromise);
                    if (result) {
                        if (!result.inline) {
                            lastNonInlineScriptPromise = result.promise;
                        }
                        sp.push(result.promise);
                    }
                });

                forEach(b.getElementsByTagName('img'), function (e) { e.src = e.src; });
                forEach(b.getElementsByTagName('a'), function (e) {
                    // for # only anchor tags, we don't update the href
                    //
                    if (e.href !== "") {
                        var href = e.getAttribute("href");
                        if (href && href[0] !== "#") {
                            e.href = e.href;
                        }
                    }
                });

                // strip inline scripts from the body, they got copied to the
                // host document with the rest of the scripts above...
                //
                state.localScripts = [];
                var localScripts = b.getElementsByTagName("script");
                while (localScripts.length > 0) {
                    var s = localScripts[0];
                    state.localScripts.push(s);
                    s.parentNode.removeChild(s);
                }

                return WinJS.Promise.join(sp).then(function() {
                    // Create the docfrag which is just the body children
                    //
                    var fragment = document.createDocumentFragment();
                    var imported = document.importNode(cd.body, true);
                    while (imported.childNodes.length > 0) {
                        fragment.appendChild(imported.childNodes[0]);
                    }
                    state.docfrag = fragment;
                    return state;
                });
            }
            var initialize = function () {
                if (initialized) { return; }

                initialized = true;

                forEach(head.querySelectorAll("script"), function (e) {
                    scripts[e.src.toLowerCase()] = true;
                });


                forEach(head.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]'), function (e) {
                    links[e.href.toLowerCase()] = true;
                });
            }

            var getFragmentContentsXhr = function (href) {
                return WinJS.xhr({ url: href }).then(function (req) {
                    function abs(uri) {
                        a.href = uri;
                        return a.href;
                    }
                    var compatibilitySrc = '="' + abs("lib/compatibility/scripts");
                    var html5ClientSrc = '="' + abs("/html5client");
                    var wssBbWebRtcSfuSrc = "wss%3A%2F%2F" + a.host + "%2Fbbb-webrtc-sfu";
                    var httpsPadSrc = "https%3A%2F%2F" + a.host + "%2Fpad";
                    var html5Client = req.responseText
                        .replace(/="compatibility/g, compatibilitySrc)
                        .replace(/="\/html5client/g, html5ClientSrc)
                        .replace(/wss%3A%2F%2F[.a-z]+%2Fbbb-webrtc-sfu/g, wssBbWebRtcSfuSrc)
                        .replace(/https%3A%2F%2F[.a-z]+%2Fpad/g, httpsPadSrc)
                        ;
                    var pos = html5Client.indexOf("__meteor_runtime_config__");
                    if (pos > 0) {
                        pos = html5Client.indexOf("</script>", pos);
                        if (pos > 0) {
                            html5Client = html5Client.substr(0, pos) +
                                ";__meteor_runtime_config__.ROOT_URL = \"" + abs("/") + "\"" +
                                ";__meteor_runtime_config__.ROOT_URL_PATH_PREFIX = \"" + abs("/html5client") + "\"" +
                                html5Client.substr(pos);

                        }
                    }
                    return html5Client;
                });
            }
            var getFragmentContents = getFragmentContentsXhr;

            var populateDocument = function (state, href) {
                var htmlDoc = document.implementation.createHTMLDocument("frag");
                var base = htmlDoc.createElement("base");
                htmlDoc.head.appendChild(base);
                var anchor = htmlDoc.createElement("a");
                htmlDoc.body.appendChild(anchor);
                //base.href = document.location.href; // Initialize base URL to primary document URL
                anchor.setAttribute("href", href); // Resolve the relative path to an absolute path
                base.href = anchor.href; // Update the base URL to be the resolved absolute path
                // 'anchor' is no longer needed at this point and will be removed by the innerHTML call
                state.document = htmlDoc;
                return getFragmentContents(href).then(function (text) {
                    WinJS.Utilities.setInnerHTMLUnsafe(htmlDoc.documentElement, text);
                    htmlDoc.head.appendChild(base);
                });
            }

            var createEntry = function (state, href) {
                return populateDocument(state, href).
                    then(function () {
                        if (state.document) {
                            return processDocument(href, state);
                        } else {
                            return state;
                        }
                    }).
                    then(function () {
                        if (state.document) {
                            delete state.document;
                        }
                        return state;
                    });
            }

            var loadFromCache = function (href, removeFromCache) {
                var fragmentId = href.toLowerCase();
                var state = cacheStore[fragmentId];

                if (state) {
                    if (removeFromCache) {
                        delete cacheStore[fragmentId];
                    }
                    if (state.promise) {
                        return state.promise;
                    } else {
                        return WinJS.Promise.as(state);
                    }
                } else {
                    state = {};
                    if (!removeFromCache) {
                        cacheStore[fragmentId] = state;
                    }
                    var result = state.promise = createEntry(state, href);
                    state.promise.then(function () { delete state.promise; });
                    return result;
                }
            }

            var clearCache = function (href) {
                /// <signature helpKeyword="WinJS.UI.Fragments.clearCache">
                /// <summary locid="WinJS.UI.Fragments.clearCache">
                /// Removes any cached information about the specified fragment. This method does not unload any scripts
                /// or styles that are referenced by the fragment.
                /// </summary>
                /// <param name="href" type="String or DOMElement" locid="WinJS.UI.Fragments.clearCache_p:href">
                /// The URI that contains the fragment to be cleared. If no URI is provided, the entire contents of the cache are cleared.
                /// </param>
                /// </signature>

                if (!href) {
                    cacheStore = {};
                } else if (typeof (href) === "string") {
                    delete cacheStore[href.toLowerCase()];
                } else {
                    delete WinJS.Utilities.data(href).docFragment;
                    href.removeAttribute("data-win-hasfragment");
                }
            }

            var getStateRecord = function (href, removeFromCache) {
                if (typeof href === "string") {
                    return loadFromCache(href, removeFromCache);
                } else {
                    var state = {
                        docfrag: WinJS.Utilities.data(href).docFragment
                    };
                    if (!state.docfrag) {
                        var fragment = document.createDocumentFragment();
                        while (href.childNodes.length > 0) {
                            fragment.appendChild(href.childNodes[0]);
                        }
                        state.docfrag = WinJS.Utilities.data(href).docFragment = fragment;
                        href.setAttribute("data-win-hasfragment", "");
                    }
                    if (removeFromCache) {
                        clearCache(href);
                    }
                    return WinJS.Promise.as(state);
                }
            }

            var renderImpl = function (href, target, copy) {
                initialize();
                return getStateRecord(href, !copy).then(function (state) {
                    var frag = state.docfrag;
                    if (copy) {
                        frag = frag.cloneNode(true);
                    }

                    var child = frag.firstChild;
                    while (child) {
                        if (child.nodeType === 1 /*Element node*/) {
                            child.msParentSelectorScope = true;
                        }
                        child = child.nextSibling;
                    }

                    var retVal;
                    if (target) {
                        target.appendChild(frag);
                        if (state.localScripts) {
                            retVal = new WinJS.Promise.as().then(function() {
                                var sp = [];
                                var lastNonInlineScriptPromise = WinJS.Promise.as();
                                forEach(state.localScripts,
                                    function(e, i) {
                                        var result = addScript(e, href, state.headScripts.length + i, lastNonInlineScriptPromise, target, true);
                                        if (result) {
                                            if (!result.inline) {
                                                lastNonInlineScriptPromise = result.promise;
                                            }
                                            sp.push(result.promise);
                                        }
                                    });
                                return WinJS.Promise.join(sp);
                            }).then(function() {
                                return target;
                            });
                        } else {
                            retVal = target;
                        }
                    } else {
                        retVal = frag;
                    }
                    return retVal;
                });
            }

            var sendResize = function(delay) {
                if (that.sendResizePromise) {
                    that.sendResizePromise.cancel();
                }
                that.sendResizePromise = WinJS.Promise.timeout(delay || 0).then(function() {
                    var resizeEvent = document.createEvent('uievent');
                    resizeEvent.initEvent('resize', true, true);
                    window.dispatchEvent(resizeEvent);
                });
            }
            that.sendResize = sendResize;

            var filterModerators = function(addedNodes) {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (that.filterModeratorsPromise) {
                    that.filterModeratorsPromise.cancel();
                    that.filterModeratorsPromise = null;
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return;
                }
                var userList = fragmentElement.querySelector(".userList--11btR3");
                if (userList) {
                    var moderatorCount = 0;
                    var userListColumn = userList.querySelector(".userListColumn--6vKQL");
                    if (userListColumn) {
                        var participantsList = userListColumn.querySelectorAll(".participantsList--1MvMwF");
                        if (participantsList) {
                            for (var i = participantsList.length - 1; i >= 0; i--) {
                                var participantsListEntry = participantsList[i];
                                if (participantsListEntry && !participantsListEntry.querySelector(".moderator--24bqCT")) {
                                    try {
                                        participantsListEntry.parentNode.removeChild(participantsListEntry);
                                    } catch (ex) {
                                        Log.print(Log.l.trace, "participantsList[" + i + "] is not a child entry of userList");
                                    }
                                } else {
                                    moderatorCount++;
                                }
                            }
                        }
                        var h2 = userListColumn.querySelector("h2");
                        if (h2) {
                            h2.textContent = getResourceText("event.moderators") + " (" + moderatorCount + ")";
                        }
                        var participantsListParent = userListColumn.querySelector(".list--Z2pj65C");
                        if (participantsListParent && participantsListParent.firstElementChild) {
                            userListDefaults.userListObserver = new MutationObserver(function(mutationList, observer) {
                                WinJS.Promise.timeout(0).then(function() {
                                    mutationList.forEach(function(mutation) {
                                        if (mutation.type === "childList") {
                                            that.filterModerators(mutation.addedNodes);
                                        }
                                    });
                                });
                            });
                            if (userListDefaults.userListObserver) {
                                userListDefaults.userListObserver.observe(participantsListParent.firstElementChild, {
                                    childList: true
                                });
                            }
                        }
                    }
                } else {
                    that.filterModeratorsPromise = WinJS.Promise.timeout(500).then(function() {
                        that.filterModerators();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.filterModerators = filterModerators;

            var clickToggleUserList = function(event) {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (userListDefaults.userListObserver) {
                    userListDefaults.userListObserver.disconnect();
                }
                var userList = fragmentElement.querySelector(".userList--11btR3");
                if (typeof userListDefaults.toggleUserList === "function") {
                    userListDefaults.toggleUserList(event);
                }
                if (userListDefaults.onlyModerators && !userList) {
                    that.filterModeratorsPromise = WinJS.Promise.timeout(250).then(function() {
                        that.filterModerators();
                    });
                }
                if (!that.adjustContentPositionsPromise) {
                    that.adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function() {
                        that.adjustContentPositions();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.clickToggleUserList = clickToggleUserList;

            var observeToggleUserListBtn = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (that.observeToggleUserListBtnPromise) {
                    that.observeToggleUserListBtnPromise.cancel();
                    that.observeToggleUserListBtnPromise = null;
                }
                var btnToggleUserList = fragmentElement.querySelector(".btn--Z25OApd");
                if (btnToggleUserList) {
                    if (!userListDefaults.toggleBtnObserver) {
                        userListDefaults.toggleBtnObserver = new MutationObserver(function(mutationList, observer) {
                            userListDefaults.toggleBtnObserver.disconnect();
                            WinJS.Promise.timeout(250).then(function() {
                                that.observeToggleUserListBtn();
                            });
                        });
                    }
                    if (userListDefaults.toggleBtnObserver) {
                        userListDefaults.toggleBtnObserver.observe(btnToggleUserList.parentNode, {
                            childList: true
                        });
                    }
                    userListDefaults.toggleUserList = btnToggleUserList.onclick;
                    btnToggleUserList.onclick = that.clickToggleUserList;
                } else {
                    that.observeToggleUserListBtnPromise = WinJS.Promise.timeout(250).then(function() {
                        that.observeToggleUserListBtn();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.observeToggleUserListBtn = observeToggleUserListBtn;

            var showUserList = function(show, onlyModerators) {
                var ret = null;
                Log.call(Log.l.trace, "Conference.Controller.", "show="+show+" onlyModerators="+onlyModerators);
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return ret;
                }
                if (typeof show === "undefined") {
                    show = userListDefaults.show;
                } else {
                    userListDefaults.show = show;
                }
                if (typeof onlyModerators === "undefined") {
                    onlyModerators = userListDefaults.onlyModerators;
                } else {
                    userListDefaults.onlyModerators = onlyModerators;
                }
                if (that.showUserListPromise) {
                    that.showUserListPromise.cancel();
                    that.showUserListPromise = null;
                }
                var btnToggleUserList = fragmentElement.querySelector(".btn--Z25OApd");
                if (btnToggleUserList) {
                    that.observeToggleUserListBtn();
                    var userList = fragmentElement.querySelector(".userList--11btR3");
                    if (userList) {
                        ret = true;
                        if (!show) {
                            btnToggleUserList.click();
                        }
                    } else {
                        ret = false;
                        if (show) {
                            btnToggleUserList.click();
                        }
                    }
                    if (onlyModerators) {
                        that.filterModerators();
                    } else {
                        if (that.filterModeratorsPromise) {
                            that.filterModeratorsPromise.cancel();
                            that.filterModeratorsPromise = null;
                        }
                    }
                }
                if (ret === null) {
                    that.showUserListFailedCount++;
                    Log.print(Log.l.trace, "not yet created - try later again! that.showUserListFailedCount=" + that.showUserListFailedCount);
                    that.showUserListPromise = WinJS.Promise.timeout(Math.min(that.showUserListFailedCount * 10,5000)).then(function() {
                        that.showUserList(show, onlyModerators);
                    });
                } else {
                    that.showUserListFailedCount = 0;
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.showUserList = showUserList;

            var clickRestoreDesc = function(event) {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (typeof videoListDefaults.restoreDesc === "function") {
                    videoListDefaults.restoreDesc(event);
                }
                WinJS.Promise.as().then(function() {
                    if (!that.adjustContentPositionsPromise) {
                        that.adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                            that.adjustContentPositions();
                        });
                    }
                    return WinJS.Promise.timeout(250);
                }).then(function () {
                    var closeDescButton = fragmentElement.querySelector(elementSelectors.closeDesc);
                    if (closeDescButton) {
                        if (!videoListDefaults.closeDesc) {
                            videoListDefaults.closeDesc = closeDescButton.onclick;
                        }
                        closeDescButton.onclick = that.clickCloseDesc;
                    }
                    that.sendResize(20);
                });
                Log.ret(Log.l.trace);
            }
            that.clickRestoreDesc = clickRestoreDesc;

            var clickCloseDesc = function(event) {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (typeof videoListDefaults.closeDesc === "function") {
                    videoListDefaults.closeDesc(event);
                }
                WinJS.Promise.as().then(function() {
                    if (!that.adjustContentPositionsPromise) {
                        that.adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                            that.adjustContentPositions();
                        });
                    }
                    return WinJS.Promise.timeout(250);
                }).then(function () {
                    var restoreDescButton = fragmentElement.querySelector(elementSelectors.restoreDesc);
                    if (restoreDescButton) {
                        if (!videoListDefaults.restoreDesc) {
                            videoListDefaults.restoreDesc = restoreDescButton.onclick;
                        }
                        restoreDescButton.onclick = that.clickRestoreDesc;
                    }
                    that.sendResize(20);
                });
                Log.ret(Log.l.trace);
            }
            that.clickCloseDesc = clickCloseDesc;

            var onWheelSvg = function(event) {
                if (event) {
                    event.preventDefault();
                }
            }
            that.onWheelSvg = null;

            var adjustContentPositions = function() {
                var ret = null;
                var actionsBarRight = null;
                var direction = videoListDefaults.direction;
                Log.call(Log.l.trace, "Conference.Controller.", "direction="+direction);
                if (!direction) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return null;
                }
                if (that.adjustContentPositionsPromise) {
                    that.adjustContentPositionsPromise.cancel();
                    that.adjustContentPositionsPromise = null;
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return;
                }
                var videoPLayerOpened = false;
                var screenShareOpened = false;
                var presentationOpened = false;
                var videoPlayer = fragmentElement.querySelector(".videoPlayer--1MGUuy");
                if (videoPlayer && videoPlayer.firstElementChild) {
                    videoPLayerOpened = true;
                    var videoElement = videoPlayer.firstElementChild;
                    var fullScreenButton = null;
                    if (AppBar.scope.element && AppBar.scope.element.id === "eventController") {
                        // hide controls on event page!
                        if (videoElement.controls) {
                            videoElement.controls = false;
                        }
                        // add fullscreen button on event page!
                        fullScreenButton = videoPlayer.querySelector(".fullScreenButton--Z1bf0vj");
                        if (!fullScreenButton) {
                            var fullScreenButtonIcon = document.createElement("i");
                            fullScreenButtonIcon.setAttribute("class", "icon--2q1XXw icon-bbb-fullscreen");
                            fullScreenButtonIcon.content = "before";
                            var fullScreenButtonTooltip = document.createElement("span");
                            fullScreenButtonTooltip.setAttribute("class", "label--Z12LMR3 hideLabel--2vEtaU");
                            fullScreenButtonTooltip.textContent = getResourceText("tooltip.fullscreen");
                            fullScreenButtonIcon.appendChild(fullScreenButtonTooltip);
                            fullScreenButton = document.createElement("button");
                            fullScreenButton.setAttribute("class", "button--Z2dosza sm--Q7ujg default--Z19H5du button--Z1ops0C fullScreenButton--Z1bf0vj");
                            fullScreenButton.onclick = function(event) {
                                if (videoPlayer && document.fullscreenEnabled) {
                                    // detect fullscreen state
                                    if (videoPlayer.parentElement.querySelector(':fullscreen') === videoPlayer) {
                                        document.exitFullscreen();
                                    } else {
                                        videoPlayer.requestFullscreen();
                                    }
                                }
                            }
                            that.addRemovableEventListener(document, "fullscreenchange", function() {
                                if (videoPlayer && videoPlayer.firstElementChild &&
                                    fullScreenButtonIcon && fullScreenButtonIcon.firstElementChild) {
                                    if (document.fullscreenElement === videoPlayer) {
                                        if (WinJS.Utilities.hasClass(fullScreenButtonIcon, "icon-bbb-fullscreen")) {
                                            WinJS.Utilities.removeClass(fullScreenButtonIcon, "icon-bbb-fullscreen");
                                        }
                                        if (!WinJS.Utilities.hasClass(fullScreenButtonIcon, "icon-bbb-exit_fullscreen")) {
                                            WinJS.Utilities.addClass(fullScreenButtonIcon, "icon-bbb-exit_fullscreen");
                                        }
                                    } else {
                                        if (WinJS.Utilities.hasClass(fullScreenButtonIcon, "icon-bbb-exit_fullscreen")) {
                                            WinJS.Utilities.removeClass(fullScreenButtonIcon, "icon-bbb-exit_fullscreen");
                                        }
                                        if (!WinJS.Utilities.hasClass(fullScreenButtonIcon, "icon-bbb-fullscreen")) {
                                            WinJS.Utilities.addClass(fullScreenButtonIcon, "icon-bbb-fullscreen");
                                        }
                                    }
                                }
                            });
                            fullScreenButton.appendChild(fullScreenButtonIcon);
                            var fullScreenButtonWrapper = document.createElement("div");
                            fullScreenButtonWrapper.setAttribute("class", "wrapper--Z17x8k2 dark--Z1Y80Wt top--1p9eDv");
                            fullScreenButtonWrapper.appendChild(fullScreenButton);
                            videoPlayer.appendChild(fullScreenButtonWrapper);
                        }
                    }
                    if (videoElement.videoWidth && videoElement.videoHeight) {
                        var aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
                        var newLeft, newTop, newWidth, newHeight = videoPlayer.clientWidth / aspectRatio;
                        if (newHeight > videoPlayer.clientHeight) {
                            newHeight = videoPlayer.clientHeight;
                            newWidth = newHeight * aspectRatio;
                            newLeft = ((videoPlayer.clientWidth - newWidth) / 2);
                            newTop = 0;
                            videoElement.style.marginLeft = newLeft.toString() + "px";
                            videoElement.style.marginTop = newTop.toString() + "px";;
                        } else {
                            newWidth = videoPlayer.clientWidth;
                            newHeight = newWidth / aspectRatio;
                            newLeft = 0;
                            newTop = ((videoPlayer.clientHeight - newHeight) / 2);
                        }
                        videoElement.style.marginLeft = newLeft.toString() + "px";
                        videoElement.style.marginTop = newTop.toString() + "px";;
                        videoElement.style.width = newWidth.toString() + "px";
                        videoElement.style.height = newHeight.toString() + "px";
                        if (fullScreenButton &&
                            fullScreenButton.parentElement &&
                            fullScreenButton.parentElement.style) {
                            var fullScreenButtonLeft = newLeft + newWidth - fullScreenButton.parentElement.clientWidth;
                            fullScreenButton.parentElement.style.marginLeft = fullScreenButtonLeft.toString() + "px";
                            fullScreenButton.parentElement.style.marginTop = newTop.toString() + "px";
                        }
                    } else if (!that.adjustContentPositionsPromise) {
                        that.adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                            that.adjustContentPositions();
                        });
                    }
                }
                var screenshareContainer = fragmentElement.querySelector(".screenshareContainer--1GSmqo");
                if (screenshareContainer) {
                    screenShareOpened = true;
                }
                var svgContainer = fragmentElement.querySelector(".svgContainer--Z1z3wO0");
                if (svgContainer && svgContainer.firstElementChild) {
                    presentationOpened = true;
                    // prevent scrolling on zoom per mouse wheel!
                    if (AppBar.scope.element && AppBar.scope.element.id === "modSessionController") {
                        if (!that.onWheelSvg) {
                            that.onWheelSvg = onWheelSvg;
                            that.addRemovableEventListener(svgContainer.firstElementChild, "wheel", that.onWheelSvg.bind(that));
                        }
                        if (presenterButtonContainer && presenterButtonContainer.style) {
                            var navBarTopCenter = fragmentElement.querySelector(".navbar--Z2lHYbG .top--Z25OvN9 .center--2pV1iJ");
                            if (navBarTopCenter && navBarTopCenter.firstElementChild !== presenterButtonContainer) {
                                navBarTopCenter.insertBefore(presenterButtonContainer, navBarTopCenter.firstElementChild);
                                presenterButtonContainer.style.display = "inline-block";
                            }
                        }
                        if (showPresentationToggleContainer && showPresentationToggleContainer.style) {
                            actionsBarRight = fragmentElement.querySelector(".actionsbar--Z1mcyA0 .right--DUFDc");
                            if (actionsBarRight && actionsBarRight.firstElementChild !== showPresentationToggleContainer) {
                                actionsBarRight.insertBefore(showPresentationToggleContainer, actionsBarRight.firstElementChild);
                                showPresentationToggleContainer.style.display = "inline-block";
                            }
                        }
                    }
                }
                var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                if (mediaContainer) {
                    if (!videoListDefaults.mediaContainerObserver) {
                        videoListDefaults.mediaContainerObserver = new MutationObserver(function(mutationList, observer) {
                            Log.print(Log.l.trace, "mediaContainer childList changed!");
                            if (!that.adjustContentPositionsPromise) {
                                that.adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function() {
                                    that.adjustContentPositions();
                                });
                            }
                        });
                        videoListDefaults.mediaContainerObserver.observe(mediaContainer, {
                            childList: true
                        });
                    }
                    var content = mediaContainer.querySelector(".content--Z2gO9GE");
                    if (!videoListDefaults.contentObserver) {
                        videoListDefaults.contentObserver = new MutationObserver(function(mutationList, observer) {
                            Log.print(Log.l.trace, "content childList changed!");
                            if (!that.adjustContentPositionsPromise) {
                                that.adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function() {
                                    that.adjustContentPositions();
                                });
                            }
                        });
                        videoListDefaults.contentObserver.observe(content, {
                            childList: true
                        });
                    }
                    var overlayElement = mediaContainer.querySelector(".overlay--nP1TK, .hideOverlay--Z13uLxg, .video-overlay-left, .video-overlay-right, .video-overlay-top");
                    if (overlayElement) {
                        var overlayIsHidden = WinJS.Utilities.hasClass(overlayElement, "hideOverlay--Z13uLxg");
                        var videoList = mediaContainer.querySelector(".videoList--1OC49P");
                        if (videoList && videoList.style && overlayElement.style) {
                            if (AppBar.scope.element && AppBar.scope.element.id === "modSessionController") {
                                if (showVideoListToggleContainer && showVideoListToggleContainer.style) {
                                    actionsBarRight = fragmentElement.querySelector(".actionsbar--Z1mcyA0 .right--DUFDc");
                                    if (actionsBarRight && actionsBarRight.lastElementChild !== showVideoListToggleContainer) {
                                        actionsBarRight.appendChild(showVideoListToggleContainer);
                                        showVideoListToggleContainer.style.display = "inline-block";
                                    }
                                }
                            }
                            if (!videoListDefaults.videoListObserver) {
                                videoListDefaults.videoListObserver = new MutationObserver(function(mutationList, observer) {
                                    Log.print(Log.l.trace, "videoList childList changed!");
                                    if (!that.adjustContentPositionsPromise) {
                                        that.adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function() {
                                            that.adjustContentPositions();
                                        });
                                    }
                                });
                                videoListDefaults.videoListObserver.observe(videoList, {
                                    childList: true
                                });
                            }
                            ret = videoListDefaults.direction;
                            var numVideos;
                            if (videoListDefaults.hideInactive || videoListDefaults.hideMuted) {
                                numVideos = videoListDefaults.activeVideoCount;
                            } else {
                                numVideos = videoList.childElementCount;
                            }
                            var curChild = videoList.firstElementChild;
                            if (!content ||
                                direction === videoListDefaults.default ||
                                WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium") ||
                                !(videoPLayerOpened || screenShareOpened ||  presentationOpened && !overlayIsHidden)) {
                                if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-left");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-right");
                                }
                                if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-left")) {
                                    WinJS.Utilities.removeClass(overlayElement, "video-overlay-left");
                                }
                                if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-right")) {
                                    WinJS.Utilities.removeClass(overlayElement, "video-overlay-right");
                                }
                                if (!overlayIsHidden) {
                                    if (!WinJS.Utilities.hasClass(overlayElement, "overlay--nP1TK")) {
                                        WinJS.Utilities.addClass(overlayElement, "overlay--nP1TK");
                                    }
                                    if (numVideos > 1) {
                                        //if (!WinJS.Utilities.hasClass(overlayElement, "video-overlay-fullwidth")) {
                                        //    WinJS.Utilities.addClass(overlayElement, "video-overlay-fullwidth");
                                        //}
                                        if (WinJS.Utilities.hasClass(overlayElement, "autoWidth--24e2xI")) {
                                            WinJS.Utilities.removeClass(overlayElement, "autoWidth--24e2xI");
                                        }
                                        if (!WinJS.Utilities.hasClass(overlayElement, "fullWidth--Z1RRil3")) {
                                            WinJS.Utilities.addClass(overlayElement, "fullWidth--Z1RRil3");
                                        }
                                    } else {
                                        //if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-fullwidth")) {
                                        //    WinJS.Utilities.removeClass(overlayElement, "video-overlay-fullwidth");
                                        //}
                                        if (!WinJS.Utilities.hasClass(overlayElement, "autoWidth--24e2xI")) {
                                            WinJS.Utilities.addClass(overlayElement, "autoWidth--24e2xI");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "fullWidth--Z1RRil3")) {
                                            WinJS.Utilities.removeClass(overlayElement, "fullWidth--Z1RRil3");
                                        }
                                    }
                                    if (!WinJS.Utilities.hasClass(overlayElement, "overlayToTop--1PLUSN")) {
                                        WinJS.Utilities.addClass(overlayElement, "overlayToTop--1PLUSN");
                                    }
                                }
                                if (WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                    WinJS.Utilities.removeClass(videoList, "video-list-double-columns");
                                }
                                while (curChild) {
                                    if (curChild.style) {
                                        curChild.style.gridColumn = "";
                                        curChild.style.gridRow = "";
                                    }
                                    curChild = curChild.nextSibling;
                                }
                                if (WinJS.Utilities.hasClass(videoList, "video-list-vertical")) {
                                    WinJS.Utilities.removeClass(videoList, "video-list-vertical");
                                }
                            } else {
                                if (!WinJS.Utilities.hasClass(videoList, "video-list-vertical")) {
                                    WinJS.Utilities.addClass(videoList, "video-list-vertical");
                                }
                                //if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-fullwidth")) {
                                //    WinJS.Utilities.removeClass(overlayElement, "video-overlay-fullwidth");
                                //}
                                if (WinJS.Utilities.hasClass(overlayElement, "fullWidth--Z1RRil3")) {
                                    WinJS.Utilities.removeClass(overlayElement, "fullWidth--Z1RRil3");
                                }
                                if (WinJS.Utilities.hasClass(overlayElement, "autoWidth--24e2xI")) {
                                    WinJS.Utilities.removeClass(overlayElement, "autoWidth--24e2xI");
                                }
                                if (WinJS.Utilities.hasClass(overlayElement, "overlayToTop--1PLUSN")) {
                                    WinJS.Utilities.removeClass(overlayElement, "overlayToTop--1PLUSN");
                                }
                                if (WinJS.Utilities.hasClass(overlayElement, "overlay--nP1TK")) {
                                    WinJS.Utilities.removeClass(overlayElement, "overlay--nP1TK");
                                }
                                if (WinJS.Utilities.hasClass(overlayElement, "floatingOverlay--ZU51zt")) {
                                    WinJS.Utilities.removeClass(overlayElement, "floatingOverlay--ZU51zt");
                                }
                                if (direction === videoListDefaults.right) {
                                    if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                                        WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-left");
                                    }
                                    if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                                        WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-right");
                                    }
                                    if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-left")) {
                                        WinJS.Utilities.removeClass(overlayElement, "video-overlay-left");
                                    }
                                    if (!WinJS.Utilities.hasClass(overlayElement, "video-overlay-right")) {
                                        WinJS.Utilities.addClass(overlayElement, "video-overlay-right");
                                    }
                                } else {
                                    if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                                        WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-right");
                                    }
                                    if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                                        WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-left");
                                    }
                                    if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-right")) {
                                        WinJS.Utilities.removeClass(overlayElement, "video-overlay-right");
                                    }
                                    if (!WinJS.Utilities.hasClass(overlayElement, "video-overlay-left")) {
                                        WinJS.Utilities.addClass(overlayElement, "video-overlay-left");
                                    }
                                }
                                var heightFullSize = videoList.childElementCount * videoListDefaults.height;
                                if (heightFullSize > videoList.clientHeight) {
                                    if (!WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                        WinJS.Utilities.addClass(videoList, "video-list-double-columns");
                                    }
                                    var heightHalfSize = Math.floor(videoList.childElementCount / 2.0 + 0.5) * videoListDefaults.height / 2;
                                    var resCount = Math.floor((videoList.clientHeight - heightHalfSize) / videoListDefaults.height);
                                    var curCount = 0;
                                    while (curChild) {
                                        if (curChild.style) {
                                            if (curCount < resCount) {
                                                curChild.style.gridColumn = "span 2";
                                                curChild.style.gridRow = "span 2";
                                                curCount++;
                                            } else {
                                                curChild.style.gridColumn = "";
                                                curChild.style.gridRow = "";
                                            }
                                        }
                                        curChild = curChild.nextSibling;
                                    }
                                } else {
                                    while (curChild) {
                                        if (curChild.style) {
                                            curChild.style.gridColumn = "";
                                            curChild.style.gridRow = "";
                                        }
                                        curChild = curChild.nextSibling;
                                    }
                                    if (WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                        WinJS.Utilities.removeClass(videoList, "video-list-double-columns");
                                    }
                                }
                            }
                            that.adjustContentPositionsFailedCount = 0;
                        } else {
                            if (videoListDefaults.videoListObserver) {
                                videoListDefaults.videoListObserver.disconnect();
                                videoListDefaults.videoListObserver = null;
                            }
                            that.adjustContentPositionsFailedCount++;
                            Log.print(Log.l.trace, "videoList not yet created - try later again! that.adjustContentPositionsFailedCount=" + that.adjustContentPositionsFailedCount);
                            if (!that.adjustContentPositionsPromise) {
                                that.adjustContentPositionsPromise = WinJS.Promise.timeout(Math.min(that.adjustContentPositionsFailedCount*10,5000)).then(function() {
                                    that.adjustContentPositions();
                                });
                            }
                        }
                    } else {
                        if (videoListDefaults.videoListObserver) {
                            videoListDefaults.videoListObserver.disconnect();
                            videoListDefaults.videoListObserver = null;
                        }
                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-left");
                        }
                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-right");
                        }
                    }
                    that.adjustContentPositionsFailedCount = 0;
                } else {
                    if (videoListDefaults.mediaContainerObserver) {
                        videoListDefaults.mediaContainerObserver.disconnect();
                        videoListDefaults.mediaContainerObserver = null;
                    }
                    that.adjustContentPositionsFailedCount++;
                    Log.print(Log.l.trace, "mediaContainer not yet created - try later again! adjustContentPositionsFailedCount=" + that.adjustContentPositionsFailedCount);
                    if (!that.adjustContentPositionsPromise) {
                        that.adjustContentPositionsPromise = WinJS.Promise.timeout(Math.min(that.adjustContentPositionsFailedCount*10,5000)).then(function() {
                            that.adjustContentPositions();
                        });
                    }
                }
                var closeDescButton = fragmentElement.querySelector(elementSelectors.closeDesc);
                if (closeDescButton) {
                    if (!videoListDefaults.closeDesc) {
                        videoListDefaults.closeDesc = closeDescButton.onclick;
                        closeDescButton.onclick = that.clickCloseDesc;
                    }
                } else {
                    videoListDefaults.closeDesc = null;
                }
                var restoreDescButton = fragmentElement.querySelector(elementSelectors.restoreDesc);
                if (restoreDescButton) {
                    if (!videoListDefaults.restoreDesc) {
                        videoListDefaults.restoreDesc = restoreDescButton.onclick;
                        restoreDescButton.onclick = that.restoreCloseDesc;
                    }
                } else {
                    videoListDefaults.restoreDesc = null;
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.adjustContentPositions = adjustContentPositions;

            var lastDeviceListTime = 0;
            var checkForInactiveVideo = function() {
                var hideInactive = videoListDefaults.hideInactive;
                var hideMuted = videoListDefaults.hideMuted;
                var presenterModeTiledIsSet = false;
                Log.call(Log.l.trace, "Conference.Controller.", "hideInactive="+hideInactive+" hideMuted="+hideMuted);
                if (that.checkForInactiveVideoPromise) {
                    that.checkForInactiveVideoPromise.cancel();
                    that.checkForInactiveVideoPromise = null;
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return WinJS.Promise.as();
                }
                var ret = new WinJS.Promise.as().then(function() {
                    var deviceListTime = Date.now();
                    if (deviceListTime - lastDeviceListTime > 30000 &&
                        typeof navigator.mediaDevices === "object" &&
                        typeof navigator.mediaDevices.enumerateDevices === "function") {
                        lastDeviceListTime = deviceListTime;
                        return navigator.mediaDevices.enumerateDevices();
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function(deviceList) {
                    if (deviceList && typeof deviceList.filter === "function" && 
                        that.deviceList !== deviceList) {
                        that.deviceList = deviceList.filter(function(device) {
                            return device.kind === "videoinput";
                        });
                    }
                    var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                    if (mediaContainer) {
                        if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                            presenterModeTiledIsSet = true;
                        }
                    }
                    var videoList = fragmentElement.querySelector(".videoList--1OC49P");
                    if (videoList) {
                        var i = 0;
                        var numVideos = 0;
                        var now = Date.now();
                        var videoListItem = videoList.firstElementChild;
                        var prevActiveItem = null;
                        while (videoListItem) {
                            var content = videoListItem.firstElementChild;
                            if (content) {
                                var muted = null;
                                var isHidden = false;
                                if (WinJS.Utilities.hasClass(content, "talking--26lGzY")) {
                                    videoListDefaults.contentActivity[i] = now;
                                } else {
                                    muted = content.querySelector(".muted--quAxq") || content.querySelector(".icon-bbb-listen");
                                }
                                if ((muted || !videoListDefaults.contentActivity[i]) && (hideInactive || hideMuted) ||
                                    hideInactive && now - videoListDefaults.contentActivity[i] > videoListDefaults.inactivityDelay) {
                                    videoListItem.style.display = "none";
                                    isHidden = true;
                                } else {
                                    if (prevActiveItem) {
                                        if (videoListItem !== prevActiveItem.nextSibling) {
                                            videoList.insertBefore(videoListItem, prevActiveItem.nextSibling);
                                        }
                                    } else {
                                        if (videoListItem !== videoList.firstElementChild) {
                                            videoList.insertBefore(videoListItem, videoList.firstElementChild);
                                        }
                                    }
                                    prevActiveItem = videoListItem;
                                    videoListItem.style.display = "flex";
                                    numVideos++;
                                }
                                var video = videoListItem.querySelector("video");
                                if (video && video.style) {
                                    if (WinJS.Utilities.hasClass(videoListItem, "selfie-video")) {
                                        var userName = videoListItem.querySelector(".userName--ZsKYfV, .dropdownTrigger--Z1Fp5dg");
                                        if (userName) {
                                            var userNameText = userName.textContent;
                                            if (typeof userNameText === "string") {
                                                var myLabel = " (" + getResourceText("label.me") + ")";
                                                if (userNameText.indexOf(myLabel) < 0) {
                                                    userName.textContent = userNameText + myLabel;
                                                }
                                            }
                                        }
                                    } else if (that.deviceList && that.deviceList.length > 0) {
                                        var mediaStream = video.srcObject;
                                        if (mediaStream && typeof mediaStream.getVideoTracks === "function") {
                                            var videoTrack = mediaStream.getVideoTracks() ? mediaStream.getVideoTracks()[0] : null;
                                            if (videoTrack && typeof videoTrack.getSettings === "function") {
                                                var settings = videoTrack.getSettings();
                                                for (var j = 0; j < that.deviceList.length; j++) {
                                                    if (that.deviceList[j].deviceId === settings.deviceId) {
                                                        Log.print(Log.l.trace, "found local "+ that.deviceList[j].kind + ":" + that.deviceList[j].label + " with deviceId=" + that.deviceList[j].deviceId);
                                                        WinJS.Utilities.addClass(videoListItem, "selfie-video");
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (presenterModeTiledIsSet && !isHidden) {
                                        var left = (videoListItem.clientWidth - (videoListItem.clientHeight * video.videoWidth / video.videoHeight)) / 2;
                                        video.style.left = left.toString() + "px";
                                    } else {
                                        video.style.left = "";
                                    }
                                }
                                i++;
                            }
                            videoListItem = videoListItem.nextElementSibling;
                        }
                        videoListDefaults.activeVideoCount = numVideos;
                        if (!that.adjustContentPositionsPromise) {
                            that.adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function() {
                                that.adjustContentPositions();
                            });
                        }
                    }
                    that.checkForInactiveVideoPromise = WinJS.Promise.timeout(hideInactive ? 500 : 2000).then(function() {
                        that.checkForInactiveVideo();
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.checkForInactiveVideo = checkForInactiveVideo;

            var loadData = function () {
                var pageControllerName = AppBar.scope.element && AppBar.scope.element.id;
                AppBar.scope.binding.registerEmail = AppData._persistentStates.registerData.Email;
                Log.call(Log.l.trace, "Conference.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    if (pageControllerName === "eventController") {
                        return AppData.call("PRC_BBBConferenceLink", {
                            //zum test da es für diesen token eine online Event vorhanden ist 
                            //sonst AppData._persistentStates.registerData.userToken
                            pUserToken: AppData._persistentStates.registerData.userToken
                        }, function(json) {
                            if (json && json.d && json.d.results) {
                                that.binding.dataConference = json.d.results[0];
                                if (that.binding.dataConference) {
                                    if (that.binding.dataConference.URL) {
                                        AppData._persistentStates.registerData.urlbbb = that.binding.dataConference.URL;
                                        AppBar.scope.binding.showConference = true;
                                    }
                                }
                            }
                            Log.print(Log.l.trace, "PRC_BBBConferenceLink success!");
                        }, function(error) {
                            Log.print(Log.l.error, "PRC_BBBConferenceLink error! ");
                            AppData.setErrorMsg(AppBar.scope.binding, error);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var modToken = null;
                    if (Application.query.UserToken) {
                        modToken = Application.query.UserToken;
                    }
                    if (pageControllerName === "modSessionController") {
                        return AppData.call("PRC_BBBModeratorLink", {
                            pVeranstaltungID: 0,
                            pAlias: null,
                            pUserToken: modToken //aus startlink 
                        }, function(json) {
                            if (json && json.d && json.d.results) {
                                that.binding.dataConference = json.d.results[0];
                                if (that.binding.dataConference) {
                                    if (that.binding.dataConference.URL) {
                                        AppBar.scope.binding.showConference = true;
                                    }
                                }
                            }
                            Log.print(Log.l.trace, "PRC_BBBConferenceLink success!");
                        }, function(error) {
                            Log.print(Log.l.error, "PRC_BBBConferenceLink error! ");
                            AppData.setErrorMsg(AppBar.scope.binding, error);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function () {
                    var url = that.binding.dataConference && that.binding.dataConference.URL;
                    if (url) {
                        var query = getQueryStringParameters(url);
                        if (window.history && query && Application.query) {
                            var state = {};
                            var title = "";
                            for (var key in query) {
                                if (query.hasOwnProperty(key)) {
                                    var value = query[key];
                                    Log.print(Log.l.trace, "added "+ key + "=" + value);
                                    Application.query[key] = value;
                                }
                            }
                            var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                            window.history.pushState(state, title, location);
                        };
                        var path = url.replace(/https?:\/\/[\.a-zA-Z]+\/html5client/g,'/html5client');
                        return renderImpl(path, conference, false);
                    } else {
                        AppData.setErrorMsg(AppBar.scope.binding, that.binding.dataConference.ResultMessage);
                        // wenn keine conference vorhanden dann zeige meldung -> Conference läuft noch nicht -> zurück button auf events
                        // setze manuell auf ein ungültigen Status
                        AppData._persistentStates.registerData.confirmStatusID = 403;
                        Application.pageframe.savePersistentStates();
                        if (typeof AppBar.scope.updateFragment === "function") {
                            return AppBar.scope.updateFragment();
                        } else {
                            return WinJS.Promise.as();
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var setPresenterModeState = function(state) {
                Log.call(Log.l.info, "Conference.Controller.", "state=" + state);
                var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                if (mediaContainer) {
                    switch (state) {
                        case "tiled":{
                            if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode")) {
                                WinJS.Utilities.addClass(mediaContainer, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-full")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-full");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-small")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-small");
                            }
                            if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                                WinJS.Utilities.addClass(mediaContainer, "presenter-mode-tiled");
                            }
                            videoListDefaults.direction = videoListDefaults.right;
                            videoListDefaults.hideMuted = true;
                        }
                        break;
                        case "full":{
                            if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode")) {
                                WinJS.Utilities.addClass(mediaContainer, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-tiled");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-small")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-small");
                            }
                            if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-full")) {
                                WinJS.Utilities.addClass(mediaContainer, "presenter-mode-full");
                            }
                            videoListDefaults.direction = videoListDefaults.right;
                            videoListDefaults.hideMuted = true;
                        }
                        break;
                        case "small":{
                            if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode")) {
                                WinJS.Utilities.addClass(mediaContainer, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-tiled");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-full")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-full");
                            }
                            if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-small")) {
                                WinJS.Utilities.addClass(mediaContainer, "presenter-mode-small");
                            }
                            videoListDefaults.direction = videoListDefaults.right;
                            videoListDefaults.hideMuted = true;
                        }
                        break;
                        default: {
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-tiled");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-small")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-small");
                            }
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-full")) {
                                WinJS.Utilities.removeClass(mediaContainer, "presenter-mode-full");
                            }
                            videoListDefaults.hideMuted = false;
                        }
                    }
                    that.checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                        that.checkForInactiveVideo();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.setPresenterModeState = setPresenterModeState;

            this.eventHandlers = {
                showPresentation: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var restoreDescButton = fragmentElement.querySelector(elementSelectors.restoreDesc);
                    if (restoreDescButton) {
                        restoreDescButton.click();
                    }
                    that.binding.showPresentation = true;
                    if (videoListDefaults.direction === videoListDefaults.default) {
                        WinJS.Promise.timeout(50).then(function() {
                            var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                            if (mediaContainer) {
                                var overlayElement = mediaContainer.querySelector(".overlay--nP1TK");
                                if (overlayElement && overlayElement.style) {
                                    overlayElement.style.height = videoListDefaults.height;
                                }
                            }
                        });
                    }
                    Log.ret(Log.l.info);
                },
                hidePresentation: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var closeDescButton = fragmentElement.querySelector(elementSelectors.closeDesc);
                    if (closeDescButton) {
                        closeDescButton.click();
                    }
                    that.binding.showPresentation = false;
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                showVideoList: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                    if (mediaContainer) {
                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-hidden")) {
                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-hidden");
                        }
                        that.binding.showVideoList = true;
                    } 
                    Log.ret(Log.l.info);
                },
                hideVideoList: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                    if (mediaContainer) {
                        if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-hidden")) {
                            WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-hidden");
                        }
                        that.binding.showVideoList = false;
                    }
                    Log.ret(Log.l.info);
                },
                videoListDefault: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    videoListDefaults.direction = videoListDefaults.default;
                    that.setPresenterModeState("off");
                    WinJS.Promise.timeout(250).then(function() {
                        var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                        if (mediaContainer) {
                            var overlayElement = mediaContainer.querySelector(".overlay--nP1TK:not(.hideOverlay--Z13uLxg)");
                            if (overlayElement && overlayElement.style) {
                                overlayElement.style.height = videoListDefaults.height;
                            }
                        }
                    });
                    Log.ret(Log.l.info);
                },
                videoListLeft: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    videoListDefaults.direction = videoListDefaults.left;
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                videoListRight: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    videoListDefaults.direction = videoListDefaults.right;
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                presenterModeTiled: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState("tiled");
                    Log.ret(Log.l.info);
                },
                presenterModeFull: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState("full");
                    Log.ret(Log.l.info);
                },
                presenterModeSmall: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState("small");
                    Log.ret(Log.l.info);
                },
                clickPresenterMode: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var command = event && event.currentTarget && event.currentTarget.id;
                    if (command) {
                        Log.print(Log.l.info, "command=" + command);
                        that.submitCommandMessage(command, event);
                    }
                    Log.ret(Log.l.info);
                },
                clickToggleSwitch: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (event.currentTarget) {
                        var command = event.currentTarget.id;
                        var toggle = event.currentTarget.winControl;
                        if (toggle && command) {
                            var value = that.binding[command];
                            if (typeof value === "boolean" && value !== toggle.checked) {
                                if (!toggle.checked) {
                                    command = command.replace(/show/, "hide");
                                }
                                that.submitCommandMessage(command, event);
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                }
            }

            var submitCommandMessage = function(command, event, openedUserList, openedChat) {
                var btnToggleChat, btnToggleUserList, panelWrapper;
                Log.call(Log.l.info, "Conference.Controller.");
                if (that.submitCommandMessagePromise) {
                    that.submitCommandMessagePromise.cancel();
                    that.submitCommandMessagePromise = null;
                }
                var messageInput = fragmentElement.querySelector(".modSession #conference.mediaview .chat--111wNM .form--1S2xdc textarea#message-input");
                if (messageInput) {
                    //messageInput.focus();
                    messageInput.innerHTML = magicStart + command + magicStop;
                    var inputEvent = document.createEvent('event');
                    inputEvent.initEvent('input', true, true);
                    messageInput.dispatchEvent(inputEvent);
                    var submitButton = fragmentElement.querySelector(".modSession #conference.mediaview .chat--111wNM .form--1S2xdc button[type=\"submit\"]");
                    if (submitButton) {
                        submitButton.click();
                    }
                    if (messageInput.form && typeof messageInput.form.reset === "function") {
                        messageInput.form.reset();
                    }
                    if (openedChat) {
                        btnToggleChat = fragmentElement.querySelector("div[role=\"button\"]#chat-toggle-button");
                        if (btnToggleChat) {
                            btnToggleChat.click();
                        }
                    }
                    if (openedUserList) {
                        btnToggleUserList = fragmentElement.querySelector(".btn--Z25OApd");
                        if (btnToggleUserList) {
                            btnToggleUserList.click();
                        }
                    }
                    if (openedChat || openedUserList) {
                        panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                        if (panelWrapper && WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                            WinJS.Utilities.removeClass(panelWrapper, "hide-panel-section");
                        }
                    }
                } else {
                    panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                    if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                        WinJS.Utilities.addClass(panelWrapper, "hide-panel-section");
                    } else {
                        btnToggleChat = fragmentElement.querySelector("div[role=\"button\"]#chat-toggle-button");
                        if (btnToggleChat) {
                            btnToggleChat.click();
                            openedChat = true;
                        } else {
                            btnToggleUserList = fragmentElement.querySelector(".btn--Z25OApd");
                            if (btnToggleUserList) {
                                btnToggleUserList.click();
                                openedUserList = true;
                            }
                        }
                    }
                    that.submitCommandMessagePromise = WinJS.Promise.timeout(20).then(function() {
                        that.submitCommandMessage(command, event, openedUserList, openedChat);
                    });
                }
                Log.ret(Log.l.info);
            }
            that.submitCommandMessage = submitCommandMessage;

            that.commandInfo = {
                showPresentation: { redundantList: ["hidePresentation"] },
                hidePresentation: { redundantList: ["showPresentation"] },
                videoListDefault: { redundantList: ["videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"] },
                videoListLeft: { redundantList: ["videoListDefault", "videoListRight", "presenterModeTiled", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"] },
                videoListRight: { redundantList: ["videoListDefault", "videoListLeft", "presenterModeTiled", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"] },
                hideVideoList: { redundantList: ["showVideoList"] },
                showVideoList: { redundantList: ["hideVideoList"] },
                presenterModeTiled: { redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeFull", "presenterModeSmall"] },
                presenterModeFull: { redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeSmall"] },
                presenterModeSmall: { redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull"] }
            };
            var handleCommand = function(command) {
                var prevNotivyModified = AppBar.notifyModified;
                Log.print(Log.l.info, "queue command=" + command);
                var commandInfo = that.commandInfo[command];
                if (!commandInfo) {
                    Log.ret(Log.L.info, "unknown command=" + command);
                    return WinJS.Promise.as();
                }
                that.commandQueue = that.commandQueue.filter(function(commandToFilter) {
                    return !commandInfo.redundantList || commandInfo.redundantList.indexOf(commandToFilter) < 0;
                });
                that.commandQueue.push(command);
                return WinJS.Promise.timeout(250).then(function() {
                    var commandsToHandle = that.commandQueue;
                    that.commandQueue = [];
                    AppBar.notifyModified = false;
                    commandsToHandle.forEach(function(queuedCommand) {
                        if (typeof that.eventHandlers[queuedCommand] === "function") {
                            Log.print(Log.l.info, "handle command=" + queuedCommand);
                            that.eventHandlers[queuedCommand]();
                        }
                    });
                    AppBar.notifyModified = prevNotivyModified;
                    if (!that.adjustContentPositionsPromise) {
                        that.adjustContentPositionsPromise = WinJS.Promise.timeout(0).then(function() {
                            that.adjustContentPositions();
                        });
                    }
                    that.sendResize(20);
                });
            }
            that.handleCommand = handleCommand;

            var groupChatStart = "\"{\\\"msg\\\":\\\"added\\\",\\\"collection\\\":\\\"group-chat-msg\\\"";
            var messageStart = "\\\"message\\\":\\\"";
            var messageStop = "\\\"";
            Application.hookXhrOnReadyStateChange = function(res) {
                var responseText = res && res.responseText;
                if (typeof responseText === "string" && responseText.indexOf(magicStart) >= 0) {
                    var responseReplaced = false;
                    var newResponseText = "";
                    var prevStartPos = 0;
                    while (prevStartPos >= 0 && prevStartPos <= responseText.length) {
                        var curText = responseText.substr(prevStartPos);
                        var posGroupChatStart = curText.indexOf(groupChatStart);
                        if (posGroupChatStart >= 0) {
                            var posMessageStart = curText.substr(posGroupChatStart + groupChatStart.length).indexOf(messageStart);
                            if (posMessageStart > 0) {
                                posMessageStart += posGroupChatStart + groupChatStart.length;
                                var messageReplaced = false;
                                var skipMessage = false;
                                var messageLength = curText.substr(posMessageStart + messageStart.length).indexOf(messageStop);
                                if (messageLength > 0) {
                                    var message = curText.substr(posMessageStart + messageStart.length, messageLength);
                                    var prevMessageStartPos = 0;
                                    while (prevMessageStartPos >= 0 && prevMessageStartPos < message.length) {
                                        var curMessage = message.substr(prevMessageStartPos);
                                        var posMagicStart = curMessage.indexOf(magicStart);
                                        if (posMagicStart >= 0) {
                                            var posMagicStop = curMessage.indexOf(magicStop);
                                            var command = "";
                                            if (posMagicStop > posMagicStart + magicStart.length) {
                                                command = curMessage.substr(posMagicStart + magicStart.length, posMagicStop - (posMagicStart + magicStart.length));
                                                if (command && that.commandInfo[command]) {
                                                    if (AppBar.scope.element && AppBar.scope.element.id === "eventController") {
                                                        if (curMessage.length > magicStart.length + command.length + magicStop.length) {
                                                            if (!prevMessageStartPos) {
                                                                newResponseText += curText.substr(0, posMessageStart + messageStart.length);
                                                            }
                                                            newResponseText += curMessage.substr(0, posMagicStart);
                                                            messageReplaced = true;
                                                        } else if (!prevMessageStartPos) {
                                                            skipMessage = true;
                                                        }
                                                    }
                                                    if (res.readyState === 4 && res.status === 200) {
                                                        Log.print(Log.l.info, "received command=" + command);
                                                        that.handleCommand(command);
                                                    }
                                                    responseReplaced = true;
                                                }
                                            } 
                                            prevMessageStartPos += posMagicStart + magicStart.length + command.length + magicStop.length;
                                        } else {
                                            if (messageReplaced) {
                                                newResponseText += curMessage;
                                            }
                                            prevMessageStartPos = -1;
                                        }
                                    }
                                }
                                // respect closing brackets!
                                var posFieldsStop = curText.substr(posMessageStart + messageStart.length + messageLength + messageStop.length).indexOf("}");
                                if (posFieldsStop >= 0) {
                                    var posGroupChatStop = curText.substr(posMessageStart + messageStart.length + messageLength + messageStop.length + posFieldsStop + 1).indexOf("}");
                                    if (posGroupChatStop >= 0) {
                                        if (messageReplaced) {
                                            newResponseText += messageStop + curText.substr(posMessageStart + messageStart.length + messageLength + messageStop.length,
                                                posFieldsStop + 1 + posGroupChatStop + 1);
                                        } else if (skipMessage) {
                                            var nonSkippedMessages = curText.substr(0, posGroupChatStart);
                                            // skip list-separators!
                                            if (nonSkippedMessages.substr(nonSkippedMessages.length-2) === "\",") {
                                                nonSkippedMessages = nonSkippedMessages.substr(0, nonSkippedMessages.length-2);
                                            }
                                            newResponseText += nonSkippedMessages;
                                        } else {
                                            newResponseText += curText.substr(0, posMessageStart + messageStart.length + messageLength + messageStop.length + posFieldsStop + 1 + posGroupChatStop + 1);
                                        }
                                        prevStartPos += posMessageStart + messageStart.length + messageLength + messageStop.length + posFieldsStop + 1 + posGroupChatStop + 1;
                                    } else {
                                        newResponseText += curText;
                                        prevStartPos = -1;
                                    }
                                } else {
                                    newResponseText += curText;
                                    prevStartPos = -1;
                                }
                            } else {
                                newResponseText += curText;
                                prevStartPos = -1;
                            }
                        } else {
                            newResponseText += curText;
                            prevStartPos = -1;
                        }
                    }
                    if (responseReplaced) {
                        res.responseText = newResponseText;
                    }
                      
                }
            };
            if (AppBar.scope.element && AppBar.scope.element.id === "eventController") {
                var sendGroupChatStart = "\"{\\\"msg\\\":\\\"method\\\",\\\"method\\\":\\\"sendGroupChatMsg\\\"";
                var magicStartReplace = "&lt;!&#8211;&#8211;";
                var magicStopReplace = "&#8211;&#8211;&gt;";
                Application.hookXhrSend = function(body) {
                    if (typeof body === "string" && body.indexOf(magicStart) >= 0) {
                        var bodyReplaced = false;
                        var newBody = "";
                        var prevStartPos = 0;
                        while (prevStartPos >= 0 && prevStartPos <= body.length) {
                            var curText = body.substr(prevStartPos);
                            var posSendGroupChatStart = curText.indexOf(sendGroupChatStart);
                            if (posSendGroupChatStart >= 0) {
                                var posMessageStart = curText.substr(posSendGroupChatStart + sendGroupChatStart.length).indexOf(messageStart);
                                if (posMessageStart > 0) {
                                    posMessageStart += posSendGroupChatStart + sendGroupChatStart.length;
                                    var messageReplaced = false;
                                    var messageLength = curText.substr(posMessageStart + messageStart.length).indexOf(messageStop);
                                    if (messageLength > 0) {
                                        var message = curText.substr(posMessageStart + messageStart.length, messageLength);
                                        var prevMessageStartPos = 0;
                                        while (prevMessageStartPos >= 0 && prevMessageStartPos < message.length) {
                                            var curMessage = message.substr(prevMessageStartPos);
                                            var posMagicStart = curMessage.indexOf(magicStart);
                                            if (posMagicStart >= 0) {
                                                var posMagicStop = curMessage.indexOf(magicStop);
                                                var command = "";
                                                if (posMagicStop > posMagicStart + magicStart.length) {
                                                    command = curMessage.substr(posMagicStart + magicStart.length, posMagicStop - (posMagicStart + magicStart.length));
                                                    if (command && that.commandInfo[command]) {
                                                        if (!prevMessageStartPos) {
                                                            newBody += curText.substr(0, posMessageStart + messageStart.length);
                                                        }
                                                        newBody += curMessage.substr(0, posMagicStart) + magicStartReplace + command + magicStopReplace;
                                                        messageReplaced = true;
                                                        bodyReplaced = true;
                                                    }
                                                } 
                                                prevMessageStartPos += posMagicStart + magicStart.length + command.length + magicStop.length;
                                            } else {
                                                if (messageReplaced) {
                                                    newBody += curMessage;
                                                }
                                                prevMessageStartPos = -1;
                                            }
                                        }
                                    }
                                    var posFieldsStop = curText.substr(posMessageStart + messageStart.length + messageLength + messageStop.length).indexOf("}");
                                    if (posFieldsStop >= 0) {
                                        var posGroupChatStop = curText.substr(posMessageStart + messageStart.length + messageLength + messageStop.length + posFieldsStop + 1).indexOf("}");
                                        if (posGroupChatStop >= 0) {
                                            if (messageReplaced) {
                                                newBody += messageStop + curText.substr(posMessageStart + messageStart.length + messageLength + messageStop.length,
                                                    posFieldsStop + 1 + posGroupChatStop + 1);
                                            } else {
                                                newBody += curText.substr(0, posMessageStart + messageStart.length + messageLength + messageStop.length + posFieldsStop + 1 + posGroupChatStop + 1);
                                            }
                                            prevStartPos += posMessageStart + messageStart.length + messageLength + messageStop.length + posFieldsStop + 1 + posGroupChatStop + 1;
                                        } else {
                                            newBody += curText;
                                            prevStartPos = -1;
                                        }
                                    } else {
                                        newBody += curText;
                                        prevStartPos = -1;
                                    }
                                } else {
                                    newBody += curText;
                                    prevStartPos = -1;
                                }
                            } else {
                                newBody += curText;
                                prevStartPos = -1;
                            }
                        }
                        if (bodyReplaced) {
                            return newBody;
                        }
                    }
                    return body;
                }
            } else {
                Application.hookXhrSend = null;
            }

            if (typeof navigator.mediaDevices === "object" &&
                typeof navigator.mediaDevices.enumerateDevices === "function") {
                navigator.mediaDevices.enumerateDevices().then(function(deviceList) {
                    that.deviceList = deviceList;
                });
            }
            videoListDefaults.direction = videoListDefaults.right;
            videoListDefaults.hideInactive = !!that.binding.dataEvent.HideSilentVideos;

            that.processAll().then(function () {
                AppBar.notifyModified = false;
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
                that.showUserList(false,!!that.binding.dataEvent.ListOnlyModerators);
                that.checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                    that.checkForInactiveVideo();
                });
                that.adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                    that.adjustContentPositions();
                });
                return that.adjustContentPositionsPromise;
            }).then(function () {
                return that.sendResize(2000);
            });
            Log.ret(Log.l.trace);
        })
    });
})();



