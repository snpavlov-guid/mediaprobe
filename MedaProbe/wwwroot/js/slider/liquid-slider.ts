
namespace app.slider {

    export interface ISliderOptions {
        timeout : number;
        stageWidth: number,
        stageHeight: number,
        pixiSprites: any[],
        centerSprites: boolean,
        texts: string[],
        autoPlay: boolean,
        autoPlaySpeed: [number, number],
        fullScreen: boolean,
        displaceScale: [number, number],
        displacementImage: string,
        displacementImageScale: number,
        navElement: any,
        displaceAutoFit: boolean,
        wacky: boolean,
        interactive: boolean,
        interactionEvent: string,
        displaceScaleTo: [number, number],
        textColor: string,
        displacementCenter: boolean,
        dispatchPointerOver: boolean,
        slideSelector: string;
        spriteSelector: string,
    }


    export interface ISlideProxy {
        current(): PIXI.DisplayObject,
        item(index: number): PIXI.DisplayObject,
        next(): PIXI.DisplayObject,
        displacementFilter: () => PIXI.filters.DisplacementFilter,
        displaceScale: () => [number, number],
        displaceScaleTo: () => [number, number]
    }


    export class LiquidSlider implements ISlideProxy {

        private _options: ISliderOptions;

        private _currentSprite: number;

        private _element: HTMLElement;
        private _renderer: PIXI.Renderer;
        private _stage: PIXI.Container;
        private _slidesContainer: PIXI.Container;
        private _displacementSprite: PIXI.Sprite;
        private _displacementFilter: PIXI.filters.DisplacementFilter;
        private _textStyle;

        static _defaultOptions = <ISliderOptions>{
            timeout: 5000,
            stageWidth: 1920,
            stageHeight: 1080,
            pixiSprites: [],
            texts: [],
            centerSprites: false,
            autoPlay: true,
            autoPlaySpeed: [10, 3],
            displaceScale: [200, 70],
            displaceScaleTo: [20, 20],
            displacementImage: "",
            displacementImageScale: 2,
            displaceAutoFit: false,
            wacky: false,
            interactive: false,
            slideSelector: ".slide",
            spriteSelector: "img.surface",
        };

        constructor(element: HTMLElement, options: ISliderOptions) {

            this._element = element;

            this._options = <ISliderOptions>app.util.data.extend(true, LiquidSlider._defaultOptions, options);

            this._currentSprite = 0;

            this.initializePixi();

            this.initDisplacementFilter(this._displacementFilter, this._displacementSprite);

            this.loadSlides(this.querySprites());

            this.renderStage();

            this.runSlider();

            this.resizeSlider();

            window.addEventListener("resize", ev => { this.resizeSlider() });

        }

        protected sprites(): number {
            return this._slidesContainer.children.length;
        }

        protected initializePixi() {

            this._renderer = PIXI.autoDetectRenderer({
                width: this._options.stageWidth,
                height: this._options.stageHeight,
                transparent: true,
            });

            this._element.appendChild(this._renderer.view); // Add canvas to the HTML

            this._stage = new PIXI.Container();
            this._stage.interactive = true; // LOOK IT!

            this._slidesContainer = new PIXI.Container();
            this._stage.addChild(this._slidesContainer); // Add child container to the main container 

            this._displacementSprite = PIXI.Sprite.from(this._options.displacementImage);
            this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

            this._displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite);

            this._stage.filters = [this._displacementFilter];
            this._stage.addChild(this._displacementSprite);

            this._textStyle = new PIXI.TextStyle({
                fill: this._options.textColor,
                wordWrap: true,
                wordWrapWidth: 400,
                letterSpacing: 20,
                fontSize: 14
            });


        }

        protected initDisplacementFilter(
            filter: PIXI.filters.DisplacementFilter, sprite: PIXI.Sprite) {

            if (!this._options.autoPlay) {
                filter.scale.x = 0;
                filter.scale.y = 0;
            }

            if (this._options.wacky) {
                sprite.anchor.set(0.5);
                sprite.x = this._renderer.width / 2;
                sprite.y = this._renderer.height / 2;
            }

            sprite.scale.x = this._options.displacementImageScale;
            sprite.scale.y = this._options.displacementImageScale;

            // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            //filter.autoFit = this._options.displaceAutoFit;

        }

        protected querySprites(): string[] {

            var sprites: string[] = [];
            const slides: { order: number, sprites: string[] }[] = [];

            this._element.querySelectorAll(this._options.slideSelector)
                .forEach(el => {
                    const slide: { order: number, sprites: string[] } =
                        <{ order: number, sprites: string[] }>{};

                    slide.order = parseInt(getComputedStyle(el).getPropertyValue("--i"));
                    slide.sprites = [];

                    el.querySelectorAll(this._options.spriteSelector)
                        .forEach(spi => {
                            slide.sprites.push((<HTMLImageElement>spi).src);
                        });

                    slides.push(slide);
                });

            slides.sort((a, b) => {
                if (a.order > b.order) return 1;
                if (a.order < b.order) return -1;
                return 0;
            });

            slides.forEach(el => {
                sprites = sprites.concat(el.sprites);
            });

            return sprites;
        }

        protected loadSlides(sprites: string[]) {

            for (let i = 0; i < sprites.length; i++) {

                const texture = PIXI.Texture.from(sprites[i]);
                const image = new PIXI.Sprite(texture);

                if (i != this._currentSprite) {
                    image.alpha = 0;
                }

                if (this._options.centerSprites === true) {
                    image.anchor.set(0.5);
                    image.x = this._renderer.width / 2;
                    image.y = this._renderer.height / 2;
                }


                this._slidesContainer.addChild(image);

            }

        }

        protected renderStage() {

            const ticker = new PIXI.Ticker();

            ticker.autoStart = true;

            if (this._options.autoPlay) {

                ticker.add(delta => {

                    this._displacementSprite.x += this._options.autoPlaySpeed[0] * delta;
                    this._displacementSprite.y += this._options.autoPlaySpeed[1];

                    this._renderer.render(this._stage);

                });

            } else {

                ticker.add(delta => {
                    this._renderer.render(this._stage);
                });

            }

        }

        protected runSlider() {

            setInterval(async () => {

                //const newIndex = (this._currentSprite + 1) % this.sprites();

                await this._slideTransition();

                //this._slidesContainer.children[this._currentSprite].alpha = 0;

                //this._currentSprite = (this._currentSprite + 1) % this.sprites();

                //this._slidesContainer.children[this._currentSprite].alpha = 1;
             

            }, this._options.timeout);
        }

        protected async _slideTransition(): Promise<void> {
            const self = this;

            return await new Promise<void>((resolve, reject) => {

               const baseTimeline = new window.TimelineMax({
                    onComplete: function () {

                        self._currentSprite = self.nextSlideIndex();

                        if (self._options.wacky) {
                            //self._displacementSprite.scale.set(1);
                            self._displacementSprite.scale.x = this._options.displacementImageScale;
                            self._displacementSprite.scale.y = this._options.displacementImageScale;
                        }          

                        resolve();

                    }, onUpdate: function () {

                        if (self._options.wacky) {
                            self._displacementSprite.rotation += baseTimeline.progress() * 0.02;
                            self._displacementSprite.scale.set(baseTimeline.progress() * 3);
                        }          
                    }
                });

                baseTimeline.clear();

                if (baseTimeline.isActive()) {
                    return;
                }

                // Default slide transition animation
                LiquidSlider.slideTransitionAnimation(self, baseTimeline);

                //baseTimeline
                //    .to(self.displacementFilter().scale, 0.8, { x: self.displaceScale()[0], y: self.displaceScale()[1], ease: window.Power2.easeIn })
                //    .to(self.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.4)
                //    .to(self.next(), 0.8, { alpha: 1, ease: window.Power2.easeOut }, 1)
                //    .to(self.displacementFilter().scale, 0.7, { x: self.displaceScaleTo()[0], y: self.displaceScaleTo()[1], ease: window.Power1.easeOut }, 0.9);

            })

        }


        protected calcStageScale(slider: HTMLElement, stageWidth: number, stageHeight: number):
            { scale: PIXI.Point, offset: PIXI.Point }
        {
            const result = <{ scale: PIXI.Point, offset: PIXI.Point }>{ };
 
            const wkf = slider.clientWidth / stageWidth;
            const hkf = slider.clientHeight / stageHeight;

            const kt = wkf > hkf ? wkf : hkf;

            result.scale = new PIXI.Point(kt, kt);
            result.offset = new PIXI.Point();

            const cw = stageWidth * kt;
            const ch = stageHeight * kt;

            if (wkf > hkf)
                result.offset.y = (slider.clientHeight - ch) / 2;
            else
                result.offset.x = (slider.clientWidth - cw) / 2;

            //console.log("sw: " + slider.clientWidth + ", cw: " + cw + ", xo: " + result.offset.x);
            //console.log("sh: " + slider.clientHeight + ", ch: " + ch + ", yo: " + result.offset.y);

            return result;

        }

        protected resizeSlider() {

            this._renderer.resize(this._element.clientWidth, this._element.clientHeight);

            const stageView = this.calcStageScale(this._element, this._options.stageWidth, this._options.stageHeight);

            this._stage.scale = stageView.scale;

            this._stage.x = stageView.offset.x;
            this._stage.y = stageView.offset.y;

        }

        protected nextSlideIndex(): number {
            return (this._currentSprite + 1) % this.sprites();
        }

        protected prevSlideIndex(): number {
            const prev = this._currentSprite - 1;
            return prev < 0 ? this.sprites() - 1 : prev;
        }

        // ISlideProxy interface

        public current(): PIXI.DisplayObject {
            return this._slidesContainer.children[this._currentSprite];
        }

        public item(index : number): PIXI.DisplayObject {
            return this._slidesContainer.children[index];
        }

        public next(): PIXI.DisplayObject {
            return this._slidesContainer.children[this.nextSlideIndex()];
        }

        public displacementFilter(): PIXI.filters.DisplacementFilter {
            return this._displacementFilter;
        }
   
        public displaceScale(): [number, number] {
            return this._options.displaceScale;
        }

        public displaceScaleTo(): [number, number] {
            return this._options.displaceScaleTo;
        }

        // *end*

        // Default transition methods

        static slideTransitionAnimation(slide: ISlideProxy, baseTimeline: gsapProxy.TimelineMax) {

            baseTimeline
                .to(slide.displacementFilter().scale, 0.8, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power2.easeIn })
                .to(slide.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.4)
                .to(slide.next(), 0.8, { alpha: 1, ease: window.Power2.easeOut }, 1)
                .to(slide.displacementFilter().scale, 0.7, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Power1.easeOut }, 0.9);

        }


        // *end*



    }
   

}