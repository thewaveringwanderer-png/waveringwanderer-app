export function formatExecutionEngineForPrompt() {
  return `
EXECUTION ENGINE

The Execution Engine turns an approved concept into a filming plan the artist
can immediately picture and realistically create.

Run it after:

- Creative Reality is understood
- the Creative Fingerprint is inferred
- conflicts are resolved
- the Attention Gene is chosen
- the Content Format Gene is chosen
- the concept mechanic is approved

Run it before writing:

- hook
- on-screen text
- caption
- CTA
- why this works

The Execution Engine answers:

"What exactly does the artist film?"

Do not output internal execution reasoning.

==================================================
1. EXECUTION STANDARD
==================================================

Every execution must make these details clear:

- where the phone or camera is positioned;
- what appears in the opening frame;
- what the artist does;
- whether the camera moves;
- how the framing changes;
- where text appears;
- how the song enters or develops;
- how the post ends.

The artist should be able to imagine the finished post without filling in major
gaps themselves.

Avoid vague instructions such as:

- film a performance clip;
- use cinematic footage;
- show the creative process;
- create a montage;
- add interesting transitions;
- use engaging B-roll;
- make it visually appealing.

These describe categories, not executions.

==================================================
2. EXECUTION OBJECT
==================================================

For every idea, build this internal object:

{
  "setting": "verified or realistically available location",
  "openingFrame": "what the viewer sees first",
  "cameraPosition": "where the phone or camera is placed",
  "framing": "wide, medium, close, cropped, overhead, side profile, etc.",
  "artistAction": "the exact action performed",
  "cameraMovement": "none or one clearly described movement",
  "shotProgression": ["ordered shot or visual changes"],
  "lighting": "simple available lighting direction",
  "editingRhythm": "cut pattern and pacing",
  "bRoll": ["only verified or realistically filmable supporting shots"],
  "textPlacement": "where and when on-screen text appears",
  "transition": "optional simple transition",
  "audioUse": "how the song or sound is used",
  "ending": "final visual beat",
  "complexity": "easy | standard | advanced"
}

Never return this object.

Use it to write one concise but complete execution.

==================================================
3. COHERENCE RULE
==================================================

Every instruction must describe one coherent filming plan.

Reject combinations such as:

- fixed tripod shot and continuous handheld tracking;
- one take and several camera-angle changes;
- faceless framing and direct eye contact;
- silent acting and spoken delivery at the same time;
- minimal editing and rapid montage;
- solo filming and a moving camera operator;
- one location and several unrelated environments;
- natural documentary footage and heavily staged choreography;
- static slideshow and instructions to perform live to camera.

Do not stack techniques simply to make the idea sound detailed.

One clear filming decision is better than five incompatible instructions.

==================================================
4. OPENING FRAME
==================================================

The opening frame must visually support the Attention Gene.

It should create at least one of:

- immediate recognition;
- curiosity;
- visual tension;
- contrast;
- movement;
- emotional atmosphere;
- an unanswered question;
- a recognisable object or setting;
- a surprising visual arrangement.

Do not default every opening to:

- standing in front of the camera;
- looking directly into the lens;
- walking toward the camera;
- sitting in a bedroom;
- pressing play in a studio.

Choose an opening that fits the concept and artist.

Examples of useful opening frames:

- an object already moving before the artist enters;
- the artist partly hidden by a doorway or mirror;
- an empty frame that the artist steps into on the musical change;
- a close crop on hands, clothing or equipment;
- the final result shown briefly before returning to the beginning;
- text appearing over a visually unresolved moment;
- a wide frame where the artist is unusually small;
- a repeated action beginning immediately.

==================================================
5. CAMERA POSITION AND FRAMING
==================================================

State where the phone or camera is.

Useful positions include:

- tripod at chest height;
- phone propped on a shelf;
- phone placed low on the floor;
- overhead phone above a desk;
- side-profile position near a window;
- mirror reflection with the phone outside the main frame;
- static wide shot from across the room;
- close crop focused on hands or an object;
- first-person handheld framing;
- dashboard or stable car mount only when safe and stationary.

Choose framing based on creator comfort.

DIRECT, HIGH-CONFIDENCE PERFORMANCE

May use:

- medium close-up;
- direct eye contact;
- centred composition;
- controlled push-in;
- one-take delivery.

LOW CAMERA CONFIDENCE

Prefer:

- side profile;
- wider frame;
- partial face;
- silhouette;
- reflection;
- seated delivery;
- cropped framing;
- short separate takes.

FACELESS CREATOR

Prefer:

- hands;
- objects;
- first-person perspective;
- silhouette;
- back-of-head framing;
- clothing details;
- shadow;
- environment;
- screen or notebook footage.

Do not casually reveal the face later in the execution.

VISUAL OR CINEMATIC CREATOR

Use deliberate:

- negative space;
- foreground objects;
- symmetry or asymmetry;
- visual depth;
- environmental framing;
- repeated composition;
- contrast between wide and close detail.

Do not call ordinary centred footage cinematic without a meaningful visual
decision.

==================================================
6. CAMERA MOVEMENT
==================================================

Use camera movement only when it adds meaning or attention.

Choose no more than one primary movement unless the artist clearly has advanced
production ability.

Possible movements:

- slow pull-back;
- controlled push-in;
- lateral slide;
- tilt from object to artist;
- pan following one action;
- handheld first-person movement;
- reveal from behind an object;
- static frame with the artist moving through it.

When the artist works alone, movement must be achievable through:

- a static camera and artist movement;
- a simple handheld first-person shot;
- a basic automated movement only when equipment is confirmed;
- repositioning between separate shots.

Never assume another person is available to operate the camera.

Movement should reflect emotional intent.

Examples:

- pull-back can create distance, isolation or reveal;
- push-in can increase intimacy or tension;
- static framing can create honesty, stillness or confidence;
- lateral movement can create progression;
- a tilt reveal can connect an object to the artist;
- the artist leaving a static frame can create closure or absence.

Do not use movement as decoration.

==================================================
7. SHOT VARIETY
==================================================

Shot variety does not mean adding many shots.

Use the smallest number of shots needed to create progression.

EASY

Prefer:

- one continuous shot;
- one shot plus one detail insert;
- two static angles;
- simple slideshow;
- one performance take with one ending change.

STANDARD

Prefer:

- two to four shots;
- wide plus close detail;
- repeated action from two angles;
- one location with controlled progression;
- one clear visual reveal.

ADVANCED

May use:

- more deliberate shot sequences;
- match cuts;
- parallel visual timelines;
- controlled transitions;
- location changes only when confirmed;
- layered performance and B-roll.

Do not assign advanced execution merely because the idea depth is detailed.

Detailed means clearer, not necessarily harder.

==================================================
8. EDITING RHYTHM
==================================================

Editing rhythm should match:

- the song energy;
- the Attention Gene;
- the creator's editing ability;
- the selected format;
- the emotional territory.

LOW ENERGY OR REFLECTIVE

Prefer:

- longer holds;
- fewer cuts;
- restrained movement;
- silence or visual pause before the song enters;
- cuts on emotional changes rather than every beat.

HIGH ENERGY

Prefer:

- faster but readable cuts;
- movement aligned with musical changes;
- visible build-up and payoff;
- short repeated actions;
- cuts on drops, transitions or rhythm changes only when verified.

MINIMALIST CREATOR

Prefer:

- one take;
- simple beginning-middle-end;
- native platform trimming;
- two or three clean cuts.

DOCUMENTARY CREATOR

Prefer:

- real-time moments;
- imperfect but meaningful transitions;
- natural cutaways;
- process progression;
- minimal staging.

VISUAL BUILDER

Prefer:

- deliberate visual rhythm;
- repeated compositions;
- match between colour, movement and sound;
- a clear final image.

Avoid vague instructions such as:

- edit dynamically;
- use fast-paced editing;
- make the cuts engaging.

State the actual rhythm:

- hold the opening for two seconds;
- cut once when the beat enters;
- alternate between the wide shot and hand detail;
- let the final frame remain for one beat after the audio stops.

==================================================
9. LIGHTING
==================================================

Lighting advice must be simple and available.

Prefer:

- face or object turned toward a window;
- side light from one window;
- lamp placed behind or beside the artist;
- existing room light used deliberately;
- natural golden-hour light only when outdoor access and timing are realistic;
- silhouette against a bright window;
- one practical light visible in frame;
- screen light for a controlled low-light detail.

Avoid assuming:

- professional lighting kits;
- coloured lights;
- fog machines;
- studio lighting;
- multiple light sources;
- nighttime outdoor safety;
- rented equipment.

Lighting must support the emotional direction.

Examples:

- soft window light for intimacy;
- hard side light for tension;
- backlight for anonymity or mystery;
- warm practical light for closeness;
- bright even light for humour or direct communication;
- high contrast for dramatic visual-world content.

Do not add dramatic lighting where natural simplicity better fits the creator.

==================================================
10. B-ROLL
==================================================

B-roll must be specific and available.

Good B-roll:

- hands opening a notebook;
- shoes crossing the same section of floor;
- a screen showing a verified project file;
- headphones placed beside the phone;
- an object connected to the artist's identity;
- room details;
- transport or city footage the artist can realistically capture;
- preparation before a performance;
- close details of clothing or equipment;
- the same action repeated at different stages.

Bad B-roll instructions:

- add lifestyle shots;
- use cinematic city footage;
- show memories;
- add studio clips;
- include crowd reactions;
- show fans enjoying the song.

Those require assets that may not exist.

Use B-roll only when it improves:

- context;
- progression;
- identity;
- emotion;
- proof;
- visual rhythm.

Do not add B-roll merely to make the execution sound richer.

==================================================
11. TEXT PLACEMENT
==================================================

Specify where the text appears and what visual space supports it.

Possible placements:

- upper third above the artist's head;
- centred in negative space;
- lower third without covering captions or controls;
- beside the artist in an off-centre composition;
- one line at a time across separate shots;
- text revealed after the opening visual;
- first slide only;
- final frame as payoff.

The execution should leave visual room for text.

Do not position important text:

- over the artist's eyes;
- over fast-moving visual detail;
- too low where platform controls may cover it;
- across several competing backgrounds;
- in a place that changes every cut without purpose.

On-screen text should usually appear early enough to function as the billboard.

The hook should then deepen or personalise it.

Do not describe the exact wording here when the Communication Engine will write it.

Describe placement and timing.

==================================================
12. TRANSITIONS
==================================================

Transitions are optional.

Use a transition only when it has a narrative or visual purpose.

Simple useful transitions:

- hand covering the lens;
- artist crossing close to the camera;
- cut on a repeated movement;
- object placed into the same frame position;
- light switched on or off;
- doorway reveal;
- turning the phone from first-person to static view;
- match cut between two stages of the same action;
- cut on a verified musical change.

Avoid:

- transition packs;
- complicated masking;
- excessive zoom effects;
- random speed ramps;
- effects requiring advanced software;
- several different transition styles in one short post.

For low-editing creators, use straight cuts unless a transition is essential to
the mechanic.

==================================================
13. PLATFORM OPTIMISATION
==================================================

Execution should respect short-form viewing behaviour without becoming generic.

TIKTOK AND REELS

Prefer:

- immediate visual information;
- clear text-safe composition;
- vertical framing;
- strong first visual beat;
- understandable concept without sound for the opening moment;
- song entry early enough to remain music-centred;
- natural loop or clear ending.

YOUTUBE SHORTS

Prefer:

- slightly clearer setup;
- readable progression;
- strong title concept;
- visual payoff;
- concise beginning-middle-end structure.

SLIDESHOW

Prefer:

- one clear idea per slide;
- no unnecessary slide count;
- progression rather than random images;
- strongest visual or statement first;
- final slide that returns to the music or artist identity.

Do not prescribe platform tricks that conflict with the artist's identity.

==================================================
14. FORMAT-SPECIFIC EXECUTION
==================================================

DIRECT PERFORMANCE

Execution must specify:

- performance section length;
- camera position;
- framing;
- artist movement or stillness;
- text placement;
- ending beat.

Avoid generic:

"Perform the song directly to camera."

Example structure:

"Prop the phone at chest height beside the window. Begin in a medium side-profile
frame, turn toward the lens when the song enters, then step out of frame on the
final beat. Keep the text in the empty upper-left space."

BTS

Execution must show:

- a real process stage;
- a decision, problem or progression;
- the finished or changed result;
- how the music connects.

Avoid random studio montages.

TALKING TO CAMERA

Execution must specify:

- exact opening position;
- whether the delivery is one take or several short lines;
- how music enters;
- one supporting visual change;
- ending action.

Do not prescribe a long monologue.

TEXT ON SCREEN

The visual must remain interesting even though the overlay is primary.

Specify:

- background action;
- framing;
- text-safe space;
- when the song enters;
- whether the visual repeats or changes.

SLIDESHOW

Specify:

- number of slides;
- purpose of each slide;
- image source;
- progression;
- final payoff.

Do not assume images exist unless they are verified or easily creatable now.

VISUAL / CINEMATIC

Specify:

- visual motif;
- composition;
- movement;
- lighting;
- progression;
- final image.

The execution must communicate through visuals rather than relying on a long
caption to explain it.

LIVE FOOTAGE

Use only when live footage or event access is confirmed.

Specify:

- exact moment to open on;
- how much context appears;
- whether original live audio or track audio is used;
- final invitation.

STORYTELLING

Specify:

- opening tension;
- visual or spoken progression;
- turning point;
- song connection;
- ending payoff.

A statement without progression is not a story.

==================================================
15. MEMORABLE FILMING DECISION
==================================================

Every execution must include one memorable filming decision.

Examples:

- the camera slowly backs away while the artist stays still;
- the artist performs only through a mirror reflection;
- the frame begins empty and the artist enters on the first musical change;
- one object appears in every shot but changes position;
- the artist walks out of frame while the song continues;
- the camera stays fixed while the environment changes around the artist;
- the final shot reveals what the opening close-up was showing;
- text appears only after a visual contradiction is established;
- the artist repeats the same action with a different emotional delivery;
- the video begins with the ending and reverses to the cause.

The decision must:

- fit Creative Reality;
- fit the Creative Fingerprint;
- reinforce the Attention Gene;
- serve the concept;
- remain achievable.

Do not use novelty for novelty's sake.

==================================================
16. COMPLEXITY CONTROL
==================================================

Match execution complexity to the artist.

EASY

- one location;
- one or two shots;
- no specialist equipment;
- no advanced transitions;
- little or no B-roll;
- native platform editing;
- can be filmed quickly.

STANDARD

- one location;
- two to four shots;
- one simple movement or reveal;
- light editing;
- a small amount of B-roll;
- clear progression.

ADVANCED

- only when supported by explicit skill, time and resources;
- deliberate shot sequence;
- controlled movement;
- stronger art direction;
- more advanced editing;
- multiple stages or locations only when confirmed.

Never use advanced as a synonym for better.

The best execution is the strongest one the artist will actually make.

==================================================
17. EXECUTION VALIDATION
==================================================

Before approving the execution, silently confirm:

- The location is available or realistically accessible.
- The artist can film it alone when necessary.
- The camera position is clear.
- The opening frame is clear.
- The artist action is clear.
- Camera movement is achievable.
- Shot progression is coherent.
- Lighting is available.
- Editing matches the artist's ability.
- B-roll does not assume unavailable assets.
- Text placement is practical.
- Transitions are necessary and achievable.
- The selected format matches the execution.
- The music remains central.
- There is one memorable filming decision.
- No instruction contradicts another.
- The complexity matches Creative Reality.
- The artist can picture the video.
- The artist could realistically film it tomorrow.

If any answer is no, simplify, adapt or replace the execution.

Do not expose validation results or execution scores.
`.trim()
}