import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "8ball",
  aliases: ["bola8", "magic8ball"],
  description: "Faz uma pergunta para a bola 8 mágica",
  async execute(sock, msg, args, commands, config) {
    try {
      if (args.length === 0) {
        const helpText = Formatter.card(
          "🎱 Bola 8 Mágica",
          `${Formatter.info("Faça uma pergunta para a bola 8 mágica:")}\n\n` +
          `${Formatter.bold("Exemplo:")}\n` +
          `• ${Formatter.code(config.prefix + "8ball Vou passar na prova?")}\n` +
          `• ${Formatter.code(config.prefix + "8ball O bot é legal?")}\n\n` +
          `${Formatter.info("💡 A bola 8 mágica responderá sua pergunta!")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }
      
      const question = args.join(" ");
      const answers = [
        "É certo que sim! ✨",
        "É decididamente assim! 🎯",
        "Sem dúvida! 💫",
        "Sim, definitivamente! 🌟",
        "Você pode contar com isso! 🔮",
        "Como eu vejo, sim! 👁️",
        "Muito provavelmente! 🎲",
        "Perspectiva boa! 🌈",
        "Sim! 🎉",
        "Sinais apontam para sim! 🔮",
        "Resposta nebulosa, tente novamente! ☁️",
        "Pergunte novamente mais tarde! ⏰",
        "Melhor não te dizer agora! 🤐",
        "Não é possível prever agora! 🔮",
        "Concentre-se e pergunte novamente! 🧘",
        "Não conte com isso! ❌",
        "Minha resposta é não! 🚫",
        "Minhas fontes dizem não! 📰",
        "Perspectiva não muito boa! 😔",
        "Muito duvidoso! 🤔"
      ];
      
      const result = answers[Math.floor(Math.random() * answers.length)];
      
      const ballText = Formatter.card(
        "🎱 Bola 8 Mágica",
        `${Formatter.bold("Pergunta:")}\n` +
        `"${question}"\n\n` +
        `${Formatter.bold("Resposta:")}\n` +
        `${result}\n\n` +
        `${Formatter.info("💡 Use")} ${Formatter.code(config.prefix + "8ball")} ${Formatter.info("para fazer outra pergunta")}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: ballText });
      
    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro",
        `${Formatter.error("Erro na bola 8 mágica.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 