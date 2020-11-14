
(async () => {
    const ctx: Worker = self as any;

    const workerName: string = "BodyPix detector worker"

    // works via cdn
    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2')
    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0')

    // local copy of the scripts
    //self.importScripts('/lib/@tensorflow/tfjs/dist/tf.min.js') // @2.0.1
    //self.importScripts('/lib/@tensorflow-models/coco-ssd/dist/coco-ssd.min.js')

    const bodyPix = (self as any).bodyPix;

    // load model
    /** for optional arguments, see https://github.com/tensorflow/tfjs-models/tree/master/body-pix **/
    const net = await bodyPix.load();

    console.log(`${workerName}: model loaded`)

    ctx.postMessage({});

    const detectOptions = {
        flipHorizontal: false,
        internalResolution: 'low',
        segmentationThreshold: 0.7
    };

    ctx.onmessage = async (ev) => {

        if (ev.data.command == "detect") {

            const segmentation = await net.segmentPerson(ev.data.image, detectOptions);

            ctx.postMessage(segmentation)
        }

        if (ev.data.command == "options") {

            detectOptions.flipHorizontal = ev.data.options.flipHorizontal || detectOptions.flipHorizontal;
            detectOptions.internalResolution = ev.data.options.internalResolution || detectOptions.internalResolution;
            detectOptions.segmentationThreshold = ev.data.options.segmentationThreshold || detectOptions.segmentationThreshold;

            console.log(`${workerName}: options are ${JSON.stringify(detectOptions)}`);

            ctx.postMessage({});
        }

    }
})()


