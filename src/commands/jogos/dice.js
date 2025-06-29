export default {
  name: "dice",
  aliases: ["dado", "dados", "roll"],
  description: "Jogo de dados",
  async execute(sock, msg, args, config) {
    try {
      const guess = parseInt(args[0]);
      
      if (!guess || guess < 1 || guess > 6) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎲 *JOGO DE DADOS*\n\n💡 *Como jogar:*\n*${config.prefix}dice [1-6]*\n\n📝 *Exemplos:*\n• ${config.prefix}dice 3\n• ${config.prefix}dice 6`,
        });
        return;
      }

      const result = Math.floor(Math.random() * 6) + 1;
      const won = guess === result;

      const message = `
🎲 *JOGO DE DADOS*

🎯 *Sua aposta:* ${guess}
🎲 *Resultado:* ${result}

${won ? "🎉 *VOCÊ ACERTOU!*" : "❌ *Você errou!*"}
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: message });
    } catch (error) {
      console.error("Erro no comando dice:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro no jogo. Tente novamente.",
      });
    }
  },
}; 