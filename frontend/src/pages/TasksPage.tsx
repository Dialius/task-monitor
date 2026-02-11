/**
 * Tasks Management Page
 * CRUD operations for tasks
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import api from '../services/api';

interface Task {
  _id: string;
  judul: string;
  mata_pelajaran: string;
  deskripsi: string;
  deadline: string;
  tipe: 'tugas' | 'ujian' | 'kelompok' | 'lainnya';
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.mata_pelajaran.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || task.tipe === filterType;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case 'urgent': return 'text-error border-error bg-error/10';
      case 'tinggi': return 'text-warning border-warning bg-warning/10';
      case 'sedang': return 'text-info border-info bg-info/10';
      default: return 'text-text-muted border-border bg-bg-tertiary';
    }
  };

  const getTypeIcon = (tipe: string) => {
    switch (tipe) {
      case 'ujian': return '📝';
      case 'kelompok': return '👥';
      case 'tugas': return '📚';
      default: return '📋';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">📚 Task Management</h1>
          <p className="text-text-secondary">Manage all tasks and assignments</p>
        </div>
        <button
          onClick={() => {/* TODO: Add task modal */}}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-bg-secondary p-4 rounded-lg border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            >
              <option value="all">All Types</option>
              <option value="tugas">Tugas</option>
              <option value="ujian">Ujian</option>
              <option value="kelompok">Kelompok</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-secondary focus:outline-none focus:border-accent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-text-primary">{tasks.length}</div>
        </div>
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-warning">
            {tasks.filter(t => t.status === 'pending').length}
          </div>
        </div>
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Completed</div>
          <div className="text-2xl font-bold text-success">
            {tasks.filter(t => t.status === 'completed').length}
          </div>
        </div>
        <div className="bg-bg-secondary p-4 rounded-lg border border-border">
          <div className="text-text-muted text-sm mb-1">Urgent</div>
          <div className="text-2xl font-bold text-error">
            {tasks.filter(t => t.prioritas === 'urgent').length}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No tasks found. {searchQuery && 'Try adjusting your search.'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map((task) => (
              <div key={task._id} className="p-4 hover:bg-bg-tertiary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getTypeIcon(task.tipe)}</span>
                      <h3 className="text-lg font-semibold text-text-primary">{task.judul}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(task.prioritas)}`}>
                        {task.prioritas}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {task.mata_pelajaran}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.deadline).toLocaleDateString('id-ID')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.status === 'completed' ? 'bg-success/10 text-success' :
                        task.status === 'cancelled' ? 'bg-error/10 text-error' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.deskripsi && (
                      <p className="text-sm text-text-muted line-clamp-2">{task.deskripsi}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {/* TODO: Edit modal */}}
                      className="p-2 hover:bg-bg-elevated rounded transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4 text-info" />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="p-2 hover:bg-bg-elevated rounded transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
