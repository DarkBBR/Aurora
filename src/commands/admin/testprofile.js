export default {
  name: "testprofile",
  aliases: ["testpp", "testarperfil"],
  description: "Testar obtenção da foto do perfil (apenas admins)",
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
        text: "📸 *Testando obtenção da foto do perfil...*"
      });

      try {
        // Tentar obter foto do perfil do remetente
        const ppUrl = await sock.profilePictureUrl(sender, "image");
        
        console.log(`✅ Foto do perfil obtida: ${ppUrl}`);
        
        // Enviar a foto do perfil
        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: ppUrl },
          caption: `✅ *TESTE DE FOTO DO PERFIL*\n\n👤 *Usuário:* ${msg.pushName}\n📱 *Número:* ${sender.replace('@s.whatsapp.net', '')}\n🔗 *URL:* ${ppUrl}\n\n✅ *Foto obtida com sucesso!*`,
          footer: "🤖 Aurora Bot • Teste de Foto do Perfil"
        });
        
      } catch (error) {
        console.error(`❌ Erro ao obter foto do perfil: ${error.message}`);
        
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *ERRO AO OBTER FOTO DO PERFIL*\n\n👤 *Usuário:* ${msg.pushName}\n📱 *Número:* ${sender.replace('@s.whatsapp.net', '')}\n\n🔧 *Erro:* ${error.message}\n\n💡 *Possíveis causas:*\n• Usuário não tem foto de perfil\n• Configurações de privacidade\n• Problema de conexão`
        });
      }

    } catch (error) {
      console.error("Erro no comando testprofile:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao testar foto do perfil. Tente novamente.",
      });
    }
  },
}; 