var app;
(function (app) {
    var slider;
    (function (slider) {
        var customization;
        (function (customization) {
            function gooeyRipplesTransition(slide, baseTimeline) {
                baseTimeline
                    .to(slide.displacementFilter().scale, 0.8, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power2.easeIn })
                    .to(slide.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.4)
                    .to(slide.next(), 0.8, { alpha: 1, ease: window.Power2.easeOut }, 1)
                    .to(slide.displacementFilter().scale, 0.7, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Power1.easeOut }, 0.9);
            }
            customization.gooeyRipplesTransition = gooeyRipplesTransition;
            function calmRippleTransition(slide, baseTimeline) {
                baseTimeline
                    .to(slide.displacementFilter().scale, 1, { x: slide.displaceScale()[0], y: slide.displaceScale()[1] })
                    .to(slide.current(), 0.5, { alpha: 0 })
                    .to(slide.next(), 0.8, { alpha: 1 })
                    .to(slide.displacementFilter().scale, 1, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1] });
            }
            customization.calmRippleTransition = calmRippleTransition;
            function greaseFilmTransition(slide, baseTimeline) {
                baseTimeline
                    .to(slide.displacementFilter().scale, 1.5, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power2.easeOut })
                    .to(slide.current(), 1.5, { alpha: 0, ease: window.Power2.easeOut }, 0)
                    .to(slide.next(), 1, { alpha: 1, ease: window.Power2.easeOut }, 1)
                    .to(slide.displacementFilter().scale, 1.5, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Expo.easeOut }, 0.8);
            }
            customization.greaseFilmTransition = greaseFilmTransition;
            function crystalizeTransition(slide, baseTimeline) {
                baseTimeline
                    .to(slide.displacementFilter().scale, 1, { x: slide.displaceScale()[0], y: slide.displaceScale()[1], ease: window.Power1.easeOut })
                    .to(slide.current(), 0.5, { alpha: 0, ease: window.Power2.easeOut }, 0.2)
                    .to(slide.next(), 0.5, { alpha: 1, ease: window.Power2.easeOut }, 0.3)
                    .to(slide.displacementFilter().scale, 1, { x: slide.displaceScaleTo()[0], y: slide.displaceScaleTo()[1], ease: window.Power2.easeOut }, 0.3);
            }
            customization.crystalizeTransition = crystalizeTransition;
            function nervousBreakdownTransition(slide, baseTimeline) {
                baseTimeline
                    .to(slide.displacementFilter().scale, 1, { y: "+=" + 1280 + "", ease: window.Power3.easeOut })
                    .to(slide.current(), 0.5, { alpha: 0, ease: window.Power3.easeOut }, 0.4)
                    .to(slide.next(), 0.5, { alpha: 1, ease: window.Power3.easeInOut }, 0.7)
                    .to(slide.displacementFilter().scale, 1, { y: 20, ease: window.Power3.easeOut }, 1);
            }
            customization.nervousBreakdownTransition = nervousBreakdownTransition;
            function nervousTremorRender(slide, delta) {
                slide.displacementSprite().x += 2.14 * delta;
                slide.displacementSprite().y += 22.24 * delta;
                //slide.displacementSprite().rotation += 20.3;
            }
            customization.nervousTremorRender = nervousTremorRender;
        })(customization = slider.customization || (slider.customization = {}));
    })(slider = app.slider || (app.slider = {}));
})(app || (app = {}));
