
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

    ctx.postMessage({ bodyPix: net });

    ctx.onmessage = async (ev) => {

        const segmentation = await net.segmentPerson(ev.data, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: 0.7
        });

        ctx.postMessage(segmentation)

    }
})()


