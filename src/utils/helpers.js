export function formatCurrency(value) {
  return value.toLocaleString('pt-BR');
}

export function formatDuration(seconds) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function calculateDays(timestamp) {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function validateAge(age) {
  return !isNaN(age) && age >= 1 && age <= 120;
}

export function validateName(name) {
  return name && name.length >= 2;
}

export const RESTRICTED_MESSAGE = `🔒 *ACESSO RESTRITO* 🔒

❌ *Você precisa se registrar para usar o Aurora Bot!*

🌟 *Para se registrar, use:*
*!register [nome] [idade]*`;

export const ERROR_MESSAGE = "❌ Erro ao processar comando. Tente novamente."; 