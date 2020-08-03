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
                this.initializePixi();
                this.initDisplacementFilter(this._displacementFilter, this._displacementSprite);
                this.loadSlides(this.querySprites());
                this.renderStage();
                this.runSlider();
                this.resizeSlider();
                window.addEventListener("resize", ev => { this.resizeSlider(); });
            }
            sprites() {
                return this._slidesContainer.children.length;
            }
            getDefaultSileOptions(options) {
                return {
                    autoPlaySpeed: options.autoPlaySpeed,
                    displaceScale: options.displaceScale,
                    displaceScaleTo: options.displaceScaleTo,
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
                sprite.scale.x = this._options.displacementImageScale;
                sprite.scale.y = this._options.displacementImageScale;
                // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
                //filter.autoFit = this._options.displaceAutoFit;
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
                    if (slide.optionKey)
                        this._slidesBinding[slide.order] = slide.optionKey;
                });
                slides.sort((a, b) => {
                    if (a.order > b.order)
                        return 1;
                    if (a.order < b.order)
                        return -1;
                    return 0;
                });
                slides.forEach(el => {
                    sprites = sprites.concat(el.sprites);
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
                if (this._options.autoPlay) {
                    ticker.add(delta => {
                        this._displacementSprite.x += this._options.autoPlaySpeed[0] * delta;
                        this._displacementSprite.y += this._options.autoPlaySpeed[1];
                        this._renderer.render(this._stage);
                    });
                }
                else {
                    ticker.add(delta => {
                        this._renderer.render(this._stage);
                    });
                }
            }
            runSlider() {
                setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    //const newIndex = (this._currentSprite + 1) % this.sprites();
                    yield this._slideTransition();
                    //this._slidesContainer.children[this._currentSprite].alpha = 0;
                    //this._currentSprite = (this._currentSprite + 1) % this.sprites();
                    //this._slidesContainer.children[this._currentSprite].alpha = 1;
                }), this._options.timeout);
            }
            _slideTransition() {
                return __awaiter(this, void 0, void 0, function* () {
                    const self = this;
                    return yield new Promise((resolve, reject) => {
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
                        //Check for slide options
                        if (self._slidesBinding[self._currentSprite]) {
                            const slideKey = this._slidesBinding[this._currentSprite];
                            self._slidesOptions[slideKey].transitionMethod(self, baseTimeline);
                        }
                        else {
                            // Default slide transition animation
                            self._defaultSlideOptions.transitionMethod(self, baseTimeline);
                        }
                        //LiquidSlider.slideTransitionAnimation(self, baseTimeline);
                        //baseTimeline
                        //    .to(self.displacementFilter().scale, 0.8, { x: self.displaceScale()[0], y: self.displaceScale()[1], ease: window.Power2.easeIn })
                        //    .to(self.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.4)
                        //    .to(self.next(), 0.8, { alpha: 1, ease: window.Power2.easeOut }, 1)
                        //    .to(self.displacementFilter().scale, 0.7, { x: self.displaceScaleTo()[0], y: self.displaceScaleTo()[1], ease: window.Power1.easeOut }, 0.9);
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
            displacementFilter() {
                return this._displacementFilter;
            }
            displaceScale() {
                if (this._slidesBinding[this._currentSprite]) {
                    const key = this._slidesBinding[this._currentSprite];
                    return this._slidesOptions[key].displaceScale;
                }
                return this._defaultSlideOptions.displaceScale;
            }
            displaceScaleTo() {
                if (this._slidesBinding[this._currentSprite]) {
                    const key = this._slidesBinding[this._currentSprite];
                    return this._slidesOptions[key].displaceScaleTo;
                }
                return this._defaultSlideOptions.displaceScaleTo;
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
            displacementImageScale: 2,
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