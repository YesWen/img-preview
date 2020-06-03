import Vue from 'vue'
import { on } from './utils';
import preview from './index.vue'

import Bus from './utils/bus'

let PreviewConstructor = Vue.extend(preview);

const CreateDom = function (el, binding) {
    const previewDom = new PreviewConstructor({
        el: document.createElement('div'),
        data: {
            initDetailUrl: el.getAttribute("src"),
            binding: binding
        }
    })
    return document.body.appendChild(previewDom.$el)

}
CreateDom.getSingle = (() => {
    let instance;
    return (el, binding) => {
        if (!instance) {
            instance = new CreateDom(el, binding)
        }
        return instance
    }
})()
export const imgPreview = {
    inserted(el, binding, vnode) {
        const _handleClick = () => {
            let preview = CreateDom.getSingle(el, binding);
            Bus.$emit('changeUrl', { binding, initDetailUrl: el.getAttribute("src"), })
            preview.style = 'block';
        }
        on(el, 'click', _handleClick);
    },
}