const url1 = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const url2 = 'https://generativelanguage.googleapis.com/v1beta/chat/completions';

async function test(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer DUMMY_KEY'
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: 'hello' }]
      })
    });
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${await res.text()}`);
    console.log('---');
  } catch(e) {
    console.log(e);
  }
}

async function run() {
  await test(url1);
  await test(url2);
}
run();
