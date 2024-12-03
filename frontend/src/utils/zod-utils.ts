// import { z, ZodType } from 'zod';

// export function zodJsonToSchema(json: any): ZodType<any> {
//   if (typeof json === 'string') {
//     return z.string();
//   } else if (typeof json === 'number') {
//     return z.number();
//   } else if (typeof json === 'boolean') {
//     return z.boolean();
//   } else if (Array.isArray(json)) {
//     if (json.length > 0) {
//       // Assume homogeneous array and create schema from first element
//       return z.array(zodJsonToSchema(json[0]));
//     } else {
//       return z.array(z.any());
//     }
//   } else if (json && typeof json === 'object') {
//     const schema: Record<string, ZodType<any>> = {};
//     for (const key in json) {
//       schema[key] = zodJsonToSchema(json[key]);
//     }
//     return z.object(schema);
//   } else {
//     return z.any();
//   }
// }
