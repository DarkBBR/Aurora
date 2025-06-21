export class Formatter {
  // Formatação básica
  static bold(text) {
    return `*${text}*`;
  }

  static italic(text) {
    return `_${text}_`;
  }

  static code(text) {
    return `\`${text}\``;
  }

  static strikethrough(text) {
    return `~${text}~`;
  }

  static monospace(text) {
    return `\`\`\`${text}\`\`\``;
  }

  static link(url, text = null) {
    return text ? `[${text}](${url})` : url;
  }

  // Formatação combinada
  static boldItalic(text) {
    return `*_${text}_*`;
  }

  static boldCode(text) {
    return `*\`${text}\`*`;
  }

  // Criação de listas
  static list(items, numbered = false) {
    return items
      .map((item, index) => {
        const prefix = numbered ? `${index + 1}.` : "•";
        return `${prefix} ${item}`;
      })
      .join("\n");
  }

  // Criação de seções
  static section(title, content) {
    return `${this.bold(title)}\n${content}`;
  }

  // Criação de cards
  static card(title, content, footer = null) {
    let card = `╭─ ${this.bold(title)} ─╮\n`;
    card += content.split("\n").map(line => `│ ${line}`).join("\n");
    if (footer) {
      card += `\n╰─ ${footer} ─╯`;
    } else {
      card += "\n╰─────────────╯";
    }
    return card;
  }

  // Criação de tabelas simples
  static table(headers, rows) {
    const headerRow = headers.map(h => this.bold(h)).join(" | ");
    const separator = headers.map(() => "---").join(" | ");
    const dataRows = rows.map(row => row.join(" | "));
    
    return [headerRow, separator, ...dataRows].join("\n");
  }

  // Criação de alertas
  static success(text) {
    return `✅ ${text}`;
  }

  static error(text) {
    return `❌ ${text}`;
  }

  static warning(text) {
    return `⚠️ ${text}`;
  }

  static info(text) {
    return `ℹ️ ${text}`;
  }

  // Criação de banners
  static banner(text, char = "=") {
    const line = char.repeat(text.length + 4);
    return `${line}\n${char} ${text} ${char}\n${line}`;
  }

  // Criação de divisores
  static divider(char = "─", length = 30) {
    return char.repeat(length);
  }
} 