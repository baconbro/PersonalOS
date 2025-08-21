import { useState } from 'react';
import { X, Heart, Zap, Brain } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CheckIn } from '../types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const moodEmojis = ['😴', '😞', '😐', '🙂', '😊', '🤩'];
const moodLabels = ['Exhausted', 'Low', 'Neutral', 'Good', 'Great', 'Amazing'];

function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const { dispatch, logActivity, createActivityLog } = useApp();
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [focusLevel, setFocusLevel] = useState<number>(3);
  const [moodIndex, setMoodIndex] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const checkIn: CheckIn = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        energyLevel,
        focusLevel,
        mood: moodEmojis[moodIndex],
        notes: notes.trim() || undefined,
      };

      // Add the check-in to state
      dispatch({ type: 'ADD_CHECK_IN', payload: checkIn });

      // Create activity log
      const activityLog = createActivityLog(
        'CHECK_IN_LOGGED',
        'Check-in logged',
        `Energy: ${energyLevel}/5 • Focus: ${focusLevel}/5 • Mood: ${moodEmojis[moodIndex]}${notes ? ` • Notes: ${notes}` : ''}`,
        checkIn.id,
        'check_in',
        {
          energyLevel,
          focusLevel,
          mood: moodEmojis[moodIndex],
          moodLabel: moodLabels[moodIndex],
          notes: notes.trim() || undefined
        }
      );

      logActivity(activityLog);

      // Reset form
      setEnergyLevel(3);
      setFocusLevel(3);
      setMoodIndex(3);
      setNotes('');
      
      onClose();
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={24} />
            Check-In
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: '0 0 1.5rem 0', color: '#666', lineHeight: 1.5 }}>
            Take a moment to check in with yourself. How are you feeling right now?
          </p>

          {/* Energy Level */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              <Zap size={16} />
              Energy Level: {energyLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Focus Level */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              <Brain size={16} />
              Focus Level: {focusLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={focusLevel}
              onChange={(e) => setFocusLevel(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              <span>Scattered</span>
              <span>Laser-focused</span>
            </div>
          </div>

          {/* Mood Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: '600'
            }}>
              Mood: {moodEmojis[moodIndex]} {moodLabels[moodIndex]}
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)', 
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMoodIndex(index)}
                  style={{
                    padding: '0.75rem',
                    border: moodIndex === index ? '3px solid #667eea' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    background: moodIndex === index ? '#f7fafc' : 'white',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.75rem', 
              color: '#666' 
            }}>
              <span>Exhausted</span>
              <span>Amazing</span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: isSubmitting ? '#94a3b8' : '#667eea',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Check-in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckInModal;
