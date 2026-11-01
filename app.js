/* ============================================================
   수(水)의 요정 미리 — app.js
   데이터 출처: saju-이행자-2027.json
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------------- 데이터 ---------------- */
  const SAJU = {
    birth: "1969-05-08",
    age: 2027 - 1969,
    daeun: [
      { age: 8, hanja: "庚午", ko: "경오" },
      { age: 18, hanja: "辛未", ko: "신미" },
      { age: 28, hanja: "壬申", ko: "임신" },
      { age: 38, hanja: "癸酉", ko: "계유" },
      { age: 48, hanja: "甲戌", ko: "갑술" },
      { age: 58, hanja: "乙亥", ko: "을해" },
      { age: 68, hanja: "丙子", ko: "병자" },
      { age: 78, hanja: "丁丑", ko: "정축" },
      { age: 88, hanja: "戊寅", ko: "무인" },
      { age: 98, hanja: "己卯", ko: "기묘" },
    ],
  };

  const TOPICS = {
    wealth: {
      title: "재물운 · 2027 정미년",
      text:
        "재물운은 강한 토(土) 기운을 현금흐름 규칙으로 묶을 때 좋아집니다. " +
        "충동적 확장보다 반복 가능한 저축·투자 원칙이 핵심이에요. 큰 한 방보다 작은 루틴이 돈을 지켜 줍니다.",
      tips: [
        "큰 결정보다 반복 가능한 예산 규칙을 먼저 세우세요.",
        "수입원과 지출 항목을 분리해 흐름을 눈으로 확인하세요.",
        "금(金)의 기운을 닮은 '정리'를 돈에도 적용해 보세요.",
      ],
    },
    career: {
      title: "직업운 · 2027 정미년",
      text:
        "수 일간은 책임의 중심을 잡을 때 직업운이 안정됩니다. 강한 토(土) 기운을 성과의 언어로 " +
        "바꾸는 전략이 좋아요. 묵묵히 쌓은 기록이 올해 가장 큰 무기가 됩니다.",
      tips: [
        "역할과 책임 범위를 문서로 명확히 남기세요.",
        "성과 기록과 피드백 주기를 짧게 가져가세요.",
        "새 일을 벌이기보다 지금 잘하는 일을 더 선명하게 다듬으세요.",
      ],
    },
    love: {
      title: "연애운 · 관계의 흐름",
      text:
        "물은 담는 그릇의 모양을 닮습니다. 경계가 분명할수록 관계도 편안해져요. " +
        "다가서고 싶다면 상대의 속도를 한 박자 늦춰 지켜보세요. 조용한 신뢰가 오래 갑니다.",
      tips: [
        "좋아하는 마음은 말로 한 번 더 표현해 보세요.",
        "많이 받기보다 편하게 나눌 수 있는 사람을 곁에 두세요.",
        "관계에서 지친 날은 나만의 물 같은 휴식을 먼저 챙기세요.",
      ],
    },
    health: {
      title: "건강운 · 몸의 균형",
      text:
        "토가 강한 해에는 몸이 무거워지기 쉬워요. 소화와 수분, 두 가지만 챙겨도 컨디션이 달라집니다. " +
        "무리한 목표보다 매일 같은 시간에 몸을 움직이는 편이 이롭습니다.",
      tips: [
        "물을 자주, 조금씩 나눠 마시세요.",
        "늦은 밤 무거운 식사는 다음 날 기운을 눌러요.",
        "가벼운 산책 15분이 화(火) 기운을 보태 줍니다.",
      ],
    },
  };

  const LINES = [
    "안녕! 나는 수(水) 기운을 닮은 <b>미리</b>야 🌊",
    "계(癸)는 이슬비 같은 물이래. 조용히 스며드는 힘이야!",
    "토(土) 기운이 넉넉해서 발판은 튼튼한 편이야 🌱",
    "물 한 잔 마시고 다시 볼까? 💧",
    "너의 좋은 점을 하나씩 세어 보자!",
    "오늘도 천천히, 물처럼 흘러가면 돼 ✨",
  ];

  /* ---------------- 마스코트 ---------------- */
  let lineIndex = 0;
  const speech = $("#speech");
  const miri = $("#miri");
  const stage = $("#mascotStage");

  function say(html) {
    speech.innerHTML = html;
    speech.classList.remove("pop");
    void speech.offsetWidth;
    speech.classList.add("pop");
  }

  function hearts(originEl) {
    const sr = stage.getBoundingClientRect();
    const icons = ["💧", "💗", "✨", "🫧", "⭐"];
    for (let i = 0; i < 7; i++) {
      const h = document.createElement("span");
      h.className = "heart-fx";
      h.textContent = icons[i % icons.length];
      h.style.left = 22 + Math.random() * 56 + "%";
      h.style.top = 34 + Math.random() * 34 + "%";
      h.style.setProperty("--rot", Math.round(-30 + Math.random() * 60) + "deg");
      h.style.animationDelay = (i * 45) + "ms";
      stage.appendChild(h);
      setTimeout(() => h.remove(), 1400 + i * 45);
    }
    void sr;
    void originEl;
  }

  function poke() {
    miri.classList.remove("happy");
    void miri.offsetWidth;
    miri.classList.add("happy");
    setTimeout(() => miri.classList.remove("happy"), 700);

    lineIndex = (lineIndex + 1) % LINES.length;
    say(LINES[lineIndex]);
    hearts();
  }

  stage.addEventListener("click", poke);
  $("#pokeBtn").addEventListener("click", poke);
  speech.addEventListener("click", poke);

  /* ---------------- 오행 애니메이션 ---------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        $$(".elements li").forEach((li, i) => {
          setTimeout(() => li.classList.add("in"), i * 90);
        });
        $("#mmFill").style.width = "62%";
        io.disconnect();
      }
    });
  }, { threshold: 0.25 });
  io.observe($("#elements"));

  /* ---------------- 2027 카드 일러스트 ---------------- */
  const yearCanvas = $("#yearCanvas");

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  /* 물결이 흐르는 배경 + 물 위에 뜬 발판 */
  function drawYear() {
    const ctx = yearCanvas.getContext("2d");
    const W = yearCanvas.width;
    const H = yearCanvas.height;
    ctx.clearRect(0, 0, W, H);

    /* 하늘 */
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#f4ecff");
    sky.addColorStop(0.55, "#eef6ff");
    sky.addColorStop(1, "#e4f2ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* 부드러운 원 장식 */
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(W * 0.86, H * 0.22, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.12, H * 0.18, 34, 0, Math.PI * 2);
    ctx.fill();

    /* 2027 레이블 */
    ctx.fillStyle = "#8d87a6";
    ctx.font = "700 13px Pretendard, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("2027 · 정미(丁未)", 26, 22);

    ctx.fillStyle = "#4f4890";
    ctx.font = "800 34px Pretendard, sans-serif";
    ctx.fillText("과부하 주의", 26, 42);

    ctx.fillStyle = "#a29cba";
    ctx.font = "700 14px Pretendard, sans-serif";
    ctx.fillText("토 +2 · 화 +1 이 더해지는 해", 26, 86);

    /* 물 */
    const water = ctx.createLinearGradient(0, H * 0.6, 0, H);
    water.addColorStop(0, "#bfe3ff");
    water.addColorStop(1, "#8fc4fb");
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.66);
    for (let x = 0; x <= W; x += 8) {
      ctx.lineTo(x, H * 0.66 + Math.sin(x / 34) * 7);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    /* 두 번째 물결 */
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    for (let x = 0; x <= W; x += 8) {
      ctx.lineTo(x, H * 0.78 + Math.sin(x / 26 + 1.4) * 6);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    /* 물 위에 뜬 발판 (토) */
    ctx.save();
    ctx.translate(W * 0.66, H * 0.68);
    ctx.fillStyle = "rgba(90,130,200,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 16, 86, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    const wood = ctx.createLinearGradient(0, -14, 0, 16);
    wood.addColorStop(0, "#d6a86c");
    wood.addColorStop(1, "#a9743f");
    ctx.fillStyle = wood;
    roundRect(ctx, -76, -14, 152, 30, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    roundRect(ctx, -70, -10, 140, 7, 5);
    ctx.fill();

    /* 발판 위 작은 캐릭터 */
    const body = ctx.createRadialGradient(-8, -54, 4, 0, -40, 40);
    body.addColorStop(0, "#f4fbff");
    body.addColorStop(0.45, "#bfe2ff");
    body.addColorStop(1, "#6faeef");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, -96);
    ctx.bezierCurveTo(26, -60, 36, -46, 36, -30);
    ctx.bezierCurveTo(44, -30, 46, 4, 40, -2);
    ctx.bezierCurveTo(30, 6, -30, 6, -40, -2);
    ctx.bezierCurveTo(-46, 4, -44, -30, -36, -30);
    ctx.bezierCurveTo(-36, -46, -26, -60, 0, -96);
    ctx.closePath();
    ctx.fill();

    /* 눈 */
    ctx.fillStyle = "#2f3a63";
    ctx.beginPath();
    ctx.ellipse(-13, -38, 4.4, 5.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(13, -38, 4.4, 5.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8fb1";
    ctx.beginPath();
    ctx.ellipse(-22, -28, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, -28, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a4470";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -30, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();

    /* 경고 배지 */
    ctx.save();
    ctx.translate(W * 0.2, H * 0.46);
    ctx.fillStyle = "#fff";
    roundRect(ctx, -34, -34, 92, 60, 16);
    ctx.fill();
    ctx.strokeStyle = "#ffd3c9";
    ctx.lineWidth = 2;
    roundRect(ctx, -34, -34, 92, 60, 16);
    ctx.stroke();
    ctx.fillStyle = "#ff8a6b";
    ctx.font = "800 22px Pretendard, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("⚖ 土3", -20, -26);
    ctx.fillStyle = "#b3aecb";
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.fillText("이미 단단한 바닥", -20, 2);
    ctx.restore();
  }

  /* ---------------- 주제별 패널 일러스트 ---------------- */
  const panelCanvas = $("#panelCanvas");

  const PALETTE = {
    wealth: ["#ffe7c2", "#ffd18a", "#f2b45a"],
    career: ["#e2eeff", "#bcd9ff", "#7fa8e8"],
    love: ["#ffe4f1", "#ffc2dd", "#ff8fb1"],
    health: ["#e2f8ea", "#b8ebcf", "#6fc79a"],
  };

  function drawMiriFace(ctx, x, y, s, mood) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    const g = ctx.createRadialGradient(-8, -10, 3, 0, 0, 30);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.5, "#cfe8ff");
    g.addColorStop(1, "#7fbdfa");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2f3a63";
    if (mood === "happy") {
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = "#2f3a63";
      ctx.beginPath();
      ctx.arc(-9, -2, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9, -2, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(-9, 0, 3.6, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(9, 0, 3.6, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,143,177,0.55)";
    ctx.beginPath();
    ctx.ellipse(-15, 8, 5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, 8, 5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3a4470";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 7, 3.6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function coin(ctx, x, y, r) {
    const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    g.addColorStop(0, "#ffe9a8");
    g.addColorStop(1, "#e6b23f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(170,120,20,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.66, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawPanel(key) {
    const ctx = panelCanvas.getContext("2d");
    const W = panelCanvas.width;
    const H = panelCanvas.height;
    const [c1, c2] = PALETTE[key];
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fdfcff");
    bg.addColorStop(1, c1);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(W * 0.9, H * 0.18, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.78, H * 0.86, 46, 0, Math.PI * 2);
    ctx.fill();

    if (key === "wealth") {
      /* 자라나는 동전 더미 */
      const baseY = H * 0.8;
      for (let i = 0; i < 5; i++) {
        const x = W * 0.2 + i * 26;
        ctx.fillStyle = c2;
        roundRect(ctx, x - 16, baseY - i * 16 - 14, 32, 14, 6);
        ctx.fill();
      }
      coin(ctx, W * 0.62, H * 0.48, 30);
      coin(ctx, W * 0.74, H * 0.66, 22);
      /* 돈주머니 줄 */
      ctx.strokeStyle = "#c98f2a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W * 0.2, baseY - 90);
      ctx.bezierCurveTo(W * 0.3, H * 0.3, W * 0.5, H * 0.34, W * 0.58, H * 0.44);
      ctx.stroke();
      drawMiriFace(ctx, W * 0.2, baseY - 118, 1.05, "happy");
      ctx.fillStyle = "#b07bc8";
      ctx.font = "800 15px Pretendard, sans-serif";
      ctx.fillText("규칙이 돈을 지켜요", W * 0.4, H * 0.16);
    } else if (key === "career") {
      /* 계단 + 깃발 */
      const baseY = H * 0.82;
      const steps = 4;
      for (let i = 0; i < steps; i++) {
        const w = 52;
        const h = 26 + i * 20;
        const x = W * 0.14 + i * (w - 6);
        const g = ctx.createLinearGradient(0, baseY - h, 0, baseY);
        g.addColorStop(0, "#dbe8ff");
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        roundRect(ctx, x, baseY - h, w, h, 9);
        ctx.fill();
      }
      const topX = W * 0.14 + (steps - 1) * 46;
      ctx.strokeStyle = "#7c7695";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(topX + 20, baseY - 86);
      ctx.lineTo(topX + 20, baseY - 150);
      ctx.stroke();
      ctx.fillStyle = "#8b86ff";
      ctx.beginPath();
      ctx.moveTo(topX + 21, baseY - 150);
      ctx.lineTo(topX + 62, baseY - 138);
      ctx.lineTo(topX + 21, baseY - 126);
      ctx.closePath();
      ctx.fill();
      drawMiriFace(ctx, W * 0.68, H * 0.5, 1.2, "happy");
      ctx.fillStyle = "#4f7fd0";
      ctx.font = "800 15px Pretendard, sans-serif";
      ctx.fillText("기록이 계단이 돼요", W * 0.46, H * 0.15);
    } else if (key === "love") {
      /* 두 개의 물방울이 마주보기 */
      ctx.save();
      ctx.globalAlpha = 0.9;
      drawMiriFace(ctx, W * 0.38, H * 0.52, 1.35, "happy");
      drawMiriFace(ctx, W * 0.62, H * 0.46, 1.05, "happy");
      ctx.restore();
      /* 하트 */
      ctx.fillStyle = c2;
      ctx.beginPath();
      const hx = W * 0.5;
      const hy = H * 0.28;
      ctx.moveTo(hx, hy + 12);
      ctx.bezierCurveTo(hx - 20, hy - 4, hx - 4, hy - 18, hx, hy - 4);
      ctx.bezierCurveTo(hx + 4, hy - 18, hx + 20, hy - 4, hx, hy + 12);
      ctx.fill();
      /* 연결선 */
      ctx.strokeStyle = "rgba(255,143,177,0.8)";
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.44, H * 0.56);
      ctx.quadraticCurveTo(W * 0.5, H * 0.62, W * 0.56, H * 0.52);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#c0629a";
      ctx.font = "800 15px Pretendard, sans-serif";
      ctx.fillText("경계가 편안함을 만들어요", W * 0.3, H * 0.16);
    } else {
      /* 잎사귀와 물방울 */
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.ellipse(W * 0.22, H * 0.62, 46, 22, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,130,90,0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.16, H * 0.72);
      ctx.lineTo(W * 0.3, H * 0.52);
      ctx.stroke();

      /* 물방울 */
      ctx.fillStyle = "rgba(120,190,255,0.85)";
      ctx.beginPath();
      const dx = W * 0.56;
      const dy = H * 0.5;
      ctx.moveTo(dx, dy - 44);
      ctx.bezierCurveTo(dx + 24, dy - 8, dx + 26, dy + 24, dx, dy + 26);
      ctx.bezierCurveTo(dx - 26, dy + 24, dx - 24, dy - 8, dx, dy - 44);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.ellipse(dx - 7, dy, 5, 8, -0.4, 0, Math.PI * 2);
      ctx.fill();

      drawMiriFace(ctx, W * 0.8, H * 0.42, 0.95, "happy");
      ctx.fillStyle = "#3f8a63";
      ctx.font = "800 15px Pretendard, sans-serif";
      ctx.fillText("물과 산책이 균형을 잡아요", W * 0.26, H * 0.16);
    }
  }

  /* ---------------- 탭 ---------------- */
  const panel = $("#panel");

  function renderTopic(key) {
    const t = TOPICS[key] || TOPICS.wealth;
    $("#panelTitle").textContent = t.title;
    $("#panelText").textContent = t.text;
    const ul = $("#panelTips");
    ul.innerHTML = "";
    t.tips.forEach((tip) => {
      const li = document.createElement("li");
      li.textContent = tip;
      ul.appendChild(li);
    });
    panelCanvas.setAttribute("aria-label", t.title + " 설명 이미지");
    drawPanel(key);
    panel.style.animation = "none";
    void panel.offsetWidth;
    panel.style.animation = "";
    say(`<b>${t.title.split(" ")[0]}</b>도 한번 살펴볼까? 👀`);
  }

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => {
        t.classList.remove("is-on");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-on");
      tab.setAttribute("aria-selected", "true");
      renderTopic(tab.dataset.tab);
    });
  });

  /* ---------------- 대운 ---------------- */
  function renderDaeun() {
    const ol = $("#daeun");
    ol.innerHTML = "";
    let nowIdx = 0;
    SAJU.daeun.forEach((d, i) => {
      if (SAJU.age >= d.age) nowIdx = i;
    });
    SAJU.daeun.forEach((d, i) => {
      const li = document.createElement("li");
      if (i === nowIdx) li.classList.add("now");
      li.innerHTML =
        `<span class="d-age">${d.age}세</span>` +
        `<span class="d-hanja">${d.hanja}</span>` +
        `<span class="d-ko">${d.ko}</span>`;
      ol.appendChild(li);
    });
  }

  /* ---------------- 시작 ---------------- */
  renderDaeun();
  renderTopic("wealth");
  drawYear();
})();
