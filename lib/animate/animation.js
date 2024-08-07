'use strict';

/**
 * FFAnimation - The class used to animate the display element
 *
 * ####Example:
 *
 *     const animation = new FFAnimation({ ...animation, parent });
 *     animation.start();
 *     animation.stop();
 *
 *
 * ####Note:
 *     Easeing function
 *     Type In-Out-InOut
 *     Ease Quadratic Cubic Quartic Quintic Exponential Circular Elastic Back Bounce
 *
 * @class
 */

const get = require('lodash/get');
const clone = require('lodash/clone');
const FFBase = require('../core/base');
const Utils = require('../utils/utils');
const DateUtil = require('../utils/date');
const { isBrowser } = require("browser-or-node");
const TWEEN = require(isBrowser ? '@tweenjs/tween.js/dist/tween.umd' : '@tweenjs/tween.js');

class FFAnimation extends FFBase {
  constructor(conf = { time: 0.7, delay: 0, ease: 'Linear.None' }) {
    super({ type: 'animation' });

    const { from, to, type, time = .7, delay = 0, ease = 'Linear.None', parent } = conf;

    this.baseAttr = {};
    for (const key of Object.keys(from)) {
      this.baseAttr[key] = parent.display.getAttr(key);
    }

    this.from = this.adjustAttr(from);
    this.to = this.adjustAttr(to);
    this.origFrom = clone(this.from); // 记录最初的from，用于seek
    this.to.type = type; // FFAnimations.getDurationTime will use to.type=='out' to detect
    this.ease = ease;
    this.parent = parent;
    this.proxyAttr = {};
    this.isFFAni = true;
    this.autoAlpha = false;

    this.absTimeOffset = 0;
    this.time = DateUtil.toMilliseconds(time);
    this.delay = DateUtil.toMilliseconds(delay);
    this.tweenGroup = this.root().tweenGroup;
  }

  /**
   * 动画开始的绝对时间
   * @return {Number} absolute start time in ms
   * @private
   */
  startTime() {
    if (this._startTime) return this._startTime;
    return this._startTime = (this.absTimeOffset + this.delay) >> 0;
  }

  /**
   * 当前动画是否可以开始
   * @return {Boolean} may this animation start (after delay set)
   * @private
   */
  mayStart() {
    // console.log(this.parent.id, 'ani.mayStart', this.tweenGroup.now(), '>', this.startTime());
    return this.tweenGroup.now() > this.startTime();
  }

  adjustAttr(attr) {
    for (const key of Object.keys(this.baseAttr)) {
      if ((key in attr) && ['scale', 'alpha'].includes(key)) {
        attr[key] *= this.baseAttr[key];
      }
    }
    return attr;
  }

  async apply(display, absTime) {
    // todo: 更轻的实现？
    return new Promise((resolve) => {
      const tweenGroup = new TWEEN.Group();
      tweenGroup.now = () => 0;
      const { origFrom, to } = this.getFromTo();
      const _from = clone(origFrom);
      const _to = clone(to);
      const ease = get(TWEEN.Easing, this.ease);
      const startTime = this.startTime();
      if (absTime <= startTime) {
        display.attr(_from);
      } else if (absTime >= startTime + this.time) {
        display.attr(_to);
      } else {
        const applyTween = new TWEEN.Tween(_from, tweenGroup)
          .to(_to, this.time)
          .delay(this.startTime())
          .easing(ease)
          .onStart(() => {
            if (this.autoAlpha && from.alpha === undefined) display.alpha = 1;
          })
          .onUpdate((obj) => {
            resolve(display.attr(obj));
          });
        applyTween.start();
        applyTween._startTime = this.startTime();
        tweenGroup.update(absTime);
      }
      tweenGroup.removeAll();
    })
  }

  init() {
    // offset by node absolute startTime
    this.absTimeOffset = DateUtil.toMilliseconds(this.parent.absStartTime);
    const startTime = this.startTime();

    const { from, to } = this.getFromTo();
    const ease = get(TWEEN.Easing, this.ease);
    this.complement(from, to);
    this.proxyAttr = clone(from);

    this.tween = new TWEEN.Tween(from, this.tweenGroup)
      .to(to, this.time)
      .delay(startTime)
      .easing(ease)
      .onStart(() => {
        if (this.autoAlpha) {
          const { display } = this.parent;
          if (from.alpha === undefined) display.alpha = 1;
        }

        this.emit('start');
      })
      .onUpdate(() => {
        if (!this.proxyAttr) return;
        // console.log(this.parent.id, 'ani.onUpdate', this.proxyAttr, from);
        const { display } = this.parent;
        this.copyAndResetAttr(this.proxyAttr, from);
        display.attr(this.proxyAttr);
      })
      .onComplete(() => {
        this.emit('complete', this);
      });
  }

  /**
   * Clone node attributes to proxy objects
   * @param {object} proxy - the proxy object
   * @param {object} source - the source object
   * @private
   */
  copyAndResetAttr(proxy, source) {
    this.copyAttr(proxy, source);

    // reset alpha
    const alpha = source.alpha;
    if (alpha !== undefined) {
      proxy.alpha = Utils.floor(source.alpha, 2);
      proxy.alpha = Math.max(proxy.alpha, 0);
      proxy.alpha = Math.min(proxy.alpha, 1);
    }

    // reset x y
    // const { x, y } = source;
    // const { offsetX, offsetY } = this.parent;
    // if (x !== undefined) {
    //   proxy.x = proxy.x + offsetX;
    // }
    // if (y !== undefined) {
    //   proxy.y = proxy.y + offsetY;
    // }

    return proxy;
  }

  /**
   * Set attributes to display object
   * @private
   */
  setAttr() {
    const { display } = this.parent;
    const { origFrom, to } = this.getFromTo(); // 初始化设置用 origFrom
    this.complement(origFrom, to);
    this.copyAndResetAttr(this.proxyAttr, origFrom);
    // console.log(this.parent.id, 'ani.setAttr', this.proxyAttr, origFrom);
    display.attr(this.proxyAttr);
  }

  /**
   * Complement two object attributes, align from and to
   * @param {object} from - tween from attributes
   * @param {object} to - tween to attributes
   * @private
   */
  complement(from, to) {
    const { display } = this.parent;
    for (let key in from) {
      if (to[key] === undefined && key !== 'type') {
        to[key] = display.getAttr(key);
      }
    }

    for (let key in to) {
      if (from[key] === undefined && key !== 'type') {
        from[key] = display.getAttr(key);
      }
    }
  }

  /**
   * Get the animation properties of from and to
   * @private
   */
  getFromTo() {
    const { display } = this.parent;
    const from = this.from || this.cloneFromSprite(display);
    const origFrom = this.origFrom || this.cloneFromSprite(display);
    const to = this.to || this.cloneFromSprite(display);
    return { from, to, origFrom };
  }

  /**
   * Start this animation
   * @public
   */
  start() {
    // tween.start(time)不支持绝对开始时间，写死了 _startTime = time(默认now) + delay
    this.tween.start();
    // 这里是强制设置它的开始时间(ms)，实现seek的需求
    this.tween._startTime = this.startTime();
    // console.log('ani.start', this.parent.id, this.tween);
  }

  /**
   * Stop this animation
   * @public
   */
  stop() {
    this.tween.stop();
  }

  /**
   * cloneFromSprite - clone the ffnode instance
   * @public
   */
  cloneFromSprite(target) {
    const node = {
      x: target.x,
      y: target.y,
      alpha: target.alpha,
      rotation: target.rotation,
      scale: target.scale.x,
    };

    return node;
  }

  copyAttr(a, b) {
    for (let key in b) {
      a[key] = b[key];
    }
  }

  destroy() {
    this.stop();
    this.proxyAttr = null;
    this.tween = null;
    this.parent = null;
    this.from = null;
    this.to = null;

    super.destroy();
  }
}

module.exports = FFAnimation;
