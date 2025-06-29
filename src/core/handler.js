import { loadCommands } from "../utils/commandLoader.js";
import userManager from "../utils/userManager.js";
import { downloadContentFromMessage } from "anju-xpro-baileys";
import fetch from "node-fetch";
import { processarTentativaForca } from "../commands/jogos/forca.js";
import { RESTRICTED_MESSAGE } from "../utils/helpers.js";

let commands = null;
const commandCooldowns = new Map();
const COOLDOWN_TIME = 1000;

async function initializeCommands() {
  if (!commands) {
    commands = await loadCommands();
  }
  return commands;
}

async function detectTextInImage(mediaBuffer) {
  try {
    const base64Image = mediaBuffer.toString("base64");
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        apikey: "K81724188988957",
        base64Image,
        language: "por",
        isOverlayRequired: false,
        filetype: "jpg",
        detectOrientation: false,
        scale: true,
        OCREngine: 2,
      }),
    });

    const data = await response.json();
    return data.ParsedResults?.[0]?.ParsedText?.toLowerCase() || null;
  } catch (error) {
    console.log("Erro ao detectar texto na imagem:", error.message);
    return null;
  }
}

const publicCommands = [
  "register",
  "registro",
  "registrar",
  "cancel",
  "cancelar",
  "menu",
  "help",
  "botinfo",
  "info",
  "about",
  "bot",
  "test",
  "teste",
  "testapi",
  "user",
  "me",
  "usuario",
  "perfil",
  "profile",
  "chat",
  "ai",
  "gemini",
  "gpt",
  "pergunta",
  "imaginest",
  "imagine",
  "img",
  "imagem",
  "sd",
  "imaginepixart",
  "pixart",
  "pix",
  "art",
  "play",
  "playvideo",
  "video",
  "vplay",
  "v",
  "tiktok",
  "tt",
  "tik",
  "8ball",
  "bola8",
  "8",
  "magic8ball",
  "coinflip",
  "cara",
  "coroa",
  "moeda",
  "flip",
  "dice",
  "dado",
  "dados",
  "roll",
  "forca",
  "hangman",
  "jogo",
  "palavra",
  "minerar",
  "mine",
  "mining",
  "escavar",
  "trabalhar",
  "work",
  "job",
  "trabalho",
  "treinar",
  "train",
  "training",
  "preparar",
  "assaltar",
  "rob",
  "steal",
  "roubar",
  "saldo",
  "money",
  "dinheiro",
  "balance",
  "testwelcome",
  "testw",
  "testarwelcome",
  "testprofile",
  "testpp",
  "testarperfil",
];

export async function handleMessage(sock, msg, config) {
  try {
    if (!commands) commands = await initializeCommands();

    const sender = msg.key.participant || msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!text) return;

    if (!text.startsWith(config.prefix)) {
      const isForcaTentativa = await processarTentativaForca(sock, msg, config);
      if (isForcaTentativa) return;
    }

    if (!text.startsWith(config.prefix)) return;

    const args = text.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    if (!commandName) return;

    const cooldownKey = `${sender}_${commandName}`;
    const now = Date.now();
    const lastExecution = commandCooldowns.get(cooldownKey) || 0;

    if (now - lastExecution < COOLDOWN_TIME) return;
    commandCooldowns.set(cooldownKey, now);

    const isStickerCommand =
      msg.message?.imageMessage?.caption?.trim() === "!s" ||
      msg.message?.videoMessage?.caption?.trim() === "!s";

    if (isStickerCommand) {
      if (!userManager.isRegistered(sender)) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: RESTRICTED_MESSAGE,
        });
        return;
      }
      const stickerCommand = commands["s"];
      if (stickerCommand) {
        await stickerCommand.execute(sock, msg, [], config);
        return;
      }
    }

    if (!text && msg.message?.imageMessage) {
      try {
        if (!userManager.isRegistered(sender)) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: RESTRICTED_MESSAGE,
          });
          return;
        }

        let mediaBuffer = Buffer.alloc(0);
        const stream = await downloadContentFromMessage(
          msg.message.imageMessage,
          "image"
        );
        for await (const chunk of stream) {
          mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
        }

        const detectedText = await detectTextInImage(mediaBuffer);
        if (detectedText) {
          const matchWithText = detectedText.match(/!s\s+(.+)/);
          const matchOnlyS = detectedText.match(/^!s\s*$/);

          if (matchWithText || matchOnlyS) {
            console.log(
              `Comando !s detectado automaticamente na imagem: "${detectedText}"`
            );
            const stickerCommand = commands["s"];
            if (stickerCommand) {
              const args = matchWithText ? [matchWithText[1].trim()] : [];
              await stickerCommand.execute(sock, msg, args, config);
              return;
            }
          }
        }
      } catch (error) {
        console.log("Erro na detecção automática de imagem:", error.message);
      }
    }

    if (
      !publicCommands.includes(commandName) &&
      !userManager.isRegistered(sender)
    ) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: RESTRICTED_MESSAGE,
      });
      return;
    }

    const command = commands[commandName];
    if (command) {
      try {
        await command.execute(sock, msg, args, config);
      } catch (error) {
        console.error(
          `[handler] Erro ao executar comando ${commandName}:`,
          error
        );
        await sock.sendMessage(msg.key.remoteJid, {
          text: `❌ *Erro ao executar o comando ${commandName}*\n\n🔧 *Detalhes:* ${error.message}`,
        });
      }
    } else {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ *Comando não encontrado:* ${config.prefix}${commandName}\n\n💡 *Use:* ${config.prefix}menu *para ver os comandos disponíveis*`,
      });
    }

    if (msg.message?.buttonsResponseMessage?.selectedButtonId === "menu_dono") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🌟 *AURORA BOT - GITHUB* 🌟\n\n⭐ *Dê uma starzinha no nosso repositório!*\n\n🔗 *Link:* https://github.com/ArthurSilvaDev/Aurora-Bot-Wa\n\n💖 *Seu apoio é muito importante para nós!*",
      });
    }
  } catch (error) {
    console.error("[handler] Erro ao processar mensagem:", error);
  }
}
