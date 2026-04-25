/* ============================================
   MindBloom — Personalized Daily Plan
   ============================================ */

const DailyPlan = {
  actionBank: [
    { id:'a1', icon:'🌬️', title:'5-Minute Breathing Exercise', cat:'mindfulness', time:5, desc:'Box breathing to reset your nervous system.' },
    { id:'a2', icon:'📓', title:'Write 3 Gratitudes', cat:'journaling', time:3, desc:'Name three specific things you appreciate today.' },
    { id:'a3', icon:'🚶', title:'10-Minute Walk', cat:'movement', time:10, desc:'Step outside. Fresh air and movement boost serotonin.' },
    { id:'a4', icon:'🧘', title:'Body Scan Meditation', cat:'meditation', time:10, desc:'Check in with your body from head to toe.' },
    { id:'a5', icon:'📱', title:'Social Media Break', cat:'digital', time:30, desc:'Put your phone away for 30 minutes.' },
    { id:'a6', icon:'💧', title:'Drink 2 Glasses of Water', cat:'health', time:2, desc:'Hydration directly impacts mood and cognition.' },
    { id:'a7', icon:'🌱', title:'One Kind Act', cat:'connection', time:5, desc:'Do something kind for yourself or someone else.' },
    { id:'a8', icon:'📖', title:'Read 10 Pages', cat:'enrichment', time:15, desc:'Read something that nourishes your mind — not social media.' },
    { id:'a9', icon:'🎵', title:'Listen to a Calming Playlist', cat:'mindfulness', time:10, desc:'Music is a powerful mood regulator.' },
    { id:'a10', icon:'✍️', title:'Journal Entry', cat:'journaling', time:10, desc:'Write freely about how you\'re feeling today.' },
    { id:'a11', icon:'🧊', title:'Cold Water Splash', cat:'health', time:1, desc:'Splash cold water on your face to activate the dive reflex.' },
    { id:'a12', icon:'🌸', title:'5-4-3-2-1 Grounding', cat:'anxiety', time:3, desc:'Name 5 things you see, 4 you touch, 3 you hear...' },
    { id:'a13', icon:'💪', title:'5-Minute Stretch', cat:'movement', time:5, desc:'Gently stretch your neck, shoulders, and back.' },
    { id:'a14', icon:'🫂', title:'Connect with Someone', cat:'connection', time:10, desc:'Send a message to someone you care about.' },
    { id:'a15', icon:'🌿', title:'Spend Time in Nature', cat:'mindfulness', time:15, desc:'Even a few minutes near greenery reduces cortisol.' },
    { id:'a16', icon:'🎨', title:'Creative Expression', cat:'enrichment', time:15, desc:'Draw, color, doodle, or write something creative.' },
    { id:'a17', icon:'😴', title:'Power Nap (20 min)', cat:'health', time:20, desc:'A short nap improves alertness and emotional regulation.' },
    { id:'a18', icon:'🧠', title:'Thought Record', cat:'cbt', time:10, desc:'Challenge one negative thought using the CBT method.' },
    { id:'a19', icon:'🌙', title:'Evening Wind-Down', cat:'sleep', time:15, desc:'Dim lights, put screens away, prep for restful sleep.' },
    { id:'a20', icon:'🏋️', title:'10-Minute Home Workout', cat:'movement', time:10, desc:'Jumping jacks, squats, or a short yoga flow.' },
  ],

  generate(profile) {
    const moods = MB.store.get('moods', []);
    const recent = moods.slice(-5);
    const avgMood = recent.length ? recent.reduce((s,m)=>s+m.score,0)/recent.length : 5;
    const concerns = profile?.concerns || [];

    // Priority categories based on mood/profile
    let weights = { mindfulness:3, journaling:2, movement:2, health:2, enrichment:1, connection:1, digital:1, anxiety:1, cbt:1, sleep:1 };
    if (avgMood <= 4) { weights.cbt += 3; weights.mindfulness += 2; }
    if (avgMood <= 6) { weights.movement += 2; weights.connection += 2; }
    if (concerns.some(c=>c.includes('Anxiety'))) { weights.anxiety += 3; weights.mindfulness += 2; }
    if (concerns.some(c=>c.includes('Sleep'))) { weights.sleep += 3; }
    if (concerns.some(c=>c.includes('Burnout'))) { weights.movement += 2; weights.digital += 2; }

    // Build weighted pool
    const pool = [];
    this.actionBank.forEach(a => {
      const w = weights[a.cat] || 1;
      for (let i=0; i<w; i++) pool.push(a);
    });

    // Pick 5 unique, avoiding recent repetitions
    const recentIds = MB.store.get('plan_recent_ids', []);
    const shuffled = MB.shuffle([...new Set(pool.map(a=>a.id))])
      .filter(id => !recentIds.includes(id));
    const picked = shuffled.slice(0,5).map(id => this.actionBank.find(a=>a.id===id)).filter(Boolean);

    // Update recency buffer
    const newRecent = [...picked.map(a=>a.id), ...recentIds].slice(0,10);
    MB.store.set('plan_recent_ids', newRecent);

    return picked.map(a => ({ ...a, done:false, instanceId:MB.uid() }));
  },

  render(el) {
    const today = MB.today();
    let plan = MB.store.get('plan_' + today, null);
    const profile = MB.getProfile();

    if (!plan) {
      plan = this.generate(profile);
      MB.store.set('plan_' + today, plan);
    }

    const done = plan.filter(p=>p.done).length;
    const pct = plan.length ? Math.round((done/plan.length)*100) : 0;

    el.innerHTML = `
      <div class="card-highlight mb-6">
        <div class="flex justify-between items-center mb-3">
          <div>
            <div class="font-heading font-bold">Today's Wellness Plan</div>
            <div class="text-sm text-muted">${MB.formatDate(today)}</div>
          </div>
          <div class="text-right">
            <div class="font-heading font-bold gradient-text" style="font-size:1.5rem">${pct}%</div>
            <div class="text-xs text-muted">${done}/${plan.length} done</div>
          </div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill accent" style="width:${pct}%"></div>
        </div>
      </div>

      <div id="plan-list">
        ${plan.map(item => this.planItemHTML(item)).join('')}
      </div>

      <div class="flex gap-3 mt-4">
        <button class="btn btn-ghost btn-sm" onclick="DailyPlan.regenerate()">🔀 New Plan</button>
        ${pct===100 ? '<div class="badge badge-accent" style="margin-left:auto">Plan Complete! 🎉</div>' : ''}
      </div>
      ${pct===100 ? '<div style="text-align:center;margin-top:16px;font-size:2.5rem">🌟</div>' : ''}
    `;

    this.initDragDrop();
  },

  planItemHTML(item) {
    return `
      <div class="plan-item ${item.done?'done':''}" data-id="${item.instanceId}" draggable="true"
        ondragstart="DailyPlan.onDragStart(event)" ondragover="DailyPlan.onDragOver(event)" ondrop="DailyPlan.onDrop(event)">
        <div class="plan-drag-handle" style="font-size:1rem;cursor:grab;color:var(--c-text-faint)">⠿</div>
        <div class="plan-checkbox ${item.done?'checked':''}" onclick="DailyPlan.toggle('${item.instanceId}')">
          ${item.done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
        <div style="flex:1">
          <div class="font-heading font-medium">${item.icon} ${item.title}</div>
          <div class="text-xs text-muted">${item.desc} · ${item.time} min</div>
        </div>
      </div>`;
  },

  toggle(instanceId) {
    const today = MB.today();
    const plan = MB.store.get('plan_' + today, []);
    const item = plan.find(p => p.instanceId === instanceId);
    if (!item) return;
    item.done = !item.done;
    MB.store.set('plan_' + today, plan);

    const done = plan.filter(p=>p.done).length;
    if (done === plan.length) {
      MB.confetti(document.getElementById('screen-tools'));
      MB.toast('Daily plan complete! 🌟','success');
    } else {
      MB.toast(item.done ? `${item.icon} Done!`:'Unmarked','success');
    }
    this.render(document.getElementById('tools-content'));
  },

  regenerate() {
    if (!confirm('Generate a new plan for today?')) return;
    const today = MB.today();
    MB.store.remove('plan_' + today);
    this.render(document.getElementById('tools-content'));
    MB.toast('New plan generated!','success');
  },

  dragSrc: null,
  initDragDrop() {},
  onDragStart(e) { this.dragSrc = e.currentTarget; e.currentTarget.classList.add('dragging'); },
  onDragOver(e) { e.preventDefault(); },
  onDrop(e) {
    e.preventDefault();
    const src = this.dragSrc;
    const target = e.currentTarget.closest('.plan-item');
    if (!src || !target || src === target) return;
    src.classList.remove('dragging');
    const today = MB.today();
    const plan = MB.store.get('plan_' + today, []);
    const srcId = src.dataset.id, tgtId = target.dataset.id;
    const si = plan.findIndex(p=>p.instanceId===srcId), ti = plan.findIndex(p=>p.instanceId===tgtId);
    if (si>-1 && ti>-1) { [plan[si], plan[ti]] = [plan[ti], plan[si]]; MB.store.set('plan_'+today, plan); }
    this.render(document.getElementById('tools-content'));
  }
};

window.DailyPlan = DailyPlan;
