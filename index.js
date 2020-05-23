/*
 * @Author: your name
 * @Date: 2020-05-21 15:27:19
 * @LastEditTime: 2020-05-23 11:36:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \compontents\src\directive\index.js
 */

import Vue from 'vue'

import './style/index.less'

import { on, off, isFirefox, rafThrottle } from './utils';

let Vm = new Vue();


const mousewheelEventName = isFirefox() ? "DOMMouseScroll" : "mousewheel";

Vm.$root.transform = {
    scale: 1,
    deg: 0,
    offsetX: 0,
    offsetY: 0,
    enableTransition: false,
}

window.handleMouseDown = (e) => {
    e.preventDefault();

    const { offsetX, offsetY } = Vm.$root.transform;

    const startX = e.pageX;
    const startY = e.pageY;

    const _dragHandler = rafThrottle((ev) => {
        Vm.$root.transform.offsetX = offsetX + ev.pageX - startX;
        Vm.$root.transform.offsetY = offsetY + ev.pageY - startY;

        e.target.style = imgStyle()
    });


    on(e.target, "mousemove", _dragHandler);

    on(document, "mouseup", (ev) => {
        off(e.target, "mousemove", _dragHandler);
    });

}

window._handleActions = (action, options = {}) => {

    const { zoomRate, rotateDeg, enableTransition } = { zoomRate: 0.2, rotateDeg: 90, enableTransition: true, ...options, };

    const { transform } = Vm.$root;

    switch (action) {
        case "zoomOut":
            if (transform.scale > 0.2) {
                transform.scale = parseFloat(
                    (transform.scale - zoomRate).toFixed(3)
                );
            }
            break;
        case "zoomIn":
            transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
            break;
        case "clocelise":
            transform.deg += rotateDeg;
            break;
        case "anticlocelise":
            transform.deg -= rotateDeg;
            break;
    }

    transform.enableTransition = enableTransition;

    Vm.$root.dom.img_canvas.style = imgStyle()
}

window._mouseWheelHandler = rafThrottle((e) => {
    const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
    if (delta > 0) {
        window._handleActions("zoomIn", {
            zoomRate: 0.015,
            enableTransition: false,
        });
    } else {
        window._handleActions("zoomOut", {
            zoomRate: 0.015,
            enableTransition: false,
        });
    }
});

const imgStyle = () => {

    const { scale, deg, offsetX, offsetY, enableTransition } = Vm.$root.transform;
    const style = `transform: scale(${scale}) rotate(${deg}deg);
    transition: enableTransition ? transform .3s : "";
    margin-left : ${offsetX}px;
    margin-top: ${offsetY}px`;
    return style;
}


export const imgPreview = {

    inserted(el, binding, vnode) {

        Vm.$root.dom = {
            wrap_el: '', preview_close: '', img_prev: '', img_next: '', img_canvas: '', imgSrc: '', currentIndex: 0
        }
        const _handleClick = () => {
            Vm.$root.dom.imgSrc = binding.value || [el.getAttribute('src')];

            for (let [i, v] of Vm.$root.dom.imgSrc.entries()) {
                if (el.getAttribute('src')) {
                    if (v == el.getAttribute('src')) {
                        Vm.$root.currentIndex = i
                    }
                } else {
                    Vm.$root.currentIndex = 0;
                }
            }

            if (Vm.$root.dom.wrap_el) {
                Vm.$root.dom.wrap_el.style.display = 'block';
                Vm.$root.dom.img_canvas.src = Vm.$root.dom.imgSrc[Vm.$root.currentIndex];
            } else {

                let imgWrap = document.createElement('div');

                imgWrap.id = 'yes-image-viewer__wrap';
                imgWrap.innerHTML = `
                <div class="yes-image-viewer__mask"></div>
                <span id="preview_close" class="yes-image-viewer__close yew-image-viewer__btn">
                    <i></i>
                </span>
                <span id="img_prev" class="yes-image-viewer__prev yew-image-viewer__btn">
                    <i></i>
                </span>
                <span id="img_next" class="yes-image-viewer__next yew-image-viewer__btn">
                    <i></i>
                </span>
                <div class="yes-image-viewer__actions yew-image-viewer__btn">
                    <div class="yes-image-viewer__actions__inner">
                        <i onclick="_handleActions('zoomOut')"></i>
                        <i onclick="_handleActions('zoomIn')"></i>
                        <i></i>
                        <i onclick="_handleActions('clocelise')"></i>
                        <i onclick="_handleActions('anticlocelise')" ></i>
                    </div>
                </div>
                <div class="yes-image-viewer__canvas" >
                    <img src="${Vm.$root.dom.imgSrc[Vm.$root.currentIndex]}"  id="img-canvas" onmousedown="handleMouseDown(event)"  />
                </div>
                `
                document.body.appendChild(imgWrap);
                Vm.$root.dom.wrap_el = document.getElementById('yes-image-viewer__wrap');
                Vm.$root.dom.preview_close = document.getElementById('preview_close');
                Vm.$root.dom.img_prev = document.getElementById('img_prev');
                Vm.$root.dom.img_next = document.getElementById('img_next');
                Vm.$root.dom.img_canvas = document.getElementById('img-canvas');

                on(Vm.$root.dom.preview_close, 'click', _close);
                on(Vm.$root.dom.img_prev, 'click', _prev);
                on(Vm.$root.dom.img_next, 'click', _next);
                on(Vm.$root.dom.wrap_el, mousewheelEventName, _mouseWheelHandler);

            }

        }

        const _close = (e) => {
            Vm.$root.dom.wrap_el.style.display = 'none';
        }

        const _prev = () => {
            if (Vm.$root.currentIndex == 0 || Vm.$root.dom.imgSrc.length == 1) return
            Vm.$root.currentIndex--
            Vm.$root.dom.img_canvas.src = Vm.$root.dom.imgSrc[Vm.$root.currentIndex];
        }
        const _next = () => {
            let currentIndex = Vm.$root.currentIndex + 1
            if (currentIndex > Vm.$root.dom.imgSrc.length - 1) return
            Vm.$root.currentIndex++
            Vm.$root.dom.img_canvas.src = Vm.$root.dom.imgSrc[Vm.$root.currentIndex];
        }
        on(el, 'click', _handleClick);
    },
    unbind() { }

}