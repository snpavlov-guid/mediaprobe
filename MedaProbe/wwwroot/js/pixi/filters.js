var app;
(function (app) {
    var pixi;
    (function (pixi) {
        class PixiFilterNames {
        }
        PixiFilterNames.BlurFilter = "blur";
        PixiFilterNames.KawaseBlurFilter = "kawaseblur";
        PixiFilterNames.MotionBlurFilter = "motionblur";
        PixiFilterNames.DisplacementFilter = "liquid";
        PixiFilterNames.ShockwaveFilter = "shockwave";
        pixi.PixiFilterNames = PixiFilterNames;
        class PixiFilterManager {
            constructor() {
                this.init();
            }
            init() {
                this._pixiFilters = {};
            }
            clear() {
                this.init();
            }
            getFilters() {
                var filters = [];
                for (let name in this._pixiFilters) {
                    filters.push(this._pixiFilters[name].pixiFilter);
                }
                return filters;
            }
            addFilter(filterName, filter) {
                this._pixiFilters[filterName] = filter;
            }
            enable(filterName, enabled) {
                if (!this._pixiFilters[filterName])
                    return;
                this._pixiFilters[filterName].enable(enabled);
            }
            enableFilters(filterNames, enabled) {
                filterNames.forEach(name => {
                    if (!this._pixiFilters[name])
                        return;
                    this._pixiFilters[name].enable(enabled);
                });
            }
            animate(delta) {
                for (let name in this._pixiFilters) {
                    if (!this._pixiFilters[name].enabled)
                        continue;
                    this._pixiFilters[name].animate(delta);
                }
            }
            resize(filterName, size) {
                this._pixiFilters[filterName].resize(size);
            }
        }
        pixi.PixiFilterManager = PixiFilterManager;
        class PixiBlurFilter {
            constructor(enabled = true) {
                this.init(enabled);
            }
            init(enabled) {
                this._blurFilter = new PIXI.filters.BlurFilter(20);
                this._blurFilter.enabled = enabled;
                this._blurFilter.blur = 50;
                this._blurFilter.quality = 10;
            }
            get pixiFilter() {
                return this._blurFilter;
            }
            get enabled() {
                return this._blurFilter.enabled;
            }
            isEnabled() {
                return this._blurFilter.enabled;
            }
            enable(enabled) {
                this._blurFilter.enabled = enabled;
            }
            animate(delta) {
                // Do nothing
            }
            resize(size) {
                // Do nothing
            }
        }
        pixi.PixiBlurFilter = PixiBlurFilter;
        class PixiDisplacementFilter {
            constructor(stage, displacementImageUrl, enabled = true) {
                this.init(stage, displacementImageUrl, enabled);
            }
            init(stage, displacementImageUrl, enabled) {
                // Displacement filter
                this._displacementSprite = PIXI.Sprite.from(displacementImageUrl);
                this._displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
                stage.addChild(this._displacementSprite);
                stage.removeChild();
                this._displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite, 50);
                this._displacementFilter.enabled = enabled;
                // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
                this._displacementFilter.autoFit = false;
                this._animationOffset = new PIXI.Point(0.75, 0.75);
            }
            get pixiFilter() {
                return this._displacementFilter;
            }
            get enabled() {
                return this._displacementFilter.enabled;
            }
            enable(enabled) {
                this._displacementFilter.enabled = enabled;
            }
            animate(delta) {
                this._displacementSprite.x += this._animationOffset.x * delta;
                this._displacementSprite.y += this._animationOffset.y;
            }
            resize(size) {
                // Do nothing
            }
        }
        pixi.PixiDisplacementFilter = PixiDisplacementFilter;
        class PixiMotionBlurFilter {
            constructor(enabled = true) {
                this.init(enabled);
            }
            init(enabled) {
                this._motionBlurFilter = new PIXI.filters.MotionBlurFilter(new PIXI.Point(50, -50), 21, 0);
                this._motionBlurFilter.enabled = enabled;
            }
            get pixiFilter() {
                return this._motionBlurFilter;
            }
            get enabled() {
                return this._motionBlurFilter.enabled;
            }
            enable(enabled) {
                this._motionBlurFilter.enabled = enabled;
            }
            animate(delta) {
                // Do nothing
            }
            resize(size) {
                // Do nothing
            }
        }
        pixi.PixiMotionBlurFilter = PixiMotionBlurFilter;
        class PixiKawaseBlurFilter {
            constructor(enabled = true) {
                this.init(enabled);
            }
            init(enabled) {
                this._kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter(10, 10);
                this._kawaseBlurFilter.enabled = enabled;
            }
            get pixiFilter() {
                return this._kawaseBlurFilter;
            }
            get enabled() {
                return this._kawaseBlurFilter.enabled;
            }
            enable(enabled) {
                this._kawaseBlurFilter.enabled = enabled;
            }
            animate(delta) {
                // Do nothing
            }
            resize(size) {
                // Do nothing
            }
        }
        pixi.PixiKawaseBlurFilter = PixiKawaseBlurFilter;
        class PixiShockwaveFilter {
            constructor(enabled = true) {
                this.init(enabled);
            }
            init(enabled) {
                this._shockwaveOptions = {
                    amplitude: 50,
                    wavelength: 200,
                    brightness: 1.1,
                    speed: 500,
                    radius: -1,
                };
                this._timeLimit = 2;
                this._timeStep = 0.01;
                //this._shockwaveFilter = new PIXI.filters.ShockwaveFilter();
                this._shockwaveFilter = new PIXI.filters.ShockwaveFilter(new PIXI.Point(0, 0), this._shockwaveOptions, 0);
                this._shockwaveFilter.enabled = enabled;
            }
            get pixiFilter() {
                return this._shockwaveFilter;
            }
            get enabled() {
                return this._shockwaveFilter.enabled;
            }
            enable(enabled) {
                this._shockwaveFilter.enabled = enabled;
            }
            animate(delta) {
                this._shockwaveFilter.time = (this._shockwaveFilter.time >= this._timeLimit) ?
                    0 : this._shockwaveFilter.time + this._timeStep;
            }
            resize(size) {
                const center = this._shockwaveFilter.center;
                center.x = size.cx + size.cw / 2;
                center.y = size.cy + size.ch / 2;
            }
        }
        pixi.PixiShockwaveFilter = PixiShockwaveFilter;
    })(pixi = app.pixi || (app.pixi = {}));
})(app || (app = {}));
//# sourceMappingURL=filters.js.map