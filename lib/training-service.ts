import { IExercise, ITraining } from '@/models/Training';

export interface TrainingData {
    id?: string;
    name: string;
    exercises: IExercise[];
    date: string;
}

export interface TrainingPresetData {
    id?: string;
    name: string;
    exercises: IExercise[];
}

export class TrainingService {
    private userId: string;
    private autoSaveTimeout: NodeJS.Timeout | null = null;
    private autoSaveDelay = 1000; // 1 second delay

    constructor(userId: string) {
        this.userId = userId;
    }

    // Get user ID from user object (handles both _id and id fields)
    static getUserId(user: any): string {
        return user.id || user._id || '';
    }

    // Auto-save training data with debouncing
    async autoSave(training: TrainingData): Promise<void> {
        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Set new timeout for auto-save
        this.autoSaveTimeout = setTimeout(async () => {
            try {
                console.log('Auto-saving training data:', { userId: this.userId, date: training.date });
                await this.saveTraining(training);
                console.log('Training auto-saved successfully');
            } catch (error) {
                console.error('Auto-save failed:', error);
                throw error; // Re-throw to handle in component
            }
        }, this.autoSaveDelay);
    }

    // Save training data to database
    async saveTraining(training: TrainingData): Promise<void> {
        try {
            const response = await fetch('/api/training/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId,
                },
                body: JSON.stringify({
                    date: training.date,
                    name: training.name,
                    exercises: training.exercises,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save training');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to save training');
            }
        } catch (error) {
            console.error('Error saving training:', error);
            throw error;
        }
    }

    // Load training data from database
    async loadTraining(date: string): Promise<TrainingData | null> {
        try {
            const response = await fetch(`/api/training/get?userId=${this.userId}&date=${date}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load training');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load training');
            }

            if (result.training) {
                return {
                    id: result.training._id,
                    name: result.training.name,
                    exercises: result.training.exercises,
                    date: result.training.date,
                };
            }

            return null;
        } catch (error) {
            console.error('Error loading training:', error);
            throw error;
        }
    }

    // Save training as preset
    async savePreset(preset: TrainingPresetData): Promise<void> {
        try {
            const response = await fetch('/api/training/save-preset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId,
                },
                body: JSON.stringify({
                    name: preset.name,
                    exercises: preset.exercises,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save preset');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to save preset');
            }
        } catch (error) {
            console.error('Error saving preset:', error);
            throw error;
        }
    }

    // Load all training presets for user
    async loadPresets(): Promise<TrainingPresetData[]> {
        try {
            const response = await fetch(`/api/training/get-presets?userId=${this.userId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load presets');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load presets');
            }

            return result.presets || [];
        } catch (error) {
            console.error('Error loading presets:', error);
            throw error;
        }
    }

    // Load training history (previous trainings)
    async loadTrainingHistory(): Promise<TrainingData[]> {
        try {
            const response = await fetch(`/api/training/get-history?userId=${this.userId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load training history');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load training history');
            }

            return result.trainings || [];
        } catch (error) {
            console.error('Error loading training history:', error);
            throw error;
        }
    }

    // Delete training preset
    async deletePreset(presetId: string): Promise<void> {
        try {
            const response = await fetch('/api/training/delete-preset', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': this.userId,
                },
                body: JSON.stringify({
                    presetId: presetId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete preset');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete preset');
            }
        } catch (error) {
            console.error('Error deleting preset:', error);
            throw error;
        }
    }

    // Clear auto-save timeout (useful when component unmounts)
    clearAutoSaveTimeout(): void {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
        }
    }

    // Method to notify that training data has been updated
    // This can be used by components to refresh their data
    notifyTrainingUpdate(): void {
        // This method can be extended to implement a pub/sub system
        // For now, it's a placeholder for future enhancements
        console.log('Training data updated - components should refresh their data');
    }
}
