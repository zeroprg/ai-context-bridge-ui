import React from "react";
import ChatBot from "react-chatbotify";
import { OpenAI } from "openai";

// Translation function
const translateContent = (contentKey, ln) => {
  const translations = {
    en: {
      welcomeMessage: "Hello. I'm OpenAI Assistant light. To get started, please enter your API key. Your key will only be stored in your browser.",
      apiKeyAccepted: "API key accepted! You can now ask me anything!",
      unableToProcess: "Unable to process your request. Is your API key valid?",
      title: "OpenAI Assistant Light",
    },
    es: {
      welcomeMessage: "Hola. Soy OpenAI Assistant Light. Para comenzar, ingrese su clave API. Su clave solo se almacenará en su navegador.",
      apiKeyAccepted: "¡Clave API aceptada! ¡Ahora puedes preguntarme lo que quieras!",
      unableToProcess: "No se puede procesar su solicitud. ¿Es válida su clave API?",
      title: "Asistente Ligero de OpenAI",
    },
    ru: {
      welcomeMessage: "Здравствуйте. Я OpenAI Assistant Light. Чтобы начать, введите ваш API-ключ. Ваш ключ будет храниться только в вашем браузере.",
      apiKeyAccepted: "API-ключ принят! Теперь вы можете спросить меня о чем угодно!",
      unableToProcess: "Невозможно обработать ваш запрос. Ваш API-ключ действителен?",
      title: "Легкий Ассистент OpenAI",
    },
    zh: {
      welcomeMessage: "您好。我是 OpenAI Assistant Light。请输入您的 API 密钥开始。您的密钥将仅存储在您的浏览器中。",
      apiKeyAccepted: "API 密钥已接受！现在你可以问我任何问题！",
      unableToProcess: "无法处理您的请求。您的 API 密钥有效吗？",
      title: "OpenAI 助理精简版",
    },
    ar: {
      welcomeMessage: "مرحبًا. أنا مساعد OpenAI Light. للبدء، يرجى إدخال مفتاح API الخاص بك. سيتم تخزين مفتاحك فقط في متصفحك.",
      apiKeyAccepted: "تم قبول مفتاح API! يمكنك الآن سؤالي أي شيء!",
      unableToProcess: "تعذر معالجة طلبك. هل مفتاح API الخاص بك صالح؟",
      title: "مساعد OpenAI الخفيف",
    },
  };
  return translations[ln][contentKey];
};

// ChatBot Component
export const MyChatBot = ({ ln = "en" }) => {
  let apiKey = null;
  const modelType = "chatgpt-4o-latest";
  let hasError = false;

  // OpenAI streaming function
  const openai_stream = async (params) => {
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: modelType,
        messages: [{ role: "user", content: params.userInput }],
        stream: true,
      });

      let text = "";
      let offset = 0;

      for await (const chunk of response) {
        const chunkText = chunk.choices[0]?.delta?.content || "";
        text += chunkText;

        for (let i = offset; i < text.length; i++) {
          await params.streamMessage(text.slice(0, i + 1));
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        offset = text.length;
      }

      await params.streamMessage(text);
      await params.endStreamMessage();
    } catch (error) {
      console.error("Error during OpenAI streaming:", error);
      await params.injectMessage(translateContent("unableToProcess", ln));
      hasError = true;
    }
  };

  // ChatBot Flow
  const flow = {
    start: {
      message: translateContent("welcomeMessage", ln),
      path: "api_key",
      isSensitive: true,
    },
    api_key: {
      message: (params) => {
        apiKey = params.userInput.trim();
        return translateContent("apiKeyAccepted", ln);
      },
      path: "loop",
    },
    loop: {
      message: async (params) => {
        await openai_stream(params);
      },
      path: "loop", // Always stays in the loop for subsequent messages
    },
  };

  return (
    <ChatBot
      settings={{
        general: { embedded: false },
        header: { title: translateContent("title", ln) },
        chatHistory: { storageKey: "example_real_time_stream" },
        botBubble: { simStream: true },
      }}
      flow={flow}
    />
  );
};