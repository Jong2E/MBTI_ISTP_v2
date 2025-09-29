/* ===== 챗봇 핵심 로직 ===== */

class ISTPChatbot {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.apiKeySet = false;
    this.lastUserMessage = '';
    
    // DOM 요소 참조
    this.chatMessages = null;
    this.messageInput = null;
    this.sendButton = null;
    this.charCount = null;
    
    // 새로운 GeminiAPI 시스템 사용
    
    this.init();
  }
  
  init() {
    Utils.log('챗봇 초기화 중...');
    this.bindEvents();
    this.checkApiKey();
    
    // 환영 메시지에 현재 시간 설정 및 개인화 적용
    setTimeout(() => {
      const welcomeTime = document.querySelector('.message-time');
      if (welcomeTime) {
        welcomeTime.textContent = Utils.formatTime();
      }
      
      // 개인화된 환영 메시지 적용
      this.updateWelcomeMessage();
      this.updateQuickQuestions();
    }, 100);
  }
  
  bindEvents() {
    // DOM 요소 가져오기
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendButton');
    this.charCount = document.getElementById('charCount');
    
    if (!this.messageInput || !this.sendButton) {
      Utils.error('필수 DOM 요소를 찾을 수 없습니다.');
      return;
    }
    
    // 입력 이벤트
    this.messageInput.addEventListener('input', this.handleInput.bind(this));
    this.messageInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    
    // 전송 버튼
    this.sendButton.addEventListener('click', this.sendMessage.bind(this));
    
    // 자동 리사이즈
    this.messageInput.addEventListener('input', this.autoResize.bind(this));
  }
  
  handleInput() {
    const text = this.messageInput.value;
    const length = text.length;
    
    // 글자 수 업데이트
    if (this.charCount) {
      this.charCount.textContent = length;
      
      // 글자 수에 따른 색상 변경
      if (length > CONFIG.UI.MAX_MESSAGE_LENGTH * 0.9) {
        this.charCount.style.color = 'var(--fe-primary)';
      } else if (length > CONFIG.UI.MAX_MESSAGE_LENGTH * 0.7) {
        this.charCount.style.color = 'var(--fe-secondary)';
      } else {
        this.charCount.style.color = 'var(--text-light)';
      }
    }
    
    // 전송 버튼 활성화/비활성화
    const canSend = text.trim().length > 0 && length <= CONFIG.UI.MAX_MESSAGE_LENGTH && !this.isTyping;
    this.sendButton.disabled = !canSend;
  }
  
  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.sendButton.disabled) {
        this.sendMessage();
      }
    }
  }
  
  autoResize() {
    const textarea = this.messageInput;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // 최대 120px
    textarea.style.height = newHeight + 'px';
  }
  
  async sendMessage() {
    const text = this.messageInput.value.trim();
    if (!text || this.isTyping) return;
    
    this.lastUserMessage = text;
    
    // 사용자 메시지 추가
    this.addMessage(text, 'user');
    
    // 입력창 초기화
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';
    this.handleInput();
    
    // 타이핑 인디케이터 표시
    this.showTypingIndicator();
    
    // 새로운 GeminiAPI 시스템 사용
    try {
      const result = await GeminiAPI.generateResponse(text);
      
      // 타이핑 인디케이터 제거 후 응답 추가
      this.hideTypingIndicator();
      await this.addTypingMessage(result.response, 'bot');
      
      // API 사용 통계 로그
      if (result.isMock) {
        Utils.log(`모의 응답 생성됨 (카테고리: ${result.category})`);
      } else {
        Utils.log(`실제 API 응답 생성됨 (요청 수: ${result.requestCount})`);
      }
      
    } catch (error) {
      Utils.error('메시지 전송 실패:', error);
      this.hideTypingIndicator();
      
      // 오류 유형별 메시지
      let errorMessage = CONFIG.MESSAGES.SYSTEM.ERROR_GENERIC;
      if (error.message.includes('API_KEY_MISSING')) {
        errorMessage = CONFIG.MESSAGES.SYSTEM.API_KEY_MISSING;
      } else if (error.message.includes('NETWORK')) {
        errorMessage = CONFIG.MESSAGES.SYSTEM.ERROR_NETWORK;
      } else if (error.message.includes('LIMIT')) {
        errorMessage = CONFIG.MESSAGES.SYSTEM.ERROR_API_LIMIT;
      }
      
      this.addMessage(errorMessage, 'bot', true);
    }
  }
  
  addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${isError ? 'error-message' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    // 마크다운 스타일 텍스트 처리
    messageText.innerHTML = this.formatMessage(text);
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = Utils.formatTime();
    
    content.appendChild(messageText);
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    // 메시지 추가 및 스크롤
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
    
    // 메시지 저장
    this.messages.push({
      text,
      sender,
      timestamp: new Date(),
      isError
    });
    
    Utils.log(`${sender} 메시지 추가:`, text);
  }
  
  async addTypingMessage(text, sender) {
    if (!text) return;
    
    // 빈 메시지 먼저 추가
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = Utils.formatTime();
    
    content.appendChild(messageText);
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
    
    // 타이핑 효과로 텍스트 추가
    await this.typeText(messageText, text);
    
    // 메시지 저장
    this.messages.push({
      text,
      sender,
      timestamp: new Date(),
      isError: false
    });
  }
  
  async typeText(element, text) {
    const formattedText = this.formatMessage(text);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formattedText;
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    element.innerHTML = '';
    
    for (let i = 0; i < textContent.length; i++) {
      element.textContent += textContent[i];
      this.scrollToBottom();
      await new Promise(resolve => setTimeout(resolve, CONFIG.UI.TYPING_DELAY));
    }
    
    // 완성된 HTML 적용
    element.innerHTML = formattedText;
    this.scrollToBottom();
  }
  
  formatMessage(text) {
    return text
      // 볼드 텍스트
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 이탤릭 텍스트
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 줄바꿈
      .replace(/\n/g, '<br>')
      // 리스트 (간단한 형태)
      .replace(/^- (.*$)/gm, '• $1');
  }
  
  showTypingIndicator() {
    this.isTyping = true;
    this.sendButton.disabled = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    this.isTyping = false;
    this.handleInput(); // 전송 버튼 상태 업데이트
    
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, CONFIG.UI.AUTO_SCROLL_DELAY);
  }
  
  clearChat() {
    if (this.isTyping) return;
    
    // 환영 메시지 제외하고 모든 메시지 삭제
    const messages = this.chatMessages.querySelectorAll('.message:not(:first-child)');
    messages.forEach(message => message.remove());
    
    // 메시지 배열 초기화 (첫 번째 환영 메시지 유지)
    this.messages = this.messages.slice(0, 1);
    
    Utils.log('채팅 초기화됨');
  }
  
  checkApiKey() {
    this.apiKeySet = GeminiAPI.validateApiKey();
    
    if (!this.apiKeySet && CONFIG.DEBUG.ENABLE_API_MOCK) {
      Utils.log('API 키가 없어 모의 모드로 동작합니다.');
    }
    
    // API 상태 확인
    GeminiAPI.checkAPIStatus().then(isOnline => {
      Utils.log(`API 상태: ${isOnline ? '온라인' : '오프라인'}`);
    });
  }
  
  // 환영 메시지 개인화 업데이트
  updateWelcomeMessage() {
    if (PersonalizationManager) {
      const personalizedMessage = PersonalizationManager.getPersonalizedWelcomeMessage();
      const welcomeMessage = document.querySelector('.bot-message .message-text');
      if (welcomeMessage) {
        welcomeMessage.innerHTML = this.formatMessage(personalizedMessage) + 
          '<div class="welcome-features">' +
          '<span class="feature-tag">🧠 인지기능 분석</span>' +
          '<span class="feature-tag">💼 직업 추천</span>' +
          '<span class="feature-tag">💕 연애 스타일</span>' +
          '<span class="feature-tag">🎯 성장 방향</span>' +
          '</div>';
      }
    }
  }
  
  // 빠른 질문 개인화 업데이트  
  updateQuickQuestions() {
    if (PersonalizationManager) {
      const personalizedQuestions = PersonalizationManager.getPersonalizedQuickQuestions();
      const quickButtons = document.querySelectorAll('.quick-btn');
      
      personalizedQuestions.forEach((question, index) => {
        if (quickButtons[index]) {
          const button = quickButtons[index];
          button.onclick = () => sendQuickMessage(question);
          // 버튼 텍스트는 유지하되 클릭 시 개인화된 질문 전송
        }
      });
    }
  }
  

}

// 전역 인스턴스 생성
window.chatbot = null;