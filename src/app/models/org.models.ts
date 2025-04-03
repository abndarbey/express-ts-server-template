import { UUID } from "crypto";

export interface Organization {
  id: UUID;
  code: number; // Using number for int64
  name: string;
  website: string | null;
  pan: string | null;
  tan: string | null;
  gst: string | null;
  cin: string | null;
  logo: UUID | null;
  sector: string;
  status: string;
  isFinal: boolean;
  isArchived: boolean;
  createdAt: Date; // Using Date for time.Time
  updatedAt: Date;
}

export interface OrganizationListResult {
  total: number;
  list: Organization[];
}

export interface CreateOrganizationInput {
  name: string;
  description?: string;
  website?: string;
}

export interface UpdateOrganizationInput {
  id: string;
  name?: string;
  description?: string;
  website?: string;
}

export interface OrganizationFilter {
  id?: string;
  name?: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}
