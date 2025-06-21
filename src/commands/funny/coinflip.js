import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "coinflip",
  aliases: ["cf", "moeda", "caraoucoroa"],
  description: "Joga cara ou coroa",
  async execute(sock, msg, args, commands, config) {
    try {
      const result = Math.random() < 0.5 ? "cara" : "coroa";
      const emoji = result === "cara" ? "🪙" : "🪙";
      
      const coinText = Formatter.card(
        "🪙 Cara ou Coroa",
        `${Formatter.bold("Resultado:")} ${result.toUpperCase()}\n\n` +
        `${emoji} ${result === "cara" ? "Cara!" : "Coroa!"}\n\n` +
        `${Formatter.info("💡 Use")} ${Formatter.code(config.prefix + "coinflip")} ${Formatter.info("para jogar novamente")}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: coinText });
      
    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro ao jogar cara ou coroa.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 