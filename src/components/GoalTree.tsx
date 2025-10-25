import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../hooks/useRouter';
import { 
  ChevronDown, 
  ChevronRight, 
  ArrowLeft, 
  Target, 
  Calendar, 
  CheckSquare, 
  Heart,
  Brain,
  Briefcase,
  DollarSign,
  Activity,
  Users,
  Compass,
  Building,
  Plane,
  Gift,
  GitBranch,
  Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import type { LifeGoal, AnnualGoal, QuarterlyGoal, WeeklyTask, LifeGoalCategory } from '../types';
import './GoalTree.css';

interface TreeNode {
  id: string;
  type: 'life' | 'annual' | 'quarterly' | 'task';
  title: string;
  description?: string;
  status?: string;
  progress?: number;
  category?: string;
  priority?: string;
  completed?: boolean;
  targetDate?: Date;
  children: TreeNode[];
  data: LifeGoal | AnnualGoal | QuarterlyGoal | WeeklyTask;
}

const categoryIcons: Record<LifeGoalCategory, React.ComponentType<any>> = {
  'Creativity & Passion': Heart,
  'Mind': Brain,
  'Career': Briefcase,
  'Finance': DollarSign,
  'Health': Activity,
  'Relationships': Users,
  'Spirit': Compass,
  'Community': Building,
  'Travel': Plane,
  'Giving Back': Gift,
  'Other': Target
};

const categoryColors: Record<LifeGoalCategory, string> = {
  'Creativity & Passion': '#e74c3c',
  'Mind': '#9b59b6',
  'Career': '#3498db',
  'Finance': '#f39c12',
  'Health': '#2ecc71',
  'Relationships': '#e91e63',
  'Spirit': '#795548',
  'Community': '#607d8b',
  'Travel': '#00bcd4',
  'Giving Back': '#4caf50',
  'Other': '#6c757d'
};

const GoalTree: React.FC = () => {
  const { state } = useApp();
  const { navigateTo } = useRouter();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedView, setSelectedView] = useState<'full' | 'active' | 'completed'>('full');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const buildTree = (): TreeNode[] => {
    // Start with Life Goals as root nodes
    const treeNodes: TreeNode[] = state.lifeGoals.map(lifeGoal => {
      // Find Annual Goals linked to this Life Goal
      const linkedAnnualGoals = state.annualGoals.filter(annual => annual.lifeGoalId === lifeGoal.id);
      
      const annualNodes: TreeNode[] = linkedAnnualGoals.map(annualGoal => {
        // Find Quarterly Goals linked to this Annual Goal
        const linkedQuarterlyGoals = state.quarterlyGoals.filter(quarterly => quarterly.annualGoalId === annualGoal.id);
        
        const quarterlyNodes: TreeNode[] = linkedQuarterlyGoals.map(quarterlyGoal => {
          // Find Weekly Tasks linked to this Quarterly Goal
          const linkedTasks = state.weeklyTasks.filter(task => task.quarterlyGoalId === quarterlyGoal.id);
          
          const taskNodes: TreeNode[] = linkedTasks.map(task => ({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description,
            completed: task.completed,
            children: [],
            data: task
          }));

          return {
            id: quarterlyGoal.id,
            type: 'quarterly',
            title: quarterlyGoal.title,
            description: quarterlyGoal.description,
            status: quarterlyGoal.status,
            progress: quarterlyGoal.progress,
            targetDate: quarterlyGoal.targetDate,
            children: taskNodes,
            data: quarterlyGoal
          };
        });

        return {
          id: annualGoal.id,
          type: 'annual',
          title: annualGoal.title,
          description: annualGoal.description,
          status: annualGoal.status,
          progress: annualGoal.progress,
          targetDate: annualGoal.targetDate,
          children: quarterlyNodes,
          data: annualGoal
        };
      });

      return {
        id: lifeGoal.id,
        type: 'life',
        title: lifeGoal.title,
        description: lifeGoal.description,
        category: lifeGoal.category,
        children: annualNodes,
        data: lifeGoal
      };
    });

    // Add orphaned Annual Goals (not linked to Life Goals)
    const orphanedAnnuals = state.annualGoals.filter(annual => !annual.lifeGoalId);
    orphanedAnnuals.forEach(annualGoal => {
      const linkedQuarterlyGoals = state.quarterlyGoals.filter(quarterly => quarterly.annualGoalId === annualGoal.id);
      
      const quarterlyNodes: TreeNode[] = linkedQuarterlyGoals.map(quarterlyGoal => {
        const linkedTasks = state.weeklyTasks.filter(task => task.quarterlyGoalId === quarterlyGoal.id);
        
        const taskNodes: TreeNode[] = linkedTasks.map(task => ({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.description,
          completed: task.completed,
          children: [],
          data: task
        }));

        return {
          id: quarterlyGoal.id,
          type: 'quarterly',
          title: quarterlyGoal.title,
          description: quarterlyGoal.description,
          status: quarterlyGoal.status,
          progress: quarterlyGoal.progress,
          targetDate: quarterlyGoal.targetDate,
          children: taskNodes,
          data: quarterlyGoal
        };
      });

      treeNodes.push({
        id: annualGoal.id,
        type: 'annual',
        title: annualGoal.title,
        description: annualGoal.description,
        status: annualGoal.status,
        progress: annualGoal.progress,
        targetDate: annualGoal.targetDate,
        children: quarterlyNodes,
        data: annualGoal
      });
    });

    // Add orphaned Quarterly Goals
    const orphanedQuarterlies = state.quarterlyGoals.filter(quarterly => !quarterly.annualGoalId);
    orphanedQuarterlies.forEach(quarterlyGoal => {
      const linkedTasks = state.weeklyTasks.filter(task => task.quarterlyGoalId === quarterlyGoal.id);
      
      const taskNodes: TreeNode[] = linkedTasks.map(task => ({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        completed: task.completed,
        children: [],
        data: task
      }));

      treeNodes.push({
        id: quarterlyGoal.id,
        type: 'quarterly',
        title: quarterlyGoal.title,
        description: quarterlyGoal.description,
        status: quarterlyGoal.status,
        progress: quarterlyGoal.progress,
        targetDate: quarterlyGoal.targetDate,
        children: taskNodes,
        data: quarterlyGoal
      });
    });

    // Add orphaned Tasks
    const orphanedTasks = state.weeklyTasks.filter(task => !task.quarterlyGoalId);
    orphanedTasks.forEach(task => {
      treeNodes.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: task.description,
        completed: task.completed,
        children: [],
        data: task
      });
    });

    return treeNodes;
  };

  const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
    if (selectedView === 'full') return nodes;
    
    return nodes.filter(node => {
      if (selectedView === 'completed') {
        return node.completed || node.status === 'completed' || node.progress === 100;
      } else if (selectedView === 'active') {
        return !node.completed && node.status !== 'completed' && node.progress !== 100;
      }
      return true;
    }).map(node => ({
      ...node,
      children: filterNodes(node.children)
    }));
  };

  const getNodeIcon = (node: TreeNode) => {
    switch (node.type) {
      case 'life':
        const category = (node.data as LifeGoal).category;
        const IconComponent = categoryIcons[category];
        return <IconComponent size={16} style={{ color: categoryColors[category] }} />;
      case 'annual':
        return <Target size={16} style={{ color: '#667eea' }} />;
      case 'quarterly':
        return <Calendar size={16} style={{ color: '#764ba2' }} />;
      case 'task':
        return <CheckSquare size={16} style={{ color: node.completed ? '#48bb78' : '#a0aec0' }} />;
      default:
        return null;
    }
  };

  const getNodeStatus = (node: TreeNode) => {
    if (node.type === 'task') {
      return node.completed ? 'Completed' : 'Pending';
    }
    return node.status || 'active';
  };

  const getNodeProgress = (node: TreeNode) => {
    if (node.type === 'task') {
      return node.completed ? 100 : 0;
    }
    return node.progress || 0;
  };

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indent = level * 24;

    return (
      <div key={node.id} className="tree-node">
        <div 
          className={`tree-node-content ${node.type}`}
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className="tree-node-header">
            <button
              className="tree-expand-button"
              onClick={() => toggleNode(node.id)}
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              ) : (
                <div style={{ width: '16px' }} />
              )}
            </button>
            
            <div className="tree-node-icon">
              {getNodeIcon(node)}
            </div>
            
            <div className="tree-node-info">
              <div className="tree-node-title">
                {node.title}
                {node.type !== 'life' && (
                  <span className={`tree-node-status ${getNodeStatus(node).toLowerCase()}`}>
                    {getNodeStatus(node)}
                  </span>
                )}
              </div>
              
              {node.description && (
                <div className="tree-node-description">
                  {node.description}
                </div>
              )}
              
              <div className="tree-node-meta">
                {node.type !== 'task' && node.progress !== undefined && (
                  <span className="tree-node-progress">
                    Progress: {getNodeProgress(node)}%
                  </span>
                )}
                
                {node.targetDate && (
                  <span className="tree-node-date">
                    Due: {format(node.targetDate, 'MMM dd, yyyy')}
                  </span>
                )}
                
                {node.priority && (
                  <span className={`tree-node-priority ${node.priority}`}>
                    {node.priority.toUpperCase()}
                  </span>
                )}
                
                {hasChildren && (
                  <span className="tree-node-children">
                    {node.children.length} item{node.children.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {node.type !== 'task' && node.progress !== undefined && (
            <div className="tree-progress-bar">
              <div 
                className="tree-progress-fill"
                style={{ width: `${getNodeProgress(node)}%` }}
              />
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="tree-node-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();
  const filteredTree = filterNodes(tree);

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(tree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="goal-tree-header">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigateTo('dashboard', false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="goal-tree-title">
            <GitBranch size={24} style={{ color: '#ffd700' }} />
            <h2>Goal Tree Overview</h2>
            <span className="goal-tree-subtitle">
              Complete hierarchy of your goals and tasks
            </span>
          </div>
        </div>

        <div className="goal-tree-controls">
          <div className="goal-tree-filters">
            <button
              className={`filter-button ${selectedView === 'full' ? 'active' : ''}`}
              onClick={() => setSelectedView('full')}
            >
              All Goals
            </button>
            <button
              className={`filter-button ${selectedView === 'active' ? 'active' : ''}`}
              onClick={() => setSelectedView('active')}
            >
              Active Only
            </button>
            <button
              className={`filter-button ${selectedView === 'completed' ? 'active' : ''}`}
              onClick={() => setSelectedView('completed')}
            >
              Completed
            </button>
          </div>
          
          <div className="goal-tree-actions">
            <button className="tree-action-button" onClick={expandAll}>
              <Maximize2 size={16} />
              Expand All
            </button>
            <button className="tree-action-button" onClick={collapseAll}>
              <ChevronRight size={16} />
              Collapse All
            </button>
          </div>
        </div>

        <div className="goal-tree-content">
          {filteredTree.length === 0 ? (
            <div className="goal-tree-empty">
              <GitBranch size={48} style={{ color: '#cbd5e0' }} />
              <h3>No Goals Found</h3>
              <p>Start by creating your first life goal to see the goal tree.</p>
            </div>
          ) : (
            <div className="goal-tree-list">
              {filteredTree.map(node => renderTreeNode(node))}
            </div>
          )}
        </div>

        <div className="goal-tree-footer">
          <div className="goal-tree-legend">
            <div className="legend-item">
              <Heart size={16} style={{ color: '#e74c3c' }} />
              <span>Life Goals</span>
            </div>
            <div className="legend-item">
              <Target size={16} style={{ color: '#667eea' }} />
              <span>Annual Goals</span>
            </div>
            <div className="legend-item">
              <Calendar size={16} style={{ color: '#764ba2' }} />
              <span>Quarterly OKRs</span>
            </div>
            <div className="legend-item">
              <CheckSquare size={16} style={{ color: '#48bb78' }} />
              <span>Weekly Tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalTree;
