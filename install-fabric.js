#!/usr/bin/env node

/**
 * 安装Fabric.js依赖并测试迁移
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('开始安装Fabric.js依赖...');

try {
  // 检查package.json是否存在
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json文件不存在');
  }

  // 读取package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 检查是否已经安装了fabric
  if (packageJson.dependencies && packageJson.dependencies.fabric) {
    console.log('✓ Fabric.js依赖已存在');
  } else {
    console.log('正在安装Fabric.js...');
    execSync('npm install fabric@^6.5.4', { stdio: 'inherit' });
    console.log('✓ Fabric.js安装完成');
  }

  // 检查node_modules是否存在fabric
  const fabricPath = path.join(__dirname, 'node_modules', 'fabric');
  if (fs.existsSync(fabricPath)) {
    console.log('✓ Fabric.js模块验证成功');
  } else {
    throw new Error('Fabric.js模块未找到');
  }

  console.log('✓ 依赖安装完成！');
  console.log('现在可以运行测试: node test-fabric-migration.js');

} catch (error) {
  console.error('❌ 安装失败:', error.message);
  process.exit(1);
}
