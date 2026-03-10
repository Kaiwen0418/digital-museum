export type Device = {
  id: string;
  year: number;
  name: string;
  era: string;
  specs: [string, string][];
};

export type ProgressCanvas = HTMLCanvasElement & {
  __updateProgress?: (value: number) => void;
};

export type ModelConfig = {
  path: string;
  scale: number;
  lift: number;
  yaw?: number;
  pitch?: number;
  offsetX?: number;
  brightness?: number;
  emissiveIntensity?: number;
  roughnessScale?: number;
  metalnessScale?: number;
};
