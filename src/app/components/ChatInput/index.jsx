import React, { memo } from "react";
import { FiSend } from "react-icons/fi";

const ChatInput = ({ input, handleInputChange, handleSubmit, loading }) => (
  <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
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
      {loading ? <div className="loader"></div> : <FiSend size={20} className="rotate-[20deg]" />}
    </button>
  </form>
);

export default memo(ChatInput);
