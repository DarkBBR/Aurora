import { Formatter } from "../../utils/Formatter.js";
import { MediaProcessor } from "../../utils/MediaProcessor.js";
import {
  detectMediaType,
  validateVideoDuration,
  formatDuration,
  getDefaultPackName,
  getDefaultAuthorName,
  createStickerConfig,
} from "../../utils/StickerUtils.js";
import { StickerTypes } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  name: "sticker",
  aliases: ["s", "figurinha", "fsticker", "fstiker", "f"],
  description: "Cria uma figurinha a partir de imagem ou vídeo",
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
          "🎨 Criar Figurinha",
          `${Formatter.info("Para criar uma figurinha:")}\n\n` +
            `${Formatter.bold("Método 1:")}\n` +
            `• Envie uma imagem/vídeo com legenda: ${Formatter.code(
              config.prefix + "sticker"
            )}\n\n` +
            `${Formatter.bold("Método 2:")}\n` +
            `• Envie uma imagem/vídeo\n` +
            `• Responda com ${Formatter.code(config.prefix + "sticker")}\n\n` +
            `${Formatter.bold("Suporte:")}\n` +
            `• Imagens (JPG, PNG, GIF, WebP)\n` +
            `• Vídeos (até 10 segundos)\n` +
            `• ViewOnce (visualização única)\n\n` +
            `${Formatter.info("💡 Converte mídia em figurinhas para WhatsApp")}`
        );

        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }

      // Validar duração do vídeo (se for vídeo)
      if (mediaType === 'video' && !validateVideoDuration(mediaMessage.seconds)) {
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

      // Processar mídia
      const processor = new MediaProcessor();

      // Usar configurações baseadas no tipo de mídia
      const stickerConfig = createStickerConfig(
        mediaType,
        mediaMessage,
        config
      );

      let processedBuffer;
      let stickerBuffer;

      if (mediaType === "image") {
        // Processar imagem
        processedBuffer = await processor.processImage(
          mediaBuffer,
          stickerConfig
        );
      } else {
        // Processar vídeo
        processedBuffer = await processor.processVideo(
          mediaBuffer,
          stickerConfig
        );
      }

      // Gerar pack name e author personalizados
      const packName = getDefaultPackName();
      const authorName = getDefaultAuthorName(
        msg.pushName,
        config.botName,
        "Aurora",
        "https://github.com"
      );

      // Criar sticker com wa-sticker-formatter
      const stickerOptions = {
        pack: packName,
        author: authorName,
        type: mediaType === "video" ? StickerTypes.FULL : StickerTypes.FULL,
        categories: ["🤖", "✨"],
        quality: 70,
        background: "transparent",
      };

      if (mediaType === "video") {
        stickerBuffer = await processor.createAnimatedSticker(
          processedBuffer,
          stickerOptions
        );
      } else {
        stickerBuffer = await processor.createSticker(
          processedBuffer,
          stickerOptions
        );
      }

      // Enviar sticker
      await sock.sendMessage(msg.key.remoteJid, {
        sticker: processedBuffer,
        contextInfo: {
          forwardingScore: 0,
          isForwarded: false,
        },
      }, { quoted: msg });

      // Limpar arquivos temporários
      await processor.cleanup();
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
