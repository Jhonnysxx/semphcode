// Definição das Interfaces/Tipos diretamente no arquivo
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
  color?: string; // Adicionado parâmetro de cor
}

export interface SearchImageResponse {
  results: ImageResult[];
  totalPages: number;
  currentPage: number;
}

export interface ImageApiConfig {
  unsplash: { apiKey: string; enabled: boolean };
  pixabay: { apiKey: string; enabled: boolean };
  pexels: { apiKey: string; enabled: boolean };
}

export interface ImageApiService {
  isConfigured(): boolean;
  search(params: SearchImageParams): Promise<SearchImageResponse>;
  getRandomImage(query?: string): Promise<ImageResult | null>;
}

// Configuração das APIs
let apiConfig: ImageApiConfig = {
  unsplash: {
    apiKey: process.env.UNSPLASH_API_KEY || '',
    enabled: false
  },
  pixabay: {
    apiKey: process.env.PIXABAY_API_KEY || '',
    enabled: false
  },
  pexels: {
    apiKey: process.env.PEXELS_API_KEY || '',
    enabled: false
  }
};

// Função para inicializar a configuração das APIs
export function initImageApis(config: Partial<ImageApiConfig>) {
  apiConfig = {
    ...apiConfig,
    ...config
  };
  
  // Atualiza o estado de enabled com base na presença de API keys
  apiConfig.unsplash.enabled = !!apiConfig.unsplash.apiKey;
  apiConfig.pixabay.enabled = !!apiConfig.pixabay.apiKey;
  apiConfig.pexels.enabled = !!apiConfig.pexels.apiKey;
  
  console.log('APIs de imagens inicializadas:', {
    unsplash: apiConfig.unsplash.enabled,
    pixabay: apiConfig.pixabay.enabled,
    pexels: apiConfig.pexels.enabled
  });
}

/**
 * Implementação do serviço da API Unsplash
 */
class UnsplashApiService implements ImageApiService {
  private readonly baseUrl = 'https://api.unsplash.com';
  
  constructor(private apiKey: string) {}
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async search(params: SearchImageParams): Promise<SearchImageResponse> {
    if (!this.isConfigured()) {
      return { results: [], totalPages: 0, currentPage: 0 };
    }
    
    try {
      const queryParams = new URLSearchParams({
        query: params.query,
        page: String(params.page || 1),
        per_page: String(params.perPage || 20)
      });
      
      // Adicionar orientação apenas se estiver definida
      if (params.orientation) {
        queryParams.append('orientation', params.orientation);
      }
      
      if (params.color) {
        queryParams.append('color', params.color);
      }
      
      const response = await fetch(`${this.baseUrl}/search/photos?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API Unsplash: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        results: data.results.map((img: any): ImageResult => ({
          id: img.id,
          source: 'unsplash',
          url: img.urls.regular,
          smallUrl: img.urls.small,
          downloadUrl: img.urls.raw,
          width: img.width,
          height: img.height,
          alt: img.alt_description || img.description || params.query,
          photographer: img.user.name,
          photographerUrl: img.user.links.html
        })),
        totalPages: data.total_pages,
        currentPage: params.page || 1
      };
    } catch (error) {
      console.error('Erro ao buscar imagens do Unsplash:', error);
      return { results: [], totalPages: 0, currentPage: 0 };
    }
  }
  
  async getRandomImage(query?: string): Promise<ImageResult | null> {
    if (!this.isConfigured()) {
      return null;
    }
    
    try {
      const queryParams = new URLSearchParams();
      if (query) {
        queryParams.append('query', query);
      }
      
      const response = await fetch(`${this.baseUrl}/photos/random?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API Unsplash: ${response.status}`);
      }
      
      const img = await response.json();
      
      return {
        id: img.id,
        source: 'unsplash',
        url: img.urls.regular,
        smallUrl: img.urls.small,
        downloadUrl: img.urls.raw,
        width: img.width,
        height: img.height,
        alt: img.alt_description || img.description || query || 'random image',
        photographer: img.user.name,
        photographerUrl: img.user.links.html
      };
    } catch (error) {
      console.error('Erro ao buscar imagem aleatória do Unsplash:', error);
      return null;
    }
  }
}

/**
 * Implementação do serviço da API Pixabay
 */
class PixabayApiService implements ImageApiService {
  private readonly baseUrl = 'https://pixabay.com/api/';
  
  constructor(private apiKey: string) {}
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async search(params: SearchImageParams): Promise<SearchImageResponse> {
    if (!this.isConfigured()) {
      return { results: [], totalPages: 0, currentPage: 0 };
    }
    
    try {
      const perPage = params.perPage || 20;
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        q: params.query,
        page: String(params.page || 1),
        per_page: String(perPage),
        image_type: 'photo'
      });
      
      // Adicionar orientação apenas se estiver definida
      if (params.orientation) {
        queryParams.append('orientation', params.orientation);
      }
      
      if (params.color) {
        queryParams.append('colors', params.color);
      }
      
      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API Pixabay: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cálculo de páginas total baseado no total de hits e items por página
      const totalPages = Math.ceil(data.totalHits / perPage);
      
      return {
        results: data.hits.map((img: any): ImageResult => ({
          id: String(img.id),
          source: 'pixabay',
          url: img.webformatURL,
          smallUrl: img.previewURL,
          downloadUrl: img.largeImageURL,
          width: img.imageWidth,
          height: img.imageHeight,
          alt: params.query,
          photographer: img.user,
          photographerUrl: `https://pixabay.com/users/${img.user}-${img.user_id}/`
        })),
        totalPages,
        currentPage: params.page || 1
      };
    } catch (error) {
      console.error('Erro ao buscar imagens do Pixabay:', error);
      return { results: [], totalPages: 0, currentPage: 0 };
    }
  }
  
  async getRandomImage(query?: string): Promise<ImageResult | null> {
    if (!this.isConfigured()) {
      return null;
    }
    
    try {
      // Pixabay não tem endpoint para imagens aleatórias, então buscamos várias e escolhemos uma
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        q: query || 'nature',
        per_page: '50',
        image_type: 'photo'
      });
      
      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API Pixabay: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.hits || data.hits.length === 0) {
        return null;
      }
      
      // Escolhe uma imagem aleatória do conjunto
      const img = data.hits[Math.floor(Math.random() * data.hits.length)];
      
      return {
        id: String(img.id),
        source: 'pixabay',
        url: img.webformatURL,
        smallUrl: img.previewURL,
        downloadUrl: img.largeImageURL,
        width: img.imageWidth,
        height: img.imageHeight,
        alt: query || 'random image',
        photographer: img.user,
        photographerUrl: `https://pixabay.com/users/${img.user}-${img.user_id}/`
      };
    } catch (error) {
      console.error('Erro ao buscar imagem aleatória do Pixabay:', error);
      return null;
    }
  }
}

/**
 * Implementação do serviço da API Pexels
 */
class PexelsApiService implements ImageApiService {
  private readonly baseUrl = 'https://api.pexels.com/v1';
  
  constructor(private apiKey: string) {}
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async search(params: SearchImageParams): Promise<SearchImageResponse> {
    if (!this.isConfigured()) {
      return { results: [], totalPages: 0, currentPage: 0 };
    }
    
    try {
      const queryParams = new URLSearchParams({
        query: params.query,
        page: String(params.page || 1),
        per_page: String(params.perPage || 20)
      });
      
      // Adicionar orientação apenas se estiver definida
      if (params.orientation) {
        queryParams.append('orientation', params.orientation);
      }
      
      const response = await fetch(`${this.baseUrl}/search?${queryParams.toString()}`, {
        headers: {
          'Authorization': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API Pexels: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        results: data.photos.map((img: any): ImageResult => ({
          id: String(img.id),
          source: 'pexels',
          url: img.src.medium,
          smallUrl: img.src.small,
          downloadUrl: img.src.original,
          width: img.width,
          height: img.height,
          alt: img.alt || params.query,
          photographer: img.photographer,
          photographerUrl: img.photographer_url
        })),
        totalPages: Math.ceil(data.total_results / (params.perPage || 20)),
        currentPage: params.page || 1
      };
    } catch (error) {
      console.error('Erro ao buscar imagens do Pexels:', error);
      return { results: [], totalPages: 0, currentPage: 0 };
    }
  }
  
  async getRandomImage(query?: string): Promise<ImageResult | null> {
    if (!this.isConfigured()) {
      return null;
    }
    
    try {
      // Pexels tem um endpoint para fotos curadas, que pode ser usado como aleatório
      const endpoint = query 
        ? `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=1`
        : `${this.baseUrl}/curated?per_page=1&page=${Math.floor(Math.random() * 100) + 1}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API Pexels: ${response.status}`);
      }
      
      const data = await response.json();
      const photos = query ? data.photos : data.photos;
      
      if (!photos || photos.length === 0) {
        return null;
      }
      
      const img = photos[0];
      
      return {
        id: String(img.id),
        source: 'pexels',
        url: img.src.medium,
        smallUrl: img.src.small,
        downloadUrl: img.src.original,
        width: img.width,
        height: img.height,
        alt: img.alt || query || 'random image',
        photographer: img.photographer,
        photographerUrl: img.photographer_url
      };
    } catch (error) {
      console.error('Erro ao buscar imagem aleatória do Pexels:', error);
      return null;
    }
  }
}

// Serviço agregador que combina resultados de todas as APIs
export class ImageService {
  private unsplash: UnsplashApiService;
  private pixabay: PixabayApiService;
  private pexels: PexelsApiService;
  
  constructor() {
    this.unsplash = new UnsplashApiService(apiConfig.unsplash.apiKey);
    this.pixabay = new PixabayApiService(apiConfig.pixabay.apiKey);
    this.pexels = new PexelsApiService(apiConfig.pexels.apiKey);
  }
  
  // Atualiza as chaves de API
  updateApiKeys(config: Partial<ImageApiConfig>) {
    if (config.unsplash?.apiKey) {
      apiConfig.unsplash.apiKey = config.unsplash.apiKey;
      apiConfig.unsplash.enabled = true;
      this.unsplash = new UnsplashApiService(apiConfig.unsplash.apiKey);
    }
    
    if (config.pixabay?.apiKey) {
      apiConfig.pixabay.apiKey = config.pixabay.apiKey;
      apiConfig.pixabay.enabled = true;
      this.pixabay = new PixabayApiService(apiConfig.pixabay.apiKey);
    }
    
    if (config.pexels?.apiKey) {
      apiConfig.pexels.apiKey = config.pexels.apiKey;
      apiConfig.pexels.enabled = true;
      this.pexels = new PexelsApiService(apiConfig.pexels.apiKey);
    }
  }
  
  // Retorna quais APIs estão configuradas
  getConfiguredApis() {
    return {
      unsplash: this.unsplash.isConfigured(),
      pixabay: this.pixabay.isConfigured(),
      pexels: this.pexels.isConfigured()
    };
  }
  
  // Busca imagens em todas as APIs configuradas
  async searchImages(params: SearchImageParams): Promise<SearchImageResponse> {
    const results: ImageResult[] = [];
    let totalPages = 0;
    
    // Chama as APIs configuradas em paralelo
    const promises: Promise<SearchImageResponse>[] = []; // Tipagem explícita do array
    
    if (apiConfig.unsplash.enabled) {
      promises.push(this.unsplash.search(params));
    }
    
    if (apiConfig.pixabay.enabled) {
      promises.push(this.pixabay.search(params));
    }
    
    if (apiConfig.pexels.enabled) {
      promises.push(this.pexels.search(params));
    }
    
    if (promises.length === 0) {
      return { results: [], totalPages: 0, currentPage: params.page || 1 };
    }
    
    // Aguarda todas as chamadas de API terminarem
    const responses = await Promise.all(promises);
    
    // Combina os resultados (agora deve funcionar com a tipagem correta)
    for (const response of responses) {
      results.push(...response.results);
      totalPages = Math.max(totalPages, response.totalPages);
    }
    
    // Retorna os resultados combinados
    return {
      results,
      totalPages,
      currentPage: params.page || 1
    };
  }
  
  // Obtém uma imagem aleatória de uma das APIs configuradas
  async getRandomImage(query?: string): Promise<ImageResult | null> {
    // Lista de APIs habilitadas
    const enabledApis: string[] = []; // Tipagem explícita do array
    
    if (apiConfig.unsplash.enabled) enabledApis.push('unsplash');
    if (apiConfig.pixabay.enabled) enabledApis.push('pixabay');
    if (apiConfig.pexels.enabled) enabledApis.push('pexels');
    
    if (enabledApis.length === 0) {
      return null;
    }
    
    // Escolhe uma API aleatória
    const randomApi = enabledApis[Math.floor(Math.random() * enabledApis.length)];
    
    // Busca uma imagem aleatória da API escolhida
    switch (randomApi) {
      case 'unsplash':
        return this.unsplash.getRandomImage(query);
      case 'pixabay':
        return this.pixabay.getRandomImage(query);
      case 'pexels':
        return this.pexels.getRandomImage(query);
      default:
        return null;
    }
  }
}

// Instância global do serviço de imagens
export const imageService = new ImageService(); 