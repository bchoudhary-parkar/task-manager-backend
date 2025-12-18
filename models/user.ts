import mongoose, { Document, Schema, Model, Types } from "mongoose";
 
export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  isGoogleAuth: boolean;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  otpAttempts: number;
  isAdminCreated: boolean; 
  mustChangePassword: boolean; 
  
  role?: Types.ObjectId;
  status: 'available' | 'not available';
  permissions?: number[];
  createdAt: Date;
  updatedAt: Date;
}
 
const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: function(this: UserDocument) { return !this.isGoogleAuth; },  
  },
  googleId: { type: String, unique: true, sparse: true },
  picture: { type: String, default: '' },
  isGoogleAuth: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  isAdminCreated: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: false },
  
  verificationToken: { type: String },
  verificationTokenExpiresAt: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  role: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
  status: { type: String, enum: ['available', 'not available'], default: 'available' },
  permissions: { type: [Number], default: [] }
}, { timestamps: true });
 
const User: Model<UserDocument> = mongoose.models.user || mongoose.model<UserDocument>("user", userSchema);
export default User;