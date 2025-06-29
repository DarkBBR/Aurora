export default {
  name: "ping",
  aliases: ["latencia", "pong"],
  description: "Mostra o tempo de resposta do bot.",
  async execute(sock, msg, args, config) {
    const start = Date.now();
    const sent = await sock.sendMessage(msg.key.remoteJid, {
      text: "🏓 Pingando...",
    });
    const latency = Date.now() - start;
    await sock.sendMessage(msg.key.remoteJid, {
      text: `🏓 Pong! Latência: ${latency}ms`,
    });
  },
};
