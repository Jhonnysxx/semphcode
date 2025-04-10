import { ImageApiConfig, ImageResult, SearchImageParams, SearchImageResponse } from './imageApis';
export declare function initImageApis(config: Partial<ImageApiConfig>): void;
export declare class ImageService {
    private unsplash;
    private pixabay;
    private pexels;
    constructor();
    updateApiKeys(config: Partial<ImageApiConfig>): void;
    getConfiguredApis(): {
        unsplash: boolean;
        pixabay: boolean;
        pexels: boolean;
    };
    searchImages(params: SearchImageParams): Promise<SearchImageResponse>;
    getRandomImage(query?: string): Promise<ImageResult | null>;
}
export declare const imageService: ImageService;
