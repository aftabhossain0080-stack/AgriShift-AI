export type LanguageDirection = 'ltr' | 'rtl';
export type TranslationStatus = 'human' | 'machine' | 'fallback';

export interface Language {
  code: string;
  nativeName: string;
  englishName: string;
  direction: LanguageDirection;
  status: TranslationStatus;
}

export const LANGUAGES: Language[] = [
  // Human reviewed languages (Core Tier 1)
  { code: 'en', nativeName: 'English', englishName: 'English', direction: 'ltr', status: 'human' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', direction: 'ltr', status: 'human' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', direction: 'ltr', status: 'human' },

  // South Asian Regional Languages
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', direction: 'ltr', status: 'machine' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', direction: 'ltr', status: 'machine' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', direction: 'ltr', status: 'machine' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', direction: 'ltr', status: 'machine' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', direction: 'ltr', status: 'machine' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', direction: 'ltr', status: 'machine' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', direction: 'ltr', status: 'machine' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', direction: 'ltr', status: 'machine' },
  { code: 'si', nativeName: 'සිංහල', englishName: 'Sinhala', direction: 'ltr', status: 'machine' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', direction: 'ltr', status: 'machine' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', direction: 'ltr', status: 'machine' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', direction: 'rtl', status: 'machine' },
  { code: 'sd', nativeName: 'سنڌي', englishName: 'Sindhi', direction: 'rtl', status: 'machine' },
  { code: 'ps', nativeName: 'پښتو', englishName: 'Pashto', direction: 'rtl', status: 'machine' },

  // Middle East & North Africa (RTL Focus)
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', direction: 'rtl', status: 'machine' },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', direction: 'rtl', status: 'machine' },
  { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', direction: 'rtl', status: 'machine' },
  { code: 'ku', nativeName: 'Kurdî', englishName: 'Kurdish', direction: 'ltr', status: 'machine' },
  { code: 'ug', nativeName: 'ئۇيغۇرچە', englishName: 'Uyghur', direction: 'rtl', status: 'machine' },

  // East & Southeast Asia
  { code: 'zh', nativeName: '中文 (简体)', englishName: 'Chinese (Simplified)', direction: 'ltr', status: 'machine' },
  { code: 'zh-TW', nativeName: '中文 (繁體)', englishName: 'Chinese (Traditional)', direction: 'ltr', status: 'machine' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', direction: 'ltr', status: 'machine' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', direction: 'ltr', status: 'machine' },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', direction: 'ltr', status: 'machine' },
  { code: 'th', nativeName: 'ไทย', englishName: 'Thai', direction: 'ltr', status: 'machine' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', direction: 'ltr', status: 'machine' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', direction: 'ltr', status: 'machine' },
  { code: 'tl', nativeName: 'Tagalog', englishName: 'Tagalog / Filipino', direction: 'ltr', status: 'machine' },
  { code: 'my', nativeName: 'မြန်မာဘာသာ', englishName: 'Burmese', direction: 'ltr', status: 'machine' },
  { code: 'km', nativeName: 'ភាសាខ្មែរ', englishName: 'Khmer', direction: 'ltr', status: 'machine' },
  { code: 'lo', nativeName: 'ພາສາລາວ', englishName: 'Lao', direction: 'ltr', status: 'machine' },
  { code: 'jv', nativeName: 'Basa Jawa', englishName: 'Javanese', direction: 'ltr', status: 'machine' },
  { code: 'su', nativeName: 'Basa Sunda', englishName: 'Sundanese', direction: 'ltr', status: 'machine' },

  // Sub-Saharan Africa
  { code: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', direction: 'ltr', status: 'machine' },
  { code: 'ha', nativeName: 'Harshen Hausa', englishName: 'Hausa', direction: 'ltr', status: 'machine' },
  { code: 'yo', nativeName: 'Èdè Yorùbá', englishName: 'Yoruba', direction: 'ltr', status: 'machine' },
  { code: 'ig', nativeName: 'Asụsụ Igbo', englishName: 'Igbo', direction: 'ltr', status: 'machine' },
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', direction: 'ltr', status: 'machine' },
  { code: 'om', nativeName: 'Afaan Oromoo', englishName: 'Oromo', direction: 'ltr', status: 'machine' },
  { code: 'ti', nativeName: 'ትግርኛ', englishName: 'Tigrinya', direction: 'ltr', status: 'machine' },
  { code: 'so', nativeName: 'Af Soomaali', englishName: 'Somali', direction: 'ltr', status: 'machine' },
  { code: 'rw', nativeName: 'Ikinyarwanda', englishName: 'Kinyarwanda', direction: 'ltr', status: 'machine' },
  { code: 'sn', nativeName: 'chiShona', englishName: 'Shona', direction: 'ltr', status: 'machine' },
  { code: 'zu', nativeName: 'isiZulu', englishName: 'Zulu', direction: 'ltr', status: 'machine' },
  { code: 'xh', nativeName: 'isiXhosa', englishName: 'Xhosa', direction: 'ltr', status: 'machine' },
  { code: 'st', nativeName: 'Sesotho', englishName: 'Southern Sotho', direction: 'ltr', status: 'machine' },
  { code: 'tn', nativeName: 'Setswana', englishName: 'Tswana', direction: 'ltr', status: 'machine' },
  { code: 'mg', nativeName: 'Fiteny Malagasy', englishName: 'Malagasy', direction: 'ltr', status: 'machine' },
  { code: 'ny', nativeName: 'ChiChewa', englishName: 'Chichewa', direction: 'ltr', status: 'machine' },
  { code: 'lg', nativeName: 'Luganda', englishName: 'Ganda', direction: 'ltr', status: 'machine' },
  { code: 'wo', nativeName: 'Wolof', englishName: 'Wolof', direction: 'ltr', status: 'machine' },
  { code: 'bm', nativeName: 'Bamanankan', englishName: 'Bambara', direction: 'ltr', status: 'machine' },
  { code: 'ln', nativeName: 'Lingála', englishName: 'Lingala', direction: 'ltr', status: 'machine' },
  { code: 'kg', nativeName: 'Kikongo', englishName: 'Kongo', direction: 'ltr', status: 'machine' },
  { code: 'ak', nativeName: 'Akan', englishName: 'Akan / Twi', direction: 'ltr', status: 'machine' },

  // Central Asia & Caucasus
  { code: 'uz', nativeName: 'Oʻzbekcha', englishName: 'Uzbek', direction: 'ltr', status: 'machine' },
  { code: 'kk', nativeName: 'Қазақша', englishName: 'Kazakh', direction: 'ltr', status: 'machine' },
  { code: 'ky', nativeName: 'Кыргызча', englishName: 'Kyrgyz', direction: 'ltr', status: 'machine' },
  { code: 'tg', nativeName: 'Тоҷикӣ', englishName: 'Tajik', direction: 'ltr', status: 'machine' },
  { code: 'tk', nativeName: 'Türkmençe', englishName: 'Turkmen', direction: 'ltr', status: 'machine' },
  { code: 'az', nativeName: 'Azərbaycan', englishName: 'Azerbaijani', direction: 'ltr', status: 'machine' },
  { code: 'ka', nativeName: 'ქართული', englishName: 'Georgian', direction: 'ltr', status: 'machine' },
  { code: 'hy', nativeName: 'Հայերեն', englishName: 'Armenian', direction: 'ltr', status: 'machine' },
  { code: 'mn', nativeName: 'Монгол', englishName: 'Mongolian', direction: 'ltr', status: 'machine' },

  // Europe & Americas - Major Global Languages
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', direction: 'ltr', status: 'machine' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', direction: 'ltr', status: 'machine' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', direction: 'ltr', status: 'machine' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', direction: 'ltr', status: 'machine' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', direction: 'ltr', status: 'machine' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', direction: 'ltr', status: 'machine' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', direction: 'ltr', status: 'machine' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish', direction: 'ltr', status: 'machine' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', direction: 'ltr', status: 'machine' },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', direction: 'ltr', status: 'machine' },
  { code: 'ro', nativeName: 'Română', englishName: 'Romanian', direction: 'ltr', status: 'machine' },
  { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', direction: 'ltr', status: 'machine' },
  { code: 'cs', nativeName: 'Čeština', englishName: 'Czech', direction: 'ltr', status: 'machine' },
  { code: 'hu', nativeName: 'Magyar', englishName: 'Hungarian', direction: 'ltr', status: 'machine' },
  { code: 'sv', nativeName: 'Svenska', englishName: 'Swedish', direction: 'ltr', status: 'machine' },
  { code: 'bg', nativeName: 'Български', englishName: 'Bulgarian', direction: 'ltr', status: 'machine' },
  { code: 'sr', nativeName: 'Српски', englishName: 'Serbian', direction: 'ltr', status: 'machine' },
  { code: 'hr', nativeName: 'Hrvatski', englishName: 'Croatian', direction: 'ltr', status: 'machine' },
  { code: 'sk', nativeName: 'Slovenčina', englishName: 'Slovak', direction: 'ltr', status: 'machine' },
  { code: 'da', nativeName: 'Dansk', englishName: 'Danish', direction: 'ltr', status: 'machine' },
  { code: 'fi', nativeName: 'Suomi', englishName: 'Finnish', direction: 'ltr', status: 'machine' },
  { code: 'no', nativeName: 'Norsk', englishName: 'Norwegian', direction: 'ltr', status: 'machine' },
  { code: 'lt', nativeName: 'Lietuvių', englishName: 'Lithuanian', direction: 'ltr', status: 'machine' },
  { code: 'sl', nativeName: 'Slovenščina', englishName: 'Slovenian', direction: 'ltr', status: 'machine' },
  { code: 'lv', nativeName: 'Latviešu', englishName: 'Latvian', direction: 'ltr', status: 'machine' },
  { code: 'et', nativeName: 'Eesti', englishName: 'Estonian', direction: 'ltr', status: 'machine' },
  { code: 'sq', nativeName: 'Shqip', englishName: 'Albanian', direction: 'ltr', status: 'machine' },
  { code: 'mk', nativeName: 'Македонски', englishName: 'Macedonian', direction: 'ltr', status: 'machine' },
  { code: 'bs', nativeName: 'Bosanski', englishName: 'Bosnian', direction: 'ltr', status: 'machine' },
  { code: 'is', nativeName: 'Íslenska', englishName: 'Icelandic', direction: 'ltr', status: 'machine' },
  { code: 'ga', nativeName: 'Gaeilge', englishName: 'Irish', direction: 'ltr', status: 'machine' },
  { code: 'cy', nativeName: 'Cymraeg', englishName: 'Welsh', direction: 'ltr', status: 'machine' },
  { code: 'mt', nativeName: 'Malti', englishName: 'Maltese', direction: 'ltr', status: 'machine' },
  { code: 'gl', nativeName: 'Galego', englishName: 'Galician', direction: 'ltr', status: 'machine' },
  { code: 'eu', nativeName: 'Euskara', englishName: 'Basque', direction: 'ltr', status: 'machine' },
  { code: 'ca', nativeName: 'Català', englishName: 'Catalan', direction: 'ltr', status: 'machine' },

  // Latin America & Indigenous
  { code: 'qu', nativeName: 'Runa Simi', englishName: 'Quechua', direction: 'ltr', status: 'machine' },
  { code: 'ay', nativeName: 'Aymar aru', englishName: 'Aymara', direction: 'ltr', status: 'machine' },
  { code: 'gn', nativeName: 'Avañeʼẽ', englishName: 'Guarani', direction: 'ltr', status: 'machine' },
  { code: 'ht', nativeName: 'Kreyòl Ayisyen', englishName: 'Haitian Creole', direction: 'ltr', status: 'machine' },

  // Additional Global & Regional Agriculture-relevant
  { code: 'af', nativeName: 'Afrikaans', englishName: 'Afrikaans', direction: 'ltr', status: 'machine' },
  { code: 'be', nativeName: 'Беларуская', englishName: 'Belarusian', direction: 'ltr', status: 'machine' },
  { code: 'ceb', nativeName: 'Sinugboanon', englishName: 'Cebuano', direction: 'ltr', status: 'machine' },
  { code: 'co', nativeName: 'Corsu', englishName: 'Corsican', direction: 'ltr', status: 'machine' },
  { code: 'eo', nativeName: 'Esperanto', englishName: 'Esperanto', direction: 'ltr', status: 'machine' },
  { code: 'fy', nativeName: 'Frysk', englishName: 'Western Frisian', direction: 'ltr', status: 'machine' },
  { code: 'gd', nativeName: 'Gàidhlig', englishName: 'Scottish Gaelic', direction: 'ltr', status: 'machine' },
  { code: 'haw', nativeName: 'ʻŌlelo Hawaiʻi', englishName: 'Hawaiian', direction: 'ltr', status: 'machine' },
  { code: 'hmn', nativeName: 'Hmoob', englishName: 'Hmong', direction: 'ltr', status: 'machine' },
  { code: 'ilo', nativeName: 'Ilokano', englishName: 'Ilocano', direction: 'ltr', status: 'machine' },
  { code: 'la', nativeName: 'Latina', englishName: 'Latin', direction: 'ltr', status: 'machine' },
  { code: 'lb', nativeName: 'Lëtzebuergesch', englishName: 'Luxembourgish', direction: 'ltr', status: 'machine' },
  { code: 'mi', nativeName: 'Te Reo Māori', englishName: 'Maori', direction: 'ltr', status: 'machine' },
  { code: 'sm', nativeName: 'Gagana Sāmoa', englishName: 'Samoan', direction: 'ltr', status: 'machine' },
  { code: 'to', nativeName: 'Lea Fakatonga', englishName: 'Tongan', direction: 'ltr', status: 'machine' },
  { code: 'tt', nativeName: 'Татарча', englishName: 'Tatar', direction: 'ltr', status: 'machine' },
  { code: 'yi', nativeName: 'ייִדיש', englishName: 'Yiddish', direction: 'rtl', status: 'machine' },
];

export const RTL_LANGUAGES = new Set(
  LANGUAGES.filter((l) => l.direction === 'rtl').map((l) => l.code)
);

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
}

export function isRTL(code: string): boolean {
  return RTL_LANGUAGES.has(code.toLowerCase());
}

export const HUMAN_LOCALES = ['en', 'bn', 'hi'] as const;
export type HumanLocale = (typeof HUMAN_LOCALES)[number];
