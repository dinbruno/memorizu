# 📸 Geração Automática de Thumbnails

## Overview

O sistema de geração automática de thumbnails foi implementado para criar previews visuais das páginas automaticamente sempre que a página é salva. Isso melhora significativamente a experiência visual no dashboard.

## Funcionalidades

### ✨ **Geração Automática**

- Thumbnail é gerada automaticamente **a cada salvamento da página**
- Substitui automaticamente thumbnails anteriores
- **Isolamento por usuário**: Cada tenant tem seu próprio espaço de armazenamento

### 🎯 **Otimizações**

- **Elementos ignorados**: Botões, toolbars e elementos de interface não aparecem na thumbnail
- **Qualidade otimizada**: Compressão JPEG com 80% de qualidade
- **Dimensões padronizadas**: 800x600 pixels para consistência
- **Escala reduzida**: 50% do tamanho original para arquivos menores

### 🔄 **Firebase Storage**

- Armazenamento em `thumbnails/{userId}/{pageId}.jpg`
- **Substituição automática**: Thumbnails antigas são substituídas
- **Metadados**: Incluem userId, pageId e timestamp de geração
- **URLs públicas**: Acessíveis via getDownloadURL()

## Implementação Técnica

### Arquivo Principal

```typescript
lib / utils / thumbnail - generator.ts;
```

### Funções Principais

#### `generateThumbnail(element, options)`

- Captura screenshot do elemento DOM
- Usa html2canvas com configurações otimizadas
- Retorna Blob da imagem comprimida

#### `uploadThumbnail(userId, pageId, blob)`

- Faz upload para Firebase Storage
- Delete thumbnail anterior automaticamente
- Retorna URL de download

#### `generateAndUploadThumbnail(userId, pageId, element)`

- Função integrada que combina geração + upload
- Logs detalhados para debugging
- Tratamento de erros robusto

### Integração no PageBuilder

```typescript
// Integrado em handleSave()
if (components.length > 0 && currentPageId && currentPageId !== "new") {
  const canvasElement = document.querySelector('[data-page-content="true"]');
  const thumbnailURL = await generateAndUploadThumbnail(user.uid, currentPageId, canvasElement);

  await updatePage(user.uid, currentPageId, {
    thumbnail: thumbnailURL,
    thumbnailGeneratedAt: new Date(),
  });
}
```

## Benefícios

### 🎨 **Experiência Visual**

- Dashboard com previews visuais atraentes
- Reconhecimento rápido de páginas
- Interface mais profissional

### ⚡ **Performance**

- Thumbnails comprimidas (JPEG 80%)
- Carregamento rápido no dashboard
- Cache do Firebase Storage

### 🔐 **Segurança**

- Isolamento por usuário
- URLs temporárias quando necessário
- Integração com autenticação Firebase
