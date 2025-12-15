import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleAuth;
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    picture: {
        type: String,
        default: '',
    },
    isGoogleAuth: {
        type: Boolean,
        default: false,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpiresAt: {
        type: Date,
    },
    otpAttempts: {
        type: Number,
        default: 0,
    },
    // RBAC FIELDS
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'not available'],
        default: 'available'
    },
    permissions: {
        type: [Number],
        default: []
    }
}, {
    timestamps: true
});
const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
//# sourceMappingURL=User.js.map