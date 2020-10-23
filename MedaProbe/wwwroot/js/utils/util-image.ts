

namespace app.util.image {

    export class Color {
        private _r: number;
        private _g: number;
        private _b: number;

        constructor(r: number, g: number, b: number) {
            this._r = r;
            this._g = g;
            this._b = b;
        }

        public R() { return this._r }
        public G() { return this._g }
        public B() { return this._b }
    }

    export function combineImageData(frame: ImageData, over: ImageData, transparent: Color): ImageData {

        let lf = frame.data.length / 4;
        let lo = over.data.length / 4;

        if (lf != lo) throw Error("Frame data lengths are not equals!")

        let tr = transparent.R();
        let tg = transparent.G();
        let tb = transparent.B();

        for (let i = 0; i < lf; i++) {

            let r = over.data[i * 4 + 0];
            let g = over.data[i * 4 + 1];
            let b = over.data[i * 4 + 2];
            let a = over.data[i * 4 + 3];

            if (g == tr && r == tg && b == tb) continue;

            frame.data[i * 4 + 0] = r;
            frame.data[i * 4 + 1] = g;
            frame.data[i * 4 + 2] = b;
            frame.data[i * 4 + 3] = a;

        }

        return frame;
    }

    export function combineImagesByMask(frame: ImageData, over: ImageData, mask: Uint8Array,
        applyMask: (Uint8) => boolean, setTransparent: boolean = false): ImageData {

        let lf = frame.data.length / 4;
        let lo = over.data.length / 4;

        if (lf != lo) throw Error("Frame data lengths are not equals!")
        if (lf != mask.length) throw Error("Frame and mask data lengths are not equals!")

        for (let i = 0; i < lf; i++) {

            if (applyMask(mask[i])) {

                frame.data[i * 4 + 0] = over.data[i * 4 + 0];
                frame.data[i * 4 + 1] = over.data[i * 4 + 1];
                frame.data[i * 4 + 2] = over.data[i * 4 + 2];
                frame.data[i * 4 + 3] = over.data[i * 4 + 3];

            } else if (setTransparent) {

                frame.data[i * 4 + 0] = 0;
                frame.data[i * 4 + 1] = 0;
                frame.data[i * 4 + 2] = 0;
                frame.data[i * 4 + 3] = 1;

            }

        }

        return frame;
    }


}