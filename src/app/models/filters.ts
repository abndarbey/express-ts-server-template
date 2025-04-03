import { SortByType, SortDirType } from "@/app/models/enums";
import { UUID } from "crypto";

// Search filter parameters for database queries
export interface SearchFilter {
  text?: string;
  sortBy: SortByType;
  sortDir: SortDirType;
  offset: number;
  limit: number;
  isFinal?: boolean;
  isAccepted?: boolean;
  isApproved?: boolean;
  isArchived?: boolean;
  orgId?: UUID;
  creatorId?: UUID;
}

// Default search filter with preset values
export const defaultSearchFilter: SearchFilter = {
  sortBy: SortByType.DATE_CREATED,
  sortDir: SortDirType.ASCENDING,
  offset: 0,
  limit: 10,
};

/**
 * Create a search filter with default values applied
 * @param filter - Partial search filter
 * @returns Complete search filter with defaults applied
 */
export function createSearchFilter(
  filter: Partial<SearchFilter> = {}
): SearchFilter {
  return {
    ...defaultSearchFilter,
    ...filter,
  };
}
