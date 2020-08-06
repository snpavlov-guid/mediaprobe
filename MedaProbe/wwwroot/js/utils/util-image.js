var app;
(function (app) {
    var util;
    (function (util) {
        var image;
        (function (image) {
            class Color {
                constructor(r, g, b) {
                    this._r = r;
                    this._g = g;
                    this._b = b;
                }
                R() { return this._r; }
                G() { return this._g; }
                B() { return this._b; }
            }
            image.Color = Color;
            function combineImageData(frame, over, transparent) {
                let lf = frame.data.length / 4;
                let lo = over.data.length / 4;
                if (lf != lo)
                    throw Error("Frame data lengths are not equals!");
                let tr = transparent.R();
                let tg = transparent.G();
                let tb = transparent.B();
                for (let i = 0; i < lf; i++) {
                    let r = over.data[i * 4 + 0];
                    let g = over.data[i * 4 + 1];
                    let b = over.data[i * 4 + 2];
                    let a = over.data[i * 4 + 3];
                    if (g == tr && r == tg && b == tb)
                        continue;
                    frame.data[i * 4 + 0] = r;
                    frame.data[i * 4 + 1] = g;
                    frame.data[i * 4 + 2] = b;
                    frame.data[i * 4 + 3] = a;
                }
                return frame;
            }
            image.combineImageData = combineImageData;
        })(image = util.image || (util.image = {}));
    })(util = app.util || (app.util = {}));
})(app || (app = {}));
