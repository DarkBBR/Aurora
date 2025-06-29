import 'dotenv/config';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "anju-xpro-baileys";
import { handleMessage } from "./src/core/handler.js";
import { handleGroupEvents } from "./src/core/groupEvents.js";
import config from "./src/config/config.js";
import colors from "colors";
import pino from "pino";
import qrcode from 'qrcode-terminal';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "error" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if (update.qr) {
      qrcode.generate(update.qr, { small: true });
      console.log(colors.yellow("Escaneie o QR Code acima com o WhatsApp!"));
    }
    
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode ||
        lastDisconnect?.error?.message;
      console.log(colors.red(`[!] Conexão fechada. Motivo: ${reason}`));
      
      if (reason !== DisconnectReason.loggedOut) {
        console.log(colors.yellow("[!] Tentando reconectar..."));
        startBot();
      } else {
        console.log(
          colors.red("[!] Sessão encerrada. Faça login novamente.")
        );
      }
    } else if (connection === "open") {
      console.log(colors.green("🤖 Aurora Bot conectado com sucesso!"));
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    await handleMessage(sock, msg, config);
  });

  sock.ev.on("groups.update", async (updates) => {
    for (const update of updates) {
      await handleGroupEvents(sock, update);
    }
  });
}

startBot();
