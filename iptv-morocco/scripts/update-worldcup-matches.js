const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'messages');
const matchUpdates = {
  '2026-06-15': { status: 'ended', score: { team1: 2, team2: 1 } },
  '2026-06-18': { status: 'ended', score: { team1: 3, team2: 2 } },
  '2026-06-22': { status: 'live', score: { team1: 2, team2: 1 } },
};

fs.readdirSync(dir).filter((file) => file.endsWith('.json')).forEach((file) => {
  const filePath = path.join(dir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (json.matches && Array.isArray(json.matches.matches_list)) {
    json.matches.status_live = json.matches.status_live || 'Live';
    json.matches.status_ended = json.matches.status_ended || 'Ended';
    json.matches.status_upcoming = json.matches.status_upcoming || 'Upcoming';

    json.matches.matches_list = json.matches.matches_list
      .filter((item) => item.competition === 'world_cup')
      .map((item) => {
        const update = matchUpdates[item.date] || { status: 'upcoming' };
        return {
          ...item,
          status: update.status,
          score: update.score,
        };
      });

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`updated ${file}`);
  } else {
    console.log(`skipped ${file}`);
  }
});
