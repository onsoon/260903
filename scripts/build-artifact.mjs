// dist/ 빌드 결과를 외부 파일 없이 열리는 한 장짜리 HTML(dist/habit-checklist.html)로 묶는다
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dist = "dist";
const html = readFileSync(join(dist, "index.html"), "utf8");
const pick = (re) => html.match(re)?.[1];

const jsPath = pick(/<script type="module" crossorigin src="\/?([^"]+)"><\/script>/);
const cssPath = pick(/<link rel="stylesheet" crossorigin href="\/?([^"]+)">/);
const js = readFileSync(join(dist, jsPath), "utf8").replace(/<\/script/gi, "<\\/script");
const css = readFileSync(join(dist, cssPath), "utf8");
const title = pick(/<title>([^<]*)<\/title>/);
const description = pick(/<meta name="description" content="([^"]*)"/);

const out = `<title>${title}</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync(join(dist, "habit-checklist.html"), out);
console.log(`dist/habit-checklist.html (${Math.round(out.length / 1024)} KB)`);
