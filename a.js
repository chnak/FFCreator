const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class TextAnimationCapturer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.templateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Text Animation Capture</title>
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background-color: transparent;
                }
                #animation-container {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .text-element {
                    position: absolute;
                    color: #fff;
                    white-space: pre-wrap;
                    will-change: transform, opacity;
                }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js"></script>
        </head>
        <body>
            <div id="animation-container"></div>
            <script>
                function applyAnimation(element, config) {
                    const tl = gsap.timeline();
                    
                    // 初始样式
                    gsap.set(element, {
                        fontSize: config.fontSize || '20px',
                        color: config.color || '#fff',
                        opacity: 0,
                        fontFamily: config.fontFamily || 'Arial, sans-serif',
                        lineHeight: config.lineHeight || 'normal',
                        letterSpacing: config.letterSpacing || 'normal',
                        textShadow: config.shadow ? \`0 0 \${config.shadow.offset || '0px'} rgba(0,0,0,\${config.shadow.alpha || 1})\` : 'none',
                        textStroke: config.stroke ? \`\${config.stroke.size || 0}px \${config.stroke.color || '#000'}\` : 'none',
                        textAlign: 'center'
                    });
                    
                    // 基础动画 - 淡入
                    tl.to(element, {
                        opacity: 1,
                        duration: 0.5
                    });
                    
                    // 应用额外效果
                    if (config.effect && config.effect.length > 0) {
                        config.effect.forEach(effect => {
                            switch(effect.name) {
                                case 'zoomOutDown':
                                    tl.to(element, {
                                        scale: 0,
                                        y: '+=100',
                                        opacity: 0,
                                        duration: effect.time || 0.5,
                                        ease: "power1.in"
                                    }, effect.delay || 0);
                                    break;
                                case 'fadeIn':
                                    tl.fromTo(element, {opacity: 0}, {opacity: 1, duration: effect.time || 0.5}, effect.delay || 0);
                                    break;
                                case 'bounceIn':
                                    tl.from(element, {
                                        y: -100,
                                        opacity: 0,
                                        scale: 0.5,
                                        duration: effect.time || 0.5,
                                        ease: "bounce.out"
                                    }, effect.delay || 0);
                                    break;
                                // 可以添加更多效果...
                                default:
                                    console.warn('Unknown effect:', effect.name);
                            }
                        });
                    }
                    
                    return tl;
                }
                
                async function setupAnimation(config) {
                    const container = document.getElementById('animation-container');
                    container.innerHTML = '';
                    
                    const element = document.createElement('div');
                    element.className = 'text-element';
                    element.textContent = config.text;
                    
                    container.appendChild(element);
                    
                    const timeline = applyAnimation(element, config);
                    
                    return {
                        element,
                        timeline
                    };
                }
                
                window.renderAnimation = async (config) => {
                    const { timeline } = await setupAnimation(config);
                    return new Promise(resolve => {
                        timeline.eventCallback('onComplete', () => {
                            resolve();
                        });
                    });
                };
                
                window.getAnimationProgress = () => {
                    return gsap.globalTimeline.progress();
                };
                
                window.setAnimationProgress = (progress) => {
                    gsap.globalTimeline.progress(progress);
                };
            </script>
        </body>
        </html>
        `;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        await this.page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        });
        
        await this.page.setContent(this.templateHTML);
    }

    async captureTextAnimation(config, options = {}) {
        if (!this.browser || !this.page) {
            await this.initialize();
        }

        const {
            duration = 3,         // 动画总时长(秒)
            fps = 30,             // 帧率
            outputDir = 'frames', // 输出目录
            format = 'png',       // 图片格式
            quality = 80          // 图片质量(0-100)
        } = options;

        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 注入配置并设置动画
        await this.page.evaluate((config) => {
            return window.renderAnimation(config);
        }, config);

        const totalFrames = Math.ceil(duration * fps);
        const frameInterval = 1 / fps;
        const screenshots = [];

        for (let i = 0; i <= totalFrames; i++) {
            const progress = i / totalFrames;
            
            // 设置动画进度
            await this.page.evaluate((progress) => {
                window.setAnimationProgress(progress);
            }, progress);

            // 截图
            const timestamp = (i * frameInterval).toFixed(3);
            const screenshotPath = path.join(outputDir, `frame_${i.toString().padStart(4, '0')}_${timestamp}s.${format}`);
			options.selector=options.selector||"#animation-container"
			const el = options.selector === 'document' ? page : await this.page.$(options.selector);
			 
			const screenshot = await el.screenshot({ path: screenshotPath, omitBackground: true });

            screenshots.push({
                frame: i,
                time: parseFloat(timestamp),
                data: screenshot,
                path: screenshotPath
            });

            console.log(`Captured frame ${i}/${totalFrames} (${timestamp}s)`);
        }

        return screenshots;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}

// 使用示例
(async () => {
    const capturer = new TextAnimationCapturer();
    
    try {
        const config = {
            "text": "小豆的冒险",
            "fontSize": "50px", // 修改为px单位，因为Puppeteer中rpx可能不适用
            "fontFamily": "Microsoft YaHei, Arial, sans-serif", // 使用通用字体
            "x": "50%",
            "y": "40%",
            "duration": 3,
            "color": "#000",
            "start": 0,
            "effect": [
                {
                    "name": "zoomOutDown",
                    "time": 0.5,
                    "delay": 2.5
                }
            ],
            "lineHeight": "120%",
            "stroke": {
                "color": "#FFF",
                "size": 0
            },
            "shadow": {
                "color": null,
                "alpha": 1,
                "offset": null
            }
        };

        const screenshots = await capturer.captureTextAnimation(config, {
            duration: 3,
            fps: 30,
            outputDir: './animation_frames'
        });

        console.log(`成功捕获 ${screenshots.length} 帧动画截图`);
    } catch (error) {
        console.error('捕获动画截图时出错:', error);
    } finally {
        //await capturer.close();
    }
})();