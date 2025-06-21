import { Formatter } from "../../utils/Formatter.js";
import fetch from "node-fetch";

export default {
  name: "audio",
  aliases: ["mp3", "music", "song"],
  description: "Baixa áudio MP3 do YouTube",
  async execute(sock, msg, args, commands, config) {
    try {
      // Verificar se foi fornecido um URL
      if (args.length === 0) {
        const helpText = Formatter.card(
          "🎵 Comando Audio",
          `${Formatter.info("Para baixar áudio MP3 do YouTube:")}\n\n` +
            `${Formatter.bold("Uso:")}\n` +
            `• ${Formatter.code(
              config.prefix + "audio https://youtube.com/watch?v=..."
            )}\n\n` +
            `${Formatter.bold("Exemplos:")}\n` +
            `• ${Formatter.code(
              config.prefix + "audio https://youtu.be/dQw4w9WgXcQ"
            )}\n` +
            `• ${Formatter.code(
              config.prefix + "mp3 https://youtube.com/watch?v=..."
            )}\n\n` +
            `${Formatter.info(
              "💡 Baixa áudio MP3 do YouTube usando API SpiderX"
            )}`
        );

        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }

      // Reagir à mensagem
      try {
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: "✅",
            key: msg.key,
          },
        });
      } catch (e) {
        // Ignorar erro de reação se não suportado
      }

      // Enviar mensagem de processamento
      await sock.sendMessage(msg.key.remoteJid, {
        text: Formatter.info("🔍 Processando áudio..."),
      });

      try {
        const input = args.join(" ");
        const youtubeRegex =
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const apiKey = process.env.SPIDERX_API_KEY || "D0wgubPHthjiOv8DxshC";
        let apiUrl;
        if (youtubeRegex.test(input)) {
          // Se for link, usa yt-mp3
          apiUrl = `https://api.spiderx.com.br/api/downloads/yt-mp3?url=${encodeURIComponent(
            input
          )}&api_key=${apiKey}`;
        } else {
          // Se for texto, usa play-audio
          apiUrl = `https://api.spiderx.com.br/api/downloads/play-audio?search=${encodeURIComponent(
            input
          )}&api_key=${apiKey}`;
        }

        // Fazer requisição GET para a API SpiderX
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Aurora-Bot/1.0",
          },
          timeout: 30000, // 30 segundos de timeout
        });

        if (!response.ok) {
          let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;

          // Mensagens específicas para diferentes códigos de erro
          switch (response.status) {
            case 400:
              errorMessage =
                "Requisição inválida. Verifique se o link ou termo de busca está correto.";
              break;
            case 401:
              errorMessage =
                "Chave da API inválida. Configure sua chave no arquivo .env";
              break;
            case 403:
              errorMessage = "Acesso negado. Verifique sua chave da API.";
              break;
            case 404:
              errorMessage =
                "Vídeo não encontrado. Tente outro link ou termo de busca.";
              break;
            case 429:
              errorMessage =
                "Limite de requisições excedido. Aguarde um pouco e tente novamente.";
              break;
            case 500:
              errorMessage =
                "Erro interno do servidor da API. Tente novamente em alguns minutos.";
              break;
            case 524:
              errorMessage =
                "Timeout na API. O servidor demorou muito para responder. Tente novamente.";
              break;
            default:
              errorMessage = `Erro na API (${response.status}): ${response.statusText}`;
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.url) {
          throw new Error(data.message || "Erro ao processar áudio");
        }

        // Enviar mensagem de download
        await sock.sendMessage(msg.key.remoteJid, {
          text: Formatter.info("⬇️ Baixando áudio..."),
        });

        // Baixar o áudio
        const audioResponse = await fetch(data.url);
        if (!audioResponse.ok) {
          throw new Error("Erro ao baixar áudio");
        }

        const audioArrayBuffer = await audioResponse.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);

        // Verificar tamanho do áudio (limite do WhatsApp: 16MB)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (audioBuffer.length > maxSize) {
          const errorText = Formatter.card(
            "❌ Áudio Muito Grande",
            `${Formatter.error("O áudio é muito grande para enviar.")}\n\n` +
              `${Formatter.bold("Tamanho:")} ${(
                audioBuffer.length /
                1024 /
                1024
              ).toFixed(2)} MB\n` +
              `${Formatter.bold("Máximo:")} 16 MB\n\n` +
              `${Formatter.info("🔧 Tente um vídeo menor ou use outro link")}`
          );

          await sock.sendMessage(msg.key.remoteJid, { text: errorText });
          return;
        }

        // Enviar áudio
        try {
          await sock.sendMessage(msg.key.remoteJid, {
            audio: audioBuffer,
            mimetype: "audio/mpeg",
            fileName: `${data.title || "audio"}.mp3`,
            caption:
              `🎵 ${data.title || "Áudio do YouTube"}\n\n` +
              `⏱️ Duração: ${
                data.total_duration_in_seconds
                  ? Math.floor(data.total_duration_in_seconds / 60) +
                    ":" +
                    (data.total_duration_in_seconds % 60)
                      .toString()
                      .padStart(2, "0")
                  : "Desconhecida"
              }\n` +
              `📺 Canal: ${data.channel?.name || "Desconhecido"}\n` +
              `📦 Tamanho: ${(audioBuffer.length / 1024 / 1024).toFixed(
                2
              )} MB\n\n` +
              `💡 Baixado via API SpiderX`,
          });

          console.log(`✅ Áudio enviado com sucesso: ${data.title}`);
        } catch (sendError) {
          console.error("Erro ao enviar áudio:", sendError);
          throw new Error(`Erro ao enviar áudio: ${sendError.message}`);
        }
      } catch (processError) {
        const errorText = Formatter.card(
          "❌ Erro ao Processar",
          `${Formatter.error("Erro ao processar áudio.")}\n\n` +
            `${Formatter.bold("Erro:")}\n` +
            `• ${Formatter.code(processError.message)}\n\n` +
            `${Formatter.info(
              "🔧 Verifique se o link é válido ou tente outro vídeo"
            )}`
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
