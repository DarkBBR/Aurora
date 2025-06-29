import fs from 'fs';
import path from 'path';

class UserManager {
  constructor() {
    this.usersFile = './data/users.json';
    this.ensureDataDirectory();
  }
  
  ensureDataDirectory() {
    const dataDir = path.dirname(this.usersFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
  
  loadUsers() {
    try {
      if (fs.existsSync(this.usersFile)) {
        const data = fs.readFileSync(this.usersFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[UserManager] Erro ao carregar usuários:', error);
    }
    return {};
  }
  
  saveUsers(users) {
    try {
      fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('[UserManager] Erro ao salvar usuários:', error);
    }
  }
  
  registerUser(userId, userData) {
    const users = this.loadUsers();
    users[userId] = userData;
    this.saveUsers(users);
    return true;
  }
  
  isRegistered(userId) {
    const users = this.loadUsers();
    return users.hasOwnProperty(userId);
  }
  
  getUser(userId) {
    const users = this.loadUsers();
    return users[userId] || null;
  }
  
  getAllUsers() {
    return this.loadUsers();
  }
  
  deleteUser(userId) {
    const users = this.loadUsers();
    if (users[userId]) {
      delete users[userId];
      this.saveUsers(users);
      return true;
    }
    return false;
  }
}

export default new UserManager(); 