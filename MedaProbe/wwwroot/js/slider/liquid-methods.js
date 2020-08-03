var app;
(function (app) {
    var slider;
    (function (slider) {
        var customization;
        (function (customization) {
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
        })(customization = slider.customization || (slider.customization = {}));
    })(slider = app.slider || (app.slider = {}));
})(app || (app = {}));
//# sourceMappingURL=liquid-methods.js.map