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
        class CameraBackground extends media.CamcorderBase {
            constructor(element, options) {
                super(element, options);
            }
            setupComponent() {
                const _super = Object.create(null, {
                    setupComponent: { get: () => super.setupComponent }
                });
                return __awaiter(this, void 0, void 0, function* () {
                    _super.setupComponent.call(this);
                    // add video events
                    this._video.addEventListener("play", ev => this.onVideoPlay(ev));
                });
            }
            onVideoPlay(ev) {
                var _a;
                // remove invite text
                (_a = this._player.querySelector(".startup-text")) === null || _a === void 0 ? void 0 : _a.remove();
                // get and save canvas's rendering context
                this._canvasVideoCtx = this._canvasVideo.getContext('2d');
                //start video capturing callback
                this.captureCallback();
            }
            captureCallback() {
                return __awaiter(this, void 0, void 0, function* () {
                    // if player is not play break capturing
                    if (this._video.paused || this._video.ended) {
                        setTimeout(() => this.captureCallback(), 0);
                        return;
                    }
                    const vw = this._video.videoWidth;
                    const vh = this._video.videoHeight;
                    // calc frome destination rect
                    let dr = this.calcDestRect(this._player, { width: vw, height: vh });
                    // draw video in canvas
                    this._canvasVideoCtx.drawImage(this._video, 0, 0, vw, vh, dr.cx, dr.cy, dr.cw, dr.ch);
                    //this._canvasVideoCtx.drawImage(this._video, 0, 0, vw, vh);
                    //repeat capturing
                    setTimeout(() => this.captureCallback(), 0);
                });
            }
        }
        media.CameraBackground = CameraBackground;
    })(media = app.media || (app.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camera-background.js.map