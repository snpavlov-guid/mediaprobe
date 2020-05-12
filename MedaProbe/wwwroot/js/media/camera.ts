
namespace app.media {

    export interface ICameraProbeOptions {
        detectorWorkerScriptUrl: string,
        debugLog: boolean,
        maxScreenshots: number;
    }

    export interface IResolitionOption {
        koef: number,
        title: string,
    }

    export class CameraParty
    {
        private _navigator: Navigator;
        private _element: Element;
        private _streamStarted: boolean;
        private _streamDetect: boolean;

        private _player: HTMLDivElement;
        private _controls: HTMLDivElement;
        private _cameraOptions: HTMLSelectElement;
        private _ratioOptions: HTMLSelectElement;
        private _video: HTMLVideoElement;
        private _overlayCanvas: HTMLCanvasElement;
        private _canvasImage: HTMLCanvasElement;
        private _canvasVideo: HTMLCanvasElement;
        private _screenshotImage: HTMLImageElement;
        private _btnPlay: HTMLButtonElement;
        private _btnPause: HTMLButtonElement;
        private _btnScreenshot: HTMLButtonElement;
        private _btnDetect: HTMLButtonElement;
        private _screenshotList: HTMLUListElement;

        private _imageCapture: ImageCapture;
        
        private _detector: Worker;
        private _detectorScript: string;
        private _debugLog: boolean;
        private _maxScreenshots: number;

        private _controlsViewAnimation: boolean;


        public static readonly requiredMediaFeatures = ['mediaDevices', 'getUserMedia'];

        public static readonly videoratios: IResolitionOption[] = [
            { title: "HD Video 16:9", koef: 16 / 9 },
            { title: "Standard Monitor 4:3", koef: 4 / 3 },
            { title: "Classic Film 3:2", koef: 3 /2 },
            { title: "Cinemascope 21:9", koef: 21 / 9}];
        
        static _cameraConstraints = {
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

        constructor(element: Element, options: ICameraProbeOptions) {
            this._navigator = window.navigator;
            this._element = element;
            this._streamStarted = false;
            this._streamDetect = false;

            this._detectorScript = options.detectorWorkerScriptUrl;
            this._debugLog = options.debugLog;
            this._maxScreenshots = options.maxScreenshots ? options.maxScreenshots : 10;

            this.setupComponent();
        }

        protected async setupComponent() {

            this._player = this._element.querySelector('#player');
            this._canvasVideo = this._element.querySelector('#player #cupture');
            this._video = this._element.querySelector('#player #video');
            this._overlayCanvas = this._element.querySelector('#player #overlay');
            this._cameraOptions = this._element.querySelector('.video-options > select');
            this._ratioOptions = this._element.querySelector('.video-ratio > select');
            this._canvasImage = this._element.querySelector('canvas#cupture-image');
            this._screenshotImage = this._element.querySelector('img.screenshot-image');
            this._controls = this._element.querySelector('#player .controls');
            this._screenshotList = this._element.querySelector('.video-screenshot .screenshot-list');

            let btns: HTMLButtonElement[] = [];
            this._element.querySelectorAll(".controls .btn").forEach(el => btns.push(<HTMLButtonElement>el));
            [this._btnPlay, this._btnPause, this._btnScreenshot, this._btnDetect] = [...btns];

            let cameraOptions = await this.getCameraSelectionOptions();
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
            this._btnScreenshot.onclick = () => { this.doScreenshot(); }
            this._btnDetect.onclick = () => { this.doDetect(); }

            this._player.addEventListener("mousemove", ev => { this.animControlsPanel() });

            this._screenshotList.addEventListener("click", ev => { this.doScreenshotCommand(ev) });

            window.addEventListener("resize", ev => { this.resizePlayer() });

            console.log("Camera player created");

        }

        protected async loadDetector() {

            this.setWaitCursor(true);
            this.setLoading(true);

            console.log("Detector worker loading...");

            this._detector = new Worker(this._detectorScript)

            await new Promise((resolve, reject) => {
                this._detector.onmessage = (_) => {
                    console.log("Detector worker loaded");
                    resolve()
                }
            })

            this.setLoading(false);
            this.setWaitCursor(false);
        }

        protected resizePlayer() {
            let koef = parseFloat(this._ratioOptions.value);
            this._player.style.height = Math.floor(this._player.offsetWidth / koef) + "px";

            this.setImageCaptureSize();
        }

        public setWaitCursor(wait: boolean) {
            if (wait) this._player.classList.add("wait-cursor")
            else this._player.classList.remove("wait-cursor") 
        }

        public setLoading(wait: boolean) {
            if (wait) {
                this._player.appendChild(this.getLoadingTemplate());
            } else {
                this._player.querySelector("ul.loading").remove();
            }

        }

        protected getVideoConstrains() : object {
            let constrains = {
                video: {
                    width: this._player.clientWidth,
                    height: this._player.clientHeight,
                }
            };
            return constrains;

            //return CameraParty._cameraConstraints;
        }
   
        public checkDeviceSupport() {
            var features = CameraParty.requiredMediaFeatures;

            for (let i = 0; i < features.length; i++) {
                if (features[i] in navigator) continue;
                return false;
            }

            return true;
        }

        public async requestUserPermission(supported?: boolean): Promise<boolean> {

            return new Promise<boolean>(async (resolve, reject) => {

                let isSupported = supported || this.checkDeviceSupport();

                if (isSupported) {
                    try {
                        await this._navigator.mediaDevices.getUserMedia({ video: true });
                        resolve(true);
                    }
                    catch
                    {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        }

        public async getMediaDevices(): Promise<MediaDeviceInfo[]> {
            return this._navigator.mediaDevices.enumerateDevices();
        }

        protected async getCameraSelectionOptions(): Promise<string[]> {

            return new Promise<string[]>(async (resolve, reject) => {
                const devices = await this._navigator.mediaDevices?.enumerateDevices();
                const videoDevices = devices?.filter(device => device.kind === 'videoinput');
                const options = videoDevices ? videoDevices.map(videoDevice => {
                    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
                }) : [];
                resolve(options);
            });

        }

        protected getRatioSelectionOptions(): string[] {
            var options: string[] = [];
            CameraParty.videoratios.forEach((el, i) => {
                options.push(`<option value="${el.koef}">${el.title}</option>`);
            });
            return options;
        }

 
        protected async getUserMediaStream(deviceId : string, constrains : object): Promise<MediaStream> {

            return new Promise<MediaStream>(async (resolve, reject) => {

                if (this.checkDeviceSupport()) {
                    try {

                        const givenCnstraints: MediaStreamConstraints = <MediaStreamConstraints>{
                            ...constrains,
                            deviceId: {
                                exact: deviceId
                            }
                        };

                        resolve(await this._navigator.mediaDevices.getUserMedia(givenCnstraints));

                    }
                    catch
                    {
                        resolve(null);
                    }
                } else
                {
                    resolve(null);
                }
            });
        }

        protected setControlState(streamStarted: boolean) {

            if (streamStarted) {
                this._btnPlay.classList.add('d-none');
                this._btnPause.classList.remove('d-none');
                this._btnDetect.classList.remove('d-none');
            } else {
                this._btnPlay.classList.remove('d-none');
                this._btnPause.classList.add('d-none');
                this._btnDetect.classList.add('d-none');
            }

            if (this._streamStarted)
                this._btnScreenshot.classList.remove('d-none');
            else 
                this._btnScreenshot.classList.add('d-none');
        }

        protected setDetectState(detectStarted: boolean) {
            if (detectStarted)
                this._btnDetect.classList.add('detecting-circle');
            else 
                this._btnDetect.classList.remove('detecting-circle');
        }

        protected animControlsPanel() {

            if (!this._controlsViewAnimation) {

                this._controlsViewAnimation = true;
                this._controls.classList.add("controls-view-animation");

                var onAnimationEnd = (ev: AnimationEvent) => {
                    if (ev.animationName != "anim-controls-hide") return;

                    this._controlsViewAnimation = false;
                    this._controls.classList.remove("controls-view-animation");
                    this._controls.removeEventListener("animationend", onAnimationEnd);
                }

                this._controls.addEventListener("animationend", onAnimationEnd);
  
            }
        }

        protected async startCamera() {

            if (this._streamStarted) {
                this._video.play();
                this.setControlState(true);
                return;
            }

            var stream = await this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());

            if (stream) {
                this._video.srcObject = stream;
                this._streamStarted = true;
                this.setControlState(true);
            }

        }

        protected pauseStream() {

            this._video.pause();

            this.setControlState(false);
        }

        protected async doScreenshot() {
            const maxItems: number = this._maxScreenshots;

            let dataUrl = await this.createImageDataUrl();

            if (this._screenshotList.children.length == maxItems) {
                this._screenshotList.lastChild.remove();
            }

            this._screenshotList.prepend(this.createScreenshotElement(dataUrl, new Date()));

        };

        protected async cameraOptions() {

           this._streamStarted = false;
           this.setControlState(false);

            var stream = await this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());

           if (stream) {
                this._video.srcObject = stream;
                this._streamStarted = true;
                this.setControlState(true);
           }

        }

        protected async ratioOptions() {
  
            this.resizePlayer();

            if (!this._streamStarted) return;

            this._streamStarted = false;
            this.setControlState(false);

            var stream = await this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());

            if (stream) {
                this._video.srcObject = stream;
                this._streamStarted = true;
                this.setControlState(true);
            } 

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

        protected async doDetect() {
            let streamDetected = !this._streamDetect;

            this._streamStarted = false;
            this.setControlState(false);

            var stream = await this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());

            if (stream) {
                this._video.srcObject = stream;
                this._streamStarted = true;
                this.setControlState(true);
            }

            if (stream && streamDetected) {
                await this.waitForVideoMetadata();

                this.setImageCaptureSize();

                this._imageCapture = new ImageCapture(stream.getVideoTracks()[0]);

                if (!this._detector) await this.loadDetector();
 
                this._streamDetect = true;

                // start detecting
                this.captureCallback();

                console.log("Detecting started");

            } else {

                this._imageCapture = null;

                this._streamDetect = false;

                console.log("Detecting stopped");
            }

            this.setDetectState(this._streamDetect);
            
        }

        protected async waitForVideoMetadata(): Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                this._video.onloadedmetadata = (ev) => resolve(true);
            })     
        }

        protected setImageCaptureSize() {
 
            this._canvasVideo.width = this._player.clientWidth;
            this._canvasVideo.height = this._player.clientHeight;

            this._overlayCanvas.width = this._player.clientWidth;
            this._overlayCanvas.height = this._player.clientHeight;

        }

        protected calcDestRect(player: HTMLElement, cadr: ImageBitmap): { cx: number, cy: number, cw: number, ch: number } {
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

        protected async captureCallback() {
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
            let imageBmp = await this._imageCapture.grabFrame();

            // calc frome destination rect
            let dr = this.calcDestRect(this._player, imageBmp);

            // put frame on capture canvas
            let videoCtx = this._canvasVideo.getContext('2d');

            videoCtx.drawImage(await imageBmp, 
                0, 0, imageBmp.width, imageBmp.height,
                dr.cx, dr.cy, dr.cw, dr.ch);
   
            // get image data
            let imgData = videoCtx.getImageData(0, 0, this._canvasVideo.clientWidth, this._canvasVideo.clientHeight);

            // detect image
            let predictions = await this.detectImage(imgData);

            // show detected predictions
            this.onDetected(predictions);

            // continue detecting loop
            setTimeout(() => this.captureCallback(), 0);
        }


        public async detectImage(imgData: ImageData): Promise<media.data.DetectedObject[]> {

            // post image to detection
            this._detector.postMessage(imgData);

            return await new Promise<media.data.DetectedObject[]>((resolve, reject) => {
                this._detector.onmessage = (ev: MessageEvent) => {
                    resolve(ev.data);
                }

            });

        }

        protected onDetected(predictions: media.data.DetectedObject[]) {

            if (this._debugLog) console.log("Detected: " + JSON.stringify(predictions));

            if (!Array.isArray(predictions)) return;

            var overlayContext2D = this._overlayCanvas.getContext("2d");

            this.showDetections(overlayContext2D, predictions);

        }

        protected showDetections(ctx: CanvasRenderingContext2D, predictions: media.data.DetectedObject[] ) {

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

        protected async createImageDataUrl() {
            var canvas = <HTMLCanvasElement>document.createElement("canvas");

            // grab video frame
            let stream = <MediaStream>this._video.srcObject;
            let imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
            let imageBmp = await imageCapture.grabFrame();

            // calc frome destination rect
            let dr = this.calcDestRect(this._player, imageBmp);

            canvas.width = dr.cw;
            canvas.height = dr.ch;

            let ctx = canvas.getContext('2d');

            ctx.drawImage(await imageBmp, 0, 0, dr.cw, dr.ch);

            if (this._streamDetect) {

                let videoImg = ctx.getImageData(0, 0, dr.cw, dr.ch);

                let overImg = this._overlayCanvas.getContext('2d').getImageData(dr.cx, dr.cy, dr.cw, dr.ch);

                let transImg = app.util.image.combineImageData(videoImg, overImg, new app.util.image.Color(0,0,0));

                ctx.putImageData(transImg, 0, 0);

            }

            let imgDataUrl = canvas.toDataURL('image/jpg');

            return imgDataUrl;
        }


        protected getScreenshotItemTemplate(): Node {
            let template = <HTMLTemplateElement>document.querySelector("#templates #screenshot-item");
            return template.content.cloneNode(true);
        }

        protected createScreenshotElement(dataUrl : string, time : Date): HTMLLIElement {
            const li = <HTMLLIElement>document.createElement("li");
            li.appendChild(this.getScreenshotItemTemplate());

            const img = <HTMLImageElement>li.querySelector("img#screenshot");
            img.src = dataUrl;

            const dtdata = time.toISOString();
            const options: Intl.DateTimeFormatOptions = {
                year: "numeric", month: "numeric", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
            }; 
            const dttext = new Intl.DateTimeFormat("en", options).format(time);

            const info = <HTMLDivElement>li.querySelector(".screenshot-info");
            info.setAttribute("data-datetime", dtdata);
            info.innerHTML = `${dttext}`;

            return li;
        }

        protected doScreenshotCommand(ev: MouseEvent) {

            const prefix : string = "screenshot";

            if (app.util.dom.filterEvent(ev, "ul.screenshot-list li button.screenshot-download")) {
                const li = app.util.dom.closest(<HTMLElement>ev.target, "ul.screenshot-list li");
                const img = li ? li.querySelector("img#screenshot") : null;
                if (img) {
                    const info = li.querySelector(".screenshot-info");
                    const date = new Date(info.getAttribute("data-datetime"));
                    const name = `${prefix} [${app.util.dom.toFileNamedDateFormat(date)}]`;    

                    this.downloadScreenshot(<HTMLImageElement>img, name);
                }
            }

            if (app.util.dom.filterEvent(ev, "ul.screenshot-list li button.screenshot-remove")) {
                const li = app.util.dom.closest(<HTMLElement>ev.target, "ul.screenshot-list li");

                if (li && confirm("You are about to remove screenshot?")) {
                    li.remove();
                }

            }
 
        }

        protected downloadScreenshot(img: HTMLImageElement, downloadName : string) {

            var link = document.createElement("a");
            link.download = downloadName;
            link.href = img.src;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }

        protected getLoadingTemplate(): Node {
            let template = <HTMLTemplateElement>document.querySelector("#templates #loading-indicator");
            return template.content.cloneNode(true);
        }

    }

}