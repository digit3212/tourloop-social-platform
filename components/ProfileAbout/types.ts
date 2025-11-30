export type PrivacyLevel = 'public' | 'friends' | 'only_me';
export type PlaceType = 'current' | 'hometown';
export type SectionType = 'overview' | 'work' | 'places' | 'contact' | 'family' | 'details' | 'events';

export interface Work {
  id: string;
  role: string;
  company: string;
  privacy: PrivacyLevel;
}

export interface University {
  id: string;
  name: string;
  degree: string;
  major: string;
  year: string;
  privacy: PrivacyLevel;
}

export interface School {
  id: string;
  name: string;
  year: string;
  privacy: PrivacyLevel;
}

export interface Place {
  id: string;
  type: PlaceType;
  country: string;
  city: string;
  privacy: PrivacyLevel;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  privacy: PrivacyLevel;
}

export interface Website {
  id: string;
  url: string;
  privacy: PrivacyLevel;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  privacy: PrivacyLevel;
}

export interface Relationship {
  status: string;
  partner?: string;
  year?: string;
  month?: string;
  day?: string;
  privacy: PrivacyLevel;
}

export interface OtherName {
  id: string;
  name: string;
  type: string;
  privacy: PrivacyLevel;
}

export interface LifeEvent {
  id: string;
  title: string;
  location: string;
  description: string;
  year: string;
  privacy: PrivacyLevel;
}
