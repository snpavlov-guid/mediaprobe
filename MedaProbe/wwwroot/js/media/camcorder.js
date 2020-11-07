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
                this.resizePlayer();
            }
            setupComponent() {
                return __awaiter(this, void 0, void 0, function* () {
                    this._player = this._element.querySelector('.video-player');
                    this._controls = this._element.querySelector('.video-player .controls');
                    this._cameraOptions = this._controls.querySelector('.video-options > select');
                    this._ratioOptions = this._controls.querySelector('.video-ratio > select');
                    this._video = this._element.querySelector('.video-player #video');
                    this._canvasVideo = this._element.querySelector('.video-player #capture');
                    this._overlayVideo = this._element.querySelector('.video-player #overlay');
                    this.resizePlayer();
                    this.setupCameraSelectionOptions();
                    this.setupRatioSelectionOptions();
                    this.setupPlayerButtons();
                    this.setControlState(false);
                    this._cameraOptions.onchange = () => { this.changeCameraSelection(); };
                    this._ratioOptions.onchange = () => { this.changeRatioSelection(); };
                    this._btnPlay.onclick = () => { this.startStream(); };
                    this._btnPause.onclick = () => { this.pauseStream(); };
                    this._btnDetect.onclick = () => { this.doDetect(); };
                    this._player.addEventListener("mousemove", ev => { this.animControlsPanel(); });
                    window.addEventListener("resize", ev => { this.resizePlayer(); });
                    console.log("Camera player created");
                });
            }
            getUserMediaStream(deviceId, constrains) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        if (!this.checkDeviceSupport())
                            reject("No required media features!");
                        try {
                            const givenConstraints = Object.assign({}, constrains);
                            givenConstraints.video.deviceId = { exact: deviceId };
                            console.log("Trying to get media stream with constraints: " + JSON.stringify(givenConstraints));
                            resolve(yield this._navigator.mediaDevices.getUserMedia(givenConstraints));
                        }
                        catch (e) {
                            reject(e);
                        }
                    }));
                });
            }
            getVideoConstrains() {
                let constrains = {
                    video: {
                        width: this._player.clientWidth,
                        height: this._player.clientHeight,
                    }
                };
                return constrains;
            }
            checkDeviceSupport() {
                const features = CamcorderBase.requiredMediaFeatures;
                for (let i = 0; i < features.length; i++) {
                    if (features[i] in navigator)
                        continue;
                    return false;
                }
                return true;
            }
            startMediaStream() {
                return __awaiter(this, void 0, void 0, function* () {
                    var stream = yield this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());
                    if (stream) {
                        this._video.srcObject = stream;
                        this._streamStarted = true;
                        this.setControlState(true);
                    }
                });
            }
            stopMediaTracks(stream) {
                if (!stream)
                    return;
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            getCameraSelectionOptions(constrains) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const givenConstraints = Object.assign({}, constrains);
                        yield this._navigator.mediaDevices.getUserMedia(givenConstraints);
                        const devices = yield ((_a = this._navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.enumerateDevices());
                        const videoDevices = devices === null || devices === void 0 ? void 0 : devices.filter(device => device.kind === 'videoinput' && device.deviceId && device.label);
                        const options = videoDevices && videoDevices.length ? videoDevices.map(videoDevice => {
                            console.log(`Device: ${videoDevice.label}; Id: "${videoDevice.deviceId}"`);
                            return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
                        }) : [];
                        resolve(options);
                    }));
                });
            }
            setupCameraSelectionOptions() {
                return __awaiter(this, void 0, void 0, function* () {
                    let cameraOptions = yield this.getCameraSelectionOptions(this.getVideoConstrains());
                    this._cameraOptions.innerHTML = cameraOptions.join('');
                });
            }
            setupRatioSelectionOptions() {
                var ratioOptions = [];
                CamcorderBase.videoratios.forEach((el, i) => {
                    ratioOptions.push(`<option value="${el.koef}">${el.title}</option>`);
                });
                this._ratioOptions.innerHTML = ratioOptions.join('');
                this._ratioOptions.selectedIndex = CamcorderBase.videoratios.length - 1;
            }
            setupPlayerButtons() {
                let btns = [];
                this._controls.querySelectorAll(".buttons .btn").forEach(el => btns.push(el));
                [this._btnPlay, this._btnPause, this._btnScreenshot, this._btnDetect] = [...btns];
            }
            setControlState(streamStarted) {
                if (streamStarted) {
                    this._btnPlay.classList.add('d-none');
                    this._btnPause.classList.remove('d-none');
                    this._btnDetect.classList.remove('d-none');
                }
                else {
                    this._btnPlay.classList.remove('d-none');
                    this._btnPause.classList.add('d-none');
                    this._btnDetect.classList.add('d-none');
                }
                if (this._streamStarted)
                    this._btnScreenshot.classList.remove('d-none');
                else
                    this._btnScreenshot.classList.add('d-none');
            }
            setDetectState(detectStarted) {
                if (detectStarted)
                    this._btnDetect.classList.add('detecting-circle');
                else
                    this._btnDetect.classList.remove('detecting-circle');
            }
            resizePlayer() {
                let koef = parseFloat(this._ratioOptions.value);
                this._player.style.height = Math.floor(this._player.offsetWidth / koef) + "px";
                this.setImageCaptureSize();
            }
            setImageCaptureSize() {
                this._canvasVideo.width = this._player.clientWidth;
                this._canvasVideo.height = this._player.clientHeight;
                this._overlayVideo.width = this._player.clientWidth;
                this._overlayVideo.height = this._player.clientHeight;
            }
            waitForVideoMetadata() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        this._video.onloadedmetadata = (ev) => resolve(true);
                    });
                });
            }
            animControlsPanel() {
                if (!this._controlsViewAnimation) {
                    this._controlsViewAnimation = true;
                    this._controls.classList.add("controls-view-animation");
                    var onAnimationEnd = (ev) => {
                        if (ev.animationName != "anim-controls-hide")
                            return;
                        this._controlsViewAnimation = false;
                        this._controls.classList.remove("controls-view-animation");
                        this._controls.removeEventListener("animationend", onAnimationEnd);
                    };
                    this._controls.addEventListener("animationend", onAnimationEnd);
                }
            }
            setWaitCursor(wait) {
                if (wait)
                    this._player.classList.add("wait-cursor");
                else
                    this._player.classList.remove("wait-cursor");
            }
            setLoading(wait) {
                if (wait) {
                    this._player.appendChild(this.getLoadingTemplate());
                }
                else {
                    this._player.querySelector("ul.loading").remove();
                }
            }
            getLoadingTemplate() {
                let template = document.querySelector("#templates #loading-indicator");
                return template.content.cloneNode(true);
            }
            changeCameraSelection() {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`Selected device: ${this._cameraOptions.options[this._cameraOptions.selectedIndex].text}; Id: "${this._cameraOptions.value}"`);
                    if (!this._streamStarted)
                        return;
                    this._streamStarted = false;
                    this.setControlState(false);
                    this.stopMediaTracks(this._video.srcObject);
                    // request and start media stream
                    this.startMediaStream();
                    //this.refreshDetection(stream);
                });
            }
            changeRatioSelection() {
                return __awaiter(this, void 0, void 0, function* () {
                    this.resizePlayer();
                    if (!this._streamStarted)
                        return;
                    this._streamStarted = false;
                    this.setControlState(false);
                    // request and start media stream
                    this.startMediaStream();
                    //this.refreshDetection(stream);
                });
            }
            startStream() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._streamStarted) {
                        this._video.play();
                        this.setControlState(true);
                        if (this._streamDetect) {
                            this.startDetection();
                        }
                        return;
                    }
                    // request and start media stream
                    this.startMediaStream();
                });
            }
            pauseStream() {
                this._video.pause();
                if (this._streamDetect) {
                    this.stopDetection();
                }
                this.setControlState(false);
            }
            doDetect() {
                return __awaiter(this, void 0, void 0, function* () {
                    let streamDetected = !this._streamDetect;
                    if (streamDetected)
                        this.startDetection();
                    else
                        this.stopDetection();
                    this._streamDetect = streamDetected;
                    this.setDetectState(this._streamDetect);
                });
            }
            calcDestRect(player, cadr) {
                let rect = { cx: 0, cy: 0, cw: 0, ch: 0 };
                let wkf = player.clientWidth / cadr.width;
                let hkf = player.clientHeight / cadr.height;
                let kt = wkf < hkf ? wkf : hkf;
                rect.cw = cadr.width * kt;
                rect.ch = cadr.height * kt;
                if (wkf < hkf)
                    rect.cy = (player.clientHeight - rect.ch) / 2;
                else
                    rect.cx = (player.clientWidth - rect.cw) / 2;
                return rect;
            }
            startDetection() {
            }
            stopDetection() {
            }
            loadDetectorMethod() {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield new Promise((resolve, reject) => {
                        resolve({});
                    });
                });
            }
            loadDetector(loadMethod) {
                return __awaiter(this, void 0, void 0, function* () {
                    this.setWaitCursor(true);
                    this.setLoading(true);
                    console.log("Detector worker loading...");
                    let detector = yield loadMethod();
                    console.log("Detector worker loaded");
                    this.setLoading(false);
                    this.setWaitCursor(false);
                    return detector;
                });
            }
            loadDetectorWorker() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._detector)
                        return;
                    this.setWaitCursor(true);
                    this.setLoading(true);
                    console.log("Detector worker loading...");
                    this._detector = new Worker(this._detectorScript);
                    yield new Promise((resolve, reject) => {
                        this._detector.onmessage = (_) => {
                            console.log("Detector worker loaded");
                            resolve();
                        };
                    });
                    this.setLoading(false);
                    this.setWaitCursor(false);
                });
            }
            detectImageWorker(imgData) {
                return __awaiter(this, void 0, void 0, function* () {
                    // post image to detection
                    this._detector.postMessage({ command: "detect", image: imgData });
                    return yield new Promise((resolve, reject) => {
                        this._detector.onmessage = (ev) => {
                            resolve(ev.data);
                        };
                    });
                });
            }
            setDetectOptionsWorker(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    // post image to detection
                    this._detector.postMessage({ command: "options", options: options });
                    return yield new Promise((resolve, reject) => {
                        this._detector.onmessage = (ev) => {
                            resolve(true);
                        };
                    });
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
        class Behaviors {
            static calcDestRect(view, cadre, contains = true) {
                let rect = { cx: 0, cy: 0, cw: 0, ch: 0 };
                let wkf = view.clientWidth / cadre.width;
                let hkf = view.clientHeight / cadre.height;
                let kt = contains ?
                    (wkf < hkf ? wkf : hkf) :
                    (wkf > hkf ? wkf : hkf);
                rect.cw = cadre.width * kt;
                rect.ch = cadre.height * kt;
                if (wkf < hkf)
                    rect.cy = (view.clientHeight - rect.ch) / 2;
                else
                    rect.cx = (view.clientWidth - rect.cw) / 2;
                return rect;
            }
            static calcSpriteScale(view, cadre) {
                const result = {};
                const wkf = view.clientWidth / cadre.width;
                const hkf = view.clientHeight / cadre.height;
                const kt = wkf > hkf ? wkf : hkf;
                result.scale = new PIXI.Point(kt, kt);
                result.offset = new PIXI.Point();
                const cw = cadre.width * kt;
                const ch = cadre.height * kt;
                if (wkf > hkf)
                    result.offset.y = (view.clientHeight - ch) / 2;
                else
                    result.offset.x = (view.clientWidth - cw) / 2;
                return result;
            }
        }
        media.Behaviors = Behaviors;
    })(media = app.media || (app.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camcorder.js.map