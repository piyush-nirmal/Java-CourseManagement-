import React, { useState, useEffect } from 'react';
import { JAVA_PROJECT_FILES } from './data/javaSourceFiles';
import { CourseRecord, INITIAL_COURSES } from './types/course';

type TabView = 'crud' | 'code';

export default function App() {
  const [tab, setTab] = useState<TabView>('crud');
  const [courses, setCourses] = useState<CourseRecord[]>(INITIAL_COURSES);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLiveMySQL, setIsLiveMySQL] = useState<boolean>(false);

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        setIsLiveMySQL(true);
      }
    } catch {
      setIsLiveMySQL(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Create form toggle & fields
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createId, setCreateId] = useState('');
  const [createName, setCreateName] = useState('');
  const [createDuration, setCreateDuration] = useState('');
  const [createFees, setCreateFees] = useState('');
  const [createTrainer, setCreateTrainer] = useState('');

  // Search by ID
  const [searchIdInput, setSearchIdInput] = useState('');
  const [activeSearchId, setActiveSearchId] = useState<number | null>(null);

  // Inline Update state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editFees, setEditFees] = useState('');
  const [editTrainer, setEditTrainer] = useState('');

  // Source code viewer state
  const [activeFileId, setActiveFileId] = useState<string>(JAVA_PROJECT_FILES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = createId.trim();
    const id = Number.parseInt(trimmedId, 10);
    const fees = Number.parseFloat(createFees.trim());

    if (!/^\d+$/.test(trimmedId) || id <= 0) {
      setMessage({ text: 'Course ID must be a positive integer.', isError: true });
      return;
    }
    if (!createName.trim() || !createDuration.trim() || !createTrainer.trim()) {
      setMessage({ text: 'All text fields are required.', isError: true });
      return;
    }
    if (Number.isNaN(fees) || fees < 0) {
      setMessage({ text: 'Fees must be a valid non-negative number.', isError: true });
      return;
    }
    if (courses.some((c) => c.courseId === id)) {
      setMessage({
        text: `Duplicate primary key: Course ID ${id} already exists.`,
        isError: true,
      });
      return;
    }

    const newCourse: CourseRecord = {
      courseId: id,
      courseName: createName.trim(),
      duration: createDuration.trim(),
      fees,
      trainerName: createTrainer.trim(),
    };

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
      if (res.ok) {
        await loadCourses();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to insert into database');
      }
    } catch {
      setCourses((prev) => [...prev, newCourse].sort((a, b) => a.courseId - b.courseId));
    }

    setCreateId('');
    setCreateName('');
    setCreateDuration('');
    setCreateFees('');
    setCreateTrainer('');
    setShowCreateForm(false);
    setActiveSearchId(null);
    setSearchIdInput('');
    setMessage({ text: `Course ${id} inserted successfully into MySQL.`, isError: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchIdInput.trim();
    if (!trimmed) {
      setActiveSearchId(null);
      setMessage(null);
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setMessage({ text: 'Enter a valid numeric Course ID.', isError: true });
      return;
    }
    const id = Number.parseInt(trimmed, 10);
    setActiveSearchId(id);
    setEditingId(null);
    const found = courses.find((c) => c.courseId === id);
    if (!found) {
      setMessage({ text: `No course found with ID ${id}.`, isError: true });
    } else {
      setMessage({ text: `Showing course ID ${id}.`, isError: false });
    }
  };

  const handleShowAll = () => {
    setSearchIdInput('');
    setActiveSearchId(null);
    setMessage(null);
  };

  const startEdit = (course: CourseRecord) => {
    setEditingId(course.courseId);
    setEditName(course.courseName);
    setEditDuration(course.duration);
    setEditFees(String(course.fees));
    setEditTrainer(course.trainerName);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (courseId: number) => {
    const fees = Number.parseFloat(editFees.trim());
    if (!editName.trim() || !editDuration.trim() || !editTrainer.trim()) {
      setMessage({ text: 'All fields are required.', isError: true });
      return;
    }
    if (Number.isNaN(fees) || fees < 0) {
      setMessage({ text: 'Fees must be a valid non-negative number.', isError: true });
      return;
    }

    const updated: CourseRecord = {
      courseId,
      courseName: editName.trim(),
      duration: editDuration.trim(),
      fees,
      trainerName: editTrainer.trim(),
    };

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        await loadCourses();
      }
    } catch {
      setCourses((prev) =>
        prev.map((c) => (c.courseId === courseId ? updated : c))
      );
    }
    setEditingId(null);
    setMessage({ text: `Course ${courseId} updated successfully.`, isError: false });
  };

  const handleDelete = async (courseId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadCourses();
      }
    } catch {
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
    }
    if (editingId === courseId) {
      setEditingId(null);
    }
    if (activeSearchId === courseId) {
      setActiveSearchId(null);
      setSearchIdInput('');
    }
    setMessage({ text: `Course ${courseId} deleted successfully.`, isError: false });
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore clipboard failures
    }
  };

  const displayedCourses =
    activeSearchId !== null
      ? courses.filter((c) => c.courseId === activeSearchId)
      : courses;

  const activeFile =
    JAVA_PROJECT_FILES.find((f) => f.id === activeFileId) ?? JAVA_PROJECT_FILES[0];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-900 whitespace-nowrap shrink-0">
              Course Management System
            </span>
            {isLiveMySQL && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live MySQL
              </span>
            )}
          </div>

          <nav className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTab('crud')}
              className={`text-sm pb-0.5 whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'crud'
                  ? 'text-gray-900 font-semibold border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => setTab('code')}
              className={`text-sm pb-0.5 whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'code'
                  ? 'text-gray-900 font-semibold border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Java &amp; SQL Files
            </button>
          </nav>

          <button
            type="button"
            onClick={async () => {
              await loadCourses();
              setActiveSearchId(null);
              setSearchIdInput('');
              setEditingId(null);
              setMessage({ text: 'Refreshed from live MySQL database.', isError: false });
            }}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded whitespace-nowrap shrink-0 cursor-pointer"
          >
            ↻ Refresh MySQL
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {tab === 'crud' && (
          <div className="space-y-5">
            {/* Search by ID + Add Course Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchIdInput}
                  onChange={(e) => setSearchIdInput(e.target.value)}
                  placeholder="Search by Course ID..."
                  className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 rounded cursor-pointer whitespace-nowrap"
                >
                  Search
                </button>
                {activeSearchId !== null && (
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className="px-3 py-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded cursor-pointer whitespace-nowrap"
                  >
                    Display All
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm((v) => !v);
                  setMessage(null);
                }}
                className="px-4 py-1.5 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800 cursor-pointer whitespace-nowrap"
              >
                {showCreateForm ? 'Close Form' : 'Add Course'}
              </button>
            </div>

            {/* Status / Error Message */}
            {message && (
              <div
                className={`px-4 py-2.5 text-sm border rounded bg-white ${
                  message.isError
                    ? 'border-red-300 text-red-700'
                    : 'border-gray-300 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Collapsible Add New Course Form */}
            {showCreateForm && (
              <form
                onSubmit={handleCreate}
                className="border border-gray-300 rounded p-5 space-y-4 bg-white"
              >
                <h2 className="text-base font-semibold text-gray-900">Add New Course</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Course ID (INT)
                    </label>
                    <input
                      type="text"
                      value={createId}
                      onChange={(e) => setCreateId(e.target.value)}
                      placeholder="e.g. 104"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. Advanced Java"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={createDuration}
                      onChange={(e) => setCreateDuration(e.target.value)}
                      placeholder="e.g. 8 Weeks"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fees
                    </label>
                    <input
                      type="text"
                      value={createFees}
                      onChange={(e) => setCreateFees(e.target.value)}
                      placeholder="e.g. 14000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trainer Name
                    </label>
                    <input
                      type="text"
                      value={createTrainer}
                      onChange={(e) => setCreateTrainer(e.target.value)}
                      placeholder="e.g. Dr. Arvind Sharma"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800 cursor-pointer"
                >
                  Insert Course
                </button>
              </form>
            )}

            {/* Merged Display All + Search Result + Inline Update & Delete Table */}
            <div className="border border-gray-300 rounded bg-white">
              <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                  courses Table (college_db)
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setCourses([]);
                    setEditingId(null);
                    setActiveSearchId(null);
                    setSearchIdInput('');
                    setMessage(null);
                  }}
                  disabled={courses.length === 0}
                  className="text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40 cursor-pointer"
                >
                  Clear Table
                </button>
              </div>

              {displayedCourses.length === 0 ? (
                <div className="p-6 text-sm text-gray-600">
                  {activeSearchId !== null
                    ? `No course found with ID ${activeSearchId}.`
                    : 'No courses found in college_db.courses.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 bg-gray-50">
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">course_id</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">course_name</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">duration</th>
                        <th className="py-2.5 px-4 font-medium text-right whitespace-nowrap">fees</th>
                        <th className="py-2.5 px-4 font-medium whitespace-nowrap">trainer_name</th>
                        <th className="py-2.5 px-4 font-medium text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayedCourses.map((course) => {
                        const isEditing = editingId === course.courseId;
                        return (
                          <tr key={course.courseId}>
                            <td className="py-2.5 px-4 tabular-nums whitespace-nowrap">
                              {course.courseId}
                            </td>
                            <td className="py-2.5 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full min-w-[140px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                                />
                              ) : (
                                course.courseName
                              )}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editDuration}
                                  onChange={(e) => setEditDuration(e.target.value)}
                                  className="w-28 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                                />
                              ) : (
                                course.duration
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right tabular-nums whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFees}
                                  onChange={(e) => setEditFees(e.target.value)}
                                  className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                                />
                              ) : (
                                course.fees.toFixed(2)
                              )}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTrainer}
                                  onChange={(e) => setEditTrainer(e.target.value)}
                                  className="w-full min-w-[130px] px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                                />
                              ) : (
                                course.trainerName
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEdit(course.courseId)}
                                    className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-800 cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-2.5 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(course)}
                                    className="px-2.5 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 rounded cursor-pointer"
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(course.courseId)}
                                    className="px-2.5 py-1 text-xs border border-gray-300 bg-white hover:bg-red-50 text-red-700 rounded cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'code' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {JAVA_PROJECT_FILES.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setActiveFileId(file.id)}
                  className={`px-3 py-1.5 text-sm border rounded whitespace-nowrap cursor-pointer ${
                    activeFile.id === file.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>

            <div className="border border-gray-300 rounded bg-white">
              <div className="px-4 py-2.5 border-b border-gray-300 flex items-center justify-between">
                <span className="text-sm font-mono text-gray-800">{activeFile.path}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeFile.id, activeFile.content)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-800 cursor-pointer"
                >
                  {copiedId === activeFile.id ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-gray-900 bg-white overflow-x-auto leading-relaxed">
                {activeFile.content}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
