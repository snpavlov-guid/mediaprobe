
namespace app.media {

    export class CameraBackground extends CamcorderBase {

        protected _sourceCanvas: HTMLCanvasElement;

        constructor(element: Element, options: ICameraProbeOptions) {
            super(element, options);

            this._sourceCanvas = this._element.querySelector('#source-canvas');
        }

    }


}