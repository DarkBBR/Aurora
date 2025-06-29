import userManager from "../../utils/userManager.js";
import { formatCurrency, ERROR_MESSAGE } from "../../utils/helpers.js";

export default {
  name: "saldo",
  aliases: ["money", "dinheiro", "balance"],
  description: "Ver seu saldo atual",
  async execute(sock, msg, args, config) {
    try {
      const userId = msg.key.participant || msg.key.remoteJid;

      if (!userManager.isRegistered(userId)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Você não está registrado!*\n\n🌟 *Para se registrar, use:*\n*${config.prefix}register [nome] [idade]*`,
        });
        return;
      }

      const userData = userManager.getUser(userId);
      const balance = userData.money || 0;

      const balanceMessage = `
💰 *SEU SALDO*

💳 *Saldo atual:* R$ ${formatCurrency(balance)}

📊 *Estatísticas:*
• Total minerado: R$ ${formatCurrency(userData.totalMined || 0)}
• Total trabalhado: R$ ${formatCurrency(userData.totalWorked || 0)}
• Total roubado: R$ ${formatCurrency(userData.totalStolen || 0)}
• Total perdido: R$ ${formatCurrency(userData.totalStolenFrom || 0)}

💡 *Comandos para ganhar:*
• ${config.prefix}minerar - Minerar dinheiro
• ${config.prefix}trabalhar - Trabalhar
• ${config.prefix}assaltar - Assaltar outros
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: balanceMessage });
    } catch (error) {
      console.error("Erro no comando saldo:", error);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
}; 