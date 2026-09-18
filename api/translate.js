export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const {text, source='auto', target} = req.body || {};
    if (!text || !target) return res.status(400).json({error:'text and target are required'});
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (key) {
      const r = await fetch('https://translation.googleapis.com/language/translate/v2?key='+encodeURIComponent(key), {
        method:'POST', headers:{'content-type':'application/json'},
        body:JSON.stringify({q:text, source:source==='auto'?undefined:source, target, format:'text'})
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({error:data?.error?.message || 'Translation provider failed'});
      return res.status(200).json({translation:data.data.translations.map(x=>x.translatedText).join('')});
    }
    const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+encodeURIComponent(source)+'&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(text);
    const r=await fetch(u);
    if (!r.ok) return res.status(502).json({error:'Translation provider unavailable'});
    const d=await r.json();
    return res.status(200).json({translation:(d[0]||[]).map(x=>x[0]).filter(Boolean).join(''), provider:'fallback'});
  } catch (e) {
    return res.status(500).json({error:'Translation request failed'});
  }
}