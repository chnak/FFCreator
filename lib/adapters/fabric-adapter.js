'use strict';

/**
 * Fabric.js适配器 - 将InkPaint API映射到Fabric.js
 * 提供与InkPaint兼容的接口，便于渐进式迁移
 */

const fabric = require('fabric/node');
const { createCanvas, createImageData } = require('canvas');

class FabricAdapter {
  constructor(width, height, options = {}) {
    this.width = width;
    this.height = height;
    this.canvas = new fabric.StaticCanvas(null, { width, height });
    this.stage = new (class extends fabric.Group {
      constructor(objects, options) {
        super(objects, options);
        this.children = this._objects; // 添加children属性
      }
      
      addChild(child) {
        this.add(child);
        this.children = this._objects; // 更新children属性
      }
      
      addChildAt(child, index) {
        this.add(child);
        this.children = this._objects; // 更新children属性
        // Fabric.js没有直接的索引插入，这里简化处理
      }
      
      removeChild(child) {
        this.remove(child);
        this.children = this._objects; // 更新children属性
      }
      
      getAttr(key) {
        return this.get(key);
      }
    })([], {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top'
    });
    this.renderer = {
      resize: (w, h) => {
        this.width = w;
        this.height = h;
        this.canvas.setDimensions({ width: w, height: h });
      },
      _backgroundColorString: '#000000'
    };
  }

  // 创建应用实例（对应InkPaint的Application）
  createApplication(options = {}) {
    const { width = 800, height = 600 } = options;
    this.width = width;
    this.height = height;
    this.canvas = new fabric.StaticCanvas(null, { width, height });
    return this;
  }

  // 创建Canvas（对应InkPaint的createCanvas）
  createCanvas(width, height) {
    return createCanvas(width, height);
  }

  // 创建ImageData（对应InkPaint的createImageData）
  createImageData(width, height) {
    return createImageData(width, height);
  }

  // 创建文本对象（对应InkPaint的Text）
  createText(text, style = {}) {
    return new fabric.FabricText(text, {
      left: style.x || 0,
      top: style.y || 0,
      fontSize: style.fontSize || 16,
      fontFamily: style.fontFamily || 'Arial',
      fill: style.fill || '#000000',
      textAlign: style.textAlign || 'left',
      originX: 'left',
      originY: 'top'
    });
  }

  // 创建精灵对象（对应InkPaint的Sprite）
  createSprite(texture) {
    if (texture && texture._canvas) {
      return new fabric.FabricImage(texture._canvas);
    }
    return new fabric.FabricImage();
  }

  // 创建纹理（对应InkPaint的Texture）
  createTexture(canvas) {
    return new fabric.FabricImage(canvas);
  }

  // 创建容器（对应InkPaint的Container）
  createContainer() {
    return new fabric.Group([], {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top'
    });
  }

  // 创建图形对象（对应InkPaint的Graphics）
  createGraphics() {
    return new fabric.Path('', {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top'
    });
  }

  // 创建RenderTexture（对应InkPaint的RenderTexture）
  createRenderTexture(options = {}) {
    const canvas = createCanvas(options.width || 100, options.height || 100);
    return new fabric.FabricImage(canvas);
  }

  // 创建矩形（对应InkPaint的Rectangle）
  createRectangle(options = {}) {
    return new fabric.Rect({
      left: options.x || 0,
      top: options.y || 0,
      width: options.width || 100,
      height: options.height || 100,
      fill: options.fill || '#000000',
      originX: 'left',
      originY: 'top'
    });
  }

  // 渲染场景
  render(displayObject) {
    if (this.canvas) {
      this.canvas.clear();
      if (displayObject) {
        this.canvas.add(displayObject);
      }
      this.canvas.renderAll();
    }
  }

  // 获取渲染结果
  getView() {
    if (this.canvas) {
      return this.canvas.getNodeCanvas();
    }
    return null;
  }
  
  // 添加view属性
  get view() {
    return this.getView();
  }

  // 销毁应用
  destroy() {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }

  // 设置背景色
  setBackgroundColor(color) {
    if (this.canvas) {
      this.canvas.setBackgroundColor(color, () => {
        this.canvas.renderAll();
      });
    }
  }

  // 调整大小
  resize(width, height) {
    if (this.canvas) {
      this.canvas.setDimensions({ width, height });
      this.width = width;
      this.height = height;
    }
  }
}

// 导出兼容InkPaint的API
module.exports = {
  // 主要类
  Application: FabricAdapter,
  Text: class extends fabric.FabricText {
    constructor(text = '', options = {}) {
      // 确保有默认的位置
      const defaultOptions = {
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        ...options
      };
      super(text, defaultOptions);
      this.text = text;
      this.scale = {
        set: (x, y) => {
          this.set({ scaleX: x, scaleY: y });
        }
      };
      this.anchor = { 
        x: 0, 
        y: 0,
        set: (x, y) => {
          this.anchor.x = x;
          this.anchor.y = y;
        }
      };
    }
    
    getAnchor() {
      return this.anchor;
    }
    
    setAnchor(x, y) {
      this.anchor = { x, y };
    }
    
    updateStyle() {
      // Fabric.js中样式更新通过set方法实现
      // 这里简化处理
    }
    
    substitute(other) {
      // 替换对象的方法
      Object.assign(this, other);
    }
    
    updateText() {
      // 更新文本的方法
      // Fabric.js中文本更新通过set方法实现
    }
    
    destroy() {
      // 销毁对象的方法
      // Fabric.js中不需要特殊的销毁处理
    }
  },
  Sprite: class extends fabric.FabricImage {
    constructor(image, options = {}) {
      super(image, options);
      this.texture = image; // 设置texture属性
      // 如果texture没有destroy方法，添加一个
      if (this.texture && !this.texture.destroy) {
        this.texture.destroy = () => {};
      }
      this.scale = {
        set: (x, y) => {
          this.set({ scaleX: x, scaleY: y });
        }
      };
      this.anchor = { 
        x: 0, 
        y: 0,
        set: (x, y) => {
          this.anchor.x = x;
          this.anchor.y = y;
        }
      };
    }
    
    getAnchor() {
      return this.anchor;
    }
    
    setAnchor(x, y) {
      this.anchor = { x, y };
    }
    
    setColorMatrix(colorConf, alpha = 1) {
      // Fabric.js中颜色调整可以通过filters实现
      // 这里简化处理，直接设置透明度
      if (alpha !== 1) {
        this.set({ opacity: alpha });
      }
    }
    
    attr(attrs) {
      this.set(attrs);
    }
    
    getAttr(key) {
      return this.get(key);
    }
  },
  Texture: class extends fabric.FabricImage {
    static fromCanvas(canvas) {
      return new fabric.FabricImage(canvas);
    }
    
    destroy(removeTexture) {
      // Fabric.js中不需要特殊的销毁处理
      // 这里简化处理
    }
  },
  Container: class extends fabric.Group {
    constructor(objects, options) {
      super(objects, options);
      this.children = this._objects; // 添加children属性
    }
    
    addChild(child) {
      this.add(child);
      this.children = this._objects; // 更新children属性
    }
    
    addChildAt(child, index) {
      this.add(child);
      this.children = this._objects; // 更新children属性
      // Fabric.js没有直接的索引插入，这里简化处理
    }
    
    removeChild(child) {
      this.remove(child);
      this.children = this._objects; // 更新children属性
    }
  },
  Graphics: fabric.Path,
  Rectangle: fabric.Rect,
  Group: class extends fabric.Group {
    constructor(objects, options) {
      super(objects, options);
      this.children = this._objects; // 添加children属性
    }
    
    addChild(child) {
      this.add(child);
      this.children = this._objects; // 更新children属性
    }
    
    addChildAt(child, index) {
      this.add(child);
      this.children = this._objects; // 更新children属性
      // Fabric.js没有直接的索引插入，这里简化处理
    }
    
    removeChild(child) {
      this.remove(child);
      this.children = this._objects; // 更新children属性
    }
  },
  Path: fabric.Path,
  Rect: fabric.Rect,
  FabricImage: fabric.FabricImage,
  FabricText: fabric.FabricText,
  RenderTexture: fabric.FabricImage,

  // 工具函数
  createCanvas,
  createImageData,
  createFabricCanvas: (options) => new fabric.StaticCanvas(null, options),

  // 渲染器
  WebGLRenderer: class {
    constructor(options) {
      this.width = options.width;
      this.height = options.height;
      this.canvas = new fabric.StaticCanvas(null, options);
    }
    
    render(displayObject) {
      this.canvas.clear();
      if (displayObject) {
        this.canvas.add(displayObject);
      }
      this.canvas.renderAll();
    }
    
    get view() {
      return this.canvas.getNodeCanvas();
    }
    
    destroy() {
      this.canvas.dispose();
    }
  },

  CanvasRenderer: class {
    constructor(options) {
      this.width = options.width;
      this.height = options.height;
      this.canvas = new fabric.StaticCanvas(null, options);
    }
    
    render(displayObject) {
      this.canvas.clear();
      if (displayObject) {
        this.canvas.add(displayObject);
      }
      this.canvas.renderAll();
    }
    
    get view() {
      return this.canvas.getNodeCanvas();
    }
    
    destroy() {
      this.canvas.dispose();
    }
  },

  // 其他工具
  utils: {
    // 颜色工具
    hex2string: (hex) => hex,
    string2hex: (str) => str,
    rgb2hex: (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`,
    hex2rgb: (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }
  },

  // 混合模式（简化实现）
  BLEND_MODES: {
    NORMAL: 'normal',
    ADD: 'add',
    MULTIPLY: 'multiply',
    SCREEN: 'screen',
    OVERLAY: 'overlay'
  },

  // 设置
  settings: {
    PRECISION: 2,
    RESOLUTION: 1,
    ANISOTROPIC_LEVEL: 0
  },

  // 加载器（简化实现）
  Loader: class {
    constructor() {
      this.resources = new Map();
    }
    
    add(name, url) {
      return new Promise((resolve, reject) => {
        fabric.util.loadImage(url)
          .then(img => {
            this.resources.set(name, img);
            resolve(img);
          })
          .catch(reject);
      });
    }
    
    load() {
      return Promise.resolve();
    }
    
    destroy() {
      // 清理资源
      this.resources.clear();
    }
  },

  // 清理缓存
  destroyAndCleanAllCache: () => {
    // Fabric.js不需要特殊的缓存清理
  },

  // ProxyObj - 用于代理对象
  ProxyObj: class {
    constructor(target) {
      this.target = target;
      return new Proxy(this, {
        get(target, prop) {
          if (prop in target) {
            return target[prop];
          }
          return target.target[prop];
        },
        set(target, prop, value) {
          if (prop in target) {
            target[prop] = value;
          } else {
            target.target[prop] = value;
          }
          return true;
        }
      });
    }
  },

  // gl - WebGL上下文（简化实现）
  gl: {
    // 这里可以添加基本的WebGL功能
    // 由于Fabric.js主要使用2D Canvas，这里提供兼容接口
  }
};
