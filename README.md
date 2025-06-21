# 🤖 Aurora WhatsApp Bot

Bot modular para WhatsApp desenvolvido com Baileys, focado em criação de figurinhas e comandos divertidos.

## ✨ Funcionalidades

### 🎨 Criação de Figurinhas
- **Sticker Simples**: Converte imagens em figurinhas
- **Sticker Animado**: Converte vídeos em figurinhas animadas
- **Suporte a ViewOnce**: Processa mensagens de visualização única
- **Validação de Duração**: Vídeos limitados a 10 segundos
- **Qualidade Otimizada**: Processamento com Sharp e wa-sticker-formatter

### 🎲 Comandos Divertidos
- **8ball**: Perguntas e respostas mágicas
- **Coinflip**: Cara ou coroa
- **Dice**: Dados virtuais

### 📋 Informações
- **Help**: Lista todos os comandos por categoria
- **Info**: Informações sobre o bot
- **Ping**: Teste de latência

### 🔧 Utilitários
- **Debug**: Informações de debug
- **Format**: Formatação de texto
- **Testlibs**: Testa bibliotecas instaladas

## 🛠️ Tecnologias

- **@whiskeysockets/baileys**: Cliente WhatsApp
- **sharp**: Processamento de imagens
- **wa-sticker-formatter**: Criação de stickers
- **fs-extra**: Operações de arquivo avançadas
- **colors**: Cores no terminal
- **dotenv**: Variáveis de ambiente

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Aurora
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute o bot**
```bash
npm start
```

## 🎯 Comandos Principais

### Figurinhas
```
!sticker - Cria figurinha de imagem/vídeo
!videosticker - Cria figurinha animada de vídeo
!play - Baixa vídeos do YouTube
!audio - Baixa áudio MP3 do YouTube
```

### YouTube
```
!play <url> - Baixa vídeo do YouTube por URL
!play <busca> - Busca e baixa vídeo do YouTube
!yt <url> - Alias para play
!youtube <url> - Alias para play
!audio <url> - Baixa áudio MP3 do YouTube
!mp3 <url> - Alias para audio
!music <url> - Alias para audio
```

### 🎨 Geração de Imagens com IA
```
!image <texto> - Gera imagem usando Stable Diffusion Turbo
!image sd <texto> - Gera imagem usando Stable Diffusion Turbo
!image pixart <texto> - Gera imagem usando Pixart (use inglês)
!img <texto> - Alias para image
!generate <texto> - Alias para image
!ai <texto> - Alias para image
!art <texto> - Alias para image
```

### Diversão
```
!8ball <pergunta> - Pergunta mágica
!coinflip - Cara ou coroa
!dice - Dados virtuais
```

### Informações
```
!help - Lista todos os comandos
!info - Informações do bot
!ping - Teste de latência
```

### Utilitários
```
!debug - Informações de debug
!format <texto> - Formata texto
!testlibs - Testa bibliotecas
!autosticker - Controle de figurinhas automáticas
```

### 🎯 Figurinhas Automáticas
```
!autosticker on - Ativar globalmente
!autosticker off - Desativar globalmente
!autosticker here on - Ativar neste chat/grupo
!autosticker here off - Desativar neste chat/grupo
!autosticker status - Ver status
!as - Alias para autosticker
```

## 📁 Estrutura do Projeto

```
Aurora/
├── src/
│   ├── commands/
│   │   ├── funny/          # Comandos divertidos
│   │   ├── info/           # Comandos de informação
│   │   ├── media/          # Comandos de mídia
│   │   └── utils/          # Comandos utilitários
│   ├── modules/            # Módulos principais
│   ├── utils/              # Utilitários
│   └── index.js            # Arquivo principal
├── sessions/               # Sessões do WhatsApp
├── temp/                   # Arquivos temporários
├── logs/                   # Logs do sistema
└── package.json
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
BOT_NAME=Aurora
BOT_PREFIX=!
BOT_OWNER=seu-numero@c.us
```

### Configurações de Sticker
- **Qualidade**: 70% (otimizada para WhatsApp)
- **Dimensões**: 512x512 pixels
- **Formato**: WebP (estático e animado)
- **Duração máxima**: 10 segundos para vídeos

## 🚀 Funcionalidades Avançadas

### Processamento de Mídia
- **Sharp**: Processamento de imagens com redimensionamento
- **wa-sticker-formatter**: Criação de stickers no formato correto
- **FFmpeg**: Processamento de vídeos (opcional)
- **Fallback**: Métodos alternativos se FFmpeg não estiver disponível
- **API SpiderX**: Download de vídeos do YouTube

### Download de Vídeos
- **YouTube**: Suporte a URLs diretas e busca por nome
- **Validação de tamanho**: Limite de 16MB para compatibilidade com WhatsApp
- **Qualidade otimizada**: Download em formato MP4
- **Informações detalhadas**: Título, duração e tamanho do vídeo

### Download de Áudio
- **YouTube MP3**: Extração de áudio em formato MP3
- **Validação de tamanho**: Limite de 16MB para compatibilidade
- **Metadados completos**: Título, duração, canal e tamanho
- **Qualidade otimizada**: Áudio de alta qualidade

### 🎨 Geração de Imagens com IA
- **Stable Diffusion Turbo**: Geração rápida de imagens em português
- **Pixart**: Geração de imagens de alta qualidade (recomendado em inglês)
- **Validação de tamanho**: Limite de 16MB para compatibilidade com WhatsApp
- **Timeout otimizado**: 60 segundos para geração de IA
- **Tratamento de erros**: Mensagens específicas para diferentes tipos de erro
- **Múltiplos aliases**: image, img, generate, ai, art

### 🎯 Figurinhas Automáticas
- **Ativação global**: Controle para todos os chats
- **Ativação local**: Controle por chat/grupo específico
- **Processamento automático**: Cria figurinhas de todas as imagens/vídeos recebidos
- **Validação de duração**: Vídeos limitados a 10 segundos
- **Configuração persistente**: Salva configurações em arquivo JSON
- **Controle administrativo**: Apenas o dono pode alterar configurações
- **Status detalhado**: Informações sobre ativações globais e locais

### Validação e Limpeza
- **Validação de duração**: Vídeos limitados a 10 segundos
- **Validação de formato**: Suporte a JPG, PNG, GIF, WebP, MP4
- **Limpeza automática**: Arquivos temporários removidos automaticamente
- **Tratamento de erros**: Mensagens informativas para o usuário

### Interface do Usuário
- **Reações**: Bot reage às mensagens durante processamento
- **Status detalhado**: Informações sobre o processo
- **Formatação rica**: Texto formatado com emojis e cores
- **Categorização**: Comandos organizados por categoria

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- **Baileys**: Cliente WhatsApp não oficial
- **Sharp**: Processamento de imagens
- **wa-sticker-formatter**: Criação de stickers
- **Comunidade**: Todos que contribuíram com o projeto

---

**Desenvolvido com ❤️ por Aurora**
