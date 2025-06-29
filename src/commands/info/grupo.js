export default {
  name: "grupo",
  aliases: ["group", "ginfo"],
  description: "Exibe informações do grupo.",
  async execute(sock, msg, args, config) {
    if (!msg.key.remoteJid.endsWith("@g.us")) {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Este comando só pode ser usado em grupos." });
      return;
    }
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.notify || p.id.split("@")[0]);
    const info = `
👥 *Informações do Grupo*
Nome: ${metadata.subject}
Participantes: ${metadata.participants.length}
Admins: ${admins.join(", ") || "-"}
ID: ${metadata.id}
    `;
    await sock.sendMessage(msg.key.remoteJid, { text: info });
  },
}; 