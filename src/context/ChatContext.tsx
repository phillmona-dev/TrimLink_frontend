"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ChatContextType = {
  isOpen: boolean;
  selectedUser: { id: string; name: string } | null;
  openChat: (userId: string, userName: string) => void;
  clearSelectedUser: () => void;
  closeChat: () => void;
  toggleWidget: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  const openChat = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  const toggleWidget = () => {
    setIsOpen(prev => !prev);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
  };

  return (
    <ChatContext.Provider value={{ isOpen, selectedUser, openChat, clearSelectedUser, closeChat, toggleWidget }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
