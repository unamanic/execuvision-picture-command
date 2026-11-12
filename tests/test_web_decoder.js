'use strict';
const assert = require('node:assert/strict');
const EV = require('../web/execuvision.js');
function fixture() {
  const d = new Uint8Array(61), v = new DataView(d.buffer);
  v.setUint16(0,2,true); v.setUint16(2,10,true); v.setUint16(50,5,true);
  v.setUint16(52,1,true); d.set([0x1b,1],54);
  v.setUint16(56,8,true); v.setUint16(58,4,true); d[60]=26; return d;
}
const raster = EV.decodeEV(fixture());
assert.deepEqual([...raster.pixels],[0,1,2,3]);
assert.deepEqual([...EV.rgba(raster,EV.grayscalePalette())], [0,0,0,255,85,85,85,255,170,170,170,255,255,255,255,255]);
assert.deepEqual(EV.cgaPalette(0,1,1),[[0,0,0],[85,255,255],[255,85,255],[255,255,255]]);
assert.deepEqual(EV.cgaPalette(15,0,0),[[255,255,255],[0,170,0],[170,0,0],[170,85,0]]);
for (const data of [new Uint8Array(),new Uint8Array(2**20+1),fixture().slice(0,58)]) assert.throws(()=>EV.decodeEV(data));
for (const [off,value] of [[0,3],[50,65535],[52,201],[56,641],[58,3]]) {
  const d=fixture();new DataView(d.buffer).setUint16(off,value,true);assert.throws(()=>EV.decodeEV(d));
}
for (const value of [0,2,255]) {const d=fixture();d[55]=value;assert.throws(()=>EV.decodeEV(d));}
assert.throws(()=>EV.decodeEV('not bytes'));
assert.throws(()=>EV.cgaPalette(16,0,0));
assert.throws(()=>EV.cgaPalette(0,2,0));
assert.throws(()=>EV.rgba(raster,[[0,0,0]]));
// Subarray offsets must be honored, not interpreted against the whole buffer.
const padded=new Uint8Array(100);padded.set(fixture(),13);
assert.deepEqual([...EV.decodeEV(padded.subarray(13,74)).pixels],[0,1,2,3]);
console.log('Web decoder synthetic and malformed tests passed');
