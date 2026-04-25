/* ============================================
   MindBloom — Meditation & Mindfulness Library
   ============================================ */

const Meditation = {
  activeTab: 'library',
  currentSession: null,
  activeCategory: 'all',

  timerState: 'idle', // idle, playing, paused, completed
  timerInterval: null,
  timeRemaining: 0,
  timeTotal: 0,

  categories: [
    { id:'all', label:'All', color:'#7C6EF5' },
    { id:'sleep', label:'💤 Sleep', color:'#6B8EFF' },
    { id:'anxiety', label:'😌 Anxiety', color:'#52E5A3' },
    { id:'focus', label:'🎯 Focus', color:'#FFD166' },
    { id:'morning', label:'🌅 Morning', color:'#FF8C69' },
    { id:'breathing', label:'🌬️ Breathing', color:'#A394FF' },
    { id:'body', label:'🌿 Body Scan', color:'#48D8A0' },
    { id:'love', label:'💜 Loving-Kindness', color:'#FF6B81' },
  ],

  sessions: [
    { id:'s1', title:'Deep Sleep Journey', category:'sleep', duration:20, icon:'🌙', desc:'A gentle guided relaxation to ease you into deep, restorative sleep.', steps:['Settle into a comfortable position.', 'Let your body sink into the mattress.', 'Release the tension from today.', 'Allow sleep to wash over you.'] },
    { id:'s2', title:'Release & Rest', category:'sleep', duration:10, icon:'⭐', desc:'Progressive muscle relaxation and breathing to prepare your body for sleep.', steps:['Notice your toes, and let them relax.', 'Move up to your legs, letting them feel heavy.', 'Relax your chest and shoulders.', 'Your whole body is now completely relaxed.'] },
    { id:'s3', title:'Anxiety Relief: The Anchor', category:'anxiety', duration:10, icon:'⚓', desc:'Ground yourself with this evidence-based breathwork and body scan.', steps:['Notice your feet on the ground.', 'Feel the stability beneath you.', 'Breathe in calmly, breathe out slowly.', 'You are safe and anchored here.'] },
    { id:'s4', title:'Calm the Storm', category:'anxiety', duration:5, icon:'🌊', desc:'Quick 5-minute anxiety relief using the STOP technique and visualization.', steps:['Stop what you are doing.', 'Take a slow, deep breath.', 'Observe your thoughts without judgment.', 'Proceed mindfully with your next step.'] },
    { id:'s5', title:'Deep Focus Flow', category:'focus', duration:20, icon:'🎯', desc:'Silence distractions and settle into deep work mode.', steps:['Clear your mind of lingering tasks.', 'Focus your attention on a single point.', 'Let background noise fade away.', 'You are fully present and focused.'] },
    { id:'s6', title:'2-Minute Focus Reset', category:'focus', duration:2, icon:'⚡', desc:'A rapid focus primer when you need to reset between tasks.', steps:['Close your eyes for a moment.', 'Take three deep breaths.', 'Open your eyes and look at your task.', 'Begin with renewed clarity.'] },
    { id:'s7', title:'Morning Intention', category:'morning', duration:5, icon:'🌅', desc:'Set your day\'s intention with this gentle, energizing morning practice.', steps:['Welcome the new day.', 'Think of one thing you want to accomplish.', 'Set a positive intention.', 'Carry this energy with you today.'] },
    { id:'s8', title:'Box Breathing', category:'breathing', duration:5, icon:'📦', desc:'The Navy SEAL technique: 4-4-4-4 breathing for instant calm.', steps:['Inhale deeply for 4 seconds.', 'Hold your breath for 4 seconds.', 'Exhale completely for 4 seconds.', 'Hold empty for 4 seconds.'] },
    { id:'s9', title:'Full Body Scan', category:'body', duration:15, icon:'🌿', desc:'A complete body scan meditation releasing tension from head to toe.', steps:['Focus your attention on the top of your head.', 'Slowly scan down to your neck and shoulders.', 'Notice your chest, back, and arms.', 'Scan down to your toes, releasing all tension.'] },
    { id:'s10', title:'Loving-Kindness (Metta)', category:'love', duration:10, icon:'💜', desc:'Send compassion to yourself and others with this classic Metta practice.', steps:['May I be happy. May I be safe.', 'May my loved ones be happy and safe.', 'May everyone I meet today find peace.', 'May all beings be free from suffering.'] },
  ],

  breathePatterns: {
    box: { name:'Box Breathing', desc:'4-4-4-4: Used by Navy SEALs for stress control', phases:[{label:'Inhale',dur:4},{label:'Hold',dur:4},{label:'Exhale',dur:4},{label:'Hold',dur:4}] },
    478: { name:'4-7-8 Breathing', desc:'4-7-8: Dr. Weil\'s relaxation technique', phases:[{label:'Inhale',dur:4},{label:'Hold',dur:7},{label:'Exhale',dur:8},{label:'',dur:0}] },
    diaphragm: { name:'Diaphragmatic', desc:'5-5: Simple deep belly breathing', phases:[{label:'Inhale',dur:5},{label:'Exhale',dur:5},{label:'',dur:0},{label:'',dur:0}] },
  },

  render() {
    const el = document.getElementById('screen-meditate');
    const completions = MB.store.get('med_completions', []);
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">MEDITATION</div>
        <h2>Find your <span class="gradient-text">calm</span></h2>
        <p class="mt-2">${completions.length} session${completions.length!==1?'s':''} completed · ${Math.round(completions.reduce((s,c)=>s+c.duration,0)/60)} min total</p>
      </div>
      <div class="tab-bar mb-6">
        <button class="tab-btn active" id="mtab-library" onclick="Meditation.switchTab('library')">Library</button>
        <button class="tab-btn" id="mtab-breathe" onclick="Meditation.switchTab('breathe')">Breathing</button>
        <button class="tab-btn" id="mtab-session" onclick="Meditation.switchTab('session')">Session</button>
      </div>
      <div id="med-content"></div>
    `;
    this.switchTab('library');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['library','breathe','session'].forEach(t => document.getElementById('mtab-'+t)?.classList.toggle('active', t===tab));
    const content = document.getElementById('med-content');
    
    // Stop breathing animation if navigating away from breathe tab
    if (tab !== 'breathe') this.stopBreathe();
    
    if (tab === 'library') this.renderLibrary(content);
    else if (tab === 'breathe') this.renderBreathe(content);
    else this.renderSession(content);
  },

  renderLibrary(el) {
    el.innerHTML = `
      <div style="overflow-x:auto;margin-bottom:16px">
        <div style="display:flex;gap:8px;width:max-content;padding-bottom:4px;">
          ${this.categories.map(c => `
            <button class="chip ${this.activeCategory===c.id?'selected':''}"
              onclick="Meditation.filterCategory('${c.id}')"
              style="${this.activeCategory===c.id?`background:${c.color}22;border-color:${c.color};color:${c.color}`:''}"
            >${c.label}</button>
          `).join('')}
        </div>
      </div>
      <div id="session-list" class="stagger-children">
        ${this.getFilteredSessions().map(s => this.sessionCard(s)).join('')}
      </div>
    `;
  },

  getFilteredSessions() {
    if (this.activeCategory === 'all') return this.sessions;
    return this.sessions.filter(s => s.category === this.activeCategory);
  },

  filterCategory(cat) {
    this.activeCategory = cat;
    this.renderLibrary(document.getElementById('med-content'));
  },

  sessionCard(s) {
    const completions = MB.store.get('med_completions', []);
    const done = completions.some(c => c.id === s.id);
    const cat = this.categories.find(c => c.id === s.category);
    return `
      <div class="med-card mb-3 card-lift shimmer-hover" onclick="Meditation.openSession('${s.id}')">
        <div class="flex items-center gap-4">
          <div style="font-size:2.2rem">${s.icon}</div>
          <div style="flex:1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-heading font-semibold">${s.title}</span>
              ${done ? '<span style="color:var(--c-accent);font-size:1rem">✓</span>' : ''}
            </div>
            <p class="text-xs" style="margin:0 0 6px">${s.desc}</p>
            <div class="flex gap-2 items-center">
              <span class="duration-badge">⏱ ${s.duration} min</span>
              <div class="category-dot" style="background:${cat?.color||'#7C6EF5'}"></div>
              <span class="text-xs text-muted">${cat?.label.replace(/\p{Emoji}/gu,'').trim()}</span>
            </div>
          </div>
          <div style="color:var(--c-primary-light);font-size:1.3rem">▶</div>
        </div>
      </div>
    `;
  },

  openSession(id) {
    const session = this.sessions.find(s => s.id === id);
    if (!session) return;
    
    // Reset timer
    clearInterval(this.timerInterval);
    this.currentSession = session;
    this.timeTotal = session.duration * 60;
    this.timeRemaining = this.timeTotal;
    this.timerState = 'idle';
    
    this.switchTab('session');
  },

  renderSession(el) {
    if (!this.currentSession) {
      el.innerHTML = `<div class="text-center mt-8"><div style="font-size:3rem;margin-bottom:12px">🧘</div><p class="text-muted">Select a session from the Library to begin.</p><button class="btn btn-primary mt-4" onclick="Meditation.switchTab('library')">Browse Library</button></div>`;
      return;
    }
    
    const s = this.currentSession;
    const isPlaying = this.timerState === 'playing';
    const progress = 1 - (this.timeRemaining / this.timeTotal);
    
    // Determine which step to show based on progress
    const stepCount = s.steps.length;
    const stepIndex = Math.min(stepCount - 1, Math.floor(progress * stepCount));
    const currentStep = s.steps[stepIndex] || s.desc;

    el.innerHTML = `
      <div class="meditation-session" style="display:flex; flex-direction:column; align-items:center; text-align:center;">
        <div style="font-size:4rem;margin-bottom:16px;animation:emojiBounce 2s ease-in-out infinite">${s.icon}</div>
        <h3 class="gradient-text mb-2">${s.title}</h3>
        <p class="text-sm text-muted mb-8" style="max-width:300px;">${s.desc}</p>
        
        <div class="timer-display" style="position:relative; width:220px; height:220px; margin-bottom:32px;">
          <svg class="progress-ring" width="220" height="220" style="transform:rotate(-90deg);">
            <circle class="progress-ring__circle_bg" stroke="var(--c-border)" stroke-width="8" fill="transparent" r="100" cx="110" cy="110"/>
            <circle class="progress-ring__circle" id="timer-ring" stroke="var(--c-primary)" stroke-width="8" stroke-linecap="round" fill="transparent" r="100" cx="110" cy="110" style="stroke-dasharray: 628; stroke-dashoffset: ${628 * (1 - progress)}; transition: stroke-dashoffset 1s linear;"/>
          </svg>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center;">
            <div class="font-heading font-bold" id="timer-text" style="font-size:2.5rem; color:var(--c-text);">
              ${this.formatTime(this.timeRemaining)}
            </div>
            <div class="text-xs" style="color:var(--c-primary-light);">REMAINING</div>
          </div>
        </div>

        <div class="card card-highlight mb-8" style="width:100%; min-height:80px; display:flex; align-items:center; justify-content:center; animation:fadeIn 1s ease;">
          <p class="text-md" id="meditation-step" style="margin:0; font-style:italic;">"${currentStep}"</p>
        </div>

        <div class="flex gap-4">
          <button class="btn btn-ghost" onclick="Meditation.stopTimer()">⏹ End</button>
          <button class="btn btn-primary btn-lg" id="timer-toggle-btn" onclick="Meditation.toggleTimer()" style="width:120px;">
            ${isPlaying ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>
    `;
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  toggleTimer() {
    if (this.timerState === 'playing') {
      this.timerState = 'paused';
      clearInterval(this.timerInterval);
    } else {
      if (this.timeRemaining <= 0) {
        this.timeRemaining = this.timeTotal;
      }
      this.timerState = 'playing';
      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.timeRemaining = 0;
          this.completeSession();
        }
        this.updateTimerUI();
      }, 1000);
    }
    this.updateTimerUI();
  },

  stopTimer() {
    clearInterval(this.timerInterval);
    this.timerState = 'idle';
    this.timeRemaining = this.timeTotal;
    this.updateTimerUI();
  },

  updateTimerUI() {
    const textEl = document.getElementById('timer-text');
    const ringEl = document.getElementById('timer-ring');
    const btnEl = document.getElementById('timer-toggle-btn');
    const stepEl = document.getElementById('meditation-step');
    
    if (!textEl) return; // Not on the view

    const isPlaying = this.timerState === 'playing';
    const progress = 1 - (this.timeRemaining / this.timeTotal);
    
    textEl.textContent = this.formatTime(this.timeRemaining);
    if (ringEl) {
      ringEl.style.strokeDashoffset = 628 * (1 - progress);
    }
    
    if (btnEl) {
      btnEl.innerHTML = isPlaying ? '⏸ Pause' : '▶ Start';
    }

    if (stepEl && this.currentSession) {
      const stepCount = this.currentSession.steps.length;
      const stepIndex = Math.min(stepCount - 1, Math.floor(progress * stepCount));
      const currentStep = this.currentSession.steps[stepIndex] || this.currentSession.desc;
      if (stepEl.textContent !== `"${currentStep}"`) {
        stepEl.style.animation = 'none';
        stepEl.offsetHeight; /* trigger reflow */
        stepEl.style.animation = 'fadeIn 1s ease';
        stepEl.textContent = `"${currentStep}"`;
      }
    }
  },

  completeSession() {
    clearInterval(this.timerInterval);
    this.timerState = 'completed';
    this.updateTimerUI();
    
    const completions = MB.store.get('med_completions', []);
    const today = MB.today();
    const already = completions.find(c => c.id === this.currentSession.id && c.date === today);
    if (!already) {
      const completion = { id: this.currentSession.id, date: today, duration: this.currentSession.duration };
      completions.push(completion);
      MB.store.set('med_completions', completions);
      if (window.FBService && window.auth?.currentUser) {
        FBService.saveMedCompletion(completion).catch(console.warn);
      }
    }
    
    MB.confetti(document.getElementById('screen-meditate'));
    
    const content = document.getElementById('med-content');
    content.innerHTML = `
      <div class="card-highlight text-center mt-4" style="animation:scaleIn 0.5s ease both; padding:40px 20px;">
        <div style="font-size:4rem;margin-bottom:16px">🎉</div>
        <h3 class="gradient-text">Session Complete!</h3>
        <p class="text-sm mt-2 mb-6">${this.currentSession.duration} minutes of mindfulness.<br>You are prioritizing your wellness.</p>
        <button class="btn btn-primary" onclick="Meditation.switchTab('library')">Browse More Sessions</button>
      </div>`;
    
    MB.toast('Meditation complete! 🧘', 'success');
  },

  /* -------- BREATHING TOOL -------- */
  
  renderBreathe(el) {
    const activePattern = MB.store.get('breathe_pattern', 'box');
    const pattern = this.breathePatterns[activePattern];
    el.innerHTML = `
      <h3 class="text-center mb-2">Guided Breathing</h3>
      <p class="text-center text-sm mb-6 text-muted">Choose a technique and follow the circle.</p>
      <div class="chip-group mb-6" style="justify-content:center">
        ${Object.entries(this.breathePatterns).map(([k,p]) =>
          `<div class="chip ${activePattern===k?'selected':''}" onclick="Meditation.selectPattern('${k}')">${p.name}</div>`
        ).join('')}
      </div>
      <div class="card text-center mb-4" style="padding:12px 16px">
        <div class="font-heading font-semibold" style="font-size:1rem">${pattern.name}</div>
        <div class="text-xs text-muted">${pattern.desc}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 0">
        <div style="position:relative;width:240px;height:240px;margin:0 auto">
          <div id="breathe-circle" class="breathing-circle" style="width:240px;height:240px;position:absolute;inset:0;transform:scale(0.65);opacity:0.6;border-radius:50%;background:var(--c-primary-light);transition:transform 1s ease, background 1s ease;"></div>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1">
            <div class="font-heading font-bold" style="font-size:3rem;line-height:1;color:white;" id="breathe-count">4</div>
            <div class="text-sm" style="color:rgba(255,255,255,0.9);text-transform:uppercase;letter-spacing:1px;margin-top:4px;" id="breathe-label">Ready</div>
          </div>
        </div>
        <div class="flex gap-3 mt-10">
          <button class="btn btn-ghost" id="breathe-stop-btn" onclick="Meditation.stopBreathe()" style="display:none">⏹ Stop</button>
          <button class="btn btn-primary btn-lg" id="breathe-start-btn" onclick="Meditation.startBreathe()" style="width:180px;">Start Breathing</button>
        </div>
        <div id="breathe-cycles" class="text-sm text-muted mt-6">Completed cycles: <strong id="cycle-count" style="color:var(--c-text);">0</strong></div>
      </div>
    `;
  },

  selectPattern(key) {
    MB.store.set('breathe_pattern', key);
    this.stopBreathe();
    this.renderBreathe(document.getElementById('med-content'));
  },

  startBreathe() {
    document.getElementById('breathe-start-btn').style.display = 'none';
    document.getElementById('breathe-stop-btn').style.display = '';
    let cycleCount = 0;
    const patKey = MB.store.get('breathe_pattern', 'box');
    const pattern = this.breathePatterns[patKey];
    const phases = pattern.phases.filter(p => p.dur > 0);
    let phaseIdx = 0;

    const runPhase = () => {
      if (this.breatheStopped) return;
      const phase = phases[phaseIdx];
      const circle = document.getElementById('breathe-circle');
      const label = document.getElementById('breathe-label');
      const countEl = document.getElementById('breathe-count');
      if (!circle) return;

      label.textContent = phase.label;
      circle.style.transition = `transform ${phase.dur}s linear, background 0.5s ease`;
      
      if (phase.label === 'Inhale') {
        circle.style.transform = 'scale(1)';
        circle.style.background = 'var(--c-primary)';
      } else if (phase.label === 'Exhale') {
        circle.style.transform = 'scale(0.5)';
        circle.style.background = 'var(--c-accent)';
      } else {
        circle.style.background = 'var(--c-gold)';
      }

      let remaining = phase.dur;
      countEl.textContent = remaining;
      
      clearInterval(this.breatheInterval);
      this.breatheInterval = setInterval(() => {
        if (this.breatheStopped) { clearInterval(this.breatheInterval); return; }
        remaining--;
        countEl.textContent = Math.max(0, remaining);
        if (remaining <= 0) {
          clearInterval(this.breatheInterval);
          phaseIdx++;
          if (phaseIdx >= phases.length) {
            phaseIdx = 0;
            cycleCount++;
            const cycleEl = document.getElementById('cycle-count');
            if (cycleEl) cycleEl.textContent = cycleCount;
          }
          setTimeout(runPhase, 50); // slight delay to process DOM updates
        }
      }, 1000);
    };

    this.breatheStopped = false;
    runPhase();
  },

  stopBreathe() {
    this.breatheStopped = true;
    clearInterval(this.breatheInterval);
    
    if (document.getElementById('breathe-start-btn')) document.getElementById('breathe-start-btn').style.display = '';
    if (document.getElementById('breathe-stop-btn')) document.getElementById('breathe-stop-btn').style.display = 'none';
    
    const circle = document.getElementById('breathe-circle');
    if (circle) { 
      circle.style.transition = 'transform 0.5s ease, background 0.5s ease';
      circle.style.transform = 'scale(0.65)'; 
      circle.style.background = 'var(--c-primary-light)'; 
    }
    
    const label = document.getElementById('breathe-label');
    if (label) label.textContent = 'Ready';
    
    const count = document.getElementById('breathe-count');
    if (count) count.textContent = '4';
  },
};

window.Meditation = Meditation;
