import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Lightbulb, Target, Calendar, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { chatbotService, type ChatMessage, type ContextualInsight } from '../services/chatbotService';
import './AIChatbot.css';

interface AIChatbotProps {
  context: string;
  isVisible?: boolean;
  onToggle?: () => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ 
  context, 
  isVisible = false, 
  onToggle 
}) => {
  const { state, dispatch, logActivity, createActivityLog } = useApp();
  const [isOpen, setIsOpen] = useState(isVisible);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [insights, setInsights] = useState<ContextualInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate contextual insights when context or state changes
  useEffect(() => {
    const contextualInsights = chatbotService.generateContextualInsights(context, state);
    setInsights(contextualInsights.slice(0, 3)); // Show top 3 insights
  }, [context, state]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Sync with parent visibility prop
  useEffect(() => {
    setIsOpen(isVisible);
  }, [isVisible]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle?.();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await chatbotService.processUserMessage(message, context, state);
      setChatHistory([...chatbotService.getChatHistory()]);
      setMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInsightClick = (insight: ContextualInsight) => {
    if (insight.actionable) {
      setMessage(`Tell me more about: ${insight.title}`);
    }
  };

  const handleAcceptTask = async (taskSuggestion: any) => {
    try {
      // Create a weekly task from the suggestion
      const newTask = {
        id: crypto.randomUUID(),
        title: taskSuggestion.title,
        description: taskSuggestion.description,
        quarterlyGoalId: taskSuggestion.quarterlyGoalId || '',
        priority: taskSuggestion.priority,
        estimatedHours: taskSuggestion.estimatedHours,
        completed: false,
        status: 'todo' as const,
        weekOf: new Date(),
        roadblocks: [],
        notes: `Suggested by AI: ${taskSuggestion.reasoning}`
      };

      // Add the task to state
      dispatch({ type: 'ADD_WEEKLY_TASK', payload: newTask });

      // Log activity
      const activityLog = createActivityLog(
        'WEEKLY_TASK_CREATED',
        'AI suggested task accepted',
        `Created task: ${newTask.title}`,
        newTask.id,
        'weekly_task',
        { 
          source: 'ai_suggestion',
          originalSuggestion: taskSuggestion 
        }
      );
      logActivity(activityLog);

      // Mark the suggestion as accepted in chat history
      const updatedHistory = chatHistory.map(msg => {
        if (msg.taskSuggestion?.id === taskSuggestion.id) {
          return {
            ...msg,
            taskSuggestion: {
              ...msg.taskSuggestion,
              accepted: true
            }
          } as ChatMessage;
        }
        return msg;
      });
      setChatHistory(updatedHistory);

    } catch (error) {
      console.error('Error accepting task suggestion:', error);
    }
  };

  const handleSnoozeTask = (taskSuggestion: any) => {
    // Mark the suggestion as snoozed in chat history
    const updatedHistory = chatHistory.map(msg => {
      if (msg.taskSuggestion?.id === taskSuggestion.id) {
        return {
          ...msg,
          taskSuggestion: {
            ...msg.taskSuggestion,
            snoozed: true,
            snoozeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Snooze for 24 hours
          }
        } as ChatMessage;
      }
      return msg;
    });
    setChatHistory(updatedHistory);
  };

  const getContextIcon = () => {
    switch (context) {
      case 'life-goals-adding':
      case 'life-goals-viewing':
        return <Target size={16} />;
      case 'annual-plan':
      case 'quarterly-goals':
        return <Calendar size={16} />;
      default:
        return <Lightbulb size={16} />;
    }
  };

  const getContextLabel = () => {
    switch (context) {
      case 'life-goals-adding':
        return 'Life Goal Creation';
      case 'life-goals-viewing':
        return 'Life Goals Overview';
      case 'annual-plan':
        return 'Annual Planning';
      case 'quarterly-goals':
        return 'Quarterly OKRs';
      case 'weekly-dashboard':
        return 'Weekly Execution';
      case 'weekly-huddle':
        return 'Weekly Command Huddle';
      default:
        return 'Personal OS';
    }
  };

  const getInsightIcon = (type: ContextualInsight['type']) => {
    switch (type) {
      case 'recommendation':
        return '💡';
      case 'reflection':
        return '🤔';
      case 'planning':
        return '🎯';
      case 'warning':
        return '⚠️';
      case 'celebration':
        return '🎉';
      default:
        return '💭';
    }
  };

  if (!isOpen) {
    return (
      <div className="chatbot-fab" onClick={handleToggle}>
        <MessageCircle size={24} />
        {insights.length > 0 && (
          <div className="insight-indicator">
            {insights.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-context">
          {getContextIcon()}
          <span>AI Assistant - {getContextLabel()}</span>
        </div>
        <button className="chatbot-close" onClick={handleToggle}>
          <X size={20} />
        </button>
      </div>

      <div className="chatbot-content">
        {/* Contextual Insights */}
        {insights.length > 0 && (
          <div className="insights-section">
            <div 
              className="insights-header"
              onClick={() => setShowInsights(!showInsights)}
            >
              <span>✨ Contextual Insights</span>
              <ChevronDown 
                size={16} 
                className={`insights-toggle ${showInsights ? 'expanded' : ''}`} 
              />
            </div>
            
            {showInsights && (
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`insight-card ${insight.type} ${insight.actionable ? 'actionable' : ''}`}
                    onClick={() => handleInsightClick(insight)}
                  >
                    <div className="insight-header">
                      <span className="insight-emoji">{getInsightIcon(insight.type)}</span>
                      <span className="insight-title">{insight.title}</span>
                    </div>
                    <p className="insight-content">{insight.content}</p>
                    {insight.actionable && (
                      <div className="insight-action">
                        Click to explore →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat History */}
        <div className="chat-history">
          {chatHistory.length === 0 && (
            <div className="chat-welcome">
              <MessageCircle size={32} />
              <h3>Your AI Strategic Advisor</h3>
              <p>I'm here to help you optimize your personal execution system. Ask me about goal setting, planning, or next steps!</p>
            </div>
          )}
          
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
              {msg.taskSuggestion && !msg.taskSuggestion.accepted && !msg.taskSuggestion.snoozed && (
                <div className="task-suggestion-card">
                  <div className="task-suggestion-header">
                    <Target size={16} />
                    <span className="task-suggestion-title">Suggested Task</span>
                    <span className={`priority-badge ${msg.taskSuggestion.priority}`}>
                      {msg.taskSuggestion.priority}
                    </span>
                  </div>
                  
                  <h4 className="suggested-task-title">{msg.taskSuggestion.title}</h4>
                  <p className="suggested-task-description">{msg.taskSuggestion.description}</p>
                  
                  {msg.taskSuggestion.quarterlyGoalTitle && (
                    <div className="task-goal-connection">
                      <Calendar size={14} />
                      <span>Advances: {msg.taskSuggestion.quarterlyGoalTitle}</span>
                    </div>
                  )}
                  
                  <div className="task-details">
                    <span className="estimated-hours">
                      ⏱ {msg.taskSuggestion.estimatedHours}h estimated
                    </span>
                  </div>
                  
                  <div className="task-reasoning">
                    <strong>Why this task?</strong> {msg.taskSuggestion.reasoning}
                  </div>
                  
                  <div className="task-suggestion-actions">
                    <button 
                      className="accept-task-btn"
                      onClick={() => handleAcceptTask(msg.taskSuggestion)}
                    >
                      <CheckCircle size={16} />
                      Accept & Add to This Week
                    </button>
                    <button 
                      className="snooze-task-btn"
                      onClick={() => handleSnoozeTask(msg.taskSuggestion)}
                    >
                      <Clock size={16} />
                      Snooze
                    </button>
                  </div>
                </div>
              )}
              {msg.taskSuggestion?.accepted && (
                <div className="task-suggestion-accepted">
                  <CheckCircle size={16} />
                  <span>Task added to your weekly tasks!</span>
                </div>
              )}
              {msg.taskSuggestion?.snoozed && (
                <div className="task-suggestion-snoozed">
                  <Clock size={16} />
                  <span>Task suggestion snoozed</span>
                </div>
              )}
              <div className="message-timestamp">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message assistant loading">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="chat-input-container">
          <div className="chat-input">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me for insights, recommendations, or help with planning..."
              rows={1}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="send-button"
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="quick-actions">
            <button 
              onClick={() => setMessage("How am I doing overall?")}
              className="quick-action"
            >
              📊 Progress Check
            </button>
            <button 
              onClick={() => setMessage("What should I focus on next?")}
              className="quick-action"
            >
              🎯 Next Steps
            </button>
            <button 
              onClick={() => setMessage("I'm feeling stuck, help me")}
              className="quick-action"
            >
              💭 Get Unstuck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
