const config = {
  botName: 'Aurora Bot',
  prefix: '!',
  spiderxApiKey: process.env.SPIDERX_API_KEY,
  // Sistema de registro
  registeredUsers: new Map(), // Armazenar usuários registrados
  registrationRequired: true, // Se o registro é obrigatório
};

export default config; 