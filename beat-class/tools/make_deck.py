"""리플릿 색감·캐릭터로 BeAT 1차시 슬라이드 20장을 다시 만든다. 발표자 노트는 기존 파일에서 그대로 가져온다."""
import re, sys
from pathlib import Path

D = Path(sys.argv[1])  # deck/project/slides

# 리플릿에서 뽑은 색
SKY, BLUE, PINK, SOFTPINK, YEL, GREEN = "#5dcbf1", "#4490d1", "#d33d68", "#f6899a", "#f7d17a", "#7dc12e"
INK, MUTED, BG, WHITE = "#1f2b4d", "#5b6785", "#fcfdff", "#ffffff"
T_SKY, T_PINK, T_YEL, T_GREEN, T_BLUE = "#e6f6fd", "#fde8ee", "#fff4d6", "#edf7e0", "#e4effa"
D_BLUE, D_GREEN, D_GOLD = "#2b6cb0", "#4a8410", "#946200"
JUA = "'Jua', 'Noto Sans KR', sans-serif"
GAEGU = "'Gaegu', 'Noto Sans KR', cursive"

IMG = {
    "girl": ("/_blob/e65e5adaa8b422bfa9fe01fd92e4afa8", 0.89, "태블릿을 들고 손가락으로 가리키는 고등학생"),
    "robot": ("/_blob/e95f9d3f24451abdb850ec387fa958b2", 1.839, "노트북을 든 분홍색 BeAT 로봇"),
    "prompt": ("/_blob/7357a682c2916160af7611895bf55fbc", 1.341, "프롬프트 예시 카드를 든 분홍 로봇"),
    "team": ("/_blob/21621ffc9a28476d74e588d0adf198ca", 2.847, "선생님과 학생이 로봇 튜터와 함께 노트북으로 공부하는 장면"),
    "study": ("/_blob/d2c865e9745c2a7625db1d38111f914d", 2.395, "노트북과 휴대폰 속 로봇에게 질문하는 학생들"),
    "pair": ("/_blob/33d6782cab3567b05b1d2dbb24edb7b6", 1.986, "로봇 튜터와 이야기하는 두 학생"),
    "work": ("/_blob/f0a2554ac5fd73d27cac1fb4688fd0fa", 1.577, "모니터 속 로봇과 자료를 든 학생"),
    "class": ("/_blob/1a1e72ef71ca62e368aee3dbdeaf7d71", 2.456, "수업 중 로봇 튜터에게 질문하는 학생"),
    "strip": ("/_blob/e3c10dafd628875b9072e7c3dd1aafa4", 4.01, "로봇 튜터와 공부하는 학생들"),
}

def img(key, h, extra=""):
    src, r, alt = IMG[key]
    return f'<img src="{src}" alt="{alt}" style="width:{round(h * r)}px;height:{h}px;object-fit:contain{extra}">'

def notes(sid):
    s = (D / f"{sid}.html").read_text(encoding="utf-8")
    m = re.search(r"<aside>(.*?)</aside>", s, re.S)
    return m.group(1) if m else ""

def section(sid, body, bg=BG, color=INK, pad="120px 128px 168px", gap=36, extra=""):
    return (f'<section id="{sid}" data-transition="fade" style="background:{bg};color:{color};'
            f"font-family:'Noto Sans KR', Arial, sans-serif;padding:{pad};display:flex;flex-direction:column;gap:{gap}px{extra}\">\n"
            f"{body}\n<aside>{notes(sid)}</aside>\n</section>\n")

def pill(text, bg, fg=WHITE, size=24):
    return f'<p style="font-size:{size}px;font-weight:700;color:{fg};background:{bg};padding:8px 26px;border-radius:999px;align-self:flex-start">{text}</p>'

def header(label, lbg, title, lfg=WHITE, art=None, art_h=150):
    left = f'<div style="flex:1;display:flex;flex-direction:column;gap:16px">\n{pill(label, lbg, lfg)}\n<h2 style="font-family:{JUA};font-size:60px;font-weight:400;line-height:1.15;color:{INK}">{title}</h2>\n</div>'
    right = img(art, art_h) if art else ""
    return f'<div style="display:flex;flex-direction:row;align-items:flex-end;gap:32px">\n{left}\n{right}\n</div>'

def footer(n, tail="", dark=False):
    c = "#3d4a6b" if dark else MUTED
    t = f"BeAT 1차시 · {n:02d}" + (f" · {tail}" if tail else "")
    return (f'<div style="position:absolute;left:0;right:0;bottom:0;height:16px;background:linear-gradient(90deg, {SKY}, {BLUE})"></div>\n'
            f'<p style="position:absolute;left:128px;width:1200px;bottom:52px;font-size:24px;color:{c}">{t}</p>\n'
            f'<p style="position:absolute;right:128px;width:420px;bottom:52px;font-size:24px;font-weight:700;color:{BLUE};text-align:right">부산교육 AI 튜터 BeAT</p>')

def card(inner, top=None, bg=WHITE, pad=32, gap=14, flex="flex:1;"):
    bt = f"border-top:10px solid {top};" if top else ""
    return f'<div style="{flex}background:{bg};border:2px solid #e3eaf3;{bt}border-radius:28px;padding:{pad}px;display:flex;flex-direction:column;gap:{gap}px">{inner}</div>'

S = {}

# 1 표지
S["cover"] = section("cover", f'''<div style="position:absolute;left:1088px;top:96px;width:712px;height:888px;background:{SKY};border-radius:56px"></div>
<img src="{IMG['girl'][0]}" alt="{IMG['girl'][2]}" style="position:absolute;left:1124px;top:150px;width:640px;height:719px;object-fit:contain;border-radius:32px">
<p style="position:absolute;left:1150px;top:880px;width:600px;font-family:{GAEGU};font-size:40px;font-weight:700;color:{INK};text-align:center">BeAT와 함께 더 즐거운 배움!</p>
{pill("부산교육 AI 튜터 · 고등학생 1차시 (45분)", PINK)}
<h1 style="font-family:{JUA};font-size:150px;font-weight:400;line-height:1.0;color:{BLUE}">BeAT<span style="color:{PINK}">(비트)</span></h1>
<h2 style="font-family:{JUA};font-size:76px;font-weight:400;line-height:1.15;color:{INK}">와 처음 만나는 날</h2>
<p style="font-size:34px;line-height:1.5;color:{MUTED};width:880px">AI 윤리부터 접속, 메뉴별 활용까지<br>한 시간에 끝내는 BeAT 첫 수업</p>
<div style="display:flex;flex-direction:row;gap:16px">{pill("지키기", T_PINK, PINK, 28)}{pill("확인하기", T_SKY, D_BLUE, 28)}{pill("밝히기", T_YEL, D_GOLD, 28)}</div>
<div style="position:absolute;left:0;right:0;bottom:0;height:16px;background:linear-gradient(90deg, {SKY}, {BLUE})"></div>
<p style="position:absolute;left:128px;width:900px;bottom:52px;font-size:24px;color:{MUTED}">beat.busanedu.net · 부산광역시교육청 × 부산대학교 AI융합교육원</p>''',
    pad="120px 128px 168px", gap=28, extra=";justify-content:center")

# 2 흐름
rows = [("0~5분", "도입", "이런 고민, 나도 있나요?", None),
        ("5~15분", "AI 윤리", "상황 O/X 퀴즈 · AI도 틀린다 · 안전 약속 5가지", T_PINK),
        ("15~22분", "BeAT 접속", "로그인 · 메뉴 4개 둘러보기 · 첫 질문", None),
        ("22~27분", "질문 잘하기", "역할 + 상황 + 요청 + 형식", None),
        ("27~40분", "메뉴별 실습", "수업GPT는 모두, 나머지는 골라서", T_GREEN),
        ("40~45분", "돌아보기", "확인한 것 나누기 · 다음 프로그램 안내", None)]
tr = "\n".join(f'<tr{f" style=\"background:{bg}\"" if bg else ""}><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a, b, c, bg in rows)
S["flow"] = section("flow", f'''{header("오늘의 흐름", SKY, "45분 동안 이렇게 진행해요", INK, "robot", 130)}
<table style="font-size:30px;color:{INK}">
<tr style="background:{T_SKY}"><th style="width:16%">시간</th><th style="width:22%">활동</th><th style="width:62%">내용</th></tr>
{tr}
</table>
{footer(2)}''')

# 3 고민
worries = [("교과 내용이 이해가 안 돼요", "궁금한 걸 바로 물으며 스스로 이해", PINK),
           ("예습·복습 시간 관리가 어려워요", "나에게 맞는 방식으로 예습·복습", SKY),
           ("긴 자료 요약이 오래 걸려요", "핵심만 짧게 정리하고 빠르게 찾기", YEL),
           ("진로·학과 정보를 찾기 어려워요", "관심사에서 출발해 직접 탐색", GREEN),
           ("자기소개서·면접 준비가 막막해요", "내 생각을 정리하고 피드백 받기", SOFTPINK),
           ("AI로 뭔가 만들어 보고 싶어요", "나만의 AI 도우미를 직접 만들기", BLUE)]
cards = "\n".join(card(f'<h3 style="font-size:30px;font-weight:700;line-height:1.35;color:{INK}">{a}</h3><p style="font-size:26px;line-height:1.4;color:{D_BLUE}">→ {b}</p>', top=c, pad=28, gap=10, flex="") for a, b, c in worries)
S["hook"] = section("hook", f'''{header("도입", SKY, "이런 고민, 나도 있다면 손!", INK, "study", 150)}
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
{cards}
</div>
{footer(3, "출처: BeAT 활용 학생 교육 프로그램 리플릿")}''', gap=28)

# 4 윤리 선언
S["ethics"] = section("ethics", f'''<div style="position:absolute;left:1240px;top:250px;width:520px;height:520px;background:{WHITE};border-radius:50%"></div>
<img src="{IMG['robot'][0]}" alt="{IMG['robot'][2]}" style="position:absolute;left:1290px;top:380px;width:420px;height:228px;object-fit:contain">
{pill("AI 윤리", WHITE, PINK, 28)}
<h2 style="font-family:{JUA};font-size:88px;font-weight:400;line-height:1.2;color:{WHITE};width:1100px">AI는 똑똑한 공부 친구.<br>판단과 책임은 나에게.</h2>
<p style="font-size:34px;line-height:1.5;color:#ffe6ee;width:1040px">쓰기 전에 세 가지만 기억해요.</p>
<div style="display:flex;flex-direction:row;gap:20px">{pill("내 정보는 지키기", WHITE, PINK, 30)}{pill("답은 확인하기", WHITE, PINK, 30)}{pill("출처는 밝히기", WHITE, PINK, 30)}</div>
<div style="position:absolute;left:0;right:0;bottom:0;height:16px;background:{SOFTPINK}"></div>
<p style="position:absolute;left:128px;width:600px;bottom:52px;font-size:24px;color:#ffe6ee">BeAT 1차시 · 04</p>''', bg=PINK, color=WHITE, extra=";justify-content:center")

# 5 퀴즈
qs = ["국어 수행평가 감상문을 AI가 써 준 그대로, 이름만 바꿔서 제출했다.",
      "수학 문제가 막혀서 “정답 말고 힌트만 한 단계씩 줘”라고 물었다.",
      "진로 상담을 받으려고 내 이름, 학교, 전화번호, 생활기록부를 그대로 붙여 넣었다.",
      "친구 얼굴 사진으로 허락 없이 웃긴 합성 이미지를 만들어 단톡방에 올렸다."]
qc = "\n".join(card(f'<div style="display:flex;flex-direction:row;gap:24px;align-items:flex-start"><p style="font-family:{JUA};font-size:36px;color:{WHITE};background:{PINK};padding:6px 22px;border-radius:999px">{i}</p><p style="font-size:31px;line-height:1.45;color:{INK}">{q}</p></div><p style="font-family:{JUA};font-size:32px;color:{PINK};align-self:flex-end">O ? X ?</p>', bg=WHITE, pad=30, gap=6, flex="") for i, q in enumerate(qs, 1))
S["quiz"] = section("quiz", f'''{header("AI 윤리 · 상황 퀴즈", PINK, "이럴 때, 괜찮을까? O일까 X일까?", WHITE, "prompt", 150)}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
{qc}
</div>
<p style="font-size:26px;color:{MUTED}">실습 사이트 1번 탭에 상황 8개가 더 있어요. 손가락으로 O, X를 먼저 표시해 보세요.</p>
{footer(5)}''', bg=T_PINK, gap=28)

# 6 할루시네이션
S["hallu"] = section("hallu", f'''{header("AI 윤리 · 확인하기", PINK, "AI도 틀려요. 아주 자신 있게.", WHITE)}
<div style="display:flex;flex-direction:row;gap:48px">
<div style="flex:1;display:flex;flex-direction:column;gap:20px;background:{T_SKY};border-radius:32px;padding:40px">
<p style="font-size:28px;line-height:1.4;background:{BLUE};color:{WHITE};padding:20px 28px;border-radius:28px 28px 8px 28px;align-self:flex-end">조선은 언제, 어디서 세워졌어?</p>
<div style="display:flex;flex-direction:row;gap:16px;align-items:flex-end">{img("robot", 90)}<p style="flex:1;font-size:30px;line-height:1.5;background:{WHITE};padding:24px 28px;border-radius:28px 28px 28px 8px">1392년에 이성계가 세웠어요. <span style="color:{PINK}"><u>수도는 처음부터 한양이었어요.</u></span></p></div>
<p style="font-size:26px;color:{INK}"><b>교과서 확인:</b> 건국 때 수도는 개경, 1394년에 한양으로 옮겼어요.</p>
</div>
<div style="flex:1;display:flex;flex-direction:column;gap:28px;justify-content:center">
<h3 style="font-family:{JUA};font-size:44px;font-weight:400;line-height:1.3;color:{INK}">그럴듯하게 틀리는 것을<br><span style="color:{PINK}">할루시네이션</span>이라고 해요</h3>
<ul style="font-size:30px;line-height:1.6;color:{INK}">
<li>교과서, 선생님 자료와 비교하기</li>
<li>“근거가 뭐야? 어디에 나와?” 다시 묻기</li>
<li>시험에 나올 내용일수록 꼭 확인하기</li>
</ul>
</div>
</div>
{footer(6)}''')

# 7 안전 약속
pl = [("Lock", "개인정보를 입력하지 않아요", "생활기록부, 전화번호, 건강정보, 주소"),
      ("Search", "AI 답변이 정확한지 다시 확인해요", "교과서, 믿을 수 있는 자료와 비교"),
      ("Link", "남의 글과 이미지는 출처를 표시해요", "AI로 만든 것도 “AI 생성”이라고"),
      ("Wrench", "AI 결과를 그대로 제출하지 않아요", "직접 확인하고 내 말로 고쳐 쓰기"),
      ("Warning", "이상한 답변은 선생님께 알려요", "캡처해서 선생님이나 운영진에게")]
plr = "\n".join(f'<div style="display:flex;flex-direction:row;gap:24px;align-items:center;background:{WHITE};border-radius:24px;padding:16px 28px"><x-icon name="{ic}" style="color:{PINK};width:48px;height:48px"></x-icon><p style="font-size:31px;font-weight:700;width:640px;color:{INK}">{a}</p><p style="font-size:25px;color:{MUTED}">{b}</p></div>' for ic, a, b in pl)
S["pledge"] = section("pledge", f'''{header("AI 윤리 · 약속", PINK, 'BeAT <span style="color:#d33d68">안전 사용 약속</span> 다섯 가지', WHITE, "pair", 150)}
<div style="display:flex;flex-direction:column;gap:14px">
{plr}
</div>
{footer(7, "출처: BeAT 활용 학생 교육 프로그램 리플릿 ‘BeAT 안전 사용 약속’")}''', bg=T_SKY, gap=28)

# 8 약속 그림
steps8 = [("체크한 약속 중 그림에 담을 것 고르기", PINK), ("스타일 · 분위기 · 화면 비율 고르기", SKY), ("프롬프트 복사 → 개인GPT에 붙여 넣기", YEL), ("이상한 곳 확인, “AI 생성 이미지” 표시", GREEN)]
st8 = "\n".join(f'<div style="display:flex;flex-direction:row;gap:20px;align-items:center"><p style="font-family:{JUA};font-size:36px;color:{INK};background:{c};padding:4px 22px;border-radius:999px">{i}</p><p style="font-size:29px;color:{INK}">{t}</p></div>' for i, (t, c) in enumerate(steps8, 1))
S["pledge-art"] = section("pledge-art", f'''{header("AI 윤리 · 약속을 그림으로", PINK, "우리 반 안전 약속 포스터 만들기", WHITE, "robot", 120)}
<div style="display:flex;flex-direction:row;gap:40px">
<div style="flex:2;display:flex;flex-direction:column;gap:22px;justify-content:center">
{st8}
</div>
<div style="flex:3;display:flex;flex-direction:column;gap:14px">
{pill("예시 프롬프트 · 약속 1개 → 한 장면", T_PINK, PINK)}
<p style="font-size:26px;line-height:1.55;background:{WHITE};border:3px dashed {SOFTPINK};border-radius:24px;padding:28px 32px">밝은 웹툰 스타일로 그림을 그려 줘. 주제: ‘개인정보를 입력하지 않아요’. 장면: 고등학생이 이름표와 전화번호 카드를 자물쇠 달린 상자에 넣고, AI 로봇 튜터가 엄지를 치켜세우는 장면. 등장인물: 실제 인물이 아닌 고등학생 캐릭터와 파란색 로봇 ‘비트’. 세로 3:4 포스터, 그림 안에 글자는 넣지 마.</p>
<p style="font-size:24px;color:{MUTED}">약속을 여러 개 고르면 컷 만화 프롬프트가 돼요</p>
</div>
</div>
{footer(8, "실습 사이트 2번 탭 ‘약속을 그림으로’")}''')

# 9 소개
S["intro"] = section("intro", f'''{header("BeAT 만나기", BLUE, f'BeAT = <span style="color:{PINK}">B</span>usan <span style="color:{PINK}">e</span>ducation <span style="color:{PINK}">A</span>I <span style="color:{PINK}">T</span>utor')}
<div style="display:flex;flex-direction:row;gap:40px;align-items:center">
{img("team", 300)}
<div style="flex:1;display:flex;flex-direction:column;gap:20px">
<div style="background:{T_BLUE};border-radius:24px;padding:24px 32px;display:flex;flex-direction:column;gap:6px"><p style="font-size:26px;color:{MUTED}">선생님에게</p><h3 style="font-family:{JUA};font-size:52px;font-weight:400;color:{D_BLUE}">보조교사</h3></div>
<div style="background:{BLUE};border-radius:24px;padding:24px 32px;display:flex;flex-direction:column;gap:6px"><p style="font-size:26px;color:#e8f1fb">학생에게</p><h3 style="font-family:{JUA};font-size:52px;font-weight:400;color:{WHITE}">학습튜터</h3></div>
</div>
</div>
<p style="font-size:30px;line-height:1.5;color:{INK}">부산광역시교육청이 만든 우리 지역 학생과 선생님을 위한 AI 튜터. 궁금한 것을 묻고, 개념 정리, 오답 분석, 진로 탐색까지 함께해요.</p>
{footer(9, "대상 부산광역시 고등학생 · 운영 2026년 10월~12월")}''', gap=30)

# 10 접속
lsteps = [("주소 입력", "beat.busanedu.net<br>리플릿 QR로도 접속"), ("로그인", "학교에서 안내받은 계정<br>[로그인 방식: 선생님 안내]"), ("이름 확인", "오른쪽 위에 내 이름이 보이면 성공"), ("첫 질문", "수업GPT → BeAT활용안내 AI챗봇 → 질문 보내기")]
lc = "\n".join(card(f'<p style="font-family:{JUA};font-size:44px;color:{WHITE};background:{BLUE};padding:2px 22px;border-radius:999px;align-self:flex-start">{i}</p><h3 style="font-size:32px;font-weight:700;color:{INK}">{a}</h3><p style="font-size:25px;line-height:1.45;color:{MUTED}">{b}</p>', pad=28, gap=12, flex="") for i, (a, b) in enumerate(lsteps, 1))
S["login"] = section("login", f'''{header("BeAT 만나기 · 접속하기", BLUE, "네 단계면 첫 질문까지", WHITE, "work", 150)}
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:22px">
{lc}
</div>
<div style="background:{T_SKY};border-radius:24px;padding:24px 32px;display:flex;flex-direction:row;gap:20px;align-items:center"><x-icon name="Chat" style="color:{BLUE};width:48px;height:48px"></x-icon><p style="font-size:29px;color:{INK}">“BeAT로 공부할 때 무엇을 할 수 있어? 고등학생 예시로 3줄로 알려 줘.”</p></div>
{footer(10, "로그인이 안 되면 새 계정을 만들지 말고 선생님께")}''', gap=30)

# 11 메뉴
mn = [("수업GPT", "선생님이 올린 교과서, 학습지, 해설지로 질문해요. 왼쪽 카테고리에서 선생님 폴더를 골라요.", BLUE, D_BLUE),
      ("개인GPT", "무엇이든 자유롭게 묻고, 문서나 이미지를 올려 요약·설명을 받아요.", PINK, PINK),
      ("AI Agents", "학교 Agent·공유 Agent를 골라 쓰고, ‘나의 Agent’를 직접 만들어요.", GREEN, D_GREEN),
      ("Custom AI", "학습통역, 문서번역, 자기소개 멘토링. 칸을 채워 쓰는 전용 도구예요.", YEL, D_GOLD)]
mc = "\n".join(card(f'<h3 style="font-size:34px;font-weight:700;color:{tc}">{a}</h3><p style="font-size:25px;line-height:1.5;color:{INK}">{b}</p>', top=c, pad=28, flex="") for a, b, c, tc in mn)
S["menus"] = section("menus", f'''{header("BeAT 만나기 · 화면 둘러보기", BLUE, "위쪽 메뉴 4개, 언제 쓸까?", WHITE)}
<div style="background:{WHITE};border:2px solid #e3eaf3;border-radius:24px;padding:18px 40px;display:flex;flex-direction:row;align-items:center;gap:56px">
<p style="font-size:44px;font-weight:700;color:{INK}">B<span style="color:{BLUE}"><i>e</i></span>AT</p>
<div style="flex:1"></div>
<p style="font-size:30px;color:{D_BLUE};font-weight:700">수업GPT</p><p style="font-size:30px">개인GPT</p><p style="font-size:30px">AI Agents</p><p style="font-size:30px">Custom AI</p>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:22px">
{mc}
</div>
{footer(11)}''', bg=T_BLUE, gap=30)

# 12 공식
fm = [("역할", "누구처럼 답할까?<br>“친절한 수학 선생님”", BLUE, WHITE), ("상황", "나는 지금 어때?<br>“고1, 꼭짓점이 헷갈려”", GREEN, INK), ("요청", "무엇을 해 줘?<br>“예시 하나로 설명해 줘”", PINK, WHITE), ("형식", "어떤 모양으로?<br>“단계별로, 3줄로”", YEL, INK)]
plus = f'<p style="font-family:{JUA};font-size:56px;color:{MUTED};align-self:center">+</p>'
fb = plus.join(f'<div style="flex:1;background:{c};color:{tc};border-radius:28px;padding:30px;display:flex;flex-direction:column;gap:10px"><h3 style="font-family:{JUA};font-size:48px;font-weight:400">{a}</h3><p style="font-size:25px;line-height:1.45">{b}</p></div>' for a, b, c, tc in fm)
S["formula"] = section("formula", f'''{header("질문 잘하기", YEL, "좋은 질문 공식: 역할 + 상황 + 요청 + 형식", INK, "prompt", 150)}
<div style="display:flex;flex-direction:row;gap:14px;align-items:stretch">
{fb}
</div>
<p style="font-size:31px;line-height:1.6;background:{WHITE};border:3px dashed {YEL};border-radius:24px;padding:28px 36px">“너는 <span style="color:{D_BLUE}"><b>친절한 수학 선생님</b></span>이야. <span style="color:{D_GREEN}"><b>나는 고1인데 이차함수 꼭짓점 구하는 법이 헷갈려.</b></span> <span style="color:{PINK}"><b>예시 하나로 설명해 줘.</b></span> <span style="color:{D_GOLD}"><b>단계별로, 정답은 내가 풀어 본 뒤에.</b></span>”</p>
{footer(12)}''', bg=T_YEL, gap=30)

# 13 고쳐 쓰기
S["rewrite"] = section("rewrite", f'''{header("질문 잘하기 · 고쳐 쓰기", YEL, "이렇게 바꾸면 답이 달라져요", INK, "robot", 120)}
<table style="font-size:28px;color:{INK}">
<tr style="background:{T_YEL}"><th style="width:24%">아쉬운 질문</th><th style="width:76%">좋은 질문</th></tr>
<tr><td style="color:{PINK}">수학 알려줘</td><td>너는 친절한 수학 선생님이야. 나는 고1인데 이차함수 꼭짓점 구하는 법이 헷갈려. 예시 하나로 단계별로 설명해 줘.</td></tr>
<tr><td style="color:{PINK}">영어 숙제 해줘</td><td>이 문장에서 관계대명사와 관계부사 중 무엇을 써야 하는지 이유까지 알려 줘. 답은 내가 먼저 고른 다음에.</td></tr>
<tr><td style="color:{PINK}">진로 추천해</td><td>나는 동물과 과학을 좋아하는 고등학생이야. 관련 직업 3개를 하는 일, 필요한 공부로 나눠 표로 정리해 줘.</td></tr>
</table>
{pill("짝과 함께: “국어 요약해줘”를 공식에 맞게 고쳐 보세요 (1분)", YEL, INK, 28)}
{footer(13)}''')

# 14 실습 사이트
tabs = [("1", "윤리 퀴즈", PINK), ("2", "안전 약속", PINK), ("3", "접속하기", BLUE), ("4", "질문 만들기", YEL), ("5", "메뉴별 실습", GREEN), ("6", "돌아보기", SKY)]
tb = "\n".join(f'<p style="font-size:30px;font-weight:700;color:{INK};background:{WHITE};border-left:12px solid {c};padding:18px 26px;border-radius:18px">{n}  {t}</p>' for n, t, c in tabs)
S["site"] = section("site", f'''{header("메뉴별 실습 · 13분", GREEN, "실습 사이트를 옆에 열어 두세요", INK)}
<p style="font-size:34px;font-family:'Courier New', monospace;background:{WHITE};border:3px dashed {GREEN};padding:20px 36px;border-radius:20px;align-self:flex-start">[실습 사이트 주소: 선생님이 공유한 링크]</p>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px">
{tb}
</div>
<p style="font-size:28px;line-height:1.5;color:{INK}">메뉴마다 실습 중 골라서. 필요한 자료는 사이트에서 내려받아 첨부하고, [ ] 칸을 내 상황으로 바꾼 뒤, 답을 받으면 확인 체크까지!</p>
<img src="{IMG['strip'][0]}" alt="{IMG['strip'][2]}" style="position:absolute;right:128px;top:112px;width:520px;height:130px;object-fit:contain;border-radius:20px">
{footer(14)}''', bg=T_GREEN, gap=28)

def mission(sid, n, label, title, color, tcolor, soft, art, art_h, items, tail):
    cs = []
    for pain, t, desc, path, data in items:
        d = pill(f"자료: {data}", soft, tcolor, 22) if data else f'<p style="font-size:22px;color:{MUTED}">자료 필요 없음</p>'
        cs.append(card(f'<p style="font-family:{GAEGU};font-size:30px;font-weight:700;color:{PINK};line-height:1.3">“{pain}”</p><h3 style="font-size:{34 if len(items) < 3 else 32}px;font-weight:700;line-height:1.25;color:{INK}">{t}</h3><p style="font-size:{25 if len(items) < 3 else 23}px;line-height:1.5;color:#3b4860">{desc}</p><p style="font-size:22px;color:{tcolor};font-weight:700">{path}</p>{d}', top=color, pad=30, gap=12))
    return section(sid, f'''{header(label, GREEN, title, INK, art, art_h)}
<div style="display:flex;flex-direction:row;gap:24px">
{chr(10).join(cs)}
</div>
{footer(n, tail)}''', gap=28)

S["m-class"] = mission("m-class", 15, "메뉴별 실습 1/4 · 수업GPT · 모두 하기", "선생님 자료로 시험 대비하기", BLUE, D_BLUE, T_BLUE, "class", 150, [
    ("시험 2주 전, 학습지가 한가득… 어디부터 보지?", "학습지 핵심만 콕 집어 정리하기", "핵심 개념 5가지를 중요한 순서로, 학습지 몇 번 항목인지와 함께 + ‘10초 복습 카드’", "수업GPT → 선생님 폴더 → 대화 시작", "통합과학 탄소 순환 학습지"),
    ("온실 효과랑 지구 온난화, 시험지만 보면 헷갈려", "헷갈리는 개념 비교표 + 내 답 채점받기", "두 개념 비교표(뜻·원인·문제점·한 줄 팁) + 확인 문제에 내가 먼저 쓴 답 채점", "수업GPT → 같은 폴더에서 이어 묻기", "통합과학 탄소 순환 학습지")],
    "AI가 말한 항목 번호를 학습지에서 직접 찾아 확인")
S["m-personal"] = mission("m-personal", 16, "메뉴별 실습 2/4 · 개인GPT · 골라 하기", "나만의 도우미로 약한 곳 채우기", PINK, PINK, T_PINK, "robot", 120, [
    ("해설지를 봐도 왜 틀렸는지 모르겠어", "수학 오답, 정답 말고 힌트로 다시 풀기", "틀린 단계만 먼저 → ‘힌트’라고 하면 한 단계씩 → 같은 유형 연습 문제 1개", "개인GPT → 새 대화 → 오답노트 첨부", "수학 오답노트 (3문항)"),
    ("비문학 지문, 다 읽고 나면 기억이 안 나", "긴 지문, 내가 먼저 요약하고 점검받기", "내 3줄 요약을 먼저 쓰고 → 빠진 내용·잘못 이해한 곳 → O/X 3개, 핵심어 3개", "개인GPT → 새 대화 → 지문 첨부", "비문학 지문 ‘필터 버블’")],
    "AI에게 묻기 전에 내가 먼저 풀고, 먼저 요약하기")
S["m-agents"] = mission("m-agents", 17, "메뉴별 실습 3/4 · AI Agents · 골라 하기", "Agent를 골라 쓰고, 직접 만들기", GREEN, D_GREEN, T_GREEN, "study", 150, [
    ("고교학점제 과목 선택, 뭘 골라야 하지?", "학교·공유 Agent로 과목 선택 상담", "관심 분야를 말하고 2학년 선택 과목 3개 추천받기, 불확실하면 ‘확인 필요’ → 교육과정표와 비교", "AI Agents → 학교/공유 Agent → 과목 선택 도우미", ""),
    ("매번 같은 부탁, 길게 쓰기 귀찮아", "나의 Agent 만들기", "분류 · 아이콘 · 이름 · 설명(200 Byte) → Agent 프롬프트 → 시작 프롬프트 → 미리보기 → 저장 (공유는 ‘나만’)", "템플릿: 퀴즈 코치 · 영어 단어 짝꿍 · 발표 코치", "학습지 · 영어 지문 · 설문 CSV")],
    "Agent 프롬프트에 [지킬 것]을 꼭 넣어요")
S["m-custom"] = mission("m-custom", 18, "메뉴별 실습 4/4 · Custom AI · 골라 하기", "전용 도구 세 가지, 칸을 채우면 끝", YEL, D_GOLD, T_YEL, "pair", 150, [
    ("자기소개서 첫 문장에서 멈춰 있어", "자기소개 멘토링", "① 서식·가이드 파일 올리기 ② 문항 · Reference · 나의 자기 소개(1000자) → AI 피드백 → 내가 고쳐 쓰기", "Custom AI → 자기소개 멘토링", "서식 · 가이드 · 초안"),
    ("내 영어 해석, 맞는 걸까?", "문서번역", "첫 문단을 먼저 해석 → Word 파일 올리기 → 영어→한국어 → 원문과 한 문장씩 비교", "Custom AI → 문서번역", "영어 지문 (docx)"),
    ("내 말이 제대로 전달될까?", "학습통역 (짝 활동)", "“밤 11시 이후 스마트폰 끄기” 찬반 30초씩 → 실시간 기록·번역 → 잘못 옮겨진 곳 찾기", "Custom AI → 학습통역", "")],
    "AI 피드백은 참고만, 문장은 내 손으로")

# 19 돌아보기
rq = [("AI 답에서 확인이 필요했던 부분은? 어떻게 확인했나요?", SKY), ("안전 약속 다섯 가지 중 나에게 가장 필요한 것과 그 이유는?", PINK), ("다음 주 공부에 BeAT를 어떻게 써 보고 싶나요?", GREEN)]
rr = "\n".join(f'<div style="display:flex;flex-direction:row;gap:28px;align-items:center;background:{WHITE};border-radius:28px;padding:26px 36px"><p style="font-family:{JUA};font-size:48px;color:{INK};background:{c};padding:0 26px;border-radius:999px">{i}</p><p style="font-size:33px;line-height:1.4;color:{INK}">{q}</p></div>' for i, (q, c) in enumerate(rq, 1))
S["review"] = section("review", f'''{header("돌아보기", SKY, "오늘 BeAT에게서 무엇을 확인했나요?", INK, "pair", 150)}
<div style="display:flex;flex-direction:column;gap:20px">
{rr}
</div>
{footer(19, "실습 사이트 6번 탭에 세 줄로 쓰고 복사해 제출")}''', bg=T_SKY, gap=30)

# 20 다음 단계
nx = [("개인 활용 교육", "회차별 2시간 · 예습·복습·오답 분석, 문서 요약, 진로 탐색 Agents, 자기소개서·면접", PINK), ("포트폴리오 제작", "1회 4시간, 총 2회 · 문제 찾기 → 기획 → 제작 → 발표", YEL), ("우수사례 공모전", "11월 공고 후 온라인 접수 · 창의성, 교육적 효과, 활용 적극성, 완성도", GREEN)]
nc = "\n".join(card(f'<h3 style="font-size:34px;font-weight:700;color:{INK}">{a}</h3><p style="font-size:25px;line-height:1.5;color:#3b4860">{b}</p>', top=c, pad=30, flex="") for a, b, c in nx)
S["next"] = section("next", f'''{pill("다음 단계", WHITE, D_BLUE)}
<h2 style="font-family:{JUA};font-size:68px;font-weight:400;line-height:1.15;color:{INK}">BeAT와 더 해 보고 싶다면</h2>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px">
{nc}
</div>
<div style="display:flex;flex-direction:row;gap:32px;align-items:center">
<p style="flex:1;font-family:{JUA};font-size:52px;line-height:1.3;color:{INK}">기억할 세 가지:<br>지키기 · 확인하기 · 밝히기</p>
{img("strip", 170, ";border-radius:24px")}
</div>
<div style="position:absolute;left:0;right:0;bottom:0;height:16px;background:{BLUE}"></div>
<p style="position:absolute;left:128px;width:1400px;bottom:52px;font-size:24px;color:{INK}">beat.busanedu.net · 문의 yb3447@pusan.ac.kr · 부산대학교 AI융합교육원</p>''', bg=SKY, gap=30)

for sid, html in S.items():
    (D / f"{sid}.html").write_text(html, encoding="utf-8")
print(len(S), "slides written")
