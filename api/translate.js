export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const {text, source='auto', target, formality='default'} = req.body || {};
    if (!text || !target) return res.status(400).json({error:'text and target are required'});
    if (text.length > 200000) return res.status(413).json({error:'Text is too large. Maximum is 200000 characters.'});

    const chunks = [];
    const limit = 3000;
    for (let i=0; i<text.length; i+=limit) chunks.push(text.slice(i,i+limit));

    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    const deeplKey = process.env.DEEPL_API_KEY;
    const translateChunk = async (q) => {
      if (deeplKey) {
        const body = new URLSearchParams({text:q,target_lang:target.toUpperCase()});
        if(source !== 'auto') body.set('source_lang', source.toUpperCase());
        if(formality && formality !== 'default') body.set('formality', formality);
        const r = await fetch('https://api-free.deepl.com/v2/translate', {method:'POST',headers:{'Authorization':'DeepL-Auth-Key '+deeplKey,'Content-Type':'application/x-www-form-urlencoded'},body});
        const data = await r.json();
        if(!r.ok) throw new Error(data?.message || 'DeepL translation provider failed');
        return (data?.translations||[]).map(x=>x.text||'').join('');
      }
      if (key) {
        const r = await fetch('https://translation.googleapis.com/language/translate/v2?key='+encodeURIComponent(key), {
          method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({q, source:source==='auto'?undefined:source, target, format:'text'})
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error?.message || 'Translation provider failed');
        return (data?.data?.translations||[]).map(x=>x.translatedText||'').join('');
      }
      const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+encodeURIComponent(source)+'&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(q);
      const r = await fetch(u);
      if (!r.ok) throw new Error('Translation provider unavailable');
      const d = await r.json();
      return (d[0]||[]).map(x=>x[0]).filter(Boolean).join('');
    };

    const translations=[];
    for (const chunk of chunks) {
      const translated=await translateChunk(chunk);
      if (!translated) throw new Error('Empty translation returned by provider');
      translations.push(translated);
    }
    return res.status(200).json({translation:translations.join(''), provider:deeplKey?'deepl':key?'google-cloud':'fallback', chunks:chunks.length});
  } catch (e) {
    return res.status(502).json({error:e?.message || 'Translation request failed'});
  }
}