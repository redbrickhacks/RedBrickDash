export interface Track {
  id: number;
  name: string;
  sdgNumber: number;
  description: string;
}

export enum TrackId {
  QUALITY_EDUCATION = 1,
  SUSTAINABLE_CITIES = 2,
  CLIMATE_ACTION = 3,
}
