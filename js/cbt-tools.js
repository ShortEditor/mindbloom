/* ============================================
   MindBloom — CBT & DBT Tools
   ============================================ */

const CBTTools = {
  activeTab: 'tools',
  activeTool: null,

  tools: [
    { id:'thought', icon:'🧠', label:'Thought Record', color:'#7C6EF5', tag:'CBT', desc:'Challenge negative thoughts with evidence-based cognitive restructuring.' },
    { id:'activation', icon:'📅', label:'Behavioral Activation', color:'#52E5A3', tag:'CBT', desc:'Schedule meaningful activities to lift your mood and counter depression.' },
    { id:'worry', icon:'⏰', label:'Worry Time', color:'#FFD166', tag:'CBT', desc:'Defer anxious thoughts to a dedicated 15-minute window.' },
    { id:'stop', icon:'🛑', label:'STOP Skill', color:'#FF8C69', tag:'DBT', desc:'Stop, Take a breath, Observe, Proceed — for impulsive moments.' },
    { id:'tipp', icon:'🧊', label:'TIPP Skill', color:'#A394FF', tag:'DBT', desc:'Temperature, Intense exercise, Paced breathing, Relaxation.' },
  ],

  explainers: {
    thought:'Cognitive Behavioral Therapy (CBT) teaches us that our thoughts, feelings, and behaviors are interconnected. By identifying and challenging automatic negative thoughts (ANTs), we can change how we feel and act. The Thought Record is the core CBT exercise — used in therapy worldwide.',
    activation:'Behavioral Activation is a powerful CBT technique for depression. When we feel low, we tend to withdraw — which deepens the low mood. BA breaks this cycle by scheduling small, meaningful activities that provide a sense of mastery or pleasure.',
    worry:'Worry Time is a structured CBT technique that "contains" anxiety. Instead of worrying all day, you postpone worries to a designated 15-minute slot. Over time, this reduces anxiety\'s hold on your daily life.',
    stop:'The STOP skill from DBT (Dialectical Behavior Therapy) helps you pause before reacting in emotionally charged moments — preventing impulsive actions you might regret.',
    tipp:'TIPP is a DBT distress tolerance skill designed to rapidly reduce intense emotional states by changing your body chemistry. It\'s especially useful in crisis moments or overwhelming emotions.',
  },

  render() {
    const el = document.getElementById('screen-tools');
    const saved = MB.store.get('cbt_records', []);
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">CBT & DBT TOOLS</div>
        <h2>Rewire your <span class="gradient-text">thinking</span></h2>
        <p class="mt-2">Evidence-based self-help tools. Not a substitute for professional care.</p>
      </div>
      <div class="tab-bar mb-6">
        <button class="tab-btn active" id="ttab-tools" onclick="CBTTools.switchTab('tools')">Tools</button>
        <button class="tab-btn" id="ttab-history" onclick="CBTTools.switchTab('history')">History</button>
        <button class="tab-btn" id="ttab-plan" onclick="CBTTools.switchTab('plan')">Daily Plan</button>
      </div>
      <div id="tools-content"></div>
    `;
    this.switchTab('tools');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['tools','history','plan'].forEach(t => document.getElementById('ttab-'+t)?.classList.toggle('active', t===tab));
    const content = document.getElementById('tools-content');
    if (tab === 'tools') this.renderTools(content);
    else if (tab === 'history') this.renderHistory(content);
    else DailyPlan.render(content);
  },

  renderTools(el) {
    if (this.activeTool) { this.renderActiveTool(el); return; }
    el.innerHTML = `<div class="stagger-children">
      ${this.tools.map(t => `
        <div class="tool-card mb-3 card-lift shimmer-hover" onclick="CBTTools.openTool('${t.id}')">
          <div class="tool-header">
            <div class="tool-icon" style="background:${t.color}22">${t.icon}</div>
            <div style="flex:1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-heading font-semibold">${t.label}</span>
                <span class="badge badge-${t.tag==='CBT'?'primary':'accent'}">${t.tag}</span>
              </div>
              <p class="text-xs" style="margin:0">${t.desc}</p>
            </div>
            <div style="color:var(--c-text-faint)">→</div>
          </div>
        </div>`).join('')}
    </div>`;
  },

  openTool(id) {
    this.activeTool = id;
    this.renderActiveTool(document.getElementById('tools-content'));
  },

  backToTools() {
    this.activeTool = null;
    this.renderTools(document.getElementById('tools-content'));
  },

  renderActiveTool(el) {
    const tool = this.tools.find(t => t.id === this.activeTool);
    const renderers = { thought: this.renderThoughtRecord, activation: this.renderActivation, worry: this.renderWorry, stop: this.renderSTOP, tipp: this.renderTIPP };
    const body = renderers[this.activeTool]?.call(this) || '<p>Tool not found.</p>';
    el.innerHTML = `
      <button class="btn btn-ghost btn-sm mb-4" onclick="CBTTools.backToTools()">← All Tools</button>
      <div class="flex items-center gap-3 mb-2">
        <div class="tool-icon" style="background:${tool?.color}22;width:40px;height:40px">${tool?.icon}</div>
        <div>
          <h3>${tool?.label}</h3>
          <span class="badge badge-${tool?.tag==='CBT'?'primary':'accent'}">${tool?.tag}</span>
        </div>
      </div>
      ${this.accordionExplainer(this.activeTool)}
      <div id="tool-body" class="mt-4">${body}</div>
    `;
  },

  accordionExplainer(id) {
    return `<div class="accordion-item mt-3" id="explainer-acc">
      <div class="accordion-header" onclick="CBTTools.toggleExplainer()">
        <span class="text-sm font-heading font-semibold">💡 Learn why this works</span>
        <span class="accordion-arrow">▼</span>
      </div>
      <div class="accordion-body">
        <p class="text-sm">${this.explainers[id] || ''}</p>
      </div>
    </div>`;
  },

  toggleExplainer() {
    document.getElementById('explainer-acc')?.classList.toggle('open');
  },

  renderThoughtRecord() {
    return `
      <div class="thought-col"><div class="col-label">1. Situation</div>
        <textarea class="form-textarea" id="tr-situation" placeholder="Briefly describe what happened. Where were you? Who was there?" rows="2" style="min-height:70px"></textarea></div>
      <div class="thought-col"><div class="col-label">2. Automatic Thought</div>
        <textarea class="form-textarea" id="tr-thought" placeholder="What went through your mind? (e.g., 'I always mess things up')" rows="2" style="min-height:70px"></textarea></div>
      <div class="thought-col"><div class="col-label">3. Emotion & Intensity</div>
        <input class="form-input" id="tr-emotion" placeholder="e.g., Anxious (80%), Sad (60%)">
      </div>
      <div class="thought-col"><div class="col-label">4. Evidence Supporting the Thought</div>
        <textarea class="form-textarea" id="tr-evidence-for" placeholder="What facts support this thought?" rows="2" style="min-height:70px"></textarea></div>
      <div class="thought-col"><div class="col-label">5. Evidence Against the Thought</div>
        <textarea class="form-textarea" id="tr-evidence-against" placeholder="What facts contradict this thought? What would you tell a friend?" rows="2" style="min-height:70px"></textarea></div>
      <div class="thought-col"><div class="col-label">6. Balanced Thought</div>
        <textarea class="form-textarea" id="tr-balanced" placeholder="Write a more balanced, realistic view that considers all the evidence…" rows="2" style="min-height:70px"></textarea></div>
      <button class="btn btn-primary btn-full mt-4" onclick="CBTTools.saveThoughtRecord()">Save Record ✓</button>
    `;
  },

  saveThoughtRecord() {
    const get = id => document.getElementById(id)?.value?.trim() || '';
    const record = { type:'thought', id:MB.uid(), date:MB.today(), timestamp:new Date().toISOString(),
      situation:get('tr-situation'), thought:get('tr-thought'), emotion:get('tr-emotion'),
      evidenceFor:get('tr-evidence-for'), evidenceAgainst:get('tr-evidence-against'), balanced:get('tr-balanced') };
    if (!record.situation && !record.thought) { MB.toast('Fill in at least Situation and Thought.','error'); return; }
    const records = MB.store.get('cbt_records', []);
    records.push(record);
    MB.store.set('cbt_records', records);
    MB.toast('Thought record saved! 🧠','success');
    MB.confetti(document.getElementById('screen-tools'));
    this.backToTools();
  },

  renderActivation() {
    const activities = MB.store.get('ba_activities', []);
    return `
      <p class="text-sm mb-4">Schedule activities that bring you <strong>Pleasure</strong> or a sense of <strong>Achievement</strong>. Even small ones count.</p>
      <div class="flex gap-3 mb-4">
        <input class="form-input" id="ba-activity" placeholder="Activity name (e.g., 10-min walk)" style="flex:1">
        <select class="form-select" id="ba-type" style="width:auto;padding:12px">
          <option value="pleasure">😊 Pleasure</option>
          <option value="mastery">💪 Achievement</option>
        </select>
      </div>
      <button class="btn btn-accent btn-full mb-6" onclick="CBTTools.addActivity()">+ Add Activity</button>
      <div id="ba-list">
        ${activities.length ? activities.map(a => `
          <div class="plan-item ${a.done?'done':''}" data-id="${a.id}">
            <div class="plan-checkbox ${a.done?'checked':''}" onclick="CBTTools.toggleActivity('${a.id}')">
              ${a.done ? '✓' : ''}
            </div>
            <div style="flex:1">
              <div class="font-heading font-medium">${a.name}</div>
              <div class="text-xs text-muted">${a.type === 'pleasure' ? '😊 Pleasure' : '💪 Achievement'}</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="CBTTools.removeActivity('${a.id}')">✕</button>
          </div>`).join('') : '<p class="text-center text-muted">No activities yet. Add one above!</p>'}
      </div>
    `;
  },

  addActivity() {
    const name = document.getElementById('ba-activity')?.value.trim();
    const type = document.getElementById('ba-type')?.value;
    if (!name) { MB.toast('Enter an activity name.','error'); return; }
    const activities = MB.store.get('ba_activities', []);
    activities.push({ id:MB.uid(), name, type, done:false, date:MB.today() });
    MB.store.set('ba_activities', activities);
    MB.toast('Activity added!','success');
    this.renderActiveTool(document.getElementById('tools-content'));
  },

  toggleActivity(id) {
    const activities = MB.store.get('ba_activities', []);
    const a = activities.find(x=>x.id===id);
    if (a) a.done = !a.done;
    MB.store.set('ba_activities', activities);
    this.renderActiveTool(document.getElementById('tools-content'));
  },

  removeActivity(id) {
    const activities = MB.store.get('ba_activities', []).filter(a=>a.id!==id);
    MB.store.set('ba_activities', activities);
    this.renderActiveTool(document.getElementById('tools-content'));
  },

  renderWorry() {
    const worries = MB.store.get('worries', []);
    let timerInterval = null;
    return `
      <p class="text-sm mb-4">Write down your worries here. Then <strong>schedule</strong> a 15-minute window later to address them — and let them go for now.</p>
      <div class="flex gap-3 mb-4">
        <input class="form-input" id="worry-input" placeholder="What's worrying you?" style="flex:1">
        <button class="btn btn-primary" onclick="CBTTools.addWorry()">+ Add</button>
      </div>
      <div id="worry-list" class="mb-6">
        ${worries.length ? worries.map(w => `
          <div class="card mb-2 flex items-center gap-3" style="padding:12px 16px">
            <span class="text-sm" style="flex:1">${w.text}</span>
            <span class="text-xs text-muted">${MB.formatDate(w.date)}</span>
            <button class="btn btn-ghost btn-sm" onclick="CBTTools.removeWorry('${w.id}')">✕</button>
          </div>`).join('') : '<p class="text-center text-muted text-sm">No worries logged.</p>'}
      </div>
      <div class="card text-center" style="padding:24px">
        <div style="font-size:2rem;margin-bottom:8px">⏰</div>
        <h4 class="mb-2">Start Worry Time</h4>
        <p class="text-xs mb-4">Set aside 15 minutes now to think through your worries. When the timer ends, stop — and return to your day.</p>
        <div class="font-heading font-bold gradient-text" style="font-size:3rem" id="worry-timer">15:00</div>
        <div class="flex gap-3 justify-center mt-4">
          <button class="btn btn-primary" id="worry-timer-btn" onclick="CBTTools.startWorryTimer()">Start Timer</button>
        </div>
      </div>
    `;
  },

  addWorry() {
    const text = document.getElementById('worry-input')?.value.trim();
    if (!text) return;
    const worries = MB.store.get('worries', []);
    worries.push({ id:MB.uid(), text, date:MB.today() });
    MB.store.set('worries', worries);
    MB.toast('Worry logged.','default');
    this.renderActiveTool(document.getElementById('tools-content'));
  },

  removeWorry(id) {
    MB.store.set('worries', MB.store.get('worries',[]).filter(w=>w.id!==id));
    this.renderActiveTool(document.getElementById('tools-content'));
  },

  startWorryTimer() {
    let secs = 15 * 60;
    const btn = document.getElementById('worry-timer-btn');
    const timerEl = document.getElementById('worry-timer');
    if (btn) { btn.textContent = 'Running…'; btn.disabled = true; }
    const interval = setInterval(() => {
      secs--;
      const m = Math.floor(secs/60), s = secs%60;
      if (timerEl) timerEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
      if (secs <= 0) { clearInterval(interval); MB.toast('Worry time is over. Return to your day! 🌿','success'); if(btn){btn.textContent='Start Timer';btn.disabled=false;} }
    }, 1000);
  },

  renderSTOP() {
    const steps = [
      { letter:'S', word:'Stop', color:'#FF4757', desc:'Whatever you\'re doing — pause. Don\'t act yet. Just stop.' },
      { letter:'T', word:'Take a Breath', color:'#FF8C69', desc:'Take one slow, deep breath. Inhale for 4 counts, exhale for 4 counts. This activates your parasympathetic nervous system.' },
      { letter:'O', word:'Observe', color:'#FFD166', desc:'Notice what you\'re experiencing: what thoughts are present? What emotions? What sensations in your body? Just observe without judging.' },
      { letter:'P', word:'Proceed Mindfully', color:'#52E5A3', desc:'Now ask: what action is most effective right now? What aligns with your values and goals? Proceed with intention, not reaction.' },
    ];
    return `
      <p class="text-sm mb-6">Use this skill when you feel overwhelmed, reactive, or about to make an impulsive decision.</p>
      ${steps.map((s,i) => `
        <div class="card mb-3 card-lift" style="border-left:4px solid ${s.color}">
          <div class="flex items-center gap-4 mb-2">
            <div style="width:48px;height:48px;border-radius:50%;background:${s.color}22;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:${s.color};font-family:var(--font-heading)">${s.letter}</div>
            <div><div class="font-heading font-bold">${s.word}</div></div>
          </div>
          <p class="text-sm">${s.desc}</p>
        </div>`).join('')}
      <button class="btn btn-primary btn-full mt-2" onclick="CBTTools.logSTOP()">I Used This Skill ✓</button>
    `;
  },

  logSTOP() {
    const records = MB.store.get('cbt_records', []);
    records.push({ type:'stop', id:MB.uid(), date:MB.today(), timestamp:new Date().toISOString() });
    MB.store.set('cbt_records', records);
    MB.toast('STOP skill logged! 🛑','success');
    this.backToTools();
  },

  renderTIPP() {
    const skills = [
      { letter:'T', label:'Temperature', color:'#6B8EFF', icon:'🧊', desc:'Change your body temperature quickly. Hold an ice cube, splash cold water on your face, or hold your breath and dunk your face in cold water for 30 seconds. This activates the dive reflex and rapidly reduces emotion intensity.' },
      { letter:'I', label:'Intense Exercise', color:'#FF8C69', icon:'🏃', desc:'Engage in brief, vigorous physical activity. 20 jumping jacks, a sprint, or intense push-ups for 1–2 minutes. This metabolizes stress hormones (adrenaline, cortisol) and shifts your body state.' },
      { letter:'P', label:'Paced Breathing', color:'#52E5A3', icon:'💨', desc:'Breathe out longer than you breathe in. Try: inhale 4 counts, exhale 6–8 counts. This activates the vagus nerve and parasympathetic system, bringing calm.' },
      { letter:'P', label:'Paired Relaxation', color:'#A394FF', icon:'🌿', desc:'Tense each muscle group fully for 5 seconds, then release completely. Start from your toes upward. The contrast between tension and release creates deep physical relaxation.' },
    ];
    return `
      <p class="text-sm mb-6">TIPP is for moments of intense distress. Use it to change your body chemistry before trying other skills.</p>
      ${skills.map((s,i) => `
        <div class="accordion-item mb-2">
          <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
            <div class="flex items-center gap-3">
              <div style="width:36px;height:36px;border-radius:50%;background:${s.color}22;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:${s.color};font-family:var(--font-heading)">${s.letter}</div>
              <div>
                <div class="font-heading font-semibold">${s.icon} ${s.label}</div>
              </div>
            </div>
            <span class="accordion-arrow">▼</span>
          </div>
          <div class="accordion-body"><p class="text-sm">${s.desc}</p></div>
        </div>`).join('')}
      <button class="btn btn-primary btn-full mt-4" onclick="CBTTools.logTIPP()">I Used TIPP ✓</button>
    `;
  },

  logTIPP() {
    const records = MB.store.get('cbt_records', []);
    records.push({ type:'tipp', id:MB.uid(), date:MB.today(), timestamp:new Date().toISOString() });
    MB.store.set('cbt_records', records);
    MB.toast('TIPP skill logged! 🧊','success');
    this.backToTools();
  },

  renderHistory(el) {
    const records = MB.store.get('cbt_records', []).slice().reverse();
    el.innerHTML = `
      <div id="cbt-history-list">
        ${records.length ? records.map(r => this.historyCard(r)).join('') : `
          <div class="text-center mt-8">
            <div style="font-size:3rem;margin-bottom:12px">📋</div>
            <p class="text-muted">No tool records yet. Open a tool and save a session.</p>
          </div>`}
      </div>`;
  },

  historyCard(r) {
    const tool = this.tools.find(t => t.id === r.type);
    return `
      <div class="card mb-3">
        <div class="flex items-center gap-3 mb-2">
          <span style="font-size:1.5rem">${tool?.icon||'📝'}</span>
          <div>
            <div class="font-heading font-semibold">${tool?.label||r.type}</div>
            <div class="text-xs text-muted">${MB.formatDate(r.date)}</div>
          </div>
          <span class="badge badge-${tool?.tag==='CBT'?'primary':'accent'} ml-auto">${tool?.tag||'CBT'}</span>
        </div>
        ${r.situation ? `<p class="text-xs text-muted"><strong>Situation:</strong> ${MB.truncate(r.situation,80)}</p>` : ''}
        ${r.balanced ? `<p class="text-xs mt-1" style="color:var(--c-accent)"><strong>Balanced:</strong> ${MB.truncate(r.balanced,80)}</p>` : ''}
      </div>`;
  },
};

window.CBTTools = CBTTools;
