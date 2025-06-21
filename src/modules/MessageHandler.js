import { Formatter } from "../utils/Formatter.js";
import { ConfigManager } from "../utils/ConfigManager.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { MediaProcessor } from "../utils/MediaProcessor.js";
import { createStickerConfig, getDefaultPackName, getDefaultAuthorName } from "../utils/StickerUtils.js";

export class MessageHandler {
  constructor(commandManager, config, logger) {
    this.commandManager = commandManager;
    this.config = config;
    this.logger = logger;
    this.configManager = new ConfigManager();
  }

  async handleMessage(sock, msg) {
    try {
      // Ignorar mensagens do próprio bot
      if (msg.key.fromMe) return;

      // Adicionar configManager ao sock para uso nos comandos
      sock.configManager = this.configManager;

      // Verificar se é um evento de botão
      if (msg.message?.buttonsResponseMessage) {
        await this.handleButtonResponse(sock, msg);
        return;
      }

      // Verificar se é uma mensagem de texto
      const hasText = msg.message?.conversation || msg.message?.extendedTextMessage;
      
      // Verificar se é uma mensagem de mídia com legenda
      const hasMediaCaption = msg.message?.imageMessage?.caption || 
                             msg.message?.videoMessage?.caption ||
                             msg.message?.audioMessage?.caption ||
                             msg.message?.documentMessage?.caption;

      // Verificar se é uma mensagem de mídia (imagem/vídeo)
      const hasMedia = msg.message?.imageMessage || msg.message?.videoMessage;

      // Se tem mídia e figurinhas automáticas estão ativadas, processar
      if (hasMedia && this.configManager.isAutoStickerEnabledForChat(msg.key.remoteJid)) {
        await this.handleAutoSticker(sock, msg);
        return;
      }

      // Se não tem texto nem legenda de mídia, ignorar
      if (!hasText && !hasMediaCaption) return;

      // Extrair texto da mensagem ou legenda
      const text = hasText ? 
        (msg.message.conversation || msg.message.extendedTextMessage.text) : 
        hasMediaCaption;

      const sender = msg.key.participant || msg.key.remoteJid;

      this.logger.info(`Mensagem de ${sender}: ${text}`);

      // Verificar se a mensagem começa com o prefixo
      if (!text.startsWith(this.config.prefix)) return;

      // Extrair comando e argumentos
      const args = text.slice(this.config.prefix.length).trim().split(" ");
      const commandName = args.shift().toLowerCase();

      // Verificar se o comando existe
      const command = this.commandManager.getCommand(commandName);
      if (!command) {
        const errorText = Formatter.card(
          "❌ Comando Não Encontrado",
          `${Formatter.error("O comando solicitado não existe.")}\n\n` +
          `${Formatter.bold("Comando digitado:")} ${Formatter.code(commandName)}\n` +
          `${Formatter.bold("Use:")} ${this.config.prefix}help ${Formatter.italic("para ver todos os comandos disponíveis")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: errorText });
        return;
      }

      // Executar comando
      await this.commandManager.executeCommand(commandName, sock, msg, args, this.config);
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem: ${error.message}`);
      try {
        const errorText = Formatter.card(
          "⚠️ Erro Interno",
          `${Formatter.error("Erro ao processar comando.")}\n\n` +
          `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}\n\n` +
          `${Formatter.info("Tente novamente ou contate o administrador.")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: errorText });
      } catch (sendError) {
        this.logger.error(`Erro ao enviar mensagem de erro: ${sendError.message}`);
      }
    }
  }

  async handleButtonResponse(sock, msg) {
    try {
      const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
      const chatId = msg.key.remoteJid;
      
      this.logger.info(`Botão clicado: ${buttonId}`);

      // Reagir ao clique do botão
      try {
        await sock.sendMessage(chatId, {
          react: {
            text: "✅",
            key: msg.key,
          },
        });
      } catch (e) {
        // Ignorar erro de reação se não suportado
      }

      // Processar diferentes tipos de botões
      switch (buttonId) {
        case "help_main":
          await this.showMainMenu(sock, chatId);
          break;
          
        case "help_info":
          await this.showInfoCommands(sock, chatId);
          break;
          
        case "help_media":
          await this.showMediaCommands(sock, chatId);
          break;
          
        case "help_ai":
          await this.showAICommands(sock, chatId);
          break;
          
        case "help_funny":
          await this.showFunnyCommands(sock, chatId);
          break;
          
        case "help_utils":
          await this.showUtilsCommands(sock, chatId);
          break;
          
        case "help_admin":
          await this.showAdminCommands(sock, chatId);
          break;
          
        case "help_back":
          await this.showMainMenu(sock, chatId);
          break;
          
        // Botões do autosticker
        case "as_global_on":
          await this.handleAutoStickerButton(sock, chatId, "global_on");
          break;
          
        case "as_global_off":
          await this.handleAutoStickerButton(sock, chatId, "global_off");
          break;
          
        case "as_here_on":
          await this.handleAutoStickerButton(sock, chatId, "here_on");
          break;
          
        case "as_here_off":
          await this.handleAutoStickerButton(sock, chatId, "here_off");
          break;
          
        case "as_status":
          await this.handleAutoStickerButton(sock, chatId, "status");
          break;
          
        case "as_help":
          await this.handleAutoStickerButton(sock, chatId, "help");
          break;
          
        default:
          const errorText = Formatter.card(
            "❌ Botão Inválido",
            `${Formatter.error("Botão não reconhecido.")}\n\n` +
            `${Formatter.info("🔧 Use o menu principal para navegar.")}`
          );
          
          await sock.sendMessage(chatId, { text: errorText });
      }
    } catch (error) {
      this.logger.error(`Erro ao processar botão: ${error.message}`);
      
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro ao processar botão.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  }

  async showMainMenu(sock, chatId) {
    const mainText = Formatter.card(
      "🤖 Aurora Bot - Menu Principal",
      `${Formatter.info("Bem-vindo ao Aurora Bot!")}\n\n` +
      `${Formatter.bold("📊 Estatísticas:")}\n` +
      `• Total de comandos: ${Object.keys(this.commandManager.getAllCommands()).length}\n` +
      `• Prefixo: ${Formatter.code(this.config.prefix)}\n\n` +
      `${Formatter.info("🎯 Selecione uma categoria abaixo para ver os comandos disponíveis:")}`
    );
    
    const buttonMessage = {
      text: mainText,
      footer: "Aurora Bot - Sistema de Navegação",
      buttons: [
        { buttonId: "help_info", buttonText: "📋 Informações", type: 1 },
        { buttonId: "help_media", buttonText: "🎬 Mídia", type: 1 },
        { buttonId: "help_ai", buttonText: "🎨 IA", type: 1 },
        { buttonId: "help_funny", buttonText: "😄 Diversão", type: 1 },
        { buttonId: "help_utils", buttonText: "🔧 Utilitários", type: 1 },
        { buttonId: "help_admin", buttonText: "⚙️ Admin", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async showInfoCommands(sock, chatId) {
    const commands = this.commandManager.getAllCommands();
    const infoCommands = [];
    
    for (const [name, command] of Object.entries(commands)) {
      if (name === "help" || name === "ping" || name === "info") {
        infoCommands.push({ name, command });
      }
    }
    
    let text = Formatter.card(
      "📋 Comandos de Informações",
      `${Formatter.info("Comandos para obter informações sobre o bot:")}\n\n`
    );
    
    for (const { name, command } of infoCommands) {
      text += `• ${Formatter.code(this.config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
    }
    
    const buttonMessage = {
      text: text,
      footer: "Aurora Bot - Comandos de Informações",
      buttons: [
        { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
        { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async showMediaCommands(sock, chatId) {
    const commands = this.commandManager.getAllCommands();
    const mediaCommands = [];
    
    for (const [name, command] of Object.entries(commands)) {
      if (name.includes("sticker") || name.includes("video") || name === "play" || name === "audio") {
        mediaCommands.push({ name, command });
      }
    }
    
    let text = Formatter.card(
      "🎬 Comandos de Mídia",
      `${Formatter.info("Comandos para trabalhar com mídia:")}\n\n`
    );
    
    for (const { name, command } of mediaCommands) {
      text += `• ${Formatter.code(this.config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
    }
    
    const buttonMessage = {
      text: text,
      footer: "Aurora Bot - Comandos de Mídia",
      buttons: [
        { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
        { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async showAICommands(sock, chatId) {
    const commands = this.commandManager.getAllCommands();
    const aiCommands = [];
    
    for (const [name, command] of Object.entries(commands)) {
      if (name === "image" || name === "img" || name === "generate" || name === "ai" || name === "art") {
        aiCommands.push({ name, command });
      }
    }
    
    let text = Formatter.card(
      "🎨 Comandos de IA",
      `${Formatter.info("Comandos para geração de imagens com IA:")}\n\n`
    );
    
    for (const { name, command } of aiCommands) {
      text += `• ${Formatter.code(this.config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
    }
    
    const buttonMessage = {
      text: text,
      footer: "Aurora Bot - Comandos de IA",
      buttons: [
        { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
        { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async showFunnyCommands(sock, chatId) {
    const commands = this.commandManager.getAllCommands();
    const funnyCommands = [];
    
    for (const [name, command] of Object.entries(commands)) {
      if (!["help", "ping", "info", "debug", "format", "testlibs", "sticker", "videosticker", "play", "audio", "image", "img", "generate", "ai", "art", "autosticker", "autostick", "as"].includes(name)) {
        funnyCommands.push({ name, command });
      }
    }
    
    let text = Formatter.card(
      "😄 Comandos de Diversão",
      `${Formatter.info("Comandos divertidos e interativos:")}\n\n`
    );
    
    for (const { name, command } of funnyCommands) {
      text += `• ${Formatter.code(this.config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
    }
    
    const buttonMessage = {
      text: text,
      footer: "Aurora Bot - Comandos de Diversão",
      buttons: [
        { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
        { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async showUtilsCommands(sock, chatId) {
    const commands = this.commandManager.getAllCommands();
    const utilsCommands = [];
    
    for (const [name, command] of Object.entries(commands)) {
      if (name === "debug" || name === "format" || name === "testlibs") {
        utilsCommands.push({ name, command });
      }
    }
    
    let text = Formatter.card(
      "🔧 Comandos Utilitários",
      `${Formatter.info("Comandos utilitários e de debug:")}\n\n`
    );
    
    for (const { name, command } of utilsCommands) {
      text += `• ${Formatter.code(this.config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
    }
    
    const buttonMessage = {
      text: text,
      footer: "Aurora Bot - Comandos Utilitários",
      buttons: [
        { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
        { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async showAdminCommands(sock, chatId) {
    const commands = this.commandManager.getAllCommands();
    const adminCommands = [];
    
    for (const [name, command] of Object.entries(commands)) {
      if (name === "autosticker" || name === "autostick" || name === "as") {
        adminCommands.push({ name, command });
      }
    }
    
    let text = Formatter.card(
      "⚙️ Comandos Administrativos",
      `${Formatter.info("Comandos para administração do bot:")}\n\n`
    );
    
    for (const { name, command } of adminCommands) {
      text += `• ${Formatter.code(this.config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
    }
    
    const buttonMessage = {
      text: text,
      footer: "Aurora Bot - Comandos Administrativos",
      buttons: [
        { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
        { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
      ]
    };
    
    await sock.sendMessage(chatId, buttonMessage);
  }

  async handleAutoSticker(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;
      
      // Reagir à mensagem
      try {
        await sock.sendMessage(chatId, {
          react: {
            text: "🎯",
            key: msg.key,
          },
        });
      } catch (e) {
        // Ignorar erro de reação se não suportado
      }

      // Determinar tipo de mídia
      let mediaMessage, mediaType;
      if (msg.message.imageMessage) {
        mediaMessage = msg.message.imageMessage;
        mediaType = "image";
      } else if (msg.message.videoMessage) {
        mediaMessage = msg.message.videoMessage;
        mediaType = "video";
      } else {
        return; // Não é imagem nem vídeo
      }

      // Validar duração do vídeo (se for vídeo)
      if (mediaType === "video" && mediaMessage.seconds > 10) {
        const errorText = Formatter.card(
          "❌ Vídeo Muito Longo",
          `${Formatter.error("O vídeo deve ter no máximo 10 segundos para figurinha automática.")}\n\n` +
          `${Formatter.bold("Duração:")} ${mediaMessage.seconds}s\n` +
          `${Formatter.bold("Máximo:")} 10s\n\n` +
          `${Formatter.info("🔧 Use o comando !sticker para vídeos mais longos")}`
        );
        
        await sock.sendMessage(chatId, { text: errorText });
        return;
      }

      // Baixar mídia
      let mediaBuffer = Buffer.alloc(0);
      try {
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        for await (const chunk of stream) {
          mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
        }
      } catch (e) {
        throw new Error("Não foi possível baixar a mídia: " + e.message);
      }

      if (!mediaBuffer || mediaBuffer.length === 0) {
        throw new Error("Não foi possível baixar a mídia");
      }

      // Processar mídia
      const processor = new MediaProcessor();
      const stickerConfig = createStickerConfig(mediaType, mediaMessage, this.config);
      
      let processedBuffer;
      if (mediaType === "image") {
        processedBuffer = await processor.processImage(mediaBuffer, stickerConfig);
      } else {
        processedBuffer = await processor.processVideo(mediaBuffer, stickerConfig);
      }

      // Gerar pack name e author
      const packName = getDefaultPackName();
      const authorName = getDefaultAuthorName(
        msg.pushName,
        this.config.botName,
        "Aurora",
        "https://github.com"
      );

      // Enviar figurinha
      await sock.sendMessage(chatId, {
        sticker: processedBuffer,
        contextInfo: {
          forwardingScore: 0,
          isForwarded: false,
        },
      }, { quoted: msg });

    } catch (error) {
      this.logger.error(`Erro ao criar figurinha automática: ${error.message}`);
      
      const errorText = Formatter.card(
        "❌ Erro na Figurinha Automática",
        `${Formatter.error("Erro ao criar figurinha automática.")}\n\n` +
        `${Formatter.bold("Erro:")}\n` +
        `• ${Formatter.code(error.message)}\n\n` +
        `${Formatter.info("🔧 Use o comando !sticker para tentar novamente")}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  }

  async handleAutoStickerButton(sock, chatId, action) {
    try {
      const configManager = this.configManager;
      const isGroup = chatId.endsWith("@g.us");
      let success = false;
      let message = "";

      switch (action) {
        case "global_on":
          success = configManager.setAutoSticker(true);
          message = "✅ Figurinhas automáticas **ativadas globalmente**!";
          break;

        case "global_off":
          success = configManager.setAutoSticker(false);
          message = "❌ Figurinhas automáticas **desativadas globalmente**!";
          break;

        case "here_on":
          success = configManager.enableAutoStickerForChat(chatId);
          message = `✅ Figurinhas automáticas **ativadas** neste ${isGroup ? "grupo" : "chat"}!`;
          break;

        case "here_off":
          success = configManager.disableAutoStickerForChat(chatId);
          message = `❌ Figurinhas automáticas **desativadas** neste ${isGroup ? "grupo" : "chat"}!`;
          break;

        case "status":
          const status = configManager.getAutoStickerStatus();
          const currentStatus = configManager.isAutoStickerEnabledForChat(chatId);
          
          const statusText = Formatter.card(
            "📊 Status das Figurinhas Automáticas",
            `${Formatter.bold("Status Global:")} ${status.global ? "✅ Ativado" : "❌ Desativado"}\n\n` +
            `${Formatter.bold("Status Atual:")} ${currentStatus ? "✅ Ativado" : "❌ Desativado"} neste ${isGroup ? "grupo" : "chat"}\n\n` +
            `${Formatter.bold("Grupos Ativados:")} ${status.groups.length}\n` +
            `${Formatter.bold("Usuários Ativados:")} ${status.users.length}\n\n` +
            `${Formatter.info("💡 O status atual considera tanto a configuração global quanto a específica.")}`
          );
          
          await sock.sendMessage(chatId, { text: statusText });
          return;

        case "help":
          const helpText = Formatter.card(
            "🎯 Ajuda - Figurinhas Automáticas",
            `${Formatter.info("Comandos de texto disponíveis:")}\n\n` +
            `${Formatter.bold("Controle Global:")}\n` +
            `• ${Formatter.code(this.config.prefix + "autosticker on")} - Ativar globalmente\n` +
            `• ${Formatter.code(this.config.prefix + "autosticker off")} - Desativar globalmente\n\n` +
            `${Formatter.bold("Controle Local:")}\n` +
            `• ${Formatter.code(this.config.prefix + "autosticker here on")} - Ativar neste ${isGroup ? "grupo" : "chat"}\n` +
            `• ${Formatter.code(this.config.prefix + "autosticker here off")} - Desativar neste ${isGroup ? "grupo" : "chat"}\n\n` +
            `${Formatter.bold("Informações:")}\n` +
            `• ${Formatter.code(this.config.prefix + "autosticker status")} - Ver status detalhado\n\n` +
            `${Formatter.info("💡 Quando ativado, o bot cria figurinhas automaticamente de todas as imagens recebidas.")}`
          );
          
          await sock.sendMessage(chatId, { text: helpText });
          return;

        default:
          const errorText = Formatter.card(
            "❌ Ação Inválida",
            `${Formatter.error("Ação não reconhecida.")}\n\n` +
            `${Formatter.info("🔧 Use os botões disponíveis para navegar.")}`
          );
          
          await sock.sendMessage(chatId, { text: errorText });
          return;
      }

      if (success) {
        const successText = Formatter.card(
          "✅ Configuração Atualizada",
          `${Formatter.success(message)}\n\n` +
          `${Formatter.info("💡 A configuração foi salva e será aplicada imediatamente.")}`
        );
        
        await sock.sendMessage(chatId, { text: successText });
      } else {
        const errorText = Formatter.card(
          "❌ Erro ao Salvar",
          `${Formatter.error("Não foi possível salvar a configuração.")}\n\n` +
          `${Formatter.info("🔧 Verifique as permissões do arquivo de configuração.")}`
        );
        
        await sock.sendMessage(chatId, { text: errorText });
      }

    } catch (error) {
      this.logger.error(`Erro ao processar botão do autosticker: ${error.message}`);
      
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro ao processar botão.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(chatId, { text: errorText });
    }
  }
}