export type InterferenceConflictType =
  | 'explicit-instruction'
  | 'creative-reality'
  | 'unsupported-assumption'
  | 'selected-style'
  | 'creator-comfort'
  | 'identity'
  | 'audience'
  | 'goal'
  | 'format'
  | 'attention'
  | 'lyrics'
  | 'artist-type'
  | 'execution'


export type InterferenceSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'blocking'

export type InterferenceResolution =
  | 'allow'
  | 'adapt'
  | 'replace'

export type InterferenceConflict = {
  type: InterferenceConflictType
  severity: InterferenceSeverity
  issue: string
  resolution: string
}

export type InternalInterferenceDecision = {
  decision: InterferenceResolution
  conflicts: InterferenceConflict[]
  preserve: string[]
  change: string[]
  prohibit: string[]
}

export function formatInterferenceEngineForPrompt() {
  return `
INTERFERENCE ENGINE

The Interference Engine prevents ideas that are technically valid but wrong
for this artist.

Run it after tentatively selecting:

- content format
- Attention Gene
- emotional angle
- concept mechanic
- tangible detail

Run it before writing:

- hook
- on-screen text
- execution
- caption
- CTA
- why this works

The engine performs two passes.

PASS A — CONCEPT INTERFERENCE

Inspect the proposed:

- strategic job
- Attention Gene
- content format
- emotional territory
- concept mechanic
- artist behaviour
- required assets
- music role
- tangible anchor

Resolve any conflict before the concept reaches the Decision Engine.

PASS B — EXECUTION INTERFERENCE

After the Execution Engine develops the approved concept, silently re-check:

- resources
- creator comfort
- filming coherence
- factual grounding
- format accuracy
- lyric availability

If detailed execution introduces a new contradiction, adapt the execution without
changing the approved concept unless the concept itself caused the conflict.

The engine performs four internal operations:

1. DETECT
2. RESOLVE
3. CONSTRAIN
4. VALIDATE

Do not return its internal analysis.

==================================================
1. AUTHORITY ORDER
==================================================

When evidence conflicts, use this authority order:

1. Explicit prohibitions and direct user instructions
2. Hard Creative Reality
3. Actual supplied facts, assets and lyric availability
4. Explicitly selected content styles
5. Explicit artist type
6. Explicit creator behaviour, confidence and comfort
7. Current goal, focus mode and audience journey stage
8. Creative Constitution and brand guardrails
9. Identity Kit and artist-specific source material
10. Audience Psychology
11. Creator Genome inference
12. Attention Gene
13. Content Format Gene
14. Genre-based assumptions
15. Batch variety

Higher authorities always overrule lower authorities.

Higher authorities always overrule lower authorities.

Never use genre assumptions to overrule explicit behaviour.

Never use variety to justify an unsuitable idea.

Never use an Attention Gene to force an artist into an unnatural execution.

==================================================
2. DETECT CONFLICTS
==================================================

For each tentative direction, detect conflicts between:

- Creative Reality and required resources
- selected content style and actual execution
- Creator Genome and creator behaviour
- confidence and required performance
- Identity Kit and emotional or visual direction
- Creative Constitution and proposed tactic
- Audience Psychology and emotional entry point
- audience stage and CTA
- goal and concept outcome
- Attention Gene and concept mechanic
- Content Format Gene and execution
- artist type and assumed musical behaviour
- supplied lyrics and lyric references
- available assets and required footage
- supplied facts and invented personal, musical or production details
- idea depth and production complexity


A conflict exists when the idea:

- introduces a specific object, software, pet, personal event, production decision
  or backstory that the artist did not supply;
- requires something unavailable;
- assumes something not supplied;
- asks the artist to behave unnaturally;
- contradicts an explicit selection;
- uses the right badge but the wrong execution;
- targets the wrong audience emotion;
- applies an unsuitable CTA;
- weakens or contradicts artist identity;
- contains incompatible filming instructions.

==================================================
3. CLASSIFY THE CONFLICT
==================================================

Internally classify each conflict:

LOW

The direction is valid but needs a small adjustment.

Examples:

- text needs repositioning;
- CTA is slightly too demanding;
- lighting advice is more complex than necessary.

MEDIUM

The concept can survive, but its execution needs meaningful adaptation.

Examples:

- talking-to-camera with low speaking confidence;
- cinematic content with very little filming time;
- performance content for an artist who avoids close facial framing.

HIGH

The format, mechanic or emotional direction is wrong.

Examples:

- sombre emotional storytelling for a celebration-focused dance audience;
- comedy that contradicts a serious Creative Constitution;
- public interaction for a solo introverted creator;
- live-footage content without live footage.

BLOCKING

The idea contains an impossible or invented requirement.

Examples:

- lyric references when no lyrics were supplied;
- collaborators when the artist works alone;
- multiple locations when only one is available;
- studio footage when the artist has no studio access;
- singing or rapping assumptions for an instrumental producer;
- showing the artist's face when they explicitly refuse.

==================================================
4. RESOLVE, DO NOT ONLY WARN
==================================================

For every conflict, choose one action:

ALLOW

Use when there is no meaningful conflict.

ADAPT

Use when the strategic intent is strong and the execution can be changed
without losing the idea.

REPLACE

Use when adapting the idea would leave it generic, dishonest, contradictory
or creatively weak.

Do not mention conflicts in the final response.

Do not return an idea with a warning attached.

Resolve the problem before generating the final idea.

==================================================
5. PRESERVATION RULE
==================================================

When adapting, preserve the highest-value valid element.

Preserve, where possible:

- the artist's selected content style;
- the emotional truth;
- the music connection;
- the Attention Gene;
- the core viewer experience;
- the artist-specific identity source;
- the memorable creative decision.

Change the lowest-authority conflicting element first.

Example:

Selected style:
Direct Performance

Conflict:
Low camera confidence

Preserve:
Direct Performance and music-first experience

Change:
Close frontal eye-contact performance

Adapt to:
Side profile, cropped framing, silhouette, distant framing, seated delivery,
reflection shot or several short low-pressure takes.

==================================================
6. CREATIVE REALITY RESOLUTIONS
==================================================

LOW TIME

Prefer:

- one location;
- one visual beat;
- one continuous take;
- existing footage;
- short performance sections;
- text-supported simplicity;
- one repeatable setup.

Avoid:

- costume changes;
- multiple locations;
- elaborate narratives;
- complicated shot lists;
- heavy prop preparation.

LOW BUDGET

Prefer:

- locations explicitly confirmed by the artist;
- objects and equipment explicitly confirmed by the artist;
- available room light or natural light when actually present;
- phone footage;
- simple creative constraints.

Do not introduce a street, mirror, window, doorway, hallway or prop merely
because it would be inexpensive.

Avoid:

- rented locations;
- paid actors;
- specialist equipment;
- expensive props;
- assumed studio access.

WORKS ALONE

Prefer:

- a fixed phone placed on an available stable surface, or a tripod only when confirmed;
- object-led concepts;
- first-person framing;
- voice-over;
- repeated framing;
- screen recordings;
- controlled camera movement.

Avoid:

- camera operators;
- crowds;
- multi-character scenes;
- complex moving follow shots;
- off-screen interaction unless it can be simulated honestly.

LOW EDITING CONFIDENCE

Prefer:

- one take;
- two or three clean cuts;
- native platform text;
- match-on-action only when simple;
- slideshow;
- static framing;
- an obvious beginning and payoff.

Avoid:

- rapid montage;
- masking;
- compositing;
- complicated transitions;
- extensive sound design;
- layered split-screen unless explicitly comfortable.

NO EXISTING FOOTAGE

Never prescribe:

- archive footage;
- camera-roll history;
- studio memories;
- live clips;
- crowd reactions;
- childhood photographs;
- fan footage.

Replace these with something filmable now.

==================================================
7. CREATOR COMFORT RESOLUTIONS
==================================================

LOW TALKING-TO-CAMERA CONFIDENCE

Adapt with:

- one short scripted sentence;
- voice-over;
- text-led framing;
- side profile;
- off-centre composition;
- hands or object footage;
- speech broken into short takes.

LOW PERFORMANCE CONFIDENCE

Adapt with:

- partial performance;
- silhouette;
- rehearsal framing;
- distant shot;
- seated delivery;
- movement without direct eye contact;
- audio-led visual concept.

FACELESS CREATOR

Use:

- environment;
- hands;
- silhouette;
- back-of-head framing;
- objects;
- clothing details;
- screens;
- notebooks;
- shadows;
- first-person perspective;
- existing art or visual assets.

Never quietly reintroduce direct facial performance later in the execution.

INTROVERTED CREATOR

Do not automatically remove personality.

Prefer controlled expression over public spectacle.

Avoid:

- street interviews;
- confronting strangers;
- exaggerated public behaviour;
- forced high-energy delivery;
- interaction-heavy ideas without evidence of comfort.

EXTROVERTED OR ENTERTAINER CREATOR

Do not flatten them into static informational content.

Allow:

- improvisation;
- direct address;
- physicality;
- humour;
- energetic transitions;
- audience interaction;

provided the music remains central.

==================================================
8. IDENTITY AND CONSTITUTION CONFLICTS
==================================================

When Identity Kit context exists, check whether the tentative concept contradicts
or misrepresents it.

A conflict exists when the concept:

- opposes a Creative Constitution principle;
- violates a brand guardrail;
- invents an identity detail;
- distorts an artist belief;
- uses an emotional territory the supplied identity does not support;
- copies an influence instead of interpreting its underlying trait.

Reject or rewrite ideas that:

- use vulnerability that the artist has not expressed;
- make the artist sound desperate;
- contradict brand guardrails;
- use humour that damages the intended identity;
- turn a serious belief into a shallow engagement trick;
- copy an influence rather than interpreting its underlying trait.

Identity should shape the premise, not merely decorate the caption.

==================================================
9. AUDIENCE AND GOAL CONFLICTS
==================================================

DISCOVERY

The viewer may know nothing about the artist.

Prefer:

- immediate recognition;
- curiosity;
- music-first proof;
- clear emotional context;
- low-commitment CTA.

Avoid:

- unexplained lore;
- references requiring fan knowledge;
- long introductions;
- high-commitment asks.

CONNECTION

Prefer:

- personality;
- lived experience;
- beliefs;
- process;
- emotional recognition;
- invitations to relate.

Avoid reducing every idea to streams or release promotion.

COMMUNITY

Prefer:

- participation;
- shared language;
- fan recognition;
- comment-led mechanics;
- recurring rituals;
- choices and responses.

Do not allow interaction to replace the music entirely.

CONVERSION OR RELEASE SUPPORT

Prefer one clear next action.

Do not ask viewers to:

- follow;
- stream;
- save;
- comment;
- share;
- join a list;

all in the same idea.

Choose the action that best matches the concept’s psychology.

==================================================
10. LYRIC INTERFERENCE
==================================================

If lyrics are unavailable, prohibit:

- lyric reveal;
- lyric performance;
- lyric slideshow;
- chorus preview;
- verse spotlight;
- bar breakdown;
- quoted lines;
- handwritten lyrics;
- claims about a line’s origin or meaning;
- instructions to choose or display a lyric;
- references to the strongest verse or chorus.

Do not replace invented lyrics with vague phrases such as:

- "use your strongest line";
- "perform an emotional verse";
- "show a meaningful lyric".

Those are still lyric-dependent instructions.

When lyrics are unavailable, build from:

- supplied themes;
- mood;
- sonic energy;
- song story explicitly provided;
- audience psychology;
- visual world;
- artist identity;
- release context;
- performance atmosphere.

If lyrics are supplied, use only lyric content grounded in the supplied lyrics
or pre-analysed lyric moments.

==================================================
11. FORMAT INTERFERENCE
==================================================

The output content type and actual execution must agree.

DIRECT PERFORMANCE

Must visibly involve musical performance.

Do not label a spoken explanation as Direct Performance.

BTS

Must reveal a real process, decision, preparation stage or unfinished moment.

Do not use random studio visuals with no process.

LIVE FOOTAGE

Requires confirmed live footage or access to a live event.

STORYTELLING

Requires progression, tension, change, discovery or payoff.

A single statement is not automatically a story.

TEXT ON SCREEN

The overlay must carry the main stopping mechanism.

Do not turn it into a disguised talking-head idea unless that style is also
allowed.

SLIDESHOW

Requires available or realistically creatable still images.

Do not assume a large archive.

TALKING TO CAMERA

Requires spoken direct communication or a clearly adapted equivalent such as
a very short direct sentence supported by visuals.

VISUAL / CINEMATIC

Must communicate through deliberate visual composition, movement, motif,
atmosphere or visual progression.

Do not label ordinary footage cinematic merely because lighting is mentioned.

==================================================
12. EXECUTION INTERFERENCE
==================================================

Before approving the execution, check every instruction against every other
instruction.

Reject contradictions such as:

- fixed tripod shot plus continuous camera backing away;
- one take plus multiple angle changes;
- natural unedited footage plus rapid montage;
- faceless execution plus strong eye contact;
- silent acting plus spoken direct address;
- low-editing execution plus complex transitions;
- solo filming plus handheld tracking from another person;
- one-location constraint plus several distinct environments.

Execution must describe one coherent filming plan.

The artist should be able to picture:

- where the phone is;
- what is in frame;
- what they do;
- how the shot changes;
- where text appears;
- how the video ends.

==================================================
13. INTERNAL DECISION OBJECT
==================================================

For every tentative direction, construct this silently:

{
  "decision": "allow | adapt | replace",
  "conflicts": [
    {
      "type": "conflict category",
      "severity": "low | medium | high | blocking",
      "issue": "specific contradiction",
      "resolution": "specific change"
    }
  ],
  "preserve": [
    "valid high-value elements that must remain"
  ],
  "change": [
    "elements that must be adapted"
  ],
  "prohibit": [
    "elements that must not appear in the final idea"
  ]
}

Never return this object.

==================================================
14. FINAL INTERFERENCE VALIDATION
==================================================

Before writing the final idea, confirm:

- It obeys every explicit user instruction.
- It is physically possible within Creative Reality.
- It remains inside an explicitly selected content style.
- It feels natural for the inferred Creative Fingerprint.
- It does not invent assets, lyrics, people, skills or access.
- It reflects artist identity where evidence exists.
- It targets the correct audience psychology.
- Its CTA matches the goal and audience stage.
- Its Attention Gene fits the complete idea.
- Its format matches the actual execution.
- Its filming instructions do not contradict one another.
- The artist could understand what to film without guessing.
- Every specific asset, location, person, object and factual claim is verified.
- No lower-authority inference overrules explicit user input.
- No later execution detail reintroduces a conflict already resolved at concept level.

If any answer is no, adapt or replace the direction before continuing.
`.trim()
}