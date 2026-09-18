export const maxDuration = 60;

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({error:'Method not allowed'}, {status:405, headers:{Allow:'POST'}});
  }

  const key = process.env.DEEPL_API_KEY;
  if (!key) {
    return Response.json({error:'Formatted document translation requires DEEPL_API_KEY on the server.'}, {status:503});
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      return Response.json({error:'Expected multipart/form-data upload.'}, {status:400});
    }

    const form = await request.formData();
    const file = form.get('file');
    const target = form.get('target');
    const source = form.get('source') || '';
    const formality = form.get('formality') || 'default';

    if (!(file instanceof File) || !target) {
      return Response.json({error:'file and target are required'}, {status:400});
    }

    // Vercel Functions reject request payloads above their platform limit.
    // The browser extractor remains the fallback for larger supported text documents.
    if (file.size > 4 * 1024 * 1024) {
      return Response.json({error:'Formatted document upload exceeds the 4 MB server limit; use the text fallback or a smaller file.'}, {status:413});
    }

    const upload = new FormData();
    upload.append('file', file, file.name);
    upload.append('target_lang', String(target).toUpperCase());
    if (source && source !== 'auto') upload.append('source_lang', String(source).toUpperCase());
    if (formality && formality !== 'default') upload.append('formality', formality);

    const base = process.env.DEEPL_API_BASE || 'https://api-free.deepl.com';
    const up = await fetch(base + '/v2/document', {
      method:'POST',
      headers:{Authorization:'DeepL-Auth-Key ' + key},
      body:upload
    });

    const upData = await up.json().catch(()=>({}));
    if (!up.ok) {
      return Response.json({error:upData?.message || 'DeepL document upload failed'}, {status:up.status});
    }

    const id = upData.document_id;
    const documentKey = upData.document_key;
    if (!id || !documentKey) {
      return Response.json({error:'DeepL returned an invalid document upload response.'}, {status:502});
    }

    let statusData;
    for(let i=0;i<45;i++){
      await new Promise(resolve=>setTimeout(resolve,1000));
      const st = await fetch(base + '/v2/document/' + encodeURIComponent(id), {
        method:'POST',
        headers:{Authorization:'DeepL-Auth-Key ' + key,'Content-Type':'application/json'},
        body:JSON.stringify({document_key:documentKey})
      });
      statusData = await st.json().catch(()=>({}));
      if(!st.ok) {
        return Response.json({error:statusData?.message || 'DeepL document status failed'}, {status:st.status});
      }
      if(statusData.status === 'done') break;
      if(statusData.status === 'error') {
        return Response.json({error:statusData.message || 'DeepL document translation failed'}, {status:502});
      }
    }

    if(statusData?.status !== 'done') {
      return Response.json({error:'Document translation timed out.'}, {status:504});
    }

    const result = await fetch(base + '/v2/document/' + encodeURIComponent(id) + '/result', {
      method:'POST',
      headers:{Authorization:'DeepL-Auth-Key ' + key,'Content-Type':'application/json'},
      body:JSON.stringify({document_key:documentKey})
    });

    if(!result.ok) {
      const err = await result.text();
      return Response.json({error:err || 'Translated document download failed'}, {status:result.status});
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    return new Response(await result.arrayBuffer(), {
      status:200,
      headers:{
        'Content-Type':result.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition':'attachment; filename="translated-' + safeName + '"',
        'X-Translation-Provider':'deepl'
      }
    });
  } catch(e) {
    return Response.json({error:e?.message || 'Document translation failed'}, {status:502});
  }
}
