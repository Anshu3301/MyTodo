import { useState } from 'react';

const AddTodoForm = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), deadline || null);
      setText('');
      setDeadline('');
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg input-focus text-gray-700 placeholder-gray-400"
            required
          />
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto">
            <div className="flex flex-col">
              <label htmlFor="deadline" className="text-sm font-medium text-gray-600 mb-1">
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                className="px-4 py-3 border border-gray-300 rounded-lg input-focus text-gray-700"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="btn-primary whitespace-nowrap cursor-pointer"
                disabled={!text.trim()}
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Task
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTodoForm;