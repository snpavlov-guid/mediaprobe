/**
 * Custom declarations of gsap elements 
 */

declare namespace gsapProxy {
    class TimelineMax {
        constructor(vars?: any);
        isActive(): boolean;
        progress(): number;
        clear(labels?: boolean): TimelineMax;
        to(target: object, duration: number, vars: object, position?: string | number): TimelineMax;
    }

    class EaseProxy {
        easeIn: any;
        easeInOut: any;
        easeOut: any;
    }
}



