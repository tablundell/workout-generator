exports.handler = async (event) => {
  const q = event.queryStringParameters.q;
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=1&videoCategoryId=17&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  const item = data.items?.[0];
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(item ? { id: item.id.videoId, title: item.snippet.title } : null)
  };
};