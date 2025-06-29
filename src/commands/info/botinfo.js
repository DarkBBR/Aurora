export default {
  name: "botinfo",
  aliases: ["info", "about", "bot"],
  description: "Exibe informações detalhadas sobre o bot.",
  async execute(sock, msg, args, config) {
    try {
      console.log("[DEBUG] Executando comando botinfo");
      
      const info = `
🤖 *${config.botName}*

📊 *Informações Gerais*
• Versão: 1.0.0
• Criador: Aurora
• Prefixo: ${config.prefix}

⏱️ *Status*
• Status: Online
• Node.js: ${process.version}

💡 Use *${config.prefix}help* para ver todos os comandos disponíveis!
      `.trim();

      console.log("[DEBUG] Enviando resposta do botinfo");
      await sock.sendMessage(msg.key.remoteJid, { text: info });
      console.log("[DEBUG] Resposta enviada com sucesso");
      
    } catch (error) {
      console.error("Erro no comando botinfo:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao obter informações do bot. Tente novamente.",
      });
    }
  },
};
