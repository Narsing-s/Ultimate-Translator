export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const {text} = req.body || {};
    if (!text?.trim()) return res.status(400).json({error:'text is required'});
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(503).json({error:'OPENAI_API_KEY is not configured'});
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'content-type':'application/json','authorization':'Bearer '+key},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages:[{role:'system',content:'Explain extracted text from an uploaded image clearly. Identify what it is about, summarize the important points, and explain difficult terms. Do not invent details not present in the text.'},{role:'user',content:text}],
        temperature:0.2
      })
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'AI explanation failed'});
    return res.status(200).json({explanation:data?.choices?.[0]?.message?.content||'No explanation returned.'});
  } catch(e) {
    return res.status(500).json({error:'Explanation request failed'});
  }
}