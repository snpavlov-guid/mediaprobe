
namespace app.pixi {

    export interface IPixiFilter {
        readonly pixiFilter: PIXI.Filter;
        readonly enabled: boolean;
        enable(enabled: boolean);
        animate(delta: any);
        resize(size: app.media.IOffsetSize);
    }

    export class PixiFilterNames {
        public static readonly BlurFilter: string = "blur";
        public static readonly KawaseBlurFilter: string = "kawaseblur";
        public static readonly MotionBlurFilter: string = "motionblur";
        public static readonly DisplacementFilter: string = "liquid";
        public static readonly ShockwaveFilter: string = "shockwave";
        public static readonly BulgePinchFilter: string = "fisheye";
    }

    export class PixiFilterManager {

        protected _pixiFilters: { [key: string]: IPixiFilter };

        constructor() {
            this.init();
        }

        protected init() {
            this._pixiFilters = {};
        }

        clear() {
            this.init();
        }

        getFilters(): PIXI.Filter[] {
            var filters: PIXI.Filter[] = [];

            for (let name in this._pixiFilters) {
                filters.push(this._pixiFilters[name].pixiFilter);
            }

            return filters;
        }

        addFilter(filterName: string, filter: IPixiFilter) {
            this._pixiFilters[filterName] = filter;
        }

        enable(filterName: string, enabled: boolean) {
            if (!this._pixiFilters[filterName]) return;
            this._pixiFilters[filterName].enable(enabled);
        }

        enableFilters(filterNames: string[], enabled: boolean) {
            filterNames.forEach(name => {
                if (!this._pixiFilters[name]) return;
                this._pixiFilters[name].enable(enabled);
            });
        }

        animate(delta: any) {
            for (let name in this._pixiFilters) {
                if (!this._pixiFilters[name].enabled) continue;
                this._pixiFilters[name].animate(delta);
            }
        }

        resize(filterName: string, size: media.IOffsetSize) {
            this._pixiFilters[filterName].resize(size);
        }

    }


    export class PixiBlurFilter implements IPixiFilter {

        protected _blurFilter: PIXI.filters.BlurFilter;

        constructor(enabled: boolean = true) {
            this.init(enabled);
        }
  
        protected init(enabled: boolean) {
            this._blurFilter = new PIXI.filters.BlurFilter(20);
            this._blurFilter.enabled = enabled;
            this._blurFilter.blur = 50;
            this._blurFilter.quality = 10;
        }

        get pixiFilter(): PIXI.Filter {
            return this._blurFilter;
        }

        get enabled(): boolean {
            return this._blurFilter.enabled;
        }

        isEnabled(): boolean {
            return this._blurFilter.enabled;
        }

        enable(enabled: boolean) {
            this._blurFilter.enabled = enabled;
        }

        animate(delta: any) {
            // Do nothing
        }

        resize(size: media.IOffsetSize) {
            // Do nothing
        }

    }

    export class PixiDisplacementFilter implements IPixiFilter {

        protected _displacementFilter: PIXI.filters.DisplacementFilter;
        protected _displacementSprite: PIXI.Sprite;
        protected _animationOffset: PIXI.Point;

        constructor(stage: PIXI.Container, displacementImageUrl : string, enabled: boolean = true) {
            this.init(stage,  displacementImageUrl, enabled);
        }

        protected init(stage: PIXI.Container, displacementImageUrl: string, enabled: boolean) {
            // Displacement filter
            this._displacementSprite = PIXI.Sprite.from(displacementImageUrl);
            this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

            stage.addChild(this._displacementSprite);

            stage.removeChild()

            this._displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite, 50);

            this._displacementFilter.enabled = enabled;

            // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
            this._displacementFilter.autoFit = false;

            this._animationOffset = new PIXI.Point(0.75, 0.75);

        }

        get pixiFilter(): PIXI.Filter {
            return this._displacementFilter;
        }

        get enabled(): boolean {
            return this._displacementFilter.enabled;
        }  

        enable(enabled: boolean) {
            this._displacementFilter.enabled = enabled;
        }

        animate(delta: any) {
            this._displacementSprite.x += this._animationOffset.x * delta;
            this._displacementSprite.y += this._animationOffset.y;

        }

        resize(size: media.IOffsetSize) {
            // Do nothing
        }

    }

    export class PixiMotionBlurFilter implements IPixiFilter {

        protected _motionBlurFilter: PIXI.filters.MotionBlurFilter;

        constructor(enabled: boolean = true) {
            this.init(enabled);
        }

        protected init(enabled: boolean) {
            this._motionBlurFilter = new PIXI.filters.MotionBlurFilter(new PIXI.Point(50, -50), 21, 0);
            this._motionBlurFilter.enabled = enabled;
        }


        get pixiFilter(): PIXI.Filter {
            return this._motionBlurFilter;
        }

        get enabled(): boolean {
            return this._motionBlurFilter.enabled;
        }  

        enable(enabled: boolean) {
            this._motionBlurFilter.enabled = enabled;
        }

        animate(delta: any) {
            // Do nothing
        }

        resize(size: media.IOffsetSize) {
            // Do nothing
        }
    }

    export class PixiKawaseBlurFilter implements IPixiFilter {

        protected _kawaseBlurFilter: PIXI.filters.KawaseBlurFilter;

        constructor(enabled: boolean = true) {
            this.init(enabled);
        }

        protected init(enabled: boolean) {
            this._kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter(10, 10);
            this._kawaseBlurFilter.enabled = enabled;
        }


        get pixiFilter(): PIXI.Filter {
            return this._kawaseBlurFilter;
        }

        get enabled(): boolean {
            return this._kawaseBlurFilter.enabled;
        }

        enable(enabled: boolean) {
            this._kawaseBlurFilter.enabled = enabled;
        }

        animate(delta: any) {
            // Do nothing
        }

        resize(size: media.IOffsetSize) {
            // Do nothing
        }
    }

    export class PixiShockwaveFilter implements IPixiFilter {

        protected _shockwaveFilter: PIXI.filters.ShockwaveFilter;
        protected _shockwaveOptions: PIXI.filters.ShockwaveFilterOptions;

        protected _timeStep: number;
        protected _timeLimit: number;

        constructor(enabled: boolean = true) {
            this.init(enabled);
        }

        protected init(enabled: boolean) {

            this._shockwaveOptions = <PIXI.filters.ShockwaveFilterOptions>{
                amplitude: 50,
                wavelength: 200,
                brightness: 1.1,
                speed: 500,
                radius: -1,               
            };

            this._timeLimit = 2;
            this._timeStep = 0.01;

            //this._shockwaveFilter = new PIXI.filters.ShockwaveFilter();

            this._shockwaveFilter = new PIXI.filters.ShockwaveFilter(new PIXI.Point(0, 0),
                this._shockwaveOptions, 0);

            this._shockwaveFilter.enabled = enabled;
        }

        get pixiFilter(): PIXI.Filter {
            return this._shockwaveFilter;
        }

        get enabled(): boolean {
            return this._shockwaveFilter.enabled;
        }

        enable(enabled: boolean) {
            this._shockwaveFilter.enabled = enabled;
        }

        animate(delta: number) {
            this._shockwaveFilter.time = (this._shockwaveFilter.time >= this._timeLimit) ?
                0 : this._shockwaveFilter.time + this._timeStep;
        }

        resize(size: media.IOffsetSize) {
            const center = <PIXI.Point>this._shockwaveFilter.center;
            center.x = size.cx + size.cw / 2;
            center.y = size.cy + size.ch / 2;
        }
    }


    export class PixiBulgePinchFilter implements IPixiFilter {

        protected _bulgePinchFilter: PIXI.filters.BulgePinchFilter;

        constructor(enabled: boolean = true) {
            this.init(enabled);
        }

        protected init(enabled: boolean) {
            this._bulgePinchFilter = new PIXI.filters.BulgePinchFilter();
            this._bulgePinchFilter.enabled = enabled;
            this._bulgePinchFilter.strength = 0.75;
        }

        get pixiFilter(): PIXI.Filter {
            return this._bulgePinchFilter;
        }

        get enabled(): boolean {
            return this._bulgePinchFilter.enabled;
        }

        enable(enabled: boolean) {
            this._bulgePinchFilter.enabled = enabled;
        }

        animate(delta: number) {
        }

        resize(size: media.IOffsetSize) {
            // this._bulgePinchFilter.center is relative value in [0,1]
            this._bulgePinchFilter.radius = Math.min(size.cw, size.ch) / 2;
        }
    }

    //BulgePinchFilter

}