
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Send, Phone, Video, MoreHorizontal, ThumbsUp, Image, Smile } from 'lucide-react';
import { User } from '../types';

interface ChatWindowProps {
  user: User;
  onClose: () => void;
  currentUser: User;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, onClose, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'مرحباً! كيف حالك؟', sender: 'them', timestamp: '10:00 م' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Mock reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'أنا بخير شكراً لسؤالك! 👍',
        sender: 'them',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-0 left-4 w-60 bg-white shadow-lg rounded-t-lg cursor-pointer z-50 flex items-center justify-between p-3 border border-gray-300 hover:bg-gray-50"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
           <div className="relative">
             <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
           </div>
           <span className="font-semibold text-sm truncate">{user.name}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-gray-600">
           <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-4 md:left-20 w-80 bg-white shadow-2xl rounded-t-lg border border-gray-200 z-50 flex flex-col h-[400px] animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b shadow-sm bg-white rounded-t-lg">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition">
          <div className="relative">
             <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-gray-200" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-sm text-gray-900">{user.name}</span>
             <span className="text-[10px] text-gray-500">نشط الآن</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-fb-blue">
           <Phone className="w-8 h-8 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" />
           <Video className="w-8 h-8 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer" />
           <Minus className="w-8 h-8 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-500" onClick={() => setIsMinimized(true)} />
           <X className="w-8 h-8 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-500" onClick={onClose} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-white no-scrollbar">
        <div className="flex flex-col items-center mt-4 mb-8">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full mb-2" />
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-xs text-gray-500">أنتم أصدقاء على تواصل</p>
        </div>

        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-[15px] ${
                  msg.sender === 'me' 
                    ? 'bg-fb-blue text-white rounded-br-none' 
                    : 'bg-gray-200 text-black rounded-bl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer / Input */}
      <div className="p-2 border-t flex items-center gap-2">
         <MoreHorizontal className="w-6 h-6 text-fb-blue cursor-pointer" />
         <Image className="w-6 h-6 text-fb-blue cursor-pointer" />
         <Smile className="w-6 h-6 text-fb-blue cursor-pointer" />
         <form onSubmit={handleSend} className="flex-1 flex items-center relative">
            <input 
              type="text" 
              className="w-full bg-gray-100 rounded-full px-3 py-1.5 text-sm outline-none focus:bg-gray-50"
              placeholder="Aa"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
         </form>
         {inputText ? (
             <Send className="w-6 h-6 text-fb-blue cursor-pointer" onClick={() => handleSend()} />
         ) : (
             <ThumbsUp className="w-6 h-6 text-fb-blue cursor-pointer" />
         )}
      </div>
    </div>
  );
};

export default ChatWindow;
