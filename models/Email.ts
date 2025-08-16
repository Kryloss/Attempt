import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
    email: string;
    status: 'sent' | 'failed';
    sentAt: Date;
    resendId?: string;
    error?: string;
}

const EmailSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        required: true,
        default: 'sent',
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    resendId: {
        type: String,
        required: false,
    },
    error: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

// Prevent multiple model initialization in development
export default mongoose.models.Email || mongoose.model<IEmail>('Email', EmailSchema);
