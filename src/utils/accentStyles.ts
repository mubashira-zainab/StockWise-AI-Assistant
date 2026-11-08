/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccentColor } from '../types';

export function getAccentClasses(accent: AccentColor) {
  switch (accent) {
    case 'purple':
      return {
        bg: 'bg-purple-600',
        hoverBg: 'hover:bg-purple-500',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-600',
        lightBg: 'bg-purple-50 dark:bg-purple-950/40',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
        fill: '#7C3AED',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-600',
        hoverBg: 'hover:bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
        fill: '#059669',
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-600',
        hoverBg: 'hover:bg-indigo-500',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-600',
        lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
        fill: '#4F46E5',
      };
    case 'amber':
      return {
        bg: 'bg-amber-600',
        hoverBg: 'hover:bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-600',
        lightBg: 'bg-amber-50 dark:bg-amber-950/40',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
        fill: '#D97706',
      };
    case 'rose':
      return {
        bg: 'bg-rose-600',
        hoverBg: 'hover:bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-600',
        lightBg: 'bg-rose-50 dark:bg-rose-950/40',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
        fill: '#E11D48',
      };
    case 'blue':
    default:
      return {
        bg: 'bg-blue-600',
        hoverBg: 'hover:bg-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-600',
        lightBg: 'bg-blue-50 dark:bg-blue-950/40',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        fill: '#2563EB',
      };
  }
}
