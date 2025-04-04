import { UUID } from "crypto";

export interface Organization {
  id: UUID;
  code: number;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationListResult {
  total: number;
  list: Organization[];
}

export interface OrganizationInput {
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
}

export interface OrganizationResponse {
  id: string;
  name: string;
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}
