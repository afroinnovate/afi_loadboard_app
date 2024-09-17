import React, { useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Form, useActionData, useSubmit } from '@remix-run/react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other' | 'system';
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, recipientName, messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const submit = useSubmit();
  const actionData = useActionData();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    submit(form, { method: 'post' });
    form.reset();
  };

  const systemMessage: Message = {
    id: 0,
    text: "The message component is not ready yet. Please call or email the shipper or carrier. Thank you for choosing loadboard, the modern way to move.",
    sender: 'system',
    timestamp: new Date(),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
      <div className="bg-green-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold">{recipientName}</h3>
        <button onClick={onClose} className="text-white hover:text-green-200">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex justify-center">
          <div className="max-w-3/4 p-2 rounded-lg bg-gray-200 text-black">
            <p>{systemMessage.text}</p>
          </div>
        </div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3/4 p-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              <p>{message.text}</p>
              <span className={`text-xs opacity-75 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Form onSubmit={handleSendMessage} className="p-3 bg-gray-100">
        <div className="flex items-center">
          <input
            type="text"
            name="message"
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          />
          <button
            type="submit"
            name="_action"
            value="sendMessage"
            className="bg-green-500 text-white p-2 rounded-r-md hover:bg-green-600 transition-colors duration-200"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </Form>
    </div>
  );
};

export default ChatWindow;