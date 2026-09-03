import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini API 초기화
let ai: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  console.log("Gemini AI Client initialized successfully.");
} else {
  console.warn("GEMINI_API_KEY is missing. AI analysis will run in simulated mode if no client key is provided.");
}

// 5개 측정소의 지역별 특징을 반영한 가상 대기 데이터 생성 함수
function generateSimulatedData(stationName: string) {
  const now = new Date();
  const formatTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:00`;
  
  // 기본 범주 생성 (지역 성격 반영)
  let pm10Base = 35;
  let pm25Base = 18;
  let coBase = 0.4;
  let so2Base = 0.003;
  let description = "부산광역시 대기 관할지구";

  // 측정소 이름 혹은 구군 이름 매핑
  const name = stationName.trim();
  
  if (name === "부평동" || name === "중구") {
    pm10Base = 43;
    pm25Base = 24;
    coBase = 0.48;
    so2Base = 0.004;
    description = "남포동·자갈치 중심의 고밀도 도심 상업지구";
  } else if (name === "대신동" || name === "서구") {
    pm10Base = 36;
    pm25Base = 19;
    coBase = 0.38;
    so2Base = 0.003;
    description = "전통 배후 주택지 및 대형 대학병원 집중 의료 구역";
  } else if (name === "수정동" || name === "동구") {
    pm10Base = 46;
    pm25Base = 26;
    coBase = 0.52;
    so2Base = 0.005;
    description = "부산역 교통 관문 인근이자 선박 오염 유입 가능 지대";
  } else if (name === "태종대" || name === "영도구") {
    pm10Base = 27;
    pm25Base = 13;
    coBase = 0.28;
    so2Base = 0.002;
    description = "태종대 유원지 인근으로 바닷바람이 풍부한 해안 청정구역";
  } else if (name === "전포동" || name === "부산진구") {
    pm10Base = 54;
    pm25Base = 32;
    coBase = 0.65;
    so2Base = 0.005;
    description = "서면 상업 교차로 일대 교통량 및 차량 오염 물질 정체 구역";
  } else if (name === "온천동" || name === "동래구") {
    pm10Base = 38;
    pm25Base = 20;
    coBase = 0.42;
    so2Base = 0.003;
    description = "온천천 인접 주거지역이자 기류 흐름이 무난한 도심 주거 벨트";
  } else if (name === "대연동" || name === "남구") {
    pm10Base = 40;
    pm25Base = 21;
    coBase = 0.45;
    so2Base = 0.004;
    description = "신선대 부두 배후 배출원과 대학가 주거밀집 복합 지대";
  } else if (name === "덕천동" || name === "북구") {
    pm10Base = 45;
    pm25Base = 25;
    coBase = 0.50;
    so2Base = 0.004;
    description = "남해고속도로 관문 교차 구역으로 출퇴근 차량 오염 영향지";
  } else if (name === "좌동" || name === "해운대구" || name === "해운대") {
    pm10Base = 29;
    pm25Base = 15;
    coBase = 0.32;
    so2Base = 0.002;
    description = "해운대 바다 조망권 배후 신도시로 대기 정화 속도가 신속함";
  } else if (name === "장림동" || name === "사하구") {
    pm10Base = 65;
    pm25Base = 36;
    coBase = 0.58;
    so2Base = 0.008;
    description = "신평·장림 산업단지 집중 배출 영향으로 정밀 환경 관리 구역";
  } else if (name === "청룡동" || name === "금정구") {
    pm10Base = 24;
    pm25Base = 12;
    coBase = 0.25;
    so2Base = 0.002;
    description = "금정산 자락 인접 주거지로 수목 정화 및 바람길 수혜 구역";
  } else if (name === "녹산동" || name === "강서구") {
    pm10Base = 62;
    pm25Base = 34;
    coBase = 0.55;
    so2Base = 0.007;
    description = "녹산 국가산업단지 및 부산 신항 배후 미세먼지 특별 감시망";
  } else if (name === "연산동" || name === "연제구") {
    pm10Base = 42;
    pm25Base = 22;
    coBase = 0.48;
    so2Base = 0.004;
    description = "부산광역시청, 시의회 등 공공기관이 위치한 중심 행정지";
  } else if (name === "광안동" || name === "수영구") {
    pm10Base = 32;
    pm25Base = 16;
    coBase = 0.35;
    so2Base = 0.002;
    description = "광안리 수변 상가와 고밀 주거지가 융합된 복합 해안구역";
  } else if (name === "학장동" || name === "사상구") {
    pm10Base = 58;
    pm25Base = 33;
    coBase = 0.60;
    so2Base = 0.006;
    description = "낙동강 물류 배후 및 사상 전통 공업단지 도로 비산 대책 구역";
  } else if (name === "기장읍" || name === "기장군") {
    pm10Base = 23;
    pm25Base = 11;
    coBase = 0.22;
    so2Base = 0.002;
    description = "동부산 해안 산림 인근지로 풍속이 양호하고 대기 정화력 탁월";
  }

  // 실시간 무작위 미세 변동 추가 (시간에 따른 자연스러운 편차)
  const randomFactor = Math.sin(now.getHours() / 4) * 5 + (Math.random() * 8 - 4);
  const pm10 = Math.max(5, Math.round(pm10Base + randomFactor * 1.5));
  const pm25 = Math.max(2, Math.round(pm25Base + randomFactor * 0.8));
  const co = Math.max(0.1, parseFloat((coBase + (Math.random() * 0.15 - 0.07)).toFixed(2)));
  const so2 = Math.max(0.001, parseFloat((so2Base + (Math.random() * 0.002 - 0.001)).toFixed(3)));

  // 수치에 기반한 등급 분류 (1: 좋음, 2: 보통, 3: 나쁨, 4: 매우나쁨)
  const getPm10Grade = (val: number) => {
    if (val <= 30) return "1";
    if (val <= 80) return "2";
    if (val <= 150) return "3";
    return "4";
  };

  const getPm25Grade = (val: number) => {
    if (val <= 15) return "1";
    if (val <= 35) return "2";
    if (val <= 75) return "3";
    return "4";
  };

  const pm10Grade = getPm10Grade(pm10);
  const pm25Grade = getPm25Grade(pm25);

  // 통합대기환경지수 (CAI) 가상 산출
  const maxGrade = Math.max(parseInt(pm10Grade), parseInt(pm25Grade));
  let khaiValue = 50;
  if (maxGrade === 1) khaiValue = Math.round(20 + Math.random() * 25);
  else if (maxGrade === 2) khaiValue = Math.round(51 + Math.random() * 40);
  else if (maxGrade === 3) khaiValue = Math.round(101 + Math.random() * 45);
  else khaiValue = Math.round(151 + Math.random() * 90);

  return {
    stationName,
    pm10Value: String(pm10),
    pm10Grade,
    pm25Value: String(pm25),
    pm25Grade,
    khaiValue: String(khaiValue),
    coValue: String(co),
    so2Value: String(so2),
    dataTime: formatTime,
    description,
    isSimulated: true,
  };
}

// 1. 공공데이터 API 프록시 라우트
app.get("/api/environment-data", async (req, res) => {
  const { stationName, serviceKey } = req.query;

  if (!stationName) {
    return res.status(400).json({ error: "측정소 이름(stationName)이 필요합니다." });
  }

  // 사용자가 전달한 API Key가 있거나, 서버 환경변수에 정의되어 있는 경우 실제 외부 API 호출 시도
  const apiKey = (serviceKey as string) || process.env.PUBLIC_DATA_PORTAL_KEY;

  if (!apiKey || apiKey === "MY_PUBLIC_DATA_PORTAL_KEY") {
    // 키가 없는 경우 고화질의 정밀 시뮬레이션 데이터 반환
    console.log(`[Proxy] API Key missing. Returning simulation data for ${stationName}.`);
    return res.json({
      response: {
        body: {
          items: [generateSimulatedData(stationName as string)],
        },
      },
    });
  }

  try {
    const url = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";
    
    // 공공데이터포털 서비스키의 인코딩/디코딩 문제를 똑똑하게 처리합니다.
    let cleanKey = apiKey.trim();
    let finalServiceKey = cleanKey;
    if (!cleanKey.includes("%")) {
      finalServiceKey = encodeURIComponent(cleanKey);
    }

    const params = new URLSearchParams({
      returnType: "json",
      numOfRows: "1",
      pageNo: "1",

      stationName: stationName as string,
      dataTerm: "DAILY",
      ver: "1.3",
    });

    console.log(`[Proxy] Fetching air quality data from AirKorea for: ${stationName} (Key length: ${cleanKey.length})`);
    
    let apiRes = await fetch(`${url}?serviceKey=${finalServiceKey}&${params.toString()}`);
    let rawText = await apiRes.text();
    let data: any = null;
    let apiErrorReason = "";

    // 만약 첫 호출 시 XML 응답(인증 에러 등)이고 키에 %가 포함된 경우, decodeURIComponent 적용 후 2차 재시도
    if (rawText.trim().startsWith("<") && cleanKey.includes("%")) {
      console.warn(`[Proxy] 1st try returned XML with encoded key. Attempting 2nd try with decoded key...`);
      try {
        const decodedKey = decodeURIComponent(cleanKey);
        const retryKey = encodeURIComponent(decodedKey);
        const retryRes = await fetch(`${url}?serviceKey=${retryKey}&${params.toString()}`);
        const retryText = await retryRes.text();
        if (!retryText.trim().startsWith("<")) {
          rawText = retryText;
          console.log(`[Proxy] 2nd try with decoded key succeeded for ${stationName}!`);
        }
      } catch (retryErr) {
        console.warn("[Proxy] Retry attempt failed:", retryErr);
      }
    }

    // JSON 파싱 시도 또는 XML 에러 원인 판별
    if (rawText.trim().startsWith("<")) {
      console.warn(`[Proxy] AirKorea API returned XML response for ${stationName}:`, rawText.substring(0, 250));
      if (rawText.includes("SERVICE_KEY_IS_NOT_REGISTERED") || rawText.includes("SERVICE KEY IS NOT REGISTERED")) {
        apiErrorReason = "공공데이터포털 키 승인 대기 중 (신규 발급 후 약 1~2시간 동기화 소요)";
      } else if (rawText.includes("LIMITED_NUMBER_OF_CALLS_EXCEEDED")) {
        apiErrorReason = "일일 API 호출 허용 트래픽 초과";
      } else if (rawText.includes("INVALID_REQUEST_PARAMETER")) {
        apiErrorReason = "요청 파라미터 불일치";
      } else {
        apiErrorReason = "공공데이터포털 인증 키 거부 (401 Unauthorized)";
      }
    } else {
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.warn("[Proxy] JSON parse error:", e);
      }
    }
    
    // 정상 데이터 구조 확인
    if (data && data.response?.body?.items && data.response.body.items.length > 0) {
      return res.json(data);
    }

    console.warn(`[Proxy] Real API call returned no items. Reason: ${apiErrorReason || "No items in response"}. Falling back to simulation.`);
    return res.json({
      response: {
        body: {
          items: [generateSimulatedData(stationName as string)],
        },
      },
      apiErrorReason: apiErrorReason || "키 미승인 또는 공공데이터 서버 응답 대기",
    });
  } catch (error: any) {
    console.warn("[Proxy] Real API call exception. Falling back to simulation mode. Message:", error.message);
    return res.json({
      response: {
        body: {
          items: [generateSimulatedData(stationName as string)],
        },
      },
      apiErrorReason: error.message,
    });
  }
});

// 2. Gemini AI 행정 분석 보고서 라우트
app.post("/api/gemini/analyze", async (req, res) => {
  const { data, userApiKey } = req.body;

  if (!data) {
    return res.status(400).json({ error: "분석할 데이터가 누락되었습니다." });
  }

  // API 키 결정: 요청 본문에 포함된 사용자 키 -> 서버 환경변수 키 순서
  const activeKey = userApiKey || GEMINI_API_KEY;

  // 룰 기반 고품질 로컬 보고서 생성기 (Gemini 미작동 혹은 오류 발생 시 즉시 복구용)
  const generateFallbackReport = (stationName: string, airData: any) => {
    const pm10Val = parseInt(airData.pm10Value) || 40;
    const pm25Val = parseInt(airData.pm25Value) || 20;
    const coVal = airData.coValue || "0.4";
    const so2Val = airData.so2Value || "0.003";
    const zoneType = airData.description || "부산지역 관할 구역";

    let summary = "";
    let specifics: string[] = [];
    let recommendations: string[] = [];

    const isDustBad = pm10Val > 80 || pm25Val > 35;
    const isDustVeryBad = pm10Val > 150 || pm25Val > 75;

    if (isDustVeryBad) {
      summary = `현재 부산광역시 ${stationName} 지역의 대기 지표는 미세 오염 농도가 임계 수준을 초과하여 매우 심각한 '매우 나쁨' 상태입니다. 공장지대 및 주요 도로의 배출 정체 오염원이 지속 누적되고 있어 시 차원의 비상 저감 특별 조치 발령과 시민 대피 안내 전파가 시급합니다.`;
      specifics = [
        `초미세먼지(PM2.5) 농도가 ${pm25Val} ㎍/㎥ 및 미세먼지(PM10) 농도가 ${pm10Val} ㎍/㎥로 경보 발령 기준 수치를 상회함.`,
        `배후 산업지역 및 분지형 지형의 대기 흐름 차단 효과로 이산화황 및 대기 오염 가스 복합 정체.`,
        `아황산가스(SO2) 실측 농도가 ${so2Val} ppm으로 누적 관찰되어 기관지 보호용 특별 행정 지침 지시 필요.`
      ];
      recommendations = [
        "해당 구역 내 공공 유관 단체, 학교 및 요양 보건 시설 대상 야외 전면 통제 및 실내 정화 시설 가동 지시 긴급 전파.",
        "기후대응과 기동 단속반 긴급 현장 투입, 배출 사업장 임시 조업율 감축 권고 및 도로 분진 고압 살수차 연속 긴급 가동."
      ];
    } else if (isDustBad) {
      summary = `현재 부산광역시 ${stationName} 지역의 대기 오염 물질 농도가 일시적으로 상승하여 '나쁨' 수준에 도달한 상황입니다. 주거 밀집지 및 상업가 주변을 중심으로 미세 오염 입자가 정체되어 있어 공직자 및 시민들의 세심한 대외활동 관리가 권고됩니다.`;
      specifics = [
        `교통 체증 및 기류 정체로 인해 대기 중 미세 먼지 입자 농도가 일시적으로 환경 기준치를 초과하는 추이 보고.`,
        `일산화탄소(CO)의 농도가 ${coVal} ppm 수준으로, 출퇴근 시간 차량 연소 가스의 영향이 부분적으로 지표에 투영됨.`,
        `해수 바람 유입량이 평시 대비 감소하여 대기 안정층이 지상 근처에 형성되고 오염 물질 분산 지연.`
      ];
      recommendations = [
        "공공 야외 체육시설 및 시립 야외 행사의 단축 또는 취소 권고 공문을 관할 구청에 즉시 발송하고, 시정 알림판 안내 수위 상향.",
        "시민 행동요령 및 황사용 보건 마스크 착용 가이드라인을 보건망 문자 시스템을 통해 관내 대민 채널에 전방위 전파."
      ];
    } else {
      summary = `현재 부산광역시 ${stationName} 지역의 대기 질 지표는 전반적으로 안정적인 '좋음' 및 '보통' 수준을 양호하게 유지하고 있습니다. 대기 확산이 활발하여 주민들의 일상적 실외 활동과 공공 행정 서비스 집행에 저해 요인이 없는 청정 대기 환경이 조성되어 있습니다.`;
      specifics = [
        `원활한 해풍 순환 작용으로 인해 입자상 물질(PM10 ${pm10Val} ㎍/㎥, PM2.5 ${pm25Val} ㎍/㎥)이 지상에 정체되지 않고 빠르게 분산 정화됨.`,
        `기타 가스상 지표 물질인 아황산가스(${so2Val} ppm) 및 일산화탄소(${coVal} ppm) 모두 기준선 이하의 청정 안전 범위 유지.`,
        `${zoneType}의 고유한 지리적 특성상 대기 누적 오염 유발 요인이 감지되지 않아 야외 활동 수행에 극히 안정적임.`
      ];
      recommendations = [
        "시민들의 건강한 야외 생활을 지원하기 위해 공공 체육 및 관광 인프라를 전면 정상 가동하고 실외 활동 적극 장려.",
        "시 전역 측정소 정밀 교정 모니터링 체계를 평시대로 유지하고 청정 환경 보전을 위한 도로 상시 분진 청소 유지."
      ];
    }

    return `### 📊 1) 현황요약
${summary}

### ⚠️ 2) 주요특이사항
- ${specifics[0]}
- ${specifics[1]}
- ${specifics[2]}

### 💡 3) 권고조치
- ${recommendations[0]}
- ${recommendations[1]}`;
  };

  // API 키가 아예 없을 때 데모용 친근하고 즉각적인 룰 기반 응답 반환
  if (!activeKey || activeKey === "MY_GEMINI_API_KEY") {
    console.log("[Gemini] API Key missing. Generating simulated public administration report.");
    const station = data.stationName || "부산광역시";
    const reportText = generateFallbackReport(station, data);
    return setTimeout(() => {
      res.json({ text: reportText, isSimulated: true });
    }, 800);
  }

  try {
    // 활성화된 키로 임시 클라이언트 생성하거나 기존 클라이언트 사용
    const localAi = userApiKey 
      ? new GoogleGenAI({ apiKey: userApiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } })
      : ai;

    if (!localAi) {
      throw new Error("AI 클라이언트를 성공적으로 초기화하지 못했습니다.");
    }

    const station = data.stationName || "선택 지역";
    const pm10 = data.pm10Value || "미측정";
    const pm25 = data.pm25Value || "미측정";
    const pm10Label = data.pm10Grade === "1" ? "좋음" : data.pm10Grade === "2" ? "보통" : data.pm10Grade === "3" ? "나쁨" : data.pm10Grade === "4" ? "매우나쁨" : "점검 중";
    const pm25Label = data.pm25Grade === "1" ? "좋음" : data.pm25Grade === "2" ? "보통" : data.pm25Grade === "3" ? "나쁨" : data.pm25Grade === "4" ? "매우나쁨" : "점검 중";
    const cai = data.khaiValue || "정보없음";
    const co = data.coValue || "정보없음";
    const so2 = data.so2Value || "정보없음";
    const description = data.description || "부산광역시 관할 구역";

    // 지침 엄격 주입
    const systemPrompt = `당신은 공공행정 데이터 분석 전문가 AI입니다. 
공무원이 제공한 공공데이터를 분석하여 업무 인사이트를 생성합니다. 
비전문가도 이해할 수 있는 평이한 언어로 작성하세요.

출력 형식은 반드시 다음 세 가지 대주제를 마크다운 헤더(###)로 선언하고, 이모지 아이콘을 포함해야 합니다:

### 📊 1) 현황요약 (2문장으로 작성)
이 구역은 두 문장으로 정확히 구성되어야 합니다. 첫 번째 문장은 현재 부산광역시 측정 지점의 전반적인 대기질 상태 요약, 두 번째 문장은 중심 오염원 추정 및 현 상태가 행정에 미치는 전반적인 요약이어야 합니다.

### ⚠️ 2) 주요특이사항 (3가지 항목 리스트 작성)
반드시 - 또는 * 를 사용한 3개의 불릿 포인트로 작성하십시오. 미세먼지 수치, 가스 물질 농도(CO, SO2), 그리고 측정소 환경 특징(예: 공업지대, 상업지구 등)을 결합하여 공무원이 주시해야 할 3가지 현황 분석 포인트를 도출하십시오.

### 💡 3) 권고조치 (2가지 권고 리스트 작성)
반드시 - 또는 * 를 사용한 2개의 불릿 포인트로 작성하십시오. 행정 실무부서(환경과, 보건위생과, 체육진흥과 등)가 당장 실행할 수 있는 실현 가능하고 실천적인 행정 대안(경보 발령 여부, 비상 살수차 가동, 야외 체육행사 자제 공문, 시민 대응 매뉴얼 배포 등) 2가지를 명확히 처방하십시오.`;

    const userPrompt = `부산광역시 ${station} 측정소의 환경 실측 데이터는 다음과 같습니다.
- 측정 구역 특징: ${description}
- 미세먼지(PM10): ${pm10} ㎍/㎥ (${pm10Label})
- 초미세먼지(PM2.5): ${pm25} ㎍/㎥ (${pm25Label})
- 통합대기환경지수(CAI): ${cai}
- 일산화탄소(CO): ${co} ppm
- 아황산가스(SO2): ${so2} ppm

위 데이터를 기반으로 실시간 '공공행정 의사결정 분석 보고서'를 기안 양식 톤으로 작성해주세요.`;

    console.log(`[Gemini] Requesting analysis for ${station} using gemini-2.5-flash`);
    
    // 비동기 요청 타임아웃 및 빠른 복구를 위해 7초 타임아웃 설정
    const response = await localAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // 일관성 향상을 위해 더 정형화된 온도로 조정
      },
    });

    const text = response.text || "분석 결과를 받아오지 못했습니다.";
    return res.json({ text, isSimulated: false });
  } catch (err: any) {
    console.error("[Gemini] API Call failed, initiating graceful fallback report. Error:", err.message);
    
    // 일시적 503이나 할당량 제한 발생 시, 에러를 내지 않고 대시보드 맞춤형 룰 분석 보고서로 안전하게 대체 제공 (매우 훌륭한 사용자 경험 유지)
    const station = data.stationName || "부산광역시";
    const reportText = generateFallbackReport(station, data);
    
    return res.json({ 
      text: `${reportText}\n\n*(알림: 일시적인 인공지능 서버 과부하 또는 네트워크 트래픽 급증으로 인해 대기오염 정밀 알고리즘을 통한 관제소 긴급 가이드라인 보고서로 안전하게 즉각 복구되었습니다.)*`, 
      isSimulated: true 
    });
  }
});

// Vite 및 정적 파일 처리
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
