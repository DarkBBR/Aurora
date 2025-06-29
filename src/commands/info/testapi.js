export default {
  name: "testapi",
  aliases: ["testapi"],
  description: "Testa se a API key está sendo carregada corretamente.",
  async execute(sock, msg, args, config) {
    try {
      const apiKey = config.spiderxApiKey;
      
      const testMessage = `
🧪 *TESTE DA API KEY*

🔑 *Status da API Key:*
• Carregada: ${apiKey ? "✅ Sim" : "❌ Não"}
• Tamanho: ${apiKey ? apiKey.length : 0} caracteres
• Primeiros 10 chars: ${apiKey ? apiKey.substring(0, 10) + "..." : "N/A"}

📋 *Configuração:*
• Prefixo: ${config.prefix}
• Bot Name: ${config.botName}

💡 *Se a API key não estiver carregada, verifique:*
• Arquivo .env existe
• Variável SPIDERX_API_KEY está definida
• Valor da API key está correto
      `.trim();
      
      await sock.sendMessage(msg.key.remoteJid, { text: testMessage });
      
    } catch (error) {
      console.error("Erro no comando testapi:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro ao testar API key.",
      });
    }
  },
}; 