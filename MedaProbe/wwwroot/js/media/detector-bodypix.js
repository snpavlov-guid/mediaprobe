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
    const workerName = "BodyPix detector worker";
    // works via cdn
    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2');
    self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0');
    // local copy of the scripts
    //self.importScripts('/lib/@tensorflow/tfjs/dist/tf.min.js') // @2.0.1
    //self.importScripts('/lib/@tensorflow-models/coco-ssd/dist/coco-ssd.min.js')
    const bodyPix = self.bodyPix;
    // load model
    /** for optional arguments, see https://github.com/tensorflow/tfjs-models/tree/master/body-pix **/
    const net = yield bodyPix.load();
    console.log(`${workerName}: model loaded`);
    ctx.postMessage({});
    ctx.onmessage = (ev) => __awaiter(this, void 0, void 0, function* () {
        const segmentation = yield net.segmentPerson(ev.data, {
            flipHorizontal: false,
            internalResolution: 'low',
            segmentationThreshold: 0.7
        });
        ctx.postMessage(segmentation);
    });
}))();
//# sourceMappingURL=detector-bodypix.js.map