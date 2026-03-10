import { useCallback } from 'react';

export function useDeviceInteraction() {
  const onDeviceTap = useCallback(() => {
    // Reserved: future real interaction logic (buttons, knobs, screens, etc.)
  }, []);

  const onModelReady = useCallback(() => {
    // Reserved: future model analytics, loading states, and feature flags.
  }, []);

  return { onDeviceTap, onModelReady };
}
