import userManager from "../../utils/userManager.js";
import { formatCurrency, calculateDays, ERROR_MESSAGE } from "../../utils/helpers.js";

export default {
  name: "user",
  aliases: ["me", "usuario", "perfil", "profile"],
  description: "Ver informações do seu perfil",
  async execute(sock, msg, args, config) {
    try {
      const userId = msg.key.participant || msg.key.remoteJid;

      if (!userManager.isRegistered(userId)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Você não está registrado!*\n\n🌟 *Para se registrar, use:*\n*${config.prefix}register [nome] [idade]*\n\n💡 *Exemplo:* ${config.prefix}register João Silva 25`,
        });
        return;
      }

      const userData = userManager.getUser(userId);
      const daysRegistered = calculateDays(userData.timestamp);
      const status = userData.isJailed ? "🔒 Preso" : "✅ Livre";
      const jailInfo = userData.isJailed ? `\n⏰ *Tempo restante:* ${userData.jailTime} minutos` : "";

      const profileMessage = `
👤 *PERFIL DO USUÁRIO*

📋 *Informações Básicas:*
• Nome: *${userData.name}*
• Idade: *${userData.age} anos*
• Status: *${status}*
• Registrado em: *${userData.date}*
• Dias registrado: *${daysRegistered} dias*

💰 *Economia:*
• Saldo atual: *R$ ${formatCurrency(userData.money || 0)}*
• Total minerado: *R$ ${formatCurrency(userData.totalMined || 0)}*
• Total trabalhado: *R$ ${formatCurrency(userData.totalWorked || 0)}*
• Total roubado: *R$ ${formatCurrency(userData.totalStolen || 0)}*
• Total perdido em roubos: *R$ ${formatCurrency(userData.totalStolenFrom || 0)}*
• Total de multas: *R$ ${formatCurrency(userData.totalFines || 0)}*

📊 *Estatísticas:*
• Minerações: *${userData.mineCount || 0}*
• Trabalhos: *${userData.workCount || 0}*
• Treinos: *${userData.trainCount || 0}*
• Roubos: *${userData.robberyCount || 0}*
• Habilidade de roubo: *${userData.robberySkill || 0}%*${jailInfo}

🤖 *Aurora Bot* - Seu perfil completo!
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: profileMessage });
    } catch (error) {
      console.error("Erro no comando user:", error);
      await sock.sendMessage(msg.key.remoteJid, { text: ERROR_MESSAGE });
    }
  },
};
