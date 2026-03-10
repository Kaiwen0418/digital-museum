import { useMemo, useState } from 'react';
import { DEVICES } from '../data/devices';

export function useDeviceSelection() {
  const [selectedId, setSelectedId] = useState(DEVICES[0].id);

  const selected = useMemo(
    () => DEVICES.find((item) => item.id === selectedId) ?? DEVICES[0],
    [selectedId]
  );

  return { devices: DEVICES, selected, selectedId, setSelectedId };
}
