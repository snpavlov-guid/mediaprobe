
(async () => {
    const ctx: Worker = self as any;

    const workerName: string = "Detector worker"

    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js')
    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd')

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


