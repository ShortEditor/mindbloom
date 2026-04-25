/* ============================================
   MindTrack AI — Mock AI Chat Support
   ============================================ */

const Chat = {
  messages: [],
  isTyping: false,

  render() {
    const el = document.getElementById('screen-chat');
    this.messages = MB.store.get('chat_history', []);
    
    // Add initial greeting if empty
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'ai',
        text: "Hi there! I'm your MindTrack AI assistant. How are you feeling today? You can vent to me, ask for advice, or just chat.",
        time: new Date().toISOString()
      });
      MB.store.set('chat_history', this.messages);
    }

    el.innerHTML = `
      <div class="section-header" style="margin-bottom:16px; padding-top:24px;">
        <div class="flex items-center justify-between">
          <div>
            <div class="greeting" style="color:var(--c-primary-light)">AI SUPPORT</div>
            <h2 style="margin:0">MindTrack <span class="gradient-text">Assistant</span></h2>
          </div>
          <button class="icon-btn" onclick="Chat.clearHistory()" title="Clear Chat">
            <i data-feather="trash-2"></i>
          </button>
        </div>
      </div>
      
      <div id="chat-window" class="card" style="height:calc(100vh - 280px); min-height:400px; display:flex; flex-direction:column; padding:0; overflow:hidden; border:1px solid var(--c-primary-glow);">
        
        <div id="chat-messages" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px;">
          ${this.renderMessages()}
        </div>
        
        <div id="chat-input-area" style="padding:16px; border-top:1px solid var(--c-border); background:var(--c-surface);">
          <div class="flex gap-2">
            <input type="text" id="chat-input" class="form-input" placeholder="Type your message..." style="flex:1; border-radius:24px; padding-left:16px;" onkeypress="if(event.key==='Enter') Chat.send()">
            <button class="btn btn-primary" onclick="Chat.send()" style="border-radius:24px; padding:0 24px;">
              <i data-feather="send"></i>
            </button>
          </div>
          <div class="text-xs text-muted mt-2 text-center">AI responses are simulated for this MVP.</div>
        </div>
      </div>
    `;
    
    if (window.feather) feather.replace();
    this.scrollToBottom();
  },

  renderMessages() {
    return this.messages.map(msg => `
      <div style="display:flex; flex-direction:column; align-items:${msg.role === 'user' ? 'flex-end' : 'flex-start'}">
        <div style="
          max-width:85%; 
          padding:12px 16px; 
          border-radius:18px; 
          border-${msg.role === 'user' ? 'bottom-right' : 'bottom-left'}-radius:4px;
          background:${msg.role === 'user' ? 'var(--c-primary)' : 'var(--c-card-hover)'};
          color:${msg.role === 'user' ? '#fff' : 'var(--c-text)'};
          line-height:1.5;
          font-size:0.95rem;
        ">
          ${msg.text}
        </div>
        <div class="text-xs text-muted" style="margin-top:4px; margin-${msg.role === 'user' ? 'right' : 'left'}:8px;">
          ${new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    `).join('');
  },

  scrollToBottom() {
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  },

  clearHistory() {
    if (confirm('Clear chat history?')) {
      MB.store.set('chat_history', []);
      this.render();
    }
  },

  async send() {
    if (this.isTyping) return;
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    
    // Add User Message
    this.messages.push({ role: 'user', text, time: new Date().toISOString() });
    this.updateUI();

    // Simulate AI typing
    this.isTyping = true;
    this.showTypingIndicator();
    
    // Mock AI Logic based on keywords
    setTimeout(() => {
      let reply = "I hear you. Tell me a bit more about how that's making you feel.";
      const lower = text.toLowerCase();
      
      if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('too much')) {
        reply = "It sounds like you're carrying a lot right now. When I feel overwhelmed, taking just 60 seconds to do the Box Breathing exercise helps reset my nervous system. Would you like to try the Breathing tool from the dashboard?";
      } else if (lower.includes('sad') || lower.includes('depress') || lower.includes('down')) {
        reply = "I'm so sorry you're feeling down. It's okay to have tough days. Remember to be gentle with yourself. Have you tried writing down some of your thoughts in the Journal? It can help to get them out of your head.";
      } else if (lower.includes('anxi') || lower.includes('panic') || lower.includes('worry')) {
        reply = "Anxiety can feel really physical and scary, but you are safe right now. Try looking around the room and naming 3 things you can see. If you need it, the CBT Tools tab has a 'Thought Record' to help break down these anxious thoughts.";
      } else if (lower.includes('tired') || lower.includes('sleep') || lower.includes('exhaust')) {
        reply = "Rest is productive too! Burnout is very real. Please give yourself permission to step back and recharge if you can.";
      } else if (lower.includes('happy') || lower.includes('good') || lower.includes('great')) {
        reply = "That's wonderful to hear! Hold onto that feeling. Recognizing these good moments is great for building resilience.";
      }

      // Check for crisis
      if (MB.isCrisis && MB.isCrisis(text)) {
        reply = "I'm hearing that you are in a lot of pain right now. Please know that you don't have to go through this alone. I strongly encourage you to tap the red 'I Need Help' button at the top right of your screen to connect with real human support immediately.";
      }

      this.messages.push({ role: 'ai', text: reply, time: new Date().toISOString() });
      MB.store.set('chat_history', this.messages);
      
      this.isTyping = false;
      this.updateUI();
    }, 1500 + Math.random() * 1000); // 1.5 - 2.5s delay
  },

  showTypingIndicator() {
    const chatMsg = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:flex-start">
        <div style="padding:16px; border-radius:18px; border-bottom-left-radius:4px; background:var(--c-card-hover);">
          <span class="emoji-bounce" style="display:inline-block; font-size:0.8rem">💬</span>
          <span class="text-sm text-muted ml-2">MindTrack AI is typing...</span>
        </div>
      </div>
    `;
    chatMsg.appendChild(indicator);
    this.scrollToBottom();
  },

  updateUI() {
    const chatMsg = document.getElementById('chat-messages');
    if (chatMsg) {
      chatMsg.innerHTML = this.renderMessages();
      this.scrollToBottom();
    }
  }
};

window.Chat = Chat;
