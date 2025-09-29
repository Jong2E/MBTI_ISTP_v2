/* ===== ISTP 챗봇 설정 ===== */

// 앱 설정
const CONFIG = {
  // API 설정
  API: {
    // 제미나이 API 설정 (실제 사용 시 환경변수나 별도 설정 파일에서 관리)
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    GEMINI_API_KEY: '', // 실제 API 키는 사용자가 입력하거나 환경변수에서 가져와야 함
    
    // 요청 설정
    MAX_RETRIES: 3,
    TIMEOUT: 30000, // 30초
    
    // 응답 설정
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7
  },
  
  // UI 설정
  UI: {
    // 타이핑 효과
    TYPING_DELAY: 50, // 각 문자 간격 (ms)
    TYPING_MIN_DELAY: 1000, // 최소 타이핑 시간
    TYPING_MAX_DELAY: 3000, // 최대 타이핑 시간
    
    // 애니메이션
    ANIMATION_DURATION: 300,
    LOADING_DURATION: 2000,
    
    // 메시지 설정
    MAX_MESSAGE_LENGTH: 500,
    AUTO_SCROLL_DELAY: 100,
    
    // 자동 기능
    AUTO_HIDE_PANEL_DELAY: 10000, // 10초 후 패널 자동 숨김
    QUICK_ACTIONS_SHOW_DELAY: 3000 // 3초 후 빠른 액션 표시
  },
  
  // 봇 설정
  BOT: {
    NAME: 'ISTP 전문가',
    PERSONALITY: 'analytical', // analytical, friendly, professional
    
    // 응답 스타일
    RESPONSE_STYLE: {
      USE_EMOJIS: true,
      INCLUDE_EXAMPLES: true,
      PROVIDE_SOURCES: false,
      MAX_RESPONSE_LENGTH: 800
    },
    
    // ISTP 관련 데이터
    ISTP_CONTEXT: {
      TYPE_CODE: 'ISTP',
      NICKNAME: '논리적 실용주의자',
      ALTERNATIVE_NAMES: ['만능 수리공', '기계공', '장인'],
      
      // 인지 기능
      COGNITIVE_FUNCTIONS: {
        PRIMARY: { code: 'Ti', name: '내향적 사고', description: '논리적 분석과 원리 파악' },
        AUXILIARY: { code: 'Se', name: '외향적 감각', description: '현실적 정보와 즉각적 행동' },
        TERTIARY: { code: 'Ni', name: '내향적 직관', description: '통찰력과 미래 예측' },
        INFERIOR: { code: 'Fe', name: '외향적 감정', description: '타인 배려와 조화' }
      },
      
      // 주요 특징
      KEY_TRAITS: [
        '논리적이고 분석적',
        '실용적이고 현실적',
        '독립적이고 자율적',
        '문제 해결 능력 뛰어남',
        '손재주가 좋음',
        '융통성 있음',
        '조용하고 과묵함',
        '위기 상황에서 침착함'
      ],
      
      // 강점
      STRENGTHS: [
        '뛰어난 문제 해결 능력',
        '실용적 접근',
        '기계적 이해력',
        '위기 관리 능력',
        '독립성',
        '객관적 판단',
        '유연한 적응력'
      ],
      
      // 약점/성장 영역
      WEAKNESSES: [
        '감정 표현의 어려움',
        '장기 계획의 부족',
        '타인과의 소통 어려움',
        '루틴한 작업에 대한 지루함',
        '완벽주의 성향',
        '스트레스 상황에서의 감정 폭발'
      ]
    }
  },
  
  // 메시지 템플릿
  MESSAGES: {
    // 시스템 메시지
    SYSTEM: {
      WELCOME: `안녕하세요! 👋 저는 ISTP 유형 전문 챗봇입니다.
**논리적 실용주의자** ISTP에 대해 궁금한 것이 있으시면 언제든 물어보세요!`,
      
      API_KEY_MISSING: `⚠️ API 키가 설정되지 않았습니다. 
실제 제미나이 API를 사용하시려면 개발자에게 문의하세요.
현재는 모의 응답으로 동작합니다.`,
      
      ERROR_GENERIC: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      ERROR_NETWORK: '네트워크 연결을 확인한 후 다시 시도해주세요.',
      ERROR_API_LIMIT: 'API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      
      THINKING: '🤔 생각 중...',
      TYPING: '💭 답변을 준비하고 있어요...'
    },
    
    // 빠른 질문 템플릿
    QUICK_QUESTIONS: [
      {
        text: 'ISTP의 주요 특징이 뭔가요?',
        icon: 'fas fa-user',
        category: 'basic'
      },
      {
        text: 'ISTP에게 어울리는 직업은?',
        icon: 'fas fa-briefcase',
        category: 'career'
      },
      {
        text: 'ISTP의 연애 스타일은?',
        icon: 'fas fa-heart',
        category: 'relationship'
      },
      {
        text: 'ISTP가 성장하려면?',
        icon: 'fas fa-chart-line',
        category: 'growth'
      },
      {
        text: 'ISTP의 인지기능에 대해 설명해주세요',
        icon: 'fas fa-brain',
        category: 'cognitive'
      },
      {
        text: 'ISTP와 잘 맞는 MBTI 유형은?',
        icon: 'fas fa-users',
        category: 'compatibility'
      }
    ]
  },
  
  // 디버그 설정
  DEBUG: {
    ENABLE_CONSOLE_LOG: true,
    ENABLE_API_MOCK: true, // API가 없을 때 모의 응답 사용
    SHOW_FUNCTION_INFO: false,
    LOG_USER_INTERACTIONS: true
  }
};

// 환경별 설정 오버라이드
if (typeof window !== 'undefined') {
  // 브라우저 환경
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 개발 환경
    CONFIG.DEBUG.ENABLE_CONSOLE_LOG = true;
    CONFIG.DEBUG.ENABLE_API_MOCK = true;
    CONFIG.UI.TYPING_DELAY = 20; // 개발 시 빠른 타이핑
  } else {
    // 프로덕션 환경
    CONFIG.DEBUG.ENABLE_CONSOLE_LOG = false;
    CONFIG.DEBUG.ENABLE_API_MOCK = false;
  }
}

// 유틸리티 함수
const Utils = {
  // 로그 함수
  log: (...args) => {
    if (CONFIG.DEBUG.ENABLE_CONSOLE_LOG) {
      console.log('[ISTP Bot]', ...args);
    }
  },
  
  error: (...args) => {
    console.error('[ISTP Bot Error]', ...args);
  },
  
  // 시간 포맷팅
  formatTime: (date = new Date()) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // 텍스트 처리
  truncateText: (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
  
  // 랜덤 지연시간
  randomDelay: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  // 디바운스 함수
  debounce: (func, wait) => {
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
};

// 전역 변수로 내보내기
window.CONFIG = CONFIG;
window.Utils = Utils;