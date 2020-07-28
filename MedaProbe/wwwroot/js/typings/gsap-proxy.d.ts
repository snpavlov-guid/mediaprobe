/**
 * Custom declarations of gsap elements 
 */

interface Constructable<T> {
    new(...args: any): T;
}

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

declare interface Window {
    TimelineMax: Constructable<gsapProxy.TimelineMax>;
    Power1: gsapProxy.EaseProxy;
    Power2: gsapProxy.EaseProxy;
}


