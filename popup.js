const input = document.getElementById('inputText');
const result = document.getElementById('result');
const normalBtn = document.getElementById('normalTranslate');
const aiBtn = document.getElementById('aiTranslate');

function setLoading(text) {
  if (result) {
    result.textContent = text;
  }
}

function setResult(text) {
  if (result) {
    result.textContent = text;
  }
}

// 普通翻译：使用现有谷歌翻译接口
if (normalBtn) {
  normalBtn.addEventListener('click', () => {
    const text = input ? input.value.trim() : '';
    if (!text) return;

    setLoading('普通翻译中...');
    chrome.runtime.sendMessage(
      { action: 'translate', text },
      (response) => {
        if (!response) {
          setResult('翻译失败：无响应');
          return;
        }
        setResult(response.translation || '翻译结果为空');
      }
    );
  });
}

// AI 翻译 Beta：使用 DeepSeek
if (aiBtn) {
  aiBtn.addEventListener('click', () => {
    const text = input ? input.value.trim() : '';
    if (!text) return;

    setLoading('AI 翻译中（DeepSeek）...');
    chrome.runtime.sendMessage(
      { action: 'aiTranslate', text },
      (response) => {
        if (!response) {
          setResult('AI 翻译失败：无响应');
          return;
        }
        setResult(response.translation || 'AI 翻译结果为空');
      }
    );
  });
}

