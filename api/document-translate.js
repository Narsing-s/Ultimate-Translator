export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const key = process.env.DEEPL_API_KEY;
  if (!key) return res.status(503).json({error:'Formatted document translation requires DEEPL_API_KEY on the server.'});
  try {
    const form = await new Response(req).formData();
    const file = form.get('file');
    const target = form.get('target');
    const source = form.get('source') || '';
    const formality = form.get('formality') || 'default';
    if (!(file instanceof File) || !target) return res.status(400).json({error:'file and target are required'});
    if (file.size > 100 * 1024 * 1024) return res.status(413).json({error:'Document exceeds the 100 MB server limit.'});

    const upload = new FormData();
    upload.append('file', file, file.name);
    upload.append('target_lang', String(target).toUpperCase());
    if (source && source !== 'auto') upload.append('source_lang', String(source).toUpperCase());
    if (formality && formality !== 'default') upload.append('formality', formality);

    const base = process.env.DEEPL_API_BASE || 'https://api-free.deepl.com';
    const up = await fetch(base+'/v2/document', {
      method:'POST',
      headers:{Authorization:'DeepL-Auth-Key '+key},
      body:upload
    });
    const upData = await up.json();
    if (!up.ok) return res.status(up.status).json({error:upData?.message || 'DeepL document upload failed'});

    const id=upData.document_id, documentKey=upData.document_key;
    let statusData;
    for(let i=0;i<90;i++){
      await new Promise(r=>setTimeout(r,1000));
      const st=await fetch(base+'/v2/document/'+encodeURIComponent(id),{
        method:'POST',
        headers:{Authorization:'DeepL-Auth-Key '+key,'Content-Type':'application/json'},
        body:JSON.stringify({document_key:documentKey})
      });
      statusData=await st.json();
      if(!st.ok) return res.status(st.status).json({error:statusData?.message || 'DeepL document status failed'});
      if(statusData.status==='done') break;
      if(statusData.status==='error') return res.status(502).json({error:statusData.message || 'DeepL document translation failed'});
    }
    if(statusData?.status!=='done') return res.status(504).json({error:'Document translation timed out.'});

    const result=await fetch(base+'/v2/document/'+encodeURIComponent(id)+'/result',{
      method:'POST',
      headers:{Authorization:'DeepL-Auth-Key '+key,'Content-Type':'application/json'},
      body:JSON.stringify({document_key:documentKey})
    });
    if(!result.ok) {
      const err=await result.text();
      return res.status(result.status).json({error:err || 'Translated document download failed'});
    }
    const buf=Buffer.from(await result.arrayBuffer());
    res.setHeader('Content-Type', result.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="translated-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_')+'"');
    res.setHeader('X-Translation-Provider','deepl');
    return res.status(200).send(buf);
  } catch(e) {
    return res.status(502).json({error:e?.message || 'Document translation failed'});
  }
}
