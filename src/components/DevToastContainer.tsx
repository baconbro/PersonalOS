import React, { useState, useEffect } from 'react';
import DevToast from './DevToast';
import { devToastService, type AIQueryData } from '../services/devToastService';

const DevToastContainer: React.FC = () => {
  const [queries, setQueries] = useState<AIQueryData[]>([]);

  useEffect(() => {
    if (!devToastService.isDev()) return;

    const unsubscribe = devToastService.subscribe(setQueries);
    return unsubscribe;
  }, []);

  const handleDismiss = (queryId: string) => {
    devToastService.dismissQuery(queryId);
  };

  if (!devToastService.isDev() || queries.length === 0) {
    return null;
  }

  return (
    <div className="dev-toast-container">
      {queries.slice(0, 5).map((query) => (
        <DevToast
          key={query.id}
          query={query}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
};

export default DevToastContainer;
