// controller for page: Register
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

    WinJS.Namespace.define("RecordedContent", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "RecordedContent.Controller.", "eventId=" + (options && options.eventId));

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
                dataDocText: AppBar.scope.binding.dataDocText
            }, commandList]);

            var that = this;

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
                        .replaceAll(/window\.document\.location\.hostname/g, newHostname)
                        .replaceAll(/window\.location\.hostname/g, newHostname)
                        .replaceAll(/window\.location\.href/g, newHref)
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
                            promise = getScriptFromSrcXhr(scriptTag.src).then(function (scriptText) {
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
                    var html5Client = req.responseText
                        .replaceAll(/="compatibility/g, compatibilitySrc)
                        .replaceAll(/="\/html5client/g, html5ClientSrc);
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

            var loadData = function () {
                Log.call(Log.l.trace, "RecordedContent.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                    var url;
                    if (AppBar.scope.binding.recordedLink) {
                        url = AppBar.scope.binding.recordedLink;
                                }
                    if (url) {
                        var query = url.split("?")[1];
                        if (window.history && query && Application.query) {
                            var state = {};
                            var title = "";
                            var key = query.split("=")[0];
                            var value = query.split("=")[1];
                            if (key && value) {
                                Application.query[key] = value;
                                var location = window.location.href.split("?")[0] + "?" + createQueryStringFromParameters(Application.query);
                                window.history.pushState(state, title, location);
                            }
                        };
                        options.url = url.replaceAll(/https?:\/\/[\.a-zA-Z]+\/html5client/g, '/html5client');
                        return renderImpl(options.url, recordedContent, false);
                    } else {
                        // wenn keine recordedContent vorhanden dann zeige meldung -> recordedContent läuft noch nicht -> zurück button auf events
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

            /*var saveData = function (complete, error) {
                var err;
                Log.call(Log.l.trace, "RegisterConfirm.Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: AppData._persistentStates.registerData.userToken,
                    pEMail: that.binding.dataRegister.Email,
                    pAddressData: null,
                    pBaseURL: ''
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        var result = json.d.results[0];
                    }
                    AppBar.busy = false;
                    //that.binding.dataRegister.Email = "";
                    Register.controller.binding.dataRegister.Email = "";
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (error) {
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;
            */
            // define handlers
           /* this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "RegisterConfirm.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                }
            };*/

            this.disableHandlers = {
                /*clickOk: function () {
                    that.binding.loginDisabled = AppBar.busy || that.binding.dataRegister.Email.length === 0;
                    return that.binding.loginDisabled;
                }*/
            };

           // that.setDataRegister(getEmptyDefaultValue(Register.registerView.defaultValue));

            that.processAll().then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            }).then(function () {
                Log.print(Log.l.trace, "Data loaded");
            });
            Log.ret(Log.l.trace);
        })
    });
})();



