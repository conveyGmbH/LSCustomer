// controller for page: Register
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/logging.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/fragmentController.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/fragments/register/registerService.js" />

(function () {
    "use strict";

    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Register", {
        Controller: WinJS.Class.derive(Fragments.Controller, function Controller(fragmentElement, options, commandList) {
            Log.call(Log.l.trace, "Register.Controller.", "eventId=" + (options && options.eventId));

            Fragments.Controller.apply(this, [fragmentElement, {
                eventId: options ? options.eventId : null,
                dataRegister: {
                    Email: ""
                },
                loginDisabled: true
            }, commandList]);

            var that = this;

            var register = fragmentElement.querySelector("#register");

            var loadData = function () {
                Log.call(Log.l.trace, "Register.Controller.");
                AppData.setErrorMsg(AppBar.scope.binding);
                var ret = new WinJS.Promise.as().then(function () {
                // pUUID: window.device && window.device.uuid
                    function create_UUID() {
                        var dt = new Date().getTime();
                        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                            var r = (dt + Math.random() * 16) % 16 | 0;
                            dt = Math.floor(dt / 16);
                            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                        });
                        return uuid;
                    }

                    if (!AppData._persistentStates.odata.uuid) {
                        AppData._persistentStates.odata.uuid = create_UUID();
                        AppData._persistentStates.savePersistentStates();
                    }

                    return AppData.call("PRC_RegisterContact", { 
                        pVeranstaltungID: that.binding.eventId,
                        pUserToken: '0b24e593-127e-46f6-b034-c2cc178d8c71',
                        pEMail: that.binding.dataRegister.Email,
                        pAddressData: null
                    }, function (json) {
                        if (json && json.d && json.d.results) {
                            that.binding.dataRegister = json.d.results[0];
                        }
                        that.binding.dataRegister.Email = "";
                        Log.print(Log.l.trace, "PRC_RegisterContact success!");
                    }, function(error) {
                        Log.print(Log.l.error, "PRC_RegisterContact error! ");
                    });
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.loadData = loadData;

            var saveData = function (complete, error) {
                var err;
                Log.call(Log.l.trace, "Register.Controller.");
                AppData.setErrorMsg(that.binding);
                AppBar.busy = true;
                var ret = AppData.call("PRC_RegisterContact", {
                    pVeranstaltungID: that.binding.eventId,
                    pUserToken: AppData._persistentStates.odata.uuid,
                    pEMail: that.binding.dataRegister.Email,
                    pAddressData: null
                }, function (json) {
                    if (json && json.d && json.d.results) {
                        that.binding.dataRegister = json.d.results[0];
                    }
                    AppBar.busy = false;
                    that.binding.dataRegister.Email = "";
                    Log.print(Log.l.trace, "PRC_RegisterContact success!");
                }, function (error) {
                    Log.print(Log.l.error, "PRC_RegisterContact error! ");
                });
                Log.ret(Log.l.trace);
                return ret;
            }
            this.saveData = saveData;
            // define handlers
            this.eventHandlers = {
                clickOk: function (event) {
                    Log.call(Log.l.trace, "Register.Controller.");
                    that.saveData(function (response) {
                        // called asynchronously if ok
                    }, function (errorResponse) {
                        // called asynchronously on error
                    });
                    Log.ret(Log.l.trace);
                }
            };

            this.disableHandlers = {
                clickOk: function () {
                    that.binding.loginDisabled = AppBar.busy || that.binding.dataRegister.Email.length === 0;
                    return that.binding.loginDisabled;
                }
            };

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



