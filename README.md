---
title: Editor HTML com IA
emoji: 🌟
colorFrom: blue
colorTo: purple
sdk: docker
pinned: true
app_port: 5173
license: mit
short_description: Editor inteligente de HTML que utiliza IA para ajudar na criação de páginas web
---

# Editor HTML com IA

Uma plataforma para construir sites e aplicações web usando IA generativa. Basta descrever o que você deseja e a aplicação criará o código HTML, CSS e JavaScript necessário.

## Funcionalidades

### Assistente de Programação com IA
- Gere código HTML, CSS e JavaScript descrevendo o que deseja construir
- Faça perguntas sobre desenvolvimento web e programação
- Receba respostas detalhadas e exemplos práticos

### Editor de Código
- Editor de código completo com syntax highlighting
- Pré-visualização instantânea das suas criações
- Navegação fácil entre o editor e a pré-visualização

### Busca de Imagens
- Integração com APIs de imagens populares (Unsplash, Pixabay, Pexels)
- Busque e selecione imagens para seus projetos diretamente na interface
- Atribuição automática de créditos aos fotógrafos

## Configuração da Busca de Imagens

Para usar a funcionalidade de busca de imagens, você precisa configurar as chaves de API dos provedores de imagens. Você pode configurar uma ou mais das seguintes APIs:

1. **Unsplash API** - [Obtenha uma chave aqui](https://unsplash.com/developers)
2. **Pixabay API** - [Obtenha uma chave aqui](https://pixabay.com/api/docs/)
3. **Pexels API** - [Obtenha uma chave aqui](https://www.pexels.com/api/)

Depois de obter suas chaves:

1. Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example`
2. Adicione suas chaves de API ao arquivo `.env`:
   ```
   UNSPLASH_API_KEY=sua_chave_aqui
   PIXABAY_API_KEY=sua_chave_aqui
   PEXELS_API_KEY=sua_chave_aqui
   ```
3. Reinicie o servidor

Alternativamente, você pode configurar as chaves diretamente na interface do usuário:
1. Clique no botão "Imagens" na interface de chat
2. Clique em "Configurações" no modal de busca de imagens
3. Insira suas chaves de API e salve

## Como Usar a Busca de Imagens

1. Clique no botão "Imagens" na interface de chat
2. Digite um termo de busca na caixa de pesquisa
3. Use os filtros para refinar sua busca por orientação
4. Clique em uma imagem para selecioná-la e adicioná-la ao seu projeto
5. A imagem será inserida no seu código HTML com a atribuição apropriada

## Execução Local

Para executar o projeto localmente:

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador para começar a usar.

## Tecnologias Utilizadas

- React
- TypeScript
- Express
- TailwindCSS
- APIs de imagens (Unsplash, Pixabay, Pexels)
- APIs de IA para geração de código e resposta a perguntas

---

Desenvolvido como uma ferramenta educacional e de produtividade para desenvolvedores web.