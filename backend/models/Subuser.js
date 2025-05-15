import mongoose from "mongoose";

const SubuserSchema = new mongoose.Schema({
  userId: { 
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model("Subuser", SubuserSchema);
