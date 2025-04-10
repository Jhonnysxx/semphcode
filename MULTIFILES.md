# Implementação de Estrutura de Arquivos Modular

Este documento descreve as alterações realizadas para transformar o projeto de um único arquivo HTML para uma estrutura organizada e modular com diretórios específicos para cada tipo de arquivo.

## Visão Geral da Nova Estrutura

### Estrutura de Diretórios

A nova implementação cria uma estrutura semelhante a esta quando você faz o download do projeto:

```
/nome-do-projeto
│── index.html               # Arquivo HTML principal
│── /css                     # Pasta de estilos CSS
│   ├── styles.css           # Estilos combinados
│   ├── main.css             # Estilo principal (opcional)
│   └── styles-2.css         # Estilos adicionais (opcional)
│── /js                      # Pasta de scripts JavaScript
│   ├── script.js            # Scripts combinados
│   ├── main.js              # Script principal (opcional)
│   └── script-2.js          # Scripts adicionais (opcional)
│── /components              # Componentes HTML reutilizáveis
│   ├── header.html          # Componente de cabeçalho
│   ├── footer.html          # Componente de rodapé
│   ├── nav.html             # Componente de navegação
│   ├── section-hero.html    # Seção principal
│   └── component-*.html     # Outros componentes identificados
```

### 1. Utilitários para Separação Inteligente

Criamos utilitários avançados em `src/utils/functions/fileSeparator.ts` para:
- Identificar e extrair componentes HTML semanticamente (cabeçalho, rodapé, navegação, seções)
- Extrair múltiplos blocos CSS para arquivos separados
- Extrair múltiplos blocos JavaScript para arquivos separados
- Gerar uma estrutura de arquivos organizada por tipo e função

### 2. Download com Diretórios Organizados

Aprimoramos o sistema de download para:
- Criar uma estrutura de diretórios baseada no projeto
- Organizar arquivos em pastas específicas (css, js, components)
- Usar o título do projeto para nomear a pasta principal
- Incluir um README.md detalhado com a estrutura completa

### 3. Interface de Usuário Aprimorada

Melhoramos a interface para suportar todos os arquivos:
- Visualização de componentes em uma estrutura expansível 
- Edição individual de componentes HTML
- Edição de arquivos CSS e JavaScript
- Previsualização do projeto completo

### 4. Instruções Aprimoradas para a API

Atualizamos as instruções para a API DeepSeek, incentivando a criação de código mais modular:
- Uso de elementos HTML semânticos (`<header>`, `<footer>`, `<nav>`, `<section>`)
- Nomeação clara de componentes através de IDs e classes
- Estruturação do código para facilitar a separação em arquivos

## Como Usar

### Visualização de Componentes
1. Após gerar código com a IA, use as abas na área de prévia para alternar entre:
   - Prévia do resultado completo
   - HTML principal (index.html)
   - CSS principal (styles.css)
   - JavaScript principal (script.js)
   - Componentes individuais (clique na aba "Componentes")

2. É possível editar qualquer um dos arquivos, e as alterações serão refletidas automaticamente na prévia.

### Download de Projeto Estruturado
1. Clique no botão "Baixar" no cabeçalho
2. Escolha "Múltiplos arquivos (ZIP)"
3. Um arquivo ZIP será baixado com a estrutura completa de pastas:
   - A pasta principal terá o nome derivado do título do projeto
   - Os componentes estarão separados na pasta "components"
   - CSS e JavaScript estarão nas pastas respectivas

## Benefícios

- **Organização superior**: Estrutura de arquivos semelhante a projetos profissionais
- **Separação de componentes**: Facilita a reutilização e manutenção de partes do código
- **Workflow moderno**: Alinha-se com práticas atuais de desenvolvimento front-end
- **Facilidade de manutenção**: Permite editar cada parte do projeto isoladamente
- **Fácil integração**: Estrutura pronta para ser usada em diversos ambientes de desenvolvimento

## Exemplo de Uso

Esta estrutura é ideal para qualquer tipo de projeto web, como:

- Sites institucionais
- Lojas virtuais (e-commerce)
- Aplicações web
- Landing pages
- Portfólios

Os componentes serão automaticamente identificados e separados com base na estrutura HTML fornecida pela IA, criando uma base sólida para expansão futura do projeto. 