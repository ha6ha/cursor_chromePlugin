let translationButton = null;
let translationPopup = null;
let isTranslating = false;

// 获取选中文本的位置信息
function getSelectionPosition() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset,
    right: rect.right + window.pageXOffset,
    bottom: rect.bottom + window.pageYOffset,
    height: rect.height,
    width: rect.width
  };
}

// 安全地移除DOM元素
function safeRemoveElement(element) {
  try {
    if (element && document.body.contains(element)) {
      document.body.removeChild(element);
    }
  } catch (error) {
    console.error('Error removing element:', error);
  }
}

// 创建翻译按钮
function createTranslationButton() {
  try {
    // 安全地移除已存在的按钮
    if (translationButton) {
      safeRemoveElement(translationButton);
      translationButton = null;
    }
    
    translationButton = document.createElement('button');
    translationButton.className = 'translation-button';
    translationButton.textContent = '翻译';
    document.body.appendChild(translationButton);
    
    return translationButton;
  } catch (error) {
    console.error('Error creating translation button:', error);
    return null;
  }
}

// 创建翻译结果弹窗
function createTranslationPopup() {
  try {
    // 安全地移除已存在的弹窗
    if (translationPopup) {
      safeRemoveElement(translationPopup);
      translationPopup = null;
    }
    
    translationPopup = document.createElement('div');
    translationPopup.className = 'translation-popup';
    document.body.appendChild(translationPopup);
    
    return translationPopup;
  } catch (error) {
    console.error('Error creating translation popup:', error);
    return null;
  }
}

// 获取选中的文本
function getSelectedText() {
  try {
    return window.getSelection().toString().trim();
  } catch (error) {
    console.error('Error getting selected text:', error);
    return '';
  }
}

// 清理所有翻译相关元素
function cleanupTranslationElements() {
  try {
    safeRemoveElement(translationButton);
    safeRemoveElement(translationPopup);
    translationButton = null;
    translationPopup = null;
  } catch (error) {
    console.error('Error cleaning up elements:', error);
  }
}

// 显示翻译按钮
function showTranslationButton() {
  try {
    const button = createTranslationButton();
    if (!button) return;

    const pos = getSelectionPosition();
    if (!pos) return;

    // 将按钮放在选中文本的右侧
    button.style.left = `${pos.right + 5}px`;
    button.style.top = `${pos.top}px`;
    button.style.height = `${pos.height}px`;
  } catch (error) {
    console.error('Error showing translation button:', error);
  }
}

// 显示翻译结果
function showTranslationResult(text) {
  try {
    const popup = createTranslationPopup();
    if (!popup) return;

    popup.textContent = text;
    
    const pos = getSelectionPosition();
    if (!pos) return;

    // 将翻译结果放在选中文本的下方
    popup.style.left = `${pos.left}px`;
    popup.style.top = `${pos.bottom + 5}px`;
  } catch (error) {
    console.error('Error showing translation result:', error);
  }
}

// 发送翻译请求
async function translate(text) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text
    });
    return response.translation;
  } catch (error) {
    console.error('Translation error:', error);
    return '翻译出错，请检查API设置';
  }
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 处理选中文本
const handleTextSelection = debounce(async () => {
  if (isTranslating) return;

  try {
    const selectedText = getSelectedText();
    
    if (selectedText && selectedText.length > 0) {
      showTranslationButton();
      
      if (translationButton) {
        translationButton.onclick = async (clickEvent) => {
          try {
            clickEvent.stopPropagation();
            clickEvent.preventDefault();
            
            isTranslating = true;
            const translation = await translate(selectedText);
            showTranslationResult(translation);
          } catch (error) {
            console.error('Error in translation button click:', error);
          } finally {
            isTranslating = false;
          }
        };
      }
    } else {
      cleanupTranslationElements();
    }
  } catch (error) {
    console.error('Error in text selection handler:', error);
    isTranslating = false;
  }
}, 200);

// 监听选中文本事件
document.addEventListener('mouseup', (e) => {
  if (e.target === translationButton || e.target === translationPopup) {
    return;
  }
  handleTextSelection(e);
});

// 点击页面其他地方时隐藏翻译按钮和弹窗
document.addEventListener('click', (e) => {
  if (e.target !== translationButton && e.target !== translationPopup) {
    cleanupTranslationElements();
  }
});

// 页面滚动时更新翻译元素位置
window.addEventListener('scroll', debounce(() => {
  if (window.getSelection().toString().trim()) {
    showTranslationButton();
  } else {
    cleanupTranslationElements();
  }
}, 200)); 