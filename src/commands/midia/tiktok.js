import fetch from "node-fetch";

export default {
  name: "tiktok",
  aliases: ["tt", "tik"],
  description: "Baixar vídeos do TikTok usando SpiderX",
  async execute(sock, msg, args, config) {
    try {
      // Reagir à mensagem do usuário com emoji do TikTok
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "🎵",
          key: msg.key,
        },
      });

      const url = args[0];
      if (!url) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎵 *Como usar:*\n\n*${config.prefix}tiktok [URL do TikTok]*\n\n📝 *Exemplos:*\n${config.prefix}tiktok https://tiktok.com/@usuario/video/123456789\n${config.prefix}tiktok https://vm.tiktok.com/abcdef/\n\n💡 *Dica:* Cole a URL completa do vídeo do TikTok`,
        });
        return;
      }

      // Verificar se é uma URL válida do TikTok
      if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *URL inválida*\n\n🔗 *Envie uma URL válida do TikTok*\n\n📝 *Exemplos:*\n• https://tiktok.com/@usuario/video/123456789\n• https://vm.tiktok.com/abcdef/",
        });
        return;
      }

      // Enviar mensagem de processamento
      const processingMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: `🎵 *Baixando vídeo do TikTok...*\n\n🔗 *URL:* ${url}\n\n⏳ *Aguarde, isso pode levar alguns segundos...*`,
      });

      // Baixar vídeo do TikTok na API SpiderX
      const apiKey = config.spiderxApiKey;
      const response = await fetch(`https://api.spiderx.com.br/api/downloads/tik-tok?url=${encodeURIComponent(url)}&api_key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SPIDERX TIKTOK API RESPONSE]', data);

      if (!data || !data.download_link) {
        throw new Error("Vídeo do TikTok não encontrado");
      }

      // Enviar vídeo do TikTok
      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: data.download_link },
        caption: `🎵 *VÍDEO DO TIKTOK*\n\n🔗 *URL Original:* ${url}\n\n💡 *Baixado com sucesso!*`,
        footer: "🎵 Aurora Bot • TikTok Downloader",
      });

    } catch (error) {
      console.error("[TIKTOK ERROR]", error);
      
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *Erro ao baixar vídeo do TikTok*\n\n🔧 *Possíveis causas:*\n• URL inválida ou privada\n• Vídeo não disponível\n• Problema na API\n• Serviço temporariamente indisponível\n\n💡 *Verifique se a URL está correta e tente novamente.*`,
      });
    }
  },
}; 