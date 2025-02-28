// 使用谷歌翻译API
async function translateText(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    } else {
      throw new Error('翻译结果格式错误');
    }
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    // 确保在异步操作完成前保持消息通道开放
    (async () => {
      try {
        const translation = await translateText(request.text);
        sendResponse({ translation });
      } catch (error) {
        console.error('Translation error:', error);
        sendResponse({ translation: '翻译出错：' + (error.message || '未知错误') });
      }
    })();
    
    return true; // 保持消息通道开放
  }
}); 