// controller for page: recordedContent
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/recordedContent/recordedContentService.js" />
var __meteor_runtime_config__;
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    var magicStart = "<!--";
    var magicStop = "-->";

    WinJS.Namespace.define("RecordedContent", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "RecordedContent.Controller.", "eventId=" + (options && options.eventId));

            var commandQueue = [];
            var chatObserver = null;
            var playButtonObserver = null;
            var sendResizePromise = null;
            var handleCommandPromise = null;
            var registerUiHandler= null;
            var slideClickHandlerDone = false;

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataRegister: {
                    Email: "",
                    Name: "",
                    ErfassungsStatus: 0,
                    Freischaltung: 0
                },
                countdown: {
                    day: "",
                    hour: "",
                    minute: "",
                    second: ""
                },
                dataConference: {
                    media: ""
                },
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText,
                showEvText: AppBar.scope.binding.showEvText,
                showOffText: AppBar.scope.binding.showOffText,
                showDelayContent: false
            }, commandList]);

            var that = this;

            that.dispose = function() {
                Log.call(Log.l.trace, "RecordedContent.Controller.");
                if (registerUiHandler) {
                    registerUiHandler.cancel();
                    registerUiHandler = null;
                }
                if (handleCommandPromise) {
                    handleCommandPromise.cancel();
                    handleCommandPromise = null;
                }
                if (sendResizePromise) {
                    sendResizePromise.cancel();
                    sendResizePromise = null;
                }
                if (playButtonObserver) {
                    playButtonObserver.disconnect();
                    playButtonObserver = null;
                }
                if (chatObserver) {
                    chatObserver.disconnect();
                    chatObserver = null;
                }
                if (BBBPlayback && typeof BBBPlayback.exit === "function") {
                    BBBPlayback.exit();
                }
                if (BBBWriting && typeof BBBWriting.exit === "function") {
                    BBBWriting.exit();
                }
                Log.ret(Log.l.trace);
            }

            var recordedContent = fragmentElement.querySelector("#recordedContent");

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
                    var newHostname = "(function(){return\"" + a.hostname + "\"})()";
                    var newHref = "(function(){return\"" + a.href + "\"})()";
                    var scriptText = req.responseText
                        .replace(/window\.document\.location\.hostname/g, newHostname)
                        .replace(/window\.location\.hostname/g, newHostname)
                        .replace(/window\.location\.href/g, newHref)
                        ;
                    return scriptText;
                });
            }
            var getScriptFromSrc = getScriptFromSrcXhr;

            var addScript = function (scriptTag, fragmentHref, position, lastNonInlineScriptPromise, target, isBody) {
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
                        promise = lastNonInlineScriptPromise.then(function () {
                            n.text = text;
                        }).then(null, function () {
                            // eat error
                        });
                    } else {
                        if (!isBody) {
                            promise = new WinJS.Promise(function (c) {
                                n.onload = n.onerror = function () {
                                    c();
                                };

                                // Using scriptTag.src to maintain the original casing
                                n.setAttribute("src", scriptTag.src);
                            });
                        } else {
                            promise = getScriptFromSrc(scriptTag.src).then(function (scriptText) {
                                n.text = scriptText;
                            }).then(null, function () {
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
                state.headScripts = cd.getElementsByTagName('script');
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
                    //state.localScripts.push(s);
                    s.parentNode.removeChild(s);
                }

                return WinJS.Promise.join(sp).then(function () {
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
                    var progressStr = '<progress class="win-progress-ring"></progress>';
                    var emptyStr = '';
                    var playback = req.responseText
                        .replace(/<link.+>/g, emptyStr)
                        .replace(/<script.+<\/script>/g, emptyStr)
                        .replace(/<img id="load-img.+>/g, progressStr);
                    return playback;
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
                    state.promise.then(function() {
                         delete state.promise;
                    });
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
                            retVal = new WinJS.Promise.as().then(function () {
                                var sp = [];
                                var lastNonInlineScriptPromise = WinJS.Promise.as();
                                forEach(state.localScripts,
                                    function (e, i) {
                                        var result = addScript(e, href, state.headScripts.length + i, lastNonInlineScriptPromise, target, true);
                                        if (result) {
                                            if (!result.inline) {
                                                lastNonInlineScriptPromise = result.promise;
                                            }
                                            sp.push(result.promise);
                                        }
                                    });
                                return WinJS.Promise.join(sp);
                            }).then(function () {
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

            var sendResize = function (delay) {
                if (sendResizePromise) {
                    sendResizePromise.cancel();
                }
                sendResizePromise = WinJS.Promise.timeout(delay || 0).then(function () {
                    var resizeEvent = document.createEvent('uievent');
                    resizeEvent.initEvent('resize', true, true);
                    window.dispatchEvent(resizeEvent);
                });
            }
            that.sendResize = sendResize;

            var setPresenterModeState = function (state) {
                Log.call(Log.l.info, "RecordedContent.Controller.", "state=" + state);
                if (recordedContent) {
                    switch (state) {
                        case "tiled": {
                            if (!WinJS.Utilities.hasClass(recordedContent, "presenter-mode")) {
                                WinJS.Utilities.addClass(recordedContent, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-full")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-full");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-small")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-small");
                            }
                            if (!WinJS.Utilities.hasClass(recordedContent, "presenter-mode-tiled")) {
                                WinJS.Utilities.addClass(recordedContent, "presenter-mode-tiled");
                            }
                        }
                        break;
                        case "full": {
                            if (!WinJS.Utilities.hasClass(recordedContent, "presenter-mode")) {
                                WinJS.Utilities.addClass(recordedContent, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-tiled")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-tiled");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-small")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-small");
                            }
                            if (!WinJS.Utilities.hasClass(recordedContent, "presenter-mode-full")) {
                                WinJS.Utilities.addClass(recordedContent, "presenter-mode-full");
                            }
                        }
                        break;
                        case "small": {
                            if (!WinJS.Utilities.hasClass(recordedContent, "presenter-mode")) {
                                WinJS.Utilities.addClass(recordedContent, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-tiled")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-tiled");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-full")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-full");
                            }
                            if (!WinJS.Utilities.hasClass(recordedContent, "presenter-mode-small")) {
                                WinJS.Utilities.addClass(recordedContent, "presenter-mode-small");
                            }
                        }
                        break;
                        default: {
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-tiled")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-tiled");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-small")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-small");
                            }
                            if (WinJS.Utilities.hasClass(recordedContent, "presenter-mode-full")) {
                                WinJS.Utilities.removeClass(recordedContent, "presenter-mode-full");
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            that.setPresenterModeState = setPresenterModeState;

            that.eventHandlers = {
                showPresentation: function () {
                    Log.call(Log.l.info, "RecordedContent.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "presentation-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (WinJS.Utilities.hasClass(recordedContent, "presentation-is-hidden")) {
                            WinJS.Utilities.removeClass(recordedContent, "presentation-is-hidden");
                        }
                    }
                    that.binding.showPresentation = true;
                    Log.ret(Log.l.info);
                },
                hidePresentation: function () {
                    Log.call(Log.l.info, "RecordedContent.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && mainSection.firstElementChild && mainSection.firstElementChild.id === "presentation-area") {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (!WinJS.Utilities.hasClass(recordedContent, "presentation-is-hidden")) {
                            WinJS.Utilities.addClass(recordedContent, "presentation-is-hidden");
                        }
                    }
                    that.setPresenterModeState("off");
                    that.binding.showPresentation = false;
                    Log.ret(Log.l.info);
                },
                showVideoList: function () {
                    Log.call(Log.l.info, "RecordedContent.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "video-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (WinJS.Utilities.hasClass(recordedContent, "videolist-is-hidden")) {
                            WinJS.Utilities.removeClass(recordedContent, "videolist-is-hidden");
                        }
                    }
                    that.binding.showVideoList = true;
                    Log.ret(Log.l.info);
                },
                hideVideoList: function () {
                    Log.call(Log.l.info, "RecordedContent.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && mainSection.firstElementChild && mainSection.firstElementChild.id === "video-area") {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (!WinJS.Utilities.hasClass(recordedContent, "videolist-is-hidden")) {
                            WinJS.Utilities.addClass(recordedContent, "videolist-is-hidden");
                        }
                    }
                    that.binding.showVideoList = false;
                    Log.ret(Log.l.info);
                },
                videoListDefault: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "video-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (WinJS.Utilities.hasClass(recordedContent, "videolist-is-left")) {
                            WinJS.Utilities.removeClass(recordedContent, "videolist-is-left");
                        }
                        if (WinJS.Utilities.hasClass(recordedContent, "videolist-is-right")) {
                            WinJS.Utilities.removeClass(recordedContent, "videolist-is-right");
                        }
                    }
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                videoListLeft: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "presentation-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (!WinJS.Utilities.hasClass(recordedContent, "videolist-is-left")) {
                            WinJS.Utilities.addClass(recordedContent, "videolist-is-left");
                        }
                        if (WinJS.Utilities.hasClass(recordedContent, "videolist-is-right")) {
                            WinJS.Utilities.removeClass(recordedContent, "videolist-is-right");
                        }
                    }
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                videoListRight: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "presentation-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    if (recordedContent) {
                        if (!WinJS.Utilities.hasClass(recordedContent, "videolist-is-right")) {
                            WinJS.Utilities.addClass(recordedContent, "videolist-is-right");
                        }
                        if (WinJS.Utilities.hasClass(recordedContent, "videolist-is-left")) {
                            WinJS.Utilities.removeClass(recordedContent, "videolist-is-left");
                        }
                    }
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                presenterModeTiled: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "presentation-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    that.setPresenterModeState("tiled");
                    Log.ret(Log.l.info);
                },
                presenterModeFull: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "presentation-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    that.setPresenterModeState("full");
                    Log.ret(Log.l.info);
                },
                presenterModeSmall: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var mainSection = fragmentElement.querySelector("#main-section");
                    if (mainSection && !(mainSection.firstElementChild && mainSection.firstElementChild.id === "video-area")) {
                        var swapButton = fragmentElement.querySelector(".acorn-swap-button");
                        if (swapButton) {
                            swapButton.click();
                        }
                    }
                    that.setPresenterModeState("small");
                    Log.ret(Log.l.info);
                }
            }

            that.allCommandInfos = {
                showPresentation: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hidePresentation", "showPresentation"], type: "layout"
                },
                hidePresentation: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hidePresentation", "showPresentation"], type: "layout"
                },
                videoListDefault: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"], type: "layout"
                },
                videoListLeft: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"], type: "layout"
                },
                videoListRight: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"], type: "layout"
                },
                hideVideoList: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hideVideoList", "showVideoList"], type: "layout"
                },
                showVideoList: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hideVideoList", "showVideoList"], type: "layout"
                },
                presenterModeTiled: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"], type: "layout"
                },
                presenterModeFull: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"], type: "layout"
                },
                presenterModeSmall: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"], type: "layout"
                },
                showNotification: {
                    collection: "group-chat-msg", msg: "added", redundantList: null, type: "note"
                },
                lockChatMessage: {
                    collection: "group-chat-msg", msg: "added", redundantList: null, type: "chat"
                },
                unlockChatMessage: {
                    collection: "group-chat-msg", msg: "added", redundantList: null, type: "chat"
                },
                sessionEndRequested: {
                    collection: "group-chat-msg", msg: "added", redundantList: "sessionEndRequested", type: "session"
                },
                pQ: {
                    collection: "polls", msg: "added", redundantList: "pQ", type: "poll"
                }
            };

            var handleCommandWithParam = function(commandWithParam, typeFilter) {
                Log.call(Log.l.trace, "RecordedContent.Controller.", "commandWithParam=" + commandWithParam);
                if (!commandWithParam) {
                    Log.ret(Log.l.info, "null param");
                    return WinJS.Promise.as();
                }
                var command = commandWithParam.command;
                var prevNotifyModified = AppBar.notifyModified;
                Log.print(Log.l.info, "queue command=" + command);
                var commandInfo = that.allCommandInfos[command];
                if (!commandInfo) {
                    Log.ret(Log.l.info, "unknown command=" + command);
                    return WinJS.Promise.as();
                }
                if (typeFilter && typeof typeFilter.indexOf === "function" &&
                    typeFilter.indexOf(commandInfo.type) < 0) {
                    Log.ret(Log.l.info, "extra ignored command=" + command);
                    return WinJS.Promise.as();
                }
                if (handleCommandPromise) {
                    handleCommandPromise.cancel();
                    handleCommandPromise = null;
                }
                commandQueue = commandQueue.filter(function(item) {
                    return (!commandInfo.redundantList || commandInfo.redundantList.indexOf(item.command) < 0);
                });
                commandQueue.push(commandWithParam);
                handleCommandPromise = WinJS.Promise.timeout(250).then(function() {
                    var commandsToHandle = commandQueue;
                    commandQueue = [];
                    AppBar.notifyModified = false;
                    commandsToHandle.forEach(function(queuedCommandWithParam) {
                        var queuedCommand = queuedCommandWithParam.command;
                        var queuedParam = null;
                        if (queuedCommandWithParam.param) {
                            queuedParam = queuedCommandWithParam.param;
                        };
                        if (typeof that.eventHandlers[queuedCommand] === "function") {
                            Log.print(Log.l.info, "handle command=" + queuedCommand);
                            if (queuedParam) {
                                that.eventHandlers[queuedCommand](queuedParam);
                            } else {
                                that.eventHandlers[queuedCommand]();
                            }
                        }
                    });
                    AppBar.notifyModified = prevNotifyModified;
                    that.sendResize(50);
                });
                Log.ret(Log.l.trace);
                return handleCommandPromise;
            }
            that.handleCommandWithParam = handleCommandWithParam;

            var getCommandWithParam = function (text) {
                if (text) {
                    if (that.allCommandInfos[text]) {
                        return {
                            command: text, 
                            param: ""
                        };
                    }
                    for (var prop in that.allCommandInfos) {
                        if (that.allCommandInfos.hasOwnProperty(prop)) {
                            if (that.allCommandInfos[text.substr(0, prop.length)] && 
                                text[prop.length] === "(" && text[text.length - 1] === ")") {
                                return {
                                    command: text.substr(0, prop.length), 
                                    param: text.substr(prop.length + 1, text.length - prop.length - 2)
                                };
                            }
                        }
                    }

                }
                return null;
            }
            var parseChatMessage = function(message, typeFilter) {
                var responseReplaced = false;
                var newResponseText = "";
                Log.call(Log.l.trace, "RecordedContent.Controller.", "message=" + message);
                if (typeof message === "string") {
                    var fieldReplaced = false;
                    var skipField = false;
                    var fieldLength = message.length;
                    var prevFieldStartPos = 0;
                    while (prevFieldStartPos >= 0 && prevFieldStartPos < message.length) {
                        var posMagicStart = message.indexOf(magicStart, prevFieldStartPos);
                        if (posMagicStart >= prevFieldStartPos) {
                            var posMagicStop = message.indexOf(magicStop, posMagicStart);
                            var command = "";
                            var commandLength = posMagicStop - (posMagicStart + magicStart.length);
                            if (commandLength > 0) {
                                command = message.substr(posMagicStart + magicStart.length, commandLength);
                                var commandWithParam = getCommandWithParam(command);
                                if (commandWithParam) {
                                    if (fieldLength > magicStart.length + command.length + magicStop.length) {
                                        newResponseText += message.substr(prevFieldStartPos, posMagicStart - prevFieldStartPos);
                                        fieldReplaced = true;
                                    } else if (!prevFieldStartPos) {
                                        skipField = true;
                                    }
                                    responseReplaced = true;
                                    Log.print(Log.l.info, "received command=" + commandWithParam.command);
                                    that.handleCommandWithParam(commandWithParam, typeFilter);
                                }
                            } 
                            prevFieldStartPos += posMagicStart + magicStart.length + command.length + magicStop.length;
                        } else {
                            if (fieldReplaced) {
                                newResponseText += message.substr(prevFieldStartPos, message.length - prevFieldStartPos);
                            }
                            prevFieldStartPos = -1;
                        }
                    }
                }
                Log.ret(Log.l.trace, responseReplaced ? newResponseText: message);
                return responseReplaced ? newResponseText: message;
            }
            that.parseChatMessage = parseChatMessage;

            var setCurrentPresenterMode = function(chatLine) {
                Log.call(Log.l.trace, "RecordedContent.Controller.");
                var oldMessageAll = chatLine.getAttribute("name");
                var newMessageAll = "";
                if (oldMessageAll) {
                    newMessageAll = that.parseChatMessage(oldMessageAll);
                } else {
                    oldMessageAll = "";
                    var chatNode = chatLine.firstElementChild ? chatLine.firstElementChild.nextSibling : null;
                    while (chatNode) {
                        var newMessage = "";
                        var message = "";
                        switch (chatNode.nodeName && chatNode.nodeName.toLowerCase()) {
                            case "img":
                                message = chatNode.alt;
                                break;
                            default:
                                message = chatNode.textContent;
                        }
                        if (message) {
                            newMessage = that.parseChatMessage(message);
                            if (newMessage !== message) {
                                chatNode.textContent = newMessage;
                            }
                        }
                        oldMessageAll += message;
                        newMessageAll += newMessage;
                        chatNode = chatNode.nextSibling;
                    }
                    if (oldMessageAll && oldMessageAll !== newMessageAll) {
                        chatLine.setAttribute("name", oldMessageAll);
                    }
                }
                if (!newMessageAll && chatLine.style) {
                    chatLine.style.display = "none";
                }
                Log.ret(Log.l.trace);
            }
            that.setCurrentPresenterMode = setCurrentPresenterMode;

            var syncPresenterMode = function() {
                Log.call(Log.l.trace, "RecordedContent.Controller.");
                var chat = fragmentElement.querySelector("#chat");
                if (chat) {
                    var chatLine = chat.firstElementChild;
                    while (chatLine && chatLine.getAttribute("aria-hidden") === "false") {
                        var oldMessageAll = chatLine.getAttribute("name");
                        if (oldMessageAll) {
                            that.parseChatMessage(oldMessageAll, ["layout"]);
                        } else {
                            var chatNode = chatLine.firstElementChild ? chatLine.firstElementChild.nextSibling : null;
                            while (chatNode) {
                                var message = "";
                                switch (chatNode.nodeName && chatNode.nodeName.toLowerCase()) {
                                    case "img":
                                        message = chatNode.alt;
                                        break;
                                    default:
                                        message = chatNode.textContent;
                                }
                                if (message) {
                                    that.parseChatMessage(message, ["layout"]);
                                }
                                chatNode = chatNode.nextSibling;
                            }
                        }
                        chatLine = chatLine.nextElementSibling;
                    }
                }
                Log.ret(Log.l.trace);
            }
            that.syncPresenterMode = syncPresenterMode;

            var registerObserver = function () {
                Log.call(Log.l.trace, "RecordedContent.Controller.");
                if (registerUiHandler) {
                    registerUiHandler.cancel();
                    registerUiHandler = null;
                }
                if (!slideClickHandlerDone) {
                    var slide = fragmentElement.querySelector("#slide");
                    if (slide) {
                        that.addRemovableEventListener(slide, "click", function () {
                            var playButton = fragmentElement.querySelector(".acorn-play-button");
                            if (playButton) {
                                playButton.click();
                            }
                        });
                        slideClickHandlerDone = true;
                    }
                }
                if (!chatObserver) {
                    var chat = fragmentElement.querySelector("#chat");
                    if (chat) {
                        chatObserver = new MutationObserver(function (mutationList, observer) {
                            mutationList.forEach(function (mutation) {
                                switch (mutation.type) {
                                    case "attributes":
                                    if (mutation.target) {
                                        var ariaHidden = mutation.target.getAttribute("aria-hidden");
                                        Log.print(Log.l.trace, "chat attributes changed! ariaHidden=" + ariaHidden);
                                        if (ariaHidden === "false") {
                                            that.setCurrentPresenterMode(mutation.target);
                                        }
                                    }
                                    break;
                                }
                            });
                        });
                        chatObserver.observe(chat, {
                            attributeFilter: ["aria-hidden"],
                            subtree: true
                        });
                    }
                }
                if (!playButtonObserver) {
                    var playButton = fragmentElement.querySelector(".acorn-play-button");
                    if (playButton) {
                        playButtonObserver = new MutationObserver(function (mutationList, observer) {
                            mutationList.forEach(function (mutation) {
                                switch (mutation.type) {
                                    case "attributes":
                                    if (mutation.target) {
                                        Log.print(Log.l.trace, "chat attributes changed! disabled=" + mutation.target.disabled);
                                        if (!mutation.target.disabled) {
                                            WinJS.Promise.timeout(50).then(function() {
                                                that.syncPresenterMode();
                                            });
                                        }
                                    }
                                    break;
                                }
                            });
                        });
                        playButtonObserver.observe(playButton, {
                            attributeFilter: ["disabled"]
                        });
                    }
                }
                if (!playButtonObserver || !chatObserver || !slideClickHandlerDone) {
                    registerUiHandler = WinJS.Promise.timeout(150).then(function () {
                        that.registerObserver();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.registerObserver = registerObserver;
        

            var loadData = function () {
                var url;
                Log.call(Log.l.trace, "RecordedContent.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    Application.query = getQueryStringParameters();
                    if (Application.query && Application.query.meetingId && AppBar.scope.binding.recordedLink) {
                        url = AppBar.scope.binding.recordedLink;
                    }
                    if (url) {
                        options.url = url.replace(/https?:\/\/[\.a-zA-Z]+\/playback/g, '/playback');
                        return renderImpl(options.url, recordedContent, false);
                    } else {
                        // wenn keine recordedContent vorhanden dann zeige meldung -> recordedContent läuft noch nicht -> zurück button auf events
                        // setze manuell auf ein ungültigen Status
                        return WinJS.Promise.as();
                        /*AppData._persistentStates.registerData.confirmStatusID = 403;
                        Application.pageframe.savePersistentStates();
                        if (typeof AppBar.scope.updateFragment === "function") {
                            return AppBar.scope.updateFragment();
                        } else {
                            return WinJS.Promise.as();
                        }*/
                    }
                }).then(function () {
                    if (url) {
                        if (typeof $(document).foundation === "function") {
                            $(document).foundation();
                        }
                        if (BBBWriting && typeof BBBWriting.init === "function") {
                            BBBWriting.init();
                        }
                        if (BBBPlayback && typeof BBBPlayback.init === "function") {
                            BBBPlayback.init();
                        }
                        if (BBBPlayback && typeof BBBPlayback.playbackLoaded === "function") {
                            BBBPlayback.playbackLoaded();
                        }
                        that.registerObserver();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                if (AppData._persistentStates.registerData.confirmStatusID === 20) {
                return that.loadData();
                } else {
                    return WinJS.Promise.as();
                }
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



