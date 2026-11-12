import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import EV from '../web/execuvision.js';
import {encodeEV} from '../tools/encode_ev.mjs';
const read=name=>readFile(new URL('../assets/demo/'+name,import.meta.url));
const image=EV.decodeEV(new Uint8Array(await read('MATRIX.EV')));
const meta=JSON.parse(await read('matrix.json'));
assert.equal(image.width,300);assert.equal(image.height,200);assert.equal(new Set(image.pixels).size,4);
assert.equal(createHash('sha256').update(image.pixels).digest('hex'),meta.pixelsSha256);
const png=await read('matrix.png');let packed=[],colors;
assert.equal(png.readUInt32BE(16),300);assert.equal(png.readUInt32BE(20),200);assert.equal(png[25],3);
for(let pos=8;pos<png.length;){const length=png.readUInt32BE(pos),type=png.toString('ascii',pos+4,pos+8),data=png.subarray(pos+8,pos+8+length);if(type==='IDAT')packed.push(data);if(type==='PLTE')colors=data;pos+=12+length}
assert.deepEqual(meta.palette,EV.cgaPalette(0,0,1));
assert.deepEqual([...colors],meta.palette.flat());
const scan=inflateSync(Buffer.concat(packed));
for(let y=0;y<200;y++){assert.equal(scan[y*301],0);assert.deepEqual([...scan.subarray(y*301+1,y*301+301)],[...image.pixels.subarray(y*300,(y+1)*300)])}
for(const [w,h] of [[1,1],[3,7],[4,127],[5,128],[300,200],[320,200]]){
 const pixels=Uint8Array.from({length:w*h},(_,i)=>(i*7+(i>>3))%4);
 const decoded=EV.decodeEV(encodeEV(w,h,pixels));assert.equal(decoded.width,w);assert.equal(decoded.height,h);assert.deepEqual(decoded.pixels,pixels);
}
assert.throws(()=>encodeEV(321,1,new Uint8Array(321)));assert.throws(()=>encodeEV(1,1,new Uint8Array([4])));
console.log('Demo verified: 300 × 200, four colors, EV/PNG pixels identical; encoder bounds and row padding pass.');
