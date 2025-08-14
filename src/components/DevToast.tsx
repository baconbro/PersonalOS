import React, { useState } from 'react';
import { X, Code, MessageSquare, Hash } from 'lucide-react';
import './DevToast.css';

interface AIQuery {
  id: string;
  timestamp: Date;
  query: string;
  context: string;
  tokenCount?: number;
  responseTokens?: number;
}

interface DevToastProps {
  query: AIQuery;
  onDismiss: (id: string) => void;
}

const DevToast: React.FC<DevToastProps> = ({ query, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Remove auto-dismiss functionality - user must manually dismiss
  // useEffect(() => {
  //   // Auto-dismiss after 8 seconds
  //   const timer = setTimeout(() => {
  //     setIsVisible(false);
  //     setTimeout(() => onDismiss(query.id), 300); // Wait for fade out animation
  //   }, 8000);

  //   return () => clearTimeout(timer);
  // }, [query.id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(query.id), 300);
  };

  const formatQuery = (query: string) => {
    // Show the complete prompt without truncation
    return query;
  };

  const estimateTokens = (text: string): number => {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  };

  const inputTokens = query.tokenCount || estimateTokens(query.query);
  const outputTokens = query.responseTokens || 0;
  const totalTokens = inputTokens + outputTokens;

  return (
    <div className={`dev-toast ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="dev-toast-header">
        <div className="dev-toast-title">
          <Code size={16} />
          <span>AI Query Debug</span>
          <span className="dev-toast-context">{query.context}</span>
        </div>
        <button className="dev-toast-close" onClick={handleDismiss}>
          <X size={16} />
        </button>
      </div>
      
      <div className="dev-toast-content">
        <div className="dev-toast-query">
          <MessageSquare size={14} />
          <span className="dev-toast-label">Query:</span>
          <code className="dev-toast-code">{formatQuery(query.query)}</code>
        </div>
        
        <div className="dev-toast-tokens">
          <Hash size={14} />
          <span className="dev-toast-label">Tokens:</span>
          <div className="token-info">
            <span className="token-stat">Input: {inputTokens}</span>
            {outputTokens > 0 && <span className="token-stat">Output: {outputTokens}</span>}
            <span className="token-stat total">Total: {totalTokens}</span>
          </div>
        </div>
        
        <div className="dev-toast-timestamp">
          {query.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default DevToast;
