import mongoose, { Schema } from 'mongoose';
const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    permissions: {
        type: [Number],
        required: true
    }
}, { timestamps: true });
export const Role = mongoose.model('Role', RoleSchema);
//# sourceMappingURL=role.js.map