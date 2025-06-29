# 🎉 Sistema de Boas-vindas - Aurora Bot

## 📋 Configuração

### 1. API Key da SpiderX
Adicione sua API Key da SpiderX no arquivo `.env`:

```env
SPIDERX_API_KEY=sua_api_key_aqui
```

### 2. Como obter a API Key
1. Acesse: https://spiderx.com.br
2. Faça login ou crie uma conta
3. Vá para a seção de API Keys
4. Copie sua chave de API

## 🚀 Funcionalidades

### ✅ Boas-vindas Automáticas
- **Detecção automática** quando alguém entra no grupo
- **Canvas personalizado** com foto do usuário
- **Informações do usuário** (nome, registro, saldo)
- **Mensagem personalizada** baseada no status de registro
- **Foto do perfil** incluída automaticamente

### ✅ Despedidas
- **Mensagem de despedida** quando alguém sai
- **Texto personalizado** e amigável

### ✅ Proteções
- **Cache anti-spam** (1 minuto de cooldown)
- **Fallback para texto** se a API falhar
- **Tratamento de erros** completo
- **Logs detalhados** para debug

## 🎮 Comandos

### `!testwelcome`
- **Função**: Testar o sistema de boas-vindas completo
- **Restrição**: Apenas administradores
- **Uso**: Apenas em grupos
- **Resultado**: Gera um canvas de teste com foto

### `!testprofile`
- **Função**: Testar obtenção da foto do perfil
- **Restrição**: Apenas administradores
- **Uso**: Apenas em grupos
- **Resultado**: Mostra a foto do perfil do usuário

## 📊 Informações Exibidas

### Para Usuários Registrados:
- ✅ Nome do usuário
- ✅ Número de telefone
- ✅ Status de registro
- ✅ Nome registrado
- ✅ Saldo atual
- ✅ Nome do grupo
- ✅ Total de membros
- ✅ **Foto do perfil** no canvas

### Para Usuários Não Registrados:
- ✅ Nome do usuário
- ✅ Número de telefone
- ✅ Status de registro
- ✅ Instruções para registro
- ✅ Nome do grupo
- ✅ Total de membros
- ✅ **Foto do perfil** no canvas

## 🔧 Estrutura dos Arquivos

```
src/
├── core/
│   ├── groupEvents.js     # Sistema de eventos de grupo
│   └── handler.js         # Handler principal
├── commands/
│   └── admin/
│       ├── testwelcome.js # Comando de teste completo
│       └── testprofile.js # Comando de teste de foto
└── index.js               # Arquivo principal
```

## 🎨 Personalização

### Modificar Mensagens
Edite o arquivo `src/core/groupEvents.js`:

```javascript
// Mensagem de boas-vindas
const welcomeMessage = `
🎉 *BEM-VINDO(A) AO GRUPO!*
// ... sua mensagem personalizada
`;

// Mensagem de despedida
const goodbyeMessage = `
👋 *ATÉ LOGO!*
// ... sua mensagem personalizada
`;
```

### Modificar Canvas
A API da SpiderX aceita os seguintes parâmetros:
- `title`: Título do canvas (nome do usuário)
- `description`: Descrição do canvas (mensagem personalizada)
- `image_url`: URL da foto do perfil (obtida automaticamente)

## 🐛 Solução de Problemas

### API Key não configurada
```
Erro: API Key da SpiderX não configurada
Solução: Adicione SPIDERX_API_KEY no .env
```

### Canvas não gera
```
Erro: API retornou status 400/401/403
Solução: Verifique se a API Key é válida
```

### Foto do perfil não aparece
```
Erro: Erro ao obter foto do perfil
Solução: Use !testprofile para diagnosticar
Causas possíveis:
• Usuário não tem foto de perfil
• Configurações de privacidade
• Problema de conexão
```

### Spam de mensagens
```
Problema: Múltiplas mensagens de boas-vindas
Solução: Sistema já tem cache de 1 minuto
```

## 📝 Exemplo de Uso

1. **Usuário entra no grupo**
2. **Bot detecta automaticamente**
3. **Obtém foto do perfil do usuário**
4. **Gera canvas personalizado com a foto**
5. **Envia mensagem de boas-vindas**
6. **Mostra informações do usuário**

## 🎯 Benefícios

- ✅ **Experiência profissional** para novos membros
- ✅ **Integração com sistema de registro**
- ✅ **Canvas personalizado** e atrativo
- ✅ **Foto do perfil** incluída automaticamente
- ✅ **Informações úteis** sobre o usuário
- ✅ **Sistema anti-spam** integrado
- ✅ **Fallback robusto** em caso de falhas
- ✅ **Logs detalhados** para debug

## 🔍 Debug e Testes

### Comandos de Teste Disponíveis:
- `!testwelcome` - Testa o sistema completo
- `!testprofile` - Testa apenas a foto do perfil

### Logs Disponíveis:
- ✅ Processamento de boas-vindas
- ✅ Obtenção de foto do perfil
- ✅ Geração de canvas
- ✅ Envio de mensagens
- ❌ Erros e falhas

---

🤖 **Aurora Bot** - Sistema de Boas-vindas Avançado com Foto do Perfil 