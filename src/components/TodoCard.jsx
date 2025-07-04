import { useState } from 'react';

const TodoCard = ({ todo, onEdit, onDelete, onToggleComplete, gradientClass, isOverdue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDeadline, setEditDeadline] = useState(todo.deadline || '');

  const handleEdit = () => {
    if (isEditing) {
      if (editText.trim()) {
        onEdit(todo.id, editText.trim(), editDeadline || null);
      } else {
        setEditText(todo.text);
        setEditDeadline(todo.deadline || '');
      }
    }
    setIsEditing(!isEditing);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    }
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditDeadline(todo.deadline || '');
      setIsEditing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

const getDaysUntilDeadline = (dateString) => {
  if (!dateString) return null;

  //deadline to 11:59:59 PM of deadline date
  const deadline = new Date(dateString);
  deadline.setHours(23, 59, 59, 999);

  // Set current time to today at 00:00:00
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = deadline - today;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


  const daysUntil = getDaysUntilDeadline(todo.deadline);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`todo-card ${gradientClass} ${isOverdue ? 'overdue-card' : ''} rounded-xl p-6 text-white shadow-lg animate-fade-in relative overflow-hidden`}>
      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg animate-pulse">
          OVERDUE
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id)}
            className="mt-1 w-5 h-5 text-white bg-white bg-opacity-20 border-2 border-white border-opacity-50 rounded focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-50 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-opacity-30 focus:border-opacity-80"
                  autoFocus
                />
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  min={today}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-50 rounded-lg px-3 py-2 text-white focus:outline-none focus:bg-opacity-30 focus:border-opacity-80"
                />
              </div>
            ) : (
              <div>
                <p className={`text-lg font-medium leading-relaxed ${todo.completed ? 'line-through opacity-70' : ''}`}>
                  {todo.text}
                </p>
                
                {/* Deadline information */}
                {todo.deadline && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">
                        Due: {formatDate(todo.deadline)}
                      </span>
                    </div>
                    
                    {!todo.completed && daysUntil !== null && (
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        daysUntil < 0 ? 'bg-red-500 bg-opacity-80' :
                        daysUntil === 0 ? 'bg-yellow-500 bg-opacity-80' :
                        daysUntil <= 3 ? 'bg-orange-500 bg-opacity-80' :
                        'bg-green-500 bg-opacity-80'
                      }`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)} day(s) overdue` :
                         daysUntil === 0 ? 'Due today' :
                         daysUntil === 1 ? 'Due tomorrow' :
                         `${daysUntil} days left`}
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-white text-opacity-80 mt-3">
                  Created: {new Date(todo.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 transform hover:scale-110"
            title={isEditing ? "Save" : "Edit"}
          >
            {isEditing ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 hover:bg-red-500 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
