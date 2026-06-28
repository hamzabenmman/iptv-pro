import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales - sorted by priority
  locales: [
    'ar', // العربية (Darija / Arabic)
    'fr', // Français
    'en', // English
    'es', // Español
    'de', // Deutsch
    'it', // Italiano
    'pt', // Português
    'nl', // Nederlands
    'ru', // Русский
    'zh', // 中文
    'ja', // 日本語
    'ko', // 한국어
    'tr', // Türkçe
    'pl', // Polski
    'sv', // Svenska
    'da', // Dansk
    'fi', // Suomi
    'cs', // Čeština
    'hu', // Magyar
    'ro', // Română
    'el', // Ελληνικά
    'he', // עברית
    'hi', // हिन्दी
    'th', // ไทย
    'vi', // Tiếng Việt
    'ms', // Bahasa Melayu
    'id', // Bahasa Indonesia
    'fil', // Filipino
    'uk', // Українська
    'bg', // Български
    'sr', // Српски
    'hr', // Hrvatski
    'sk', // Slovenčina
    'sl', // Slovenščina
    'lt', // Lietuvių
    'lv', // Latviešu
    'et', // Eesti
    'ka', // ქართული
    'hy', // Հայերեն
    'az', // Azərbaycan
    'fa', // فارسی
    'ur', // اردو
    'bn', // বাংলা
    'ta', // தமிழ்
    'te', // తెలుగు
    'ml', // മലയാളം
    'kn', // ಕನ್ನಡ
    'gu', // ગુજરાતી
    'mr', // मराठी
    'ne', // नेपाली
    'si', // සිංහල
    'km', // ភាសាខ្មែរ
    'lo', // ລາວ
    'my', // မြန်မာဘာသာ
    'am', // አማርኛ
    'sw', // Kiswahili
    'ha', // Hausa
    'yo', // Yorùbá
    'ig', // Igbo
    'zu', // isiZulu
    'af', // Afrikaans
    'mt', // Malti
    'is', // Íslenska
    'no', // Norsk
    'ga', // Gaeilge
    'cy', // Cymraeg
    'sq', // Shqip
    'mk', // Македонски
    'bs', // Bosanski
    'mn', // Монгол
    'ps', // پښتو
    'sd', // سنڌي
    'ckb', // کوردی
    'ky', // Кыргызча
    'kk', // Қазақша
    'uz', // O'zbek
    'tk', // Türkmen
    'tg', // Тоҷикӣ
    'be', // Беларуская
  ] as const,
  defaultLocale: 'ar',
  localeDetection: true,
  localePrefix: 'as-needed',
});
