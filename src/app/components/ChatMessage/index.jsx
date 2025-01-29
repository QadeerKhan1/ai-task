import React, { memo } from "react";

const ChatMessage = ({ msg }) => (
  <div
    className={`p-3 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-900 self-start"}`}
  >
    {msg.role === "user" ? (
      msg.content
    ) : msg.content.includes("Sorry, I am an AI assistant for interior design") ? (
      <div className="p-4 rounded-lg text-center text-red-600 font-semibold">
        {msg.content}
      </div>
    ) : (
      <div className="p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">✅ Refined Prompt:</h2>
        <pre className="whitespace-pre-wrap text-gray-900">{msg.content}</pre>
      </div>
    )}
  </div>
);

export default memo(ChatMessage);
