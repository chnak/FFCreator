var Konva = require('konva');
const { JSDOM } = require('jsdom');
var Canvas = require('canvas');

Konva.window = {
  Image: Canvas.Image,
  devicePixelRatio: 1
};
Konva.document = {
  createElement: function() {},
  documentElement: {
    addEventListener: function() {}
  }
};
Konva.Util.createImageElement = function() {
  return new Image();
};
Konva.window = new JSDOM(
  '<!DOCTYPE html><html><head></head><body></body></html>'
).window;
Konva.document = Konva.window.document;
Konva.window.Image = Canvas.Image;
Konva._nodeCanvas = Canvas;


class NodeCanvasLoader {
  constructor() {
    this.resources = new Map();
    this.loading = false;
    this.queue = [];
    this.progressCallbacks = [];
  }

  /**
   * 添加资源到加载队列
   * @param {string|array|object} resources - 资源路径或配置对象
   * @return {Promise}
   */
  add(resources) {
    if (!Array.isArray(resources)) {
      resources = [resources];
    }

    const loadPromises = resources.map(resource => {
      const url = typeof resource === 'string' ? resource : resource.url;
      
      if (this.resources.has(url)) {
        return Promise.resolve(this.resources.get(url));
      }

      return new Promise((resolve, reject) => {
        this.queue.push({ url, resolve, reject });
        if (!this.loading) this._processQueue();
      });
    });

    return Promise.all(loadPromises);
  }

  /**
   * 处理加载队列
   */
  async _processQueue() {
    if (this.queue.length === 0) {
      this.loading = false;
      return;
    }

    this.loading = true;
    const { url, resolve, reject } = this.queue.shift();

    try {
      const image = await Canvas.loadImage(url);
      this.resources.set(url, image);
      
      // 触发进度回调
      const progress = this.resources.size / (this.resources.size + this.queue.length);
      this._fireProgress(progress);
      
      resolve(image);
    } catch (err) {
      reject(err);
    } finally {
      this._processQueue();
    }
  }

  /**
   * 触发进度回调
   */
  _fireProgress(progress) {
    this.progressCallbacks.forEach(cb => cb(progress));
  }

  /**
   * 注册进度回调
   */
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  /**
   * 获取已加载资源
   */
  get(url) {
    return this.resources.get(url);
  }

  /**
   * 销毁释放资源
   */
  destroy() {
    this.resources.clear();
    this.queue = [];
    this.progressCallbacks = [];
  }
}

module.exports = {Konva,Loader:NodeCanvasLoader};