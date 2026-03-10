import type { DeviceItem } from '../types/device';

export const DEVICES: DeviceItem[] = [
  {
    id: 'nokia-3310',
    year: 2004,
    name: 'Nokia 3310',
    brand: 'Nokia',
    kind: 'phone',
    era: 'Early Mobile',
    tagline: 'Reliable brick with iconic keypad memories.',
    specs: [
      { label: 'Display', value: '84×48 Monochrome' },
      { label: 'Battery', value: '~900mAh' },
      { label: 'Network', value: '2G GSM' }
    ],
    albumCover: 'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ipod-nano',
    year: 2010,
    name: 'iPod nano',
    brand: 'Apple',
    kind: 'music',
    era: 'Portable Music',
    tagline: 'Pocket-size music era in anodized aluminum.',
    specs: [
      { label: 'Storage', value: '8GB / 16GB' },
      { label: 'Display', value: 'Multi-Touch' },
      { label: 'Focus', value: 'Music + Fitness' }
    ],
    albumCover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mi-band',
    year: 2018,
    name: 'Xiaomi Mi Band',
    brand: 'Xiaomi',
    kind: 'wearable',
    era: 'Wearables',
    tagline: 'Minimal tracker that normalized daily metrics.',
    specs: [
      { label: 'Sensors', value: 'HR + Steps + Sleep' },
      { label: 'Battery', value: 'Up to 20 days' },
      { label: 'Display', value: 'AMOLED' }
    ],
    albumCover: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'wacom-bamboo',
    year: 2021,
    name: 'Wacom Tablet',
    brand: 'Wacom',
    kind: 'tablet',
    era: 'Creative Tools',
    tagline: 'Precision input bridge between hand and pixels.',
    specs: [
      { label: 'Input', value: 'Pen + Pressure' },
      { label: 'Use Case', value: 'Drawing / Notes' },
      { label: 'Connection', value: 'USB / BT' }
    ],
    albumCover: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=600&q=80'
  }
];
