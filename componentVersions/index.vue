<template>
  <div id="yes-image-viewer__wrap">
    <div class="yes-image-viewer__mask"></div>
    <span @click="close" class="yes-image-viewer__close yew-image-viewer__btn">
      <i></i>
    </span>
    <span @click="_prev" class="yes-image-viewer__prev yew-image-viewer__btn">
      <i></i>
    </span>
    <span @click="_next" class="yes-image-viewer__next yew-image-viewer__btn">
      <i></i>
    </span>
    <div class="yes-image-viewer__actions yew-image-viewer__btn">
      <div class="yes-image-viewer__actions__inner">
        <i @click="_handleActions('zoomOut')"></i>
        <i @click="_handleActions('zoomIn')"></i>
        <i></i>
        <i @click="_handleActions('clocelise')"></i>
        <i @click="_handleActions('anticlocelise')"></i>
      </div>
    </div>
    <div class="yes-image-viewer__canvas">
      <img :src="imgUrl" :style="imgStyle" @mousedown="handleMouseDown" />
    </div>
  </div>
</template>

<script>
import { on, off, isFirefox, rafThrottle } from "./utils";
const mousewheelEventName = isFirefox() ? "DOMMouseScroll" : "mousewheel";

import Bus from "./utils/bus";

export default {
  data() {
    return {
      initDetailUrl: "",
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false,
      },
      binding: null,
      currentIndex: 0,
      imgSrc: [],
    };
  },

  computed: {
    imgStyle() {
      const { scale, deg, offsetX, offsetY, enableTransition } = this.transform;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? "transform .3s" : "",
        "margin-left": `${offsetX}px`,
        "margin-top": `${offsetY}px`,
      };
      return style;
    },
    imgUrl() {
      return this.imgSrc[this.currentIndex];
    },
  },

  mounted() {
    this.handleMouse();
    Bus.$on("changeUrl", (target) => {
      this.binding = target.binding;
      this.initDetailUrl = target.initDetailUrl;
      this.imgSrc = this.binding.value || [this.initDetailUrl];

      for (let [i, v] of this.imgSrc.entries()) {
        if (this.initDetailUrl) {
          if (v == this.initDetailUrl) {
            this.currentIndex = i;
          }
        } else {
          this.currentIndex = 0;
        }
      }
    });
  },

  methods: {
    handleMouseDown(e) {
      const { offsetX, offsetY } = this.transform;
      const startX = e.pageX;
      const startY = e.pageY;
      this._dragHandler = rafThrottle((ev) => {
        this.transform.offsetX = offsetX + ev.pageX - startX;
        this.transform.offsetY = offsetY + ev.pageY - startY;
      });
      on(document, "mousemove", this._dragHandler);
      on(document, "mouseup", (ev) => {
        off(document, "mousemove", this._dragHandler);
      });
      e.preventDefault();
    },
    _handleActions(action, options = {}) {
      if (this.loading) return;
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options,
      };
      const { transform } = this;
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
    },
    _prev() {
      const len = this.imgSrc.length;
      this.currentIndex = (this.currentIndex - 1 + len) % len;
    },
    _next() {
      const len = this.imgSrc.length;
      this.currentIndex = (this.currentIndex + 1) % len;
    },
    handleMouse() {
      this._mouseWheelHandler = rafThrottle((e) => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
        if (delta > 0) {
          this._handleActions("zoomIn", {
            zoomRate: 0.015,
            enableTransition: false,
          });
        } else {
          this._handleActions("zoomOut", {
            zoomRate: 0.015,
            enableTransition: false,
          });
        }
      });

      on(document, mousewheelEventName, this._mouseWheelHandler);
    },
    close() {
      document.getElementById("yes-image-viewer__wrap").style.display = "none";
    },
  },
};
</script>

<style lang="less" scoped>@import "./style/index.less";</style>
