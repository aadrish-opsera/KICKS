/**
 * Centralized UI copy for KICKS.
 *
 * Vocabulary guideline (6th grade / ages 7+):
 * - Prefer short words and short sentences.
 * - Prefer: Find, Pick, Try Again, See More, Compare
 * - Avoid: Submit Query, Select budget range, Retry Request, View Details (prefer See More)
 */

export const HOME = {
  brand: 'KICKS',
  heading: 'Find sneakers you will love',
  subheading: 'Tell us what you like and your budget. We will show five great matches.',
  inputLabel: 'What kind of sneakers do you want?',
  inputPlaceholder: 'Try: blue Nike runners under $100',
  budgetLabel: 'About how much do you want to spend?',
  submitButton: 'Find My Sneakers',
  submitLoading: 'Finding sneakers...',
  formLabel: 'Find sneakers',
} as const

export const RESULTS = {
  heading: 'Your top matches',
  subheading: 'Pick 2 or 3 sneakers to compare side by side.',
  compareButton: 'Compare Selected',
  viewDetailsButton: 'See More',
  clearFilters: 'Clear Filters',
  emptyFilters: 'No sneakers match your filters. Try adjusting or clearing filters.',
  needTwo: 'Need at least 2 sneakers to compare.',
  limitMessage: 'Please deselect one sneaker before adding another',
} as const

export const COMPARISON = {
  heading: 'Compare Your Picks',
  backButton: 'Back to Results',
  emptyMessage:
    'No sneakers selected for comparison. Go back to results to pick your favorites!',
  documentTitle: 'Compare Sneakers',
} as const

export const ERRORS = {
  retryButton: 'Try Again',
} as const

export const LOADING = {
  message: 'Loading sneaker recommendations...',
} as const
