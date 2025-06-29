import { getRandomChoice, ERROR_MESSAGE } from "../../utils/helpers.js";

const answers = [
  "É certo que sim", "É decididamente assim", "Sem dúvida", "Sim, definitivamente",
  "Você pode contar com isso", "Como eu vejo, sim", "Muito provavelmente",
  "Perspectiva boa", "Sim", "Sinais apontam que sim", "Resposta nebulosa, tente novamente",
  "Pergunte novamente mais tarde", "Melhor não te dizer agora", "Não é possível prever agora",
  "Concentre-se e pergunte novamente", "Não conte com isso", "Minha resposta é não",
  "Minhas fontes dizem não", "Perspectiva não muito boa", "Muito duvidoso"
];

export default {
  name: "8ball",
  aliases: ["bola8", "8", "magic8ball"],
  description: "Bola 8 mágica",
  async execute(sock, msg, args, config) {
    try {
      if (!args.length) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🔮 *BOLA 8 MÁGICA*\n\n💡 *Como usar:*\n*${config.prefix}8ball [pergunta]*\n\n📝 *Exemplos:*\n• ${config.prefix}8ball Vou ganhar na loteria?\n• ${config.prefix}8ball O Aurora Bot é incrível?`,
        });
        return;
      }

      const question = args.join(" ");
      const randomAnswer = getRandomChoice(answers);

      const message = `
🔮 *BOLA 8 MÁGICA*

❓ *Pergunta:* ${question}
🎱 *Resposta:* ${randomAnswer}
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: message });
    } catch (error) {
      console.error("Erro no comando 8ball:", error);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
}; 