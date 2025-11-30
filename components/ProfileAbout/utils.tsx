import React from 'react';
import { Globe, Users, Lock, Facebook, Instagram, Twitter, Linkedin, Youtube, Github, MessageCircle, Twitch } from 'lucide-react';
import { PrivacyLevel } from './types';

export const PrivacyIcon: React.FC<{ type: PrivacyLevel; rtl?: boolean }> = ({ type, rtl = true }) => {
  const labels: Record<PrivacyLevel, string> = {
    'public': rtl ? 'عام' : 'Public',
    'friends': rtl ? 'الأصدقاء' : 'Friends',
    'only_me': rtl ? 'أنا فقط' : 'Only Me'
  };

  if (type === 'public') return <span title={labels.public} className="inline-flex items-center"><Globe className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
  if (type === 'friends') return <span title={labels.friends} className="inline-flex items-center"><Users className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
  return <span title={labels.only_me} className="inline-flex items-center"><Lock className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
};

export const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('facebook')) return <Facebook className="w-5 h-5 text-fb-blue" />;
  if (p.includes('instagram')) return <Instagram className="w-5 h-5 text-fb-blue" />;
  if (p.includes('twitter') || p.includes('x)')) return <Twitter className="w-5 h-5 text-fb-blue" />;
  if (p.includes('linkedin')) return <Linkedin className="w-5 h-5 text-fb-blue" />;
  if (p.includes('youtube')) return <Youtube className="w-5 h-5 text-fb-blue" />;
  if (p.includes('github')) return <Github className="w-5 h-5 text-fb-blue" />;
  if (p.includes('whatsapp') || p.includes('telegram')) return <MessageCircle className="w-5 h-5 text-fb-blue" />;
  if (p.includes('twitch')) return <Twitch className="w-5 h-5 text-fb-blue" />;
  return <Globe className="w-5 h-5 text-fb-blue" />;
};
