/**
 * 우리집 습관 체크 ↔ 구글 시트 연결 스크립트
 *
 * 사용법
 * 1. 새 구글 시트 → 확장 프로그램 → Apps Script → 이 코드를 통째로 붙여 넣고 저장
 * 2. 위쪽 함수 선택에서 setup 을 고르고 [실행] → 권한 허용
 * 3. [배포] → [새 배포] → 유형: 웹 앱, 실행: 나, 액세스 권한: 모든 사용자 → 배포
 * 4. 나온 웹 앱 URL과 '설정' 탭 B1 칸의 가족 비밀키를 사이트 부모 모드에 입력
 */

const SHEET_CHECKS = "체크기록";
const SHEET_ITEMS = "항목";
const SHEET_SETTINGS = "설정";
const CHECK_HEADER = ["날짜", "아이", "항목", "완료", "기록 시각", "아이ID", "항목ID", "ts"];
const ITEM_HEADER = ["아이", "학년", "분류", "이모지", "항목", "단계", "요일", "사용"];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const settings = getOrCreate_(ss, SHEET_SETTINGS);
  if (!settings.getRange("B1").getDisplayValue()) {
    settings.getRange("A1:B4").setNumberFormat("@").setValues([
      ["가족 비밀키", makeKey_()],
      ["", "↑ 이 비밀키를 사이트 부모 모드에 입력하세요. 바꾸고 싶으면 이 칸을 고치면 돼요."],
      ["설정 데이터 (수정하지 마세요)", ""],
      ["설정 수정 시각 (수정하지 마세요)", ""],
    ]);
    settings.setColumnWidth(1, 220);
    settings.setColumnWidth(2, 420);
  }

  const checks = getOrCreate_(ss, SHEET_CHECKS);
  if (checks.getLastRow() === 0) {
    checks.getRange("A:H").setNumberFormat("@");
    checks.appendRow(CHECK_HEADER);
    checks.setFrozenRows(1);
    checks.hideColumns(6, 3);
  }

  const items = getOrCreate_(ss, SHEET_ITEMS);
  if (items.getLastRow() === 0) {
    items.appendRow(ITEM_HEADER);
    items.setFrozenRows(1);
  }

  // 처음 있던 빈 '시트1' 정리
  ["시트1", "Sheet1"].forEach(function (name) {
    const blank = ss.getSheetByName(name);
    if (blank && blank.getLastRow() === 0) ss.deleteSheet(blank);
  });
  ss.setActiveSheet(checks);

  console.log("준비 완료! '설정' 탭 B1 칸의 가족 비밀키: " + settings.getRange("B1").getDisplayValue());
}

function doGet() {
  return json_({ ok: true, message: "우리집 습관 체크 연결 스크립트가 동작 중이에요." });
}

// 사이트는 POST 한 번으로 '보내기 + 받아오기'를 함께 한다
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "bad_request" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settings = ss.getSheetByName(SHEET_SETTINGS);
  if (!settings) return json_({ ok: false, error: "not_setup" });
  const familyKey = settings.getRange("B1").getDisplayValue().trim();
  if (!familyKey || body.key !== familyKey) return json_({ ok: false, error: "wrong_key" });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const tz = ss.getSpreadsheetTimeZone();
    if (Array.isArray(body.checks) && body.checks.length) saveChecks_(ss, body.checks, tz);

    let configUpdatedAt = Number(settings.getRange("B4").getDisplayValue()) || 0;
    if (body.config && Number(body.configUpdatedAt) > configUpdatedAt) {
      configUpdatedAt = Number(body.configUpdatedAt);
      settings.getRange("B3:B4").setValues([[JSON.stringify(body.config)], [String(configUpdatedAt)]]);
      writeItems_(ss, body.config);
    }

    const raw = settings.getRange("B3").getDisplayValue();
    return json_({
      ok: true,
      config: raw ? JSON.parse(raw) : null,
      configUpdatedAt: configUpdatedAt,
      checks: readDone_(ss),
    });
  } finally {
    lock.releaseLock();
  }
}

// 같은 날짜·아이·항목은 한 줄로 관리하고, 더 나중에 체크한 기록이 이긴다
function saveChecks_(ss, ops, tz) {
  const sheet = ss.getSheetByName(SHEET_CHECKS);
  const last = sheet.getLastRow();
  const rows = last > 1 ? sheet.getRange(2, 1, last - 1, 8).getDisplayValues() : [];
  const index = {};
  rows.forEach(function (r, i) {
    index[r[0] + "|" + r[5] + "|" + r[6]] = i;
  });

  let changed = false;
  const added = [];
  ops.forEach(function (op) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(op.date) || !op.childId || !op.itemId) return;
    const ts = Number(op.ts) || Date.now();
    const row = [
      op.date,
      String(op.child || ""),
      String(op.item || ""),
      op.done ? "✅" : "",
      Utilities.formatDate(new Date(ts), tz, "yyyy-MM-dd HH:mm"),
      String(op.childId),
      String(op.itemId),
      String(ts),
    ];
    const k = op.date + "|" + op.childId + "|" + op.itemId;
    if (k in index) {
      const i = index[k];
      if (i >= rows.length) {
        if (ts >= Number(added[i - rows.length][7])) added[i - rows.length] = row;
      } else if (ts >= Number(rows[i][7])) {
        rows[i] = row;
        changed = true;
      }
    } else {
      index[k] = rows.length + added.length;
      added.push(row);
    }
  });

  if (changed && rows.length) sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  if (added.length) {
    const range = sheet.getRange(last + 1, 1, added.length, 8);
    range.setNumberFormat("@");
    range.setValues(added);
  }
}

function readDone_(ss) {
  const sheet = ss.getSheetByName(SHEET_CHECKS);
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet
    .getRange(2, 1, last - 1, 8)
    .getDisplayValues()
    .filter(function (r) {
      return r[3] === "✅";
    })
    .map(function (r) {
      return [r[0], r[5], r[6]];
    });
}

// 부모님이 보기 편하도록 항목 목록을 '항목' 탭에 풀어서 적어 둔다
function writeItems_(ss, config) {
  const sheet = getOrCreate_(ss, SHEET_ITEMS);
  const names = {};
  (config.children || []).forEach(function (c) {
    names[c.id] = c;
  });
  const days = "일월화수목금토";
  const rows = (config.items || []).map(function (it) {
    const c = names[it.childId] || {};
    return [
      c.nickname || "",
      c.grade || "",
      it.category,
      it.emoji,
      it.title,
      it.stage + "단계",
      (it.days || []).map(function (d) {
        return days[d];
      }).join(""),
      it.active ? "사용" : "숨김",
    ];
  });
  sheet.clearContents();
  sheet.getRange(1, 1, 1, ITEM_HEADER.length).setValues([ITEM_HEADER]);
  if (rows.length) sheet.getRange(2, 1, rows.length, ITEM_HEADER.length).setValues(rows);
}

function getOrCreate_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function makeKey_() {
  return Utilities.getUuid().replace(/-/g, "").slice(0, 12);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
