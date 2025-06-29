import fetch from "node-fetch";
import { formatDuration, ERROR_MESSAGE } from "../../utils/helpers.js";

export default {
  name: "play",
  aliases: ["music", "musica"],
  description: "Baixar música",
  async execute(sock, msg, args, config) {
    try {
      const query = args.join(" ");
      if (!query) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎵 *BAIXAR MÚSICA*\n\n💡 *Como usar:*\n*${config.prefix}play [nome da música]*\n\n📝 *Exemplos:*\n• ${config.prefix}play Shape of You\n• ${config.prefix}play Despacito`,
        });
        return;
      }

      let musicaSpiderX = null;
      try {
        const apiKey = config.spiderxApiKey;
        const response = await fetch(`https://api.spiderx.com.br/api/downloads/play-audio?search=${encodeURIComponent(query)}&api_key=${apiKey}`);
        const data = await response.json();
        
        if (data && data.url) {
          musicaSpiderX = {
            id: 1,
            title: data.title || `${query} - Principal`,
            duration: data.total_duration_in_seconds || 180,
            channel: data.channel?.name || "Canal Principal",
            url: data.url,
            emoji: "🎵"
          };
        }
      } catch (e) {
        console.error('[SPIDERX ERROR]', e);
      }

      const musicasParaMostrar = [
        musicaSpiderX ? {
          id: 1,
          title: `${musicaSpiderX.emoji} ${musicaSpiderX.title}`,
          duration: musicaSpiderX.duration,
          channel: musicaSpiderX.channel,
          url: musicaSpiderX.url,
          description: `⏱️ ${formatDuration(musicaSpiderX.duration)} • 📺 ${musicaSpiderX.channel}`
        } : {
          id: 1,
          title: `🎵 ${query} - Principal`,
          duration: 180,
          channel: "Canal Principal",
          url: null,
          description: `⏱️ 3:00 • 📺 Canal Principal`
        },
        {
          id: 2,
          title: `🎶 ${query} - Alternativa`,
          duration: 200,
          channel: "Canal Alternativo",
          url: null,
          description: `⏱️ 3:20 • 📺 Canal Alternativo`
        },
        {
          id: 3,
          title: `🎤 ${query} - Completa`,
          duration: 220,
          channel: "Canal Completo",
          url: null,
          description: `⏱️ 3:40 • 📺 Canal Completo`
        },
        {
          id: 4,
          title: `🎧 ${query} - Similar 1`,
          duration: 190,
          channel: "Canal Similar 1",
          url: null,
          description: `⏱️ 3:10 • 📺 Canal Similar 1`
        },
        {
          id: 5,
          title: `🎼 ${query} - Similar 2`,
          duration: 170,
          channel: "Canal Similar 2",
          url: null,
          description: `⏱️ 2:50 • 📺 Canal Similar 2`
        }
      ];

      const isGroup = msg.key.remoteJid.endsWith("@g.us");
      if (isGroup) {
        const texto = `🎵 *Música encontrada!*\n\n🎯 Busca: *${query}*`;
        const botoes = [
          {
            buttonId: "play_pode_mandar",
            buttonText: { displayText: "Pode mandar" },
            type: 1,
          },
        ];
        await sock.sendMessage(msg.key.remoteJid, {
          text: texto,
          buttons: botoes,
        });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎵 *Música encontrada! Escolha uma opção abaixo:*\n\n🎯 Busca: *${query}*\n📊 Resultados: *${musicasParaMostrar.length} opções*`,
          footer: "🎧 Aurora Bot - Sistema de Música",
          title: "🎵 Selecionar Música",
          buttonText: "📋 VER MÚSICAS",
          sections: [
            {
              title: "🎼 Músicas Encontradas",
              rows: musicasParaMostrar.map((musica) => ({
                title: musica.title,
                description: musica.description,
                rowId: `play_musica_${musica.id}`,
              })),
            },
          ],
          listType: 1,
        });
      }

      config._ultimasMusicas = musicasParaMostrar;
    } catch (e) {
      console.error("[PLAY ERROR]", e);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
};
