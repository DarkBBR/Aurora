import path from "path";
import fs from "fs";

export default {
  name: "menu",
  aliases: ["help", "ajuda", "comandos"],
  description: "Menu principal do Aurora Bot",
  async execute(sock, msg, args, config) {
    try {
      const menuMessage = `
🌟 *AURORA BOT - MENU PRINCIPAL* 🌟

🤖 *COMANDOS DE INFORMAÇÃO*
• ${config.prefix}botinfo - Informações do bot
• ${config.prefix}user - Seu perfil
• ${config.prefix}ping - Latência do bot
• ${config.prefix}status - Status do sistema

🤖 *COMANDOS DE IA*
• ${config.prefix}chatgpt - Chat com IA
• ${config.prefix}imaginepixart - Gerar imagens
• ${config.prefix}img - Buscar imagens

🎵 *COMANDOS DE MÍDIA*
• ${config.prefix}play - Baixar música
• ${config.prefix}playvideo - Baixar vídeo
• ${config.prefix}tiktok - Baixar TikTok

🎮 *COMANDOS DE JOGOS*
• ${config.prefix}8ball - Bola 8 mágica
• ${config.prefix}coinflip - Cara ou coroa
• ${config.prefix}dice - Jogo de dados
• ${config.prefix}forca - Jogo da forca

💰 *COMANDOS DE ECONOMIA*
• ${config.prefix}minerar - Minerar dinheiro
• ${config.prefix}trabalhar - Trabalhar
• ${config.prefix}treinar - Treinar habilidades
• ${config.prefix}assaltar - Assaltar outros
• ${config.prefix}saldo - Ver saldo

🔧 *COMANDOS DE UTILIDADE*
• ${config.prefix}register - Registrar-se
• ${config.prefix}menu - Este menu

📱 *Prefix:* ${config.prefix}
🤖 *Versão:* 2.0
🌟 *Desenvolvido com ❤️*
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, {
        text: menuMessage,
        footer: "🤖 Aurora Bot • Menu Principal",
        buttons: [
          { 
            buttonId: "menu_dono", 
            buttonText: { displayText: "⭐ GitHub" }, 
            type: 1 
          }
        ]
      });
    } catch (error) {
      console.error("Erro no comando menu:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao carregar menu. Tente novamente.",
      });
    }
  },
};
