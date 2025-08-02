import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  deadline: String,
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  submissions: {
    type: Number,
    default: 0,
  },
  totalMembers: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  submissionText: String,
  grade: String,
  feedback: String,
  userEmail: String,
}, { timestamps: true });

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
