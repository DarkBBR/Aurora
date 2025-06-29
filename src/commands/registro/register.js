import userManager from "../../utils/userManager.js";
import { validateAge, validateName, ERROR_MESSAGE } from "../../utils/helpers.js";

export default {
  name: "register",
  aliases: ["registro", "registrar"],
  description: "Registrar-se no sistema Aurora Bot",
  async execute(sock, msg, args, config) {
    try {
      const userId = msg.key.participant || msg.key.remoteJid;

      if (userManager.isRegistered(userId)) {
        const userData = userManager.getUser(userId);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `✅ *Você já está registrado!*\n\n👤 Nome: *${userData.name}*\n📅 Data: *${userData.date}*\n\n🌟 Aproveite todos os recursos do Aurora Bot!`,
        });
        return;
      }

      if (args.length < 2) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🌟 *REGISTRO AURORA BOT* 🌟\n\n📋 *Como se registrar:*\n\n💡 *Use o comando:*\n*${config.prefix}register [nome] [idade]*\n\n📝 *Exemplos:*\n• ${config.prefix}register João Silva 25\n• ${config.prefix}register Maria Santos 30\n\n✨ *O registro é gratuito e rápido!*`,
        });
        return;
      }

      const age = parseInt(args[args.length - 1]);
      const name = args.slice(0, -1).join(" ");

      if (!validateName(name)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Nome muito curto!*\n\n👤 Digite um nome com pelo menos 2 caracteres.\n\n💡 Exemplo: ${config.prefix}register João Silva 25`,
        });
        return;
      }

      if (!validateAge(age)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Idade inválida!*\n\n📅 Digite uma idade válida entre 1 e 120 anos.\n\n💡 Exemplo: ${config.prefix}register João Silva 25`,
        });
        return;
      }

      const userData = {
        name,
        age,
        date: new Date().toLocaleDateString("pt-BR"),
        timestamp: Date.now(),
        money: 1000,
        totalMined: 0,
        totalWorked: 0,
        totalStolen: 0,
        totalStolenFrom: 0,
        mineCount: 0,
        workCount: 0,
        trainCount: 0,
        robberyCount: 0,
        robberySkill: 0,
        totalFines: 0,
        isJailed: false,
        jailTime: 0
      };

      userManager.registerUser(userId, userData);

      await sock.sendMessage(msg.key.remoteJid, {
        text: `🎉 *REGISTRO CONCLUÍDO COM SUCESSO!* 🎉\n\n👤 *Nome:* ${userData.name}\n🎂 *Idade:* ${userData.age} anos\n📅 *Data:* ${userData.date}\n💰 *Saldo inicial:* R$ 1.000\n\n🌟 *Bem-vindo ao Aurora Bot!*\n\n✨ *Agora você pode usar todos os recursos:*\n🤖 IA • 🎵 Músicas • 🎮 Jogos • 💰 Economia\n\n💡 *Use:* *${config.prefix}menu* *para começar!*`,
      });
    } catch (error) {
      console.error("Erro no comando register:", error);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
};
