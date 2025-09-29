/* ===== 제미나이 API 연동 및 ISTP 전문 응답 시스템 ===== */

// 키워드 매핑
const KEYWORD_MAPPING = window.KEYWORD_MAPPING || {
  basic: ['istp', '특징', '성격', '어떤', '설명'],
  cognitive: ['인지기능', 'ti', 'se', 'ni', 'fe', '기능'],
  career: ['직업', '일', '업무', '진로', '취업', '커리어'],
  relationship: ['연애', '사랑', '연인', '관계', '데이트'],
  growth: ['성장', '발전', '개발', '발달', '향상'],
  compatibility: ['궁합', '어울리는', '맞는', 'mbti'],
  stress: ['스트레스', '힘들', '어려운', '관리', '해결']
};

class GeminiAPIService {
  constructor() {
    // CONFIG가 로드될 때까지 대기
    if (typeof CONFIG !== 'undefined') {
      this.initialize();
    } else {
      // CONFIG가 로드되지 않았다면 잠시 후 다시 시도
      setTimeout(() => this.initialize(), 100);
    }
  }
  
  initialize() {
    this.apiKey = CONFIG?.API?.GEMINI_API_KEY || '';
    this.baseUrl = CONFIG?.API?.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.isOnline = false;
    this.requestCount = 0;
    
    // ISTP 컨텍스트를 위한 시스템 프롬프트
    this.systemPrompt = this.buildSystemPrompt();
  }

  // ISTP 전문 시스템 프롬프트 구축
  buildSystemPrompt() {
    return `당신은 MBTI ISTP(논리적 실용주의자) 유형 전문가입니다.

**역할과 성격:**
- ISTP에 대한 깊이 있는 지식을 가진 전문 상담사
- 친근하고 이해하기 쉽게 설명하는 스타일
- 실용적이고 구체적인 조언 제공
- 이론보다는 실제 적용 가능한 정보 중심

**ISTP 핵심 정보:**
- 인지기능: Ti(주기능) → Se(보조) → Ni(3차) → Fe(열등기능)
- 별명: 논리적 실용주의자, 만능 수리공, 기계공, 장인
- 주요 특징: 논리적 분석, 실용적 문제해결, 뛰어난 손재주, 독립성

**응답 가이드라인:**
1. 한국어로 자연스럽게 응답
2. 이모지 적절히 사용 (과하지 않게)
3. 구체적인 예시와 실용적 조언 포함
4. ISTP의 Ti-Se 특성을 반영한 논리적이고 실용적인 설명
5. 400-800자 내외의 적절한 길이
6. 질문 의도를 파악하여 맞춤형 답변 제공

**금지사항:**
- 의학적 진단이나 치료 조언 제공 금지
- 타 MBTI 유형 비하 금지
- 과도하게 학술적이거나 어려운 용어 사용 금지
- 개인정보 수집 시도 금지

다음 사용자의 질문에 ISTP 전문가로서 친근하고 도움이 되는 답변을 해주세요:`;
  }

  // API 키 유효성 검사
  validateApiKey() {
    return this.apiKey && this.apiKey.length > 0 && !this.apiKey.includes('your-api-key');
  }

  // 제미나이 API 호출
  async callGeminiAPI(userMessage) {
    if (!this.validateApiKey()) {
      throw new Error('API_KEY_MISSING');
    }

    const requestData = {
      contents: [{
        parts: [{
          text: `${this.systemPrompt}\n\n사용자 질문: "${userMessage}"`
        }]
      }],
      generationConfig: {
        temperature: CONFIG?.API?.TEMPERATURE || 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: CONFIG?.API?.MAX_TOKENS || 1000,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API_ERROR: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('NO_RESPONSE_GENERATED');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      this.requestCount++;
      
      return {
        success: true,
        response: generatedText,
        requestCount: this.requestCount
      };

    } catch (error) {
      if (typeof Utils !== 'undefined') {
        Utils.error('Gemini API Error:', error);
      } else {
        console.error('Gemini API Error:', error);
      }
      throw error;
    }
  }

  // 메인 응답 생성 함수
  async generateResponse(userMessage) {
    try {
      // API가 사용 가능한 경우 실제 API 호출
      if (this.validateApiKey() && !(CONFIG?.DEBUG?.ENABLE_API_MOCK ?? true)) {
        if (typeof Utils !== 'undefined') Utils.log('Using real Gemini API');
        return await this.callGeminiAPI(userMessage);
      } else {
        // 모의 응답 시스템 사용
        if (typeof Utils !== 'undefined') Utils.log('Using mock response system');
        return await this.generateMockResponse(userMessage);
      }
    } catch (error) {
      if (typeof Utils !== 'undefined') {
        Utils.error('Response generation failed:', error);
      } else {
        console.error('Response generation failed:', error);
      }
      
      // 오류 발생 시 모의 응답으로 폴백
      if (error.message.includes('API_KEY_MISSING') || error.message.includes('API_ERROR')) {
        if (typeof Utils !== 'undefined') Utils.log('Falling back to mock response due to API issue');
        return await this.generateMockResponse(userMessage);
      }
      
      throw error;
    }
  }

  // 모의 응답 생성 시스템
  async generateMockResponse(userMessage) {
    // 지연시간 시뮬레이션
    const delay = typeof Utils !== 'undefined' ? Utils.randomDelay(1000, 3000) : Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    const category = this.categorizeQuestion(userMessage);
    let response = this.getMockResponseByCategory(category, userMessage);
    
    // 개인화 적용
    if (PersonalizationManager) {
      response = PersonalizationManager.personalizeResponse(response);
    }
    
    return {
      success: true,
      response: response,
      isMock: true,
      category: category,
      personalized: Boolean(PersonalizationManager?.userGender)
    };
  }

  // 질문 분류
  categorizeQuestion(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(KEYWORD_MAPPING)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return category;
        }
      }
    }
    
    return 'basic';
  }

  // 카테고리별 모의 응답 생성
  getMockResponseByCategory(category, userMessage) {
    // 개인화 정보 가져오기
    const userGender = PersonalizationManager?.userGender || null;
    
    const responses = {
      basic: () => {
        const traits = ISTP_KNOWLEDGE_BASE.characteristics.strengths.slice(0, 3);
        return `안녕하세요! 🔧 ISTP의 주요 특징에 대해 설명드릴게요.

**ISTP(논리적 실용주의자)의 핵심 특징:**

${traits.map(trait => `• **${trait.title}**: ${trait.description}`).join('\n')}

ISTP는 "만능 수리공"이라는 별명처럼 **실용적 문제 해결**에 탁월한 능력을 보입니다. 이론보다는 직접 해보면서 배우는 것을 선호하고, 논리적 분석을 통해 효율적인 해결책을 찾아내는 것이 특기죠! ⚙️

더 궁금한 부분이 있으시면 언제든 물어보세요! 😊`;
      },

      cognitive: () => {
        const functions = ISTP_KNOWLEDGE_BASE.cognitiveFunctions;
        return `🧠 **ISTP의 인지기능**에 대해 설명드릴게요!

**주기능 - Ti (내향적 사고)** 🎯
${functions.primary.description}
- ${functions.primary.characteristics[0]}
- ${functions.primary.characteristics[1]}

**보조기능 - Se (외향적 감각)** ⚡
${functions.auxiliary.description}
- ${functions.auxiliary.characteristics[0]}
- ${functions.auxiliary.characteristics[1]}

**3차기능 - Ni (내향적 직관)** 🔮
${functions.tertiary.description}

**열등기능 - Fe (외향적 감정)** 💭
${functions.inferior.description}

Ti와 Se의 조합이 ISTP만의 독특한 **"분석 후 즉시 실행"** 스타일을 만들어냅니다! 🚀`;
      },

      career: () => {
        const careers = ISTP_KNOWLEDGE_BASE.careerInfo.suitableFields.slice(0, 2);
        return `💼 **ISTP에게 어울리는 직업**을 추천해드릴게요!

${careers.map(field => 
          `**${field.category}** 🎯\n${field.jobs.slice(0, 3).map(job => `• ${job}`).join('\n')}`
        ).join('\n\n')}

**ISTP가 선호하는 업무 환경:**
• ${ISTP_KNOWLEDGE_BASE.careerInfo.workEnvironmentPreferences[0]}
• ${ISTP_KNOWLEDGE_BASE.careerInfo.workEnvironmentPreferences[1]}
• ${ISTP_KNOWLEDGE_BASE.careerInfo.workEnvironmentPreferences[2]}

ISTP는 **"손으로 만들고, 머리로 분석하는"** 일에서 최고의 능력을 발휘합니다! 🛠️

특정 분야에 대해 더 자세히 알고 싶으시면 말씀해주세요! 😊`;
      },

      relationship: () => {
        const loveStyle = ISTP_KNOWLEDGE_BASE.relationships.loveStyle;
        return `💕 **ISTP의 연애 스타일**에 대해 말씀드릴게요!

**ISTP의 사랑 표현법:**
${loveStyle.characteristics.slice(0, 3).map(char => `• ${char}`).join('\n')}

**연애에서의 특징:**
- 말보다는 **행동으로 사랑을 증명** 🛠️
- 연인의 문제를 실질적으로 해결해주려 함
- 독립적인 관계를 추구하며 서로의 공간 존중

**주의할 점:**
• ${loveStyle.challenges[0]}
• ${loveStyle.challenges[1]}

**개선 팁:**
• ${loveStyle.tips[0]}
• ${loveStyle.tips[1]}

ISTP는 **"조용하지만 든든한 파트너"** 스타일이에요! 💪`;
      },

      growth: () => {
        const growthAreas = ISTP_KNOWLEDGE_BASE.growth.developmentAreas.slice(0, 2);
        return `🌱 **ISTP의 성장 방향**을 제시해드릴게요!

${growthAreas.map(area => 
          `**${area.area}** 🎯\n${area.methods.slice(0, 2).map(method => `• ${method}`).join('\n')}`
        ).join('\n\n')}

**스트레스 관리법:**
${ISTP_KNOWLEDGE_BASE.growth.stressManagement.copingStrategies.slice(0, 2).map(strategy => `• ${strategy}`).join('\n')}

ISTP는 자신의 **논리적 분석 능력**을 바탕으로 꾸준한 자기계발이 가능한 유형입니다! 💪

단계별로 천천히 발전해나가는 것이 핵심이에요! 🚀`;
      },

      compatibility: () => {
        const compatibility = ISTP_KNOWLEDGE_BASE.relationships.compatibility;
        return `🤝 **ISTP와 잘 맞는 MBTI 유형**을 알려드릴게요!

**최고 궁합 💕**
${compatibility.best.slice(0, 2).map(match => 
          `• **${match.type}**: ${match.reason}`
        ).join('\n')}

**도전적인 관계 ⚠️**
${compatibility.challenging.slice(0, 1).map(match => 
          `• **${match.type}**: ${match.reason}`
        ).join('\n')}

**ISTP와의 관계에서 중요한 것:**
• 서로의 독립성 존중 🔄
• 논리적 소통과 감정적 이해의 균형 ⚖️
• 실질적 도움과 지원 💪

궁합은 참고사항일 뿐, **서로를 이해하려는 노력**이 가장 중요해요! 😊`;
      },

      stress: () => {
        const stressInfo = ISTP_KNOWLEDGE_BASE.growth.stressManagement;
        return `😰 **ISTP의 스트레스 관리**에 대해 알려드릴게요!

**스트레스 요인:**
${stressInfo.stressTriggers.slice(0, 3).map(trigger => `• ${trigger}`).join('\n')}

**효과적인 대처법:**
${stressInfo.copingStrategies.slice(0, 3).map(strategy => `• ${strategy}`).join('\n')}

**ISTP 스트레스 신호:**
• 평소보다 감정적으로 변함 😤
• 타인을 피하고 혼자 있으려 함 🏠
• 비판적이고 냉소적으로 변함 😑

**회복 방법:**
1. **혼자만의 시간** 충분히 갖기 ⏰
2. **물리적 활동**으로 에너지 방출 🏃‍♂️
3. **구체적 문제 해결**에 집중하기 🎯

ISTP에게는 **"혼자 재충전하는 시간"**이 꼭 필요해요! 🔋`;
      }
    };

    const responseGenerator = responses[category] || responses.basic;
    return responseGenerator();
  }

  // API 상태 확인
  async checkAPIStatus() {
    if (!this.validateApiKey()) {
      return false;
    }

    try {
      // 간단한 테스트 요청
      const testResponse = await this.callGeminiAPI('안녕하세요');
      this.isOnline = testResponse.success;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  // 사용 통계
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      isOnline: this.isOnline,
      hasValidKey: this.validateApiKey()
    };
  }
}

// DOM이 로드된 후 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
  // 전역 인스턴스 생성
  const geminiAPI = new GeminiAPIService();
  
  // 전역 변수로 내보내기
  window.GeminiAPI = geminiAPI;
  
  // 전역 함수로 간단한 인터페이스 제공
  window.getGeminiResponse = async function(question, gender = null) {
    try {
      // API가 초기화될 때까지 대기
      if (!geminiAPI.apiKey && !geminiAPI.baseUrl) {
        await new Promise(resolve => {
          const checkInit = () => {
            if (geminiAPI.apiKey !== undefined && geminiAPI.baseUrl !== undefined) {
              resolve();
            } else {
              setTimeout(checkInit, 50);
            }
          };
          checkInit();
        });
      }
      
      // 성별 정보를 PersonalizationManager에 설정
      if (gender && window.PersonalizationManager) {
        window.PersonalizationManager.userGender = gender;
      }
      
      const result = await geminiAPI.generateResponse(question);
      return result.response;
    } catch (error) {
      if (typeof Utils !== 'undefined') {
        Utils.error('getGeminiResponse error:', error);
      } else {
        console.error('getGeminiResponse error:', error);
      }
      
      // 폴백 응답 제공
      const genderText = gender === 'female' ? '여성' : '남성';
      return `안녕하세요! ${genderText} ISTP 상담사입니다. 🌟

귀하의 질문을 받았습니다: "${question}"

ISTP는 논리적이고 실용적인 성격으로, 다음과 같은 특징을 가지고 있습니다:

**주요 특성:**
• 뛰어난 문제 해결 능력
• 독립적이고 자유로운 성향  
• 현실적이고 실용적인 접근
• 손재주가 좋고 기술적 능력 우수

**${genderText} ISTP의 특별한 점:**
${gender === 'female' 
      ? '• 독립성과 섬세함의 완벽한 조화\n• 창의적이면서도 논리적인 사고\n• 강인하면서도 따뜻한 리더십' 
      : '• 차분한 판단력과 실행력\n• 기술적 전문성과 리더십\n• 실용적이면서도 혁신적인 사고'
}

더 구체적인 상담을 원하신다면 언제든 새로운 질문을 해주세요! 😊✨`;
    }
  };
});