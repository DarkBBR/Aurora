import fetch from "node-fetch";

export default {
  name: "imaginepixart",
  aliases: ["pixart", "pix", "art"],
  description: "Gerar imagens com IA",
  async execute(sock, msg, args, config) {
    try {
      if (!args.length) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎨 *GERADOR DE IMAGENS*\n\n💡 *Como usar:*\n*${config.prefix}imaginepixart [descrição]*\n\n📝 *Exemplos:*\n• ${config.prefix}imaginepixart Um gato fofo\n• ${config.prefix}imaginepixart Paisagem de montanha`,
        });
        return;
      }

      const prompt = args.join(" ");

      const response = await fetch("https://api.spiderx.com.br/api/imagine/pixart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SPIDERX_API_KEY,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
      }

      const imageBuffer = await response.buffer();

      await sock.sendMessage(msg.key.remoteJid, {
        image: imageBuffer,
        caption: `🎨 *IMAGEM GERADA*\n\n📝 *Prompt:* ${prompt}\n🤖 *Gerado por:* PixArt AI`,
        footer: "🤖 Aurora Bot • Gerador de Imagens"
      });
    } catch (error) {
      console.error("Erro no comando imaginepixart:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao gerar imagem. Tente novamente.",
      });
    }
  },
}; 