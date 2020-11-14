
declare namespace PIXI.filters {

    export class MotionBlurFilter extends PIXI.Filter {
        constructor(velocity: PIXI.ObservablePoint | PIXI.Point | number[], kernelSize?: number, offset?: number);
        velocity: PIXI.ObservablePoint;
        kernelSize: number;
        offset: number;
    }

    export class KawaseBlurFilter extends PIXI.Filter {
        constructor(blur?: number | number[], quality?: number, clamp?: boolean);
        kernels: number[];
        pixelSize: number | PIXI.Point | number[];
        quality: number;
        blur: number;
        readonly clamp: boolean;
    }

    export class ShockwaveFilter extends PIXI.Filter {
        constructor(center?: PIXI.Point | number[], options?: ShockwaveFilterOptions, time?: number);
        center: PIXI.Point | number[];
        options: ShockwaveFilterOptions;
        time: number;
        speed: number;
    }
    export interface ShockwaveFilterOptions {
        amplitude?: number;
        wavelength?: number;
        brightness?: number;
        speed?: number;
        radius?: number;
    } 

    export interface BulgePinchFilterOptions {
        center?: PIXI.Point | [number, number];
        radius?: number;
        strength?: number;
    }
    export class BulgePinchFilter extends PIXI.Filter {
        constructor(options?: BulgePinchFilterOptions);
        constructor(center?: PIXI.Point | [number, number], radius?: number, strength?: number);
        center: PIXI.Point;
        radius: number;
        strength: number;
    } 

}

declare module "@pixi/filter-motion-blur" {
    export import MotionBlurFilter = PIXI.filters.MotionBlurFilter;
    export import KawaseBlurFilter = PIXI.filters.KawaseBlurFilter;
    export import ShockwaveFilter = PIXI.filters.ShockwaveFilter;
    export import ShockwaveFilterOptions = PIXI.filters.ShockwaveFilterOptions; 
    export import BulgePinchFilterOptions = PIXI.filters.BulgePinchFilterOptions;
    export import BulgePinchFilter = PIXI.filters.BulgePinchFilter; 
} 

