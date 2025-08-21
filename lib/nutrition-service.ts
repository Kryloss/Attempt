export interface NutritionFood {
    id: string;
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    notes?: string;
    // Advanced subclasses (all optional)
    proteinComplete?: number;
    proteinIncomplete?: number;
    carbsSimple?: number;
    carbsComplex?: number;
    fiber?: number;
    fatsUnsaturated?: number;
    fatsSaturated?: number;
    fatsTrans?: number;
    fdcId?: number;
}

export interface NutritionMeal {
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch' | 'custom';
    foods: NutritionFood[];
}

export interface NutritionData {
    id?: string;
    date: string;
    meals: NutritionMeal[];
    foods: NutritionFood[];
}

export class NutritionService {
    private userId: string;
    private autoSaveTimeout: NodeJS.Timeout | null = null;
    private autoSaveDelay = 1000;

    constructor(userId: string) {
        this.userId = userId;
    }

    static getUserId(user: any): string {
        return user.id || user._id || '';
    }

    async autoSave(nutrition: NutritionData): Promise<void> {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        this.autoSaveTimeout = setTimeout(async () => {
            await this.saveNutrition(nutrition);
        }, this.autoSaveDelay);
    }

    async saveNutrition(nutrition: NutritionData): Promise<void> {
        const response = await fetch('/api/nutrition/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': this.userId,
            },
            body: JSON.stringify(nutrition),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to save nutrition');
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to save nutrition');
        }
    }

    async loadNutrition(date: string): Promise<NutritionData | null> {
        const response = await fetch(`/api/nutrition/get?userId=${this.userId}&date=${date}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to load nutrition');
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to load nutrition');
        }
        if (!result.nutrition) return null;
        return {
            id: result.nutrition._id,
            date: result.nutrition.date,
            meals: result.nutrition.meals || [],
            foods: result.nutrition.foods || [],
        };
    }

    // Load nutrition history (dates with meals/foods)
    async loadNutritionHistory(): Promise<NutritionData[]> {
        const response = await fetch(`/api/nutrition/get-history?userId=${this.userId}`)
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.error || 'Failed to load nutrition history')
        }
        const result = await response.json()
        if (!result.success) {
            throw new Error(result.error || 'Failed to load nutrition history')
        }
        return result.nutritions || []
    }

    clearAutoSaveTimeout(): void {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
        }
    }
}


