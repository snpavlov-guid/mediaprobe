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
(function (app_1) {
    var media;
    (function (media) {
        class CameraBackground extends media.CamcorderBase {
            constructor(element, options) {
                super(element, options);
                this._displacementImageUrl = options.displacementImage;
            }
            setupComponent() {
                const _super = Object.create(null, {
                    setupComponent: { get: () => super.setupComponent }
                });
                return __awaiter(this, void 0, void 0, function* () {
                    _super.setupComponent.call(this);
                    this._animationTimeoutId = 0;
                    this._canvasCadre = this._element.querySelector('.video-player #cadre');
                    // add video events
                    this._video.addEventListener("play", ev => this.onVideoPlay(ev));
                    this._video.addEventListener("canplay", ev => this.onVideoCanPlay(ev));
                });
            }
            createPixi() {
                // check if app created
                if (this._app)
                    return;
                // initialize PIXI app when player is ready to play
                this.initializePixi();
                // resize the player and PIXI's video texture
                this.resizePlayer();
                // TODO: add filters
                this.applyPixiFilrer();
                // start PIXI animation
                this.animatePixi();
            }
            destroyPixi() {
                if (!this._app)
                    return;
                var app = this._app;
                var ticker = this._ticker;
                this._app = null;
                this._ticker = null;
                ticker.stop();
                ticker.destroy();
                app.destroy(false, { children: true, texture: true, baseTexture: true });
            }
            initializePixi() {
                this._app = new PIXI.Application({ view: this._canvasVideo, transparent: true });
                // create the root of the scene graph
                this._stage = new PIXI.Container();
                // create a video texture from a path
                this._videoTexture = PIXI.Texture.from(this._video);
                // create a new Sprite using the video texture (yes it's that easy)
                this._videoSprite = new PIXI.Sprite(this._videoTexture);
                this._stage.addChild(this._videoSprite);
                // create PIXI ticker
                this._ticker = new PIXI.Ticker();
                this._ticker.autoStart = true;
            }
            animatePixi() {
                // render the stage
                this._ticker.add((delta) => {
                    this._videoTexture.update();
                    if (this._displacementSprite && !this._video.paused) {
                        this._displacementSprite.x += 0.75 * delta;
                        this._displacementSprite.y += 0.75;
                    }
                    this._app.renderer.render(this._stage);
                });
            }
            applyPixiFilrer() {
                // Blur filter
                let blurFilter = new PIXI.filters.BlurFilter(20);
                blurFilter.blur = 50;
                blurFilter.quality = 10;
                // Displacement filter
                this._displacementSprite = PIXI.Sprite.from(this._displacementImageUrl);
                this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
                this._stage.addChild(this._displacementSprite);
                var displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite, 50);
                // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
                displacementFilter.autoFit = false;
                this._stage.filters = [blurFilter];
                //this._stage.filters = [displacementFilter];
            }
            onVideoCanPlay(ev) {
                console.log("Video can play fired");
                // create PIXI staff with deffered way
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    this.createPixi();
                    if (this._streamDetect) {
                        yield this.startDetection();
                    }
                }), 0);
            }
            onVideoPlay(ev) {
                var _a;
                // remove invite text
                (_a = this._player.querySelector(".startup-text")) === null || _a === void 0 ? void 0 : _a.remove();
            }
            resizePlayer() {
                super.resizePlayer();
                // resize renderer
                if (this._app) {
                    this._app.renderer.resize(this._player.clientWidth, this._player.clientHeight);
                    const vw = this._video.videoWidth;
                    const vh = this._video.videoHeight;
                    // calc frome destination rect
                    let dr = this.calcDestRect(this._player, { width: vw, height: vh });
                    this._videoSprite.x = dr.cx;
                    this._videoSprite.y = dr.cy;
                    this._videoSprite.width = dr.cw;
                    this._videoSprite.height = dr.ch;
                }
            }
            setImageCaptureSize() {
                super.setImageCaptureSize();
                if (this._canvasCadre) {
                    this._canvasCadre.width = this._player.clientWidth;
                    this._canvasCadre.height = this._player.clientHeight;
                }
            }
            changeRatioSelection() {
                const _super = Object.create(null, {
                    changeRatioSelection: { get: () => super.changeRatioSelection }
                });
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._streamDetect) {
                        this.stopDetection();
                    }
                    if (this._streamStarted) {
                        this.destroyPixi();
                    }
                    yield _super.changeRatioSelection.call(this);
                });
            }
            startDetection() {
                return __awaiter(this, void 0, void 0, function* () {
                    //// load body-pix detector class
                    //if (!this._bodyPix) {
                    //    this._bodyPix = await this.loadDetector<BodyPix.IBodyPix>(this.loadBodyPixDetector);
                    //}
                    // load body-pix detector worker
                    yield this.loadDetectorWorker();
                    // Get overlay canvas
                    this._canvasOverlayCtx = this._overlayVideo.getContext("2d");
                    this._canvasCadreCtx = this._canvasCadre.getContext("2d");
                    this._animationTimeoutId = requestAnimationFrame(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.detectionMethod();
                        this._overlayVideo.classList.remove("d-none");
                        this._canvasVideo.classList.add("d-none");
                    }));
                    console.log("Start detecting");
                });
            }
            stopDetection() {
                this._canvasVideo.classList.remove("d-none");
                this._overlayVideo.classList.add("d-none");
                cancelAnimationFrame(this._animationTimeoutId);
                this._canvasOverlayCtx = null;
                this._canvasCadreCtx = null;
                console.log("Stop detecting");
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
            detectionMethod() {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (!this._app)
                        return;
                    //if (!this._bodyPix) return;
                    if (!this._canvasOverlayCtx)
                        return;
                    //console.time('detectionMethod');
                    // source video size
                    const vw = this._video.videoWidth;
                    const vh = this._video.videoHeight;
                    // video frame adjustments
                    let dr = this.calcDestRect(this._player, { width: vw, height: vh });
                    // get image data from video stream via PIXI export
                    //let videoCanvas = this._app.renderer.plugins.extract.canvas(this._videoSprite);
                    //let videoCtx = videoCanvas.getContext('2d');
                    //let cadr = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
                    // Export PIXI stage canvas
                    let pixiCanvas = this._app.renderer.plugins.extract.canvas(this._stage);
                    // Adjust size of result canvas by source camvases 
                    let canvasWidth = Math.min(this._canvasCadre.width, pixiCanvas.width);
                    let canvasHeight = Math.min(this._canvasCadre.height, pixiCanvas.height);
                    // get image data from video stream directly
                    this._canvasCadreCtx.drawImage(this._video, 0, 0, vw, vh, 0, 0, dr.cw, dr.ch);
                    let cadre = this._canvasCadreCtx.getImageData(0, 0, canvasWidth, canvasHeight);
                    // get image data from PIXI stage
                    let pixiCtx = pixiCanvas.getContext('2d');
                    let frame = pixiCtx.getImageData(0, 0, canvasWidth, canvasHeight);
                    // detect image
                    //let segmentation = await this.detectBodyPixImage(cadre);
                    let segmentation = yield this.detectImageWorker(cadre);
                    // apply body by mask
                    let scene = segmentation && segmentation.data ?
                        app_1.util.image.combineImagesByMask(frame, cadre, segmentation.data, p => !!p) :
                        frame;
                    //let scene = frame;
                    // put image data
                    (_a = this._canvasOverlayCtx) === null || _a === void 0 ? void 0 : _a.putImageData(scene, dr.cx, dr.cy);
                    //console.timeEnd('detectionMethod');
                    this._animationTimeoutId = requestAnimationFrame(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.detectionMethod();
                    }));
                });
            }
            loadBodyPixDetector() {
                return __awaiter(this, void 0, void 0, function* () {
                    const bodyPix = window.bodyPix;
                    const net = yield bodyPix.load();
                    return net;
                });
            }
            detectBodyPixImage(imgData) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    const segmentation = yield ((_a = this._bodyPix) === null || _a === void 0 ? void 0 : _a.segmentPerson(imgData, {
                        flipHorizontal: false,
                        internalResolution: 'medium',
                        segmentationThreshold: 0.7
                    }));
                    return segmentation;
                });
            }
        }
        media.CameraBackground = CameraBackground;
    })(media = app_1.media || (app_1.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camera-background.js.map