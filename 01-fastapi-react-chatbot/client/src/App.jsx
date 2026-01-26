import { useState } from 'react';

const API_URL = import.meta.env.PROD
  ? 'https://your-backend-url.onrender.com'
  : 'http://127.0.0.1:8000';

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("No response yet");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (message === "") return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        body: JSON.stringify({ prompt: message }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error: " + error.message);
    } finally {
      setLoading(false);
      setMessage("");
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-4xl font-bold mb-8">Ask Anything!</h1>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Type your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={!message || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          <div className="text-gray-700 whitespace-pre-wrap">
            {loading ? '⏳ Thinking...' : `🤖: ${response}`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
