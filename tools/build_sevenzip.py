from pathlib import Path
import base64,json
root=Path(__file__).resolve().parents[1]
web=root/'web'
v=web/'vendor/7z'
wasm=base64.b64encode((v/'7zz.wasm').read_bytes()).decode()
worker=(v/'7zz.umd.js').read_text()+'\n'+(web/'sevenzip-core.js').read_text()+'''\nonmessage=async e=>{try{const entries=await extractSevenZip(e.data,SevenZip,Uint8Array.from(atob(WASM),c=>c.charCodeAt(0)));postMessage({entries},entries.map(x=>x.bytes.buffer))}catch(error){postMessage({error:error.message||'7z extraction failed'})}};'''.replace('WASM',json.dumps(wasm))
(web/'sevenzip-assets.js').write_text('/* Generated offline 7z-wasm 1.2.0 assets; see vendor/7z/License.txt. */\nconst EVSevenZipWorker='+json.dumps(worker)+';\n')
