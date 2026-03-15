// 使用谷歌翻译API - 普通翻译（免费）
async function translateText(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    const data = await response.json();

    // data[0] 是一个二维数组，形如 [[translated1, original1, ...], [translated2, original2, ...], ...]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const segments = data[0]
        .filter((item) => Array.isArray(item) && item[0])
        .map((item) => item[0]);

      if (segments.length > 0) {
        // 使用换行分段，保持多段文本结构
        return segments.join('\n');
      }
    }

    throw new Error('翻译结果格式错误');
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

async function aiTranslateWithDeepSeek(text) {
  try {
    // 通过后端代理调用 DeepSeek，后端负责保存和注入 API Key
    const url = 'http://localhost:3000/deepseek';

    const body = { text };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('DeepSeek API 请求失败: ' + response.status);
    }

    const data = await response.json();
    const result = data?.translation?.trim();

    if (!result) {
      throw new Error('DeepSeek 返回结果为空');
    }

    return result;
  } catch (error) {
    console.error('DeepSeek Translation API error:', error);
    throw error;
  }
}

// 监听来自content script和popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    // 普通翻译 - 谷歌
    (async () => {
      try {
        const translation = await translateText(request.text);
        sendResponse({ translation });
      } catch (error) {
        console.error('Translation error:', error);
        sendResponse({
          translation:
            '翻译出错：' + (error && error.message ? error.message : '未知错误'),
        });
      }
    })();

    return true; // 保持消息通道开放
  }

  if (request.action === 'aiTranslate') {
    // AI 增强翻译 - DeepSeek
    (async () => {
      try {
        const translation = await aiTranslateWithDeepSeek(request.text);
        sendResponse({ translation });
      } catch (error) {
        console.error('AI Translation error:', error);
        sendResponse({
          translation:
            'AI 翻译出错：' +
            (error && error.message ? error.message : '未知错误'),
        });
      }
    })();

    return true; // 保持消息通道开放
  }
});