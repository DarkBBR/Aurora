import fetch from "node-fetch";

export default {
  name: "chatgpt",
  aliases: ["chat", "ai", "gpt", "pergunta"],
  description: "Chat com IA",
  async execute(sock, msg, args, config) {
    try {
      if (!args.length) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🤖 *CHAT COM IA*\n\n💡 *Como usar:*\n*${config.prefix}chatgpt [pergunta]*\n\n📝 *Exemplos:*\n• ${config.prefix}chatgpt O que é inteligência artificial?\n• ${config.prefix}chatgpt Conte uma piada`,
        });
        return;
      }

      const question = args.join(" ");
      
      const response = await fetch("https://api.spiderx.com.br/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SPIDERX_API_KEY,
        },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
      }

      const data = await response.json();
      const answer = data.response || "Desculpe, não consegui processar sua pergunta.";

      const message = `
🤖 *CHAT COM IA*

❓ *Pergunta:* ${question}
🤖 *Resposta:* ${answer}
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: message });
    } catch (error) {
      console.error("Erro no comando chatgpt:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao processar pergunta. Tente novamente.",
      });
    }
  },
}; 