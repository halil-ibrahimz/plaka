(function () {
  "use strict";

  const app = document.querySelector("#app");
  const data = window.PLATE_DATA || [];
  const storageKey = "plaka_ustasi_v1";

  const raceTypes = [
    {
      id: "quick",
      label: "Hızlı Yarış",
      description: "27 soru, 2 dakika",
      questionCount: 27,
      durationMs: 120000
    },
    {
      id: "full",
      label: "81 İl Challenge",
      description: "81 soru, 5 dakika",
      questionCount: 81,
      durationMs: 300000
    }
  ];

  const modes = [
    { id: "cityToPlate", label: "Şehir → Plaka" },
    { id: "plateToCity", label: "Plaka → Şehir" },
    { id: "mixed", label: "Karışık" }
  ];

  const learnViews = [
    { id: "card", label: "Kart" },
    { id: "list", label: "Plaka Listesi" }
  ];

  const state = {
    screen: "home",
    storage: loadStorage(),
    learn: {
      index: 0,
      view: "card",
      query: "",
      infoOpen: false
    },
    setup: {
      mode: "mixed",
      raceType: "quick"
    },
    quiz: null,
    results: null,
    timerId: null
  };

  function loadStorage() {
    const fallback = {
      statuses: {},
      bestScore: 0,
      bestScores: {
        quick: 0,
        full: 0
      }
    };

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      const next = saved && typeof saved === "object" ? saved : fallback;
      next.statuses = next.statuses && typeof next.statuses === "object" ? next.statuses : {};
      next.bestScore = Number(next.bestScore || 0);
      next.bestScores = next.bestScores && typeof next.bestScores === "object" ? next.bestScores : {};
      next.bestScores.quick = Number(next.bestScores.quick || next.bestScore || 0);
      next.bestScores.full = Number(next.bestScores.full || 0);
      data.forEach((item) => {
        if (!next.statuses[item.plate]) {
          next.statuses[item.plate] = "unseen";
        }
      });
      return next;
    } catch (error) {
      return fallback;
    }
  }

  function saveStorage() {
    localStorage.setItem(storageKey, JSON.stringify(state.storage));
  }

  function setCityStatus(plate, status) {
    state.storage.statuses[plate] = status;
    saveStorage();
  }

  function getKnownCount() {
    return data.filter((item) => state.storage.statuses[item.plate] === "known").length;
  }

  function getDifficultItems() {
    return data.filter((item) => state.storage.statuses[item.plate] === "difficult");
  }

  function shuffle(items) {
    const copy = items.slice();

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const nextIndex = Math.floor(Math.random() * (index + 1));
      const current = copy[index];
      copy[index] = copy[nextIndex];
      copy[nextIndex] = current;
    }

    return copy;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) {
      return `${seconds} sn`;
    }

    return `${minutes} dk ${String(seconds).padStart(2, "0")} sn`;
  }

  function getDirection(mode) {
    if (mode === "mixed") {
      return Math.random() > 0.5 ? "cityToPlate" : "plateToCity";
    }

    return mode;
  }

  function getRaceType(typeId) {
    return raceTypes.find((type) => type.id === typeId) || raceTypes[0];
  }

  function normalizeSearchText(value) {
    return String(value)
      .toLocaleLowerCase("tr-TR")
      .replace(/[çÇ]/g, "c")
      .replace(/[ğĞ]/g, "g")
      .replace(/[ıIİi]/g, "i")
      .replace(/[öÖ]/g, "o")
      .replace(/[şŞ]/g, "s")
      .replace(/[üÜ]/g, "u")
      .replace(/[âÂ]/g, "a")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function getSearchResults(query) {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return [];
    }

    const digitQuery = normalizedQuery.replace(/\D/g, "");
    const unpaddedDigitQuery = digitQuery.replace(/^0+/, "") || digitQuery;

    return data
      .map((item, index) => {
        const city = normalizeSearchText(item.city);
        const unpaddedPlate = item.plate.replace(/^0+/, "") || item.plate;
        let rank = 99;

        if (digitQuery) {
          if (item.plate === digitQuery || unpaddedPlate === unpaddedDigitQuery) {
            rank = 0;
          } else if (item.plate.startsWith(digitQuery)) {
            rank = 1;
          } else if (unpaddedPlate.startsWith(unpaddedDigitQuery)) {
            rank = 2;
          }
        }

        if (city.includes(normalizedQuery)) {
          rank = Math.min(rank, city.startsWith(normalizedQuery) ? 0 : 3);
        }

        return { item, index, rank };
      })
      .filter((result) => result.rank < 99)
      .sort((first, second) => first.rank - second.rank || first.index - second.index);
  }

  function getPrompt(item, direction) {
    if (direction === "cityToPlate") {
      return {
        label: "Şehir",
        main: item.city,
        answerLabel: "Plaka",
        answer: item.plate,
        question: "Bu şehrin plakası nedir?"
      };
    }

    return {
      label: "Plaka",
      main: item.plate,
      answerLabel: "Şehir",
      answer: item.city,
      question: "Bu plaka hangi şehre ait?"
    };
  }

  function getPlateHint(item, attempt) {
    const plateNumber = Number(item.plate);
    const groupStart = Math.floor((plateNumber - 1) / 10) * 10 + 1;
    const groupEnd = Math.min(groupStart + 9, 81);

    if (attempt === 1) {
      return `Plaka kodu ${groupStart}-${groupEnd} aralığında.`;
    }

    return `Plaka kodu ${item.plate.slice(0, 1)} ile başlar.`;
  }

  function getQuestionHint(question) {
    if (question.direction === "cityToPlate") {
      return getPlateHint(question.item, question.attempts);
    }

    return question.attempts === 1 ? question.item.hints[0] : question.item.hints[1];
  }

  function renderTopRow(showBack) {
    return `
      <div class="top-row">
        <div class="mini-plate" aria-label="81 Plaka"><span>81</span></div>
        ${
          showBack
            ? `<button class="back-button" type="button" data-action="home">Ana Sayfa</button>`
            : ""
        }
      </div>
    `;
  }

  function renderModeChips(activeMode, actionName) {
    return `
      <div>
        <p class="section-label">Mod</p>
        <div class="chip-row" role="group" aria-label="Mod seçimi">
          ${modes
            .map(
              (mode) => `
                <button
                  class="chip ${mode.id === activeMode ? "active" : ""}"
                  type="button"
                  data-action="${actionName}"
                  data-mode="${mode.id}"
                  aria-pressed="${mode.id === activeMode ? "true" : "false"}"
                >
                  ${mode.label}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderLearnViewChips() {
    return `
      <div class="view-toggle" role="group" aria-label="Öğren görünümü">
        ${learnViews
          .map(
            (view) => `
              <button
                class="chip ${view.id === state.learn.view ? "active" : ""}"
                type="button"
                data-action="learn-view"
                data-view="${view.id}"
                aria-pressed="${view.id === state.learn.view ? "true" : "false"}"
              >
                ${view.label}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderRaceTypeChips() {
    return `
      <div>
        <p class="section-label">Yarış türü</p>
        <div class="race-type-grid" role="group" aria-label="Yarış türü seçimi">
          ${raceTypes
            .map(
              (type) => `
                <button
                  class="race-type-card ${type.id === state.setup.raceType ? "active" : ""}"
                  type="button"
                  data-action="race-type"
                  data-race-type="${type.id}"
                  aria-pressed="${type.id === state.setup.raceType ? "true" : "false"}"
                >
                  <span>${type.label}</span>
                  <small>${type.description}</small>
                </button>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderSearchResultsHTML(query) {
    const results = getSearchResults(query);

    if (!query.trim()) {
      return "";
    }

    if (results.length === 0) {
      return `<div class="empty-box search-empty">Sonuç bulunamadı.</div>`;
    }

    return `
      <div class="search-results" aria-label="Arama sonuçları">
        ${results
          .map(
            (result) => `
              <button
                class="search-result"
                type="button"
                data-action="select-learn-city"
                data-index="${result.index}"
              >
                <span class="plate-badge">${escapeHtml(result.item.plate)}</span>
                <span>${escapeHtml(result.item.city)}</span>
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderLearnSearch() {
    return `
      <section class="learn-search-panel" aria-label="Plaka veya şehir arama">
        <label class="sr-only" for="learn-search">Plaka veya şehir ara</label>
        <input
          id="learn-search"
          class="learn-search-input"
          type="search"
          inputmode="search"
          autocomplete="off"
          enterkeyhint="search"
          placeholder="Plaka veya şehir ara"
          value="${escapeHtml(state.learn.query)}"
          data-action="learn-search"
        >
        <div id="learn-search-results">
          ${renderSearchResultsHTML(state.learn.query)}
        </div>
      </section>
    `;
  }

  function renderStudyCard(item) {
    return `
      <article class="study-card" aria-label="${escapeHtml(item.plate)} ${escapeHtml(item.city)}" data-study-card>
        <div class="study-strip">TR</div>
        <div class="study-content">
          <div class="study-main">
            <span class="study-plate" data-study-plate>${escapeHtml(item.plate)}</span>
            <span class="study-city" data-study-city>${escapeHtml(item.city.toLocaleUpperCase("tr-TR"))}</span>
          </div>
          <button class="study-info-button" type="button" data-action="toggle-city-info" data-study-info-button>
            ${state.learn.infoOpen ? "Bilgiyi Gizle" : "Şehri Tanı"}
          </button>
          <div class="study-info-slot" data-study-info-slot>
            ${renderStudyInfoHTML(item)}
          </div>
        </div>
      </article>
    `;
  }

  function renderStudyInfoHTML(item) {
    if (!state.learn.infoOpen) {
      return "";
    }

    return `<p class="study-info" role="status">${escapeHtml(item.info || "Bu şehir için kısa bilgi yakında eklenecek.")}</p>`;
  }

  function renderPlateList() {
    return `
      <section class="plate-list-panel" aria-label="Plaka listesi">
        <div class="plate-list">
          ${data
            .map(
              (item, index) => `
                <button
                  class="plate-list-row ${index === state.learn.index ? "active" : ""}"
                  type="button"
                  data-action="select-learn-city"
                  data-index="${index}"
                  aria-current="${index === state.learn.index ? "true" : "false"}"
                >
                  <span class="plate-badge">${escapeHtml(item.plate)}</span>
                  <span class="plate-list-city">${escapeHtml(item.city)}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderLicenseCard({ label, main, answerLabel, answer, revealed, question }) {
    return `
      <article class="license-card" aria-label="${escapeHtml(question)}">
        <div class="license-strip">TR</div>
        <div class="license-content">
          <span class="license-label">${escapeHtml(label)}</span>
          <strong class="license-main ${revealed ? "license-answer" : ""}">
            ${escapeHtml(revealed ? answer : main)}
          </strong>
          <span class="muted">${escapeHtml(revealed ? answerLabel : question)}</span>
        </div>
      </article>
    `;
  }

  function renderHome() {
    const knownCount = getKnownCount();
    const bestScores = state.storage.bestScores || { quick: 0, full: 0 };

    app.innerHTML = `
      <section class="screen">
        ${renderTopRow(false)}
        <section class="hero-card">
          <p class="eyebrow">Plaka</p>
          <h1 class="title">81</h1>
          <p class="subtitle">Öğren modu hızlı bir plaka rehberi, yarış modu ise kendini test ettiğin bölüm. Isınmak için hızlı yarış, ustalık için 81 İl Challenge.</p>
        </section>
        <div class="actions">
          <button class="button" type="button" data-action="learn">Öğren</button>
          <button class="button secondary" type="button" data-action="setup">Yarış</button>
        </div>
        <section class="progress-card" aria-label="İlerleme">
          <div>
            <p class="progress-title">Öğrenme ilerlemesi</p>
            <p class="progress-subtitle">${knownCount} şehir öğrenildi. Kartlardan çalış, yarışta hızını ölç.</p>
          </div>
          <strong class="progress-number">${knownCount}/81</strong>
        </section>
        <section class="panel home-score-panel" aria-label="En iyi skorlar">
          <div>
            <p class="section-label">En iyi skorlar</p>
            <p class="muted">Her yarış türü ayrı takip edilir.</p>
          </div>
          <div class="home-score-grid">
            <div class="home-score-item">
              <span>Hızlı Yarış</span>
              <strong>${bestScores.quick || 0}</strong>
            </div>
            <div class="home-score-item">
              <span>81 İl Challenge</span>
              <strong>${bestScores.full || 0}</strong>
            </div>
          </div>
        </section>
      </section>
    `;
  }

  function renderLearn() {
    const safeIndex = Math.min(Math.max(state.learn.index, 0), data.length - 1);
    state.learn.index = safeIndex;
    const item = data[safeIndex];

    app.innerHTML = `
      <section class="screen">
        ${renderTopRow(true)}
        <div>
          <h2 class="screen-title">Öğren</h2>
          <p class="subtitle">81 ilin plaka kodunu hızlıca gez, ara ve plaka listesiyle aklında sağlamlaştır.</p>
        </div>
        <section class="panel learn-controls">
          ${renderLearnViewChips()}
          ${renderLearnSearch()}
        </section>
        ${
          state.learn.view === "card"
            ? `
              ${renderStudyCard(item)}
              <p class="card-counter" data-card-counter>${safeIndex + 1} / ${data.length}</p>
              <div class="nav-actions">
                <button class="button light" type="button" data-action="previous-card">Önceki</button>
                <button class="button light" type="button" data-action="next-card">Sonraki</button>
              </div>
            `
            : renderPlateList()
        }
      </section>
    `;
  }

  function renderSetup() {
    const raceType = getRaceType(state.setup.raceType);

    app.innerHTML = `
      <section class="screen">
        ${renderTopRow(true)}
        <div>
          <h2 class="screen-title">Yarış Hazırlığı</h2>
          <p class="subtitle">${raceType.description}. İlk denemede bilirsen 3 puan; ipuçlarından sonra puan azalır.</p>
        </div>
        <section class="panel">
          ${renderRaceTypeChips()}
          ${renderModeChips(state.setup.mode, "setup-mode")}
        </section>
        <section class="progress-card">
          <div>
            <p class="progress-title">${raceType.label}</p>
            <p class="progress-subtitle">Şehirden plaka sorularında kod aralığı, plakadan şehir sorularında şehir bilgisi gösterilir.</p>
          </div>
          <strong class="progress-number">${raceType.questionCount}</strong>
        </section>
        <button class="button secondary" type="button" data-action="start-race">Yarışı Başlat</button>
      </section>
    `;
  }

  function createQuestion(item, mode) {
    const direction = getDirection(mode);
    const correctAnswer = direction === "cityToPlate" ? item.plate : item.city;
    const wrongAnswers = shuffle(
      data
        .filter((candidate) => candidate.plate !== item.plate)
        .map((candidate) => (direction === "cityToPlate" ? candidate.plate : candidate.city))
    ).slice(0, 3);

    return {
      item,
      direction,
      correctAnswer,
      options: shuffle([correctAnswer, ...wrongAnswers]),
      wrongAnswers: [],
      attempts: 0,
      feedback: "Cevabını seç.",
      feedbackType: "",
      revealed: false
    };
  }

  function createQuizDetail(question, correct, points) {
    const prompt = getPrompt(question.item, question.direction);

    return {
      plate: question.item.plate,
      city: question.item.city,
      direction: question.direction,
      prompt: prompt.main,
      correctAnswer: question.correctAnswer,
      correct,
      wrongCount: question.attempts,
      points
    };
  }

  function buildRacePool() {
    return shuffle(data).slice(0, getRaceType(state.setup.raceType).questionCount);
  }

  function startRace() {
    clearTimer();
    const raceType = getRaceType(state.setup.raceType);
    const questions = buildRacePool().map((item) => createQuestion(item, state.setup.mode));

    state.quiz = {
      questions,
      raceType: { ...raceType },
      durationMs: raceType.durationMs,
      index: 0,
      score: 0,
      correctCount: 0,
      startedAt: Date.now(),
      elapsedMs: 0,
      locked: false,
      details: []
    };
    state.results = null;
    state.screen = "quiz";
    state.timerId = setInterval(tickTimer, 250);
    render();
  }

  function tickTimer() {
    if (!state.quiz || state.screen !== "quiz") {
      clearTimer();
      return;
    }

    const elapsed = Date.now() - state.quiz.startedAt;
    state.quiz.elapsedMs = elapsed;

    if (elapsed >= state.quiz.durationMs) {
      finishRace();
      return;
    }

    updateQuizMeta();
  }

  function updateQuizMeta() {
    if (!state.quiz || state.screen !== "quiz") {
      return;
    }

    const timeNode = document.querySelector("[data-quiz-time]");
    const progressNode = document.querySelector("[data-quiz-progress]");
    const scoreNode = document.querySelector("[data-quiz-score]");

    if (!timeNode || !progressNode || !scoreNode) {
      renderQuiz();
      return;
    }

    const timeLeft = state.quiz.durationMs - (Date.now() - state.quiz.startedAt);
    timeNode.textContent = formatTime(timeLeft);
    progressNode.textContent = `${state.quiz.index + 1} / ${state.quiz.questions.length}`;
    scoreNode.textContent = state.quiz.score;
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function renderQuiz() {
    if (state.screen !== "quiz" || !state.quiz) {
      return;
    }

    const quiz = state.quiz;
    const question = quiz.questions[quiz.index];
    const prompt = getPrompt(question.item, question.direction);
    const timeLeft = quiz.durationMs - (Date.now() - quiz.startedAt);
    const hintText =
      !question.revealed && question.attempts === 1
        ? getQuestionHint(question)
        : !question.revealed && question.attempts === 2
          ? getQuestionHint(question)
          : "";

    app.innerHTML = `
      <section class="screen quiz-screen">
        <div class="top-row quiz-top-row">
          <div class="mini-plate" aria-label="81 Plaka"><span>81</span></div>
          <button class="back-button race-exit-button" type="button" data-action="exit-race">Yarıştan Çık</button>
        </div>
        <div class="quiz-meta">
          <div class="meta-pill" aria-label="Kalan süre">
            <p class="meta-label">Süre</p>
            <p class="meta-value" data-quiz-time>${formatTime(timeLeft)}</p>
          </div>
          <div class="meta-pill" aria-label="Soru ilerlemesi">
            <p class="meta-label">Soru</p>
            <p class="meta-value" data-quiz-progress>${quiz.index + 1} / ${quiz.questions.length}</p>
          </div>
          <div class="meta-pill" aria-label="Güncel puan">
            <p class="meta-label">Puan</p>
            <p class="meta-value" data-quiz-score>${quiz.score}</p>
          </div>
        </div>
        ${renderLicenseCard({
          ...prompt,
          revealed: false
        })}
        ${
          hintText
            ? `<div class="hint-box" role="status">İpucu ${question.attempts}: ${escapeHtml(hintText)}</div>`
            : `<div class="feedback-box ${question.feedbackType}" role="status">${escapeHtml(question.feedback)}</div>`
        }
        <div class="answer-grid" role="group" aria-label="Cevap seçenekleri">
          ${question.options
            .map((option) => {
              const isWrong = question.wrongAnswers.includes(option);
              const isCorrect = question.revealed && option === question.correctAnswer;
              const className = isCorrect ? "correct" : isWrong ? "wrong" : "";
              const disabled = quiz.locked || isWrong;

              return `
                <button
                  class="answer-button ${className}"
                  type="button"
                  data-action="answer"
                  data-answer="${escapeHtml(option)}"
                  ${disabled ? "disabled" : ""}
                >
                  ${escapeHtml(option)}
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function handleAnswer(answer) {
    const quiz = state.quiz;

    if (!quiz || quiz.locked) {
      return;
    }

    const question = quiz.questions[quiz.index];

    if (answer === question.correctAnswer) {
      const earned = Math.max(1, 3 - question.attempts);
      quiz.score += earned;
      quiz.correctCount += 1;
      quiz.locked = true;
      question.revealed = true;
      question.feedback = `Doğru! ${earned} puan kazandın.`;
      question.feedbackType = "success";
      quiz.details.push(createQuizDetail(question, true, earned));

      setCityStatus(question.item.plate, question.attempts === 0 ? "known" : "difficult");
      renderQuiz();
      window.setTimeout(nextQuestion, 760);
      return;
    }

    if (!question.wrongAnswers.includes(answer)) {
      question.wrongAnswers.push(answer);
    }

    question.attempts += 1;

    if (question.attempts === 1) {
      question.feedback = "İlk yanlış. Bir ipucu açıldı.";
      question.feedbackType = "error";
      renderQuiz();
      return;
    }

    if (question.attempts === 2) {
      question.feedback = "İkinci yanlış. Son ipucu açıldı.";
      question.feedbackType = "error";
      renderQuiz();
      return;
    }

    quiz.locked = true;
    question.revealed = true;
    question.feedback = `Doğru cevap: ${question.correctAnswer}`;
    question.feedbackType = "error";
    quiz.details.push(createQuizDetail(question, false, 0));
    setCityStatus(question.item.plate, "difficult");
    renderQuiz();
    window.setTimeout(nextQuestion, 1150);
  }

  function nextQuestion() {
    if (!state.quiz) {
      return;
    }

    if (state.quiz.index >= state.quiz.questions.length - 1) {
      finishRace();
      return;
    }

    state.quiz.index += 1;
    state.quiz.locked = false;
    renderQuiz();
  }

  function finishRace() {
    if (!state.quiz) {
      return;
    }

    clearTimer();
    const quiz = state.quiz;
    const elapsedMs = Math.min(Date.now() - quiz.startedAt, quiz.durationMs);

    quiz.questions.forEach((question, index) => {
      const alreadySaved = quiz.details.some((detail) => detail.plate === question.item.plate);

      if (!alreadySaved && index >= quiz.index) {
        quiz.details.push(createQuizDetail(question, false, 0));
        setCityStatus(question.item.plate, "difficult");
      }
    });

    state.storage.bestScores = state.storage.bestScores || { quick: 0, full: 0 };
    state.storage.bestScores[quiz.raceType.id] = Math.max(state.storage.bestScores[quiz.raceType.id] || 0, quiz.score);
    state.storage.bestScore = Math.max(state.storage.bestScore || 0, quiz.score);
    saveStorage();
    state.results = {
      score: quiz.score,
      correctCount: quiz.correctCount,
      total: quiz.questions.length,
      elapsedMs,
      details: quiz.details,
      setup: { ...state.setup }
    };
    state.quiz = null;
    state.screen = "results";
    render();
  }

  function renderResults() {
    const results = state.results;

    if (!results) {
      state.screen = "home";
      renderHome();
      return;
    }

    const difficultDetails = results.details.filter((detail) => !detail.correct || detail.wrongCount > 0);
    const accuracy = Math.round((results.correctCount / results.total) * 100);
    const resultType = getRaceType(results.setup && results.setup.raceType);

    app.innerHTML = `
      <section class="screen">
        ${renderTopRow(true)}
        <section class="result-card">
          <p class="eyebrow">Yarış bitti</p>
          <h2 class="screen-title">Sonuçlar</h2>
          <p class="score-number">${results.score}</p>
          <p class="muted">${escapeHtml(resultType.label)} toplam puanı</p>
        </section>
        <section class="stats-grid" aria-label="Yarış istatistikleri">
          <div class="stat-box">
            <p class="stat-value">${results.correctCount}/${results.total}</p>
            <p class="stat-label">Doğru</p>
          </div>
          <div class="stat-box">
            <p class="stat-value">%${accuracy}</p>
            <p class="stat-label">Başarı</p>
          </div>
          <div class="stat-box">
            <p class="stat-value">${formatTime(results.elapsedMs)}</p>
            <p class="stat-label">Süre</p>
          </div>
        </section>
        <section class="panel">
          <div>
            <p class="section-label">Tekrar edilecekler</p>
            <p class="muted">İpucu aldığın veya kaçırdığın sorular doğru cevaplarıyla burada görünür.</p>
          </div>
          ${
            difficultDetails.length > 0
              ? `
                <div class="difficult-list">
                  ${difficultDetails
                    .map((detail) => {
                      const directionLabel = detail.direction === "cityToPlate" ? "Şehir → Plaka" : "Plaka → Şehir";
                      const promptText = detail.prompt || (detail.direction === "cityToPlate" ? detail.city : detail.plate);
                      const correctAnswer = detail.correctAnswer || (detail.direction === "cityToPlate" ? detail.plate : detail.city);
                      const note = detail.correct ? "İpucuyla doğru" : "Kaçırıldı";

                      return `
                        <div class="difficult-item">
                          <span class="plate-badge">${escapeHtml(detail.plate)}</span>
                          <span>
                            <span class="difficult-name">${escapeHtml(detail.city)}</span>
                            <br>
                            <span class="difficult-note">${escapeHtml(directionLabel)} · ${escapeHtml(note)}</span>
                            <span class="answer-summary">Soru: ${escapeHtml(promptText)} · Doğru cevap: ${escapeHtml(correctAnswer)}</span>
                          </span>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              `
              : `<div class="empty-box">Harika! Bu yarışta tekrar edilecek soru görünmüyor.</div>`
          }
        </section>
        <div class="actions">
          <button class="button secondary" type="button" data-action="repeat-race">Tekrar Yarış</button>
          <button class="button light" type="button" data-action="practice-difficult">Zorları Çalış</button>
          <button class="button ghost" type="button" data-action="home">Ana Sayfa</button>
        </div>
      </section>
    `;
  }

  function render() {
    if (state.screen !== "quiz") {
      clearTimer();
    }

    if (state.screen === "home") {
      renderHome();
      return;
    }

    if (state.screen === "learn") {
      renderLearn();
      return;
    }

    if (state.screen === "setup") {
      renderSetup();
      return;
    }

    if (state.screen === "quiz") {
      renderQuiz();
      return;
    }

    renderResults();
  }

  function goHome() {
    clearTimer();
    state.screen = "home";
    render();
  }

  function openLearn() {
    clearTimer();
    state.learn.view = "card";
    state.learn.query = "";
    state.learn.infoOpen = false;
    state.screen = "learn";
    render();
  }

  function openSetup() {
    clearTimer();
    state.screen = "setup";
    render();
  }

  function exitRace() {
    clearTimer();
    state.quiz = null;
    state.screen = "setup";
    render();
  }

  function updateStudyCard() {
    if (state.screen !== "learn" || state.learn.view !== "card") {
      return false;
    }

    const item = data[state.learn.index];
    const cardNode = document.querySelector("[data-study-card]");
    const plateNode = document.querySelector("[data-study-plate]");
    const cityNode = document.querySelector("[data-study-city]");
    const buttonNode = document.querySelector("[data-study-info-button]");
    const infoNode = document.querySelector("[data-study-info-slot]");
    const counterNode = document.querySelector("[data-card-counter]");

    if (!item || !cardNode || !plateNode || !cityNode || !buttonNode || !infoNode || !counterNode) {
      return false;
    }

    cardNode.setAttribute("aria-label", `${item.plate} ${item.city}`);
    plateNode.textContent = item.plate;
    cityNode.textContent = item.city.toLocaleUpperCase("tr-TR");
    buttonNode.textContent = state.learn.infoOpen ? "Bilgiyi Gizle" : "Şehri Tanı";
    infoNode.innerHTML = renderStudyInfoHTML(item);
    counterNode.textContent = `${state.learn.index + 1} / ${data.length}`;
    return true;
  }

  function clearLearnSearchUI() {
    const inputNode = document.querySelector("#learn-search");
    const resultsNode = document.querySelector("#learn-search-results");

    if (inputNode) {
      inputNode.value = "";
    }

    if (resultsNode) {
      resultsNode.innerHTML = "";
    }
  }

  function moveLearnCard(offset) {
    if (data.length === 0) {
      return;
    }

    state.learn.index = (state.learn.index + offset + data.length) % data.length;
    state.learn.infoOpen = false;

    if (!updateStudyCard()) {
      renderLearn();
    }
  }

  function practiceDifficult() {
    const resultItems = state.results
      ? state.results.details
          .filter((detail) => !detail.correct || detail.wrongCount > 0)
          .map((detail) => data.find((item) => item.plate === detail.plate))
          .filter(Boolean)
      : [];
    const storedItems = getDifficultItems();
    const merged = resultItems.length > 0 ? resultItems : storedItems;
    const firstItem = merged[0];

    state.learn.index = firstItem ? data.findIndex((item) => item.plate === firstItem.plate) : 0;
    state.learn.view = "card";
    state.learn.query = "";
    state.learn.infoOpen = false;
    state.screen = "learn";
    render();
  }

  function selectLearnCity(index) {
    const nextIndex = Number(index);

    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= data.length) {
      return;
    }

    const canUpdateInline = state.screen === "learn" && state.learn.view === "card";
    state.learn.index = nextIndex;
    state.learn.view = "card";
    state.learn.query = "";
    state.learn.infoOpen = false;

    if (canUpdateInline && updateStudyCard()) {
      clearLearnSearchUI();
      return;
    }

    renderLearn();
  }

  function handleInput(event) {
    const target = event.target;

    if (!target || target.dataset.action !== "learn-search") {
      return;
    }

    state.learn.query = target.value;
    const resultsNode = document.querySelector("#learn-search-results");

    if (resultsNode) {
      resultsNode.innerHTML = renderSearchResultsHTML(state.learn.query);
    }
  }

  function handleClick(event) {
    const target = event.target.closest("[data-action]");

    if (!target) {
      return;
    }

    const action = target.dataset.action;

    if (action === "home") {
      goHome();
      return;
    }

    if (action === "learn") {
      openLearn();
      return;
    }

    if (action === "setup") {
      openSetup();
      return;
    }

    if (action === "learn-view") {
      state.learn.view = target.dataset.view === "list" ? "list" : "card";
      renderLearn();
      return;
    }

    if (action === "toggle-city-info") {
      state.learn.infoOpen = !state.learn.infoOpen;

      if (!updateStudyCard()) {
        renderLearn();
      }

      return;
    }

    if (action === "race-type") {
      state.setup.raceType = target.dataset.raceType === "full" ? "full" : "quick";
      renderSetup();
      return;
    }

    if (action === "setup-mode") {
      state.setup.mode = target.dataset.mode;
      renderSetup();
      return;
    }

    if (action === "previous-card") {
      moveLearnCard(-1);
      return;
    }

    if (action === "next-card") {
      moveLearnCard(1);
      return;
    }

    if (action === "start-race") {
      startRace();
      return;
    }

    if (action === "exit-race") {
      exitRace();
      return;
    }

    if (action === "answer") {
      handleAnswer(target.dataset.answer || "");
      return;
    }

    if (action === "select-learn-city") {
      selectLearnCity(target.dataset.index);
      return;
    }

    if (action === "repeat-race") {
      if (state.results && state.results.setup) {
        state.setup = { ...state.results.setup };
      }
      startRace();
      return;
    }

    if (action === "practice-difficult") {
      practiceDifficult();
    }
  }

  app.addEventListener("click", handleClick);
  app.addEventListener("input", handleInput);
  render();
})();
