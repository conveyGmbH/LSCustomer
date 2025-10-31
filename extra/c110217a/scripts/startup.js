/* startup script for customizations */
(function () {
    "use strict";

    function saveBodyContent() {
        var customerElement = document.querySelector("#"+rootElementId);
        if (customerElement && customerElement.parentElement) {
            var customerRootElement = customerElement;
            while (customerRootElement.parentElement && customerRootElement.parentElement !== document.body) {
                customerRootElement = customerRootElement.parentElement;
            }
            // save customer page content
            var bodyContentTop = document.createElement("DIV");
            bodyContentTop.setAttribute("class", "saved-body-content-top");
            var bodyContentBottom = document.createElement("DIV");
            bodyContentBottom.setAttribute("class", "saved-body-content-bottom");
            bodyContentBottom.setAttribute("style", "visibility: hidden");
            var nextBodyChild;
            var curBodyChild = document.body.firstElementChild;
            while (curBodyChild && curBodyChild !== customerRootElement) {
                nextBodyChild = curBodyChild.nextElementSibling;
                if (curBodyChild.tagName && 
                    curBodyChild.tagName.toLowerCase() !== "svg" &&
                    curBodyChild.tagName.toLowerCase() !== "script" &&
                    curBodyChild.tagName.toLowerCase() !== "link") {
                    bodyContentTop.appendChild(curBodyChild);
                }
                curBodyChild = nextBodyChild;
            }
            curBodyChild = customerRootElement.nextElementSibling;
            while (curBodyChild) {
                nextBodyChild = curBodyChild.nextElementSibling;
                if (curBodyChild.tagName && 
                    curBodyChild.tagName.toLowerCase() !== "svg" &&
                    curBodyChild.tagName.toLowerCase() !== "script" &&
                    curBodyChild.tagName.toLowerCase() !== "link") {
                    bodyContentBottom.appendChild(curBodyChild);
                }
                curBodyChild = nextBodyChild;
            }
            document.body.insertBefore(bodyContentTop, customerRootElement);
            document.body.appendChild(bodyContentBottom);
            bodyContentTop.appendChild(customerRootElement);
        }
    }

    saveBodyContent();

    window.LiveBridgeSettings = {
        buttonSymbolColor: "#AD4829",
        homeSymbolName: "vector_left",
        homeSymbolOptions: {
            useFillColor: false,
            useStrokeColor: true,
            strokeWidth: 1400,
            size: {
                width: 14,
                height: 25
            }
        }
    };
})();
