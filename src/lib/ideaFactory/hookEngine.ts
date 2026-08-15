// src/lib/ideaFactory/hookEngine.ts

export function formatHookEngineForPrompt() {
  return `
==================================================
HOOK ENGINE
==================================================

PURPOSE

Create the strongest opening for the approved concept and selected audience stage.

The hook exists to earn the next second of attention.

The concept comes first.
The hook communicates why the concept is worth watching.

The hook must support the approved concept.
It must not introduce a separate premise, unsupported fact or new creative direction.

Do not reveal this reasoning.

==================================================
1. INPUTS
==================================================

Use:

- Identity Kit;
- Audience Psychology;
- audience stage;
- primary goal;
- Attention Gene;
- selected content format;
- approved concept mechanic;
- Creative Reality;
- lyric availability;
- platform context.

Higher-authority evidence still overrules the Hook Engine.

Never introduce:

- unsupported artist history;
- invented emotional experiences;
- unavailable lyrics;
- unverified release details;
- a promise the concept does not deliver.

==================================================
2. UNDERSTAND THE VIEWER RELATIONSHIP
==================================================

Before writing the hook, determine:

- how familiar the viewer is with the artist;
- how much emotional investment already exists;
- what level of context the viewer will tolerate;
- what commitment has already been earned;
- what stopping mechanism best fits the concept;
- what the viewer receives by continuing to watch.

==================================================
3. SELECT ONE PRIMARY HOOK STRATEGY
==================================================

Choose one primary strategy:

- visual curiosity;
- musical curiosity;
- emotional recognition;
- relatable tension;
- unexpected statement;
- pattern interruption;
- demonstration;
- transformation;
- question;
- mystery;
- recognisable situation;
- unexpected performance;
- contrast;
- delayed reveal.

Do not combine several unrelated hook strategies.

The chosen strategy must fit the concept mechanic and Attention Gene.

==================================================
4. AUDIENCE-STAGE HOOK RULES
==================================================

DISCOVERY

Primary objective:
Earn attention from someone who does not know the artist.

Prefer:

- immediate visual curiosity;
- musical proof;
- recognisable tension;
- viewer-first statements;
- compelling contrast;
- a clear curiosity gap;
- an unusual but understandable visual rule;
- an immediate reveal or promised payoff.

Avoid:

- artist introductions;
- unexplained personal history;
- fan references;
- release lore;
- long context;
- vague poetic statements;
- high-effort questions;
- explaining why the song matters to the artist.

HARD DISCOVERY HOOK RULES

A Discovery hook must primarily describe, reveal or promise something the stranger
can immediately experience.

Reject hooks that primarily communicate:

- what the artist feels about themselves;
- why the artist cares about the song;
- what the creative process means to the artist;
- vague identity claims;
- private reflection without an immediate public tension;
- poetic language that does not tell the viewer what to notice.

Prefer hooks that expose the observable mechanic:

- what changes;
- what is hidden;
- what will be revealed;
- what contrast the viewer should notice;
- what musical moment will alter the visual;
- what question the concept will answer.

Weak:
"Each corner holds a different side of me."

Stronger:
"Same verse. Three corners. Three completely different moods."

Weak:
"Seeing myself here reminds me why every take matters."

Stronger:
"You never see the full performance—only what the reflection reveals."

If the hook depends on interest in the artist rather than interest in the immediate
viewer experience, rewrite it.

The hook must make sense without prior familiarity.

AWARENESS

Primary objective:
Turn recognition into stronger interest.

Prefer:

- memorable identity;
- recurring creative motifs;
- distinctive observations;
- personality;
- creative process;
- confident opinions;
- clear reasons to remember or return.

Avoid assuming recognition already means loyalty.

CONNECTION

Primary objective:
Deepen emotional investment.

Prefer:

- honest reflection;
- beliefs;
- specific personal truth;
- meaningful process;
- vulnerability supported by artist evidence;
- relatable emotional context.

Do not invent vulnerability merely to create intimacy.

COMMUNITY

Primary objective:
Activate existing belonging.

Prefer:

- shared memories;
- recurring series references;
- community language;
- familiar rituals;
- fan recognition;
- callbacks;
- meaningful choices.

Inside references are allowed only when the audience stage genuinely supports them.

RELEASE SUPPORT

Primary objective:
Create fresh attention around the current release.

Prefer:

- immediate music-first moments;
- anticipation;
- a specific release angle;
- a verified performance moment;
- a verified lyric or song moment when supplied;
- transformation, contrast or payoff inside the release.

Avoid generic announcements and unsupported lyric references.

CONVERSION

Primary objective:
Clarify value and prepare the viewer for one meaningful action.

Prefer:

- proof;
- outcome;
- transformation;
- relevance;
- genuine urgency;
- reduced friction;
- a clear reason to act.

Do not use false urgency or unsupported results.

==================================================
5. HOOK WRITING RULES
==================================================

The hook should normally be:

- concise;
- immediately understandable;
- specific to the concept;
- natural for the artist;
- appropriate for the platform;
- emotionally or visually concrete.

The hook may be:

- spoken;
- written on screen;
- created through the first image;
- created through movement;
- created through sound;
- created through a delayed reveal.

A visual hook does not always need a spoken sentence.

Do not confuse poetic wording with stopping power.

Do not write a hook that could be attached unchanged to many unrelated artists.

When the concept has a strong observable visual mechanic, prefer exposing that
mechanic over writing a poetic emotional statement.

==================================================
6. HOOK VALIDATION
==================================================

Before approving the hook, ask:

1. Does it support the approved concept?
2. Does it match the audience stage?
3. Does it earn another second of attention?
4. Does it make sense without missing context?
5. Does it promise something the concept actually delivers?
6. Would removing it weaken the viewer experience?
7. Is it specific enough to this artist or concept?
8. Does it avoid over-explaining?
9. Does it avoid repeating the title or on-screen text?
10. Does it remain grounded in verified information?
11. Does it fit the selected Attention Gene?
12. Is the commitment appropriate for this point in the viewer journey?
13. For Discovery, does the hook expose the viewer experience before discussing the artist?

If the hook fails, rewrite it before continuing.

Do not change a strong approved concept merely to preserve a weak hook.
`.trim()
}