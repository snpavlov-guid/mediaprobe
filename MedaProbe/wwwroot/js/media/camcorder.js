var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var app;
(function (app) {
    var media;
    (function (media) {
        class CamcorderBase {
            constructor(element, options) {
                this._element = element;
                this._navigator = window.navigator;
                this._streamStarted = false;
                this._streamDetect = false;
                this._detectorScript = options.detectorWorkerScriptUrl;
                this._debugLog = options.debugLog;
                this._maxScreenshots = options.maxScreenshots ? options.maxScreenshots : 10;
                this.setupComponent();
            }
            setupComponent() {
                return __awaiter(this, void 0, void 0, function* () {
                });
            }
        }
        CamcorderBase.requiredMediaFeatures = ['mediaDevices', 'getUserMedia'];
        CamcorderBase.videoratios = [
            { title: "HD Video 16:9", koef: 16 / 9 },
            { title: "Standard Monitor 4:3", koef: 4 / 3 },
            { title: "Classic Film 3:2", koef: 3 / 2 },
            { title: "Cinemascope 21:9", koef: 21 / 9 }
        ];
        CamcorderBase._cameraConstraints = {
            video: {
                width: {
                    min: 1280,
                    ideal: 1920,
                    max: 2560,
                },
                height: {
                    min: 720,
                    ideal: 1080,
                    max: 1440
                },
            }
        };
        media.CamcorderBase = CamcorderBase;
    })(media = app.media || (app.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camcorder.js.map