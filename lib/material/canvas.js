'use strict';

/**
 * ImageMaterial
 * @class
 */

const Material = require('./material');
const { isBrowser } = require("browser-or-node");
const { getRemote } = require("../utils/xhr");
const { getPixels } = require('../utils/utils');
const { utils, createCanvas, createImageData } = require('inkpaint/lib/index');
const StackBlur = require('stackblur-canvas');
class CanvasMaterial extends Material {

  async init() {
    const width = this.info.width = this.conf.width
    const height = this.info.height = this.conf.height
    this.canvas = this.initCanvas(width, height);
    this.canvasContext = this.canvas.getContext('2d');
  }




  initCanvas(w, h) {
    return createCanvas(w, h);
  }

  clearCanvas() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }


  width() {
    // todo: 处理 crop rect 逻辑
    return this.info.width || 0;
  }

  height() {
    return this.info.height || 0;
  }

  destroy() {
    super.destroy();
    if (this.tmpCanvas) {
      this.tmpCanvas = null;
      this.tmpCanvasContext = null;
    }
  }
}

module.exports =  CanvasMaterial;