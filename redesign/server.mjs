import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('./dist/', import.meta.url)).replace(/\/$/, '');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.ttf':'font/ttf','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const server = createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let path;
  try {path = decodeURIComponent(new URL(req.url,'http://local').pathname);} catch {res.writeHead(400);res.end();return;}
  if(path === '/health') {res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?'':JSON.stringify({status:'ok',service:'prism-website'}));return;}
  let file = resolve(root, '.'+path);
  if (file !== root && !file.startsWith(root+sep)) {res.writeHead(403);res.end();return;}
  let details, status=200;
  try {details=await stat(file);if(details.isDirectory()){file=resolve(file,'index.html');details=await stat(file);}if(!details.isFile())throw new Error('Not a file');}
  catch {file=resolve(root,'404.html');status=404;details=await stat(file);}
  const etag='"'+details.size.toString(16)+'-'+Math.trunc(details.mtimeMs).toString(16)+'"';
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control',extname(file)==='.html'?'no-cache':'public, max-age=3600');
  res.setHeader('ETag',etag);
  res.setHeader('Accept-Ranges','bytes');
  if(req.headers['if-none-match']===etag&&status===200){res.writeHead(304);res.end();return;}
  let start=0,end=details.size-1;
  const ifRange=req.headers['if-range'];
  const validIfRange=!ifRange||ifRange===etag||(!ifRange.startsWith('"')&&!ifRange.startsWith('W/')&&Number.isFinite(Date.parse(ifRange))&&Date.parse(ifRange)>=Math.floor(details.mtimeMs/1000)*1000);
  if(req.method==='GET'&&req.headers.range&&status===200&&validIfRange){
    const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${details.size}`});res.end();return;}
    if(!match[1])start=Math.max(0,details.size-Number(match[2]));
    else{start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
    if(start>end||start>=details.size){res.writeHead(416,{'Content-Range':`bytes */${details.size}`});res.end();return;}
    status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${details.size}`);
  }
  res.setHeader('Content-Length',end-start+1);res.writeHead(status);
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
});
const port=Number(process.env.PORT||4173);
server.listen(port,'0.0.0.0',()=>console.log(`PRISM website ready on port ${port}`));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
