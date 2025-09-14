'use strict';

/**
 * 简单测试 - 只测试基本功能
 */

const FFCreator = require('./lib/creator');
const FFText = require('./lib/node/text');
const FFScene = require('./lib/node/scene');

async function testSimple() {
  console.log('开始简单测试...');
  
  try {
    // 创建FFCreator实例
    const creator = new FFCreator({
      width: 400,
      height: 300,
      fps: 30,
      log: true
    });

    console.log('✓ FFCreator实例创建成功');

    // 创建场景
    const scene = new FFScene({
      width: 400,
      height: 300,
      duration: 2
    });

    console.log('✓ FFScene创建成功');

    // 创建文本组件
    const text = new FFText({
      text: 'Hello!',
      x: 200,
      y: 150,
      style: {
        fontSize: 32,
        fill: '#ffffff',
        textAlign: 'center'
      }
    });

    console.log('✓ FFText创建成功');

    // 添加文本到场景
    scene.addChild(text);
    console.log('✓ 文本添加到场景成功');

    // 添加场景到创建器
    creator.addChild(scene);
    console.log('✓ 场景添加到创建器成功');

    // 测试渲染
    console.log('开始测试渲染...');
    
    creator.start();
    
    creator.on('start', () => {
      console.log('✓ 渲染开始');
    }).on('error', e => {
      console.error('❌ 渲染错误:', e.message);
    }).on('progress', e => {
      let number = e.percent || 0;
      console.log(`✓ 渲染进度: ${(number * 100) >> 0}%`);
    }).on('complete', e => {
      console.log(`✓ 渲染完成: ${e.output}`);
      console.log('✓ 简单测试通过！');
    });

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testSimple();
