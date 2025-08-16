import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
}

export interface ITraining extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    name: string;
    exercises: IExercise[];
    createdAt: Date;
    updatedAt: Date;
}

const ExerciseSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    sets: {
        type: Number,
        required: true,
        min: 1,
    },
    reps: {
        type: Number,
        required: true,
        min: 1,
    },
    weight: {
        type: Number,
        min: 0,
    },
    notes: {
        type: String,
        trim: true,
    },
});

const TrainingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    date: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Training',
    },
    exercises: [ExerciseSchema],
}, {
    timestamps: true,
});

// Compound index to ensure unique training per user per date
TrainingSchema.index({ userId: 1, date: 1 }, { unique: true });

// Prevent multiple model initialization in development
export default mongoose.models.Training || mongoose.model<ITraining>('Training', TrainingSchema);
