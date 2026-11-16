import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UnreadMessagesContext = createContext({ unreadCount: 0, latestUnreadConversationId: null, refreshUnread: () => {} });

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

// Link that opens the newest unread conversation directly, or the inbox
export const messagesLink = (conversationId) =>
  conversationId ? `/messaging?conversation=${encodeURIComponent(conversationId)}` : '/messaging';

const POLL_INTERVAL_MS = 15000;

const getSignedInMember = () => {
  try {
    const token = localStorage.getItem('token');
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    const userId = profile?.id || profile?._id;
    // Only approved members have a chat inbox
    if (!token || !userId || profile.role === 'admin' || profile.status !== 'approved') return null;
    return { token, userId };
  } catch {
    return null;
  }
};

export const UnreadMessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestUnreadConversationId, setLatestUnreadConversationId] = useState(null);

  const refreshUnread = useCallback(async () => {
    const member = getSignedInMember();
    if (!member) {
      setUnreadCount(0);
      setLatestUnreadConversationId(null);
      return;
    }
    try {
      const res = await fetch(`/api/conversations/${member.userId}`, {
        headers: { 'Authorization': `Bearer ${member.token}` }
      });
      if (!res.ok) return;
      const conversations = await res.json();
      if (!Array.isArray(conversations)) return;
      // Conversations arrive newest first
      const unread = conversations.filter(c => c.unreadCount > 0);
      setUnreadCount(unread.reduce((sum, c) => sum + c.unreadCount, 0));
      setLatestUnreadConversationId(unread[0]?._id || null);
    } catch {
      // Background check only; the next poll tries again
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') refreshUnread();
    }, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshUnread();
    };

    window.addEventListener('focus', refreshUnread);
    window.addEventListener('userLogin', refreshUnread);
    window.addEventListener('profileUpdated', refreshUnread);
    window.addEventListener('messagesRead', refreshUnread);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshUnread);
      window.removeEventListener('userLogin', refreshUnread);
      window.removeEventListener('profileUpdated', refreshUnread);
      window.removeEventListener('messagesRead', refreshUnread);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshUnread]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, latestUnreadConversationId, refreshUnread }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};
