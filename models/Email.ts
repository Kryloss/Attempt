import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
    email: string;
    status: 'sent' | 'failed';
    sentAt: Date;
    resendId?: string;
    messageId?: string;
    error?: string;
    service?: 'resend' | 'gmail';
    emailType?: 'confirmation' | 'verification' | 'password-reset' | 'welcome' | 'bulk' | 'notification';
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
    messageId: {
        type: String,
        required: false,
    },
    error: {
        type: String,
        required: false,
    },
    service: {
        type: String,
        enum: ['resend', 'gmail'],
        required: false,
        default: 'resend',
    },
    emailType: {
        type: String,
        enum: ['confirmation', 'verification', 'password-reset', 'welcome', 'bulk', 'notification'],
        required: false,
        default: 'confirmation',
    },
}, {
    timestamps: true,
});

// Prevent multiple model initialization in development
export default mongoose.models.Email || mongoose.model<IEmail>('Email', EmailSchema);
