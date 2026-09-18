const CACHE='ultimate-translator-v6';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.svg','./icon-512.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key.startsWith('ultimate-translator-v') && key!==CACHE)
          .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const requestUrl=new URL(event.request.url);

  // Always fetch the HTML shell fresh so GitHub Pages does not keep an old
  // application bundle after a deployment. Other static assets remain cached.
  if(requestUrl.origin===location.origin &&
     (requestUrl.pathname.endsWith('/') || requestUrl.pathname.endsWith('/index.html'))){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached=>cached||fetch(event.request).then(response=>{
        if(requestUrl.origin===location.origin){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      }).catch(()=>cached||caches.match('./index.html')))
  );
});
