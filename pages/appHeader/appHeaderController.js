// controller for page: appHeader
/// <reference path="~/www/lib/WinJS/scripts/base.js" />
/// <reference path="~/www/lib/WinJS/scripts/ui.js" />
/// <reference path="~/www/lib/convey/scripts/appSettings.js" />
/// <reference path="~/www/lib/convey/scripts/dataService.js" />
/// <reference path="~/www/lib/convey/scripts/appbar.js" />
/// <reference path="~/www/scripts/generalData.js" />
/// <reference path="~/www/pages/appHeader/appHeaderService.js" />


(function () {
    "use strict";

    WinJS.Namespace.define("AppHeader", {
        controller: null
    });
    WinJS.Namespace.define("AppHeader", {
        Controller: WinJS.Class.define(function Controller(pageElement) {
            Log.call(Log.l.trace, "AppHeader.Controller.");
            // ensure login 
            if (AppData &&
                AppData._persistentStates &&
                AppData._persistentStates.odata) {
                if (!AppData._persistentStates.odata.login ||
                    !AppData._persistentStates.odata.password) {
                    AppData._persistentStates.odata.login = AppData.customer;
                    AppData._persistentStates.odata.password = AppData.customerId;
                }
                if (AppData.onlinePath &&
                    AppData.onlinePath !== AppData._persistentStates.odata.onlinePath) {
                    AppData._persistentStates.odata.onlinePath = AppData.onlinePath;
                }
            }
            this.element = pageElement.querySelector("#appHeaderController.data-container");
            if (this.element) {
                this.element.winControl = this;
            }
            this.pageData = {
                userData: AppData._userData
            };

            AppHeader.controller = this;

            var that = this;

            // First, we call WinJS.Binding.as to get the bindable proxy object
            this.binding = WinJS.Binding.as(this.pageData);

            var resultConverter = function (item, index) {
                var property = AppData.getPropertyFromInitoptionTypeID(item);
                if (property && property !== "individualColors" && (!item.pageProperty) && item.LocalValue) {
                    item.colorValue = "#" + item.LocalValue;
                    AppData.applyColorSetting(property, item.colorValue);
                }
            }
            this.resultConverter = resultConverter;

            var loadData = function () {
                var ret = new WinJS.Promise.as().then(function () {
                    return AppHeader.CR_VERANSTOPTIONView.select(function (json) {
                        // this callback will be called asynchronously
                        // when the response is available
                        Log.print(Log.l.trace, "CR_VERANSTOPTIONView: success!");
                        // CR_VERANSTOPTION_ODataView returns object already parsed from json file in response
                        if (json && json.d && json.d.results && json.d.results.length > 1) {
                            var results = json.d.results;
                            results.forEach(function (item, index) {
                                that.resultConverter(item, index);
                            });
                            Application.pageframe.savePersistentStates();
                        }
                    }, function (errorResponse) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        AppData.setErrorMsg(that.binding, errorResponse);
                    }).then(function () {
                        var colors = Colors.updateColors();
                        return (colors && colors._loadCssPromise) || WinJS.Promise.as();
                    });
                });
                return ret;
            }
            this.loadData = loadData;

            // Finally, wire up binding
            WinJS.Resources.processAll(that.element).then(function () {
                return WinJS.Binding.processAll(that.element, that.binding);
            }).then(function () {
                Log.print(Log.l.trace, "Binding wireup page complete");
                return that.loadData();
            });
            Log.ret(Log.l.trace);
        }, {
            pageData: {
                generalData: AppData.generalData,
                appSettings: AppData.appSettings
            }
        })
    });
})();


