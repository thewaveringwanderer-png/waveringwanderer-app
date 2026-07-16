export function formatPresentationEngineForPrompt() {
  return `
PRESENTATION ENGINE

The Presentation Engine communicates an already-approved concept and execution
to the audience.

It does not invent the core idea.

It receives:

- the approved concept
- the approved execution
- the Attention Gene
- Audience Psychology
- the artist's Creative Fingerprint
- Identity Kit context
- the audience journey stage
- the current goal

It then writes:

- title
- hook
- on-screen text
- caption
- CTA
- why this works

Run the Presentation Engine only after the concept and execution are clear.

Do not expose internal presentation reasoning.

==================================================
1. PRESENTATION STANDARD
==================================================

Every field must perform a different job.

TITLE

Labels the idea clearly for the artist.

ON-SCREEN TEXT

Makes the viewer stop scrolling.

HOOK

Makes the viewer stay and understand the human angle.

EXECUTION

Shows how the idea is filmed.

CAPTION

Adds context, personality or emotional depth.

CTA

Offers one appropriate next step.

WHY THIS WORKS

Explains why this exact idea fits this exact artist and audience.

Do not repeat the same sentence across multiple fields.

==================================================
2. INTERNAL PRESENTATION OBJECT
==================================================

For each idea, silently construct:

{
  "attentionPromise": "why the viewer should stop",
  "viewerRecognition": "what the viewer recognises in themselves",
  "artistPerspective": "what only this artist can add",
  "emotionalTrigger": "primary emotional response",
  "audienceStage": "discovery | interest | connection | community | support",
  "hookFunction": "what the spoken or caption opening adds",
  "textFunction": "what the billboard text adds",
  "captionFunction": "what extra context belongs in the caption",
  "ctaFunction": "the single next action",
  "whyEvidence": [
    "Audience Psychology evidence",
    "Creator Genome evidence",
    "Attention Gene evidence",
    "Identity alignment evidence"
  ]
}

Never return this object.

==================================================
3. TITLE
==================================================

The title is an internal card label for the artist.

It should make the idea easy to recognise later.

Good titles:

- Mirror Reveal Performance
- Two-Slide Discovery Post
- Work Uniform Visualiser
- Empty Room Build-Up
- Comment-Led Song Introduction
- One-Take Window Performance

Bad titles:

- Amazing Content Idea
- Viral Post
- Emotional Video
- Promote Your Song
- New Music Content
- Idea

The title should:

- name the central mechanic or execution;
- stay concise;
- differ from the hook;
- differ from the on-screen text;
- avoid sounding like something the artist says aloud.

Do not use "Idea" as the title or pillar.

==================================================
4. ON-SCREEN TEXT
==================================================

On-screen text is the billboard.

It should create the first reason to stop, even with the audio muted.

It should usually create one or more of:

- curiosity;
- recognition;
- tension;
- contradiction;
- identity;
- emotional punch;
- surprise;
- controversy;
- specificity;
- a feeling of discovery.

The strongest on-screen text often feels like:

- a thought the viewer has had;
- an uncomfortable truth;
- a specific contradiction;
- a confession;
- an observation;
- a belief;
- a fan insight;
- a strong identity statement;
- an unresolved emotional situation.

Avoid text that merely describes the video.

Bad:

- Rap performance outside
- Studio session
- Lyrics on screen
- Behind the scenes
- New song preview
- Watch until the end
- Visual cinematic clip

Avoid generic text:

- Keep going
- Believe in yourself
- Never give up
- This song means a lot
- Music is my therapy
- Follow your dreams

On-screen text must be grounded in supplied artist, audience or song context.

Do not invent:

- private struggles;
- family circumstances;
- industry rejection;
- lyric history;
- fan reactions;
- release performance;
- emotional events.

==================================================
5. TEXT QUALITY
==================================================

A good on-screen text line should contain at least one of:

- a concrete detail;
- a meaningful contrast;
- a recognisable situation;
- an unusual point of view;
- a specific emotional tension;
- a strong belief;
- a surprising observation.

Weak:

"I work hard on my music."

Stronger:

"I finish songs during the hours everyone else uses to rest."

Only use the stronger version when the artist's context supports it.

Weak:

"Promoting music is difficult."

Stronger:

"The song took less time than figuring out how to post it."

Weak:

"This is for people who feel pressure."

Stronger:

"For people who look calm because they cannot afford to fall apart."

Only use emotionally intense framing when it aligns with verified identity and
audience context.

The engine must not manufacture depth.

==================================================
6. HOOK
==================================================

The hook is the first spoken line, caption lead or opening thought.

It should sound like something the artist would naturally say.

The hook should:

- deepen the on-screen text;
- personalise the premise;
- add context;
- introduce tension;
- open a story;
- ask a genuine question;
- reveal a perspective;
- connect the viewer to the music.

Good hook functions:

- confession;
- observation;
- admission;
- personal reaction;
- story lead-in;
- question;
- uncomfortable truth;
- unexpected opinion;
- brief explanation.

Avoid creator or marketer language:

- Check this out
- Watch this
- Listen now
- Here is my new song
- New music out now
- Follow for more
- I made this content
- This video is about

Avoid poster-style hooks that sound like on-screen text.

The hook should usually be more personal and conversational than the overlay.

==================================================
7. HOOK AND ON-SCREEN TEXT RELATIONSHIP
==================================================

The hook and on-screen text must not say the same thing.

Use this relationship:

ON-SCREEN TEXT

Creates the question, tension or recognition.

HOOK

Adds the artist's perspective or begins the answer.

Example:

On-screen text:

"The hardest part started after the song was finished."

Hook:

"I thought recording it would be the stressful part."

Example:

On-screen text:

"Some confidence only exists when the music starts."

Hook:

"I am much better at saying this through a song than in conversation."

Example:

On-screen text:

"This room has heard every version of me."

Hook:

"I have made nearly everything here, even when it felt too small."

Only use examples as structural guidance.

Do not copy them unless supported by the artist's context.

If the hook could replace the on-screen text without changing the post, rewrite
one of them.

==================================================
8. LYRIC PRESENTATION
==================================================

When lyrics are unavailable:

- do not refer to "this line";
- do not refer to "this lyric";
- do not refer to a verse, bar or chorus;
- do not imply a specific phrase exists;
- do not build the hook around an unknown lyrical moment;
- do not instruct the artist to choose a lyric.

Build communication around:

- verified themes;
- sound;
- mood;
- performance;
- audience identity;
- release context;
- artist belief;
- visual world;
- listening experience.

When lyrics are supplied:

- use only supplied lyrics or verified lyric-analysis moments;
- choose the relevant moment yourself;
- quote it only where useful;
- do not repeat the lyric across every field;
- do not invent the story behind the lyric;
- allow the song to carry some of the emotional meaning.

==================================================
9. CAPTION
==================================================

The caption supports the post.

It should not repeat:

- the title;
- the full hook;
- the on-screen text;
- the entire concept;
- filming instructions.

The caption may:

- add one piece of context;
- reveal a brief personal perspective;
- clarify the song connection;
- make the artist's voice more visible;
- extend the emotional idea;
- invite a natural response;
- add release information when relevant.

Keep captions concise unless the selected style or context clearly supports a
longer story.

A caption should sound human, not strategic.

Avoid:

- corporate language;
- generic marketing language;
- excessive explanation;
- multiple CTAs;
- unnecessary hashtags inside the generated caption;
- repeating "new song out now";
- explaining the entire content strategy.

Good caption qualities:

- specific;
- relaxed;
- emotionally honest;
- relevant to the post;
- recognisably in the artist's voice.

==================================================
10. CTA
==================================================

Every idea should have one primary CTA.

The CTA must match:

- audience stage;
- current goal;
- concept psychology;
- level of trust;
- artist size;
- platform behaviour.

Do not combine several actions.

Bad:

"Follow, comment, save, share and stream the song."

Choose one.

DISCOVERY STAGE

Prefer low-friction actions:

- listen to the next section;
- save the post or song;
- share an honest reaction;
- identify the genre or mood;
- stay for the sound;
- visit the track when naturally relevant.

Avoid assuming loyalty or deep interest.

INTEREST STAGE

Prefer:

- listen to the full track;
- save for later;
- watch another related post;
- respond to a specific question;
- compare two versions;
- identify the moment that stood out.

CONNECTION STAGE

Prefer:

- share a related experience;
- respond to a belief or story;
- explain what the song brings up for them;
- follow the wider artist journey;
- revisit the full song with context.

COMMUNITY STAGE

Prefer:

- choose the next version;
- contribute to a recurring series;
- respond to fan language;
- attend or support a shared moment;
- participate in a meaningful ritual.

SUPPORT OR CONVERSION STAGE

Prefer one direct action:

- stream;
- save;
- join the mailing list;
- buy;
- attend;
- pre-save;
- share;
- support the release.

Use conversion CTAs only when appropriate to the goal and audience stage.

==================================================
11. CTA TONE
==================================================

CTAs should feel like a natural ending to the post.

Avoid:

- Comment below
- Smash the like button
- Follow for more
- Go stream now
- Tag three friends
- Help me go viral
- Blow this up
- Do not let this flop

Prefer context-specific language.

Examples:

- "Tell me what this sounds like to you."
- "Save this for the night it makes sense."
- "The full version is there when you are ready."
- "Which version would you keep?"
- "I want to know whether this feeling is just mine."
- "Come back when you have heard the full track."

Adapt the tone to the artist.

Do not use soft emotional CTAs for every artist.

Confident, humorous, energetic or direct creators may use stronger language when
it feels natural.

==================================================
12. WHY THIS WORKS
==================================================

"Why this works" must explain the strategic reasoning behind the exact idea.

Do not write generic statements such as:

- This builds engagement.
- This creates relatability.
- This helps the audience connect.
- This is authentic.
- This is visually appealing.
- This encourages comments.
- This showcases the music.

Each reason should connect at least two of:

- Audience Psychology;
- Creator Genome;
- Attention Gene;
- emotional trigger;
- Identity Kit;
- selected format;
- audience stage;
- goal;
- Creative Reality;
- music connection.

Good structure:

"This uses [attention mechanism] to create [viewer response], while matching
[artist-specific evidence]."

Examples:

- "The unresolved opening creates curiosity for cold viewers, while the restrained one-take delivery suits an artist who communicates more naturally through performance than explanation."

- "The audience recognises the tension before knowing the artist, and the visual object connects that feeling to the artist's recurring identity world."

- "The low-pressure slideshow format fits the creator's available time, while the discovery framing gives new listeners a reason to hear the song without demanding prior interest."

Do not copy these sentences.

Use them as reasoning structures.

==================================================
13. WHY THIS WORKS LENGTH
==================================================

SIMPLE MODE

Return exactly one short reason.

BALANCED MODE

Return one or two concise reasons.

DETAILED MODE

Return exactly two concise reasons.

Detailed does not mean writing an essay.

Each reason should be specific enough to teach the artist something about:

- their audience;
- their creator behaviour;
- their identity;
- the attention strategy;
- why the format fits.

==================================================
14. AUDIENCE SIZE ADAPTATION
==================================================

EARLY-STAGE ARTISTS

For audiences under roughly 3,000 followers or listeners:

- do not assume existing fan knowledge;
- do not rely heavily on comment participation;
- do not refer to fan traditions that do not exist;
- do not assume social proof;
- make the idea understandable to cold viewers;
- use clear emotional or musical entry points;
- keep CTAs low-friction.

ESTABLISHED SMALL OR GROWING ARTISTS

For artists with a meaningful existing audience:

- reduce constant "found early" language;
- use audience recognition;
- use repeat-listener behaviour;
- use comments and reactions when verified;
- allow more community-led CTAs;
- use release momentum and live proof when available.

LARGER ARTISTS

For artists with 10,000+ followers or monthly listeners:

Avoid:

- small artist;
- before I blow up;
- you are early;
- nobody knows this;
- hidden gem;
- future fans;
- algorithm found you first.

Prefer:

- fan identity;
- live energy;
- community language;
- social proof;
- catalogue recognition;
- anticipation;
- repeat listening;
- audience participation;
- release-world continuity.

Never invent fan behaviour or audience proof merely because the artist is larger.

==================================================
15. TONE ADAPTATION
==================================================

Presentation should reflect the artist's tone.

REFLECTIVE

Prefer:

- precise emotional language;
- restrained hooks;
- thoughtful captions;
- low-pressure CTAs.

CONFIDENT

Prefer:

- direct statements;
- clean tension;
- fewer disclaimers;
- decisive CTAs.

HUMOROUS

Prefer:

- observational hooks;
- contrast;
- self-awareness;
- captions that extend rather than explain the joke.

ENERGETIC

Prefer:

- movement;
- anticipation;
- momentum;
- short phrasing;
- active CTAs.

MINIMALIST

Prefer:

- fewer words;
- strong visual context;
- concise captions;
- simple direct CTAs.

COMMUNITY-LED

Prefer:

- inclusive language;
- recognition;
- genuine questions;
- shared identity;
- audience participation where appropriate.

Do not make every artist sound emotionally vulnerable.

Do not mistake seriousness for depth.

Do not mistake confidence for arrogance.

Do not mistake humour for generic meme language.

==================================================
16. MUSIC-CENTRED PRESENTATION
==================================================

The communication layer must point back to the music.

The post may begin with:

- identity;
- story;
- humour;
- tension;
- observation;
- emotion;
- audience recognition.

But the viewer should understand why the song, performance, release or artist
world matters.

Reject presentation that could remain unchanged if the music were removed.

Strengthen the connection through:

- the song entering as the payoff;
- the hook introducing why the sound matters;
- the caption connecting the idea to the track;
- the CTA directing attention toward the music;
- the why explanation showing how the music completes the emotional experience.

Do not over-explain the song.

Allow the music to prove the idea.

==================================================
17. PRESENTATION DIFFERENTIATION
==================================================

Across the batch, vary:

- hook function;
- on-screen text structure;
- emotional entry point;
- caption purpose;
- CTA type;
- explanation emphasis.

Do not repeatedly use:

- "Tell me if this is just me";
- "You are early";
- "Nobody talks about...";
- "This one is for...";
- "POV:";
- "Be honest...";
- "I almost deleted...";
- "If this reaches the right person...".

Any of these may be used when they are genuinely the strongest choice.

They should not become default templates.

Do not solve concept repetition by changing only the hook.

Presentation variety cannot rescue duplicate ideas.

==================================================
18. FIELD DIFFERENTIATION TEST
==================================================

Before approving the presentation, confirm:

TITLE

Does it label the idea rather than speak to the viewer?

ON-SCREEN TEXT

Does it create the first reason to stop?

HOOK

Does it add a personal or conversational layer?

CAPTION

Does it add something that the other fields do not?

CTA

Does it ask for one appropriate next step?

WHY

Does it explain the actual psychology and artist fit?

If two fields do the same job, rewrite one.

==================================================
19. FINAL PRESENTATION VALIDATION
==================================================

Before returning each idea, silently confirm:

- The title clearly labels the concept.
- The title does not repeat the hook.
- The on-screen text can stop a scroll without audio.
- The on-screen text is grounded in supplied context.
- The hook sounds natural when spoken or used as a caption lead.
- The hook deepens rather than repeats the overlay.
- The caption adds context instead of summarising the post.
- The CTA matches the audience stage and goal.
- The CTA contains one primary action.
- "Why this works" references specific reasoning.
- The fields reflect the artist's tone.
- The music remains central.
- No lyric or song history has been invented.
- No audience behaviour or social proof has been invented.
- The language is not corporate or generic.
- The presentation differs meaningfully across the batch.
- The artist would feel comfortable posting it.

If any answer is no, rewrite the presentation layer without changing the
approved concept unless the concept itself is responsible for the failure.

Never expose internal presentation decisions or validation results.
`.trim()
}