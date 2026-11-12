const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),api=require('../web/execuvision.js');
const els={};let downloads=0,rendered=0;
function element(tag){return {tag,value:tag==='mode'?'cga':tag==='family'?'1':tag==='search'?'':tag==='zoom'?'fit':['kindFilter','diskFilter'].includes(tag)?'all':tag==='sortOrder'?'original':'0',checked:tag==='intensity',style:{},children:[],clientWidth:760,files:[],hidden:false,disabled:false,classList:{toggle(){},add(){},remove(){}},add(o){this.children.push(o);if(this.children.length===1)this.value=o.value},append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=[...nodes]},setAttribute(){},addEventListener(){},focus(){this.focused=true},click(){downloads++},remove(){},getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(data){rendered++;els.canvas.rgba=data.data}}},toBlob(cb){cb(new Blob(['png']))}}}
const context={ExecuVision:api,EVZip:require('../web/zip-reader.js'),Uint8Array,Uint8ClampedArray,TextDecoder,Blob,atob:s=>Buffer.from(s,'base64').toString('binary'),Option:function(t,v){this.text=t;this.value=v},Map,Array,Math,console,setTimeout:fn=>fn(),URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},document:{getElementById:id=>els[id]??=element(id),createElement:element,body:element('body')},window:{addEventListener(){}}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'web/demo.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(root,'web/app.js'),'utf8'),context);

function fixture(){const d=new Uint8Array(61),v=new DataView(d.buffer);v.setUint16(0,2,true);v.setUint16(2,10,true);v.setUint16(50,5,true);v.setUint16(52,1,true);d.set([0x1b,1],54);v.setUint16(56,8,true);v.setUint16(58,4,true);d[60]=26;return d}
const file=name=>({name,size:61,arrayBuffer:async()=>fixture().buffer});
(async()=>{
 await context.loadFiles([file('PIX001.EV'),file('PIX002.EV')]);
 assert.equal(els.fileList.children.length,2);assert.equal(els.canvas.width,4);assert.equal(els.canvas.height,1);
 els.search.value='pix002';els.search.oninput();assert.equal(els.fileList.children.length,1);els.fileList.children[0].onclick();assert.equal(els.pictureName.textContent,'PIX002.EV');
 els.favorite.onclick();context.resetFilters();els.favoritesOnly.checked=true;els.favoritesOnly.onchange();assert.equal(els.fileList.children.length,1);
 context.resetFilters();els.sortOrder.value='file';els.sortOrder.onchange();els.fileList.children[0].onclick();els.next.onclick();assert.equal(els.pictureName.textContent,'PIX002.EV');els.previous.onclick();assert.equal(els.pictureName.textContent,'PIX001.EV');
 els.mode.value='gray';els.mode.onchange();assert.equal(els.family.disabled,true);assert.deepEqual(els.canvas.rgba,api.rgba(api.decodeEV(fixture()),api.grayscalePalette()));
 els.zoom.value='3';els.zoom.onchange();assert.equal(els.canvas.style.width,'12px');assert.equal(els.canvas.width,4);
 els.download.onclick();assert.match(context.document.body.children.at(-1).download,/PIX001-grayscale-crisp.png$/);
 els.preset.value='map';els.preset.onchange();assert.equal(els.background.value,'1');els.resetPalette.onclick();assert.equal(els.background.value,'0');
 els.clear.onclick();assert.equal(els.download.disabled,true);assert.equal(els.fileList.children.length,0);
 let resolve;const pending=context.loadFiles([{name:'later.EV',size:61,arrayBuffer:()=>new Promise(r=>resolve=r)}]);els.cancelImport.onclick();resolve(fixture().buffer);await pending;assert.equal(els.fileList.children.length,0);
 await context.loadFiles([{name:'bad.EV',size:2,arrayBuffer:async()=>new ArrayBuffer(2)},file('PIX001.EV')]);assert.equal(els.fileList.children.length,1);assert.equal(els.errorList.children.length,1);
 els.mode.value='gray';els.background.value='1';els.family.value='1';els.intensity.checked=false;
 await els.loadDemo.onclick();assert.equal(els.canvas.width,300);assert.equal(els.canvas.height,200);assert.equal(els.mode.value,'cga');assert.equal(els.background.disabled,false);assert.equal(els.family.disabled,false);assert.equal(els.intensity.disabled,false);assert.equal(els.background.value,'0');assert.equal(els.family.value,'0');assert.equal(els.intensity.checked,true);assert.equal(els.pictureName.textContent,'DIGITAL RAIN');
 const demo=api.decodeEV(new Uint8Array(fs.readFileSync(path.join(root,'assets/demo/MATRIX.EV'))));assert.deepEqual(els.canvas.rgba,api.rgba(demo,JSON.parse(fs.readFileSync(path.join(root,'assets/demo/matrix.json'))).palette));
 els.download.onclick();assert.match(context.document.body.children.at(-1).download,/-cga-crisp.png$/);els.saveDemo.onclick();assert.equal(context.document.body.children.at(-1).download,'MATRIX.EV');
 console.log('Synthetic controller import, search, favorites, navigation, palette, zoom, export, cancel and error tests passed.');
})().catch(e=>{console.error(e);process.exit(1)});
