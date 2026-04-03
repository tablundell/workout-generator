exports.handler = async (event) => {
  const name = event.queryStringParameters.name;
  const res = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name)}?limit=1`,
    { headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }}
  );
  const data = await res.json();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data[0] || null)
  };
};