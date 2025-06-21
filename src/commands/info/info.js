import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "info",
  aliases: ["botinfo", "about"],
  description: "Mostra informações sobre o bot",
  async execute(sock, msg, args, commands, config) {
    const commandManager = sock.commandManager || { getAllCommands: () => commands };
    const allCommands = commandManager.getAllCommands();
    
    const infoText = Formatter.card(
      "🤖 Aurora Bot - Informações",
      `${Formatter.bold("Nome:")} Aurora Bot\n` +
      `${Formatter.bold("Versão:")} 1.0.0\n` +
      `${Formatter.bold("Comandos:")} ${Object.keys(allCommands).length}\n` +
      `${Formatter.bold("Status:")} ✅ Online\n\n` +
      `${Formatter.info("💡 Bot modular para WhatsApp")}\n` +
      `${Formatter.info("🔗 Desenvolvido com Baileys")}\n\n` +
      `${Formatter.bold("Comandos principais:")}\n` +
      `• ${Formatter.code(config.prefix + "help")} - Lista de comandos\n` +
      `• ${Formatter.code(config.prefix + "ping")} - Teste de latência\n` +
      `• ${Formatter.code(config.prefix + "info")} - Informações do bot`
    );
    
    await sock.sendMessage(msg.key.remoteJid, { text: infoText });
  },
}; 