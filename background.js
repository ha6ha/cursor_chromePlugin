// 使用 MyMemory 翻译 API
async function translateText(text) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else if (data.responseStatus === 429) {
      throw new Error('超出API使用限制，请稍后再试');
    } else {
      throw new Error(data.responseDetails || '翻译失败');
    }
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text)
      .then(translation => {
        sendResponse({ translation });
      })
      .catch(error => {
        sendResponse({ translation: '翻译出错：' + error.message });
      });
    
    // 保持消息通道开放
    return true;
  }
}); 