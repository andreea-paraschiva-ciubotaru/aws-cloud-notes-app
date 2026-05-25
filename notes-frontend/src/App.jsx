import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://1uqy3nyuy1.execute-api.us-east-1.amazonaws.com";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchNotes = async () => {
    const response = await fetch(`${API_URL}/notes`);
    const data = await response.json();
    setNotes(data);
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
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>AWS Notes App</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <br />
        <br />

        <button onClick={createNote}>Create Note</button>
      </div>

      <h2>Notes</h2>

      {notes.map((note) => (
        <div
          key={note.Id}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
