# 🤖 Aurora Bot - WhatsApp

Bot de WhatsApp modular e funcional desenvolvido com Node.js e Baileys.

## ✨ Características

- 🤖 **IA Integrada**: Chat com IA e geração de imagens
- 🎵 **Sistema de Mídia**: Download de músicas, vídeos e TikTok
- 🎮 **Jogos**: 8ball, cara ou coroa, dados e forca
- 💰 **Economia**: Sistema completo de mineração, trabalho e roubos
- 👥 **Grupos**: Sistema de boas-vindas personalizado
- 🔧 **Modular**: Arquitetura organizada em categorias

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Ruthraas/Aurora-Bot-Wa.git
cd Aurora-Bot-Wa
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env`:
```env
SPIDERX_API_KEY=sua_chave_api_aqui
```

## 📱 Como Usar

1. Inicie o bot:
```bash
npm start
```

2. Escaneie o QR Code com o WhatsApp
3. Use o comando `!menu` para ver todos os comandos

## 🎯 Comandos Principais

### 🤖 IA
- `!chatgpt [pergunta]` - Chat com IA
- `!imaginepixart [descrição]` - Gerar imagens

### 🎵 Mídia
- `!play [música]` - Baixar música
- `!playvideo [vídeo]` - Baixar vídeo
- `!tiktok [url]` - Baixar TikTok

### 🎮 Jogos
- `!8ball [pergunta]` - Bola 8 mágica
- `!coinflip [cara/coroa]` - Cara ou coroa
- `!dice [1-6]` - Jogo de dados
- `!forca` - Jogo da forca

### 💰 Economia
- `!minerar` - Minerar dinheiro
- `!trabalhar` - Trabalhar
- `!treinar` - Treinar habilidades
- `!assaltar` - Assaltar outros
- `!saldo` - Ver saldo

### 🔧 Utilitários
- `!register [nome] [idade]` - Registrar-se
- `!user` - Ver perfil
- `!menu` - Menu principal

## 📁 Estrutura do Projeto

```
Aurora-Bot-Wa/
├── src/
│   ├── commands/
│   │   ├── admin/          # Comandos administrativos
│   │   ├── economia/       # Sistema de economia
│   │   ├── ia/            # Comandos de IA
│   │   ├── info/          # Informações
│   │   ├── jogos/         # Jogos
│   │   ├── menu/          # Menus
│   │   ├── midia/         # Download de mídia
│   │   └── registro/      # Sistema de registro
│   ├── config/            # Configurações
│   ├── core/              # Núcleo do bot
│   └── utils/             # Utilitários
├── data/                  # Dados dos usuários
├── sessions/              # Sessões do WhatsApp
└── index.js               # Arquivo principal
```

## 🔧 Configuração

### API Keys Necessárias

- **SpiderX API**: Para IA, imagens e downloads
  - Obtenha em: https://api.spiderx.com.br

### Variáveis de Ambiente

```env
SPIDERX_API_KEY=sua_chave_api_aqui
```

## 📋 Documentação

- [Lista Completa de Comandos](COMANDOS.md)
- [Configuração de Boas-vindas](WELCOME_SETUP.md)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⭐ Suporte

- 📧 Email: arthur.silva.dev@gmail.com
- 💬 WhatsApp: +55 14 99999-9999
- 🐛 Issues: [GitHub Issues](https://github.com/ArthurSilvaDev/Aurora-Bot-Wa/issues)

---

**Desenvolvido com ❤️ por Arthur Silva** 