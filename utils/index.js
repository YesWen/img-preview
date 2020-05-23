/*
 * @Author: your name
 * @Date: 2020-05-21 15:45:24
 * @LastEditTime: 2020-05-22 15:43:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \compontents\src\directives\utils\index.js
 */
import Vue from "vue";

const isServer = Vue.prototype.$isServer;


export const on = (function () {
    if (!isServer && document.addEventListener) {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.addEventListener(event, handler, false);
            }
        };
    } else {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.attachEvent('on' + event, handler);
            }
        };
    }
})();

export const off = (function () {
    if (!isServer && document.removeEventListener) {
        return function (element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, false);
            }
        };
    } else {
        return function (element, event, handler) {
            if (element && event) {
                element.detachEvent('on' + event, handler);
            }
        };
    }
})();


export const isFirefox = function () {
    return !isServer && !!window.navigator.userAgent.match(/firefox/i);
};

export function rafThrottle(fn) {
    let locked = false;
    return function (...args) {
        if (locked) return;
        locked = true;
        window.requestAnimationFrame(_ => {
            fn.apply(this, args);
            locked = false;
        });
    };
}

