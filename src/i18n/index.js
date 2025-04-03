import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import translationZH from './locales/zh-CN.json';
import translationEN from './locales/en-US.json';
import translationZHT from './locales/zh-TW.json';

// 预加载翻译资源
const resources = {
    'zh-CN': {
        translation: translationZH
    },
    'en-US': {
        translation: translationEN
    },
    'zh-TW': {
        translation: translationZHT
    }
};

// 在初始化之前清理掉pullToRefresh和refreshing文本
i18n
    // 使用http后端加载翻译文件
    .use(Backend)
    // 检测用户语言
    .use(LanguageDetector)
    // 将i18n实例传递给react-i18next
    .use(initReactI18next)
    // 初始化i18next
    .init({
        resources,
        fallbackLng: 'zh-CN', // 默认语言
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false, // 不需要React转义
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        react: {
            useSuspense: true,
        },
    });

export default i18n; 