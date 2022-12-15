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
    var bbbClass = {
        participantsList: "participantsList--1MvMwF",
        item: "item--ZDfG6l",
        unmuted: "icon-bbb-unmute",
        muted: "icon-bbb-unmute_filled",
        listen: "icon-bbb-listen",
        overlay: "react-draggable",

        autoWidth: "autoWidth--24e2xI",
        overlayToTop: "overlayToTop--1PLUSN",
        floatingOverlay: "floatingOverlay--ZU51zt",
        fullWidth: "fullWidth--Z1RRil3",
        hideOverlay: "hideOverlay--Z13uLxg",

        poll: "poll--Z1w6wQt",
        pollingAnswers: "pollingAnswers--2tjBC8",
        pollingContainer: "pollingContainer--1xRnAH",
        pollingTitle: "pollingTitle--2ryYAdpollingTitle--2ryYAd",
        overlayA: "overlay--Arkp5",
        customInputWrapper: "customInputWrapper--Z2wG4AP",
        customBtn: "customBtn--Z8fMMN",
        primary: "primary--1IbqAO",
        startPollBtn: "startPollBtn--Z1qKPy4",
        label: "label--Z12LMR3"
    }
    // BBB 2.4 RC1
    bbbClass.participantsList = "ReactVirtualized__Grid__innerScrollContainer > span";
    bbbClass.item = "item--ZfUxvS";

    // BBB 2.5.2
    bbbClass.item = "sc-iyuJgS";
    bbbClass.autoWidth = null;
    bbbClass.overlayToTop = null;
    bbbClass.floatingOverlay = null;
    bbbClass.fullWidth = null;
    bbbClass.hideOverlay = null;

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
    var elementSelectors = {
        mediaView:       "#conference.mediaview",
        app:             "#conference.mediaview > #app",
        navBar:          "#conference.mediaview #layout > header:first-of-type",
        navBarTopCenter: "#conference.mediaview #layout > header:first-of-type > div:first-child > div:first-child + div",
        actionsBar:      '#conference.mediaview #layout > section[aria-label="Actions bar"], #conference.mediaview #layout > section[aria-label="Aktionsmenü"]',
        actionsBarLeft:  '#conference.mediaview #layout > section[aria-label="Actions bar"] > div:first-child > div:first-child, #conference.mediaview #layout > section[aria-label="Aktionsmenü"] > div:first-child > div:first-child',
        actionsBarCenter:'#conference.mediaview #layout > section[aria-label="Actions bar"] > div:first-child > div:first-child + div, #conference.mediaview #layout > section[aria-label="Aktionsmenü"] > div:first-child > div:first-child + div',
        actionsBarRight: '#conference.mediaview #layout > section[aria-label="Actions bar"] > div:first-child > div:last-child, #conference.mediaview #layout > section[aria-label="Aktionsmenü"] > div:first-child > div:last-child',

        layout:          "#conference.mediaview #layout",

        userListContent: '#conference.mediaview #layout div[data-test="userListContent"]',
        userListScroll:  "#user-list-virtualized-scroll",
        avatar:          'div[data-test="userAvatar"]',
        moderator:       ".moderator--24bqCT",
        userNameMainSelfLabel: 'div[role="button"] div[role="button"] > span > i',

        publicChat:      '#conference.mediaview #layout div[data-test="publicChat"]',
        notes:      '#conference.mediaview #layout div[data-test="notes"]',
        chatMessages:    'div[data-test="chatMessages"]',
        grid:            'div[aria-label="grid"]',
        nameElement:     ".meta--ZfU5fg .name--ZfTXko span, .meta--ZfU5fg .logout--Z1DfGNI > span",
        time:            "time[datetime]",
        message:         'p[data-test="chatUserMessageText"]',
        fromMyselfMessage:'.from-myself p',

        cameraDock:      "#cameraDock",
        videoList:       "#cameraDock > div:first-child > div:first-child",
        videoContainer:  'div[data-test="webcamItem"] > div:first-child, div[data-test="webcamItemTalkingUser"] > div:first-child',
        videoUserName:   ".dropdownTrigger--Z1Fp5dg, .userName--ZsKYfV",

        svgWhiteboard:   'svg[data-test="whiteboard"]',
        screenShareVideo:"#screenshareVideo",
        videoPlayer:     "#video-player",
        audioControlsContainer: "span:first-child",

        presentationContainer: "#conference.mediaview #layout > div[data-test=\"presentationContainer\"]",
        presentationPlaceholder: "#conference.mediaview #layout > div[data-test=\"presentationPlaceholder\"]",

        showConnectionStatus: '#conference.mediaview #layout button[data-test="connectionStatusButton"]',
        showMediaButton: '#conference.mediaview #layout button[data-test="actionsButton"]',
        startDeskShare: '#conference.mediaview #layout button[data-test="startScreenShare"]',
        stopDeskShare: '#conference.mediaview #layout button[data-test="stopScreenShare"]',
        userListToggleButton: '#conference.mediaview #layout button[data-test="toggleUserList"], #conference.mediaview #layout button[data-test="hasUnreadMessages"]',
        hasUnreadMessagesButton: '#conference.mediaview #layout button[data-test="hasUnreadMessages"]',
        chatToggleButton: '#conference.mediaview #layout div[role="button"]#chat-toggle-button',
        notesToggleButton: '#conference.mediaview #layout div[aria-label="Geteilte Notizen"], #conference.mediaview #layout div[aria-label="Shared Notes"]',
        fullScreenButton: 'button[data-test="presentationFullscreenButton"]',

        closeChatButton: '#conference.mediaview #layout button[data-test="hidePublicChat"]',
        closeNotesButton: '#conference.mediaview #layout button[data-test="hideNotesLabel"]',

        hidePresentationButton:   '#conference.mediaview #layout button[data-test="hidePresentationButton"]',
        restorePresentationButton:'#conference.mediaview #layout button[data-test="restorePresentationButton"]',
        minimizePresentation:    '#conference.mediaview #layout button[data-test="minimizePresentation"]',
        restorePresentation:'#conference.mediaview #layout button[data-test="restorePresentation"]',
        raiseHandLabel:'#conference.mediaview #layout button[data-test="raiseHandLabel"]',
        lowerHandLabel:'#conference.mediaview #layout button[data-test="lowerHandLabel"]',

        microphoneOn: '#conference.mediaview #layout button[aria-label="Freischalten"], #conference.mediaview #layout button[aria-label="Unmute"]',
        microphoneOff: '#conference.mediaview #layout button[aria-label="Stummschalten"], #conference.mediaview #layout button[aria-label="Mute"]',
        leaveAudio: '#conference.mediaview #layout button[data-test="leaveAudio"]',
        joinAudio: '#conference.mediaview #layout button[data-test="joinAudio"]',
        leaveVideo: '#conference.mediaview #layout button[data-test="leaveVideo"]',
        joinVideo: '#conference.mediaview #layout button[data-test="joinVideo"]',
        audioSettings: '#conference.mediaview #layout button[data-test="leaveAudio"] + span > button',
        videoSettings: '#conference.mediaview #layout button[data-test="leaveVideo"] + span > button',
        talkingIndicator: '#conference.mediaview div[data-test="talkingIndicator"]',

        meetingEndedModalTitle: '#conference.mediaview h1[data-test="meetingEndedModalTitle"]',

        // dangerous global CSS definitions to remove:
        htmlElement:     "html {",
        allElements:     "*, *:before, *:after {"
    };
    // BBB 2.5.2
    elementSelectors.avatar = elementSelectors.avatar + " > div";
    elementSelectors.moderator = 'div[data-test="moderatorAvatar"]';
    elementSelectors.nameElement = ".sc-kffHwx .sc-bEvXvO span";
    elementSelectors.videoUserName = 'div[data-test="dropdownWebcamButton"]';

    elementSelectors.publicChatSubmitButton = elementSelectors.publicChat + ' form  button[type="submit"]';
    elementSelectors.publicChatMessageInput = elementSelectors.publicChat + " form textarea#message-input";

    function getMediaContainerSelector() {
        return elementSelectors.layout;
    }

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

    function removeReactEventHandler(inputElement, handlerName) {
        var key = "__reactEventHandlers";
        for (var prop in inputElement) {
            if (inputElement.hasOwnProperty(prop)) {
                if (prop.substr(0,key.length) === key) {
                    var reactEventHandlers = inputElement[prop];
                    if (typeof reactEventHandlers[handlerName] === "function") {
                        reactEventHandlers[handlerName] = function(){};
                    }
                }
            }
        }
    }

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

    function getInternalInstanceKey(element) {
        for (var prop in element) {
            if (element.hasOwnProperty(prop)) {
                if (prop.startsWith("__reactInternalInstance$")) {
                    return element[prop] && 
                        (element[prop].key || element[prop].return && element[prop].return.key);
                }
            }
        }
        return null;
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


    WinJS.Namespace.define("Conference", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Conference.Controller.", "eventId=" + (options && options.eventId));

            var videoListDefaults = {
                aspect: 4.0 / 3.0,
                width: 384,
                height: 288,
                left: "left",
                right: "right",
                top: "top",
                default: "default",
                videoListWidth: 0,
                videoListHeight: 0,
                hideInactive: false,
                contentActivity: [],
                inactivityDelay: 7000,
                activeVideoCount: 0,
                mediaContainerObserver: null,
                videoListObserver: null,
                contentObserver: null,
                usePinned: false
            };
            var userListDefaults = {
                show: true,
                onlyModerators: false,
                userListObserver: null,
                toggleBtnObserver: null,
                toggleUserList: null,
                inSubmitCommand: false,
                panelWrapperObserver: null,
                appObserver: null,
                pollContentObserver: null,
                selfLabels: ["(Sie)", "(You)", "(Ich)", "(Me)", "(I)"],
                selfName: null,
                publicChatSubmit: null
            };
            var presenterModeDefaults = {
                off: "off",
                tiled: "tiled",
                full: "full",
                small: "small"
            }
            var myselfLabel = "&nbsp;(" + getResourceText("label.me") + ")";
            var actionsBarCenterObserver = null;
            var talkingIndicatorObserver = null;
            var emojiToolbarPositionObserver = null;
            var myTalkingActivityStart = null;
            var myTalkingActivityEnd = null;
            var myTalkingActivityIndicator = null;

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataEvent: options ? options.dataEvent : {},
                dataConference: {
                    media: ""
                },
                dataSessionStatus: null,
                showSelfie: true,
                showPresentation: true,
                showVideoList: true,
                showChat: false,
                showNotes: false,
                showPaneTools: false,
                showPresenterButtons: false,
                showUserList: false,
                presenterModeTiled: false,
                presenterModeFull: false,
                presenterModeSmall: false,
                videoListLeft: false,
                videoListRight: false,
                videoListDefault: false,
                raiseHand: false,
                audioOn: false,
                microphoneEnabled: false,
                microphoneOn: false,
                cameraOn: false,
                showDeskShareOn: false,
                showDeskShareActive: false,
                showMediaOn: false,
                expandActions: false,
                hasUnreadMessages: false,
                pinnedVideos: [],
                unpinnedVideoListLength: 0,
                showUnpinnedVideoList: false,
                dataText: AppBar.scope.binding.dataText,
                dataDoc: AppBar.scope.binding.dataDoc,
                dataDocText: AppBar.scope.binding.dataDocText,
                showConference: false,
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
            var paneTools = fragmentElement.querySelector(".pane-tools");
            var showPresentationToggleContainer = fragmentElement.querySelector(".show-presentation-toggle-container");
            var showVideoListToggleContainer = fragmentElement.querySelector(".show-videolist-toggle-container");
            var expandActionsToggleContainer = fragmentElement.querySelector(".expand-actions-toggle-container");
            var showMediaButtonContainer = fragmentElement.querySelector(".show-media-button-container");
            var showDeskShareButtonContainer = fragmentElement.querySelector(".show-deskshare-button-container");
            var closeConnectionButtonContainer = fragmentElement.querySelector(".close-connection-button-container");
            var toggleMicrophoneButtonContainer = fragmentElement.querySelector(".toggle-microphone-button-container");
            var toggleCameraButtonContainer = fragmentElement.querySelector(".toggle-camera-button-container");
            var showConnectionStatusContainer = fragmentElement.querySelector(".show-connection-button-container");
            var raiseHandButtonContainer = fragmentElement.querySelector(".raise-hand-button-container");
            var showChatButtonContainer = fragmentElement.querySelector(".show-chat-button-container");
            var showNotesButtonContainer = fragmentElement.querySelector(".show-notes-button-container");
            var showPaneToolsButtonContainer = fragmentElement.querySelector(".show-panetools-button-container");
            var showUserListButtonContainer = fragmentElement.querySelector(".show-userlist-button-container");
            var pollQuestionContainer = fragmentElement.querySelector("poll-question-container");
            var emojiButtonContainer = fragmentElement.querySelector(".emoji-button-container");
            var emojiToolbar = fragmentElement.querySelector("#emojiToolbar");
            var postNotificationPopup = fragmentElement.querySelector("#postNotificationPopup");
            var notificationPopup = fragmentElement.querySelector("#notificationPopup");
            var chatMenu = fragmentElement.querySelector("#chatMenu");
            var pollQuestion = fragmentElement.querySelector("#pollQuestion");
            var listView = fragmentElement.querySelector("#unpinnedVideos.listview");

            var handleCommandPromise = null;
            var sendResizePromise = null;
            var showUserListPromise = null;
            var adjustContentPositionsPromise = null;
            var checkForInactiveVideoPromise = null;
            var filterUserListPromise = null;
            var observeChatMessageListPromise = null;
            var observePollPromise = null;
            var submitCommandMessagePromise = null;
            var openChatPanePromise = null;
            var openNotesPanePromise = null;
            var showNotificationPromise = null;
            var hideNotificationPromise = null;
            var setPollingPromise = null;
            var delayedLoadSessionStatusPromise = null;
            var checkForTalkingEndPromise = null;


            var filterUserListFailedCount = 0;
            var showUserListFailedCount = 0;
            var adjustContentPositionsFailedCount = 0;
            var setPollingFailedCount = 0;
            
            var commandQueue = [];
            var deviceList = [];
            var toolboxIds = ["emojiToolbar"];
            var emojiCount = {};
            var lockedChatMessages = {};

            var sessionStatusIsSet = true;
            var userToken = null;
            var pageControllerName = AppBar.scope.element && AppBar.scope.element.id;
            if (pageControllerName === "eventController") {
                userToken = AppData._persistentStates.registerData.userToken;
            } else if (pageControllerName === "modSessionController" || pageControllerName === "speakerSessionController") {
                userToken = Application.query.UserToken; //aus startlink 
            }

            var unpinnedVideoList = new WinJS.Binding.List([]);
            var myselfIsUnpinned = false;

            var that = this;

            that.dispose = function () {
                Log.call(Log.l.trace, "Conference.Controller.");
                if (openChatPanePromise) {
                    openChatPanePromise.cancel();
                    openChatPanePromise = null;
                }
                if (openNotesPanePromise) {
                    openNotesPanePromise.cancel();
                    openNotesPanePromise = null;
                }
                if (handleCommandPromise) {
                    handleCommandPromise.cancel();
                    handleCommandPromise = null;
                }
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
                if (delayedLoadSessionStatusPromise) {
                    delayedLoadSessionStatusPromise.cancel();
                    delayedLoadSessionStatusPromise = null;
                }
                if (checkForTalkingEndPromise) {
                    checkForTalkingEndPromise.cancel();
                    checkForTalkingEndPromise = null;
                }
                var leaveAudioButton = fragmentElement.querySelector(elementSelectors.leaveAudio);
                if (leaveAudioButton) {
                    leaveAudioButton.click();
                }
                if (typeof Meteor === "object" &&
                    typeof Meteor.disconnect === "function") {
                    Meteor.disconnect();
                }
                if (typeof Session === "object" &&
                    typeof Session.destroy === "function") {
                    Session.destroy();
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
                    var aUrl = new URL(a.href);
                    var html5ClientLocale = aUrl.href + "html5client/locale?locale=";
                    var reBase = "function rebase(url){if(!url||typeof url!=\"string\"||url.indexOf(\"" + aUrl.hostname + "\")>=0)return url;let p=url.indexOf(\"://\"),q=(p>=0)?url.substr(p+3).substr(url.substr(p+3).indexOf(\"/\")):url;return q};";
                    var newHostname = "(function(){return\"" + aUrl.hostname + "\"})()";
                    var newHref = "(function(){return\"" + a.href + "\"})()";
                    var eGetImageUriR = "let t=(function(){" + reBase + "let et=rebase(e.imageUri);Log.print(Log.l.info,\"et=\"+JSON.stringify(et));return et})(),n=e.svgWidth,r=e.svgHeight;";
                    var aGetImageUriU = "s,u=(function(){" + reBase + "let au=rebase(a.imageUri);Log.print(Log.l.info,\"au=\"+JSON.stringify(au));return au})(),m=a.content;";
                    var uGetImageUri = "k,{imageUri:(function(){" + reBase + "let uu=rebase(u);Log.print(Log.l.info,\"uu=\"+JSON.stringify(uu));return uu})(),";
                    // BBB 2.4 RC1
                    var eGetImageUriO = "let t=(function(){" + reBase + "let et=rebase(e.imageUri);Log.print(Log.l.info,\"et=\"+JSON.stringify(et));return et})(),n=e.svgWidth,o=e.svgHeight;";
                    var rGetImageUriP = "a,p=(function(){" + reBase + "let rp=rebase(r.imageUri);Log.print(Log.l.info,\"rp=\"+JSON.stringify(rp));return rp})(),m=r.content;";
                    var pGetImageUri = "k,{imageUri:(function(){" + reBase + "let pp=rebase(p);Log.print(Log.l.info,\"pp=\"+JSON.stringify(pp));return pp})(),";
                    var scriptText = req.responseText
                        .replace(/window\.document\.location\.hostname/g, newHostname)
                        .replace(/window\.location\.hostname/g, newHostname)
                        .replace(/window\.location\.href/g, newHref)
                        .replace(/let\{imageUri:t,svgWidth:n,svgHeight:o\}=e;/g, eGetImageUriO)
                        .replace(/s,\{imageUri:u,content:m\}=a;/g, aGetImageUriU)
                        .replace(/k,\{imageUri:u,/g, uGetImageUri)
                        // BBB 2.4 RC1
                        .replace(/let\{imageUri:t,svgWidth:n,svgHeight:r\}=e;/g, eGetImageUriR)
                        .replace(/a,\{imageUri:p,content:m\}=r;/g, rGetImageUriP)
                        .replace(/k,\{imageUri:p,/g, pGetImageUri)
                        .replace(/\.\/locale\?locale=/g, html5ClientLocale)
                        .replace(/"localhost"/g, newHostname)
                        .replace(/location.origin.concat/g, "\"\".concat")
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

            var removeStyle = function(style, selector) {
                var text = style.innerHTML;
                if (text) {
                    var posStart = text.indexOf(selector);
                    if (posStart >= 0) {
                        var posEnd = text.indexOf("}", posStart);
                        if (posEnd >= 0) {
                            style.innerHTML = text.substr(0, posStart) + text.substr(posEnd + 1);
                        }
                    }
                }
            }

            var addStyle = function (styleTag, fragmentHref, position) {
                var src = (fragmentHref + "script[" + position + "]").toLowerCase();
                if (!(src in styles)) {
                    styles[src] = true;
                    var clonedNode = styleTag.cloneNode(true);
                    removeStyle(clonedNode, elementSelectors.htmlElement);
                    removeStyle(clonedNode, elementSelectors.allElements);
                    head.appendChild(clonedNode);
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
                    var wssStartPattern = "wss%3A%2F%2F";
                    var wssStopPattern = "%2Fbbb-webrtc-sfu";
                    var wssBbWebRtcSfuSrc = wssStartPattern + a.host + wssStopPattern;
                    var httpsStartPattern = "https%3A%2F%2F";
                    var httpsStopPattern = "%2Fpad";
                    var httpsPadSrc = httpsStartPattern + a.host + httpsStopPattern;
                    var startPos = req.responseText.indexOf(wssStartPattern), stopPos = -1, nextStartPos;
                    while (startPos >= 0 && stopPos < 0) {
                        startPos += wssStartPattern.length;
                        nextStartPos = req.responseText.indexOf(wssStartPattern, startPos);
                        stopPos = req.responseText.indexOf(wssStopPattern, startPos);
                        if (stopPos >= startPos && (nextStartPos < 0 || stopPos < nextStartPos)) {
                            Application.wssUrl =
                                req.responseText.substr(startPos, stopPos - startPos);
                        } else {
                            stopPos = -1;
                        }
                        startPos = nextStartPos;
                    }
                    startPos = req.responseText.indexOf(httpsStartPattern);
                    stopPos = -1;
                    while (startPos >= 0 && stopPos < 0) {
                        startPos += httpsStartPattern.length;
                        nextStartPos = req.responseText.indexOf(httpsStartPattern, startPos);
                        stopPos = req.responseText.indexOf(httpsStopPattern, startPos);
                        if (stopPos >= startPos && (nextStartPos < 0 || stopPos < nextStartPos)) {
                            Application.httpsUrl =
                                req.responseText.substr(startPos, stopPos - startPos);
                        } else {
                            stopPos = -1;
                        }
                        startPos = nextStartPos;
                    } 
                    var html5Client = req.responseText
                        .replace(/="compatibility/g, compatibilitySrc)
                        .replace(/="\/html5client/g, html5ClientSrc)
                        .replace(/wss%3A%2F%2F[0-9.A-za-z]+%2Fbbb-webrtc-sfu/g, wssBbWebRtcSfuSrc)
                        .replace(/https%3A%2F%2F[0-9.A-za-z]+%2Fpad/g, httpsPadSrc)
                        ;
                    var pos = html5Client.indexOf("__meteor_runtime_config__");
                    if (pos > 0) {
                        pos = html5Client.indexOf("</script>", pos);
                        if (pos > 0) {
                            html5Client = html5Client.substr(0, pos) +
                                ";__meteor_runtime_config__.ROOT_URL = \"" + abs("/html5client") + "\"" +
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
                var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                if (userListContent) {
                    if (pageControllerName === "eventController" && userListDefaults.onlyModerators) {
                        if (!WinJS.Utilities.hasClass(userListContent.parentElement, "only-moderators")) {
                            WinJS.Utilities.addClass(userListContent.parentElement, "only-moderators");
                        }
                    } else {
                        if (WinJS.Utilities.hasClass(userListContent.parentElement, "only-moderators")) {
                            WinJS.Utilities.removeClass(userListContent.parentElement, "only-moderators");
                        }
                    }
                    var moderatorCount = 0;
                    var userListScroll = userListContent.querySelector(elementSelectors.userListScroll);
                    if (userListScroll) {
                        var userListColumn = userListScroll.parentElement;
                        var participantsList = userListColumn.querySelectorAll("." + bbbClass.participantsList);
                        if (participantsList) {
                            var i = 0, participantsListEntry = null, userNameMainSelfLabel = null, userName = null, avatar = null, style = null, rgbColor = null;
                            if (pageControllerName === "eventController" && userListDefaults.onlyModerators) {
                                for (i = participantsList.length - 1; i >= 0; i--) {
                                    participantsListEntry = participantsList[i];
                                    if (participantsListEntry) {
                                        var userIsMyself = false;
                                        if (!userListDefaults.selfName) {
                                            userNameMainSelfLabel = participantsListEntry.querySelector(elementSelectors.userNameMainSelfLabel);
                                            if (userNameMainSelfLabel && typeof userNameMainSelfLabel.textContent === "string" &&
                                                userListDefaults.selfLabels.indexOf(userNameMainSelfLabel.textContent) >= 0 &&
                                                userNameMainSelfLabel.previousElementSibling) {
                                                userName = userNameMainSelfLabel.previousElementSibling.textContent;
                                                if (typeof userName === "string") {
                                                    userListDefaults.selfName = userName.replace(/&nbsp;/g, " ").trim();
                                                    avatar = participantsListEntry.querySelector(elementSelectors.avatar);
                                                    if (avatar) {
                                                        style = window.getComputedStyle(avatar);
                                                        if (style) {
                                                            userListDefaults.selfColor = style.backgroundColor;
                                                            if (userListDefaults.selfColor && userListDefaults.selfColor.substr(0, 4) === "rgb(") {
                                                                rgbColor = Colors.rgbStr2rgb(userListDefaults.selfColor);
                                                                userListDefaults.selfChatColor = "rgba(" + rgbColor.r + ", " + rgbColor.g + ", " + rgbColor.b + ", 0.2) !important";
                                                                Colors.changeCSS(elementSelectors.fromMyselfMessage, "background-color", userListDefaults.selfChatColor);
                                                            }
                                                        }
                                                    }
                                                    userIsMyself = true;
                                                }
                                            }
                                        }
                                        if (!participantsListEntry.querySelector(elementSelectors.moderator)) {
                                            if (!userIsMyself) {
                                                try {
                                                    while (participantsListEntry.firstElementChild) {
                                                        participantsListEntry.removeChild(participantsListEntry.firstElementChild);
                                                    }
                                                    if (participantsListEntry.style) {
                                                        participantsListEntry.style.display = "none";
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
                                        userNameMainSelfLabel = participantsListEntry.querySelector(elementSelectors.userNameMainSelfLabel);
                                        if (userNameMainSelfLabel && typeof userNameMainSelfLabel.textContent === "string" &&
                                            userListDefaults.selfLabels.indexOf(userNameMainSelfLabel.textContent) >= 0 &&
                                            userNameMainSelfLabel.previousElementSibling) {
                                            userName = userNameMainSelfLabel.previousElementSibling.textContent;
                                            if (typeof userName === "string") {
                                                userListDefaults.selfName = userName.replace(/&nbsp;/g, " ").trim();
                                                avatar = participantsListEntry.querySelector(elementSelectors.avatar);
                                                if (avatar) {
                                                    style = window.getComputedStyle(avatar);
                                                    if (style) {
                                                        userListDefaults.selfColor = style.backgroundColor;
                                                        if (userListDefaults.selfColor && userListDefaults.selfColor.substr(0, 4) === "rgb(") {
                                                            rgbColor = Colors.rgbStr2rgb(userListDefaults.selfColor);
                                                            userListDefaults.selfChatColor = "rgba(" + rgbColor.r + ", " + rgbColor.g + ", " + rgbColor.b + ", 0.2) !important";
                                                            Colors.changeCSS(elementSelectors.fromMyselfMessage, "background-color", userListDefaults.selfChatColor);
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
                        var participantsListParent = userListColumn.querySelector(elementSelectors.userListScroll);
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
                var btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                if (btnToggleUserList) {
                    userListDefaults.toggleUserList = btnToggleUserList.onclick;
                    btnToggleUserList.onclick = function(event) {
                        if (!userListDefaults.inSubmitCommand) {
                            var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                            if (panelWrapper) {
                                if (WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                    WinJS.Utilities.removeClass(panelWrapper, "hide-user-list-section");
                                    var target = event.currentTarget || event.target;
                                    WinJS.Promise.timeout(50).then(function() {
                                        if (target && typeof target.click === "function") {
                                            target.click();
                                        }
                                    });
                                }
                            }
                        }
                        userListDefaults.toggleUserList(event);
                    }
                    var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                    if (userListContent) {
                        if (!userListDefaults.selfName) {
                            that.filterUserList();
                        };
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
                var pollSection = fragmentElement.querySelector("." + bbbClass.poll);
                if (pollSection &&
                    pollSection.parentElement &&
                    pollQuestion &&
                    pollQuestion.winControl &&
                    pollQuestion.winControl.data &&
                    pollQuestion.winControl.data.length > 1) {
                    var publishButton = pollSection.querySelector("." + bbbClass.startPollBtn);
                    if (publishButton) {
                        if (!WinJS.Utilities.hasClass(pollSection, "poll-results")) {
                            WinJS.Utilities.addClass(pollSection, "poll-results");
                        }
                        pollQuestion.selectedIndex = 0;
                        that.binding.dataQuestionnaire = getEmptyDefaultValue(Conference.questionnaireView.defaultValue);
                    } else {
                        var customBtn = pollSection.querySelector("." + bbbClass.customBtn);
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
                            var startCustomPollBtn = pollSection.querySelector("." + bbbClass.customInputWrapper + " ." + bbbClass.primary);
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
                var pollSection = fragmentElement.querySelector("." + bbbClass.poll);
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

            var addPublicChatSubmitHandler = function(messageInput) {
                var submitButton = fragmentElement.querySelector(elementSelectors.publicChatSubmitButton);
                if (submitButton) {
                    userListDefaults.publicChatSubmit = submitButton.onclick;
                    submitButton.onclick = function(event) {
                        var chatText = messageInput && messageInput.innerHTML && messageInput.innerHTML.slice(0);
                        userListDefaults.publicChatSubmit(event);
                        if (chatText) {
                            var idxEmoji = floatingEmojisSymbols.indexOf(chatText);
                            if (idxEmoji < 0) {
                                WinJS.Promise.timeout(10).then(function() {
                                    if (pageControllerName === "modSessionController") {
                                        if (chatText) {
                                            var res = {
                                                responseText: chatText
                                            }
                                            if (deleteMagicFromXhrResponse(res, magicStart, magicStop)) {
                                                chatText = res.responseText;
                                            }
                                        }
                                    }
                                    if (chatText && chatText.length > 0) {
                                        Log.print(Log.l.trace, "chatText=" + chatText);
                                        AppData.call("PRC_CreateIncident", {
                                            pUserToken: userToken,
                                            pIncidentName: "ChatMessage",
                                            pTextInfo1: chatText
                                        }, function (json) {
                                            Log.print(Log.l.trace, "PRC_CreateIncident success!");
                                        }, function (error) {
                                            Log.print(Log.l.error, "PRC_CreateIncident error! ");
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
            }
            that.addPublicChatSubmitHandler = addPublicChatSubmitHandler;

            var handlePanelsOpened = function(addedNodes) {
                var i;
                Log.call(Log.l.trace, "Conference.Controller.");
                if (addedNodes && addedNodes.length > 0) {
                    var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                    for (i = 0; i < addedNodes.length; i++) {
                        var addedNode = addedNodes[i];
                        if (addedNode && addedNode.firstElementChild) {
                            var dataTest = addedNode.getAttribute("data-test") ||
                                addedNode.firstElementChild.getAttribute("data-test") ||
                                addedNode.firstElementChild.firstElementChild &&
                                addedNode.firstElementChild.firstElementChild.getAttribute("data-test");
                            if (dataTest === "userListContent") {
                                Log.print(Log.l.trace, "userList panel opened" );
                                if (panelWrapper && 
                                    !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section") &&
                                    !WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                    if (!filterUserListPromise) {
                                        filterUserListFailedCount = 0;
                                        filterUserListPromise = WinJS.Promise.timeout(0).then(function () {
                                            that.filterUserList();
                                        });
                                    }
                                }
                            } else if (dataTest === "publicChat") {
                                Log.print(Log.l.trace, "chat panel opened" );
                                var closeChatButton = addedNode.querySelector(elementSelectors.closeChatButton);
                                if (closeChatButton) {
                                    var closeChatButtonSpan = closeChatButton.querySelector("span");
                                    if (closeChatButtonSpan) {
                                        closeChatButtonSpan.textContent = "Chat";
                                    }
                                }
                                var messageInput = fragmentElement.querySelector(elementSelectors.publicChatMessageInput);
                                if (messageInput) {
                                    messageInput.placeholder = getResourceText("event.chatInputPlaceholder");
                                    that.addPublicChatSubmitHandler(messageInput);
                                }
                                if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                                    if (!observeChatMessageListPromise) {
                                        observeChatMessageListPromise = WinJS.Promise.timeout(50).then(function () {
                                            that.observeChatMessageList();
                                        });
                                    }
                                }
                            } else if (dataTest === "notes") {
                                Log.print(Log.l.trace, "notes panel opened");
                            } else if (addedNode.firstElementChild.id === "pollPanel") {
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
                            var dataTest = removedNode.getAttribute("data-test") ||
                                removedNode.firstElementChild.getAttribute("data-test") ||
                                removedNode.firstElementChild.firstElementChild &&
                                removedNode.firstElementChild.firstElementChild.getAttribute("data-test");
                            if (dataTest === "userListContent") {
                                Log.print(Log.l.trace, "userList panel closed");
                                if (userListDefaults.userListObserver) {
                                    userListDefaults.userListObserver.disconnect();
                                    userListDefaults.userListObserver = null;
                                }
                                if (filterUserListPromise) {
                                    filterUserListPromise.cancel();
                                    filterUserListPromise = null;
                                }
                                that.binding.showUserList = false;
                            } else if (dataTest === "publicChat") {
                                Log.print(Log.l.trace, "chat panel closed");
                                if (userListDefaults.publicChatSubmit) {
                                    var submitButton = removedNode.querySelector('form  button[type="submit"]');
                                    if (submitButton) {
                                        submitButton.onclick = userListDefaults.publicChatSubmit;
                                        userListDefaults.publicChatSubmit = null;
                                    }
                                }
                                if (observeChatMessageListPromise) {
                                    observeChatMessageListPromise.cancel();
                                    observeChatMessageListPromise = null;
                                }
                                that.binding.showChat = false;
                            } else if (dataTest === "notes") {
                                Log.print(Log.l.trace, "notes panel closed");
                                that.binding.showNotes = false;
                            } else if (removedNode.firstElementChild.id === "pollPanel") {
                                Log.print(Log.l.trace, "poll panel closed");
                                that.removeQuestionSelection();
                            } else {
                                Log.print(Log.l.trace, "other panel closed");
                            }
                        }
                    }
                    WinJS.Promise.as().then(function () {
                        if (!checkForInactiveVideoPromise) {
                            checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function () {
                                that.checkForInactiveVideo();
                            });
                        }
                        if (!adjustContentPositionsPromise) {
                            adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function () {
                                that.adjustContentPositions();
                            });
                        }
                        return WinJS.Promise.timeout(250);
                    }).then(function () {
                        var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                        if (!that.binding.showUserList && !that.binding.showChat && !that.binding.showNotes && !that.binding.showPaneTools &&
                            userListContent && WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium-small")) {
                            var btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                            if (btnToggleUserList) {
                                btnToggleUserList.click();
                            }
                        }
                        that.sendResize(50);
                    });
                }
                Log.ret(Log.l.trace);
            }
            that.handlePanelsClosed = handlePanelsClosed;
            
            var markupLockedMessages = function (addedNodes) {
                var chatPane = fragmentElement.querySelector(elementSelectors.publicChat);
                var messageList = chatPane && chatPane.querySelector(elementSelectors.chatMessages + " " + elementSelectors.grid);
                if (messageList && messageList.firstElementChild) {
                    var counter = 0, i, messageElement;
                    var elementCount = addedNodes ? addedNodes.length : messageList.firstElementChild.childElementCount;
                    var itemElement = addedNodes ? addedNodes[0] : messageList.firstElementChild.firstElementChild;
                    while (counter < elementCount && itemElement) {
                        var item = null;
                        if (itemElement.parentElement.parentElement === messageList &&
                            itemElement.firstElementChild && WinJS.Utilities.hasClass(itemElement.firstElementChild, bbbClass.item)) {
                            item = itemElement.firstElementChild;
                        }
                        if (item) {
                            var nameElement = null;
                            if (userListDefaults.selfName) {
                                nameElement = item.querySelector(elementSelectors.nameElement);
                                if (nameElement && nameElement.textContent === userListDefaults.selfName) {
                                    if (!WinJS.Utilities.hasClass(item, "from-myself")) {
                                        WinJS.Utilities.addClass(item, "from-myself");
                                    }
                                }
                            }
                            var messageElements = null;
                            var isLocked = false;
                            var timeElement = item.querySelector(elementSelectors.time);
                            var date = null;
                            if (timeElement && timeElement.dateTime) {
                                try {
                                    date = new Date(timeElement.dateTime);
                                } catch (ex) {
                                    Log.print(Log.l.error, "Exception in message handling dateTime=" + timeElement.dateTime);
                                }
                            }
                            if (date) {
                                var chatTs = date.getTime();
                                if (lockedChatMessages[chatTs]) {
                                    if (!nameElement) {
                                        nameElement = item.querySelector(elementSelectors.nameElement);
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
                                                messageElements = item.querySelectorAll(elementSelectors.message);
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
                                        messageElements = item.querySelectorAll(elementSelectors.message);
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
                                        messageElements = item.querySelectorAll(elementSelectors.message);
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
                        itemElement = addedNodes ? addedNodes[counter] : itemElement.nextElementSibling;
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
                var chatPane = fragmentElement.querySelector(elementSelectors.publicChat);
                var messageList = chatPane && chatPane.querySelector(elementSelectors.chatMessages + " " + elementSelectors.grid);
                if (messageList) {
                    if (pageControllerName === "modSessionController" &&
                        !messageList._onClickHandler) {
                        messageList._onClickHandler = function (event) {
                            if (event && event.currentTarget === messageList) {
                                var target = event.target;
                                if (target && event.currentTarget !== target && messageList.contains(target)) {
                                    var item = null;
                                    var itemElement = target;
                                    while (!item && itemElement && itemElement.parent !== messageList) {
                                        if (itemElement.parentElement.parentElement === messageList &&
                                            itemElement.firstElementChild && WinJS.Utilities.hasClass(itemElement.firstElementChild, bbbClass.item)) {
                                            item = itemElement.firstElementChild;
                                        }
                                        itemElement = itemElement.parentElement;
                                    }
                                    if (item) {
                                        var locked = WinJS.Utilities.hasClass(item, "chat-message-locked");
                                        var nameElement = item.querySelector(elementSelectors.nameElement);
                                        var timeElement = item.querySelector(elementSelectors.time);
                                        var date = null;
                                        if (timeElement && timeElement.dateTime) {
                                            try {
                                                date = new Date(timeElement.dateTime);
                                            } catch (ex) {
                                                Log.print(Log.l.error, "Exception in message handling dateTime=" + timeElement.dateTime);
                                            }
                                        }
                                        var messageElements = item.querySelectorAll(elementSelectors.message);
                                        if (date && nameElement && timeElement && messageElements) {
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
                                                messageElements = item.querySelectorAll(elementSelectors.message);
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
                            mutationList.forEach(function (mutation) {
                                if (mutation) {
                                    switch (mutation.type) {
                                    case "attributes":
                                        Log.print(Log.l.trace, "chat messageList style changed!");
                                        if (!adjustContentPositionsPromise) {
                                            adjustContentPositionsPromise = WinJS.Promise.timeout(20).then(function () {
                                                that.adjustContentPositions();
                                            });
                                        }
                                        break;
                                    case "childList":
                                        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                                            Log.print(Log.l.trace, "chat messageList changed!");
                                            that.markupLockedMessages(mutation.addedNodes);
                                        }
                                        break;
                                    }
                                }
                            });
                        });
                        messageList._chatMessagesObserver.observe(messageList.firstElementChild, {
                            childList: true,
                            attributeFilter: ["style"]
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
                    //event.preventDefault();
                    event.stopPropagation();
                }
                return true;
            }
            that.onWheelSvg = null;

            var adjustVideoPosition = function (mediaContainer, overlayElement, videoListItem, options) {
                Log.call(Log.l.trace, "Conference.Controller.");
                var video = videoListItem.querySelector("video");
                if (video && video.style) {
                    if (!WinJS.Utilities.hasClass(videoListItem, "selfie-video") &&
                        deviceList && deviceList.length > 0) {
                        var mediaStream = video.srcObject;
                        if (mediaStream && typeof mediaStream.getVideoTracks === "function") {
                            var videoTrack = mediaStream.getVideoTracks() ? mediaStream.getVideoTracks()[0] : null;
                            if (videoTrack && typeof videoTrack.getSettings === "function") {
                                var settings = videoTrack.getSettings(), j;
                                for (j = 0; j < deviceList.length; j++) {
                                    if (deviceList[j].deviceId === settings.deviceId) {
                                        Log.print(Log.l.trace, "found local " + deviceList[j].kind + ":" + deviceList[j].label + " with deviceId=" + deviceList[j].deviceId);
                                        WinJS.Utilities.addClass(videoListItem, "selfie-video");
                                        break;
                                    }
                                }
                                if (j === deviceList.length) {
                                    if (videoTrack.canvas) {
                                        Log.print(Log.l.trace, "guess local with background filter deviceId=" + settings.deviceId + " object=" + videoTrack.toString());
                                        WinJS.Utilities.addClass(videoListItem, "selfie-video");
                                    }
                                }
                            }
                        }
                    }
                    if (WinJS.Utilities.hasClass(videoListItem, "selfie-video")) {
                        var userName = videoListItem.querySelector(elementSelectors.videoUserName);
                        if (userName) {
                            if (!userName.firstElementChild) {
                                var iLabel = document.createElement("i");
                                iLabel.innerHTML = myselfLabel;
                                userName.appendChild(iLabel);
                            }
                        }
                    }
                    if ((that.binding.presenterModeTiled || that.binding.presenterModeSmall) && !options.isHidden) {
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
                            if (that.binding.videoListRight) {
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

            var registerFullscreenHandlers = function(element, fullScreenButton) {
                if (element && fullScreenButton) {
                    fullScreenButton.onclick = function (event) {
                        if (element && document.fullscreenEnabled) {
                            // detect fullscreen state
                            try {
                                if (element.parentElement.querySelector(':fullscreen') === element) {
                                    if (typeof document.exitFullscreen === "function") {
                                        document.exitFullscreen();
                                    } else if (document.webkitExitFullscreen === "function") {
                                        document.webkitExitFullscreen();
                                    }
                                } else {
                                    if (typeof element.requestFullscreen === "function") {
                                        element.requestFullscreen();
                                    } else if (element.webkitRequestFullscreen === "function") {
                                        element.webkitRequestFullscreen();
                                    }
                                }
                                event.stopPropagation();
                            } catch (ex) {
                                // ignore that...
                            }
                        }
                    }
                    that.addRemovableEventListener(document, "fullscreenchange", function () {
                        var fullScreenButtonIcon = fullScreenButton.querySelector("i");
                        if (element && element.firstElementChild &&
                            fullScreenButtonIcon && fullScreenButtonIcon.firstElementChild) {
                            if (document.fullscreenElement === element) {
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
                }
            }
            that.registerFullscreenHandlers = registerFullscreenHandlers;

            var handleAudioVideoButtonStatus = function() {
                Log.call(Log.l.trace, "Conference.Controller.", "");
                var microphoneOff = fragmentElement.querySelector(elementSelectors.microphoneOff);
                if (microphoneOff) {
                    that.binding.audioOn = true;
                    that.binding.microphoneEnabled = true;
                    that.binding.microphoneOn = true;
                } else {
                    that.binding.microphoneOn = false;
                    var microphoneOn = fragmentElement.querySelector(elementSelectors.microphoneOn);
                    if (microphoneOn) {
                        that.binding.audioOn = true;
                        that.binding.microphoneEnabled = true;
                    } else {
                        that.binding.microphoneEnabled = false;
                        var leaveAudio = fragmentElement.querySelector(elementSelectors.leaveAudio);
                        if (leaveAudio) {
                            that.binding.audioOn = true;
                        } else {
                            that.binding.audioOn = false;
                        }
                    }
                } 
                var leaveVideo = fragmentElement.querySelector(elementSelectors.leaveVideo);
                if (leaveVideo) {
                    that.binding.cameraOn = true;
                    if (pageControllerName === "modSessionController" && that.binding.showPaneTools ||
                        !(pageControllerName === "modSessionController") && that.binding.showUserList) {
                        if (!checkForInactiveVideoPromise) {
                            checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                                that.checkForInactiveVideo();
                            });
                        }
                    }
                } else {
                    that.binding.cameraOn = false;
                } 
                if (that.binding.showPresentation) {
                    var showMediaButton = fragmentElement.querySelector(elementSelectors.showMediaButton);
                    if (showMediaButton) {
                        that.binding.showMediaOn = true;
                    } else {
                        that.binding.showMediaOn = false;
                    }
                    var startDeskShare = fragmentElement.querySelector(elementSelectors.startDeskShare);
                    var stopDeskShare = fragmentElement.querySelector(elementSelectors.stopDeskShare);
                    if (stopDeskShare) {
                        that.binding.showDeskShareActive = true;
                        that.binding.showDeskShareOn = true;
                    } else if (startDeskShare) {
                        that.binding.showDeskShareActive = false;
                        that.binding.showDeskShareOn = true;
                    } else {
                        that.binding.showDeskShareActive = false;
                        that.binding.showDeskShareOn = false;
                    }
                } else {
                    that.binding.showMediaOn = false;
                    that.binding.showDeskShareOn = false;
                }
                Log.ret(Log.l.trace, "");
            }
            that.handleAudioVideoButtonStatus = handleAudioVideoButtonStatus;

            var checkForTalkingEnd = function(now) {
                Log.call(Log.l.trace, "Conference.Controller.", "now=" + now + " myTalkingActivityStart=" + myTalkingActivityStart);
                if (checkForTalkingEndPromise) {
                    checkForTalkingEndPromise.cancel();
                    checkForTalkingEndPromise = null;
                }
                if (now) {
                    if (!myTalkingActivityEnd) {
                        myTalkingActivityEnd = now;
                    }
                } else {
                    now = Date.now();
                }
                if (myTalkingActivityStart) {
                    var talkingIndicator = fragmentElement.querySelector(elementSelectors.talkingIndicator); 
                    if (myTalkingActivityIndicator &&
                        myTalkingActivityIndicator.parentElement &&
                        myTalkingActivityIndicator.parentElement.parentElement === talkingIndicator &&
                        myTalkingActivityIndicator.getAttribute("data-test") === "isTalking") {
                        Log.print(Log.l.trace, "still talking!");
                        myTalkingActivityEnd = null;
                    } else if (!myTalkingActivityEnd) {
                        Log.print(Log.l.trace, "no longer talking!");
                        myTalkingActivityEnd = now;
                        myTalkingActivityIndicator = null;
                    }
                }
                if (myTalkingActivityEnd) {
                    var inactivity = now - myTalkingActivityEnd;
                    Log.print(Log.l.trace, "inactivity=" + inactivity);
                    if (myTalkingActivityStart && inactivity > videoListDefaults.inactivityDelay + 2000) {
                        var myTalkingActivityDuration = myTalkingActivityEnd - myTalkingActivityStart;
                        Log.print(Log.l.trace, "myTalkingActivityDuration=" + myTalkingActivityDuration);
                        if (myTalkingActivityDuration > 1000) {
                            AppData.call("PRC_CreateIncident", {
                                pUserToken: userToken,
                                pIncidentName: "Voice",
                                pTextInfo1: Math.round(myTalkingActivityDuration / 1000).toString()
                            },
                            function(json) {
                                Log.print(Log.l.trace, "PRC_CreateIncident success!");
                            },
                            function(error) {
                                Log.print(Log.l.error, "PRC_CreateIncident error! ");
                            });
                        }
                        myTalkingActivityStart = null;
                        myTalkingActivityEnd = null;
                        myTalkingActivityIndicator = null;
                    } 
                }
                if (myTalkingActivityStart && !checkForTalkingEndPromise) {
                    checkForTalkingEndPromise = WinJS.Promise.timeout(250).then(function() {
                        that.checkForTalkingEnd();
                    });
                }
                Log.ret(Log.l.trace, "");
            }
            that.checkForTalkingEnd = checkForTalkingEnd;

            var handleTalkingStart = function(addedNodes) {
                var i;
                Log.call(Log.l.trace, "Conference.Controller.", "");
                if (addedNodes && addedNodes.length > 0 && userListDefaults.selfName) {
                    for (i = 0; i < addedNodes.length; i++) {
                        var addedNode = addedNodes[i];
                        if (addedNode) {
                            var dataTest = addedNode.getAttribute("data-test");
                            var span = addedNode.querySelector("span");
                            if (span && span.firstChild) {
                                var talkingName = span.firstChild.textContent;
                                Log.print(Log.l.trace, "talkingName=" + talkingName + " dataTest=" + dataTest + " selfName=" + userListDefaults.selfName);
                                if (talkingName === userListDefaults.selfName) {
                                    myTalkingActivityIndicator = addedNode;
                                    var now = Date.now();
                                    if (!myTalkingActivityStart) {
                                        myTalkingActivityStart = now;
                                        myTalkingActivityEnd = null;
                                        Log.print(Log.l.trace, "Talking started");
                                        /*AppData.call("PRC_CreateIncident", {
                                            pUserToken: userToken,
                                            pIncidentName: "Voice",
                                            pTextInfo1: "Start"
                                        },
                                        function(json) {
                                            Log.print(Log.l.trace, "PRC_CreateIncident success!");
                                        },
                                        function(error) {
                                            Log.print(Log.l.error, "PRC_CreateIncident error! ");
                                        });*/
                                    }
                                    if (!checkForTalkingEndPromise) {
                                        checkForTalkingEndPromise = WinJS.Promise.timeout(250).then(function() {
                                            that.checkForTalkingEnd();
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace, "");
            }
            that.handleTalkingStart = handleTalkingStart;

            var handleTalkingEnd = function(removedNodes) {
                var i;
                Log.call(Log.l.trace, "Conference.Controller.", "");
                if (removedNodes && removedNodes.length > 0 && userListDefaults.selfName) {
                    for (i = 0; i < removedNodes.length; i++) {
                        var removedNode = removedNodes[i];
                        if (removedNode) {
                            var span = removedNode.querySelector("span");
                            if (span && span.firstChild) {
                                var talkingName = span.firstChild.textContent;
                                Log.print(Log.l.trace, "talkingName=" + talkingName + " selfName=" + userListDefaults.selfName);
                                if (talkingName === userListDefaults.selfName) {
                                    myTalkingActivityIndicator = null;
                                    var now = Date.now();
                                    that.checkForTalkingEnd(now);
                                }
                            }
                        }
                    }
                }
                Log.ret(Log.l.trace, "");
            }
            that.handleTalkingEnd = handleTalkingEnd;

            var lastDeviceListTime = 0;
            var adjustContentPositions = function () {
                Log.call(Log.l.trace, "Conference.Controller.", "videoListPosition=" + (that.binding.dataSessionStatus && that.binding.dataSessionStatus.VideoListPosition));
                if (adjustContentPositionsPromise) {
                    adjustContentPositionsPromise.cancel();
                    adjustContentPositionsPromise = null;
                }
                if (!that.binding.dataSessionStatus || !that.binding.dataSessionStatus.VideoListPosition) {
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
                    var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                    if (panelWrapper) {
                        Log.print(Log.l.trace, "panelWrapper open!");
                        if (!userListDefaults.appObserver) {
                            var appElement = fragmentElement.querySelector(elementSelectors.app);
                            if (appElement) {
                                userListDefaults.appObserver = new MutationObserver(function (mutationList, observer) {
                                    for (var i = 0; i < mutationList.length; i++) {
                                        var mutation = mutationList[i];
                                        if (mutation && mutation.type === "childList") {
                                            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                                                Log.print(Log.l.trace, "app children added!");
                                                for (var j = 0; j < mutation.addedNodes.length; j++) {
                                                    var addedNode = mutation.addedNodes[j];
                                                    if (addedNode) {
                                                        var meetingEndedModalTitle = addedNode.querySelector(elementSelectors.meetingEndedModalTitle);
                                                        if (meetingEndedModalTitle && 
                                                            meetingEndedModalTitle.parentElement &&
                                                            meetingEndedModalTitle.parentElement.parentElement) {
                                                            var buttonOk = meetingEndedModalTitle.parentElement.parentElement.querySelector('button[aria-label="OK"]');
                                                            if (buttonOk) {
                                                                buttonOk.id = "closeConnection";
                                                                buttonOk.onclick = function(event) {
                                                                    AppBar.handleEvent('click', 'clickAction', event);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                                userListDefaults.appObserver.observe(appElement, {
                                    childList: true
                                });
                            }
                        }
                        var videoPlayer = panelWrapper.querySelector(elementSelectors.videoPlayer);
                        if (videoPlayer && videoPlayer.firstElementChild) {
                            Log.print(Log.l.trace, "videoPlayer open!");
                            videoPLayerOpened = true;
                            var videoElement = videoPlayer.firstElementChild;
                            var fullScreenButton = null;
                            if (pageControllerName === "eventController") {
                                // hide controls on event page!
                                if (videoElement.controls) {
                                    videoElement.controls = false;
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
                                    fullScreenButton.parentElement.style.marginLeft = (fullScreenButtonLeft - 1).toString() + "px";
                                    fullScreenButton.parentElement.style.marginTop = (newTop + 1).toString() + "px";
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
                        var screenShareVideo = panelWrapper.querySelector(elementSelectors.screenShareVideo);
                        if (screenShareVideo) {
                            Log.print(Log.l.trace, "screenShareVideo open!");
                            var screenShareContainer = screenShareVideo.parentElement;
                            screenShareOpened = true;
                            var screenShareFullscreen = screenShareContainer.querySelector(elementSelectors.fullScreenButton);
                            if (screenShareFullscreen && !screenShareFullscreen._handlerRegistered) {
                                that.registerFullscreenHandlers(screenShareContainer, screenShareFullscreen);
                                screenShareFullscreen._handlerRegistered = true;
                            }
                        }
                        var svgWhiteboard = panelWrapper.querySelector(elementSelectors.svgWhiteboard);
                        if (svgWhiteboard) {
                            Log.print(Log.l.trace, "svgWhiteboard open!");
                            var svgContainer = svgWhiteboard.parentElement.parentElement;
                            presentationOpened = true;
                            // prevent zoom per mouse wheel!
                            if (!that.onWheelSvg) {
                                that.onWheelSvg = onWheelSvg;
                                that.addRemovableEventListener(svgWhiteboard, "wheel", that.onWheelSvg.bind(that), true);
                            }
                            var presentationFullscreen = svgContainer.querySelector(elementSelectors.fullScreenButton);
                            if (presentationFullscreen && !presentationFullscreen._handlerRegistered) {
                                that.registerFullscreenHandlers(svgContainer, presentationFullscreen);
                                presentationFullscreen._handlerRegistered = true;
                            }
                        } else {
                            that.onWheelSvg = null;
                            if (!videoPLayerOpened && !screenShareOpened) {
                                Log.print(Log.l.trace, "svgWhiteboard not open - look for presentationContainer or presentationPlaceholder");
                                var presentationContainer = panelWrapper.querySelector(elementSelectors.presentationContainer );
                                var presentationPlaceholder = panelWrapper.querySelector(elementSelectors.presentationPlaceholder);
                                if (presentationContainer || presentationPlaceholder) {
                                    Log.print(Log.l.trace, "svgWhiteboard not ready yet!");
                                    if (!adjustContentPositionsPromise) {
                                        adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function () {
                                            that.adjustContentPositions();
                                        });
                                    }
                                }
                            }
                        }
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
                                WinJS.Promise.timeout(0).then(function () {
                                    var hasUnreadMessagesButton = fragmentElement.querySelector(elementSelectors.hasUnreadMessagesButton);
                                    if (hasUnreadMessagesButton) {
                                        that.binding.hasUnreadMessages = true;
                                    } else {
                                        that.binding.hasUnreadMessages = false;
                                    }
                                });
                            });
                            userListDefaults.panelWrapperObserver.observe(panelWrapper, {
                                childList: true,
                                attributeFilter: ["data-test"],
                                subtree: true
                            });
                        }
                        var actionsBarCenter = fragmentElement.querySelector(elementSelectors.actionsBarCenter);
                        if (actionsBarCenter && !actionsBarCenterObserver) {
                            actionsBarCenterObserver = new MutationObserver(function (mutationList, observer) {
                                WinJS.Promise.timeout(0).then(function () {
                                    that.handleAudioVideoButtonStatus();
                                });
                            });
                            if (actionsBarCenterObserver) {
                                actionsBarCenterObserver.observe(actionsBarCenter, {
                                    childList: true,
                                    attributeFilter: ["aria-label"],
                                    subtree: true
                                });
                            }
                        }
                        var talkingIndicator = fragmentElement.querySelector(elementSelectors.talkingIndicator);
                        if (talkingIndicator && talkingIndicator.firstElementChild && !talkingIndicatorObserver &&
                            that.binding.microphoneOn && !that.binding.cameraOn) {
                            talkingIndicatorObserver = new MutationObserver(function (mutationList, observer) {
                                for (var i = 0; i < mutationList.length; i++) {
                                    var mutation = mutationList[i];
                                    if (mutation && mutation.type === "childList") {
                                        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                                            Log.print(Log.l.trace, "talkingIndicator added!");
                                            that.handleTalkingStart(mutation.addedNodes);
                                        }
                                        if (mutation.removedNodes && mutation.removedNodes.length > 0) {
                                            Log.print(Log.l.trace, "talkingIndicator removed!");
                                            that.handleTalkingEnd(mutation.removedNodes);
                                        }
                                    }
                                }
                            });
                            if (talkingIndicatorObserver) {
                                talkingIndicatorObserver.observe(talkingIndicator.firstElementChild, {
                                    childList: true
                                });
                            }
                        } else if (talkingIndicatorObserver) {
                            talkingIndicatorObserver.disconnect();
                            talkingIndicatorObserver = null;
                        }

                        var mediaContainer = panelWrapper;
                        if (mediaContainer) {
                            var cameraDock = mediaContainer.querySelector(elementSelectors.cameraDock);
                            var overlayElement = cameraDock && cameraDock.parentElement;
                            var overlayElementParent = overlayElement && overlayElement.parentElement;
                            if (overlayElementParent) {
                                if (overlayElementParent.parentElement && overlayElementParent.parentElement.id === "layout") {
                                    if (!WinJS.Utilities.hasClass(overlayElementParent, "video-overlay-pane")) {
                                        WinJS.Utilities.addClass(overlayElementParent, "video-overlay-pane");
                                    }
                                } else if (overlayElementParent.id === "layout") {
                                    if (!WinJS.Utilities.hasClass(overlayElement, "video-overlay-pane")) {
                                        WinJS.Utilities.addClass(overlayElement, "video-overlay-pane");
                                    }
                                }
                            }
                            var numVideos = 0;
                            WinJS.Promise.timeout(20).then(function() {
                                var paneWidth = 0;
                                var currentPane = panelWrapper.firstElementChild;
                                var actionsBar = fragmentElement.querySelector(elementSelectors.actionsBar);
                                if (pageControllerName === "modSessionController" && that.binding.showPaneTools) {
                                    paneWidth = paneTools.clientWidth;
                                }
                                if (WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium")) {
                                    panelWrapper.style.left = "0";
                                    panelWrapper.style.width = "100%";
                                    while (currentPane &&
                                        typeof currentPane.tagName === "string" &&
                                        currentPane.tagName.toLowerCase() !== "header") {
                                        if (!WinJS.Utilities.hasClass(currentPane, "opened-pane")) {
                                            WinJS.Utilities.addClass(currentPane, "opened-pane");
                                        }
                                        if (currentPane.style) {
                                            if (paneWidth < panelWrapper.clientWidth) {
                                                currentPane.style.left = paneWidth + "px";
                                            } else {
                                                currentPane.style.left = "0";
                                            }
                                        }
                                        paneWidth += currentPane.clientWidth;
                                        currentPane = currentPane.nextElementSibling;
                                    }
                                    if (paneWidth > 0 &&
                                        !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section") &&
                                        !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section") ||
                                        pageControllerName === "modSessionController" && that.binding.showPaneTools) {
                                        if (!WinJS.Utilities.hasClass(panelWrapper, "pane-expanded")) {
                                            WinJS.Utilities.addClass(panelWrapper, "pane-expanded");
                                        }
                                        Log.print(Log.l.trace, "paneWidth=" + paneWidth);
                                    } else {
                                        if (WinJS.Utilities.hasClass(panelWrapper, "pane-expanded")) {
                                            WinJS.Utilities.removeClass(panelWrapper, "pane-expanded");
                                        }
                                    }
                                    if (actionsBar && actionsBar.style) {
                                        actionsBar.style.left = 0;
                                        actionsBar.style.width = "100%";
                                        actionsBar.style.maxWidth = "100%";
                                    }
                                } else {
                                    while (currentPane &&
                                        typeof currentPane.tagName === "string" &&
                                        currentPane.tagName.toLowerCase() !== "header") {
                                        if (!WinJS.Utilities.hasClass(currentPane, "opened-pane")) {
                                            WinJS.Utilities.addClass(currentPane, "opened-pane");
                                        }
                                        paneWidth += currentPane.clientWidth;
                                        currentPane = currentPane.nextElementSibling;
                                    }
                                    if (paneWidth > 0 &&
                                        !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section") &&
                                        !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section") ||
                                        pageControllerName === "modSessionController" && that.binding.showPaneTools) {
                                        if (!WinJS.Utilities.hasClass(panelWrapper, "pane-expanded")) {
                                            WinJS.Utilities.addClass(panelWrapper, "pane-expanded");
                                        }
                                        Log.print(Log.l.trace, "paneWidth=" + paneWidth);
                                        panelWrapper.style.width = "calc(100% - " + paneWidth.toString() + "px)";
                                        panelWrapper.style.left = paneWidth.toString() + "px";
                                        if (actionsBar && actionsBar.style) {
                                            actionsBar.style.left = (-paneWidth).toString() + "px";
                                            actionsBar.style.width = "calc(100% + " + paneWidth.toString() + "px)";
                                            actionsBar.style.maxWidth = "calc(100% + " + paneWidth.toString() + "px)";
                                        }
                                        currentPane = panelWrapper.firstElementChild;
                                        while (currentPane &&
                                            typeof currentPane.tagName === "string" &&
                                            currentPane.tagName.toLowerCase() !== "header") {
                                            currentPane.style.left = "-" + paneWidth.toString() + "px";
                                            paneWidth -= currentPane.clientWidth;
                                            currentPane = currentPane.nextElementSibling;
                                        }
                                    } else {
                                        if (WinJS.Utilities.hasClass(panelWrapper, "pane-expanded")) {
                                            WinJS.Utilities.removeClass(panelWrapper, "pane-expanded");
                                        }
                                        panelWrapper.style.width = "100%";
                                        panelWrapper.style.left = "0";
                                        if (actionsBar && actionsBar.style) {
                                            actionsBar.style.left = 0;
                                            actionsBar.style.width = "100%";
                                            actionsBar.style.maxWidth = "100%";
                                        }
                                    }
                                }
                                if (overlayElement) {
                                    var overlayStyle = window.getComputedStyle(overlayElement);
                                    if (overlayStyle) {
                                        var transform = overlayStyle.getPropertyValue("transform");
                                        if (typeof transform === "string") {
                                            if (transform.substr(0, 10) === "translate(" ||
                                                transform.substr(0, 7) === "matrix(") {
                                                var stop = transform.lastIndexOf(",");
                                                if (stop > 0) {
                                                    var start = stop-1;
                                                    while (start > 0 && transform[start] !== "," && transform[start] !== "(") {
                                                        start--;
                                                    }
                                                    var newTransform = transform.substr(0, start + 1) + " 0" + transform.substr(stop);
                                                    overlayElement.style.transform = newTransform;
                                                }
                                            }
                                        }
                                    }
                                    if (videoPLayerOpened || screenShareOpened || presentationOpened) {
                                        overlayElement.style.left = "";
                                        overlayElement.style.width = "";
                                    } else {
                                        overlayElement.style.left = "0";
                                        overlayElement.style.width = "100%";
                                    }
                                } 
                                if (!that.binding.showUserList && !WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                    var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                                    if (userListContent) {
                                        WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                                    }
                                }
                                if (!that.binding.showChat && !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                                    var closeChatButton = fragmentElement.querySelector(elementSelectors.closeChatButton);
                                    if (closeChatButton) {
                                        closeChatButton.click();
                                    }
                                }
                                if (!that.binding.showNotes) {
                                    var closeNotesButton = fragmentElement.querySelector(elementSelectors.closeNotesButton);
                                    if (closeNotesButton) {
                                        closeNotesButton.click();
                                    }
                                }
                            });
                            if (!sessionStatusIsSet && that.binding.dataSessionStatus) {
                                that.setPresenterModeState(that.binding.dataSessionStatus.PresenterMode);
                                if (that.binding.dataSessionStatus.ShowVideoList) {
                                    if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-hidden")) {
                                        WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-hidden");
                                    }
                                } else {
                                    if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-hidden")) {
                                        WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-hidden");
                                    }
                                }
                                if (that.binding.dataSessionStatus.ShowPresentation) {
                                    if (WinJS.Utilities.hasClass(mediaContainer, "presentation-is-hidden")) {
                                        WinJS.Utilities.removeClass(mediaContainer, "presentation-is-hidden");
                                    }
                                    if (!(videoPLayerOpened || screenShareOpened || presentationOpened)) {
                                        var restoreDescButton = fragmentElement.querySelector(elementSelectors.restorePresentation + ", " + elementSelectors.restorePresentationButton);
                                        if (restoreDescButton) {
                                            Log.ret(Log.l.trace, "click restoreDescButton");
                                            restoreDescButton.click();
                                        }
                                    } else {
                                        sessionStatusIsSet = true;
                                    }
                                } else {
                                    if (!WinJS.Utilities.hasClass(mediaContainer, "presentation-is-hidden")) {
                                        WinJS.Utilities.addClass(mediaContainer, "presentation-is-hidden");
                                    }
                                    if (videoPLayerOpened || screenShareOpened || presentationOpened) {
                                        var closeDescButton = fragmentElement.querySelector(elementSelectors.minimizePresentation + ", " + elementSelectors.hidePresentationButton);
                                        if (closeDescButton) {
                                            Log.ret(Log.l.trace, "click closeDescButton");
                                            closeDescButton.click();
                                        }
                                    } else {
                                        sessionStatusIsSet = true;
                                    }
                                }
                                if (sessionStatusIsSet) {
                                    var mediaView = fragmentElement.querySelector(elementSelectors.mediaView);
                                    if (mediaView && !WinJS.Utilities.hasClass(mediaView, "session-state-complete")) {
                                        WinJS.Utilities.addClass(mediaView, "session-state-complete");
                                    }
                                }
                            }
                            var actionsBar = fragmentElement.querySelector(elementSelectors.actionsBar);
                            if (paneTools && paneTools.style && actionsBar &&
                                !isChildElement(mediaContainer, paneTools)) {
                                mediaContainer.insertBefore(paneTools, actionsBar);
                                if (pageControllerName === "modSessionController") {
                                    that.binding.showPresenterButtons = true;
                                }
                            }
                            var actionsBarLeft = fragmentElement.querySelector(elementSelectors.actionsBarLeft);
                            var actionsBarRight = fragmentElement.querySelector(elementSelectors.actionsBarRight);
                            if (raiseHandButtonContainer && raiseHandButtonContainer.style) {
                                if (actionsBarCenter &&
                                    !isChildElement(actionsBarCenter, raiseHandButtonContainer)) {
                                    if (actionsBarCenter.firstElementChild) {
                                        actionsBarCenter.insertBefore(raiseHandButtonContainer, actionsBarCenter.firstElementChild);
                                    } else {
                                        actionsBarCenter.appendChild(raiseHandButtonContainer);
                                    }
                                    raiseHandButtonContainer.style.display = "inline-block";
                                    var lowerHandLabel = fragmentElement.querySelector(elementSelectors.lowerHandLabel);
                                    if (lowerHandLabel) {
                                        that.binding.raiseHand = true;
                                    } else {
                                        that.binding.raiseHand = false;
                                    }
                                }
                            }
                            if (showMediaButtonContainer && showMediaButtonContainer.style) {
                                if (actionsBarCenter &&
                                    !isChildElement(actionsBarCenter, showMediaButtonContainer)) {
                                    if (actionsBarCenter.firstElementChild) {
                                        actionsBarCenter.insertBefore(showMediaButtonContainer, actionsBarCenter.firstElementChild);
                                    } else {
                                        actionsBarCenter.appendChild(showMediaButtonContainer);
                                    }
                                    showMediaButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (showDeskShareButtonContainer && showDeskShareButtonContainer.style) {
                                if (actionsBarCenter &&
                                    !isChildElement(actionsBarCenter, showDeskShareButtonContainer)) {
                                    if (actionsBarCenter.firstElementChild) {
                                        actionsBarCenter.insertBefore(showDeskShareButtonContainer, actionsBarCenter.firstElementChild);
                                    } else {
                                        actionsBarCenter.appendChild(showDeskShareButtonContainer);
                                    }
                                    showDeskShareButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (pageControllerName === "modSessionController") {
                                if (showVideoListToggleContainer && showVideoListToggleContainer.style) {
                                    if (actionsBarCenter &&
                                        !isChildElement(actionsBarCenter, showVideoListToggleContainer)) {
                                        if (actionsBarCenter.firstElementChild) {
                                            actionsBarCenter.insertBefore(showVideoListToggleContainer, actionsBarCenter.firstElementChild);
                                        } else {
                                            actionsBarCenter.appendChild(showVideoListToggleContainer);
                                        }
                                        showVideoListToggleContainer.style.display = "inline-block";
                                    }
                                }
                                if (showPresentationToggleContainer && showPresentationToggleContainer.style) {
                                    if (actionsBarCenter &&
                                        !isChildElement(actionsBarCenter, showPresentationToggleContainer)) {
                                        if (actionsBarCenter.firstElementChild) {
                                            actionsBarCenter.insertBefore(showPresentationToggleContainer, actionsBarCenter.firstElementChild);
                                        } else {
                                            actionsBarCenter.appendChild(showPresentationToggleContainer);
                                        }
                                        showPresentationToggleContainer.style.display = "inline-block";
                                    }
                                }
                                if (showConnectionStatusContainer && showConnectionStatusContainer.style) {
                                    if (actionsBarRight &&
                                        !isChildElement(actionsBarRight, showConnectionStatusContainer)) {
                                        if (actionsBarRight.firstElementChild) {
                                            actionsBarRight.insertBefore(showConnectionStatusContainer, actionsBarRight.firstElementChild);
                                        } else {
                                            actionsBarRight.appendChild(showConnectionStatusContainer);
                                        }
                                        showConnectionStatusContainer.style.display = "inline-block";
                                    }
                                }
                            }
                            if (toggleCameraButtonContainer && toggleCameraButtonContainer.style) {
                                if (actionsBarRight &&
                                    !isChildElement(actionsBarRight, toggleCameraButtonContainer)) {
                                    if (actionsBarRight.firstElementChild) {
                                        actionsBarRight.insertBefore(toggleCameraButtonContainer, actionsBarRight.firstElementChild);
                                    } else {
                                        actionsBarRight.appendChild(toggleCameraButtonContainer);
                                    }
                                    toggleCameraButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (toggleMicrophoneButtonContainer && toggleMicrophoneButtonContainer.style) {
                                if (actionsBarRight &&
                                    !isChildElement(actionsBarRight, toggleMicrophoneButtonContainer)) {
                                    if (actionsBarRight.firstElementChild) {
                                        actionsBarRight.insertBefore(toggleMicrophoneButtonContainer, actionsBarRight.firstElementChild);
                                    } else {
                                        actionsBarRight.appendChild(toggleMicrophoneButtonContainer);
                                    }
                                    toggleMicrophoneButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (closeConnectionButtonContainer && closeConnectionButtonContainer.style) {
                                if (actionsBarRight &&
                                    !isChildElement(actionsBarRight, closeConnectionButtonContainer)) {
                                    actionsBarRight.appendChild(closeConnectionButtonContainer);
                                    closeConnectionButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (showUserListButtonContainer && showUserListButtonContainer.style) {
                                if (actionsBarLeft &&
                                    !isChildElement(actionsBarLeft, showUserListButtonContainer)) {
                                    actionsBarLeft.appendChild(showUserListButtonContainer);
                                    showUserListButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (showChatButtonContainer && showChatButtonContainer.style) {
                                if (actionsBarLeft &&
                                    !isChildElement(actionsBarLeft, showChatButtonContainer)) {
                                    actionsBarLeft.appendChild(showChatButtonContainer);
                                    showChatButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (showNotesButtonContainer && showNotesButtonContainer.style) {
                                if (actionsBarLeft &&
                                    !isChildElement(actionsBarLeft, showNotesButtonContainer)) {
                                    actionsBarLeft.appendChild(showNotesButtonContainer);
                                    showNotesButtonContainer.style.display = "inline-block";
                                }
                            }
                            if (pageControllerName === "modSessionController") {
                                if (showPaneToolsButtonContainer && showPaneToolsButtonContainer.style) {
                                    if (actionsBarLeft &&
                                        !isChildElement(actionsBarLeft, showPaneToolsButtonContainer)) {
                                        actionsBarLeft.appendChild(showPaneToolsButtonContainer);
                                        showPaneToolsButtonContainer.style.display = "inline-block";
                                    }
                                }
                            }
                            if (expandActionsToggleContainer && expandActionsToggleContainer.style) {
                                if (actionsBarCenter &&
                                    !isChildElement(actionsBarCenter, expandActionsToggleContainer)) {
                                    if (actionsBarCenter.firstElementChild) {
                                        actionsBarCenter.insertBefore(expandActionsToggleContainer, actionsBarCenter.firstElementChild);
                                    } else {
                                        actionsBarCenter.appendChild(expandActionsToggleContainer);
                                    }
                                    expandActionsToggleContainer.style.display = "block";
                                }
                            }
                            if (overlayElement) {
                                var overlayIsHidden = WinJS.Utilities.hasClass(overlayElement, bbbClass.hideOverlay);
                                var videoList = mediaContainer.querySelector(elementSelectors.videoList);
                                if (videoList && videoList.style && overlayElement.style) {
                                    if (!videoListDefaults.videoListObserver) {
                                        videoListDefaults.videoListObserver = new MutationObserver(function (mutationList, observer) {
                                            mutationList.forEach(function (mutation) {
                                                switch (mutation.type) {
                                                    case "attributes":
                                                        Log.print(Log.l.trace, "videoList attributes changed!");
                                                        if (!checkForInactiveVideoPromise) {
                                                            checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function () {
                                                                that.checkForInactiveVideo();
                                                            });
                                                        }
                                                        break;
                                                    case "childList":
                                                        Log.print(Log.l.trace, "videoList childList changed!");
                                                        lastDeviceListTime = 0;
                                                        if (!checkForInactiveVideoPromise) {
                                                            checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function () {
                                                                that.checkForInactiveVideo();
                                                            });
                                                        }
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
                                    if (videoListDefaults.usePinned || videoListDefaults.hideInactive) {
                                        numVideos = videoListDefaults.activeVideoCount;
                                    } else {
                                        numVideos = videoList.childElementCount;
                                    }
                                    if ( videoListDefaults.usePinned ) {
                                        if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-use-pinned")) {
                                            WinJS.Utilities.addClass(mediaContainer, "video-overlay-use-pinned");
                                        }
                                    } else {
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-use-pinned")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-use-pinned");
                                        }
                                    }
                                    var videoListItem = videoList.firstElementChild;
                                    var resCount = 0, imageScale = 1, curCount = 0;
                                    if (!that.binding.dataSessionStatus ||
                                        that.binding.dataSessionStatus && 
                                        (!that.binding.dataSessionStatus.ShowPresentation ||
                                         that.binding.dataSessionStatus.VideoListPosition === videoListDefaults.default) ||
                                        WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium") ||
                                        !(videoPLayerOpened || screenShareOpened || presentationOpened) || overlayIsHidden) {
                                        if (WinJS.Utilities.hasClass(videoList, "video-list-vertical")) {
                                            WinJS.Utilities.removeClass(videoList, "video-list-vertical");
                                        }
                                        if (WinJS.Utilities.hasClass(videoList, "video-list-horizontal")) {
                                            WinJS.Utilities.removeClass(videoList, "video-list-horizontal");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-left");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-right");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-top")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-top");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-left")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-left");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-right")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-right");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-top")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-top");
                                        }
                                        if (!WinJS.Utilities.hasClass(overlayElement, "video-overlay-default")) {
                                            WinJS.Utilities.addClass(overlayElement, "video-overlay-default");
                                        }
                                        if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-default")) {
                                            WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-default");
                                        }
                                        if (!overlayIsHidden) {
                                            if (bbbClass.overlay && !WinJS.Utilities.hasClass(overlayElement, bbbClass.overlay)) {
                                                WinJS.Utilities.addClass(overlayElement, bbbClass.overlay);
                                            }
                                            if (numVideos > 1) {
                                                if (bbbClass.autoWidth && WinJS.Utilities.hasClass(overlayElement, bbbClass.autoWidth)) {
                                                    WinJS.Utilities.removeClass(overlayElement, bbbClass.autoWidth);
                                                }
                                                if (bbbClass.fullWidth && !WinJS.Utilities.hasClass(overlayElement, bbbClass.fullWidth)) {
                                                    WinJS.Utilities.addClass(overlayElement, bbbClass.fullWidth);
                                                }
                                            } else {
                                                if (bbbClass.autoWidth && !WinJS.Utilities.hasClass(overlayElement, bbbClass.autoWidth)) {
                                                    WinJS.Utilities.addClass(overlayElement, bbbClass.autoWidth);
                                                }
                                                if (bbbClass.fullWidth && WinJS.Utilities.hasClass(overlayElement, bbbClass.fullWidth)) {
                                                    WinJS.Utilities.removeClass(overlayElement, bbbClass.fullWidth);
                                                }
                                            }
                                            if (bbbClass.overlayToTop && !WinJS.Utilities.hasClass(overlayElement, bbbClass.overlayToTop)) {
                                                WinJS.Utilities.addClass(overlayElement, bbbClass.overlayToTop);
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
                                    } else if (that.binding.dataSessionStatus &&
                                        that.binding.dataSessionStatus.VideoListPosition === videoListDefaults.top) {
                                        if (WinJS.Utilities.hasClass(videoList, "video-list-vertical")) {
                                            WinJS.Utilities.removeClass(videoList, "video-list-vertical");
                                        }
                                        if (!WinJS.Utilities.hasClass(videoList, "video-list-horizontal")) {
                                            WinJS.Utilities.addClass(videoList, "video-list-horizontal");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-left");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-right");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-default")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-default");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-left")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-left");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-right")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-right");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-default")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-default");
                                        }
                                        if (!WinJS.Utilities.hasClass(overlayElement, "video-overlay-top")) {
                                            WinJS.Utilities.addClass(overlayElement, "video-overlay-top");
                                        }
                                        if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-top")) {
                                            WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-top");
                                        }
                                        if (bbbClass.fullWidth && WinJS.Utilities.hasClass(overlayElement, bbbClass.fullWidth)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.fullWidth);
                                        }
                                        if (bbbClass.autoWidth && WinJS.Utilities.hasClass(overlayElement, bbbClass.autoWidth)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.autoWidth);
                                        }
                                        if (bbbClass.overlayToTop && WinJS.Utilities.hasClass(overlayElement, bbbClass.overlayToTop)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.overlayToTop);
                                        }
                                        if (bbbClass.overlay && WinJS.Utilities.hasClass(overlayElement, bbbClass.overlay)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.overlay);
                                        }
                                        if (bbbClass.floatingOverlay && WinJS.Utilities.hasClass(overlayElement, bbbClass.floatingOverlay)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.floatingOverlay);
                                        }
                                        if (WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                            WinJS.Utilities.removeClass(videoList, "video-list-double-columns");
                                        }
                                        imageScale = 0.5;
                                        var videoWidth = videoListDefaults.width * imageScale;
                                        var widthFullSize = numVideos * videoWidth;
                                        if (!WinJS.Utilities.hasClass(mediaContainer, "presenter-mode") && widthFullSize > videoList.clientWidth) {
                                            if (!WinJS.Utilities.hasClass(videoList, "video-list-double-columns")) {
                                                WinJS.Utilities.addClass(videoList, "video-list-double-columns");
                                            }
                                            var widthHalfSize = Math.floor(numVideos / 2.0 + 0.5) * videoWidth / 2;
                                            resCount = Math.floor((videoList.clientWidth - widthHalfSize) / videoWidth);
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
                                    } else {
                                        if (WinJS.Utilities.hasClass(videoList, "video-list-horizontal")) {
                                            WinJS.Utilities.removeClass(videoList, "video-list-horizontal");
                                        }
                                        if (!WinJS.Utilities.hasClass(videoList, "video-list-vertical")) {
                                            WinJS.Utilities.addClass(videoList, "video-list-vertical");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-top")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-top");
                                        }
                                        if (WinJS.Utilities.hasClass(overlayElement, "video-overlay-default")) {
                                            WinJS.Utilities.removeClass(overlayElement, "video-overlay-default");
                                        }
                                        if (bbbClass.fullWidth && WinJS.Utilities.hasClass(overlayElement, bbbClass.fullWidth)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.fullWidth);
                                        }
                                        if (bbbClass.autoWidth && WinJS.Utilities.hasClass(overlayElement, bbbClass.autoWidth)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.autoWidth);
                                        }
                                        if (bbbClass.overlayToTop && WinJS.Utilities.hasClass(overlayElement, bbbClass.overlayToTop)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.overlayToTop);
                                        }
                                        if (bbbClass.overlay && WinJS.Utilities.hasClass(overlayElement, bbbClass.overlay)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.overlay);
                                        }
                                        if (bbbClass.floatingOverlay && WinJS.Utilities.hasClass(overlayElement, bbbClass.floatingOverlay)) {
                                            WinJS.Utilities.removeClass(overlayElement, bbbClass.floatingOverlay);
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-top")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-top");
                                        }
                                        if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-default")) {
                                            WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-default");
                                        }
                                        if (that.binding.dataSessionStatus &&
                                            that.binding.dataSessionStatus.VideoListPosition === videoListDefaults.right) {
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
                                            resCount = Math.floor((videoList.clientHeight - heightHalfSize) / videoHeight);
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
                                    if (!adjustContentPositionsPromise) {
                                        adjustContentPositionsFailedCount++;
                                        Log.print(Log.l.trace, "videoList not yet created - try later again! adjustContentPositionsFailedCount=" + adjustContentPositionsFailedCount);
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
                            if (numVideos > 0) {
                                if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-empty")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "video-overlay-is-empty");
                                }
                            } else {
                                if (!WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-empty")) {
                                    WinJS.Utilities.addClass(mediaContainer, "video-overlay-is-empty");
                                }
                            }
                            if (videoPLayerOpened) {
                                if (WinJS.Utilities.hasClass(mediaContainer, "deskshare-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "deskshare-open");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "presentation-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "presentation-open");
                                }
                                if (!WinJS.Utilities.hasClass(mediaContainer, "videoplayer-open")) {
                                    WinJS.Utilities.addClass(mediaContainer, "videoplayer-open");
                                }
                            } else if (screenShareOpened) {
                                if (!WinJS.Utilities.hasClass(mediaContainer, "deskshare-open")) {
                                    WinJS.Utilities.addClass(mediaContainer, "deskshare-open");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "presentation-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "presentation-open");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "videoplayer-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "videoplayer-open");
                                }
                            } else if (presentationOpened) {
                                if (WinJS.Utilities.hasClass(mediaContainer, "deskshare-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "deskshare-open");
                                }
                                if (!WinJS.Utilities.hasClass(mediaContainer, "presentation-open")) {
                                    WinJS.Utilities.addClass(mediaContainer, "presentation-open");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "videoplayer-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "videoplayer-open");
                                }
                            } else {
                                if (WinJS.Utilities.hasClass(mediaContainer, "deskshare-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "deskshare-open");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "presentation-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "presentation-open");
                                }
                                if (WinJS.Utilities.hasClass(mediaContainer, "videoplayer-open")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "videoplayer-open");
                                }
                            }
                        }
                        if (pageControllerName === "eventController" || pageControllerName === "speakerSessionController") {
                            if (actionsBarCenter && emojiButtonContainer && emojiToolbar &&
                                actionsBarCenter.lastElementChild !== emojiToolbar) {
                                var audioControlsContainer = actionsBarCenter.querySelector(elementSelectors.audioControlsContainer);
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
                        if (!adjustContentPositionsPromise) {
                            adjustContentPositionsFailedCount++;
                            Log.print(Log.l.trace, "panelWrapper not yet created - try later again! adjustContentPositionsFailedCount=" + adjustContentPositionsFailedCount);
                            adjustContentPositionsPromise = WinJS.Promise.timeout(Math.min(adjustContentPositionsFailedCount * 10, 5000)).then(function () {
                                that.adjustContentPositions();
                            });
                        }
                    }
                    return WinJS.Promise.timeout(20);
                }).then(function () {
                    var mediaContainer = fragmentElement.querySelector(getMediaContainerSelector());
                    if (mediaContainer) {
                        var options = {
                            presentationIsHidden: false,
                            isHidden: false
                        }
                        if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode")) {
                            if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-tiled")) {
                                that.binding.presenterModeTiled = true;
                                that.binding.presenterModeFull = false;
                                that.binding.presenterModeSmall = false;
                                that.binding.videoListLeft = false;
                                that.binding.videoListRight = false;
                                that.binding.videoListDefault = false;
                            } else if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-full")) {
                                that.binding.presenterModeTiled = false;
                                that.binding.presenterModeFull = true;
                                that.binding.presenterModeSmall = false;
                                that.binding.videoListLeft = false;
                                that.binding.videoListRight = false;
                                that.binding.videoListDefault = false;
                            } else if (WinJS.Utilities.hasClass(mediaContainer, "presenter-mode-small")) {
                                that.binding.presenterModeTiled = false;
                                that.binding.presenterModeFull = false;
                                that.binding.presenterModeSmall = true;
                                that.binding.videoListLeft = false;
                                that.binding.videoListRight = false;
                                that.binding.videoListDefault = false;
                            }
                        } else {
                            if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-left")) {
                                that.binding.presenterModeTiled = false;
                                that.binding.presenterModeFull = false;
                                that.binding.presenterModeSmall = false;
                                that.binding.videoListLeft = true;
                                that.binding.videoListRight = false;
                                that.binding.videoListDefault = false;
                            } else if (WinJS.Utilities.hasClass(mediaContainer, "video-overlay-is-right")) {
                                that.binding.presenterModeTiled = false;
                                that.binding.presenterModeFull = false;
                                that.binding.presenterModeSmall = false;
                                that.binding.videoListLeft = false;
                                that.binding.videoListRight = true;
                                that.binding.videoListDefault = false;
                            } else {
                                that.binding.presenterModeTiled = false;
                                that.binding.presenterModeFull = false;
                                that.binding.presenterModeSmall = false;
                                that.binding.videoListLeft = false;
                                that.binding.videoListRight = false;
                                that.binding.videoListDefault = true;
                            }
                        }
                        if (WinJS.Utilities.hasClass(mediaContainer, "presentation-is-hidden")) {
                            options.presentationIsHidden = true;
                        }
                        var cameraDock = mediaContainer.querySelector(elementSelectors.cameraDock);
                        var overlayElement = cameraDock && cameraDock.parentElement;
                        if (overlayElement) {
                            var videoList = mediaContainer.querySelector(elementSelectors.videoList);
                            if (videoList) {
                                var numVideos = 0;
                                var videoListItem = videoList.firstElementChild;
                                while (videoListItem) {
                                    var key = getInternalInstanceKey(videoListItem);
                                    if (WinJS.Utilities.hasClass(videoListItem, "inactive-video-hidden")) {
                                        options.isHidden = true;
                                    } else {
                                        options.isHidden = false;
                                        numVideos++;
                                    }
                                    Log.print(Log.l.trace, "videoListItem: key=" + key + " isHidden=" + options.isHidden);
                                    that.adjustVideoPosition(mediaContainer, overlayElement, videoListItem, options);
                                    videoListItem = videoListItem.nextSibling;
                                }
                                if (options.presentationIsHidden) {
                                    var sqrtNumVideos = Math.sqrt(numVideos);
                                    var columnCount = Math.ceil(sqrtNumVideos);
                                    var aspectRatio = overlayElement.clientWidth / overlayElement.clientHeight;
                                    if (aspectRatio >= 16 / 9) {
                                        if (columnCount > sqrtNumVideos && columnCount / numVideos <= 2 / 3) {
                                            columnCount++;
                                        }
                                    } else if (aspectRatio <= 3 / 4) {
                                        columnCount = Math.floor(sqrtNumVideos);
                                    }
                                    var rowCount = Math.ceil(numVideos / columnCount);
                                    Log.print(Log.l.trace, "numVideos="+ numVideos + " columnCount=" + columnCount + " rowCount=" + rowCount);
                                    for (var i = 0; i <= 8; i++) {
                                        var columnsClass = "column-count-" + i;
                                        var rowsClass = "row-count-" + i;
                                        if (i === columnCount) {
                                            if (!WinJS.Utilities.hasClass(videoList, columnsClass)) {
                                                WinJS.Utilities.addClass(videoList, columnsClass);
                                            }
                                        } else {
                                            if (WinJS.Utilities.hasClass(videoList, columnsClass)) {
                                                WinJS.Utilities.removeClass(videoList, columnsClass);
                                            }
                                        }
                                        if (i === rowCount) {
                                            if (!WinJS.Utilities.hasClass(videoList, rowsClass)) {
                                                WinJS.Utilities.addClass(videoList, rowsClass);
                                            }
                                        } else {
                                            if (WinJS.Utilities.hasClass(videoList, rowsClass)) {
                                                WinJS.Utilities.removeClass(videoList, rowsClass);
                                            }
                                        }
                                    }
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
                var checkLaterAgain = false;
                var newUnpinnedVideoLists = [];
                var numVideos = 0;
                var key = null;
                var videoList = null;
                var hideInactive = videoListDefaults.hideInactive;
                var usePinned = videoListDefaults.usePinned;
                Log.call(Log.l.trace, "Conference.Controller.", "usePinned=" + usePinned + " hideInactive=" + hideInactive);
                if (checkForInactiveVideoPromise) {
                    checkForInactiveVideoPromise.cancel();
                    checkForInactiveVideoPromise = null;
                }
                if (!that.binding.dataConference || !that.binding.dataConference.URL) {
                    Log.ret(Log.l.trace, "no conference URL!");
                    return WinJS.Promise.as();
                }
                var ret = new WinJS.Promise.as().then(function () {
                    var mediaContainer = fragmentElement.querySelector(getMediaContainerSelector());
                    if (mediaContainer) {
                        var presenterModeActive = WinJS.Utilities.hasClass(mediaContainer, "presenter-mode");
                        var cameraDock = mediaContainer.querySelector(elementSelectors.cameraDock);
                        var overlayElement = cameraDock && cameraDock.parentElement;
                        if (overlayElement) {
                            removeReactEventHandler(overlayElement, "onMouseDown");
                            removeReactEventHandler(overlayElement, "onMouseUp");
                            removeReactEventHandler(overlayElement, "onTouchStart");
                            removeReactEventHandler(overlayElement, "onTouchEnd");
                            cameraDock.draggable = false;
                            videoList = overlayElement.querySelector(elementSelectors.videoList);
                            if (videoList) {
                                var validPinnedIndexes = null;
                                var now = Date.now();
                                var videoListItem = videoList.firstElementChild;
                                var prevActiveItem = null;
                                var prevInactiveItem = null;
                                var prevMutedItem = null;
                                if (pageControllerName === "modSessionController") {
                                    if (!WinJS.Utilities.hasClass(videoList, "win-dragtarget")) {
                                        WinJS.Utilities.addClass(videoList, "win-dragtarget");
                                        videoList.ondragenter = that.eventHandlers.onVideoListItemDragEnter.bind(that);
                                        videoList.ondragleave = that.eventHandlers.onVideoListItemDragLeave.bind(that);
                                        videoList.ondragover = that.eventHandlers.onVideoListItemDragOver.bind(that);
                                        videoList.ondrop = that.eventHandlers.onVideoListItemDrop.bind(that);
                                    }
                                }
                                var prevPinnedIndex = -1;
                                while (videoListItem) {
                                    var pinnedIndex = -1;
                                    key = getInternalInstanceKey(videoListItem) || "0";
                                    var validPinnedIndex = that.binding.pinnedVideos.indexOf(key);
                                    if (validPinnedIndex >= 0) {
                                        if (!validPinnedIndexes) {
                                            validPinnedIndexes = [];
                                        }
                                        validPinnedIndexes.push(validPinnedIndex);
                                    }
                                    if (usePinned) {
                                        if (key) {
                                            pinnedIndex = validPinnedIndex;
                                        }
                                        Log.print(Log.l.trace, "key=" + key + " pinnedIndex=" + pinnedIndex);
                                        if (pinnedIndex >= 0) {
                                            if (!WinJS.Utilities.hasClass(videoListItem, "pinned-video")) {
                                                WinJS.Utilities.addClass(videoListItem, "pinned-video");
                                                if (pageControllerName === "modSessionController") {
                                                    videoListItem.ondragstart = that.eventHandlers.onVideoListItemDragStart.bind(that);
                                                    videoListItem.draggable = true;
                                                    videoListItem.droppable = true; 
                                                }
                                            }
                                        } else {
                                            if (WinJS.Utilities.hasClass(videoListItem, "pinned-video")) {
                                                WinJS.Utilities.removeClass(videoListItem, "pinned-video");
                                                if (videoListItem.draggable) {
                                                    videoListItem.draggable = false;
                                                }
                                                if (videoListItem.droppable) {
                                                    videoListItem.droppable = false;
                                                }
                                            }
                                        }
                                    }
                                    var content = videoListItem.firstElementChild;
                                    if (content) {
                                        var video = content.querySelector("video");
                                        var mediaStream = null;
                                        if (video) {
                                            video.disablePictureInPicture = true;
                                            mediaStream = video.srcObject;
                                        }
                                        if (!mediaStream) {
                                            checkLaterAgain = true;
                                            Log.print(Log.l.trace, "no mediaStream, checkLaterAgain=" + checkLaterAgain);
                                        }
                                        var isMyself = WinJS.Utilities.hasClass(videoListItem, "selfie-video");
                                        var muted = null;
                                        var dataTest = content.getAttribute("data-test");
                                        if (dataTest === "webcamItemTalkingUser") {
                                            if (isMyself && !myTalkingActivityStart) {
                                                myTalkingActivityStart = now;
                                                Log.print(Log.l.trace, "Talking started");
                                                /*AppData.call("PRC_CreateIncident", {
                                                    pUserToken: userToken,
                                                    pIncidentName: "Voice",
                                                    pTextInfo1: "Start"
                                                }, function (json) {
                                                    Log.print(Log.l.trace, "PRC_CreateIncident success!");
                                                }, function (error) {
                                                    Log.print(Log.l.error, "PRC_CreateIncident error! ");
                                                });*/
                                            }
                                            videoListDefaults.contentActivity[key] = now;
                                        } else {
                                            if (typeof videoListDefaults.contentActivity[key] === "undefined") {
                                                videoListDefaults.contentActivity[key] = 0;
                                            }
                                            muted = content.querySelector("." + bbbClass.muted + ", ." + bbbClass.listen);
                                        }
                                        var inactivity = now - videoListDefaults.contentActivity[key];
                                        if (isMyself && myTalkingActivityStart && inactivity >= videoListDefaults.inactivityDelay) {
                                            var myTalkingActivityDuration = videoListDefaults.contentActivity[key] - myTalkingActivityStart;
                                            Log.print(Log.l.trace, "myTalkingActivityDuration=" + myTalkingActivityDuration);
                                            if (myTalkingActivityDuration > 1000) {
                                                AppData.call("PRC_CreateIncident", {
                                                    pUserToken: userToken,
                                                    pIncidentName: "Voice",
                                                    pTextInfo1: Math.round(myTalkingActivityDuration / 1000).toString()
                                                }, function (json) {
                                                    Log.print(Log.l.trace, "PRC_CreateIncident success!");
                                                }, function (error) {
                                                    Log.print(Log.l.error, "PRC_CreateIncident error! ");
                                                });
                                            } 
                                            myTalkingActivityStart = null;
                                        }
                                        if (myTalkingActivityStart) {
                                            checkLaterAgain = true;
                                            Log.print(Log.l.trace, "myTalkingActivityStart=" + myTalkingActivityStart);
                                        }
                                        if (usePinned && pinnedIndex < 0 && key) {
                                            var userName = "";
                                            var userNameElement = videoListItem.querySelector(elementSelectors.videoUserName);
                                            if (userNameElement && userNameElement.firstChild) {
                                                userName = userNameElement.firstChild.textContent;
                                            }
                                            if (!userName) {
                                                checkLaterAgain = true;
                                                Log.print(Log.l.trace, "no mediaStream, userName=" + checkLaterAgain);
                                            }
                                            if (!myselfIsUnpinned && isMyself) {
                                                myselfIsUnpinned = true;
                                            }
                                            Log.print(Log.l.trace, "added newUnpinnedVideoLists.key=" + key + " userName=" + userName + " isMyself=" + isMyself);
                                            newUnpinnedVideoLists.push({
                                                key: key,
                                                userName: userName,
                                                myselfLabel: (isMyself ? myselfLabel : ""),
                                                mediaStream: mediaStream,
                                                videoListItemClassName: "video-list-item" + (isMyself ? " selfie-video" : ""),
                                                enabled: (isMyself || pageControllerName === "modSessionController")
                                            });
                                        }
                                        if (!presenterModeActive && hideInactive && (muted || inactivity > videoListDefaults.inactivityDelay) ||
                                            usePinned && pinnedIndex < 0) {
                                            if (!WinJS.Utilities.hasClass(videoListItem, "inactive-video-hidden")) {
                                                WinJS.Utilities.addClass(videoListItem, "inactive-video-hidden");
                                            }
                                        } else {
                                            if (hideInactive || usePinned) {
                                                if (prevActiveItem) {
                                                    if (prevPinnedIndex < 0 || pinnedIndex < 0 || prevPinnedIndex <= pinnedIndex) {
                                                        if (prevActiveItem.nextSibling && videoListItem !== prevActiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevActiveItem.nextSibling);
                                                        }
                                                    } else {
                                                        videoList.insertBefore(videoListItem, prevActiveItem);
                                                    }
                                                } else {
                                                    if (videoListItem !== videoList.firstElementChild) {
                                                        videoList.insertBefore(videoListItem, videoList.firstElementChild);
                                                    }
                                                }
                                                prevActiveItem = videoListItem;
                                                prevPinnedIndex = pinnedIndex;
                                            } else {
                                                if (muted) {
                                                    if (prevMutedItem) {
                                                        if (prevMutedItem.nextSibling && videoListItem !== prevMutedItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevMutedItem.nextSibling);
                                                        }
                                                    } else if (prevInactiveItem) {
                                                        if (prevInactiveItem.nextSibling && videoListItem !== prevInactiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevInactiveItem.nextSibling);
                                                        }
                                                    } else if (prevActiveItem) {
                                                        if (prevActiveItem.nextSibling && videoListItem !== prevActiveItem.nextSibling) {
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
                                                        if (prevInactiveItem.nextSibling && videoListItem !== prevInactiveItem.nextSibling) {
                                                            videoList.insertBefore(videoListItem, prevInactiveItem.nextSibling);
                                                        }
                                                    } else if (prevActiveItem) {
                                                        if (prevActiveItem.nextSibling && videoListItem !== prevActiveItem.nextSibling) {
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
                                                        if (prevActiveItem.nextSibling && videoListItem !== prevActiveItem.nextSibling) {
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
                                            if (videoListDefaults.usePinned) {
                                                var videoContainer = videoListItem.querySelector(elementSelectors.videoContainer);
                                                if (videoContainer) {
                                                    var unpinButton = videoContainer.querySelector(".video-item-button");
                                                    if (!unpinButton) {
                                                        unpinButton = document.createElement("button");
                                                        WinJS.Utilities.addClass(unpinButton, "win-button");
                                                        WinJS.Utilities.addClass(unpinButton, "video-item-button");
                                                        unpinButton.onclick = function(event) {
                                                            AppBar.handleEvent('click', 'clickUnpinVideoButton', event);
                                                        }
                                                        var span = document.createElement("span");
                                                        WinJS.Utilities.addClass(span, "unpin");
                                                        unpinButton.appendChild(span);
                                                        videoContainer.appendChild(unpinButton);
                                                    }
                                                }
                                            }
                                            var fullScreenButton = videoListItem.querySelector(elementSelectors.fullScreenButton);
                                            if (fullScreenButton && !fullScreenButton._handlerRegistered) {
                                                that.registerFullscreenHandlers(videoListItem.firstElementChild, fullScreenButton);
                                                fullScreenButton._handlerRegistered = true;
                                            }
                                            numVideos++;
                                        }
                                    }
                                    videoListItem = videoListItem.nextElementSibling;
                                }
                                if (validPinnedIndexes &&
                                    that.binding.pinnedVideos && that.binding.pinnedVideos.length > 0) {
                                    for (var i = that.binding.pinnedVideos.length - 1; i >= 0; i--) {
                                        if (validPinnedIndexes.indexOf(i) < 0) {
                                            that.binding.pinnedVideos.splice(i, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    videoListDefaults.activeVideoCount = numVideos;
                    if (unpinnedVideoList && listView && listView.winControl) {
                        if (newUnpinnedVideoLists.length > 0) {
                            var oldIndex, oldItem, newIndexesFound = [], oldIndexesFound = [];
                            newUnpinnedVideoLists.forEach(function(item, index) {
                                for (oldIndex = 0; oldIndex < unpinnedVideoList.length; oldIndex++) {
                                    if (oldIndexesFound.indexOf(oldIndex) < 0) {
                                        oldItem = unpinnedVideoList.getAt(oldIndex);
                                        if (item && oldItem && item.key === oldItem.key) {
                                            var videoTrack = item.mediaStream &&
                                                item.mediaStream.getVideoTracks() &&
                                                item.mediaStream.getVideoTracks()[0];
                                            var oldVideoTrack = oldItem.mediaStream &&
                                                oldItem.mediaStream.getVideoTracks() &&
                                                oldItem.mediaStream.getVideoTracks()[0];
                                            if (item.userName !== oldItem.userName ||
                                                item.myselfLabel !== oldItem.myselfLabel ||
                                                item.mediaStream !== oldItem.mediaStream ||
                                                videoTrack !== oldVideoTrack ||
                                                item.videoListItemClassName !== oldItem.videoListItemClassName ||
                                                item.enabled !== oldItem.enabled) {
                                                Log.print(Log.l.trace, "changed unpinnedVideoList[" + oldIndex + "].key=" + item.key + " userName=" + item.userName + " myselfLabel=" + item.myselfLabel);
                                                unpinnedVideoList.setAt(oldIndex, item);
                                            }
                                            oldIndexesFound.push(oldIndex);
                                            newIndexesFound.push(index);
                                            break;
                                        }
                                    }
                                }
                            });
                            for (oldIndex = unpinnedVideoList.length - 1; oldIndex >= 0; oldIndex--) {
                                if (oldIndexesFound.indexOf(oldIndex) < 0) {
                                    Log.print(Log.l.trace, "deleted unpinnedVideoList[" + oldIndex + "]");
                                    unpinnedVideoList.splice(oldIndex, 1);
                                }
                            }
                            newUnpinnedVideoLists.forEach(function(item, index) {
                                if (newIndexesFound.indexOf(index) < 0) {
                                    Log.print(Log.l.trace, "added unpinnedVideoList.key=" + item.key + " userName=" + item.userName + " myselfLabel=" + item.myselfLabel);
                                    unpinnedVideoList.push(item);
                                }
                            });
                            if (pageControllerName !== "modSessionController" && myselfIsUnpinned) {
                                for (oldIndex = unpinnedVideoList.length - 1; oldIndex >= 0; oldIndex--) {
                                    oldItem = unpinnedVideoList.getAt(oldIndex);
                                    if (!oldItem.myselfLabel) {
                                        Log.print(Log.l.trace, "deleted unpinnedVideoList[" + oldIndex + "]");
                                        unpinnedVideoList.splice(oldIndex, 1);
                                    }
                                }
                            }
                        } else {
                            unpinnedVideoList.length = 0;
                        }
                    }
                    if ((pageControllerName === "modSessionController" || myselfIsUnpinned) && unpinnedVideoList.length > 0) {
                        if (!that.binding.showUnpinnedVideoList) {
                            WinJS.Promise.timeout(100).then(function() {
                                if (listView && listView.winControl) {
                                    listView.winControl.forceLayout();
                                }
                            });
                        }
                        that.binding.unpinnedVideoListLength = unpinnedVideoList.length;
                    } else {
                        that.binding.unpinnedVideoListLength = 0;
                    }
                    that.binding.showUnpinnedVideoList = that.binding.unpinnedVideoListLength > 0 &&
                        !(that.binding.unpinnedVideoListLength === 1 && myselfIsUnpinned && !that.binding.showSelfie);
                    if (!(pageControllerName === "modSessionController")) {
                        that.binding.showPaneTools = that.binding.showUnpinnedVideoList && that.binding.showUserList;
                        if (mediaContainer) {
                            if (that.binding.showPaneTools) {
                                if (!WinJS.Utilities.hasClass(mediaContainer, "show-selfie-unpinned")) {
                                    WinJS.Utilities.addClass(mediaContainer, "show-selfie-unpinned");
                                }
                            } else {
                                if (WinJS.Utilities.hasClass(mediaContainer, "show-selfie-unpinned")) {
                                    WinJS.Utilities.removeClass(mediaContainer, "show-selfie-unpinned");
                                }
                            }
                        }
                    }
                    if (!checkForInactiveVideoPromise && checkLaterAgain) {
                        checkForInactiveVideoPromise = WinJS.Promise.timeout(250).then(function () {
                            that.checkForInactiveVideo();
                        });
                    }

                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.checkForInactiveVideo = checkForInactiveVideo;

            var savePollingAnswer = function(answerCode) {
                Log.call(Log.l.trace, "Conference.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    if (pageControllerName === "eventController") {
                        return AppData.call("PRC_StoreContactAnswer", {
                            pUserToken: userToken,
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

            var saveSessionStatus = function(dataSessionStatus) {
                Log.call(Log.l.trace, "Conference.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function() {
                    if (dataSessionStatus && pageControllerName === "modSessionController") {
                        return AppData.call("Prc_SetBBBSessionStatus", {
                            pUserToken: userToken,
                            pShowPresentation: dataSessionStatus.ShowPresentation,
                            pShowVideoList: dataSessionStatus.ShowVideoList,
                            pVideoListPosition: dataSessionStatus.VideoListPosition,
                            pPresenterMode: dataSessionStatus.PresenterMode,
                            pPinnedVideos: dataSessionStatus.PinnedVideos
                        }, function(json) {
                            Log.print(Log.l.trace, "Prc_SetBBBSessionStatus success!");
                        },
                        function(error) {
                            Log.print(Log.l.error, "Prc_SetBBBSessionStatus error! ");
                            AppData.setErrorMsg(AppBar.scope.binding, error);
                        });
                    } else {
                        return WinJS.Promise.as();
                    }
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.saveSessionStatus = saveSessionStatus;

            var reflectSessionStatus = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                sessionStatusIsSet = false;
                if (!checkForInactiveVideoPromise) {
                    checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function () {
                        that.checkForInactiveVideo();
                    });
                }
                if (!adjustContentPositionsPromise) {
                    adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                        that.adjustContentPositions();
                    });
                }
                WinJS.Promise.timeout(0).then(function () {
                    that.handleAudioVideoButtonStatus();
                });
                that.sendResize(500);
                Log.ret(Log.l.trace);
            }
            that.reflectSessionStatus = reflectSessionStatus;

            var loadSessionStatus = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                var ret = AppData.call("Prc_GetBBBSessionStatus", {
                    pUserToken: userToken
                }, function (json) {
                    Log.print(Log.l.trace, "Prc_GetBBBSessionStatus success!");
                    if (json && json.d && json.d.results && json.d.results.length > 0) {
                        that.binding.dataSessionStatus = json.d.results[0];
                        try {
                            that.binding.pinnedVideos = JSON.parse(that.binding.dataSessionStatus && that.binding.dataSessionStatus.PinnedVideos || []);
                        } catch (ex) {
                            Log.print(Log.l.error, "Exception occured! ex=" + ex.toString());
                        }
                    } else {
                        that.binding.dataSessionStatus = {
                            ShowPresentation: 1,
                            ShowVideoList: 1,
                            VideoListPosition: "right",
                            PresenterMode: "off",
                            PinnedVideos: []
                        }
                        that.binding.pinnedVideos = [];
                    }
                    that.binding.showPresentation = !!(that.binding.dataSessionStatus && that.binding.dataSessionStatus.ShowPresentation);
                    that.binding.showVideoList = !!(that.binding.dataSessionStatus && that.binding.dataSessionStatus.ShowVideoList);
                    if (!that.binding.pinnedVideos) {
                        that.binding.pinnedVideos = [];
                    }
                    that.reflectSessionStatus();
                }, function (error) {
                    Log.print(Log.l.error, "Prc_GetBBBSessionStatus error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            that.loadSessionStatus = loadSessionStatus;

            var delayedLoadSessionStatus = function() {
                var delay = Math.floor(250 + Math.random() * 1000);
                Log.call(Log.l.trace, "Conference.Controller.", "delay=" + delay);
                if (delayedLoadSessionStatusPromise) {
                    delayedLoadSessionStatusPromise.cancel();
                }
                delayedLoadSessionStatusPromise = WinJS.Promise.timeout(delay).then(function() {
                    Log.print(Log.l.trace, "called from delayedLoadSessionStatus...");
                    that.loadSessionStatus();
                });
                Log.ret(Log.l.trace);
            }
            that.delayedLoadSessionStatus = delayedLoadSessionStatus;

            var loadData = function () {
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
                            pUserToken: userToken
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
                            var contentGrid = document.querySelector(".event .content-grid");
                            if (contentGrid && !WinJS.Utilities.hasClass(contentGrid, "content-grid-full-width")) {
                                WinJS.Utilities.addClass(contentGrid, "content-grid-full-width");
                            }
                            that.showUserList(false,!!that.binding.dataEvent.ListOnlyModerators);
                            if (!adjustContentPositionsPromise) {
                                adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                                    that.adjustContentPositions();
                                });
                            }
                        }, function (error) {
                            Log.print(Log.l.error, "PRC_BBBConferenceLink error! ");
                            AppData.setErrorMsg(AppBar.scope.binding, error);
                        });
                    } else if (pageControllerName === "modSessionController" || pageControllerName === "speakerSessionController") {
                        return AppData.call("PRC_BBBModeratorLink", {
                            pVeranstaltungID: 0,
                            pAlias: null,
                            pUserToken: userToken
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
                        var path = url.replace(/https?:\/\/[\.0-9a-zA-Z]+\/html5client/g, '/html5client');
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
                }).then(function () {
                    that.delayedLoadSessionStatus();
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var setPresenterModeState = function (state) {
                Log.call(Log.l.info, "Conference.Controller.", "state=" + state);
                var mediaContainer = fragmentElement.querySelector(getMediaContainerSelector());
                if (mediaContainer) {
                    switch (state) {
                        case presenterModeDefaults.tiled: {
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
                            if (that.binding.dataSessionStatus) {
                                that.binding.dataSessionStatus.VideoListPosition = videoListDefaults.right;
                            }
                        }
                        break;
                        case presenterModeDefaults.full: {
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
                            if (that.binding.dataSessionStatus) {
                                that.binding.dataSessionStatus.VideoListPosition = videoListDefaults.right;
                            }
                        }
                        break;
                        case presenterModeDefaults.small: {
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
                            if (that.binding.dataSessionStatus) {
                                that.binding.dataSessionStatus.VideoListPosition = videoListDefaults.right;
                            }
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
                        }
                    }
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.PresenterMode = state;
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
                if (pageControllerName === "eventController") {
                    if (setPollingPromise) {
                        setPollingPromise.cancel();
                        setPollingPromise = null;
                    }
                    var pollingContainer = document.querySelector("." + bbbClass.overlayA + " ." + bbbClass.pollingContainer);
                    if (pollingContainer) {
                        var pollingTitle = pollingContainer.querySelector("." + bbbClass.pollingTitle);
                        if (pollingTitle) {
                            pollingTitle.textContent = that.binding.dataQuestionnaire.QuestionText;
                        }
                        var pollingAnswers = pollingContainer.querySelector("." + bbbClass.pollingAnswers);
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
                                    var label = button.querySelector("." + bbbClass.label);
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

            var indexFromPinnedVideosItem = function(videoListItem) {
                var index = -1;
                Log.call(Log.l.trace, "Conference.Controller.");
                if (videoListItem) {
                    var key = getInternalInstanceKey(videoListItem) || "0";
                    Log.print(Log.l.trace, "key=" + key);
                    index = that.binding.pinnedVideos.indexOf(key);
                }
                Log.ret(Log.l.trace, index);
                return index;
            }
            that.indexFromPinnedVideosItem = indexFromPinnedVideosItem;

            videoListDefaults._clearDragBetween = function(insertPoint) {
                if (insertPoint && insertPoint.index >= 0) {
                    if (insertPoint.insertAfterItem) {
                        if (insertPoint.insertAfterItem.nextElementSibling &&
                            WinJS.Utilities.hasClass(insertPoint.insertAfterItem.nextElementSibling, "win-dragtarget")) {
                            WinJS.Utilities.removeClass(insertPoint.insertAfterItem.nextElementSibling, "win-dragbefore");
                        }
                        if (WinJS.Utilities.hasClass(insertPoint.insertAfterItem, "win-dragtarget")) {
                            WinJS.Utilities.removeClass(insertPoint.insertAfterItem, "win-dragafter");
                        }
                    } else if (videoListDefaults._element &&
                        videoListDefaults._element.firstElementChild &&
                        WinJS.Utilities.hasClass(videoListDefaults._element.firstElementChild, "win-dragtarget")) {
                        WinJS.Utilities.removeClass(videoListDefaults._element.firstElementChild, "win-dragbefore");
                    }
                }
            }

            videoListDefaults._clearDragProperties = function() {
                Log.call(Log.l.trace, "Conference.Controller.");
                videoListDefaults._clearDragBetween(videoListDefaults._lastInsertPoint);
                if (videoListDefaults._addedDragOverClass) {
                    videoListDefaults._addedDragOverClass = false;
                    if (videoListDefaults._element) {
                        WinJS.Utilities.removeClass(videoListDefaults._element, "win-dragover");
                    }
                }
                var dragSourceElement = videoListDefaults._dragSourceElement;
                if (dragSourceElement) {
                    WinJS.Utilities.removeClass(dragSourceElement, "win-dragsource");
                    dragSourceElement.ondragend = null;
                }
                var videoListItem = videoListDefaults._element &&
                    videoListDefaults._element.firstElementChild;
                while (videoListItem) {
                    if (WinJS.Utilities.hasClass(videoListItem, "win-dragtarget")) {
                        WinJS.Utilities.removeClass(videoListItem, "win-dragtarget");
                    }
                    videoListItem = videoListItem.nextElementSibling;
                }
                videoListDefaults._pressedEntity = { type: WinJS.UI.ObjectType.item, index: -1 };
                videoListDefaults._dragging = false;
                videoListDefaults._dragDataTransfer = null;
                videoListDefaults._lastInsertPoint = null;
                videoListDefaults._lastEnteredElement = null;
                videoListDefaults._dragBetweenDisabled = false;
                videoListDefaults._dragSourceElement = null;
                videoListDefaults._element = null;
                Log.ret(Log.l.trace);
            }

            videoListDefaults._handleExitEvent = function () {
                if (videoListDefaults._exitEventTimer) {
                    window.clearTimeout(videoListDefaults._exitEventTimer);
                    videoListDefaults._exitEventTimer = 0;
                }
                videoListDefaults._exitEventTimer = window.setTimeout(function () {
                    if (that._disposed) { return; }
                    if (videoListDefaults._pointerLeftRegion) {
                        videoListDefaults._clearDragBetween(videoListDefaults._lastInsertPoint);
                        if (videoListDefaults._addedDragOverClass) {
                            videoListDefaults._addedDragOverClass = false;
                            if (videoListDefaults._element) {
                                WinJS.Utilities.removeClass(videoListDefaults._element, "win-dragover");
                            }
                        }
                        videoListDefaults._pointerLeftRegion = false;
                        videoListDefaults._lastInsertPoint = null;
                        videoListDefaults._dragBetweenDisabled = false;
                        videoListDefaults._exitEventTimer = 0;
                    }
                }, 40);
            }

            videoListDefaults._getEventPositionInElementSpace = function (element, eventObject) {
                var elementRect = { left: 0, top: 0 };
                try {
                    elementRect = element.getBoundingClientRect();
                }
                catch (err) { }

                var computedStyle = WinJS.Utilities._getComputedStyle(element, null),
                    paddingLeft = parseInt(computedStyle["paddingLeft"]),
                    paddingTop = parseInt(computedStyle["paddingTop"]),
                    borderLeft = parseInt(computedStyle["borderLeftWidth"]),
                    borderTop = parseInt(computedStyle["borderTopWidth"]),
                    clientX = eventObject.clientX,
                    clientY = eventObject.clientY;

                var position = {
                    x: +clientX === clientX ? (clientX - elementRect.left - paddingLeft - borderLeft) : 0,
                    y: +clientY === clientY ? (clientY - elementRect.top - paddingTop - borderTop) : 0
                };

                return position;
            }

            videoListDefaults.hitTest = function (x, y) {
                if (videoListDefaults._element) {
                    var videoListItem = videoListDefaults._element.firstElementChild;
                    while (videoListItem) {
                        if (WinJS.Utilities.hasClass(videoListItem, "win-dragtarget")) {
                            var rect = videoListItem.getBoundingClientRect();
                            if (x >= rect.left && x < rect.right &&
                                y >= rect.top && y < rect.bottom) {
                                var index = indexFromPinnedVideosItem(videoListItem);
                                var insertAfterIndex, insertAfterItem;
                                if (x >= (rect.right + rect.left) / 2) {
                                    insertAfterIndex = index;
                                    insertAfterItem = videoListItem;
                                } else if (videoListItem.previousElementSibling) {
                                    insertAfterIndex = indexFromPinnedVideosItem(videoListItem.previousElementSibling);
                                    insertAfterItem = videoListItem.previousElementSibling;
                                } else {
                                    insertAfterIndex = -1;
                                    insertAfterItem = null;
                                }
                                return {
                                    index: index,
                                    insertAfterIndex: insertAfterIndex,
                                    item: videoListItem,
                                    insertAfterItem: insertAfterItem
                                }
                            }
                        }
                        videoListItem = videoListItem.nextElementSibling;
                    }
                }
                return null;
            }

            this.eventHandlers = {
                loadSessionStatus: function() {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.loadSessionStatus();
                    Log.ret(Log.l.info);
                },
                showPresentation: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.ShowPresentation = 1;
                        that.reflectSessionStatus();
                    }
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                hidePresentation: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState(presenterModeDefaults.off);
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.ShowPresentation = 0;
                        that.reflectSessionStatus();
                    }
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                showVideoList: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.ShowVideoList = 1;
                        that.reflectSessionStatus();
                    }
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                hideVideoList: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.ShowVideoList = 0;
                        that.reflectSessionStatus();
                    }
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                videoListDefault: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.VideoListPosition = videoListDefaults.top;
                    }
                    that.setPresenterModeState(presenterModeDefaults.off);
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                videoListLeft: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.VideoListPosition = videoListDefaults.left;
                    }
                    that.setPresenterModeState(presenterModeDefaults.off);
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                videoListRight: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (that.binding.dataSessionStatus) {
                        that.binding.dataSessionStatus.VideoListPosition = videoListDefaults.right;
                    }
                    that.setPresenterModeState(presenterModeDefaults.off);
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                presenterModeTiled: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState(presenterModeDefaults.tiled);
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                presenterModeFull: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState(presenterModeDefaults.full);
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                presenterModeSmall: function () {
                    Log.call(Log.l.info, "Conference.Controller.");
                    that.setPresenterModeState(presenterModeDefaults.small);
                    that.delayedLoadSessionStatus();
                    Log.ret(Log.l.info);
                },
                clickPresenterMode: function (event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (AppBar.notifyModified && event && event.currentTarget && that.binding.dataSessionStatus) {
                        var command = event.currentTarget.id;
                        if (command) {
                            Log.print(Log.l.info, "command=" + command);
                            that.submitCommandMessage(magicStart + command + magicStop, event);
                            var dataSessionStatus = copyByValue(that.binding.dataSessionStatus);
                            if (dataSessionStatus) {
                                switch (command) {
                                    case "presenterModeTiled":
                                        dataSessionStatus.PresenterMode = presenterModeDefaults.tiled;
                                        dataSessionStatus.VideoListPosition = videoListDefaults.right;
                                        break;
                                    case "presenterModeFull":
                                        dataSessionStatus.PresenterMode = presenterModeDefaults.full;
                                        dataSessionStatus.VideoListPosition = videoListDefaults.right;
                                        break;
                                    case "presenterModeSmall":
                                        dataSessionStatus.PresenterMode = presenterModeDefaults.small;
                                        dataSessionStatus.VideoListPosition = videoListDefaults.right;
                                        break;
                                    case "videoListLeft":
                                        dataSessionStatus.PresenterMode = presenterModeDefaults.off;
                                        dataSessionStatus.VideoListPosition = videoListDefaults.left;
                                        break;
                                    case "videoListRight":
                                        dataSessionStatus.PresenterMode = presenterModeDefaults.off;
                                        dataSessionStatus.VideoListPosition = videoListDefaults.right;
                                        break;
                                    case "videoListDefault":
                                        dataSessionStatus.PresenterMode = presenterModeDefaults.off;
                                        dataSessionStatus.VideoListPosition = videoListDefaults.top;
                                        break;
                                }
                                if (videoListDefaults.usePinned &&
                                    dataSessionStatus.PresenterMode !== presenterModeDefaults.off &&
                                    that.binding.pinnedVideos && that.binding.pinnedVideos.length > 1) {
                                    that.binding.pinnedVideos.splice(1);
                                    dataSessionStatus.PinnedVideos = JSON.stringify(that.binding.pinnedVideos);
                                    that.saveSessionStatus(dataSessionStatus);
                                    if (!checkForInactiveVideoPromise) {
                                        checkForInactiveVideoPromise = WinJS.Promise.timeout(0).then(function() {
                                            that.checkForInactiveVideo();
                                        });
                                    }
                                    that.submitCommandMessage(magicStart + "loadSessionStatus" + magicStop, event);
                                } else {
                                    that.saveSessionStatus(dataSessionStatus);
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickPinVideoButton: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (AppBar.notifyModified && event && event.currentTarget && that.binding.dataSessionStatus) {
                        var targetParent = event.currentTarget.parentElement;
                        if (targetParent) {
                            var key = targetParent.name;
                            if (key) {
                                var dataSessionStatus = copyByValue(that.binding.dataSessionStatus);
                                if ( !that.binding.pinnedVideos ) {
                                    that.binding.pinnedVideos = [];
                                }
                                if (that.binding.pinnedVideos.indexOf(key) < 0) {
                                    if (unpinnedVideoList) {
                                        for (var oldIndex = 0; oldIndex < unpinnedVideoList.length; oldIndex++) {
                                            var oldItem = unpinnedVideoList.getAt(oldIndex);
                                            if (oldItem && key === oldItem.key) {
                                                unpinnedVideoList.splice(oldIndex, 1);
                                                break;
                                            }
                                        }
                                    }
                                    if (dataSessionStatus.PresenterMode !== presenterModeDefaults.off) {
                                        that.binding.pinnedVideos = [key];
                                    } else {
                                        that.binding.pinnedVideos.push(key);
                                    }
                                }
                                dataSessionStatus.PinnedVideos = JSON.stringify(that.binding.pinnedVideos);
                                that.saveSessionStatus(dataSessionStatus);
                                if (!checkForInactiveVideoPromise) {
                                    checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                                        that.checkForInactiveVideo();
                                    });
                                }
                                that.submitCommandMessage(magicStart + "loadSessionStatus" + magicStop, event);
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickUnpinVideoButton: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (AppBar.notifyModified && event && event.currentTarget && 
                        event.currentTarget.parentElement &&
                        event.currentTarget.parentElement.parentElement &&
                        that.binding.dataSessionStatus) {
                        var videoListItem = event.currentTarget.parentElement.parentElement.parentElement;
                        if (videoListItem) {
                            var key = getInternalInstanceKey(videoListItem) || "0";
                            var index = that.binding.pinnedVideos.indexOf(key);
                            if (index >= 0) {
                                that.binding.pinnedVideos.splice(index, 1);
                            }
                            var dataSessionStatus = copyByValue(that.binding.dataSessionStatus);
                            dataSessionStatus.PinnedVideos = JSON.stringify(that.binding.pinnedVideos);
                            that.saveSessionStatus(dataSessionStatus);
                            if (!checkForInactiveVideoPromise) {
                                checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                                    that.checkForInactiveVideo();
                                });
                            }
                            that.submitCommandMessage(magicStart + "loadSessionStatus" + magicStop, event);
                        }
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
                        mediaContainer = fragmentElement.querySelector(getMediaContainerSelector());
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
                    if (pageControllerName === "eventController") {
                        if (AppBar.scope && typeof AppBar.scope.loadData === "function") {
                            AppBar.scope.loadData();
                        }
                    }
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
                    var pollSection = fragmentElement.querySelector("." + bbbClass.poll);
                    if (pollSection) {
                        var customInputWrapper = pollSection.querySelector("." + bbbClass.customInputWrapper);
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
                    if (AppBar.notifyModified && event && event.currentTarget && that.binding.dataSessionStatus) {
                        var toggle = event.currentTarget;
                        if (toggle && toggle.id && typeof toggle.ariaChecked !== "undefined") {
                            var command = toggle.id;
                            var checked;
                            if (typeof toggle.ariaChecked === "string") {
                                checked = (toggle.ariaChecked === "true") ? true : false;
                            } else  {
                                checked = toggle.ariaChecked;
                            }
                            checked = !checked;
                            if (typeof toggle.ariaChecked === "string") {
                                toggle.ariaChecked = checked ? "true" : "false";
                            } else  {
                                toggle.ariaChecked = checked;
                            }
                            var value = that.binding[command];
                            if (typeof value === "boolean" && value !== checked) {
                                that.binding[command] = checked;
                                if (!checked) {
                                    command = command.replace(/show/, "hide");
                                }
                                if (pageControllerName === "modSessionController") {
                                    that.submitCommandMessage(magicStart + command + magicStop, event);
                                    var dataSessionStatus = copyByValue(that.binding.dataSessionStatus);
                                    if (dataSessionStatus) {
                                        switch (command) {
                                        case "showPresentation":
                                            dataSessionStatus.ShowPresentation = 1;
                                            break;
                                        case "hidePresentation":
                                            dataSessionStatus.ShowPresentation = 0;
                                            break;
                                        case "showVideoList":
                                            dataSessionStatus.ShowVideoList = 1;
                                            break;
                                        case "hideVideoList":
                                            dataSessionStatus.ShowVideoList = 0;
                                            break;
                                        }
                                        that.saveSessionStatus(dataSessionStatus);
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickAction: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (AppBar.notifyModified && event && event.currentTarget) {
                        var button = event.currentTarget;
                        if (button && button.id) {
                            var command = button.id;
                            switch (command) {
                            case "closeConnection":
                                if (pageControllerName === "modSessionController") {
                                    AppBar.handleEvent('click', 'clickCloseSessionEvent', event);
                                } else {
                                    AppBar.handleEvent('click', 'clickHome', event);
                                }
                                break;
                            case "showMedia":
                                var showMediaButton = fragmentElement.querySelector(elementSelectors.showMediaButton);
                                if (showMediaButton) {
                                    showMediaButton.click();
                                }
                                break;
                            case "showDeskShare":
                                var startDeskShare = fragmentElement.querySelector(elementSelectors.startDeskShare);
                                var stopDeskShare = fragmentElement.querySelector(elementSelectors.stopDeskShare);
                                if (startDeskShare) {
                                    startDeskShare.click();
                                } else if (stopDeskShare) {
                                    stopDeskShare.click();
                                }
                                break;
                            case "audioSettings":
                                var audioSettings = fragmentElement.querySelector(elementSelectors.audioSettings);
                                if (audioSettings) {
                                    audioSettings.click();
                                }
                                break;
                            case "videoSettings":
                                var videoSettings = fragmentElement.querySelector(elementSelectors.videoSettings);
                                if (videoSettings) {
                                    videoSettings.click();
                                }
                                break;
                            case "joinAudio":
                                var joinAudio = fragmentElement.querySelector(elementSelectors.joinAudio);
                                if (joinAudio) {
                                    joinAudio.click();
                                } else {
                                    var leaveAudio = fragmentElement.querySelector(elementSelectors.leaveAudio);
                                    if (leaveAudio) {
                                        leaveAudio.click();
                                    }
                                }
                                break;
                            case "toggleMicrophone":
                                var microphoneOff = fragmentElement.querySelector(elementSelectors.microphoneOff);
                                if (microphoneOff) {
                                    microphoneOff.click();
                                } else {
                                    var microphoneOn = fragmentElement.querySelector(elementSelectors.microphoneOn);
                                    if (microphoneOn) {
                                        microphoneOn.click();
                                    }
                                } 
                                break;
                            case "toggleCamera":
                                var leaveVideo = fragmentElement.querySelector(elementSelectors.leaveVideo);
                                if (leaveVideo) {
                                    leaveVideo.click();
                                } else {
                                    var joinVideo = fragmentElement.querySelector(elementSelectors.joinVideo);
                                    if (joinVideo) {
                                        joinVideo.click();
                                    }
                                    if (pageControllerName === "modSessionController") {
                                        if (showPaneToolsButtonContainer && 
                                            !that.binding.showPaneTools) {
                                            var showPaneButton = showPaneToolsButtonContainer.querySelector("button");
                                            if (showPaneButton) {
                                                showPaneButton.click();
                                            }
                                        }
                                    } else {
                                        if (showUserListButtonContainer && 
                                            !that.binding.showUserList) {
                                            var showUserListButton = showUserListButtonContainer.querySelector("button");
                                            if (showUserListButton) {
                                                showUserListButton.click();
                                            }
                                        }
                                    }
                                } 
                                break;
                            case "showConnectionStatus":
                                var showConnectionStatus = fragmentElement.querySelector(elementSelectors.showConnectionStatus);
                                if (showConnectionStatus) {
                                    showConnectionStatus.click();
                                }
                                break;
                            case "raiseHand":
                                var lowerHandLabel = fragmentElement.querySelector(elementSelectors.lowerHandLabel);
                                if (lowerHandLabel) {
                                    lowerHandLabel.click();
                                    that.binding.raiseHand = false;
                                } else {
                                    var raiseHandLabel = fragmentElement.querySelector(elementSelectors.raiseHandLabel);
                                    if (raiseHandLabel) {
                                        raiseHandLabel.click();
                                        that.binding.raiseHand = true;
                                        AppData.call("PRC_CreateIncident", {
                                            pUserToken: userToken,
                                            pIncidentName: "Hand"
                                        }, function (json) {
                                            Log.print(Log.l.trace, "PRC_CreateIncident success!");
                                        }, function (error) {
                                            Log.print(Log.l.error, "PRC_CreateIncident error! ");
                                        });
                                    } else {
                                        that.binding.raiseHand = false;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickShowPane: function(event) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    if (AppBar.notifyModified && event && event.currentTarget) {
                        var button = event.currentTarget;
                        if (button && button.id && typeof button.ariaChecked !== "undefined") {
                            var command = button.id;
                            var checked;
                            if (typeof button.ariaChecked === "string") {
                                checked = (button.ariaChecked === "true") ? true : false;
                            } else {
                                checked = button.ariaChecked;
                            }
                            checked = !checked;
                            if (typeof button.ariaChecked === "string") {
                                button.ariaChecked = checked ? "true" : "false";
                            } else {
                                button.ariaChecked = checked;
                            }
                            var value = that.binding[command];
                            if (typeof value === "boolean" && value !== checked) {
                                var closeChatButton = fragmentElement.querySelector(elementSelectors.closeChatButton);
                                var closeNotesButton = fragmentElement.querySelector(elementSelectors.closeNotesButton);
                                var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                                var btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                                var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                                that.binding[command] = checked;
                                switch (command) {
                                case "showUserList":
                                    if (checked) {
                                        that.binding.showChat = false;
                                        that.binding.showNotes = false;
                                        if (closeChatButton) {
                                            closeChatButton.click();
                                        }
                                        if (closeNotesButton) {
                                            closeNotesButton.click();
                                        }
                                        if (!userListContent) {
                                            if (btnToggleUserList) {
                                                btnToggleUserList.click();
                                            }
                                        } else {
                                            if (panelWrapper) {
                                                if (WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                                    WinJS.Utilities.removeClass(panelWrapper, "hide-user-list-section");
                                                }
                                            }
                                        }
                                        if (pageControllerName === "modSessionController") {
                                            that.binding.showPaneTools = false;
                                        } else if (!checkForInactiveVideoPromise) {
                                            checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                                                that.checkForInactiveVideo();
                                            });
                                        }
                                        if (that.binding.showPaneTools) {
                                            WinJS.Promise.timeout(100).then(function() {
                                                if (listView && listView.winControl) {
                                                    listView.winControl.forceLayout();
                                                }
                                            });
                                        }
                                    } else {
                                        if (userListContent) {
                                            if (panelWrapper) {
                                                if (WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium-small")) {
                                                    if (btnToggleUserList) {
                                                        btnToggleUserList.click();
                                                    }
                                                } else if (!WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                                    WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "showChat":
                                    if (checked) {
                                        that.binding.showNotes = false;
                                        that.binding.showUserList = false;
                                        if (pageControllerName === "modSessionController") {
                                            that.binding.showPaneTools = false;
                                        }
                                        if (closeNotesButton) {
                                            closeNotesButton.click();
                                        }
                                        if (userListContent) {
                                            if (panelWrapper) {
                                                if (!WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                                    WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                                                }
                                            }
                                        }
                                        that.openChatPane(event);
                                    } else {
                                        if (closeChatButton) {
                                            closeChatButton.click();
                                        }
                                    }
                                    break;
                                case "showNotes":
                                    if (checked) {
                                        that.binding.showChat = false;
                                        that.binding.showUserList = false;
                                        if (pageControllerName === "modSessionController") {
                                            that.binding.showPaneTools = false;
                                        }
                                        if (closeChatButton) {
                                            closeChatButton.click();
                                        }
                                        if (userListContent) {
                                            if (panelWrapper) {
                                                if (!WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                                    WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                                                }
                                            }
                                        }
                                        that.openNotesPane(event);
                                    } else {
                                        if (closeNotesButton) {
                                            closeNotesButton.click();
                                        }
                                    }
                                    break;
                                case "showPaneTools":
                                    if (checked) {
                                        that.binding.showNotes = false;
                                        that.binding.showChat = false;
                                        that.binding.showUserList = false;
                                        if (closeChatButton) {
                                            closeChatButton.click();
                                        }
                                        if (closeNotesButton) {
                                            closeNotesButton.click();
                                        }
                                        if (userListContent) {
                                            if (panelWrapper) {
                                                if (!WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                                                    WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                                                }
                                            }
                                        }
                                        WinJS.Promise.timeout(100).then(function() {
                                            if (listView && listView.winControl) {
                                                listView.winControl.forceLayout();
                                            }
                                        });
                                    } else {
                                        WinJS.Promise.timeout(250).then(function() {
                                            userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                                            if (!that.binding.showUserList && !that.binding.showChat && !that.binding.showNotes && !that.binding.showPaneTools &&
                                                userListContent && WinJS.Utilities.hasClass(Application.navigator.pageElement, "view-size-medium-small")) {
                                                btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                                                if (btnToggleUserList) {
                                                    btnToggleUserList.click();
                                                }
                                            }
                                        });

                                    }
                                    break;
                                case "expandActions":
                                    if (panelWrapper) {
                                        if (checked) {
                                            if (!WinJS.Utilities.hasClass(panelWrapper, "actions-menu-expanded")) {
                                                WinJS.Utilities.addClass(panelWrapper, "actions-menu-expanded");
                                            }
                                        } else {
                                            if (WinJS.Utilities.hasClass(panelWrapper, "actions-menu-expanded")) {
                                                WinJS.Utilities.removeClass(panelWrapper, "actions-menu-expanded");
                                            }
                                        }
                                    }
                                    break;
                                }
                                if (!adjustContentPositionsPromise) {
                                    adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                                        that.adjustContentPositions();
                                    });
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.info);
                },
                clickToggleEmojiButton: function(event) {
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
                        AppData.call("PRC_CreateIncident", {
                            pUserToken: userToken,
                            pIncidentName: "Emoji",
                            pTextInfo1: command
                        }, function (json) {
                            Log.print(Log.l.trace, "PRC_CreateIncident success!");
                        }, function (error) {
                            Log.print(Log.l.error, "PRC_CreateIncident error! ");
                        });
                    }
                    that.eventHandlers.hideToolbox("emojiToolbar");
                    Log.ret(Log.l.info);
                },
                hideToolbox: function(id) {
                    Log.call(Log.l.info, "Conference.Controller.");
                    var curToolbox = fragmentElement.querySelector('#' + id);
                    if (curToolbox && curToolbox.style) {
                        WinJS.Utilities.addClass(curToolbox, "box-is-minimized");
                        WinJS.Promise.timeout(300).then(function() {
                            curToolbox.style.display = "none";
                        });
                    }
                    Log.ret(Log.l.info);
                },
                toggleToolbox: function (id) {
                    Log.call(Log.l.info, "Conference.Controller.");
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
                    Log.ret(Log.l.info);
                },
                onListViewLoadingStateChanged: function (eventInfo) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (listView && listView.winControl) {
                        Log.print(Log.l.trace, "loadingState=" + listView.winControl.loadingState);
                        // single list selection
                        if (listView.winControl.selectionMode !== WinJS.UI.SelectionMode.none) {
                            listView.winControl.selectionMode = WinJS.UI.SelectionMode.none;
                        }
                        // direct selection on each tap
                        if (listView.winControl.tapBehavior !== WinJS.UI.TapBehavior.none) {
                            listView.winControl.tapBehavior = WinJS.UI.TapBehavior.none;
                        }
                        if (listView.winControl.loadingState === "itemsLoaded") {
                        } else if (listView.winControl.loadingState === "complete") {
                            for (var i = listView.winControl.indexOfFirstVisible;
                                i <= listView.winControl.indexOfLastVisible;
                                i++) {
                                var element = listView.winControl.elementFromIndex(i);
                                if (element) {
                                    var video = element.querySelector(".video-item");
                                    if (video && typeof video.play === "function") {
                                        video.play();
                                    }
                                }
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onVideoListItemDragStart: function(eventObject) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (eventObject) {
                        var sourceElement = eventObject.target;
                        if (sourceElement && sourceElement.parentElement) {
                            videoListDefaults._pressedEntity = { type: WinJS.UI.ObjectType.item, index: indexFromPinnedVideosItem(eventObject.target) };
                            if (videoListDefaults._pressedEntity.index !== -1) {
                                videoListDefaults._dragging = true;
                                videoListDefaults._dragSourceElement = sourceElement;
                                videoListDefaults._dragDataTransfer = eventObject.dataTransfer;
                                videoListDefaults._pressedPosition = WinJS.Utilities._getCursorPos(eventObject);
                                videoListDefaults._lastEnteredElement = sourceElement;
                                videoListDefaults._element = sourceElement.parentElement;

                                // Firefox requires setData to be called on the dataTransfer object in order for DnD to continue.
                                // Firefox also has an issue rendering the item's itemBox+element, so we need to use setDragImage, using the item's container, to get it to render.
                                eventObject.dataTransfer.setData("text", "");
                                if (eventObject.dataTransfer.setDragImage) {
                                    var rect = sourceElement.getBoundingClientRect();
                                    eventObject.dataTransfer.setDragImage(sourceElement, eventObject.clientX - rect.left, eventObject.clientY - rect.top);

                                    sourceElement.ondragend = that.eventHandlers.onVideoListItemDragEnd.bind(that);

                                    WinJS.Promise.timeout(0).then(function() {
                                        if (videoListDefaults._dragging && 
                                            videoListDefaults._element && 
                                            videoListDefaults._dragSourceElement) {
                                            videoListDefaults._addedDragOverClass = true;
                                            WinJS.Utilities.addClass(videoListDefaults._element, "win-dragover");
                                            WinJS.Utilities.addClass(videoListDefaults._dragSourceElement, "win-dragsource");
                                            var videoListItem = videoListDefaults._element.firstElementChild;
                                            while (videoListItem) {
                                                if (videoListItem.draggable && 
                                                    videoListItem !== videoListDefaults._dragSourceElement) {
                                                    WinJS.Utilities.addClass(videoListItem, "win-dragtarget");
                                                }
                                                videoListItem = videoListItem.nextElementSibling;
                                            }
                                        }
                                    });
                                }
                            } else {
                                eventObject.preventDefault();
                            }
                        }
                    }
                    Log.ret(Log.l.trace);
                },
                onVideoListItemDragEnter: function(eventObject) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    videoListDefaults._lastEnteredElement = eventObject.target;
                    if (videoListDefaults._exitEventTimer) {
                        window.clearTimeout(videoListDefaults._exitEventTimer);
                        videoListDefaults._exitEventTimer = 0;
                    }
                    if (videoListDefaults._dragging) {
                        eventObject.preventDefault();
                        if (!videoListDefaults._addedDragOverClass) {
                            videoListDefaults._addedDragOverClass = true;
                            WinJS.Utilities.addClass(videoListDefaults._element, "win-dragover");
                        }
                    }
                    videoListDefaults._pointerLeftRegion = false;
                    Log.ret(Log.l.trace);
                },
                onVideoListItemDragOver: function (eventObject) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    videoListDefaults._pointerLeftRegion = false;

                    var insertPoint = videoListDefaults.hitTest(eventObject.clientX, eventObject.clientY);
                    if (insertPoint && insertPoint.index >= 0) {
                        if (!videoListDefaults._lastInsertPoint ||
                            videoListDefaults._lastInsertPoint.insertAfterIndex !== insertPoint.insertPoint ||
                            videoListDefaults._lastInsertPoint.index !== insertPoint.index) {
                            videoListDefaults._clearDragBetween(videoListDefaults._lastInsertPoint);
                            Log.print(Log.l.trace, "insertAfterIndex=" + insertPoint.insertAfterIndex + " index=" + insertPoint.index);
                            if (insertPoint.insertAfterItem) {
                                if (insertPoint.insertAfterItem.nextElementSibling &&
                                    WinJS.Utilities.hasClass(insertPoint.insertAfterItem.nextElementSibling, "win-dragtarget")) {
                                    WinJS.Utilities.addClass(insertPoint.insertAfterItem.nextElementSibling, "win-dragbefore");
                                }
                                if (WinJS.Utilities.hasClass(insertPoint.insertAfterItem, "win-dragtarget")) {
                                    WinJS.Utilities.addClass(insertPoint.insertAfterItem, "win-dragafter");
                                }
                            } else if (videoListDefaults._element &&
                                videoListDefaults._element.firstElementChild &&
                                WinJS.Utilities.hasClass(videoListDefaults._element.firstElementChild, "win-dragtarget")) {
                                WinJS.Utilities.addClass(videoListDefaults._element.firstElementChild, "win-dragbefore");
                            }
                            videoListDefaults._lastInsertPoint = insertPoint;
                        }
                    }
                    Log.ret(Log.l.trace, "clientX=" + eventObject.clientX + " clientY=" + eventObject.clientY + 
                        " index=" + (insertPoint ? insertPoint.index : -1) + 
                        " insertAfterIndex=" + (insertPoint ? insertPoint.insertAfterIndex : -1));
                },
                onVideoListItemDragLeave: function(eventObject) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (eventObject.target === videoListDefaults._lastEnteredElement) {
                        videoListDefaults._pointerLeftRegion = true;
                        videoListDefaults._handleExitEvent();
                    }
                    Log.ret(Log.l.trace);
                },
                onVideoListItemDragEnd: function() {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    videoListDefaults._clearDragProperties();
                    Log.ret(Log.l.trace);
                },
                onVideoListItemDrop: function(eventObject) {
                    Log.call(Log.l.trace, "Conference.Controller.");
                    if (videoListDefaults._lastInsertPoint &&
                        videoListDefaults._pressedEntity &&
                        videoListDefaults._pressedEntity.index >= 0 &&
                        that.binding.dataSessionStatus) {
                        /*if (videoListDefaults._dragSourceElement &&
                            videoListDefaults._element) {
                            if (videoListDefaults._lastInsertPoint.insertAfterItem) {
                                if (videoListDefaults._lastInsertPoint.insertAfterItem.nextElementSibling) {
                                    if (videoListDefaults._dragSourceElement.nextElementSibling !==
                                        videoListDefaults._lastInsertPoint.insertAfterItem.nextElementSibling) {
                                        videoListDefaults._element.insertBefore(videoListDefaults._dragSourceElement,
                                            videoListDefaults._lastInsertPoint.insertAfterItem.nextElementSibling);
                                    }
                                } else {
                                    if (videoListDefaults._dragSourceElement.previousElementSibling !==
                                        videoListDefaults._lastInsertPoint.insertAfterItem) {
                                        videoListDefaults._element.appendChild(videoListDefaults._dragSourceElement);
                                    }
                                }
                            } else {
                                if (videoListDefaults._dragSourceElement !== videoListDefaults._element.firstElementChild) {
                                    videoListDefaults._element.insertBefore(videoListDefaults._dragSourceElement,
                                        videoListDefaults._element.firstElementChild);
                                }
                            }
                        }*/
                        var index = videoListDefaults._pressedEntity.index;
                        var insertAfterIndex = videoListDefaults._lastInsertPoint.insertAfterIndex;
                        if (index >= 0 && index !== insertAfterIndex) {
                            var pinnedVideos;
                            if (insertAfterIndex >= 0) {
                                if (index < insertAfterIndex) {
                                    pinnedVideos = that.binding.pinnedVideos.slice(0, index)
                                        .concat(that.binding.pinnedVideos.slice(index + 1, insertAfterIndex + 1))
                                        .concat([that.binding.pinnedVideos[index]])
                                        .concat(that.binding.pinnedVideos.slice(insertAfterIndex + 1));
                                } else {
                                    pinnedVideos = that.binding.pinnedVideos.slice(0, insertAfterIndex + 1)
                                        .concat([that.binding.pinnedVideos[index]])
                                        .concat(that.binding.pinnedVideos.slice(insertAfterIndex + 1, index))
                                        .concat(that.binding.pinnedVideos.slice(index + 1));
                                }
                            } else {
                                pinnedVideos = [that.binding.pinnedVideos[index]]
                                    .concat(that.binding.pinnedVideos.slice(0, index))
                                    .concat(that.binding.pinnedVideos.slice(index + 1));
                            }
                            that.binding.pinnedVideos = pinnedVideos;
                            var dataSessionStatus = copyByValue(that.binding.dataSessionStatus);
                            dataSessionStatus.PinnedVideos = JSON.stringify(that.binding.pinnedVideos);
                            that.saveSessionStatus(dataSessionStatus);
                            if (!checkForInactiveVideoPromise) {
                                checkForInactiveVideoPromise = WinJS.Promise.timeout(20).then(function() {
                                    that.checkForInactiveVideo();
                                });
                            }
                            that.submitCommandMessage(magicStart + "loadSessionStatus" + magicStop, event);
                        }
                    }
                    videoListDefaults._clearDragProperties();
                    eventObject.preventDefault();
                    Log.ret(Log.l.trace);
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

            var openNotesPane = function(event) {
                var btnToggleNotes, btnToggleUserList;
                Log.call(Log.l.info, "Conference.Controller.");
                if (openNotesPanePromise) {
                    openNotesPanePromise.cancel();
                    openNotesPanePromise = null;
                }
                var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                var notes = fragmentElement.querySelector(elementSelectors.notes);
                if (!notes) {
                    var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                    if (!userListContent) {
                        if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                            WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                        } else {
                            btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                            if (btnToggleUserList) {
                                userListDefaults.inSubmitCommand = true;
                                btnToggleUserList.click();
                            }
                        }
                    } else {
                        userListDefaults.inSubmitCommand = false;
                        btnToggleNotes = fragmentElement.querySelector(elementSelectors.notesToggleButton);
                        if (btnToggleNotes) {
                            btnToggleNotes.click();
                        }
                    }
                    openNotesPanePromise = WinJS.Promise.timeout(20).then(function() {
                        that.openNotesPane();
                    });
                }
                Log.ret(Log.l.info);
            }
            that.openNotesPane = openNotesPane;

            var openChatPane = function(event) {
                var btnToggleChat, btnToggleUserList;
                Log.call(Log.l.info, "Conference.Controller.");
                if (openChatPanePromise) {
                    openChatPanePromise.cancel();
                    openChatPanePromise = null;
                }
                var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                var messageInput = fragmentElement.querySelector(elementSelectors.publicChat + " form textarea#message-input");
                if (!messageInput) {
                    var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                    if (!userListContent) {
                        if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-user-list-section")) {
                            WinJS.Utilities.addClass(panelWrapper, "hide-user-list-section");
                        } else {
                            btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                            if (btnToggleUserList) {
                                userListDefaults.inSubmitCommand = true;
                                btnToggleUserList.click();
                            }
                        }
                    } else {
                        userListDefaults.inSubmitCommand = false;
                        var chatPane = fragmentElement.querySelector(elementSelectors.publicChat);
                        if (!chatPane) {
                            btnToggleChat = fragmentElement.querySelector(elementSelectors.chatToggleButton);
                            if (btnToggleChat) {
                                btnToggleChat.click();
                            }
                        }
                    }
                    openChatPanePromise = WinJS.Promise.timeout(20).then(function() {
                        that.openChatPane();
                    });
                } else {
                    if (panelWrapper && WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                        WinJS.Utilities.removeClass(panelWrapper, "hide-chat-section");
                    }
                }
                Log.ret(Log.l.info);
            }
            that.openChatPane = openChatPane;

            var submitCommandMessage = function(command, event, openedUserList, openedChat) {
                var btnToggleChat, btnToggleUserList;
                Log.call(Log.l.info, "Conference.Controller.", "command=" + command);
                if (typeof command !== "string") {
                    Log.ret(Log.l.error, "invalid param");
                    return;
                }
                if (command.indexOf(magicStart) >= 0 &&
                    !(pageControllerName === "modSessionController")) {
                    Log.ret(Log.l.error, "access denied if not modSessionController");
                    return;
                }
                if (submitCommandMessagePromise) {
                    submitCommandMessagePromise.cancel();
                    submitCommandMessagePromise = null;
                }
                var panelWrapper = fragmentElement.querySelector(getMediaContainerSelector());
                var userListContent = fragmentElement.querySelector(elementSelectors.userListContent);
                var messageInput = fragmentElement.querySelector(elementSelectors.publicChatMessageInput);
                if (messageInput) {
                    //messageInput.focus();
                    if (messageInput.form && typeof messageInput.form.reset === "function") {
                        messageInput.form.reset();
                    }
                    messageInput.innerHTML = command;
                    var inputEvent = document.createEvent('event');
                    inputEvent.initEvent('input', true, true);
                    messageInput.dispatchEvent(inputEvent);
                    var submitButton = fragmentElement.querySelector(elementSelectors.publicChatSubmitButton);
                    if (submitButton) {
                        submitButton.click();
                    }
                    if (messageInput.form && typeof messageInput.form.reset === "function") {
                        messageInput.form.reset();
                    }
                    if (openedChat) {
                        btnToggleChat = fragmentElement.querySelector(elementSelectors.chatToggleButton);
                        if (btnToggleChat) {
                            btnToggleChat.click();
                        }
                    }
                    if (openedUserList && userListContent) {
                        btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                        if (btnToggleUserList) {
                            btnToggleUserList.click();
                        }
                    }
                    if (openedChat || openedUserList) {
                        if (panelWrapper) {
                            if (WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                                WinJS.Promise.timeout(50).then(function() {
                                    WinJS.Utilities.removeClass(panelWrapper, "hide-chat-section");
                                });
                            }
                            if (WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                                WinJS.Promise.timeout(50).then(function() {
                                    userListDefaults.inSubmitCommand = false;
                                    WinJS.Utilities.removeClass(panelWrapper, "hide-panel-section");
                                });
                            }
                        }
                    }
                } else {
                    if (!userListContent) {
                        if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-panel-section")) {
                            WinJS.Utilities.addClass(panelWrapper, "hide-panel-section");
                        } else {
                            btnToggleUserList = fragmentElement.querySelector(elementSelectors.userListToggleButton);
                            if (btnToggleUserList) {
                                userListDefaults.inSubmitCommand = true;
                                btnToggleUserList.click();
                                openedUserList = true;
                            }
                        }
                    } else {
                        var chatPane = fragmentElement.querySelector(elementSelectors.publicChat);
                        if (!chatPane) {
                            if (panelWrapper && !WinJS.Utilities.hasClass(panelWrapper, "hide-chat-section")) {
                                WinJS.Utilities.addClass(panelWrapper, "hide-chat-section");
                            } else {
                                btnToggleChat = fragmentElement.querySelector(elementSelectors.chatToggleButton);
                                if (btnToggleChat) {
                                    btnToggleChat.click();
                                    openedChat = true;
                                }
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
                loadSessionStatus: {
                    collection: "group-chat-msg", msg: "added", redundantList: ["loadSessionStatus"], type: "layout"
                },
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

            var handleCommandWithParam = function(commandWithParam) {
                Log.call(Log.l.trace, "Conference.Controller.", "commandWithParam=" + commandWithParam);
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
                        var mediaContainer = fragmentElement.querySelector(getMediaContainerSelector());
                        if (mediaContainer) {
                            var cameraDock = mediaContainer.querySelector(elementSelectors.cameraDock);
                            var overlayElement = cameraDock && cameraDock.parentElement;
                            if (overlayElement) {
                                overlayElement.ontransitionend = function () {
                                    if (!adjustContentPositionsPromise) {
                                        adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                                            that.adjustContentPositions();
                                        });
                                    }
                                };
                            }
                        }
                        if (!adjustContentPositionsPromise) {
                            adjustContentPositionsPromise = WinJS.Promise.timeout(50).then(function () {
                                that.adjustContentPositions();
                            });
                        }
                        return WinJS.Promise.timeout(50);
                    }).then(function () {
                        that.sendResize(50);
                    });
                });
                Log.ret(Log.l.trace);
                return handleCommandPromise;
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
                        var mediaContainer = fragmentElement.querySelector(getMediaContainerSelector());
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
                                            left: "50%",
                                            top: "calc(100% - 365px)",
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
            var findEndOfStruct = function(text, fromIndex, startChar) {
                fromIndex = (fromIndex > 0) ? fromIndex : 0;
                if (text && text[fromIndex] === startChar) {
                    var quoted = false;
                    var blockCount = 0;
                    if (startChar === "\"") {
                        fromIndex++;
                    }
                    for (var i = fromIndex; i < text.length; i++) {
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
                            if (text[i + 1] === "\"" || text[i + 1] === ",") {
                                return i + 2;
                            } else if (text[i + 1] === "]") {
                                return i + 1;
                            } else {
                                return 0;
                            }
                        }
                    }
                }
                return 0;
            }

            var msgQuote = "\\\"";
            var fieldStop = msgQuote;
            var parseXhrResponse = function(res, msg, collection, fieldStart, magicStart, magicStop) {
                var responseReplaced = false;
                var resultStart, msgStart;
                if (collection) {
                    resultStart = null;
                    msgStart = "\"{" + msgQuote + "msg" + msgQuote + ":" + msgQuote + msg + msgQuote + "," + msgQuote + "collection" + msgQuote + ":" + msgQuote + collection + msgQuote;
                } else {
                    resultStart = "\"{" + msgQuote + "msg" + msgQuote + ":" + msgQuote + msg + msgQuote;
                    msgStart = "{" + msgQuote + "_id" + msgQuote + ":";
                }
                var msgTimestamp = "timestamp";
                var timeStampStart = msgQuote + msgTimestamp + msgQuote + ":";
                var now = Date.now();
                var responseText = res && res.responseText;
                if (typeof responseText === "string" && 
                    (!resultStart || responseText.indexOf(resultStart) >= 0)) {
                    var newResponseText = "";
                    var prevStartPos = 0;
                    var prevStopPos = 0;
                    while (prevStartPos >= 0 && prevStartPos < responseText.length) {
                        var posMsgStart = responseText.indexOf(msgStart, prevStartPos);
                        if (posMsgStart >= 0 && 
                           (responseText.indexOf(magicStart, posMsgStart + msgStart.length) >= 0 ||
                            textContainsEmoji(responseText, posMsgStart) === true)) {
                            var posMsgStop = findEndOfStruct(responseText, posMsgStart, msgStart[0]);
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
                                                                if (collection) {
                                                                    commandWithParam.msg =  msg;
                                                                    commandWithParam.collection = collection;
                                                                } else {
                                                                    commandWithParam.msg = "added";
                                                                    commandWithParam.collection = "group-chat-msg";
                                                                }
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
                        Log.print(Log.l.trace, "newResponseText=" + (typeof newResponseText === "string" ? newResponseText.substr(0, 8192) : ""));
                        res.responseText = newResponseText;
                    }
                }
                return responseReplaced;
            }

            Application.hookXhrOnReadyStateChange = function(res) {
                var collection = "group-chat-msg";
                var msgField = "message";
                var fieldStart = msgQuote + msgField + msgQuote + ":" + msgQuote;
                parseXhrResponse(res, "added", collection, fieldStart, magicStart, magicStop);

                fieldStart = msgQuote + msgField + msgQuote + ":" + msgQuote;
                parseXhrResponse(res, "result", null, fieldStart, magicStart, magicStop);

                collection = "polls";
                msgField = "answers";
                fieldStart = msgQuote + msgField + msgQuote + ":" + "[{" + msgQuote + "id" + msgQuote + ":0," + msgQuote + "key" + msgQuote + ":" + msgQuote;
                parseXhrResponse(res, "added", collection, fieldStart, magicStart, magicStop);

                deleteMagicFromXhrResponse(res, magicStart, magicStop);
            };

            var replaceXhrSendBody = function(body, magicStart, magicStop) {
                var msgMethod;
                var msgField;
                var fieldStart;
                if (pageControllerName === "modSessionController") {
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
                            var posMsgStop = findEndOfStruct(body, posMsgStart, msgStart[0]);
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
            videoListDefaults.usePinned = !!that.binding.dataEvent.SpeakerVideosPinned;
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
            if (listView) {
                this.addRemovableEventListener(listView, "loadingstatechanged", this.eventHandlers.onListViewLoadingStateChanged.bind(this));
                if (listView.winControl && unpinnedVideoList) {
                    if (pageControllerName === "modSessionController") {
                        listView.winControl.itemsReorderable = true;
                    }
                    listView.winControl.itemDataSource = unpinnedVideoList.dataSource;
                }
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
                if (!adjustContentPositionsPromise) {
                    adjustContentPositionsPromise = WinJS.Promise.timeout(250).then(function() {
                        that.adjustContentPositions();
                    });
                }
                return WinJS.Promise.timeout(250);
            }).then(function () {
                return that.sendResize(2000);
            }).then(function() {
                var conference = fragmentElement.querySelector("#conference");
                if (AppBar.scope.binding.showConference && conference) {
                    conference.scrollIntoView();
                }
            });
            Log.ret(Log.l.trace);
        })
    });
})();



