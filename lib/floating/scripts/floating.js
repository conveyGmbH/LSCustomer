/**
 * Float a number of things up on a page (hearts, flowers, 👌 ...)
 * <br>
 * You give the o in an object.
 *
 * @module floating
 * @param {string} [o.content='👌']
 *   the character or string to float
 * @param {number} [o.number=1]
 *   the number of items
 * @param {number} [o.duration=10]
 *   the amount of seconds it takes to float up
 * @param {number|string} [o.repeat='infinite']
 *   the number of times you want the animation to repeat
 * @param {string} [o.direction='normal']
 *   The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction">
 *   animation-direction</a> of the main animation
 * @param {number|array} [o.sizes=2]
 *   The size (in em) of each element. Giving two values in an array will
 *   give a random size between those values.
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.floating = factory());
}(this, (function () { 'use strict';

    if (!document.getElementById('floating-style')) {
        var containerStyle = document.createElement('style');
        containerStyle.id = 'floating-style';
        var containerStyleCss = '@font-face { font-family: "color-emoji"; src: local("Apple Color Emoji"), local("Segoe UI Emoji"), local("Segoe UI Symbol"), local("Noto Color Emoji"); } .float-container { width: 100%; height: 100%; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none; }\n .float-container div * { width: 1em; height: 1em; }';
        containerStyle.innerHTML = containerStyleCss;
        document.head.appendChild(containerStyle);
    }

    var animationNameSuffix = "float";
    var globalCounter = 0;
    var styleCount = 0;
    var numKeyframes = 201;

    function floating(o) {
        var style;
        if (!o || typeof o !== "object") {
            o = {};
        }
        o.content = o.content || '\uD83D\uDC4C';//'👌'
        o.number = o.number || 1;
        o.duration = o.duration || 10;
        o.repeat = o.repeat || 1;//'infinite';
        o.direction = o.direction || 'normal';
        o.size = o.size || 2;
        o.width = o.width || 40;
        o.height = o.height || 300;
        o.left = o.left || "50%";
        o.top = o.top || "calc(100% - " + o.height + "px)";
        o.element = o.element || document.body;
        o.max = o.max || 20;

        if (styleCount >= o.max) {
            return;
        }
        var animationName = animationNameSuffix + globalCounter;

        var size = Array.isArray(o.size) 
            ? Math.floor(Math.random() * (o.size[1] - o.size[0] + 1)) + o.size[0] 
            : o.size;

        var start = Math.random() * numKeyframes / 5;
        var keyframes = ' @keyframes '+ animationName + ' { '+
            Array.apply(null, {
                length: numKeyframes + 1
            }).map(function(v, x) {
                return {
                    percent: 100 * x / numKeyframes,
                    width: o.width * Math.sin( (x + start) / 10),
                    height: o.height * (numKeyframes - x) / numKeyframes,
                    opacity: (x < numKeyframes / 2) ? 1 : 1 - (2*x/numKeyframes - 1)*(2*x/numKeyframes - 1),
                    size: size * (1 + 2 * (1 - (2*x/numKeyframes - 1)*(2*x/numKeyframes - 1)))
                }
            }).map(function(a) {
                return a.percent.toFixed(1) + '% { transform: translate(' + 
                    a.width.toFixed(1) + 'px, ' + 
                    a.height.toFixed(1) + 'px); opacity: ' +
                    a.opacity.toFixed(1) + '; font-size: '+
                    a.size.toFixed(1) + 'px; }\n';
            }).join('')+' }\n';

        var styleId = 'floating-style-'+ animationName;
        style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = keyframes;
        style.usageCount = 0;
        document.head.appendChild(style);
        styleCount++;
        

        var container = o.element.querySelector('.float-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'float-container';
            o.element.appendChild(container);
        }
        function createFloater(curAnimationName, curCssText) {
            var curStyle = document.getElementById('floating-style-'+ curAnimationName);
            if (curStyle) {
                curStyle.usageCount++;
                var floater = document.createElement('div');
                floater.innerHTML = o.content;
                floater.style.cssText = curCssText;
                var onAnimationEnd = function(event) {
                    if (event.animationName === curAnimationName) {
                        this.parentElement.removeChild(this);
                        if (!--curStyle.usageCount) {
                            document.head.removeChild(curStyle);
                            styleCount--;
                        };
                    }
                };
                floater.addEventListener('animationend', onAnimationEnd.bind(floater));
                container.appendChild(floater);
            }
        }
        for (var i = 0; i < o.number; i++) {
            var cssText = 'position: absolute; left: '+ o.left +
                '; top: '+ o.top +
                '; z-index: 1000; font-family: color-emoji; font-size: ' + size +
                'px; transform: translateY(-'+ o.height + (o.height * Math.random() / 10) +
                '); animation: ' + animationName + ' ' + o.duration +
                's linear ' + i * Math.random() + 's ' + o.repeat + ' ' + o.direction +
                '; margin-left: ' + o.width * Math.random() + 'px;';
            createFloater(animationName, cssText);
        }
        globalCounter++;
    }
    return floating;
})));
