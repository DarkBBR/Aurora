import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import colors from "colors";
import { CommandManager } from "./modules/CommandManager.js";
import { MessageHandler } from "./modules/MessageHandler.js";

// Configuração de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações
const config = {
  botName: process.env.BOT_NAME || "Aurora",
  prefix: process.env.BOT_PREFIX || "!",
  sessionPath: process.env.SESSION_PATH || "./src/sessions",
  ownerNumber: process.env.OWNER_NUMBER || "5514998651913",
};

// Garantir que a pasta de sessões existe
if (!fs.existsSync(config.sessionPath)) {
  fs.mkdirSync(config.sessionPath, { recursive: true });
}

// Sistema de logging colorido
const logger = {
  info: (msg) => console.log(colors.cyan(`[INFO] ${new Date().toISOString()} - ${msg}`)),
  error: (msg) => console.error(colors.red(`[ERROR] ${new Date().toISOString()} - ${msg}`)),
  warn: (msg) => console.warn(colors.yellow(`[WARN] ${new Date().toISOString()} - ${msg}`)),
  success: (msg) => console.log(colors.green(`[SUCESSO] ${msg}`)),
};

// Inicializar módulos
const commandManager = new CommandManager();
const messageHandler = new MessageHandler(commandManager, config, logger);

// Função principal para iniciar o bot
async function startBot() {
  try {
    logger.info("Iniciando bot de WhatsApp...");
    logger.info(`Pasta de sessões: ${config.sessionPath}`);

    // Carregar comandos
    await commandManager.loadCommands(logger);

    // Carregar estado de autenticação
    logger.info("Carregando estado de autenticação...");
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
    logger.info("Estado de autenticação carregado com sucesso!");

    // Criar conexão WhatsApp
    logger.info("Criando conexão WhatsApp...");
    const sock = makeWASocket({
      auth: state,
    });
    logger.info("Conexão WhatsApp criada!");

    // Evento de credenciais atualizadas
    sock.ev.on("creds.update", saveCreds);

    // Evento de conexão
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info("QR Code gerado. Escaneie com o WhatsApp:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error instanceof Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        logger.warn(
          `Conexão fechada devido a ${lastDisconnect?.error}, reconectando: ${shouldReconnect}`
        );

        if (shouldReconnect) {
          startBot();
        }
      } else if (connection === "open") {
        logger.success("A Aurora está conectada! ✨");
      }
    });

    // Evento de mensagens
    sock.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg) return;

      await messageHandler.handleMessage(sock, msg);
    });

    logger.info("Bot iniciado e aguardando conexão...");
  } catch (error) {
    logger.error(`Erro ao iniciar bot: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

// Suprimir logs do Baileys
process.env.LOG_LEVEL = "silent";

// Iniciar o bot
startBot();

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  logger.error(`Erro não capturado: ${error.message}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Promise rejeitada não tratada: ${reason}`);
});
