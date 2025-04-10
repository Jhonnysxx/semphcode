# Documentação de Refatoração

Este documento descreve as alterações realizadas na estrutura do projeto para melhorar a organização do código, separando estilos, lógica e componentes.

## Estrutura de Diretórios

A nova estrutura de diretórios do projeto é a seguinte:

```
src/
├── assets/           # Arquivos estáticos (imagens, sons, etc.)
├── components/       # Componentes React
│   ├── header/
│   ├── tabs/
│   ├── preview/
│   └── ...
├── hooks/            # Hooks personalizados React
│   └── useEditorLayout.ts
├── styles/           # Arquivos CSS
│   └── global.css    # Estilos globais da aplicação
├── utils/
│   ├── consts.js     # Constantes e valores padrão
│   └── functions/    # Funções utilitárias
│       └── fileOperations.ts
└── main.tsx          # Ponto de entrada da aplicação
```

## Principais Alterações

### 1. Separação de Estilos

- Criamos um arquivo `global.css` em `src/styles/` para centralizar os estilos globais
- Utilizamos classes CSS nomeadas semanticamente em vez de classes Tailwind diretamente
- Organizamos o CSS em seções (Base, Typography, Buttons, Layout, etc.)

### 2. Extração de Hooks Personalizados

- Criamos o hook `useEditorLayout` para encapsular a lógica de layout e redimensionamento
- Reduzimos a complexidade do componente App.tsx movendo essa lógica para um hook dedicado

### 3. Funções Utilitárias

- Criamos funções utilitárias para operações com arquivos no diretório `src/utils/functions/`
- Implementamos `downloadFile` e `downloadHTML` para centralizar a lógica de download

### 4. Constantes e Valores Padrão

- Movemos constantes como `defaultHTML` para um arquivo dedicado em `src/utils/consts.js`

### 5. Organização de Componentes

- Mantivemos a estrutura existente de componentes modularizados
- Simplificamos a passagem de props entre componentes
- Utilizamos classes CSS mais semânticas nos componentes

## Benefícios da Refatoração

1. **Manutenção mais fácil**: Código mais organizado e modular
2. **Reusabilidade**: Hooks e funções utilitárias podem ser reutilizados em diferentes partes da aplicação
3. **Separação de responsabilidades**: CSS separado do JavaScript, lógica de negócio separada da interface
4. **Melhor legibilidade**: Classes CSS semânticas facilitam a compreensão do código
5. **Melhor escalabilidade**: Estrutura que facilita adicionar novos recursos e funcionalidades

## Como iniciar o projeto

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev

# Construir para produção
npm run build
``` 