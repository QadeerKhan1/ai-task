"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // Access API key from .env.local

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    // Show user message immediately
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `
You are an AI assistant specializing in **interior design**. Your task is to refine and improve **interior design-related prompts** provided by the user.

### **Instructions:**
✔ If the input relates to **interior design**, generate a **better, clearer, and more refined prompt** for the user.
❌ If the input is unrelated to interior design, respond with: "Sorry, I am an AI assistant for interior design. We are not dealing with this."

### **User Input:**
${input}
              `,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      let botResponse = res.data.choices[0].message.content.trim();

      // Remove surrounding quotes if they exist
      if (botResponse.startsWith('"') && botResponse.endsWith('"')) {
        botResponse = botResponse.slice(1, -1);
      }

      // Handle Non-Interior Design Inputs
      if (
        botResponse
          .toLowerCase()
          .includes("sorry, i am an ai assistant for interior design")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "🚨 Sorry, I am an AI assistant for interior design. We are not dealing with this.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: botResponse },
        ]);
      }
    } catch (err) {
      console.log(
        "API Error:",
        err.response?.data && Object.keys(err.response.data)?.length > 0
          ? err.response.data
          : err.message || "Unknown error occurred"
      );

      // Remove last user message if API fails
      setMessages((prev) => prev.slice(0, -1));

      // Handle different API errors
      if (err.response?.data?.error?.code === "rate_limit_exceeded") {
        setError(`🚨 API rate limit reached, please try again later.`);
      } else if (err.response?.data?.error?.message) {
        setError(`🚨 API Error: ${err.response.data.error.message}`);
      } else {
        setError("🚨 Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl border border-gray-200 flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Interior Design Prompt Refiner
        </h1>

        {/* Chat Messages Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-100 rounded-xl custom-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg?.role === "user"
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-200 text-gray-900 self-start"
              }`}
            >
              {msg?.role === "user" ? (
                msg?.content
              ) : msg?.content.includes(
                  "Sorry, I am an AI assistant for interior design"
                ) ? (
                <div className="p-4 rounded-lg text-center text-red-600 font-semibold">
                  {msg?.content}
                </div>
              ) : (
                <div className="p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    ✅ Refined Prompt:
                  </h2>
                  <pre className="whitespace-pre-wrap text-gray-900">
                    {msg?.content}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {/* Loading Animation */}
          {loading && (
            <div className="flex items-center justify-center h-[50px] rounded-lg bg-gray-200 text-gray-900 self-start">
              <div className="loader-dots"></div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <p className="text-red-600 text-center mt-2 font-medium">{error}</p>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex items-center space-x-2"
        >
          <textarea
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter an interior design prompt..."
            rows={2}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="loader"></div>
            ) : (
              <FiSend size={20} className="rotate-[20deg]" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
