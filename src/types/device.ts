export type DeviceKind = 'phone' | 'music' | 'wearable' | 'tablet';

export type DeviceItem = {
  id: string;
  year: number;
  name: string;
  brand: string;
  kind: DeviceKind;
  era: string;
  tagline: string;
  specs: Array<{ label: string; value: string }>;
  albumCover: string;
};
