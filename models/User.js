import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },

  submissions: [
    {
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
      text: String,
    },
  ],
});


export default mongoose.models.User || mongoose.model('User', userSchema);