import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names and resolves Tailwind CSS conflicts
 *
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged and conflict-resolved class string
 *
 * @example
 * classNames('bg-red-500', 'bg-blue-500') // → 'bg-blue-500'
 * classNames('p-4', { 'text-white': true }, ['m-2']) // → 'p-4 text-white m-2'
 */
export function classNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export as cn for backward compatibility
export const cn = classNames
