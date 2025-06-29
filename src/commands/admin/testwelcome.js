import { generateWelcomeCanvas } from "../../core/groupEvents.js";

export default {
  name: "testwelcome",
  aliases: ["testw", "testarwelcome"],
  description: "Testar o sistema de boas-vindas (apenas admins)",
  async execute(sock, msg, args, config) {
    try {
      const sender = msg.key.participant || msg.key.remoteJid;
      
      // Lista de administradores
      const admins = [
        "5514998651913@s.whatsapp.net", // Arthur
      ];

      if (!admins.includes(sender)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Comando restrito a administradores!*"
        });
        return;
      }

      // Verificar se é um grupo
      if (!msg.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Este comando só funciona em grupos!*"
        });
        return;
      }

      await sock.sendMessage(msg.key.remoteJid, {
        text: "🎨 *Gerando canvas de boas-vindas de teste...*"
      });

      // Simular dados de teste
      const testUserName = "Usuário Teste";
      const testGroupName = "Grupo de Teste";
      const testIsRegistered = true;
      const testUserData = {
        name: "João Silva",
        money: 5000
      };
      const testUserId = sender;

      // Gerar canvas
      const welcomeImage = await generateWelcomeCanvas(
        sock, 
        testUserName, 
        testGroupName, 
        testIsRegistered, 
        testUserData, 
        testUserId
      );

      if (welcomeImage) {
        const testMessage = `
🎉 *TESTE DE BOAS-VINDAS*

👤 *Nome:* ${testUserName}
🌟 *Grupo:* ${testGroupName}
📋 *Registrado:* Sim (${testUserData.name})
💰 *Saldo:* R$ ${testUserData.money.toLocaleString('pt-BR')}

✅ *Canvas gerado com sucesso!*
🤖 *Aurora Bot* - Sistema de Boas-vindas
        `.trim();

        await sock.sendMessage(msg.key.remoteJid, {
          image: welcomeImage,
          caption: testMessage,
          footer: "🤖 Aurora Bot • Teste de Boas-vindas"
        });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *Erro ao gerar canvas de boas-vindas!*\n\n💡 *Verifique se a API Key da SpiderX está configurada.*"
        });
      }

    } catch (error) {
      console.error("Erro no comando testwelcome:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao testar boas-vindas. Tente novamente.",
      });
    }
  },
}; 