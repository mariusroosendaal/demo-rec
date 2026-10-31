// Checks that need no browser: scenario validation and near matches. npm test.

import assert from "node:assert/strict";
import test from "node:test";
import { closest, distance, suggest } from "../src/similar.js";
import { validate } from "../src/validate.js";
import rijksmuseum from "../examples/scenarios/rijksmuseum.js";
import selftest from "../examples/scenarios/selftest.js";

test("the example scenarios are valid", () => {
  assert.deepEqual(validate(selftest), []);
  assert.deepEqual(validate(rijksmuseum), []);
});

test("validation catches typos, with hints", () => {
  const problems = validate({
    file: "https://www.figma.com/design/abc/x?node-id=1-2",
    plugin: { name: "X", ready: "#app" },
    voise: "Lily",
    steps: [
      { clik: { ui: "#a" } },
      { click: { plugn: "#b" }, label: "open" },
      { click: { ui: "#c" }, hodl: 300, label: "go" },
      { type: "hi", into: { ui: "#d", ofset: [0, 2] } },
    ],
    narration: [{ at: "opne", text: "Open it." }],
    camera: [{ at: "go", zoom: 1.5 }],
  });
  for (const hint of ['"voice"', '"click"', '"plugin"', '"hold"', '"offset"', '"open"']) {
    assert.ok(problems.some((p) => p.includes(`did you mean ${hint}`)), `no hint for ${hint} in:\n${problems.join("\n")}`);
  }
  assert.ok(!problems.some((p) => p.startsWith("camera")), "camera's label is a step");
});

test("a scenario without url or file is caught", () => {
  assert.ok(validate({ steps: [] }).some((p) => p.startsWith("no url")));
});

test("Figma-only actions and keys need the Figma adapter", () => {
  assert.ok(validate({ url: "https://example.com", steps: [{ openPlugin: true }] }).some((p) => p.includes("no known action")));
  assert.ok(validate({ url: "https://example.com", plugin: { name: "X", ready: "#a" }, steps: [] }).some((p) => p.includes('"plugin"')));
  assert.deepEqual(validate({ file: "https://www.figma.com/design/abc/x", plugin: { name: "X", ready: "#a" }, steps: [{ openPlugin: true }] }), []);
});

test("a scenario's own adapter brings its keys, targets, actions and options", () => {
  const adapter = {
    name: "board",
    keys: ["board"],
    options: ["smooth"],
    url: (scenario) => `https://board.example.com/b/${scenario.board}`,
    boxes: { shape: async () => ({ x: 0, y: 0, width: 10, height: 10 }) },
    actions: { fit: async () => {} },
  };
  assert.deepEqual(validate({ adapter, board: "q3", steps: [{ fit: true, smooth: true }, { click: { shape: "Launch" } }] }), []);
  assert.ok(validate({ adapter, board: "q3", steps: [{ fit: true, smoth: true }] }).some((p) => p.includes('did you mean "smooth"')));
});

test("a target can be in an iframe", () => {
  assert.deepEqual(validate({ url: "https://example.com", steps: [{ click: { ui: "button", frame: "iframe#pay" } }] }), []);
});

test("near matches", () => {
  assert.equal(distance("Frist", "First"), 2);
  assert.deepEqual(closest("Generte", ["Generate", "Cancel", "Generated"], { limit: 2 }), ["Generate", "Generated"]);
  assert.equal(suggest("zzzzzz", ["click", "move"]), "");
});
