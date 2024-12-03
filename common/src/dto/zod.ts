export type RawZodSchema = {
  type: "object" | "string" | "boolean" | "number",
  properties?: { [key: string]: RawZodSchema },
  description?: string;
  required?: string[],
}