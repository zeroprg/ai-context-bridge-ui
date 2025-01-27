// Home.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCookie } from './auth';
import { Footer } from './content/components';
import { MyChatBot } from './components/MyChatBot';
import ModeSwitch from './components/ModeSwitch';

import "./App.css";
import "./home.css";

const Home = ({ initiateGoogleOAuth }) => {
    const [showLanguagePopup, setShowLanguagePopup] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    const navigate = useNavigate();
    const aboutLink = process.env.REACT_APP_DEV_DOC_SITE || 'http://tothemoon.chat';

    const handleRunButtonClick = () => {
        navigate('/api');
    };

    const translateContent = (contentKey) => {
        const translations = {
            "en": {
                title: "Welcome to the AI Document and Audio Processor",
                description: "A versatile tool designed to process and analyze documents and audio inputs efficiently.",
                features: [
                    "Automated document parsing and editing",
                    "Audio input transcription and analysis",
                    "Supports various document formats including PDFs, images, and spreadsheets",
                    "Built-in multi-language support for global usage",
                    "Secure and easy to use for enterprise-grade document and audio processing"
                ],
                runButton: "Run",
                supportedLanguages: "Supported Languages",
                videoTutorials: "Access video tutorials:"
            },
            "es": {
                title: "Bienvenido al Procesador de Documentos y Audio con IA",
                description: "Una herramienta versátil diseñada para procesar y analizar documentos y entradas de audio de manera eficiente.",
                features: [
                    "Análisis y edición automática de documentos",
                    "Transcripción y análisis de entradas de audio",
                    "Compatibilidad con varios formatos de documentos, incluidos PDFs, imágenes y hojas de cálculo",
                    "Soporte multilingüe integrado para uso global",
                    "Seguro y fácil de usar para el procesamiento de documentos y audio a nivel empresarial"
                ],
                runButton: "Ejecutar",
                supportedLanguages: "Idiomas Soportados",
                videoTutorials: "Accede a los tutoriales en video:"
            },
            "ru": {
                title: "Добро пожаловать в процессор документов и аудио с ИИ",
                description: "Мощный инструмент для обработки и анализа документов и аудиозаписей с высокой эффективностью.",
                features: [
                    "Автоматический анализ и редактирование документов",
                    "Транскрипция и анализ аудиозаписей",
                    "Поддержка различных форматов документов, включая PDF, изображения и таблицы",
                    "Встроенная поддержка нескольких языков для глобального использования",
                    "Безопасная и удобная работа для обработки документов и аудио корпоративного уровня"
                ],
                runButton: "Запустить",
                supportedLanguages: "Поддерживаемые языки",
                videoTutorials: "Доступ к видеоруководствам:"
            },
            "zh": {
                title: "欢迎使用AI文档和音频处理器",
                description: "一个多功能工具，旨在高效处理和分析文档和音频输入。",
                features: [
                    "自动文档解析和编辑",
                    "音频输入转录和分析",
                    "支持各种文档格式，包括PDF、图像和电子表格",
                    "为全球使用提供内置多语言支持",
                    "安全易用，适用于企业级文档和音频处理"
                ],
                runButton: "运行",
                supportedLanguages: "支持的语言",
                videoTutorials: "访问视频教程："
            },
            "ar": {
                title: "مرحبًا بكم في معالج المستندات والصوت بالذكاء الاصطناعي",
                description: "أداة متعددة الاستخدامات مصممة لمعالجة المستندات والمدخلات الصوتية وتحليلها بكفاءة.",
                features: [
                    "تحليل وتحرير المستندات تلقائيًا",
                    "نسخ وتحليل المدخلات الصوتية",
                    "دعم تنسيقات مستندات مختلفة بما في ذلك PDF والصور وجداول البيانات",
                    "دعم متعدد اللغات مدمج للاستخدام العالمي",
                    "آمن وسهل الاستخدام لمعالجة المستندات والصوت على مستوى المؤسسات"
                ],
                runButton: "تشغيل",
                supportedLanguages: "اللغات المدعومة",
                videoTutorials: "الوصول إلى البرامج التعليمية بالفيديو:"
            }
        };
        return translations[selectedLanguage]?.[contentKey] || translations["en"]?.[contentKey];
    };

    const LANGUAGES = [
        { label: "English", code: "en" },
        { label: "Spanish", code: "es" },
        { label: "Russian", code: "ru" },
        { label: "Chinese", code: "zh" },
        { label: "Arabic", code: "ar" }
    ];

    const handleLanguageChange = (code) => {
        setSelectedLanguage(code);
        setShowLanguagePopup(false);
    };

    return (
        <main className="App">
            <header className="App-header">
                <img src="/logo192.png" alt="Logo" className="logo" />
                <h1 className="title">{translateContent("title")}</h1>

                <div className="description-box">
                    <p>{translateContent("description")}</p>
                    {/* Fancy Features Section */}
                    <div className="features-box">
                        {translateContent("features").map((feature, index) => (
                            <div key={index} className="feature-item">
                                <span className="feature-icon">✨</span> {/* Add an icon */}
                                <p>{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="action-buttons">
                    {getCookie('sessionId') ? (
                        <button className="fancy-button run-button" onClick={handleRunButtonClick}>
                            {translateContent("runButton")}
                        </button>
                    ) : (
                        <button className="fancy-button google-signin-btn" onClick={initiateGoogleOAuth}>
                            <div className="google-signin-btn-icon-wrapper">
                                <img className="google-signin-btn-icon" src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
                            </div>
                            <span className="google-signin-btn-text">Continue with Google</span>
                        </button>
                    )}
                </div>

                <div className="language-selection">
                    <button
                        className="fancy-button language-toggle-button"
                        onClick={() => setShowLanguagePopup(!showLanguagePopup)}
                    >
                        {translateContent("supportedLanguages")}
                    </button>
                    {showLanguagePopup && (
                        <div className="language-buttons">
                            {LANGUAGES.map(({ code, label }) => (
                                <button
                                    key={code}
                                    className={`fancy-button language-button ${code === selectedLanguage ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange(code)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <p className="video-tutorials-text">{translateContent("videoTutorials")}</p>
                <div className="video-gallery">
                    <a href="https://www.youtube.com/watch?v=3KYhto1OtLo" target="_blank" rel="noopener noreferrer" className="video-thumbnail">
                        <img src="https://img.youtube.com/vi/3KYhto1OtLo/maxresdefault.jpg" alt="Video Tutorial 1" className="thumbnail-image" />
                    </a>
                    <a href="https://www.youtube.com/watch?v=JDwIteJiF_o" target="_blank" rel="noopener noreferrer" className="video-thumbnail">
                        <img src="https://img.youtube.com/vi/JDwIteJiF_o/maxresdefault.jpg" alt="Video Tutorial 2" className="thumbnail-image" />
                    </a>
                    <a href="https://youtu.be/_xvoSTcJh08" target="_blank" rel="noopener noreferrer" className="video-thumbnail">
                        <img src="https://img.youtube.com/vi/_xvoSTcJh08/maxresdefault.jpg" alt="Video Tutorial 3" className="thumbnail-image" />
                    </a>
                </div>

                <p className="about-link-text">
                    Learn more about the tool's features:
                    <a href={aboutLink} target="_blank" rel="noopener noreferrer" className="about-link"> Reference to technical details</a>
                </p>

                <ModeSwitch />
            </header>
            <MyChatBot ln={selectedLanguage} />
            <Footer />
        </main>
    );
};

export default Home;