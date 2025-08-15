import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useFirebaseAI } from '../hooks/useFirebaseAI';
import { stripMarkdown, MarkdownText } from '../utils/markdown';
import './AISuggestions.css';

interface AISuggestionsProps {
  type: 'annual-goals' | 'quarterly-okrs' | 'weekly-review' | 'life-goals';
  sourceData: any;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  type,
  sourceData,
  onSuggestionSelect,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ai = useFirebaseAI();

  const handleGenerateSuggestions = async () => {
    try {
      setIsVisible(true);
      let result;
      
      switch (type) {
        case 'annual-goals':
          result = await ai.generateAnnualGoalSuggestions(sourceData);
          break;
        case 'quarterly-okrs':
          result = await ai.generateQuarterlyOKRSuggestions(sourceData);
          break;
        case 'weekly-review':
          result = await ai.analyzeWeeklyReview(sourceData);
          break;
        case 'life-goals':
          result = await ai.generateLifeGoalSuggestions(sourceData);
          break;
        default:
          throw new Error('Invalid suggestion type');
      }
      
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionSelect) {
      // Strip markdown formatting when applying to form inputs
      const cleanSuggestion = stripMarkdown(suggestion);
      onSuggestionSelect(cleanSuggestion);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'annual-goals':
        return 'AI Annual Goal Suggestions';
      case 'quarterly-okrs':
        return 'AI OKR Suggestions';
      case 'weekly-review':
        return 'AI Weekly Review Analysis';
      case 'life-goals':
        return 'AI Life Goal Suggestions';
      default:
        return 'AI Suggestions';
    }
  };

  const isConfigured = () => {
    // Check if Firebase is properly configured for AI
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    return projectId && apiKey && projectId !== 'your-project-id' && apiKey !== 'your-api-key';
  };

  if (!isConfigured()) {
    return (
      <div className={`ai-suggestions not-configured ${className}`}>
        <div className="ai-setup-notice">
          <AlertCircle size={16} />
          <p>
            AI suggestions require Firebase to be properly configured. 
            <br />
            <small>
              Configure your Firebase project in the environment variables 
              to enable AI-powered suggestions.
            </small>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-suggestions ${className}`}>
      {!isVisible ? (
        <button
          className="btn-ai-generate"
          onClick={handleGenerateSuggestions}
          disabled={ai.loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          {ai.loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          Get AI Suggestions
        </button>
      ) : (
        <div className="ai-suggestions-panel" style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          backgroundColor: '#fafafa',
          marginTop: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            color: '#8b5cf6',
            fontWeight: '600'
          }}>
            <Sparkles size={16} />
            {getTitle()}
          </div>

          {ai.loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
              <Loader2 size={16} className="animate-spin" />
              Generating suggestions...
            </div>
          ) : ai.error ? (
            <div style={{ color: '#ef4444', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
              {ai.error}
            </div>
          ) : suggestions ? (
            <div className="suggestions-content">
              {type === 'quarterly-okrs' && suggestions.objectives && suggestions.keyResults ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Objectives:</h4>
                    {suggestions.objectives.map((obj: string, index: number) => (
                      <div 
                        key={index}
                        onClick={() => handleSuggestionClick(obj)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          marginBottom: '0.25rem',
                          cursor: onSuggestionSelect ? 'pointer' : 'default',
                          fontSize: '0.9rem'
                        }}
                      >
                        • <MarkdownText>{obj}</MarkdownText>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Key Results:</h4>
                    {suggestions.keyResults.map((kr: string, index: number) => (
                      <div 
                        key={index}
                        onClick={() => handleSuggestionClick(kr)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          marginBottom: '0.25rem',
                          cursor: onSuggestionSelect ? 'pointer' : 'default',
                          fontSize: '0.9rem'
                        }}
                      >
                        • <MarkdownText>{kr}</MarkdownText>
                      </div>
                    ))}
                  </div>
                </>
              ) : type === 'weekly-review' && suggestions.insights ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Insights:</h4>
                    {suggestions.insights.map((insight: string, index: number) => (
                      <div key={index} style={{
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '0.25rem',
                        fontSize: '0.9rem'
                      }}>
                        💡 <MarkdownText>{insight}</MarkdownText>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Suggestions:</h4>
                    {suggestions.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} style={{
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '0.25rem',
                        fontSize: '0.9rem'
                      }}>
                        🎯 <MarkdownText>{suggestion}</MarkdownText>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Focus Areas:</h4>
                    {suggestions.focus_areas.map((area: string, index: number) => (
                      <div key={index} style={{
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        marginBottom: '0.25rem',
                        fontSize: '0.9rem'
                      }}>
                        🔍 <MarkdownText>{area}</MarkdownText>
                      </div>
                    ))}
                  </div>
                </>
              ) : Array.isArray(suggestions) ? (
                // For annual goals and simple arrays
                suggestions.map((suggestion: string, index: number) => (
                  <div 
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      cursor: onSuggestionSelect ? 'pointer' : 'default',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (onSuggestionSelect) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    • <MarkdownText>{suggestion}</MarkdownText>
                  </div>
                ))
              ) : (
                // For life goals with categories
                Object.entries(suggestions).map(([category, goals]) => (
                  <div key={category} style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>{category}:</h4>
                    {(goals as string[]).map((goal: string, index: number) => (
                      <div 
                        key={index}
                        onClick={() => handleSuggestionClick(goal)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          marginBottom: '0.25rem',
                          cursor: onSuggestionSelect ? 'pointer' : 'default',
                          fontSize: '0.9rem'
                        }}
                      >
                        • <MarkdownText>{goal}</MarkdownText>
                      </div>
                    ))}
                  </div>
                ))
              )}
              
              <button
                onClick={() => setIsVisible(false)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Hide Suggestions
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
