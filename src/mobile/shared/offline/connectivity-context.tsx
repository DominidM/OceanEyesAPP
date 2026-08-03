import * as Network from 'expo-network';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ConnectivityContextValue = {
  online: boolean;
  type: Network.NetworkStateType | null;
};

const ConnectivityContext = createContext<ConnectivityContextValue>({ online: true, type: null });

export function ConnectivityProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<Network.NetworkState | null>(null);

  useEffect(() => {
    let mounted = true;
    Network.getNetworkStateAsync()
      .then((next) => {
        if (mounted) setState(next);
      })
      .catch(() => undefined);

    const subscription = Network.addNetworkStateListener((next) => {
      if (mounted) setState(next);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const online =
    state == null ? true : state.isConnected === true && state.isInternetReachable !== false;

  return (
    <ConnectivityContext.Provider value={{ online, type: state?.type ?? null }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
