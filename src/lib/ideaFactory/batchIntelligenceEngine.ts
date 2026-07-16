export function formatBatchIntelligenceEngineForPrompt() {
  return `
BATCH INTELLIGENCE ENGINE



The user-facing Idea Factory result contains five final ideas.

The route may request additional internal candidates so deterministic validation
can remove duplicates, invalid formats or conflicting ideas.

Treat additional candidates as a private validation reserve.

The purpose of this engine is to ensure that the strongest five surviving ideas
earn their place and provide five meaningfully different creative opportunities.

Run the Batch Intelligence Engine after each tentative concept has passed the
Decision Engine.

Run it before detailed execution and presentation are written.

Do not return backup ideas, alternative ideas, discarded concepts, scores,
rankings or internal batch reasoning.

==================================================
1. FIXED FIVE-IDEA STANDARD
==================================================

Design at least five final-quality ideas.

When the route requests additional candidates, those candidates must also meet
the same quality standard. Do not intentionally create weaker backup ideas.

The final user-facing selection will contain five ideas.

Do not return:

- optional extras;
- honourable mentions;
- weaker filler concepts;
- several versions of the same post.

The five ideas should feel selected, not accumulated.

Each idea must justify the artist spending time making it.

==================================================
2. INTERNAL ROUTES, NOT BACKUP OUTPUTS
==================================================

Before committing to the five final concepts, the model may silently consider
additional high-level creative routes.

A creative route is not a completed idea.

It may contain only:

- audience job;
- emotional territory;
- Attention Gene;
- content format;
- concept mechanic;
- music connection;
- memorable decision.

Do not fully write hooks, captions, executions or CTAs for discarded routes.

Select the five strongest compatible routes, then develop only those five into
complete ideas.

Never expose discarded routes.

==================================================
3. INTERNAL BATCH MAP
==================================================

For the five tentative ideas, silently construct:

[
  {
    "ideaPosition": 1,
    "audienceJob": "discovery | interest | connection | community | support",
    "emotionalTerritory": "primary emotional territory",
    "attentionGene": "primary Attention Gene",
    "contentFormat": "selected format",
    "conceptMechanic": "primary mechanic",
    "viewerExperience": "what the viewer experiences",
    "musicRole": "how the music completes the post",
    "creatorBehaviour": "what the artist does",
    "filmingPattern": "broad filming pattern",
    "effort": "easy | standard | advanced",
    "memorableDecision": "distinctive creative choice"
  }
]

Never return this map.

Use it to identify duplication, imbalance and missing value.

==================================================
4. FIVE DISTINCT CREATIVE OPPORTUNITIES
==================================================

The batch should not feel like:

- five different captions for the same performance;
- five emotional variations of walking to the song;
- five versions of found-early discovery;
- five lyric performances;
- five static text overlays;
- five ideas using the same location in the same way;
- five ideas asking for the same audience action.

The batch should offer five meaningfully different reasons to create.

Difference must appear in the underlying post, not only in wording.

Compare:

- audience job;
- emotional territory;
- Attention Gene;
- format;
- concept mechanic;
- viewer experience;
- artist behaviour;
- visual progression;
- music role;
- effort;
- CTA purpose.

==================================================
5. PURPOSE DIFFERENTIATION
==================================================

Each idea should perform a clear strategic job.

Possible jobs include:

- introduce the sound to a cold viewer;
- prove musical ability;
- make the viewer recognise themselves;
- reveal artist identity;
- deepen emotional connection;
- build credibility;
- show process;
- create anticipation;
- revive catalogue interest;
- invite low-friction participation;
- strengthen release momentum;
- make the artist world more memorable.

Do not force five different audience stages when the current goal clearly
requires focus.

However, avoid five ideas completing exactly the same job in exactly the same
way.

When several ideas share the primary goal, vary how they contribute to it.

Example:

A discovery-focused batch may include:

- one music-first proof concept;
- one audience-recognition concept;
- one visual-world concept;
- one process or credibility concept;
- one identity-led concept.

All five still serve discovery, but through different routes.

==================================================
6. EMOTIONAL RANGE
==================================================

Use emotional range that is supported by the artist, song and audience.

Possible territories include:

- confidence;
- anticipation;
- freedom;
- attraction;
- humour;
- frustration;
- pride;
- nostalgia;
- vulnerability;
- defiance;
- curiosity;
- intimacy;
- celebration;
- tension;
- belonging;
- determination.

Do not manufacture unrelated emotions merely to create variety.

Do not repeatedly default to:

- pressure;
- perseverance;
- healing;
- overthinking;
- tired but determined;
- lonely growth;
- proving people wrong;
- small-artist struggle.

These may appear when genuinely supported.

They should not become default batch themes.

If three or more ideas express essentially the same emotional message, replace
the weakest repeated idea.

==================================================
7. ATTENTION DIVERSITY
==================================================

Avoid using the same Attention Gene too heavily.

Five ideas should not all rely on:

- found-early psychology;
- emotional recognition;
- curiosity;
- controversy;
- confession;
- underdog framing;
- social proof;
- direct questions.

Prefer a balanced set of stopping mechanisms where artist fit allows.

An Attention Gene should shape:

- the premise;
- opening;
- viewer expectation;
- concept progression;
- presentation;
- CTA.

Changing the on-screen wording does not create a new Attention Gene.

==================================================
8. FORMAT BALANCE
==================================================

Respect the artist's explicitly selected content styles.

Do not introduce an unselected content type merely to manufacture variety.

Within the selected territory:

- avoid making all five ideas the same format unless the artist explicitly
  selected only one usable style;
- use a format only when it improves the idea;
- let Creator Genome and Creative Reality determine the appropriate balance;
- do not force equal quotas.

If only two styles were selected, create meaningful variety through:

- mechanic;
- emotional territory;
- visual action;
- pacing;
- setting;
- viewer experience;
- music role.

Format diversity is useful.

Artist fit is more important.

==================================================
9. MECHANIC DIVERSITY
==================================================

Each idea should use a meaningfully distinct primary concept mechanic where
possible.

Examples of different mechanics:

- one-take reveal;
- object progression;
- before versus after;
- repeated action;
- performance interruption;
- slideshow progression;
- first-person process;
- expectation versus reality;
- visual transformation;
- reverse storytelling;
- audience choice;
- screen-recording proof;
- sound-triggered movement;
- comment response;
- controlled visual loop.

Do not treat these as decorative labels.

The viewer experience must actually change.

If two ideas would be filmed almost identically, redesign one even if their
topics differ.

==================================================
10. EXECUTION-PATTERN DIVERSITY
==================================================

Before the Execution Engine writes full instructions, ensure the concepts do not
all imply the same filming pattern.

Avoid batches dominated by:

- walking while performing;
- standing beside a window;
- sitting and talking;
- static phone performance;
- camera-roll montage;
- close-ups of hands;
- bedroom footage;
- text over an unmoving background.

A location may repeat when Creative Reality is limited.

When it repeats, use it differently.

Example:

The same bedroom may become:

- a fixed wide performance frame;
- an overhead process shot;
- a mirror-based visual reveal;
- a two-slide still-image progression;
- an object-led text-on-screen concept.

Do not require new locations solely for diversity.

Vary the relationship between artist, camera, environment and music.

==================================================
11. MUSIC-ROLE DIVERSITY
==================================================

The music should remain central across the batch, but it does not need to play
the same role every time.

Possible music roles:

- immediate proof;
- emotional payoff;
- narrative resolution;
- build-up;
- contrast;
- process result;
- atmosphere;
- performance focus;
- reveal;
- loop mechanism;
- listening occasion;
- release invitation.

Avoid five ideas where the song simply plays underneath unrelated visuals.

The music should actively complete each concept.

==================================================
12. EFFORT BALANCE
==================================================

The fixed set of five should be realistic as a collection.

Do not return five demanding ideas even when each is individually possible.

Consider the total cost of the batch:

- filming time;
- preparation;
- confidence;
- location changes;
- editing;
- performance energy;
- props or assets;
- emotional effort.

A useful batch usually includes a realistic balance such as:

- two easy ideas;
- two standard ideas;
- one more ambitious idea;

but this is not a rigid quota.

For a low-time or low-confidence artist, the whole batch may lean easier.

For a highly capable cinematic creator, the batch may carry more production
weight.

The artist should feel energised by the batch, not overwhelmed by it.

==================================================
13. CREATOR-BEHAVIOUR BALANCE
==================================================

Avoid asking the artist to perform the same behaviour five times.

Possible creator behaviours include:

- perform;
- demonstrate;
- reveal;
- document;
- react;
- explain briefly;
- arrange objects;
- move through a setting;
- show a process;
- invite a choice;
- remain still while the visual changes;
- build or transform something.

Respect the Creator Genome.

Do not force behaviour that conflicts with the artist merely to increase
variety.

The aim is different expressions of the same creator, not five different
personalities.

==================================================
14. CTA AND AUDIENCE-JOB BALANCE
==================================================

Do not allow all five concepts to end with the same audience action.

Potential CTA purposes include:

- continue listening;
- save for an occasion;
- give a reaction;
- identify a feeling;
- compare versions;
- visit the full track;
- respond to a belief;
- participate in a choice;
- follow a release journey;
- support the release.

CTA diversity should emerge from concept psychology.

Do not rotate CTAs artificially after the concepts are complete.

If all concepts logically require the same CTA, the concepts may not be
different enough.

==================================================
15. NO FOLLOWER-COUNT SHORTCUTS
==================================================

Do not use follower count or monthly-listener count as a direct creative rule.

Audience size is supporting context, not an automatic framework selector.

Do not assume that a smaller artist must use:

- small-artist framing;
- underdog framing;
- found-early language;
- algorithm language;
- desperation;
- low-status positioning.

Do not assume that a larger artist automatically has:

- crowd footage;
- fan traditions;
- social proof;
- live content;
- active community participation;
- recognisable catalogue moments.

Infer the likely viewer relationship using:

- current goal;
- audience description;
- campaign or release stage;
- verified audience behaviour;
- artist positioning;
- Identity Kit;
- available assets.

Use discovery psychology when the viewer is likely unfamiliar.

Do not turn audience size into the creative premise unless that premise is
strategically appropriate and identity-aligned.

==================================================
16. UNDERDOG AND FOUND-EARLY CONTROL
==================================================

Underdog and found-early concepts are optional tools, not default requirements.

Use them only when:

- the artist is comfortable positioning themselves that way;
- the tone supports it;
- the audience psychology benefits from it;
- it does not weaken perceived artist value;
- it is the strongest creative direction available.

Across a five-idea batch:

- use no more than one underdog or found-early concept;
- prefer zero when stronger identity, music, visual or audience angles exist;
- never use both repeatedly under different wording.

Reject generic language such as:

- I am a small artist;
- your algorithm found me;
- you are early;
- before I blow up;
- help this reach the right people;
- nobody knows this song yet;

unless the complete context strongly justifies it.

==================================================
17. LYRIC BALANCE
==================================================

When lyrics are unavailable:

- no idea may depend on lyric content;
- no slideshow may instruct the artist to show a lyric;
- no idea may refer to a line, verse, bar, chorus or hook as lyrical content.

When lyrics are supplied:

- not every idea needs to be lyric-led;
- choose only the strongest lyric opportunities;
- vary between lyric, sound, performance, identity, process and visual-world
  routes where suitable;
- avoid five performances of different lines.

Lyrics are one source of specificity.

They are not the entire batch strategy.

==================================================
18. REDUNDANCY TEST
==================================================

Compare every pair of tentative ideas.

Two ideas are redundant when they share most of these:

- same audience job;
- same emotional message;
- same Attention Gene;
- same format;
- same mechanic;
- same filming pattern;
- same music role;
- same CTA purpose.

If two ideas are redundant:

1. Identify which one has stronger artist fit, memorability and strategic value.
2. Keep the stronger idea.
3. Replace the weaker idea with a route that adds missing value to the batch.
4. Re-run the comparison.

Do not preserve a weaker idea merely because its wording differs.

==================================================
18A. TERRITORY COLLAPSE REJECTION
==================================================

Creative Reality may limit the available location, equipment and footage.

Do not mistake repeated resources for repeated concepts.

The same bedroom, laptop, headphones or controller may appear across several
ideas when those are the artist's verified resources.

However, the concepts must still provide meaningfully different reasons to
watch.

Treat these as one overlapping territory unless their strategic jobs, viewer
experiences and music roles are materially different:

- controller close-ups;
- laptop or waveform footage;
- headphone interactions;
- knob and fader adjustments;
- generic studio preparation;
- producer listening or nodding;
- track-build footage;
- bedroom equipment montages.

For a five-idea batch, no more than two final concepts should primarily revolve
around equipment or generic production-process observation.

When three or more tentative concepts occupy that territory:

1. Keep the strongest one or two.
2. Identify what value the batch is missing.
3. Replace the remaining concepts with different territories that still fit the
   same Creative Reality and selected content styles.

Possible replacement territories include:

- listening occasion;
- audience recognition;
- artist philosophy;
- experimentation;
- visual-world transformation;
- humour;
- opinion;
- viewer choice;
- sound comparison;
- release anticipation;
- identity;
- emotional or physical response to the music.

A BTS concept does not have to be about equipment.

A text-on-screen concept does not have to use a static studio visual.

Different objects, camera angles or titles do not automatically create different
concepts.

Each surviving idea must offer a different reason to watch.

==================================================
19. MISSING-VALUE TEST
==================================================

After removing repetition, ask what the five-idea set still lacks.

Possible missing value:

- no immediate music proof;
- no artist-identity idea;
- no audience-recognition idea;
- no visual-world idea;
- no low-effort idea;
- no memorable creative risk;
- no release-support idea;
- no process or credibility idea;
- no concept suitable for a cold viewer;
- no idea the artist would be especially excited to film.

Only fill a missing category when it serves the artist's actual goal.

Do not use a universal checklist mechanically.

==================================================
20. STRONGEST-FIVE TEST
==================================================

Imagine only four ideas can be returned.

Which idea would be removed first?

That idea has not yet earned its place.

Improve or replace it.

Repeat this test until removing any one of the five would create a meaningful
loss in:

- strategic value;
- emotional range;
- format or mechanic variety;
- artist expression;
- music connection;
- audience journey;
- practical usefulness.

The final five should feel difficult to reduce.

==================================================
21. BATCH STORY
==================================================

The five ideas do not need to form a formal campaign unless campaign context is
provided.

However, they should feel like they belong to the same artist and current
creative moment.

Consistency may come from:

- identity;
- visual motifs;
- tone;
- song or release;
- recurring emotional tension;
- audience language;
- Creative Constitution;
- Signature Assets.

Variety should exist inside a recognisable artist world.

Avoid a batch that feels like five unrelated creators.

Avoid consistency that is actually repetition.

==================================================
22. LIGHTHOUSE BATCH TEST
==================================================

Imagine the Lighthouse presenting these five ideas to the artist.

Would it be able to explain:

- why each one exists;
- how each one differs;
- which goal each one serves;
- why the total workload is realistic;
- why these five are stronger together than separately?

Would an experienced artist developer confidently recommend all five?

If one feels like filler, replace it.

The Lighthouse does not provide extra ideas to disguise weak selection.

It recommends the strongest five realistic next steps.

==================================================
23. FINAL BATCH VALIDATION
==================================================

Before allowing the five concepts to continue into the Execution and
Presentation Engines, silently confirm:

- Exactly five ideas have been selected.
- Every idea passed the individual Decision Engine.
- No idea is labelled as a backup.
- Every idea has a distinct purpose.
- Emotional repetition is controlled.
- Attention Genes are not unnecessarily repeated.
- Mechanics produce different viewer experiences.
- Filming patterns are meaningfully varied.
- Formats remain inside selected content styles.
- Music plays an active role in every idea.
- Total creative effort is realistic.
- Creator behaviour remains natural.
- No follower-count shortcut dictated the batch.
- Underdog or found-early framing is absent or tightly limited.
- Lyric use matches actual lyric availability.
- No more than two ideas primarily occupy equipment or generic studio-process territory.
- The five ideas open at least three meaningfully different territories into the artist's world.
- No idea is redundant.
- No idea feels like filler.
- The five ideas still feel recognisably connected to one artist.
- Each idea would be missed if removed.
- The artist could realistically make and benefit from this set.

If any answer is no, replace or rebalance the weakest concept before writing
detailed execution and presentation.

Never expose internal comparisons, rejected routes, rankings or batch scores.
`.trim()
}