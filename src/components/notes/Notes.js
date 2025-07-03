import React, { useState } from 'react';
import { Plus, Trash2, FileText, Lightbulb, Target, Star } from 'lucide-react';
import useNotes from '../../hooks/useNotes';
import { addNote, deleteNote } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Notes = () => {
  const { loading: authLoading, ProtectedRoute } = useAuth();
  const { notes, loading, error, refetch } = useNotes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'tip',
    priority: 'medium',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    if (!formData.title || !formData.content) {
      setSubmitError('Please fill in all required fields');
      setSubmitLoading(false);
      return;
    }

    try {
      await addNote({
        ...formData,
      });
      setFormData({
        title: '',
        content: '',
        type: 'tip',
        priority: 'medium',
      });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to add note');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await deleteNote(id);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to delete note');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'goal':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'reminder':
        return <Star className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'tip':
        return 'bg-yellow-100';
      case 'goal':
        return 'bg-blue-100';
      case 'reminder':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || authLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error?.error || 'Failed to load notes'}</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">Money Notes</h1>
            <p className="text-gray-600">Track your financial tips, goals, and reminders</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-primary text-white font-bold px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Note</span>
          </button>
        </div>

        {/* Add Note Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Add Money Note</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter note title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="tip">Money-Saving Tip</option>
                    <option value="goal">Financial Goal</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Write your note content here..."
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white font-bold py-2 rounded hover:bg-primary-dark transition-colors duration-200"
                    disabled={submitLoading}
                  >
                    Add Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
                {submitError && <div className="text-red-600 text-sm mt-2">{submitError}</div>}
              </form>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="bg-white rounded p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-6">Start adding your financial tips, goals, and reminders</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white font-bold px-6 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
            >
              Add First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded flex items-center justify-center ${getTypeColor(note.type)}`}>
                      {getTypeIcon(note.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{note.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(note.priority)}`}>
                          {note.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                    disabled={submitLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {note.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{note.type}</span>
                    <span className={`font-medium ${getPriorityColor(note.priority)}`}>
                      {note.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Quick Money-Saving Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-primary-light font-bold">•</span>
              <span>Track every expense, no matter how small</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-light font-bold">•</span>
              <span>Set up automatic savings transfers</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-light font-bold">•</span>
              <span>Review and cancel unused subscriptions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-light font-bold">•</span>
              <span>Use the 50/30/20 budgeting rule</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Notes; 