/**
 * Payment Validation Schemas
 * 
 * Zod schemas for validating payment-related forms and API requests.
 * Covers payment processing, subscriptions, refunds, and billing.
 */

import { z } from 'zod';

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

// Card number validation (basic Luhn algorithm check)
const cardNumberSchema = z
  .string()
  .regex(/^\d{13,19}$/, 'Card number must be 13-19 digits')
  .refine(
    (cardNumber) => {
      // Luhn algorithm validation
      let sum = 0;
      let isEven = false;
      
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    },
    'Invalid card number'
  );

// CVV validation
const cvvSchema = z
  .string()
  .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
  .refine(
    (cvv) => cvv.length >= 3 && cvv.length <= 4,
    'CVV must be 3 or 4 digits'
  );

// Expiry date validation
const expirySchema = z
  .string()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format')
  .refine(
    (expiry) => {
      const [month, year] = expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      const expiryYear = parseInt(year);
      const expiryMonth = parseInt(month);
      
      if (expiryYear < currentYear) {
        return false;
      }
      
      if (expiryYear === currentYear && expiryMonth <= currentMonth) {
        return false;
      }
      
      return true;
    },
    'Card has expired'
  );

// Amount validation (in paisa/cents)
const amountSchema = z
  .number()
  .min(100, 'Minimum amount is ₹1.00') // ₹1 = 100 paisa
  .max(100000000, 'Maximum amount is ₹10,00,000') // ₹10 lakhs
  .int('Amount must be a whole number in paisa');

// UPI ID validation
const upiIdSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/,
    'Invalid UPI ID format'
  )
  .min(3, 'UPI ID is too short')
  .max(50, 'UPI ID is too long');

// Phone number for UPI
const upiPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid mobile number for UPI');

// =============================================================================
// PAYMENT METHOD SCHEMAS
// =============================================================================

// Credit/Debit Card Payment
export const cardPaymentSchema = z.object({
  paymentMethod: z.literal('CARD'),
  
  cardNumber: cardNumberSchema,
  
  expiryDate: expirySchema,
  
  cvv: cvvSchema,
  
  cardholderName: z
    .string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(100, 'Cardholder name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Invalid characters in cardholder name'),
  
  saveCard: z.boolean().default(false),
  
  billingAddress: z.object({
    street: z
      .string()
      .min(5, 'Street address must be at least 5 characters')
      .max(200, 'Street address must not exceed 200 characters'),
    city: z
      .string()
      .min(2, 'City name must be at least 2 characters')
      .max(50, 'City name must not exceed 50 characters'),
    state: z
      .string()
      .min(2, 'State name must be at least 2 characters')
      .max(50, 'State name must not exceed 50 characters'),
    zipCode: z
      .string()
      .regex(/^\d{6}$/, 'ZIP code must be 6 digits'),
    country: z
      .string()
      .min(2, 'Country name must be at least 2 characters')
      .max(50, 'Country name must not exceed 50 characters')
      .default('India'),
  }),
});

// UPI Payment
export const upiPaymentSchema = z.object({
  paymentMethod: z.literal('UPI'),
  
  upiId: upiIdSchema.optional(),
  
  upiApp: z
    .enum(['PHONEPE', 'GPAY', 'PAYTM', 'BHIM', 'OTHER'], {
      errorMap: () => ({ message: 'Please select a valid UPI app' }),
    })
    .optional(),
  
  phoneNumber: upiPhoneSchema.optional(),
  
}).refine(
  (data) => data.upiId || data.phoneNumber,
  {
    message: 'Either UPI ID or phone number is required',
    path: ['upiId'],
  }
);

// Net Banking
export const netBankingSchema = z.object({
  paymentMethod: z.literal('NET_BANKING'),
  
  bankCode: z
    .string()
    .min(2, 'Please select a bank')
    .max(20, 'Invalid bank code'),
  
  accountType: z
    .enum(['SAVINGS', 'CURRENT'], {
      errorMap: () => ({ message: 'Please select account type' }),
    })
    .optional(),
});

// Wallet Payment
export const walletPaymentSchema = z.object({
  paymentMethod: z.literal('WALLET'),
  
  walletProvider: z.enum([
    'PAYTM',
    'PHONEPE',
    'MOBIKWIK',
    'FREECHARGE',
    'AIRTEL_MONEY',
    'JIO_MONEY',
    'OTHER'
  ], {
    errorMap: () => ({ message: 'Please select a wallet provider' }),
  }),
  
  walletNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid wallet number')
    .optional(),
});

// EMI Payment
export const emiPaymentSchema = z.object({
  paymentMethod: z.literal('EMI'),
  
  cardNumber: cardNumberSchema,
  
  expiryDate: expirySchema,
  
  cvv: cvvSchema,
  
  cardholderName: z
    .string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(100, 'Cardholder name must not exceed 100 characters'),
  
  emiTenure: z
    .enum(['3', '6', '9', '12', '18', '24'], {
      errorMap: () => ({ message: 'Please select EMI tenure' }),
    }),
  
  bankCode: z
    .string()
    .min(2, 'Please select a bank')
    .max(20, 'Invalid bank code'),
});

// =============================================================================
// PAYMENT PROCESSING SCHEMAS
// =============================================================================

// Main payment schema (union of all payment methods)
export const paymentSchema = z.discriminatedUnion('paymentMethod', [
  cardPaymentSchema,
  upiPaymentSchema,
  netBankingSchema,
  walletPaymentSchema,
  emiPaymentSchema,
]);

// Complete payment request schema
export const paymentRequestSchema = z.object({
  amount: amountSchema,
  
  currency: z
    .enum(['INR', 'USD'], {
      errorMap: () => ({ message: 'Unsupported currency' }),
    })
    .default('INR'),
  
  orderId: z
    .string()
    .min(5, 'Order ID is required')
    .max(50, 'Order ID is too long'),
  
  description: z
    .string()
    .min(5, 'Payment description is required')
    .max(200, 'Payment description is too long'),
  
  customerInfo: z.object({
    email: z
      .string()
      .email('Invalid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    name: z
      .string()
      .min(2, 'Customer name is required')
      .max(100, 'Customer name is too long'),
  }),
  
  paymentDetails: paymentSchema,
  
  metadata: z
    .record(z.string())
    .optional(),
  
  returnUrl: z
    .string()
    .url('Invalid return URL')
    .optional(),
  
  webhookUrl: z
    .string()
    .url('Invalid webhook URL')
    .optional(),
  
  savePaymentMethod: z.boolean().default(false),
  
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
});

// =============================================================================
// SUBSCRIPTION SCHEMAS
// =============================================================================

// Subscription plan schema
export const subscriptionPlanSchema = z.object({
  planId: z
    .string()
    .min(1, 'Plan ID is required'),
  
  planType: z.enum(['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE'], {
    errorMap: () => ({ message: 'Invalid subscription plan' }),
  }),
  
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Invalid billing cycle' }),
  }),
  
  amount: amountSchema,
  
  trialPeriodDays: z
    .number()
    .min(0, 'Trial period cannot be negative')
    .max(365, 'Trial period cannot exceed 365 days')
    .optional(),
  
  couponCode: z
    .string()
    .regex(/^[A-Z0-9-_]+$/, 'Invalid coupon code format')
    .min(3, 'Coupon code too short')
    .max(20, 'Coupon code too long')
    .optional(),
  
  autoRenew: z.boolean().default(true),
});

// Subscription creation schema
export const createSubscriptionSchema = z.object({
  customerInfo: z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    name: z.string().min(2, 'Name is required').max(100, 'Name is too long'),
  }),
  
  subscriptionPlan: subscriptionPlanSchema,
  
  paymentMethod: paymentSchema,
  
  billingAddress: z.object({
    street: z.string().min(5, 'Street address is required').max(200),
    city: z.string().min(2, 'City is required').max(50),
    state: z.string().min(2, 'State is required').max(50),
    zipCode: z.string().regex(/^\d{6}$/, 'Invalid ZIP code'),
    country: z.string().default('India'),
  }),
  
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
  
  agreeToAutoRenewal: z
    .boolean()
    .refine(val => val === true, 'You must agree to auto-renewal terms'),
});

// =============================================================================
// REFUND SCHEMAS
// =============================================================================

// Refund request schema
export const refundRequestSchema = z.object({
  paymentId: z
    .string()
    .min(1, 'Payment ID is required'),
  
  amount: amountSchema.optional(), // If not provided, full refund
  
  reason: z.enum([
    'DUPLICATE_PAYMENT',
    'FRAUDULENT_TRANSACTION',
    'CUSTOMER_REQUEST',
    'TECHNICAL_ERROR',
    'SERVICE_NOT_PROVIDED',
    'DEFECTIVE_PRODUCT',
    'SUBSCRIPTION_CANCELLATION',
    'OTHER'
  ], {
    errorMap: () => ({ message: 'Please select a refund reason' }),
  }),
  
  description: z
    .string()
    .min(10, 'Please provide a detailed reason for refund')
    .max(500, 'Description is too long'),
  
  customerConsent: z
    .boolean()
    .refine(val => val === true, 'Customer consent is required for refund'),
  
  attachments: z
    .array(
      z.object({
        url: z.string().url('Invalid attachment URL'),
        type: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO']),
        name: z.string().min(1, 'Attachment name is required'),
      })
    )
    .max(5, 'Cannot attach more than 5 files')
    .optional(),
});

// =============================================================================
// COUPON AND DISCOUNT SCHEMAS
// =============================================================================

// Apply coupon schema
export const applyCouponSchema = z.object({
  couponCode: z
    .string()
    .min(3, 'Coupon code is too short')
    .max(20, 'Coupon code is too long')
    .regex(/^[A-Z0-9-_]+$/, 'Invalid coupon code format'),
  
  orderAmount: amountSchema,
  
  customerId: z
    .string()
    .uuid('Invalid customer ID')
    .optional(),
  
  productIds: z
    .array(z.string().uuid('Invalid product ID'))
    .optional(),
});

// =============================================================================
// INVOICE SCHEMAS
// =============================================================================

// Generate invoice schema
export const generateInvoiceSchema = z.object({
  paymentId: z
    .string()
    .min(1, 'Payment ID is required'),
  
  customerInfo: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    address: z.object({
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().regex(/^\d{6}$/, 'Invalid ZIP code'),
      country: z.string().default('India'),
    }),
    gstin: z
      .string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
      .optional(),
  }),
  
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Item name is required'),
        description: z.string().optional(),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        unitPrice: amountSchema,
        taxRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%'),
        hsn: z.string().optional(), // HSN code for GST
      })
    )
    .min(1, 'At least one item is required'),
  
  invoiceType: z.enum(['TAX_INVOICE', 'RECEIPT', 'CREDIT_NOTE', 'DEBIT_NOTE'], {
    errorMap: () => ({ message: 'Invalid invoice type' }),
  }),
  
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

// =============================================================================
// WEBHOOK SCHEMAS
// =============================================================================

// Payment webhook schema
export const paymentWebhookSchema = z.object({
  event: z.enum([
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED', 
    'PAYMENT_PENDING',
    'PAYMENT_AUTHORIZED',
    'PAYMENT_CAPTURED',
    'REFUND_INITIATED',
    'REFUND_PROCESSED',
    'SUBSCRIPTION_CREATED',
    'SUBSCRIPTION_ACTIVATED',
    'SUBSCRIPTION_CANCELLED',
    'SUBSCRIPTION_RENEWED'
  ]),
  
  paymentId: z.string().min(1),
  
  orderId: z.string().min(1),
  
  amount: amountSchema,
  
  currency: z.string().default('INR'),
  
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED']),
  
  paymentMethod: z.string(),
  
  gatewayTransactionId: z.string().optional(),
  
  errorCode: z.string().optional(),
  
  errorDescription: z.string().optional(),
  
  metadata: z.record(z.string()).optional(),
  
  timestamp: z.string().datetime(),
  
  signature: z.string().min(1, 'Webhook signature is required'),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type CardPaymentData = z.infer<typeof cardPaymentSchema>;
export type UpiPaymentData = z.infer<typeof upiPaymentSchema>;
export type NetBankingPaymentData = z.infer<typeof netBankingSchema>;
export type WalletPaymentData = z.infer<typeof walletPaymentSchema>;
export type EmiPaymentData = z.infer<typeof emiPaymentSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type PaymentRequestData = z.infer<typeof paymentRequestSchema>;
export type SubscriptionPlanData = z.infer<typeof subscriptionPlanSchema>;
export type CreateSubscriptionData = z.infer<typeof createSubscriptionSchema>;
export type RefundRequestData = z.infer<typeof refundRequestSchema>;
export type ApplyCouponData = z.infer<typeof applyCouponSchema>;
export type GenerateInvoiceData = z.infer<typeof generateInvoiceSchema>;
export type PaymentWebhookData = z.infer<typeof paymentWebhookSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Validate card type from card number
export const getCardType = (cardNumber: string): string => {
  const patterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    rupay: /^6[0-9]{15}$/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber.replace(/\s/g, ''))) {
      return type.toUpperCase();
    }
  }

  return 'UNKNOWN';
};

// Mask card number for display
export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const masked = cleaned.slice(0, 4) + '*'.repeat(cleaned.length - 8) + cleaned.slice(-4);
  return masked.replace(/(.{4})/g, '$1 ').trim();
};

// Validate GSTIN format
export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

// Calculate tax amount
export const calculateTax = (amount: number, taxRate: number): number => {
  return Math.round((amount * taxRate) / 100);
};

// Format amount in Indian currency
export const formatIndianCurrency = (amount: number): string => {
  const formatted = (amount / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });
  return formatted;
};