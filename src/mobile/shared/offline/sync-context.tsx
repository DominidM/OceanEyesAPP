import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useConnectivity } from './connectivity-context';
import {
  getSyncState,
  initSyncEngine,
  requestSync,
  subscribeSync,
  type SyncState,
} from './sync-engine';

type SyncContextValue = SyncState & {
  online: boolean;
  requestSync: () => void;
};

const SyncContext = createContext<SyncContextValue>({
  ...getSyncState(),
  online: true,
  requestSync: () => undefined,
});

export function SyncProvider({ children }: React.PropsWithChildren) {
  const { online } = useConnectivity();
  const onlineRef = useRef(online);
  onlineRef.current = online;
  const [syncState, setSyncState] = useState<SyncState>(getSyncState);

  useEffect(() => {
    initSyncEngine({ getOnline: () => onlineRef.current });
  }, []);

  useEffect(() => subscribeSync(setSyncState), []);

  useEffect(() => {
    if (online) void requestSync('connectivity');
  }, [online]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') void requestSync('foreground');
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<SyncContextValue>(
    () => ({ ...syncState, online, requestSync: () => void requestSync('manual') }),
    [syncState, online],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  return useContext(SyncContext);
}
