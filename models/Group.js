import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: String,
  members: [String],
}, { timestamps: true });

export default mongoose.models.Group || mongoose.model('Group', GroupSchema);
