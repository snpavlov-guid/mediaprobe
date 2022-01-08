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
                    this._pixiStages = {};
                    this._pixiFilters = new app_1.pixi.PixiFilterManager();
                    this._canvasCadre = this._element.querySelector('.video-player #cadre');
                    this._detectOptions = this._controls.querySelector('.detect-quality > select');
                    this._backgroundList = this._element.querySelector('.background-list');
                    this._uploadImage = this._backgroundList.querySelector('.upload input[type=file]');
                    this._filterList = this._element.querySelector('.filter-list');
                    this._screenshotList = this._element.querySelector('.snapshot-list');
                    this._snapshotImage = this._screenshotList.querySelector('.snapshot button');
                    // Body-pix detection options
                    this.setupDetectSelectionOptions();
                    // Option events
                    this._detectOptions.addEventListener("change", () => { this.changeDetectOption(); });
                    // Video events
                    this._video.addEventListener("play", ev => this.onVideoPlay(ev));
                    this._video.addEventListener("canplay", ev => this.onVideoCanPlay(ev));
                    // Background list events
                    this._backgroundList.addEventListener("change", ev => { this.doBackgroundApply(ev); });
                    this._backgroundList.addEventListener("click", ev => { this.doBackgroundCommand(ev); });
                    this._uploadImage.addEventListener("change", ev => { this.doBackgroundUpload(ev); });
                    // Filter list events
                    this._filterList.addEventListener("change", ev => { this.doFilterApply(ev); });
                    // Snapshot list events
                    this._screenshotList.addEventListener("click", ev => { this.doScreenshotCommand(ev); });
                    this._snapshotImage.addEventListener("click", ev => { this.doScreenshot(); });
                    console.log("CameraBackground.setupComponent");
                });
            }
            setupDetectSelectionOptions() {
                var detectOptions = [];
                CameraBackground.detectQuality.forEach((el, i) => {
                    detectOptions.push(`<option value="${el.value}">${el.title}</option>`);
                });
                this._detectOptions.innerHTML = detectOptions.join('');
                this._detectOptions.selectedIndex = 1;
            }
            createPixi() {
                // check if app created
                if (this._app)
                    return;
                // initialize PIXI app when player is ready to play
                this.initializePixi();
                // initialize PIXI stage sprites
                this.initializePixiStages();
                // initialize PIXI filters
                this.initializePixiFilters();
                // resize the player and PIXI's video texture
                this.resizePlayer();
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
                //for (let key in this._pixiStages) {
                //    this._pixiStages[key].destroy();
                //}
                //this._pixiStages = {};
                this._pixiFilters.clear();
                ticker.stop();
                ticker.destroy();
                app.destroy(false, { children: true, texture: true, baseTexture: true });
            }
            initializePixi() {
                this._app = new PIXI.Application({ view: this._canvasVideo, transparent: true });
                // create the root of the scene graph
                this._stage = new PIXI.Container();
                // create PIXI ticker
                this._ticker = new PIXI.Ticker();
                this._ticker.autoStart = true;
            }
            initializePixiStages() {
                // Find selected background option
                const radio = this._backgroundList.querySelector('li input[type=radio]:checked');
                const value = radio === null || radio === void 0 ? void 0 : radio.value;
                let key = PixiVideoStage.SpriteName;
                // Createv video sprite
                this._pixiStages[key] = new PixiVideoStage(this._stage, this._video, false);
                // create bk image selected 
                if (value == PixiBroadsheet.SpriteName) {
                    key = PixiBroadsheet.SpriteName;
                    const li = app.util.dom.closest(radio, "ul.background-list li");
                    const img = li.querySelector("img.content");
                    this._pixiStages[key] = new PixiBroadsheet(this._stage, this._video, img, false);
                }
                this._activeStage = this._pixiStages[key];
                this._activeStage.setVisibility(true);
            }
            initializePixiFilters() {
                // Add blur filter
                this._pixiFilters.addFilter(app_1.pixi.PixiFilterNames.BlurFilter, new app_1.pixi.PixiBlurFilter(false));
                // Add displacement filter
                this._pixiFilters.addFilter(app_1.pixi.PixiFilterNames.DisplacementFilter, new app_1.pixi.PixiDisplacementFilter(this._stage, this._displacementImageUrl, false));
                // Add motion blur filter
                this._pixiFilters.addFilter(app_1.pixi.PixiFilterNames.MotionBlurFilter, new app_1.pixi.PixiMotionBlurFilter(false));
                // Add kawase blur filter
                this._pixiFilters.addFilter(app_1.pixi.PixiFilterNames.KawaseBlurFilter, new app_1.pixi.PixiKawaseBlurFilter(false));
                // Add shockwave filter
                this._pixiFilters.addFilter(app_1.pixi.PixiFilterNames.ShockwaveFilter, new app_1.pixi.PixiShockwaveFilter(false));
                // Add shockwave filter
                this._pixiFilters.addFilter(app_1.pixi.PixiFilterNames.BulgePinchFilter, new app_1.pixi.PixiBulgePinchFilter(false));
                // Find selected filter option
                const checkedFilters = this._filterList.querySelectorAll('li input[type=checkbox]:checked');
                const filterNames = [];
                checkedFilters.forEach(x => filterNames.push(x.value));
                // enable filters
                this._pixiFilters.enableFilters(filterNames, true);
                // set filters to the stage
                this._stage.filters = this._pixiFilters.getFilters();
            }
            animatePixi() {
                // render the stage
                this._ticker.add((delta) => {
                    if (!this._video.paused) {
                        // stage update operations for animation
                        this._activeStage.update();
                        this._pixiFilters.animate(delta);
                    }
                    // render PIXI stage
                    this._app.renderer.render(this._stage);
                });
            }
            //protected applyPixiFilrer() {
            //    // Blur filter
            //    let blurFilter = new PIXI.filters.BlurFilter(20);
            //    blurFilter.blur = 50;
            //    blurFilter.quality = 10;
            //    // Displacement filter
            //    this._displacementSprite = PIXI.Sprite.from(this._displacementImageUrl);
            //    this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
            //    this._stage.addChild(this._displacementSprite);
            //    var displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite, 50);
            //    // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            //    displacementFilter.autoFit = false;
            //    this._stage.filters = [blurFilter];
            //    //this._stage.filters = [displacementFilter];
            //}
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
                    this._activeStage.resize(this._player, (rect) => {
                        // apply size to filters
                        this._pixiFilters.resize(app_1.pixi.PixiFilterNames.ShockwaveFilter, rect);
                        this._pixiFilters.resize(app_1.pixi.PixiFilterNames.BulgePinchFilter, rect);
                    });
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
            changeDetectOption() {
                if (this._streamDetect) {
                    this.stopDetection();
                    this.startDetection();
                }
            }
            startDetection() {
                return __awaiter(this, void 0, void 0, function* () {
                    //// load body-pix detector class
                    //if (!this._bodyPix) {
                    //    this._bodyPix = await this.loadDetector<BodyPix.IBodyPix>(this.loadBodyPixDetector);
                    //}
                    // load body-pix detector worker
                    yield this.loadDetectorWorker();
                    // set currently selected resolution option
                    yield this.setDetectOptionsWorker({ internalResolution: this._detectOptions.value });
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
            // region Backgrounds
            doBackgroundApply(ev) {
                if (!this._app)
                    return;
                if (app.util.dom.filterEvent(ev, "ul.background-list li input[type=radio]")) {
                    const li = app.util.dom.closest(ev.target, "ul.background-list li");
                    const radio = li.querySelector("input[type=radio]");
                    const value = radio.value;
                    let selectedStage;
                    if (value == PixiVideoStage.SpriteName) {
                        selectedStage = this._pixiStages[PixiVideoStage.SpriteName];
                    }
                    else if (value == PixiBroadsheet.SpriteName) {
                        const img = li.querySelector("img.content");
                        selectedStage = new PixiBroadsheet(this._stage, this._video, img);
                        this._pixiStages[PixiBroadsheet.SpriteName] = selectedStage;
                    }
                    selectedStage.setVisibility(true);
                    selectedStage.resize(this._player);
                    this._activeStage.setVisibility(false);
                    this._activeStage = selectedStage;
                }
            }
            doBackgroundUpload(ev) {
                const upload = ev.target;
                if (!upload.files.length)
                    return;
                const li = app.util.dom.closest(upload, "ul.background-list li");
                const template = document.querySelector("#templates #background-item");
                const item = template.content.cloneNode(true);
                const img = item.querySelector("img.content");
                const radio = item.querySelector("input[type=radio]");
                this._backgroundList.insertBefore(item, li);
                const reader = new FileReader();
                reader.addEventListener('load', (event) => {
                    // Set image content
                    img.src = event.target.result;
                    // Set radio value and trigger radio change event
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                });
                reader.readAsDataURL(upload.files[0]);
            }
            doBackgroundCommand(ev) {
                if (app.util.dom.filterEvent(ev, "ul.background-list li button.item-remove")) {
                    const li = app.util.dom.closest(ev.target, "ul.background-list li");
                    const radio = li.querySelector("input[type=radio]");
                    const rvideo = this._backgroundList.querySelector("ul.background-list li input[value=video]");
                    if (li && confirm("You are about to remove background?")) {
                        if (radio.checked) {
                            // Set radio value and trigger radio change event
                            rvideo.checked = true;
                            rvideo.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        li.remove();
                    }
                }
            }
            doFilterApply(ev) {
                if (!this._app)
                    return;
                if (app.util.dom.filterEvent(ev, "ul.filter-list li input[type=checkbox]")) {
                    const li = app.util.dom.closest(ev.target, "ul.filter-list li");
                    const checkbox = li.querySelector("input[type=checkbox]");
                    // set enabled for a filter
                    this._pixiFilters.enable(checkbox.value, checkbox.checked);
                }
            }
            doScreenshot() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!this._streamStarted)
                        return;
                    const maxItems = this._maxScreenshots;
                    let dataUrl = yield this.createImageDataUrl();
                    const listLen = this._screenshotList.children.length;
                    if (listLen - 1 == maxItems) {
                        this._screenshotList.children[listLen - 2].remove();
                    }
                    this._screenshotList.prepend(this.createScreenshotElement(dataUrl, new Date()));
                });
            }
            ;
            createImageDataUrl() {
                return __awaiter(this, void 0, void 0, function* () {
                    // Source canvas
                    let sourceCanvas = this._overlayVideo;
                    if (!this._streamDetect && this._app) {
                        sourceCanvas = this._app.renderer.plugins.extract.canvas(this._stage);
                    }
                    ;
                    return sourceCanvas.toDataURL('image/jpg');
                });
            }
            doScreenshotCommand(ev) {
                const prefix = "screenshot";
                if (app.util.dom.filterEvent(ev, "ul.snapshot-list li button.item-download")) {
                    const li = app.util.dom.closest(ev.target, "ul.snapshot-list li");
                    const img = li ? li.querySelector("img.content") : null;
                    if (img) {
                        const info = li.querySelector(".preset-info");
                        const date = new Date(info.getAttribute("data-datetime"));
                        const name = `${prefix} [${app.util.dom.toFileNamedDateFormat(date)}]`;
                        this.downloadScreenshot(img, name);
                    }
                }
                if (app.util.dom.filterEvent(ev, "ul.snapshot-list li button.item-remove")) {
                    const li = app.util.dom.closest(ev.target, "ul.snapshot-list li");
                    if (li && confirm("You are about to remove snapshot?")) {
                        li.remove();
                    }
                }
            }
        }
        CameraBackground.detectQuality = [
            { title: "Low", value: "low" },
            { title: "Medium", value: "medium" },
            { title: "High", value: "high" },
            { title: "Full", value: "full" }
        ];
        media.CameraBackground = CameraBackground;
        class PixiVideoStage {
            constructor(stage, video, visibility = true) {
                this._video = video;
                this.init(stage, video);
                this.setVisibility(visibility);
            }
            init(stage, video) {
                // create a video texture from a path
                this._videoTexture = PIXI.Texture.from(video);
                // create a new Sprite using the video texture (yes it's that easy)
                this._videoSprite = new PIXI.Sprite(this._videoTexture);
                this._videoSprite.name = PixiVideoStage.SpriteName;
                stage.addChild(this._videoSprite);
            }
            // region Interface IPixiStage
            setVisibility(visible) {
                this._videoSprite.visible = visible;
                this._videoSprite.scale.x = visible ? 1 : 0;
                this._videoSprite.scale.y = visible ? 1 : 0;
            }
            update() {
                this._videoTexture.update();
            }
            resize(view, onresize) {
                const size = {
                    width: this._video.videoWidth,
                    height: this._video.videoHeight,
                };
                // calc frome destination rect
                const dr = media.Behaviors.calcDestRect(view, size);
                this._videoSprite.x = dr.cx;
                this._videoSprite.y = dr.cy;
                this._videoSprite.width = dr.cw;
                this._videoSprite.height = dr.ch;
                // call on resize caller's method
                if (onresize)
                    onresize(dr);
            }
            destroy() {
                this._videoSprite.destroy({ children: true, texture: true, baseTexture: true });
            }
        }
        PixiVideoStage.SpriteName = "video";
        media.PixiVideoStage = PixiVideoStage;
        class PixiBroadsheet {
            constructor(stage, video, image, visibility = true) {
                this._video = video;
                this._image = image;
                this.init(stage, image);
                this.setVisibility(visibility);
            }
            init(stage, image) {
                this._imageTexture = PIXI.Texture.from(image);
                this._imageTexture.baseTexture.setSize(image.naturalWidth, image.naturalHeight);
                this._imageSprite = new PIXI.Sprite(this._imageTexture);
                stage.addChild(this._imageSprite);
            }
            // region Interface IPixiStage
            setVisibility(visible) {
                this._imageSprite.visible = visible;
            }
            update() {
                // no update required
            }
            resize(view, onresize) {
                const size = {
                    width: this._imageSprite.width,
                    height: this._imageSprite.height,
                };
                // calc frome destination rect
                const dr = media.Behaviors.calcDestRect(view, size, false);
                this._imageSprite.x = dr.cx;
                this._imageSprite.y = dr.cy;
                this._imageSprite.width = dr.cw;
                this._imageSprite.height = dr.ch;
                // clip sprite by video borders
                const vsize = {
                    width: this._video.videoWidth,
                    height: this._video.videoHeight,
                };
                // calc frome destination rect
                const vdr = media.Behaviors.calcDestRect(view, vsize);
                const mask = new PIXI.Graphics();
                mask.beginFill(0x000000);
                mask.drawRect(vdr.cx + dr.cx, vdr.cy + dr.cy, vdr.cw, vdr.ch);
                this._imageSprite.mask = mask;
                // call on resize caller's method
                if (onresize)
                    onresize(vdr);
            }
            destroy() {
                this._imageSprite.destroy({ children: true, texture: true, baseTexture: true });
            }
        }
        PixiBroadsheet.SpriteName = "image";
        media.PixiBroadsheet = PixiBroadsheet;
    })(media = app_1.media || (app_1.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camera-background.js.map