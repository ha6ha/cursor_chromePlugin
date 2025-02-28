// 使用免费的谷歌翻译API
async function translateText(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // 谷歌翻译返回的数据结构是一个嵌套数组，第一个元素包含翻译结果
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
    // 直接调用翻译函数，不需要API Key
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