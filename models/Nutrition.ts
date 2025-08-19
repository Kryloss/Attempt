import mongoose, { Schema, Document } from 'mongoose';

export interface IFood {
    id: string;
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch' | 'custom';

export interface IMeal {
    id: string;
    name: string;
    type: MealType;
    foods: IFood[];
}

export interface INutrition extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    meals: IMeal[];
    foods: IFood[];
    createdAt: Date;
    updatedAt: Date;
}

const FoodSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    calories: {
        type: Number,
        required: true,
        min: 0,
    },
    carbs: {
        type: Number,
        required: true,
        min: 0,
    },
    protein: {
        type: Number,
        required: true,
        min: 0,
    },
    fat: {
        type: Number,
        required: true,
        min: 0,
    },
    notes: {
        type: String,
        trim: true,
    },
});

const MealSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'brunch', 'custom'],
        required: true,
        default: 'custom',
    },
    foods: [FoodSchema],
});

const NutritionSchema = new Schema({
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
    meals: [MealSchema],
    foods: [FoodSchema],
}, {
    timestamps: true,
});

// Ensure one nutrition record per user per date
NutritionSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Nutrition || mongoose.model<INutrition>('Nutrition', NutritionSchema);


