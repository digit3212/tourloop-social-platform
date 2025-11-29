export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    dir: 'rtl',
    // Navbar
    search_placeholder: 'بحث في Tourloop',
    nav_home: 'الرئيسية',
    nav_friends: 'الأصدقاء',
    nav_watch: 'فيديو',
    nav_market: 'المتجر',
    nav_gaming: 'ألعاب',
    
    // Sidebar
    menu_memories: 'الذكريات',
    menu_saved: 'العناصر المحفوظة',
    menu_groups: 'المجموعات',
    menu_events: 'المناسبات',
    menu_more: 'عرض المزيد',
    menu_less: 'عرض أقل',
    shortcuts: 'اختصاراتك',
    privacy_footer: 'الخصوصية · الشروط · الإعلانات · Meta © 2024',

    // Create Post
    create_post_placeholder: 'بم تفكر يا',
    btn_live: 'فيديو مباشر',
    btn_photo: 'صورة/فيديو',
    btn_feeling: 'شعور/نشاط',
    btn_ai: 'ذكاء اصطناعي',
    btn_post: 'نشر',
    ai_thinking: 'جاري التفكير...',

    // Post Card
    post_pinned: 'منشور مثبت',
    btn_like: 'أعجبني',
    btn_comment: 'تعليق',
    btn_share: 'مشاركة',
    write_comment: 'اكتب تعليقاً...',
    
    // Rightbar
    sponsored: 'ممول',
    contacts: 'جهات الاتصال',

    // Profile Tabs
    profile_posts: 'المنشورات',
    profile_about: 'حول',
    profile_friends: 'الأصدقاء',
    profile_photos: 'الصور',
    profile_videos: 'مقاطع فيديو/ريلز',
    profile_groups: 'المجموعات',
    profile_pages: 'الصفحات',
    profile_events: 'المناسبات',
    profile_more: 'المزيد',
    
    // Profile Actions
    profile_message: 'مراسلة',
    profile_add_friend: 'إضافة صديق',
    profile_friend_request_sent: 'تم إرسال الطلب',
    profile_is_friend: 'أصدقاء',
    profile_edit_profile: 'تعديل الملف الشخصي',
    profile_edit_cover: 'تعديل صورة الغلاف',
    profile_add_story: 'إضافة إلى القصة',

    // Profile About Sections Titles
    about_overview: 'نظرة عامة',
    about_work_edu: 'العمل والتعليم',
    about_places: 'الأماكن التي عشت فيها',
    about_contact: 'المعلومات الأساسية والاتصال',
    about_family: 'العائلة والعلاقات',
    about_details: 'تفاصيل عنك',
    about_events: 'المناسبات الشخصية',

    // Profile About Content
    work_works_at: 'يعمل',
    work_role_at: 'لدى',
    edu_studied: 'درس',
    edu_at: 'في',
    edu_graduated: 'تخرج عام',
    edu_school: 'درس في',
    place_lives: 'يقيم في',
    place_from: 'من',
    place_current: 'المدينة الحالية',
    place_hometown: 'المنشأ',
    contact_mobile: 'هاتف محمول',
    contact_email: 'البريد الإلكتروني',
    contact_website: 'موقع ويب',
    basic_gender: 'النوع',
    basic_birth: 'تاريخ الميلاد',
    basic_lang: 'اللغات',
    family_members: 'أفراد العائلة',
    details_pronounce: 'ينطق',
    details_quotes: 'الاقتباسات المفضلة',
    details_blood: 'التبرع بالدم',
    
    // Buttons & Actions
    btn_add: 'إضافة',
    btn_edit: 'تعديل',
    btn_save: 'حفظ',
    btn_cancel: 'إلغاء',
    btn_delete: 'حذف',
    btn_view_more: 'تعرف على المزيد',
    
    // Placeholders
    ph_company: 'اسم الشركة',
    ph_position: 'المسمى الوظيفي',
    ph_school: 'اسم المدرسة',
    ph_university: 'اسم الجامعة',
    ph_city: 'المدينة',
    ph_desc_self: 'صف نفسك...',
    ph_quote: 'أضف اقتباسك المفضل...',
    ph_pronounce: 'مثال: أحمد (AH-med)',
    
    // Empty States
    empty_work: 'أضف مكان عمل',
    empty_uni: 'إضافة كلية / جامعة',
    empty_school: 'إضافة مدرسة ثانوية',
    empty_current_city: 'إضافة مدينة حالية',
    empty_hometown: 'إضافة منشأ',
    empty_mobile: 'إضافة رقم هاتف',
    empty_email: 'إضافة بريد إلكتروني',
    empty_website: 'إضافة موقع ويب',
    empty_social: 'إضافة رابط تواصل اجتماعي',
    empty_gender: 'إضافة النوع',
    empty_birth: 'إضافة تاريخ الميلاد',
    empty_lang: 'إضافة لغة',
    empty_rel: 'إضافة الحالة الاجتماعية',
    empty_family: 'إضافة فرد من العائلة',
    empty_bio: 'اكتب بعض التفاصيل عن نفسك',
    empty_pronounce: 'أضف طريقة نطق الاسم',
    empty_other_name: 'أضف اسماً آخر',
    empty_quotes: 'أضف اقتباساتك المفضلة',
    empty_events: 'إضافة مناسبة شخصية',
    no_details: 'لا توجد تفاصيل لعرضها في النظرة العامة.',
    no_mobile: 'لا يوجد رقم هاتف',
    no_email: 'لا يوجد بريد إلكتروني',
    no_lang: 'لا توجد لغات مضافة',
    rel_add: 'أضف حالتك الاجتماعية',
    
    // General
    loading: 'جاري التحميل...',
    online: 'نشط الآن'
  },
  en: {
    dir: 'ltr',
    // Navbar
    search_placeholder: 'Search Tourloop',
    nav_home: 'Home',
    nav_friends: 'Friends',
    nav_watch: 'Watch',
    nav_market: 'Marketplace',
    nav_gaming: 'Gaming',

    // Sidebar
    menu_memories: 'Memories',
    menu_saved: 'Saved Items',
    menu_groups: 'Groups',
    menu_events: 'Events',
    menu_more: 'See more',
    menu_less: 'See less',
    shortcuts: 'Your Shortcuts',
    privacy_footer: 'Privacy · Terms · Advertising · Meta © 2024',

    // Create Post
    create_post_placeholder: "What's on your mind,",
    btn_live: 'Live Video',
    btn_photo: 'Photo/Video',
    btn_feeling: 'Feeling/Activity',
    btn_ai: 'Magic AI',
    btn_post: 'Post',
    ai_thinking: 'Thinking...',

    // Post Card
    post_pinned: 'Pinned Post',
    btn_like: 'Like',
    btn_comment: 'Comment',
    btn_share: 'Share',
    write_comment: 'Write a comment...',

    // Rightbar
    sponsored: 'Sponsored',
    contacts: 'Contacts',

    // Profile Tabs
    profile_posts: 'Posts',
    profile_about: 'About',
    profile_friends: 'Friends',
    profile_photos: 'Photos',
    profile_videos: 'Videos/Reels',
    profile_groups: 'Groups',
    profile_pages: 'Pages',
    profile_events: 'Events',
    profile_more: 'More',

    // Profile Actions
    profile_message: 'Message',
    profile_add_friend: 'Add Friend',
    profile_friend_request_sent: 'Request Sent',
    profile_is_friend: 'Friends',
    profile_edit_profile: 'Edit Profile',
    profile_edit_cover: 'Edit Cover Photo',
    profile_add_story: 'Add to Story',

    // Profile About Sections Titles
    about_overview: 'Overview',
    about_work_edu: 'Work and Education',
    about_places: 'Places Lived',
    about_contact: 'Contact and Basic Info',
    about_family: 'Family and Relationships',
    about_details: 'Details About You',
    about_events: 'Life Events',

    // Profile About Content
    work_works_at: 'Works',
    work_role_at: 'at',
    edu_studied: 'Studied',
    edu_at: 'at',
    edu_graduated: 'Class of',
    edu_school: 'Went to',
    place_lives: 'Lives in',
    place_from: 'From',
    place_current: 'Current City',
    place_hometown: 'Hometown',
    contact_mobile: 'Mobile',
    contact_email: 'Email',
    contact_website: 'Website',
    basic_gender: 'Gender',
    basic_birth: 'Birth Date',
    basic_lang: 'Languages',
    family_members: 'Family Members',
    details_pronounce: 'Pronounces name',
    details_quotes: 'Favorite Quotes',
    details_blood: 'Blood Donations',

    // Buttons & Actions
    btn_add: 'Add',
    btn_edit: 'Edit',
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_delete: 'Delete',
    btn_view_more: 'Learn More',

    // Placeholders
    ph_company: 'Company Name',
    ph_position: 'Job Title',
    ph_school: 'School Name',
    ph_university: 'University Name',
    ph_city: 'City',
    ph_desc_self: 'Describe yourself...',
    ph_quote: 'Add your favorite quote...',
    ph_pronounce: 'e.g. Ahmed (AH-med)',

    // Empty States
    empty_work: 'Add a workplace',
    empty_uni: 'Add college / university',
    empty_school: 'Add high school',
    empty_current_city: 'Add current city',
    empty_hometown: 'Add hometown',
    empty_mobile: 'Add mobile number',
    empty_email: 'Add email address',
    empty_website: 'Add website',
    empty_social: 'Add social link',
    empty_gender: 'Add gender',
    empty_birth: 'Add birth date',
    empty_lang: 'Add language',
    empty_rel: 'Add relationship status',
    empty_family: 'Add family member',
    empty_bio: 'Write some details about yourself',
    empty_pronounce: 'Add name pronunciation',
    empty_other_name: 'Add other name',
    empty_quotes: 'Add favorite quotes',
    empty_events: 'Add life event',
    no_details: 'No details to show in Overview.',
    no_mobile: 'No mobile number',
    no_email: 'No email address',
    no_lang: 'No languages added',
    rel_add: 'Add your relationship',

    // General
    loading: 'Loading...',
    online: 'Online'
  }
};