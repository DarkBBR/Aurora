// Sistema de sessões da forca
const forcaSessions = new Map();

export default {
  name: "forca",
  aliases: ["hangman", "jogoforca"],
  description: "Jogue a forca em grupo!",
  async execute(sock, msg, args, config) {
    try {
      // Verificar se é um grupo
      if (!msg.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(msg.key.remoteJid, {
          text: "❌ *A forca só pode ser jogada em grupos!*\n\n💡 *Adicione o bot em um grupo para jogar.*"
        });
        return;
      }

      const groupId = msg.key.remoteJid;
      const userId = msg.key.participant || msg.key.remoteJid;
      const userName = msg.pushName || "Jogador";

      // Reagir à mensagem
      await sock.sendMessage(groupId, {
        react: {
          text: "🎯",
          key: msg.key,
        },
      });

      // Comandos da forca
      const command = args[0]?.toLowerCase();

      if (!command) {
        await sock.sendMessage(groupId, {
          text: `🎯 *FORCA - COMANDOS*\n\n📝 *Como jogar:*\n\n*${config.prefix}forca nivel* - Criar sessão\n*${config.prefix}forca entrar* - Entrar na sessão\n*${config.prefix}forca iniciar* - Iniciar o jogo\n*${config.prefix}forca sair* - Sair da sessão\n*${config.prefix}forca status* - Ver status\n\n🎮 *Níveis:*\n• fácil - Palavras simples\n• médio - Palavras normais\n• difícil - Palavras complexas\n• insano - Palavras muito difíceis\n\n💡 *Exemplo:* ${config.prefix}forca fácil`
        });
        return;
      }

      // Criar sessão
      if (['fácil', 'facil', 'médio', 'medio', 'difícil', 'dificil', 'insano'].includes(command)) {
        const nivel = command === 'facil' ? 'fácil' : 
                     command === 'medio' ? 'médio' : 
                     command === 'dificil' ? 'difícil' : command;

        if (forcaSessions.has(groupId)) {
          await sock.sendMessage(groupId, {
            text: "❌ *Já existe uma sessão ativa neste grupo!*\n\n💡 *Use ${config.prefix}forca status para ver o status atual.*"
          });
          return;
        }

        // Criar nova sessão
        forcaSessions.set(groupId, {
          nivel: nivel,
          jogadores: new Set(),
          status: 'aguardando',
          criador: userId,
          criadorNome: userName,
          tempoCriacao: Date.now()
        });

        await sock.sendMessage(groupId, {
          text: `🎯 *SESSÃO DA FORCA CRIADA!*\n\n📊 *Nível:* ${nivel.toUpperCase()}\n👤 *Criador:* ${userName}\n⏰ *Tempo limite:* 5 minutos\n\n💬 *Para entrar:* ${config.prefix}forca entrar\n💬 *Para iniciar:* ${config.prefix}forca iniciar\n\n⏳ *A sessão será cancelada em 5 minutos se não for iniciada.*`
        });
        return;
      }

      // Verificar se existe sessão
      if (!forcaSessions.has(groupId)) {
        await sock.sendMessage(groupId, {
          text: "❌ *Nenhuma sessão ativa!*\n\n💡 *Use ${config.prefix}forca [nível] para criar uma sessão.*"
        });
        return;
      }

      const session = forcaSessions.get(groupId);

      // Entrar na sessão
      if (command === 'entrar') {
        if (session.status !== 'aguardando') {
          await sock.sendMessage(groupId, {
            text: "❌ *O jogo já foi iniciado! Não é possível entrar agora.*"
          });
          return;
        }

        if (session.jogadores.has(userId)) {
          await sock.sendMessage(groupId, {
            text: "❌ *Você já está na sessão!*"
          });
          return;
        }

        session.jogadores.add(userId);
        await sock.sendMessage(groupId, {
          text: `✅ *${userName} entrou na sessão!*\n\n👥 *Jogadores (${session.jogadores.size}):*\n${Array.from(session.jogadores).map(id => {
            const participant = msg.key.participant ? msg.key.participant : id;
            return `• ${participant === id ? userName : 'Jogador'}`;
          }).join('\n')}\n\n💬 *Para iniciar:* ${config.prefix}forca iniciar`
        });
        return;
      }

      // Sair da sessão
      if (command === 'sair') {
        if (!session.jogadores.has(userId)) {
          await sock.sendMessage(groupId, {
            text: "❌ *Você não está na sessão!*"
          });
          return;
        }

        session.jogadores.delete(userId);
        await sock.sendMessage(groupId, {
          text: `👋 *${userName} saiu da sessão!*\n\n👥 *Jogadores restantes: ${session.jogadores.size}*`
        });

        // Se não há mais jogadores, cancelar sessão
        if (session.jogadores.size === 0) {
          forcaSessions.delete(groupId);
          await sock.sendMessage(groupId, {
            text: "❌ *Sessão cancelada - não há jogadores!*"
          });
        }
        return;
      }

      // Ver status
      if (command === 'status') {
        const tempoDecorrido = Math.floor((Date.now() - session.tempoCriacao) / 1000 / 60);
        const tempoRestante = 5 - tempoDecorrido;

        let statusText = `🎯 *STATUS DA SESSÃO*\n\n📊 *Nível:* ${session.nivel.toUpperCase()}\n👤 *Criador:* ${session.criadorNome}\n👥 *Jogadores:* ${session.jogadores.size}\n⏰ *Tempo restante:* ${tempoRestante > 0 ? tempoRestante + ' min' : 'Expirado'}\n\n`;

        if (session.status === 'aguardando') {
          statusText += `📋 *Status:* Aguardando jogadores\n💬 *Para entrar:* ${config.prefix}forca entrar\n💬 *Para iniciar:* ${config.prefix}forca iniciar`;
        } else if (session.status === 'jogando') {
          statusText += `📋 *Status:* Jogo em andamento\n🎮 *Palavra:* ${session.palavraOculta}\n💀 *Vidas:* ${session.vidas}\n\n💡 *Digite uma letra para jogar!*`;
        }

        await sock.sendMessage(groupId, { text: statusText });
        return;
      }

      // Iniciar jogo
      if (command === 'iniciar') {
        if (session.status !== 'aguardando') {
          await sock.sendMessage(groupId, {
            text: "❌ *O jogo já foi iniciado!*"
          });
          return;
        }

        if (session.jogadores.size === 0) {
          await sock.sendMessage(groupId, {
            text: "❌ *Não há jogadores na sessão!*\n\n💡 *Use ${config.prefix}forca entrar para participar.*"
          });
          return;
        }

        // Verificar tempo limite
        const tempoDecorrido = Math.floor((Date.now() - session.tempoCriacao) / 1000 / 60);
        if (tempoDecorrido >= 5) {
          forcaSessions.delete(groupId);
          await sock.sendMessage(groupId, {
            text: "❌ *Sessão expirada! Crie uma nova sessão.*"
          });
          return;
        }

        // Selecionar palavra baseada no nível
        const palavras = getPalavrasPorNivel(session.nivel);
        const palavra = palavras[Math.floor(Math.random() * palavras.length)];
        
        // Inicializar jogo
        session.status = 'jogando';
        session.palavra = palavra.toLowerCase();
        session.palavraOculta = '_'.repeat(palavra.length);
        session.letrasChutadas = new Set();
        session.vidas = 6;
        session.letrasCorretas = new Set();
        session.ultimaJogada = Date.now();

        await sock.sendMessage(groupId, {
          text: `🎯 *FORCA INICIADA!*\n\n📊 *Nível:* ${session.nivel.toUpperCase()}\n👥 *Jogadores:* ${session.jogadores.size}\n💀 *Vidas:* ${session.vidas}\n\n🎮 *Palavra:* ${session.palavraOculta}\n\n💡 *Digite uma letra para jogar!*\n⏰ *Tempo limite:* 10 minutos`
        });
        return;
      }

      // Comando não reconhecido
      await sock.sendMessage(groupId, {
        text: `❌ *Comando inválido!*\n\n💡 *Use ${config.prefix}forca para ver os comandos disponíveis.*`
      });

    } catch (error) {
      console.error("Erro no comando forca:", error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Erro no jogo da forca. Tente novamente.",
      });
    }
  },
};

// Função para processar tentativas de letras (será chamada pelo handler principal)
export async function processarTentativaForca(sock, msg, config) {
  try {
    const groupId = msg.key.remoteJid;
    
    // Verificar se é um grupo e se há sessão ativa
    if (!groupId.endsWith('@g.us') || !forcaSessions.has(groupId)) {
      return false; // Não é uma tentativa da forca
    }

    const session = forcaSessions.get(groupId);
    
    // Verificar se o jogo está ativo
    if (session.status !== 'jogando') {
      return false;
    }

    const userId = msg.key.participant || msg.key.remoteJid;
    const userName = msg.pushName || "Jogador";
    const tentativa = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    // Verificar se o usuário está na sessão
    if (!session.jogadores.has(userId)) {
      return false;
    }

    // Verificar se é uma letra válida
    if (!/^[a-zA-ZÀ-ÿ]$/.test(tentativa)) {
      return false; // Não é uma letra, ignorar
    }

    const letra = tentativa.toLowerCase();

    // Verificar se a letra já foi chutada
    if (session.letrasChutadas.has(letra)) {
      await sock.sendMessage(groupId, {
        text: `❌ *${userName}, a letra "${letra.toUpperCase()}" já foi chutada!*\n\n💡 *Tente outra letra.*`
      });
      return true;
    }

    // Adicionar letra às chutadas
    session.letrasChutadas.add(letra);
    session.ultimaJogada = Date.now();

    // Verificar se a letra está na palavra
    if (session.palavra.includes(letra)) {
      session.letrasCorretas.add(letra);
      
      // Atualizar palavra oculta
      let novaPalavraOculta = '';
      for (let i = 0; i < session.palavra.length; i++) {
        if (session.palavra[i] === letra || session.letrasCorretas.has(session.palavra[i])) {
          novaPalavraOculta += session.palavra[i];
        } else {
          novaPalavraOculta += '_';
        }
      }
      session.palavraOculta = novaPalavraOculta;

      await sock.sendMessage(groupId, {
        text: `✅ *${userName} acertou! A letra "${letra.toUpperCase()}" está na palavra!*\n\n🎮 *Palavra:* ${session.palavraOculta}\n💀 *Vidas:* ${session.vidas}\n\n🎯 *Letras chutadas:* ${Array.from(session.letrasChutadas).join(', ').toUpperCase()}`
      });

      // Verificar vitória
      if (session.palavraOculta === session.palavra) {
        await sock.sendMessage(groupId, {
          text: `🎉 *PARABÉNS! A palavra era "${session.palavra.toUpperCase()}"!*\n\n🏆 *${userName} venceu o jogo!*\n\n👥 *Jogadores participantes:* ${session.jogadores.size}\n💀 *Vidas restantes:* ${session.vidas}`
        });
        forcaSessions.delete(groupId);
        return true;
      }
    } else {
      // Letra errada
      session.vidas--;
      
      const forcaEmoji = getForcaEmoji(session.vidas);
      
      await sock.sendMessage(groupId, {
        text: `❌ *${userName} errou! A letra "${letra.toUpperCase()}" não está na palavra!*\n\n${forcaEmoji}\n💀 *Vidas:* ${session.vidas}\n🎮 *Palavra:* ${session.palavraOculta}\n\n🎯 *Letras chutadas:* ${Array.from(session.letrasChutadas).join(', ').toUpperCase()}`
      });

      // Verificar derrota
      if (session.vidas <= 0) {
        await sock.sendMessage(groupId, {
          text: `💀 *GAME OVER!*\n\n📖 *A palavra era:* ${session.palavra.toUpperCase()}\n\n😵 *Todos perderam!*\n\n👥 *Jogadores:* ${session.jogadores.size}`
        });
        forcaSessions.delete(groupId);
        return true;
      }
    }

    return true; // É uma tentativa válida da forca
  } catch (error) {
    console.error("Erro ao processar tentativa da forca:", error);
    return false;
  }
}

// Função para obter emoji da forca
function getForcaEmoji(vidas) {
  const forcas = [
    "💀 *FORCA COMPLETA*",
    "🦴 *Falta 1 parte*",
    "🦴 *Faltam 2 partes*", 
    "🦴 *Faltam 3 partes*",
    "🦴 *Faltam 4 partes*",
    "🦴 *Faltam 5 partes*"
  ];
  return forcas[6 - vidas] || forcas[0];
}

// Função para obter palavras por nível
function getPalavrasPorNivel(nivel) {
  const palavras = {
    'fácil': [
      'casa', 'bola', 'gato', 'cão', 'sol', 'lua', 'mar', 'rio', 'pão', 'leite',
      'mãe', 'pai', 'filho', 'amigo', 'livro', 'mesa', 'cama', 'porta', 'janela', 'carro',
      'árvore', 'flor', 'pássaro', 'peixe', 'água', 'fogo', 'terra', 'ar', 'tempo', 'dia',
      'noite', 'manhã', 'tarde', 'ano', 'mês', 'semana', 'hora', 'minuto', 'segundo', 'vez',
      'lugar', 'coisa', 'pessoa', 'nome', 'idade', 'cor', 'tamanho', 'forma', 'número', 'letra'
    ],
    'médio': [
      'computador', 'televisão', 'telefone', 'internet', 'programa', 'sistema', 'tecnologia',
      'informação', 'comunicação', 'educação', 'universidade', 'professor', 'estudante',
      'biblioteca', 'laboratório', 'pesquisa', 'descoberta', 'invenção', 'inovação',
      'desenvolvimento', 'progresso', 'evolução', 'história', 'geografia', 'matemática',
      'física', 'química', 'biologia', 'medicina', 'engenharia', 'arquitetura',
      'música', 'arte', 'literatura', 'filosofia', 'psicologia', 'sociologia',
      'economia', 'política', 'direito', 'justiça', 'liberdade', 'democracia'
    ],
    'difícil': [
      'antropologia', 'arqueologia', 'astronomia', 'meteorologia', 'oceanografia',
      'paleontologia', 'genética', 'neurologia', 'cardiologia', 'dermatologia',
      'endocrinologia', 'gastroenterologia', 'hematologia', 'imunologia',
      'nefrologia', 'oncologia', 'ortopedia', 'pediatria', 'psiquiatria',
      'radiologia', 'urologia', 'veterinária', 'bioquímica', 'farmacologia',
      'epidemiologia', 'nutrição', 'fisioterapia', 'odontologia', 'enfermagem',
      'administração', 'contabilidade', 'marketing', 'recursos humanos',
      'logística', 'produção', 'qualidade', 'manutenção', 'segurança'
    ],
    'insano': [
      'espectrofotometria', 'cromatografia', 'eletroforese', 'centrifugação',
      'ultracentrifugação', 'microscopia', 'espectrometria', 'calorimetria',
      'potenciometria', 'condutimetria', 'refratometria', 'polarimetria',
      'fluorimetria', 'luminescência', 'radioatividade', 'nuclear',
      'termodinâmica', 'mecânica quântica', 'relatividade', 'cosmologia',
      'astrofísica', 'geofísica', 'hidrologia', 'limnologia', 'edafologia',
      'fitopatologia', 'entomologia', 'ornitologia', 'mastozoologia',
      'herpetologia', 'ictiologia', 'malacologia', 'carcinologia',
      'aracnologia', 'miriapodologia', 'protozoologia', 'bacteriologia',
      'virologia', 'micologia', 'algologia', 'briologia', 'pteridologia'
    ]
  };
  
  return palavras[nivel] || palavras['médio'];
} 