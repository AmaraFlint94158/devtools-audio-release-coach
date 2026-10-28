import { strict as assert } from "node:assert";
import { decideRelease, developerEvent } from "./release_audio.js";

const event = developerEvent.parse({ build: "passed", release: "requested", diagnostics: "tests are green" });
assert.equal(decideRelease(event), "release");
assert.equal(decideRelease({ build: "failed", release: "requested", diagnostics: "type error" }), "hold");
console.log("release decision test passed");
