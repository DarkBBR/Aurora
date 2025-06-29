import fetch from "node-fetch";

export default {
  name: "playvideo",
  aliases: ["video", "vplay", "v"],
  description: "Buscar e baixar vídeos usando SpiderX",
  async execute(sock, msg, args, config) {
    try {
      // Reagir à mensagem do usuário com emoji de vídeo
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "🎬",
          key: msg.key,
        },
      });

      const query = args.join(" ");
      if (!query) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎬 *Como usar:*\n\n*${config.prefix}playvideo [nome do vídeo]*\n\n📝 *Exemplos:*\n${config.prefix}playvideo MC Kevinho\n${config.prefix}playvideo Alok\n${config.prefix}playvideo Anitta`,
        });
        return;
      }

      // Enviar mensagem de processamento
      const processingMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: `🎬 *Buscando vídeo...*\n\n📝 *Pesquisa:* ${query}\n\n⏳ *Aguarde, isso pode levar alguns segundos...*`,
      });

      // Buscar vídeo na API SpiderX
      const apiKey = config.spiderxApiKey;
      const response = await fetch(`https://api.spiderx.com.br/api/downloads/play-video?search=${encodeURIComponent(query)}&api_key=${apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SPIDERX VIDEO API RESPONSE]', data);

      if (!data || !data.url) {
        throw new Error("Vídeo não encontrado");
      }

      // Função para formatar duração em mm:ss
      function formatarDuracao(segundos) {
        if (!segundos) return "N/A";
        return `${Math.floor(segundos / 60)}:${(segundos % 60).toString().padStart(2, '0')}`;
      }

      // Enviar vídeo encontrado
      const videoInfo = `
🎬 *VÍDEO ENCONTRADO*

📺 *Título:* ${data.title || query}
📝 *Descrição:* ${data.description || "Sem descrição"}
⏱️ *Duração:* ${formatarDuracao(data.total_duration_in_seconds)}
📺 *Canal:* ${data.channel?.name || "Canal desconhecido"}
🔗 *Canal URL:* ${data.channel?.url || "N/A"}

💡 *Baixando vídeo...*
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: data.thumbnail || "https://via.placeholder.com/300x200?text=Video" },
        caption: videoInfo,
        footer: "🎬 Aurora Bot • Sistema de Vídeos",
      });

      // Enviar o vídeo
      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: data.url },
        caption: `🎬 *${data.title || query}*\n\n📺 *Canal:* ${data.channel?.name || "Canal desconhecido"}\n⏱️ *Duração:* ${formatarDuracao(data.total_duration_in_seconds)}`,
        footer: "🎬 Aurora Bot • Sistema de Vídeos",
      });

    } catch (error) {
      console.error("[PLAYVIDEO ERROR]", error);
      
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *Erro ao buscar vídeo*\n\n🔧 *Possíveis causas:*\n• Vídeo não encontrado\n• Problema na API\n• Serviço temporariamente indisponível\n\n💡 *Tente novamente com outro termo de busca.*`,
      });
    }
  },
}; 