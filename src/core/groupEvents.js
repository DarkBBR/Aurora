import fetch from "node-fetch";
import userManager from "../utils/userManager.js";

const welcomeCache = new Map();
const CACHE_TIME = 60000;

export async function handleGroupEvents(sock, update) {
  try {
    if (!update.participants?.length) return;

    const groupId = update.id;

    for (const participant of update.participants) {
      const { id: userId, action } = participant;

      if (action === "add") {
        await handleWelcome(sock, groupId, userId);
      } else if (action === "remove") {
        await handleGoodbye(sock, groupId, userId);
      }
    }
  } catch (error) {
    console.error("Erro ao processar eventos de grupo:", error);
  }
}

async function handleWelcome(sock, groupId, userId) {
  try {
    console.log(
      `🎉 Processando boas-vindas para: ${userId} no grupo: ${groupId}`
    );

    const cacheKey = `${groupId}_${userId}`;
    const now = Date.now();
    const lastWelcome = welcomeCache.get(cacheKey) || 0;

    if (now - lastWelcome < CACHE_TIME) {
      console.log(`⏰ Boas-vindas em cooldown para: ${userId}`);
      return;
    }

    welcomeCache.set(cacheKey, now);

    const [groupInfo, userInfo] = await Promise.all([
      sock.groupMetadata(groupId),
      sock.contactAddOrGet(userId),
    ]);

    const groupName = groupInfo.subject;
    const userName = userInfo.notify || userInfo.name || "Usuário";
    const isRegistered = userManager.isRegistered(userId);
    const userData = isRegistered ? userManager.getUser(userId) : null;

    console.log(
      `📋 Grupo: ${groupName}, Usuário: ${userName}, Registrado: ${isRegistered}`
    );

    const welcomeImage = await generateWelcomeCanvas(
      sock,
      userName,
      groupName,
      isRegistered,
      userData,
      userId
    );

    if (welcomeImage) {
      const welcomeMessage = `
🎉 *BEM-VINDO(A) AO GRUPO!*

👤 *Nome:* ${userName}
📱 *Número:* ${userId.replace("@s.whatsapp.net", "")}
${
  isRegistered
    ? `📋 *Registrado:* Sim (${userData.name})`
    : "📋 *Registrado:* Não"
}

🌟 *Grupo:* ${groupName}
👥 *Total de membros:* ${groupInfo.participants.length}

${
  isRegistered
    ? `
💰 *Saldo:* R$ ${(userData.money || 0).toLocaleString("pt-BR")}
🎮 *Use:* !menu *para ver os comandos*
`
    : `
💡 *Registre-se para usar todos os recursos:*
!register [nome] [idade]
`
}

🤖 *Aurora Bot* - Seu assistente virtual!
      `.trim();

      await sock.sendMessage(groupId, {
        image: welcomeImage,
        caption: welcomeMessage,
        footer: "🤖 Aurora Bot • Sistema de Boas-vindas",
      });

      console.log(`✅ Mensagem de boas-vindas enviada com sucesso!`);
    } else {
      const fallbackMessage = `
🎉 *BEM-VINDO(A) AO GRUPO!*

👤 *Nome:* ${userName}
🌟 *Grupo:* ${groupName}

${
  isRegistered
    ? "✅ *Usuário registrado no sistema*"
    : "❌ *Usuário não registrado*"
}

🤖 *Aurora Bot* - Seu assistente virtual!
      `.trim();

      await sock.sendMessage(groupId, { text: fallbackMessage });
      console.log(`✅ Mensagem de fallback enviada`);
    }
  } catch (error) {
    console.error("❌ Erro ao processar boas-vindas:", error);
  }
}

async function handleGoodbye(sock, groupId, userId) {
  try {
    const userInfo = await sock.contactAddOrGet(userId);
    const userName = userInfo.notify || userInfo.name || "Usuário";

    const goodbyeMessage = `
👋 *ATÉ LOGO!*

👤 *Nome:* ${userName}
😔 *Saiu do grupo*

💬 *Esperamos que volte em breve!*
🤖 *Aurora Bot*
      `.trim();

    await sock.sendMessage(groupId, { text: goodbyeMessage });
  } catch (error) {
    console.error("Erro ao processar despedida:", error);
  }
}

export async function generateWelcomeCanvas(
  sock,
  userName,
  groupName,
  isRegistered,
  userData,
  userId
) {
  try {
    const apiKey = process.env.SPIDERX_API_KEY;

    if (!apiKey) {
      console.log("API Key da SpiderX não configurada");
      return null;
    }

    const title = userName;
    const description = isRegistered
      ? `Bem-vindo(a) ao ${groupName}! Você já está registrado no sistema.`
      : `Bem-vindo(a) ao ${groupName}! Registre-se para usar todos os recursos.`;

    let imageUrl = "";
    try {
      const ppUrl = await sock.profilePictureUrl(userId, "image");
      imageUrl = ppUrl;
      console.log(`✅ Foto do perfil obtida: ${ppUrl}`);
    } catch (error) {
      console.log(`❌ Erro ao obter foto do perfil: ${error.message}`);
      imageUrl =
        "https://i.ibb.co/MXSjP3d/8915de7c41f37d9d720b6c2002440e5a.jpg";
    }

    const apiUrl = new URL("https://api.spiderx.com.br/api/canvas/welcome");
    apiUrl.searchParams.append("api_key", apiKey);
    apiUrl.searchParams.append("title", title);
    apiUrl.searchParams.append("description", description);
    apiUrl.searchParams.append("image_url", imageUrl);

    console.log(`🎨 Gerando canvas com imagem: ${imageUrl}`);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`API retornou status ${response.status}`);
    }

    const imageBuffer = await response.buffer();
    console.log(`✅ Canvas gerado com sucesso!`);
    return imageBuffer;
  } catch (error) {
    console.error("Erro ao gerar canvas de boas-vindas:", error);
    return null;
  }
}
