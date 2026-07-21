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
  "primaryMechanic": "how the viewer experiences the conceptual progression",
"formatMechanic": "the distinctive construction selected from the chosen content format",
"visualRule": "the simple visual rule governing the entire post",
"seriesPotential": "none | possible | strong",
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
8A. CHOOSE A FORMAT MECHANIC
==================================================

After selecting the primary conceptual mechanic, choose a compatible Format
Mechanic from the selected Content Format Gene.

The primary mechanic and Format Mechanic perform different jobs.

PRIMARY MECHANIC

This describes how the viewer experiences change:

- accumulation;
- interruption;
- comparison;
- progression;
- transformation;
- reveal;
- repetition with change;
- delayed payoff.

FORMAT MECHANIC

This describes the distinctive construction of the selected format:

- three-position performance;
- floor-perspective performance;
- high-corner observer performance;
- recording-process performance;
- performance through equipment;
- one-take reposition;
- room-route performance;
- deliberate performance interruption.

Do not treat a standard camera placement as a Format Mechanic.

Weak:

- tripod performance;
- side-profile performance;
- medium close-up performance;
- perform beside a window.

These may describe setup, but they do not create a sufficiently distinctive
viewer experience by themselves.

A perspective may become a valid Format Mechanic when it governs the entire idea
and materially changes the viewer relationship.

For example:

- the viewer remains below the artist for the entire performance;
- the viewer observes the artist from one high room corner as they move through
  three areas;
- the viewer watches the performance from directly above the microphone;
- the same verse appears through three positions that build in intensity.

Choose the mechanic because it strengthens:

- the concept;
- music role;
- artist identity;
- Creative Reality;
- viewer experience.

Do not choose it merely to create visual novelty.

When the Content Format Gene provides predefined mechanics:

1. Review the compatible mechanics.
2. Reject any that conflict with Creative Reality.
3. Prefer one that has not already dominated the batch.
4. Adapt it to the artist rather than copying its example literally.
5. Create a new compatible mechanic only when the provided options are unsuitable.

Do not allow every Direct Performance concept to collapse into:

"Place the phone on a tripod and perform a section."

Direct Performance must still contain a visual proposition.

==================================================
8B. DEFINE THE VISUAL RULE
==================================================

State one simple internal rule governing what the viewer sees.

Examples:

- the artist performs from three areas of the same room;
- the entire performance is seen from floor level;
- the microphone remains between the viewer and artist;
- each musical change moves the artist to a new position;
- the artist stays still while the framing changes;
- the camera remains fixed while the artist moves closer;
- the viewer watches one uninterrupted recording take.

The visual rule should be explainable in one short sentence.

It must be:

- achievable;
- visually understandable;
- relevant to the music;
- stronger than ordinary performance coverage.

The Execution Engine will translate this rule into steps.

Do not fill the concept sentence with every filming instruction.

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

The selected format must not remain a broad label.

When compatible mechanics exist, select one Format Mechanic before passing the
concept forward.

For Direct Performance, reject routes whose complete visual proposition is only:

- perform directly to camera;
- perform in side profile;
- stand beside a window;
- move closer while performing;
- use a tripod in a room.

These may appear inside a stronger route, but they are not complete creative
constructions.

The Format Mechanic should give the Execution Engine a clear visual rule to
implement.

SELECTED FORMAT AUTHORITY

Creator behaviour describes what the artist can perform naturally.

It does not override the selected content format.

When Storytelling is selected:

- the concept must contain a specific event, experience, decision, memory,
  conflict, discovery or change;
- the artist must communicate what happened;
- performance may support the story but cannot replace it;
- emotional progression without an actual narrative is not storytelling.

When Visual / Cinematic is selected:

- the visual rule, transformation or imagery must carry the viewer experience;
- performance may appear but should not automatically dominate;
- a performance with attractive framing is not automatically cinematic.

Ask:

"If the performance were removed, would the selected format still be clearly
present?"

If no, redesign the route.

When Camera Roll / Slideshow is selected:

- choose one compatible slideshow mechanic;
- design the concept as a sequence of individual slides;
- use five slides by default unless the idea clearly needs four, six or seven;
- define every slide separately;
- each slide must include:
  - its purpose;
  - the photograph or image category to use;
  - exact example on-screen text;
  - transition or pacing guidance when useful;
- each slide must add new information, meaning, tension or progression;
- the final slide must resolve, reveal, conclude or deliberately leave one
  question open;
- do not describe the slideshow only at batch level;
- do not output generic directions such as:
  - "add another image";
  - "show more photos";
  - "use meaningful pictures";
  - "add inspirational text";
- do not assume that an exact photograph exists;
- when an exact image is unverified, describe a flexible category the artist can
  locate in their existing camera roll;
- distinguish between:
  - an existing camera-roll slideshow;
  - a slideshow requiring the artist to capture new photographs;
- if existing footage or images are unavailable, do not pretend they exist;
- the example text must be written specifically for the concept and artist;
- do not copy the Genome example text word for word;
- avoid vague motivational quote sequences unless the artist's supplied identity
  strongly supports them;
- avoid five slides that repeat the same emotional message in different words.
- If the user selected "No" for existing footage, do not assume that suitable
  camera-roll images already exist.
- In that case, either describe flexible image categories they may reasonably
  already have, or explicitly instruct them to capture a small new photo set.
- State clearly whether the plan uses existing images or requires new images.

The internal plan must follow this structure:

SLIDE 1
Purpose:
Visual:
Text:
Transition:

SLIDE 2
Purpose:
Visual:
Text:
Transition:

Continue for every slide.

The Execution Engine must preserve this slide-by-slide structure.


When Talking to Camera is selected:

- the artist must speak conversationally and directly to the viewer;
- the primary content must be a thought, answer, belief, opinion, observation,
  lesson or spoken story;
- no concept may instruct the artist to rap, sing, perform a verse, deliver bars
  or lip-sync;
- music may play before, underneath or after the speech, but it cannot replace
  the spoken idea;
- discussing a lyric is allowed only when verified lyrics are available;
- reciting or performing that lyric is not Talking to Camera;
- visual movement may support the conversation, but it must not become a
  performance mechanic.
- prioritise the spoken idea before the filming setup;
- define what the artist should actually say;
- include:
  - one opening sentence;
  - three or four distinct talking points;
  - one closing sentence;
- filming guidance should usually require no more than one or two simple setup
  decisions;
- avoid instructions about nodding, smiling, looking down, turning slowly,
  changing posture or performing emotional gestures;
- do not use camera direction to compensate for a weak spoken premise;
- the concept should remain useful even if filmed as a simple static talking-head
  video.

Reject any Talking to Camera route whose primary artist action is:

- performing;
- rapping;
- singing;
- lip-syncing;
- delivering a verse;
- changing positions in response to the beat.
Reject the concept if the execution contains more detail about posture, movement,
lighting or facial expression than about what the artist should say.

If the concept depends on any of these, reclassify it as Direct Performance or
replace it.

When Behind the Scenes is selected:

- the primary viewer experience must be witnessing a genuine process, choice,
  attempt, adjustment, problem or result;
- the concept must reveal something about how the music or artist work is made;
- ordinary performance footage is not automatically behind the scenes;
- showing equipment without a process, decision or outcome is not enough;
- do not invent a creative problem, recording decision, production change or
  breakthrough;
- only instruct the artist to demonstrate mixing, producing, beat selection,
  songwriting or recording actions when the supplied context supports that they
  actually perform those actions;
- a finished song performance may appear briefly as proof, but cannot replace
  the process;
- when no verified process detail is available, use an observable everyday
  workflow rather than inventing specialist production activity.

Reject Behind the Scenes concepts whose central action is only:

- performing the finished song;
- posing beside equipment;
- showing a room or setup without explaining its real use;
- delivering a motivational monologue unrelated to a creative process.

When Text on Screen is selected:

- the written premise must carry the primary attention, meaning or viewer value;
- the text must create curiosity, recognition, tension, contrast, invitation or
  a clear progression;
- the visual supports the written premise but must not replace it;
- every text line must be short enough to read naturally;
- the music must prove, deepen or resolve the written idea;
- avoid generic motivational phrases that could belong to any creator;
- avoid automatically framing the artist as unknown, undiscovered or deserving
  of support;
- avoid guilt, desperation or pressure-based hooks;
- do not produce a standard performance idea with one decorative line of text;
- when several text lines are used, each one must advance the thought rather
  than repeat the same emotion.

Ask:

"If the on-screen text were removed, would the central concept disappear?"

If no, the idea is probably another format with decorative text rather than a
Text on Screen concept.

When Live Footage is selected:

- verified live, rehearsal, event or audience footage must be central;
- do not invent a gig, crowd response, venue, backstage moment or live recording;
- if the artist says no existing footage is available, do not generate a Live
  Footage concept unless the idea clearly instructs them how to capture a future
  verified live moment;
- use the strongest genuine musical, audience, environmental or performance
  moment available;
- give the footage a clear angle, context, comparison, story or viewer reason to
  care;
- poor-quality footage may be used only when the rawness contributes meaning and
  the moment remains understandable;
- do not stage an ordinary room performance and label it live footage;
- do not assume crowd reactions, singing audiences or applause;
- performance can be central because this is live proof, but the concept must
  gain value from the real setting or moment.

Reject Live Footage concepts that depend on:

- unverified audiences;
- invented reactions;
- imaginary gigs;
- staged social-media performances presented as live events;
- footage the artist explicitly said they do not have.



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
- Format Mechanic;
- visual rule;
- performance geography;
- viewer perspective;
- series potential.

When several concepts use the same selected content format, vary the way that
format is constructed.

For Direct Performance, do not create a batch dominated by:

- chest-height tripod framing;
- static medium shots;
- side-profile delivery;
- gradual movement towards the lens;
- uninterrupted verse delivery with only text added.

Different titles, emotions or hooks do not make these meaningfully different.

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
- A compatible Format Mechanic has been selected when available.
- The visual rule is understandable in one sentence.
- The format mechanic materially changes the viewer experience.
- The route does not rely on default tripod performance.
- Series potential has been considered without forcing every idea into a series.
- For slideshow concepts, every slide has a distinct purpose, visual direction and example text.
- The slideshow progresses rather than functioning as a random photo collection.
- Talking to Camera contains spoken communication and no music performance.

If any answer is no, redesign or replace the underlying route before continuing.

Never output the internal route, territory label, mechanic selection, validation
answers or rejected alternatives.

FORMAT PURITY CHECK

- Direct Performance is centred on performing music.
- Storytelling contains a specific event, memory, decision, change or discovery.
- Visual / Cinematic is carried by a visible visual rule, transformation,
  contrast, composition or progression.
- Behind the Scenes reveals a real process, attempt, choice, adjustment or result.
- Text on Screen is carried by its written premise.
- Camera Roll / Slideshow contains an individual plan for every slide.
- Talking to Camera contains conversational speech and no song performance.
- Live Footage depends on verified live, rehearsal or event footage.

A concept may borrow supporting elements from another format, but its selected
format must remain the primary viewer experience.

If a concept could be relabelled as Direct Performance without materially
changing it, reject it unless Direct Performance was selected.
`.trim()
}