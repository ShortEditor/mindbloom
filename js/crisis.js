/* ============================================
   MindBloom — Crisis Support (P0)
   ============================================ */

const Crisis = {
  helplines: [
    { org:'iCall', phone:'9152987821', desc:'Psychologists, Mon–Sat 8am–10pm', color:'#52E5A3' },
    { org:'Vandrevala Foundation', phone:'1860-2662-345', desc:'24/7 Mental Health Helpline', color:'#7C6EF5' },
    { org:'AASRA', phone:'9820466627', desc:'24/7 Suicide Prevention', color:'#FF8C69' },
    { org:'iMind', phone:'080-46110007', desc:'Karnataka Mental Health Helpline', color:'#FFD166' },
  ],

  initFAB() {
    const fab = document.getElementById('crisis-fab');
    if (fab) fab.addEventListener('click', () => this.show());
  },

  show() {
    const overlay = document.getElementById('crisis-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  hide() {
    const overlay = document.getElementById('crisis-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  renderOverlay() {
    return `
    <div class="modal-overlay" id="crisis-overlay" onclick="if(event.target===this)Crisis.hide()">
      <div class="crisis-modal" style="max-height:90vh;overflow-y:auto">
        <div class="modal-handle"></div>
        <div class="crisis-header">
          <div class="crisis-icon">💙</div>
          <h2>You matter. Help is here.</h2>
          <p class="text-sm mt-2">You are not alone. These helplines are free, confidential, and available now.</p>
        </div>
        ${this.helplines.map(h => `
          <div class="helpline-card">
            <div>
              <div class="org-name">${h.org}</div>
              <div class="text-xs text-muted">${h.desc}</div>
              <div class="phone">${h.phone}</div>
            </div>
            <a href="tel:${h.phone.replace(/[^0-9]/g,'')}" class="call-btn" style="border-color:${h.color};color:${h.color};background:${h.color}22">
              📞 Call
            </a>
          </div>`).join('')}
        <div class="divider"></div>
        <div class="card-highlight mb-4">
          <h4 class="mb-2">🛡️ Your Safety Plan</h4>
          <p class="text-xs mb-3">Create a personal plan for difficult moments — stored privately on your device.</p>
          <button class="btn btn-ghost btn-full btn-sm" onclick="Crisis.showSafetyPlan()">Open Safety Plan</button>
        </div>
        <div class="card mb-4" style="border-color:var(--c-primary)">
          <h4 class="mb-2">🤝 Talk to a Therapist</h4>
          <p class="text-xs mb-3">Professional support, starting from ₹500/session.</p>
          <div class="flex gap-2">
            <a href="https://yourdost.com" target="_blank" class="btn btn-ghost btn-sm" style="flex:1">YourDOST</a>
            <a href="https://betterhelp.com" target="_blank" class="btn btn-ghost btn-sm" style="flex:1">BetterHelp</a>
          </div>
        </div>
        <button class="btn btn-ghost btn-full" onclick="Crisis.hide()">I'm safe for now</button>
      </div>
    </div>

    <div class="modal-overlay" id="safety-plan-overlay" onclick="if(event.target===this)Crisis.hideSafetyPlan()">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h3>🛡️ My Safety Plan</h3>
          <button class="modal-close" onclick="Crisis.hideSafetyPlan()">✕</button>
        </div>
        <div id="safety-plan-content"></div>
      </div>
    </div>`;
  },

  showSafetyPlan() {
    const overlay = document.getElementById('safety-plan-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    this.renderSafetyPlan();
  },

  hideSafetyPlan() {
    document.getElementById('safety-plan-overlay')?.classList.remove('open');
  },

  renderSafetyPlan() {
    const plan = MB.store.get('safety_plan', { signs:'', coping:'', contacts:'', reasons:'' });
    const el = document.getElementById('safety-plan-content');
    if (!el) return;
    el.innerHTML = `
      <div class="safety-section">
        <h4>⚠️ My Warning Signs</h4>
        <textarea class="form-textarea" id="sp-signs" placeholder="What thoughts, feelings, or behaviors signal I'm struggling? (e.g., withdrawing, not sleeping…)" rows="3" style="min-height:80px">${plan.signs}</textarea>
      </div>
      <div class="safety-section">
        <h4>🌿 My Coping Strategies</h4>
        <textarea class="form-textarea" id="sp-coping" placeholder="Things I can do on my own to feel better (e.g., breathe, walk, call a friend…)" rows="3" style="min-height:80px">${plan.coping}</textarea>
      </div>
      <div class="safety-section">
        <h4>📞 Trusted Contacts</h4>
        <textarea class="form-textarea" id="sp-contacts" placeholder="People I can reach out to when I'm struggling…" rows="3" style="min-height:80px">${plan.contacts}</textarea>
      </div>
      <div class="safety-section">
        <h4>💛 Reasons for Living</h4>
        <textarea class="form-textarea" id="sp-reasons" placeholder="What matters most to me. What I'm living for…" rows="3" style="min-height:80px">${plan.reasons}</textarea>
      </div>
      <button class="btn btn-primary btn-full mt-2" onclick="Crisis.saveSafetyPlan()">Save Safety Plan 🔒</button>
    `;
  },

  saveSafetyPlan() {
    const plan = {
      signs: document.getElementById('sp-signs')?.value || '',
      coping: document.getElementById('sp-coping')?.value || '',
      contacts: document.getElementById('sp-contacts')?.value || '',
      reasons: document.getElementById('sp-reasons')?.value || '',
      updatedAt: new Date().toISOString()
    };
    MB.store.set('safety_plan', plan);
    // Backup to Firestore
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveSafetyPlan(plan).catch(console.warn);
    }
    MB.toast('Safety plan saved 🔒', 'success');
    this.hideSafetyPlan();
  }
};

window.Crisis = Crisis;
