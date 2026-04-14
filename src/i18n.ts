import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Qareeb",
      "search_placeholder": "Search for shops...",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "user_role": "User",
      "owner_role": "Shop Owner",
      "open": "Open",
      "closed": "Closed",
      "details": "Details",
      "reviews": "Reviews",
      "favorites": "Favorites",
      "chat": "Chat",
      "toggle_status": "Toggle Shop Status",
      "near_me": "Near Me",
      "no_shops_found": "No shops found nearby",
      "add_to_favorites": "Add to Favorites",
      "remove_from_favorites": "Remove from Favorites",
      "language": "Language",
      "arabic": "العربية",
      "english": "English",
      "register_as": "Register as",
      "shop_name": "Shop Name",
      "shop_description": "Shop Description",
      "location": "Location",
      "save": "Save",
      "cancel": "Cancel"
    }
  },
  ar: {
    translation: {
      "app_name": "قريب",
      "search_placeholder": "ابحث عن محلات...",
      "login": "تسجيل الدخول",
      "register": "تسجيل جديد",
      "logout": "تسجيل الخروج",
      "user_role": "مستخدم",
      "owner_role": "صاحب محل",
      "open": "مفتوح",
      "closed": "مغلق",
      "details": "التفاصيل",
      "reviews": "التقييمات",
      "favorites": "المفضلة",
      "chat": "المحادثة",
      "toggle_status": "تغيير حالة المحل",
      "near_me": "بالقرب مني",
      "no_shops_found": "لم يتم العثور على محلات قريبة",
      "add_to_favorites": "إضافة للمفضلة",
      "remove_from_favorites": "إزالة من المفضلة",
      "language": "اللغة",
      "arabic": "العربية",
      "english": "English",
      "register_as": "التسجيل كـ",
      "shop_name": "اسم المحل",
      "shop_description": "وصف المحل",
      "location": "الموقع",
      "save": "حفظ",
      "cancel": "إلغاء"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
