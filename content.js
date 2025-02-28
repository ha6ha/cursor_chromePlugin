let translationButton = null;
let translationPopup = null;

// 安全地移除DOM元素
function safeRemoveElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

// 创建翻译按钮
function createTranslationButton() {
  // 安全地移除已存在的按钮
  safeRemoveElement(translationButton);
  
  translationButton = document.createElement('button');
  translationButton.className = 'translation-button';
  translationButton.textContent = '翻译';
  translationButton.style.position = 'fixed';
  translationButton.style.zIndex = '2147483647';
  document.body.appendChild(translationButton);
  
  return translationButton;
}

// 创建翻译结果弹窗
function createTranslationPopup() {
  // 安全地移除已存在的弹窗
  safeRemoveElement(translationPopup);
  
  translationPopup = document.createElement('div');
  translationPopup.className = 'translation-popup';
  translationPopup.style.position = 'fixed';
  translationPopup.style.zIndex = '2147483647';
  document.body.appendChild(translationPopup);
  
  return translationPopup;
}

// 获取选中的文本
function getSelectedText() {
  return window.getSelection().toString().trim();
}

// 清理所有翻译相关元素
function cleanupTranslationElements() {
  safeRemoveElement(translationButton);
  safeRemoveElement(translationPopup);
  translationButton = null;
  translationPopup = null;
}

// 显示翻译按钮
function showTranslationButton(x, y) {
  const button = createTranslationButton();
  // 确保按钮不会超出视窗
  const buttonWidth = 60; // 估计按钮宽度
  const buttonHeight = 30; // 估计按钮高度
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  let posX = Math.min(Math.max(0, x), windowWidth - buttonWidth);
  let posY = Math.min(Math.max(0, y), windowHeight - buttonHeight);
  
  button.style.left = `${posX}px`;
  button.style.top = `${posY}px`;
}

// 显示翻译结果
function showTranslationResult(text, x, y) {
  const popup = createTranslationPopup();
  popup.textContent = text;
  
  // 确保弹窗不会超出视窗
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const popupWidth = 300; // 最大宽度（在CSS中定义）
  const popupHeight = 100; // 估计高度
  
  let posX = Math.min(Math.max(0, x), windowWidth - popupWidth);
  let posY = Math.min(Math.max(0, y), windowHeight - popupHeight);
  
  popup.style.left = `${posX}px`;
  popup.style.top = `${posY}px`;
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
const handleTextSelection = debounce(async (e) => {
  const selectedText = getSelectedText();
  console.log('Selected text:', selectedText); // 调试日志
  
  if (selectedText && selectedText.length > 0) {
    console.log('Showing translation button'); // 调试日志
    showTranslationButton(e.pageX, e.pageY);
    
    if (translationButton) {
      translationButton.onclick = async (clickEvent) => {
        clickEvent.stopPropagation(); // 阻止事件冒泡
        console.log('Translation button clicked'); // 调试日志
        const translation = await translate(selectedText);
        showTranslationResult(translation, e.pageX, e.pageY + 30);
      };
    }
  } else {
    cleanupTranslationElements();
  }
}, 100);

// 监听选中文本事件
document.addEventListener('mouseup', handleTextSelection);

// 点击页面其他地方时隐藏翻译按钮和弹窗
document.addEventListener('click', (e) => {
  if (e.target !== translationButton && e.target !== translationPopup) {
    cleanupTranslationElements();
  }
});

// 页面滚动时更新翻译元素位置
window.addEventListener('scroll', debounce(() => {
  cleanupTranslationElements();
}, 100)); 