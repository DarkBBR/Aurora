export default {
  name: "coinflip",
  aliases: ["cara", "coroa", "moeda", "flip"],
  description: "Jogo cara ou coroa",
  async execute(sock, msg, args, config) {
    try {
      const choice = args[0]?.toLowerCase();
      const validChoices = ["cara", "coroa"];
      
      if (!choice || !validChoices.includes(choice)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🪙 *CARA OU COROA*\n\n💡 *Como jogar:*\n*${config.prefix}coinflip [cara/coroa]*\n\n📝 *Exemplos:*\n• ${config.prefix}coinflip cara\n• ${config.prefix}coinflip coroa`,
        });
        return;
      }

      const result = Math.random() < 0.5 ? "cara" : "coroa";
      const won = choice === result;

      const message = `
🪙 *CARA OU COROA*

🎯 *Sua escolha:* ${choice}
🎲 *Resultado:* ${result}

${won ? "🎉 *VOCÊ GANHOU!*" : "❌ *Você perdeu!*"}
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: message });
    } catch (error) {
      console.error("Erro no comando coinflip:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro no jogo. Tente novamente.",
      });
    }
  },
}; 