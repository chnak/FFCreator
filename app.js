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
                            "src": "D:/code/foliko-trade/public/files/giphy.gif",
                            "x": "50vw",
                            "y": "50vh",
                            "width": "100vw",
                            "height": "100vh",
                            "object-fit": "cover",
                            "duration": 10,
                            "blur": null,
                            "effect": [
                                {
                                    "name": "fadeOut",
                                    "time": 0.5,
                                    "delay": 2.5
                                }
                            ],
                            "start": 0,
                            "type": "gif",
                            "refId": "p81jsgm3wx9",
                            "zIndex": 1,
                            "active": true,
                            "children": []
                        },
                        {
                            "url": "https://codepen.io/mikeK/pen/pqQJyY",
                            "x": "50vw",
                            "y": "50vh",
                            "width": "100vw",
							"selector":".greensock",
							"duration": 10,
                            "effect": [
								{
                                    "name": "fadeIn",
                                    "time": 2
                                }
							],
							"transparent":true,
                            "compositionId": "39w28c41fpy",
                            "parentId": "wu8ydxpebzc",
                            "type": "gsap",
                            "refId": "4sj18y794",
                            "zIndex": 1,
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