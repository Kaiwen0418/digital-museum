import type { Device, ModelConfig } from '../types/device';

export const DEVICES: Device[] = [
  { id: 'MI-BAND', year: 2008, name: 'CASIO F-91W', era: 'Digital Watches', specs: [['Display', 'LCD'], ['Functions', 'Alarm + Stopwatch'], ['Battery', 'Long Life Quartz']] },
  { id: 'SONY-WALKMAN', year: 2009, name: 'SONY WALKMAN', era: 'Portable Audio', specs: [['Format', 'Cassette'], ['Focus', 'Record + Playback'], ['Build', 'Field Recorder']] },
  { id: 'NOKIA-3310', year: 2010, name: 'NOKIA 3310', era: 'Early Mobile', specs: [['Display', '84×48'], ['Network', '2G GSM'], ['Battery', '900mAh']] },
  { id: 'IPOD-NANO', year: 2012, name: 'IPOD NANO', era: 'Portable Music', specs: [['Storage', '16GB'], ['Input', 'Touch'], ['Focus', 'Music']] },
  { id: 'SAMSUNG-GALAXY', year: 2014, name: 'SAMSUNG GALAXY MINI II', era: 'Android Phones', specs: [['Display', '3.27-inch TFT'], ['System', 'Android'], ['Focus', 'Compact Smartphone']] },
  { id: 'WACOM-TABLET', year: 2016, name: 'WACOM TABLET', era: 'Creative Tools', specs: [['Input', 'Pen'], ['Use', 'Drawing'], ['Connect', 'USB/BT']] },
  { id: 'MACBOOK-M4', year: 2025, name: 'MACBOOK M4', era: 'Personal Computing', specs: [['Chip', 'Apple M4'], ['Form', 'Laptop'], ['Focus', 'Work + Create']] }
];

export const TIMELINE_DETAIL_TICKS = [-0.8, -0.45, -0.2, 0.35, 0.7, 1.35, 1.7, 2.35, 2.7, 3.2, 3.5, 3.8];
export const SNAP_THRESHOLD = 1.92;
export const PREVIEW_RANGE = 0.86;
export const SNAP_CAPTURE_RADIUS = 0.54;

export const MODEL_CONFIGS: Partial<Record<Device['id'], ModelConfig>> = {
  'MI-BAND': { path: 'models/casio_f-91w/scene.gltf', scale: 1.7, lift: 0.4, yaw: Math.PI * 1.22, pitch: Math.PI * 0.5 },
  'NOKIA-3310': { path: 'models/nokia_3310/scene.gltf', scale: 2.55, lift: 0.04, yaw: Math.PI * 0.14 },
  'SONY-WALKMAN': { path: 'models/sony_walkman_professional_wm-d6c/scene.gltf', scale: 3.2, lift: 0.02, yaw: Math.PI * 0.52, offsetX: -0.98 },
  'IPOD-NANO': { path: 'models/ipod/scene.gltf', scale: 2.85, lift: 0.02, yaw: Math.PI * 0.42, pitch: Math.PI * 0.5 },
  'SAMSUNG-GALAXY': { path: 'models/samsung_galaxy_s4/scene.gltf', scale: 3.25, lift: 0.03, yaw: Math.PI * 0.28 },
  'WACOM-TABLET': { path: 'models/wacom_intuos_ctl-4100k-n/scene.gltf', scale: 3.9, lift: 0.02, yaw: Math.PI * 0.44 },
  'MACBOOK-M4': { path: 'models/macbook_m4/scene.gltf', scale: 3.5, lift: 0.2, yaw: Math.PI * 0.8, pitch: Math.PI * 0.2 }
};
