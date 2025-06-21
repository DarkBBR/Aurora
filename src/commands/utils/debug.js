import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "debug",
  aliases: ["dbg"],
  description: "Mostra informações de debug da mensagem",
  async execute(sock, msg, args, commands, config) {
    try {
      const debugInfo = {
        messageType: msg.message ? Object.keys(msg.message)[0] : "Desconhecido",
        from: msg.key.remoteJid,
        timestamp: new Date(msg.messageTimestamp * 1000).toISOString(),
        pushName: msg.pushName || "Desconhecido",
        isGroup: msg.key.remoteJid.endsWith("@g.us"),
        hasQuotedMessage: !!(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage),
        args: args,
        commandCount: Object.keys(commands).length
      };
      
      const debugText = Formatter.card(
        "🐛 Debug Info",
        `${Formatter.bold("Tipo de mensagem:")} ${debugInfo.messageType}\n` +
        `${Formatter.bold("De:")} ${debugInfo.from}\n` +
        `${Formatter.bold("Timestamp:")} ${debugInfo.timestamp}\n` +
        `${Formatter.bold("Nome:")} ${debugInfo.pushName}\n` +
        `${Formatter.bold("É grupo:")} ${debugInfo.isGroup ? "Sim" : "Não"}\n` +
        `${Formatter.bold("Tem mensagem citada:")} ${debugInfo.hasQuotedMessage ? "Sim" : "Não"}\n` +
        `${Formatter.bold("Argumentos:")} ${args.length > 0 ? args.join(", ") : "Nenhum"}\n` +
        `${Formatter.bold("Total de comandos:")} ${debugInfo.commandCount}\n\n` +
        `${Formatter.info("💡 Use este comando para debugar mensagens")}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: debugText });
      
    } catch (error) {
      const errorText = Formatter.card(
        "⚠️ Erro no Debug",
        `${Formatter.error("Erro ao processar debug.")}\n\n` +
        `${Formatter.bold("Erro:")} ${Formatter.code(error.message)}`
      );
      
      await sock.sendMessage(msg.key.remoteJid, { text: errorText });
    }
  },
}; 