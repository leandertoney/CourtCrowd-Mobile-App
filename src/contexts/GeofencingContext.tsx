/**
 * Geofencing Context
 * Provides global access to geofencing state and functions
 */

import React, {createContext, useContext, ReactNode} from 'react';
import {
  useRadarGeofencing,
  GeofencingState,
} from '../hooks/useRadarGeofencing';

interface GeofencingContextValue extends GeofencingState {
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  enableTracking: () => Promise<boolean>;
  disableTracking: () => void;
  manualCheckIn: (courtId: string) => Promise<boolean>;
  manualCheckOut: () => Promise<boolean>;
  forceLocationCheck: () => Promise<{latitude: number; longitude: number} | null>;
}

const GeofencingContext = createContext<GeofencingContextValue | null>(null);

interface GeofencingProviderProps {
  children: ReactNode;
  autoStart?: boolean;
  showAlerts?: boolean;
}

export function GeofencingProvider({
  children,
  autoStart = true,
  showAlerts = true,
}: GeofencingProviderProps) {
  const geofencing = useRadarGeofencing({autoStart, showAlerts});

  return (
    <GeofencingContext.Provider value={geofencing}>
      {children}
    </GeofencingContext.Provider>
  );
}

export function useGeofencing(): GeofencingContextValue {
  const context = useContext(GeofencingContext);

  if (!context) {
    throw new Error('useGeofencing must be used within a GeofencingProvider');
  }

  return context;
}

/**
 * Hook that safely checks geofencing without requiring provider
 * Returns null if provider not available
 */
export function useGeofencingSafe(): GeofencingContextValue | null {
  return useContext(GeofencingContext);
}
