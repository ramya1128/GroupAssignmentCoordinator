import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { comparePasswords, generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server'; // ✅ Required import

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const admin = await Admin.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    const match = await comparePasswords(password, admin.password);
    if (!match) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    const token = generateToken({ id: admin._id, role: 'admin' });

    return NextResponse.json({ message: 'Admin login successful', token }, { status: 200 });
  } catch (err) {
    console.error('Admin login error:', err.message, err.stack);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
