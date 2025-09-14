# FFCreator InkPaint 到 Fabric.js 迁移指南

## 迁移概述

本项目已成功将渲染引擎从 InkPaint 迁移到 Fabric.js，以提供更好的维护性和功能扩展性。

## 主要变更

### 1. 依赖更新
- **移除**: `inkpaint` (v2.7.1)
- **添加**: `fabric` (v6.5.4)

### 2. 适配器层
创建了 `lib/adapters/fabric-adapter.js` 适配器层，提供与 InkPaint 兼容的 API 接口：

```javascript
// 主要类映射
Application -> FabricAdapter
Text -> fabric.FabricText
Sprite -> fabric.FabricImage
Texture -> fabric.FabricImage
Container -> fabric.Group
Graphics -> fabric.Path
Rectangle -> fabric.Rect
```

### 3. 文件更新
以下文件已更新为使用 Fabric.js 适配器：

#### 核心文件
- `lib/creator.js` - 主创建器
- `lib/core/renderer.js` - 渲染器
- `lib/core/clip.js` - 剪辑基类
- `lib/index.js` - 主入口

#### 工具文件
- `lib/utils/render.js` - 渲染工具
- `lib/utils/webgl-2d.js` - WebGL工具
- `lib/utils/opencv.js` - OpenCV工具
- `lib/utils/gl.js` - GL工具
- `lib/utils/color.js` - 颜色工具
- `lib/utils/canvas.js` - Canvas工具

#### 节点组件
- `lib/node/text.js` - 文本组件
- `lib/node/image.js` - 图像组件
- `lib/node/scene.js` - 场景组件
- `lib/node/graphic.js` - 图形组件
- 以及其他所有节点组件...

#### 材质文件
- `lib/material/image.js` - 图像材质
- `lib/material/text.js` - 文本材质
- 以及其他所有材质文件...

## 安装和测试

### 1. 安装依赖
```bash
node install-fabric.js
```

### 2. 运行测试
```bash
node test-fabric-migration.js
```

## API 兼容性

### 基本使用
```javascript
const FFCreator = require('./lib/creator');
const FFText = require('./lib/node/text');
const FFScene = require('./lib/node/scene');

// 创建创建器
const creator = new FFCreator({
  width: 800,
  height: 600,
  fps: 30
});

// 创建场景
const scene = new FFScene({
  width: 800,
  height: 600,
  duration: 3
});

// 创建文本
const text = new FFText({
  text: 'Hello Fabric.js!',
  x: 400,
  y: 300,
  style: {
    fontSize: 48,
    fill: '#ffffff'
  }
});

// 添加到场景
scene.addChild(text);
creator.addChild(scene);
```

## 性能优化

### 1. 静态Canvas
使用 `fabric.StaticCanvas` 而不是交互式Canvas，提高渲染性能。

### 2. 对象池
建议实现对象池模式来重用Fabric对象，减少GC压力。

### 3. 批量渲染
将多个操作合并为单次渲染调用。

## 已知限制

1. **WebGL支持**: Fabric.js主要使用2D Canvas，WebGL功能有限
2. **性能**: 对于大量对象的场景，可能需要优化
3. **API差异**: 某些InkPaint特有的API可能需要额外适配

## 故障排除

### 常见问题

1. **模块未找到错误**
   ```bash
   npm install fabric@^6.5.4
   ```

2. **渲染错误**
   - 检查适配器层是否正确导入
   - 验证Fabric对象创建参数

3. **性能问题**
   - 使用静态Canvas
   - 减少不必要的对象创建
   - 实现对象池

## 迁移优势

1. **统一技术栈**: 与editly项目保持一致
2. **更好的维护性**: Fabric.js社区更活跃
3. **功能扩展性**: 提供更丰富的图形功能
4. **代码复用**: 可以在项目间共享组件

## 后续计划

1. 性能优化和测试
2. 添加更多Fabric.js特有功能
3. 完善WebGL支持
4. 优化内存使用

## 支持

如有问题，请检查：
1. 依赖是否正确安装
2. 适配器层是否正确配置
3. 测试文件是否正常运行
