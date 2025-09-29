/* ===== UI 상호작용 로직 ===== */

// UI 관련 전역 함수들
class UIManager {
  constructor() {
    this.functionsPanel = null;
    this.quickActions = null;
    this.init();
  }

  init() {
    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.bindEvents.bind(this));
    } else {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.functionsPanel = document.getElementById('functionsPanel');
    this.quickActions = document.getElementById('quickActions');

    // 패널 토글 이벤트는 이미 HTML에서 onclick으로 처리
    // 기타 UI 이벤트들 처리
    this.setupScrollEffects();
    this.setupQuickActionsDelay();
  }

  setupScrollEffects() {
    // 스크롤 시 헤더 효과 등
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 스크롤 방향에 따른 효과 (필요시 추가)
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
  }

  setupQuickActionsDelay() {
    // 페이지 로드 후 일정 시간 뒤 퀵액션 강조
    setTimeout(() => {
      if (this.quickActions) {
        this.quickActions.style.animation = 'pulse 0.5s ease-in-out';
      }
    }, CONFIG.UI.QUICK_ACTIONS_SHOW_DELAY);
  }
}

// 전역 함수들 (HTML에서 직접 호출)
function togglePanel() {
  const panel = document.getElementById('functionsPanel');
  if (panel) {
    panel.classList.toggle('collapsed');
  }
}

function toggleFunctions() {
  togglePanel();
}

function clearChat() {
  if (window.chatbot) {
    window.chatbot.clearChat();
  }
}

function sendQuickMessage(message) {
  const messageInput = document.getElementById('messageInput');
  if (messageInput && window.chatbot) {
    messageInput.value = message;
    window.chatbot.sendMessage();
  }
}

// UI 매니저 초기화
const uiManager = new UIManager();

// 전역 변수로 내보내기
window.UIManager = UIManager;
window.uiManager = uiManager;