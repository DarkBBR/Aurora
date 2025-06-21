import { Formatter } from "../../utils/Formatter.js";
import { MediaProcessor } from "../../utils/MediaProcessor.js";
import { 
  detectMediaType, 
  validateVideoDuration, 
  formatDuration,
  getDefaultPackName,
  getDefaultAuthorName,
  createStickerConfig
} from "../../utils/StickerUtils.js";
import { StickerTypes } from 'wa-sticker-formatter';
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  name: "videosticker",
  aliases: ["vs", "videofigu", "videost"],
  description: "Cria uma figurinha animada a partir de um vídeo",
  async execute(sock, msg, args, commands, config) {
    try {
      // Reagir à mensagem
      try {
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: "✅",
            key: msg.key
          }
        });
      } catch (e) {
        // Ignorar erro de reação se não suportado
      }

      // Determinar tipo de mídia usando função utilitária
      const { type: mediaType, message: mediaMessage } = detectMediaType(msg);
      
      if (!mediaType || !mediaMessage) {
        const helpText = Formatter.card(
          "🎬 Criar Figurinha Animada",
          `${Formatter.info("Para criar uma figurinha animada:")}\n\n` +
          `${Formatter.bold("Método 1:")}\n` +
          `• Envie um vídeo com legenda: ${Formatter.code(config.prefix + "videosticker")}\n\n` +
          `${Formatter.bold("Método 2:")}\n` +
          `• Envie um vídeo\n` +
          `• Responda com ${Formatter.code(config.prefix + "videosticker")}\n\n` +
          `${Formatter.bold("Suporte:")}\n` +
          `• Vídeos (até 10 segundos)\n` +
          `• ViewOnce (visualização única)\n\n` +
          `${Formatter.info("💡 Converte vídeos em figurinhas animadas")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }

      // Verificar se é vídeo
      if (mediaType !== 'video') {
        const errorText = Formatter.card(
          "❌ Tipo de Mídia Inválido",
          `${Formatter.error("Este comando é apenas para vídeos.")}\n\n` +
          `${Formatter.bold("Tipo detectado:")} ${mediaType === 'image' ? 'Imagem' : 'Desconhecido'}\n` +
          `${Formatter.bold("Use:")} ${Formatter.code(config.prefix + "sticker")} ${Formatter.info("para imagens")}\n\n` +
          `${Formatter.info("🔧 Envie um vídeo para criar figurinha animada")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: errorText });
        return;
      }

      try {
        // Validar duração do vídeo
        if (!validateVideoDuration(mediaMessage.seconds)) {
          const errorText = Formatter.card(
            "❌ Vídeo Muito Longo",
            `${Formatter.error("O vídeo deve ter no máximo 10 segundos.")}\n\n` +
            `${Formatter.bold("Duração atual:")} ${formatDuration(mediaMessage.seconds)}\n` +
            `${Formatter.bold("Máximo permitido:")} 10 segundos\n\n` +
            `${Formatter.info("🔧 Envie um vídeo mais curto")}`
          );
          
          await sock.sendMessage(msg.key.remoteJid, { text: errorText });
          return;
        }
        
        // Baixar vídeo usando downloadContentFromMessage
        let mediaBuffer = Buffer.alloc(0);
        try {
          const stream = await downloadContentFromMessage(mediaMessage, mediaType);
          for await (const chunk of stream) {
            mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
          }
        } catch (e) {
          throw new Error("Não foi possível baixar o vídeo: " + e.message);
        }
        
        if (!mediaBuffer) {
          throw new Error("Não foi possível baixar o vídeo");
        }
        
        // Processar vídeo
        const processor = new MediaProcessor();
        
        // Usar configurações para vídeo
        const stickerConfig = createStickerConfig(mediaType, mediaMessage, config);
        
        // Processar o vídeo para sticker animado
        const processedBuffer = await processor.processVideo(mediaBuffer, stickerConfig);
        
        // Gerar pack name e author personalizados
        const packName = getDefaultPackName();
        const authorName = getDefaultAuthorName(
          msg.pushName, 
          config.botName, 
          "Aurora", 
          "https://github.com"
        );
        
        // Criar sticker animado com wa-sticker-formatter
        const stickerOptions = {
          pack: packName,
          author: authorName,
          type: StickerTypes.FULL,
          categories: ['🎬', '✨'],
          quality: 70,
          background: 'transparent'
        };
        
        const stickerBuffer = await processor.createAnimatedSticker(processedBuffer, stickerOptions);
        
        // Enviar sticker animado
        await sock.sendMessage(msg.key.remoteJid, {
          sticker: stickerBuffer,
          contextInfo: {
            forwardingScore: 0,
            isForwarded: false
          }
        }, { quoted: msg });
        
        // Limpar arquivos temporários
        await processor.cleanup();

      } catch (processError) {
        const errorText = Formatter.card(
          "❌ Erro ao Processar",
          `${Formatter.error("Erro ao processar vídeo.")}\n\n` +
          `${Formatter.bold("Erro:")}\n` +
          `• ${Formatter.code(processError.message)}\n\n` +
          `${Formatter.info("🔧 Verifique se o vídeo é válido")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: errorText });
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