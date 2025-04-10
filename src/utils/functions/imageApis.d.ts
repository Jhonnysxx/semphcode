export interface ImageApiConfig {
  unsplash: {
    apiKey: string;
    enabled: boolean;
  };
  pixabay: {
    apiKey: string;
    enabled: boolean;
  };
  pexels: {
    apiKey: string;
    enabled: boolean;
  };
}

export interface ImageResult {
  id: string;
  source: 'unsplash' | 'pixabay' | 'pexels';
  url: string;
  smallUrl: string;
  downloadUrl: string;
  width: number;
  height: number;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

export interface SearchImageParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
}

export interface SearchImageResponse {
  results: ImageResult[];
  totalPages: number;
  currentPage: number;
}

export interface ImageApiService {
  search(params: SearchImageParams): Promise<SearchImageResponse>;
  getRandomImage(query?: string): Promise<ImageResult | null>;
  isConfigured(): boolean;
} 