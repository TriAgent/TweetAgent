import { AnySchema, ValidationError } from "yup";

export const formSchemaValidator = <T>(
  validationSchema: AnySchema,
  node: keyof T & string,
  dataValue: T
): Array<string> => {
  try {
    validationSchema.validateSyncAt(node, dataValue);
  } catch (err: unknown) {
    return (err as ValidationError).errors;
  }
  return [];
};