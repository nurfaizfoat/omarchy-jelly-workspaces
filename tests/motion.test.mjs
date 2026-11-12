import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const motion = {};
runInNewContext(readFileSync(new URL('../JellyMotion.js', import.meta.url), 'utf8'), motion);
const near = (actual, expected, epsilon = 1e-6) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} != ${expected}`);

test('the nine approved key poses land at their exact timestamps', () => {
  const track = motion.track(166, 247, 1, motion.rest(166));
  const expected = [166,164,177,204,229,253,244,248,247];
  motion.poses.forEach((pose, i) => {
    const p = motion.sample(track, pose.ms / 320);
    near(p.cx, expected[i]);
    near(p.w, pose.w);
  });
});

test('every interpolated outline preserves area and stays finite', () => {
  const track = motion.track(10, 31, 14/47, motion.rest(10));
  const rest = motion.geometry(motion.rest(10), 14);
  for (let frame = 0; frame <= 320; frame++) {
    const geometry = motion.geometry(motion.sample(track, frame / 320), 14);
    near(geometry.area, rest.area);
    assert.ok(geometry.width > 0 && geometry.height > 0);
    assert.ok(!/NaN|Infinity/.test(geometry.path));
    assert.equal((geometry.path.match(/C /g) ?? []).length, 10);
  }
});

test('reverse travel mirrors the material and preserves exact endpoints', () => {
  const right = motion.track(10,31,14/47,motion.rest(10));
  const left = motion.track(31,10,14/47,motion.rest(31));
  for (let i=0;i<=320;i++) {
    const a = motion.sample(right,i/320), b = motion.sample(left,i/320);
    near(a.cx+b.cx,41);
    near(a.left,b.right);
    near(a.right,b.left);
  }
});

test('interrupted reversals begin at the exact current position and outline', () => {
  const first = motion.track(10,31,14/47,motion.rest(10));
  const current = motion.sample(first,.31);
  const reversed = motion.track(current.cx,10,14/47,current);
  const firstReverse = motion.sample(reversed,0);
  for (const key of ['cx','w','left','right','neck','r']) near(firstReverse[key],current[key]);
  near(motion.sample(reversed,1).cx,10);
});

test('large jumps have bounded overshoot, not distance-proportional wobble', () => {
  const track = motion.track(10,220,14/47,motion.rest(10));
  near(motion.sample(track,180/320).cx,220+6*14/47);
  near(motion.sample(track,1).cx,220);
});

test('zero-distance tracks and arbitrary font scales remain valid', () => {
  for (const scale of [8,14,20,32]) {
    const points = motion.track(40,40,scale/47,motion.rest(40));
    for (const progress of [0,.1,.3,.5,.7,1]) {
      const g=motion.geometry(motion.sample(points,progress),scale);
      assert.ok(!/NaN|Infinity/.test(g.path));
    }
  }
});
