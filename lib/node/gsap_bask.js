'use strict';

/**
 * FFGIfImage - A Component that supports gif animation
 *
 * ####Example:
 *
 *     const path = path.join(__dirname, './sun.gif');
 *     const gif = new FFGIfImage({ path, x: 320, y: 520 });
 *     gif.setSpeed(2);
 *
 * @class
 */

const { isBrowser } = require("browser-or-node");
const FFVideo = require('./video');
const Utils = require('../utils/utils');
const path = require('path');
class FFGsap extends FFVideo {

  constructor(conf) {
    super({ 
	type: 'gsap', 
	transparent: false,   
    chromaKey: '#000',    
    colorSimilarity: 0.2, 
	...conf });
	
  }

  async prepareMaterial() {
	console.log(111)
    await super.prepareMaterial();
  }

  async preProcessing() {
    const {videoExport}=await import('gsap-video-export')
	const cacheDir = this.rootConf('detailedCacheDir');
	//this.conf.cacheDir=cacheDir
	const cacheFile=`gsap_${this.id}.mp4`
	const res = await videoExport({
		url: this.conf.url,
		output:cacheFile,
		color:"transparent",
		selector:'svg'
	})
	
	console.log(res)
	
	this.conf.src=`${res.file}`
	await super.preProcessing();
  }


}

module.exports = FFGsap;
