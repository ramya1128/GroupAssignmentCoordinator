import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(input, stored) {
  return await bcrypt.compare(input, stored);
}