var app;
(function (app) {
    var slider;
    (function (slider) {
        class LiquidSlider {
            constructor(element, options) {
                this._options = options;
                this.InitializePixi();
            }
            InitializePixi() {
                this._renderer = PIXI.autoDetectRenderer({
                    width: this._options.stageWidth,
                    height: this._options.stageHeight,
                    transparent: true
                });
                this._stage = new PIXI.Container();
                this._slidesContainer = new PIXI.Container();
                this._displacementSprite = PIXI.Sprite.from(this._options.displacementImage);
                this._displacementFilter = new PIXI.filters.DisplacementFilter(this._displacementSprite);
                this._textStyle = new PIXI.TextStyle({
                    fill: this._options.textColor,
                    wordWrap: true,
                    wordWrapWidth: 400,
                    letterSpacing: 20,
                    fontSize: 14
                });
            }
        }
        slider.LiquidSlider = LiquidSlider;
    })(slider = app.slider || (app.slider = {}));
})(app || (app = {}));
