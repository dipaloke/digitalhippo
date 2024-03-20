// /**
//  * Simple object check.
//  * @param item
//  * @returns {boolean}
//  */
// export function isObject(item: unknown): boolean {
//     return item !== null && typeof item === 'object' && !Array.isArray(item);
//   }

//   /**
//    * Deep merge two objects.
//    * @param target
//    * @param ...sources
//    */
//   export default function deepMerge<T extends Record<string, unknown>, R extends object>(
//     target: T,
//     source: R
//   ): T {
//     const output = { ...target };

//     function mergeObjects(targetObj: Record<string, unknown>, sourceObj: Record<string, unknown>) {
//       Object.keys(sourceObj).forEach((key: string) => {
//         if (isObject(sourceObj[key])) {
//           if (!(key in targetObj)) {
//             targetObj[key] = sourceObj[key];
//           } else {
//             // Recursively merge nested objects
//             mergeObjects(targetObj[key] as Record<string, unknown>, sourceObj[key] as Record<string, unknown>);
//           }
//         } else {
//           targetObj[key] = sourceObj[key];
//         }
//       });
//     }

//     if (isObject(target) && isObject(source)) {
//       mergeObjects(output, source as Record<string, unknown>);
//     }

//     return output;
//   }


  /**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): boolean {
  return  item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export default function deepMerge<T, R>(target: T, source: R): T {
  const output = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in (target as Record<string, unknown>))) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}
