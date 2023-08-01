/* startup script for customizations */
(function () {
    "use strict";

    function saveBodyContent() {
        var customerElement = document.querySelector("#"+rootElementId);
        if (customerElement && customerElement.parentElement) {
            var mainBottomElement = null;
            var customerRootElement = customerElement;
            while (customerRootElement.parentElement && customerRootElement.parentElement !== document.body) {
                if (customerRootElement.parentElement.parentElement === document.body && 
                    customerRootElement.nextElementSibling) {
                    var nextElementSibling = customerRootElement.nextElementSibling;
                    mainBottomElement = document.createElement(customerRootElement.parentElement.tagName);
                    if (mainBottomElement) while (nextElementSibling) {
                        mainBottomElement.appendChild(nextElementSibling);
                        nextElementSibling = nextElementSibling.nextElementSibling;
                    }
                }
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
                    curBodyChild.tagName.toLowerCase() !== "script" &&
                    curBodyChild.tagName.toLowerCase() !== "link") {
                    bodyContentTop.appendChild(curBodyChild);
                }
                curBodyChild = nextBodyChild;
            }
            if (mainBottomElement) {
                bodyContentBottom.appendChild(mainBottomElement);
            }
            curBodyChild = customerRootElement.nextElementSibling;
            while (curBodyChild) {
                nextBodyChild = curBodyChild.nextElementSibling;
                if (curBodyChild.tagName && 
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

    Application.buttonSymbolColor = "#006B8A";

})();
