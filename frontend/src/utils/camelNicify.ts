/**
 * Takes a camel case string as input, and converts it into a string where 
 * a space is added before each came case "word", and a first letter of the 
 * word converted to uppercase
 */
export function camelNicify(camelCaseStr: string) {
  return camelCaseStr
    .replace(/([A-Z])/g, ' $1') // Add space before each uppercase letter
    .replace(/^./, function (str) { return str.toUpperCase(); }) // Capitalize the first letter of the string
    .replace(/ (\w)/g, function (str) { return str.toUpperCase(); }); // Capitalize the first letter after each space
}