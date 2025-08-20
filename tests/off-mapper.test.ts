// Minimal unit-like checks for OFF mapper (run with ts-node or tsx)
import { mapOFFNutrimentsToUnified } from '../lib/off-service'

function assert(cond: any, msg: string) {
    if (!cond) throw new Error(msg)
}

const sample = {
    'energy-kcal_100g': 250,
    'proteins_100g': 10,
    'carbohydrates_100g': 30,
    'fat_100g': 8,
    'sugars_100g': 12,
    'fiber_100g': 5,
    'saturated-fat_100g': 2,
    'trans-fat_100g': 0.2,
}

const { foodNutrients, labelNutrients } = mapOFFNutrimentsToUnified(sample)

assert(foodNutrients.length >= 4, 'expected core nutrients mapped')
assert(labelNutrients.calories.value === 250, 'kcal mapped')
assert(labelNutrients.protein.value === 10, 'protein mapped')
assert(labelNutrients.carbohydrates.value === 30, 'carbs mapped')
assert(labelNutrients.fat.value === 8, 'fat mapped')
assert(labelNutrients.sugars.value === 12, 'sugars mapped')
assert(labelNutrients.fiber.value === 5, 'fiber mapped')
assert(labelNutrients.saturatedFat.value === 2, 'saturated fat mapped')
assert(labelNutrients.transFat.value === 0.2, 'trans fat mapped')

console.log('OFF mapper tests passed')


