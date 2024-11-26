export const isNumeric = (obj: any) => {
  return !Number.isNaN(parseFloat(obj)) && Number.isFinite(Number(obj));
};