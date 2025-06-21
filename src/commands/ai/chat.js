import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "chat",
  aliases: ["ai", "gemini", "conversa", "pergunta"],
  description: "Converse com a inteligência artificial Gemini",
  async execute(sock, msg, args, commands, config) {
    try {
      // Verificar se foi fornecido um texto
      if (!args.length) {
        const helpText = Formatter.card(
          "🤖 Chat com IA",
          `${Formatter.info("Como usar:")}\n` +
          `${Formatter.bold("!chat")} sua pergunta aqui\n\n` +
          `${Formatter.info("Exemplos:")}\n` +
          `• ${Formatter.code("!chat Como fazer um bolo?")}\n` +
          `• ${Formatter.code("!ai Explique a fotossíntese")}\n` +
          `• ${Formatter.code("!gemini Conte uma piada")}\n\n` +
          `${Formatter.success("💡 Você pode usar qualquer um dos aliases: chat, ai, gemini, conversa, pergunta")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }

      // Obter o texto da pergunta
      const question = args.join(" ");
      const apiKey = process.env.GEMINI_API_KEY || "D0wgubPHthjiOv8DxshC";

      // Enviar mensagem de "digitando..."
      await sock.presenceSubscribe(msg.key.remoteJid);
      await sock.sendPresenceUpdate("composing", msg.key.remoteJid);

      // Fazer requisição para a API do Gemini
      const response = await fetch(`https://api.spiderx.com.br/api/ai/gemini?api_key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: question
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error("Resposta inválida da API");
      }

      // Formatar a resposta
      const responseText = Formatter.card(
        "🤖 Resposta da IA",
        `${Formatter.bold("Sua pergunta:")}\n${Formatter.italic(question)}\n\n` +
        `${Formatter.bold("Resposta:")}\n${data.response}\n\n` +
        `${Formatter.info("💡 Powered by Gemini AI")}`
      );

      // Parar o status de "digitando..."
      await sock.sendPresenceUpdate("paused", msg.key.remoteJid);

      // Enviar a resposta
      await sock.sendMessage(msg.key.remoteJid, { text: responseText });

    } catch (error) {
      console.error("Erro no comando chat:", error);
      
      const errorText = Formatter.card(
        "❌ Erro no Chat",
        `${Formatter.error("Ocorreu um erro ao processar sua pergunta:")}\n\n` +
        `${Formatter.code(error.message)}\n\n` +
        `${Formatter.info("💡 Tente novamente em alguns instantes ou verifique se a API está funcionando")}`
      );

      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 