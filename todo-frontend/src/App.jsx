import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  //ดึงข้อมูลเมื่อเปิดหน้าเว็บ
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  //เพิ่มงานใหม่
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      setTitle('');
      setDescription('');
      fetchTasks(); //โหลดข้อมูลใหม่หลังจากเพิ่มเสร็จ
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  //อัปเดตสถานะ (สลับระหว่าง pending กับ completed)
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  //ลบงาน
  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Todo List</h1>

        {/* ฟอร์มเพิ่มงาน */}
        <form onSubmit={addTask} className="mb-8 space-y-4">
          <div>
            <input
              type="text"
              placeholder="หัวหรืองานที่ต้องทำ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <textarea
              placeholder="รายละเอียด (ใส่หรือไม่ใส่ก็ได้)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + เพิ่มงาน
          </button>
        </form>

        {/* รายการงาน */}
        <ul className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">ยังไม่มีงานในตอนนี้ 🎉</p>
          ) : (
            tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-start justify-between p-4 rounded-xl border ${
                  task.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'
                } transition`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox เปลี่ยนสถานะ */}
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleStatus(task.id, task.status)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <h3
                      className={`font-medium text-lg ${
                        task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* ปุ่มลบ */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                >
                  ลบ
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;