

namespace app.slider {

    export interface ISliderOptions {
        stageWidth: number,
        stageHeight: number,
        pixiSprites: any[],
        centerSprites: boolean,
        texts: string[],
        autoPlay: boolean,
        autoPlaySpeed: number[],
        fullScreen: boolean,
        displaceScale: number[],
        displacementImage: string,
        navElement: any,
        displaceAutoFit: boolean,
        wacky: boolean,
        interactive: boolean,
        interactionEvent: string,
        displaceScaleTo: number[],
        textColor: string,
        displacementCenter: boolean,
        dispatchPointerOver: boolean
    }
  

    export class LiquidSlider {

        private _options: ISliderOptions;

        private _renderer: PIXI.Renderer;
        private _stage: PIXI.Container;
        private _slidesContainer: PIXI.Container;
        private _displacementSprite: PIXI.Sprite;
        private _displacementFilter: PIXI.filters.DisplacementFilter;
        private _textStyle;

        constructor(element: Element, options: ISliderOptions) {

            this._options = options;

            this.InitializePixi();
  
        }

        protected InitializePixi() {

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
   

}