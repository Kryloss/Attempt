import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
    email: string;
    code: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}

const PasswordResetSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    code: {
        type: String,
        required: true,
        length: 6,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
    },
    used: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Prevent multiple model initialization in development
export default mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);
