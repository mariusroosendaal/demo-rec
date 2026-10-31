# Writing the narration

A demo's narration is a few spoken lines, each starting at a step of the take. They are also
its subtitles, and many viewers read them in a second language. Keep them plain and short,
and use the product's own words.

## The script

```
1. Start by <what the product needs from you>.
2. Next, <the choice you make>.
3. Then <a further step>.                       (only if there is one)
4. Finally, click <Button>, and <what happens>.
5. <What you end up with, or what to do next time.>
```

- **Sequence the steps** with "Start by", "Next", "Then" and "Finally". With only one step
  before the click, use "Then" rather than "Finally". A line that only describes what the
  screen shows needs no connector.
- **Start with what's needed**: "Start by selecting a frame with a width variable." Leave out
  what the viewer can't act on.
- **Name the choice, not the value picked.** "Next, choose how to sort and group them.", not
  "sort by name and group into sections", since the viewer may choose differently. Use
  "like" for an example: "a list, like names".
- **Click, then result**, in one sentence: "Finally, click Generate, and every pair gets a
  contrast score."
- **Close on the gain**: what the viewer ends up with, or how to keep it up to date.
- **Say labels as the screen shows them**, and drop counts that change: "Swap icons", not
  "Swap 3 icons".
- **Each line is a whole sentence**, ending on a full stop.

## Fitting the take

- **A line describes what happens from its step on.** If the step presses Enter, the line
  can't say "click"; change one or the other.
- **About 2.5 words a second.** A line should fit before the next narrated step. Shorten the
  line rather than speed up the voice.
- **The take waits for the voice**: a narrated step starts only when the line before it has
  finished, so a new take always fits its lines. After changing the lines, record again.
- `say` fixes a mispronunciation without changing the subtitle:
  `{ text: "Copy them from Huetone.", say: "Copy them from Hue-tone." }`.
- `pause: 1` leaves a second more before the next line.

## Review

`npx recital scripts` writes `NARRATION.md`, every demo's lines in one place, to read
before they're voiced. `narrate` prints each line's start and length and warns when one runs
into the next. To pick a voice, try a few on the same take (`--voice A,B --variant steady,warm`)
and compare them in `output/<demo>/narration/`.

## Longer demos as clips

Some places take only short videos; the Figma Community's limit is 30 seconds. Plan a longer
take as parts: give the steps of each part labels that start with its name, `sidebar · ramp`,
and `clips` cuts a clip per part. Open each part on a line that says what it's for, and end
no line past the end of its clip.
