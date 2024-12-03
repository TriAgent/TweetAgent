import { cloneDeep, isObject, merge } from "lodash";

export function deepMergeAndPrune(defaultConfig: any, userConfig: any): any {
  // Deep merge userConfig into defaultConfig
  const mergedConfig = merge(cloneDeep(defaultConfig), userConfig);

  // Recursive function to prune fields not in defaultConfig
  function prune(obj: any, reference: any): any {
    if (isObject(obj) && isObject(reference)) {
      for (const key in obj) {
        if (!(key in reference)) {
          delete obj[key];
        } else {
          obj[key] = prune(obj[key], reference[key]);
        }
      }
    }
    return obj;
  }

  return prune(mergedConfig, defaultConfig);
}
