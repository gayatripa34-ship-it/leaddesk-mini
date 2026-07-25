import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILead extends Document {
  name: string;
  email: string;
  createdAt?: Date;
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "Email is required"] },
  createdAt: { type: Date, default: Date.now },
});

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;