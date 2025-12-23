export const SLOT_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
} as const;

export const SLOT_STATUS_LABELS = {
  [SLOT_STATUS.CONFIRMED]: 'Confirmed',
  [SLOT_STATUS.PENDING]: 'Pending',
  [SLOT_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const TAB_FILTERS = {
  ALL: 'all',
  UPCOMING: 'upcoming',
  PAST: 'past',
} as const;

export type SlotStatus = typeof SLOT_STATUS[keyof typeof SLOT_STATUS];
export type TabFilter = typeof TAB_FILTERS[keyof typeof TAB_FILTERS];
