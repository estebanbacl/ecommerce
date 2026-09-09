import { z } from 'zod'

const safeCents = z.number().int().nonnegative()

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  unitPrice: safeCents,
  currency: z.literal('USD'),
  category: z.enum(['TECHNOLOGY', 'HOME', 'BOOKS']),
  stock: z.number().int().nonnegative(),
})

export const productsResponseSchema = z.object({
  products: z.array(productSchema),
})

const confirmedItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['TECHNOLOGY', 'HOME', 'BOOKS']),
  unitPrice: safeCents,
  quantity: z.number().int().positive(),
  lineAmount: safeCents,
})

const couponResultSchema = z.object({
  code: z.string().nullable(),
  status: z.enum(['APPLIED', 'NOT_FOUND', 'EXPIRED', 'OMITTED']),
})

const breakdownSchema = z.object({
  originalSubtotal: safeCents,
  categoryDiscount: safeCents,
  afterCategory: safeCents,
  volumeDiscount: safeCents,
  afterVolume: safeCents,
  couponDiscount: safeCents,
  calculatedSavings: safeCents,
  maximumSavings: safeCents,
  finalSavings: safeCents,
  effectiveDiscountPercentage: z.number().nonnegative(),
  limitApplied: z.boolean(),
  finalTotal: safeCents,
  currency: z.literal('USD'),
})

export const quoteResponseSchema = z.object({
  items: z.array(confirmedItemSchema),
  coupon: couponResultSchema,
  breakdown: breakdownSchema,
  binding: z.boolean(),
})

export const checkoutResponseSchema = z.object({
  orderId: z.string().min(1),
  status: z.literal('CONFIRMED'),
  items: z.array(confirmedItemSchema),
  coupon: couponResultSchema,
  breakdown: breakdownSchema,
})

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    details: z
      .array(
        z.object({
          field: z.string().optional(),
          productId: z.string().optional(),
          available: z.number().optional(),
          requested: z.number().optional(),
        }),
      )
      .optional(),
  }),
})
