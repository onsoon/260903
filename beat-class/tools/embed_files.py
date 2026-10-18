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

page = PAGE.read_text(encoding="utf-8")
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
