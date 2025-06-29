import userManager from "../../utils/userManager.js";

export default {
  name: "treinar",
  aliases: ["train", "training", "preparar"],
  description: "Treine para assaltos!",
  async execute(sock, msg, args, config) {
    try {
      const userId = msg.key.participant || msg.key.remoteJid;
      const userName = msg.pushName || "Jogador";

      // Verificar se o usuário está registrado
      if (!userManager.isRegistered(userId)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Você precisa se registrar para treinar!*\n\n💡 *Use:* !register [nome] [idade]"
        });
        return;
      }

      // Reagir à mensagem
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "🏋️",
          key: msg.key,
        },
      });

      // Verificar cooldown (15 minutos)
      const user = userManager.getUser(userId);
      const now = Date.now();
      const lastTrain = user.lastTrain || 0;
      const cooldown = 15 * 60 * 1000; // 15 minutos em ms

      if (now - lastTrain < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastTrain)) / 1000 / 60);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `⏰ *Aguarde ${remaining} minutos para treinar novamente!*\n\n💡 *Treino tem cooldown de 15 minutos.*`
        });
        return;
      }

      // Enviar mensagem de preparação
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🏋️ *Iniciando treino...*"
      });

      // Simular tempo de treino
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Sistema de treino com diferentes resultados
      const trainings = [
        { chance: 0.05, skill: 5, message: "🏆 *TREINO PERFEITO!* Você se tornou um mestre!" },
        { chance: 0.10, skill: 4, message: "💪 *TREINO EXCELENTE!* Muito bem treinado!" },
        { chance: 0.15, skill: 3, message: "💪 *TREINO BOM!* Você melhorou bastante!" },
        { chance: 0.20, skill: 2, message: "💪 *TREINO REGULAR!* Alguma melhoria!" },
        { chance: 0.25, skill: 1, message: "💪 *TREINO BÁSICO!* Pouca melhoria!" },
        { chance: 0.15, skill: 0, message: "😴 *TREINO RUIM!* Você se distraiu!" },
        { chance: 0.10, skill: -1, message: "🤕 *LESÃO!* Você se machucou no treino!" }
      ];

      // Calcular resultado baseado em probabilidade
      const random = Math.random();
      let cumulativeChance = 0;
      let result = trainings[0];

      for (const training of trainings) {
        cumulativeChance += training.chance;
        if (random <= cumulativeChance) {
          result = training;
          break;
        }
      }

      // Atualizar dados do usuário
      const currentSkill = user.robberySkill || 0;
      const newSkill = Math.max(0, currentSkill + result.skill); // Não pode ser negativo
      
      user.robberySkill = newSkill;
      user.lastTrain = now;
      user.totalTraining = (user.totalTraining || 0) + result.skill;
      user.trainCount = (user.trainCount || 0) + 1;

      userManager.registerUser(userId, user);

      // Determinar nível de habilidade
      const skillLevel = newSkill < 10 ? "Iniciante" :
                        newSkill < 25 ? "Aprendiz" :
                        newSkill < 50 ? "Experiente" :
                        newSkill < 100 ? "Profissional" :
                        newSkill < 200 ? "Mestre" : "Lendário";

      // Enviar resultado
      const response = `
🏋️ *TREINO CONCLUÍDO*

${result.message}

${result.skill > 0 ? `📈 *Habilidade +${result.skill}` : result.skill < 0 ? `📉 *Habilidade ${result.skill}` : '📊 *Sem mudança*'}

🎯 *Nível atual:* ${skillLevel} (${newSkill})
📊 *Total treinado:* ${user.totalTraining}
🏋️ *Treinos:* ${user.trainCount}

💡 *Use !assaltar para testar suas habilidades!*
⏰ *Próximo treino em 15 minutos*
      `.trim();

      await sock.sendMessage(msg.key.remoteJid, { text: response });

    } catch (error) {
      console.error("Erro no comando treinar:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao treinar. Tente novamente.",
      });
    }
  },
}; 