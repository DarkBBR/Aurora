import userManager from "../../utils/userManager.js";
import { getRandomInt, formatCurrency, ERROR_MESSAGE } from "../../utils/helpers.js";

const cooldowns = new Map();
const COOLDOWN_TIME = 5 * 60 * 1000;

const miningResults = [
  { chance: 0.6, min: 10, max: 50, message: "⛏️ *Mineração bem-sucedida!*\n\n💰 *Ganhou:* R$ {earned}\n💎 *Encontrou:* Pedras preciosas" },
  { chance: 0.85, min: 50, max: 100, message: "⛏️ *Ótima mineração!*\n\n💰 *Ganhou:* R$ {earned}\n💎 *Encontrou:* Ouro e diamantes" },
  { chance: 0.95, min: 100, max: 200, message: "⛏️ *Mineração excepcional!*\n\n💰 *Ganhou:* R$ {earned}\n💎 *Encontrou:* Esmeraldas raras" },
  { chance: 1.0, min: 300, max: 500, message: "⛏️ *MINERAÇÃO LEGENDÁRIA!*\n\n💰 *Ganhou:* R$ {earned}\n💎 *Encontrou:* Pedra filosofal!" }
];

export default {
  name: "minerar",
  aliases: ["mine", "mining", "escavar"],
  description: "Minerar dinheiro",
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
      const lastMining = cooldowns.get(userId) || 0;

      if (now - lastMining < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - (now - lastMining)) / 1000 / 60);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `⏰ *Aguarde ${remainingTime} minutos para minerar novamente!*`,
        });
        return;
      }

      const userData = userManager.getUser(userId);
      const miningChance = Math.random();
      
      const result = miningResults.find(r => miningChance < r.chance);
      const earned = getRandomInt(result.min, result.max);
      const message = result.message.replace('{earned}', earned);

      userData.money = (userData.money || 0) + earned;
      userData.totalMined = (userData.totalMined || 0) + earned;
      userData.mineCount = (userData.mineCount || 0) + 1;

      userManager.registerUser(userId, userData);
      cooldowns.set(userId, now);

      await sock.sendMessage(msg.key.remoteJid, {
        text: message + `\n\n💳 *Saldo atual:* R$ ${formatCurrency(userData.money)}`,
      });
    } catch (error) {
      console.error("Erro no comando minerar:", error);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
}; 