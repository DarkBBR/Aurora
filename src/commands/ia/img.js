import fetch from 'node-fetch';

export default {
  name: "imaginest",
  aliases: ["imagine", "img", "imagem", "sd"],
  description: "Gera imagens usando Stable Diffusion Turbo.",
  async execute(sock, msg, args, config) {
    try {
      // Verificar se foi fornecido um texto
      if (args.length === 0) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🎨 *Como usar:*\n\n*${config.prefix}imaginest [descrição da imagem]*\n\n📝 *Exemplos:*\n${config.prefix}imaginest A beautiful butterfly\n${config.prefix}imaginest A cat playing with a ball\n${config.prefix}imaginest A futuristic city at night\n\n💡 *Dica:* Use descrições em inglês para melhores resultados!`,
        });
        return;
      }

      const prompt = args.join(" ");
      
      // Enviar mensagem de processamento
      const processingMsg = await sock.sendMessage(msg.key.remoteJid, {
        text: `🎨 *Gerando imagem...*\n\n📝 *Prompt:* ${prompt}\n\n⏳ *Aguarde, isso pode levar alguns segundos...*`,
      });

      // Fazer requisição para a API da SpiderX
      const response = await fetch(`https://api.spiderx.com.br/api/ai/stable-diffusion-turbo?search=${encodeURIComponent(prompt)}&api_key=${config.spiderxApiKey}`);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.image) {
        throw new Error("Imagem não gerada pela API");
      }

      // Enviar imagem gerada
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: data.image },
        caption: `🎨 *IMAGEM GERADA*\n\n📝 *Prompt:* ${prompt}\n\n🤖 *Gerado por:* Stable Diffusion Turbo\n\n💡 *Dica:* Use *${config.prefix}imaginepixart* para outro estilo de imagem!`,
        footer: "🤖 Aurora Bot • IA de Imagens",
      });

    } catch (error) {
      console.error("Erro no comando imaginest:", error);
      
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ *Erro ao gerar imagem*\n\n🔧 *Possíveis causas:*\n• Prompt muito longo ou inadequado\n• Problema na API\n• Serviço temporariamente indisponível\n\n💡 *Tente novamente com um prompt diferente.*",
      });
    }
  },
}; 