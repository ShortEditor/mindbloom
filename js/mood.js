/* ============================================
   MindBloom — Mood Tracking
   ============================================ */

const Mood = {
  activeTab: 'checkin',

  emotions: ['😰 Anxious','😢 Sad','😔 Down','😤 Angry','😴 Tired','😐 Neutral',
             '🙂 Okay','😊 Happy','😄 Excited','🤩 Grateful','😌 Calm','💪 Motivated'],
  contexts: ['💼 Work','😴 Sleep','💕 Relationships','🏃 Health','☀️ Weather','🍽️ Food','🎮 Leisure','📱 Social Media'],

  state: { score: null, emotions: [], contexts: [], note: '' },

  render() {
    const el = document.getElementById('screen-mood');
    const today = MB.today();
    const moods = MB.store.get('moods', []);
    const todayMood = moods.find(m => m.date === today);
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">MOOD TRACKER</div>
        <h2>How are you <span class="gradient-text">feeling?</span></h2>
      </div>
      <div class="tab-bar mb-6">
        <button class="tab-btn active" id="tab-checkin" onclick="Mood.switchTab('checkin')">Check-in</button>
        <button class="tab-btn" id="tab-trends" onclick="Mood.switchTab('trends')">Trends</button>
        <button class="tab-btn" id="tab-history" onclick="Mood.switchTab('history')">History</button>
      </div>
      <div id="mood-tab-content"></div>
    `;
    this.switchTab('checkin');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['checkin','trends','history'].forEach(t => {
      document.getElementById('tab-'+t)?.classList.toggle('active', t===tab);
    });
    const content = document.getElementById('mood-tab-content');
    if (tab === 'checkin') this.renderCheckin(content);
    else if (tab === 'trends') this.renderTrends(content);
    else this.renderHistory(content);
  },

  renderCheckin(el) {
    const today = MB.today();
    const moods = MB.store.get('moods', []);
    const todayMood = moods.find(m => m.date === today);
    const streak = this.calcStreak(moods);

    el.innerHTML = `
      <div class="streak-widget mb-6">
        <div class="flame-icon" style="font-size:2rem">🔥</div>
        <div>
          <div class="streak-count">${streak}</div>
          <div class="text-sm text-muted">Day${streak!==1?'s':''} in a row</div>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div class="font-heading font-bold">${moods.length}</div>
          <div class="text-xs text-muted">Total check-ins</div>
        </div>
      </div>

      ${todayMood ? this.renderAlreadyCheckedIn(todayMood) : this.renderCheckinForm()}
    `;
    if (!todayMood) this.bindCheckinForm();
  },

  renderAlreadyCheckedIn(mood) {
    return `
      <div class="card text-center" style="border-color:${MB.moodColor(mood.score)}44;padding:32px">
        <div style="font-size:4rem;margin-bottom:12px">${MB.moodFace(mood.score)}</div>
        <h3 class="gradient-text">${MB.moodLabels[mood.score-1]}</h3>
        <p class="text-sm mt-4">Today's check-in logged ✓<br>Come back tomorrow to keep your streak!</p>
        ${mood.note ? `<div class="card mt-4 text-sm" style="background:var(--c-surface);font-style:italic">"${mood.note}"</div>` : ''}
      </div>`;
  },

  renderCheckinForm() {
    return `
      <div class="card mb-4">
        <h4 class="mb-4">How are you feeling? <span class="text-muted">(1–10)</span></h4>
        <div class="mood-grid" id="mood-grid">
          ${Array(10).fill(0).map((_,i) => `
            <div class="mood-cell" data-score="${i+1}" onclick="Mood.selectScore(${i+1},this)">
              <span class="emoji" style="color:${MB.moodColor(i+1)}">${MB.moodFace(i+1)}</span>
              <span class="label">${MB.moodLabels[i]}</span>
            </div>`).join('')}
        </div>
        <div id="score-display" class="text-center mt-4 hidden">
          <span class="badge badge-primary" id="score-badge">–</span>
        </div>
      </div>

      <div class="card mb-4" id="emotions-card" style="display:none">
        <h4 class="mb-3">What emotions tag this moment?</h4>
        <div class="chip-group" id="emotion-chips">
          ${this.emotions.map(e => `<div class="chip" onclick="Mood.toggleEmotion(this,'${e}')">${e}</div>`).join('')}
        </div>
      </div>

      <div class="card mb-4" id="context-card" style="display:none">
        <h4 class="mb-3">What influenced your mood?</h4>
        <div class="chip-group" id="context-chips">
          ${this.contexts.map(c => `<div class="chip" onclick="Mood.toggleContext(this,'${c}')">${c}</div>`).join('')}
        </div>
      </div>

      <div class="card mb-6" id="note-card" style="display:none">
        <h4 class="mb-3">Optional note</h4>
        <textarea class="form-textarea" id="mood-note" placeholder="Anything on your mind?" rows="3" style="min-height:80px"></textarea>
      </div>

      <button class="btn btn-primary btn-full btn-lg" id="save-mood-btn" style="display:none" onclick="Mood.save()">
        Save Check-in ✓
      </button>
    `;
  },

  bindCheckinForm() {
    const noteEl = document.getElementById('mood-note');
    if (noteEl) noteEl.addEventListener('input', e => this.state.note = e.target.value);
  },

  selectScore(score, el) {
    this.state.score = score;
    document.querySelectorAll('.mood-cell').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    el.classList.add('emoji-bounce');
    setTimeout(() => el.classList.remove('emoji-bounce'), 500);

    document.getElementById('score-display').classList.remove('hidden');
    document.getElementById('score-badge').textContent = `${score}/10 — ${MB.moodLabels[score-1]}`;
    document.getElementById('score-badge').style.background = MB.moodColor(score) + '33';
    document.getElementById('score-badge').style.color = MB.moodColor(score);

    ['emotions-card','context-card','note-card','save-mood-btn'].forEach(id => {
      const el2 = document.getElementById(id);
      if (el2) el2.style.display = '';
    });
  },

  toggleEmotion(el, val) {
    el.classList.toggle('selected');
    const arr = this.state.emotions;
    const idx = arr.indexOf(val);
    idx === -1 ? arr.push(val) : arr.splice(idx,1);
  },

  toggleContext(el, val) {
    el.classList.toggle('selected-accent');
    const arr = this.state.contexts;
    const idx = arr.indexOf(val);
    idx === -1 ? arr.push(val) : arr.splice(idx,1);
  },

  save() {
    if (!this.state.score) { MB.toast('Please select your mood first', 'error'); return; }
    const entry = {
      id: MB.uid(),
      date: MB.today(),
      timestamp: new Date().toISOString(),
      score: this.state.score,
      emotions: [...this.state.emotions],
      contexts: [...this.state.contexts],
      note: this.state.note
    };
    const moods = MB.store.get('moods', []);
    const existing = moods.findIndex(m => m.date === entry.date);
    if (existing > -1) moods[existing] = entry; else moods.push(entry);
    MB.store.set('moods', moods);
    // Persist to Firestore
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveMood(entry).catch(console.warn);
    }

    // Reset state
    this.state = { score: null, emotions: [], contexts: [], note: '' };
    MB.confetti(document.getElementById('screen-mood'));
    MB.toast('Check-in saved! 🎉', 'success');
    this.renderCheckin(document.getElementById('mood-tab-content'));
  },

  renderTrends(el) {
    const moods = MB.store.get('moods', []);
    el.innerHTML = `
      <div class="chart-wrap mb-6">
        <div class="flex justify-between items-center mb-4">
          <h4>7-Day Mood Trend</h4>
          <span class="badge badge-primary">This Week</span>
        </div>
        <canvas id="mood-line-chart" height="180"></canvas>
      </div>
      <div class="chart-wrap mb-6">
        <h4 class="mb-4">Monthly Heatmap</h4>
        <div id="mood-heatmap"></div>
      </div>
      <div id="mood-insight" class="card-highlight mb-6" style="display:none">
        <div style="font-size:1.4rem;margin-bottom:8px">💡</div>
        <h4 class="mb-2">Weekly Insight</h4>
        <p class="text-sm" id="insight-text"></p>
      </div>
      <div class="grid-2">
        <div class="stat-card"><div class="stat-value gradient-text" id="avg-score">—</div><div class="stat-label">Avg Mood (7d)</div></div>
        <div class="stat-card"><div class="stat-value" style="color:var(--c-accent)" id="best-day">—</div><div class="stat-label">Best Day</div></div>
      </div>
    `;
    setTimeout(() => {
      this.renderLineChart(moods);
      this.renderHeatmap(moods);
      this.renderInsight(moods);
    }, 100);
  },

  renderLineChart(moods) {
    const ctx = document.getElementById('mood-line-chart');
    if (!ctx || !window.Chart) return;
    const days = MB.getLast7Days();
    const byDate = {};
    moods.forEach(m => byDate[m.date] = m.score);
    const labels = days.map(d => { const dt = new Date(d); return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]; });
    const data = days.map(d => byDate[d] || null);

    if (window._moodLineChart) window._moodLineChart.destroy();
    window._moodLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Mood', data,
          borderColor: '#7C6EF5', backgroundColor: 'rgba(124,110,245,0.1)',
          borderWidth: 2.5, tension: 0.4, fill: true,
          pointBackgroundColor: data.map(v => v ? MB.moodColor(v) : 'transparent'),
          pointBorderColor: '#7C6EF5', pointRadius: 5, pointHoverRadius: 7,
          spanGaps: true
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { min:1, max:10, grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#8891A8', font:{size:11} } },
          x: { grid: { display:false }, ticks: { color:'#8891A8', font:{size:11} } }
        },
        plugins: { legend: { display:false }, tooltip: {
          callbacks: { label: ctx => `Mood: ${ctx.raw}/10 — ${MB.moodLabels[(ctx.raw||1)-1]}` }
        }}
      }
    });

    // Stats
    const valid = data.filter(v => v);
    if (valid.length) {
      document.getElementById('avg-score').textContent = (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1);
      const best = Math.max(...valid);
      const bestIdx = data.indexOf(best);
      document.getElementById('best-day').textContent = labels[bestIdx] || '—';
    }
  },

  renderHeatmap(moods) {
    const el = document.getElementById('mood-heatmap');
    if (!el) return;
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const days = MB.daysInMonth(year, month);
    const byDate = {};
    moods.forEach(m => byDate[m.date] = m.score);

    const monthLabel = `<div class="flex justify-between text-xs text-muted mb-3"><span>${MB.monthName(month)} ${year}</span><div style="display:flex;gap:4px;align-items:center"><span>Low</span><div style="display:flex;gap:2px">${[2,4,6,8,10].map(v=>`<div style="width:12px;height:12px;border-radius:2px;background:${MB.moodColor(v)}"></div>`).join('')}</div><span>High</span></div></div>`;

    const firstDay = new Date(year, month, 1).getDay();
    let cells = Array(firstDay).fill('<div></div>');
    for (let d = 1; d <= days; d++) {
      const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const score = byDate[iso];
      const bg = score ? MB.moodColor(score) : 'var(--c-border)';
      const tip = score ? `${d}: ${MB.moodLabels[score-1]} (${score}/10)` : `${d}: No data`;
      cells.push(`<div class="heat-cell" style="background:${bg}" data-tip="${tip}"></div>`);
    }
    el.innerHTML = monthLabel + `<div class="heatmap-grid">${['S','M','T','W','T','F','S'].map(d=>`<div class="text-center text-xs text-muted" style="padding:2px 0">${d}</div>`).join('')}${cells.join('')}</div>`;
  },

  renderInsight(moods) {
    const el = document.getElementById('mood-insight');
    const textEl = document.getElementById('insight-text');
    if (!el || moods.length < 3) return;
    el.style.display = '';

    const recent = moods.slice(-7);
    const avg = recent.reduce((s,m)=>s+m.score,0)/recent.length;
    const trend = recent.length >= 2 ? recent[recent.length-1].score - recent[0].score : 0;
    const commonEmotion = this.mostCommon(recent.flatMap(m => m.emotions||[]));

    let insight = '';
    if (avg >= 7) insight = `You've been doing really well! Your average mood this week is ${avg.toFixed(1)}/10. Keep building on what's working.`;
    else if (avg >= 5) insight = `Your mood has been moderate this week (avg ${avg.toFixed(1)}/10). Small consistent actions — like today's check-in — make a real difference.`;
    else insight = `It looks like this week has been tough (avg ${avg.toFixed(1)}/10). Remember: you don't have to feel better all at once. One small step matters.`;

    if (trend > 2) insight += ' 📈 Your mood is trending upward — great progress!';
    if (trend < -2) insight += ' 📉 Your mood has dipped recently. Consider trying a breathing exercise or journaling to explore what\'s behind it.';
    if (commonEmotion) insight += ` You've frequently felt <strong>${commonEmotion}</strong> this week.`;

    textEl.innerHTML = insight;
  },

  mostCommon(arr) {
    if (!arr.length) return null;
    const freq = {};
    arr.forEach(v => freq[v] = (freq[v]||0)+1);
    return Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0];
  },

  renderHistory(el) {
    const moods = MB.store.get('moods', []).slice().reverse();
    el.innerHTML = `
      <div class="mb-4">
        <input type="text" class="form-input" id="mood-search" placeholder="🔍 Search by emotion or note…" oninput="Mood.filterHistory(this.value)">
      </div>
      <div id="mood-history-list" class="stagger-children">
        ${moods.length ? moods.map(m => this.historyCard(m)).join('') : '<p class="text-center text-muted mt-8">No mood logs yet. Start your first check-in!</p>'}
      </div>
    `;
  },

  historyCard(m) {
    return `
      <div class="card mb-3 history-entry" data-tags="${(m.emotions||[]).join(' ')} ${m.note||''}">
        <div class="flex items-center gap-3">
          <div style="font-size:2rem;color:${MB.moodColor(m.score)}">${MB.moodFace(m.score)}</div>
          <div style="flex:1">
            <div class="flex justify-between items-center">
              <span class="font-heading font-semibold">${MB.moodLabels[m.score-1]}</span>
              <span class="badge" style="background:${MB.moodColor(m.score)}22;color:${MB.moodColor(m.score)}">${m.score}/10</span>
            </div>
            <div class="text-xs text-muted">${MB.formatDate(m.date)}</div>
            ${m.emotions?.length ? `<div class="chip-group mt-2">${m.emotions.slice(0,3).map(e=>`<span class="chip text-xs" style="padding:3px 8px">${e}</span>`).join('')}</div>` : ''}
            ${m.note ? `<p class="text-xs mt-2" style="color:var(--c-text-muted)">${MB.truncate(m.note, 80)}</p>` : ''}
          </div>
        </div>
      </div>`;
  },

  filterHistory(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.history-entry').forEach(el => {
      const tags = (el.dataset.tags || '').toLowerCase();
      el.style.display = !q || tags.includes(q) ? '' : 'none';
    });
  },

  calcStreak(moods) {
    if (!moods.length) return 0;
    const dates = new Set(moods.map(m => m.date));
    let streak = 0;
    const today = new Date();
    while (streak < 366) {
      const d = new Date(today); d.setDate(d.getDate() - streak);
      if (dates.has(d.toISOString().slice(0,10))) streak++;
      else break;
    }
    return streak;
  }
};

window.Mood = Mood;
