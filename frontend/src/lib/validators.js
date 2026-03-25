import { z } from "zod";

export const paymentMethods = ["cash", "mobile", "online"];
export const sugarLevels = ["0%", "25%", "50%", "75%", "100%"];
export const milkTypes = ["Dairy", "Oat", "Almond", "Soy", "Coconut"];
export const drinkSizes = ["Small", "Medium", "Large"];

export const authSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(7, "Please enter a valid phone number."),
  paymentMethod: z.enum(paymentMethods),
  note: z.string().optional(),
});

export const customizationSchema = z.object({
  size: z.enum(drinkSizes),
  sugarLevel: z.enum(sugarLevels),
  milkType: z.enum(milkTypes),
});
