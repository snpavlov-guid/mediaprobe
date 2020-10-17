var app;
(function (app) {
    var media;
    (function (media) {
        class CameraBackground extends media.CamcorderBase {
            constructor(element, options) {
                super(element, options);
                this._sourceCanvas = this._element.querySelector('#source-canvas');
            }
        }
        media.CameraBackground = CameraBackground;
    })(media = app.media || (app.media = {}));
})(app || (app = {}));
//# sourceMappingURL=camera-background.js.map