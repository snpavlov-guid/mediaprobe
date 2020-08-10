var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => __awaiter(this, void 0, void 0, function* () {
    const ctx = self;
    const workerName = "Detector worker";
    // brings a bug since 06.08.2020
    //self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js')
    // works via cdn
    //self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.1/dist/tf.min.js')
    //self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd')
    // local copy of the scripts
    self.importScripts('/lib/@tensorflow/tfjs/dist/tf.min.js'); // @2.0.1
    self.importScripts('/lib/@tensorflow-models/coco-ssd/dist/coco-ssd.min.js');
    const cocoSsd = self.cocoSsd;
    // load model
    const model = yield cocoSsd.load();
    console.log(`${workerName}: model loaded`);
    ctx.postMessage({});
    ctx.onmessage = (ev) => __awaiter(this, void 0, void 0, function* () {
        const predictions = yield model.detect(ev.data);
        ctx.postMessage(predictions);
        //const person = result.find((v) => v.class === 'person')
        //if (person)
        //    self.postMessage({ ok: true, bbox: person.bbox })
        //else
        //    self.postMessage({ ok: false, bbox: null })
    });
}))();
//# sourceMappingURL=detector.js.map