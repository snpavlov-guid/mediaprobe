
namespace app.slider.customization {

    export function gooeyRipplesTransition(slide: app.slider.ISlideProxy, baseTimeline: gsapProxy.TimelineMax) {

        baseTimeline
            .to(slide.displacementFilter().scale, 0.8, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power2.easeIn })
            .to(slide.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.4)
            .to(slide.next(), 0.8, { alpha: 1, ease: window.Power2.easeOut }, 1)
            .to(slide.displacementFilter().scale, 0.7, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Power1.easeOut }, 0.9);
    }

    export function calmRippleTransition(slide: app.slider.ISlideProxy, baseTimeline: gsapProxy.TimelineMax) {

        baseTimeline
            .to(slide.displacementFilter().scale, 1, { x: slide.displaceScale()[0], y: slide.displaceScale()[1] })
            .to(slide.current(), 0.5, { alpha: 0 })
            .to(slide.next(), 0.8, { alpha: 1})
            .to(slide.displacementFilter().scale, 1, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1] });

    }

    export function greaseFilmTransition(slide: app.slider.ISlideProxy, baseTimeline: gsapProxy.TimelineMax) {

        baseTimeline
            .to(slide.displacementFilter().scale, 1.5, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power2.easeOut })
            .to(slide.current(), 1.5, { alpha: 0, ease: window.Power2.easeOut  }, 0)
            .to(slide.next(), 1, { alpha: 1, ease: window.Power2.easeOut }, 1)
            .to(slide.displacementFilter().scale, 1.5, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Expo.easeOut }, 0.8);
    }

    export function crystalizeTransition(slide: app.slider.ISlideProxy, baseTimeline: gsapProxy.TimelineMax) {

        baseTimeline
            .to(slide.displacementFilter().scale, 1, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power1.easeOut })
            .to(slide.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.2 )
            .to(slide.next(), 0.5, { alpha: 1, ease: window.Power2.easeOut }, 0.3 )
            .to(slide.displacementFilter().scale, 1, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Power2.easeOut }, 0.3);
    }

    export function nervousBreakdownTransition(slide: app.slider.ISlideProxy, baseTimeline: gsapProxy.TimelineMax) {

        baseTimeline
            .to(slide.displacementFilter().scale, 1, { y: "+=" + 1280 + "", ease: window.Power3.easeOut })
            .to(slide.current(), 0.5, { alpha: 0, ease: window.Power3.easeOut }, 0.4)
            .to(slide.next(), 0.5, { alpha: 1, ease: window.Power3.easeInOut }, 0.7)
            .to(slide.displacementFilter().scale, 1, { y: 20, ease: window.Power3.easeOut }, 1);
 
    }

    export function nervousTremorRender(slide: app.slider.ISlideProxy, delta : number) {

        slide.displacementSprite().x += 2.14 * delta;
        slide.displacementSprite().y += 22.24 * delta;
        //slide.displacementSprite().rotation += 20.3;
    }

   
 
}