import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "https://1uqy3nyuy1.execute-api.us-east-1.amazonaws.com";

function App() {
  const [notes, setNotes] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [selectedView, setSelectedView] = useState("create");

  const [toastMessage, setToastMessage] = useState("");

  const lastNotificationIdRef = useRef("");

  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotes = async () => {
    const response = await fetch(`${API_URL}/notes`);
    const data = await response.json();
    setNotes(data);
  };

  const fetchNotifications = async () => {
    const response = await fetch(`${API_URL}/notifications`);
    const data = await response.json();

    const sortedNotifications = data.sort(
      (a, b) => Number(a.Id) - Number(b.Id)
    );

    if (sortedNotifications.length > 0) {
      const latestNotification =
        sortedNotifications[sortedNotifications.length - 1];

      if (latestNotification.Id !== lastNotificationIdRef.current) {
        if (lastNotificationIdRef.current !== "") {
          setToastMessage(latestNotification.message);

          setTimeout(() => {
            setToastMessage("");
          }, 5000);
        }

        lastNotificationIdRef.current = latestNotification.Id;
      }
    }

    setNotifications(sortedNotifications.reverse());
  };

  const createNote = async () => {
    if (!title || !content) return;

    await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    setTitle("");
    setContent("");

    fetchNotes();

    setSelectedView("notes");
  };

  const deleteNote = async (id) => {
    await fetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
    });

    fetchNotes();

    setSelectedView("notes");
  };

  const updateNote = async () => {
    await fetch(`${API_URL}/notes/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    setEditingId(null);
    setTitle("");
    setContent("");

    fetchNotes();

    setSelectedView("notes");
  };

  const startEdit = (note) => {
    setEditingId(note.Id);
    setTitle(note.title);
    setContent(note.content);

    setSelectedView("create");
  };

  useEffect(() => {
    fetchNotes();

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {toastMessage && <div className="toast">🔔 {toastMessage}</div>}

      <div className="sidebar">
        <h1>AWS Notes App</h1>

        <button
          className={selectedView === "create" ? "active" : ""}
          onClick={() => setSelectedView("create")}
        >
          Create Note
        </button>

        <button
          className={selectedView === "notes" ? "active" : ""}
          onClick={() => setSelectedView("notes")}
        >
          View Notes
        </button>

        <button
          className={selectedView === "history" ? "active" : ""}
          onClick={() => setSelectedView("history")}
        >
          History
        </button>

        <div className="developer">
          <p>Developed by</p>
          <h3>Ciubotaru Andreea-Paraschiva</h3>
        </div>
      </div>

      <div className="content">
        {selectedView === "create" && (
          <div className="card">
            <h2>{editingId ? "Update Note" : "Create a New Note"}</h2>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button
              className="main-button"
              onClick={editingId ? updateNote : createNote}
            >
              {editingId ? "Update Note" : "Create Note"}
            </button>
          </div>
        )}

        {selectedView === "notes" && (
          <div className="card">
            <h2>Notes</h2>

            <div className="notes-grid">
              {notes.map((note) => (
                <div className="note-card" key={note.Id}>
                  <h3>{note.title}</h3>

                  <p>
                    {note.content.length > 80
                      ? note.content.substring(0, 80) + "..."
                      : note.content}
                  </p>

                  <div className="note-actions">
                    <button
                      onClick={() => {
                        setSelectedNote(note);
                        setIsModalOpen(true);
                      }}
                    >
                      View
                    </button>

                    <button onClick={() => startEdit(note)}>Edit</button>

                    <button
                      className="delete-button"
                      onClick={() => deleteNote(note.Id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === "history" && (
          <div className="card">
            <h2>Action History</h2>

            <div className="history-list">
              {notifications.map((notification) => (
                <div key={notification.Id} className="history-item">
                  {notification.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {isModalOpen && selectedNote && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedNote.title}</h2>

              <p>{selectedNote.content}</p>

              <button
                className="main-button"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
