
namespace app.media {

    export interface ICameraBackgroundOptions extends ICamcorderOptions {
        displacementImage: string,
    }

    export interface IPixiStage {
        update();
        resize(view: HTMLElement);
        setVisibility(visible: boolean);
        destroy();
    }


    export class CameraBackground extends CamcorderBase {

        protected _app: PIXI.Application;
        protected _stage: PIXI.Container;
        protected _ticker: PIXI.Ticker;

        protected _pixiStages: { [key: string]: IPixiStage };
        protected _pixiFilters: app.pixi.PixiFilterManager;

        protected _activeStage: IPixiStage;

        protected _displacementImageUrl: string;

        protected _canvasVideoCtx: CanvasRenderingContext2D;
        protected _canvasOverlayCtx: CanvasRenderingContext2D;

        protected _canvasCadre: HTMLCanvasElement;
        protected _canvasCadreCtx: CanvasRenderingContext2D;

        protected _backgroundList: HTMLUListElement;
        protected _uploadImage: HTMLInputElement;

        protected _filterList: HTMLUListElement;

        protected _animationTimeoutId: number;

        protected _bodyPix: BodyPix.IBodyPix;

        constructor(element: Element, options: ICameraBackgroundOptions) {
            super(element, options);

            this._displacementImageUrl = options.displacementImage;
        }

        protected async setupComponent() {
            super.setupComponent();

            this._animationTimeoutId = 0;

            this._pixiStages = {};
            this._pixiFilters = new pixi.PixiFilterManager();

            this._canvasCadre = this._element.querySelector('.video-player #cadre'); 

            this._backgroundList = this._element.querySelector('.background-list');
            this._uploadImage = this._backgroundList.querySelector('.upload input[type=file]');

            this._filterList = this._element.querySelector('.filter-list');

            // Video events
            this._video.addEventListener("play", ev => this.onVideoPlay(ev));

            this._video.addEventListener("canplay", ev => this.onVideoCanPlay(ev));

            // Background list events
            this._backgroundList.addEventListener("change", ev => { this.doBackgroundApply(ev) });

            this._backgroundList.addEventListener("click", ev => { this.doBackgroundCommand(ev) });

            this._uploadImage.addEventListener("change", ev => { this.doBackgroundUpload(ev) });

            // Filter list events
            this._filterList.addEventListener("change", ev => { this.doFilterApply(ev) });

        }

        protected createPixi() {

            // check if app created
            if (this._app) return;

            // initialize PIXI app when player is ready to play
            this.initializePixi();

            // initialize PIXI stage sprites
            this.initializePixiStages();

            // initialize PIXI filters
            this.initializePixiFilters();

            // resize the player and PIXI's video texture
            this.resizePlayer();

            // start PIXI animation
            this.animatePixi();

        }

        protected destroyPixi() {

            if (!this._app) return;

            var app = this._app;
            var ticker = this._ticker;

            this._app = null;
            this._ticker = null;

            //for (let key in this._pixiStages) {
            //    this._pixiStages[key].destroy();
            //}

            //this._pixiStages = {};

            this._pixiFilters.clear();

            ticker.stop();
            ticker.destroy();

            app.destroy(false, { children: true, texture: true, baseTexture: true });

        }

        protected initializePixi() {

            this._app = new PIXI.Application({ view: this._canvasVideo, transparent: true });

            // create the root of the scene graph
            this._stage = new PIXI.Container();

            // create PIXI ticker
            this._ticker = new PIXI.Ticker();

            this._ticker.autoStart = true;

        }

        protected initializePixiStages() {

            // Find selected background option
            const radio = <HTMLInputElement>this._backgroundList.querySelector('li input[type=radio]:checked');
            const value = radio?.value;
            let key = PixiVideoStage.SpriteName;

            // Createv video sprite
            this._pixiStages[key] = new PixiVideoStage(this._stage, this._video, false);

            // create bk image selected 
            if (value == PixiBroadsheet.SpriteName) {
                key = PixiBroadsheet.SpriteName;
                const li = app.util.dom.closest(radio, "ul.background-list li");
                const img = <HTMLImageElement>li.querySelector("img.content");
                this._pixiStages[key] = new PixiBroadsheet(this._stage, this._video, img, false);
            }

            this._activeStage = this._pixiStages[key];
            this._activeStage.setVisibility(true);
        }

        protected initializePixiFilters() {

            // Add blur filter
            this._pixiFilters.addFilter(pixi.PixiFilterNames.BlurFilter, new pixi.PixiBlurFilter(false));

            // Add displacement filter
            this._pixiFilters.addFilter(pixi.PixiFilterNames.DisplacementFilter,
                new pixi.PixiDisplacementFilter(this._stage, this._displacementImageUrl, false));

            // Find selected filter option
            const checkedFilters = this._filterList.querySelectorAll('li input[type=checkbox]:checked');

            const filterNames: string[] = [];
            checkedFilters.forEach(x => filterNames.push((<HTMLInputElement>x).value));

            // enable filters
            this._pixiFilters.enableFilters(filterNames, true);

            // set filters to the stage
            this._stage.filters = this._pixiFilters.getFilters();

        }

        protected animatePixi() {

            // render the stage
            this._ticker.add((delta) => {

                if (!this._video.paused) {

                    // stage update operations for animation
                    this._activeStage.update();

                    this._pixiFilters.animate(delta);
                }

                // render PIXI stage
                this._app.renderer.render(this._stage);

             });
            
        }

        //protected applyPixiFilrer() {

        //    // Blur filter
        //    let blurFilter = new PIXI.filters.BlurFilter(20);

        //    blurFilter.blur = 50;
        //    blurFilter.quality = 10;


        //    // Displacement filter
        //    this._displacementSprite = PIXI.Sprite.from(this._displacementImageUrl);
        //    this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

        //    this._stage.addChild(this._displacementSprite);

        //    var displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite, 50);

        //    // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
        //    displacementFilter.autoFit = false;

        //    this._stage.filters = [blurFilter];
        //    //this._stage.filters = [displacementFilter];

        //}

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
    
                this._activeStage.resize(this._player);

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

            //// load body-pix detector class
            //if (!this._bodyPix) {
            //    this._bodyPix = await this.loadDetector<BodyPix.IBodyPix>(this.loadBodyPixDetector);
            //}

            // load body-pix detector worker
            await this.loadDetectorWorker();

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

            //if (!this._bodyPix) return;

            if (!this._canvasOverlayCtx) return;

            //console.time('detectionMethod');

            // source video size
            const vw = this._video.videoWidth;
            const vh = this._video.videoHeight;

            // video frame adjustments
            let dr = this.calcDestRect(this._player, { width: vw, height: vh });

            // get image data from video stream via PIXI export
            //let videoCanvas = this._app.renderer.plugins.extract.canvas(this._videoSprite);
            //let videoCtx = videoCanvas.getContext('2d');
            //let cadr = videoCtx.getImageData(0, 0, videoCanvas.width, videoCanvas.height);

            // Export PIXI stage canvas
            let pixiCanvas = this._app.renderer.plugins.extract.canvas(this._stage);

            // Adjust size of result canvas by source camvases 
            let canvasWidth = Math.min(this._canvasCadre.width, pixiCanvas.width);
            let canvasHeight = Math.min(this._canvasCadre.height, pixiCanvas.height);

            // get image data from video stream directly
            this._canvasCadreCtx.drawImage(this._video, 0, 0, vw, vh, 0, 0, dr.cw, dr.ch);
            let cadre = this._canvasCadreCtx.getImageData(0, 0, canvasWidth, canvasHeight);

            // get image data from PIXI stage
            let pixiCtx = pixiCanvas.getContext('2d');
            let frame = pixiCtx.getImageData(0, 0, canvasWidth, canvasHeight);

            // detect image
            //let segmentation = await this.detectBodyPixImage(cadre);
            let segmentation = await this.detectImageWorker<BodyPix.SemanticPersonSegmentation>(cadre);

            // apply body by mask
            let scene = segmentation && segmentation.data ?
                util.image.combineImagesByMask(frame, cadre, segmentation.data, p => !!p) :
                frame;

            //let scene = frame;

            // put image data
            this._canvasOverlayCtx?.putImageData(scene, dr.cx, dr.cy);

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

        // region Backgrounds
        protected doBackgroundApply(ev: Event) {

            if (!this._app) return;

            if (app.util.dom.filterEvent(ev, "ul.background-list li input[type=radio]")) {
                const li = app.util.dom.closest(<HTMLElement>ev.target, "ul.background-list li");
                const radio = <HTMLInputElement>li.querySelector("input[type=radio]");
                const value = radio.value;

                let selectedStage: IPixiStage;

                if (value == PixiVideoStage.SpriteName) {
                    selectedStage = this._pixiStages[PixiVideoStage.SpriteName];

                } else if (value == PixiBroadsheet.SpriteName) {
                    const img = <HTMLImageElement>li.querySelector("img.content");
                    selectedStage = new PixiBroadsheet(this._stage, this._video, img);
                    this._pixiStages[PixiBroadsheet.SpriteName] = selectedStage;
                }

                selectedStage.setVisibility(true);
                selectedStage.resize(this._player);

                this._activeStage.setVisibility(false);
                this._activeStage = selectedStage;
               
            }

        }

        protected doBackgroundUpload(ev: Event) {
            const upload = <HTMLInputElement>ev.target;
            if (!upload.files.length) return;

            const li = app.util.dom.closest(upload, "ul.background-list li");
            const template = <HTMLTemplateElement>document.querySelector("#templates #background-item");
            const item = <DocumentFragment>template.content.cloneNode(true);
            const img = <HTMLImageElement>item.querySelector("img.content");
            const radio = <HTMLInputElement>item.querySelector("input[type=radio]");
            this._backgroundList.insertBefore(item, li);

            const reader = new FileReader();
            reader.addEventListener('load', (event) => {
                // Set image content
                img.src = <string>event.target.result;

                // Set radio value and trigger radio change event
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));

            });
            reader.readAsDataURL(upload.files[0]);

        }

        protected doBackgroundCommand(ev: Event) {

            if (app.util.dom.filterEvent(ev, "ul.background-list li button.item-remove")) {
                const li = app.util.dom.closest(<HTMLElement>ev.target, "ul.background-list li");
                const radio = <HTMLInputElement>li.querySelector("input[type=radio]");
                const rvideo = <HTMLInputElement>this._backgroundList.querySelector("ul.background-list li input[value=video]");

                if (li && confirm("You are about to remove background?")) {
                    if (radio.checked) {
                        // Set radio value and trigger radio change event
                        rvideo.checked = true;
                        rvideo.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    li.remove();
                }

            }
        }

        protected doFilterApply(ev: Event) {

            if (!this._app) return;

            if (app.util.dom.filterEvent(ev, "ul.filter-list li input[type=checkbox]")) {
                const li = app.util.dom.closest(<HTMLElement>ev.target, "ul.filter-list li");
                const checkbox = <HTMLInputElement>li.querySelector("input[type=checkbox]");

                // set enabled for a filter
                this._pixiFilters.enable(checkbox.value, checkbox.checked);

            }

        }
         
    }


    export class PixiVideoStage implements IPixiStage {

        protected _video: HTMLVideoElement;
        protected _videoTexture: PIXI.Texture;
        protected _videoSprite: PIXI.Sprite;

        public static SpriteName = "video";

        constructor(stage: PIXI.Container, video: HTMLVideoElement, visibility: boolean = true) {
            this._video = video;
            this.init(stage, video);
            this.setVisibility(visibility);
        }
 
        protected init(stage: PIXI.Container, video: HTMLVideoElement) {

            // create a video texture from a path
            this._videoTexture = PIXI.Texture.from(video);

            // create a new Sprite using the video texture (yes it's that easy)
            this._videoSprite = new PIXI.Sprite(this._videoTexture);
            this._videoSprite.name = PixiVideoStage.SpriteName;

            stage.addChild(this._videoSprite);
        }

        // region Interface IPixiStage

        setVisibility(visible: boolean) {
            this._videoSprite.visible = visible;

            this._videoSprite.scale.x = visible ? 1 : 0;
            this._videoSprite.scale.y = visible ? 1 : 0;
        }

        update() {
            this._videoTexture.update();
        }

        resize(view: HTMLElement) {

            const size: ISize = {
                width: this._video.videoWidth,
                height: this._video.videoHeight,
            };

            // calc frome destination rect
            const dr = Behaviors.calcDestRect(view, size);

            this._videoSprite.x = dr.cx;
            this._videoSprite.y = dr.cy;

            this._videoSprite.width = dr.cw;
            this._videoSprite.height = dr.ch;

        }

        destroy() {
            this._videoSprite.destroy({ children: true, texture: true, baseTexture:true });
        }

        // endregion

    } 

    export class PixiBroadsheet implements IPixiStage {

        protected _video: HTMLVideoElement;
        protected _image: HTMLImageElement;
        protected _imageTexture: PIXI.Texture;
        protected _imageSprite: PIXI.Sprite;

        public static SpriteName = "image";

        constructor(stage: PIXI.Container, video: HTMLVideoElement, image: HTMLImageElement, visibility: boolean = true) {
            this._video = video;
            this._image = image;
            this.init(stage, image);
            this.setVisibility(visibility);
        }
 
        protected init(stage: PIXI.Container, image: HTMLImageElement) {

            this._imageTexture = PIXI.Texture.from(image);
            this._imageTexture.baseTexture.setSize(image.naturalWidth, image.naturalHeight);

            this._imageSprite = new PIXI.Sprite(this._imageTexture);

            stage.addChild(this._imageSprite);
        }

        // region Interface IPixiStage

        setVisibility(visible: boolean) {
            this._imageSprite.visible = visible;
        }

        update() {
            // no update required
        }

        resize(view: HTMLElement) {

            const size: ISize = {
                width: this._imageSprite.width,
                height: this._imageSprite.height,
            };

            // calc frome destination rect
            const dr = Behaviors.calcDestRect(view, size, false);

            this._imageSprite.x = dr.cx;
            this._imageSprite.y = dr.cy;

            this._imageSprite.width = dr.cw;
            this._imageSprite.height = dr.ch;


            // clip sprite by video borders
            const vsize: ISize = {
                width: this._video.videoWidth,
                height: this._video.videoHeight,
            };

            // calc frome destination rect
            const vdr = Behaviors.calcDestRect(view, vsize);

            const mask = new PIXI.Graphics()
            mask.beginFill(0x000000)
            mask.drawRect(vdr.cx + dr.cx, vdr.cy + dr.cy, vdr.cw, vdr.ch);
            this._imageSprite.mask = mask;

        }

        destroy() {
            this._imageSprite.destroy({ children: true, texture: true, baseTexture: true });
        }

        // endregion


    }

}