import { NextRequest, NextResponse } from 'next/server'
import { OFFService } from '@/lib/off-service'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const barcode = (searchParams.get('barcode') || '').trim()
        if (!barcode) return NextResponse.json({ error: 'barcode is required' }, { status: 400 })
        if (!/^\d{8,14}$/.test(barcode)) return NextResponse.json({ error: 'invalid barcode' }, { status: 400 })

        const product = await OFFService.fetchProductByBarcode(barcode)
        if (!product) return NextResponse.json({ error: 'not found' }, { status: 404 })

        // Map to unified shape for combined usage
        const nutriments = { foodNutrients: product.foodNutrients, labelNutrients: product.labelNutrients }
        const kcal = product.labelNutrients?.calories?.value
        const protein = product.labelNutrients?.protein?.value
        const carbs = product.labelNutrients?.carbohydrates?.value
        const fat = product.labelNutrients?.fat?.value
        const sugars = product.labelNutrients?.sugars?.value
        const fiber = product.labelNutrients?.fiber?.value
        const saturated_fat = product.labelNutrients?.saturatedFat?.value
        const trans_fat = product.labelNutrients?.transFat?.value

        return NextResponse.json({
            id: `off:${product.barcode}`,
            description: product.description,
            brand: product.brandName,
            barcode: product.barcode,
            macrosPer100g: { kcal: kcal ?? 0, protein: protein ?? 0, carbs: carbs ?? 0, fat: fat ?? 0 },
            details: {
                sugars: sugars ?? undefined,
                fiber: fiber ?? undefined,
                saturated_fat: saturated_fat ?? undefined,
                trans_fat: trans_fat ?? undefined,
            },
            source: 'OFF' as const,
            // Include USDA-like details for existing UI nutrition calc
            fdcId: Number(product.barcode),
            foodNutrients: nutriments.foodNutrients,
            labelNutrients: nutriments.labelNutrients,
            dataType: 'OFF',
        })
    } catch (error) {
        console.error('OFF product error', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


