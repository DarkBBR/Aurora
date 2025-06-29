import userManager from "../../utils/userManager.js";
import { getRandomInt, formatCurrency, ERROR_MESSAGE } from "../../utils/helpers.js";

const cooldowns = new Map();
const COOLDOWN_TIME = 10 * 60 * 1000;

const workResults = [
  { chance: 0.5, min: 20, max: 30, message: "💼 *Trabalho simples!*\n\n💰 *Ganhou:* R$ {earned}\n📋 *Tarefa:* Limpeza básica" },
  { chance: 0.8, min: 40, max: 60, message: "💼 *Bom trabalho!*\n\n💰 *Ganhou:* R$ {earned}\n📋 *Tarefa:* Atendimento ao cliente" },
  { chance: 0.95, min: 80, max: 100, message: "💼 *Excelente trabalho!*\n\n💰 *Ganhou:* R$ {earned}\n📋 *Tarefa:* Projeto especial" },
  { chance: 1.0, min: 150, max: 200, message: "💼 *TRABALHO EXCEPCIONAL!*\n\n💰 *Ganhou:* R$ {earned}\n📋 *Tarefa:* Direção executiva" }
];

export default {
  name: "trabalhar",
  aliases: ["work", "job", "trabalho"],
  description: "Trabalhar para ganhar dinheiro",
  async execute(sock, msg, args, config) {
    try {
      const userId = msg.key.participant || msg.key.remoteJid;

      if (!userManager.isRegistered(userId)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Você não está registrado!*\n\n🌟 *Para se registrar, use:*\n*${config.prefix}register [nome] [idade]*`,
        });
        return;
      }

      const now = Date.now();
      const lastWork = cooldowns.get(userId) || 0;

      if (now - lastWork < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastWork)) / 1000 / 60);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `⏰ *Aguarde ${remainingTime} minutos para trabalhar novamente!*`,
        });
        return;
      }

      const userData = userManager.getUser(userId);
      const workChance = Math.random();
      
      const result = workResults.find(r => workChance < r.chance);
      const earned = getRandomInt(result.min, result.max);
      const message = result.message.replace('{earned}', earned);

      userData.money = (userData.money || 0) + earned;
      userData.totalWorked = (userData.totalWorked || 0) + earned;
      userData.workCount = (userData.workCount || 0) + 1;

      userManager.registerUser(userId, userData);
      cooldowns.set(userId, now);

      await sock.sendMessage(msg.key.remoteJid, {
        text: message + `\n\n💳 *Saldo atual:* R$ ${formatCurrency(userData.money)}`,
      });
    } catch (error) {
      console.error("Erro no comando trabalhar:", error);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
}; 