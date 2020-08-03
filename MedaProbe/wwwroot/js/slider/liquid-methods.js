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
        })(customization = slider.customization || (slider.customization = {}));
    })(slider = app.slider || (app.slider = {}));
})(app || (app = {}));
//# sourceMappingURL=liquid-methods.js.map