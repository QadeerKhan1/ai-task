"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import  ChatMessage  from "@/app/components/ChatMessage";
import  ChatInput  from "@/app/components/ChatInput";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const AiTask = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (event) => setInput(event.target.value);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!input.trim()) return;

      setLoading(true);
      setError("");

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

        let botResponse = res.data.choices[0].message.content.trim().replace(/^"|"$/g, "");
        
        const isNonInteriorResponse = botResponse
          .toLowerCase()
          .includes("sorry, i am an ai assistant for interior design");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: isNonInteriorResponse
              ? "🚨 Sorry, I am an AI assistant for interior design. We are not dealing with this."
              : botResponse,
          },
        ]);
      } catch (err) {
        console.log("API Error:", err.response?.data || err.message);
        setMessages((prev) => prev.slice(0, -1));
        setError(
          err.response?.data?.error?.code === "rate_limit_exceeded"
            ? "🚨 API rate limit reached, please try again later."
            : err.response?.data?.error?.message || "🚨 Something went wrong. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    },
    [input]
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl border border-gray-200 flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Interior Design Prompt Refiner
        </h1>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-100 rounded-xl custom-scrollbar">
          {messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg} />
          ))}
          {loading && <div className="flex items-center justify-center h-[50px] rounded-lg bg-gray-200 text-gray-900 self-start"><div className="loader-dots"></div></div>}
          <div ref={chatEndRef} />
        </div>
        {error && <p className="text-red-600 text-center mt-2 font-medium">{error}</p>}
        <ChatInput input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default AiTask;
