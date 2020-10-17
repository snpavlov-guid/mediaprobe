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
                    this._canvasVideo = this._element.querySelector('.video-player #capture');
                    this._controls = this._element.querySelector('.video-player .controls');
                    this._cameraOptions = this._controls.querySelector('.video-options > select');
                    this._ratioOptions = this._controls.querySelector('.video-ratio > select');
                    this._video = this._element.querySelector('.video-player #video');
                    this.setupCameraSelectionOptions();
                    this.setupRatioSelectionOptions();
                    this.setupPlayerButtons();
                    this.setControlState(false);
                    this.resizePlayer();
                    this._cameraOptions.onchange = () => { this.changeCameraSelection(); };
                    this._ratioOptions.onchange = () => { this.changeRatioSelection(); };
                    this._btnPlay.onclick = () => { this.startStream(); };
                    this._btnPause.onclick = () => { this.pauseStream(); };
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
            getCameraSelectionOptions() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const devices = yield ((_a = this._navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.enumerateDevices());
                        const videoDevices = devices === null || devices === void 0 ? void 0 : devices.filter(device => device.kind === 'videoinput');
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
                    let cameraOptions = yield this.getCameraSelectionOptions();
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
                // set size of the capture canvas
                this._canvasVideo.width = this._player.clientWidth;
                this._canvasVideo.height = this._player.clientHeight;
                //this.setImageCaptureSize();
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
                        return;
                    }
                    // request and start media stream
                    this.startMediaStream();
                });
            }
            pauseStream() {
                this._video.pause();
                this.setControlState(false);
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