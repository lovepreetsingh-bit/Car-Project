import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const listEndRef = useRef(null);

  const appendUniqueMessage = (incomingMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => String(m._id) === String(incomingMessage._id))) {
        return prev;
      }
      return [...prev, incomingMessage];
    });
  };

  const socket = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    return io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });
  }, []);

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        const response = await chatAPI.getChatMessages(chatId);
        setChat(response.data.data);
        setMessages(response.data.data.messages || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId]);

  useEffect(() => {
    if (!socket) return undefined;

    socket.emit('chat:join', chatId);
    const onMessage = (payload) => {
      if (payload.chatId === chatId) {
        appendUniqueMessage(payload.message);
      }
    };

    socket.on('chat:message', onMessage);
    return () => {
      socket.off('chat:message', onMessage);
      socket.disconnect();
    };
  }, [chatId, socket]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;

    try {
      const response = await chatAPI.sendMessage(chatId, draft);
      appendUniqueMessage(response.data.data);
      setDraft('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-100 border border-red-300 text-red-700 rounded px-4 py-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">{chat?.car?.title || 'Chat'}</h1>
          <p className="text-sm text-gray-500">
            Buyer: {chat?.buyer?.name} | Seller: {chat?.seller?.name}
          </p>
        </div>

        <div className="h-[500px] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => {
            const senderId = message.sender?._id || message.sender?.id;
            const isMine = String(senderId) === String(user?.id);
            return (
              <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMine ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                  <p className="text-xs opacity-80 mb-1">{message.sender?.name || 'User'}</p>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={listEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
