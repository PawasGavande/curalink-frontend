import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const CHIPS = [
  "Symptoms of Type 2 Diabetes",
  "Hypertension treatment guidelines",
  "COVID-19 latest variants",
  "Drug interactions for aspirin",
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const query = (text || input).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://crushing-hangover-shawl.ngrok-free.dev/api/query",
        {
          disease: query.toLowerCase(),
          query,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: res.data.structuredAnswer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "⚠️ Backend not responding. Make sure server + ngrok are running.",
        },
      ]);
    }

    setLoading(false);
  };

  const formatText = (text) =>
    text
      .replace(
        /### (.*?)(\n|$)/g,
        '<strong style="display:block;color:#c4b5fd;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin:12px 0 4px;">$1</strong>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>')
      .replace(/\n/g, "<br/>");

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-orb" />
          <span className="logo-text">CuraLink AI</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { label: "Chat", active: true },
            { label: "Patients" },
            { label: "Records" },
            { label: "Diagnostics" },
            { label: "Saved" },
          ].map(({ label, active }) => (
            <div key={label} className={`nav-item${active ? " active" : ""}`}>
              {label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">DR</div>
          <div className="user-info">
            <div className="user-name">Dr. Ramesh</div>
            <div className="user-role">Pro Plan</div>
          </div>
        </div>
      </aside>

      <main className="main">

        <header className="header">
          <div>
            <div className="header-title">Medical Intelligence</div>
            <div className="header-sub">Powered by CuraLink neural engine</div>
          </div>
          <div className="status-pill">
            <div className="status-dot" />
            Neural core active
          </div>
        </header>

        <div className="chat-container" ref={chatRef}>

          {messages.length === 0 && (
            <div className="welcome-section">
              <div className="orb-container">
                <div className="orb-glow" />
                <div className="orb" />
                <div className="orb-inner" />
              </div>
              <div className="welcome-text">
                <h2>Good morning, Doctor</h2>
                <p>Ask about diseases, symptoms, treatments, or drug interactions</p>
              </div>
              <div className="suggestion-chips">
                {CHIPS.map((chip) => (
                  <div key={chip} className="chip" onClick={() => sendMessage(chip)}>
                    {chip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type}`}>
              <div className="msg-avatar">
                {msg.type === "user" ? "You" : "AI"}
              </div>
              <div className="bubble">
                <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                {msg.sources?.length > 0 && (
                  <div className="sources">
                    <div className="sources-label">Sources</div>
                    {msg.sources.map((s, j) => (
                      <a key={j} href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot loading">
              <div className="msg-avatar">AI</div>
              <div className="bubble">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          )}
        </div>

        <div className="input-container">
          <div className="input-box">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about diseases, treatments, diagnostics…"
            />
            <button className="send-btn" onClick={() => sendMessage()}>
              <svg viewBox="0 0 14 14"><path d="M13 7L2 2l3 5-3 5 11-5z" /></svg>
            </button>
          </div>
          <p className="input-hint">
            Responses are for informational use only — always verify with clinical sources
          </p>
        </div>

      </main>
    </div>
  );
}

export default App;