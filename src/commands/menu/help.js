export default {
  name: "help",
  aliases: ["ajuda", "comandos", "commands"],
  description: "Lista todos os comandos disponíveis",
  async execute(sock, msg, args, config) {
    try {
      const helpText = `
🌟 *AURORA BOT - COMANDOS* 🌟

ℹ️ *INFORMAÇÕES*
• ${config.prefix}botinfo – Informações do bot
• ${config.prefix}user – Seu perfil e saldo
• ${config.prefix}grupo – Informações do grupo
• ${config.prefix}status – Status do sistema
• ${config.prefix}ping – Testar latência

🤖 *IA*
• ${config.prefix}chat <pergunta> – Conversar com IA (Gemini)
• ${config.prefix}imaginest <prompt> – Gerar imagem (Stable Diffusion)
• ${config.prefix}imaginepixart <prompt> – Gerar imagem (Pixart)

🎵 *MÍDIA*
• ${config.prefix}play <música> – Baixar música
• ${config.prefix}playvideo <vídeo> – Baixar vídeo
• ${config.prefix}tiktok <url> – Baixar TikTok
• ${config.prefix}s [descrição] – Criar figurinha

🎮 *JOGOS*
• ${config.prefix}8ball <pergunta> – Bola 8 mágica
• ${config.prefix}coinflip [cara/coroa] – Cara ou coroa
• ${config.prefix}dice [número] – Rolar dados
• ${config.prefix}forca [nível] – Jogo da forca (grupo)

💰 *ECONOMIA*
• ${config.prefix}saldo – Ver seu dinheiro
• ${config.prefix}minerar – Mine dinheiro (5min cooldown)
• ${config.prefix}trabalhar – Trabalhe por dinheiro (10min cooldown)
• ${config.prefix}treinar – Treine para assaltos (15min cooldown)
• ${config.prefix}assaltar @user – Assalte outros (30min cooldown)

📋 *REGISTRO*
• ${config.prefix}register [nome] [idade] – Registrar-se
• ${config.prefix}menu – Menu principal

💡 *DICAS*
• Use ${config.prefix} antes de cada comando
• Alguns comandos têm cooldown
• Registre-se para usar todos os recursos
• Use ${config.prefix}user para ver seu perfil completo
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: helpText });
    } catch (error) {
      console.error("Erro no comando help:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao mostrar ajuda. Tente novamente.",
      });
    }
  },
}; 