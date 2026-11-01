/* ============================================================
   app.js — 입력 / 화면 표시 / 쉬운 설명
   계산은 saju.js (SajuCalc)가 담당해요.
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const S = window.SajuCalc;

  const EL_KO = S.ELEMENT_KO;
  const EL_HJ = S.ELEMENT_HANJA;
  const EL_ICON = S.ELEMENT_ICON;
  const EL_NAME = { wood: "나무", fire: "불", earth: "흙", metal: "쇠", water: "물" };
  const EL_DESC = {
    wood: "자라고 뻗는 힘",
    fire: "표현하고 뜨거워지는 힘",
    earth: "담아 두고 지키는 힘",
    metal: "정리하고 단단해지는 힘",
    water: "흐르고 스며드는 힘",
  };

  /* 일간(태어난 날의 윗글자) 성격 */
  const DAY_MASTER = {
    갑: ["큰 나무", "곧고 올바르게 자라며 앞장서서 방향을 정하는 사람이에요. 규칙과 원칙을 소중히 여겨요."],
    을: ["풀과 덩굴", "부드럽게 휘어지며 뿌리내리는 힘이 있어요. 눈치가 빠르고 사람들과 잘 어울려요."],
    병: ["태양", "밝고 시원시원하며 숨기지 않는 사람이에요. 어디서든 분위기를 살리는 힘이 있어요."],
    정: ["촛불", "따뜻하고 섬세하며 한 사람을 오래 비추는 사람이에요. 마음이 정갈해요."],
    무: ["큰 산", "든든하고 한번 마음먹으면 밀고 나가요. 주변에서 믿고 기대는 존재예요."],
    기: ["기름진 밭", "남을 돌보고 실속을 챙기는 사람이에요. 현실적이고 믿음직해요."],
    경: ["무쇠와 칼", "결단이 빠르고 의리가 있어요. 맺고 끊는 게 분명해요."],
    신: ["보석", "감각이 섬세하고 세련됐어요. 자기 기준이 높고 깔끔한 편이에요."],
    임: ["큰 바다", "생각이 넓고 포용력이 있어요. 흐름을 읽는 감각이 뛰어나요."],
    계: ["이슬비와 샘물", "조용히 스며들어 사람 마음을 읽어요. 부드러워 보이지만 속은 단단해요."],
  };

  const STRENGTH_TEXT = {
    strong: "기운이 든든한 편",
    balanced: "기운이 균형 잡힌 편",
    weak: "기운이 여린 편",
  };

  /* ---------------- 유틸 ---------------- */
  function node(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  const animal = (b) => `${S.ANIMAL_EMOJI[b]} ${S.ANIMALS[b]}`;
  const fmtDate = (iso) => (iso ? iso.split("-").join(".") : "");

  /* ---------------- 마스코트 ---------------- */
  const LINES_BASE = [
    "안녕! 나는 수(水) 기운을 닮은 <b>미리</b>야 🌊",
    "사주는 운명을 정하는 게 아니라, 내 성향을 읽는 지도 같은 거야!",
    "어려운 말은 내가 쉽게 풀어 줄게. 걱정 마 ✨",
    "물 한 잔 마시고 천천히 볼까? 💧",
    "태어난 시간을 몰라도 대부분은 알 수 있어!",
  ];
  let lineIndex = 0;
  const speech = $("#speech");
  const miri = $("#miri");
  const stage = $("#mascotStage");
  let current = null;
  let tabKey = "wealth";

  function say(html) {
    speech.innerHTML = html;
    speech.classList.remove("pop");
    void speech.offsetWidth;
    speech.classList.add("pop");
  }

  function hearts() {
    const icons = ["💧", "💗", "✨", "🫧", "⭐"];
    for (let i = 0; i < 7; i++) {
      const h = node("span", "heart-fx", icons[i % icons.length]);
      h.style.left = 22 + Math.random() * 56 + "%";
      h.style.top = 34 + Math.random() * 34 + "%";
      h.style.setProperty("--rot", Math.round(-30 + Math.random() * 60) + "deg");
      h.style.animationDelay = i * 45 + "ms";
      stage.appendChild(h);
      setTimeout(() => h.remove(), 1400 + i * 45);
    }
  }

  function poke() {
    miri.classList.remove("happy");
    void miri.offsetWidth;
    miri.classList.add("happy");
    setTimeout(() => miri.classList.remove("happy"), 700);
    const pool = current ? current.lines : LINES_BASE;
    lineIndex = (lineIndex + 1) % pool.length;
    say(pool[lineIndex]);
    hearts();
  }

  stage.addEventListener("click", poke);
  $("#pokeBtn").addEventListener("click", poke);
  speech.addEventListener("click", poke);

  /* ---------------- 입력 폼 ---------------- */
  const form = $("#sajuForm");
  const formErr = $("#formErr");
  const resultEl = $("#result");
  const THIS_YEAR = new Date().getFullYear();
  const YEAR_MIN = THIS_YEAR - 90;
  const YEAR_MAX = THIS_YEAR + 90;
  const yearSelect = $("#fYear");

  /* 연도 선택지 채우기 (1960 ~ 2100 등 실제 범위) */
  (function fillYears() {
    for (let yy = YEAR_MIN; yy <= YEAR_MAX; yy++) {
      const opt = document.createElement("option");
      opt.value = String(yy);
      opt.textContent = `${yy}년${yy === THIS_YEAR ? " (올해)" : ""}`;
      yearSelect.appendChild(opt);
    }
    yearSelect.value = String(THIS_YEAR);
  })();

  function currentYear() {
    return Number(yearSelect.value) || THIS_YEAR;
  }

  function setYear(yy) {
    const v = Math.max(YEAR_MIN, Math.min(YEAR_MAX, yy));
    yearSelect.value = String(v);
    syncYearChips();
  }

  function syncYearChips() {
    const chips = $("#yearChips");
    chips.innerHTML = "";
    const y = currentYear();
    [
      [THIS_YEAR, "올해"],
      [THIS_YEAR + 1, "내년"],
      [THIS_YEAR - 1, "작년"],
    ].forEach(([yy, label]) => {
      const b = node("button", "ychip" + (yy === y ? " is-on" : ""), `${label} ${yy}`);
      b.type = "button";
      b.addEventListener("click", () => setYear(yy));
      chips.appendChild(b);
    });
  }

  yearSelect.addEventListener("change", syncYearChips);
  $("#yearPrev").addEventListener("click", () => setYear(currentYear() - 1));
  $("#yearNext").addEventListener("click", () => setYear(currentYear() + 1));
  /* 결과 카드에서 이웃 연도로 이동 */
  function shiftYear(delta) {
    const yy = (current ? current.seun.year : currentYear()) + delta;
    if (current) changeYear(yy);
    else setYear(yy);
  }

  /* 결과 카드의 이전/다음 연도 버튼 */
  $("#rYearPrev").addEventListener("click", () => shiftYear(-1));
  $("#rYearNext").addEventListener("click", () => shiftYear(1));

  syncYearChips();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const birth = String(fd.get("birth") || "").trim();
    const time = String(fd.get("time") || "").trim();

    if (!birth) {
      showError("생년월일을 입력해 주세요.");
      return;
    }
    const year = Number(birth.slice(0, 4));
    if (year < 1900 || year > 2100) {
      showError("1900년 ~ 2100년 사이의 생일만 계산할 수 있어요.");
      return;
    }
    const targetYear = Number(fd.get("targetYear")) || THIS_YEAR;
    if (targetYear < year) {
      showError("태어난 해보다 앞선 해의 운세는 볼 수 없어요.");
      return;
    }
    formErr.hidden = true;

    const data = {
      name: String(fd.get("name") || "").trim(),
      birth,
      time: time || null,
      calendar: String(fd.get("calendar") || "solar"),
      gender: String(fd.get("gender") || "female"),
      targetYear,
    };

    const res = S.analyze(data);
    if (!res.ok) {
      showError(
        "음력 생일은 자동으로 바꿀 수 없어요. 검증된 만세력에서 양력으로 바꾼 뒤 " +
        "'양력'을 선택해 다시 넣어 주세요. (음력·윤달은 사람마다 달라서요!)"
      );
      return;
    }

    render(res);
    resultEl.hidden = false;
    $(".form-card").classList.add("is-done");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
    say(`<b>${res.input.name || "너"}</b>의 사주를 펼쳐 봤어! 아래로 내려가 볼까? 🔍`);
    setHeroChips(res);
  });

  function showError(msg) {
    formErr.textContent = "⚠️ " + msg;
    formErr.hidden = false;
  }

  $("#editBtn").addEventListener("click", () => {
    $(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("#fName").focus({ preventScroll: true }), 400);
  });

  $("#shareBtn").addEventListener("click", async () => {
    if (!current) return;
    const txt = [
      `🌊 ${current.input.name || "나"}의 사주 요약`,
      current.summaryTitle,
      current.summaryLine,
      `일간: ${current.dayLabel}`,
      "",
      "미리의 사주 캐릭터북에서 봤어요 💧",
    ].join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "내 사주 요약", text: txt });
        say("요약을 공유했어! 📤");
      } else {
        await navigator.clipboard.writeText(txt);
        say("요약을 복사했어! 어디든 붙여 넣어 봐 📋");
      }
    } catch (_) {
      say("공유가 안 됐어. 조금 있다가 다시 해 볼까?");
    }
  });

  function setHeroChips(res) {
    const chips = $("#heroChips");
    chips.innerHTML = "";
    [
      `🎂 ${fmtDate(res.input.birth)}`,
      res.meta.hasTime ? `⏰ ${res.input.time}` : "🙈 시간 모름",
      res.input.gender === "male" ? "👤 남성" : "👤 여성",
      `💧 ${S.STEMS[res.pillars.day.stem]} 일간`,
    ].forEach((t) => chips.appendChild(node("span", "chip", t)));
    $("#heroSub").textContent = `${res.input.name || "당신"}님의 사주를 미리가 풀어 봤어`;
  }

  /* ---------------- 결과 그리기 ---------------- */
  function render(res) {
    current = res;
    res.summaryTitle = res.input.name ? `${res.input.name}님의 사주` : "나의 사주";
    renderSummary(res);
    renderPillars(res);
    renderElements(res);
    renderYear(res);
    renderTopic(tabKey);
    renderDaeun(res);
    renderAdvice(res);
  }

  function renderSummary(res) {
    const dm = res.dayMaster;
    const stemKo = S.STEMS[res.pillars.day.stem];
    const dmInfo = DAY_MASTER[stemKo];
    const strong = S.ELEMENTS.slice().sort((a, b) => res.five[b] - res.five[a])[0];
    const weak = S.ELEMENTS.slice().sort((a, b) => res.five[a] - res.five[b])[0];
    const ys = res.yongsin.primary;

    res.dayLabel = `${stemKo}(${EL_HJ[dm.element]}) · ${dmInfo[0]} · ${STRENGTH_TEXT[dm.strength]}`;
    res.lines = [
      `네 일간은 <b>${stemKo}</b>, ${dmInfo[0]} 같아 ${EL_ICON[dm.element]}`,
      `${STRENGTH_TEXT[dm.strength]}이야!`,
      `채워 주면 좋은 기운은 <b>${EL_NAME[ys]}</b>이야 💡`,
      "아래에서 하나씩 같이 볼까? 👇",
      ...LINES_BASE.slice(1),
    ];

    $("#resultTitle").textContent = res.summaryTitle;
    $("#resultSub").textContent =
      `${fmtDate(res.input.birth)} · ${res.meta.hasTime ? res.input.time : "태어난 시간 모름"} 기준`;

    res.summaryLine =
      `내 중심(일간)은 ${stemKo}(${EL_HJ[dm.element]}) — ${dmInfo[0]} 같은 사람이에요. ` +
      `${EL_NAME[strong]} 기운이 가장 많고 ${EL_NAME[weak]} 기운이 가장 적어서, ` +
      `${EL_NAME[ys]} 기운을 생활에서 채워 주면 마음이 편해져요.`;
    $("#summaryLine").textContent = res.summaryLine;

    const facts = $("#quickFacts");
    facts.innerHTML = "";
    [
      ["나를 뜻하는 글자", `${stemKo}(${EL_HJ[dm.element]}) · ${dmInfo[0]}`, dm.element],
      ["기운의 세기", STRENGTH_TEXT[dm.strength], dm.element],
      ["가장 강한 기운", `${EL_ICON[strong]} ${EL_NAME[strong]}`, strong],
      ["채워 줄 기운", `${EL_ICON[ys]} ${EL_NAME[ys]}`, ys],
      [
        "보고 있는 해",
        `${res.seun.year} ${res.seun.ko}${res.seun.year === res.thisYear ? " (올해)" : ""}`,
        S.BRANCH_ELEMENT[res.seun.branch],
      ],
    ].forEach(([k, v, e]) => {
      facts.appendChild(node("div", `fact f-${e}`, `<span>${k}</span><b>${v}</b>`));
    });
  }

  /* ---------------- 1. 사주팔자 ---------------- */
  function renderPillars(res) {
    const box = $("#pillars");
    box.innerHTML = "";
    const defs = [
      { key: "year", tag: "년주 · 해", desc: "어릴 적 환경과 뿌리" },
      { key: "month", tag: "월주 · 달", desc: "청년기, 사회 활동의 바탕" },
      { key: "day", tag: "일주 · 나", desc: "'나'가 어떤 사람인지" },
      { key: "hour", tag: "시주 · 시", desc: "뒷심과 미래의 흐름" },
    ];

    defs.forEach((d) => {
      const p = res.pillars[d.key];
      const art = node("article", "pillar" + (d.key === "day" ? " is-me" : "") + (p ? "" : " empty"));
      art.appendChild(node("span", "p-tag", d.tag));
      if (p) {
        art.appendChild(node("span", "p-hanja", p.hanja));
        art.appendChild(node("span", "p-ko", p.ko));
        art.appendChild(
          node("span", "p-el",
            `${EL_ICON[S.STEM_ELEMENT[p.stem]]}${EL_KO[S.STEM_ELEMENT[p.stem]]} · ` +
            `${EL_ICON[S.BRANCH_ELEMENT[p.branch]]}${EL_KO[S.BRANCH_ELEMENT[p.branch]]}`)
        );
        art.appendChild(node("span", "p-animal", animal(p.branch)));
        if (d.key === "day") art.appendChild(node("span", "p-me", "이게 바로 '나'"));
      } else {
        art.appendChild(node("span", "p-hanja", "? ?"));
        art.appendChild(node("span", "p-ko", "알 수 없음"));
        art.appendChild(node("span", "p-el", "⏰ 시간을 몰라서"));
        art.appendChild(node("span", "p-animal", "비어 있어요"));
      }
      art.title = d.desc;
      box.appendChild(art);
    });

    const dm = res.dayMaster;
    const stemKo = S.STEMS[res.pillars.day.stem];
    const [nick, text] = DAY_MASTER[stemKo];
    const r = res.relations;

    let relText = "네 기둥의 동물들 사이에 특별한 충돌이나 결합은 적은 편이에요.";
    if (r["충"] >= 2) {
      relText = "동물들 사이에 '충(부딪힘)'이 여러 개 있어요. 변화가 잦을 수 있지만 그만큼 적응력이 좋아요.";
    } else if (r["충"] === 1) {
      relText = "'충(부딪힘)'이 하나 있어요. 한 분야에서 움직임이 생길 수 있는 사주예요.";
    }
    if (r["합"] >= 2) {
      relText += " 반대로 '합(어울림)'이 많아서 사람을 통해 기회가 오는 편이에요.";
    }

    const help = $("#pillarHelp");
    help.innerHTML = "";
    help.appendChild(
      node("div", "help-block",
        `<b>👤 내가 어떤 사람인가요?</b>
         <p>일주 <b>${res.pillars.day.ko}</b>의 윗글자 <b>${stemKo}(${EL_HJ[dm.element]})</b>는
         "${nick}"에 비유돼요. ${text}</p>`)
    );
    help.appendChild(
      node("div", "help-block",
        `<b>🔗 글자끼리 사이좋은가요?</b><p>${relText}</p>`)
    );
    if (!res.meta.hasTime) {
      help.appendChild(
        node("div", "help-block warn",
          `<b>⏰ 시간을 몰라서요</b>
           <p>네 번째 칸(시주)은 비워 둘게요. 나머지 세 칸만으로도 성격과 기운은 충분히 알 수 있어요.</p>`)
      );
    }
  }

  /* ---------------- 2. 오행 ---------------- */
  function renderElements(res) {
    const ul = $("#elements");
    ul.innerHTML = "";
    const total = S.ELEMENTS.reduce((s, e) => s + res.five[e], 0) || 1;
    const max = Math.max(...S.ELEMENTS.map((e) => res.five[e]));

    S.ELEMENTS.forEach((e) => {
      const n = res.five[e];
      const pct = Math.round((n / total) * 100);
      const li = node("li");
      li.dataset.el = e;
      let tagText = "";
      let tagCls = "ghost";
      if (e === res.yongsin.primary) { tagText = "채워 주세요"; tagCls = "weak"; }
      else if (n === 0) { tagText = "없음"; tagCls = "weak"; }
      else if (n === max) { tagText = "가장 많음"; tagCls = "strong"; }
      else if (e === res.dayMaster.element) { tagText = "나"; tagCls = ""; }

      li.innerHTML =
        `<span class="e-ico">${EL_ICON[e]}</span>
         <div class="e-body">
           <div class="e-top">
             <span class="e-name">${EL_NAME[e]}(${EL_HJ[e]})<em>${EL_DESC[e]}</em></span>
             <b>${n}개</b>
           </div>
           <div class="e-bar"><i style="--w:${Math.max(6, pct)}%"></i></div>
         </div>
         <span class="e-tag ${tagCls}">${tagText || "·"}</span>`;
      ul.appendChild(li);
    });

    requestAnimationFrame(() => {
      $$("#elements li").forEach((li, i) => setTimeout(() => li.classList.add("in"), i * 80));
    });

    const strong = S.ELEMENTS.slice().sort((a, b) => res.five[b] - res.five[a])[0];
    const weak = S.ELEMENTS.slice().sort((a, b) => res.five[a] - res.five[b])[0];
    const ys = res.yongsin.primary;
    const TIP = {
      wood: "식물 키우기, 공원 산책처럼 '자라나는 것'과 함께하면 좋아요.",
      fire: "햇볕 쬐기, 밝은 조명, 따뜻한 사람과의 대화가 도움이 돼요.",
      earth: "규칙적인 식사와 수면처럼 '생활의 바탕'을 다지는 게 좋아요.",
      metal: "정리정돈, 단단한 계획, 깔끔한 물건이 도움이 돼요.",
      water: "물을 자주 마시고, 조용히 쉬는 시간을 남겨 두세요.",
    };

    $("#yongsin").innerHTML =
      `<span class="y-ico">🧭</span>
       <div>
         <strong>채워 주면 좋은 기운(용신) · ${EL_NAME[ys]}(${EL_HJ[ys]})</strong>
         <p><b>용신</b>은 사주에서 "모자라서 채워 주면 좋은 기운"이에요.
         지금은 <b>${EL_NAME[strong]}</b> 기운이 많고 <b>${EL_NAME[weak]}</b> 기운이 적어서,
         <b>${EL_NAME[ys]}</b> 기운을 일상에서 더하면 균형이 잡혀요. ${TIP[ys]}</p>
         <p class="y-sub">다음으로 채우면 좋은 기운은 ${EL_NAME[res.yongsin.secondary]}(${EL_HJ[res.yongsin.secondary]})이에요.</p>
       </div>`;
  }

  /* ---------------- 3. 연도별 운세 ---------------- */
  function renderYear(res) {
    const seun = res.seun;
    const sEl = S.STEM_ELEMENT[seun.stem];
    const bEl = S.BRANCH_ELEMENT[seun.branch];
    const heavy = res.five[bEl] >= 3 || res.five[sEl] >= 3;
    const dm = res.dayMaster.element;
    const isThis = seun.year === res.thisYear;
    const yLabel = isThis ? "올해" : `${seun.year}년`;

    $("#yearTitle").textContent = `${seun.year}년 운세 (${seun.ko}년)`;
    $("#yearSub").textContent =
      `${seun.year}년에는 ${S.STEMS_H[seun.stem]}(${EL_KO[sEl]}) · ${S.BRANCHES_H[seun.branch]}(${EL_KO[bEl]}) 기운이 들어와요`;

    renderYearTabs(res);

    const d = res.daeun.filter((x) => res.age >= x.age).pop() || res.daeun[0];
    $("#yearGuide").innerHTML =
      seun.age < 0
        ? "태어난 해보다 앞선 해라 운세를 볼 수 없어요."
        : `${seun.year}년은 <b>${res.age}세</b>, 대운으로는 <b>${d.ko}</b> 시즌이에요. ` +
          `${isThis ? "지금의 흐름" : "그 시즌 안에서"} 이 해만의 기운을 더해 봤어요.`;

    $("#yearBadge").innerHTML =
      `<span class="y-y">${seun.year}</span>
       <span class="y-hanja">${seun.hanja}</span>
       <span class="y-ko">${seun.ko}</span>
       <span class="y-el">${EL_ICON[sEl]}${EL_KO[sEl]} · ${EL_ICON[bEl]}${EL_KO[bEl]}</span>`;

    let summary;
    if (heavy) {
      summary =
        `${yLabel}은 <b>${EL_NAME[bEl]}</b> 기운이 크게 들어와요. 내 사주에 이미 ${EL_NAME[bEl]}가 ${res.five[bEl]}개 있어서 ` +
        `무게가 더 늘어나는 해예요. 의욕은 좋지만 <b>몸과 마음이 무거워지기 쉬우니</b>, 될 일만 골라서 하는 게 좋아요. ` +
        `일정을 줄이고 쉬는 시간을 미리 정해 두면 훨씬 편합니다.`;
    } else if (sEl === dm || bEl === dm) {
      summary =
        `${yLabel}은 <b>${EL_NAME[dm]}</b> 기운이 들어오는 해예요. 내 중심과 같은 기운이라 ` +
        `<b>나를 돌보기 좋은 한 해</b>입니다. 남의 일보다 내 건강·공부·관계를 정리하기에 좋아요.`;
    } else {
      summary =
        `${yLabel}은 <b>${EL_NAME[sEl]}</b>과 <b>${EL_NAME[bEl]}</b> 기운이 들어와요. 내 사주의 ${EL_NAME[dm]} 기운과 큰 충돌 없이 ` +
        `<b>차분히 흐르는 해</b>예요. 새로운 일보다 하던 일을 마무리하고 정돈하기에 좋습니다.`;
    }
    $("#yearSummary").innerHTML = summary;

    const fillRatio = (res.five[res.yongsin.primary] + res.five[res.yongsin.secondary]) / 6;
    const gauge = Math.round(42 + Math.min(1, fillRatio) * 40 + (heavy ? -4 : 6));
    $("#gaugeLabel").textContent = `${yLabel} ${EL_NAME[dm]} 기운의 편안한 정도`;
    $("#gaugeValue").textContent = gauge;
    const fill = $("#gaugeFill");
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      fill.style.width = Math.max(8, Math.min(95, gauge)) + "%";
    });

    drawYear(res, { sEl, bEl, heavy, seun });
  }

  /* 결과 카드 안의 연도 탭 */
  function renderYearTabs(res) {
    const wrap = $("#yearTabs");
    const list = res.seunList.map((s) => s.year);
    if (!list.includes(res.seun.year)) list.push(res.seun.year);
    list.sort((a, b) => a - b);

    const sig = list.join(",");
    if (wrap.dataset.sig !== sig) {
      /* 목록이 바뀔 때만 다시 만든다 (이벤트 중복 등록 방지) */
      wrap.innerHTML = "";
      list.forEach((yy) => {
        const b = node("button", "ytab", String(yy));
        b.type = "button";
        b.setAttribute("role", "tab");
        b.dataset.year = String(yy);
        b.addEventListener("click", () => changeYear(Number(b.dataset.year)));
        wrap.appendChild(b);
      });
      wrap.dataset.sig = sig;
    }

    Array.from(wrap.children).forEach((b) => {
      const on = Number(b.dataset.year) === res.seun.year;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", String(on));
      b.setAttribute("aria-label", `${b.dataset.year}년 운세`);
      b.tabIndex = on ? 0 : -1;
    });
  }

  /* 연도를 바꾸면 같은 입력으로 다시 계산 */
  function changeYear(yy) {
    if (!current) return;
    const data = Object.assign({}, current.input, { targetYear: yy });
    const next = S.analyze(data);
    if (!next.ok) return;
    next.summaryTitle = current.summaryTitle;
    current = next;
    renderSummary(next);
    renderYear(next);
    renderDaeun(next);
    renderAdvice(next);
    setYear(yy);
    say(`${yy}년은 <b>${next.seun.ko}</b> 해야! 기운이 어떻게 들어오는지 봤어? 🔍`);
  }

  /* ---------------- 4. 주제별 운세 ---------------- */
  const TOPIC_TEXT = {
    wealth: (r) => ({
      title: "재물운 · 돈의 흐름",
      text:
        `${EL_NAME[r.dayMaster.element]} 기운이 중심인 사주라, 돈도 "물처럼 흐르게" 두면 좋아요. ` +
        `부족한 <b>${EL_NAME[r.yongsin.primary]}</b> 기운을 돈 관리에 연결해 보세요. ` +
        `큰 한 방보다 <b>매달 반복되는 작은 규칙</b>이 돈을 지켜 줍니다.`,
      tips: [
        "월급날 바로 떼어 두는 '자동 저축' 금액을 정해 보세요.",
        "쓰는 돈과 모으는 돈을 통장부터 분리하면 흐름이 눈에 보여요.",
        "돈이 새는 곳은 대개 '충동'이에요. 사고 싶으면 하루만 미뤄 보세요.",
      ],
      scene: "wealth",
    }),
    career: (r) => ({
      title: "직업운 · 일의 흐름",
      text:
        `내 중심 글자는 "${DAY_MASTER[S.STEMS[r.pillars.day.stem]][0]}" 같아요. ` +
        `그래서 맡은 일을 조용히 끝까지 해내는 힘이 강점이에요. ` +
        `다만 그 강점이 티가 나기 어려워요. <b>한 일을 기록으로 남기는 것</b>이 직업운의 열쇠입니다.`,
      tips: [
        "한 일을 짧게라도 매주 기록하세요. 성과가 보이면 평가가 달라져요.",
        "맡는 역할의 경계를 미리 말해 두면 불필요한 일을 줄일 수 있어요.",
        "새 일을 벌이기보다 잘하는 일을 더 선명하게 다듬는 편이 유리해요.",
      ],
      scene: "career",
    }),
    love: (r) => ({
      title: "연애운 · 사람 사이",
      text:
        `물은 담는 그릇 모양을 닮아요. 그래서 사람에게 잘 맞춰 주는 편이지만, ` +
        `그만큼 내 마음을 표현하는 걸 잊기 쉬워요. ` +
        `좋아하는 마음은 <b>말로 한 번 더</b> 해 주세요. 경계가 분명할수록 관계도 편안해집니다.`,
      tips: [
        "서운한 마음은 쌓아 두지 말고 그때 바로 꺼내 보세요.",
        "상대 속도가 다르면 조금 늦춰 지켜보는 것도 방법이에요.",
        "관계에서 지친 날은 나만의 휴식을 먼저 챙기세요.",
      ],
      scene: "love",
    }),
    health: (r) => ({
      title: "건강운 · 몸의 균형",
      text:
        `부족한 건 ${EL_NAME[r.yongsin.primary]} 기운이에요. ` +
        ({
          water: "그래서 수분이 모자라기 쉬워요. 물을 나눠 마시는 게 가장 쉬운 관리예요.",
          fire: "그래서 몸이 차가워지기 쉬워요. 따뜻한 음식과 햇볕이 좋아요.",
          earth: "그래서 식사와 생활 리듬이 흐트러지기 쉬워요. 같은 시간에 밥 먹고 자는 게 약이에요.",
          metal: "그래서 호흡과 정리가 필요해요. 환기와 가벼운 정리가 몸을 가볍게 해요.",
          wood: "그래서 움직임이 부족해지기 쉬워요. 짧은 산책이 기운을 틔워 줘요.",
        })[r.yongsin.primary] +
        ` 잠들기 전 <b>${EL_NAME[r.yongsin.primary]}</b>을 떠올리는 작은 루틴도 도움이 됩니다.`,
      tips: [
        "물은 하루에 여러 번, 조금씩 마시는 게 좋아요.",
        "늦은 밤 무거운 식사는 다음 날 컨디션을 눌러요.",
        "15분 산책처럼 '계속할 수 있는' 운동을 고르세요.",
      ],
      scene: "health",
    }),
  };

  function renderTopic(key) {
    if (!current) return;
    tabKey = key;
    const t = TOPIC_TEXT[key](current);
    $("#panelTitle").textContent = t.title;
    $("#panelText").innerHTML = t.text;
    const ul = $("#panelTips");
    ul.innerHTML = "";
    t.tips.forEach((tip) => ul.appendChild(node("li", "", tip)));
    drawPanel(key, t.scene);
    const panel = $("#panel");
    panel.style.animation = "none";
    void panel.offsetWidth;
    panel.style.animation = "";
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
      say(`<b>${tab.querySelector("span:last-child").textContent}</b>도 같이 볼까? 👀`);
    });
  });

  /* ---------------- 5. 대운 ---------------- */
  function renderDaeun(res) {
    const ol = $("#daeun");
    ol.innerHTML = "";
    const age = res.age;
    let nowIdx = 0;
    res.daeun.forEach((d, i) => {
      if (age >= d.age) nowIdx = i;
    });

    res.daeun.slice(0, 8).forEach((d, i) => {
      const li = node("li", i === nowIdx ? "now" : "");
      li.innerHTML =
        `<span class="d-age">${d.age}세~</span>
         <span class="d-hanja">${d.hanja}</span>
         <span class="d-ko">${d.ko}</span>`;
      ol.appendChild(li);
    });

    const now = res.daeun[nowIdx];
    $("#daeunNote").innerHTML =
      `지금 ${age}세는 <b>${now.ko}</b> 시즌이에요. 대운은 ${res.daeunStartAge}세부터 ` +
      `${res.daeunDirection === "순행" ? "앞으로" : "뒤로"} 흐르며 10년마다 바뀝니다. ` +
      `시작 나이는 절기 날짜로 계산한 근사값이라 ±1년 정도 여유를 두고 보세요.`;
  }

  /* ---------------- 6. 조언 ---------------- */
  function renderAdvice(res) {
    const dm = res.dayMaster.element;
    const ys = res.yongsin.primary;
    const strong = S.ELEMENTS.slice().sort((a, b) => res.five[b] - res.five[a])[0];
    const ITEMS = {
      wood: ["🌳", "산책하기", "나무가 많은 곳을 15분 걷는 것만으로 기운이 돌아와요."],
      fire: ["🔥", "햇볕 쬐기", "낮에 볕을 쬐면 마음까지 밝아져요."],
      earth: ["⛰️", "생활 리듬", "같은 시간에 자고 먹는 것이 가장 튼튼한 바탕이 돼요."],
      metal: ["⚙️", "정리하기", "서랍 하나만 정리해도 머리가 맑아져요."],
      water: ["💧", "물 챙기기", "물을 자주 마시고 조용히 쉬는 시간을 꼭 남기세요."],
    };
    const grid = $("#adviceGrid");
    grid.innerHTML = "";
    const used = new Set();
    [ys, res.yongsin.secondary, dm, strong].forEach((e) => {
      if (used.has(e)) return;
      used.add(e);
      const [icon, title, text] = ITEMS[e];
      grid.appendChild(node("div", "adv", `<span>${icon}</span><p><b>${title}</b>${text}</p>`));
    });
    grid.appendChild(
      node("div", "adv",
        `<span>🌙</span><p><b>경계 정하기</b>기운이 무거운 날일수록 "여기까지"라고 말해 주는 게 약이 돼요.</p>`)
    );
  }

  /* ================= 그림(canvas) ================= */
  const yearCanvas = $("#yearCanvas");
  const panelCanvas = $("#panelCanvas");

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

  function miriFace(ctx, x, y, s, happy) {
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

    ctx.strokeStyle = "#2f3a63";
    ctx.fillStyle = "#2f3a63";
    ctx.lineWidth = 2.6;
    if (happy) {
      ctx.beginPath(); ctx.arc(-9, 0, 4.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(9, 0, 4.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.ellipse(-9, 0, 3.6, 4.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(9, 0, 3.6, 4.6, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,143,177,0.55)";
    ctx.beginPath(); ctx.ellipse(-15, 8, 5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, 8, 5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3a4470";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 7, 3.6, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    ctx.restore();
  }

  function dropShape(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.7);
    ctx.bezierCurveTo(x + size, y - size * 0.3, x + size, y + size, x, y + size);
    ctx.bezierCurveTo(x - size, y + size, x - size, y - size * 0.3, x, y - size * 1.7);
    ctx.fill();
  }

  /* 세운(올해) 카드 */
  function drawYear(res, info) {
    const ctx = yearCanvas.getContext("2d");
    const W = yearCanvas.width;
    const H = yearCanvas.height;
    ctx.clearRect(0, 0, W, H);

    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#f4ecff");
    sky.addColorStop(0.55, "#eef6ff");
    sky.addColorStop(1, "#e4f2ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath(); ctx.arc(W * 0.86, H * 0.2, 56, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.13, H * 0.16, 30, 0, Math.PI * 2); ctx.fill();

    ctx.textBaseline = "top";
    ctx.fillStyle = "#8d87a6";
    ctx.font = "700 13px Pretendard, sans-serif";
    ctx.fillText(`${info.seun.year} · ${info.seun.ko}(${info.seun.hanja})`, 24, 18);

    ctx.fillStyle = "#4f4890";
    ctx.font = "800 28px Pretendard, sans-serif";
    ctx.fillText(info.heavy ? "무게가 늘어나는 해" : "차분히 흐르는 해", 24, 40);

    ctx.fillStyle = "#a29cba";
    ctx.font = "700 12px Pretendard, sans-serif";
    ctx.fillText(
      `${EL_NAME[info.sEl]} ${res.five[info.sEl]}개 · ${EL_NAME[info.bEl]} ${res.five[info.bEl]}개 (내 사주 기준)`,
      24, 78
    );

    const water = ctx.createLinearGradient(0, H * 0.62, 0, H);
    water.addColorStop(0, "#bfe3ff");
    water.addColorStop(1, "#8fc4fb");
    ctx.fillStyle = water;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H * 0.7 + Math.sin(x / 34) * 7);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.82);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H * 0.82 + Math.sin(x / 26 + 1.4) * 6);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    const bx = W * 0.7;
    const by = H * 0.72;
    ctx.fillStyle = "rgba(90,130,200,0.18)";
    ctx.beginPath(); ctx.ellipse(bx, by + 15, 76, 11, 0, 0, Math.PI * 2); ctx.fill();

    const wood = ctx.createLinearGradient(0, by - 14, 0, by + 16);
    wood.addColorStop(0, info.heavy ? "#c9a07c" : "#d6a86c");
    wood.addColorStop(1, info.heavy ? "#8d6448" : "#a9743f");
    ctx.fillStyle = wood;
    roundRect(ctx, bx - 68, by - 14, 136, 28, 12);
    ctx.fill();

    miriFace(ctx, bx, by - 46, 1.1, !info.heavy);

    ctx.save();
    ctx.translate(W * 0.22, H * 0.42);
    ctx.fillStyle = "#fff";
    roundRect(ctx, -30, -30, 100, 62, 16); ctx.fill();
    ctx.strokeStyle = info.heavy ? "#ffd3c9" : "#cfe8ff";
    ctx.lineWidth = 2;
    roundRect(ctx, -30, -30, 100, 62, 16); ctx.stroke();
    ctx.fillStyle = info.heavy ? "#ff8a6b" : "#5da2e8";
    ctx.font = "800 15px Pretendard, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(info.heavy ? "⚖ 무거움" : "🌤 가벼움", -18, -22);
    ctx.fillStyle = "#b3aecb";
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.fillText(info.heavy ? "쉬는 시간부터" : "하던 일 마무리", -18, 4);
    ctx.restore();
  }

  /* 주제별 그림 */
  const PALETTE = {
    wealth: ["#ffe7c2", "#ffd18a", "#f2b45a"],
    career: ["#e2eeff", "#bcd9ff", "#7fa8e8"],
    love: ["#ffe4f1", "#ffc2dd", "#ff8fb1"],
    health: ["#e2f8ea", "#b8ebcf", "#6fc79a"],
  };

  function drawPanel(key, scene) {
    const ctx = panelCanvas.getContext("2d");
    const W = panelCanvas.width;
    const H = panelCanvas.height;
    const [c1, c2] = PALETTE[key] || PALETTE.wealth;
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fdfcff");
    bg.addColorStop(1, c1);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.arc(W * 0.9, H * 0.18, 66, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.8, H * 0.88, 42, 0, Math.PI * 2); ctx.fill();

    ctx.textBaseline = "top";

    if (scene === "wealth") {
      const baseY = H * 0.84;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = c2;
        roundRect(ctx, W * 0.14 + i * 24 - 15, baseY - i * 15 - 14, 30, 14, 6);
        ctx.fill();
      }
      const g = ctx.createLinearGradient(W * 0.55, H * 0.3, W * 0.75, H * 0.6);
      g.addColorStop(0, "#ffe9a8");
      g.addColorStop(1, "#e6b23f");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(W * 0.62, H * 0.52, 28, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(170,120,20,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(W * 0.62, H * 0.52, 18, 0, Math.PI * 2); ctx.stroke();
      miriFace(ctx, W * 0.2, H * 0.36, 1.05, true);
      ctx.fillStyle = "#b07bc8";
      ctx.font = "800 14px Pretendard, sans-serif";
      ctx.fillText("반복되는 규칙이 돈을 지켜요", W * 0.34, H * 0.16);
    } else if (scene === "career") {
      const baseY = H * 0.86;
      for (let i = 0; i < 4; i++) {
        const w = 50;
        const h = 24 + i * 18;
        const x = W * 0.1 + i * (w - 5);
        const g = ctx.createLinearGradient(0, baseY - h, 0, baseY);
        g.addColorStop(0, "#dbe8ff");
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        roundRect(ctx, x, baseY - h, w, h, 9);
        ctx.fill();
      }
      const topX = W * 0.1 + 3 * 45;
      ctx.strokeStyle = "#7c7695";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(topX + 18, baseY - 78); ctx.lineTo(topX + 18, baseY - 142); ctx.stroke();
      ctx.fillStyle = "#8b86ff";
      ctx.beginPath();
      ctx.moveTo(topX + 19, baseY - 142);
      ctx.lineTo(topX + 60, baseY - 130);
      ctx.lineTo(topX + 19, baseY - 118);
      ctx.closePath(); ctx.fill();

      miriFace(ctx, W * 0.72, H * 0.5, 1.2, true);
      ctx.fillStyle = "#4f7fd0";
      ctx.font = "800 14px Pretendard, sans-serif";
      ctx.fillText("한 일을 기록하면 계단이 돼요", W * 0.36, H * 0.14);
    } else if (scene === "love") {
      miriFace(ctx, W * 0.38, H * 0.56, 1.35, true);
      miriFace(ctx, W * 0.63, H * 0.48, 1.0, true);
      ctx.fillStyle = c2;
      const hx = W * 0.5;
      const hy = H * 0.22;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 12);
      ctx.bezierCurveTo(hx - 20, hy - 4, hx - 4, hy - 18, hx, hy - 4);
      ctx.bezierCurveTo(hx + 4, hy - 18, hx + 20, hy - 4, hx, hy + 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,143,177,0.85)";
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.45, H * 0.6);
      ctx.quadraticCurveTo(W * 0.5, H * 0.68, W * 0.57, H * 0.56);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#c0629a";
      ctx.font = "800 14px Pretendard, sans-serif";
      ctx.fillText("마음을 말로 한 번 더", W * 0.33, H * 0.1);
    } else {
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.ellipse(W * 0.2, H * 0.64, 44, 21, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(60,130,90,0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W * 0.14, H * 0.74); ctx.lineTo(W * 0.28, H * 0.54); ctx.stroke();

      dropShape(ctx, W * 0.55, H * 0.54, 26, "rgba(120,190,255,0.85)");
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath(); ctx.ellipse(W * 0.55 - 7, H * 0.54, 5, 8, -0.4, 0, Math.PI * 2); ctx.fill();

      miriFace(ctx, W * 0.8, H * 0.46, 0.95, true);
      ctx.fillStyle = "#3f8a63";
      ctx.font = "800 14px Pretendard, sans-serif";
      ctx.fillText("채우면 좋은 기운이 건강 루틴", W * 0.2, H * 0.12);
    }
  }

  /* ---------------- 시작 ---------------- */
  say(LINES_BASE[0]);
  setInterval(() => {
    if (!current) {
      lineIndex = (lineIndex + 1) % LINES_BASE.length;
      say(LINES_BASE[lineIndex]);
    }
  }, 7000);
})();
