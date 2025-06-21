import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "tiktok",
  aliases: ["tt", "tiktokdl", "tiktokdownload"],
  description: "Baixa vídeos do TikTok através de uma URL",
  async execute(sock, msg, args, commands, config) {
    try {
      // Verificar se foi fornecida uma URL
      if (!args.length) {
        const helpText = Formatter.card(
          "📱 Download TikTok",
          `${Formatter.info("Como usar:")}\n` +
          `${Formatter.bold("!tiktok")} URL_DO_TIKTOK\n\n` +
          `${Formatter.info("Exemplos:")}\n` +
          `• ${Formatter.code("!tiktok https://tiktok.com/@usuario/video/123456789")}\n` +
          `• ${Formatter.code("!tt https://vm.tiktok.com/abc123/")}\n` +
          `• ${Formatter.code("!tiktokdl https://www.tiktok.com/@usuario/video/123456789")}\n\n` +
          `${Formatter.success("💡 Você pode usar qualquer um dos aliases: tiktok, tt, tiktokdl, tiktokdownload")}\n\n` +
          `${Formatter.warning("⚠️  Certifique-se de que a URL é válida e o vídeo é público")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }

      // Obter a URL do TikTok
      const tiktokUrl = args[0];
      const apiKey = process.env.SPIDERX_API_KEY || "D0wgubPHthjiOv8DxshC";

      // Validar se é uma URL do TikTok
      if (!tiktokUrl.includes("tiktok.com") && !tiktokUrl.includes("vm.tiktok.com")) {
        const errorText = Formatter.card(
          "❌ URL Inválida",
          `${Formatter.error("A URL fornecida não parece ser do TikTok:")}\n\n` +
          `${Formatter.code(tiktokUrl)}\n\n` +
          `${Formatter.info("💡 Certifique-se de que a URL seja do TikTok (tiktok.com ou vm.tiktok.com)")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: errorText });
        return;
      }

      // Enviar mensagem de "digitando..."
      await sock.presenceSubscribe(msg.key.remoteJid);
      await sock.sendPresenceUpdate("composing", msg.key.remoteJid);

      // Fazer requisição para a API do SpiderX
      const response = await fetch(`https://api.spiderx.com.br/api/downloads/tik-tok?url=${encodeURIComponent(tiktokUrl)}&api_key=${apiKey}`);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.download_link) {
        throw new Error("Não foi possível obter o link de download do vídeo");
      }

      // Parar o status de "digitando..."
      await sock.sendPresenceUpdate("paused", msg.key.remoteJid);

      // Enviar o vídeo
      const videoMessage = {
        video: { url: data.download_link },
        caption: Formatter.card(
          "📱 Vídeo do TikTok",
          `${Formatter.success("✅ Vídeo baixado com sucesso!")}\n\n` +
          `${Formatter.bold("URL original:")}\n${Formatter.link(tiktokUrl)}\n\n` +
          `${Formatter.info("💡 Powered by SpiderX API")}`
        )
      };

      await sock.sendMessage(msg.key.remoteJid, videoMessage);

    } catch (error) {
      console.error("Erro no comando tiktok:", error);
      
      const errorText = Formatter.card(
        "❌ Erro no Download",
        `${Formatter.error("Ocorreu um erro ao baixar o vídeo:")}\n\n` +
        `${Formatter.code(error.message)}\n\n` +
        `${Formatter.info("💡 Possíveis causas:")}\n` +
        `• URL inválida ou vídeo privado\n` +
        `• Vídeo muito longo\n` +
        `• Problemas temporários na API\n\n` +
        `${Formatter.warning("⚠️  Tente novamente em alguns instantes")}`
      );

      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 