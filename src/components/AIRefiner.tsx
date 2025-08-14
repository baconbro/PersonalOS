import React, { useState } from 'react';
import { Search, Star, TrendingUp, Lightbulb, Check, AlertCircle } from 'lucide-react';
import { useFirebaseAI } from '../hooks/useFirebaseAI';
import { stripMarkdown, MarkdownText } from '../utils/markdown';
import './AISuggestions.css';

interface AIRefinerProps {
  type: 'life-goal';
  formData: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
    vision: string;
  };
  onRefinementApply?: (refinements: {
    title?: string;
    description?: string;
    vision?: string;
  }) => void;
  className?: string;
}

const AIRefiner: React.FC<AIRefinerProps> = ({
  formData,
  onRefinementApply,
  className = ''
}) => {
  const ai = useFirebaseAI();
  const [analysis, setAnalysis] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    refinedTitle?: string;
    refinedDescription?: string;
    refinedVision?: string;
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const hasEnoughContent = () => {
    return formData.title.trim().length > 0 && 
           formData.description.trim().length > 10 &&
           formData.vision.trim().length > 10;
  };

  const handleAnalyze = async () => {
    if (!hasEnoughContent()) return;
    
    try {
      setShowAnalysis(true);
      const result = await ai.refineLifeGoal(formData);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze goal:', error);
      setAnalysis(null);
    }
  };

  const applyRefinement = (field: 'title' | 'description' | 'vision', value: string) => {
    if (onRefinementApply) {
      // Strip markdown formatting when applying to form inputs
      const cleanValue = stripMarkdown(value);
      onRefinementApply({ [field]: cleanValue });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#22c55e'; // green
    if (score >= 6) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreText = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Work';
    return 'Poor';
  };

  if (!hasEnoughContent()) {
    return (
      <div className={`ai-suggestions ${className}`}>
        <div className="ai-setup-notice">
          <AlertCircle size={16} />
          <p>
            <strong>AI Goal Refiner</strong>
            <br />
            <small>
              Fill in your goal title, description, and vision to get AI-powered analysis and refinements.
            </small>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-suggestions ${className}`}>
      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className="btn btn-ai-generate"
          onClick={handleAnalyze}
          disabled={ai.loading}
          style={{
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          {ai.loading ? (
            <>
              <div className="animate-spin">⭐</div>
              Analyzing Goal...
            </>
          ) : (
            <>
              <Search size={16} />
              Analyze & Refine Goal
            </>
          )}
        </button>
      </div>

      {showAnalysis && analysis && (
        <div className="suggestions-content">
          {/* Score Section */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Star size={20} fill={getScoreColor(analysis.score)} color={getScoreColor(analysis.score)} />
              <strong style={{ color: getScoreColor(analysis.score) }}>
                Score: {analysis.score}/10 - {getScoreText(analysis.score)}
              </strong>
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                color: '#22c55e', 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <Check size={16} />
                Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151' }}>
                {analysis.strengths.map((strength, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <MarkdownText>{strength}</MarkdownText>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                color: '#f59e0b', 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <TrendingUp size={16} />
                Suggested Improvements
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#374151' }}>
                {analysis.improvements.map((improvement, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <MarkdownText>{improvement}</MarkdownText>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Refinement Suggestions */}
          {(analysis.refinedTitle || analysis.refinedDescription || analysis.refinedVision) && (
            <div>
              <h4 style={{ 
                color: '#8b5cf6', 
                margin: '0 0 0.5rem 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <Lightbulb size={16} />
                AI Refinements
              </h4>
              
              {analysis.refinedTitle && (
                <div style={{ 
                  background: '#faf5ff', 
                  border: '1px solid #d8b4fe', 
                  borderRadius: '6px', 
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginBottom: '0.25rem' }}>
                    Refined Title:
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <MarkdownText>{analysis.refinedTitle}</MarkdownText>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyRefinement('title', analysis.refinedTitle!)}
                    style={{
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {analysis.refinedDescription && (
                <div style={{ 
                  background: '#faf5ff', 
                  border: '1px solid #d8b4fe', 
                  borderRadius: '6px', 
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginBottom: '0.25rem' }}>
                    Refined Description:
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <MarkdownText>{analysis.refinedDescription}</MarkdownText>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyRefinement('description', analysis.refinedDescription!)}
                    style={{
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {analysis.refinedVision && (
                <div style={{ 
                  background: '#faf5ff', 
                  border: '1px solid #d8b4fe', 
                  borderRadius: '6px', 
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginBottom: '0.25rem' }}>
                    Refined Vision:
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <MarkdownText>{analysis.refinedVision}</MarkdownText>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyRefinement('vision', analysis.refinedVision!)}
                    style={{
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRefiner;
