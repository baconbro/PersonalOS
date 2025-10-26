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
  Maximize2,
  Minimize2
} from 'lucide-react';
import { format } from 'date-fns';
import type { LifeGoal, AnnualGoal, QuarterlyGoal, WeeklyTask, LifeGoalCategory } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
      <div key={node.id} style={{ paddingLeft: `${indent}px` }} className="mb-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNode(node.id)}
                disabled={!hasChildren}
                className="h-8 w-8 p-0 shrink-0"
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                ) : (
                  <div className="w-4" />
                )}
              </Button>
              
              {/* Node Icon */}
              <div className="shrink-0 text-primary">
                {getNodeIcon(node)}
              </div>
              
              {/* Node Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-foreground">{node.title}</h3>
                  {node.type !== 'life' && (
                    <Badge variant={getNodeStatus(node) === 'Active' ? 'default' : 'secondary'}>
                      {getNodeStatus(node)}
                    </Badge>
                  )}
                </div>
                
                {node.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {node.description}
                  </p>
                )}
                
                {/* Metadata */}
                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                  {node.type !== 'task' && node.progress !== undefined && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-foreground">{getNodeProgress(node)}%</span>
                      <span>complete</span>
                    </span>
                  )}
                  
                  {node.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(node.targetDate, 'MMM dd, yyyy')}
                    </span>
                  )}
                  
                  {node.priority && (
                    <Badge variant={node.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                      {node.priority.toUpperCase()}
                    </Badge>
                  )}
                  
                  {hasChildren && (
                    <span className="flex items-center gap-1">
                      {node.children.length} {node.children.length !== 1 ? 'items' : 'item'}
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                {node.type !== 'task' && node.progress !== undefined && (
                  <Progress value={getNodeProgress(node)} className="mt-3 h-2" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isExpanded && hasChildren && (
          <div className="mt-2">
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
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('dashboard', false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Goal Tree Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Complete hierarchy of your goals and tasks
          </p>

          {/* View Filters */}
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('full')}
            >
              All Goals
            </Button>
            <Button
              variant={selectedView === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('active')}
            >
              Active Only
            </Button>
            <Button
              variant={selectedView === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('completed')}
            >
              Completed
            </Button>
            
            <div className="flex-1" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredTree.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <GitBranch className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No Goals Found</h3>
                <p className="text-muted-foreground">Start by creating your first life goal to see the goal tree.</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="goal-tree-list">
            {filteredTree.map(node => renderTreeNode(node))}
          </div>
        )}

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm">Life Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-chart-1" />
                <span className="text-sm">Annual Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-chart-3" />
                <span className="text-sm">Quarterly OKRs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-chart-4" />
                <span className="text-sm">Weekly Tasks</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoalTree;
