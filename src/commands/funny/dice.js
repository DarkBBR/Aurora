import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "dice",
  aliases: ["dado", "roll"],
  description: "Joga um dado de 6 lados",
  async execute(sock, msg, args, commands, config) {
    try {
      const result = Math.floor(Math.random() * 6) + 1;
      const emoji = "🎲";
      
      const diceText = Formatter.card(
        "🎲 Dado",
        `${Formatter.bold("Resultado:")} ${result}\n\n` +
        `${emoji} Você tirou ${result}!\n\n` +
        `${Formatter.info("💡 Use")} ${Formatter.code(config.prefix + "dice")} ${Formatter.info("para jogar novamente")}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: diceText });
      
    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro ao jogar dado.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 