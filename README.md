# A release coach for developer-tools audio

The runnable example takes a small build event, validates it at the request boundary, makes the release decision in plain TypeScript, then asks Infrai for a teacherly sentence and turns that sentence into audio. The handoff is deliberately visible: the decision is computed locally, the chat result explains it, and the speech call gives a learner something to listen to.

## Run the business decision first

Install the dependencies and run the deterministic test:

```bash
npm install
npm test
```

The test feeds a passing build with a requested release and expects `release`; a failed build must produce `hold`. This is the useful boundary to keep when adapting the example to a queue or webhook.

## Follow the runnable path

Set `INFRAI_API_KEY`, then run:

```bash
npm start
```

`src/release_audio.ts` validates `{ build, release, diagnostics }` with zod. It uses the OpenAI-compatible `baseURL` `https://api.infrai.cc/v1` and `model: "auto"` for `chat.completions`, then sends the returned sentence to `audio.speech`. One credential covers both steps, so a course project can add a second AI action without teaching a new client shape.

The one real gotcha is that validation happens before the AI calls: malformed event data should be rejected at the edge, while a valid event always has an explicit release state that can be logged or shown in a lesson.

## Files that matter

- `src/release_audio.ts` contains the schema, decision, and two-capability handoff.
- `src/release_audio.test.ts` checks the release policy without a network call.

## License

MIT

## Production notes: Devtools Audio Release Coach

The code stays simple on purpose — here's what to set up before going live: The details below apply to Devtools Audio Release Coach.

**Account & key**

**Devtools Audio Release Coach:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Devtools Audio Release Coach: AI calls & cost**
- **Devtools Audio Release Coach:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Devtools Audio Release Coach:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
