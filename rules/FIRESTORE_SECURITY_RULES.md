# 🔒 Regras de Segurança Firestore - Memorizu

## 📋 Visão Geral

Este documento descreve as regras de segurança implementadas para o Firestore e Storage da aplicação Memorizu, substituindo as regras temporárias de desenvolvimento por regras de produção robustas.

## 🔧 Como Implementar

### 1. Firestore Rules

1. **Acesse o Firebase Console** → Seu projeto → **Firestore Database** → **Rules**
2. **Substitua** o conteúdo atual pelo conteúdo do arquivo `firestore.rules`
3. **Clique em "Publicar"**

### 2. Storage Rules

1. **Acesse o Firebase Console** → Seu projeto → **Storage** → **Rules**
2. **Substitua** o conteúdo atual pelo conteúdo do arquivo `storage.rules`
3. **Clique em "Publicar"**

## 🛡️ Estrutura de Segurança

### **Users Collection (`/users/{userId}`)**

**Permissões:**

- ✅ **READ/WRITE**: Usuário autenticado pode acessar apenas seus próprios dados
- ✅ **CREATE**: Apenas com email válido e estrutura correta
- ✅ **UPDATE**: Apenas campos permitidos (displayName, plan, etc.)
- ❌ **Nenhum acesso cruzado** entre usuários

**Campos Protegidos:**

- `email` - Deve corresponder ao token de autenticação
- `plan` - Controlado pelo sistema
- `createdAt` - Imutável após criação

### **Pages Subcollection (`/users/{userId}/pages/{pageId}`)**

**Permissões:**

- ✅ **READ**: Proprietário sempre / Público apenas se `published: true` e `paymentStatus: "paid"`
- ✅ **CREATE**: Apenas pelo proprietário, inicia como `published: false`
- ✅ **UPDATE**: Apenas pelo proprietário, com validação de campos
- ✅ **DELETE**: Apenas pages não publicadas pelo proprietário

**Acesso Público:**

- Páginas com `published: true` e `paymentStatus: "paid"` são visíveis publicamente
- Necessário para o sistema de URLs personalizadas (`customSlug`)

### **Storage (Firebase Storage)**

**Thumbnails (`/thumbnails/{userId}/{pageId}.{ext}`):**

- ✅ **WRITE**: Apenas proprietário, formatos permitidos (jpg, png, webp), máx 5MB
- ✅ **READ**: Público (necessário para visualização)
- ✅ **DELETE**: Apenas proprietário

**User Uploads (`/uploads/{userId}/`):**

- ✅ **WRITE/READ/DELETE**: Apenas proprietário, máx 50MB por arquivo

## 🔍 Validações Implementadas

### **1. Autenticação Obrigatória**

```javascript
function isAuthenticated() {
  return request.auth != null;
}
```

### **2. Controle de Propriedade**

```javascript
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

### **3. Validação de Estrutura**

- **Users**: Campos obrigatórios (email, plan, createdAt)
- **Pages**: Campos obrigatórios (title, published, createdAt)

### **4. Controle de Atualizações**

- **Users**: Apenas campos específicos podem ser alterados
- **Pages**: Lista branca de campos modificáveis

## 🚨 Casos Especiais

### **1. Páginas Publicadas**

- ❌ **Não podem ser excluídas** por usuários normais
- ✅ **Podem ser lidas publicamente** se pagas
- 🔒 **Exclusão apenas por admin** (token personalizado)

### **2. Acesso Global por Slug**

- ✅ Permite busca de páginas por `customSlug` entre todos os usuários
- ✅ Apenas para páginas publicadas e pagas

### **3. Analytics (Futuro)**

- ✅ **WRITE**: Público (permite analytics anônimo)
- ✅ **READ**: Apenas usuários autenticados

## ⚠️ Avisos de Segurança

### **Antes da Implementação:**

1. **Backup**: Faça backup das regras atuais
2. **Teste**: Teste as novas regras em ambiente de desenvolvimento primeiro
3. **Gradual**: Considere implementar gradualmente se tiver muitos usuários

### **Verificações Pós-Implementação:**

1. ✅ Login/Logout funcionando
2. ✅ Criação de páginas funcionando
3. ✅ Visualização de páginas publicadas funcionando
4. ✅ Upload de thumbnails funcionando
5. ✅ URLs personalizadas funcionando

## 🔧 Comandos úteis

### **Testar Regras Localmente (Firebase CLI):**

```bash
firebase emulators:start --only firestore
```

### **Validar Regras:**

```bash
firebase firestore:rules:validate firestore.rules
```

### **Deploy das Regras:**

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 📊 Monitoramento

Após implementar as regras, monitore:

1. **Firebase Console** → **Usage** para verificar denials
2. **Logs** para erros de permissão
3. **Feedback dos usuários** sobre funcionalidades quebradas

## 🆘 Rollback

Se algo der errado, você pode voltar rapidamente para as regras permissivas temporárias:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📝 Notas Adicionais

- As regras são **hierárquicas**: regras mais específicas sobrepõem regras gerais
- **Performance**: Regras complexas podem impactar performance marginalmente
- **Logs**: Sempre monitore logs após mudanças em produção
- **Testes**: Considere criar testes automatizados para validar regras

---

**🔒 Última atualização:** [Data da implementação]  
**👤 Implementado por:** [Seu nome]  
**📋 Status:** Pronto para produção
