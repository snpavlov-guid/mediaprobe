
namespace app.media {

    export interface ICamcorderOptions {
        detectorWorkerScriptUrl: string,
        debugLog: boolean,
        maxScreenshots: number;
    }

    export interface ICamcorderResolitionOption {
        koef: number,
        title: string,
    }

    export interface ISize {
        width: number,
        height: number
    }

    export interface IOffsetSize {
        cx: number,
        cy: number,
        cw: number,
        ch: number
    }
   

    export class CamcorderBase {

        protected _navigator: Navigator;
        protected _element: Element;
 
        protected _detectorScript: string;
        protected _debugLog: boolean;
        protected _maxScreenshots: number;

        protected _streamStarted: boolean;
        protected _streamDetect: boolean;

        protected _player: HTMLDivElement;
        protected _controls: HTMLDivElement;
        protected _cameraOptions: HTMLSelectElement;
        protected _ratioOptions: HTMLSelectElement;

        protected _btnPlay: HTMLButtonElement;
        protected _btnPause: HTMLButtonElement;
        protected _btnScreenshot: HTMLButtonElement;
        protected _btnDetect: HTMLButtonElement;

        protected _video: HTMLVideoElement;
        protected _canvasVideo: HTMLCanvasElement;
        protected _overlayVideo: HTMLCanvasElement;

        protected _controlsViewAnimation: boolean;

        protected _detector: Worker;


        public static readonly requiredMediaFeatures = ['mediaDevices', 'getUserMedia'];

        public static readonly videoratios: IResolitionOption[] = [
            { title: "HD Video 16:9", koef: 16 / 9 },
            { title: "Standard Monitor 4:3", koef: 4 / 3 },
            { title: "Classic Film 3:2", koef: 3 / 2 },
            { title: "Cinemascope 21:9", koef: 21 / 9 }];

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

        protected async setupComponent() {
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
            this._btnDetect.onclick = () => { this.doDetect(); }
            this._btnScreenshot.onclick = () => { this.doScreenshot(); }

            this._player.addEventListener("mousemove", ev => { this.animControlsPanel() });

            window.addEventListener("resize", ev => { this.resizePlayer() });

            console.log("Camera player created");
        }

        protected async getUserMediaStream(deviceId: string, constrains: object): Promise<MediaStream> {

            return new Promise<MediaStream>(async (resolve, reject) => {

                if (!this.checkDeviceSupport()) reject("No required media features!");

                try {

                    const givenConstraints: MediaStreamConstraints = <MediaStreamConstraints>{
                        ...constrains,
                    };

                    (<MediaTrackConstraints>givenConstraints.video).deviceId = { exact: deviceId };

                    console.log("Trying to get media stream with constraints: " + JSON.stringify(givenConstraints));

                    resolve(await this._navigator.mediaDevices.getUserMedia(givenConstraints));

                }
                catch (e) {
                    console.error(`${e.name}, ${e.message}`);
                    reject(e);
                }
         
            });
        }

        protected getVideoConstrains(): object {
            let constrains = {
                video: {
                    width: this._player.clientWidth,
                    height: this._player.clientHeight,
                }
            };
            return constrains;
        }

        protected checkDeviceSupport() {
            const features = CamcorderBase.requiredMediaFeatures;

            for (let i = 0; i < features.length; i++) {
                if (features[i] in navigator) continue;
                return false;
            }

            return true;
        }

        protected async startMediaStream() {

            if (!this._cameraOptions.value) return;

            var stream = await this.getUserMediaStream(this._cameraOptions.value, this.getVideoConstrains());

            if (stream) {
                this._video.srcObject = stream;
                this._streamStarted = true;
                this.setControlState(true);
            }
        }

        protected stopMediaTracks(stream: MediaStream) {
            if (!stream) return;

            stream.getTracks().forEach(track => {
                track.stop();
            });
        }


        protected async getCameraSelectionOptions(constrains : object): Promise<string[]> {
            return new Promise<string[]>(async (resolve, reject) => {
                const givenConstraints: MediaStreamConstraints = <MediaStreamConstraints>{ ...constrains };
                await this._navigator.mediaDevices.getUserMedia(givenConstraints);

                const devices = await this._navigator.mediaDevices?.enumerateDevices();
                const videoDevices = devices?.filter(device => device.kind === 'videoinput' && device.deviceId && device.label);
                const options = videoDevices && videoDevices.length ? videoDevices.map(videoDevice => {
                    console.log(`Device: ${videoDevice.label}; Id: "${videoDevice.deviceId}"`);
                    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
                }) : [];
                resolve(options);
            });

        }

        protected async setupCameraSelectionOptions() {
            let cameraOptions = await this.getCameraSelectionOptions(this.getVideoConstrains());
            this._cameraOptions.innerHTML = cameraOptions.join('');
        }

        protected setupRatioSelectionOptions() {
            var ratioOptions: string[] = [];
            CamcorderBase.videoratios.forEach((el, i) => {
                ratioOptions.push(`<option value="${el.koef}">${el.title}</option>`);
            });
            this._ratioOptions.innerHTML = ratioOptions.join('');
            this._ratioOptions.selectedIndex = CamcorderBase.videoratios.length - 1;
        }

        protected setupPlayerButtons() {
            let btns: HTMLButtonElement[] = [];
            this._controls.querySelectorAll(".buttons .btn").forEach(el => btns.push(<HTMLButtonElement>el));
            [this._btnPlay, this._btnPause, this._btnScreenshot, this._btnDetect] = [...btns];
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

        protected resizePlayer() {
            let koef = parseFloat(this._ratioOptions.value);
            this._player.style.height = Math.floor(this._player.offsetWidth / koef) + "px";

            this.setImageCaptureSize();
        }

        protected setImageCaptureSize() {

            this._canvasVideo.width = this._player.clientWidth;
            this._canvasVideo.height = this._player.clientHeight;

            this._overlayVideo.width = this._player.clientWidth;
            this._overlayVideo.height = this._player.clientHeight;

        }

        protected async waitForVideoMetadata(): Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                this._video.onloadedmetadata = (ev) => resolve(true);
            })
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

        protected getLoadingTemplate(): Node {
            let template = <HTMLTemplateElement>document.querySelector("#templates #loading-indicator");
            return template.content.cloneNode(true);
        }

        protected async changeCameraSelection() {

            console.log(`Selected device: ${this._cameraOptions.options[this._cameraOptions.selectedIndex].text}; Id: "${this._cameraOptions.value}"`);

            if (!this._streamStarted) return;

            this._streamStarted = false;
            this.setControlState(false);

            this.stopMediaTracks(<MediaStream>this._video.srcObject);

            // request and start media stream
            this.startMediaStream();

            //this.refreshDetection(stream);

        }

        protected async changeRatioSelection() {

            this.resizePlayer();

            if (!this._streamStarted) return;

            this._streamStarted = false;
            this.setControlState(false);

            // request and start media stream
            this.startMediaStream();

            //this.refreshDetection(stream);
        }

        protected async startStream() {

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

        }

        protected pauseStream() {

            this._video.pause();

            if (this._streamDetect) {
                this.stopDetection();
            }

            this.setControlState(false);
        }

        protected async doDetect() {
            let streamDetected = !this._streamDetect;

            if (streamDetected)
                this.startDetection();
            else
                this.stopDetection();

            this._streamDetect = streamDetected;

            this.setDetectState(this._streamDetect);
        }


        protected calcDestRect(player: HTMLElement, cadr: { width: number, height : number }) :
                       { cx: number, cy: number, cw: number, ch: number } {
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

        protected startDetection() {

        }

        protected stopDetection() {

        }

        protected async loadDetectorMethod<TDetector>(): Promise<TDetector> {
            return await new Promise<TDetector>((resolve, reject) => {
                resolve(<TDetector>{});
            });
        }

        protected async loadDetector<TDetector>(loadMethod : () => Promise<TDetector>): Promise<TDetector> {

            this.setWaitCursor(true);
            this.setLoading(true);

            console.log("Detector worker loading...");

            let detector = await loadMethod();

            console.log("Detector worker loaded");

            this.setLoading(false);
            this.setWaitCursor(false);

            return detector;
        }

        protected async loadDetectorWorker() {

            if (this._detector) return;

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

        protected async detectImageWorker<TRES>(imgData: ImageData): Promise<TRES> {

            // post image to detection
            this._detector.postMessage({ command: "detect",  image: imgData });

            return await new Promise<TRES>((resolve, reject) => {
                this._detector.onmessage = (ev: MessageEvent) => {
                    resolve(ev.data);
                }

            });

        }

        protected async setDetectOptionsWorker(options: any): Promise<boolean> {

            // post image to detection
            this._detector.postMessage({ command: "options", options: options });

            return await new Promise<boolean>((resolve, reject) => {
                this._detector.onmessage = (ev: MessageEvent) => {
                    resolve(true);
                }

            });

        }

        protected async doScreenshot() {
           
        };

        protected getScreenshotItemTemplate(): Node {
            let template = <HTMLTemplateElement>document.querySelector("template#screenshot-item");
            return template.content.cloneNode(true);
        }

        protected createScreenshotElement(dataUrl: string, time: Date): HTMLLIElement {
            const li = <HTMLLIElement>this.getScreenshotItemTemplate();

            const img = <HTMLImageElement>li.querySelector("img.content");
            img.src = dataUrl;

            const dtdata = time.toISOString();
            const options: Intl.DateTimeFormatOptions = {
                year: "numeric", month: "numeric", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
            };
            const dttext = new Intl.DateTimeFormat("en", options).format(time);

            const info = <HTMLDivElement>li.querySelector(".preset-info");
            info.setAttribute("data-datetime", dtdata);
            info.innerHTML = `${dttext}`;

            return li;
        }

        protected downloadScreenshot(img: HTMLImageElement, downloadName: string) {

            var link = document.createElement("a");
            link.download = downloadName;
            link.href = img.src;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }
  
    }

    export class Behaviors {

        public static calcDestRect(view: HTMLElement, cadre: ISize, contains: boolean = true): IOffsetSize {
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

        public static calcSpriteScale(view: HTMLElement, cadre: ISize):
            { scale: PIXI.Point, offset: PIXI.Point } {
            const result = <{ scale: PIXI.Point, offset: PIXI.Point }>{};

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


  
}