
import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, GraduationCap, MapPin, Heart, Phone, Info, Clock, Globe, Plus, Save, X, Trash2, Users, Lock, ChevronDown, Home, Mail, Link as LinkIcon, Calendar, User as UserIcon, Languages, Mic, Quote, Droplet, PenLine, Star, Pen, Facebook, Instagram, Twitter, Linkedin, Youtube, Github, MessageCircle, Twitch } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProfileAboutProps {
  currentUser: User;
  readonly?: boolean;
}

type SectionType = 'overview' | 'work' | 'places' | 'contact' | 'family' | 'details' | 'events';
type PrivacyLevel = 'public' | 'friends' | 'friends_of_friends' | 'only_me';
type PlaceType = 'current' | 'hometown';

// Data Interfaces
interface Work {
  id: string;
  role: string;
  company: string;
  privacy: PrivacyLevel;
}

interface University {
  id: string;
  name: string;
  degree: string;
  major: string;
  year: string;
  privacy: PrivacyLevel;
}

interface School {
  id: string;
  name: string;
  year: string;
  privacy: PrivacyLevel;
}

interface Place {
  id: string;
  type: PlaceType;
  country: string;
  city: string;
  privacy: PrivacyLevel;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  privacy: PrivacyLevel;
}

interface Website {
  id: string;
  url: string;
  privacy: PrivacyLevel;
}

interface FamilyMember {
  id: string;
  name: string; // From friends list
  relation: string;
  privacy: PrivacyLevel;
}

interface Relationship {
  status: string;
  partner?: string; // Name from friends list
  year?: string;
  month?: string;
  day?: string;
  privacy: PrivacyLevel;
}

interface OtherName {
  id: string;
  name: string;
  type: string;
  privacy: PrivacyLevel;
}

interface LifeEvent {
  id: string;
  title: string;
  location: string;
  description: string;
  year: string;
  privacy: PrivacyLevel;
}

// --- Data Constants ---
const COUNTRIES_DATA: Record<string, string[]> = {
  "مصر": ["القاهرة", "الإسكندرية", "الجيزة", "المنصورة", "شرم الشيخ", "أسوان", "الأقصر", "طنطا", "بورسعيد", "السويس", "الغردقة", "دمياط", "الإسماعيلية", "الزقازيق", "المنيا", "أسيوط", "سوهاج", "كفر الشيخ", "الفيوم", "بني سويف", "قنا", "مطروح", "العريش"],
  "السعودية": ["الرياض", "جدة", "مكة المكرمة", "الدمام", "المدينة المنورة", "الخبر", "تبوك", "أبها", "الطائف", "بريدة", "خميس مشيط", "الجبيل", "حائل", "نجران", "جازان", "الهفوف", "المبرز", "القطيف", "ينبع", "عرعر", "سكاكا"],
  "الإمارات": ["دبي", "أبو ظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "العين", "أم القيوين", "خورفكان", "دبا الفجيرة"],
  "الكويت": ["مدينة الكويت", "حولي", "السالمية", "الأحمدي", "الجهراء", "الفروانية", "مبارك الكبير", "الصباحية", "الفحيحيل"],
  "قطر": ["الدوحة", "الريان", "الخور", "الوكرة", "أم صلال", "الشمال", "مسيعيد", "دخان"],
  "البحرين": ["المنامة", "المحرق", "الرفاع", "مدينة حمد", "مدينة عيسى", "الحد", "سترة", "البديع"],
  "عمان": ["مسقط", "صلالة", "صحار", "نزوى", "صور", "البريمي", "السيب", "عبري", "إبراء", "خصب"],
  "الأردن": ["عمان", "الزرقاء", "إربد", "العقبة", "السلط", "مادبا", "الكرك", "جرش", "المفرق", "معان", "عجلون", "الطفيلة"],
  "لبنان": ["بيروت", "طرابلس", "صيدا", "صور", "جونيه", "زحلة", "بعلبك", "جبيل", "النبطية", "عاليه"],
  "العراق": ["بغداد", "البصرة", "الموصل", "أربيل", "النجف", "كربلاء", "كركوك", "السليمانية", "الرمادي", "الفلوجة", "الحلة", "الناصرية", "العمارة", "الديوانية", "الكوت", "دهوك", "سامراء"],
  "سوريا": ["دمشق", "حلب", "حمص", "اللاذقية", "حماة", "طرطوس", "الرقة", "دير الزور", "الحسكة", "إدلب", "درعا", "السويداء"],
  "فلسطين": ["القدس", "غزة", "رام الله", "نابلس", "الخليل", "بيت لحم", "أريحا", "جنين", "طولكرم", "رفح", "خان يونس", "قلقيلية", "دير البلح"],
  "المغرب": ["الدار البيضاء", "الرباط", "مراكش", "فاس", "طنجة", "أكادير", "مكناس", "وجدة", "القنيطرة", "تطوان", "آسفي", "تمارة", "العيون", "المحمدية", "الجديدة", "بني ملال"],
  "تونس": ["تونس", "صفاقس", "سوسة", "المنستير", "القيروان", "بنزرت", "قابس", "أريانة", "القصرين", "قفصة", "توزر", "جربة"],
  "الجزائر": ["الجزائر", "وهران", "قسنطينة", "عنابة", "البليدة", "تلمسان", "سطيف", "باتنة", "بجاية", "سكيكدة", "سيدي بلعباس", "مستغانم", "بسكرة"],
  "ليبيا": ["طرابلس", "بنغازي", "مصراتة", "البيضاء", "طبرق", "الزاوية", "سبها", "سرت", "أجدابيا", "درنة"],
  "السودان": ["الخرطوم", "أم درمان", "بورتسودان", "نيالا", "كسلا", "الأبيض", "القضارف", "كوستي", "واد مدني"],
  "اليمن": ["صنعاء", "عدن", "تعز", "الحديدة", "المكلا", "إب", "ذمار", "عمران", "صعدة"],
  "موريتانيا": ["نواكشوط", "نواذيبو", "كيفه", "روصو", "كيهيدي"],
  "الصومال": ["مقديشو", "هرجيسا", "بوصاصو", "جالكعيو", "بربرة"],
  "جيبوتي": ["جيبوتي", "علي صبيح", "تاجورة", "دخيل"],
  "جزر القمر": ["موروني", "موتسامودو", "فومبوني"],
  "تركيا": ["إسطنبول", "أنقرة", "إزمير", "أنطاليا", "بورصة", "غازي عنتاب", "أضنة", "قونية", "مرسين", "ديار بكر", "قيصري", "سامسون"],
  "الولايات المتحدة": ["نيويورك", "لوس أنجلوس", "شيكاغو", "هيوستن", "واشنطن", "ميامي", "سان فرانسيسكو", "بوسطن", "سياتل", "دالاس", "أتلانتا", "فيلادلفيا", "فينيكس", "ديترويت", "سان دييغو"],
  "المملكة المتحدة": ["لندن", "مانشستر", "ليفربول", "برمنغهام", "ليدز", "غلاسكو", "أدنبرة", "بريستول", "شفيلد", "كارديف", "بلفاست"],
  "ألمانيا": ["برلين", "ميونخ", "هامبورغ", "فرانكفورت", "كولونيا", "شتوتغارت", "دوسلدورف", "دورتموند", "إيسن", "لايبزيغ"],
  "فرنسا": ["باريس", "ليون", "مارسيليا", "تولوز", "نيس", "بوردو", "ستراسبورغ", "نانت", "مونبلييه", "ليل"],
  "إيطاليا": ["روما", "ميلانو", "نابولي", "تورينو", "البندقية", "فلورنسا", "بولونيا", "جنوة", "باري", "باليرمو"],
  "إسبانيا": ["مدريد", "برشلونة", "فالنسيا", "إشبيلية", "ملقة", "بلباو", "سرقسطة", "مايوركا"],
  "كندا": ["تورونتو", "مونتريال", "فانكوفر", "كالجاري", "أوتاوا", "إدمونتون", "كيبيك", "وينيبيغ"],
  "أستراليا": ["سيدني", "ملبورن", "بريزبن", "بيرث", "أديلايد", "كانبرا", "جولد كوست"],
  "الهند": ["نيودلهي", "مومباي", "بنغالور", "تشيناي", "حيدر أباد", "كولكاتا", "أحمد أباد", "بونه"],
  "الصين": ["بكين", "شانغهاي", "غوانزو", "شنتشن", "تشنغدو", "ووهان", "تيانجين", "هانغتشو"],
  "اليابان": ["طوكيو", "أوساكا", "يوكوهاما", "ناغويا", "سوبورو", "كيوتو", "كوبي", "فوكوكا"],
  "البرازيل": ["ساو باولو", "ريو دي جانيرو", "برازيليا", "سلفادور", "فورتاليزا", "بيلو هوريزونتي"],
  "روسيا": ["موسكو", "سانت بطرسبرغ", "نوفوسيبيرسك", "يكاترينبورغ", "قازان", "نيجني نوفغورود"]
};

const SOCIAL_PLATFORMS = [
  "فيسبوك (Facebook)", "إنستجرام (Instagram)", "تويتر (X)", "لينكد إن (LinkedIn)", 
  "سناب شات (Snapchat)", "تيك توك (TikTok)", "يوتيوب (YouTube)", "واتساب (WhatsApp)",
  "تيليجرام (Telegram)", "بينتيريست (Pinterest)", "بيهانس (Behance)", "جيت هب (GitHub)",
  "ديسكورد (Discord)", "تويتش (Twitch)", "ساوند كلاود (SoundCloud)"
];

const LANGUAGES_LIST = [
  "العربية", "الإنجليزية", "الفرنسية", "الإسبانية", "الألمانية", "الإيطالية", 
  "التركية", "الروسية", "الصينية", "اليابانية", "الكورية", "الهندية", 
  "البرتغالية", "الهولندية", "اليونانية", "السويدية", "الفارسية", "الأردية"
];

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", 
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const RELATIONSHIP_STATUS_OPTIONS = [
    "أعزب", "مرتبط", "مخطوب", "متزوج", "في علاقة مدنية", 
    "في علاقة مفتوحة", "علاقة معقدة", "منفصل", "مطلق", "أرمل"
];

const PARTNER_REQUIRED_STATUSES = ["مرتبط", "مخطوب", "متزوج", "في علاقة مدنية", "في علاقة مفتوحة", "علاقة معقدة"];

const FAMILY_RELATIONS_OPTIONS = [
    "أب", "أم", "أخ", "أخت", "ابن", "ابنة", 
    "عم/خال", "عمة/خالة", "جد", "جدة", 
    "ابن أخ/أخت", "ابنة أخ/أخت", "ابن عم/خال", "ابنة عم/خال", "زوج الأب", "زوجة الأب"
];

const OTHER_NAME_TYPES = [
    "اسم الشهرة", "اسم قبل الزواج", "طريقة كتابة بديلة", "اسم المتزوجة",
    "اسم الأب", "اسم الميلاد", "اسم سابق", "اسم مع لقب", "آخر"
];

// Mock friends list for dropdowns
const MOCK_FRIENDS_LIST = [
    "محمد أحمد", "سارة علي", "يوسف محمود", "منى زكي", "كريم عبد العزيز", 
    "أحمد حلمي", "نور الشريف", "عمر الشريف", "ليلى علوي", "هند صبري"
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 111 }, (_, i) => (currentYear + 10) - i);

// --- Privacy Selector Component ---
interface PrivacySelectProps {
  value: PrivacyLevel;
  onChange: (val: PrivacyLevel) => void;
  small?: boolean;
}

const PrivacySelect: React.FC<PrivacySelectProps> = ({ value, onChange, small }) => {
  const { t } = useLanguage(); // Hook for translation
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { val: PrivacyLevel; label: string; icon: React.ElementType }[] = [
    { val: 'public', label: t.dir === 'rtl' ? 'عام' : 'Public', icon: Globe },
    { val: 'friends', label: t.dir === 'rtl' ? 'الأصدقاء' : 'Friends', icon: Users },
    { val: 'friends_of_friends', label: t.dir === 'rtl' ? 'أصدقاءالأصدقاء' : 'Friends of friends', icon: Users },
    { val: 'only_me', label: t.dir === 'rtl' ? 'أنا فقط' : 'Only Me', icon: Lock },
  ];

  const selected = options.find((o) => o.val === value) || options[0];
  const Icon = selected.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-gray-200 hover:bg-gray-300 rounded-md transition font-semibold text-gray-700 ${small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
      >
        <Icon className={small ? "w-3 h-3" : "w-4 h-4"} />
        <span>{selected.label}</span>
        <ChevronDown className={small ? "w-3 h-3" : "w-3 h-3"} />
      </button>

      {isOpen && (
        <div className="absolute left-0 md:right-0 z-20 mt-1 w-40 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden animate-fadeIn">
          {options.map((opt) => (
            <div
              key={opt.val}
              onClick={() => {
                onChange(opt.val);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-100 text-sm ${
                value === opt.val ? 'bg-blue-50 text-fb-blue' : 'text-gray-700'
              }`}
            >
              <opt.icon className="w-4 h-4" />
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Helper to render Privacy Icon only ---
const PrivacyIcon: React.FC<{ type: PrivacyLevel }> = ({ type }) => {
    const { t } = useLanguage();
    if (type === 'public') return <span title={t.dir === 'rtl' ? 'عام' : 'Public'} className="inline-flex items-center"><Globe className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
    if (type === 'friends') return <span title={t.dir === 'rtl' ? 'الأصدقاء' : 'Friends'} className="inline-flex items-center"><Users className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
    if (type === 'friends_of_friends') return <span title={t.dir === 'rtl' ? 'أصدقاء الأصدقاء' : 'Friends of friends'} className="inline-flex items-center"><Users className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
    return <span title={t.dir === 'rtl' ? 'أنا فقط' : 'Only Me'} className="inline-flex items-center"><Lock className="w-3.5 h-3.5 text-fb-blue/70" /></span>;
};

// --- Helper to render Platform Icon ---
const getPlatformIcon = (platform: string) => {
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


const ProfileAbout: React.FC<ProfileAboutProps> = ({ currentUser, readonly = false }) => {
  const { t } = useLanguage(); // Hook for translations
  const [activeSection, setActiveSection] = useState<SectionType>('overview');

  // --- Initial Empty State for All Sections ---
  const [works, setWorks] = useState<Work[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const [places, setPlaces] = useState<Place[]>([]);

  const [contactInfo, setContactInfo] = useState({
    mobile: { value: '', privacy: 'public' as PrivacyLevel },
    email: { value: '', privacy: 'public' as PrivacyLevel },
  });
  
  const [websites, setWebsites] = useState<Website[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  const [basicInfo, setBasicInfo] = useState({
    gender: { value: '', privacy: 'public' as PrivacyLevel },
    birthDate: { day: '', month: '', year: '', privacy: 'public' as PrivacyLevel },
    languages: { value: [] as string[], privacy: 'public' as PrivacyLevel }
  });

  const [relationship, setRelationship] = useState<Relationship>({ status: '', privacy: 'public' });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [bio, setBio] = useState({ text: '', privacy: 'public' as PrivacyLevel });
  const [pronunciation, setPronunciation] = useState({ text: '', privacy: 'public' as PrivacyLevel });
  const [otherNames, setOtherNames] = useState<OtherName[]>([]);
  const [quotes, setQuotes] = useState({ text: '', privacy: 'public' as PrivacyLevel });
  const [bloodDonor, setBloodDonor] = useState(false);

  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);

  // --- Form Visibility & Edit Logic State ---
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);

  const [showUniForm, setShowUniForm] = useState(false);
  const [editingUniId, setEditingUniId] = useState<string | null>(null);

  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  
  const [editingPlaceType, setEditingPlaceType] = useState<PlaceType | null>(null);

  const [newWork, setNewWork] = useState<Omit<Work, 'id'>>({ role: '', company: '', privacy: 'public' });
  const [newUni, setNewUni] = useState<Omit<University, 'id'>>({ name: '', degree: '', major: '', year: '', privacy: 'public' });
  const [newSchool, setNewSchool] = useState<Omit<School, 'id'>>({ name: '', year: '', privacy: 'public' });
  const [newPlace, setNewPlace] = useState<Omit<Place, 'id' | 'type'>>({ country: '', city: '', privacy: 'public' });

  // Contact/Basic Info Edit States
  const [editingContact, setEditingContact] = useState<'mobile' | 'email' | null>(null);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);

  const [showSocialForm, setShowSocialForm] = useState(false);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);

  const [editingBasic, setEditingBasic] = useState<'gender' | 'birthDate' | 'languages' | null>(null);

  // New Inputs for Contact/Basic
  const [tempContact, setTempContact] = useState({ value: '', privacy: 'public' as PrivacyLevel });
  const [newWebsite, setNewWebsite] = useState({ url: '', privacy: 'public' as PrivacyLevel });
  const [newSocial, setNewSocial] = useState({ platform: '', url: '', privacy: 'public' as PrivacyLevel });
  
  const [tempGender, setTempGender] = useState({ value: '', privacy: 'public' as PrivacyLevel });
  const [tempBirthDate, setTempBirthDate] = useState({ day: '', month: '', year: '', privacy: 'public' as PrivacyLevel });
  const [tempLanguages, setTempLanguages] = useState({ value: [] as string[], privacy: 'public' as PrivacyLevel });

  // Family & Relationship Edit States
  const [editingRelationship, setEditingRelationship] = useState(false);
  const [tempRelationship, setTempRelationship] = useState<Relationship>({ status: '', privacy: 'public' });
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [newFamilyMember, setNewFamilyMember] = useState<Omit<FamilyMember, 'id'>>({ name: '', relation: '', privacy: 'public' });

  // Details About You Edit States
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState({ text: '', privacy: 'public' as PrivacyLevel });
  const [editingPronunciation, setEditingPronunciation] = useState(false);
  const [tempPronunciation, setTempPronunciation] = useState('');
  
  const [showOtherNameForm, setShowOtherNameForm] = useState(false);
  const [editingOtherNameId, setEditingOtherNameId] = useState<string | null>(null);
  const [newOtherName, setNewOtherName] = useState<Omit<OtherName, 'id'>>({ name: '', type: 'اسم الشهرة', privacy: 'public' });
  
  const [editingQuotes, setEditingQuotes] = useState(false);
  const [tempQuotes, setTempQuotes] = useState({ text: '', privacy: 'public' as PrivacyLevel });

  // Life Events Edit State
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<LifeEvent, 'id'>>({
    title: '',
    location: '',
    description: '',
    year: '',
    privacy: 'public'
  });


  // --- Predefined Options ---
  const jobTitles = [
    "مهندس برمجيات", "مطور ويب", "مطور تطبيقات جوال", "مدير مشروع تقني", "مصمم جرافيك", 
    "مصمم واجهات مستخدم (UI/UX)", "محلل بيانات", "مهندس أمن سيبراني", "مسؤول شبكات",
    "محاسب", "مدير موارد بشرية", "مسوق إلكتروني", "مدير مبيعات", "مندوب مبيعات", 
    "خدمة عملاء", "سكرتير", "موظف استقبال", "مدير عام", "رائد أعمال", "محلل مالي",
    "طبيب بشري", "طبيب أسنان", "صيدلي", "ممرض", "أخصائي علاج طبيعي", 
    "أخصائي تغذية", "فني مختبر", "طبيب بيطري",
    "مهندس مدني", "مهندس معماري", "مهندس ميكانيكا", "مهندس كهرباء", "مهندس زراعي", "مهندس ديكور",
    "مدرس", "أستاذ جامعي", "معيد", "مدير مدرسة", "محاضر", "باحث أكاديمي",
    "محامي", "مستشار قانوني", "قاضي",
    "كاتب محتوى", "صحفي", "مترجم", "مصور", "مخرج", "مونتير", "ممثل", "رسام",
    "طباخ", "شيف", "نادل", "سائق", "ميكانيكي", "كهربائي منازل", 
    "نجار", "سباك", "حداد", "نقاش", "حلاق", "خياط",
    "طالب", "عمل حر (Freelancer)", "مدرب رياضي", "ضابط شرطة", "طيار", "مضيف طيران"
  ];

  const degrees = [
    "ثانوية عامة", "دبلوم فني", "دبلوم عالي", "بكالوريوس", 
    "ليسانس", "ماجستير", "دكتوراه", "زمالة"
  ];

  const sections = [
    { id: 'overview', label: t.about_overview, icon: <Globe className="w-5 h-5" /> },
    { id: 'work', label: t.about_work_edu, icon: <Briefcase className="w-5 h-5" /> },
    { id: 'places', label: t.about_places, icon: <MapPin className="w-5 h-5" /> },
    { id: 'contact', label: t.about_contact, icon: <Phone className="w-5 h-5" /> },
    { id: 'family', label: t.about_family, icon: <Heart className="w-5 h-5" /> },
    { id: 'details', label: t.about_details, icon: <Info className="w-5 h-5" /> },
    { id: 'events', label: t.about_events, icon: <Star className="w-5 h-5" /> },
  ];

  // --- Handlers ---
  const deleteItem = (type: 'work' | 'uni' | 'school' | 'place' | 'website' | 'social' | 'family' | 'otherName' | 'event', id: string) => {
    if (type === 'work') setWorks(works.filter(w => w.id !== id));
    if (type === 'uni') setUniversities(universities.filter(u => u.id !== id));
    if (type === 'school') setSchools(schools.filter(s => s.id !== id));
    if (type === 'place') setPlaces(places.filter(p => p.id !== id));
    if (type === 'website') setWebsites(websites.filter(w => w.id !== id));
    if (type === 'social') setSocialLinks(socialLinks.filter(s => s.id !== id));
    if (type === 'family') setFamilyMembers(familyMembers.filter(f => f.id !== id));
    if (type === 'otherName') setOtherNames(otherNames.filter(n => n.id !== id));
    if (type === 'event') setLifeEvents(lifeEvents.filter(e => e.id !== id));
  };

  // Work Handlers
  const handleEditWork = (work: Work) => {
      setNewWork(work);
      setEditingWorkId(work.id);
      setShowWorkForm(true);
  };
  const handleSaveWork = () => {
    if (newWork.role && newWork.company) {
      if (editingWorkId) {
          setWorks(works.map(w => w.id === editingWorkId ? { ...newWork, id: editingWorkId } as Work : w));
          setEditingWorkId(null);
      } else {
          setWorks([...works, { ...newWork, id: Date.now().toString() }]);
      }
      setNewWork({ role: '', company: '', privacy: 'public' });
      setShowWorkForm(false);
    }
  };

  // Uni Handlers
  const handleEditUni = (uni: University) => {
      setNewUni(uni);
      setEditingUniId(uni.id);
      setShowUniForm(true);
  };
  const handleSaveUni = () => {
    if (newUni.name && newUni.degree) {
      if (editingUniId) {
          setUniversities(universities.map(u => u.id === editingUniId ? { ...newUni, id: editingUniId } as University : u));
          setEditingUniId(null);
      } else {
          setUniversities([...universities, { ...newUni, id: Date.now().toString() }]);
      }
      setNewUni({ name: '', degree: '', major: '', year: '', privacy: 'public' });
      setShowUniForm(false);
    }
  };

  // School Handlers
  const handleEditSchool = (school: School) => {
      setNewSchool(school);
      setEditingSchoolId(school.id);
      setShowSchoolForm(true);
  };
  const handleSaveSchool = () => {
    if (newSchool.name) {
      if (editingSchoolId) {
          setSchools(schools.map(s => s.id === editingSchoolId ? { ...newSchool, id: editingSchoolId } as School : s));
          setEditingSchoolId(null);
      } else {
          setSchools([...schools, { ...newSchool, id: Date.now().toString() }]);
      }
      setNewSchool({ name: '', year: '', privacy: 'public' });
      setShowSchoolForm(false);
    }
  };

  // Places Handlers
  const handleEditPlace = (place: Place) => {
      setNewPlace(place);
      setEditingPlaceType(place.type);
  }
  const handleSavePlace = () => {
    if (newPlace.country && newPlace.city && editingPlaceType) {
        // Remove existing place of same type if exists to avoid duplicates when editing or adding
        const filteredPlaces = places.filter(p => p.type !== editingPlaceType);
        
        // Find if we are editing an existing ID, although for places logic is slightly different as we only have 2 types max.
        // Simplified: Just overwrite based on type.
        setPlaces([...filteredPlaces, { ...newPlace, id: Date.now().toString(), type: editingPlaceType }]);
        
        setNewPlace({ country: '', city: '', privacy: 'public' });
        setEditingPlaceType(null);
    }
  };

  // Website Handlers
  const handleEditWebsite = (site: Website) => {
      setNewWebsite(site);
      setEditingWebsiteId(site.id);
      setShowWebsiteForm(true);
  };
  const handleSaveWebsite = () => {
    if (newWebsite.url) {
      if (editingWebsiteId) {
          setWebsites(websites.map(w => w.id === editingWebsiteId ? { ...newWebsite, id: editingWebsiteId } as Website : w));
          setEditingWebsiteId(null);
      } else {
          setWebsites([...websites, { ...newWebsite, id: Date.now().toString() }]);
      }
      setNewWebsite({ url: '', privacy: 'public' });
      setShowWebsiteForm(false);
    }
  };

  // Social Handlers
  const handleEditSocial = (social: SocialLink) => {
      setNewSocial(social);
      setEditingSocialId(social.id);
      setShowSocialForm(true);
  };
  const handleSaveSocial = () => {
    if (newSocial.platform && newSocial.url) {
      if (editingSocialId) {
          setSocialLinks(socialLinks.map(s => s.id === editingSocialId ? { ...newSocial, id: editingSocialId } as SocialLink : s));
          setEditingSocialId(null);
      } else {
          setSocialLinks([...socialLinks, { ...newSocial, id: Date.now().toString() }]);
      }
      setNewSocial({ platform: '', url: '', privacy: 'public' });
      setShowSocialForm(false);
    }
  };

  const handleSaveContact = (field: 'mobile' | 'email') => {
      setContactInfo({...contactInfo, [field]: { ...tempContact }});
      setEditingContact(null);
  };

  const handleSaveBasic = (field: 'gender' | 'birthDate' | 'languages') => {
      if (field === 'gender') setBasicInfo({...basicInfo, gender: tempGender});
      if (field === 'birthDate') setBasicInfo({...basicInfo, birthDate: tempBirthDate});
      if (field === 'languages') setBasicInfo({...basicInfo, languages: tempLanguages});
      setEditingBasic(null);
  };

  const handleSaveRelationship = () => {
      setRelationship(tempRelationship);
      setEditingRelationship(false);
  };

  // Family Handlers
  const handleEditFamily = (member: FamilyMember) => {
      setNewFamilyMember(member);
      setEditingFamilyId(member.id);
      setShowFamilyForm(true);
  };
  const handleSaveFamilyMember = () => {
      if (newFamilyMember.name && newFamilyMember.relation) {
          if (editingFamilyId) {
              setFamilyMembers(familyMembers.map(f => f.id === editingFamilyId ? { ...newFamilyMember, id: editingFamilyId } as FamilyMember : f));
              setEditingFamilyId(null);
          } else {
              setFamilyMembers([...familyMembers, { ...newFamilyMember, id: Date.now().toString() }]);
          }
          setNewFamilyMember({ name: '', relation: '', privacy: 'public' });
          setShowFamilyForm(false);
      }
  };

  const handleSaveBio = () => {
      setBio(tempBio);
      setEditingBio(false);
  };

  const handleSavePronunciation = () => {
      setPronunciation({ ...pronunciation, text: tempPronunciation });
      setEditingPronunciation(false);
  };

  // Other Name Handlers
  const handleEditOtherName = (name: OtherName) => {
      setNewOtherName(name);
      setEditingOtherNameId(name.id);
      setShowOtherNameForm(true);
  };
  const handleSaveOtherName = () => {
      if (newOtherName.name) {
          if (editingOtherNameId) {
              setOtherNames(otherNames.map(n => n.id === editingOtherNameId ? { ...newOtherName, id: editingOtherNameId } as OtherName : n));
              setEditingOtherNameId(null);
          } else {
              setOtherNames([...otherNames, { ...newOtherName, id: Date.now().toString() }]);
          }
          setNewOtherName({ name: '', type: 'اسم الشهرة', privacy: 'public' });
          setShowOtherNameForm(false);
      }
  };

  const handleSaveQuotes = () => {
      setQuotes(tempQuotes);
      setEditingQuotes(false);
  };

  // Event Handlers
  const handleEditEvent = (event: LifeEvent) => {
      setNewEvent(event);
      setEditingEventId(event.id);
      setShowEventForm(true);
  };
  const handleSaveEvent = () => {
      if (newEvent.title && newEvent.year) {
          if (editingEventId) {
              setLifeEvents(lifeEvents.map(e => e.id === editingEventId ? { ...newEvent, id: editingEventId } as LifeEvent : e));
              setEditingEventId(null);
          } else {
              setLifeEvents([...lifeEvents, { ...newEvent, id: Date.now().toString() }]);
          }
          setNewEvent({ title: '', location: '', description: '', year: '', privacy: 'public' });
          setShowEventForm(false);
      }
  };


  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        const hasDetails = works.length > 0 || universities.length > 0 || schools.length > 0 || places.length > 0 || relationship.status || contactInfo.mobile.value || familyMembers.length > 0 || lifeEvents.length > 0 || otherNames.length > 0 || bio.text;
        
        return (
          <div className="space-y-6 animate-fadeIn text-gray-800">
            {/* Bio */}
            {bio.text && (
               <div className="text-center mb-6">
                   <div className="text-lg font-bold text-fb-blue leading-relaxed">{bio.text}</div>
               </div>
            )}

            {/* Work */}
            {works.map(work => (
                <div key={work.id} className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-fb-blue" />
                  <div>
                    <span className="text-fb-blue font-medium">{t.work_works_at} </span>
                    <span className="font-bold text-fb-blue">{work.role}</span>
                    <span className="text-fb-blue font-medium"> {t.work_role_at} </span>
                    <span className="font-bold text-fb-blue">{work.company}</span>
                  </div>
                </div>
            ))}

            {/* Education - Uni */}
            {universities.map(uni => (
                <div key={uni.id} className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-fb-blue" />
                  <div>
                    <span className="text-fb-blue font-medium">{t.edu_studied} </span>
                    <span className="font-bold text-fb-blue">{uni.major}</span>
                    <span className="text-fb-blue font-medium"> {t.edu_at} </span>
                    <span className="font-bold text-fb-blue">{uni.name}</span>
                    {uni.degree && <span className="text-fb-blue font-medium"> ({uni.degree})</span>}
                  </div>
                </div>
            ))}

            {/* Education - School */}
            {schools.map(school => (
                <div key={school.id} className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-fb-blue" />
                  <div>
                    <span className="text-fb-blue font-medium">{t.edu_school} </span>
                    <span className="font-bold text-fb-blue">{school.name}</span>
                    {school.year && <span className="text-fb-blue font-medium"> {t.edu_graduated} {school.year}</span>}
                  </div>
                </div>
            ))}

            {/* Places */}
            {places.map(place => (
                <div key={place.id} className="flex items-center gap-3">
                  {place.type === 'current' ? <Home className="w-6 h-6 text-fb-blue" /> : <MapPin className="w-6 h-6 text-fb-blue" />}
                  <div>
                    <span className="text-fb-blue font-medium">{place.type === 'current' ? t.place_lives : t.place_from} </span>
                    <span className="font-bold text-fb-blue">{place.city}, {place.country}</span>
                  </div>
                </div>
            ))}

            {/* Relationship */}
            {relationship.status && (
                <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-fb-blue" />
                    <div>
                        <span className="font-bold text-fb-blue">{relationship.status}</span>
                        {relationship.partner && <span className="text-fb-blue font-medium"> {t.dir === 'rtl' ? 'مع' : 'with'} <span className="font-bold text-fb-blue">{relationship.partner}</span></span>}
                        {relationship.year && <span className="text-fb-blue font-medium"> {t.dir === 'rtl' ? 'منذ' : 'since'} {relationship.year}</span>}
                    </div>
                </div>
            )}

            {/* Family */}
            {familyMembers.length > 0 && (
               <div className="border-t pt-4 mt-2">
                   <h5 className="font-bold mb-2 text-gray-900">{t.family_members}</h5>
                   {familyMembers.map(member => (
                       <div key={member.id} className="flex items-center gap-3 mb-2">
                           <UserIcon className="w-5 h-5 text-fb-blue" />
                           <span className="text-fb-blue font-bold">{member.name} ({member.relation})</span>
                       </div>
                   ))}
               </div>
            )}

            {/* Contact Info Group */}
            <div className="border-t pt-4 mt-2">
                <h5 className="font-bold mb-2 text-gray-900">{t.about_contact}</h5>
                {contactInfo.mobile.value && (
                     <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-5 h-5 text-fb-blue" />
                        <span dir="ltr" className="text-fb-blue font-bold">{contactInfo.mobile.value}</span>
                        <span className="text-xs text-fb-blue font-medium">{t.contact_mobile}</span>
                    </div>
                )}
                {contactInfo.email.value && (
                     <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-fb-blue" />
                        <span className="text-fb-blue font-bold">{contactInfo.email.value}</span>
                    </div>
                )}
                 {websites.map(site => (
                    <div key={site.id} className="flex items-center gap-3 mb-2">
                        <LinkIcon className="w-5 h-5 text-fb-blue" />
                        <a href={site.url} target="_blank" className="text-fb-blue hover:underline font-bold">{site.url}</a>
                    </div>
                 ))}
                 {socialLinks.map(link => (
                    <div key={link.id} className="flex items-center gap-3 mb-2">
                       {getPlatformIcon(link.platform)}
                       <a href={link.url} target="_blank" className="text-fb-blue hover:underline font-bold">{link.platform}</a>
                    </div>
                 ))}
            </div>

            {/* Basic Info Group */}
            <div className="border-t pt-4 mt-2">
                <h5 className="font-bold mb-2 text-gray-900">{t.about_contact}</h5>
                {basicInfo.gender.value && (
                     <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="w-5 h-5 text-fb-blue" />
                        <span className="text-fb-blue font-bold">{basicInfo.gender.value}</span>
                    </div>
                )}
                {basicInfo.birthDate.year && (
                     <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-fb-blue" />
                        <span className="text-fb-blue font-bold">{basicInfo.birthDate.day} {basicInfo.birthDate.month} {basicInfo.birthDate.year}</span>
                     </div>
                )}
                {basicInfo.languages.value.length > 0 && (
                     <div className="flex items-center gap-3 mb-2">
                        <Languages className="w-5 h-5 text-fb-blue" />
                        <span className="text-fb-blue font-bold">{basicInfo.languages.value.join('، ')}</span>
                     </div>
                )}
            </div>
            
            {/* Other Details */}
             {(pronunciation.text || otherNames.length > 0 || quotes.text) && (
                  <div className="border-t pt-4 mt-2">
                       <h5 className="font-bold mb-2 text-gray-900">{t.about_details}</h5>
                       {pronunciation.text && (
                           <div className="flex items-center gap-3 mb-2">
                               <Mic className="w-5 h-5 text-fb-blue" />
                               <span className="text-fb-blue font-bold">{t.details_pronounce}: {pronunciation.text}</span>
                           </div>
                       )}
                       {otherNames.map(n => (
                           <div key={n.id} className="flex items-center gap-3 mb-2">
                               <PenLine className="w-5 h-5 text-fb-blue" />
                               <span className="text-fb-blue font-bold">{n.name} ({n.type})</span>
                           </div>
                       ))}
                       {quotes.text && (
                            <div className="flex items-center gap-3 mb-2">
                               <Quote className="w-5 h-5 text-fb-blue" />
                               <span className="italic text-fb-blue font-bold">"{quotes.text}"</span>
                           </div>
                       )}
                  </div>
             )}
             
             {lifeEvents.length > 0 && (
                 <div className="border-t pt-4 mt-2">
                      <h5 className="font-bold mb-2 text-gray-900">{t.about_events}</h5>
                      {lifeEvents.map(ev => (
                          <div key={ev.id} className="flex items-center gap-3 mb-3">
                               <Star className="w-5 h-5 text-fb-blue" />
                               <div>
                                   <div className="font-bold text-fb-blue">{ev.title}</div>
                                   <div className="text-sm text-fb-blue font-medium">{ev.year} - {ev.location}</div>
                               </div>
                          </div>
                      ))}
                 </div>
             )}

             {!hasDetails && (
                <div className="text-gray-500 text-center py-10 flex flex-col items-center">
                    <Info className="w-10 h-10 mb-2 text-gray-300" />
                    <p>{t.no_details}</p>
                </div>
            )}
          </div>
        );
      case 'work':
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Work Section */}
            <div>
              <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.about_work_edu}</h4>
              
              {works.map((work) => (
                <div key={work.id} className="flex items-start gap-4 mb-4 group relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-fb-blue" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[16px] font-bold text-fb-blue">{work.role}</div>
                        <div className="text-fb-blue font-medium text-[14px] flex items-center gap-2">
                           {work.company}
                           <span aria-hidden="true">·</span>
                           <PrivacyIcon type={work.privacy} />
                        </div>
                    </div>
                    {!readonly && (
                      <button 
                        onClick={() => handleEditWork(work)}
                        className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                      >
                        <Pen className="w-5 h-5" />
                      </button>
                    )}
                </div>
              ))}

              {!readonly && (!showWorkForm ? (
                <button 
                  onClick={() => {
                      setNewWork({ role: '', company: '', privacy: 'public' });
                      setEditingWorkId(null);
                      setShowWorkForm(true);
                  }}
                  className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold mt-2"
                >
                    <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                    <span>{t.empty_work}</span>
                </button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 fade-in">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.ph_position}</label>
                      <select 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newWork.role}
                        onChange={(e) => setNewWork({...newWork, role: e.target.value})}
                      >
                        <option value="">{t.ph_position}...</option>
                        {jobTitles.map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.ph_company}</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        placeholder={t.ph_company}
                        value={newWork.company}
                        onChange={(e) => setNewWork({...newWork, company: e.target.value})}
                      />
                    </div>
                    
                    <div className="pt-2 flex justify-start">
                         <PrivacySelect 
                            value={newWork.privacy} 
                            onChange={(val) => setNewWork({...newWork, privacy: val})} 
                         />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-3">
                      {editingWorkId ? (
                           <button onClick={() => { deleteItem('work', editingWorkId); setShowWorkForm(false); setEditingWorkId(null); }} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-sm font-semibold flex items-center gap-1">
                               <Trash2 className="w-4 h-4" /> {t.btn_delete}
                           </button>
                      ) : <div></div>}
                      <div className="flex gap-2">
                          <button onClick={() => setShowWorkForm(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                          <button onClick={handleSaveWork} disabled={!newWork.role || !newWork.company} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200"></div>

            {/* University Section */}
            <div>
              <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.empty_uni}</h4>
              
              {universities.map((uni) => (
                <div key={uni.id} className="flex items-start gap-4 mb-4 group relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-fb-blue" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[16px] font-bold text-fb-blue">{uni.name}</div>
                        <div className="text-fb-blue font-medium text-[14px] flex items-center gap-2 flex-wrap">
                          {uni.degree} · {uni.major} {uni.year && `· ${t.edu_graduated} ${uni.year}`}
                          <span aria-hidden="true">·</span>
                          <PrivacyIcon type={uni.privacy} />
                        </div>
                    </div>
                    {!readonly && (
                      <button 
                        onClick={() => handleEditUni(uni)}
                        className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                      >
                        <Pen className="w-5 h-5" />
                      </button>
                    )}
                </div>
              ))}

              {!readonly && (!showUniForm ? (
                <button 
                  onClick={() => {
                      setNewUni({ name: '', degree: '', major: '', year: '', privacy: 'public' });
                      setEditingUniId(null);
                      setShowUniForm(true);
                  }}
                  className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold mt-2"
                >
                    <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                    <span>{t.empty_uni}</span>
                </button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 fade-in">
                  {/* ... Uni form inputs ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t.ph_university}</label>
                       <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newUni.name}
                        onChange={(e) => setNewUni({...newUni, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة العلمية</label>
                      <select 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newUni.degree}
                        onChange={(e) => setNewUni({...newUni, degree: e.target.value})}
                      >
                         <option value="">اختر الدرجة...</option>
                         {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.edu_graduated}</label>
                      <input 
                        type="number" 
                        placeholder="YYYY"
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newUni.year}
                        onChange={(e) => setNewUni({...newUni, year: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                       <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        placeholder="مثال: هندسة، طب، حقوق..."
                        value={newUni.major}
                        onChange={(e) => setNewUni({...newUni, major: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-start">
                        <PrivacySelect 
                            value={newUni.privacy} 
                            onChange={(val) => setNewUni({...newUni, privacy: val})} 
                        />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                      {editingUniId ? (
                           <button onClick={() => { deleteItem('uni', editingUniId); setShowUniForm(false); setEditingUniId(null); }} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-sm font-semibold flex items-center gap-1">
                               <Trash2 className="w-4 h-4" /> {t.btn_delete}
                           </button>
                      ) : <div></div>}
                      <div className="flex gap-2">
                          <button onClick={() => setShowUniForm(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                          <button onClick={handleSaveUni} disabled={!newUni.name || !newUni.degree} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                      </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200"></div>

             {/* High School Section */}
             <div>
              <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.empty_school}</h4>
              
              {schools.map((school) => (
                <div key={school.id} className="flex items-start gap-4 mb-4 group relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-fb-blue" />
                    </div>
                    <div className="flex-1">
                        <div className="text-[16px] font-bold text-fb-blue">{school.name}</div>
                        <div className="text-fb-blue font-medium text-[14px] flex items-center gap-2">
                           {school.year ? `${t.edu_graduated} ${school.year}` : t.empty_school}
                           <span aria-hidden="true">·</span>
                           <PrivacyIcon type={school.privacy} />
                        </div>
                    </div>
                    {!readonly && (
                      <button 
                        onClick={() => handleEditSchool(school)}
                        className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                      >
                        <Pen className="w-5 h-5" />
                      </button>
                    )}
                </div>
              ))}

              {!readonly && (!showSchoolForm ? (
                <button 
                  onClick={() => {
                      setNewSchool({ name: '', year: '', privacy: 'public' });
                      setEditingSchoolId(null);
                      setShowSchoolForm(true);
                  }}
                  className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold mt-2"
                >
                    <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                    <span>{t.empty_school}</span>
                </button>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t.ph_school}</label>
                       <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newSchool.name}
                        onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.edu_graduated}</label>
                      <input 
                        type="number" 
                        placeholder="YYYY"
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newSchool.year}
                        onChange={(e) => setNewSchool({...newSchool, year: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-start">
                        <PrivacySelect 
                            value={newSchool.privacy} 
                            onChange={(val) => setNewSchool({...newSchool, privacy: val})} 
                        />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                      {editingSchoolId ? (
                           <button onClick={() => { deleteItem('school', editingSchoolId); setShowSchoolForm(false); setEditingSchoolId(null); }} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-sm font-semibold flex items-center gap-1">
                               <Trash2 className="w-4 h-4" /> {t.btn_delete}
                           </button>
                      ) : <div></div>}
                      <div className="flex gap-2">
                          <button onClick={() => setShowSchoolForm(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                          <button onClick={handleSaveSchool} disabled={!newSchool.name} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                      </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        );
      case 'places':
        const currentCity = places.find(p => p.type === 'current');
        const hometown = places.find(p => p.type === 'hometown');

        const renderPlaceForm = (type: PlaceType) => (
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 fade-in">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الدولة</label>
                      <select 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                        value={newPlace.country}
                        onChange={(e) => setNewPlace({...newPlace, country: e.target.value, city: ''})}
                      >
                        <option value="">اختر الدولة...</option>
                        {Object.keys(COUNTRIES_DATA).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.ph_city}</label>
                       <select 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none disabled:bg-gray-200"
                        value={newPlace.city}
                        onChange={(e) => setNewPlace({...newPlace, city: e.target.value})}
                        disabled={!newPlace.country}
                      >
                        <option value="">{t.ph_city}...</option>
                        {newPlace.country && COUNTRIES_DATA[newPlace.country]?.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="pt-2 flex justify-start">
                         <PrivacySelect 
                            value={newPlace.privacy} 
                            onChange={(val) => setNewPlace({...newPlace, privacy: val})} 
                         />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-3">
                      {/* Check if place exists to show delete */}
                      {places.find(p => p.type === type) ? (
                           <button onClick={() => { deleteItem('place', places.find(p => p.type === type)!.id); setEditingPlaceType(null); }} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-sm font-semibold flex items-center gap-1">
                               <Trash2 className="w-4 h-4" /> {t.btn_delete}
                           </button>
                      ) : <div></div>}
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingPlaceType(null); setNewPlace({country: '', city: '', privacy: 'public'}); }} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                        <button onClick={handleSavePlace} disabled={!newPlace.country || !newPlace.city} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                      </div>
                    </div>
                  </div>
                </div>
        );

        return (
           <div className="space-y-6 animate-fadeIn">
              <h4 className="font-bold text-[19px] mb-2 text-gray-900">{t.about_places}</h4>
              
              {/* Current City Section */}
              <div className="mb-4">
                  {currentCity && editingPlaceType !== 'current' ? (
                    <div className="flex items-start gap-4 mb-4 group relative">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-fb-blue" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[16px] font-bold text-fb-blue">{currentCity.city}, {currentCity.country}</div>
                            <div className="text-fb-blue font-medium text-[14px] flex items-center gap-2">
                                {t.place_current}
                                <span aria-hidden="true">·</span>
                                <PrivacyIcon type={currentCity.privacy} />
                            </div>
                        </div>
                        {!readonly && (
                            <button 
                                onClick={() => handleEditPlace(currentCity)}
                                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                            >
                                <Pen className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  ) : editingPlaceType !== 'current' ? (
                       !readonly && (
                           <button 
                            onClick={() => setEditingPlaceType('current')}
                            className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold"
                           >
                                <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                                <span>{t.empty_current_city}</span>
                           </button>
                       )
                  ) : renderPlaceForm('current')}
              </div>

              {/* Hometown Section */}
              <div className="mb-4">
                  {hometown && editingPlaceType !== 'hometown' ? (
                    <div className="flex items-start gap-4 mb-4 group relative">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Home className="w-5 h-5 text-fb-blue" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[16px] font-bold text-fb-blue">{hometown.city}, {hometown.country}</div>
                            <div className="text-fb-blue font-medium text-[14px] flex items-center gap-2">
                                {t.place_hometown}
                                <span aria-hidden="true">·</span>
                                <PrivacyIcon type={hometown.privacy} />
                            </div>
                        </div>
                         {!readonly && (
                             <button 
                                onClick={() => handleEditPlace(hometown)}
                                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                            >
                                <Pen className="w-5 h-5" />
                            </button>
                         )}
                    </div>
                  ) : editingPlaceType !== 'hometown' ? (
                       !readonly && (
                           <button 
                            onClick={() => setEditingPlaceType('hometown')}
                            className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold"
                           >
                                <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                                <span>{t.empty_hometown}</span>
                           </button>
                       )
                  ) : renderPlaceForm('hometown')}
              </div>
           </div>
        );
      case 'contact':
        return (
            <div className="space-y-8 animate-fadeIn">
                {/* Contact Info */}
                <div>
                    <h4 className="font-bold text-[17px] mb-4 text-gray-900">{t.about_contact}</h4>
                    
                    {/* Mobile */}
                    <div className="mb-4 group">
                        {editingContact === 'mobile' ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 mb-1 block">{t.contact_mobile}</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded mb-2 text-sm" 
                                    value={tempContact.value} 
                                    onChange={(e) => setTempContact({...tempContact, value: e.target.value})}
                                />
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={tempContact.privacy} onChange={(val) => setTempContact({...tempContact, privacy: val})} small />
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingContact(null)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={() => handleSaveContact('mobile')} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative">
                                <Phone className="w-5 h-5 text-fb-blue" />
                                <div className="flex-1">
                                    {contactInfo.mobile.value ? (
                                        <>
                                            <div 
                                                className={`text-[15px] ${!readonly ? 'text-fb-blue font-bold cursor-pointer hover:underline' : 'text-fb-blue font-bold'}`}
                                                onClick={() => !readonly && (() => { setTempContact(contactInfo.mobile); setEditingContact('mobile'); })()}
                                            >
                                                {contactInfo.mobile.value}
                                            </div>
                                            <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.contact_mobile} <span aria-hidden="true">·</span> <PrivacyIcon type={contactInfo.mobile.privacy} /></div>
                                        </>
                                    ) : (
                                        !readonly ? (
                                            <button 
                                                onClick={() => { setTempContact(contactInfo.mobile); setEditingContact('mobile'); }} 
                                                className="text-[15px] text-fb-blue font-bold hover:underline"
                                            >
                                                {t.empty_mobile}
                                            </button>
                                        ) : (
                                            <div className="text-[15px] text-gray-400 italic">{t.no_mobile}</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-4 group">
                         {editingContact === 'email' ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 mb-1 block">{t.contact_email}</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded mb-2 text-sm" 
                                    value={tempContact.value} 
                                    onChange={(e) => setTempContact({...tempContact, value: e.target.value})}
                                />
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={tempContact.privacy} onChange={(val) => setTempContact({...tempContact, privacy: val})} small />
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingContact(null)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={() => handleSaveContact('email')} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative">
                                <Mail className="w-5 h-5 text-fb-blue" />
                                <div className="flex-1">
                                    {contactInfo.email.value ? (
                                        <>
                                            <div 
                                                className={`text-[15px] ${!readonly ? 'text-fb-blue font-bold cursor-pointer hover:underline' : 'text-fb-blue font-bold'}`}
                                                onClick={() => !readonly && (() => { setTempContact(contactInfo.email); setEditingContact('email'); })()}
                                            >
                                                {contactInfo.email.value}
                                            </div>
                                            <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.contact_email} <span aria-hidden="true">·</span> <PrivacyIcon type={contactInfo.email.privacy} /></div>
                                        </>
                                    ) : (
                                        !readonly ? (
                                            <button 
                                                onClick={() => { setTempContact(contactInfo.email); setEditingContact('email'); }} 
                                                className="text-[15px] text-fb-blue font-bold hover:underline"
                                            >
                                                {t.empty_email}
                                            </button>
                                        ) : (
                                            <div className="text-[15px] text-gray-400 italic">{t.no_email}</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Websites */}
                    <div className="mb-4">
                        {websites.map(site => (
                             <div key={site.id} className="flex items-center gap-3 mb-3 group relative">
                                <LinkIcon className="w-5 h-5 text-fb-blue" />
                                <div className="flex-1">
                                    <a href={site.url} target="_blank" rel="noreferrer" className="text-[15px] text-fb-blue hover:underline block truncate max-w-[200px] font-bold">{site.url}</a>
                                    <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.contact_website} <span aria-hidden="true">·</span> <PrivacyIcon type={site.privacy} /></div>
                                </div>
                                {!readonly && <button onClick={() => handleEditWebsite(site)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Pen className="w-4 h-4" /></button>}
                            </div>
                        ))}
                        {showWebsiteForm ? (
                             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                                <label className="text-xs text-gray-500 mb-1 block">{t.contact_website}</label>
                                <input type="text" className="w-full border p-2 rounded mb-2 text-sm text-left" placeholder="https://..." value={newWebsite.url} onChange={(e) => setNewWebsite({...newWebsite, url: e.target.value})} />
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={newWebsite.privacy} onChange={(val) => setNewWebsite({...newWebsite, privacy: val})} small />
                                    
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                                    {editingWebsiteId ? (
                                        <button onClick={() => { deleteItem('website', editingWebsiteId); setShowWebsiteForm(false); setEditingWebsiteId(null); }} className="text-xs font-semibold px-2 py-1 text-red-500 hover:bg-red-50 rounded">{t.btn_delete}</button>
                                    ) : <div></div>}
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowWebsiteForm(false)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={handleSaveWebsite} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !readonly && (
                                <button onClick={() => { setNewWebsite({ url: '', privacy: 'public' }); setEditingWebsiteId(null); setShowWebsiteForm(true); }} className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold mt-1">
                                    <Plus className="w-5 h-5 rounded-full bg-blue-50 p-1" /> <span>{t.empty_website}</span>
                                </button>
                            )
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="mb-2">
                         {socialLinks.map(link => (
                             <div key={link.id} className="flex items-center gap-3 mb-3 group relative">
                                {getPlatformIcon(link.platform)}
                                <div className="flex-1">
                                    <a href={link.url} target="_blank" rel="noreferrer" className="text-[15px] text-fb-blue hover:underline block font-bold">{link.platform}</a>
                                    <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{link.url} <span aria-hidden="true">·</span> <PrivacyIcon type={link.privacy} /></div>
                                </div>
                                {!readonly && <button onClick={() => handleEditSocial(link)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Pen className="w-4 h-4" /></button>}
                            </div>
                        ))}
                         {showSocialForm ? (
                             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                                <div className="mb-2">
                                    <label className="text-xs text-gray-500 mb-1 block">المنصة</label>
                                    <select className="w-full border p-2 rounded text-sm bg-white" value={newSocial.platform} onChange={(e) => setNewSocial({...newSocial, platform: e.target.value})}>
                                        <option value="">اختر المنصة...</option>
                                        {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <label className="text-xs text-gray-500 mb-1 block">رابط الحساب / اسم المستخدم</label>
                                    <input type="text" className="w-full border p-2 rounded text-sm text-left" placeholder="URL or Username" value={newSocial.url} onChange={(e) => setNewSocial({...newSocial, url: e.target.value})} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={newSocial.privacy} onChange={(val) => setNewSocial({...newSocial, privacy: val})} small />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                                    {editingSocialId ? (
                                        <button onClick={() => { deleteItem('social', editingSocialId); setShowSocialForm(false); setEditingSocialId(null); }} className="text-xs font-semibold px-2 py-1 text-red-500 hover:bg-red-50 rounded">{t.btn_delete}</button>
                                    ) : <div></div>}
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowSocialForm(false)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={handleSaveSocial} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !readonly && (
                                <button onClick={() => { setNewSocial({ platform: '', url: '', privacy: 'public' }); setEditingSocialId(null); setShowSocialForm(true); }} className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold mt-1">
                                    <Plus className="w-5 h-5 rounded-full bg-blue-50 p-1" /> <span>{t.empty_social}</span>
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Basic Info */}
                <div>
                    <h4 className="font-bold text-[17px] mb-4 text-gray-900">المعلومات الأساسية</h4>
                    
                    {/* Gender */}
                     <div className="mb-4 group">
                        {editingBasic === 'gender' ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 mb-1 block">{t.basic_gender}</label>
                                <select className="w-full border p-2 rounded mb-2 text-sm bg-white" value={tempGender.value} onChange={(e) => setTempGender({...tempGender, value: e.target.value})}>
                                    <option value="">اختر النوع...</option>
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                    <option value="مخصص">مخصص</option>
                                </select>
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={tempGender.privacy} onChange={(val) => setTempGender({...tempGender, privacy: val})} small />
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingBasic(null)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={() => handleSaveBasic('gender')} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative">
                                <UserIcon className="w-5 h-5 text-fb-blue" />
                                <div className="flex-1">
                                    {basicInfo.gender.value ? (
                                        <>
                                            <div 
                                                className={`text-[15px] ${!readonly ? 'text-fb-blue font-bold cursor-pointer hover:underline' : 'text-fb-blue font-bold'}`}
                                                onClick={() => !readonly && (() => { setTempGender(basicInfo.gender); setEditingBasic('gender'); })()}
                                            >
                                                {basicInfo.gender.value}
                                            </div>
                                            <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.basic_gender} <span aria-hidden="true">·</span> <PrivacyIcon type={basicInfo.gender.privacy} /></div>
                                        </>
                                    ) : (
                                        !readonly ? (
                                            <button 
                                                onClick={() => { setTempGender(basicInfo.gender); setEditingBasic('gender'); }}
                                                className="text-[15px] text-fb-blue font-bold hover:underline"
                                            >
                                                {t.empty_gender}
                                            </button>
                                        ) : (
                                            <div className="text-[15px] text-gray-400 italic">النوع غير محدد</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Birth Date */}
                     <div className="mb-4 group">
                        {editingBasic === 'birthDate' ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 mb-1 block">{t.basic_birth}</label>
                                <div className="flex gap-2 mb-2">
                                    <select className="border p-1.5 rounded text-sm bg-white flex-1" value={tempBirthDate.day} onChange={(e) => setTempBirthDate({...tempBirthDate, day: e.target.value})}>
                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select className="border p-1.5 rounded text-sm bg-white flex-1" value={tempBirthDate.month} onChange={(e) => setTempBirthDate({...tempBirthDate, month: e.target.value})}>
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select className="border p-1.5 rounded text-sm bg-white flex-1" value={tempBirthDate.year} onChange={(e) => setTempBirthDate({...tempBirthDate, year: e.target.value})}>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={tempBirthDate.privacy} onChange={(val) => setTempBirthDate({...tempBirthDate, privacy: val})} small />
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingBasic(null)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={() => handleSaveBasic('birthDate')} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative">
                                <Calendar className="w-5 h-5 text-fb-blue" />
                                <div className="flex-1">
                                    {basicInfo.birthDate.year ? (
                                        <>
                                            <div 
                                                className={`text-[15px] ${!readonly ? 'text-fb-blue font-bold cursor-pointer hover:underline' : 'text-fb-blue font-bold'}`}
                                                onClick={() => !readonly && (() => { setTempBirthDate(basicInfo.birthDate); setEditingBasic('birthDate'); })()}
                                            >
                                                {basicInfo.birthDate.day} {basicInfo.birthDate.month} {basicInfo.birthDate.year}
                                            </div>
                                            <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.basic_birth} <span aria-hidden="true">·</span> <PrivacyIcon type={basicInfo.birthDate.privacy} /></div>
                                        </>
                                    ) : (
                                        !readonly ? (
                                            <button 
                                                onClick={() => { setTempBirthDate(basicInfo.birthDate); setEditingBasic('birthDate'); }}
                                                className="text-[15px] text-fb-blue font-bold hover:underline"
                                            >
                                                {t.empty_birth}
                                            </button>
                                        ) : (
                                            <div className="text-[15px] text-gray-400 italic">تاريخ الميلاد غير محدد</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Languages */}
                    <div className="mb-4 group">
                        {editingBasic === 'languages' ? (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <label className="text-xs text-gray-500 mb-1 block">{t.basic_lang}</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tempLanguages.value.map(lang => (
                                        <span key={lang} className="bg-white border px-2 py-1 rounded text-sm flex items-center gap-1">
                                            {lang}
                                            <X className="w-3 h-3 cursor-pointer text-red-500" onClick={() => setTempLanguages({...tempLanguages, value: tempLanguages.value.filter(l => l !== lang)})} />
                                        </span>
                                    ))}
                                </div>
                                <select 
                                    className="w-full border p-2 rounded mb-2 text-sm bg-white" 
                                    onChange={(e) => {
                                        if (e.target.value && !tempLanguages.value.includes(e.target.value)) {
                                            setTempLanguages({...tempLanguages, value: [...tempLanguages.value, e.target.value]})
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="">إضافة لغة...</option>
                                    {LANGUAGES_LIST.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                                <div className="flex justify-between items-center">
                                    <PrivacySelect value={tempLanguages.privacy} onChange={(val) => setTempLanguages({...tempLanguages, privacy: val})} small />
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingBasic(null)} className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded">{t.btn_cancel}</button>
                                        <button onClick={() => handleSaveBasic('languages')} className="text-xs font-semibold px-2 py-1 bg-fb-blue text-white rounded">{t.btn_save}</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 relative">
                                <Languages className="w-5 h-5 text-fb-blue" />
                                <div className="flex-1">
                                    {basicInfo.languages.value.length > 0 ? (
                                        <>
                                            <div 
                                                className={`text-[15px] ${!readonly ? 'text-fb-blue font-bold cursor-pointer hover:underline' : 'text-fb-blue font-bold'}`}
                                                onClick={() => !readonly && (() => { setTempLanguages(basicInfo.languages); setEditingBasic('languages'); })()}
                                            >
                                                {basicInfo.languages.value.join('، ')}
                                            </div>
                                            <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.basic_lang} <span aria-hidden="true">·</span> <PrivacyIcon type={basicInfo.languages.privacy} /></div>
                                        </>
                                    ) : (
                                        !readonly ? (
                                            <button 
                                                onClick={() => { setTempLanguages(basicInfo.languages); setEditingBasic('languages'); }}
                                                className="text-[15px] text-fb-blue font-bold hover:underline"
                                            >
                                                {t.empty_lang}
                                            </button>
                                        ) : (
                                            <div className="text-[15px] text-gray-400 italic">{t.no_lang}</div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
      case 'family':
          return (
              <div className="space-y-8 animate-fadeIn">
                  {/* Relationship Status Section */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.about_family}</h4>
                      
                      {editingRelationship ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
                              <select 
                                  className="w-full border p-2 rounded mb-3 text-sm bg-white"
                                  value={tempRelationship.status}
                                  onChange={(e) => setTempRelationship({...tempRelationship, status: e.target.value, partner: '', year: '', month: '', day: ''})}
                              >
                                  <option value="">اختر الحالة...</option>
                                  {RELATIONSHIP_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>

                              {PARTNER_REQUIRED_STATUSES.includes(tempRelationship.status) && (
                                  <>
                                      <div className="mb-3">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">الشريك</label>
                                          <select 
                                              className="w-full border p-2 rounded text-sm bg-white"
                                              value={tempRelationship.partner}
                                              onChange={(e) => setTempRelationship({...tempRelationship, partner: e.target.value})}
                                          >
                                              <option value="">اختر من الأصدقاء...</option>
                                              {MOCK_FRIENDS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                                          </select>
                                      </div>
                                      <div className="mb-3">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ (اختياري)</label>
                                          <div className="flex gap-2">
                                              <select 
                                                  className="w-1/4 border p-2 rounded text-sm bg-white"
                                                  value={tempRelationship.day || ''}
                                                  onChange={(e) => setTempRelationship({...tempRelationship, day: e.target.value})}
                                              >
                                                  <option value="">اليوم</option>
                                                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                              </select>
                                              <select 
                                                  className="w-1/3 border p-2 rounded text-sm bg-white"
                                                  value={tempRelationship.month || ''}
                                                  onChange={(e) => setTempRelationship({...tempRelationship, month: e.target.value})}
                                              >
                                                  <option value="">الشهر</option>
                                                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                              </select>
                                              <select 
                                                  className="flex-1 border p-2 rounded text-sm bg-white"
                                                  value={tempRelationship.year || ''}
                                                  onChange={(e) => setTempRelationship({...tempRelationship, year: e.target.value})}
                                              >
                                                  <option value="">السنة</option>
                                                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                              </select>
                                          </div>
                                      </div>
                                  </>
                              )}

                              <div className="flex justify-between items-center pt-2">
                                  <PrivacySelect value={tempRelationship.privacy} onChange={(val) => setTempRelationship({...tempRelationship, privacy: val})} />
                                  <div className="flex gap-2">
                                      <button onClick={() => setEditingRelationship(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                      <button onClick={handleSaveRelationship} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700">{t.btn_save}</button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex items-center gap-3 group relative mb-4">
                              <Heart className="w-6 h-6 text-fb-blue" />
                              <div className="flex-1">
                                  {relationship.status ? (
                                      <>
                                        <div 
                                            className={`text-[16px] ${!readonly ? 'text-fb-blue font-bold cursor-pointer hover:underline' : 'text-fb-blue font-bold'}`}
                                            onClick={() => !readonly && (() => { setTempRelationship(relationship); setEditingRelationship(true); })()}
                                        >
                                            {relationship.status} 
                                            {relationship.partner && <span className={`${!readonly ? 'text-fb-blue' : 'text-gray-900'} font-normal`}> {t.dir === 'rtl' ? 'مع' : 'with'} <span className="font-bold">{relationship.partner}</span></span>}
                                        </div>
                                        <div className="text-xs text-fb-blue font-medium flex items-center gap-1">
                                            {relationship.year && (
                                                <span>
                                                    {t.dir === 'rtl' ? 'منذ' : 'since'} {relationship.day ? `${relationship.day} ` : ''}
                                                    {relationship.month ? `${relationship.month} ` : ''}
                                                    {relationship.year}
                                                </span>
                                            )}
                                            {relationship.year && <span aria-hidden="true">·</span>}
                                            <PrivacyIcon type={relationship.privacy} />
                                        </div>
                                      </>
                                  ) : (
                                      !readonly ? (
                                          <button 
                                              onClick={() => { setTempRelationship(relationship); setEditingRelationship(true); }}
                                              className="text-[16px] text-fb-blue font-bold hover:underline"
                                          >
                                              {t.empty_rel}
                                          </button>
                                      ) : (
                                          <div className="text-gray-400 italic">لا توجد حالة اجتماعية</div>
                                      )
                                  )}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Family Members Section */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.family_members}</h4>
                      
                      {familyMembers.map((member) => (
                          <div key={member.id} className="flex items-start gap-4 mb-4 group relative">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="w-5 h-5 text-fb-blue" />
                              </div>
                              <div className="flex-1">
                                  <div className="text-[16px] font-bold text-fb-blue">{member.name}</div>
                                  <div className="text-fb-blue font-medium text-[14px] flex items-center gap-2">
                                      {member.relation}
                                      <span aria-hidden="true">·</span>
                                      <PrivacyIcon type={member.privacy} />
                                  </div>
                              </div>
                              {!readonly && (
                                  <button 
                                      onClick={() => handleEditFamily(member)}
                                      className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                                  >
                                      <Pen className="w-5 h-5" />
                                  </button>
                              )}
                          </div>
                      ))}

                      {!readonly && (!showFamilyForm ? (
                          <button 
                              onClick={() => {
                                  setNewFamilyMember({ name: '', relation: '', privacy: 'public' });
                                  setEditingFamilyId(null);
                                  setShowFamilyForm(true);
                              }}
                              className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold mt-2"
                          >
                              <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                              <span>{t.empty_family}</span>
                          </button>
                      ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.family_members}</label>
                                      <select 
                                          className="w-full border p-2 rounded text-sm bg-white"
                                          value={newFamilyMember.name}
                                          onChange={(e) => setNewFamilyMember({...newFamilyMember, name: e.target.value})}
                                      >
                                          <option value="">اختر من الأصدقاء...</option>
                                          {MOCK_FRIENDS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                                      </select>
                                  </div>
                                  <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">صلة القرابة</label>
                                      <select 
                                          className="w-full border p-2 rounded text-sm bg-white"
                                          value={newFamilyMember.relation}
                                          onChange={(e) => setNewFamilyMember({...newFamilyMember, relation: e.target.value})}
                                      >
                                          <option value="">اختر صلة القرابة...</option>
                                          {FAMILY_RELATIONS_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                  </div>
                              </div>

                              <div className="flex justify-between items-center pt-2">
                                  <PrivacySelect value={newFamilyMember.privacy} onChange={(val) => setNewFamilyMember({...newFamilyMember, privacy: val})} />
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                                  {editingFamilyId ? (
                                      <button onClick={() => { deleteItem('family', editingFamilyId); setShowFamilyForm(false); setEditingFamilyId(null); }} className="text-xs font-semibold px-2 py-1 text-red-500 hover:bg-red-50 rounded">{t.btn_delete}</button>
                                  ) : <div></div>}
                                  <div className="flex gap-2">
                                      <button onClick={() => setShowFamilyForm(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                      <button onClick={handleSaveFamilyMember} disabled={!newFamilyMember.name || !newFamilyMember.relation} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      case 'details':
          return (
              <div className="space-y-8 animate-fadeIn">
                  {/* Bio */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.about_details}</h4>
                      {editingBio ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <textarea 
                                  className="w-full border p-2 rounded mb-2 text-sm h-24 resize-none focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                                  placeholder={t.ph_desc_self}
                                  value={tempBio.text}
                                  onChange={(e) => setTempBio({...tempBio, text: e.target.value})}
                              />
                              <div className="flex justify-between items-center">
                                  <PrivacySelect value={tempBio.privacy} onChange={(val) => setTempBio({...tempBio, privacy: val})} />
                                  <div className="flex gap-2">
                                      <button onClick={() => setEditingBio(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                      <button onClick={handleSaveBio} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700">{t.btn_save}</button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex items-start gap-3 group relative mb-4">
                              <div className="text-center w-full">
                                {bio.text ? (
                                    <div className="text-[15px] text-fb-blue font-bold text-center mb-1">
                                        {bio.text}
                                    </div>
                                ) : (
                                    !readonly && (
                                        <button onClick={() => { setTempBio(bio); setEditingBio(true); }} className="text-fb-blue hover:underline font-bold">
                                            {t.empty_bio}
                                        </button>
                                    )
                                )}
                                {!readonly && bio.text && (
                                    <div className="flex justify-center items-center gap-1">
                                        <PrivacyIcon type={bio.privacy} />
                                        <button onClick={() => { setTempBio(bio); setEditingBio(true); }} className="text-xs text-fb-blue hover:underline">{t.btn_edit}</button>
                                    </div>
                                )}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Name Pronunciation */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-2 text-gray-900">{t.details_pronounce}</h4>
                      {editingPronunciation ? (
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <label className="text-xs text-gray-500 mb-1 block">كيف ينطق اسمك؟</label>
                             <input 
                                  type="text"
                                  className="w-full border p-2 rounded mb-2 text-sm"
                                  placeholder={t.ph_pronounce}
                                  value={tempPronunciation}
                                  onChange={(e) => setTempPronunciation(e.target.value)}
                             />
                             <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingPronunciation(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                  <button onClick={handleSavePronunciation} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700">{t.btn_save}</button>
                             </div>
                         </div>
                      ) : (
                         <div className="mb-4">
                             {pronunciation.text ? (
                                 <div className="flex items-center gap-3 group relative">
                                    <Mic className="w-6 h-6 text-fb-blue" />
                                    <div className="flex-1">
                                        <div className="text-[16px] text-fb-blue font-bold">{pronunciation.text}</div>
                                        <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{t.details_pronounce} <span aria-hidden="true">·</span> <PrivacyIcon type={pronunciation.privacy} /></div>
                                    </div>
                                    {!readonly && <button onClick={() => { setTempPronunciation(pronunciation.text); setEditingPronunciation(true); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Pen className="w-5 h-5" /></button>}
                                 </div>
                             ) : (
                                 !readonly && (
                                     <button onClick={() => setEditingPronunciation(true)} className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold">
                                         <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                                         <span>{t.empty_pronounce}</span>
                                     </button>
                                 )
                             )}
                         </div>
                      )}
                  </div>
                  
                  <div className="border-t border-gray-200"></div>

                  {/* Other Names */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">أسماء أخرى</h4>
                      
                      {otherNames.map(name => (
                          <div key={name.id} className="flex items-center gap-3 mb-3 group relative">
                              <PenLine className="w-6 h-6 text-fb-blue" />
                              <div className="flex-1">
                                  <div className="text-[16px] text-fb-blue font-bold">{name.name}</div>
                                  <div className="text-xs text-fb-blue font-medium flex items-center gap-1">{name.type} <span aria-hidden="true">·</span> <PrivacyIcon type={name.privacy} /></div>
                              </div>
                              {!readonly && <button onClick={() => handleEditOtherName(name)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Pen className="w-4 h-4" /></button>}
                          </div>
                      ))}

                      {showOtherNameForm ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 fade-in">
                              <div className="mb-3">
                                  <label className="text-xs text-gray-500 mb-1 block">نوع الاسم</label>
                                  <select 
                                      className="w-full border p-2 rounded text-sm bg-white"
                                      value={newOtherName.type}
                                      onChange={(e) => setNewOtherName({...newOtherName, type: e.target.value})}
                                  >
                                      {OTHER_NAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                              </div>
                              <div className="mb-3">
                                  <label className="text-xs text-gray-500 mb-1 block">الاسم</label>
                                  <input 
                                      type="text" 
                                      className="w-full border p-2 rounded text-sm"
                                      value={newOtherName.name}
                                      onChange={(e) => setNewOtherName({...newOtherName, name: e.target.value})}
                                  />
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                  <PrivacySelect value={newOtherName.privacy} onChange={(val) => setNewOtherName({...newOtherName, privacy: val})} />
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                                  {editingOtherNameId ? (
                                      <button onClick={() => { deleteItem('otherName', editingOtherNameId); setShowOtherNameForm(false); setEditingOtherNameId(null); }} className="text-xs font-semibold px-2 py-1 text-red-500 hover:bg-red-50 rounded">{t.btn_delete}</button>
                                  ) : <div></div>}
                                  <div className="flex gap-2">
                                      <button onClick={() => setShowOtherNameForm(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                      <button onClick={handleSaveOtherName} disabled={!newOtherName.name} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          !readonly && (
                              <button onClick={() => { setNewOtherName({ name: '', type: 'اسم الشهرة', privacy: 'public' }); setEditingOtherNameId(null); setShowOtherNameForm(true); }} className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold">
                                   <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                                   <span>{t.empty_other_name}</span>
                              </button>
                          )
                      )}
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Favorite Quotes */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.details_quotes}</h4>
                       {editingQuotes ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <textarea 
                                  className="w-full border p-2 rounded mb-2 text-sm h-24 resize-none focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                                  placeholder={t.ph_quote}
                                  value={tempQuotes.text}
                                  onChange={(e) => setTempQuotes({...tempQuotes, text: e.target.value})}
                              />
                              <div className="flex justify-between items-center">
                                  <PrivacySelect value={tempQuotes.privacy} onChange={(val) => setTempQuotes({...tempQuotes, privacy: val})} />
                                  <div className="flex gap-2">
                                      <button onClick={() => setEditingQuotes(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                      <button onClick={handleSaveQuotes} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700">{t.btn_save}</button>
                                  </div>
                              </div>
                          </div>
                       ) : (
                           <div className="mb-4">
                               {quotes.text ? (
                                   <div className="group relative">
                                       <div className="text-[15px] text-fb-blue font-bold italic font-serif border-r-4 border-gray-300 pr-3 py-1">
                                           "{quotes.text}"
                                       </div>
                                       <div className="text-xs text-fb-blue font-medium flex items-center gap-1 mt-1 pr-3">
                                            <PrivacyIcon type={quotes.privacy} />
                                       </div>
                                       {!readonly && <button onClick={() => { setTempQuotes(quotes); setEditingQuotes(true); }} className="hidden group-hover:block absolute top-0 left-0 p-1 text-gray-500 hover:bg-gray-100 rounded-full"><Pen className="w-5 h-5" /></button>}
                                   </div>
                               ) : (
                                   !readonly && (
                                       <button onClick={() => { setTempQuotes(quotes); setEditingQuotes(true); }} className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold">
                                           <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                                           <span>{t.empty_quotes}</span>
                                       </button>
                                   )
                               )}
                           </div>
                       )}
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Blood Donation */}
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.details_blood}</h4>
                      <div className="flex items-center gap-4 bg-red-50 p-3 rounded-lg border border-red-100">
                          <div className="bg-red-500 rounded-full p-2">
                              <Droplet className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                              <div className="font-semibold text-gray-900">تعرف على التبرع بالدم</div>
                              <div className="text-xs text-gray-500">يمكنك المساعدة في إنقاذ الأرواح من خلال التبرع بالدم.</div>
                          </div>
                          <button className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md font-semibold hover:bg-gray-50 transition">
                              {t.btn_view_more}
                          </button>
                      </div>
                  </div>

              </div>
          );
      case 'events':
          return (
              <div className="space-y-8 animate-fadeIn">
                  <div>
                      <h4 className="font-bold text-[19px] mb-4 text-gray-900">{t.about_events}</h4>
                      
                      {lifeEvents.map((event) => (
                          <div key={event.id} className="flex items-start gap-4 mb-4 group relative">
                              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Star className="w-5 h-5 text-fb-blue" />
                              </div>
                              <div className="flex-1">
                                  <div className="text-[16px] font-bold text-fb-blue">{event.title}</div>
                                  <div className="text-sm text-fb-blue font-medium">{event.location} • {event.year}</div>
                                  {event.description && <div className="text-sm text-fb-blue font-medium mt-1">{event.description}</div>}
                                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <PrivacyIcon type={event.privacy} />
                                  </div>
                              </div>
                              {!readonly && (
                                  <button 
                                      onClick={() => handleEditEvent(event)}
                                      className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
                                  >
                                      <Pen className="w-4 h-4" />
                                  </button>
                              )}
                          </div>
                      ))}

                      {!readonly && (!showEventForm ? (
                          <button 
                              onClick={() => {
                                  setNewEvent({ title: '', location: '', description: '', year: '', privacy: 'public' });
                                  setEditingEventId(null);
                                  setShowEventForm(true);
                              }}
                              className="flex items-center gap-2 text-fb-blue hover:underline text-[15px] font-bold"
                          >
                              <Plus className="w-6 h-6 rounded-full bg-blue-50 p-1" />
                              <span>{t.empty_events}</span>
                          </button>
                      ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 fade-in">
                              <div className="space-y-3">
                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم المناسبة</label>
                                      <input 
                                          type="text" 
                                          className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                                          placeholder="مثال: التخرج، وظيفة جديدة..."
                                          value={newEvent.title}
                                          onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                      />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المناسبة</label>
                                          <input 
                                              type="text" 
                                              className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                                              placeholder="المدينة أو المكان"
                                              value={newEvent.location}
                                              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">سنة المناسبة</label>
                                          <select 
                                              className="w-full border p-2 rounded text-sm bg-white focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                                              value={newEvent.year}
                                              onChange={(e) => setNewEvent({...newEvent, year: e.target.value})}
                                          >
                                              <option value="">اختر السنة...</option>
                                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                          </select>
                                      </div>
                                  </div>

                                  <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">وصف المناسبة</label>
                                      <textarea 
                                          className="w-full border p-2 rounded text-sm h-20 resize-none focus:ring-2 focus:ring-fb-blue focus:border-transparent outline-none"
                                          placeholder="أضف تفاصيل أكثر..."
                                          value={newEvent.description}
                                          onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                      />
                                  </div>

                                  <div className="flex justify-between items-center pt-2">
                                      <PrivacySelect value={newEvent.privacy} onChange={(val) => setNewEvent({...newEvent, privacy: val})} />
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                                      {editingEventId ? (
                                          <button onClick={() => { deleteItem('event', editingEventId); setShowEventForm(false); setEditingEventId(null); }} className="text-xs font-semibold px-2 py-1 text-red-500 hover:bg-red-50 rounded">{t.btn_delete}</button>
                                      ) : <div></div>}
                                      <div className="flex gap-2">
                                          <button onClick={() => setShowEventForm(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded-md text-sm font-semibold">{t.btn_cancel}</button>
                                          <button onClick={handleSaveEvent} disabled={!newEvent.title || !newEvent.year} className="px-4 py-1.5 bg-fb-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{t.btn_save}</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      default:
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Info className="w-12 h-12 mb-2 text-gray-300" />
                <p>{t.no_details}</p>
            </div>
        );
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg flex flex-col md:flex-row min-h-[500px] overflow-hidden">
      {/* Sidebar (Right side in RTL) */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-gray-200 p-2">
        <h2 className="text-xl font-bold p-3 mb-2">{t.profile_about}</h2>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li
              key={section.id}
              onClick={() => setActiveSection(section.id as SectionType)}
              className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition font-medium text-[15px] ${
                activeSection === section.id
                  ? 'bg-blue-50 text-fb-blue'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{section.label}</span>
              {activeSection === section.id && (
                  <div className="w-1 h-full bg-transparent"></div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfileAbout;
