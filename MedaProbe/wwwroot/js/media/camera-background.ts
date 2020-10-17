
namespace app.media {

    export class CameraBackground extends CamcorderBase {

        protected _canvasVideoCtx: CanvasRenderingContext2D;

        constructor(element: Element, options: ICameraProbeOptions) {
            super(element, options);
        }

        protected async setupComponent() {
            super.setupComponent();

            // add video events
            this._video.addEventListener("play", ev => this.onVideoPlay(ev));
        }

        protected onVideoPlay(ev) {

            // remove invite text
            this._player.querySelector(".startup-text")?.remove();

            // get and save canvas's rendering context
            this._canvasVideoCtx = this._canvasVideo.getContext('2d');

            //start video capturing callback
            this.captureCallback();

        }

        protected async captureCallback() {

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
            this._canvasVideoCtx.drawImage(this._video, 0, 0, vw, vh,
                dr.cx, dr.cy, dr.cw, dr.ch);

            //this._canvasVideoCtx.drawImage(this._video, 0, 0, vw, vh);

            //repeat capturing
            setTimeout(() => this.captureCallback(), 0);
        }

    }


}