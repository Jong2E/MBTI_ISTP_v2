/* ===== 개인화 및 성별 기반 응답 시스템 ===== */

class PersonalizationService {
  constructor() {
    this.userGender = null;
    this.setupCompleted = false;
    
    // Utils가 로드될 때까지 대기
    if (typeof Utils !== 'undefined') {
      this.loadUserSettings();
    } else {
      // Utils가 로드되지 않았다면 잠시 후 다시 시도
      setTimeout(() => this.loadUserSettings(), 100);
    }
  }

  // 사용자 설정 로드
  loadUserSettings() {
    try {
      this.userGender = localStorage.getItem('istp_chatbot_gender');
      this.setupCompleted = localStorage.getItem('istp_chatbot_setup_completed') === 'true';
      
      // Utils가 정의되어 있을 때만 로그 출력
      if (typeof Utils !== 'undefined') {
        Utils.log('사용자 설정 로드됨:', {
          gender: this.userGender,
          setupCompleted: this.setupCompleted
        });
      }
    } catch (error) {
      if (typeof Utils !== 'undefined') {
        Utils.error('사용자 설정 로드 실패:', error);
      } else {
        console.error('사용자 설정 로드 실패:', error);
      }
    }
  }

  // 사용자 설정 저장
  saveUserSettings(gender) {
    try {
      localStorage.setItem('istp_chatbot_gender', gender);
      localStorage.setItem('istp_chatbot_setup_completed', 'true');
      
      this.userGender = gender;
      this.setupCompleted = true;
      
      Utils.log('사용자 설정 저장됨:', { gender });
      return true;
    } catch (error) {
      Utils.error('사용자 설정 저장 실패:', error);
      return false;
    }
  }

  // 설정 초기화
  clearUserSettings() {
    try {
      localStorage.removeItem('istp_chatbot_gender');
      localStorage.removeItem('istp_chatbot_setup_completed');
      
      this.userGender = null;
      this.setupCompleted = false;
      
      Utils.log('사용자 설정 초기화됨');
    } catch (error) {
      Utils.error('사용자 설정 초기화 실패:', error);
    }
  }

  // 개인화된 응답 생성
  personalizeResponse(baseResponse) {
    if (!this.userGender || this.userGender === 'other') {
      return baseResponse;
    }

    // 성별별 맞춤 표현으로 변환
    return this.applyGenderSpecificLanguage(baseResponse);
  }

  // 성별 특화 언어 적용
  applyGenderSpecificLanguage(text) {
    if (!this.userGender || this.userGender === 'other') {
      return text;
    }

    let personalizedText = text;

    if (this.userGender === 'male') {
      // 남성 ISTP 특화 표현
      personalizedText = personalizedText
        .replace(/ISTP는/g, 'ISTP 남성은')
        .replace(/이들은/g, '남성 ISTP들은')
        .replace(/당신은/g, '형님은')
        .replace(/여러분/g, '형님');
        
      // 남성 ISTP 특성 강조
      if (text.includes('직업') || text.includes('커리어')) {
        personalizedText += '\n\n💪 **남성 ISTP 특징**: 기술적 전문성과 리더십을 발휘할 수 있는 분야에서 특히 뛰어난 성과를 보이는 경우가 많아요!';
      }
      
    } else if (this.userGender === 'female') {
      // 여성 ISTP 특화 표현
      personalizedText = personalizedText
        .replace(/ISTP는/g, 'ISTP 여성은')
        .replace(/이들은/g, '여성 ISTP들은')
        .replace(/당신은/g, '언니는')
        .replace(/여러분/g, '언니');
        
      // 여성 ISTP 특성 강조
      if (text.includes('연애') || text.includes('관계')) {
        personalizedText += '\n\n🌸 **여성 ISTP 특징**: 독립적이면서도 따뜻한 마음을 가진 경우가 많아, 균형 잡힌 관계를 만들어가는 능력이 뛰어나요!';
      }
    }

    return personalizedText;
  }

  // 성별별 환영 메시지 생성
  getPersonalizedWelcomeMessage() {
    const baseMessage = `안녕하세요! 👋 저는 ISTP 유형 전문 챗봇입니다.
**논리적 실용주의자** ISTP에 대해 궁금한 것이 있으시면 언제든 물어보세요!`;

    if (!this.userGender || this.userGender === 'other') {
      return baseMessage;
    }

    if (this.userGender === 'male') {
      return `안녕하세요! 👋 저는 ISTP 전문 챗봇입니다.
**논리적 실용주의자** 남성 ISTP의 특성과 강점에 대해 궁금한 것이 있으시면 언제든 물어보세요!

💪 남성 ISTP만의 독특한 면모와 성장 포인트를 함께 알아봐요!`;
    }

    if (this.userGender === 'female') {
      return `안녕하세요! 👋 저는 ISTP 전문 챗봇입니다.
**논리적 실용주의자** 여성 ISTP의 특성과 매력에 대해 궁금한 것이 있으시면 언제든 물어보세요!

🌸 여성 ISTP만의 섬세한 면모와 균형 감각을 함께 탐구해봐요!`;
    }

    return baseMessage;
  }

  // 성별별 빠른 질문 목록 생성
  getPersonalizedQuickQuestions() {
    const baseQuestions = [
      'ISTP의 주요 특징이 뭔가요?',
      'ISTP에게 어울리는 직업은?',
      'ISTP의 연애 스타일은?',
      'ISTP가 성장하려면?'
    ];

    if (!this.userGender || this.userGender === 'other') {
      return baseQuestions;
    }

    if (this.userGender === 'male') {
      return [
        '남성 ISTP의 주요 특징은?',
        '남성 ISTP에게 적합한 직업은?',
        'ISTP 남성의 연애 스타일은?',
        '남성 ISTP가 리더십을 발휘하려면?'
      ];
    }

    if (this.userGender === 'female') {
      return [
        '여성 ISTP의 독특한 특징은?',
        '여성 ISTP에게 어울리는 직업은?',
        'ISTP 여성의 연애와 관계 스타일은?',
        '여성 ISTP의 균형감각을 키우려면?'
      ];
    }

    return baseQuestions;
  }

  // 사용자 상태 확인
  getUserStatus() {
    return {
      gender: this.userGender,
      setupCompleted: this.setupCompleted,
      hasPersonalization: Boolean(this.userGender && this.userGender !== 'other')
    };
  }

  // 설정이 필요한지 확인
  needsSetup() {
    return !this.setupCompleted;
  }
}

// ISTP 성별별 특화 데이터
const GENDER_SPECIFIC_DATA = {
  male: {
    traits: [
      '기술적 문제해결에 특화된 능력',
      '압박감 속에서도 냉정한 판단력 유지',
      '실용적인 리더십 스타일 발휘',
      '독립적이면서도 팀워크 가능',
      '논리적 분석을 통한 효율적 의사결정'
    ],
    careers: [
      '엔지니어링 분야 (기계, 전기, 소프트웨어)',
      '기술 관리직 및 프로젝트 매니저',
      '응급의학과, 외과의사',
      '군인, 경찰관, 소방관',
      '창업가, 기술 컨설턴트'
    ],
    relationships: [
      '안정적이고 신뢰할 수 있는 파트너',
      '말보다는 행동으로 사랑 표현',
      '파트너의 독립성을 존중',
      '실질적인 도움과 지원 제공',
      '감정 표현 연습이 필요한 영역'
    ],
    growth: [
      '감정 지능 개발을 통한 소통 능력 향상',
      '장기적 비전 설정과 계획 수립',
      '타인의 감정에 대한 이해도 증진',
      '리더십 역량 강화',
      '네트워킹과 인맥 관리 기술'
    ]
  },
  
  female: {
    traits: [
      '세심한 관찰력과 분석 능력',
      '독립적이면서도 배려심 있는 성격',
      '창의적 문제해결 접근법',
      '균형 잡힌 논리와 감정의 조화',
      '차분하면서도 결단력 있는 판단'
    ],
    careers: [
      '의료 분야 (의사, 수의사, 연구원)',
      '디자인 및 아키텍처',
      'IT 및 데이터 분석 전문가',
      '교육 및 컨설팅 분야',
      '창작 및 예술 관련 직업'
    ],
    relationships: [
      '진정성 있고 깊이 있는 관계 추구',
      '상대방의 성장을 지원하는 파트너',
      '독립성과 친밀감의 균형 유지',
      '솔직하고 직접적인 소통 선호',
      '장기적이고 안정적인 관계 지향'
    ],
    growth: [
      '자신의 감정 표현 능력 개발',
      '사회적 네트워킹 기술 향상',
      '창의성과 논리성의 균형 발전',
      '리더십과 협력 능력의 조화',
      '자기계발과 커리어 발전 계획'
    ]
  }
};

// DOM이 로드된 후 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  // 전역 인스턴스 생성
  const PersonalizationManager = new PersonalizationService();
  
  // 전역 변수로 내보내기
  window.PersonalizationManager = PersonalizationManager;
  window.GENDER_SPECIFIC_DATA = GENDER_SPECIFIC_DATA;
});