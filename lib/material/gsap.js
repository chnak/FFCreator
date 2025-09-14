'use strict';

/**
 * GifMaterial
 * @class
 */

const { isBrowser } = require("browser-or-node");
const VideoMaterial = require('./video');
const Utils = require('../utils/utils');
const {videoExport} = require('../utils/gsap-video');
const { getRemote } = require("../utils/xhr");
const { createImageData } = require('../adapters/fabric-adapter');

class GsapMaterial extends VideoMaterial {

  async init(opts) {
    const { fps } = opts;
    this.disposal = 2; // use 2 as default
    this.fps = fps; // target fps
    this.canvas = this.initCanvas(this.conf.width, this.conf.height);
    this.canvasContext = this.canvas.getContext('2d');
    const imageData = [];
    const cacheDir=this.creator.getConf('cacheDir')
    const uid = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const  videoDetails= await videoExport({
      url: this.conf.url||null,
      html:this.conf.html||null,
      output:`${cacheDir}/gsap_${uid}.mp4`,
      color:this.conf.backgroundColor||"transparent",
      selector:this.conf.selector||null,
      duration:this.conf.duration||null,
      verbose:true,
      fps:fps,
      //advance:"timeweb",
      //headless:false,
      postProcess:async (imageBuffer)=>{
        const { pixels } = await Utils.getPixels(imageBuffer);
        if (!pixels || !pixels.shape || pixels.shape.length < 3) return;
        let shape = pixels.shape;
        if (shape.length > 3) shape = shape.slice(shape.length - 3);
        const width = this.info.width = shape[0];
        const height = this.info.height = shape[1];
        const buffer = new Uint8ClampedArray(pixels.data.buffer).slice(0, width*height*4);
        // this.imageData = new ImageData(buffer, width, height);
        const imgData = createImageData(buffer, width, height);
        imageData.push(imgData);
        return imageBuffer
      } 
	  })

    this.frames = videoDetails.frames
    
    this.length = this.info.duration = this.conf.duration||videoDetails.duration
    this.canvas = this.initCanvas(this.info.width, this.info.height);
    this.canvasContext = this.canvas.getContext('2d');

    this.imageData = [];
    for (let i = 0; i < imageData .length; i++) {
      // const canvas = this.initCanvas(this.conf.width, this.conf.height);
      // const ctx = canvas.getContext('2d');
      this.imageData.push(imageData[i]);
    }
  }



  async getFrameByTime(time) {
    const { width, height } = this.canvas || {};
    this.clearCanvas(); // 清空画布(上一帧)
    // 计算当前时间对应的原始帧索引（videoDetails 是 60fps）
    let index = Math.floor(time * 60);
    
    // 防止索引超出范围
    if (index >= this.imageData.length) {
      index = this.imageData.length - 1;
    }
    const imgData = this.imageData[index];
    if (imgData) this.drawCanvas(imgData, width, height);
    return imgData;
  }

  destroy() {
    super.destroy();
    this.imageData = null;
    this.frameInfo = null;
  }
}

module.exports = GsapMaterial;