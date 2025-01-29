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
  You are an advanced AI Code Review Assistant. Your primary role is to analyze user-provided **code snippets** and generate **structured, JSON-formatted feedback**.
  
  ---
  
  ### **Handling Different Input Scenarios**
  ✔ **If the user provides a valid code snippet, evaluate it and return structured JSON feedback.**  
  ❌ **If the user provides non-code input, return a JSON response politely stating that only code reviews are supported.**  
  
  ---
  
  ### **Expected JSON Response Format**  
  
  #### **📌 1. Code Evaluation (Valid Code Input)**
  {
      "input_type": "code",
      "code_snippet": "<provided_code_snippet>",
      "evaluation": {
          "errors": [],
          "optimizations": [],
          "best_practices": [],
          "corrected_code": ""
      }
  }
  
  #### **📌 2. Non-Code Input (User Provided Text Instead of Code)**
  {
      "input_type": "non_code",
      "message": "I am an AI Code Review Assistant. Please provide a valid code snippet for analysis.",
      "suggestion": "If you're looking for technical insights, debugging assistance, or best practices, paste your code here."
  }
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
  
      const botResponse = res.data.choices[0].message.content;
      const cleanContent = botResponse.replace(/```json|```/g, "").trim();
      const parsedAnalysis = JSON.parse(cleanContent);
      console.log(parsedAnalysis, "parsedAnalysis");
  
      // Store the AI response along with the user message
      const botMessage = { role: "assistant", content: parsedAnalysis };
      setMessages((prev) => [...prev, botMessage]);
  
    } catch (err) {
      console.log(
        "API Error:", 
        err.response?.data && Object.keys(err.response.data)?.length > 0 
          ? err.response.data 
          : err.message || "Unknown error occurred"
      );
  
      // Remove the last user message since the API failed
      setMessages((prev) => prev.slice(0, -1));
  
      // Handle different API error messages
      if (err.response?.data?.error?.code === "rate_limit_exceeded") {
        setError(`🚨 API rate limit reached please try again `);
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
          AI Code Assistant
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
              ) : msg?.content?.input_type === "non_code" ? (
                // Non-Code Message Handling
                <div className="p-4 rounded-lg text-center text-red-600 font-semibold">
                  🚨 {msg?.content?.message}
                  <p className="text-gray-700 mt-2">{msg?.content?.suggestion}</p>
                </div>
              ) : (
                // Code Analysis Section
                <div className="p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">AI Code Analysis</h2>

                  {/* Display Input Code */}
                  <div className="p-3 bg-gray-800 text-white rounded-md">
                    <h3 className="text-md font-semibold">🔹 Your Code:</h3>
                    <pre className="whitespace-pre-wrap">{msg?.content?.code_snippet}</pre>
                  </div>

                  {/* Syntax Errors */}
                  {msg?.content?.evaluation?.errors?.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-semibold text-red-600">❌ Errors Found:</h3>
                      <ul className="list-disc list-inside text-red-500">
                        {msg?.content?.evaluation?.errors?.map((error, idx) => (
                          <li key={idx}>
                            <strong>Line {error?.line}:</strong> {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Optimizations */}
                  {msg?.content?.evaluation?.optimizations?.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-semibold text-yellow-600">⚡ Optimizations Suggested:</h3>
                      <ul className="list-disc list-inside text-yellow-500">
                        {msg?.content?.evaluation?.optimizations?.map((opt, idx) => (
                          <li key={idx}>
                            {opt}
                           
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Best Practices */}
                  {msg?.content?.evaluation?.best_practices?.length > 0 && (
                    <div className="mt-2">
                      <h3 className="font-semibold text-green-600">✅ Best Practices:</h3>
                      <ul className="list-disc list-inside text-green-500">
                        {msg?.content?.evaluation?.best_practices?.map((bp, idx) => (
                          <li key={idx}>{bp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Corrected Code */}
                  {msg?.content?.evaluation?.corrected_code && (
                    <div className="mt-4 p-3 bg-gray-800 text-white rounded-md">
                      <h3 className="text-md font-semibold">🚀 Corrected Code:</h3>
                      <pre className="whitespace-pre-wrap">{msg?.content?.evaluation?.corrected_code}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading Animation */}
          {loading && (
            <div className="p-3 rounded-lg bg-gray-200 text-gray-900 self-start">
              <div className="flex space-x-2 justify-center items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-400"></div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Error Display */}
        {error && <p className="text-red-600 text-center mt-2 font-medium">{error}</p>}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
          <textarea
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste your code here..."
            rows={2}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center">
            {loading ? <div className="loader"></div> : <FiSend size={20} className="rotate-[20deg]" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
