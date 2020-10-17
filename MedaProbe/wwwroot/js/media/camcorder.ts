﻿
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

        protected _canvasVideo: HTMLCanvasElement;

        protected _btnPlay: HTMLButtonElement;
        protected _btnPause: HTMLButtonElement;
        protected _btnScreenshot: HTMLButtonElement;
        protected _btnDetect: HTMLButtonElement;

        protected _video: HTMLVideoElement;

        protected _controlsViewAnimation: boolean;


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
                catch  (e) {
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


        protected async getCameraSelectionOptions(): Promise<string[]> {
            return new Promise<string[]>(async (resolve, reject) => {
                const devices = await this._navigator.mediaDevices?.enumerateDevices();
                const videoDevices = devices?.filter(device => device.kind === 'videoinput');
                const options = videoDevices && videoDevices.length ? videoDevices.map(videoDevice => {
                    console.log(`Device: ${videoDevice.label}; Id: "${videoDevice.deviceId}"`);
                    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
                }) : [];
                resolve(options);
            });

        }

        protected async setupCameraSelectionOptions() {
            let cameraOptions = await this.getCameraSelectionOptions();
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

            // set size of the capture canvas
            this._canvasVideo.width = this._player.clientWidth;
            this._canvasVideo.height = this._player.clientHeight;

            //this.setImageCaptureSize();

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
                return;
            }

            // request and start media stream
            this.startMediaStream();

        }

        protected pauseStream() {

            this._video.pause();

            this.setControlState(false);
        }


    }

}