import { AnySchema, ValidationError } from "yup";

export const validator = <T>(
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

export const asyncValidator = async <T>(
  validationSchema: AnySchema,
  node: keyof T & string,
  dataValue: T
): Promise<Array<string>> => {
  try {
    await validationSchema.validateAt(node, dataValue);
  } catch (err: unknown) {
    return (err as ValidationError).errors;
  }
  return [];
};
