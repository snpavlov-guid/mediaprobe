
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
        displacementImageScale: [number, number],
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
        slideOptions: { [key: string]: ISlideOptions };
    }

    export interface ISlideOptions {
        wacky: boolean;
        autoPlay: boolean,
        autoPlaySpeed: [number, number],
        displaceScale: [number, number],
        displaceScaleTo: [number, number],
        displacementImage: string,
        displaceAutoFit: boolean,
        displacementImageScale: [number, number],
        transitionMethod(slide: ISlideProxy, baseTimeline: gsapProxy.TimelineMax);
    }

    export interface ISlideProxy {
        current(): PIXI.DisplayObject,
        item(index: number): PIXI.DisplayObject,
        next(): PIXI.DisplayObject,
        autoPlay: () => boolean,
        displacementSprite: () => PIXI.Sprite,
        displacementFilter: () => PIXI.filters.DisplacementFilter,
        displacementImageScale: () => [number, number],
        autoPlaySpeed: () => [number, number],
        displaceScale: () => [number, number],
        displaceScaleTo: () => [number, number],
      
    }

    export interface IFilterProxy {
        displacementSprite: PIXI.Sprite;
        displacementFilter: PIXI.filters.DisplacementFilter;
    }

    const SlideOptionKeyAttrName: string = "data-slide-options-key";

    export class LiquidSlider implements ISlideProxy {

        private _options: ISliderOptions;
        private _defaultSlideOptions: ISlideOptions;
        private _slidesBinding: { [key: number]: string };
        private _slidesOptions: { [key: string]: ISlideOptions };
        private _slidesFilters: { [key: string]: IFilterProxy };

        private _currentSprite: number;
        private _currentFilter: string;

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
            displacementImageScale: [2, 2],
            displacementCenter: false,
            displaceAutoFit: false,
            wacky: false,
            interactive: false,
            slideSelector: ".slide",
            spriteSelector: "img.surface",
        };

        constructor(element: HTMLElement, options: ISliderOptions) {

            this._element = element;

            this._options = <ISliderOptions>app.util.data.extend(true, LiquidSlider._defaultOptions, options);

            this._defaultSlideOptions = this.getDefaultSileOptions(this._options);

            this._slidesOptions = this.getSlidesOptions(this._options, this._defaultSlideOptions);

            this._slidesBinding = {};

            this._currentSprite = 0;

            this.initializePixi();

            this._slidesFilters = this.initDisplacementFilters(this._slidesOptions, this._defaultSlideOptions);

            //this.initDisplacementFilter(this._displacementFilter, this._displacementSprite);

            this.loadSlides(this.querySprites());

            // set initial filter
            this._currentFilter = this.setFilter(this.slideOptions(0));

            this.renderStage();

            this.runSlider();

            this.resizeSlider();

            window.addEventListener("resize", ev => { this.resizeSlider() });

        }

        protected sprites(): number {
            return this._slidesContainer.children.length;
        }

        protected slideOptions(pos: number): ISlideOptions {
            return this._slidesBinding[pos] ?
                this._slidesOptions[this._slidesBinding[pos]] :
                this._defaultSlideOptions;
        }

        protected getDefaultSileOptions(options : ISliderOptions): ISlideOptions {
            return <ISlideOptions>{
                wacky: options.wacky,
                autoPlay: options.autoPlay,
                autoPlaySpeed: options.autoPlaySpeed,
                displaceScale: options.displaceScale,
                displaceScaleTo: options.displaceScaleTo,
                displacementImage: options.displacementImage,
                displaceAutoFit: options.displaceAutoFit,
                displacementImageScale: options.displacementImageScale,
                transitionMethod: LiquidSlider.slideTransitionAnimation,
            };
        }

        protected getSlidesOptions(options: ISliderOptions, defaultSlide: ISlideOptions): { [key: string]: ISlideOptions } {
            var slideOptions = <{ [key: string]: ISlideOptions }>{};
            var givenOptions = options.slideOptions;

            if (!givenOptions) return slideOptions;

            for (let key in givenOptions) {
                slideOptions[key] = <ISlideOptions>app.util.data.extend(true, {}, defaultSlide, givenOptions[key]);
            }

            return slideOptions;
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

            //this._displacementSprite = PIXI.Sprite.from(this._options.displacementImage);
            //this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

            //this._displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite);

            //this._stage.filters = [this._displacementFilter];
            //this._stage.addChild(this._displacementSprite);

            this._textStyle = new PIXI.TextStyle({
                fill: this._options.textColor,
                wordWrap: true,
                wordWrapWidth: 400,
                letterSpacing: 20,
                fontSize: 14
            });


        }

        protected initDisplacementFilters(slidesOptions: { [key: string]: ISlideOptions }, defaultSlide: ISlideOptions) :
                { [key: string]: IFilterProxy } {
            var filters = <{ [key: string]: IFilterProxy }>{};
            var slides: ISlideOptions[] = [];

            slides.push(defaultSlide);

            for (let key in slidesOptions) {
                slides.push(slidesOptions[key]);
            }

            for (let i = 0; i < slides.length; i++) {
                const slide = slides[i];

                if (!slide.displacementImage) continue;

                if (filters[slide.displacementImage]) continue;

                // prepare displacement filter
                var displacementSprite = PIXI.Sprite.from(slide.displacementImage);
                displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

                var displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

                // add sprite
                this._stage.addChild(displacementSprite);


                // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
                displacementFilter.autoFit = slide.displaceAutoFit;

                // init filter
                if (!slide.autoPlay) {
                    displacementFilter.scale.x = 0;
                    displacementFilter.scale.y = 0;
                }

                if (slide.wacky) {
                    displacementSprite.anchor.set(0.5);
                    displacementSprite.x = this._renderer.width / 2;
                    displacementSprite.y = this._renderer.height / 2;
                }

                displacementSprite.scale.x = slide.displacementImageScale[0];
                displacementSprite.scale.y = slide.displacementImageScale[1];


                // save filter data
                filters[slide.displacementImage] = <IFilterProxy>{
                    displacementSprite: displacementSprite,
                    displacementFilter: displacementFilter,
                };

            }

            return filters;
        }

        protected setFilter(slide: ISlideOptions) : string {

            var filter = this._slidesFilters[slide.displacementImage];

            this._stage.filters = [filter.displacementFilter];
 
            return slide.displacementImage;
        }

        protected applyFilter(slide: ISlideOptions): string {

            if (this._currentFilter == slide.displacementImage)
                return slide.displacementImage;

            return this.setFilter(slide);
        }

        protected setDisplacementFilter(slide: ISlideOptions,
            displacementFilter: PIXI.filters.DisplacementFilter, displacementSprite: PIXI.Sprite) {

            // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            displacementFilter.autoFit = slide.displaceAutoFit;

            // init filter
            if (!slide.autoPlay) {
                displacementFilter.scale.x = 0;
                displacementFilter.scale.y = 0;
            }

            if (slide.wacky) {
                displacementSprite.anchor.set(0.5);
                displacementSprite.x = this._renderer.width / 2;
                displacementSprite.y = this._renderer.height / 2;
            }

            displacementSprite.scale.x = slide.displacementImageScale[0];
            displacementSprite.scale.y = slide.displacementImageScale[1];

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

            sprite.scale.x = this._options.displacementImageScale[0];
            sprite.scale.y = this._options.displacementImageScale[1];

            // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            filter.autoFit = this._options.displaceAutoFit;

        }

        protected querySprites(): string[] {

            var sprites: string[] = [];
            const slides: { order: number, optionKey: string, sprites: string[] }[] = [];

            this._element.querySelectorAll(this._options.slideSelector)
                .forEach(el => {
                    const slide: { order: number, optionKey: string, sprites: string[] } =
                        <{ order: number, optionKey: string, sprites: string[] }>{};

                    slide.order = parseInt(getComputedStyle(el).getPropertyValue("--i"));
                    slide.optionKey = el.getAttribute(SlideOptionKeyAttrName);
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

            let curpos = 0;
            slides.forEach(el => {
                sprites = sprites.concat(el.sprites);

                if (el.optionKey) {
                    for (let i = curpos; i < sprites.length; i++) {
                        this._slidesBinding[i] = el.optionKey;
                    }
                }

                curpos += el.sprites.length;
                   
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

            ticker.add(delta => {

                if (this.autoPlay()) {
                    this.displacementSprite().x += this.autoPlaySpeed()[0] * delta;
                    this.displacementSprite().y += this.autoPlaySpeed()[1];
                }

                this._renderer.render(this._stage);

            });

        }

        protected runSlider() {

            setInterval(async () => {

                await this._slideTransition();

            }, this._options.timeout);
        }

        protected async _slideTransition(): Promise<void> {
            const self = this;

            return await new Promise<void>((resolve, reject) => {

               // Get slide options 
               var slideOprions = self.slideOptions(self._currentSprite);
  
               const baseTimeline = new window.TimelineMax({
                   onComplete: function () {

                       if (slideOprions.wacky) {
                           self.displacementFilter().scale.set(1);
                           self.displacementSprite().scale.x = self.displacementImageScale()[0];
                           self.displacementSprite().scale.y = self.displacementImageScale()[1];
                       }    

                       // move to the next slide index
                       self._currentSprite = self.nextSlideIndex();

                       // apply slide filter
                       self._currentFilter = self.applyFilter(self.slideOptions(self._currentSprite));

                       // complete transition
                       resolve();


                    }, onUpdate: function () {

                       if (slideOprions.wacky) {
                            self.displacementSprite().rotation += baseTimeline.progress() * 0.02;
                            self.displacementSprite().scale.set(baseTimeline.progress() * 3);
                        }          
                    }
                });

                baseTimeline.clear();

                if (baseTimeline.isActive()) {
                    return;
                }

                // Call slide transition method 
                slideOprions.transitionMethod(self, baseTimeline);

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

        public autoPlay(): boolean {
            return this.slideOptions(this._currentSprite).autoPlay;
        }

        public displacementFilter(): PIXI.filters.DisplacementFilter {
            let slide = this.slideOptions(this._currentSprite);
            return this._slidesFilters[slide.displacementImage].displacementFilter;

            //return this._displacementFilter;
        }

        public displacementSprite(): PIXI.Sprite {
            let slide = this.slideOptions(this._currentSprite);
            return this._slidesFilters[slide.displacementImage].displacementSprite;

            //return this._displacementSprite;
        }

        public autoPlaySpeed(): [number, number] {
            return this.slideOptions(this._currentSprite).autoPlaySpeed;
        }
   
        public displaceScale(): [number, number] {
            return this.slideOptions(this._currentSprite).displaceScale;
        }

        public displaceScaleTo(): [number, number] {
            return this.slideOptions(this._currentSprite).displaceScaleTo;
        }

        public displacementImageScale(): [number, number] {
            return this.slideOptions(this._currentSprite).displacementImageScale;
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