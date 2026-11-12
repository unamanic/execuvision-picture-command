/* Local-only site controller. No network APIs, persistence, or external dependencies. */
'use strict';
const $=id=>document.getElementById(id);
let entries=[],selected=-1,generation=0;
const colorNames=['Black','Blue','Green','Cyan','Red','Magenta','Brown','Light gray','Dark gray','Light blue','Light green','Light cyan','Light red','Light magenta','Yellow','White'];
colorNames.forEach((n,i)=>$('background').add(new Option(n,String(i))));
function palette(){return $('mode').value==='gray'?ExecuVision.grayscalePalette():ExecuVision.cgaPalette(+$('background').value,+$('family').value,+$('intensity').checked)}
function showStatus(s){$('status').textContent=s}
function updatePalette(){
 const p=palette();$('paletteValues').textContent=p.map((rgb,i)=>`${i}: #${rgb.map(v=>v.toString(16).padStart(2,'0')).join('')}`).join('  /  ');$('swatches').replaceChildren();
 p.forEach((rgb,i)=>{const s=document.createElement('span');s.textContent=String(i);s.style.backgroundColor=`rgb(${rgb.join(',')})`;s.style.color=(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114)>140?'#111':'#fff';s.title=`Index ${i}: ${rgb.join(', ')}`;$('swatches').append(s)});
 const disabled=$('mode').value!=='cga';for(const id of ['background','family','intensity'])$(id).disabled=disabled;
 render();
}
function render(){
 if(selected<0||!entries[selected])return;
 const e=entries[selected],im=e.image,c=$('canvas');
 c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');
 const data=ctx.createImageData(c.width,c.height);data.data.set(ExecuVision.rgba(im,palette()));ctx.putImageData(data,0,0);
 $('filenamePreview').textContent=exportFilename();
 $('exportNote').textContent=`Crisp PNG · ${c.width} × ${c.height}`;
 const maxWidth=Math.max(100,$('stage').clientWidth-48),scale=$('zoom').value==='fit'?Math.min(2,maxWidth/im.width):Number($('zoom').value);
 c.style.width=`${im.width*scale}px`;c.style.height=`${im.height*scale*($('aspect').checked?1.2:1)}px`;
 $('pictureName').textContent=e.title||e.name;$('dimensions').textContent=`${im.width} × ${im.height}`;
 $('imageInfo').textContent=`${im.kind===1?'SLIDE':'PIX'} · ${e.name}`;
 $('saveMetadata').disabled=false;$('favorite').disabled=false;$('favorite').textContent=e.favorite?'★ Favorited':'☆ Mark favorite';$('favorite').setAttribute('aria-pressed',String(!!e.favorite));
 $('sourceInfo').textContent=`${e.title||e.name} | ${e.source||'Loose file: '+e.name} | ${im.width} × ${im.height} | ${im.width*im.height} pixels`;c.setAttribute('aria-label',`${e.title||e.name}, ${im.width} by ${im.height} pixels`);
 c.hidden=false;$('empty').hidden=true;$('download').disabled=false;
}
function rebuildList(){
 const query=$('search').value.trim().toLowerCase();
 let matches=0;visibleIndices=[];
 $('fileList').replaceChildren();
 entries.map((e,i)=>({e,i})).sort((a,b)=>{const mode=$('sortOrder').value;return mode==='title'?(a.e.title||a.e.name).localeCompare(b.e.title||b.e.name):mode==='file'?a.e.name.localeCompare(b.e.name,undefined,{numeric:true}):mode==='size'?b.e.image.width*b.e.image.height-a.e.image.width*a.e.image.height:0}).forEach(({e,i})=>{
  if($('favoritesOnly').checked&&!e.favorite)return;
  if($('diskFilter').value!=='all'&&e.scope!==$('diskFilter').value)return;
  if($('kindFilter').value!=='all'&&String(e.image.kind)!==$('kindFilter').value)return;
  if(query&&!query.split(/\s+/).every(term=>`${e.title||''} ${e.name} ${e.source||''}`.toLowerCase().includes(term)))return;
  matches++;visibleIndices.push(i);
  const b=document.createElement('button');b.type='button';b.className='file-row'+(i===selected?' selected':'');b.setAttribute('aria-pressed',String(i===selected));b.textContent=e.title||e.name;const small=document.createElement('small');small.textContent=`${e.name} · ${e.image.width} × ${e.image.height}`;if(e.source)b.title=e.source;b.append(small);b.onclick=()=>{selected=i;rebuildList();render()};$('fileList').append(b);
 });
 $('fileCount').textContent=entries.length?((query||$('kindFilter').value!=='all'||$('diskFilter').value!=='all'||$('favoritesOnly').checked)?`${matches} / ${entries.length} graphics match`:`${entries.length} loaded graphic${entries.length===1?'':'s'}`):'No graphics loaded.';
 $('noMatches').hidden=!entries.length||matches>0;
 $('search').disabled=!entries.length;
 $('clearSearch').hidden=!$('search').value;
 $('collectionStats').textContent=`${entries.filter(e=>e.image.kind===1).length} slides / ${entries.filter(e=>e.image.kind===2).length} pictures / ${entries.filter(e=>e.favorite).length} favorites`;
 $('clear').disabled=!entries.length;updateNavigation();
}
function resetView(){$('filenamePreview').textContent='Select a graphic to export.';$('saveMetadata').disabled=true;$('importProgress').hidden=true;$('favoritesOnly').checked=false;$('favorite').disabled=true;$('sourceInfo').textContent='Select a graphic to see its filename, source, and dimensions.';$('kindFilter').value='all';$('diskFilter').value='all';entries=[];selected=-1;$('search').value='';$('canvas').hidden=true;$('empty').hidden=false;$('download').disabled=true;$('pictureName').textContent='SELECT A GRAPHIC';$('dimensions').textContent='—';$('imageInfo').textContent='Zoom and display proportions affect the preview only.';$('favorite').textContent='☆ Mark favorite';$('favorite').setAttribute('aria-pressed','false');$('exportNote').textContent='PNG at original pixel dimensions';rebuildList()}
function showErrors(errors){$('errorSummary').textContent=`${errors.length} import warning${errors.length===1?'':'s'}`;$('errorList').replaceChildren();for(const error of errors){const li=document.createElement('li');li.textContent=error;$('errorList').append(li)}$('errors').classList.toggle('visible',!!errors.length);$('errors').open=!!errors.length}
function parseToc(bytes){const text=new TextDecoder('windows-1252').decode(bytes),map=new Map();text.split('\r\n').slice(1).forEach((line,i)=>{const name=line.slice(0,-1).trim();if(name&&!/^9+$/.test(name)&&!name.includes('\x1a'))map.set(i+1,name)});return map}
async function loadFiles(files){
 if(typeof EVSevenZip!=='undefined')EVSevenZip.cancel();const mine=++generation;resetView();showErrors([]);$('clear').disabled=false;
 const errors=[],accepted=[],tables=new Map();let imported=0,expanded=0;
 if(files.length>500){showErrors(['Choose at most 500 files in one batch.']);showStatus('No files processed.');return}
 if(files.reduce((n,f)=>n+f.size,0)>64*1024*1024){showErrors(['This batch exceeds the 64 MiB limit. Choose a smaller batch.']);showStatus('No files processed.');return}
 showStatus(`Opening ${files.length} file${files.length===1?'':'s'}…`);
 function importEntry(path,bytes,origin){
  const name=path.split(/\/|::/).pop(),scope=origin+path.slice(0,-name.length),ext=name.split('.').pop().toLowerCase();
  if(!['ev','toc'].includes(ext))return;
  expanded+=bytes.length;if(expanded>64*1024*1024)throw Error('Expanded batch exceeds 64 MiB.');
  if(++imported>500)throw Error('More than 500 EV/TOC entries; choose fewer archives.');
  if(bytes.length>1024*1024){errors.push(`${path}: file exceeds the 1 MiB safety limit.`);return}
  try{
   if(ext==='toc'){
    const base=name.toUpperCase();if(!['EVSLIDE.TOC','EVPIX.TOC'].includes(base)){errors.push(`${path}: unrecognized table name; skipped.`);return}
    const key=scope+'|'+base;
    if(tables.has(key)){tables.set(key,null);errors.push(`${path}: multiple tables of this kind; names disabled to avoid mixing disks.`)}else tables.set(key,parseToc(bytes));
   }else accepted.push({name,scope,source:origin==='direct/'?'':origin+path,image:ExecuVision.decodeEV(bytes)});
  }catch(e){errors.push(`${path}: ${e.message||'could not decode this file'}`)}
 }
 for(let index=0;index<files.length;index++){
  if(mine!==generation)return;
  $('importProgress').hidden=false;$('progress').max=files.length;$('progress').value=index;$('progressText').textContent=`${index+1} / ${files.length}`;
  const file=files[index],name=file.name,ext=name.split('.').pop().toLowerCase();
  if(!['ev','toc','zip','7z'].includes(ext)){errors.push(`${name}: choose .EV, .TOC, .ZIP or .7Z.`);continue}
  if(!['zip','7z'].includes(ext)&&file.size>1024*1024){errors.push(`${name}: file exceeds the 1 MiB safety limit.`);continue}
  try{
   const bytes=new Uint8Array(await file.arrayBuffer());if(mine!==generation)return;
   if(ext==='zip'||ext==='7z'){
    showStatus(`Opening ${name}…`);
    let unpacked;
    if(ext==='7z'){const outer=await EVSevenZip.read(bytes);unpacked=[];for(const item of outer){if(mine!==generation)return;if(/\.zip$/i.test(item.name)){for(const child of await EVZip.readEV(item.bytes))unpacked.push({name:item.name+'!/'+child.name,bytes:child.bytes})}else unpacked.push(item)}}else unpacked=await EVZip.readEV(bytes);if(mine!==generation)return;
    if(!unpacked.length)errors.push(`${name}: no EV or TOC files found in this archive or its contained ZIPs.`);
    for(const item of unpacked){if(mine!==generation)return;importEntry(item.name,item.bytes,`${index+1}:${name}/`)}
   }else importEntry(name,bytes,'direct/');
  }catch(e){errors.push(`${name}: ${e.message||'could not open this input'}`)}
 }
 if(mine!==generation)return;
 $('importProgress').hidden=true;
 const counts=new Map();accepted.forEach(e=>{const key=e.scope+'|'+e.name.toUpperCase();counts.set(key,(counts.get(key)||0)+1)});
 accepted.forEach(e=>{const m=/^(SLIDE|PIX)(\d+)\.EV$/i.exec(e.name);if(m&&counts.get(e.scope+'|'+e.name.toUpperCase())===1){const table=tables.get(e.scope+'|'+(m[1].toUpperCase()==='PIX'?'EVPIX.TOC':'EVSLIDE.TOC'));if(table)e.title=table.get(+m[2])}});
 entries=accepted;$('diskFilter').replaceChildren(new Option('All disks','all'));for(const scope of new Set(entries.map(e=>e.scope)))$('diskFilter').add(new Option(scope==='direct/'?'Loose files':scope,scope));$('diskFilter').value='all';selected=entries.length?0:-1;rebuildList();render();showErrors(errors);
 showStatus(`${entries.length} graphic${entries.length===1?'':'s'} loaded${errors.length?`; ${errors.length} import warning${errors.length===1?'':'s'}`:''}. ${entries.length?'Choose a graphic to view or export.':'Open EV files, ZIPs, or 7z archives to try again.'}`);
}
$('files').onchange=e=>{const files=Array.from(e.target.files||[]);e.target.value='';if(files.length)loadFiles(files)};
const drop=$('drop');let dragDepth=0;drop.addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;drop.classList.add('drag')});drop.addEventListener('dragover',e=>e.preventDefault());drop.addEventListener('dragleave',e=>{e.preventDefault();if(--dragDepth<=0){dragDepth=0;drop.classList.remove('drag')}});drop.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;drop.classList.remove('drag')});
drop.addEventListener('drop',e=>{const files=Array.from(e.dataTransfer.files||[]);if(files.length)loadFiles(files)});
// Prevent files dropped outside the target from replacing the site with a local file.
window.addEventListener('dragover',e=>e.preventDefault());window.addEventListener('drop',e=>e.preventDefault());
$('clear').onclick=()=>{if(typeof EVSevenZip!=='undefined')EVSevenZip.cancel();generation++;resetView();showErrors([]);showStatus('Collection cleared. Open files to start another collection.')};
$('search').oninput=rebuildList;
function clearSearch(){$('search').value='';rebuildList();$('search').focus()}
$('clearSearch').onclick=clearSearch;
$('search').onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();clearSearch()}};
for(const id of ['mode','background','family','intensity'])$(id).onchange=updatePalette;
$('aspect').onchange=render;window.addEventListener('resize',render);
$('download').onclick=()=>{
 if(selected<0)return;const e=entries[selected];const filename=exportFilename();const exportedSize=`${$('canvas').width} × ${$('canvas').height}`;
 $('canvas').toBlob(blob=>{if(!blob){showStatus('PNG export failed. Try again.');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showStatus(`PNG ready: ${filename} · ${exportedSize} pixels · selected colors.`)},'image/png');
};
$('kindFilter').onchange=rebuildList;
$('sortOrder').onchange=rebuildList;
$('diskFilter').onchange=rebuildList;
function resetFilters(){$('favoritesOnly').checked=false;$('search').value='';$('kindFilter').value='all';$('diskFilter').value='all';rebuildList()}
$('resetFilters').onclick=resetFilters;
let visibleIndices=[];
function updateNavigation(){$('selectionNotice').hidden=selected<0||visibleIndices.includes(selected);const at=visibleIndices.indexOf(selected);$('previous').disabled=!visibleIndices.length||at===0;$('next').disabled=!visibleIndices.length||at===visibleIndices.length-1;$('position').textContent=!entries.length?'0 / 0':at<0?'Not in filtered results':`${at+1} / ${visibleIndices.length}`}
function navigate(delta){const at=visibleIndices.indexOf(selected),next=at<0?(delta>0?0:visibleIndices.length-1):at+delta;if(next<0||next>=visibleIndices.length)return;selected=visibleIndices[next];rebuildList();render()}
$('previous').onclick=()=>navigate(-1);$('next').onclick=()=>navigate(1);
window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();navigate(e.key==='ArrowLeft'?-1:1)}});
window.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();$('search').focus()}});
$('resetPalette').onclick=()=>{$('mode').value='cga';$('background').value='0';$('family').value='1';$('intensity').checked=true;updatePalette()};
$('preset').onchange=()=>{const v=$('preset').value;if(!v)return;$('mode').value=v==='gray'?'gray':'cga';$('background').value=v==='map'?'1':'0';$('family').value=v==='cga1'?'1':'0';$('intensity').checked=true;updatePalette();$('preset').value=''};
$('zoom').onchange=render;
$('stageTheme').onchange=()=>{$('stage').className='stage stage-'+$('stageTheme').value};
$('focusMode').onclick=()=>{const on=document.body.classList.toggle('focus-mode');$('focusMode').setAttribute('aria-pressed',String(on));$('focusMode').textContent=on?'Exit focus view':'Focus on graphic';render()};
$('favorite').onclick=()=>{if(selected<0)return;entries[selected].favorite=!entries[selected].favorite;rebuildList();render()};
$('favoritesOnly').onchange=rebuildList;
$('cancelImport').onclick=()=>{generation++;if(typeof EVSevenZip!=='undefined')EVSevenZip.cancel();resetView();showStatus('Import cancelled. Open files to try again.')};
function downloadText(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('saveErrors').onclick=()=>downloadText('execuvision-import-warnings.txt',Array.from($('errorList').children).map(e=>e.textContent).join('\n'));
$('saveMetadata').onclick=()=>{if(selected<0)return;const e=entries[selected];downloadText(e.name+'.json',JSON.stringify({title:e.title||e.name,file:e.name,source:e.source,width:e.image.width,height:e.image.height,kind:e.image.kind===1?'SLIDE':'PIX',palette:palette(),paletteStatus:'User-selected colors; may differ from original colors'},null,2),'application/json')};
function exportFilename(){if(selected<0)return '';const e=entries[selected];const title=(e.title||'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-|-$/g,'').slice(0,60);return (title?title+'-':'')+e.name.replace(/[^a-zA-Z0-9._-]/g,'_').replace(/\.ev$/i,'')+'-'+($('mode').value==='gray'?'grayscale':'cga')+'-crisp.png'}
function demoBytes(){return Uint8Array.from(atob(EV_DEMO.base64),c=>c.charCodeAt(0))}
$('loadDemo').onclick=async()=>{
 const bytes=demoBytes(),expected=generation+1;
 await loadFiles([{name:EV_DEMO.name,size:bytes.length,arrayBuffer:async()=>bytes.buffer}]);
 if(generation!==expected||!entries.length)return;
 entries[0].title=EV_DEMO.title;entries[0].source='Built-in demo';
 $('mode').value='cga';$('background').value='0';$('family').value='0';$('intensity').checked=true;$('zoom').value='fit';$('aspect').checked=false;
 rebuildList();updatePalette();showStatus('Demo loaded. Try palettes and zoom, or save a PNG.');
};
$('saveDemo').onclick=()=>downloadText(EV_DEMO.name,demoBytes(),'application/octet-stream');
updatePalette();
