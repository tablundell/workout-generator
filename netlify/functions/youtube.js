exports.handler = async (event) => {
  const raw = (event.queryStringParameters.q || '').trim();

  // Detect equipment prefix to keep it in the search
  const equipmentPrefixes = {
    'KB': 'kettlebell',
    'DB': 'dumbbell',
    'Barbell': 'barbell',
    'Cable': 'cable'
  };

  let equipmentHint = '';
  for (const [short, long] of Object.entries(equipmentPrefixes)) {
    if (raw.startsWith(short + ' ') || raw.toLowerCase().includes(long)) {
      equipmentHint = long;
      break;
    }
  }

  // Build queries — always include equipment hint if detected
  const base = raw.replace(/\(.*?\)/g, '').trim();
  const withEquip = equipmentHint ? `${base} ${equipmentHint}` : base;

  const attempts = [
    { q: `${withEquip} how to form`, duration: 'short' },
    { q: `${withEquip} tutorial`, duration: 'short' },
    { q: `${withEquip} exercise`, duration: 'medium' },
    { q: withEquip, duration: 'any' }
  ];

  for (const attempt of attempts) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(attempt.q)}&type=video&maxResults=5&videoDuration=${attempt.duration}&videoEmbeddable=true&relevanceLanguage=en&key=${process.env.YOUTUBE_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    console.log(`Query: "${attempt.q}" | Duration: ${attempt.duration} | Status: ${res.status} | Items: ${data.items?.length ?? 0} | Error: ${data.error?.message ?? 'none'}`);

    if (data.error) continue;

    const items = (data.items || []).filter(item => {
      const title = item.snippet.title.toLowerCase();
      const skip = ['reaction', 'vlog', 'compilation', 'funny', 'fails'];
      return !skip.some(t => title.includes(t));
    });

    if (items.length > 0) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ id: items[0].id.videoId, title: items[0].snippet.title })
      };
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(null)
  };
};
