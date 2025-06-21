import { Formatter } from "../../utils/Formatter.js";
import fetch from "node-fetch";

export default {
  name: "image",
  aliases: ["img", "generate", "ai", "art"],
  description: "Gera imagens usando IA (Stable Diffusion Turbo ou Pixart)",
  async execute(sock, msg, args, commands, config) {
    try {
      // Verificar se foi fornecido um texto
      if (args.length === 0) {
        const helpText = Formatter.card(
          "🎨 Comando Image",
          `${Formatter.info("Para gerar imagens usando IA:")}\n\n` +
          `${Formatter.bold("Uso:")}\n` +
          `• ${Formatter.code(config.prefix + "image <texto>")}\n` +
          `• ${Formatter.code(config.prefix + "image sd <texto>")} (Stable Diffusion)\n` +
          `• ${Formatter.code(config.prefix + "image pixart <texto>")} (Pixart)\n\n` +
          `${Formatter.bold("Exemplos:")}\n` +
          `• ${Formatter.code(config.prefix + "image um gato fofo")}\n` +
          `• ${Formatter.code(config.prefix + "image sd uma paisagem bonita")}\n` +
          `• ${Formatter.code(config.prefix + "image pixart a beautiful butterfly")}\n\n` +
          `${Formatter.info("💡 Gera imagens usando APIs de IA da SpiderX")}\n` +
          `${Formatter.info("🔤 Para Pixart, use textos em inglês para melhores resultados")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: helpText });
        return;
      }

      // Reagir à mensagem
      try {
        await sock.sendMessage(msg.key.remoteJid, {
          react: {
            text: "✅",
            key: msg.key,
          },
        });
      } catch (e) {
        // Ignorar erro de reação se não suportado
      }

      // Enviar mensagem de processamento
      await sock.sendMessage(msg.key.remoteJid, {
        text: Formatter.info("🎨 Gerando imagem..."),
      });

      try {
        const input = args.join(" ");
        const apiKey = process.env.SPIDERX_API_KEY || "D0wgubPHthjiOv8DxshC";
        let apiUrl;
        let modelName;

        // Verificar se o usuário especificou o modelo
        if (args[0].toLowerCase() === "sd" || args[0].toLowerCase() === "stable") {
          // Stable Diffusion Turbo
          const searchText = args.slice(1).join(" ");
          apiUrl = `https://api.spiderx.com.br/api/ai/stable-diffusion-turbo?search=${encodeURIComponent(searchText)}&api_key=${apiKey}`;
          modelName = "Stable Diffusion Turbo";
        } else if (args[0].toLowerCase() === "pixart" || args[0].toLowerCase() === "pix") {
          // Pixart
          const text = args.slice(1).join(" ");
          apiUrl = `https://api.spiderx.com.br/api/ai/pixart?text=${encodeURIComponent(text)}&api_key=${apiKey}`;
          modelName = "Pixart";
        } else {
          // Padrão: usar Stable Diffusion Turbo
          apiUrl = `https://api.spiderx.com.br/api/ai/stable-diffusion-turbo?search=${encodeURIComponent(input)}&api_key=${apiKey}`;
          modelName = "Stable Diffusion Turbo";
        }

        // Fazer requisição GET para a API SpiderX
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Aurora-Bot/1.0",
          },
          timeout: 60000, // 60 segundos de timeout (IA pode demorar)
        });

        if (!response.ok) {
          let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
          
          // Mensagens específicas para diferentes códigos de erro
          switch (response.status) {
            case 400:
              errorMessage = "Requisição inválida. Verifique se o texto está correto.";
              break;
            case 401:
              errorMessage = "Chave da API inválida. Configure sua chave no arquivo .env";
              break;
            case 403:
              errorMessage = "Acesso negado. Verifique sua chave da API.";
              break;
            case 404:
              errorMessage = "Serviço não encontrado.";
              break;
            case 429:
              errorMessage = "Limite de requisições excedido. Aguarde um pouco e tente novamente.";
              break;
            case 500:
              errorMessage = "Erro interno do servidor da API. Tente novamente em alguns minutos.";
              break;
            case 524:
              errorMessage = "Timeout na API. A geração demorou muito. Tente novamente.";
              break;
            default:
              errorMessage = `Erro na API (${response.status}): ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.image) {
          throw new Error(data.message || "Erro ao gerar imagem");
        }

        // Enviar mensagem de download
        await sock.sendMessage(msg.key.remoteJid, {
          text: Formatter.info("⬇️ Baixando imagem..."),
        });

        // Baixar a imagem
        const imageResponse = await fetch(data.image);
        if (!imageResponse.ok) {
          throw new Error("Erro ao baixar imagem");
        }

        const imageArrayBuffer = await imageResponse.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);

        // Verificar tamanho da imagem (limite do WhatsApp: 16MB)
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (imageBuffer.length > maxSize) {
          const errorText = Formatter.card(
            "❌ Imagem Muito Grande",
            `${Formatter.error("A imagem é muito grande para enviar.")}\n\n` +
            `${Formatter.bold("Tamanho:")} ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB\n` +
            `${Formatter.bold("Máximo:")} 16 MB\n\n` +
            `${Formatter.info("🔧 Tente gerar uma imagem com texto diferente")}`
          );
          
          await sock.sendMessage(msg.key.remoteJid, { text: errorText });
          return;
        }

        // Enviar imagem
        try {
          await sock.sendMessage(msg.key.remoteJid, {
            image: imageBuffer,
            caption: `🎨 ${modelName}\n\n` +
                     `📝 Prompt: ${input}\n` +
                     `📦 Tamanho: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB\n\n` +
                     `💡 Gerado via API SpiderX`,
          });
          
          console.log(`✅ Imagem gerada com sucesso: ${modelName} - ${input}`);
        } catch (sendError) {
          console.error("Erro ao enviar imagem:", sendError);
          throw new Error(`Erro ao enviar imagem: ${sendError.message}`);
        }

      } catch (processError) {
        const errorText = Formatter.card(
          "❌ Erro ao Processar",
          `${Formatter.error("Erro ao gerar imagem.")}\n\n` +
          `${Formatter.bold("Erro:")}\n` +
          `• ${Formatter.code(processError.message)}\n\n` +
          `${Formatter.info("🔧 Verifique se o texto está correto ou tente novamente")}`
        );
        
        await sock.sendMessage(msg.key.remoteJid, { text: errorText });
      }

    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro Interno",
        `${Formatter.error("Erro interno do comando.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 