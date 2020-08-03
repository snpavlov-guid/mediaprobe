
namespace app.slider.customization {

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

  

}