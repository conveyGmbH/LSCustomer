﻿// controller for page: Conference
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

    var floatingEmojisSymbols = [
        "\u2764",       //"❤️"
        "\ud83d\udc4f", //"👏"
        "\ud83c\udf89", //"🎉"
        "\ud83d\ude42", //"🙂"
        "\ud83e\udd14", //"🤔"
        "\ud83d\ude25"  //"😥"
    ];
    var floatingEmojisMessage = [
        "\u2764",         //"❤️"
        "\\ud83d\\udc4f", //"👏"
        "\\ud83c\\udf89", //"🎉"
        "\\ud83d\\ude42", //"🙂"
        "\\ud83e\\udd14", //"🤔"
        "\\ud83d\\ude25"  //"😥"
    ];

    var magicStart = "&lt;!--";
    var magicStop = "--&gt;";
    var magicStart2 = "&#60;!--";
    var magicStop2 = "--&#62;";
    var magicStartReplace = "&lt;!&#8211;&#8211;";
    var magicStopReplace = "&#8211;&#8211;&gt;";
    var regExprMagicStart =  new RegExp(magicStart, "g");
    var regExprMagicStop =  new RegExp(magicStop, "g");
    var regExprMagicStart2 =  new RegExp(magicStart2, "g");
    var regExprMagicStop2 =  new RegExp(magicStop2, "g");



    function triggerReactOnChange(inputElement) {
        var key = "__reactEventHandlers";
        for (var prop in inputElement) {
            if (inputElement.hasOwnProperty(prop)) {
                if (prop.substr(0,key.length) === key) {
                    var reactEventHandlers = inputElement[prop];
                    if (typeof reactEventHandlers.onChange === "function") {
                        var changeEvent = document.createEvent('event');
                        changeEvent.initEvent('change', true, true);
                        inputElement.dispatchEvent(changeEvent);
                        reactEventHandlers.onChange(changeEvent);
                    }
                }
            }
        }
    }

    WinJS.Namespace.define("Conference", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Conference.Controller.", "eventId=" + (options && options.eventId));

            var videoListDefaults = {
                aspect: 4.0 / 3.0,
                width: 384,
                height: 288,
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
                toggleUserList: null,
                panelWrapperObserver: null,
                pollContentObserver: null,
                selfLabels: ["(Sie)", "(You)"],
                selfName: null
            };

            var emojiToolbarPositionObserver = null;

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
                labelOff: getResourceText("label.off"),
                dataMessage: {
                    name: "",
                    time: "",
                    text: "",
                    chatTs: 0,
                    commandTs: 0,
                    locked: false
                },
                dataNotification: {
                    name: "",
                    time: "",
                    text: "",
                    chatTs: 0,
                    commandTs: 0
                },
                dataQuestionnaire: getEmptyDefaultValue(Conference.questionnaireView.defaultValue)
            }, commandList]);

            var conference = fragmentElement.querySelector("#conference");
            var presenterButtonContainer = fragmentElement.querySelector(".modSession .presenter-button-container");
            var showPresentationToggleContainer = fragmentElement.querySelector(".show-presentation-toggle-container");
            var showVideoListToggleContainer = fragmentElement.querySelector(".show-videolist-toggle-container");
            var pollQuestionContainer = fragmentElement.querySelector("poll-question-container");
            var emojiButtonContainer = fragmentElement.querySelector(".emoji-button-container");
            var emojiToolbar = fragmentElement.querySelector("#emojiToolbar");
            var postNotificationPopup = fragmentElement.querySelector("#postNotificationPopup");
            var notificationPopup = fragmentElement.querySelector("#notificationPopup");
            var chatMenu = fragmentElement.querySelector("#chatMenu");
            var pollQuestion = fragmentElement.querySelector("#pollQuestion");

            var sendResizePromise = null;
            var showUserListPromise = null;
            var adjustContentPositionsPromise = null;
            var checkForInactiveVideoPromise = null;
            var filterUserListPromise = null;
            var observeChatMessageListPromise = null;
            var observePollPromise = null;
            var submitCommandMessagePromise = null;
            var showNotificationPromise = null;
            var hideNotificationPromise = null;
            var setPollingPromise = null;

            var filterUserListFailedCount = 0;
            var showUserListFailedCount = 0;
            var adjustContentPositionsFailedCount = 0;
            var setPollingFailedCount = 0;
            
            var commandQueue = [];
            var deviceList = [];
            var toolboxIds = ["emojiToolbar"];
            var emojiCount = {};
            var lockedChatMessages = {};


            var that = this;

            that.dispose = function () {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (pollQuestion && pollQuestion.winControl) {
                    pollQuestion.winControl.data = null;
                    pollQuestion = null;
                }
                if (sendResizePromise) {
                    sendResizePromise.cancel();
                    sendResizePromise = null;
                }
                if (showUserListPromise) {
                    showUserListPromise.cancel();
                    showUserListPromise = null;
                }
                if (adjustContentPositionsPromise) {
                    adjustContentPositionsPromise.cancel();
                    adjustContentPositionsPromise = null;
                }
                if (checkForInactiveVideoPromise) {
                    checkForInactiveVideoPromise.cancel();
                    checkForInactiveVideoPromise = null;
                }
                if (filterUserListPromise) {
                    filterUserListPromise.cancel();
                    filterUserListPromise = null;
                }
                if (observeChatMessageListPromise) {
                    observeChatMessageListPromise.cancel();
                    observeChatMessageListPromise = null;
                }
                if (submitCommandMessagePromise) {
                    submitCommandMessagePromise.cancel();
                    submitCommandMessagePromise = null;
                }
                if (showNotificationPromise) {
                    showNotificationPromise.cancel();
                    showNotificationPromise = null;
                }
                if (hideNotificationPromise) {
                    hideNotificationPromise.cancel();
                    hideNotificationPromise = null;
                }
                if (observePollPromise) {
                    observePollPromise.cancel();
                    observePollPromise = null;
                }
                if (setPollingPromise) {
                    setPollingPromise.cancel();
                    setPollingPromise = null;
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
                    var reBase = "function rebase(url){if(!url||typeof url!=\"string\"||url.indexOf(\"" + a.hostname + "\")>=0)return url;let p=url.indexOf(\"://\"),q=(p>=0)?url.substr(p+3).substr(url.substr(p+3).indexOf(\"/\")):url;return q};";
                    var newHostname = "(function(){return\"" + a.hostname + "\"})()";
                    var newHref = "(function(){return\"" + a.href + "\"})()";
                    var eGetImageUri = "let t=(function(){" + reBase + "let et=rebase(e.imageUri);Log.print(Log.l.info,\"et=\"+JSON.stringify(et));return et})(),n=e.svgWidth,r=e.svgHeight;";
                    var aGetImageUri = "s,u=(function(){" + reBase + "let au=rebase(a.imageUri);Log.print(Log.l.info,\"au=\"+JSON.stringify(au));return au})(),m=a.content;";
                    var uGetImageUri = "k,{imageUri:(function(){" + reBase + "let uu=rebase(u);Log.print(Log.l.info,\"uu=\"+JSON.stringify(uu));return uu})(),";
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
                        })
                            .then(null,
                                function () {
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
                            promise = getScriptFromSrcXhr(scriptTag.src)
                                .then(function (scriptText) {
                                    n.text = scriptText;
                                })
                                .then(null,
                                    function () {
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
                return null;
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

            var filterUserList = function (noRetry) {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (filterUserListPromise) {
                    filterUserListPromise.cancel();
                    filterUserListPromise = null;
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return;
                }
                var userList = fragmentElement.querySelector(".userList--11btR3");
                if (userList) {
                    if (userListDefaults.onlyModerators) {
                        if (!WinJS.Utilities.hasClass(userList, "only-moderators")) {
                            WinJS.Utilities.addClass(userList, "only-moderators");
                        }
                    } else {
                        if (WinJS.Utilities.hasClass(userList, "only-moderators")) {
                            WinJS.Utilities.removeClass(userList, "only-moderators");
                        }
                    }
                    var moderatorCount = 0;
                    var userListColumn = userList.querySelector(".userListColumn--6vKQL");
                    if (userListColumn) {
                        var participantsList = userListColumn.querySelectorAll(".participantsList--1MvMwF");
                        if (participantsList) {
                            var i = 0, participantsListEntry = null, userNameMainSelfLabel = null, userName = null, avatar = null, style = null, rgbColor = null;
                            if (userListDefaults.onlyModerators) {
                                for (i = participantsList.length - 1; i >= 0; i--) {
                                    participantsListEntry = participantsList[i];
                                    if (participantsListEntry) {
                                        var userIsMyself = false;
                                        if (!userListDefaults.selfName) {
                                            userNameMainSelfLabel = participantsListEntry.querySelector(".userNameMain--2fo2zM > i");
                                            if (userNameMainSelfLabel && typeof userNameMainSelfLabel.textContent === "string" &&
                                                userListDefaults.selfLabels.indexOf(userNameMainSelfLabel.textContent) >= 0 &&
                                                userNameMainSelfLabel.previousElementSibling) {
                                                userName = userNameMainSelfLabel.previousElementSibling.textContent;
                                                if (typeof userName === "string") {
                                                    userListDefaults.selfName = userName.replace(/&nbsp;/g, " ").trim();
                                                    avatar = participantsListEntry.querySelector(".avatar--Z2lyL8K");
                                                    if (avatar) {
                                                        style = window.getComputedStyle(avatar);
                                                        if (style) {
                                                            userListDefaults.selfColor = style.backgroundColor;
                                                            if (userListDefaults.selfColor && userListDefaults.selfColor.substr(0, 4) === "rgb(") {
                                                                rgbColor = Colors.rgbStr2rgb(userListDefaults.selfColor);
                                                                userListDefaults.selfChatColor = "rgba(" + rgbColor.r + ", " + rgbColor.g + ", " + rgbColor.b + ", 0.2) !important";
                                                                Colors.changeCSS(".from-myself .messages--Z2vq9Jh p", "background-color", userListDefaults.selfChatColor);
                                                            }
                                                        }
                                                    }
                                                    userIsMyself = true;
                                                }
                                            }
                                        }
                                        if (!participantsListEntry.querySelector(".moderator--24bqCT")) {
                                            if (!userIsMyself) {
                                                try {
                                                    while (participantsListEntry.firstElementChild) {
                                                        participantsListEntry.removeChild(participantsListEntry.firstElementChild);
                                                    }
                                                } catch (ex) {
                                                    Log.print(Log.l.trace, "participantsList[" + i + "] is not a child entry of userList");
                                                }
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
                            } else if (!userListDefaults.selfName) {
                                for (i = 0; i < participantsList.length; i++ ) {
                                    participantsListEntry = participantsList[i];
                                    if (participantsListEntry) {
                                        userNameMainSelfLabel = participantsListEntry.querySelector(".userNameMain--2fo2zM > i");
                                        if (userNameMainSelfLabel && typeof userNameMainSelfLabel.textContent === "string" &&
                                            userListDefaults.selfLabels.indexOf(userNameMainSelfLabel.textContent) >= 0 &&
                                            userNameMainSelfLabel.previousElementSibling) {
                                            userName = userNameMainSelfLabel.previousElementSibling.textContent;
                                            if (typeof userName === "string") {
                                                userListDefaults.selfName = userName.replace(/&nbsp;/g, " ").trim();
                                                avatar = participantsListEntry.querySelector(".avatar--Z2lyL8K");
                                                if (avatar) {
                                                    style = window.getComputedStyle(avatar);
                                                    if (style) {
                                                        userListDefaults.selfColor = style.backgroundColor;
                                                        if (userListDefaults.selfColor && userListDefaults.selfColor.substr(0, 4) === "rgb(") {
                                                            rgbColor = Colors.rgbStr2rgb(userListDefaults.selfColor);
                                                            userListDefaults.selfChatColor = "rgba(" + rgbColor.r + ", " + rgbColor.g + ", " + rgbColor.b + ", 0.2) !important";
                                                            Colors.changeCSS(".from-myself .messages--Z2vq9Jh p", "background-color", userListDefaults.selfChatColor);
                                                        }
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        var participantsListParent = userListColumn.querySelector(".list--Z2pj65C");
                        if (participantsListParent && participantsListParent.firstElementChild &&
                            !userListDefaults.userListObserver) {
                            userListDefaults.userListObserver = new MutationObserver(function (mutationList, observer) {
                                WinJS.Promise.timeout(0).then(function () {
                                    if (mutationList) {
                                        for (var i = 0; i < mutationList.length; i++) {
                                            var mutation = mutationList[i];
                                            if (mutation && mutation.type === "childList" &&
                                                mutation.addedNodes && mutation.addedNodes.length > 0) {
                                                that.filterUserList(true);
                                                break;
                                            }
                                        }
                                    }
                                });
                            });
                            if (userListDefaults.userListObserver) {
                                userListDefaults.userListObserver.observe(participantsListParent.firstElementChild, {
                                    childList: true
                                });
                            }
                        }
                    }
                } else if (!noRetry) {
                    filterUserListFailedCount++;
                    Log.print(Log.l.trace, "not yet created - try later again! filterUserListFailedCount=" + filterUserListFailedCount);
                    filterUserListPromise = WinJS.Promise.timeout(Math.min(filterUserListFailedCount * 10, 5000)).then(function () {
                        that.filterUserList();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.filterUserList = filterUserList;

            var showUserList = function (show, onlyModerators) {
                var ret = null;
                Log.call(Log.l.trace, "Conference.Controller.", "show=" + show + " onlyModerators=" + onlyModerators);
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return null;
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
                if (showUserListPromise) {
                    showUserListPromise.cancel();
                    showUserListPromise = null;
                }
                var btnToggleUserList = fragmentElement.querySelector(".btn--Z25OApd");
                if (btnToggleUserList) {
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
                }
                if (ret === null) {
                    showUserListFailedCount++;
                    Log.print(Log.l.trace, "not yet created - try later again! showUserListFailedCount=" + showUserListFailedCount);
                    showUserListPromise = WinJS.Promise.timeout(Math.min(showUserListFailedCount * 10, 5000)).then(function () {
                        that.showUserList(show, onlyModerators);
                    });
                } else {
                    showUserListFailedCount = 0;
                }
                Log.ret(Log.l.trace);
                return ret;
            }
            this.showUserList = showUserList;

            var updateQuestionSelection = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (observePollPromise) {
                    observePollPromise.cancel();
                    observePollPromise = null;
                }
                var pollSection = fragmentElement.querySelector(".poll--Z1w6wQt");
                if (pollSection &&
                    pollSection.parentElement &&
                    pollQuestion &&
                    pollQuestion.winControl &&
                    pollQuestion.winControl.data &&
                    pollQuestion.winControl.data.length > 1) {
                    var publishButton = pollSection.querySelector(".status--1gjKnt ~ .primary--1IbqAO");
                    if (publishButton) {
                        if (!WinJS.Utilities.hasClass(pollSection, "poll-results")) {
                            WinJS.Utilities.addClass(pollSection, "poll-results");
                        }
                        pollQuestion.selectedIndex = 0;
                        that.binding.dataQuestionnaire = getEmptyDefaultValue(Conference.questionnaireView.defaultValue);
                    } else {
                        var customBtn = pollSection.querySelector(".customBtn--Z8fMMN");
                        if (customBtn) {
                            if (WinJS.Utilities.hasClass(pollSection, "poll-results")) {
                                WinJS.Utilities.removeClass(pollSection, "poll-results");
                            }
                            if (pollQuestion.parentElement &&
                                pollQuestion.parentElement.parentElement !== customBtn.parentElement) {
                                customBtn.parentElement.insertBefore(pollQuestion.parentElement, customBtn);
                            }
                            var ariaExpanded = customBtn.getAttribute("aria-expanded");
                            if (ariaExpanded === "false") {
                                customBtn.click();
                            }
                            var startCustomPollBtn = pollSection.querySelector(".customInputWrapper--Z2wG4AP .primary--1IbqAO");
                            if (startCustomPollBtn) {
                                var ariaDisabled = startCustomPollBtn.getAttribute("aria-disabled");
                                if (ariaDisabled === "true") {
                                    pollQuestion.selectedIndex = 0;
                                    that.binding.dataQuestionnaire = getEmptyDefaultValue(Conference.questionnaireView.defaultValue);
                                }
                            }
                        } else {
                            if (WinJS.Utilities.hasClass(pollSection, "poll-results")) {
                                WinJS.Utilities.removeClass(pollSection, "poll-results");
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace);
            }
            that.updateQuestionSelection = updateQuestionSelection;

            var createQuestionSelection = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                var pollSection = fragmentElement.querySelector(".poll--Z1w6wQt");
                if (pollSection && pollSection.parentElement &&
                    pollQuestion && pollQuestion.winControl &&
                    pollQuestion.winControl.data &&
                    pollQuestion.winControl.data.length > 1) {
                    if (!WinJS.Utilities.hasClass(pollSection, "poll-question-selection")) {
                        WinJS.Utilities.addClass(pollSection, "poll-question-selection");
                    }
                    if (!userListDefaults.pollContentObserver) {
                        userListDefaults.pollContentObserver = new MutationObserver(function (mutationList, observer) {
                            if (mutationList) {
                                for (var i = 0; i < mutationList.length; i++) {
                                    var mutation = mutationList[i];
                                    if (mutation && mutation.type === "childList" &&
                                        mutation.addedNodes && mutation.addedNodes.length > 0) {
                                        if (!observePollPromise) {
                                            observePollPromise = WinJS.Promise.timeout(20).then(function() {
                                                that.updateQuestionSelection();
                                            });
                                        }
                                        break;
                                    }
                                }
                            }
                        });
                        userListDefaults.pollContentObserver.observe(pollSection, {
                            childList: true,
                            subtree: true
                        });
                    }
                    observePollPromise = WinJS.Promise.timeout(20).then(function() {
                        that.updateQuestionSelection();
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.createQuestionSelection = createQuestionSelection;

            var removeQuestionSelection = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (userListDefaults.pollContentObserver) {
                    userListDefaults.pollContentObserver.disconnect();
                    userListDefaults.pollContentObserver = null;
                }
                if (pollQuestionContainer && pollQuestion.parentElement &&
                    pollQuestion.parentElement.parentElement !== pollQuestionContainer) {
                    pollQuestionContainer.appendChild(pollQuestion.parentElement);
                }
                Log.ret(Log.l.trace);
            }
            that.removeQuestionSelection = removeQuestionSelection;

            var handlePanelsOpened = function(addedNodes) {
                var i;
                Log.call(Log.l.trace, "Conference.Controller.");
                if (addedNodes && addedNodes.length > 0) {
                    var panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                    for (i = 0; i < addedNodes.length; i++) {
                        var addedNode = addedNodes[i];
                        if (addedNode && addedNode.firstElementChild) {
                            if (WinJS.Utilities.hasClass(addedNode.firstElementChild, "userList--11btR3")) {
                                Log.print(Log.l.trace, "userList panel opened" );
                                if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                                    if (!filterUserListPromise) {
                                        filterUserListFailedCount = 0;
                                        filterUserListPromise = WinJS.Promise.timeout(0).then(function () {
                                            that.filterUserList();
                                        });
                                    }
                                }
                            } else if (WinJS.Utilities.hasClass(addedNode.firstElementChild, "chat--Z1w8gP7")) {
                                Log.print(Log.l.trace, "chat panel opened" );
                                if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                                    if (!observeChatMessageListPromise) {
                                        observeChatMessageListPromise = WinJS.Promise.timeout(50).then(function () {
                                            that.observeChatMessageList();
                                        });
                                    }
                                }
                            } else if (WinJS.Utilities.hasClass(addedNode.firstElementChild, "poll--Z1w6wQt")) {
                                Log.print(Log.l.trace, "poll panel opened" );
                                that.createQuestionSelection();
                            } else {
                                Log.print(Log.l.trace, "other panel opened");
                            }
                        }
                    }
                    WinJS.Promise.as().then(function () {
                        if (!adjustContentPositionsPromise) {
                            adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function () {
                                that.adjustContentPositions();
                            });
                        }
                        return WinJS.Promise.timeout(250);
                    }).then(function () {
                        that.sendResize(50);
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.handlePanelsOpened = handlePanelsOpened;

            var handlePanelsClosed = function(removedNodes) {
                var i;
                Log.call(Log.l.trace, "Conference.Controller.");
                if (removedNodes && removedNodes.length > 0) {
                    for (i = 0; i < removedNodes.length; i++) {
                        var removedNode = removedNodes[i];
                        if (removedNode && removedNode.firstElementChild) {
                            if (WinJS.Utilities.hasClass(removedNode.firstElementChild, "userList--11btR3")) {
                                Log.print(Log.l.trace, "userList panel closed");
                                if (userListDefaults.userListObserver) {
                                    userListDefaults.userListObserver.disconnect();
                                    userListDefaults.userListObserver = null;
                                }
                                if (filterUserListPromise) {
                                    filterUserListPromise.cancel();
                                    filterUserListPromise = null;
                                }
                            } else if (WinJS.Utilities.hasClass(removedNode.firstElementChild, "chat--Z1w8gP7")) {
                                Log.print(Log.l.trace, "chat panel closed");
                                if (observeChatMessageListPromise) {
                                    observeChatMessageListPromise.cancel();
                                    observeChatMessageListPromise = null;
                                }
                            } else if (WinJS.Utilities.hasClass(removedNode.firstElementChild, "poll--Z1w6wQt")) {
                                Log.print(Log.l.trace, "poll panel closed");
                                that.removeQuestionSelection();
                            } else {
                                Log.print(Log.l.trace, "other panel closed");

                            }
                        }
                    }
                    WinJS.Promise.as().then(function () {
                        if (!adjustContentPositionsPromise) {
                            adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function () {
                                that.adjustContentPositions();
                            });
                        }
                        return WinJS.Promise.timeout(250);
                    }).then(function () {
                        that.sendResize(50);
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.handlePanelsClosed = handlePanelsClosed;
            
            var markupLockedMessages = function (addedNodes) {
                var messageList = fragmentElement.querySelector("#chat-messages.messageList--hsNac");
                if (messageList) {
                    var counter = 0, i, messageElement;
                    var elementCount = addedNodes ? addedNodes.length : messageList.childElementCount;
                    var item = addedNodes ? addedNodes[0] : messageList.firstElementChild;
                    while (counter < elementCount && item) {
                        if (item.parentElement === messageList &&
                            WinJS.Utilities.hasClass(item, "item--ZDfG6l")) {
                            var nameElement = null;
                            if (userListDefaults.selfName) {
                                nameElement = item.querySelector(".meta--ZDfdOI .name--ZDf6TQ span, .meta--ZDfdOI .logout--21XEjn > span");
                                if (nameElement && nameElement.textContent === userListDefaults.selfName) {
                                    if (!WinJS.Utilities.hasClass(item, "from-myself")) {
                                        WinJS.Utilities.addClass(item, "from-myself");
                                    }
                                    /*if (userListDefaults.selfChatColor) {
                                        var chatMessageParagraphs = item.querySelectorAll(".messages--Z2vq9Jh > p");
                                        if (chatMessageParagraphs) {
                                            for (var j = 0; j < chatMessageParagraphs.length; j++) {
                                                var chatMessageParagraph = chatMessageParagraphs[j];
                                                if (chatMessageParagraph && chatMessageParagraph.style) {
                                                    chatMessageParagraph.style.backgroundColor = userListDefaults.selfChatColor;
                                                }
                                            }
                                        }
                                    }*/
                                }
                            }
                            var messageElements = null;
                            var isLocked = false;
                            var timeElement = item.querySelector(".meta--ZDfdOI .time--ZDehNy");
                            if (timeElement && timeElement.dateTime) {
                                var date = new Date(timeElement.dateTime);
                                var chatTs = date.getTime();
                                if (lockedChatMessages[chatTs]) {
                                    if (!nameElement) {
                                        nameElement = item.querySelector(".meta--ZDfdOI .name--ZDf6TQ span, .meta--ZDfdOI .logout--21XEjn > span");
                                    }
                                    if (nameElement) {
                                        var message = {
                                            name: nameElement.textContent,
                                            chatTs: chatTs
                                        }
                                        if (that.existsChatMessageTsName(message)) {
                                            message.text = "";
                                            var lineCount = 0;
                                            if (item._lockedContent) {
                                                lineCount = item._lockedContent.length;
                                            } else {
                                                messageElements = item.querySelectorAll(".message--Z2n2nXu");
                                                lineCount = messageElements && messageElements.length;
                                            }
                                            for (i = 0; i < lineCount; i++) {
                                                if (message.text) {
                                                    message.text += "\n";
                                                }
                                                message.text += item._lockedContent ? item._lockedContent[i] : 
                                                    (messageElements && messageElements[i] ? messageElements[i].textContent : "");
                                            }
                                            if (that.isChatMessageLocked(message)) {
                                                isLocked = true;
                                            }
                                        }
                                    }
                                }
                            }
                            if (isLocked && !WinJS.Utilities.hasClass(item, "chat-message-locked")) {
                                WinJS.Utilities.addClass(item, "chat-message-locked");
                                if (!item._lockedContent) {
                                    if (!messageElements) {
                                        messageElements = item.querySelectorAll(".message--Z2n2nXu");
                                    }
                                    if (messageElements) {
                                        item._lockedContent = [];
                                        for (i = 0; i < messageElements.length; i++) {
                                            messageElement = messageElements[i];
                                            if (messageElement) {
                                                item._lockedContent.push(messageElement.textContent);
                                                if (!i) {
                                                    messageElement.textContent = getResourceText("event.lockedMessage");
                                                } else {
                                                    messageElement.textContent = "";
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (!isLocked && WinJS.Utilities.hasClass(item, "chat-message-locked")) {
                                WinJS.Utilities.removeClass(item, "chat-message-locked");
                                if (item._lockedContent) {
                                    if (!messageElements) {
                                        messageElements = item.querySelectorAll(".message--Z2n2nXu");
                                    }
                                    if (messageElements) {
                                        for (i = 0; i < messageElements.length && i < item._lockedContent.length; i++) {
                                            messageElement = messageElements[i];
                                            if (messageElement) {
                                                messageElement.textContent = item._lockedContent[i];
                                            }
                                        }                                
                                    }
                                    delete item._lockedContent;
                                }
                            }
                        }
                        counter++;
                        item = addedNodes ? addedNodes[counter] : item.nextElementSibling;
                    }
                }
            }
            that.markupLockedMessages = markupLockedMessages;

            var observeChatMessageList = function () {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (observeChatMessageListPromise) {
                    observeChatMessageListPromise.cancel();
                    observeChatMessageListPromise = null;
                }
                var messageList = fragmentElement.querySelector("#chat-messages.messageList--hsNac");
                if (messageList) {
                    if (AppBar.scope.element && AppBar.scope.element.id === "modSessionController" &&
                        !messageList._onClickHandler) {
                        messageList._onClickHandler = function (event) {
                            if (event && event.currentTarget === messageList) {
                                var target = event.target;
                                if (target && event.currentTarget !== target) {
                                    if (target.parentElement === messageList ||
                                        target.parentElement.parentElement === messageList) {
                                        var item;
                                        if (target.parentElement.parentElement === messageList) {
                                            item = target.parentElement;
                                        } else {
                                            item = target;
                                        }
                                        var locked = WinJS.Utilities.hasClass(item, "chat-message-locked");
                                        var nameElement = item.querySelector(".meta--ZDfdOI .name--ZDf6TQ span, .meta--ZDfdOI .logout--21XEjn > span");
                                        var timeElement = item.querySelector(".meta--ZDfdOI .time--ZDehNy");
                                        var messageElements = item.querySelectorAll(".message--Z2n2nXu");
                                        if (nameElement && timeElement && messageElements) {
                                            var date = null;
                                            try {
                                                date = new Date(timeElement.dateTime);
                                            } catch (ex) {
                                                Log.print(Log.l.error, "Exception in message handling dateTime=" + timeElement.dateTime);
                                            }
                                            var message = {
                                                event: event,
                                                name: nameElement.textContent,
                                                time: date ? date.getHours() + ":" + date.getMinutes() : "",
                                                chatTs: date ? date.getTime() : 0,
                                                commandTs: Date.now(),
                                                text: "",
                                                locked: locked
                                            }
                                            var lineCount;
                                            if (item._lockedContent) {
                                                lineCount = item._lockedContent.length;
                                            } else {
                                                messageElements = item.querySelectorAll(".message--Z2n2nXu");
                                                lineCount = messageElements && messageElements.length;
                                            }
                                            for (var i = 0; i < lineCount; i++) {
                                                if (message.text) {
                                                    message.text += "\n";
                                                }
                                                message.text += locked ? (item._lockedContent && item._lockedContent[i]) : 
                                                    (messageElements && messageElements[i] ? messageElements[i].textContent : "");
                                            }
                                            WinJS.Promise.timeout(0).then(function () {
                                                that.eventHandlers.clickChatMessageList(message);
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        messageList.addEventListener('click', messageList._onClickHandler.bind(messageList), false);
                    }
                    if (!messageList._chatMessagesObserver) {
                        messageList._chatMessagesObserver = new MutationObserver(function (mutationList, observer) {
                            for (var i = 0; i < mutationList.length; i++) {
                                var mutation = mutationList[i];
                                if (mutation && mutation.type === "childList" &&
                                    mutation.addedNodes && mutation.addedNodes.length > 0) {
                                    Log.print(Log.l.trace, "chat messageList changed!");
                                    that.markupLockedMessages(mutation.addedNodes);
                                }
                            }
                        });
                        messageList._chatMessagesObserver.observe(messageList, {
                            childList: true
                        });
                    }
                    WinJS.Promise.timeout(0).then(function() {
                        that.markupLockedMessages();
                    });
                //} else {
                //    observeChatMessageListPromise = WinJS.Promise.timeout(50).then(function () {
                //        that.observeChatMessageList();
                //    });
                }
            }
            that.observeChatMessageList = observeChatMessageList;

            var onWheelSvg = function (event) {
                if (event) {
                    event.preventDefault();
                }
            }
            that.onWheelSvg = null;

            var adjustVideoPosition = function (mediaContainer, overlayElement, videoListItem) {
                Log.call(Log.l.trace, "Conference.Controller.");
                var video = videoListItem.querySelector("video");
                if (video && video.style) {
                    var presenterModeTiledIsSet = false;
                    var presenterModeSmallIsSet = false;
                    var videoOverlayIsRightIsSet = false;
                    if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                        videoOverlayIsRightIsSet = true;
                    }
                    if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                        presenterModeTiledIsSet = true;
                    } else if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-small")) {
                        presenterModeSmallIsSet = true;
                    }
                    if (!WinJS.Utilities.hasClass(videoListItem, "selfie-video") &&
                        deviceList && deviceList.length > 0) {
                        var mediaStream = video.srcObject;
                        if (mediaStream && typeof mediaStream.getVideoTracks === "function") {
                            var videoTrack = mediaStream.getVideoTracks() ? mediaStream.getVideoTracks()[0] : null;
                            if (videoTrack && typeof videoTrack.getSettings === "function") {
                                var settings = videoTrack.getSettings();
                                for (var j = 0; j < deviceList.length; j++) {
                                    if (deviceList[j].deviceId === settings.deviceId) {
                                        Log.print(Log.l.trace, "found local " + deviceList[j].kind + ":" + deviceList[j].label + " with deviceId=" + deviceList[j].deviceId);
                                        WinJS.Utilities.addClass(videoListItem, "selfie-video");
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (WinJS.Utilities.hasClass(videoListItem, "selfie-video")) {
                        var userName = videoListItem.querySelector(".userName--ZsKYfV, .dropdownTrigger--Z1Fp5dg");
                        if (userName) {
                            if (!userName.firstElementChild) {
                                var iLabel = document.createElement("i");
                                iLabel.innerHTML = "&nbsp;(" + getResourceText("label.you") + ")";
                                userName.appendChild(iLabel);
                            }
                        }
                    }
                    var isHidden = false;
                    if (WinJS.Utilities.hasClass(videoListItem, "inactive-video-hidden")) {
                        isHidden = true;
                    }
                    if ((presenterModeTiledIsSet || presenterModeSmallIsSet) && !isHidden) {
                        var left = (overlayElement.clientWidth - (overlayElement.clientHeight * video.videoWidth / video.videoHeight)) / 2;
                        var width;
                        if (left < 0) {
                            video.style.left = left.toString() + "px";
                            video.style.right = "";
                            width = overlayElement.clientWidth;
                            videoListItem.style.marginLeft = "";
                        } else {
                            video.style.left = "0";
                            video.style.right = "";
                            width = overlayElement.clientWidth - 2 * left;
                            if (videoOverlayIsRightIsSet) {
                                videoListItem.style.marginLeft = Math.abs(left).toString() + "px";;
                            } else {
                                videoListItem.style.marginLeft = "";
                            }
                        }
                        videoListItem.style.width = width.toString() + "px";
                    } else {
                        video.style.left = "";
                        video.style.right = "";
                        videoListItem.style.width = "";
                        videoListItem.style.marginLeft = "";
                    }
                }
                Log.ret(Log.l.trace);
            }
            that.adjustVideoPosition = adjustVideoPosition;

            var lastDeviceListTime = 0;
            var adjustContentPositions = function () {
                var pageControllerName = AppBar.scope.element && AppBar.scope.element.id;
                var actionsBarRight = null;
                var direction = videoListDefaults.direction;
                Log.call(Log.l.trace, "Conference.Controller.", "direction=" + direction);
                if (adjustContentPositionsPromise) {
                    adjustContentPositionsPromise.cancel();
                    adjustContentPositionsPromise = null;
                }
                if (!direction) {
                    Log.ret(Log.l.trace, "extra ignored");
                    return WinJS.Promise.as();
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return WinJS.Promise.as();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    var deviceListTime = Date.now();
                    if (deviceListTime - lastDeviceListTime > 30000 &&
                        typeof navigator.mediaDevices === "object" &&
                        typeof navigator.mediaDevices.enumerateDevices === "function") {
                        lastDeviceListTime = deviceListTime;
                        return navigator.mediaDevices.enumerateDevices();
                    } else {
                        return WinJS.Promise.as();
                    }
                }).then(function (newDeviceList) {
                    if (newDeviceList && typeof newDeviceList.filter === "function" &&
                        deviceList !== newDeviceList) {
                        deviceList = newDeviceList.filter(function (device) {
                            return device.kind === "videoinput";
                        });
                    }
                    var videoPLayerOpened = false;
                    var screenShareOpened = false;
                    var presentationOpened = false;
                    var videoPlayer = fragmentElement.querySelector(".videoPlayer--1MGUuy");
                    if (videoPlayer && videoPlayer.firstElementChild) {
                        videoPLayerOpened = true;
                        var videoElement = videoPlayer.firstElementChild;
                        var fullScreenButton = null;
                        if (pageControllerName === "eventController") {
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
                                fullScreenButton.onclick = function (event) {
                                    if (videoPlayer && document.fullscreenEnabled) {
                                        // detect fullscreen state
                                        if (videoPlayer.parentElement.querySelector(':fullscreen') === videoPlayer) {
                                            document.exitFullscreen();
                                        } else {
                                            videoPlayer.requestFullscreen();
                                        }
                                    }
                                }
                                that.addRemovableEventListener(document, "fullscreenchange", function () {
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
                        } else {
                            Log.print(Log.l.trace, "videoPlayer not ready yet!");
                            if (!adjustContentPositionsPromise) {
                                adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function () {
                                    that.adjustContentPositions();
                                });
                            }
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
                    var panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                    if (panelWrapper) {
                        if (!userListDefaults.panelWrapperObserver) {
                            userListDefaults.panelWrapperObserver = new MutationObserver(function (mutationList, observer) {
                                for (var i = 0; i < mutationList.length; i++) {
                                    var mutation = mutationList[i];
                                    if (mutation && mutation.type === "childList") {
                                        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                                            Log.print(Log.l.trace, "panelWrapper children added!");
                                            that.handlePanelsOpened(mutation.addedNodes);
                                        }
                                        if (mutation.removedNodes && mutation.removedNodes.length > 0) {
                                            Log.print(Log.l.trace, "panelWrapper children removed!");
                                            that.handlePanelsClosed(mutation.removedNodes);
                                        }
                                    }
                                }
                            });
                            userListDefaults.panelWrapperObserver.observe(panelWrapper, {
                                childList: true
                            });
                        }
                        var mediaContainer = panelWrapper.querySelector(".container--ZmRztk");
                        if (mediaContainer) {
                            if (!videoListDefaults.mediaContainerObserver) {
                                videoListDefaults.mediaContainerObserver = new MutationObserver(function (mutationList, observer) {
                                    Log.print(Log.l.trace, "mediaContainer childList/class changed!");
                                    WinJS.Promise.as().then(function () {
                                        if (!adjustContentPositionsPromise) {
                                            adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                                                that.adjustContentPositions();
                                            });
                                        }
                                        return WinJS.Promise.timeout(50);
                                    }).then(function () {
                                        that.sendResize(20);
                                    });
                                });
                                videoListDefaults.mediaContainerObserver.observe(mediaContainer, {
                                    childList: true,
                                    attributeFilter: ["class"]
                                });
                            }
                            var content = mediaContainer.querySelector(".content--Z2gO9GE");
                            if (!videoListDefaults.contentObserver) {
                                videoListDefaults.contentObserver = new MutationObserver(function (mutationList, observer) {
                                    Log.print(Log.l.trace, "content childList changed!");
                                    if (!adjustContentPositionsPromise) {
                                        adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
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
                                            actionsBarRight = panelWrapper.querySelector(".actionsbar--Z1mcyA0 .right--DUFDc");
                                            if (actionsBarRight && actionsBarRight.lastElementChild !== showVideoListToggleContainer) {
                                                actionsBarRight.appendChild(showVideoListToggleContainer);
                                                showVideoListToggleContainer.style.display = "inline-block";
                                            }
                                        }
                                    }
                                    if (!videoListDefaults.videoListObserver) {
                                        videoListDefaults.videoListObserver = new MutationObserver(function (mutationList, observer) {
                                            mutationList.forEach(function (mutation) {
                                                switch (mutation.type) {
                                                    case "attributes":
                                                        Log.print(Log.l.trace, "videoList attributes changed!");
                                                        if (!checkForInactiveVideoPromise) {
                                                            checkForInactiveVideoPromise = WinJS.Promise.timeout(250).then(function () {
                                                                that.checkForInactiveVideo();
                                                            });
                                                        }
                                                        break;
                                                    case "childList":
                                                        Log.print(Log.l.trace, "videoList childList changed!");
                                                        if (!adjustContentPositionsPromise) {
                                                            adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                                                                that.adjustContentPositions();
                                                            });
                                                        }
                                                        break;
                                                }
                                            });
                                        });
                                        videoListDefaults.videoListObserver.observe(videoList, {
                                            childList: true,
                                            attributeFilter: ["class"],
                                            subtree: true
                                        });
                                    }
                                    var numVideos;
                                    if (videoListDefaults.hideInactive || videoListDefaults.hideMuted) {
                                        numVideos = videoListDefaults.activeVideoCount;
                                    } else {
                                        numVideos = videoList.childElementCount;
                                    }
                                    if (numVideos > 0) {
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-empty")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-empty");
                                        }
                                    } else {
                                        if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-empty")) {
                                            WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-empty");
                                        }
                                    }
                                    var videoListItem = videoList.firstElementChild;
                                    if (!content ||
                                        direction === videoListDefaults.default ||
                                        WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium") ||
                                        !(videoPLayerOpened || screenShareOpened || presentationOpened && !overlayIsHidden)) {
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
                                        while (videoListItem) {
                                            if (videoListItem.style) {
                                                videoListItem.style.gridColumn = "";
                                                videoListItem.style.gridRow = "";
                                            }
                                            videoListItem = videoListItem.nextSibling;
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
                                        var imageScale = 1;
                                        if (WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-biggest")) {
                                            imageScale = 0.5;
                                        }
                                        var videoHeight = videoListDefaults.height * imageScale;
                                        var heightFullSize = numVideos * videoHeight;
                                        if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode") && heightFullSize > videoList.clientHeight) {
                                            if (!WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                                WinJS.Utilities.addClass(videoList, "video-list-double-columns");
                                            }
                                            var heightHalfSize = Math.floor(numVideos / 2.0 + 0.5) * videoHeight / 2;
                                            var resCount = Math.floor((videoList.clientHeight - heightHalfSize) / videoHeight);
                                            var curCount = 0;
                                            while (videoListItem) {
                                                if (videoListItem.style) {
                                                    if (!WinJS.Utilities.hasClass(videoListItem, "inactive-video-hidden") &&
                                                        curCount < resCount) {
                                                        videoListItem.style.gridColumn = "span 2";
                                                        videoListItem.style.gridRow = "span 2";
                                                        curCount++;
                                                    } else {
                                                        videoListItem.style.gridColumn = "";
                                                        videoListItem.style.gridRow = "";
                                                    }
                                                }
                                                videoListItem = videoListItem.nextSibling;
                                            }
                                        } else {
                                            while (videoListItem) {
                                                if (videoListItem.style) {
                                                    videoListItem.style.gridColumn = "";
                                                    videoListItem.style.gridRow = "";
                                                }
                                                videoListItem = videoListItem.nextSibling;
                                            }
                                            if (WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                                WinJS.Utilities.removeClass(videoList, "video-list-double-columns");
                                            }
                                        }
                                    }
                                    adjustContentPositionsFailedCount = 0;
                                } else {
                                    if (videoListDefaults.videoListObserver) {
                                        videoListDefaults.videoListObserver.disconnect();
                                        videoListDefaults.videoListObserver = null;
                                    }
                                    adjustContentPositionsFailedCount++;
                                    Log.print(Log.l.trace, "videoList not yet created - try later again! adjustContentPositionsFailedCount=" + adjustContentPositionsFailedCount);
                                    if (!adjustContentPositionsPromise) {
                                        adjustContentPositionsPromise = WinJS.Promise.timeout(Math.min(adjustContentPositionsFailedCount * 10, 5000)).then(function () {
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
                        } else {
                            if (videoListDefaults.mediaContainerObserver) {
                                videoListDefaults.mediaContainerObserver.disconnect();
                                videoListDefaults.mediaContainerObserver = null;
                            }
                            adjustContentPositionsFailedCount++;
                            Log.print(Log.l.trace, "mediaContainer not yet created - try later again! adjustContentPositionsFailedCount=" + adjustContentPositionsFailedCount);
                            if (!adjustContentPositionsPromise) {
                                adjustContentPositionsPromise = WinJS.Promise.timeout(Math.min(that.adjustContentPositionsFailedCount * 10, 5000)).then(function () {
                                    that.adjustContentPositions();
                                });
                            }
                        }
                        var closeDescButton = fragmentElement.querySelector(elementSelectors.closeDesc);
                        if (closeDescButton) {
                            if (!videoListDefaults.closeDesc) {
                                videoListDefaults.closeDesc = closeDescButton.onclick;
                                closeDescButton.onclick = that.eventHandlers.clickCloseDesc;
                            }
                        } else {
                            videoListDefaults.closeDesc = null;
                        }
                        var restoreDescButton = fragmentElement.querySelector(elementSelectors.restoreDesc);
                        if (restoreDescButton) {
                            if (!videoListDefaults.restoreDesc) {
                                videoListDefaults.restoreDesc = restoreDescButton.onclick;
                                restoreDescButton.onclick = that.eventHandlers.clickRestoreDesc;
                            }
                        } else {
                            videoListDefaults.restoreDesc = null;
                        }
                        if (pageControllerName === "eventController") {
                            var actionsBarCenter = fragmentElement.querySelector(".actionsbar--Z1mcyA0 .center--ZyfFaC");
                            if (actionsBarCenter && emojiButtonContainer && emojiToolbar &&
                                actionsBarCenter.lastElementChild !== emojiToolbar) {
                                var audioControlsContainer = actionsBarCenter.querySelector(".container--1hUthh");
                                if (audioControlsContainer) {
                                    emojiToolbarPositionObserver = new MutationObserver(function (mutationList, observer) {
                                        if (audioControlsContainer.childElementCount === 2) {
                                            if (!WinJS.Utilities.hasClass(actionsBarCenter, "wide-audio-container")) {
                                                WinJS.Utilities.addClass(actionsBarCenter, "wide-audio-container");
                                            }
                                        } else {
                                            if (WinJS.Utilities.hasClass(actionsBarCenter, "wide-audio-container")) {
                                                WinJS.Utilities.removeClass(actionsBarCenter, "wide-audio-container");
                                            }
                                        }
                                    });
                                    emojiToolbarPositionObserver.observe(audioControlsContainer, {
                                        childList: true
                                    });
                                }
                                actionsBarCenter.appendChild(emojiButtonContainer);
                                emojiButtonContainer.style.display = "inline-block";
                                actionsBarCenter.appendChild(emojiToolbar);
                            }
                        }
                    } else {
                        adjustContentPositionsFailedCount++;
                        Log.print(Log.l.trace, "panelWrapper not yet created - try later again! adjustContentPositionsFailedCount=" + adjustContentPositionsFailedCount);
                        if (!adjustContentPositionsPromise) {
                            adjustContentPositionsPromise = WinJS.Promise.timeout(Math.min(that.adjustContentPositionsFailedCount * 10, 5000)).then(function () {
                                that.adjustContentPositions();
                            });
                        }
                    }
                    return WinJS.Promise.timeout(20);
                }).then(function () {
                    var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                    if (mediaContainer) {
                        var overlayElement = mediaContainer.querySelector(".overlay--nP1TK, .hideOverlay--Z13uLxg, .video-overlay-left, .video-overlay-right, .video-overlay-top");
                        if (overlayElement) {
                            var videoList = mediaContainer.querySelector(".videoList--1OC49P");
                            if (videoList) {
                                var videoListItem = videoList.firstElementChild;
                                while (videoListItem) {
                                    that.adjustVideoPosition(mediaContainer, overlayElement, videoListItem);
                                    videoListItem = videoListItem.nextSibling;
                                }
                            }
                        }
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.adjustContentPositions = adjustContentPositions;

            var checkForInactiveVideo = function () {
                var videoList = null;
                var hideInactive = videoListDefaults.hideInactive;
                var hideMuted = videoListDefaults.hideMuted;
                Log.call(Log.l.trace, "Conference.Controller.", "hideInactive=" + hideInactive + " hideMuted=" + hideMuted);
                if (checkForInactiveVideoPromise) {
                    checkForInactiveVideoPromise.cancel();
                    checkForInactiveVideoPromise = null;
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return WinJS.Promise.as();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                    if (mediaContainer) {
                        var overlayElement = mediaContainer.querySelector(".overlay--nP1TK, .hideOverlay--Z13uLxg, .video-overlay-left, .video-overlay-right, .video-overlay-top");
                        if (overlayElement) {
                            videoList = overlayElement.querySelector(".videoList--1OC49P");
                            if (videoList) {
                                var i = 0;
                                var numVideos = 0;
                                var now = Date.now();
                                var videoListItem = videoList.firstElementChild;
                                var prevActiveItem = null;
                                var prevInactiveItem = null;
                                var prevMutedItem = null;
                                while (videoListItem) {
                                    var video = videoListItem.querySelector("video");
                                    var mediaStream = video && video.srcObject;
                                    var mediaStreamId = mediaStream && mediaStream.id || "0";
                                    var content = videoListItem.firstElementChild;
                                    if (content) {
                                        var muted = null;
                                        if (WinJS.Utilities.hasClass(content, "talking--26lGzY")) {
                                            videoListDefaults.contentActivity[mediaStreamId] = now;
                                        } else {
                                            if (typeof videoListDefaults.contentActivity[mediaStreamId] === "undefined") {
                                                videoListDefaults.contentActivity[mediaStreamId] = 0;
                                            }
                                            muted = content.querySelector(".muted--quAxq") || content.querySelector(".icon-bbb-listen");
                                        }
                                        var inactivity = now - videoListDefaults.contentActivity[mediaStreamId];
                                        if ((hideInactive || hideMuted) && muted ||
                                            hideInactive && inactivity > videoListDefaults.inactivityDelay) {
                                            if (!WinJS.Utilities.hasClass(videoListItem, "inactive-video-hidden")) {
                                                WinJS.Utilities.addClass(videoListItem, "inactive-video-hidden");
                                            }
                                        } else {
                                            if (hideInactive || hideMuted) {
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
                                            } else {
                                                if (muted) {
                                                    if (prevMutedItem) {
                                                        if (videoListItem !== prevMutedItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevMutedItem.nextSibling);
                                                        }
                                                    } else if (prevInactiveItem) {
                                                        if (videoListItem !== prevInactiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevInactiveItem.nextSibling);
                                                        }
                                                    } else if (prevActiveItem) {
                                                        if (videoListItem !== prevActiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevActiveItem.nextSibling);
                                                        }
                                                    } else {
                                                        if (videoListItem !== videoList.firstElementChild) {
                                                            videoList.insertBefore(videoListItem, videoList.firstElementChild);
                                                        }
                                                    }
                                                    prevMutedItem = videoListItem;
                                                } else if (inactivity > videoListDefaults.inactivityDelay) {
                                                    if (prevInactiveItem) {
                                                        if (videoListItem !== prevInactiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevInactiveItem.nextSibling);
                                                        }
                                                    } else if (prevActiveItem) {
                                                        if (videoListItem !== prevActiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevActiveItem.nextSibling);
                                                        }
                                                    } else {
                                                        if (videoListItem !== videoList.firstElementChild) {
                                                            videoList.insertBefore(videoListItem, videoList.firstElementChild);
                                                        }
                                                    }
                                                    prevInactiveItem = videoListItem;
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
                                                }
                                            }
                                            if (WinJS.Utilities.hasClass(videoListItem, "inactive-video-hidden")) {
                                                WinJS.Utilities.removeClass(videoListItem, "inactive-video-hidden");
                                            }
                                            numVideos++;
                                        }
                                        i++;
                                    }
                                    videoListItem = videoListItem.nextElementSibling;
                                }
                                videoListDefaults.activeVideoCount = numVideos;
                                //if (!adjustContentPositionsPromise) {
                                //    adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function() {
                                //        that.adjustContentPositions();
                                //    });
                                //}
                            }
                        }
                    }
                    //checkForInactiveVideoPromise = WinJS.Promise.timeout(videoList && videoList.childElementCount > 0 ? 500 : 2000).then(function() {
                    //    that.checkForInactiveVideo();
                    //});
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.checkForInactiveVideo = checkForInactiveVideo;

            var savePollingAnswer = function(answerCode) {
                var pageControllerName = AppBar.scope.element && AppBar.scope.element.id;
                Log.call(Log.l.trace, "Conference.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    if (pageControllerName === "eventController") {
                        return AppData.call("PRC_StoreContactAnswer",
                            {
                                pUserToken: AppData._persistentStates.registerData.userToken,
                                pAnswerCode: answerCode
                            },
                            function(json) {
                                Log.print(Log.l.trace, "PRC_StoreContactAnswer success!");
                            },
                            function(error) {
                                Log.print(Log.l.error, "PRC_StoreContactAnswer error! ");
                                AppData.setErrorMsg(AppBar.scope.binding, error);
                            });
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.savePollingAnswer = savePollingAnswer;

            var loadData = function () {
                var pageControllerName = AppBar.scope.element && AppBar.scope.element.id;
                AppBar.scope.binding.registerEmail = AppData._persistentStates.registerData.Email;
                Log.call(Log.l.trace, "Conference.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    //load of format relation record data
                    Log.print(Log.l.trace, "calling select questionnaireView...");
                    return Conference.questionnaireView.select(function (json) {
                        AppData.setErrorMsg(that.binding);
                        Log.print(Log.l.trace, "questionnaireView: success!");
                        if (json && json.d && json.d.results && json.d.results.length > 0) {
                            // create binding list
                            if (pollQuestion) {
                                var initialValue = getEmptyDefaultValue(Conference.questionnaireView.defaultValue);
                                var questions = new WinJS.Binding.List([initialValue]);
                                json.d.results.forEach(function(item) {
                                    questions.push(item);
                                });
                                pollQuestion.winControl.data = questions;
                                pollQuestion.selectedIndex = 0;
                            }
                        } else {
                            Log.print(Log.l.trace, "no data found");
                        }
                    }, function (errorResponse) {
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }, that.binding.eventId);
                }).then(function () {
                    if (pageControllerName === "eventController") {
                        return AppData.call("PRC_BBBConferenceLink", {
                            pUserToken: AppData._persistentStates.registerData.userToken
                        }, function (json) {
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
                            that.showUserList(false,!!that.binding.dataEvent.ListOnlyModerators);
                            checkForInactiveVideoPromise = WinJS.Promise.timeout(250).then(function() {
                                that.checkForInactiveVideo();
                            });
                            adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                                that.adjustContentPositions();
                            });
                        }, function (error) {
                            Log.print(Log.l.error, "PRC_BBBConferenceLink error! ");
                            AppData.setErrorMsg(AppBar.scope.binding, error);
                        });
                    } else if (pageControllerName === "modSessionController") {
                        return AppData.call("PRC_BBBModeratorLink", {
                            pVeranstaltungID: 0,
                            pAlias: null,
                            pUserToken: Application.query.UserToken //aus startlink 
                        }, function (json) {
                            if (json && json.d && json.d.results) {
                                that.binding.dataConference = json.d.results[0];
                                if (that.binding.dataConference) {
                                    if (that.binding.dataConference.URL) {
                                        AppBar.scope.binding.showConference = true;
                                    }
                                }
                            }
                            Log.print(Log.l.trace, "PRC_BBBConferenceLink success!");
                        }, function (error) {
                            Log.print(Log.l.error, "PRC_BBBConferenceLink error! ");
                            AppData.setErrorMsg(AppBar.scope.binding, error);
                        });
                    } else {
                        Log.print(Log.l.error, "called from unknown pageController=" + pageControllerName);
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
                                    Log.print(Log.l.trace, "added " + key + "=" + value);
                                    Application.query[key] = value;
                                }
                            }
                            var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                            window.history.replaceState(state, title, location);
                        };
                        var path = url.replace(/https?:\/\/[\.a-zA-Z]+\/html5client/g, '/html5client');
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

            var setPresenterModeState = function (state) {
                Log.call(Log.l.info, "Conference.Controller.", "state=" + state);
                var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                if (mediaContainer) {
                    switch (state) {
                        case "tiled": {
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
                        case "full": {
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
                        case "small": {
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
                }
                Log.ret(Log.l.trace);
            }
            that.setPresenterModeState = setPresenterModeState;

            var addQuotesToParam = function(param) {
                Log.call(Log.l.trace, "Conference.Controller.", "param=" + param);
                var paramsWithQuotes = param
                    .replace(regExprMagicStart, magicStartReplace)
                    .replace(regExprMagicStop, magicStopReplace)
                    .replace(regExprMagicStart2, magicStartReplace)
                    .replace(regExprMagicStop2, magicStopReplace)
                    .replace(/'/g, "''")
                    .replace(/\n/g, "&lt;br /&gt;");
                Log.ret(Log.l.trace, "paramsWithQuotes=" + paramsWithQuotes);
                return paramsWithQuotes;
            }

            var removeQuotesFromParam = function(paramsWithQuotes) {
                Log.call(Log.l.trace, "Conference.Controller.", "paramsWithQuotes=" + paramsWithQuotes);
                var param = paramsWithQuotes
                    .replace(/&apos;/g, "'")
                    .replace(/&#39;/g, "'")
                    .replace(/ ' /g, "")
                    .replace(/''/g, "'")
                    .replace(/\\\\n/g, "\n")
                    .replace(/&lt;br.\/&gt;/g, "\n");
                Log.ret(Log.l.trace, "param=" + param);
                return param;
            }

            var extractChatFromParamsWithQuotes = function (paramsWithQuotes) {
                Log.call(Log.l.info, "Conference.Controller.", "paramsWithQuotes=" + paramsWithQuotes);
                if (paramsWithQuotes) {
                    var name = "";
                    var time = "";
                    var text = "";
                    var chatTs = 0;
                    var commandTs = 0;
                    var startName = "name=";
                    var startTime = "&amp;time=";
                    var startText = "&amp;text=";
                    var startChatTs = "&amp;chatTs=";
                    var startCommandTs = "&amp;commandTs=";
                    var params = removeQuotesFromParam(paramsWithQuotes);
                    var posStart = params.indexOf(startName);
                    if (posStart < 0) {
                        Log.print(Log.l.info, "missing name in notification");
                    } else {
                        posStart += startName.length;
                        var posStop = params.indexOf(startTime, posStart);
                        if (posStop < posStart) {
                            Log.print(Log.l.info, "missing time in notification");
                        } else {
                            name = params.substr(posStart, posStop - posStart);
                            posStart = posStop + startTime.length;
                            posStop = params.indexOf(startText, posStart);
                            if (posStop < posStart) {
                                Log.print(Log.l.info, "missing text in notification");
                            } else {
                                time = params.substr(posStart, posStop - posStart);
                                posStart = posStop + startText.length;
                                posStop = params.indexOf(startChatTs, posStart);
                                if (posStop < posStart) {
                                    Log.print(Log.l.info, "missing chatTs in notification");
                                } else {
                                    text = params.substr(posStart, posStop - posStart);
                                    posStart = posStop + startChatTs.length;
                                    posStop = params.indexOf(startCommandTs, posStart);
                                    if (posStop < posStart) {
                                        Log.print(Log.l.info, "missing commandTs in notification");
                                    } else {
                                        var chatTsString = params.substr(posStart, posStop - posStart);
                                        try {
                                            chatTs = parseInt(chatTsString);
                                            posStart = posStop + startCommandTs.length;
                                            var commandTsString = params.substr(posStart);
                                            try {
                                                commandTs = parseInt(commandTsString);
                                                Log.ret(Log.l.trace, "name=" + name +
                                                    " time=" + time +
                                                    " text=" + text +
                                                    " chatTs=" + chatTs +
                                                    " commandTs=" + commandTs);
                                                return {
                                                    name: name,
                                                    time: time,
                                                    text: text,
                                                    chatTs: chatTs,
                                                    commandTs: commandTs
                                                }
                                            } catch (ex) {
                                                Log.print(Log.l.error, "invalid commandTsString=" + commandTsString);
                                            }
                                        } catch (ex) {
                                            Log.print(Log.l.error, "invalid chatTsString=" + chatTsString);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace, "invalid params");
                return {
                    name: "",
                    time: "",
                    text: "",
                    chatTs: 0,
                    commandTs: 0
                }
            }
            that.extractChatFromParamsWithQuotes = extractChatFromParamsWithQuotes;

            var buildParamsWithQuotesFromChat = function (dataMessage) {
                var paramsWithQuotes = "";
                Log.call(Log.l.trace, "Conference.Controller.");
                if (dataMessage &&
                    dataMessage.name &&
                    dataMessage.time &&
                    dataMessage.text &&
                    dataMessage.chatTs &&
                    dataMessage.commandTs) {
                    var q = " ' ";
                    var name = q + addQuotesToParam(that.binding.dataMessage.name) + q;
                    var time = q + that.binding.dataMessage.time + q;
                    var text = q + addQuotesToParam(that.binding.dataMessage.text) + q;
                    var chatTs = q + that.binding.dataMessage.chatTs + q;
                    var commandTs = q + that.binding.dataMessage.commandTs + q;
                    paramsWithQuotes = "name=" + name + "&amp;time=" + time + "&amp;text=" + text + "&amp;chatTs=" + chatTs + "&amp;commandTs=" + commandTs;
                    Log.ret(Log.l.trace, "paramsWithQuotes=" + paramsWithQuotes);
                } else {
                    Log.ret(Log.l.trace, "invalid params");
                }
                return paramsWithQuotes;
            }
            that.buildParamsWithQuotesFromChat = buildParamsWithQuotesFromChat;


            var existsChatMessageTsName = function (message) {
                if (message && message.name && message.chatTs) {
                    var messagesAtTs = lockedChatMessages[message.chatTs];
                    if (messagesAtTs) {
                        var messagesForName = messagesAtTs[message.name];
                        if (messagesForName && messagesForName.length > 0) {
                            return true;
                        }
                    }
                }
                return false;
            }
            that.existsChatMessageTsName = existsChatMessageTsName;

            var isChatMessageLocked = function (message) {
                if (message && message.name && message.chatTs) {
                    var messagesAtTs = lockedChatMessages[message.chatTs];
                    if (messagesAtTs) {
                        var messagesForName = messagesAtTs[message.name];
                        if (messagesForName) {
                            var commandTs = 0;
                            for (var i = 0; i < messagesForName.length; i++) {
                                if (commandTs && commandTs > messagesForName[i].commandTs) {
                                    break;
                                }
                                if (message.text === messagesForName[i].text) {
                                    var lockedMessage = messagesForName[i];
                                    Log.print(Log.l.info, "lockedMessage unlocked=" + (lockedMessage && lockedMessage.unlocked) +
                                        " name=" + (lockedMessage && lockedMessage.name) +
                                        " chatTs="  + (lockedMessage && lockedMessage.chatTs) +
                                        " commandTs="  + (lockedMessage && lockedMessage.commandTs) +
                                        " text="  + (lockedMessage && lockedMessage.text));
                                    return !lockedMessage.unlocked;
                                }
                                commandTs = messagesForName[i].commandTs;
                            }
                        }
                    }
                }
                return false;
            }
            that.isChatMessageLocked = isChatMessageLocked;
            
            var addLockedChatMessage = function(message) {
                Log.call(Log.l.info, "Conference.Controller.", "unlocked=" + (message && message.unlocked) +
                    " name=" + (message && message.name) +
                    " chatTs=" + (message && message.chatTs) +
                    " commandTs=" + (message && message.commandTs) +
                    " text=" + (message + message.text));
                if (message && message.name && message.chatTs) {
                    var messagesAtTs = lockedChatMessages[message.chatTs];
                    if (messagesAtTs) {
                        var messagesForName = messagesAtTs[message.name];
                        if (messagesForName) {
                            var i;
                            for (i = 0; i < messagesForName.length; i++) {
                                if (message.commandTs > messagesForName[i].commandTs) {
                                    break;
                                }
                            }
                            if (i < messagesForName.length) {
                                messagesForName.splice(i, 0, message);
                            } else {
                                messagesForName.push(message);
                            }
                        } else {
                            messagesForName = [message];
                        }
                        messagesAtTs[message.name] = messagesForName;
                    } else {
                        messagesAtTs = {};
                        messagesAtTs[message.name] = [message];
                    }
                    lockedChatMessages[message.chatTs] = messagesAtTs;
                    Log.ret(Log.l.info, "added " + lockedChatMessages[message.chatTs].length + ". entry");
                } else {
                    Log.ret(Log.l.error, "invalid param");
                }
            }
            that.addLockedChatMessage = addLockedChatMessage;


            var setPolling = function() {
                Log.call(Log.l.info, "Conference.Controller.");
                if (AppBar.scope.element && AppBar.scope.element.id === "eventController") {
                    if (setPollingPromise) {
                        setPollingPromise.cancel();
                        setPollingPromise = null;
                    }
                    var pollingContainer = document.querySelector(".overlay--Arkp5 .pollingContainer--1xRnAH");
                    if (pollingContainer) {
                        var pollingTitle = pollingContainer.querySelector(".pollingTitle--2ryYAd");
                        if (pollingTitle) {
                            pollingTitle.textContent = that.binding.dataQuestionnaire.QuestionText;
                        }
                        var pollingAnswers = pollingContainer.querySelector(".pollingAnswers--2tjBC8");
                        if (pollingAnswers) {
                            var i = 1;
                            var pollingAnswer = pollingAnswers.firstElementChild;
                            while (pollingAnswer) {
                                var button = pollingAnswer.querySelector("button");
                                if (button) {
                                    var keyAnswerCode = "Answer0" + i + "Code";
                                    var keyAnswerText = "Answer0" + i + "Text";
                                    if (!button._defaultOnClick && that.binding.dataQuestionnaire[keyAnswerCode]) {
                                        button._answerCode = that.binding.dataQuestionnaire[keyAnswerCode];
                                        button._defaultOnClick = button.onclick;
                                        button.onclick = that.eventHandlers.clickPollingButton;
                                    }
                                    var label = button.querySelector(".label--Z12LMR3");
                                    if (label && that.binding.dataQuestionnaire[keyAnswerText]) {
                                        label.textContent = that.binding.dataQuestionnaire[keyAnswerText];
                                    }
                                    i++;
                                }
                                pollingAnswer = pollingAnswer.nextElementSibling;
                            }
                        }
                    } else {
                        setPollingPromise = WinJS.Promise.timeout(Math.min(setPollingFailedCount * 10, 5000)).then(function() {
                            that.setPolling();
                        });
                    }
                }
                Log.ret(Log.l.info);
            }
            that.setPolling = setPolling;

            this.eventHandlers = {
                showPresentation: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var restoreDescButton = fragmentElement.querySelector(elementSelectors.restoreDesc);
                    if (restoreDescButton) {
                        restoreDescButton.click();
                    }
                    that.binding.showPresentation = true;
                    if (videoListDefaults.direction === videoListDefaults.default) {
                        WinJS.Promise.timeout(50).then(function () {
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
                hidePresentation: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var closeDescButton = fragmentElement.querySelector(elementSelectors.closeDesc);
                    if (closeDescButton) {
                        closeDescButton.click();
                    }
                    that.binding.showPresentation = false;
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                showVideoList: function () {
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
                hideVideoList: function () {
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
                videoListDefault: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    videoListDefaults.direction = videoListDefaults.default;
                    that.setPresenterModeState("off");
                    WinJS.Promise.timeout(250).then(function () {
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
                videoListLeft: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    videoListDefaults.direction = videoListDefaults.left;
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                videoListRight: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    videoListDefaults.direction = videoListDefaults.right;
                    that.setPresenterModeState("off");
                    Log.ret(Log.l.info);
                },
                presenterModeTiled: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState("tiled");
                    Log.ret(Log.l.info);
                },
                presenterModeFull: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState("full");
                    Log.ret(Log.l.info);
                },
                presenterModeSmall: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState("small");
                    Log.ret(Log.l.info);
                },
                togglePresenterButtonContainer: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (presenterButtonContainer) {
                        var containerCloseIcon = presenterButtonContainer.querySelector(".container-close-icon");
                        if (WinJS.Utilities.hasClass(presenterButtonContainer, "container-collapsed")) {
                            WinJS.Utilities.removeClass(presenterButtonContainer, "container-collapsed");
                            if (containerCloseIcon) {
                                if (WinJS.Utilities.hasClass(containerCloseIcon, "icon-bbb-right_arrow")) {
                                    WinJS.Utilities.removeClass(containerCloseIcon, "icon-bbb-right_arrow");
                                }
                                if (!WinJS.Utilities.hasClass(containerCloseIcon, "icon-bbb-close")) {
                                    WinJS.Utilities.addClass(containerCloseIcon, "icon-bbb-close");
                                }
                            }
                        } else {
                            WinJS.Utilities.addClass(presenterButtonContainer, "container-collapsed")
                            if (containerCloseIcon) {
                                if (WinJS.Utilities.hasClass(containerCloseIcon, "icon-bbb-close")) {
                                    WinJS.Utilities.removeClass(containerCloseIcon, "icon-bbb-close");
                                }
                                if (!WinJS.Utilities.hasClass(containerCloseIcon, "icon-bbb-right_arrow")) {
                                    WinJS.Utilities.addClass(containerCloseIcon, "icon-bbb-right_arrow");
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickPresenterMode: function (event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var command = event && event.currentTarget && event.currentTarget.id;
                    if (command) {
                        Log.print(Log.l.info, "command=" + command);
                        that.submitCommandMessage(magicStart + command + magicStop, event);
                    }
                    Log.ret(Log.l.info);
                },
                showNotification: function (paramsWithQuotes) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (showNotificationPromise) {
                        showNotificationPromise.cancel();
                        showNotificationPromise = null;
                    }
                    if (typeof paramsWithQuotes !== "string") {
                        Log.ret(Log.l.info, "invalid param: extra ignored!");
                        return;
                    }
                    var mediaContainer = null;
                    if (hideNotificationPromise) {
                        that.eventHandlers.clickNotification();
                    } else {
                        mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                    }
                    if (mediaContainer) {
                        if (notificationPopup &&
                            notificationPopup.style) {
                            var result = that.extractChatFromParamsWithQuotes(paramsWithQuotes);
                            if (result && result.name && result.time && result.text && result.commandTs) {
                                var now = Date.now();
                                var delayInSec = (now - result.commandTs) / 1000;
                                if (delayInSec > 300) {
                                    Log.print(Log.l.info, "extra ignored message delayed by " + delayInSec + "sec");
                                } else {
                                    that.binding.dataNotification.name = result.name;
                                    that.binding.dataNotification.time = result.time;
                                    that.binding.dataNotification.text = result.text;
                                    mediaContainer.appendChild(notificationPopup);
                                    notificationPopup.style.display = "block";
                                    WinJS.UI.Animation.slideLeftIn(notificationPopup).done(function () {
                                        hideNotificationPromise = WinJS.Promise.timeout(7000).then(function () {
                                            that.eventHandlers.clickNotification();
                                        });
                                    });
                                }
                            }
                        }
                    } else {
                        showNotificationPromise = WinJS.Promise.timeout(500).then(function () {
                            that.eventHandlers.showNotification(paramsWithQuotes);
                        });
                    }
                    Log.ret(Log.l.info);
                },
                lockChatMessage: function (paramsWithQuotes) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (typeof paramsWithQuotes !== "string") {
                        Log.ret(Log.l.info, "invalid param: extra ignored!");
                        return;
                    }
                    var message = that.extractChatFromParamsWithQuotes(paramsWithQuotes);
                    message.unlocked = false;
                    that.addLockedChatMessage(message);
                    WinJS.Promise.timeout(0).then(function() {
                        that.markupLockedMessages();
                    });
                    Log.ret(Log.l.info);
                },
                unlockChatMessage: function (paramsWithQuotes) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (typeof paramsWithQuotes !== "string") {
                        Log.ret(Log.l.info, "invalid param: extra ignored!");
                        return;
                    }
                    var message = that.extractChatFromParamsWithQuotes(paramsWithQuotes);
                    message.unlocked = true;
                    that.addLockedChatMessage(message);
                    WinJS.Promise.timeout(0).then(function() {
                        that.markupLockedMessages();
                    });
                    Log.ret(Log.l.info);
                },
                sessionEndRequested: function(param) {
                    Log.call(Log.l.info, "Conference.Controller.", "param=" + (param ? param : ""));
                    Log.ret(Log.l.info);
                },
                pQ: function(value) {
                    var dataQuestionnaire = null;
                    Log.call(Log.l.info, "Conference.Controller.", "param=" + (value ? value : ""));
                    if (value &&
                        pollQuestion &&
                        pollQuestion.winControl) {
                        if (typeof value === "string") {
                            value = parseInt(value);
                        }
                        var questions = pollQuestion.winControl.data;
                        if (questions) {
                            var selectedQuestions = questions.filter(function(item) {
                                return (item[Conference.questionnaireView.pkName] === value);
                            });
                            if (selectedQuestions && selectedQuestions[0]) {
                                dataQuestionnaire = selectedQuestions[0];
                            }
                        }
                    }
                    if (dataQuestionnaire) {
                        that.binding.dataQuestionnaire = dataQuestionnaire;
                    } else {
                        that.binding.dataQuestionnaire = getEmptyDefaultValue(Conference.questionnaireView.defaultValue);
                    }
                    setPollingFailedCount = 0;
                    that.setPolling();
                    Log.ret(Log.l.info);
                },
                clickPollingButton: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (event) {
                        var button = event.currentTarget;
                        if (button) {
                            that.savePollingAnswer(button._answerCode);
                            if (typeof button._defaultOnClick === "function") {
                                button._defaultOnClick();
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickChatMessageList: function (message) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (message && chatMenu && chatMenu.winControl) {
                        that.binding.dataMessage = copyByValue(message);
                        document.body.appendChild(chatMenu);
                        chatMenu.winControl.showAt(message.event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickChatMenuCommand: function (event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (event && event.currentTarget) {
                        var id = event.currentTarget.id;
                        WinJS.Promise.timeout(50).then(function() {
                            switch (id) {
                            case "showNotification":
                                document.body.appendChild(postNotificationPopup);
                                postNotificationPopup.winControl.showAt(event);
                                break;
                            case "lockChatMessage":
                            case "unlockChatMessage":
                                var paramsWithQuotes = that.buildParamsWithQuotesFromChat(that.binding.dataMessage);
                                if (paramsWithQuotes) {
                                    var command = id + "(" + paramsWithQuotes + ")";
                                    Log.print(Log.l.info, "command=" + command);
                                    that.submitCommandMessage(magicStart + command + magicStop, event);
                                }
                                break;
                            }
                        });
                    }
                    Log.ret(Log.l.info);
                },
                clickCloseDesc: function (event) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (typeof videoListDefaults.closeDesc === "function") {
                        videoListDefaults.closeDesc(event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickRestoreDesc: function (event) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (typeof videoListDefaults.restoreDesc === "function") {
                        videoListDefaults.restoreDesc(event);
                    }
                    Log.ret(Log.l.trace);
                },
                clickToggleUserList: function (event) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (typeof userListDefaults.toggleUserList === "function") {
                        userListDefaults.toggleUserList(event);
                    }
                    Log.ret(Log.l.trace);
                },
                changePollQuestion: function(event) {
                    var dataQuestionnaire = null;
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (event && event.currentTarget) {
                        var value = event.currentTarget.value;
                        if (value &&
                            pollQuestion &&
                            pollQuestion.winControl) {
                            if (typeof value === "string") {
                                value = parseInt(value);
                            }
                            var questions = pollQuestion.winControl.data;
                            if (questions) {
                                var selectedQuestions = questions.filter(function(item) {
                                    return (item[Conference.questionnaireView.pkName] === value);
                                });
                                if (selectedQuestions && selectedQuestions[0]) {
                                    dataQuestionnaire = selectedQuestions[0];
                                }
                            }
                        }
                    }
                    if (dataQuestionnaire) {
                        that.binding.dataQuestionnaire = dataQuestionnaire;
                    } else {
                        that.binding.dataQuestionnaire = getEmptyDefaultValue(Conference.questionnaireView.defaultValue);
                    }
                    var pollSection = fragmentElement.querySelector(".poll--Z1w6wQt");
                    if (pollSection) {
                        var customInputWrapper = pollSection.querySelector(".customInputWrapper--Z2wG4AP");
                        if (customInputWrapper) {
                            var inputElements = customInputWrapper.querySelectorAll("input");
                            if (inputElements && inputElements.length > 0) {
                                for (var i = 0; i < Math.min(inputElements.length); i++) {
                                    var inputElement = inputElements[i];
                                    if (inputElement) {
                                        //inputElement.focus();
                                        var key = "Answer0" + (i + 1).toString() + "Text";
                                        var answerValue = that.binding.dataQuestionnaire[key];
                                        if (typeof answerValue === "string" && inputElement.maxLength > 0) {
                                            answerValue = answerValue.substr(0, inputElement.maxLength);
                                        }
                                        var inputEvent = document.createEvent('event');
                                        inputEvent.initEvent('input', true, true);
                                        inputElement.dispatchEvent(inputEvent);
                                        inputElement.value = answerValue ? answerValue : "";
                                        triggerReactOnChange(inputElement);
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickSendNotification: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var paramsWithQuotes = that.buildParamsWithQuotesFromChat(that.binding.dataMessage);
                    if (paramsWithQuotes) {
                        var command = "showNotification(" + paramsWithQuotes + ")";
                        Log.print(Log.l.info, "command=" + command);
                        that.submitCommandMessage(magicStart + command + magicStop, event);
                        if (postNotificationPopup && postNotificationPopup.winControl) {
                            postNotificationPopup.winControl.hide();
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickCancelNotification: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (postNotificationPopup && postNotificationPopup.winControl) {
                        postNotificationPopup.winControl.hide();
                    }
                    Log.ret(Log.l.info);
                },
                clickNotification: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (hideNotificationPromise) {
                        hideNotificationPromise.cancel();
                        hideNotificationPromise = null;
                    }
                    if (notificationPopup && 
                        notificationPopup.style) {
                        WinJS.UI.Animation.slideRightOut(notificationPopup).done(function() {
                            notificationPopup.style.display = "none";
                            var notificationContainer = fragmentElement.querySelector(".notification-container");
                            if (notificationContainer) {
                                notificationContainer.appendChild(notificationPopup);
                            }
                        });
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
                                that.submitCommandMessage(magicStart + command + magicStop, event);
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickToggleEmojiButton: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.eventHandlers.toggleToolbox("emojiToolbar");
                    Log.ret(Log.l.info);
                },
                clickEmoji: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var command = event && event.currentTarget && event.currentTarget.name;
                    if (command) {
                        Log.print(Log.l.info, "command=" + command);
                        that.submitCommandMessage(command, event);
                    }
                    that.eventHandlers.hideToolbox("emojiToolbar");
                    Log.ret(Log.l.info);
                },
                hideToolbox: function(id) {
                    var curToolbox = fragmentElement.querySelector('#' + id);
                    if (curToolbox && curToolbox.style) {
                        WinJS.Utilities.addClass(curToolbox, "box-is-minimized");
                        WinJS.Promise.timeout(300).then(function() {
                            curToolbox.style.display = "none";
                        });
                    }
                },
                toggleToolbox: function (id) {
                    WinJS.Promise.timeout(0).then(function () {
                        var curToolbox = fragmentElement.querySelector('#' + id);
                        if (curToolbox && curToolbox.style) {
                            if (WinJS.Utilities.hasClass(curToolbox, "box-is-minimized")) {
                                for (var i = 0; i < toolboxIds.length; i++) {
                                    if (toolboxIds[i] !== id) {
                                        var otherToolbox = document.querySelector('#' + toolboxIds[i]);
                                        if (otherToolbox && otherToolbox.style &&
                                            otherToolbox.style.display === "block") {
                                            otherToolbox.style.display = "none";
                                        }
                                    }
                                }
                                curToolbox.style.display = "block";
                                WinJS.Utilities.removeClass(curToolbox, "box-is-minimized");
                            } else {
                                that.eventHandlers.hideToolbox(id);
                            }
                        }
                    });
                }
            }

            var initEmojiToolbar = function() {
                if (emojiToolbar && emojiToolbar.winControl) {
                    var emojiData = new WinJS.Binding.List([]);
                    floatingEmojisSymbols.forEach(function(item, index) {
                        var className = "emoji" + index;
                        var style = document.getElementById(className);
                        if (!style) {
                            style = document.createElement("style");
                            style.id = className;
                            style.innerHTML = "#conferenceController ." + className + ":before { content:\"" + item + "\"; }";
                            document.head.appendChild(style);
                        }
                        emojiData.push({
                            index: index,
                            text: item,
                            className: "emoji-button-icon " + className
                        });
                    });
                    emojiToolbar.winControl.data = emojiData;
                }
            }
            that.initEmojiToolbar = initEmojiToolbar;

            var sendCommandMessage = function (command, param) {
                Log.call(Log.l.info, "Conference.Controller.", "command=" + command);
                if (!that.allCommandInfos[command]) {
                    Log.ret(Log.l.error, "invalid command=" + command);
                    return;
                }
                if (typeof param === "string") {
                    var q = " ' ";
                    command = command + "(" + q + addQuotesToParam(param) + q + ")";
                }
                that.submitCommandMessage(magicStart + command + magicStop);
                Log.ret(Log.l.info);
            }
            that.sendCommandMessage = sendCommandMessage;

            var setCommandMessageHandler = function(command, callback) {
                Log.call(Log.l.info, "Conference.Controller.", "command=" + command);
                if (typeof callback !== "function") {
                    Log.ret(Log.l.error, "invalid param: callback function");
                    return;
                }
                var commandInfo = that.allCommandInfos[command];
                if (!commandInfo) {
                    Log.ret(Log.l.error, "invalid command=" + command);
                    return;
                }
                commandInfo.callback = callback;
                Log.ret(Log.l.info);
            }
            that.setCommandMessageHandler = setCommandMessageHandler;

            var submitCommandMessage = function(command, event, openedUserList, openedChat) {
                var btnToggleChat, btnToggleUserList, panelWrapper;
                Log.call(Log.l.info, "Conference.Controller.", "command=" + command);
                if (typeof command !== "string") {
                    Log.ret(Log.l.error, "invalid param");
                    return;
                }
                if (command.indexOf(magicStart) >= 0 &&
                    !(AppBar.scope.element && AppBar.scope.element.id === "modSessionController")) {
                    Log.ret(Log.l.error, "access denied if not modSessionController");
                    return;
                }
                if (submitCommandMessagePromise) {
                    submitCommandMessagePromise.cancel();
                    submitCommandMessagePromise = null;
                }
                var messageInput = fragmentElement.querySelector("#conference.mediaview .chat--111wNM .form--1S2xdc textarea#message-input");
                if (messageInput) {
                    //messageInput.focus();
                    if (messageInput.form && typeof messageInput.form.reset === "function") {
                        messageInput.form.reset();
                    }
                    messageInput.innerHTML = command;
                    var inputEvent = document.createEvent('event');
                    inputEvent.initEvent('input', true, true);
                    messageInput.dispatchEvent(inputEvent);
                    var submitButton = fragmentElement.querySelector("#conference.mediaview .chat--111wNM .form--1S2xdc button[type=\"submit\"]");
                    if (submitButton) {
                        submitButton.click();
                    }
                    if (messageInput.form && typeof messageInput.form.reset === "function") {
                        messageInput.form.reset();
                    }
                    if (openedChat) {
                        btnToggleChat = fragmentElement.querySelector("div[role=\"button\"][aria-expanded=\"true\"]#chat-toggle-button");
                        if (btnToggleChat) {
                            btnToggleChat.click();
                        }
                    }
                    if (openedUserList) {
                        btnToggleUserList = fragmentElement.querySelector("button[accesskey=\"U\"].btn--Z25OApd");
                        if (btnToggleUserList && 
                            !(btnToggleUserList.nextElementSibling &&
                              WinJS.Utilities.hasClass(btnToggleUserList.nextElementSibling, "icon-bbb-right_arrow"))) {
                            btnToggleUserList.click();
                        }
                    }
                    if (openedChat || openedUserList) {
                        panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                        if (panelWrapper) {
                            if (WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                                WinJS.Promise.timeout(50).then(function() {
                                    WinJS.Utilities.removeClass(panelWrapper, "hide-chat-section");
                                });
                            }
                            if (WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                                WinJS.Promise.timeout(50).then(function() {
                                    WinJS.Utilities.removeClass(panelWrapper, "hide-panel-section");
                                });
                            }
                        }
                    }
                } else {
                    btnToggleChat = fragmentElement.querySelector("div[role=\"button\"][aria-expanded=\"false\"]#chat-toggle-button");
                    if (btnToggleChat) {
                        panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                        if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                            WinJS.Utilities.addClass(panelWrapper, "hide-chat-section");
                        } else {
                            btnToggleChat.click();
                            openedChat = true;
                        }
                    } else {
                        panelWrapper = fragmentElement.querySelector(".wrapper--Z20hQYP");
                        if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                            WinJS.Utilities.addClass(panelWrapper, "hide-panel-section");
                        } else {
                            btnToggleUserList = fragmentElement.querySelector("button[accesskey=\"U\"].btn--Z25OApd");
                            if (btnToggleUserList && 
                                (btnToggleUserList.nextElementSibling &&
                                 WinJS.Utilities.hasClass(btnToggleUserList.nextElementSibling, "icon-bbb-right_arrow"))) {
                                btnToggleUserList.click();
                                openedUserList = true;
                            }
                        }
                    }
                    submitCommandMessagePromise = WinJS.Promise.timeout(20).then(function() {
                        that.submitCommandMessage(command, event, openedUserList, openedChat);
                    });
                }
                Log.ret(Log.l.info);
            }
            that.submitCommandMessage = submitCommandMessage;

            that.allCommandInfos = {
                showPresentation: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hidePresentation", "showPresentation"]
                },
                hidePresentation: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hidePresentation", "showPresentation"]
                },
                videoListDefault: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"]
                },
                videoListLeft: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"]
                },
                videoListRight: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"]
                },
                hideVideoList: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hideVideoList", "showVideoList"]
                },
                showVideoList: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["hideVideoList", "showVideoList"]
                },
                presenterModeTiled: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"]
                },
                presenterModeFull: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"]
                },
                presenterModeSmall: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["videoListDefault", "videoListLeft", "videoListRight", "presenterModeTiled", "presenterModeFull", "presenterModeSmall"]
                },
                showNotification: {
                    collection: "group-chat-msg", msg: "added", redundantList: null
                },
                lockChatMessage: {
                    collection: "group-chat-msg", msg: "added", redundantList: null
                },
                unlockChatMessage: {
                    collection: "group-chat-msg", msg: "added", redundantList: null
                },
                sessionEndRequested: {
                    collection: "group-chat-msg", msg: "added", redundantList: "sessionEndRequested"
                },
                pQ: {
                    collection: "polls", msg: "added", redundantList: "pQ"
                }
            };

            var handleCommandWithParam = function(commandWithParam) {
                if (!commandWithParam) {
                    Log.ret(Log.L.info, "null param");
                    return WinJS.Promise.as();
                }
                var command = commandWithParam.command;
                var prevNotifyModified = AppBar.notifyModified;
                Log.print(Log.l.info, "queue command=" + command);
                var commandInfo = that.allCommandInfos[command];
                if (!commandInfo) {
                    Log.ret(Log.L.info, "unknown command=" + command);
                    return WinJS.Promise.as();
                }
                if (commandInfo.collection !== commandWithParam.collection ||
                    commandInfo.msg !== commandWithParam.msg) {
                    Log.ret(Log.l.trace, "command=" + command + " not supported in collection=" + commandWithParam.collection + " msg=" + commandWithParam.msg);
                    return WinJS.Promise.as();
                }
                commandQueue = commandQueue.filter(function(item) {
                    return (!commandInfo.redundantList || commandInfo.redundantList.indexOf(item.command) < 0);
                });
                commandQueue.push(commandWithParam);
                return WinJS.Promise.timeout(250).then(function() {
                    var commandsToHandle = commandQueue;
                    commandQueue = [];
                    AppBar.notifyModified = false;
                    commandsToHandle.forEach(function(queuedCommandWithParam) {
                        var queuedCommand = queuedCommandWithParam.command;
                        var queuedParam = null;
                        if (queuedCommandWithParam.param) {
                            queuedParam = queuedCommandWithParam.param;
                        };
                        var queuedCommandInfo = that.allCommandInfos[queuedCommand];
                        if (typeof queuedCommandInfo.callback === "function") {
                            if (queuedParam) {
                                queuedCommandInfo.callback(removeQuotesFromParam(queuedParam));
                            } else {
                                queuedCommandInfo.callback();
                            }
                        } else if (typeof that.eventHandlers[queuedCommand] === "function") {
                            Log.print(Log.l.info, "handle command=" + queuedCommand);
                            if (queuedParam) {
                                that.eventHandlers[queuedCommand](queuedParam);
                            } else {
                                that.eventHandlers[queuedCommand]();
                            }
                        }
                    });
                    AppBar.notifyModified = prevNotifyModified;
                    WinJS.Promise.as().then(function () {
                        adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                            that.adjustContentPositions();
                        });
                        return WinJS.Promise.timeout(50);
                    }).then(function () {
                        that.sendResize(50);
                    });
                });
            }
            that.handleCommandWithParam = handleCommandWithParam;

            var handleFloatingEmoji = function(emoji) {
                Log.call(Log.l.info, "Conference.Controller.", "emoji=" + emoji);
                if (typeof emojiCount[emoji] === "number") {
                    emojiCount[emoji]++;
                } else {
                    emojiCount[emoji] = 1;
                }
                WinJS.Promise.timeout(750).then(function() {
                    if (typeof window.floating === "function") {
                        var mediaContainer = fragmentElement.querySelector(".container--ZmRztk");
                        if (mediaContainer) {
                            for (var prop in emojiCount) {
                                if (emojiCount.hasOwnProperty(prop)) {
                                    var number = emojiCount[prop];
                                    if (number > 0) {
                                        window.floating({
                                            content: prop,
                                            number: number,
                                            duration: 11,
                                            size: [5,15],
                                            element: mediaContainer,
                                            width: 30 + 20 * Math.random(),
                                            left: "calc(50% + 50px)",
                                            max: 20
                                        });
                                        emojiCount[prop] = 0;
                                    }
                                }
                            };
                        }
                    }
                });
                Log.ret(Log.l.info);
            }
            that.handleFloatingEmoji = handleFloatingEmoji;

            var textContainsEmoji = function(text, fromIndex) {
                fromIndex = (fromIndex > 0) ? fromIndex : 0;
                for (var i = 0; i < floatingEmojisMessage.length; i++) {
                    if (text.indexOf(floatingEmojisMessage[i], fromIndex) >= 0) {
                        return true;
                    }
                }
                return false;
            }
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
            var findEndOfStruct = function(text, fromIndex) {
                fromIndex = (fromIndex > 0) ? fromIndex : 0;
                if (text && text[fromIndex] === "\"") {
                    var quoted = false;
                    var blockCount = 0;
                    for (var i = fromIndex + 1; i < text.length; i++) {
                        if (text[i] === "\\" && text[i + 1] === "\"") {
                            quoted = !quoted;
                            i++;
                        } else if (!quoted) { 
                            if (text[i] === "{") {
                                blockCount++;
                            } else if (text[i] === "}") {
                                blockCount--;
                            }
                        }
                        if (!blockCount) {
                            if (text[i + 1] === "\"") {
                                return i + 2 ;
                            } else {
                                return 0;
                            }
                        }
                    }
                }
                return 0;
            }

            var deleteMagicFromXhrResponse = function(res, magicStart, magicStop) {
                var responseReplaced = false;
                var responseText = res && res.responseText;
                if (typeof responseText === "string") {
                    var newResponseText = "";
                    var prevStopPos = 0;
                    var posMagicStart, posMagicStop;
                    while (prevStopPos >= 0) {
                        posMagicStart = responseText.indexOf(magicStart, prevStopPos);
                        if (posMagicStart >= prevStopPos) {
                            posMagicStop = responseText.indexOf(magicStop, posMagicStart + magicStart.length);
                            if (posMagicStop >= posMagicStart + magicStart.length) {
                                newResponseText += responseText.substr(prevStopPos, posMagicStart - prevStopPos);
                                responseReplaced = true;
                                prevStopPos = posMagicStop + magicStop.length;
                            } else {
                                if (responseReplaced) {
                                    newResponseText += responseText.substr(prevStopPos);
                                }
                                prevStopPos = -1;
                            }
                        } else {
                            if (responseReplaced) {
                                newResponseText += responseText.substr(prevStopPos);
                            }
                            prevStopPos = -1;
                        }
                    }
                    if (responseReplaced) {
                        res.responseText = newResponseText;
                    }
                }
                return responseReplaced;
            }

            var msgQuote = "\\\"";
            var fieldStop = msgQuote;
            var parseXhrResponse = function(res, msg, collection, fieldStart, magicStart, magicStop) {
                var responseReplaced = false;
                var msgStart = "\"{" + msgQuote + "msg" + msgQuote + ":" + msgQuote + msg + msgQuote + "," + msgQuote + "collection" + msgQuote + ":" + msgQuote + collection + msgQuote;
                var msgTimestamp = "timestamp";
                var timeStampStart = msgQuote + msgTimestamp + msgQuote + ":";
                var now = Date.now();
                //var pageControllerName = AppBar.scope.element && AppBar.scope.element.id;
                var responseText = res && res.responseText;
                if (typeof responseText === "string") {
                    var newResponseText = "";
                    var prevStartPos = 0;
                    var prevStopPos = 0;
                    while (prevStartPos >= 0 && prevStartPos < responseText.length) {
                        var posMsgStart = responseText.indexOf(msgStart, prevStartPos);
                        if (posMsgStart >= 0 && 
                           (responseText.indexOf(magicStart, posMsgStart + msgStart.length) >= 0 ||
                            textContainsEmoji(responseText, posMsgStart) === true)) {
                            var posMsgStop = findEndOfStruct(responseText, posMsgStart);
                            if (posMsgStop > posMsgStart + msgStart.length) {
                                var posFieldStart = responseText.indexOf(fieldStart, posMsgStart + msgStart.length);
                                if (posFieldStart >= posMsgStart + msgStart.length &&
                                    posFieldStart < posMsgStop) {
                                    var fieldReplaced = false;
                                    var skipField = false;
                                    var fieldLength = responseText.indexOf(fieldStop, posFieldStart + fieldStart.length) - (posFieldStart + fieldStart.length);
                                    if (fieldLength > 0) {
                                        var message = responseText.substr(posFieldStart + fieldStart.length, fieldLength);
                                        var idxEmoji = floatingEmojisMessage.indexOf(message);
                                        if (idxEmoji >= 0) {
                                            if (res.readyState === 4 && res.status === 200) {
                                                var timestamp = 0;
                                                var posTimestampStart = responseText.indexOf(timeStampStart, posMsgStart + msgStart.length);
                                                if (posTimestampStart > posMsgStart + msgStart.length &&
                                                    posTimestampStart < posMsgStop) {
                                                    var posTimestampStop = responseText.indexOf(",", posTimestampStart + timeStampStart.length);
                                                    var timestampString = "0";
                                                    if (posTimestampStop > posTimestampStart + timeStampStart.length) {
                                                        timestampString = responseText.substr(posTimestampStart + timeStampStart.length, posTimestampStop -
                                                            (posTimestampStart + timeStampStart.length));
                                                    }
                                                    timestamp = parseInt(timestampString);
                                                }
                                                if (timestamp && now - timestamp > 30000) {
                                                    Log.print(Log.l.info, "extra ignored: emoji=" + message + " timestamp=" + timestamp + " now=" + now);
                                                } else {
                                                    Log.print(Log.l.info, "handling: emoji=" + message + " timestamp=" + timestamp + " now=" + now);
                                                    that.handleFloatingEmoji(floatingEmojisSymbols[idxEmoji]);
                                                }
                                            }
                                            skipField = true;
                                            responseReplaced = true;
                                        } else {
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
                                                            //if (pageControllerName === "eventController") {
                                                                if (fieldLength > magicStart.length + command.length + magicStop.length) {
                                                                    if (!prevFieldStartPos) {
                                                                        newResponseText += responseText.substr(prevStopPos, posFieldStart + fieldStart.length - prevStopPos);
                                                                    }
                                                                    newResponseText += message.substr(prevFieldStartPos, posMagicStart - prevFieldStartPos);
                                                                    fieldReplaced = true;
                                                                } else if (!prevFieldStartPos) {
                                                                    skipField = true;
                                                                }
                                                                responseReplaced = true;
                                                            //}
                                                            if (res.readyState === 4 && res.status === 200) {
                                                                Log.print(Log.l.info, "received command=" + commandWithParam.command);
                                                                commandWithParam.msg = msg;
                                                                commandWithParam.collection = collection;
                                                                that.handleCommandWithParam(commandWithParam);
                                                            }
                                                        }
                                                    } 
                                                    prevFieldStartPos += posMagicStart + magicStart.length + command.length + magicStop.length;
                                                } else {
                                                    if (fieldReplaced) {
                                                        newResponseText += message.substr(prevFieldStartPos, message.length - (prevFieldStartPos - (posFieldStart + fieldStart.length)));
                                                    }
                                                    prevFieldStartPos = -1;
                                                }
                                            }
                                        }
                                    }
                                    if (fieldReplaced) {
                                        newResponseText += responseText.substr(posFieldStart + fieldStart.length + fieldLength, posMsgStop -
                                            (posFieldStart + fieldStart.length + fieldLength));
                                    } else if (skipField) {
                                        var nonSkippedMessages = responseText.substr(prevStopPos, posMsgStart - prevStopPos);
                                        if (nonSkippedMessages.length > 0 && nonSkippedMessages[nonSkippedMessages.length - 1] === ",") {
                                            // dismiss trailing comma from prev. message 
                                            newResponseText += nonSkippedMessages.substr(0, nonSkippedMessages.length - 1);
                                        } else {
                                            if (responseText[posMsgStop] === ",") {
                                                // dismiss leading comma from next message
                                                posMsgStop++;
                                            } 
                                            newResponseText += nonSkippedMessages;
                                        }
                                    }
                                }
                                prevStartPos = posMsgStop;
                                if (responseReplaced) {
                                    prevStopPos = posMsgStop;
                                }
                            } else {
                                prevStartPos = -1;
                            }
                        } else {
                            prevStartPos = -1;
                        }
                    }
                    if (responseReplaced) {
                        if (prevStopPos > 0) {
                            var responseTextAdd = responseText.substr(prevStopPos);
                            newResponseText += responseTextAdd;
                        }
                        res.responseText = newResponseText;
                    }
                }
                return responseReplaced;
            }

            Application.hookXhrOnReadyStateChange = function(res) {
                var collection = "group-chat-msg";
                var msgField = "message";
                var fieldStart = msgQuote + msgField + msgQuote + ":" + msgQuote;
                //var responseReplaced = 
                    parseXhrResponse(res, "added", collection, fieldStart, magicStart, magicStop);
                //if (!responseReplaced) {
                //    parseXhrResponse(res, "added", collection, fieldStart, magicStart2, magicStop2);
                //}

                collection = "polls";
                msgField = "answers";
                fieldStart = msgQuote + msgField + msgQuote + ":" + "[{" + msgQuote + "id" + msgQuote + ":0," + msgQuote + "key" + msgQuote + ":" + msgQuote;
                //responseReplaced = 
                    parseXhrResponse(res, "added", collection, fieldStart, magicStart, magicStop);
                //if (!responseReplaced) {
                //    parseXhrResponse(res, "added", collection, fieldStart, magicStart2, magicStop2);
                //}
                
                //responseReplaced = 
                    deleteMagicFromXhrResponse(res, magicStart, magicStop);
                //if (!responseReplaced) {
                //    deleteMagicFromXhrResponse(res, magicStart2, magicStop2);
                //}
            };

            var replaceXhrSendBody = function(body, magicStart, magicStop) {
                var msgMethod;
                var msgField;
                var fieldStart;
                if (AppBar.scope.element && AppBar.scope.element.id === "modSessionController") {
                    msgMethod = "startPoll";
                    msgField = "custom"; 
                    fieldStart = "\\\"" + msgField + "\\\",";
                } else {
                    msgMethod = "sendGroupChatMsg";
                    msgField = "message";
                    fieldStart = "\\\"" + msgField + "\\\":\\\"";
                }
                var msgStart = "\"{" + msgQuote + "msg" + msgQuote + ":" + msgQuote + "method" + msgQuote + "," + msgQuote + "method" + msgQuote + ":" + msgQuote + msgMethod + msgQuote;
                if (typeof body === "string") {
                    var bodyReplaced = false;
                    var newBody = "";
                    var prevStartPos = 0;
                    var prevStopPos = 0;
                    while (prevStartPos >= 0 && prevStartPos < body.length) {
                        var posMsgStart = body.indexOf(msgStart, prevStartPos);
                        if (posMsgStart >= prevStartPos && ((msgMethod === "startPoll") || body.indexOf(magicStart, posMsgStart + msgStart.length) >= 0)) {
                            var posMsgStop = findEndOfStruct(body, posMsgStart);
                            if (posMsgStop > posMsgStart + msgStart.length) {
                                var posFieldStart = body.indexOf(fieldStart, posMsgStart + msgStart.length);
                                if (posFieldStart >= posMsgStart + msgStart.length &&
                                    posFieldStart < posMsgStop) {
                                    var fieldReplaced = false;
                                    var fieldLength = 0;
                                    if (msgMethod === "startPoll") {
                                        var posFirstAnswer = body.indexOf("[" + msgQuote, posFieldStart + fieldStart.length);
                                        if (posFirstAnswer >= posFieldStart + fieldStart.length) {
                                            fieldLength = body.indexOf(fieldStop, posFirstAnswer + msgQuote.length + 1) - (posFirstAnswer + msgQuote.length + 1);
                                            if (fieldLength > 0) {
                                                newBody += body.substr(prevStopPos, posFirstAnswer + msgQuote.length + 1 - prevStopPos);
                                                var questionId = that.binding.dataQuestionnaire[Conference.questionnaireView.pkName];
                                                var pollQuestionIdMarker = magicStart + "pQ(" + questionId + ")" + magicStop;
                                                newBody += pollQuestionIdMarker; 
                                                newBody += body.substr(posFirstAnswer + msgQuote.length + 1, Math.min(fieldLength, 45 - pollQuestionIdMarker.length));
                                                fieldLength += posFirstAnswer + msgQuote.length + 1 - (posFieldStart + fieldStart.length);
                                                fieldReplaced = true;
                                                bodyReplaced = true;
                                            }
                                        }
                                    } else {
                                        fieldLength = body.indexOf(fieldStop, posFieldStart + fieldStart.length) - (posFieldStart + fieldStart.length);
                                        if (fieldLength > 0) {
                                            var message = body.substr(posFieldStart + fieldStart.length, fieldLength);
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
                                                            if (!prevFieldStartPos) {
                                                                newBody += body.substr(prevStopPos, posFieldStart + fieldStart.length - prevStopPos);
                                                            }
                                                            newBody += message.substr(prevFieldStartPos, posMagicStart - prevFieldStartPos) +
                                                                magicStartReplace + command + magicStopReplace;
                                                            fieldReplaced = true;
                                                            bodyReplaced = true;
                                                        }
                                                    } 
                                                    prevFieldStartPos += posMagicStart + magicStart.length + command.length + magicStop.length;
                                                } else {
                                                    if (fieldReplaced) {
                                                        newBody += message.substr(prevFieldStartPos, posMagicStart - prevFieldStartPos);
                                                    }
                                                    prevFieldStartPos = -1;
                                                }
                                            }
                                        }
                                    }
                                    if (fieldReplaced) {
                                        newBody += body.substr(posFieldStart + fieldStart.length + fieldLength, posMsgStop -
                                            (posFieldStart + fieldStart.length + fieldLength));
                                    }
                                }
                                prevStartPos = posMsgStop;
                                if (bodyReplaced) {
                                    prevStopPos = prevStartPos;
                                }
                            } else {
                                prevStartPos = -1;
                            }
                        } else {
                            prevStartPos = -1;
                        }
                    }
                    if (bodyReplaced) {
                        newBody += body.substr(prevStopPos);
                        return newBody;
                    }
                }
                return null;
            }


            Application.hookXhrSend = function(body) {
                var newBody = replaceXhrSendBody(body, magicStart, magicStop);
                //if (!newBody) {
                //    newBody = replaceXhrSendBody(body, magicStart2, magicStop2);
                //}
                return newBody || body;
            }

            if (typeof navigator.mediaDevices === "object" &&
                typeof navigator.mediaDevices.enumerateDevices === "function") {
                navigator.mediaDevices.enumerateDevices().then(function(newDeviceList) {
                    deviceList = newDeviceList;
                });
            }
            videoListDefaults.direction = videoListDefaults.right;
            videoListDefaults.hideInactive = !!that.binding.dataEvent.HideSilentVideos;
            if (!that.binding.dataEvent.SharedNotes) {
                WinJS.Utilities.addClass(conference, "hide-shared-notes");
            }

            var addMenuCommandIcons = function(menu) {
                if (menu &&
                    !WinJS.Utilities.hasClass(menu, "win-menu-containstogglecommand")) {
                    var menuCommandLiners = menu.querySelectorAll(".win-menucommand-liner");
                    if (menuCommandLiners) {
                        for (var i = 0; i < menuCommandLiners.length; i++) {
                            var menuCommandLiner = menuCommandLiners[i];
                            if (menuCommandLiner && menuCommandLiner.parentElement &&
                                menuCommandLiner.parentElement.winControl &&
                                menuCommandLiner.parentElement.winControl.icon &&
                                menuCommandLiner.firstElementChild &&
                                WinJS.Utilities.hasClass(menuCommandLiner.firstElementChild, "win-toggleicon")) {
                                var icon = WinJS.UI.AppBarIcon[menuCommandLiner.parentElement.winControl.icon];
                                if (icon) {
                                    menuCommandLiner.firstElementChild.setAttribute("data-before", icon);
                                    if (!WinJS.Utilities.hasClass(menu, "win-menu-containsicon")) {
                                        WinJS.Utilities.addClass(menu, "win-menu-containsicon");
                                    }
                                    WinJS.Utilities.addClass(menuCommandLiner.parentElement, "win-command-icon");
                                }
                            }
                        }
                    }
                }
            }
            that.addMenuCommandIcons = addMenuCommandIcons;

            if (chatMenu) {
                that.addRemovableEventListener(chatMenu, "afterhide", function () {
                    var chatMenuContainer = fragmentElement.querySelector(".chat-menu-container");
                    if (chatMenuContainer) {
                        chatMenuContainer.appendChild(chatMenu);
                    }
                });
            }
            if (postNotificationPopup) {
                that.addRemovableEventListener(postNotificationPopup, "afterhide", function () {
                    var postNotificationContainer = fragmentElement.querySelector(".post-notification-container");
                    if (postNotificationContainer) {
                        postNotificationContainer.appendChild(postNotificationPopup);
                    }
                });
            }

            that.processAll().then(function () {
                AppBar.notifyModified = false;
                Log.print(Log.l.trace, "Binding wireup page complete");
                that.initEmojiToolbar();
                that.addMenuCommandIcons(chatMenu);
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
                AppBar.notifyModified = true;
                that.showUserList(false,!!that.binding.dataEvent.ListOnlyModerators);
                checkForInactiveVideoPromise = WinJS.Promise.timeout(250).then(function() {
                    that.checkForInactiveVideo();
                });
                adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                    that.adjustContentPositions();
                });
                return WinJS.Promise.timeout(250);;
            }).then(function () {
                return that.sendResize(2000);
            });
            Log.ret(Log.l.trace);
        })
    });
})();



