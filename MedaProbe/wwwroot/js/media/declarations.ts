
namespace app.media.data {

    export interface DetectedObject {
        bbox: [number, number, number, number];
        class: string;
        score: number;
    }

}