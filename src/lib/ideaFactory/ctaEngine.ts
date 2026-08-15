// src/lib/ideaFactory/ctaEngine.ts

export function formatCtaEngineForPrompt() {
  return `
==================================================
CTA ENGINE
==================================================

PURPOSE

Choose the most meaningful next action that the audience relationship has
genuinely earned.

The CTA should feel like the natural conclusion of the viewer experience,
not an unrelated marketing instruction.

Ask for one primary action only.

Do not reveal this reasoning.

==================================================
1. INPUTS
==================================================

Use:

- audience stage;
- primary goal;
- Audience Psychology;
- approved concept;
- hook;
- viewer experience;
- content format;
- platform;
- Identity Kit;
- release context;
- conversion context.

The CTA must remain subordinate to:

- explicit artist instructions;
- Creative Reality;
- factual grounding;
- audience stage;
- primary goal;
- the approved concept.

==================================================
2. IDENTIFY THE NATURAL NEXT STEP
==================================================

Before writing the CTA, determine:

- what relationship already exists;
- what value the viewer has just received;
- what emotional state the content creates;
- what action naturally follows the concept;
- what the smallest meaningful next step is;
- whether the primary goal requires a specific action;
- whether that action has been psychologically earned.

The CTA must complete the concept rather than interrupt it.

==================================================
3. COMMITMENT LADDER
==================================================

DISCOVERY

Relationship:
The viewer may not know the artist.

Usual commitment ceiling:

- continue watching;
- replay;
- listen closely;
- save;
- answer one easy question;
- choose between simple options;
- leave a low-effort reaction.

Do not normally ask for:

- loyalty;
- a personal story;
- a direct message;
- a mailing-list signup;
- a purchase;
- a booking;
- several actions at once.

DISCOVERY CTA RULES

A Discovery CTA should require no personal loyalty and very little emotional effort.

Prefer actions based on what the viewer just observed:

- choose between visible options;
- identify the strongest moment;
- replay a transition;
- stay for a reveal;
- listen for a specific change;
- save a useful or memorable moment.

Reject Discovery CTAs that ask the viewer to:

- explain a personal emotional experience;
- share a vulnerable story;
- reflect deeply on their identity;
- care about the artist's journey;
- support the artist without receiving a clear reason;
- perform several actions.

The CTA must contain a recognisable action.

A poetic closing statement is not automatically a CTA.

Weak:
"Take this walk with me—hear how the city shapes my flow."

Stronger:
"Stay for the final change in scenery."

Weak:
"Tell me which moment feels most real to you."

Stronger:
"Did the reflection or the performance catch you first?"

AWARENESS

Relationship:
The viewer recognises the artist or music but is not yet strongly invested.

Usual commitment ceiling:

- follow;
- listen again;
- share;
- offer a simple opinion;
- choose a favourite;
- return for a recurring series;
- save for later.

CONNECTION

Relationship:
The viewer knows the artist but the emotional relationship is still developing.

Usual commitment ceiling:

- share an experience;
- answer a reflective question;
- join a meaningful discussion;
- respond with a personal association;
- send a low-pressure message;
- follow a deeper part of the artist journey.

Do not force vulnerability from the viewer.

COMMUNITY

Relationship:
The viewer already participates in the artist's world.

Usual commitment ceiling:

- vote;
- contribute;
- tag another community member;
- join a challenge;
- influence the next post;
- participate in a recurring ritual;
- share community language or memories.

Participation must still support the music or artist world.

RELEASE SUPPORT

Relationship:
The viewer is being activated around a current release.

Allowed release actions include:

- listen;
- stream;
- save the song;
- pre-save;
- add to a playlist;
- share the release;
- use the sound;
- watch the full release-related piece.

Choose only one primary release action.

Use pre-save only when a real pre-save is available.
Use streaming language only when the music is actually released.

CONVERSION

Relationship:
The content is intended to move an appropriately prepared viewer toward one
meaningful action.

Allowed actions include:

- join a mailing list;
- purchase;
- buy a ticket;
- book;
- apply;
- download;
- subscribe;
- join a membership.

The action must match the supplied goal and available offer.

Never invent:

- products;
- tickets;
- links;
- mailing lists;
- memberships;
- applications;
- booking availability.

==================================================
4. GOAL ALIGNMENT
==================================================

The primary goal influences the action, but it does not automatically override
the audience-stage commitment ceiling.

Examples:

Reach new listeners:
Prefer listening, replay, saving or a simple recognition response.

Deepen fan connection:
Prefer reflection, personal response or meaningful conversation.

Promote a release:
Prefer one verified release-related action.

Increase streams:
Prefer listening to or saving the full track when the release is available.

Build consistency:
Prefer following or returning for the next instalment when appropriate.

Grow my mailing list:
Use a mailing-list CTA only when the audience stage and supplied setup support it.

Sell tickets:
Use a ticket CTA only when a real show and ticket route exist.

Build community:
Prefer participation, voting, shared language or recurring interaction.

Test new content ideas:
Prefer a simple response that measures the specific creative variable being tested.

==================================================
5. CTA WRITING RULES
==================================================

A strong CTA should be:

- singular;
- clear;
- low-friction for the stage;
- connected to the content;
- natural in the artist's voice;
- realistic;
- specific enough to act on.

Avoid:

- combining follow, stream, save, comment and share;
- generic engagement bait;
- asking for deep reflection after a shallow concept;
- asking for loyalty before earning attention;
- high-pressure sales language;
- unsupported urgency;
- vague phrases such as "support me";
- a question unrelated to the concept.

==================================================
6. COMMITMENT LADDER TEST
==================================================

Before approving the CTA, ask:

1. Has the CTA exceeded the commitment this relationship has earned?
2. Would a real viewer naturally do this next?
3. Does it support the primary goal?
4. Does it complete the concept's psychological arc?
5. Could a smaller action achieve the same objective?
6. Is it appropriate for the audience stage?
7. Is it based on a verified action or offer?
8. Does it ask for exactly one primary action?
9. Does it feel conversational rather than promotional?
10. Does the hook lead naturally toward this CTA?
11. Does the CTA contain one clear action rather than only a closing statement?
12. For Discovery, can the viewer respond without knowing or trusting the artist?
13. Is the CTA based on something visible, audible or immediately experienced in the content?

If the CTA asks too much, reduce the commitment.

If the CTA is disconnected from the concept, replace it.

Never ask for loyalty before earning attention.
`.trim()
}