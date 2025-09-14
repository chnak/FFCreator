'use strict';

const puppeteer = require('puppeteer');
const FFImage = require('./image');
const { Sprite, Texture, Rectangle, createCanvas } = require('../adapters/fabric-adapter');

class FFPuppeteer extends FFImage {
  constructor(conf = {}) {
    super({ type: 'puppeteer', ...conf });

    this.animationHTML = conf.animationHTML || '';
    this.frameListeners = [];
    this.browser = null;
    this.page = null;
    this.isPlaying = false;
    this.frameRate = conf.frameRate || 60;
    this.transparentBackground = conf.transparentBackground || false;
  }

  /**
   * 设置动画HTML内容
   * @param {string} html - 包含动画的HTML内容
   */
  setAnimationHTML(html) {
    this.animationHTML = html;
  }
	
   createDisplay() {
    this.display = new Sprite(Texture.fromCanvas(createCanvas(1, 1)));
  }
  /**
   * 添加帧监听器
   * @param {function} listener - 帧数据处理函数
   */
  addFrameListener(listener) {
    this.frameListeners.push(listener);
  }

  /**
   * 移除帧监听器
   * @param {function} listener - 要移除的监听器
   */
  removeFrameListener(listener) {
    this.frameListeners = this.frameListeners.filter(l => l !== listener);
  }

  /**
   * 初始化动画渲染
   */
  async initAnimation() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    const [width, height] = this.getWH();
    
    await this.page.setViewport({ 
      width, 
      height,
      deviceScaleFactor: this.conf.deviceScaleFactor || 1
    });

    // 暴露接收帧数据的函数给浏览器环境
    await this.page.exposeFunction('sendFrameToNode', async (frameData) => {
      this.processFrameData(frameData);
    });

    // 注入自定义CSS确保透明背景
    const style = this.transparentBackground ? 
      `<style>body { background-color: transparent !important; margin: 0; }</style>` : '';

    await this.page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        ${style}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js"></script>
      </head>
      <body>
        ${this.animationHTML}
        <script>
          let lastFrameTime = 0;
          const frameInterval = ${1000 / this.frameRate};
          
          function captureFrame(timestamp) {
            if (!lastFrameTime) lastFrameTime = timestamp;
            const elapsed = timestamp - lastFrameTime;
            
            if (elapsed >= frameInterval) {
              // 捕获当前DOM状态
              const state = {
                timestamp,
                width: ${width},
                height: ${height},
                // 可以添加其他需要捕获的状态
              };
              
              // 或者使用截图方式
              html2canvas(document.body, {
                backgroundColor: ${this.transparentBackground ? 'null' : '#ffffff'},
                scale: ${this.conf.deviceScaleFactor || 1}
              }).then(canvas => {
                state.screenshot = canvas.toDataURL('image/png');
                window.sendFrameToNode(state);
              });
              
              lastFrameTime = timestamp;
            }
            requestAnimationFrame(captureFrame);
          }
          
          // 启动动画和捕获循环
          ${this.conf.animationJS || '// 默认动画脚本'}
          requestAnimationFrame(captureFrame);
        </script>
      </body>
      </html>
    `);
  }

  /**
   * 处理接收到的帧数据
   * @param {object} frameData - 帧数据
   */
  async processFrameData(frameData) {
    try {
      // 如果有截图数据，加载到canvas
      if (frameData.screenshot) {
        const img = await loadImage(frameData.screenshot);
        const canvas = createCanvas(frameData.width, frameData.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // 更新纹理
        if (this.display) {
          this.display.texture = Texture.fromCanvas(canvas);
        }
      }
      
      // 通知所有帧监听器
      this.frameListeners.forEach(listener => {
        listener(frameData, this);
      });
    } catch (err) {
      console.error('处理帧数据出错:', err);
    }
  }

  /**
   * 开始播放动画
   */
  async play() {
    if (!this.isPlaying) {
      await this.initAnimation();
      this.isPlaying = true;
    }
  }

  /**
   * 暂停动画
   */
  async pause() {
    if (this.isPlaying && this.page) {
      await this.page.evaluate(() => {
        window.__animationPaused = true;
        // 暂停GSAP动画
        if (window.gsap && window.gsap.globalTimeline) {
          window.gsap.globalTimeline.pause();
        }
      });
      this.isPlaying = false;
    }
  }

  /**
   * 恢复动画
   */
  async resume() {
    if (!this.isPlaying && this.page) {
      await this.page.evaluate(() => {
        window.__animationPaused = false;
        // 恢复GSAP动画
        if (window.gsap && window.gsap.globalTimeline) {
          window.gsap.globalTimeline.resume();
        }
      });
      this.isPlaying = true;
    }
  }

  /**
   * 跳转到指定时间点
   * @param {number} time - 时间点(毫秒)
   */
  async seek(time) {
    if (this.page) {
      await this.page.evaluate((t) => {
        // GSAP跳转实现
        if (window.gsap && window.gsap.globalTimeline) {
          window.gsap.globalTimeline.seek(t / 1000);
        }
      }, time);
    }
  }

  /**
   * 销毁资源
   */
  async destroy() {
    if (this.page) {
      await this.page.close().catch(() => {});
      this.page = null;
    }
    
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
    
    this.frameListeners = [];
    this.isPlaying = false;
    super.destroy();
  }
}

module.exports = FFPuppeteer;