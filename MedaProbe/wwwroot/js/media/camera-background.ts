
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

        protected _animationTimeoutId: number;

        constructor(element: Element, options: ICameraBackgroundOptions) {
            super(element, options);

            this._displacementImageUrl = options.displacementImage;
        }

        protected async setupComponent() {
            super.setupComponent();

            this._animationTimeoutId = 0;

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

            // load detector worker
            await this.loadDetector();

            // Get overlay canvas
            this._canvasOverlayCtx = this._overlayVideo.getContext("2d"); 

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

            // get image data from video stream
            let videoCanvas = this._app.renderer.plugins.extract.canvas(this._videoSprite);
            let videoCtx = videoCanvas.getContext('2d');
            let cadr = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);

            // get image data from PIXI stage
            let pixiCanvas = this._app.renderer.plugins.extract.canvas(this._stage);
            let pixiCtx = pixiCanvas.getContext('2d');
            let frame = pixiCtx.getImageData(0, 0, pixiCanvas.width, pixiCanvas.height);

            // detect image
            let segmentation = await this.detectImage<BodyPix.SemanticPersonSegmentation>(cadr);

            // apply body by mask
            let scene = util.image.combineImagesByMask(frame, cadr, segmentation.data, p => !!p);

            // source video size
            const vw = this._video.videoWidth;
            const vh = this._video.videoHeight;

            // calc frome destination rect
            let dr = this.calcDestRect(this._player, { width: vw, height: vh });

            // put image data
            this._canvasOverlayCtx.putImageData(scene, dr.cx, dr.cy);

            this._animationTimeoutId = requestAnimationFrame(async () => {
                await this.detectionMethod()
            });
        }
         
    }


}