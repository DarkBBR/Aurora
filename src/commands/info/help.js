import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "help",
  aliases: ["h", "ajuda", "comandos", "menu"],
  description: "Mostra todos os comandos disponíveis",
  async execute(sock, msg, args, commands, config) {
    try {
      const commandManager = sock.commandManager || { getAllCommands: () => commands };
      const allCommands = commandManager.getAllCommands();
      
      if (args.length > 0) {
        // Mostrar ajuda de um comando específico ou categoria
        const commandName = args[0].toLowerCase();
        
        // Verificar se é uma categoria
        if (["info", "media", "ai", "funny", "utils", "admin"].includes(commandName)) {
          await this.showCategoryHelp(sock, msg, commandName, allCommands, config);
          return;
        }
        
        // Verificar se é um comando específico
        const command = allCommands[commandName];
        
        if (command) {
          const helpText = Formatter.card(
            `📖 Ajuda: ${command.name}`,
            `${Formatter.bold("Descrição:")}\n` +
            `• ${command.description || "Sem descrição"}\n\n` +
            `${Formatter.bold("Uso:")}\n` +
            `• ${Formatter.code(config.prefix + command.name)}\n\n` +
            `${command.aliases && command.aliases.length > 0 ? 
              `${Formatter.bold("Aliases:")}\n` +
              `• ${command.aliases.map(alias => Formatter.code(config.prefix + alias)).join(", ")}\n\n` : ""
            }` +
            `${Formatter.info("💡 Use este comando para obter mais informações")}`
          );
          
          // Botão para voltar ao menu principal
          const buttonMessage = {
            text: helpText,
            footer: "Aurora Bot - Sistema de Ajuda",
            buttons: [
              { buttonId: "help_main", buttonText: "🏠 Menu Principal", type: 1 },
              { buttonId: "help_back", buttonText: "⬅️ Voltar", type: 1 }
            ]
          };
          
          await sock.sendMessage(msg.key.remoteJid, buttonMessage);
        } else {
          const errorText = Formatter.card(
            "❌ Comando não encontrado",
            `${Formatter.error(`O comando '${commandName}' não foi encontrado.`)}\n\n` +
            `${Formatter.info("💡 Use")} ${Formatter.code(config.prefix + "help")} ${Formatter.info("para ver todos os comandos disponíveis.")}`
          );
          
          await sock.sendMessage(msg.key.remoteJid, { text: errorText });
        }
        return;
      }
      
      // Organizar comandos por categoria
      const categories = {
        info: [],
        utils: [],
        media: [],
        funny: [],
        ai: [],
        admin: []
      };
      
      for (const [name, command] of Object.entries(allCommands)) {
        if (name === "help" || name === "ping" || name === "info") {
          categories.info.push({ name, command });
        } else if (name === "debug" || name === "format" || name === "testlibs") {
          categories.utils.push({ name, command });
        } else if (name.includes("sticker") || name.includes("video") || name === "play" || name === "audio") {
          categories.media.push({ name, command });
        } else if (name === "image" || name === "img" || name === "generate" || name === "ai" || name === "art") {
          categories.ai.push({ name, command });
        } else if (name === "autosticker" || name === "autostick" || name === "as") {
          categories.admin.push({ name, command });
        } else {
          categories.funny.push({ name, command });
        }
      }
      
      // Criar mensagem principal com botões
      const mainText = Formatter.card(
        "🤖 Aurora Bot - Menu Principal",
        `${Formatter.info("Bem-vindo ao Aurora Bot!")}\n\n` +
        `${Formatter.bold("📊 Estatísticas:")}\n` +
        `• Total de comandos: ${Object.keys(allCommands).length}\n` +
        `• Prefixo: ${Formatter.code(config.prefix)}\n\n` +
        `${Formatter.info("🎯 Selecione uma categoria abaixo para ver os comandos disponíveis:")}\n\n` +
        `${Formatter.bold("📋 Comandos disponíveis:")}\n` +
        `• ${Formatter.code(config.prefix + "help info")} - Comandos de informações\n` +
        `• ${Formatter.code(config.prefix + "help media")} - Comandos de mídia\n` +
        `• ${Formatter.code(config.prefix + "help ai")} - Comandos de IA\n` +
        `• ${Formatter.code(config.prefix + "help funny")} - Comandos de diversão\n` +
        `• ${Formatter.code(config.prefix + "help utils")} - Comandos utilitários\n` +
        `• ${Formatter.code(config.prefix + "help admin")} - Comandos administrativos\n\n` +
        `${Formatter.info("💡 Se os botões não aparecerem, use os comandos acima!")}`
      );
      
      try {
        // Tentar enviar com botões usando formato básico do Baileys
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
        
        await sock.sendMessage(msg.key.remoteJid, buttonMessage);
      } catch (buttonError) {
        // Se falhar, enviar sem botões
        console.log("Botões não suportados, enviando mensagem simples");
        await sock.sendMessage(msg.key.remoteJid, { text: mainText });
      }
      
    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro ao mostrar ajuda.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
  
  async showCategoryHelp(sock, msg, category, allCommands, config) {
    try {
      let categoryCommands = [];
      let categoryTitle = "";
      let categoryDescription = "";
      
      switch (category) {
        case "info":
          categoryTitle = "📋 Comandos de Informações";
          categoryDescription = "Comandos para obter informações sobre o bot:";
          for (const [name, command] of Object.entries(allCommands)) {
            if (name === "help" || name === "ping" || name === "info") {
              categoryCommands.push({ name, command });
            }
          }
          break;
          
        case "media":
          categoryTitle = "🎬 Comandos de Mídia";
          categoryDescription = "Comandos para trabalhar com mídia:";
          for (const [name, command] of Object.entries(allCommands)) {
            if (name.includes("sticker") || name.includes("video") || name === "play" || name === "audio") {
              categoryCommands.push({ name, command });
            }
          }
          break;
          
        case "ai":
          categoryTitle = "🎨 Comandos de IA";
          categoryDescription = "Comandos para geração de imagens com IA:";
          for (const [name, command] of Object.entries(allCommands)) {
            if (name === "image" || name === "img" || name === "generate" || name === "ai" || name === "art") {
              categoryCommands.push({ name, command });
            }
          }
          break;
          
        case "funny":
          categoryTitle = "😄 Comandos de Diversão";
          categoryDescription = "Comandos divertidos e interativos:";
          for (const [name, command] of Object.entries(allCommands)) {
            if (!["help", "ping", "info", "debug", "format", "testlibs", "sticker", "videosticker", "play", "audio", "image", "img", "generate", "ai", "art", "autosticker", "autostick", "as"].includes(name)) {
              categoryCommands.push({ name, command });
            }
          }
          break;
          
        case "utils":
          categoryTitle = "🔧 Comandos Utilitários";
          categoryDescription = "Comandos utilitários e de debug:";
          for (const [name, command] of Object.entries(allCommands)) {
            if (name === "debug" || name === "format" || name === "testlibs") {
              categoryCommands.push({ name, command });
            }
          }
          break;
          
        case "admin":
          categoryTitle = "⚙️ Comandos Administrativos";
          categoryDescription = "Comandos para administração do bot:";
          for (const [name, command] of Object.entries(allCommands)) {
            if (name === "autosticker" || name === "autostick" || name === "as") {
              categoryCommands.push({ name, command });
            }
          }
          break;
      }
      
      let text = Formatter.card(
        categoryTitle,
        `${Formatter.info(categoryDescription)}\n\n`
      );
      
      for (const { name, command } of categoryCommands) {
        text += `• ${Formatter.code(config.prefix + name)} - ${command.description || "Sem descrição"}\n`;
      }
      
      text += `\n${Formatter.info("💡 Use")} ${Formatter.code(config.prefix + "help")} ${Formatter.info("para voltar ao menu principal.")}`;
      
      await sock.sendMessage(msg.key.remoteJid, { text: text });
      
    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro ao mostrar categoria.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  }
}; 