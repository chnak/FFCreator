const { Factory } = require('./lib');
const video={
    "type": "canvas",
    "width": 1080,
    "height": 1920,
    "duration": 20,
    "name": "Composite",
    "author": "chnak",
    "cover": null,
    "refId": "39w28c41fpy",
    "children": [
        {
            "type": "spine",
            "refId": "pnd5cot3jjs",
            "zIndex": 0,
            "children": [
                {
                    "bgcolor": "#8B4513",
                    "zIndex": 2,
                    "compositionId": "39w28c41fpy",
                    "parentId": "pnd5cot3jjs",
                    "duration": 20,
                    "type": "scene",
                    "id": "i6dcqjqq17g",
                    "refId": "wu8ydxpebzc",
                    "active": true,
                    "isScene": true,
                    "children": [
                        {
                            "src": "D:/code/foliko-trade/public/files/1pn2x003uh51d.jpg",
                            "x": "50vw",
                            "y": "50vh",
                            "width": "100vw",
                            "height": "100vh",
                            "duration": 20,
                            "effect": [],
                            "compositionId": "39w28c41fpy",
                            "parentId": "wu8ydxpebzc",
                            "type": "image",
                            "refId": "4sj18y794",
                            "zIndex": 1,
                            "active": true,
                            "children": [],
                            "start": 0,
                            "end": 20
                        },
                        {
                            "text": "波比决定踏上寻找这棵树的旅程",
                            "fontSize": "32rpx",
                            "color": "#fff",
                            "fontFamily": "D:/code/foliko-trade/public/fonts/MicrosoftYaHei-01.ttf",
                            "x": "50vw",
                            "y": "50vh",
                            "duration": 20,
                            "effect": "fadeIn",
                            "compositionId": "39w28c41fpy",
                            "parentId": "wu8ydxpebzc",
                            "effectTime": 1,
                            "effectDelay": 0,
                            "type": "text",
                            "refId": "o5cgq8z944s",
                            "backgroundColor": null,
                            "letterSpacing": null,
                            "lineHeight": "120%",
                            "asMask": false,
                            "stroke": {
                                "color": "#FFF",
                                "size": 0
                            },
                            "shadow": {
                                "color": null,
                                "alpha": 1,
                                "offset": null
                            },
							"animate": [
                                {
									"ease":"Quartic.InOut",
                                    "delay": 0,
                                    "from": {
										x: "50vw",
										y: "0vh",
										fill:"#ff9900",
										strokeWidth:0
									},
                                    "time": 5,
                                    "to": {
										x: "50vw",
										y: "100vh",
										fill:"#141614",
										strokeWidth:"20%"
                                    }
                                },
								{
									"ease":"Quartic.InOut",
                                    "delay": 5,
                                    "from": {
										scale:1
									},
                                    "time": 3,
                                    "to": {
										scale:2
                                    }
                                }
                            ],
                            "zIndex": 4,
                            "width": null,
                            "wrap": true,
                            "height": null,
                            "active": true,
                            "children": [],
                            "start": 0,
                            "end": 20
                        }
                    ]
                }
			],
            "duration": 20
        }
    ]
}
const { node: creator } = Factory.from(video);
creator.start()
creator.on('start', () => {
    console.log(`start`);
}).on('error', e => {
    console.error("error", e);
}).on('progress', e => {
    let number = e.percent || 0;
    console.log(`progress: ${(number * 100) >> 0}%`);
}).on('complete', e => {
    console.log(`completed: ${e.output}`);
});