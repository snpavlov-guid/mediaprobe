
interface Constructable<T> {
    new(...args: any): T;
}


declare interface Window {
    TimelineMax: Constructable<gsapProxy.TimelineMax>;
    Power1: gsapProxy.EaseProxy;
    Power2: gsapProxy.EaseProxy;
    Power3: gsapProxy.EaseProxy;
    Expo: gsapProxy.EaseProxy;

    SimplexNoise: Constructable<simplexNoiseProxy.SimplexNoise>;
}
