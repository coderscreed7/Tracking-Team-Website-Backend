import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  Name: {
    type: String,
    required: true
  },
  CGPA: {
    type: Number
  },
  Title: String,
  Stipend: Number,
  "Stipend Info": String,
  Location: String,
  "Job Title": String,
  Type: String,
  "Arrival Date": String,
  Coordinator: {
    type: String,
    default: ""
  },
  Tracked: {
    type: Boolean,
    default: false
  },
  Invited: {
    type: Boolean,
    default: false
  },
  Called: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
