
export interface User {
  id: string;
  name: string;
  avatar: string;
  coverPhoto?: string;
  online?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string; // URL or Base64
  likes: number;
  comments: Comment[];
  timestamp: string;
  shares: number;
  isLiked?: boolean;
  isPinned?: boolean; // New property for Pinned Posts
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string; // Image or Video URL/Base64
  type: 'image' | 'text';
  timestamp: string;
  viewed?: boolean;
}

export interface Photo {
  id: string;
  url: string;
  likes: number;
  comments: number;
  description?: string;
}

export interface VideoItem {
  id: string;
  url: string; // Base64 or URL
  title: string;
  views: number;
  timestamp: string;
  duration: string;
  type: 'video' | 'reel';
  likes: number;
  comments: number;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  type?: 'profile' | 'cover' | 'user';
  photos: Photo[];
}

export type View = 'home' | 'profile' | 'friends' | 'watch' | 'marketplace' | 'saved' | 'profile_videos' | 'gaming';

export type TabType = 'posts' | 'about' | 'friends' | 'photos' | 'videos' | 'groups' | 'pages' | 'events';
