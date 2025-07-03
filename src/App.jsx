// ✅ App.jsx (with due date sorting added)

import { useState, useEffect } from 'react';
import AddTodoForm from './components/AddTodoForm';
import TodoCard from './components/TodoCard';
import './index.css';

import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const gradientClasses = [
  'gradient-1',
  'gradient-2',
  'gradient-3',
  'gradient-4',
  'gradient-5',
  'gradient-6'
];

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc'); // none | asc | desc

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'todos'));
        const todosList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setTodos(prev => {
          const ids = new Set(prev.map(t => t.id));
          const merged = [...prev];
          todosList.forEach(fbTodo => {
            const existingIndex = merged.findIndex(t => t.localOnly && t.text === fbTodo.text && t.createdAt === fbTodo.createdAt);
            if (existingIndex !== -1) {
              merged[existingIndex] = { ...fbTodo };
            } else if (!ids.has(fbTodo.id)) {
              merged.push(fbTodo);
            }
          });
          return merged;
        });
      } catch (err) {
        console.error('Error fetching todos:', err);
      }
    };

    fetchTodos();
  }, []);



  const addTodo = async (text, deadline) => {
  const newTodo = {
    text,
    completed: false,
    deadline: deadline || null,
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'todos'), newTodo);
    setTodos(prev => [{ id: docRef.id, ...newTodo }, ...prev]);
  } catch (err) {
    console.error('Error adding todo:', err);
  }
};


// ✅ Optimistic Add (show todo first then store in Firebase) --> re-rendering issue occurs
// const addTodo = async (text, deadline) => {
//   const tempId = temp-${Date.now()};
//   const optimisticTodo = {
//     id: tempId,
//     text,
//     completed: false,
//     deadline: deadline || null,
//     createdAt: new Date().toISOString(),
//     localOnly: true
//   };

//   setTodos(prev => [optimisticTodo, ...prev]);

//   try {
//     const docRef = await addDoc(collection(db, 'todos'), {
//       text: optimisticTodo.text,
//       completed: optimisticTodo.completed,
//       deadline: optimisticTodo.deadline,
//       createdAt: optimisticTodo.createdAt
//     });

//     setTodos(prev =>
//       prev.map(todo =>
//         todo.id === tempId
//           ? { ...todo, id: docRef.id, localOnly: false }
//           : todo
//       )
//     );
//   } catch (err) {
//     console.error('Error adding todo:', err);
//     setTodos(prev => prev.filter(todo => todo.id !== tempId));
//   }
// };


  const editTodo = async (id, newText, newDeadline) => {
    const prevTodo = todos.find(t => t.id === id);
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText, deadline: newDeadline } : todo
      )
    );

    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, { text: newText, deadline: newDeadline });
    } catch (err) {
      console.error('Error editing todo:', err);
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? prevTodo : todo))
      );
    }
  };

  const deleteTodo = async (id) => {
    const deletedTodo = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(todo => todo.id !== id));

    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setTodos(prev => [deletedTodo, ...prev]);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    const updated = { ...todo, completed: !todo.completed };
    setTodos(prev =>
      prev.map(t => (t.id === id ? updated : t))
    );

    try {
      await updateDoc(doc(db, 'todos', id), { completed: updated.completed });
    } catch (err) {
      console.error('Error toggling complete:', err);
      setTodos(prev => prev.map(t => (t.id === id ? todo : t)));
    }
  };

  const clearCompleted = async () => {
    const completed = todos.filter(todo => todo.completed);
    setTodos(prev => prev.filter(todo => !todo.completed));

    try {
      const deleteOps = completed.map(todo => deleteDoc(doc(db, 'todos', todo.id)));
      await Promise.all(deleteOps);
    } catch (err) {
      console.error('Error clearing completed todos:', err);
      setTodos(prev => [...prev, ...completed]);
    }
  };

  const isOverdue = (todo) => {
    if (!todo.deadline || todo.completed) return false;
    return new Date(todo.deadline) < new Date();
  };

  let filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'overdue') return isOverdue(todo);
    return true;
  });

  // ✅ Sort by due date
  if (sortOrder === 'asc') {
    filteredTodos = filteredTodos.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  } else if (sortOrder === 'desc') {
    filteredTodos = filteredTodos.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(b.deadline) - new Date(a.deadline);
    });
  }

  const overdueTodos = todos.filter(todo => isOverdue(todo));
  const completedTodos = todos.filter(todo => todo.completed).length;
  const completionRate = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            Task Manager
          </h1>
        </div>

        <AddTodoForm onAdd={addTodo} />

        <div className="flex flex-wrap gap-4 mb-8 justify-center items-center">
          <button onClick={() => setFilter('all')} className={`${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
            All Tasks ({todos.length})
          </button>
          <button onClick={() => setFilter('pending')} className={`${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}>
            Pending ({todos.filter(t => !t.completed).length})
          </button>
          <button onClick={() => setFilter('completed')} className={`${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}>
            Completed ({todos.filter(t => t.completed).length})
          </button>
          <button onClick={() => setFilter('overdue')} className={`${filter === 'overdue' ? 'btn-danger' : 'btn-secondary'} ${overdueTodos.length > 0 ? 'animate-pulse bg-red-300' : ''}`}>
            Overdue ({overdueTodos.length})
          </button>
          {todos.some(t => t.completed) && (
            <button onClick={clearCompleted} className="btn-danger">
              Clear Completed
            </button>
          )}

          {/* ✅ Sort Button */}
          <button
            onClick={() =>
              setSortOrder(prev =>
                prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none')
            }
            className="btn-secondary flex flex-row"
          >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
 >          
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4 4 4M16 17l-4 4-4-4" />
            </svg>
             {sortOrder === 'none' ? 'Sort' : sortOrder === 'asc' ? 'Due Soon' : 'Due Later'}
          </button>

          {todos.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg px-4 py-2 text-white ml-4 animate-bounce-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium">Progress: {completionRate}%</span>
              </div>
            </div>
          )}
        </div>

        {filteredTodos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTodos.map((todo, index) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={editTodo}
                onDelete={deleteTodo}
                onToggleComplete={toggleComplete}
                gradientClass={gradientClasses[index % gradientClasses.length]}
                isOverdue={isOverdue(todo)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-12 inline-block animate-fade-in">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {filter === 'all' ? 'No tasks yet' :
                  filter === 'pending' ? 'No pending tasks' :
                  filter === 'completed' ? 'No completed tasks' :
                  'No overdue tasks'}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'Add your first task to get started!' :
                  filter === 'pending' ? 'All tasks are completed! 🎉' :
                  filter === 'completed' ? 'Complete some tasks to see them here.' :
                  'Great! No tasks are overdue.'}
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-16 text-gray-500">
          <p>Built with ❤️ from An.S</p>
        </div>
      </div>
    </div>
  );
}

export default App;
