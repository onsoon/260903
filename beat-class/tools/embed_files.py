"""data/ 폴더의 실습 자료를 practice-site.html 의 FILES 자리에 넣고, 단독 실행본 index.html 을 다시 만든다.

사용법 (beat-class 폴더에서):
    python3 tools/make_data.py data
    python3 tools/embed_files.py
"""
import base64, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PAGE = ROOT / "practice-site.html"

FILES = {
    "sci_docx": ("수업GPT_통합과학_탄소순환_학습지.docx", "sci_txt"),
    "sci_txt": ("수업GPT_통합과학_탄소순환_학습지.txt", None),
    "math_docx": ("개인GPT_수학_오답노트.docx", "math_txt"),
    "math_txt": ("개인GPT_수학_오답노트.txt", None),
    "bimun": ("개인GPT_비문학지문_추천알고리즘.txt", None),
    "csv": ("AIAgents_가상설문_스마트폰과수면.csv", None),
    "intro": ("CustomAI_자기소개_초안_예시.txt", None),
    "eng": ("CustomAI_영어지문_번역연습.txt", None),
    "eng_docx": ("CustomAI_영어지문_번역연습.docx", "eng"),
    "form_docx": ("CustomAI_자기소개_서식_예시.docx", None),
    "guide": ("CustomAI_자기소개_작성가이드.txt", None),
}

def size(n):
    return f"{n / 1024:.0f}KB" if n >= 1024 else f"{n}B"

out = {}
for key, (name, twin) in FILES.items():
    raw = (DATA / name).read_bytes()
    entry = {"name": name, "size": size(len(raw))}
    if name.endswith(".docx"):
        entry["b64"] = base64.b64encode(raw).decode()
        entry["twin"] = twin
    else:
        entry["text"] = raw.decode("utf-8")  # CSV 는 엑셀 한글용 BOM 을 그대로 둔다
    out[key] = entry

# 리플릿 캐릭터: 휴대폰 화면에 맞게 줄여 webp 로 넣는다
from io import BytesIO
from PIL import Image
CHAR_SPEC = {
    "girl": ("girl_tablet.png", 380, "태블릿을 들고 손가락으로 가리키는 고등학생"),
    "robot": ("robot_pink.png", 220, "노트북을 든 분홍색 BeAT 로봇"),
    "prompt": ("robot_prompt.png", 240, "프롬프트 예시 카드를 든 분홍 로봇"),
    "pair": ("scene_pair.png", 360, "로봇 튜터와 이야기하는 두 학생"),
    "work": ("scene_work.png", 320, "모니터 속 로봇과 자료를 든 학생"),
    "study": ("scene_study.png", 440, "노트북과 휴대폰 속 로봇에게 질문하는 학생들"),
    "team": ("scene_team.png", 480, "선생님과 학생이 로봇 튜터와 함께 공부하는 장면"),
}
chars = {}
for key, (name, width, alt) in CHAR_SPEC.items():
    im = Image.open(ROOT / "slides" / "images" / name).convert("RGBA")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = BytesIO(); im.save(buf, "WEBP", quality=82, method=6)
    chars[key] = {"src": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(), "alt": alt, "w": im.width, "h": im.height}

page = PAGE.read_text(encoding="utf-8")
page = re.sub(r"/\*CHARS_START\*/.*?/\*CHARS_END\*/", lambda m: "/*CHARS_START*/" + json.dumps(chars, ensure_ascii=False) + "/*CHARS_END*/", page, flags=re.S)
blob = json.dumps(out, ensure_ascii=False).replace("</", "<\\/")
page = re.sub(r"/\*FILES_START\*/.*?/\*FILES_END\*/", lambda m: f"/*FILES_START*/{blob}/*FILES_END*/", page, flags=re.S)
PAGE.write_text(page, encoding="utf-8")

# 단독 실행본: 아티팩트가 씌우는 문서 뼈대를 직접 붙인다
head, body = page.split("</style>\n", 1)
(ROOT / "index.html").write_text(
    '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + head.replace("<style>", "<style>\nbody { margin: 0; }", 1) + "</style>\n</head>\n<body>\n"
    + body + "</body>\n</html>\n", encoding="utf-8")
print("embedded", len(out), "files;", f"page {len(page) // 1024}KB")
