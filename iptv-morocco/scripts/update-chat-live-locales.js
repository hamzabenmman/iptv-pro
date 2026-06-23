const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'messages');

const liveMatchDefaults = {
  loading: 'Loading live matches...',
  no_live_match: 'No live World Cup matches available right now.',
  api_error: 'Unable to load live match feed.',
  live_title: 'Live World Cup Feed',
  live_subtitle: 'Real-time match updates from a free live API.',
};

const chatDefaults = {
  title: 'IPTV Support Chat',
  subtitle: 'Stay on site and chat while we assist you.',
  save_session: 'Save session',
  session_saved: 'Session saved',
  session_placeholder: 'Enter your name or nickname',
  input_placeholder: 'Type your question here...',
  invite_prompt: 'Invite code appears after saving your session',
  invite_code: 'Invite code',
  send_button: 'Send',
  open_chat: 'Open chat',
  error_send: 'Unable to send message. Try again.',
};

fs.readdirSync(dir).filter(file => file.endsWith('.json')).forEach((file) => {
  const filePath = path.join(dir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (!json.matches) json.matches = {};
  json.matches = { ...liveMatchDefaults, ...json.matches };

  if (!json.chat) json.chat = {};
  json.chat = { ...chatDefaults, ...json.chat };

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`updated ${file}`);
});
