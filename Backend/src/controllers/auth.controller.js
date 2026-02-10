import { User } from '../models/User.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { getDb } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Validate
    const errors = User.validate({ email, password });
    if (errors.length > 0) return res.status(400).json({ message: errors.join(', ') });

    const existing = await User.collection().findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email,
      password: hashedPassword,
      full_name,
      role: role || 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await User.collection().insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId };

    // Create related profile records
    if (user.role === 'worker') {
      await WorkerProfile.collection().insertOne({ user: user._id, createdAt: new Date(), status: 'offline' });
    } else {
      await getDb().collection('customers').insertOne({ user: user._id, full_name: full_name || '', email, createdAt: new Date() });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.collection().findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');

    const user = await User.collection().findOne({ _id: new ObjectId(decoded.id) });

    if (!user) return res.status(404).json({ message: 'Not found' });

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Not authorized' });
  }
};
