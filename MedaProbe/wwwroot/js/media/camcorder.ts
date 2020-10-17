
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

        private _navigator: Navigator;
        private _element: Element;
        private _streamStarted: boolean;
        private _streamDetect: boolean;

        private _detectorScript: string;
        private _debugLog: boolean;
        private _maxScreenshots: number;

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
        }

        protected async setupComponent() {

        }

    }

}