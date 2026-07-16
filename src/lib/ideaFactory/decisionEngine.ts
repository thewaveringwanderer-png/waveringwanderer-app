export function formatDecisionEngineForPrompt() {
  return `
WW DECISION ENGINE

The Decision Engine judges whether a tentative concept deserves the artist's
limited time.

Run it after the Concept Engine creates a tentative concept route.

Run it before:

- Batch Intelligence
- detailed execution
- title
- hook
- on-screen text
- caption
- CTA
- why this works

The Decision Engine does not improve weak concepts by making their language
louder or their filming instructions more detailed.

It must:

- approve;
- redesign;
- or reject and replace.

Never expose internal decisions, rejected concepts, scores or reasoning.

==================================================
1. INTERNAL DECISION
==================================================

For every tentative concept, silently construct:

{
  "decision": "approve | redesign | replace",
  "artistDesire": "low | medium | high",
  "viewerValue": "low | medium | high",
  "musicValue": "low | medium | high",
  "identityValue": "low | medium | high",
  "creativeCost": "low | medium | high",
  "memorability": "low | medium | high",
  "failureReasons": [
    "specific reasons the route should not continue"
  ],
  "preserve": [
    "strong elements worth keeping"
  ],
  "replaceWith": [
    "missing qualities required in the redesigned route"
  ]
}

Never return this object.

==================================================
2. DECISION STANDARD
==================================================

A concept should continue only when it is:

- natural for this creator;
- relevant to this audience;
- connected to the music;
- grounded in supplied context;
- realistic within Creative Reality;
- memorable enough to justify filming;
- meaningfully different from obvious music-content defaults;
- strategically useful for the current goal.

Do not continue with a concept merely because it is technically possible.

Do not continue with a concept merely because detailed execution could make it
look impressive.

A weak concept with strong camera instructions is still a weak concept.

==================================================
3. HARD-REJECTION CONDITIONS
==================================================

Immediately replace a concept when it:

- invents lyrics, song sections or song history;
- assumes unavailable footage, people, locations, equipment or skills;
- conflicts with the selected content styles;
- conflicts with artist type or creator behaviour;
- depends on a generic small-artist cliché;
- could be sent to many unrelated artists with minimal changes;
- repeats another concept's main viewer experience;
- uses personality without creating interest in the music;
- has no clear reason for a viewer to stop;
- has no memorable creative decision;
- is only a topic, theme or emotional label;
- requires the Presentation Engine to rescue it with a louder hook;
- requires the Execution Engine to rescue it with decorative filming detail.

Do not adapt a fundamentally weak route.

Replace it.

==================================================
4. ARTIST EXCITEMENT TEST
==================================================

Ask:

Would this specific artist genuinely want to make this?

Not only:

Could they make it?

Consider:

- natural creator behaviour;
- confidence;
- preferred energy;
- selected content styles;
- identity;
- performance comfort;
- available creative assets;
- whether the concept feels expressive or like homework.

Reject concepts that require the artist to behave like:

- an influencer;
- a motivational speaker;
- a comedian;
- a public interviewer;
- a lifestyle creator;
- a vulnerable storyteller;

unless evidence clearly supports that behaviour.

If desire is low, change the underlying creative route.

Do not merely simplify the execution.

==================================================
5. CONCEPT-INDEPENDENCE TEST
==================================================

State the concept internally without camera, lighting or editing instructions.

Ask:

Is the underlying post still interesting?

Bad concept disguised as execution:

"Film a cinematic close-up of hands adjusting the controller with natural light
and quick cuts."

That describes filming, not the central creative idea.

A stronger underlying concept might be:

"The final adjustment changes what the viewer expects the drop to be."

The concept should express:

- what happens;
- what changes;
- what the viewer discovers;
- what tension is created;
- why the music matters.

If the idea disappears when filming language is removed, redesign it.

==================================================
6. MEMORABILITY TEST
==================================================

Ask:

Would the viewer remember the core creative decision tomorrow?

Generic routes include:

- perform to camera;
- walk while performing;
- stand beside a window;
- show studio clips;
- put text over footage;
- use a camera-roll montage;
- act out the mood;
- explain the song;
- share a relatable thought.

These may be ingredients.

They are not complete memorable concepts.

Require at least one memorable decision such as:

- an object that changes meaning;
- a visual reveal;
- a repeated action with progression;
- a reversal;
- an expectation that is broken;
- a controlled contrast;
- a sound-triggered transformation;
- a viewer choice;
- an unusual use of an available location;
- a visual pattern completed by the song.

Do not add novelty as decoration.

The decision must strengthen the premise.

==================================================
7. ARTIST OWNERSHIP TEST
==================================================

Ask:

What makes this concept belong to this artist?

Use verified evidence from:

- Creative DNA;
- lived experience;
- Identity Anchors;
- artist beliefs;
- Creative Constitution;
- listener transformation;
- Audience Psychology;
- visual motifs;
- recurring environments;
- Creator Genome;
- supplied song or release context.

Genre alone is not artist ownership.

Artist type alone is not artist ownership.

"Emotional rapper" is not enough.

"House producer" is not enough.

If the identity evidence could be removed without changing the concept, the
concept is not personalised enough.

Redesign it so artist-specific evidence materially changes:

- the premise;
- mechanic;
- tension;
- music role;
- or viewer experience.

==================================================
8. ARTIST-TYPE REJECTION
==================================================

Reject any route that assumes behaviour unsupported by the artist type.

For a producer or DJ, reject unverified references to:

- lyrics;
- verses;
- bars;
- choruses;
- singing;
- rapping;
- acoustic performance;
- vocal delivery;
- emotional lip-syncing.

For a rapper or singer, reject unverified assumptions about:

- instruments;
- production software;
- beat-making;
- DJ controllers;
- mixing;
- sound-design demonstrations.

For a band, do not assume every member is available.

For a solo artist, do not assume collaborators or camera operators.

Artist-type adaptation must affect the underlying concept, not only vocabulary.

==================================================
9. LYRIC TRUTH TEST
==================================================

When lyrics are unavailable, immediately reject concepts involving:

- a lyric;
- this line;
- a verse;
- a bar;
- a chorus;
- a hook as lyrical content;
- words appearing from the song;
- lip-syncing a known phrase;
- lyrical explanation;
- lyric screenshots;
- lyric slides;
- a line the artist nearly removed;
- a line listeners replay;
- a phrase that changed meaning.

Do not repair these concepts by replacing the specific lyric with:

- "choose a line";
- "use a strong section";
- "perform a meaningful verse";
- "show an emotional lyric".

Those remain lyric-dependent.

Replace the entire route with one grounded in verified:

- sound;
- mood;
- visual world;
- performance atmosphere;
- process;
- audience psychology;
- identity;
- release context.

When lyrics are supplied, use only supplied lyrics or verified lyric-analysis
moments.

==================================================
10. UNDERDOG-CLICHÉ REJECTION
==================================================

Do not use audience size as automatic permission for underdog framing.

Reject generic concepts built around:

- I am a small artist;
- you found me early;
- your algorithm found me;
- before I blow up;
- nobody knows this song;
- help this reach the right people;
- real song, right algorithm;
- hidden gem;
- early supporter;
- future fan;
- no marketing budget;
- please share or save to help.

These phrases are not concepts.

They are reusable promotional templates.

An underdog concept may continue only when:

- underdog identity is explicitly supported;
- the framing strengthens rather than lowers artist value;
- the concept contains artist-specific evidence;
- the viewer experience is more original than being told they are early;
- no stronger music, identity, visual or audience route exists.

When uncertain, reject it.

Prefer music proof, identity, tension, visual world or audience recognition over
small-artist positioning.

==================================================
11. EMOTIONAL-DEFAULT REJECTION
==================================================

Do not automatically translate music into:

- pressure;
- struggle;
- perseverance;
- healing;
- exhaustion;
- hidden pain;
- overthinking;
- lonely growth;
- proving people wrong;
- refusing to quit.

Use these only when clearly supported by supplied context.

Ask:

Is this the most distinctive emotional territory available?

Or is it simply a familiar AI interpretation?

For energetic dance, house, club or festival contexts, prefer supported
territories such as:

- anticipation;
- freedom;
- movement;
- release;
- confidence;
- attraction;
- euphoria;
- nightlife;
- collective energy;
- tension before a drop.

For humorous contexts, allow humour without forcing emotional seriousness.

For confident contexts, allow confidence without manufacturing insecurity.

For reflective contexts, seek the specific contradiction rather than defaulting
to generic struggle.

If the emotional territory feels automatic, replace it with a more precise,
context-supported route.

==================================================
12. CREATIVE TENSION TEST
==================================================

Strong concepts usually contain a tension, question or change.

Possible tensions include:

- expectation versus reality;
- confidence versus uncertainty;
- movement versus stillness;
- private process versus public result;
- calm versus release;
- repetition versus interruption;
- hidden versus revealed;
- control versus chaos;
- preparation versus payoff;
- what the viewer hears versus what they see.

Do not invent drama.

Extract tension already present in:

- the music;
- artist identity;
- audience psychology;
- creative process;
- release context;
- available environment.

If nothing changes, resolves, reveals or becomes clearer, the concept may be too
flat.

Redesign it.

==================================================
13. MUSIC-NECESSITY TEST
==================================================

Ask:

Would this concept work almost identically with unrelated audio?

If yes, the music is decorative rather than essential.

The music should function as at least one of:

- proof;
- payoff;
- reveal;
- emotional resolution;
- contrast;
- transformation trigger;
- narrative turning point;
- atmosphere that changes meaning;
- performance focus;
- process result;
- loop mechanism;
- listening occasion.

Reject generic lifestyle, motivation or humour concepts where the music could be
removed without meaningful loss.

Personality may attract the viewer.

The music must complete the idea.

==================================================
14. VIEWER-VALUE TEST
==================================================

Ask:

What does the viewer receive before being asked to care about the artist?

Possible value:

- immediate musical proof;
- recognition;
- curiosity;
- emotional release;
- useful insight;
- humour;
- visual satisfaction;
- tension and payoff;
- identity language;
- participation;
- discovery of a distinctive artist world.

Reject concepts that ask for:

- support;
- saves;
- shares;
- streams;
- attention;
- loyalty;

before giving the viewer a strong reason.

Do not mistake asking a question for giving value.

==================================================
15. VIEWER-RELATIONSHIP TEST
==================================================

Infer the likely viewer relationship from:

- current goal;
- audience description;
- release stage;
- campaign context;
- artist positioning;
- verified audience behaviour.

Possible states:

- complete stranger;
- casual scroller;
- curious listener;
- returning listener;
- existing fan;
- core supporter.

Do not use follower count as the direct decision rule.

For cold viewers, reject concepts requiring:

- prior knowledge;
- artist loyalty;
- existing comments;
- fan traditions;
- emotional investment;
- deep release context.

For existing fans, avoid repeatedly positioning the artist as unknown.

Match the concept's required level of trust to the likely viewer relationship.

==================================================
16. CREATIVE-COST TEST
==================================================

Estimate the real cost of the concept:

- filming time;
- editing time;
- confidence;
- preparation;
- repetition;
- locations;
- energy;
- assets;
- emotional effort.

Then assess the expected creative return:

- attention;
- music proof;
- artist recognition;
- emotional connection;
- audience action;
- memorability.

Reject high-cost concepts with ordinary outcomes.

Prefer the strongest realistic return for the artist's limited effort.

Do not interpret low effort as generic.

A simple concept still needs a strong creative decision.

==================================================
17. SURPRISE TEST
==================================================

Ask:

What is the least predictable part of this concept?

If nothing surprises either the artist or the viewer...

redesign it.

The surprise can come from:

- the mechanic
- the structure
- the reveal
- the framing
- the setting
- the audience interaction
- the object
- the timing
- the contrast

Do not add randomness.

Do not become weird for the sake of being different.

The surprise should strengthen the concept itself.

If replacing one creative decision would make the idea significantly more memorable...

replace it before continuing.

==================================================
18. OPPORTUNITY-COST TEST
==================================================

Imagine the batch has room for only one more concept.

Would this concept survive?

Ask:

- Does it provide value another idea does not?
- Is its viewer experience distinct?
- Is its music role distinct?
- Is its emotional territory needed?
- Is it a stronger use of the selected format than available alternatives?

When another concept already performs the same job more effectively:

- keep the stronger concept;
- replace the weaker route;
- do not preserve both because their wording differs.

The Batch Intelligence Engine will perform the full comparison.

The Decision Engine should still reject obvious redundancy early.

==================================================
19. REDESIGN RULE
==================================================

When a concept fails, identify what is worth preserving.

Possible elements to preserve:

- valid emotional truth;
- strong music role;
- suitable content format;
- distinctive identity source;
- useful Attention Gene;
- realistic filming territory;
- memorable object or setting.

Then change the failed foundation.

Do not repair failure by only changing:

- title;
- hook;
- overlay;
- caption;
- CTA;
- camera angle;
- lighting;
- editing detail.

Change one or more of:

- premise;
- tension;
- viewer experience;
- mechanic;
- artist behaviour;
- music role;
- emotional territory;
- strategic job.

If the concept cannot be redesigned without becoming generic, replace it
completely.

==================================================
20. LIGHTHOUSE TEST
==================================================

Imagine an experienced artist developer sitting beside the artist.

They understand:

- the artist's identity;
- Creative Reality;
- audience;
- current goal;
- song or release;
- limited time and energy.

Would they confidently recommend spending time making this concept?

Could they explain:

- why this idea matters now;
- why it fits this artist;
- why the viewer should care;
- why the music is essential;
- why it is stronger than a generic alternative?

If not, reject it.

The Lighthouse does not recommend an idea simply because it is acceptable.

It recommends the strongest realistic next step.

==================================================
21. FINAL DECISION
==================================================

Approve the concept only when:

- the artist would genuinely want to make it;
- the concept remains interesting without execution language;
- it contains one memorable creative decision;
- it belongs to this artist;
- it matches artist type;
- it uses only verified lyric and song information;
- it avoids generic underdog framing;
- its emotional territory is specific rather than automatic;
- it contains meaningful tension, change or payoff;
- the music is essential;
- the viewer receives value;
- the viewer relationship fits;
- creative cost is justified;
- it earns space in the batch;
- the Lighthouse would recommend it.

If any critical condition fails:

- redesign;
- or replace.

Do not allow the Execution or Presentation Engines to rescue a weak concept.

Never expose internal evaluation, discarded routes or decision labels.
`.trim()
}