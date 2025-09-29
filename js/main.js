/* ===== 메인 앱 초기화 ===== */

class ISTPChatbotApp {
  constructor() {
    this.chatbot = null;
    this.isLoaded = false;
    this.init();
  }

  async init() {
    Utils.log('ISTP 챗봇 앱 초기화 시작...');

    // 로딩 화면 표시
    this.showLoading();

    try {
      // 필요한 컴포넌트들 초기화 대기
      await this.initializeComponents();
      
      // 로딩 완료
      await this.hideLoading();
      
      // 앱 표시
      this.showApp();
      
      Utils.log('ISTP 챗봇 앱 초기화 완료!');
      this.isLoaded = true;

    } catch (error) {
      Utils.error('앱 초기화 실패:', error);
      this.showError();
    }
  }

  async initializeComponents() {
    // 챗봇 인스턴스 생성
    this.chatbot = new ISTPChatbot();
    
    // 전역 변수로 설정
    window.chatbot = this.chatbot;
    
    // API 상태 확인
    if (window.GeminiAPI) {
      const apiStatus = await window.GeminiAPI.checkAPIStatus();
      Utils.log(`API 상태: ${apiStatus ? '연결됨' : '오프라인'}`);
    }
  }

  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'flex';
      
      // 로딩 바 애니메이션
      setTimeout(() => {
        const progress = loading.querySelector('.loading-progress');
        if (progress) {
          progress.style.width = '100%';
        }
      }, 500);
    }
  }

  async hideLoading() {
    return new Promise(resolve => {
      setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
          loading.style.opacity = '0';
          setTimeout(() => {
            loading.style.display = 'none';
            resolve();
          }, 500);
        } else {
          resolve();
        }
      }, CONFIG.UI.LOADING_DURATION);
    });
  }

  showApp() {
    const container = document.getElementById('mainApp');
    if (container) {
      container.classList.add('loaded');
    }

    // 환영 메시지 시간 업데이트
    setTimeout(() => {
      const welcomeTime = document.querySelector('.message-time');
      if (welcomeTime && welcomeTime.textContent === '') {
        welcomeTime.textContent = Utils.formatTime();
      }
    }, 1000);
  }

  showError() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `
        <div class="loading-content">
          <div class="loading-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2>오류가 발생했습니다</h2>
          <p>페이지를 새로고침해주세요</p>
          <button onclick="window.location.reload()" style="
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: var(--fe-primary);
            color: white;
            border: none;
            border-radius: var(--radius-small);
            cursor: pointer;
          ">새로고침</button>
        </div>
      `;
    }
  }

  // 앱 상태 확인
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      chatbotReady: Boolean(this.chatbot),
      apiReady: Boolean(window.GeminiAPI),
      timestamp: new Date().toISOString()
    };
  }
}

// DOM 로드 완료 후 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  Utils.log('DOM 로드 완료, 앱 시작...');
  
  // 메인 앱 인스턴스 생성
  const app = new ISTPChatbotApp();
  
  // 전역 변수로 설정
  window.ISTPApp = app;
  
  // 개발 모드에서 상태 확인 함수 제공
  if (CONFIG.DEBUG.ENABLE_CONSOLE_LOG) {
    window.checkAppStatus = () => {
      console.log('📊 ISTP 챗봇 앱 상태:', app.getStatus());
      return app.getStatus();
    };
    
    Utils.log('개발 모드: window.checkAppStatus() 함수 사용 가능');
  }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  Utils.log('앱 종료 중...');
});

// 오류 처리
window.addEventListener('error', (event) => {
  Utils.error('전역 오류 발생:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  Utils.error('처리되지 않은 Promise 오류:', event.reason);
});