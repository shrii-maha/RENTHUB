const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const mockDbPath = path.join(__dirname, '..', 'mockData.json');

// Initialize DB if it doesn't exist
const initDb = () => {
  if (!fs.existsSync(mockDbPath)) {
    fs.writeFileSync(mockDbPath, JSON.stringify({ users: [] }, null, 2));
  }
};

const readDb = () => {
  initDb();
  try {
    const data = fs.readFileSync(mockDbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

const writeDb = (data) => {
  fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2));
};

const createUser = (userData) => {
  const db = readDb();
  // Check if exists
  if (db.users.find(u => u.email === userData.email)) {
    throw new Error('User already exists');
  }
  
  const newUser = {
    _id: crypto.randomBytes(12).toString('hex'), // Mock ObjectId
    ...userData,
    isAdmin: false,
    isVerified: true // Auto verify in mock mode
  };
  
  db.users.push(newUser);
  writeDb(db);
  return newUser;
};

const findUserByEmail = (email) => {
  const db = readDb();
  return db.users.find(u => u.email === email);
};

const findUserById = (id) => {
  const db = readDb();
  return db.users.find(u => u._id === id);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
