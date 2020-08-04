var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var app;
(function (app) {
    var slider;
    (function (slider_1) {
        const SlideOptionKeyAttrName = "data-slide-options-key";
        class LiquidSlider {
            constructor(element, options) {
                this._element = element;
                this._options = app.util.data.extend(true, LiquidSlider._defaultOptions, options);
                this._defaultSlideOptions = this.getDefaultSileOptions(this._options);
                this._slidesOptions = this.getSlidesOptions(this._options, this._defaultSlideOptions);
                this._slidesBinding = {};
                this._currentSprite = 0;
                this._currentFilter = "";
                this.initializePixi();
                //this._slidesFilters = this.initDisplacementFilters(this._slidesOptions, this._defaultSlideOptions);
                this.initDisplacementFilter(this._displacementFilter, this._displacementSprite);
                this.loadSlides(this.querySprites());
                // set initial filter
                //this._currentFilter = this.setFilter(this.slideOptions(0));
                this.renderStage();
                this.runSlider();
                this.resizeSlider();
                window.addEventListener("resize", ev => { this.resizeSlider(); });
            }
            sprites() {
                return this._slidesContainer.children.length;
            }
            slideOptions(pos) {
                return this._slidesBinding[pos] ?
                    this._slidesOptions[this._slidesBinding[pos]] :
                    this._defaultSlideOptions;
            }
            getDefaultSileOptions(options) {
                return {
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
            getSlidesOptions(options, defaultSlide) {
                var slideOptions = {};
                var givenOptions = options.slideOptions;
                if (!givenOptions)
                    return slideOptions;
                for (let key in givenOptions) {
                    slideOptions[key] = app.util.data.extend(true, {}, defaultSlide, givenOptions[key]);
                }
                return slideOptions;
            }
            initializePixi() {
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
            initDisplacementFilters(slidesOptions, defaultSlide) {
                var filters = {};
                var slides = [];
                slides.push(defaultSlide);
                for (let key in slidesOptions) {
                    slides.push(slidesOptions[key]);
                }
                for (let i = 0; i < slides.length; i++) {
                    const slide = slides[i];
                    if (!slide.displacementImage)
                        continue;
                    if (filters[slide.displacementImage])
                        continue;
                    const displacementSprite = PIXI.Sprite.from(slide.displacementImage);
                    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
                    // add sprite
                    this._stage.addChild(displacementSprite);
                    const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
                    // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
                    displacementFilter.autoFit = slide.displaceAutoFit;
                    // init filter
                    if (slide.autoPlay) {
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
                    filters[slide.displacementImage] = {
                        displacementSprite: displacementSprite,
                        displacementFilter: displacementFilter,
                    };
                }
                return filters;
            }
            setFilter(slide) {
                var filter = this._slidesFilters[slide.displacementImage];
                this._stage.filters = [filter.displacementFilter];
                //this._stage.addChild(filter.displacementSprite);
                this.setDisplacementFilter(slide, filter.displacementFilter, filter.displacementSprite);
                return slide.displacementImage;
            }
            applyFilter(slide) {
                if (this._currentFilter == slide.displacementImage)
                    return slide.displacementImage;
                //this._stage.removeChildAt(this._stage.children.length - 1);
                return this.setFilter(slide);
            }
            setDisplacementFilter(slide, displacementFilter, displacementSprite) {
                // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
                displacementFilter.autoFit = slide.displaceAutoFit;
                // init filter
                if (slide.autoPlay) {
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
            initDisplacementFilter(filter, sprite) {
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
            querySprites() {
                var sprites = [];
                const slides = [];
                this._element.querySelectorAll(this._options.slideSelector)
                    .forEach(el => {
                    const slide = {};
                    slide.order = parseInt(getComputedStyle(el).getPropertyValue("--i"));
                    slide.optionKey = el.getAttribute(SlideOptionKeyAttrName);
                    slide.sprites = [];
                    el.querySelectorAll(this._options.spriteSelector)
                        .forEach(spi => {
                        slide.sprites.push(spi.src);
                    });
                    slides.push(slide);
                });
                slides.sort((a, b) => {
                    if (a.order > b.order)
                        return 1;
                    if (a.order < b.order)
                        return -1;
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
            loadSlides(sprites) {
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
            renderStage() {
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
            runSlider() {
                setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    yield this._slideTransition();
                }), this._options.timeout);
            }
            _slideTransition() {
                return __awaiter(this, void 0, void 0, function* () {
                    const self = this;
                    return yield new Promise((resolve, reject) => {
                        // Get slide options 
                        var slideOprions = self.slideOptions(self._currentSprite);
                        const baseTimeline = new window.TimelineMax({
                            onComplete: function () {
                                if (self._options.wacky) {
                                    //self._displacementSprite.scale.set(1);
                                    self.displacementSprite().scale.x = this.displacementImageScale().x;
                                    self.displacementSprite().scale.y = this.displacementImageScale().y;
                                }
                                // move to the next slide index
                                self._currentSprite = self.nextSlideIndex();
                                // complete transition
                                resolve();
                            }, onUpdate: function () {
                                if (self._options.wacky) {
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
                    });
                });
            }
            calcStageScale(slider, stageWidth, stageHeight) {
                const result = {};
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
            resizeSlider() {
                this._renderer.resize(this._element.clientWidth, this._element.clientHeight);
                const stageView = this.calcStageScale(this._element, this._options.stageWidth, this._options.stageHeight);
                this._stage.scale = stageView.scale;
                this._stage.x = stageView.offset.x;
                this._stage.y = stageView.offset.y;
            }
            nextSlideIndex() {
                return (this._currentSprite + 1) % this.sprites();
            }
            prevSlideIndex() {
                const prev = this._currentSprite - 1;
                return prev < 0 ? this.sprites() - 1 : prev;
            }
            // ISlideProxy interface
            current() {
                return this._slidesContainer.children[this._currentSprite];
            }
            item(index) {
                return this._slidesContainer.children[index];
            }
            next() {
                return this._slidesContainer.children[this.nextSlideIndex()];
            }
            autoPlay() {
                return this.slideOptions(this._currentSprite).autoPlay;
            }
            displacementFilter() {
                //let slide = this.slideOptions(this._currentSprite);
                //return this._slidesFilters[slide.displacementImage].displacementFilter;
                return this._displacementFilter;
            }
            displacementSprite() {
                //let slide = this.slideOptions(this._currentSprite);
                //return this._slidesFilters[slide.displacementImage].displacementSprite;
                return this._displacementSprite;
            }
            autoPlaySpeed() {
                return this.slideOptions(this._currentSprite).autoPlaySpeed;
            }
            displaceScale() {
                return this.slideOptions(this._currentSprite).displaceScale;
            }
            displaceScaleTo() {
                return this.slideOptions(this._currentSprite).displaceScaleTo;
            }
            displacementImageScale() {
                return this.slideOptions(this._currentSprite).displacementImageScale;
            }
            // *end*
            // Default transition methods
            static slideTransitionAnimation(slide, baseTimeline) {
                baseTimeline
                    .to(slide.displacementFilter().scale, 0.8, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power2.easeIn })
                    .to(slide.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.4)
                    .to(slide.next(), 0.8, { alpha: 1, ease: window.Power2.easeOut }, 1)
                    .to(slide.displacementFilter().scale, 0.7, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Power1.easeOut }, 0.9);
            }
        }
        LiquidSlider._defaultOptions = {
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
        slider_1.LiquidSlider = LiquidSlider;
    })(slider = app.slider || (app.slider = {}));
})(app || (app = {}));
//# sourceMappingURL=liquid-slider.js.map