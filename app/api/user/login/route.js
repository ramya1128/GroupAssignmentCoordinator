import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { comparePasswords, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return Response.json({ message: 'All fields are required' }, { status: 400 });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const match = await comparePasswords(password, user.password);
    if (!match) {
      return Response.json({ message: 'Invalid password' }, { status: 401 });
    }

    const token = generateToken({ id: user._id, role: 'user' });

    return Response.json({ message: 'Login successful', token,email: user.email, username: user.username }, { status: 200 });
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
