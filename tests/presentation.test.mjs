import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const policy = {};
runInNewContext(readFileSync(new URL('../LayoutPresentation.js', import.meta.url), 'utf8'), policy);
const rgb = hex => ({
  r: parseInt(hex.slice(1,3),16)/255,
  g: parseInt(hex.slice(3,5),16)/255,
  b: parseInt(hex.slice(5,7),16)/255,
});
const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

test('scrolling/floating workspaces have no inset symbol by default', () => {
  assert.equal(manifest.barWidget.defaults.showLayoutSymbol, false);
  for(const mode of ['dwindle','scrolling','floating']) {
    assert.equal(policy.showSymbol(false,true,false,mode), false);
    assert.equal(policy.showSymbol(undefined,true,false,mode), false);
  }
});

test('symbols require explicit opt-in and an active, settled, known layout', () => {
  assert.equal(policy.showSymbol(true,true,false,'scrolling'), true);
  assert.equal(policy.showSymbol(true,true,false,'floating'), true);
  for(const [enabled,shown,moving,mode] of [
    ['true',true,false,'scrolling'],[true,false,false,'scrolling'],
    [true,true,true,'scrolling'],[true,true,false,'dwindle'],
    [true,true,false,'<img src="https://example.invalid">'],
  ]) assert.equal(policy.showSymbol(enabled,shown,moving,mode), false);
});

test('optional symbol remains legible on warm, black and light marker colors', () => {
  for(const fill of ['#FEDBA0','#000000','#FFFFFF','#101315','#426060']) {
    const marker=rgb(fill), background=rgb('#000900');
    const ink=policy.symbolInk(marker,background);
    assert.ok(policy.contrast(marker,typeof ink==='string'?rgb(ink):ink)>=4.5);
  }
});

test('layout tooltip keys are whitelisted, never raw compositor text', () => {
  assert.equal(policy.layoutKey('scrolling'),'layout.scrolling');
  assert.equal(policy.layoutKey('floating'),'layout.floating');
  assert.equal(policy.layoutKey('dwindle'),'layout.tiling');
  assert.equal(policy.layoutKey('<img src="https://example.invalid">'),'layout.tiling');
});
