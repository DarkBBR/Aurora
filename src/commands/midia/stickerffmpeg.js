import { downloadContentFromMessage } from "anju-xpro-baileys";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default {
  name: "s",
  aliases: ["s"],
  description: "Cria figurinha a partir de imagem, vídeo ou gif (até 10s) usando ffmpeg. Use: !s [descrição] ou envie imagem com !s no texto",
  async execute(sock, msg, args, commands, config) {
    try {
      // Verificar se há descrição manual nos argumentos
      const manualDescription = args.length > 0 ? args.join(' ') : null;
      
      // Verifica se a mensagem contém mídia ou é resposta a mídia
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let mediaType = null;
      let mediaMessage = null;
      if (quoted) {
        if (quoted.imageMessage) {
          mediaType = "image";
          mediaMessage = quoted.imageMessage;
        } else if (quoted.videoMessage) {
          mediaType = "video";
          mediaMessage = quoted.videoMessage;
        } else if (quoted.documentMessage && quoted.documentMessage.mimetype?.includes("image")) {
          mediaType = "image";
          mediaMessage = quoted.documentMessage;
        }
      } else if (msg.message?.imageMessage) {
        mediaType = "image";
        mediaMessage = msg.message.imageMessage;
      } else if (msg.message?.videoMessage) {
        mediaType = "video";
        mediaMessage = msg.message.videoMessage;
      } else if (msg.message?.documentMessage && msg.message.documentMessage.mimetype?.includes("image")) {
        mediaType = "image";
        mediaMessage = msg.message.documentMessage;
      }

      if (!mediaType || !mediaMessage) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ Envie ou responda a uma imagem, vídeo ou gif (até 10s) para criar a figurinha.\n\n💡 Dicas:\n• Use: !s [descrição] para especificar descrição manual\n• Ou envie imagem com '!s' no texto para detecção automática"
        });
        return;
      }

      // Se for vídeo, checar duração
      if (mediaType === "video" && mediaMessage.seconds > 10) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ O vídeo/gif deve ter no máximo 10 segundos."
        });
        return;
      }

      // Se a legenda for exatamente '!s', criar figurinha normalmente sem descrição
      if (msg.message?.imageMessage && (msg.message?.conversation?.trim() === '!s' || msg.message?.extendedTextMessage?.text?.trim() === '!s')) {
        // Baixar mídia
        let mediaBuffer = Buffer.alloc(0);
        const stream = await downloadContentFromMessage(msg.message.imageMessage, 'image');
        for await (const chunk of stream) {
          mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
        }
        // Salvar mídia temporária
        const tempDir = './temp_stickers';
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        const inputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
        const outputPath = path.join(tempDir, `output_${Date.now()}.webp`);
        fs.writeFileSync(inputPath, mediaBuffer);
        // Converter para webp usando ffmpeg
        await new Promise((resolve, reject) => {
          const args = [
            '-i', inputPath,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
            '-vcodec', 'libwebp',
            '-lossless', '1',
            '-qscale', '75',
            '-preset', 'picture',
            '-an',
            '-vsync', '0',
            '-s', '512:512',
            outputPath
          ];
          const ffmpeg = spawn(ffmpegPath, args);
          ffmpeg.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error('Erro ao converter para webp'));
          });
        });
        // Ler webp e enviar como figurinha
        const stickerBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer }, { quoted: msg });
        // Limpar arquivos temporários
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        return;
      }

      // Baixar mídia
      let mediaBuffer = Buffer.alloc(0);
      const stream = await downloadContentFromMessage(mediaMessage, mediaType);
      for await (const chunk of stream) {
        mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
      }

      // Salvar mídia temporária
      const tempDir = "./temp_stickers";
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const inputPath = path.join(tempDir, `input_${Date.now()}` + (mediaType === "image" ? ".jpg" : ".mp4"));
      const outputPath = path.join(tempDir, `output_${Date.now()}.webp`);
      fs.writeFileSync(inputPath, mediaBuffer);

      // Se for imagem e não há descrição manual, tentar detectar texto com "!s"
      let stickerText = manualDescription;
      let detectedCommand = false;
      if (!stickerText && mediaType === "image") {
        try {
          // Converter imagem para base64
          const base64Image = mediaBuffer.toString('base64');
          
          // Usar API gratuita do OCR.space para detectar texto
          const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              apikey: 'K81724188988957', // API key gratuita
              base64Image: base64Image,
              language: 'por',
              isOverlayRequired: false,
              filetype: 'jpg',
              detectOrientation: false,
              scale: true,
              OCREngine: 2
            })
          });

          const ocrData = await ocrResponse.json();
          
          if (ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
            const detectedText = ocrData.ParsedResults[0].ParsedText.toLowerCase();
            
            // Procurar por padrão "!s" seguido de texto OU apenas "!s"
            const matchWithText = detectedText.match(/!s\s+(.+)/);
            const matchOnlyS = detectedText.match(/^!s\s*$/);
            
            if (matchWithText) {
              stickerText = matchWithText[1].trim();
              console.log(`Texto detectado na imagem: "${stickerText}"`);
            } else if (matchOnlyS) {
              detectedCommand = true;
              console.log(`Comando !s detectado na imagem - criando figurinha sem descrição`);
            }
          }
        } catch (ocrError) {
          console.log('Erro ao detectar texto na imagem:', ocrError.message);
        }
      }

      // Converter para webp usando ffmpeg
      await new Promise((resolve, reject) => {
        const args = mediaType === "image"
          ? ["-i", inputPath, "-vf", "scale=512:512:force_original_aspect_ratio=decrease", "-vcodec", "libwebp", "-lossless", "1", "-qscale", "75", "-preset", "picture", "-an", "-vsync", "0", "-s", "512:512", outputPath]
          : ["-i", inputPath, "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15", "-vcodec", "libwebp", "-lossless", "0", "-qscale", "75", "-preset", "default", "-an", "-vsync", "0", "-s", "512:512", "-t", "10", outputPath];
        const ffmpeg = spawn(ffmpegPath, args);
        ffmpeg.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error("Erro ao converter para webp"));
        });
      });

      // Ler webp e enviar como figurinha
      const stickerBuffer = fs.readFileSync(outputPath);
      
      // Preparar mensagem de resposta
      let responseMessage = "✅ Figurinha criada com sucesso!";
      if (stickerText) {
        responseMessage += `\n📝 Descrição: "${stickerText}"`;
        if (manualDescription) {
          responseMessage += " (manual)";
        } else {
          responseMessage += " (detectada automaticamente)";
        }
      } else if (detectedCommand) {
        responseMessage += "\n🤖 Comando !s detectado na imagem";
      }
      
      await sock.sendMessage(msg.key.remoteJid, { 
        sticker: stickerBuffer,
        caption: responseMessage
      }, { quoted: msg });

      // Limpar arquivos temporários
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (e) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ Erro ao criar figurinha: ${e.message}`
      });
    }
  }
}; 