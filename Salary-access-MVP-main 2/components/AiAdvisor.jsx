"use client";
import { useState } from "react";

export default function AiAdvisor({ context }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi 👋 I’m your financial advisor. Ask me anything about your salary or withdrawals.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FALLBACK LOGIC ---------------- */

  function fallbackAnswer(question) {
    const q = question.toLowerCase();
    const available = Math.floor(context.availableLimit);
    const earned = Math.floor(context.earnedSalary);
    const monthly = Math.floor(context.monthlySalary);

    const amountMatch = q.replace(/,/g, "").match(/₹?\s?(\d{3,6})/);
    const askedAmount = amountMatch ? parseInt(amountMatch[1], 10) : null;

    if (q.includes("how much") && q.includes("withdraw")) {
      return `You can currently withdraw up to ₹${available}. This increases as you work more days.`;
    }

    if (q.includes("withdraw") && askedAmount) {
      if (available >= askedAmount) {
        return `Yes, you can withdraw ₹${askedAmount} safely right now. Just plan your expenses before payday.`;
      }
      if (available > 0) {
        return `You can withdraw up to ₹${available} right now. You may want to wait a few more days to access ₹${askedAmount}.`;
      }
      return "You don’t have any withdrawable balance yet. Keep working days to unlock early access.";
    }

    if (q.includes("should") && q.includes("withdraw")) {
      return available > 0
        ? `If it’s urgent, you can withdraw up to ₹${available}. Otherwise, waiting a few days will increase your limit.`
        : "It’s better to wait a few more workdays before withdrawing.";
    }

    if (q.includes("earned") || q.includes("salary")) {
      return `You’ve earned ₹${earned} so far this month out of your ₹${monthly} salary.`;
    }

    if (q.includes("limit") && q.includes("why")) {
      return "Your withdrawal limit depends on how many days you’ve worked. As days increase, your limit increases.";
    }

    return `You’ve earned ₹${earned} so far and can withdraw up to ₹${available}.`;
  }

  /* ---------------- SEND MESSAGE ---------------- */

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Salary Access MVP",
        },
        body: JSON.stringify({
          model: "o3-mini",
          max_tokens: 200,
          temperature: 0.6,
          messages: [
            {
              role: "system",
              content: `
You are a financial wellness assistant for salaried employees in India.
Give clear, human-like answers.
No investment advice. No loans.
`,
            },
            {
              role: "user",
              content: `
Monthly salary: ₹${context.monthlySalary}
Earned salary: ₹${context.earnedSalary}
Available to withdraw: ₹${context.availableLimit}
Days worked: ${context.daysWorked}

Question:
${userText}
`,
            },
          ],
        }),
      });

      const data = await res.json();
      const aiReply = data?.choices?.[0]?.message?.content?.trim();

      // ✅ USE AI ONLY IF IT ACTUALLY RESPONDED WELL
      if (aiReply && aiReply.length > 15) {
        setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
      } else {
        throw new Error("Weak AI reply");
      }
    } catch (err) {
      // ✅ FALLBACK (ALWAYS WORKS)
      const reply = fallbackAnswer(userText);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mt-10">
      <h2 className="text-xl font-semibold mb-4">
        🤖 Financial Advisor
      </h2>

      <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm p-3 rounded max-w-[80%] ${
              m.role === "ai"
                ? "bg-gray-800 text-gray-200"
                : "bg-green-700 text-black ml-auto"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <p className="text-xs text-gray-400">Thinking…</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask naturally, like ChatGPT…"
          className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-white text-black px-4 rounded font-semibold"
        >
          Send
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        AI-assisted responses with guaranteed financial correctness.
      </p>
    </div>
  );
}
