// Content type values are lowercase per API specification
export type ContentType = 'text' | 'image';

// Response DTOs (what we receive from the API)
export interface ContentItem {
  type: ContentType;
  value: string;
  // Note: API does not return id or displayOrder in ContentItemDto
}

export interface Section {
  id?: number;
  heading: string;
  content: ContentItem[];
  // Note: API does not return displayOrder in SectionDto
}

export interface Concept {
  id: number;
  title: string;
  description?: string;
  sections?: Section[];
  updatedAt: string; // ISO datetime string
  version: number;
  // Note: ConceptDetailDto does not include displayOrder or published
}

export interface ConceptListItem {
  id: number;
  title: string;
  description?: string;
  displayOrder?: number;
  published?: boolean;
  updatedAt: string; // ISO datetime string
  version: number;
}

// Request DTOs (what we send to the API)
export interface ContentItemRequest {
  type: ContentType;
  value: string;
  displayOrder?: number;
}

export interface SectionRequest {
  heading: string;
  displayOrder?: number;
  content: ContentItemRequest[];
}

export interface ConceptRequest {
  title: string;
  description?: string;
  displayOrder?: number;
  published?: boolean;
  sections?: SectionRequest[];
}

// Frontend-only types for managing state with order
export interface ContentItemWithOrder extends ContentItem {
  tempId: string; // For drag-and-drop before saving
  displayOrder: number;
}

export interface SectionWithOrder extends Omit<Section, 'content'> {
  tempId: string; // For drag-and-drop before saving
  displayOrder: number;
  content: ContentItemWithOrder[];
}

export interface ConceptFormData {
  title: string;
  description?: string;
  displayOrder?: number;
  published?: boolean;
  sections: SectionWithOrder[];
}
