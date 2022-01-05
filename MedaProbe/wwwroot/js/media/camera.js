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
        class CameraParty {
            constructor(element, options) {
                this._navigator = window.navigator;
                this._element = element;
                this._streamStarted = false;
                this._streamDetect = false;
                this._detectorScript = options.detectorWorkerScriptUrl;
                this._debugLog = options.debugLog;
                this._maxScreenshots = options.maxScreenshots ? options.maxScreenshots : 10;
                this.setupComponent();
            }
            setupComponent() {
                return __awaiter(this, void 0, void 0, function* () {
                    this._player = this._element.querySelector('#player');
                    this._canvasVideo = this._element.querySelector('#player #capture');
                    this._video = this._element.querySelector('#player #video');
                    this._overlayCanvas = this._element.querySelector('#player #overlay');
                    this._cameraOptions = this._element.querySelector('.video-options > select');
                    this._ratioOptions = this._element.querySelector('.video-ratio > select');
                    this._controls = this._element.querySelector('#player .controls');
                    this._screenshotList = this._element.querySelector('.video-screenshot .screenshot-list');
                    let btns = [];
                    this._element.querySelectorAll(".controls .btn").forEach(el => btns.push(el));
                    [this._btnPlay, this._btnPause, this._btnScreenshot, this._btnDetect] = [...btns];
                    let cameraOptions = yield this.getCameraSelectionOptions();
                    this._cameraOptions.innerHTML = cameraOptions.join('');
                    let ratioOptions = this.getRatioSelectionOptions();
                    this._ratioOptions.innerHTML = ratioOptions.join('');
                    this._ratioOptions.selectedIndex = CameraParty.videoratios.length - 1;
                    this.setControlState(false);
                    this.resizePlayer();
                    this._cameraOptions.onchange = () => { this.cameraOptions(); };
                    this._ratioOptions.onchange = () => { this.ratioOptions(); };
                    this._btnPlay.onclick = () => { this.startCamera(); };
                    this._btnPause.onclick = () => { this.pauseStream(); };
                    this._btnScreenshot.onclick = () => { this.doScreenshot(); };
                    this._btnDetect.onclick = () => { this.doDetect(); };
                    this._player.addEventListener("mousemove", ev => { this.animControlsPanel(); });
                    this._screenshotList.addEventListener("click", ev => { this.doScreenshotCommand(ev); });
                    window.addEventListener("resize", ev => { this.resizePlayer(); });
                    console.log("Camera player created");
                });
            }
            loadDetector() {
                return __awaiter(this, void 0, void 0, function* () {
                    this.setWaitCursor(true);
                    this.setLoading(true);
                    console.log("Detector worker loading...");
                    this._detector = new Worker(this._detectorScript);
                    yield new Promise((resolve, reject) => {
                        this._detector.onmessage = (_) => {
                            console.log("Detector worker loaded");
                            resolve(null);
                        };
                    });
                    this.setLoading(false);
                    this.setWaitCursor(false);
                });
            }
            resizePlayer() {
                let koef = parseFloat(this._ratioOptions.value);
                this._player.style.height = Math.floor(this._player.offsetWidth / koef) + "px";
                this.setImageCaptureSize();
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
            getVideoConstrains() {
                let constrains = {
                    video: {
                        width: this._player.clientWidth,
                        height: this._player.clientHeight,
                    }
                };
                return constrains;
                //return CameraParty._cameraConstraints;
            }
            checkDeviceSupport() {
                var features = CameraParty.requiredMediaFeatures;
                for (let i = 0; i < features.length; i++) {
                    if (features[i] in navigator)
                        continue;
                    return false;
                }
                return true;
            }
            requestUserPermission(supported) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        let isSupported = supported || this.checkDeviceSupport();
                        if (isSupported) {
                            try {
                                yield this._navigator.mediaDevices.getUserMedia({ video: true });
                                resolve(true);
                            }
                            catch (_a) {
                                resolve(false);
                            }
                        }
                        else {
                            resolve(false);
                        }
                    }));
                });
            }
            getMediaDevices() {
                return __awaiter(this, void 0, void 0, function* () {
                    return this._navigator.mediaDevices.enumerateDevices();
                });
            }
            getCameraSelectionOptions() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const devices = yield ((_a = this._navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.enumerateDevices());
                        const videoDevices = devices === null || devices === void 0 ? void 0 : devices.filter(device => device.kind === 'videoinput');
                        const options = videoDevices ? videoDevices.map(videoDevice => {
                            console.log(`Device: ${videoDevice.label}; Id: "${videoDevice.deviceId}"`);
                            return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
                        }) : [];
                        resolve(options);
                    }));
                });
            }
            getCameraSelectionOptionsTest() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        const devices = [{ deviceId: "1111111", label: "device 01" }, { deviceId: "2222222", label: "device 02" }];
                        const options = devices.map(videoDevice => {
                            return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
                        });
                        resolve(options);
                    }));
                });
            }
            getRatioSelectionOptions() {
                var options = [];
                CameraParty.videoratios.forEach((el, i) => {
                    options.push(`<option value="${el.koef}">${el.title}</option>`);
                });
                return options;
            }
            getUserMediaStream(deviceId, constrains) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        if (this.checkDeviceSupport()) {
                            try {
                                const givenConstraints = Object.assign({}, constrains);
                                givenConstraints.video.deviceId = { exact: deviceId };
                                console.log("Trying to get media stream with constraints: " + JSON.stringify(givenConstraints));
                                resolve(yield this._navigator.mediaDevices.getUserMedia(givenConstraints));
                            }
                            catch (_a) {
                                resolve(null);
                            }
                        }
                        else {
                            resolve(null);
                        }
                    }));
                });
            }
            stopMediaTracks(stream) {
                if (!stream)
                    return;
                stream.getTracks().forEach(track => {
                    track.stop();
                });
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
            startCamera() {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._streamStarted) {
                        this._video.play();
                        this.setControlState(true);
                        return;
                    }
                    var stream = yield this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());
                    if (stream) {
                        this._video.srcObject = stream;
                        this._streamStarted = true;
                        this.setControlState(true);
                    }
                    // remove invite text
                    (_a = this._player.querySelector(".startup-text")) === null || _a === void 0 ? void 0 : _a.remove();
                });
            }
            pauseStream() {
                this._video.pause();
                this.setControlState(false);
            }
            doScreenshot() {
                return __awaiter(this, void 0, void 0, function* () {
                    const maxItems = this._maxScreenshots;
                    let dataUrl = yield this.createImageDataUrl();
                    if (this._screenshotList.children.length == maxItems) {
                        this._screenshotList.lastChild.remove();
                    }
                    this._screenshotList.prepend(this.createScreenshotElement(dataUrl, new Date()));
                });
            }
            ;
            cameraOptions() {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`Selected device: ${this._cameraOptions.options[this._cameraOptions.selectedIndex].text}; Id: "${this._cameraOptions.value}"`);
                    if (!this._streamStarted)
                        return;
                    this._streamStarted = false;
                    this.stopMediaTracks(this._video.srcObject);
                    this.setControlState(false);
                    var stream = yield this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());
                    if (stream) {
                        this._video.srcObject = stream;
                        this._streamStarted = true;
                        this.setControlState(true);
                    }
                    this.refreshDetection(stream);
                });
            }
            ratioOptions() {
                return __awaiter(this, void 0, void 0, function* () {
                    this.resizePlayer();
                    if (!this._streamStarted)
                        return;
                    this._streamStarted = false;
                    this.setControlState(false);
                    var stream = yield this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());
                    if (stream) {
                        this._video.srcObject = stream;
                        this._streamStarted = true;
                        this.setControlState(true);
                    }
                    this.refreshDetection(stream);
                });
            }
            refreshDetection(stream) {
                if (stream && this._streamDetect) {
                    this.setImageCaptureSize();
                    this._imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
                    // continue detecting
                    this.captureCallback();
                }
                if (!stream) {
                    this._imageCapture = null;
                    this._streamDetect = false;
                    console.log("Detecting stopped");
                }
            }
            doDetect() {
                return __awaiter(this, void 0, void 0, function* () {
                    let streamDetected = !this._streamDetect;
                    this._streamStarted = false;
                    this.setControlState(false);
                    var stream = yield this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());
                    if (stream) {
                        this._video.srcObject = stream;
                        this._streamStarted = true;
                        this.setControlState(true);
                    }
                    if (stream && streamDetected) {
                        yield this.waitForVideoMetadata();
                        this.setImageCaptureSize();
                        this._imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
                        if (!this._detector)
                            yield this.loadDetector();
                        this._streamDetect = true;
                        // start detecting
                        this.captureCallback();
                        console.log("Detecting started");
                    }
                    else {
                        this._imageCapture = null;
                        this._streamDetect = false;
                        console.log("Detecting stopped");
                    }
                    this.setDetectState(this._streamDetect);
                });
            }
            waitForVideoMetadata() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        this._video.onloadedmetadata = (ev) => resolve(true);
                    });
                });
            }
            setImageCaptureSize() {
                this._canvasVideo.width = this._player.clientWidth;
                this._canvasVideo.height = this._player.clientHeight;
                this._overlayCanvas.width = this._player.clientWidth;
                this._overlayCanvas.height = this._player.clientHeight;
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
            captureCallback() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!this._streamDetect) {
                        // clear rect
                        let ctx = this._overlayCanvas.getContext("2d");
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        return;
                    }
                    // if player is not play continue try to detect
                    if (this._video.paused || this._video.ended) {
                        setTimeout(() => this.captureCallback(), 0);
                        return;
                    }
                    // grab video frame
                    let imageBmp = yield this._imageCapture.grabFrame();
                    // calc frome destination rect
                    let dr = this.calcDestRect(this._player, imageBmp);
                    // put frame on capture canvas
                    let videoCtx = this._canvasVideo.getContext('2d');
                    videoCtx.drawImage(yield imageBmp, 0, 0, imageBmp.width, imageBmp.height, dr.cx, dr.cy, dr.cw, dr.ch);
                    // get image data
                    let imgData = videoCtx.getImageData(0, 0, this._canvasVideo.clientWidth, this._canvasVideo.clientHeight);
                    // detect image
                    let predictions = yield this.detectImage(imgData);
                    // show detected predictions
                    this.onDetected(predictions);
                    // continue detecting loop
                    setTimeout(() => this.captureCallback(), 0);
                });
            }
            detectImage(imgData) {
                return __awaiter(this, void 0, void 0, function* () {
                    // post image to detection
                    this._detector.postMessage(imgData);
                    return yield new Promise((resolve, reject) => {
                        this._detector.onmessage = (ev) => {
                            resolve(ev.data);
                        };
                    });
                });
            }
            onDetected(predictions) {
                if (this._debugLog)
                    console.log("Detected: " + JSON.stringify(predictions));
                if (!Array.isArray(predictions))
                    return;
                var overlayContext2D = this._overlayCanvas.getContext("2d");
                this.showDetections(overlayContext2D, predictions);
            }
            showDetections(ctx, predictions) {
                // clear rect
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                const font = "24px helvetica";
                const wpad = 10;
                const hpad = 10;
                ctx.font = font;
                ctx.textBaseline = "top";
                predictions.forEach(prediction => {
                    const x = prediction.bbox[0];
                    const y = prediction.bbox[1];
                    const width = prediction.bbox[2];
                    const height = prediction.bbox[3];
                    // Text to draw
                    const labelText = `${prediction.class} (${prediction.score.toFixed(2)})`;
                    // Draw the bounding box.
                    ctx.strokeStyle = "#2fff00";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, width, height);
                    // Draw the label background.
                    ctx.fillStyle = "#2fff00";
                    const textWidth = ctx.measureText(labelText).width;
                    const textHeight = parseInt(font, 10);
                    // draw top left rectangle
                    ctx.fillRect(x, y, textWidth + wpad, textHeight + hpad);
                    // Draw the text last to ensure it's on top.
                    ctx.fillStyle = "#000000";
                    ctx.fillText(labelText, x + wpad / 2, y + hpad / 2);
                });
            }
            createImageDataUrl() {
                return __awaiter(this, void 0, void 0, function* () {
                    var canvas = document.createElement("canvas");
                    // grab video frame
                    let stream = this._video.srcObject;
                    let imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
                    let imageBmp = yield imageCapture.grabFrame();
                    // calc frome destination rect
                    let dr = this.calcDestRect(this._player, imageBmp);
                    canvas.width = dr.cw;
                    canvas.height = dr.ch;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(yield imageBmp, 0, 0, dr.cw, dr.ch);
                    if (this._streamDetect) {
                        let videoImg = ctx.getImageData(0, 0, dr.cw, dr.ch);
                        let overImg = this._overlayCanvas.getContext('2d').getImageData(dr.cx, dr.cy, dr.cw, dr.ch);
                        let transImg = app.util.image.combineImageData(videoImg, overImg, new app.util.image.Color(0, 0, 0));
                        ctx.putImageData(transImg, 0, 0);
                    }
                    let imgDataUrl = canvas.toDataURL('image/jpg');
                    return imgDataUrl;
                });
            }
            getScreenshotItemTemplate() {
                let template = document.querySelector("#templates #screenshot-item");
                return template.content.cloneNode(true);
            }
            createScreenshotElement(dataUrl, time) {
                const li = document.createElement("li");
                li.appendChild(this.getScreenshotItemTemplate());
                const img = li.querySelector("img#screenshot");
                img.src = dataUrl;
                const dtdata = time.toISOString();
                const options = {
                    year: "numeric", month: "numeric", day: "numeric",
                    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
                };
                const dttext = new Intl.DateTimeFormat("en", options).format(time);
                const info = li.querySelector(".screenshot-info");
                info.setAttribute("data-datetime", dtdata);
                info.innerHTML = `${dttext}`;
                return li;
            }
            doScreenshotCommand(ev) {
                const prefix = "screenshot";
                if (app.util.dom.filterEvent(ev, "ul.screenshot-list li button.screenshot-download")) {
                    const li = app.util.dom.closest(ev.target, "ul.screenshot-list li");
                    const img = li ? li.querySelector("img#screenshot") : null;
                    if (img) {
                        const info = li.querySelector(".screenshot-info");
                        const date = new Date(info.getAttribute("data-datetime"));
                        const name = `${prefix} [${app.util.dom.toFileNamedDateFormat(date)}]`;
                        this.downloadScreenshot(img, name);
                    }
                }
                if (app.util.dom.filterEvent(ev, "ul.screenshot-list li button.screenshot-remove")) {
                    const li = app.util.dom.closest(ev.target, "ul.screenshot-list li");
                    if (li && confirm("You are about to remove screenshot?")) {
                        li.remove();
                    }
                }
            }
            downloadScreenshot(img, downloadName) {
                var link = document.createElement("a");
                link.download = downloadName;
                link.href = img.src;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            getLoadingTemplate() {
                let template = document.querySelector("#templates #loading-indicator");
                return template.content.cloneNode(true);
            }
        }
        CameraParty.requiredMediaFeatures = ['mediaDevices', 'getUserMedia'];
        CameraParty.videoratios = [
            { title: "HD Video 16:9", koef: 16 / 9 },
            { title: "Standard Monitor 4:3", koef: 4 / 3 },
            { title: "Classic Film 3:2", koef: 3 / 2 },
            { title: "Cinemascope 21:9", koef: 21 / 9 }
        ];
        CameraParty._cameraConstraints = {
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
        media.CameraParty = CameraParty;
    })(media = app.media || (app.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camera.js.map