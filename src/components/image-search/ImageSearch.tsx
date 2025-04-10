import { useState, useEffect } from 'react';
import { FiSearch, FiImage, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { imageService } from '../../utils/functions/imageApis';
import { ImageApiConfig, ImageResult, SearchImageParams } from '../../utils/functions/imageApis.d';
import './ImageSearch.css';

interface ImageSearchProps {
  onSelectImage: (image: ImageResult) => void;
  onClose: () => void;
}

export default function ImageSearch({ onSelectImage, onClose }: ImageSearchProps) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'square' | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    unsplash: '',
    pixabay: '',
    pexels: ''
  });
  
  // Verifica quais APIs estão configuradas
  const configuredApis = imageService.getConfiguredApis();
  const hasAnyApiConfigured = configuredApis.unsplash || configuredApis.pixabay || configuredApis.pexels;
  
  // Buscar as chaves de API do servidor quando o componente for carregado
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/image-api-keys');
        if (response.ok) {
          const data = await response.json();
          
          // Atualizar as chaves no serviço de imagens
          imageService.updateApiKeys(data);
          
          // Atualizar o estado local com as chaves existentes
          setApiKeys({
            unsplash: data.unsplash?.apiKey || '',
            pixabay: data.pixabay?.apiKey || '',
            pexels: data.pexels?.apiKey || ''
          });
          
          // Verificar se alguma API está configurada
          const hasAnyConfigured = !!data.unsplash?.apiKey || !!data.pixabay?.apiKey || !!data.pexels?.apiKey;
          setShowSettings(!hasAnyConfigured);
        }
      } catch (error) {
        console.error('Erro ao buscar as chaves de API:', error);
        setShowSettings(true);
      }
    };
    
    fetchApiKeys();
  }, []);
  
  // Buscar imagens baseado na consulta
  const searchImages = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const params: SearchImageParams = {
        query: query.trim(),
        page,
        perPage: 20,
        orientation
      };
      
      const result = await imageService.searchImages(params);
      setImages(result.results);
      setTotalPages(result.totalPages);
      
      if (result.results.length === 0) {
        toast.info('Nenhuma imagem encontrada para essa busca');
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      toast.error('Erro ao buscar imagens. Verifique as chaves de API.');
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar imagem aleatória
  const getRandomImage = async () => {
    setLoading(true);
    try {
      const randomQuery = query.trim() || undefined;
      const image = await imageService.getRandomImage(randomQuery);
      
      if (image) {
        setImages([image]);
        setTotalPages(1);
      } else {
        toast.info('Não foi possível encontrar uma imagem aleatória');
      }
    } catch (error) {
      console.error('Erro ao buscar imagem aleatória:', error);
      toast.error('Erro ao buscar imagem aleatória');
    } finally {
      setLoading(false);
    }
  };
  
  // Salvar as chaves de API
  const saveApiKeys = () => {
    imageService.updateApiKeys({
      unsplash: { apiKey: apiKeys.unsplash, enabled: true },
      pixabay: { apiKey: apiKeys.pixabay, enabled: true },
      pexels: { apiKey: apiKeys.pexels, enabled: true }
    });
    
    toast.success('Chaves de API atualizadas com sucesso');
    setShowSettings(false);
  };
  
  // Executar busca ao pressionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchImages();
    }
  };
  
  // Navegar para a página anterior
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  // Navegar para a próxima página
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  // Efeito para buscar quando mudar a página
  useEffect(() => {
    if (query.trim() && page > 0) {
      searchImages();
    }
  }, [page, orientation]);
  
  // Se nenhuma API estiver configurada, mostra as configurações primeiro
  useEffect(() => {
    if (!hasAnyApiConfigured) {
      setShowSettings(true);
    }
  }, [hasAnyApiConfigured]);
  
  return (
    <div className="image-search-container">
      <div className="image-search-header">
        <h3>Busca de Imagens</h3>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      
      {showSettings ? (
        <div className="api-settings">
          <h4>Configurar Chaves de API</h4>
          <p>Para usar a busca de imagens, você precisa configurar pelo menos uma API.</p>
          
          <div className="api-key-input">
            <label>Unsplash API Key</label>
            <input 
              type="text" 
              value={apiKeys.unsplash} 
              onChange={(e) => setApiKeys({...apiKeys, unsplash: e.target.value})}
              placeholder="Insira sua chave da API Unsplash" 
            />
            <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
              Obter chave da Unsplash
            </a>
          </div>
          
          <div className="api-key-input">
            <label>Pixabay API Key</label>
            <input 
              type="text" 
              value={apiKeys.pixabay} 
              onChange={(e) => setApiKeys({...apiKeys, pixabay: e.target.value})}
              placeholder="Insira sua chave da API Pixabay" 
            />
            <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
              Obter chave da Pixabay
            </a>
          </div>
          
          <div className="api-key-input">
            <label>Pexels API Key</label>
            <input 
              type="text" 
              value={apiKeys.pexels} 
              onChange={(e) => setApiKeys({...apiKeys, pexels: e.target.value})}
              placeholder="Insira sua chave da API Pexels" 
            />
            <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
              Obter chave da Pexels
            </a>
          </div>
          
          <div className="settings-buttons">
            <button 
              className="cancel-button" 
              onClick={() => hasAnyApiConfigured ? setShowSettings(false) : onClose()}
            >
              Cancelar
            </button>
            <button 
              className="save-button"
              onClick={saveApiKeys}
            >
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="search-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar imagens (ex: natureza, cidade, tecnologia...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={searchImages} disabled={loading || !query.trim()}>
                <FiSearch /> Buscar
              </button>
              <button onClick={getRandomImage} disabled={loading} title="Imagem aleatória">
                <FiRefreshCw /> Aleatória
              </button>
            </div>
            
            <div className="filter-controls">
              <select 
                value={orientation || ''}
                onChange={(e) => setOrientation(e.target.value as any || undefined)}
              >
                <option value="">Qualquer orientação</option>
                <option value="landscape">Paisagem</option>
                <option value="portrait">Retrato</option>
                <option value="square">Quadrada</option>
              </select>
              
              <button 
                className="settings-button" 
                onClick={() => setShowSettings(true)}
                title="Configurações de API"
              >
                <FiSettings />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Buscando imagens...</p>
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="images-grid">
                {images.map((image) => (
                  <div 
                    key={`${image.source}-${image.id}`}
                    className="image-item"
                    onClick={() => onSelectImage(image)}
                  >
                    <img src={image.smallUrl} alt={image.alt} />
                    <div className="image-overlay">
                      <div className="image-source">{image.source}</div>
                      {image.photographer && (
                        <div className="image-photographer">
                          Por: {image.photographer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={prevPage} disabled={page === 1}>
                    &laquo; Anterior
                  </button>
                  <span className="page-info">
                    Página {page} de {totalPages}
                  </span>
                  <button onClick={nextPage} disabled={page >= totalPages}>
                    Próxima &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FiImage size={48} />
              <p>
                Busque por imagens para adicionar ao seu projeto.
                As imagens são fornecidas por Unsplash, Pixabay e Pexels.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 