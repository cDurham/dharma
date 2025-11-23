import { z } from 'zod'
import { CreateMemberInput, CreateRetreatInput, CreateUserInput, UpdateMemberInput, UpdateRetreatInput, UpdateUserInput, ValidateUserInput } from './types'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function CreateMemberInputSchema() {
  return z.object({
    firstName: z.string(),
    lastName: z.string()
  })
}

export function CreateRetreatInputSchema() {
  return z.object({
    endAt: definedNonNullAnySchema,
    name: z.string(),
    startAt: definedNonNullAnySchema
  })
}

export function CreateUserInputSchema() {
  return z.object({
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string()
  })
}

export function UpdateMemberInputSchema() {
  return z.object({
    firstName: z.string().nullish(),
    lastName: z.string().nullish()
  })
}

export function UpdateRetreatInputSchema() {
  return z.object({
    endAt: definedNonNullAnySchema.nullish(),
    name: z.string().nullish(),
    startAt: definedNonNullAnySchema.nullish()
  })
}

export function UpdateUserInputSchema() {
  return z.object({
    email: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    password: z.string().nullish(),
    verificationToken: z.string().nullish(),
    verifiedEmail: z.boolean().nullish()
  })
}

export function ValidateUserInputSchema() {
  return z.object({
    email: z.string(),
    password: z.string()
  })
}
