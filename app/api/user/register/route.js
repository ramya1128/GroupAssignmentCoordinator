import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req) {
  await connectDB();
  const { username, email, password } = await req.json();
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return Response.json({ message: 'User already exists' }, { status: 400 });

  const hashed = await hashPassword(password);
  await User.create({ username, email, password: hashed });
  return Response.json({ message: 'Registered successfully' });
}