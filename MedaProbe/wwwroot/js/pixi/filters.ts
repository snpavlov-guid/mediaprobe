
namespace app.pixi {

    export interface IPixiFilter {
        readonly pixiFilter: PIXI.Filter;
        readonly enabled: boolean;
        enable(enabled: boolean);
        animate(delta: any);
    }

    export class PixiFilterNames {
        public static readonly BlurFilter: string = "blur";
        public static readonly DisplacementFilter: string = "liquid";
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

    }

}