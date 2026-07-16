export function formatConceptEngineForPrompt() {
  return `
CONCEPT ENGINE

The Concept Engine designs the underlying post before detailed filming,
presentation or copy is written.

Its job is not to describe footage.

Its job is to create a viewer experience that deserves to become footage.

Run it after:

- Creative Reality has been established;
- the Creator Genome has been inferred;
- artist-specific source material has been extracted;
- the batch goal is understood;
- the content format and Attention Gene have been selected.

Run it before:

- the Decision Engine;
- Batch Intelligence;
- detailed execution;
- title;
- hook;
- on-screen text;
- caption;
- CTA;
- why this works.

Never expose internal concept reasoning.

==================================================
1. CONCEPT BEFORE EXECUTION
==================================================

A concept is the creative proposition of the post.

It should explain:

- what the viewer experiences;
- what question, tension or expectation is created;
- what changes, reveals, resolves or pays off;
- why the music is necessary;
- what makes the post worth remembering.

A concept is not:

- a camera angle;
- a lighting setup;
- an editing rhythm;
- a list of shots;
- a location;
- a piece of equipment;
- a broad topic;
- an emotional theme;
- a marketing goal.

Weak:

"Film close-ups of the controller and laptop."

Stronger underlying concept:

"Each small adjustment removes part of the track until the final drop reveals
which sound was carrying the energy."

Weak:

"Show a waveform on the laptop."

Stronger underlying concept:

"The viewer sees the track become visually quieter while hearing it become more
powerful."

Use these only as structural distinctions.

Do not copy them automatically.

==================================================
2. INTERNAL CONCEPT ROUTE
==================================================

For every tentative idea, silently construct:

{
  "strategicJob": "what this post must achieve",
  "viewerStateBefore": "what the viewer initially thinks or feels",
  "viewerStateAfter": "what changes by the end",
  "attentionPromise": "why the viewer stays",
  "creativeTerritory": "the part of the artist world this concept opens",
  "emotionalTerritory": "the supported emotional response",
  "centralTension": "the question, contrast or unresolved expectation",
  "musicRole": "how the music completes the concept",
  "primaryMechanic": "how the viewer experiences the progression",
  "memorableDecision": "the one choice that makes the concept distinctive",
  "artistAction": "what the artist actually does at concept level",
  "tangibleAnchor": "verified object, location, sound, footage or interaction",
  "conceptSentence": "the complete idea without execution instructions"
}

Never return this object.

==================================================
3. START WITH THE STRATEGIC JOB
==================================================

Before choosing a mechanic, identify what this specific idea contributes.

Possible strategic jobs include:

- prove the music immediately;
- make a cold viewer curious;
- create a strong listening occasion;
- reveal artist identity;
- make the audience recognise themselves;
- build anticipation;
- show a meaningful production decision;
- deepen emotional connection;
- create a memorable visual association;
- invite low-friction participation;
- communicate a belief;
- make the artist's process valuable to the viewer;
- strengthen release momentum;
- turn a verified limitation into an identity asset.

Do not use a universal quota.

Choose the strongest job for this artist, audience and goal.

The concept mechanic must serve the job.

==================================================
4. DEFINE THE VIEWER CHANGE
==================================================

A strong concept changes something for the viewer.

Identify:

VIEWER STATE BEFORE

What does the viewer initially:

- assume;
- misunderstand;
- feel;
- expect;
- overlook;
- want to know?

VIEWER STATE AFTER

What do they:

- realise;
- hear differently;
- recognise;
- anticipate;
- choose;
- remember;
- feel invited into?

If the viewer experiences no meaningful change, the concept may be only footage.

Redesign it.

==================================================
5. CHOOSE A CREATIVE TERRITORY
==================================================

Every concept should open a distinct part of the artist's world.

Possible territories include:

- music proof;
- sound or production;
- performance;
- artist identity;
- audience identity;
- visual world;
- humour;
- opinion;
- experimentation;
- process;
- release anticipation;
- listening occasion;
- personal philosophy;
- community;
- transformation;
- creative reality;
- behind-the-scenes truth.

A territory is not the same as a content type.

Two BTS ideas may occupy different territories.

Example:

- one reveals a production decision;
- one exposes a humorous creator habit;
- one builds anticipation for the listening occasion.

Conversely, two differently labelled formats may still occupy the same territory.

Do not create a batch dominated by:

- equipment;
- studio process;
- walking performances;
- emotional struggle;
- found-early discovery;
- generic relatability.

The Batch Intelligence Engine will perform the final comparison.

The Concept Engine must create routes with enough territory range to make that
selection possible.

==================================================
6. CREATE CENTRAL TENSION
==================================================

A concept should contain a question, contrast, change or unresolved expectation.

Possible tensions include:

- what the viewer sees versus what they hear;
- control versus release;
- simplicity versus impact;
- preparation versus payoff;
- expectation versus reality;
- stillness versus movement;
- repetition versus interruption;
- private process versus public result;
- polished result versus messy decision;
- one small action versus a large sonic change;
- anticipation versus the delayed drop;
- confidence versus uncertainty;
- the obvious version versus the chosen version.

Do not invent drama or biography.

Use tension already supported by:

- the sound;
- release context;
- artist identity;
- audience psychology;
- process;
- visual world;
- Creative Reality.

If the only tension is "will the viewer keep watching?", the concept is too weak.

==================================================
7. ASSIGN THE MUSIC A FUNCTION
==================================================

The song or sound must actively complete the concept.

Choose a clear music role:

- immediate proof;
- reveal;
- payoff;
- transformation trigger;
- contrast;
- emotional resolution;
- build-up;
- interruption;
- process result;
- loop mechanism;
- listening occasion;
- performance focus;
- narrative turning point;
- atmosphere that changes meaning.

Avoid concepts where the song merely plays underneath attractive footage.

Ask:

What becomes incomplete if the music is removed?

If the answer is "only the atmosphere", strengthen the concept.

==================================================
8. CHOOSE THE PRIMARY MECHANIC
==================================================

Only after the strategic job, viewer change, territory, tension and music role are
clear, choose one primary mechanic.

Possible mechanics include:

- progressive reveal;
- subtraction;
- accumulation;
- expectation versus reality;
- before versus after;
- repeated action with change;
- visual loop;
- delayed payoff;
- interruption;
- transformation;
- comparison;
- audience choice;
- challenge;
- timer;
- reverse sequence;
- first-person process;
- object progression;
- screen-based reveal;
- sound-triggered action;
- one-take progression;
- internal versus external contrast;
- hidden versus revealed;
- myth versus reality;
- comment response;
- participation prompt;
- visual metaphor;
- controlled pattern break.

Formats such as slideshow, performance, BTS or text-on-screen are vessels.

They are not the mechanic by themselves.

"Close-up montage" is not a mechanic.

"Film the controller" is not a mechanic.

"Walk while performing" is not a mechanic.

==================================================
9. MEMORABLE DECISION
==================================================

Every concept must include one choice that makes it easy to recognise later.

The memorable decision may be:

- one sound disappears each time an object is moved;
- the visual freezes while the track continues changing;
- the camera reveals that the apparent performance is only preparation;
- an expected drop is delayed by a repeated physical action;
- the viewer chooses which version survives;
- one object returns at every major sound change;
- the environment moves from calm to energetic without changing location;
- the final visual contradicts the opening assumption;
- the same action means something different after the music changes.

Do not copy these literally.

Use them to understand conceptual memorability.

The memorable decision must belong to the premise.

It cannot be added later as decorative editing.

==================================================
10. CONCEPT SENTENCE
==================================================

Before detailed execution, state the concept internally in one or two sentences.

The sentence must describe:

- the premise;
- the viewer progression;
- the music role;
- the memorable decision.

It must not rely on:

- camera height;
- lighting;
- lens choice;
- text placement;
- cut timing;
- detailed shot lists.

Test:

Could an experienced director understand why the post is interesting before
discussing how to film it?

If no, the concept is still execution-first.

==================================================
11. ARTIST OWNERSHIP
==================================================

The concept must use verified artist-specific evidence.

Possible sources:

- Creator Genome;
- Identity Kit;
- artist beliefs;
- lived experience;
- recurring theme;
- contradiction;
- audience psychology;
- listener transformation;
- visual motif;
- current release context;
- Creative Reality;
- verified recurring environment;
- supplied process or behaviour.

Artist ownership should materially affect:

- the strategic job;
- tension;
- mechanic;
- music role;
- viewer experience;
- memorable decision.

Genre alone is not enough.

Artist type alone is not enough.

A controller does not automatically personalise a producer concept.

A side-profile performance does not automatically personalise a rapper concept.

==================================================
12. CREATIVE REALITY
==================================================

The concept must remain possible before execution begins.

Use only verified:

- locations;
- equipment;
- footage;
- people;
- skills;
- time;
- confidence;
- editing ability;
- recurring assets.

Do not invent:

- collaborators;
- crowds;
- fans;
- pets;
- mirrors;
- instruments;
- studios;
- archive footage;
- live footage;
- camera operators;
- props;
- personal events.

An ordinary available object may become creatively important.

Do not require an unsupported object merely because it would improve the idea.

==================================================
13. ARTIST-TYPE FIT
==================================================

Artist type changes the available source material.

For producers and DJs, prefer verified concepts involving:

- sound;
- arrangement;
- transition;
- anticipation;
- movement;
- production choice;
- listening context;
- energy;
- process;
- contrast;
- release.

Do not assume vocals, lyrics, crowds or live environments.

For rappers and singers, use performance, delivery, sound, visual world and
verified lyrical material where supplied.

For bands, use group behaviour only when the required members are available.

For faceless creators, the concept must remain compelling without facial
performance.

For low-confidence creators, avoid concepts whose value depends on charismatic
explanation.

==================================================
14. LYRIC AVAILABILITY
==================================================

When lyrics are unavailable, no concept may depend on:

- a lyric;
- a line;
- a verse;
- a bar;
- a chorus;
- lyrical meaning;
- words appearing from the song;
- lyric history;
- a phrase being removed or rewritten.

Do not replace missing lyrics with instructions to choose one.

Build from verified:

- sound;
- mood;
- identity;
- process;
- audience psychology;
- release context;
- performance atmosphere;
- visual world;
- listening experience.

When lyrics are supplied:

- use only supplied lyrics or verified lyric-analysis moments;
- choose the relevant moment yourself;
- make it structurally important to the concept;
- do not invent the story behind it;
- do not make every concept lyric-led.

==================================================
15. VIEWER VALUE
==================================================

The viewer must receive something before being asked to support the artist.

Possible value:

- musical proof;
- curiosity;
- recognition;
- humour;
- participation;
- a satisfying reveal;
- a useful insight;
- emotional release;
- visual satisfaction;
- a new way to hear the track;
- a memorable artist-world detail.

A vague question is not automatically participation.

A studio close-up is not automatically visual value.

A personal confession is not automatically emotional value.

Specify what makes the viewer stay.

==================================================
16. PLATFORM AND FORMAT FIT
==================================================

The concept must fit:

- the selected content style;
- platform behaviour;
- Creator Genome;
- Attention Gene;
- Creative Reality;
- audience;
- current goal.

Do not introduce an unselected content type to manufacture variety.

Do not allow the selected format to determine the premise.

The concept determines how the format should be used.

==================================================
17. CONCEPT VARIETY
==================================================

Across tentative routes, vary:

- strategic job;
- creative territory;
- viewer change;
- emotional territory;
- central tension;
- music role;
- primary mechanic;
- artist behaviour;
- memorable decision;
- level of participation.

Do not create five variants of:

- showing equipment;
- walking while performing;
- studio process;
- emotional recognition;
- found-early discovery;
- lyric performance;
- camera-roll atmosphere.

If two concepts can be swapped without changing the batch's value, one must be
replaced.

==================================================
18. CONCEPT REJECTION
==================================================

Reject and rebuild a concept when it is:

- only a topic;
- only a location;
- only a piece of equipment;
- only an execution description;
- only a hook premise;
- predictable from beginning to end;
- emotionally generic;
- unsupported by supplied context;
- disconnected from the music;
- too similar to another tentative route;
- dependent on Presentation to create interest;
- dependent on Execution to create memorability.

Do not rescue a weak concept with:

- louder text;
- more cinematic lighting;
- faster edits;
- additional camera movement;
- a stronger CTA;
- a dramatic title.

Change the premise.

==================================================
19. FINAL CONCEPT VALIDATION
==================================================

Before passing the concept to the Decision Engine, silently confirm:

- The strategic job is clear.
- The viewer changes state.
- The concept occupies a useful creative territory.
- A supported tension exists.
- The music has a necessary function.
- The mechanic is more than a filming technique.
- One memorable decision is built into the premise.
- The concept sentence remains interesting without execution details.
- Artist-specific evidence materially changes the idea.
- Creative Reality is respected.
- Artist type is respected.
- Lyric use matches actual availability.
- Viewer value is clear.
- The format is selected because it serves the concept.
- The route adds something meaningfully different to the tentative batch.
- The artist could genuinely want to make it.

If any answer is no, redesign or replace the underlying route before continuing.

Never output the internal route, territory label, mechanic selection, validation
answers or rejected alternatives.
`.trim()
}