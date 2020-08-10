
(async () => {
    const ctx: Worker = self as any;

    const workerName: string = "Detector worker"

    // brings a bug since 06.08.2020
    //self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js')

    // works via cdn
    //self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.1/dist/tf.min.js')
    //self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd')

    // local copy of the scripts
    self.importScripts('/lib/@tensorflow/tfjs/dist/tf.min.js') // @2.0.1
    self.importScripts('/lib/@tensorflow-models/coco-ssd/dist/coco-ssd.min.js')


    const cocoSsd = (self as any).cocoSsd;

    // load model
    const model = await cocoSsd.load()

    console.log(`${workerName}: model loaded`)

    ctx.postMessage({});

    ctx.onmessage = async (ev) => {

        const predictions = await model.detect(ev.data)

        ctx.postMessage(predictions)

        //const person = result.find((v) => v.class === 'person')
        //if (person)
        //    self.postMessage({ ok: true, bbox: person.bbox })
        //else
        //    self.postMessage({ ok: false, bbox: null })
    }
})()


