/* ============================================================
   saju.js — 사주 계산 (브라우저 전용, 외부 라이브러리 없음)

   방식 요약
   - 연주/일주: 60갑자 기준일(1900-01-31 = 甲辰일)에서 날짜 차이로 계산
   - 월주: 24절기(태양 황경)를 계산해 절입일을 구한 뒤, 절입 기준으로 월 바꿈
   - 시주: 시각을 2시간 단위로 나눠 지지(자~해)를 정하고 일간으로 천간 계산
   - 대운: 성별·년간의 음양으로 순행/역행을 정하고, 절입까지의 일수로 시작 나이 추정

   ※ 절기 계산은 태양 위치 근사식이라 절입일이 하루 정도 다를 수 있어요.
   ============================================================ */
(function (global) {
  "use strict";

  const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const STEMS_H = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const BRANCHES_H = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
  const ANIMAL_EMOJI = ["🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐵", "🐓", "🐶", "🐷"];

  const ELEMENTS = ["wood", "fire", "earth", "metal", "water"];
  const ELEMENT_KO = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
  const ELEMENT_HANJA = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };
  const ELEMENT_ICON = { wood: "🌳", fire: "🔥", earth: "⛰️", metal: "⚙️", water: "💧" };

  /* 천간 오행 / 지지 오행 */
  const STEM_ELEMENT = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"];
  const BRANCH_ELEMENT = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"];

  /* 상생(낳는 관계): 목→화→토→금→수→목 */
  const GENERATES = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };

  /* 절기: 황경 각도 → 월지. 인월(호랑이)부터 시작 */
  /* 날짜(월)는 연도 기준 힌트용. 실제 시각은 황경으로 다시 계산 */
  const TERMS = [
    { deg: 315, branch: 2, m: 2, d: 4 },   // 입춘
    { deg: 345, branch: 3, m: 3, d: 6 },   // 경칩
    { deg: 15, branch: 4, m: 4, d: 5 },    // 청명
    { deg: 45, branch: 5, m: 5, d: 6 },    // 입하
    { deg: 75, branch: 6, m: 6, d: 6 },    // 망종
    { deg: 105, branch: 7, m: 7, d: 7 },   // 소서
    { deg: 135, branch: 8, m: 8, d: 8 },   // 입추
    { deg: 165, branch: 9, m: 9, d: 8 },   // 백로
    { deg: 195, branch: 10, m: 10, d: 8 }, // 한로
    { deg: 225, branch: 11, m: 11, d: 7 }, // 입동
    { deg: 255, branch: 0, m: 12, d: 7 },  // 대설
    { deg: 285, branch: 1, m: 1, d: 6 },   // 소한
  ];

  const pad = (n) => String(n).padStart(2, "0");

  /* ---------------- 태양 황경 ---------------- */
  function solarLongitude(ms) {
    const jd = ms / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mr = (M * Math.PI) / 180;
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
      0.000289 * Math.sin(3 * Mr);
    let lon = L0 + C;
    const om = 125.04 - 1934.136 * T;
    lon = lon - 0.00569 - 0.00478 * Math.sin((om * Math.PI) / 180);
    return ((lon % 360) + 360) % 360;
  }

  /* 목표 황경에 도달하는 시각 찾기 (이분법) */
  function findLongitudeTime(targetDeg, guessMs) {
    const norm = (d) => ((d % 360) + 360) % 360;
    const diffFrom = (ms) => {
      const a = norm(solarLongitude(ms));
      let d = norm(a - targetDeg);
      if (d > 180) d -= 360;
      return d;
    };
    let lo = guessMs - 12 * 86400000;
    let hi = guessMs + 12 * 86400000;
    for (let i = 0; i < 45; i++) {
      const mid = (lo + hi) / 2;
      if (diffFrom(mid) < 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /* ---------------- 날짜/시각 ---------------- */
  /* KST 표준시(UTC+9) 기준 구성요소 */
  function kstParts(ms) {
    const d = new Date(ms + 9 * 3600000);
    return {
      y: d.getUTCFullYear(),
      m: d.getUTCMonth() + 1,
      d: d.getUTCDate(),
      h: d.getUTCHours(),
      mi: d.getUTCMinutes(),
    };
  }

  function kstMs(y, m, d, h = 0, mi = 0) {
    return Date.UTC(y, m - 1, d, h, mi) - 9 * 3600000;
  }

  /* 60갑자 인덱스 */
  function ganziIndex(stem, branch) {
    for (let i = 0; i < 60; i++) {
      if (i % 10 === stem && i % 12 === branch) return i;
    }
    return 0;
  }

  function ganziName(idx) {
    const i = ((idx % 60) + 60) % 60;
    return {
      idx: i,
      stem: i % 10,
      branch: i % 12,
      ko: STEMS[i % 10] + BRANCHES[i % 12],
      hanja: STEMS_H[i % 10] + BRANCHES_H[i % 12],
    };
  }

  /* ---------------- 지지 관계 ---------------- */
  const GANZHI_RELATIONS = [
    { kind: "합", branches: [0, 1] },
    { kind: "합", branches: [2, 11] },
    { kind: "합", branches: [3, 10] },
    { kind: "합", branches: [4, 9] },
    { kind: "합", branches: [5, 8] },
    { kind: "합", branches: [6, 7] },
    { kind: "충", branches: [0, 6] },
    { kind: "충", branches: [1, 7] },
    { kind: "충", branches: [2, 8] },
    { kind: "충", branches: [3, 9] },
    { kind: "충", branches: [4, 10] },
    { kind: "충", branches: [5, 11] },
  ];

  function countRelations(branchIdx) {
    const c = { 합: 0, 충: 0, 같은: 0 };
    branchIdx.forEach((b, i) => {
      branchIdx.forEach((o, j) => {
        if (i >= j) return;
        if (b === o) c["같은"]++;
        GANZHI_RELATIONS.forEach((r) => {
          if ((r.branches[0] === b && r.branches[1] === o) || (r.branches[1] === b && r.branches[0] === o)) {
            c[r.kind]++;
          }
        });
      });
    });
    return c;
  }

  /* ---------------- 메인 계산 ---------------- */
  function analyze(input) {
    const { name = "", birth, time, gender = "female", calendar = "solar", targetYear } = input;
    const [y, m, d] = birth.split("-").map(Number);
    let hour = null;
    let minute = 0;
    if (time) {
      const [hh, mm] = time.split(":").map(Number);
      hour = hh;
      minute = mm;
    }

    /* 음력 입력은 계산하지 않고 안내 (윤달 여부를 확정할 수 없음) */
    if (calendar === "lunar") {
      return { ok: false, reason: "lunar" };
    }

    const birthMs = kstMs(y, m, d, hour ?? 12, minute);

    /* --- 연주 --- */
    const yearForPillar = (() => {
      /* 입춘 이전이면 전년도 기준 */
      const ipchun = findLongitudeTime(315, kstMs(y, 2, 4));
      return birthMs < ipchun ? y - 1 : y;
    })();
    const yearIdx = ganziIndex(((yearForPillar - 4) % 10 + 10) % 10, ((yearForPillar - 4) % 12 + 12) % 12);

    /* --- 월주: 절입일 기준 --- */
    let monthBranch = null;
    let prevTermMs = 0;
    let nextTermMs = 0;
    const candidates = [];
    for (let yy = y - 1; yy <= y + 1; yy++) {
      TERMS.forEach((t) => {
        const guess = kstMs(yy, t.m, t.d);
        candidates.push({ ms: findLongitudeTime(t.deg, guess), branch: t.branch });
      });
    }
    candidates.sort((a, b) => a.ms - b.ms);
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].ms <= birthMs) {
        monthBranch = candidates[i].branch;
        prevTermMs = candidates[i].ms;
        nextTermMs = (candidates[i + 1] || {}).ms || birthMs + 30 * 86400000;
      }
    }
    if (monthBranch === null) {
      monthBranch = candidates[0].branch;
      prevTermMs = candidates[0].ms;
      nextTermMs = candidates[1].ms;
    }

    /* 월간: 연간에 따라 인월 천간이 정해짐 (오호둔) */
    const monthStemBase = ((yearIdx % 10) % 5) * 2 + 2; // 갑기→병(2), 을경→무(4) ...
    const monthOrder = ((monthBranch - 2) + 12) % 12; // 인월=0
    const monthStem = (monthStemBase + monthOrder) % 10;

    /* --- 일주: 1900-01-31 = 갑진(40) 기준 --- */
    const baseMs = Date.UTC(1900, 0, 31);
    const birthDateOnly = Date.UTC(y, m - 1, d);
    const dayDiff = Math.round((birthDateOnly - baseMs) / 86400000);
    const dayIdx = (((40 + dayDiff) % 60) + 60) % 60;
    const dayStem = dayIdx % 10;
    const dayBranch = dayIdx % 12;

    /* --- 시주 --- */
    let hourPillar = null;
    if (hour !== null) {
      /* 자시는 23:30 이후를 다음날 자시로 보지만, 단순화해 23시~01시 자시 */
      const hb = Math.floor(((hour + 1) % 24) / 2);
      const hs = ((dayStem % 5) * 2 + hb) % 10;
      hourPillar = ganziName(ganziIndex(hs, hb));
    }

    const pillars = {
      year: ganziName(yearIdx),
      month: ganziName(ganziIndex(monthStem, monthBranch)),
      day: ganziName(dayIdx),
      hour: hourPillar,
    };

    /* --- 오행 분포 --- */
    const five = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    ["year", "month", "day", "hour"].forEach((k) => {
      const p = pillars[k];
      if (!p) return;
      five[STEM_ELEMENT[p.stem]] += 1;
      five[BRANCH_ELEMENT[p.branch]] += 1;
    });

    /* --- 일간 --- */
    const dmElement = STEM_ELEMENT[dayStem];
    const dmYin = dayStem % 2 === 1;

    /* --- 신강/신약(간단 근사): 나를 돕는 기운 vs 쓰는 기운 --- */
    const support = five[dmElement === "water" ? "metal" : dmElement === "metal" ? "earth" : dmElement === "earth" ? "fire" : dmElement === "fire" ? "wood" : "water"];
    const selfSupport = five[dmElement];
    const total = ELEMENTS.reduce((s, e) => s + five[e], 0) || 1;
    const strengthRatio = (support + selfSupport) / total;
    const strength = strengthRatio >= 0.55 ? "strong" : strengthRatio <= 0.35 ? "weak" : "balanced";

    /* --- 용신 후보: 부족한 오행 + 일간을 돕는 기운 --- */
    const sortedWeak = ELEMENTS.slice().sort((a, b) => five[a] - five[b]);
    const yongsin = sortedWeak.filter((e) => e !== dmElement)[0] || GENERATES[dmElement];
    const secondary = GENERATES[yongsin] || sortedWeak[1];

    const relations = countRelations([
      pillars.year.branch,
      pillars.month.branch,
      pillars.day.branch,
      pillars.hour ? pillars.hour.branch : -1,
    ].filter((b) => b >= 0));

    /* --- 대운 --- */
    const yearStemYang = pillars.year.stem % 2 === 0;
    const male = gender === "male";
    const forward = (yearStemYang && male) || (!yearStemYang && !male);
    let daeunStartAge;
    let daeunDirection;
    if (forward) {
      /* 순행: 다음 절입까지 남은 일수 / 3 → 시작 나이 */
      daeunStartAge = Math.max(1, Math.round((nextTermMs - birthMs) / 86400000 / 3));
      daeunDirection = "순행";
    } else {
      /* 역행: 지난 절입으로부터 지난 일수 / 3 */
      daeunStartAge = Math.max(1, Math.round((birthMs - prevTermMs) / 86400000 / 3));
      daeunDirection = "역행";
    }
    const daeun = [];
    for (let i = 0; i < 10; i++) {
      const step = forward ? i + 1 : -(i + 1);
      const p = ganziName(ganziIndex(((monthStem + step) % 10 + 10) % 10, ((monthBranch + step) % 12 + 12) % 12));
      daeun.push({ age: daeunStartAge + i * 10, ...p });
    }

    /* --- 세운(연도별 운세) --- */
    const thisYear = new Date().getFullYear();
    const yearOf = (yy) => {
      const seun = ganziName(ganziIndex(((yy - 4) % 10 + 10) % 10, ((yy - 4) % 12 + 12) % 12));
      return { ...seun, year: yy, age: yy - y };
    };
    const wanted = Number(targetYear) || thisYear;
    const seun = yearOf(wanted);
    const seunList = [];
    for (let yy = thisYear - 2; yy <= thisYear + 2; yy++) seunList.push(yearOf(yy));

    const age = seun.age;

    return {
      ok: true,
      input: { name, birth, time, hour, gender, calendar },
      thisYear,
      age,
      pillars,
      five,
      dayMaster: { stem: dayStem, element: dmElement, yin: dmYin, strength },
      yongsin: { primary: yongsin, secondary },
      relations,
      daeun,
      daeunStartAge,
      daeunDirection,
      seun,
      seunList,
      meta: {
        hasTime: hour !== null,
        prevTerm: kstParts(prevTermMs),
        nextTerm: kstParts(nextTermMs),
      },
    };
  }

  global.SajuCalc = {
    analyze,
    STEMS,
    STEMS_H,
    BRANCHES,
    BRANCHES_H,
    ANIMALS,
    ANIMAL_EMOJI,
    ELEMENTS,
    ELEMENT_KO,
    ELEMENT_HANJA,
    ELEMENT_ICON,
    STEM_ELEMENT,
    BRANCH_ELEMENT,
    GENERATES,
  };
})(window);
