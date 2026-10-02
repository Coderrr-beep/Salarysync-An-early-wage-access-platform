"use client";

import { useState } from "react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "bot", text: data.reply },
    ]);

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg p-4 h-60 overflow-y-auto text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 ${
              m.role === "user"
                ? "text-right text-white"
                : "text-left text-gray-300"
            }`}
          >
            <span className="inline-block bg-gray-800 px-3 py-2 rounded">
              {m.text}
            </span>
          </div>
        ))}

        {loading && (
          <p className="text-gray-500">Thinking…</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 rounded text-white"
        />
        <button
          onClick={sendMessage}
          className="bg-white text-black px-4 py-2 rounded font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
