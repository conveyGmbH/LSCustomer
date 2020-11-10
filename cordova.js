(function () {
    "use strict";

    if (typeof cordova === "undefined") {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("deviceready", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "deviceready";
        }
        event.eventName = "deviceready";

        function checkForDeviceReady() {
            window.setTimeout(function () {
                if (!document.body || typeof WinJS !== "object") {
                    checkForDeviceReady();
                } else {
                    if (document.dispatchEvent) {
                        document.dispatchEvent(event);
                    } else {
                        document.fireEvent("on" + event.eventType, event);
                    }
                }
            }, 50);
        }
        checkForDeviceReady();
    }
})();
