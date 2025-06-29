import userManager from "../../utils/userManager.js";

export default {
  name: "assaltar",
  aliases: ["rob", "steal", "roubar"],
  description: "Assalte outros jogadores!",
  async execute(sock, msg, args, config) {
    try {
      const userId = msg.key.participant || msg.key.remoteJid;
      const userName = msg.pushName || "Jogador";

      // Verificar se o usuário está registrado
      if (!userManager.isRegistered(userId)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Você precisa se registrar para assaltar!*\n\n💡 *Use:* !register [nome] [idade]"
        });
        return;
      }

      // Verificar se mencionou alguém
      if (!args[0]) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎭 *Como assaltar:*\n\n*${config.prefix}assaltar @usuario*\n\n💡 *Exemplo:* ${config.prefix}assaltar @João\n\n⚠️ *Você precisa treinar primeiro!*`
        });
        return;
      }

      // Reagir à mensagem
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: "🎭",
          key: msg.key,
        },
      });

      // Verificar cooldown (30 minutos)
      const user = userManager.getUser(userId);
      const now = Date.now();
      const lastRobbery = user.lastRobbery || 0;
      const cooldown = 30 * 60 * 1000; // 30 minutos em ms

      if (now - lastRobbery < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastRobbery)) / 1000 / 60);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `⏰ *Aguarde ${remaining} minutos para assaltar novamente!*\n\n💡 *Assaltos têm cooldown de 30 minutos.*`
        });
        return;
      }

      // Verificar se está preso
      if (user.isJailed && user.jailTime > now) {
        const remainingJail = Math.ceil((user.jailTime - now) / 1000 / 60);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🚔 *Você está preso por mais ${remainingJail} minutos!*\n\n💡 *Aguarde para ser solto.*`
        });
        return;
      }

      // Verificar habilidade mínima
      const robberySkill = user.robberySkill || 0;
      if (robberySkill < 5) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Habilidade insuficiente!*\n\n🎯 *Sua habilidade:* ${robberySkill}\n📈 *Habilidade necessária:* 5\n\n💡 *Use ${config.prefix}treinar para melhorar suas habilidades!*`
        });
        return;
      }

      // Extrair ID do usuário mencionado
      let targetId = args[0];
      if (targetId.startsWith('@')) {
        targetId = targetId.slice(1);
      }

      // Verificar se o alvo existe e está registrado
      if (!userManager.isRegistered(targetId)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Usuário não encontrado ou não registrado!*\n\n💡 *Mencione um usuário válido.*"
        });
        return;
      }

      // Verificar se não está tentando assaltar a si mesmo
      if (targetId === userId) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Você não pode assaltar a si mesmo!*\n\n💡 *Mencione outro usuário.*"
        });
        return;
      }

      const targetUser = userManager.getUser(targetId);
      const targetMoney = targetUser.money || 0;

      // Verificar se o alvo tem dinheiro
      if (targetMoney < 100) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Este usuário não tem dinheiro suficiente para assaltar!*\n\n💡 *O mínimo é R$ 100.*"
        });
        return;
      }

      // Enviar mensagem de preparação
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🎭 *Preparando o assalto...*"
      });

      // Simular tempo de assalto
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Calcular chance de sucesso baseada na habilidade
      const baseChance = Math.min(0.8, robberySkill / 100); // Máximo 80%
      const random = Math.random();
      const success = random <= baseChance;

      // Atualizar dados do usuário
      user.lastRobbery = now;
      user.robberyCount = (user.robberyCount || 0) + 1;

      if (success) {
        // Assalto bem-sucedido
        const stealPercentage = Math.min(0.3, robberySkill / 200); // Máximo 30%
        const stolenAmount = Math.floor(targetMoney * stealPercentage);
        const actualStolen = Math.max(100, Math.min(stolenAmount, targetMoney * 0.3)); // Mínimo 100, máximo 30%

        // Transferir dinheiro
        user.money = (user.money || 0) + actualStolen;
        user.totalStolen = (user.totalStolen || 0) + actualStolen;
        
        targetUser.money = targetMoney - actualStolen;
        targetUser.totalStolenFrom = (targetUser.totalStolenFrom || 0) + actualStolen;

        // Salvar ambos os usuários
        userManager.registerUser(userId, user);
        userManager.registerUser(targetId, targetUser);

        const response = `
🎭 *ASSALTO BEM-SUCEDIDO!*

💰 *Roubado:* R$ ${actualStolen.toLocaleString('pt-BR')}
🎯 *Vítima:* ${targetUser.name || 'Usuário'}
💵 *Seu saldo:* R$ ${user.money.toLocaleString('pt-BR')}
📊 *Total roubado:* R$ ${user.totalStolen.toLocaleString('pt-BR')}

🎭 *Assaltos:* ${user.robberyCount}
⏰ *Próximo assalto em 30 minutos*
        `.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: response });

      } else {
        // Assalto falhou
        const failureResults = [
          { chance: 0.30, message: "🚔 *POLÍCIA!* Você foi preso!", jailTime: 60, fine: 1000 },
          { chance: 0.25, message: "💥 *ALARME!* Sistema de segurança ativado!", jailTime: 30, fine: 500 },
          { chance: 0.25, message: "👮 *SEGURANÇA!* Guarda te pegou!", jailTime: 20, fine: 300 },
          { chance: 0.20, message: "😵 *FALHA!* Você tropeçou e fugiu!", jailTime: 0, fine: 0 }
        ];

        const failRandom = Math.random();
        let cumulativeChance = 0;
        let failure = failureResults[0];

        for (const fail of failureResults) {
          cumulativeChance += fail.chance;
          if (failRandom <= cumulativeChance) {
            failure = fail;
            break;
          }
        }

        // Aplicar consequências
        if (failure.jailTime > 0) {
          user.isJailed = true;
          user.jailTime = now + (failure.jailTime * 60 * 1000);
        }

        if (failure.fine > 0) {
          user.money = Math.max(0, (user.money || 0) - failure.fine);
        }

        user.totalFines = (user.totalFines || 0) + failure.fine;
        userManager.registerUser(userId, user);

        const response = `
🎭 *ASSALTO FALHOU!*

${failure.message}

${failure.jailTime > 0 ? `🚔 *Preso por:* ${failure.jailTime} minutos` : ''}
${failure.fine > 0 ? `💰 *Multa:* R$ ${failure.fine.toLocaleString('pt-BR')}` : ''}

💵 *Seu saldo:* R$ ${user.money.toLocaleString('pt-BR')}
📊 *Total multas:* R$ ${user.totalFines.toLocaleString('pt-BR')}

🎭 *Assaltos:* ${user.robberyCount}
⏰ *Próximo assalto em 30 minutos*
        `.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: response });
      }

    } catch (error) {
      console.error("Erro no comando assaltar:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao assaltar. Tente novamente.",
      });
    }
  },
}; 