export default {
  name: "status",
  aliases: ["sys", "sistema"],
  description: "Exibe status do sistema do bot.",
  async execute(sock, msg, args, config) {
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`;
    const mem = process.memoryUsage();
    const memStr = `${(mem.rss / 1024 / 1024).toFixed(1)} MB`;
    let totalUsers = "-";
    if (config.userManager && config.userManager.getAllUsers) {
      totalUsers = config.userManager.getAllUsers().length;
    }
    const info = `
📊 *Status do Sistema*
Uptime: ${uptimeStr}
Memória: ${memStr}
Usuários registrados: ${totalUsers}
    `;
    await sock.sendMessage(msg.key.remoteJid, { text: info });
  },
}; 