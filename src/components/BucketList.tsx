import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { BucketListItem } from '../types';
import { Plus, Check, Trash2, Edit2, X } from 'lucide-react';
import './BucketList.css';

export function BucketList() {
  const { state, dispatch } = useApp();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim()) {
      const newItem: BucketListItem = {
        id: crypto.randomUUID(),
        title: newItemTitle.trim(),
        completed: false,
        createdAt: new Date(),
      };
      dispatch({ type: 'ADD_BUCKET_ITEM', payload: newItem });
      setNewItemTitle('');
    }
  };

  const handleToggleComplete = (id: string) => {
    dispatch({ type: 'TOGGLE_BUCKET_ITEM', payload: id });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_BUCKET_ITEM', payload: id });
  };

  const handleStartEdit = (item: BucketListItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = (item: BucketListItem) => {
    if (editingTitle.trim()) {
      dispatch({
        type: 'UPDATE_BUCKET_ITEM',
        payload: { ...item, title: editingTitle.trim() },
      });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const activeItems = state.bucketList.filter(item => !item.completed);
  const completedItems = state.bucketList.filter(item => item.completed);

  return (
    <div className="bucket-list-container">
      <div className="bucket-list-header">
        <h1>🪣 Bucket List</h1>
        <p className="bucket-list-subtitle">
          Things you want to do, experiences to have, and dreams to achieve
        </p>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="What do you want to accomplish?"
          className="add-item-input"
        />
        <button type="submit" className="add-item-button">
          <Plus size={20} />
          Add
        </button>
      </form>

      {/* Active Items */}
      <div className="bucket-list-section">
        <h2 className="section-title">To Do ({activeItems.length})</h2>
        <div className="bucket-list-items">
          {activeItems.length === 0 ? (
            <p className="empty-state">No items yet. Add your first bucket list item above!</p>
          ) : (
            activeItems.map((item) => (
              <div key={item.id} className="bucket-item">
                {editingId === item.id ? (
                  <div className="edit-item-container">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="edit-item-input"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(item)}
                      className="icon-button save-button"
                      title="Save"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="icon-button cancel-button"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className="checkbox-button"
                      title="Mark as complete"
                    >
                      <div className="checkbox"></div>
                    </button>
                    <span className="item-title">{item.title}</span>
                    <div className="item-actions">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="icon-button edit-button"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="icon-button delete-button"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div className="bucket-list-section">
          <h2 className="section-title">Completed ({completedItems.length})</h2>
          <div className="bucket-list-items">
            {completedItems.map((item) => (
              <div key={item.id} className="bucket-item completed">
                <button
                  onClick={() => handleToggleComplete(item.id)}
                  className="checkbox-button"
                  title="Mark as incomplete"
                >
                  <div className="checkbox checked">
                    <Check size={16} />
                  </div>
                </button>
                <span className="item-title">{item.title}</span>
                <div className="item-actions">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="icon-button delete-button"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
