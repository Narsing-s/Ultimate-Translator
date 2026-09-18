const ALLOWED_FORMALITY=new Set(['default','formal','informal']);
const LANG=/^[a-zA-Z-]{2,12}$/;

export default async function handler(req,res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const {text, source='auto', target, formality='default'} = req.body || {};
    if (typeof text !== 'string' || !text.trim() || typeof target !== 'string' || !target.trim()) {
      return res.status(400).json({error:'text and target are required'});
    }
    if (text.length > 200000) return res.status(413).json({error:'Text is too large. Maximum is 200000 characters.'});
    if (!LANG.test(target) || (source !== 'auto' && !LANG.test(String(source)))) {
      return res.status(400).json({error:'Invalid source or target language code.'});
    }
    if (!ALLOWED_FORMALITY.has(formality)) return res.status(400).json({error:'Invalid translation tone.'});

    const chunks = [];
    const limit = 3000;
    for (let i=0; i<text.length; i+=limit) chunks.push(text.slice(i,i+limit));

    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    const deeplKey = process.env.DEEPL_API_KEY;
    const fetchWithTimeout = (url, options={}, ms=20000) => {
      const signal=AbortSignal.timeout(ms);
      return fetch(url,{...options,signal});
    };
    const translateChunk = async (q) => {
      if (deeplKey) {
        const body = new URLSearchParams({text:q,target_lang:target.toUpperCase()});
        if(source !== 'auto') body.set('source_lang', String(source).toUpperCase());
        if(formality !== 'default') body.set('formality', formality);
        const r = await fetchWithTimeout('https://api-free.deepl.com/v2/translate', {method:'POST',headers:{'Authorization':'DeepL-Auth-Key '+deeplKey,'Content-Type':'application/x-www-form-urlencoded'},body});
        const data = await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(data?.message || 'DeepL translation provider failed');
        return (data?.translations||[]).map(x=>x.text||'').join('');
      }
      if (key) {
        const r = await fetchWithTimeout('https://translation.googleapis.com/language/translate/v2?key='+encodeURIComponent(key), {
          method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({q, source:source==='auto'?undefined:source, target, format:'text'})
        });
        const data = await r.json().catch(()=>({}));
        if (!r.ok) throw new Error(data?.error?.message || 'Translation provider failed');
        return (data?.data?.translations||[]).map(x=>x.translatedText||'').join('');
      }
      const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+encodeURIComponent(source)+'&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(q);
      const r = await fetchWithTimeout(u);
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
    if(e?.name==='TimeoutError' || e?.name==='AbortError') return res.status(504).json({error:'Translation provider timed out. Please try again.'});
    return res.status(502).json({error:e?.message || 'Translation request failed'});
  }
}
