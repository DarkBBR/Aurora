import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "ping",
  aliases: ["p"],
  description: "Testa a latência do bot",
  async execute(sock, msg, args, commands, config) {
    const startTime = Date.now();
    
    const pingText = Formatter.card(
      "🏓 Pong!",
      `${Formatter.success("Bot está online!")}\n\n` +
      `${Formatter.bold("Latência:")} ${Date.now() - startTime}ms\n` +
      `${Formatter.bold("Status:")} ✅ Funcionando\n\n` +
      `${Formatter.info("💡 Use este comando para verificar se o bot está respondendo")}`
    );
    
    await sock.sendMessage(msg.key.remoteJid, { text: pingText });
  },
}; 