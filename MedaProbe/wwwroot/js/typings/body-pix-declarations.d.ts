
declare namespace BodyPix {

    export type BodyPixInternalResolution = number | 'low' | 'medium' | 'high' | 'full';
    export type BodyPixOutputStride = 32 | 16 | 8;
    export type BodyPixArchitecture = 'ResNet50' | 'MobileNetV1';
    export type BodyPixQuantBytes = 1 | 2 | 4;
    export type BodyPixMultiplier = 1.0 | 0.75 | 0.50;
    export type ImageType = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    export type BodyPixInput = ImageData | ImageType; // | tf.Tensor3D;

    export type PersonSegmentation = {
        data: Uint8Array;
        width: number;
        height: number;
        pose: Pose;
    };
    export type SemanticPersonSegmentation = {
        data: Uint8Array;
        width: number;
        height: number;
        allPoses: Pose[];
    };
    export type PartSegmentation = {
        data: Int32Array;
        width: number;
        height: number;
        pose: Pose;
    };
    export type SemanticPartSegmentation = {
        data: Int32Array;
        width: number;
        height: number;
        allPoses: Pose[];
    };
    export interface Padding {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }
    export type Part = {
        heatmapX: number;
        heatmapY: number;
        id: number;
    };
    export type Vector2D = {
        y: number;
        x: number;
    };
    //export type TensorBuffer3D = tf.TensorBuffer<tf.Rank.R3>;
    export type PartWithScore = {
        score: number;
        part: Part;
    };
    export type Keypoint = {
        score: number;
        position: Vector2D;
        part: string;
    };
    export type Pose = {
        keypoints: Keypoint[];
        score: number;
    };
    export type Color = {
        r: number;
        g: number;
        b: number;
        a: number;
    };

    export interface ModelConfig {
        architecture: BodyPixArchitecture;
        outputStride: BodyPixOutputStride;
        multiplier?: BodyPixMultiplier;
        modelUrl?: string;
        quantBytes?: BodyPixQuantBytes;
    }
    export interface InferenceConfig {
        flipHorizontal?: boolean;
        internalResolution?: BodyPixInternalResolution;
        segmentationThreshold?: number;
    }
    export interface PersonInferenceConfig extends InferenceConfig {
        maxDetections?: number;
        scoreThreshold?: number;
        nmsRadius?: number;
    }
    export interface MultiPersonInstanceInferenceConfig extends InferenceConfig {
        maxDetections?: number;
        scoreThreshold?: number;
        nmsRadius?: number;
        minKeypointScore?: number;
        refineSteps?: number;
    }
    export const PERSON_INFERENCE_CONFIG: PersonInferenceConfig;
    export const MULTI_PERSON_INSTANCE_INFERENCE_CONFIG: MultiPersonInstanceInferenceConfig;

    //export abstract class BaseModel {
    //    protected readonly model: tfconv.GraphModel;
    //    readonly outputStride: BodyPixOutputStride;
    //    constructor(model: tfconv.GraphModel, outputStride: BodyPixOutputStride);
    //    abstract preprocessInput(input: tf.Tensor3D): tf.Tensor3D;
    //    predict(input: tf.Tensor3D): {
    //        heatmapScores: tf.Tensor3D;
    //        offsets: tf.Tensor3D;
    //        displacementFwd: tf.Tensor3D;
    //        displacementBwd: tf.Tensor3D;
    //        segmentation: tf.Tensor3D;
    //        partHeatmaps: tf.Tensor3D;
    //        longOffsets: tf.Tensor3D;
    //        partOffsets: tf.Tensor3D;
    //    };
    //    abstract nameOutputResults(results: tf.Tensor3D[]): {
    //        heatmap: tf.Tensor3D;
    //        offsets: tf.Tensor3D;
    //        displacementFwd: tf.Tensor3D;
    //        displacementBwd: tf.Tensor3D;
    //        segmentation: tf.Tensor3D;
    //        partHeatmaps: tf.Tensor3D;
    //        longOffsets: tf.Tensor3D;
    //        partOffsets: tf.Tensor3D;
    //    };
    //    dispose(): void;
    //}


    //export class BodyPix {
    //    baseModel: BaseModel;
    //    constructor(net: BaseModel);
    //    private predictForPersonSegmentation;
    //    private predictForPersonSegmentationAndPart;
    //    private predictForMultiPersonInstanceSegmentationAndPart;
    //    segmentPersonActivation(input: BodyPixInput, internalResolution: BodyPixInternalResolution, segmentationThreshold?: number): {
    //        segmentation: tf.Tensor2D;
    //        heatmapScores: tf.Tensor3D;
    //        offsets: tf.Tensor3D;
    //        displacementFwd: tf.Tensor3D;
    //        displacementBwd: tf.Tensor3D;
    //        padding: Padding;
    //        internalResolutionHeightAndWidth: [number, number];
    //    };
    //    segmentPerson(input: BodyPixInput, config?: PersonInferenceConfig): Promise<SemanticPersonSegmentation>;
    //    segmentMultiPerson(input: BodyPixInput, config?: MultiPersonInstanceInferenceConfig): Promise<PersonSegmentation[]>;
    //    segmentPersonPartsActivation(input: BodyPixInput, internalResolution: BodyPixInternalResolution, segmentationThreshold?: number): {
    //        partSegmentation: tf.Tensor2D;
    //        heatmapScores: tf.Tensor3D;
    //        offsets: tf.Tensor3D;
    //        displacementFwd: tf.Tensor3D;
    //        displacementBwd: tf.Tensor3D;
    //        padding: Padding;
    //        internalResolutionHeightAndWidth: [number, number];
    //    };
    //    segmentPersonParts(input: BodyPixInput, config?: PersonInferenceConfig): Promise<SemanticPartSegmentation>;
    //    segmentMultiPersonParts(input: BodyPixInput, config?: MultiPersonInstanceInferenceConfig): Promise<PartSegmentation[]>;
    //    dispose(): void;
    //}

    //export function load(config?: ModelConfig): Promise<BodyPix>;

}