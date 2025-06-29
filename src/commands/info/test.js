export default {
  name: "test",
  aliases: ["teste"],
  description: "Comando de teste para verificar se o sistema está funcionando.",
  async execute(sock, msg, args, config) {
    try {
      console.log("[DEBUG] Comando test executado");
      await sock.sendMessage(msg.key.remoteJid, {
        text: "✅ *Teste funcionando!* O sistema de comandos está operacional.",
      });
    } catch (error) {
      console.error("Erro no comando test:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro no comando de teste.",
      });
    }
  },
}; 