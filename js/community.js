/* ============================================
   MindBloom — Community & Peer Support
   ============================================ */

const Community = {
  activeChannel: 'all',
  activeTab: 'feed',

  channels: [
    { id:'all', label:'🌍 All', color:'#7C6EF5' },
    { id:'anxiety', label:'😰 Anxiety', color:'#52E5A3' },
    { id:'depression', label:'💙 Depression', color:'#6B8EFF' },
    { id:'work', label:'💼 Work Stress', color:'#FFD166' },
    { id:'relationships', label:'💕 Relationships', color:'#FF6B81' },
    { id:'parenting', label:'👶 Parenting', color:'#FF8C69' },
    { id:'recovery', label:'🌱 Recovery', color:'#48D8A0' },
  ],

  reactions: [
    { id:'hear', emoji:'💙', label:'I hear you' },
    { id:'alone', emoji:'🤝', label:'You\'re not alone' },
    { id:'share', emoji:'🌱', label:'Thank you for sharing' },
    { id:'strong', emoji:'💪', label:'You\'ve got this' },
  ],

  seedPosts: [
    { id:'p1', channel:'anxiety', anon:'Starlight_42', avatar:'🌟', time:'2h ago', content:'Has anyone tried the 4-7-8 breathing for panic attacks? I\'ve been struggling with them before meetings and wondering if there\'s something quick that helps.', reactions:{hear:14,alone:8,share:5,strong:11} },
    { id:'p2', channel:'work', anon:'Quiet_River', avatar:'🌊', time:'4h ago', content:'My manager scheduled another 8pm meeting. I\'m so exhausted. I keep telling myself to set boundaries but I\'m scared of losing my job. Is anyone else navigating this?', reactions:{hear:23,alone:19,share:7,strong:15} },
    { id:'p3', channel:'depression', anon:'Soft_Mountain', avatar:'⛰️', time:'6h ago', content:'Today I got out of bed before noon and made breakfast. I know that sounds small but it\'s been weeks since I managed that. Small wins.', reactions:{hear:31,alone:12,share:22,strong:28} },
    { id:'p4', channel:'relationships', anon:'Silver_Birch', avatar:'🌲', time:'8h ago', content:'I told my partner I need more emotional support and they actually listened. First time I\'ve felt truly heard in months. It\'s possible to ask for what you need.', reactions:{hear:18,alone:6,share:14,strong:21} },
    { id:'p5', channel:'anxiety', anon:'Golden_Dusk', avatar:'🌅', time:'12h ago', content:'Therapy waitlist is 4 months. 4 months. Meanwhile I\'m trying to manage on my own. Using the journal here has genuinely helped a bit. Taking it day by day.', reactions:{hear:27,alone:31,share:9,strong:18} },
    { id:'p6', channel:'parenting', anon:'Warm_Harbor', avatar:'⚓', time:'1d ago', content:'Anyone else feel crushing guilt about snapping at your kids when you\'re burned out? I love them so much but I\'m running on empty. How do you fill your own cup?', reactions:{hear:34,alone:28,share:11,strong:20} },
    { id:'p7', channel:'recovery', anon:'New_Leaf', avatar:'🍃', time:'1d ago', content:'30 days sober today. I didn\'t think I\'d make it past week one. If you\'re on day 1 right now — please keep going. I see you.', reactions:{hear:45,alone:22,share:38,strong:52} },
    { id:'p8', channel:'depression', anon:'Pale_Moon', avatar:'🌙', time:'2d ago', content:'I\'ve started saying one kind thing to myself before I sleep. Feels fake at first. But I\'m noticing it gets a little easier each night. Dr Neff\'s self-compassion stuff actually works.', reactions:{hear:19,alone:8,share:15,strong:24} },
    { id:'p9', channel:'work', anon:'Deep_Current', avatar:'💧', time:'2d ago', content:'Quit my toxic job with nothing lined up. Terrifying and liberating. Mental health has to come first. Savings will last a few months. Wish me luck.', reactions:{hear:29,alone:11,share:8,strong:41} },
    { id:'p10', channel:'anxiety', anon:'Cedar_Sky', avatar:'🌤️', time:'3d ago', content:'Grounding technique that\'s been working for me: hold an ice cube. The cold sensation immediately interrupts the anxiety spiral. Sounds weird, works well.', reactions:{hear:16,alone:7,share:12,strong:19} },
  ],

  myReactions: {},
  buddyStatus: null,

  render() {
    const el = document.getElementById('screen-community');
    this.myReactions = MB.store.get('community_reactions', {});
    this.buddyStatus = MB.store.get('buddy_status', null);
    el.innerHTML = `
      <div class="section-header">
        <div class="greeting">COMMUNITY</div>
        <h2>You are <span class="gradient-text">not alone</span></h2>
        <p class="mt-2">Anonymous · Judgment-free · Moderated with care</p>
      </div>
      <div class="tab-bar mb-4">
        <button class="tab-btn active" id="ctab-feed" onclick="Community.switchTab('feed')">Feed</button>
        <button class="tab-btn" id="ctab-post" onclick="Community.switchTab('post')">Share</button>
        <button class="tab-btn" id="ctab-buddy" onclick="Community.switchTab('buddy')">Buddy Match</button>
      </div>
      <div id="community-content"></div>
    `;
    this.switchTab('feed');
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['feed','post','buddy'].forEach(t => document.getElementById('ctab-'+t)?.classList.toggle('active', t===tab));
    const content = document.getElementById('community-content');
    if (tab === 'feed') this.renderFeed(content);
    else if (tab === 'post') this.renderPost(content);
    else this.renderBuddy(content);
  },

  renderFeed(el) {
    const userPosts = MB.store.get('community_posts', []);
    const allPosts = [...userPosts.map(p => ({...p, isOwn:true})), ...this.seedPosts].sort((a,b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
    const filtered = this.activeChannel === 'all' ? allPosts : allPosts.filter(p => p.channel === this.activeChannel);

    el.innerHTML = `
      <div style="overflow-x:auto;margin-bottom:16px">
        <div style="display:flex;gap:8px;width:max-content;padding-bottom:4px">
          ${this.channels.map(c => `
            <button class="chip ${this.activeChannel===c.id?'selected':''}"
              onclick="Community.filterChannel('${c.id}')"
              style="${this.activeChannel===c.id?`background:${c.color}22;border-color:${c.color};color:${c.color}`:''}"
            >${c.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="stagger-children" id="post-feed">
        ${filtered.length ? filtered.map(p => this.postCard(p)).join('') : '<p class="text-center text-muted mt-8">No posts in this channel yet. Be the first to share!</p>'}
      </div>
    `;
  },

  filterChannel(ch) {
    this.activeChannel = ch;
    this.renderFeed(document.getElementById('community-content'));
  },

  postCard(p) {
    const channel = this.channels.find(c=>c.id===p.channel);
    const isOwn = p.isOwn;
    return `
      <div class="post-card mb-4 ${isOwn?'card-highlight':''}">
        <div class="post-header">
          <div class="avatar" style="background:${channel?.color||'#7C6EF5'}22;font-size:1.2rem">${p.avatar||'🌿'}</div>
          <div style="flex:1">
            <div class="font-heading font-semibold text-sm">${isOwn?'You (Anonymous)':p.anon}</div>
            <div class="text-xs text-muted">${p.time || MB.formatDate(p.date)} · ${channel?.label||''}</div>
          </div>
          ${isOwn ? '<span class="badge badge-accent">My post</span>' : ''}
        </div>
        <p class="text-sm" style="color:var(--c-text);line-height:1.7">${p.content}</p>
        <div class="post-reactions">
          ${this.reactions.map(r => {
            const count = (p.reactions?.[r.id]||0) + (this.myReactions[p.id+r.id]?1:0);
            const active = !!this.myReactions[p.id+r.id];
            return `<button class="reaction-btn ${active?'active':''}" onclick="Community.react('${p.id}','${r.id}')">
              ${r.emoji} ${r.label} ${count>0?`<span style="font-weight:700">${count}</span>`:''}
            </button>`;
          }).join('')}
        </div>
      </div>`;
  },

  react(postId, reactionId) {
    const key = postId + reactionId;
    if (this.myReactions[key]) delete this.myReactions[key];
    else this.myReactions[key] = true;
    MB.store.set('community_reactions', this.myReactions);
    this.renderFeed(document.getElementById('community-content'));
  },

  renderPost(el) {
    el.innerHTML = `
      <div class="card mb-4" style="border-color:var(--c-primary);padding:16px 20px">
        <div class="flex items-center gap-2">
          <span>🔒</span>
          <p class="text-sm" style="margin:0">Your post is <strong>100% anonymous</strong>. No name, no profile picture — ever.</p>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Channel</label>
        <select class="form-select" id="post-channel">
          ${this.channels.filter(c=>c.id!=='all').map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Your message</label>
        <textarea class="form-textarea" id="post-content" placeholder="Share what's on your mind. You are safe here."
          rows="5" oninput="Community.checkContent(this)"></textarea>
        <div class="text-xs text-muted mt-2" id="post-warning" style="display:none">⚠️ If you're in crisis, please use the <strong>I Need Help Now</strong> button above.</div>
      </div>
      <div class="card mb-4" style="padding:12px 16px;background:rgba(82,229,163,0.06)">
        <p class="text-xs text-muted">Community Guidelines: No identity disclosure · No harmful advice · Treat others with kindness · AI-moderated + human review within 2 hours</p>
      </div>
      <button class="btn btn-primary btn-full" onclick="Community.submitPost()">Share Anonymously 🌱</button>
    `;
  },

  checkContent(textarea) {
    const warning = document.getElementById('post-warning');
    if (MB.isCrisis(textarea.value)) {
      if (warning) warning.style.display = '';
      Crisis.show();
    } else {
      if (warning) warning.style.display = 'none';
    }
  },

  submitPost() {
    const content = document.getElementById('post-content')?.value.trim();
    const channel = document.getElementById('post-channel')?.value;
    if (!content || content.length < 10) { MB.toast('Write a bit more to share.','error'); return; }
    if (MB.isCrisis(content)) { Crisis.show(); return; }

    // Moderation: block harmful content
    const blocked = ['kill','murder','harm others','abuse'];
    if (blocked.some(w => content.toLowerCase().includes(w))) {
      MB.toast('This content was flagged by our moderation system.','error'); return;
    }

    const adjectives = ['Gentle','Brave','Quiet','Warm','Steady','Golden','Silver','Soft','Deep','Bright'];
    const nouns = ['River','Mountain','Star','Breeze','Harbor','Meadow','Forest','Ocean','Sunrise','Moon'];
    const anon = `${MB.pick(adjectives)}_${MB.pick(nouns)}`;
    const avatars = ['🌿','🌸','⭐','🌊','🍃','🌤️','🌱','💫','🌻','🦋'];

    const post = { id:MB.uid(), channel, content, anon, avatar:MB.pick(avatars), date:MB.today(), timestamp:new Date().toISOString(), reactions:{} };
    const posts = MB.store.get('community_posts', []);
    posts.unshift(post);
    MB.store.set('community_posts', posts);
    // Persist to Firestore
    if (window.FBService && window.auth?.currentUser) {
      FBService.submitPost(post).catch(console.warn);
    }
    MB.toast('Posted anonymously 🌱','success');
    this.switchTab('feed');
  },

  renderBuddy(el) {
    const status = this.buddyStatus;
    const buddyProfiles = [
      { name:'Tranquil_Leaf', avatar:'🍃', goal:'Managing daily anxiety', days:3 },
      { name:'Rising_Tide', avatar:'🌊', goal:'Building mindfulness habits', days:5 },
      { name:'Warm_Light', avatar:'☀️', goal:'Overcoming burnout', days:2 },
      { name:'Gentle_Wind', avatar:'🌬️', goal:'Improving sleep & mood', days:7 },
    ];
    if (!status) {
      el.innerHTML = `
        <div class="buddy-card mb-6">
          <div style="font-size:3rem;margin-bottom:12px">🤝</div>
          <h3 class="gradient-text mb-2">Buddy Match System</h3>
          <p class="text-sm mb-4">Get paired with another MindBloom member for a <strong>7-day accountability check-in</strong>. Anonymous, supportive, and optional.</p>
          <div class="chip-group mb-4" style="justify-content:center">
            <span class="chip selected-accent">100% Anonymous</span>
            <span class="chip selected-accent">7-Day Commitment</span>
            <span class="chip selected-accent">Opt-out Anytime</span>
          </div>
          <button class="btn btn-accent btn-full" onclick="Community.matchBuddy()">Find My Buddy 🌱</button>
        </div>
        <h4 class="mb-3">How It Works</h4>
        ${['You\'re matched with a partner who shares similar wellness goals.', 'Each day you get a gentle prompt to check in with them.', 'No personal info shared — pure peer support.', 'After 7 days, choose to extend or end the match.'].map((s,i) =>
          `<div class="flex items-center gap-3 mb-3">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--c-primary-glow);color:var(--c-primary-light);display:flex;align-items:center;justify-content:center;font-weight:700;font-family:var(--font-heading);flex-shrink:0">${i+1}</div>
            <p class="text-sm" style="margin:0">${s}</p>
          </div>`).join('')}
      `;
    } else {
      const daysLeft = 7 - (MB.daysBetween(MB.today(), status.matchedOn) || 0);
      el.innerHTML = `
        <div class="buddy-card mb-6">
          <div style="font-size:2.5rem;margin-bottom:8px">${status.buddy.avatar}</div>
          <h4 class="gradient-text mb-1">Your Buddy: ${status.buddy.name}</h4>
          <p class="text-xs text-muted mb-3">Goal: ${status.buddy.goal}</p>
          <div class="badge badge-accent mb-4">${Math.max(0,daysLeft)} days remaining</div>
          <div class="progress-bar-wrap mb-4">
            <div class="progress-bar-fill accent" style="width:${Math.min(100,(7-daysLeft)/7*100)}%"></div>
          </div>
        </div>
        <div class="card mb-4">
          <h4 class="mb-3">Today's Check-In</h4>
          <p class="text-sm text-muted mb-3">How are you showing up for your wellness today? Your buddy is rooting for you!</p>
          <textarea class="form-textarea" id="buddy-checkin" placeholder="Share a quick update…" rows="3" style="min-height:80px"></textarea>
          <button class="btn btn-primary btn-full mt-3" onclick="Community.sendCheckin()">Send Check-In 💙</button>
        </div>
        <button class="btn btn-ghost btn-full btn-sm" onclick="Community.endMatch()">End Match</button>
      `;
    }
  },

  matchBuddy() {
    const profiles = [
      { name:'Tranquil_Leaf', avatar:'🍃', goal:'Managing daily anxiety' },
      { name:'Rising_Tide', avatar:'🌊', goal:'Building mindfulness habits' },
      { name:'Warm_Light', avatar:'☀️', goal:'Overcoming burnout' },
      { name:'Gentle_Wind', avatar:'🌬️', goal:'Improving sleep & mood' },
    ];
    const buddy = MB.pick(profiles);
    const status = { buddy, matchedOn: MB.today() };
    MB.store.set('buddy_status', status);
    this.buddyStatus = status;
    if (window.FBService && window.auth?.currentUser) {
      FBService.saveBuddyStatus(status).catch(console.warn);
    }
    MB.toast(`Matched with ${buddy.name}! 🤝`, 'success');
    this.renderBuddy(document.getElementById('community-content'));
  },

  sendCheckin() {
    const msg = document.getElementById('buddy-checkin')?.value.trim();
    if (!msg) { MB.toast('Write something first!', 'error'); return; }
    MB.toast('Check-in sent! 💙', 'success');
    document.getElementById('buddy-checkin').value = '';
  },

  endMatch() {
    if (!confirm('End this buddy match?')) return;
    MB.store.remove('buddy_status');
    this.buddyStatus = null;
    MB.toast('Match ended. You can find a new buddy anytime.', 'default');
    this.renderBuddy(document.getElementById('community-content'));
  }
};

window.Community = Community;
