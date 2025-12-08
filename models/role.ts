import mongoose,{ Schema, Document } from 'mongoose';

export interface roleDocument extends Document {
  name: string;
  permissions: number[];
}

const RoleSchema = new Schema<roleDocument>(
  {
    name: { 
        type: String, 
        required: true,
        trim: true
    }, 
    permissions: { 
        type: [Number], 
        required: true 
    }
  },
  { timestamps: true }
);

export const Role = mongoose.model<roleDocument>('Role', RoleSchema);
