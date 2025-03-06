/* startup script for customizations */
(function () {
    "use strict";

    function saveBodyContent() {
        var customerElement = document.querySelector("#"+rootElementId);
        if (customerElement && customerElement.parentElement) {
            var mainTopElement = null;
            var mainBottomElement = null;
            var headerLogoA = document.querySelector(".header__logo.logo > a");
            var footerLogoA = document.querySelector(".footer__logo.logo > a");
            if (headerLogoA && footerLogoA) {
                footerLogoA.href = headerLogoA.href;
            }
            var customerRootElement = customerElement;
            while (customerRootElement.parentElement && customerRootElement.parentElement !== document.body) {
                if (customerRootElement.parentElement.parentElement === document.body &&
                    customerRootElement.nextElementSibling) {
                    var nextElementSibling = customerRootElement.nextElementSibling;
                    mainBottomElement = document.createElement(customerRootElement.parentElement.tagName);
                    if (mainBottomElement)
                        while (nextElementSibling) {
                            mainBottomElement.appendChild(nextElementSibling);
                            nextElementSibling = nextElementSibling.nextElementSibling;
                        }
                    mainTopElement = customerRootElement;
                    customerRootElement = customerRootElement.parentElement;
                    customerRootElement.removeChild(mainTopElement);
                } else {
                    customerRootElement = customerRootElement.parentElement;
                }
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
                    curBodyChild.tagName.toLowerCase() !== "noscript" &&
                    curBodyChild.tagName.toLowerCase() !== "script" &&
                    curBodyChild.tagName.toLowerCase() !== "link" &&
                    curBodyChild.className !== "skip-navigation") {
                    var main = curBodyChild.querySelector("#main");
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
            if (mainTopElement) {
                bodyContentTop.appendChild(mainTopElement);
            }
        }
    }

    saveBodyContent();

    window.LiveBridgeSettings = {
        buttonSymbolColor: "#FFFFFF",
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
