'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend } from 'react-icons/fi';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // Access API key from .env.local

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: input }],
        max_tokens: 150,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      const botMessage = { role: 'assistant', content: res.data.choices[0].message.content };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl border border-gray-200 flex flex-col h-[80vh]">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">AI Chatbot Assistant</h1>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 rounded-xl">
          {messages.map((msg, index) => (
            <div key={index} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-900 self-start'}`}>{msg.content}</div>
          ))}
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
        {error && <p className="text-red-600 text-center mt-2 font-medium">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
          <textarea
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            rows={2}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <div className="loader"></div>  : <FiSend size={20} className='rotate-[20deg]' />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
