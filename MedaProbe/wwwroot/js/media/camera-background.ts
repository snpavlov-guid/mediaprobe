
namespace app.media {

    export interface ICameraBackgroundOptions extends ICamcorderOptions {
        displacementImage: string,
    }

    export class CameraBackground extends CamcorderBase {

        protected _app: PIXI.Application;
        protected _stage: PIXI.Container;
        protected _videoTexture: PIXI.Texture;
        protected _videoSprite: PIXI.Sprite;
        protected _ticker: PIXI.Ticker;

        protected _displacementImageUrl: string;
        protected _displacementSprite: PIXI.Sprite;

        protected _canvasVideoCtx: CanvasRenderingContext2D;
        protected _canvasOverlayCtx: CanvasRenderingContext2D;

        protected _canvasCadre: HTMLCanvasElement;
        protected _canvasCadreCtx: CanvasRenderingContext2D;

        protected _animationTimeoutId: number;

        protected _bodyPix: BodyPix.IBodyPix;

        constructor(element: Element, options: ICameraBackgroundOptions) {
            super(element, options);

            this._displacementImageUrl = options.displacementImage;
        }

        protected async setupComponent() {
            super.setupComponent();

            this._animationTimeoutId = 0;

            this._canvasCadre = this._element.querySelector('.video-player #cadre'); 

            // add video events
            this._video.addEventListener("play", ev => this.onVideoPlay(ev));

            this._video.addEventListener("canplay", ev => this.onVideoCanPlay(ev));
        }

        protected createPixi() {

            // check if app created
            if (this._app) return;

            // initialize PIXI app when player is ready to play
            this.initializePixi();

            // resize the player and PIXI's video texture
            this.resizePlayer();

            // TODO: add filters
            this.applyPixiFilrer();

            // start PIXI animation
            this.animatePixi();

        }

        protected destroyPixi() {

            if (!this._app) return;

            var app = this._app;
            var ticker = this._ticker;

            this._app = null;
            this._ticker = null;

            ticker.stop();
            ticker.destroy();

            app.destroy(false, { children: true, texture: true, baseTexture: true });

        }

        protected initializePixi() {

            this._app = new PIXI.Application({ view: this._canvasVideo, transparent: true });

            // create the root of the scene graph
            this._stage = new PIXI.Container();

            // create a video texture from a path
            this._videoTexture = PIXI.Texture.from(this._video);

            // create a new Sprite using the video texture (yes it's that easy)
            this._videoSprite = new PIXI.Sprite(this._videoTexture);

            this._stage.addChild(this._videoSprite);

            // create PIXI ticker
            this._ticker = new PIXI.Ticker();

            this._ticker.autoStart = true;

        }

        protected animatePixi() {

            // render the stage
            this._ticker.add((delta) => {
                this._videoTexture.update();

                if (this._displacementSprite && !this._video.paused) {
                        this._displacementSprite.x += 0.75 * delta;
                        this._displacementSprite.y += 0.75 ;
                }

                this._app.renderer.render(this._stage);

             });
            
        }

        protected applyPixiFilrer() {

            // Blur filter
            let blurFilter = new PIXI.filters.BlurFilter(20);

            blurFilter.blur = 50;
            blurFilter.quality = 10;


            // Displacement filter
            this._displacementSprite = PIXI.Sprite.from(this._displacementImageUrl);
            this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

            this._stage.addChild(this._displacementSprite);

            var displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite, 50);

            // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            displacementFilter.autoFit = false;

            this._stage.filters = [blurFilter];
            //this._stage.filters = [displacementFilter];

        }

        protected onVideoCanPlay(ev) {

            console.log("Video can play fired")

            // create PIXI staff with deffered way
            setTimeout(async () => {
                this.createPixi();

                if (this._streamDetect) {
                    await this.startDetection();
                }

            }, 0);
        }

        protected onVideoPlay(ev) {

            // remove invite text
            this._player.querySelector(".startup-text")?.remove();

        }

        protected resizePlayer() {
            super.resizePlayer();

            // resize renderer
            if (this._app) {
                this._app.renderer.resize(this._player.clientWidth, this._player.clientHeight);

                const vw = this._video.videoWidth;
                const vh = this._video.videoHeight;

                // calc frome destination rect
                let dr = this.calcDestRect(this._player, { width: vw, height: vh });

                this._videoSprite.x = dr.cx;
                this._videoSprite.y = dr.cy;

                this._videoSprite.width = dr.cw; 
                this._videoSprite.height = dr.ch;

            }

        }

        protected setImageCaptureSize() {
            super.setImageCaptureSize();

            if (this._canvasCadre) {
                this._canvasCadre.width = this._player.clientWidth;
                this._canvasCadre.height = this._player.clientHeight;
            }

        }

        protected async changeRatioSelection() {

            if (this._streamDetect) {
                this.stopDetection();
            }

            if (this._streamStarted) {
                this.destroyPixi();
            }

            await super.changeRatioSelection();

        }

        protected async startDetection() {

            // load body-pix detector worker
            if (!this._bodyPix) {
                this._bodyPix = await this.loadDetector<BodyPix.IBodyPix>(this.loadBodyPixDetector);
            }

            // Get overlay canvas
            this._canvasOverlayCtx = this._overlayVideo.getContext("2d"); 
            this._canvasCadreCtx = this._canvasCadre.getContext("2d");

            this._animationTimeoutId = requestAnimationFrame(async () => {

                await this.detectionMethod();

                this._overlayVideo.classList.remove("d-none");
                this._canvasVideo.classList.add("d-none");
            });

            console.log("Start detecting");

        }

        protected stopDetection() {

            this._canvasVideo.classList.remove("d-none");
            this._overlayVideo.classList.add("d-none");

            cancelAnimationFrame(this._animationTimeoutId);

            this._canvasOverlayCtx = null;
            this._canvasCadreCtx = null;

            console.log("Stop detecting");
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

        protected async detectionMethod() {

            if (!this._app) return;

            if (!this._bodyPix) return;

            if (!this._canvasOverlayCtx) return;

            //console.time('detectionMethod');

            // source video size
            const vw = this._video.videoWidth;
            const vh = this._video.videoHeight;

            let dr = this.calcDestRect(this._player, { width: vw, height: vh });

            //const vwp = this._player.clientWidth;
            //const vhp = this._player.clientHeight;

            // get image data from video stream via PIXI export
            //let videoCanvas = this._app.renderer.plugins.extract.canvas(this._videoSprite);
            //let videoCtx = videoCanvas.getContext('2d');
            //let cadr = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);

            // Export PIXI stage canvas
            let pixiCanvas = this._app.renderer.plugins.extract.canvas(this._stage);

            let canvasWidth = Math.min(this._canvasCadre.width, pixiCanvas.width);
            let canvasHeight = Math.min(this._canvasCadre.height, pixiCanvas.height);

            // get image data from video stream directly
            this._canvasCadreCtx.drawImage(this._video, 0, 0, vw, vh, 0, 0, dr.cw, dr.ch);
            let cadre = this._canvasCadreCtx.getImageData(0, 0, canvasWidth, canvasHeight);

            // get image data from PIXI stage
            let pixiCtx = pixiCanvas.getContext('2d');
            let frame = pixiCtx.getImageData(0, 0, canvasWidth, canvasHeight);

            //console.log(`Cadre: ${cadre.width}, ${cadre.height}`);
            //console.log(`Frame: ${frame.width}, ${frame.height}`);

            //const same = cadre.data.length == frame.data.length;
            //console.log(`IsSame: ${same}; Cadr: ${cadre.data.length}, Frame: ${frame.data.length}`);

            // detect image
            let segmentation = await this.detectBodyPixImage(cadre);

            // apply body by mask
            let scene = util.image.combineImagesByMask(frame, cadre, segmentation.data, p => !!p);

            //let scene = frame;

            // calc frome destination rect
            //let dr = this.calcDestRect(this._player, { width: vw, height: vh });

            // put image data
            this._canvasOverlayCtx?.putImageData(scene, dr.cx, dr.cy);

            //this._canvasOverlayCtx?.putImageData(scene, 0, 0);

            //console.timeEnd('detectionMethod');

            this._animationTimeoutId = requestAnimationFrame(async () => {
                await this.detectionMethod()
            });
        }

        protected async loadBodyPixDetector(): Promise<BodyPix.IBodyPix> {

            const bodyPix = (window as any).bodyPix;

            const net = <BodyPix.IBodyPix>await bodyPix.load();

            return net;
        }

        protected async detectBodyPixImage(imgData: ImageData): Promise<BodyPix.SemanticPersonSegmentation> {

            const segmentation = await this._bodyPix?.segmentPerson(imgData, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7
            });

            return segmentation;

        }
         
    }


}