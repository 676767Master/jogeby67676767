/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProfileInfo {
  name: string;
  englishName: string;
  department: string;
  tags: string[];
  email: string;
  bio: string;
  avatarUrl: string;
  uploadedVideoUrl?: string;
  model3dPhotos?: string[];
  journeyLinks?: Record<string, string>;
  buttonLink1?: string;
  buttonLabel1?: string;
  buttonLink2?: string;
  buttonLabel2?: string;
  bottomButtonLink?: string;
  bottomButtonLabel?: string;
  model3dLinks?: Record<string, string>;
}

export interface LocationDetail {
  id: string;
  yearMonth: string;
  title: string;
  country: string;
  city: string;
  details: string[];
}

export interface DayItineraryEvent {
  id: string;
  time: string;
  category: string; // e.g., '行衣', '食他', '住行', '住他', '乘伙', '魚付', '住'
  title: string;
  details: string[];
}

export interface DayItinerary {
  dayNumber: number;
  badge: string; // e.g., '【起點】', '【亮點】', '【尋秘】', '【巔峰】'
  destination: string; // e.g., '羅馬 - 跨越國界的優雅'
  imageUrl: string;
  events: DayItineraryEvent[];
}

export interface ResumeData {
  profile: ProfileInfo;
  experiences: LocationDetail[];
  itineraries: DayItinerary[];
}
