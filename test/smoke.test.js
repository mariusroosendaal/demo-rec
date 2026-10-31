// Records the self-test in a fresh workspace and browser profile, and checks the take: its
// size, frame rate and length, the phone copy, and the steps file. npm run test:smoke: outside
// Claude Code's sandbox, like recording. With no display (Linux CI) the take records headless.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const probe = (file, entries) =>
  execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", entries, "-of", "json", file]).toString();

test("records the self-test", { timeout: 300_000 }, () => {
  // Kept when the test fails; CI uploads it from RUNNER_TEMP
  const workspace = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP ?? os.tmpdir(), "recital-smoke-"));
  fs.cpSync(path.join(ROOT, "examples/scenarios"), path.join(workspace, "scenarios"), { recursive: true });
  const run = spawnSync(process.execPath, [path.join(ROOT, "src/bin.js"), "demo", "selftest"], {
    cwd: workspace,
    env: { ...process.env, RECITAL_CACHE: path.join(workspace, ".cache"), DEMO_WORKSPACE: workspace },
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `demo selftest failed:\n${run.stdout}\n${run.stderr}`);

  const out = path.join(workspace, "output/selftest");
  const take = path.join(out, "take.mp4");
  const { streams: [video] } = JSON.parse(probe(take, "stream=width,height,r_frame_rate:format=duration"));
  assert.deepEqual([video.width, video.height], [3200, 1800]);
  assert.equal(video.r_frame_rate, "60/1");
  const { format } = JSON.parse(probe(take, "format=duration"));
  const seconds = Number(format.duration);
  assert.ok(seconds > 8 && seconds < 30, `take is ${seconds}s`);

  const { streams: [phone] } = JSON.parse(probe(path.join(out, "take-phone.mp4"), "stream=width"));
  assert.equal(phone.width, 1600);

  const steps = JSON.parse(fs.readFileSync(path.join(out, "take.steps.json"), "utf8"));
  assert.equal(steps.length, 6);
  assert.deepEqual(steps.map((s) => s.skipped), [false, false, false, true, false, false]);
  steps.forEach((s, i) => {
    assert.ok(s.end >= s.start, `step ${s.step} ends before it starts`);
    if (i) assert.ok(s.start >= steps[i - 1].start, `step ${s.step} starts before the one before`);
  });
  assert.ok(steps.at(-1).end < seconds, "the last step ends inside the take");

  fs.rmSync(workspace, { recursive: true, force: true });
});
