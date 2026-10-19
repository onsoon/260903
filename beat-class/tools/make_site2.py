"""practice-site.html 을 바탕으로 50분 핵심판 실습 사이트 2(practice-site2.html)를 만든다.

구성(탭 6개)과 디자인은 그대로 두고 내용만 줄인다.
약속 그림 만들기와 나의 Agent 만들기를 중심으로, 50분 핵심판 슬라이드 흐름에 맞춘다.
실습 자료와 캐릭터는 practice-site.html 에 이미 들어 있는 것을 그대로 쓴다.
사용법 (beat-class 폴더에서, 자료를 바꿨다면 embed_files.py 를 먼저):
    python3 tools/make_site2.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / "practice-site.html").read_text(encoding="utf-8")
page = src

def R(old, new, count=1):
    global page
    n = page.count(old)
    assert n == count, f"{n}x: {old[:60]}"
    page = page.replace(old, new)

def block(start, end, new):
    """start 부터 end 바로 앞까지를 new 로 바꾼다."""
    global page
    i = page.index(start); j = page.index(end, i)
    page = page[:i] + new + page[j:]

# 머리말
R("<title>BeAT 실습실</title>", "<title>BeAT 실습실 2</title>")
R('<span class="pill">부산교육 AI 튜터 · 1차시 실습</span>', '<span class="pill">부산교육 AI 튜터 · 1차시 50분 핵심판</span>')
R("<h1>BeAT<span>실습실</span></h1>", "<h1>BeAT<span>실습실 2</span></h1>")
R("윤리 퀴즈로 시작해서, 접속하고, 질문을 만들고, 직접 물어본 다음, 답이 맞는지 확인하는 데까지. 선생님이 안내하는 순서대로 탭을 넘기세요.",
  "쓰기 전 약속 4가지를 정하고, 약속을 그림으로 만들고, 회원가입한 다음, 나만의 AI Agent를 만들어 봐요. 선생님이 안내하는 순서대로 탭을 넘기세요.")
R('안전 약속 <b id="chipPledge">0/5</b>', '약속 그림 <b id="chipPledge">0/4</b>')
R('메뉴 실습 <b id="chipMission">0/4</b>', '나의 Agent <b id="chipMission">아직</b>')
R('<span class="band-brand">BeAT 실습실 · 부산교육 AI 튜터 BeAT 활용 수업</span>', '<span class="band-brand">BeAT 실습실 2 · 부산교육 AI 튜터 BeAT 활용 수업 (50분 핵심판)</span>')
R("© 2026 BeAT 실습실 · 수업용 비영리 교육 자료", "© 2026 BeAT 실습실 2 · 수업용 비영리 교육 자료")
R("안전 사용 약속, 과목별 예시 질문, 후속 프로그램 안내: 같은 리플릿에서 인용했습니다.",
  "후속 프로그램 안내: 같은 리플릿에서 인용했습니다. 쓰기 전 약속 4가지와 질문 예시는 BeAT 활용 교육 교안을 따랐습니다.")
R("학습지, 오답노트, 지문, 설문 데이터 등", "학습지, 오답노트, 영어 지문 등")
R("설문 데이터와 자기소개 속 인물은 가상입니다. ", "")

# 1. 윤리 퀴즈: 사이트 1의 8문항을 그대로 쓴다
# 2. 약속 4가지 + 그림
block("const PLEDGE = [", "const STEPS = [", '''const PLEDGE = [
  ["확인: 답을 그대로 믿지 않아요.", "답 아래 출처를 열어 교과서·자료와 비교하기"],
  ["정직: AI를 썼으면 밝혀요.", "수업 규칙을 지키고, AI 결과를 그대로 제출하지 않기"],
  ["보호: 내 정보는 넣지 않아요.", "이름, 학교, 연락처, 사진 입력 X → “나는 고등학교 2학년 학생이야”"],
  ["존중: 남을 해치지 않아요.", "놀리거나 상처 주는 데 AI를 쓰지 않기"],
];
// 약속을 그림으로: 약속마다 장면과 짧은 문구
const ART = {
  scene: [
    "고등학생이 AI의 답변 말풍선 아래 ‘출처’ 카드를 열고, 펼친 교과서와 나란히 놓고 큰 돋보기로 비교하는 장면",
    "고등학생이 발표 화면 속 그림 아래에 ‘AI 생성 이미지’라고 적힌 꼬리표를 붙이고, AI 로봇 튜터가 박수 치는 장면",
    "고등학생이 노트북 앞에서 이름표·전화번호·사진 카드를 자물쇠 달린 보물상자에 넣고, AI 로봇 튜터가 엄지를 치켜세우는 장면",
    "친구를 놀리는 합성 사진 버튼 앞에서 고등학생이 고개를 젓고, 대신 친구들과 AI 로봇 튜터와 함께 응원 포스터를 만드는 장면",
  ],
  short: ["출처 열고 확인!", "AI 썼으면 밝혀요", "내 정보는 내가 지켜요", "서로 존중해요"],
  styles: ["밝은 웹툰 스타일", "귀여운 3D 캐릭터 스타일", "부드러운 수채화 일러스트", "깔끔한 플랫 일러스트 포스터"],
  moods: ["밝고 따뜻한", "활기차고 유쾌한", "차분하고 믿음직한"],
  layouts: ["가로 16:9 (발표 슬라이드용)", "세로 3:4 (학급 게시판 포스터)", "정사각형 1:1 (카드뉴스)"],
  after: ["손가락, 얼굴, 글자가 이상하게 그려진 곳은 없나요?", "그림만 보고도 약속의 뜻이 전해지나요?", "그림을 쓸 때 ‘AI 생성 이미지(BeAT)’라고 표시했나요?", "친구나 내 얼굴 사진을 올려서 만들지 않았나요?"],
};
''')
# 3. 회원가입 3단계
block("const STEPS = [", "const SPACES = [", '''const STEPS = [
  { t: "BeAT 첫 화면에서 ‘교육디지털원패스’ 로그인 고르기", s: `<span class="url">${BEAT_URL}</span> · 왼쪽 ‘Microsoft로 로그인’이 아니라 <b>오른쪽 교육디지털원패스</b>예요.` },
  { t: "사용자 유형 ‘학생’ → 학생 로그인 화면 아래 ‘회원가입’", s: "‘교직원’을 누르면 처음부터 다시. 아직 아이디가 없으니 로그인 말고 작은 글자 ‘회원가입’을 눌러요." },
  { t: "① 약관 동의: 4개 모두 체크 → 다음", s: "마지막 <b>‘개인정보 제3자 제공 동의’</b>를 빼면 BeAT를 쓸 수 없어요. (내 정보를 연동 서비스인 BeAT에 넘겨주는 데 대한 동의)" },
  { t: "② 학적 정보: 학교명 · 이름 · 생년월일 · 학년 · 반 · 번호", s: "나이스(NEIS) 기록과 <b>한 글자라도</b> 다르면 가입이 안 돼요. 이름 띄어쓰기, 반·번호를 다시 확인!" },
  { t: "③ 본인인증: 내 명의 휴대폰 또는 아이핀(I-PIN)", s: "부모님 명의 휴대폰은 안 돼요. 둘 다 없으면 손을 들어 알려 주세요 → 담임 선생님 대리 등록" },
  { t: "④ 계정 정보: 아이디 · 비밀번호 · 이메일 정하기", s: "수첩에 적어 두세요. 비밀번호는 친구에게도, AI 프롬프트에도 <b>절대</b> 알려 주지 않아요." },
  { t: "⑤ 가입 완료 → 학생 로그인 → BeAT 이용 동의 → 위쪽 메뉴 4개 찾기", s: "아이디/비밀번호 또는 간편인증으로 로그인해요. 개인GPT · 수업GPT · AI Agents · Custom AI가 보이면 성공! 먼저 끝냈으면 옆 친구를 도와주세요." },
];
''')
block("const SPACES = [", "// 메뉴별 실습", '''const SPACES = [
  ["개인GPT", "나 혼자 쓰는 학습 비서. 무엇이든 자유롭게 물어요."],
  ["수업GPT", "선생님 교재 안에서만 답하고, 출처를 보여 줘요."],
  ["AI Agents", "나만의 챗봇을 만들고 링크로 공유해요. 오늘의 중심 실습!"],
  ["Custom AI", "문서번역, 자기소개 멘토링 같은 전용 도구예요."],
];
const TROUBLE = [
  ["학적 정보가 맞지 않대요", "이름 띄어쓰기 · 생년월일 · 학년/반/번호를 다시 확인. 전학 왔다면 선생님께"],
  ["본인인증이 안 돼요", "휴대폰이 부모님 명의인지 확인 → 아이핀(I-PIN)으로, 그래도 안 되면 담임 선생님 대리 등록"],
  ["인증번호가 안 와요", "전화번호를 확인하고 다시 요청. 시간이 지나면 새 번호를 받아야 해요"],
  ["이미 가입된 사용자래요", "새로 만들지 말고 ‘아이디 찾기’ · ‘비밀번호 찾기’"],
  ["가입했는데 BeAT가 안 열려요", "첫 화면에서 ‘교육디지털원패스’ → ‘학생’으로 로그인했는지 확인"],
];
const GPT_VS = [
  ["어디서 답을?", "AI가 원래 알고 있는 넓은 지식", "선생님이 올린 교재 안에서만"],
  ["비유하면", "아는 게 많은 친구", "교과서를 펴 놓고 답하는 선생님"],
  ["출처", "대부분 없음 → 내가 확인해야 해요", "교재 어디서 찾았는지 보여 줘요"],
  ["이럴 때 좋아요", "개념 설명, 아이디어, 내 파일 요약", "시험 범위 공부, 학습지·수업 질문"],
  ["조심할 점", "그럴듯하게 틀릴 수 있어요", "교재에 없는 건 답을 못 할 수 있어요"],
];
const SUBJECTS = [
  ["수학", "공식은 아는데 못 쓰겠어", "등차수열의 합 공식이 왜 그렇게 되는지 1부터 100까지 더하는 예시로 설명해 줘. 비슷한 문제 1개를 내고, 내가 풀면 틀린 단계만 알려 줘."],
  ["영어", "긴 문장, 어디서 끊지?", "아래 문장을 주어·동사·수식어로 끊어 표시하고 직역과 자연스러운 해석을 나란히 보여 줘. 내가 먼저 해석해 볼게.\\n[문장]"],
  ["국어", "화자의 정서를 못 찾겠어", "[작품명]에서 화자의 정서가 드러나는 시어 3개를 찾고, 근거가 되는 시구와 함께 설명해 줘. 해석이 갈리면 ‘다른 해석 가능’이라고 표시해 줘."],
  ["과학", "그래프만 나오면 막혀", "속도-시간 그래프에서 기울기와 넓이가 뜻하는 것을 자전거 타기 예시로 설명해 줘. 연습 문제 2개를 힌트와 함께 단계별로 내 줘."],
  ["한국사·사회", "사건 순서가 헷갈려", "[단원]의 주요 사건 6개를 시간 순서 표로 정리하고, 원인 → 결과를 한 줄씩 써 줘. 연도 옆에 ‘교과서 확인’ 칸을 만들어 줘."],
  ["정보", "코드 오류를 모르겠어", "아래 파이썬 코드에서 오류가 나는 줄과 이유만 알려 줘. 고친 코드는 바로 주지 말고, 내가 고치면 확인해 줘.\\n[코드]"],
];
''')
# 5. 메뉴별 실습: AI Agents 중심, 다른 메뉴는 하나씩
block("const MISSIONS = [", "// Custom AI 도구 화면을 본뜬 입력 예시", '''const MISSIONS = [
  { menu: "수업GPT", items: [
    { pain: "시험 2주 전인데 학습지가 한가득, 어디부터 봐야 할지 모르겠다면", title: "학습지 핵심 개념 5가지 정리하기",
      path: ["수업GPT", "왼쪽 카테고리", "선생님 폴더", "대화 시작"],
      files: ["sci_docx", "sci_txt"],
      note: "선생님이 수업GPT에 학습지를 올려 두셨다면 받지 않아도 돼요.",
      prompt: "[단원명]의 핵심 개념 5가지를 고1 눈높이로 5줄 정리해 줘.\\n각 줄 끝에 학습지의 몇 번 항목에 나오는지 적어 줘.",
      check: ["답 아래 출처를 열어 학습지와 비교했나요?", "학습지에 없는 내용이 섞여 있지 않나요?"] },
  ] },
  { menu: "개인GPT", items: [
    { pain: "해설지를 봐도 ‘내가 왜 틀렸는지’는 모르겠다면", title: "틀린 문제, 힌트만 3단계로 받기",
      path: ["개인GPT", "새 대화", "오답 하나를 붙여 넣기"],
      files: ["math_docx", "math_txt"],
      prompt: "아래 문제를 바로 풀지 말고 힌트만 3단계로 줘.\\n내가 \\"다음\\"이라고 하면 다음 힌트를 줘.\\n\\n[문제]",
      check: ["힌트를 받고 내가 직접 풀었나요?", "정답과 맞춰 봤나요?"] },
  ] },
  { menu: "AI Agents", must: true, items: [
    { pain: "매번 같은 부탁을 길게 쓰기 귀찮다면, 나만의 공부 도우미를 만들어요", title: "나의 Agent 만들기: 내 공부 스타일대로",
      path: ["AI Agents", "Agent 새로 만들기", "칸 채우기", "미리보기로 시험", "저장"],
      files: [],
      builder: true,
      check: ["미리보기에서 시작 프롬프트를 눌러 시험해 봤나요?", "일부러 틀린 답을 했을 때 정한 규칙대로 답하나요?", "공유 대상은 ‘나만’으로 두고 저장했나요? (공유는 선생님 확인 뒤에)"] },
  ] },
  { menu: "Custom AI", items: [
    { pain: "영어 지문, 내 해석이 맞는지 확인할 방법이 없다면", title: "문서번역으로 영어 지문 번역하고 원문과 비교하기",
      path: ["Custom AI", "문서번역", "파일 올리기", "언어 고르기", "번역 결과 확인"],
      files: ["eng_docx", "eng"],
      form: "doc",
      check: ["번역을 보기 전에 첫 문단을 내가 먼저 해석했나요?", "내 해석과 AI 번역이 다른 문장을 하나 찾았나요?"] },
  ] },
];
''')
# Agent 예시: 두 개로 줄이고 프롬프트도 짧게
block("const AGENT_TPL = [", "// 리플릿 캐릭터", '''const AGENT_TPL = [
  { label: "시험 대비 퀴즈 코치", cls: "학습 (목록에서 가장 가까운 것)", name: "통합과학 퀴즈 코치",
    desc: "학습지 내용으로 한 문제씩 퀴즈를 내고 틀리면 힌트를 주는 시험 대비 도우미",
    prompt: "너는 고등학생의 시험 공부를 돕는 퀴즈 코치야.\\n1. 단원을 물어보고, 한 번에 한 문제씩 낸다.\\n2. 틀리면 정답 대신 힌트를 한 번 준다.\\n3. 5문제가 끝나면 다시 볼 개념 2개를 알려 준다.\\n[지킬 것] 확실하지 않으면 ‘확인 필요’라고 말하고, 개인정보는 묻지 않는다.",
    starts: ["탄소 순환 단원으로 5문제 내 주세요", "O/X 문제로만 빠르게!"],
    setting: "Agent 설정에서 참고 문서를 올릴 수 있으면 ‘탄소 순환 학습지’를 등록하세요. 문제가 학습지 범위 안에서만 나와요.",
    files: ["sci_docx"],
    test: "시작 프롬프트를 누르고 일부러 틀린 답을 해 보세요. 정답 대신 힌트를 주면 성공!" },
  { label: "영어 단어 짝꿍", cls: "학습 (목록에서 가장 가까운 것)", name: "영어 단어 짝꿍",
    desc: "시험 범위 영어 단어를 뜻 맞히기 게임으로 함께 외워 주는 도우미",
    prompt: "너는 고등학생과 영어 단어를 함께 외우는 공부 짝꿍이야.\\n1. 학생이 보낸 단어로 한 번에 하나씩 뜻 맞히기 문제를 낸다.\\n2. 틀린 단어는 마지막에 한 번 더 묻는다.\\n3. 끝나면 틀린 단어를 표로 정리한다.\\n[지킬 것] 예문은 쉬운 문장으로, 칭찬은 짧게 한다.",
    starts: ["단어 5개 보낼게요, 뜻 맞히기!", "틀린 단어만 다시 물어봐 주세요"],
    setting: "영어 지문 자료의 단어(circadian rhythm, melatonin 등)로 시험해 봐도 좋아요.",
    files: ["eng"],
    test: "단어 5개를 보내고 하나를 일부러 틀려 보세요. 마지막에 그 단어를 다시 물어보면 성공!" },
];
''')
# 4. 질문 만들기: 핵심판의 질문 3개를 상황으로
block("const PRESETS = [", "const TABS = [", '''const PRESETS = [
  { label: "핵심 개념을 5줄로 정리하고 싶을 때", b: { subject: "과학", role: "친절한 과외 선생님", ctx: "나는 고등학교 1학년이고, [단원명]을 공부하고 있어.", ask: "[단원명]의 핵심 개념 5가지를 5줄로 정리해 줘.", fmt: ["3줄 요약"], cond: ["고등학생 눈높이로", "확실하지 않으면 ‘확인 필요’ 표시"] } },
  { label: "개념이 와닿지 않을 때", b: { subject: "사회", role: "친절한 과외 선생님", ctx: "[개념]이 교과서 설명만으로는 잘 와닿지 않아.", ask: "[개념]을 학교생활 예시 2개로 설명해 줘.", fmt: ["쉬운 비유와 예시"], cond: ["고등학생 눈높이로"] } },
  { label: "문제가 막혔을 때", b: { subject: "수학", role: "친절한 과외 선생님", ctx: "이 문제에서 막혔어.\\n문제: [문제]", ask: "아래 문제를 바로 풀지 말고 힌트만 3단계로 줘.", fmt: ["단계별로"], cond: ["정답은 바로 말하지 말기"] } },
];
const BAD_GOOD = [
  ["수학 알려줘", "너는 친절한 수학 선생님이야. 나는 고1인데 이차함수 꼭짓점 구하는 법이 헷갈려. 예시 1개로 단계별로 설명해 줘."],
];
''')
block("const TABS = [", "const load = ", '''const TABS = [
  { id: "quiz", n: "1", label: "윤리 퀴즈", time: "5분", c: "var(--pink)", tx: "var(--on-strong)", art: "prompt" },
  { id: "pledge", n: "2", label: "약속 그림", time: "7분", c: "var(--pink)", tx: "var(--on-strong)", art: "pair" },
  { id: "login", n: "3", label: "회원가입", time: "20분", c: "var(--brand)", tx: "var(--on-strong)", art: "work" },
  { id: "build", n: "4", label: "질문 만들기", time: "3분", c: "var(--yellow-fill)", tx: "var(--on-fill)", art: "robot" },
  { id: "mission", n: "5", label: "Agent 만들기", time: "9분", c: "var(--green-fill)", tx: "var(--on-fill)", art: "study" },
  { id: "review", n: "6", label: "돌아보기", time: "5분", c: "var(--sky)", tx: "var(--on-fill)", art: "team" },
];
''')
# 저장 키를 따로 써서 실습 사이트 1과 기록이 섞이지 않게
R('"beat1:"', '"beat2:"', 3)
R('menu: load("menu", 0),', 'menu: load("menu", 2),')

# 완료 조건
R('''  if (id === "pledge") return state.pledge.length === PLEDGE.length;''',
  '''  if (id === "pledge") return state.pledge.length === PLEDGE.length && state.art.after.length === ART.after.length;''')
R('''  if (id === "mission") return missionDone(0) && MISSIONS.some((_, i) => i > 0 && missionDone(i));''',
  '''  if (id === "mission") return missionDone(AGENT_MENU);''')
R("function itemDone(i, j)", "const AGENT_MENU = MISSIONS.findIndex(m => m.menu === \"AI Agents\");\nfunction itemDone(i, j)")
R('''  $("#chipQuiz").textContent = `${Object.keys(state.quiz).length}/8 · 정답 ${score}`;
  $("#chipPledge").textContent = `${state.pledge.length}/5`;
  $("#chipMission").textContent = `${MISSIONS.filter((_, i) => missionDone(i)).length}/4`;''',
  '''  $("#chipQuiz").textContent = `${Object.keys(state.quiz).length}/${QUIZ.length} · 정답 ${score}`;
  $("#chipPledge").textContent = `${state.art.after.length}/${ART.after.length}`;
  $("#chipMission").textContent = missionDone(AGENT_MENU) ? "완료" : "아직";''')

# 탭 화면 문구
R('head("pledge", "BeAT 안전 사용 약속", "부산교육 AI 튜터 리플릿에 실린 다섯 가지 약속이에요. 읽고 하나씩 체크하세요.")',
  'head("pledge", "쓰기 전 약속 4가지, 그림으로 만들기", "네 가지 약속을 읽고 체크한 다음, 아래에서 약속을 그림으로 만드는 프롬프트를 완성해 보세요. 오늘의 첫 번째 중심 실습이에요.")')
R('<div class="pledge-done">약속 완료! 이제 BeAT에 접속해 볼까요?</div><div class="row"><button class="btn primary" data-go="login">접속하기로</button></div>',
  '<div class="pledge-done">약속 완료! 아래에서 약속을 그림으로 만들어 봐요.</div>')
R("${artBox()}`;\n  },", '''${artBox()}
      ${state.art.after.length === ART.after.length ? `<div class="row"><button class="btn primary" data-go="login">회원가입으로</button></div>` : ""}`;
  },''')
R('head("login", "BeAT 접속하고 첫 질문 보내기", "한 단계씩 따라 하고 끝나면 체크하세요.")',
  'head("login", "회원가입: 내 계정은 내가 만들어요", "한 단계씩 따라 하고 끝나면 체크하세요. 먼저 끝낸 친구는 옆 친구를 도와주세요.")')
R('<button class="btn" data-copy="BeAT로 공부할 때 무엇을 할 수 있어? 고등학생 예시로 3줄로 알려 줘.">첫 질문 복사</button>', "")
R("로그인이 안 되면 계정을 새로 만들지 말고 선생님께 알려 주세요. 다른 사람 계정으로 로그인하지 않아요.</div>",
  '''막히면 옆 친구와 화면을 비교해 보고, 그래도 안 되면 손을 들어 선생님을 불러요. 다른 사람 계정으로 로그인하지 않아요.</div>
      <div class="box">
        <h3>막혔을 때 이렇게 해결해요</h3>
        ${TROUBLE.map(([a, b]) => `<div class="compare"><div class="bad"><b>이런 말이 나와요</b><span>${a}</span></div><div class="good"><b>이렇게 해요</b><span>${b}</span></div></div>`).join("")}
      </div>''')
R("<h3>BeAT 위쪽 메뉴 4개, 언제 쓸까?</h3>", "<h3>BeAT 둘러보기: 메뉴 4개</h3>")
R("</table></div>\n      </div>`;\n  },\n\n  build()", '''</table></div>
        <small style="color:var(--muted)">TIP · 답 아래의 출처를 꼭 열어 보세요. 약속 ‘확인’이 바로 이거예요.</small>
      </div>
      <div class="box">
        <h3>개인GPT vs 수업GPT, 뭐가 달라?</h3>
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr><th style="padding:8px;border-bottom:1px solid var(--line)"></th><th style="text-align:left;padding:8px;border-bottom:1px solid var(--line);color:var(--pink)">개인GPT</th><th style="text-align:left;padding:8px;border-bottom:1px solid var(--line);color:var(--blue)">수업GPT</th></tr></thead>
          <tbody>${GPT_VS.map(([k, a, b]) => `<tr><td style="padding:8px;border-bottom:1px solid var(--line);white-space:nowrap;font-weight:700">${k}</td><td style="padding:8px;border-bottom:1px solid var(--line)">${a}</td><td style="padding:8px;border-bottom:1px solid var(--line)">${b}</td></tr>`).join("")}</tbody>
        </table></div>
        <small style="color:var(--muted)">시험 공부는 수업GPT, 생각 넓히기는 개인GPT!</small>
      </div>
      <div class="box">
        <h3>왜 ‘사실 자료’를 넣어야 할까?</h3>
        <p>AI는 정답을 ‘찾는’ 게 아니라, 그럴듯한 다음 말을 ‘만들어’요. 그래서 모르는 것도 자신 있게 지어낼 수 있어요.</p>
        <div class="compare"><div class="bad"><b>자료 없이: “우리 학교 2학기 과학 시험 범위 알려 줘”</b><span>“3단원부터 5단원까지입니다.” → 그럴듯하지만 지어낸 답</span></div><div class="good"><b>자료와 함께: “[공지문 첨부] 이 공지에서 과학 범위만 알려 줘”</b><span>“공지 2번 항목에 따르면 1~2단원입니다. (출처: 공지문)” → 근거가 있고 확인할 수 있어요</span></div></div>
        <small style="color:var(--muted)">오픈북 시험처럼, 펼쳐 놓은 자료가 있어야 정확해요. 수업GPT가 교재 안에서만 답하는 이유예요. (예시의 범위는 설명용 가상 예시)</small>
      </div>`;
  },
  build()''')
R("<h3>이럴 때 어떻게 물어볼까? 상황을 골라 시작해 보세요</h3>", "<h3>직접 해보기: 질문 3개 중 골라 시작해 보세요</h3>")
R("""      <div class="box">
        <h3>직접 해보기: 질문 3개 중 골라 시작해 보세요</h3>""", """      <div class="box">
        <h3>어려운 과목, 이렇게 물어봐요</h3>
        <p style="color:var(--muted);font-size:14px">상황을 말하고 · 예시를 부탁하고 · 정답 대신 힌트, 그리고 확인까지! [ ] 칸은 내 것으로 바꿔 쓰세요.</p>
        ${SUBJECTS.map(([sub, pain, pr]) => `<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:8px"><span style="min-width:0;flex:1"><span class="tag">${sub}</span> <b>“${pain}”</b><br>${esc(pr).replace(/\\n/g, " ").replace(/\\[([^\\]]+)\\]/g, "<mark>[$1]</mark>")}</span><button class="btn" data-copy="${esc(pr)}">복사</button></div>`).join("")}
      </div>
      <div class="box">
        <h3>직접 해보기: 질문 3개 중 골라 시작해 보세요</h3>""")
R('head("mission", "메뉴별 실습: 묻고, 확인하고, 내 것으로", "BeAT 위쪽 메뉴와 같은 순서예요. 수업GPT는 모두 하고, 나머지 메뉴는 하나 이상 골라 해 보세요. 메뉴마다 실습이 두세 개씩 있으니 나에게 더 필요한 쪽을 고르면 돼요. [ ] 칸은 내 상황에 맞게 바꿔 쓰고, 답을 받은 뒤 확인 체크를 모두 하면 완료예요.")',
  'head("mission", "나만의 AI Agent 만들기", "오늘의 두 번째 중심 실습이에요. AI Agents에서 예시 하나를 골라 나의 Agent를 만들고, 미리보기로 시험한 뒤 확인 체크를 모두 하면 완료예요. 시간이 남으면 다른 메뉴 실습도 하나씩 해 보세요.")')
R("${fileBox(Object.keys(FILES))}", '${fileBox([...new Set(MISSIONS.flatMap(m => m.items.flatMap(it => it.files)).concat(AGENT_TPL.flatMap(t => t.files)))])}')
R("<p style=\"color:var(--muted);font-size:14px\">모두 수업 연습용으로 만든 예시 자료예요. 설문 데이터와 자기소개 초안의 인물은 가상이에요.</p>",
  "<p style=\"color:var(--muted);font-size:14px\">모두 수업 연습용으로 만든 예시 자료예요.</p>")
block('''      <div class="box">
        <h3>더 해 보고 싶다면</h3>''', "  review() {", "`;\n  },\n")
R("""      </div>` + `
`;
  },
  review() {""", """      </div>`;
  },
  review() {""")
R("2. 안전 약속 다섯 가지 중 나에게 가장 필요한 것은? 이유는?", "2. 약속 4가지 중 나에게 가장 필요한 것은? 이유는?")
R('''        <div class="row"><button class="btn primary" id="copyReview">돌아보기 복사</button></div>
      </div>''', '''        <div class="row"><button class="btn primary" id="copyReview">돌아보기 복사</button></div>
      </div>
      <div class="box">
        <h3>만족도 조사 (끝나기 전에 꼭!)</h3>
        <p>오늘 수업은 어땠나요? 수업이 끝나기 전에 만족도 조사를 제출해 주세요.</p>
        <div class="row"><a class="btn primary" href="https://forms.gle/Rb7JTGhQbk8XXnGUA" target="_blank" rel="noopener" style="text-decoration:none">만족도 조사 열기</a></div>
        <small style="color:var(--muted)">BeAT는 도구입니다. 어떻게 쓰느냐는 결국 내가 만드는 실력입니다.</small>
      </div>''')

# 약속 그림: 문구를 약속 4가지로, 그림 확인 체크도 칩과 다음 버튼에 바로 반영
R("""    state.art.after = t.checked ? [...new Set([...state.art.after, k])] : state.art.after.filter(x => x !== k);
    return saveArt(false);""", """    state.art.after = t.checked ? [...new Set([...state.art.after, k])] : state.art.after.filter(x => x !== k);
    return saveArt(true);""")

# 이수증
R('''    { label: "윤리 퀴즈 8문항 풀기", ok: quizN === QUIZ.length, hint: `${quizN}/8문항 풀었어요`, tab: "quiz" },
    { label: "안전 사용 약속 5가지 체크", ok: state.pledge.length === PLEDGE.length, hint: `${state.pledge.length}/5개 체크했어요`, tab: "pledge" },
    { label: "BeAT 접속하고 첫 질문 보내기", ok: state.login.length === STEPS.length, hint: `${state.login.length}/5단계 체크했어요`, tab: "login" },''',
  '''    { label: "윤리 퀴즈 8문항 풀기", ok: quizN === QUIZ.length, hint: `${quizN}/${QUIZ.length}문항 풀었어요`, tab: "quiz" },
    { label: "약속 4가지 체크하고 약속 그림 만들기", ok: state.pledge.length === PLEDGE.length && state.art.after.length === ART.after.length,
      hint: state.pledge.length < PLEDGE.length ? `약속 ${state.pledge.length}/${PLEDGE.length}개 체크했어요` : `그림 확인 ${state.art.after.length}/${ART.after.length}개 체크했어요`, tab: "pledge" },
    { label: "BeAT 회원가입하고 메뉴 4개 찾기", ok: state.login.length === STEPS.length, hint: `${state.login.length}/${STEPS.length}단계 체크했어요`, tab: "login" },''')
R('''    { label: "메뉴별 실습: 수업GPT + 다른 메뉴 하나 이상", ok: missionDone(0) && otherDone,
      hint: !missionDone(0) ? "수업GPT 실습의 확인 체크를 모두 해야 해요" : "개인GPT · AI Agents · Custom AI 중 하나의 확인 체크를 모두 해야 해요", tab: "mission" },''',
  '''    { label: "나만의 AI Agent 만들기", ok: missionDone(AGENT_MENU), hint: "AI Agents 실습의 확인 체크를 모두 해야 해요", tab: "mission" },''')
R("  const otherDone = MISSIONS.some((_, i) => i > 0 && missionDone(i));\n", "")
R('''    let m = 0;
    if (missionDone(0)) { const i = MISSIONS.findIndex((_, n) => n > 0 && MISSIONS[n].items.some((_, j) => MISSIONS[n].items[j].check.some((_, c) => state.facts[`${n}-${j}:${c}`]))); m = i > 0 ? i : 1; }
    state.menu = m; save("menu", m);''', '''    state.menu = AGENT_MENU; save("menu", AGENT_MENU);''')
R('''    if (st.tab === "pledge") el = document.querySelector("[data-pledge]:not(:checked)");''',
  '''    if (st.tab === "pledge") el = document.querySelector("[data-pledge]:not(:checked)") || document.querySelector("[data-artafter]:not(:checked)");''')
R('''    st[0].ok && ["AI 윤리 상황 퀴즈", `8문항 중 ${score}문항 정답`],
    st[1].ok && ["BeAT 안전 사용 약속", "개인정보 지키기 · 답변 확인하기 · 출처 밝히기 · 그대로 제출하지 않기 · 이상한 답변 알리기"],
    st[2].ok && ["BeAT 접속과 첫 질문", "로그인하고 메뉴 4개(수업GPT · 개인GPT · AI Agents · Custom AI) 둘러보기"],
    st[3].ok && ["좋은 질문 만들기", "역할 + 상황 + 요청 + 형식으로 질문 완성하기"],
    done.length && ["메뉴별 실습", done.join("\\n")],''',
  '''    st[0].ok && ["AI 윤리 상황 퀴즈", `${QUIZ.length}문항 중 ${score}문항 정답`],
    st[1].ok && ["약속 4가지와 약속 그림", "확인 · 정직 · 보호 · 존중 약속을 이미지 생성 프롬프트로 그림 만들기"],
    st[2].ok && ["BeAT 회원가입", "교육디지털원패스로 가입하고 메뉴 4개(개인GPT · 수업GPT · AI Agents · Custom AI) 둘러보기"],
    st[3].ok && ["좋은 질문 만들기", "역할 + 상황 + 요청 + 형식으로 질문 완성하기"],
    done.length && ["BeAT 실습", done.join("\\n")],''')
R('''    ? "위 학생은 부산교육 AI 튜터 BeAT 활용 1차시 수업에서 AI 윤리와 안전 사용 약속을 익히고, BeAT 메뉴별 실습을 모두 마쳤기에 이 이수증을 드립니다."''',
  '''    ? "위 학생은 부산교육 AI 튜터 BeAT 활용 1차시 수업에서 쓰기 전 약속 4가지를 그림으로 표현하고, 나만의 AI Agent를 만들어 실습을 모두 마쳤기에 이 이수증을 드립니다."''')
R('x.fillText("BeAT 실습실", 120, y);', 'x.fillText("BeAT 실습실 2", 120, y);')
R("BeAT 안전 사용 약속", "BeAT 쓰기 전 약속", 2)

(ROOT / "practice-site2.html").write_text(page, encoding="utf-8")

# 단독 실행본: embed_files.py 와 같은 방식으로 문서 뼈대를 붙인다
head, body = page.split("</style>\n", 1)
(ROOT / "site2").mkdir(exist_ok=True)
(ROOT / "site2" / "index.html").write_text(
    '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + head.replace("<style>", "<style>\nbody { margin: 0; }", 1) + "</style>\n</head>\n<body>\n"
    + body + "</body>\n</html>\n", encoding="utf-8")
print("practice-site2.html, site2/index.html", len(page) // 1024, "KB")
