import { Formatter } from "../../utils/Formatter.js";

export default {
  name: "format",
  aliases: ["f"],
  description: "Testa a formatação de texto",
  async execute(sock, msg, args, commands, config) {
    const formatText = Formatter.card(
      "🎨 Teste de Formatação",
      `${Formatter.bold("Texto em negrito")}\n` +
      `${Formatter.italic("Texto em itálico")}\n` +
      `${Formatter.code("Código inline")}\n` +
      `${Formatter.success("Texto de sucesso")}\n` +
      `${Formatter.error("Texto de erro")}\n` +
      `${Formatter.info("Texto informativo")}\n` +
      `${Formatter.warning("Texto de aviso")}\n\n` +
      `${Formatter.divider()}\n` +
      `${Formatter.banner("Banner de destaque")}\n` +
      `${Formatter.divider()}\n\n` +
      `${Formatter.info("💡 Este comando demonstra as opções de formatação disponíveis")}`
    );
    
    await sock.sendMessage(msg.key.remoteJid, { text: formatText });
  },
}; 