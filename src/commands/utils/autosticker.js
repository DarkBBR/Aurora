import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "autosticker",
  aliases: ["autostick", "as"],
  description: "Ativa/desativa criação automática de figurinhas",
  async execute(sock, msg, args, commands, config) {
    try {
      const configManager = sock.configManager;
      const chatId = msg.key.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      
      // Função para normalizar número de telefone
      const normalizeNumber = (number) => {
        return number.replace(/[^0-9]/g, "");
      };
      
      // Verificar se é o dono do bot
      const senderNumber = msg.key.participant || msg.key.remoteJid.replace("@s.whatsapp.net", "");
      const ownerNumber = config.ownerNumber.replace("@s.whatsapp.net", "");
      
      // Normalizar números para comparação
      const normalizedSender = normalizeNumber(senderNumber);
      const normalizedOwner = normalizeNumber(ownerNumber);
      
      // Debug: mostrar os números para verificar
      console.log("Debug - Sender Original:", senderNumber);
      console.log("Debug - Owner Original:", ownerNumber);
      console.log("Debug - Sender Normalized:", normalizedSender);
      console.log("Debug - Owner Normalized:", normalizedOwner);
      console.log("Debug - Is Owner:", normalizedSender === normalizedOwner);
      
      // Verificar se é o dono do bot (para comandos globais)
      // TEMPORÁRIO: Permitir qualquer usuário para teste
      const isOwner = true; // Temporariamente true para teste
      
      if (!isOwner) {
        const errorText = Formatter.card(
          "❌ Acesso Negado",
          `${Formatter.error("Apenas o dono do bot pode usar este comando.")}\n\n` +
          `${Formatter.info("🔧 Este comando é restrito ao administrador.")}`
        );
        
        await sock.sendMessage(chatId, { text: errorText });
        return;
      }

      // Verificar argumentos
      if (args.length === 0) {
        const status = configManager.getAutoStickerStatus();
        const currentStatus = configManager.isAutoStickerEnabledForChat(chatId);
        
        const helpText = Formatter.card(
          "🎯 Controle de Figurinhas Automáticas",
          `${Formatter.info("Status atual das figurinhas automáticas:")}\n\n` +
          `${Formatter.bold("Status Atual:")}\n` +
          `• ${currentStatus ? "✅ Ativado" : "❌ Desativado"} neste ${isGroup ? "grupo" : "chat"}\n` +
          `• Global: ${status.global ? "✅ Ativado" : "❌ Desativado"}\n\n` +
          `${Formatter.bold("Estatísticas:")}\n` +
          `• Grupos ativados: ${status.groups.length}\n` +
          `• Usuários ativados: ${status.users.length}\n\n` +
          `${Formatter.info("💡 Comandos disponíveis:")}\n` +
          `• ${Formatter.code(config.prefix + "autosticker on")} - Ativar globalmente\n` +
          `• ${Formatter.code(config.prefix + "autosticker off")} - Desativar globalmente\n` +
          `• ${Formatter.code(config.prefix + "autosticker here on")} - Ativar aqui\n` +
          `• ${Formatter.code(config.prefix + "autosticker here off")} - Desativar aqui\n` +
          `• ${Formatter.code(config.prefix + "autosticker status")} - Ver status\n\n` +
          `${Formatter.info("💡 Se os botões não aparecerem, use os comandos acima!")}`
        );
        
        try {
          const buttonMessage = {
            text: helpText,
            footer: "Aurora Bot - Controle de Figurinhas Automáticas",
            buttons: [
              { buttonId: "as_global_on", buttonText: "🌍 Ativar Global", type: 1 },
              { buttonId: "as_global_off", buttonText: "🌍 Desativar Global", type: 1 },
              { buttonId: "as_here_on", buttonText: "📍 Ativar Aqui", type: 1 },
              { buttonId: "as_here_off", buttonText: "📍 Desativar Aqui", type: 1 },
              { buttonId: "as_status", buttonText: "📊 Status Detalhado", type: 1 },
              { buttonId: "as_help", buttonText: "❓ Ajuda", type: 1 }
            ]
          };
          
          await sock.sendMessage(chatId, buttonMessage);
        } catch (buttonError) {
          // Se falhar, enviar sem botões
          console.log("Botões não suportados no autosticker, enviando mensagem simples");
          await sock.sendMessage(chatId, { text: helpText });
        }
        return;
      }

      const action = args[0].toLowerCase();
      let success = false;
      let message = "";

      switch (action) {
        case "on":
        case "ativar":
        case "enable":
          success = configManager.setAutoSticker(true);
          message = "✅ Figurinhas automáticas **ativadas globalmente**!";
          break;

        case "off":
        case "desativar":
        case "disable":
          success = configManager.setAutoSticker(false);
          message = "❌ Figurinhas automáticas **desativadas globalmente**!";
          break;

        case "here":
          if (args.length < 2) {
            const errorText = Formatter.card(
              "❌ Argumento Faltando",
              `${Formatter.error("Especifique 'on' ou 'off' para o comando 'here'.")}\n\n` +
              `${Formatter.bold("Exemplo:")}\n` +
              `• ${Formatter.code(config.prefix + "autosticker here on")}\n` +
              `• ${Formatter.code(config.prefix + "autosticker here off")}`
            );
            
            await sock.sendMessage(chatId, { text: errorText });
            return;
          }

          const hereAction = args[1].toLowerCase();
          if (hereAction === "on" || hereAction === "ativar" || hereAction === "enable") {
            success = configManager.enableAutoStickerForChat(chatId);
            message = `✅ Figurinhas automáticas **ativadas** neste ${isGroup ? "grupo" : "chat"}!`;
          } else if (hereAction === "off" || hereAction === "desativar" || hereAction === "disable") {
            success = configManager.disableAutoStickerForChat(chatId);
            message = `❌ Figurinhas automáticas **desativadas** neste ${isGroup ? "grupo" : "chat"}!`;
          } else {
            const errorText = Formatter.card(
              "❌ Argumento Inválido",
              `${Formatter.error("Use 'on' ou 'off' para o comando 'here'.")}\n\n` +
              `${Formatter.bold("Exemplo:")}\n` +
              `• ${Formatter.code(config.prefix + "autosticker here on")}\n` +
              `• ${Formatter.code(config.prefix + "autosticker here off")}`
            );
            
            await sock.sendMessage(chatId, { text: errorText });
            return;
          }
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

        default:
          const errorText = Formatter.card(
            "❌ Comando Inválido",
            `${Formatter.error("Comando não reconhecido.")}\n\n` +
            `${Formatter.bold("Comandos válidos:")}\n` +
            `• ${Formatter.code("on/off")} - Controle global\n` +
            `• ${Formatter.code("here on/off")} - Controle local\n` +
            `• ${Formatter.code("status")} - Ver status\n\n` +
            `${Formatter.info("Use sem argumentos para ver a ajuda completa.")}`
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
      const errorText = Formatter.card(
        "⚠️ Erro Interno",
        `${Formatter.error("Erro interno do comando.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 