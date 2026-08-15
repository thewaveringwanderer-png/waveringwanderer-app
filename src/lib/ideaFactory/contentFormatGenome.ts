export type SlideBlueprintStep = {
  slide: number
  purpose: string
  visualDirection: string
  exampleText: string
  transitionDirection?: string
}

export type ContentFormatMechanic = {
  id: string
  name: string
  viewerExperience: string
  structure: string[]
  bestWhen: string[]
  avoidWhen: string[]
  repeatPotential?: string
  slideBlueprint?: SlideBlueprintStep[]
  spokenOutline?: {
  openingLine: string
  talkingPoints: string[]
  closingLine: string
}
}

export type ContentFormatGene = {
  id: string
  name: string
  bestFor: string[]
  psychology: string
  coreMechanic: string
  structure: string[]
  avoid: string[]
  exampleDirection: string
  mechanics?: ContentFormatMechanic[]
  validation?: string[]
  performanceUse?: string 
commonMistakes?: string[]
batchVariety?: string[]
}

export const CONTENT_FORMAT_GENOME: ContentFormatGene[] = [
  {
  id: 'direct-performance',
  name: 'Direct Performance',
  bestFor: ['rappers', 'singers', 'bands', 'high-confidence artists'],
  psychology:
    'Works because the viewer can quickly judge the artist’s voice, delivery, confidence, and musical identity.',
    coreMechanic:
"The viewer experiences the music primarily through the artist's live performance.",
  structure: [
    'Choose a distinctive performance mechanic before choosing the camera setup',
    'Make the music and delivery the central proof',
    'Create one visible progression, reveal, contrast, or repeated visual rule',
    'Use text only when it strengthens the performance premise',
    'End on a deliberate visual or musical beat',
    
  ],
  avoid: [
    'Defaulting to a chest-height tripod performance',
    'Changing only the camera angle while keeping the same viewer experience',
    'Generic “new song out now” framing',
    'Overexplaining before the music starts',
    'Adding movement that has no relationship to the performance',
  ],
  exampleDirection:
    'Build the performance around one memorable visual rule, such as changing position, unusual perspective, visible recording process, repeated framing, or a location-based progression.',
    
  mechanics: [
    {
      id: 'three-position-performance',
      name: 'Three-Position Performance',
      viewerExperience:
        'The same section gains visual momentum as the artist appears in contrasting positions within one environment.',
      structure: [
        'Perform the same section in three clearly different positions',
        'Give each position a distinct posture or energy',
        'Cut between them on meaningful musical changes',
        'Finish with the strongest position',
      ],
      bestWhen: [
        'The artist has one flexible room',
        'The artist can perform confidently',
        'Moderate editing is available',
      ],
      avoidWhen: [
        'The artist selected very simple editing',
        'The room cannot safely support several positions',
      ],
      repeatPotential:
        'Can become a recurring series using a different room, song section, emotional progression, or three-position rule.',
    },
    {
      id: 'floor-perspective',
      name: 'Floor-Perspective Performance',
      viewerExperience:
        'The viewer looks upwards at the artist, making the delivery feel immediate, dominant, strange, or confrontational.',
      structure: [
        'Place the phone safely on the floor',
        'Position the artist above or beside the lens',
        'Perform directly into the unusual perspective',
        'End by stepping over, covering, or leaving the lens',
      ],
      bestWhen: [
        'The artist is comfortable performing close to camera',
        'A phone is available',
        'A bold or intense section is suitable',
      ],
      avoidWhen: [
        'The framing would expose an unsafe setup',
        'The artist prefers distant or faceless performance',
      ],
      repeatPotential:
        'Can recur as a recognisable low-angle performance format.',
    },
    {
      id: 'high-corner-observer',
      name: 'High-Corner Observer Performance',
      viewerExperience:
        'The viewer watches from an unusual fixed position while the artist uses different parts of the room.',
      structure: [
        'Place the phone securely in a high corner or high tripod position',
        'Use a wide frame showing several usable areas',
        'Move between two or three marked positions during the performance',
        'Let the final position complete the visual progression',
      ],
      bestWhen: [
        'A room and tripod are confirmed',
        'The artist works alone',
        'The environment can become part of the performance',
      ],
      avoidWhen: [
        'The phone cannot be positioned securely',
        'The room contains private or distracting details',
      ],
      repeatPotential:
        'Can become a recurring room-performance series with a consistent observer viewpoint.',
    },
    {
      id: 'recording-process-performance',
      name: 'Recording-Process Performance',
      viewerExperience:
        'The audience feels present inside the act of recording rather than watching a staged social-media performance.',
      structure: [
        'Position the phone above, beside, or behind the microphone',
        'Show the artist entering recording position',
        'Capture one real take or recreated recording pass',
        'Include a natural reset, breath, playback reaction, or end-of-take moment',
      ],
      bestWhen: [
        'A microphone and recording space are confirmed',
        'The artist wants process and performance together',
        'The recording workflow is visually understandable',
      ],
      avoidWhen: [
        'A microphone is not confirmed',
        'The artist cannot show the recording environment',
      ],
      repeatPotential:
        'Can become a recurring “inside the take” or recording-session series.',
    },
    {
      id: 'room-route-performance',
      name: 'Room-Route Performance',
      viewerExperience:
        'The performance progresses through the room, with each area representing a new musical or emotional stage.',
      structure: [
        'Choose two or three available areas in the same room',
        'Assign one part of the section to each area',
        'Change position when the music changes',
        'Finish in the area that gives the strongest final image',
      ],
      bestWhen: [
        'One room contains several usable positions',
        'The track has a clear build or sectional change',
        'The artist can edit several short takes',
      ],
      avoidWhen: [
        'The selected section has no progression',
        'Editing confidence is very low',
      ],
      repeatPotential:
        'Can become a series where each song maps differently onto the same room.',
    },
    {
      id: 'through-equipment-performance',
      name: 'Through-Equipment Performance',
      viewerExperience:
        'The viewer sees the artist through or around verified recording equipment, placing the music-making world inside the frame.',
      structure: [
        'Use confirmed equipment as foreground framing',
        'Keep the artist visible beyond it',
        'Perform through the created visual depth',
        'End by interacting with or moving past the equipment',
      ],
      bestWhen: [
        'A microphone, laptop, controller, instrument, or stand is confirmed',
        'The equipment is naturally part of the artist’s work',
      ],
      avoidWhen: [
        'The equipment would obscure the performance',
        'The object exists only as decoration',
      ],
      repeatPotential:
        'Can become a recognisable visual signature using the artist’s actual setup.',
    },
    {
      id: 'one-take-reposition',
      name: 'One-Take Reposition Performance',
      viewerExperience:
        'The artist changes the composition during one uninterrupted performance without requiring complicated editing.',
      structure: [
        'Begin in one clear position',
        'Move to a second position during a musical change',
        'Use the movement to alter distance, scale, or energy',
        'Finish without cutting',
      ],
      bestWhen: [
        'The artist likes one-take performance',
        'Editing should remain minimal',
        'The available location supports safe movement',
      ],
      avoidWhen: [
        'Movement would distract from delivery',
        'The artist has limited performance confidence',
      ],
      repeatPotential:
        'Can recur with different movement rules and musical turning points.',
    },
    {
      id: 'performance-interruption',
      name: 'Performance Interruption',
      viewerExperience:
        'A deliberate action temporarily interrupts the performance and makes its return more memorable.',
      structure: [
        'Establish the performance clearly',
        'Interrupt it with one physical or visual action',
        'Allow the music or silence to carry the interruption',
        'Resume with a changed energy, position, or meaning',
      ],
      bestWhen: [
        'The track contains a pause, switch, drop, or clear transition',
        'The artist can perform a controlled contrast',
      ],
      avoidWhen: [
        'The interruption has no relationship to the song',
        'It becomes a random transition trick',
      ],
      repeatPotential:
        'Can become a recurring format built around different interruption rules.',
    },
  ],
},


{
  id: 'storytelling',
  name: 'Storytelling',
  bestFor: [
    'songwriters',
    'reflective artists',
    'artists with lived experiences',
    'artists with strong personal or creative journeys',
  ],
  psychology:
    'Builds connection by giving the viewer a specific event, experience, decision, memory or change to follow.',
    coreMechanic:
"The viewer follows a narrative before or alongside the music.",
  structure: [
    'Begin inside a specific moment or situation',
    'Give only the context needed to understand what happened',
    'Reveal the decision, change, discovery, consequence or unresolved tension',
    'Connect the story directly to the music or artist identity',
    'End with meaning, reflection or musical proof',
  ],
  avoid: [
    'Calling emotional performance storytelling',
    'Describing a mood without explaining what happened',
    'Inventing biography, conflict or vulnerability',
    'Telling an entire life story in one post',
    'Using song performance to replace the narrative',
    'Generic motivational lessons',
  ],
  exampleDirection:
    'Tell one concise story about a real moment, decision or experience, then let the music reveal why it still matters.',
  mechanics: [
    {
      id: 'origin-story',
      name: 'Origin Story',
      viewerExperience:
        'The viewer discovers the specific moment that caused a song, idea, belief or creative direction to begin.',
      structure: [
        'Open at the moment something began',
        'Explain what was happening',
        'Reveal what the moment caused',
        'Connect it to the resulting music or creative direction',
      ],
      bestWhen: [
        'A verified origin moment has been supplied',
        'The story can be explained concisely',
        'The result connects clearly to the artist’s work',
      ],
      avoidWhen: [
        'The origin would need to be invented',
        'The artist supplied only a general theme',
        'The story requires extensive background information',
      ],
      repeatPotential:
        'Can become a recurring series explaining where songs, ideas and artist beliefs began.',
    },
    {
      id: 'turning-point-story',
      name: 'Turning-Point Story',
      viewerExperience:
        'The audience follows one moment when the artist changed their mind, direction, approach or behaviour.',
      structure: [
        'Establish what the artist believed, expected or planned before',
        'Describe the moment that challenged it',
        'Explain what changed afterwards',
        'Use the music or artist identity as evidence of the new direction',
      ],
      bestWhen: [
        'A real decision or change is verified',
        'The turning point affected the artist’s work or identity',
      ],
      avoidWhen: [
        'The change is only vague emotional growth',
        'The turning point is guessed from the artist’s mood',
        'The story is made more dramatic than the supplied evidence',
      ],
      repeatPotential:
        'Can become a series about the decisions and experiences that shaped the artist.',
    },
    {
      id: 'mistake-and-realisation',
      name: 'Mistake and Realisation',
      viewerExperience:
        'The viewer learns what went wrong and what the artist understood because of it.',
      structure: [
        'State the specific mistake or failed assumption',
        'Describe what happened because of it',
        'Reveal the realisation',
        'Connect the lesson to a creative choice, song or current belief',
      ],
      bestWhen: [
        'The artist supplied a real mistake or learning moment',
        'The story provides recognition or useful insight',
      ],
      avoidWhen: [
        'The artist is pushed into unsupported vulnerability',
        'The mistake is exaggerated for attention',
        'The lesson becomes generic motivational advice',
      ],
      repeatPotential:
        'Can become an honest lessons-from-the-journey series.',
    },
    {
      id: 'one-scene-story',
      name: 'One-Scene Story',
      viewerExperience:
        'One contained scene, conversation or observation reveals a wider meaning.',
      structure: [
        'Place the viewer inside one specific scene',
        'Include one memorable concrete detail',
        'Explain what changed, became clear or remained unresolved',
        'Let the music carry the wider emotional meaning',
      ],
      bestWhen: [
        'The artist supplied a specific memory, encounter or observation',
        'The story works without a long introduction',
      ],
      avoidWhen: [
        'The scene would need to be invented',
        'The story contains no change, tension or discovery',
        'The concrete details are guessed by the model',
      ],
      repeatPotential:
        'Can become a recurring one-moment-one-meaning series.',
    },
    {
      id: 'before-and-after-belief',
      name: 'Before and After Belief',
      viewerExperience:
        'The audience compares what the artist once believed with what experience taught them.',
      structure: [
        'State the earlier belief or assumption',
        'Describe the experience that challenged it',
        'Reveal what the artist believes now',
        'Connect the difference to the music or artist philosophy',
      ],
      bestWhen: [
        'The Identity Kit supports both the earlier and current perspective',
        'A real experience explains the change',
      ],
      avoidWhen: [
        'The belief shift is inferred without evidence',
        'The artist sounds like they are delivering a lecture',
        'The music connection is added artificially',
      ],
      repeatPotential:
        'Can become a recurring evolution-of-my-thinking series.',
    },
    {
      id: 'process-story',
      name: 'Process Story',
      viewerExperience:
        'The viewer follows what happened while making something and why the final result changed.',
      structure: [
        'Begin with the original intention',
        'Introduce the real problem, surprise or decision',
        'Explain how the process changed',
        'Reveal or play the result',
      ],
      bestWhen: [
        'The artist supplied a real creation or recording experience',
        'The final result demonstrates the effect of the story',
      ],
      avoidWhen: [
        'The process contains no meaningful change',
        'The post becomes only a technical tutorial',
        'The model invents production problems',
      ],
      repeatPotential:
        'Can become a recurring stories-behind-the-creative-process series.',
    },
  ],
},


{
  id: 'visual-cinematic',
  name: 'Visual / Cinematic',
  bestFor: [
    'visual artists',
    'faceless artists',
    'artists with strong environments',
    'artists who prefer image-led communication',
    'artists comfortable with deliberate filming or editing',
  ],
  psychology:
    'Creates memorability by giving the music a clear visual rule, progression, contrast or transformation.',
    coreMechanic:
"The viewer should remember the visual idea before they remember the performance. Performance may support the concept but must never be the primary mechanism creating curiosity. If the performance could be swapped with another performance without changing the concept, the mechanic is incorrect.",
validation: [
  'Can the concept be described in one visual sentence?',
  'Could somebody describe the visual idea without mentioning the performance?',
  'Is the visual progression more important than the performance?',
  'Does at least one visual rule evolve during the post?',
  'Would another artist performing the same song produce a different result?',
  'Does the visual staging materially change how the performance is experienced?',
  'Would the idea still work if the artist never spoke?',
'Is the primary viewer experience visual rather than verbal?',
'Does the visual rule create the curiosity rather than the explanation?',
'Would this feel incorrect if labelled as Talking to Camera?',
'Is the visual mechanic stronger than the performance itself?',
'Would the idea still work if the performance were removed?',
'Is the visual mechanic creating the curiosity rather than the performance?',
'Would the viewer describe the visual concept before describing the performance?',
'Could this be mistaken for a Talking to Camera idea?',
],
commonMistakes: [
  "Calling slow walking cinematic.",
  "Calling attractive lighting cinematic.",
  "Replacing visual storytelling with performance.",
  "Using random B-roll.",
  "Making the camera movement the only visual idea.",
  "Confusing aesthetics with concept.",
  'Using talking-to-camera as the primary mechanic.',
'Explaining the concept instead of showing it.',
'Making performance carry the entire idea.',
],
batchVariety: [
  'Do not build the entire batch around room details, lighting changes or close-ups.',
  'Across a batch, vary the primary visual mechanic between transformation, perspective, repetition, contrast, object progression and movement.',
  'Two ideas using the same environment are acceptable only when the viewer experience is materially different.',
],
  structure: [
    'Choose one understandable visual rule',
    'Use the environment, composition, movement or available objects deliberately',
    'Create visible progression, contrast or transformation',
    'Make the music trigger or complete the visual idea',
    'End on one memorable final image',
  ],
  avoid: [
    'Calling ordinary performance footage cinematic',
    'Using attractive lighting without a concept',
    'Adding unrelated B-roll',
    'Inventing symbolic meaning that the artist did not supply',
    'Making the visual too complicated to execute',
    'Using performance as the automatic centre of every idea',
    'Talking directly to camera as the primary mechanic',
'Explaining the concept before showing it',
  ],
  performanceUse:
  'Use performance only to strengthen a visual concept. The primary viewer experience should always come from the visual rule, not the performance.',
  exampleDirection:
    'Build the post around one simple visual rule that changes with the music and ends on a memorable image.',
  mechanics: [
    {
      id: 'environment-transformation',
      name: 'Environment Transformation',
      viewerExperience:
        'One available environment visibly changes as the music develops.',
      structure: [
        'Establish the starting state of the environment',
        'Change one visible element at a time',
        'Synchronise the largest change with a musical moment',
        'End on the completed visual state',
      ],
      bestWhen: [
        'The artist can control one available environment',
        'The changes can be completed safely and simply',
        'The track contains a clear progression or switch',
      ],
      avoidWhen: [
        'The transformation requires unsupported props',
        'The changes are only decorative',
        'The setup exceeds the artist’s available time',
      ],
      repeatPotential:
        'Can become a recurring visual-transformation series using different songs and spaces.',
    },
    {
      id: 'perspective-rule',
      name: 'Perspective Rule',
      viewerExperience:
        'The entire video is governed by one unusual but understandable viewpoint.',
      structure: [
        'Establish the perspective immediately',
        'Keep the viewpoint visually consistent',
        'Use artist or environmental movement to create progression',
        'End by completing or deliberately breaking the perspective',
      ],
      bestWhen: [
        'The phone can be positioned safely',
        'The perspective materially changes the viewer experience',
        'The artist can work without a camera operator',
      ],
      avoidWhen: [
        'The angle is chosen only for novelty',
        'The setup creates a safety risk',
        'The perspective makes the subject difficult to understand',
      ],
      repeatPotential:
        'Can become a recognisable series exploring the artist’s world from different viewpoints.',
    },
    {
      id: 'repeated-composition',
      name: 'Repeated Composition',
      viewerExperience:
        'The same frame repeats while one meaningful element changes each time.',
      structure: [
        'Create one repeatable composition',
        'Repeat it two or three times',
        'Change one clear element in each version',
        'Use the final repetition as the reveal or payoff',
      ],
      bestWhen: [
        'The artist has a tripod or stable phone position',
        'The repeated frame can be recreated accurately',
        'Moderate editing is available',
      ],
      avoidWhen: [
        'The changes are too small to notice',
        'The repetitions communicate the same information',
        'Editing confidence is too low',
      ],
      repeatPotential:
        'Can become a signature visual language across multiple posts.',
    },
    {
      id: 'visual-contrast',
      name: 'Visual Contrast',
      viewerExperience:
        'Two opposing visual states make a musical, emotional or identity contrast easy to understand.',
      structure: [
        'Establish the first visual state',
        'Introduce the contrasting state',
        'Use a musical change to switch between or combine them',
        'End on the resolved or strongest state',
      ],
      bestWhen: [
        'Two achievable visual states are available',
        'The contrast is supported by the music or identity',
      ],
      avoidWhen: [
        'The contrast is artificially dramatic',
        'The relationship between the states is unclear',
        'The concept relies on invented emotional symbolism',
      ],
      repeatPotential:
        'Can become a recurring dual-world, before-and-after or contrast series.',
    },
    {
      id: 'object-progression',
      name: 'Object Progression',
      viewerExperience:
        'One verified object or flexible object category changes position, purpose or meaning throughout the post.',
      structure: [
        'Introduce the object clearly',
        'Repeat it with one controlled change',
        'Connect each change to the music',
        'Use the final state as the visual payoff',
      ],
      bestWhen: [
        'A verified object or ordinary object category is available',
        'Its purpose can be understood without explanation',
      ],
      avoidWhen: [
        'The idea depends on one unconfirmed exact prop',
        'The object is only decorative',
        'The symbolism is unsupported',
      ],
      repeatPotential:
        'Can become a recognisable object-led visual series.',
    },
    {
      id: 'movement-through-frame',
      name: 'Movement Through Frame',
      viewerExperience:
        'The viewer remains in one position while the artist or environment creates visual progression through movement.',
      structure: [
        'Set one fixed composition',
        'Begin with a simple starting position',
        'Use movement across, towards or away from the frame',
        'End with a deliberate final position or empty frame',
      ],
      bestWhen: [
        'The artist works alone',
        'A stable phone position is available',
        'The location provides safe movement space',
      ],
      avoidWhen: [
        'The movement is unrelated to the music',
        'The concept becomes another ordinary walking performance',
        'The location is too restricted',
      ],
      repeatPotential:
        'Can become a series built around different movement rules and environments.',
    },
  ],
},

{
  id: 'behind-the-scenes',
  name: 'Behind the Scenes',
  bestFor: [
    'studio artists',
    'producers',
    'bands',
    'songwriters',
    'DIY artists',
    'artists with visible creative processes',
  ],
  psychology:
    'Creates closeness by allowing the audience to witness the choices, problems, attempts and breakthroughs behind the finished work.',
    coreMechanic:
"The audience witnesses the creative process instead of only the finished result.",
  structure: [
    'Show a real process, choice, problem or attempt',
    'Give the viewer enough context to understand what is happening',
    'Reveal what changed or was learned',
    'Connect the process to the finished music',
    'Keep the process human rather than overly polished',
  ],
  avoid: [
    'Random studio footage with no context',
    'Staged performance labelled as behind the scenes',
    'Long technical explanations',
    'Making equipment more important than the artist',
    'Inventing problems or breakthroughs',
    'Showing activity without a result or reason',
  ],
  exampleDirection:
    'Show one real decision, problem, attempt or breakthrough from the making of the music and reveal how it affected the result.',
  mechanics: [
    {
      id: 'decision-before-result',
      name: 'Decision Before Result',
      viewerExperience:
        'The viewer sees one creative decision and then hears how it changed the finished music.',
      structure: [
        'Introduce one specific creative choice',
        'Show the available option, tension or problem',
        'Reveal what the artist chose',
        'Play or show the result',
      ],
      bestWhen: [
        'A real production, writing or performance decision is available',
        'The result can be heard or demonstrated',
      ],
      avoidWhen: [
        'The decision is too technical to understand quickly',
        'The result cannot be demonstrated',
        'The choice is invented by the model',
      ],
      repeatPotential:
        'Can become a recurring series about the decisions behind different songs.',
    },
    {
      id: 'problem-to-solution',
      name: 'Problem to Solution',
      viewerExperience:
        'The audience watches the artist encounter and solve one real creative problem.',
      structure: [
        'Show or explain the problem clearly',
        'Show one or two attempts',
        'Reveal the solution',
        'Let the finished result prove it worked',
      ],
      bestWhen: [
        'A genuine obstacle or revision exists',
        'The change can be understood without a long explanation',
      ],
      avoidWhen: [
        'The problem is invented for content',
        'The solution is not visible or audible',
        'The process requires extensive technical knowledge',
      ],
      repeatPotential:
        'Can become a recurring creative-problem series.',
    },
    {
      id: 'inside-the-session',
      name: 'Inside the Session',
      viewerExperience:
        'The viewer feels present during one focused part of a recording or creation session.',
      structure: [
        'Open while the process is already happening',
        'Show the artist making, testing or repeating one section',
        'Include one natural reaction, adjustment or reset',
        'Finish with the strongest attempt or result',
      ],
      bestWhen: [
        'A real or realistically recreated session is available',
        'The recording workflow is understandable visually',
        'Required equipment has been confirmed',
      ],
      avoidWhen: [
        'The footage is only random studio activity',
        'The audience cannot understand what is changing',
        'The artist only performs the finished song',
      ],
      repeatPotential:
        'Can become a regular window into sessions and works in progress.',
    },
    {
      id: 'raw-to-finished',
      name: 'Raw to Finished',
      viewerExperience:
        'The viewer compares an unfinished stage with the completed musical result.',
      structure: [
        'Open with the raw version',
        'Show one important development stage',
        'Switch to the finished version',
        'Highlight the difference the viewer should notice',
      ],
      bestWhen: [
        'A demo, draft, voice note or early version is verified',
        'The finished version is available',
        'The difference is clear enough to hear',
      ],
      avoidWhen: [
        'No earlier version exists',
        'The versions are too similar',
        'The model tells the artist to manufacture a fake early version',
      ],
      repeatPotential:
        'Can become a repeatable before-and-after music series.',
    },
    {
      id: 'attempt-reaction-adjustment',
      name: 'Attempt, Reaction, Adjustment',
      viewerExperience:
        'The audience sees one attempt, the artist’s genuine response and the immediate change they make.',
      structure: [
        'Show the first attempt',
        'Include the artist’s real reaction',
        'Show one clear adjustment',
        'Finish with the improved attempt',
      ],
      bestWhen: [
        'The artist is comfortable showing an imperfect attempt',
        'The adjustment can be understood quickly',
      ],
      avoidWhen: [
        'The reaction is staged',
        'The improvement is not noticeable',
        'The content embarrasses or diminishes the artist',
      ],
      repeatPotential:
        'Can become a recurring process-development series.',
    },
    {
      id: 'small-detail-big-effect',
      name: 'Small Detail, Big Effect',
      viewerExperience:
        'One apparently small creative adjustment creates a noticeable change in the result.',
      structure: [
        'Introduce the small detail',
        'Show or play the version before the change',
        'Apply the adjustment',
        'Reveal the effect on the final result',
      ],
      bestWhen: [
        'A real small production or performance choice exists',
        'The effect can be heard or seen',
      ],
      avoidWhen: [
        'The change is too subtle for ordinary viewers',
        'The explanation becomes highly technical',
      ],
      repeatPotential:
        'Can become a series revealing small creative choices listeners may not notice.',
    },
  ],
},

{
  id: 'talking-to-camera',
  name: 'Talking to Camera',
  bestFor: [
    'artists with strong opinions',
    'reflective artists',
    'confident speakers',
    'songwriters',
    'artists with clear beliefs or experiences',
  ],
  psychology:
    'Builds trust because the viewer hears the artist communicate a real thought, belief, answer, observation or experience in their own voice.',
    coreMechanic:
"The viewer connects with the artist's spoken thoughts rather than a performance.",
  structure: [
  'The artist speaks conversationally throughout; no rapping, singing or musical performance is used',
  'Choose one clear spoken idea before choosing the camera setup',
  'Open with the central sentence immediately',
  'Develop the thought using one real example, observation, belief or experience',
  'Connect the thought naturally to the artist’s music, identity or audience',
  'End once the idea has clearly landed',
],
  avoid: [
  'Performing, rapping, singing or lip-syncing',
  'Using a verse or bars as the main content',
  'Giving more filming direction than speaking guidance',
  'Over-directing facial expressions, posture or body language',
  'Generic motivational speeches',
  'Inventing personal experiences, opinions or lessons',
  'Long introductions before reaching the point',
  'Ending every concept with a generic engagement question',
],
  exampleDirection:
  'Give the artist a clear opening sentence, three or four talking points, one real example to include, and a natural closing thought. Keep filming guidance minimal.',
  mechanics: [
    {
      id: 'one-honest-observation',
      name: 'One Honest Observation',
      viewerExperience:
        'The artist shares one precise observation that changes how the viewer understands the music, creative process or artist journey.',
      structure: [
        'State the observation immediately',
        'Explain where the artist noticed it',
        'Give one concrete example',
        'Connect the observation to the music',
        'End once the thought is complete',
      ],
      bestWhen: [
        'The artist has supplied a distinctive observation or belief',
        'The point can be communicated clearly in under one minute',
        'The music can support or demonstrate the idea',
      ],
      avoidWhen: [
        'The observation could belong to any artist',
        'The point becomes generic advice',
        'The connection to the music is artificial',
      ],
      repeatPotential:
        'Can become a recurring series of honest observations about music, creativity and the artist journey.',
    },
    {
      id: 'belief-with-proof',
      name: 'Belief With Proof',
      viewerExperience:
        'The artist states one creative belief and then shows how that belief affects the work they make.',
      structure: [
        'State the belief clearly',
        'Explain why it matters to the artist',
        'Give one real creative example',
        'Briefly play or reference the musical proof after the spoken explanation',
        'End on the belief rather than a sales message',
      ],
      bestWhen: [
        'The Identity Kit contains a distinctive artist belief',
        'A verified song, process or decision demonstrates it',
        'The artist is comfortable explaining their philosophy',
      ],
      avoidWhen: [
        'The belief is generic inspiration',
        'The example does not actually prove the belief',
        'The artist is made to sound overly philosophical',
      ],
      repeatPotential:
        'Can become a recurring Creative Constitution or artist-beliefs series.',
    },
    {
      id: 'question-and-answer',
      name: 'Question and Answer',
      viewerExperience:
        'The artist answers one focused question the audience may genuinely have about the music, process or journey.',
      structure: [
        'Open with the question on screen or spoken aloud',
        'Give the direct answer immediately',
        'Add one useful detail or example',
        'Connect the answer to a song, decision or artist belief',
        'Invite further questions only when appropriate',
      ],
      bestWhen: [
        'A genuine audience question is available',
        'The answer reveals something meaningful',
        'The question can be answered without a long explanation',
      ],
      avoidWhen: [
        'The question is fabricated only to manufacture content',
        'The answer is obvious or generic',
        'The response becomes a tutorial unrelated to the artist identity',
      ],
      repeatPotential:
        'Can become a recurring audience-question or artist-answers series.',
    },
    {
      id: 'misconception-correction',
      name: 'Misconception Correction',
      viewerExperience:
        'The artist identifies something people misunderstand and replaces it with a more accurate perspective.',
      structure: [
        'State the misconception',
        'Explain why it is incomplete or inaccurate',
        'Give one real example',
        'Reveal the artist’s actual perspective',
        'Connect that perspective to the music or process',
      ],
      bestWhen: [
        'The artist supplied a genuine misconception or tension',
        'Correcting it reveals artist identity',
        'The explanation can remain calm and specific',
      ],
      avoidWhen: [
        'The misconception is invented',
        'The post becomes defensive',
        'The artist attacks other creators or listeners',
      ],
      repeatPotential:
        'Can become a series correcting assumptions about the artist, genre or creative process.',
    },
    {
      id: 'short-tension-story',
      name: 'Short Tension Story',
      viewerExperience:
        'The artist describes one specific moment of uncertainty, pressure or conflict and explains what happened next.',
      structure: [
        'Open at the moment of tension',
        'Give only the context needed',
        'Describe the decision, realisation or outcome',
        'Connect the moment to the music or current artist identity',
        'End on what the artist understands now',
      ],
      bestWhen: [
        'A real concise experience has been supplied',
        'The artist is comfortable sharing it',
        'The story contains a genuine turning point',
      ],
      avoidWhen: [
        'The story lacks a change or outcome',
        'The model invents vulnerability or conflict',
        'The story becomes a motivational speech',
      ],
      repeatPotential:
        'Can become a series of short moments that shaped the artist.',
    },
    {
      id: 'before-you-hear-this',
      name: 'Before You Hear This',
      viewerExperience:
        'The artist gives one piece of context that changes how the viewer experiences the song section that follows.',
      structure: [
  'State the listening context immediately',
  'Explain why it matters in one or two spoken sentences',
  'Finish the spoken thought before the music begins',
  'Play the relevant song section without performing it',
  'Let the audio complete the point',
],
      bestWhen: [
        'Verified context meaningfully changes the listening experience',
        'The selected song section supports the context',
        'The artist wants the music to provide the final proof',
      ],
      avoidWhen: [
  'The context is vague emotional framing',
  'The artist explains every lyric',
  'The song section does not support the setup',
  'The artist begins performing instead of speaking',
],
      repeatPotential:
        'Can become a recurring “before you hear this” listening-context series.',
    },
    {
  id: 'direct-question',
  spokenOutline: {
  openingLine:
    'Can I ask you something I have been thinking about lately?',
  talkingPoints: [
    'State the exact question',
    'Explain what made you begin thinking about it',
    'Share your honest current answer',
    'Connect the answer to the music or life experience behind it',
  ],
  closingLine:
    'I do not think I have the full answer yet, but this is where I am now.',
},
  name: 'Direct Question',
  viewerExperience:
    'The artist opens with a thoughtful question and explores it conversationally with the viewer.',
  structure: [
    'Ask one specific question immediately',
    'Explain why the question matters to the artist',
    'Offer one honest perspective or experience',
    'Connect the thought to the music or creative identity',
    'End with the question still open or with one clear conclusion',
  ],
  bestWhen: [
    'The question reflects a real artist belief or audience tension',
    'The artist is comfortable speaking naturally',
    'The subject can be explored briefly',
  ],
  avoidWhen: [
    'The question is generic engagement bait',
    'The answer becomes a motivational speech',
    'The artist performs a verse instead of discussing the question',
  ],
  repeatPotential:
    'Can become a recurring questions-I-keep-thinking-about series.',
},
{
  id: 'lesson-from-creating',
  spokenOutline: {
  openingLine:
    'Making music taught me something I did not expect.',
  talkingPoints: [
    'State the lesson clearly',
    'Describe the real creative moment that taught it',
    'Explain what you used to believe before',
    'Explain what you do differently now',
  ],
  closingLine:
    'That lesson has changed how I approach everything I make now.',
},
  name: 'Lesson From Creating',
  viewerExperience:
    'The artist shares one practical or emotional lesson learned while making music.',
  structure: [
    'State the lesson immediately',
    'Describe the real moment or process that taught it',
    'Explain how it changed the artist’s approach',
    'Connect it to the work being made now',
    'End with the lesson in one clear sentence',
  ],
  bestWhen: [
    'A verified creative experience supports the lesson',
    'The insight is specific rather than universal advice',
    'The artist can explain it simply',
  ],
  avoidWhen: [
    'The lesson is invented',
    'The idea becomes generic self-help content',
    'The artist demonstrates the lesson by performing',
  ],
  repeatPotential:
    'Can become a recurring lessons-from-making-music series.',
},
{
  id: 'opinion-with-reason',
  spokenOutline: {
  openingLine:
    'I have an opinion about this that might not be popular.',
  talkingPoints: [
    'State the opinion directly',
    'Explain the real experience that shaped it',
    'Give one specific example',
    'Clarify what you are not trying to say',
  ],
  closingLine:
    'That is just where I stand based on what I have lived and learned.',
},
  name: 'Opinion With Reason',
  viewerExperience:
    'The artist shares a clear opinion and gives the viewer a reason to understand it.',
  structure: [
    'State the opinion directly',
    'Explain what experience or belief shaped it',
    'Give one specific example',
    'Connect it to the artist’s work or audience',
    'End without attacking opposing views',
  ],
  bestWhen: [
    'The artist has supplied a genuine opinion',
    'The opinion reveals creative identity',
    'The topic can be discussed respectfully',
  ],
  avoidWhen: [
    'The opinion is manufactured for controversy',
    'The artist attacks other creators',
    'The content turns into an industry rant',
    'A song performance replaces the explanation',
  ],
  repeatPotential:
    'Can become a recurring things-I-believe-about-music series.',
},
  ],
},

{
  id: 'text-on-screen-discovery',
  name: 'Text on Screen',
  bestFor: [
    'small artists',
    'artists with simple footage',
    'faceless artists',
    'low-time creators',
    'artists with strong audience psychology',
  ],
  psychology:
    'Uses a clear written premise to create curiosity, recognition, tension or emotional meaning before the viewer fully understands the visual or music.',
    coreMechanic:
"The written words create the curiosity while the music provides the proof.",
  structure: [
    'Make the written premise understandable in the opening seconds',
    'Keep each line short enough to read naturally',
    'Use the visual to support rather than compete with the text',
    'Let the music prove, deepen or resolve the written idea',
    'End once the text premise has paid off',
  ],
  avoid: [
    'Defaulting to “you found me early” framing',
    'Copying viral text word for word',
    'Writing text that could belong to any artist',
    'Using desperation or guilt to stop the viewer',
    'Adding too many lines to one video',
    'Making the visual unrelated to the text',
    'Using the song only as background atmosphere',
  ],
  exampleDirection:
    'Build the post around one concise written premise that creates curiosity or recognition, then let the visual and music complete its meaning.',
  mechanics: [
    {
      id: 'statement-then-proof',
      name: 'Statement Then Proof',
      viewerExperience:
        'A confident written statement creates an expectation before the music provides the evidence.',
      structure: [
        'Open with one specific statement',
        'Keep the visual simple during the setup',
        'Introduce the strongest relevant music section quickly',
        'Let the song demonstrate the statement',
        'End without explaining the proof again',
      ],
      bestWhen: [
        'The artist has a distinctive claim, belief or musical quality',
        'The song can clearly support the statement',
        'The statement is understandable without background context',
      ],
      avoidWhen: [
        'The statement exaggerates the artist’s ability',
        'The claim could apply to any song',
        'The music does not provide a clear payoff',
      ],
      repeatPotential:
        'Can become a recurring series where artist beliefs or claims are followed by musical proof.',
    },
    {
      id: 'progressive-thought-reveal',
      name: 'Progressive Thought Reveal',
      viewerExperience:
        'The meaning develops line by line while the viewer waits for the complete thought.',
      structure: [
        'Begin with an incomplete but understandable thought',
        'Reveal one short line at a time',
        'Increase specificity or emotional meaning with each line',
        'Use the final line as the payoff',
        'Let the music continue the feeling after the text finishes',
      ],
      bestWhen: [
        'The thought benefits from gradual disclosure',
        'The visual can remain simple and readable',
        'The final line meaningfully changes the earlier lines',
      ],
      avoidWhen: [
        'The viewer must read a full paragraph',
        'The final line only repeats the opening',
        'The suspense feels manipulative',
      ],
      repeatPotential:
        'Can become a recurring written-thought or unfinished-sentence series.',
    },
    {
      id: 'viewer-recognition',
      name: 'Viewer Recognition',
      viewerExperience:
        'The text describes a specific listener, feeling or situation so precisely that the viewer recognises themselves.',
      structure: [
        'Identify one audience situation or internal experience',
        'Describe it using specific rather than universal language',
        'Let the song create emotional recognition',
        'End with a gentle invitation or no CTA at all',
      ],
      bestWhen: [
        'Audience Psychology contains a clear frustration, desire or identity',
        'The music genuinely fits the described moment',
        'The artist wants to attract aligned listeners',
      ],
      avoidWhen: [
        'The text relies on broad sadness or struggle',
        'The post claims to understand every viewer',
        'The song could be replaced by unrelated audio',
      ],
      repeatPotential:
        'Can become a recurring “music for people who…” or listener-recognition series.',
    },
    {
      id: 'expectation-reversal',
      name: 'Expectation Reversal',
      viewerExperience:
        'The opening text leads the viewer towards one assumption before the music or final line changes its meaning.',
      structure: [
        'Establish the expected interpretation',
        'Allow the viewer to settle into that assumption',
        'Introduce the reversal through music, visual or final text',
        'End shortly after the new meaning becomes clear',
      ],
      bestWhen: [
        'A genuine contrast exists in the song, identity or situation',
        'The reversal can be understood quickly',
        'The final meaning does not require explanation',
      ],
      avoidWhen: [
        'The opening is misleading clickbait',
        'The reversal is unrelated to the song',
        'The final meaning is weaker than the setup',
      ],
      repeatPotential:
        'Can become a recurring assumption-versus-reality series.',
    },
    {
      id: 'specific-invitation',
      name: 'Specific Listener Invitation',
      viewerExperience:
        'The text makes one precise kind of viewer feel intentionally invited into the artist’s world.',
      structure: [
        'Name a specific listener identity or listening situation',
        'Explain what the music offers that person',
        'Let the song provide immediate proof',
        'End with a low-pressure invitation to stay or listen',
      ],
      bestWhen: [
        'The listener identity is supported by Audience Psychology',
        'The music clearly serves the described situation',
        'The invitation feels personal rather than promotional',
      ],
      avoidWhen: [
        'The text says only “if you like good music”',
        'The post excludes listeners aggressively',
        'The invitation becomes a follow demand',
      ],
      repeatPotential:
        'Can become a recurring series introducing different listeners to different sides of the artist.',
    },
    {
      id: 'comment-versus-reality',
      name: 'Comment Versus Reality',
      viewerExperience:
        'A real or representative outside opinion is contrasted with what the artist actually creates or believes.',
      structure: [
        'Open with the comment, assumption or criticism',
        'Keep the response visual rather than argumentative',
        'Use the music as the main answer',
        'Add a final line only when it strengthens the contrast',
      ],
      bestWhen: [
        'A genuine comment or recurring misconception exists',
        'The music provides a confident response',
        'The artist wants to communicate resilience without defensiveness',
      ],
      avoidWhen: [
        'A fake comment is invented',
        'The post encourages conflict',
        'The response attacks an identifiable person',
      ],
      repeatPotential:
        'Can become a recurring outside-opinion-versus-artist-reality series.',
    },
  ],
},

{
  id: 'camera-roll-slideshow',
  name: 'Camera Roll / Slideshow',
  bestFor: [
    'faceless artists',
    'introverted artists',
    'visual artists',
    'low-time creators',
    'artists with meaningful existing images',
    'artists building a visual world',
  ],
  psychology:
    'Turns existing images into a structured journey, comparison, reveal or artist world without requiring extensive new filming.',
    coreMechanic:
"The sequence of images creates the progression, with every slide introducing new information.",
  structure: [
    'Give every slide a clear role in the progression',
    'Open with the strongest image or written premise',
    'Use images that add new information rather than repeating the same mood',
    'Keep slide text concise and readable',
    'Build towards a reveal, change, conclusion or musical payoff',
    'End with a clear final image rather than an extra promotional slide',
  ],
  avoid: [
    'Random photo dumps with no progression',
    'Using several nearly identical images',
    'Inventing memories or history from unexplained photographs',
    'Writing full paragraphs on individual slides',
    'Making every slideshow a chronological journey',
    'Adding more slides than the concept needs',
    'Using images that the artist has not confirmed exist',
  ],
  exampleDirection:
    'Build a five-to-seven-slide sequence where every image advances one clear story, comparison, reveal or part of the artist’s world.',
  mechanics: [
    {
      id: 'world-of-the-song',
      name: 'World of the Song',
      viewerExperience:
        'The viewer enters the visual environment, mood and identity surrounding one song.',
      structure: [
        'Open with the image that best establishes the world',
        'Reveal different parts of that world across the middle slides',
        'Include the artist or music-making process where supported',
        'End with the image that best represents the complete identity',
      ],
      bestWhen: [
        'Existing images share a clear visual identity',
        'The artist wants to build atmosphere and recognition',
        'The song has an established mood or visual direction',
      ],
      avoidWhen: [
        'The images are visually unrelated',
        'The slideshow relies only on vague mood',
        'The model invents objects, places or imagery',
      ],
      repeatPotential:
        'Can become a recurring visual-world series for different songs, eras or listener moods.',
      slideBlueprint: [
        {
          slide: 1,
          purpose: 'Introduce the world immediately.',
          visualDirection:
            'Use the strongest image that communicates the song’s visual identity.',
          exampleText:
            'This is what the song feels like before the first word.',
            transitionDirection:
  'Hold slightly longer than the next slides, then cut on the first clear musical change.',
        },
        {
          slide: 2,
          purpose: 'Reveal the environment.',
          visualDirection:
            'Show a verified place, texture or setting connected to the artist or song.',
          exampleText:
            'Built somewhere between stillness and pressure.',
            transitionDirection:
  'Use a clean cut on the next beat or musical phrase.',
        },
        {
          slide: 3,
          purpose: 'Add a human or creative detail.',
          visualDirection:
            'Use a verified image of the artist, notebook, recording setup or relevant process detail.',
          exampleText:
            'Every detail became part of the sound.',
          transitionDirection:
  'Keep this slide brief, then move immediately into the contrasting image.',  
        },
        {
          slide: 4,
          purpose: 'Deepen the emotional identity.',
          visualDirection:
            'Choose an image that introduces contrast, tension or a different side of the world.',
          exampleText:
            'It is calm on the surface, but never underneath.',
          transitionDirection:
  'Hold long enough for the text to be read, then cut cleanly.',  
        },
        {
          slide: 5,
          purpose: 'Complete the world.',
          visualDirection:
            'End with the clearest artist, cover, environment or identity image.',
          exampleText:
            'Welcome to the world of this song.',
          transitionDirection:
  'Hold the final slide until the text has been read before the audio ends.',  
        },
      ],
    },
    {
      id: 'chronological-journey',
      name: 'Chronological Journey',
      viewerExperience:
        'The viewer follows a verified creative or personal progression through time.',
      structure: [
        'Begin at the earliest confirmed stage',
        'Use each slide to show a meaningful next step',
        'Make the change visible across the sequence',
        'End with the current result or next horizon',
      ],
      bestWhen: [
        'Images genuinely document a journey',
        'A clear progression exists',
        'The artist wants to show development without overexplaining',
      ],
      avoidWhen: [
        'Dates or history would need to be invented',
        'The progression is only a random collection of older images',
        'The slideshow turns into a generic success story',
      ],
      repeatPotential:
        'Can become a recurring journey behind songs, releases, performances or artist development.',
      slideBlueprint: [
        {
          slide: 1,
          purpose: 'Establish the starting point.',
          visualDirection:
            'Use the earliest verified image relevant to the journey.',
          exampleText:
            'This is where this part of the journey started.',
        },
        {
          slide: 2,
          purpose: 'Show the first real action.',
          visualDirection:
            'Use an image showing an early attempt, draft, session or decision.',
          exampleText:
            'At first, I was only trying to make something honest.',
        },
        {
          slide: 3,
          purpose: 'Introduce the difficult or uncertain middle.',
          visualDirection:
            'Use a verified image representing experimentation, repetition or unfinished work.',
          exampleText:
            'Most of the progress happened before anyone could see it.',
        },
        {
          slide: 4,
          purpose: 'Reveal a meaningful change.',
          visualDirection:
            'Show the first image where the development becomes visible.',
          exampleText:
            'Then the direction finally became clear.',
        },
        {
          slide: 5,
          purpose: 'Show the current stage.',
          visualDirection:
            'Use the strongest recent image or final result.',
          exampleText:
            'Not the destination. Just the next visible horizon.',
        },
      ],
    },
    {
      id: 'one-detail-per-slide',
      name: 'One Detail Per Slide',
      viewerExperience:
        'Each slide reveals one clue about the artist, song or creative world until the viewer understands the whole idea.',
      structure: [
        'Begin with the most intriguing detail',
        'Give each slide one distinct purpose',
        'Increase understanding with every image',
        'Use the final slide to connect the details together',
      ],
      bestWhen: [
        'The artist has several specific visual details available',
        'Curiosity is more useful than chronological storytelling',
        'The details reveal genuine artist identity',
      ],
      avoidWhen: [
        'Several slides communicate the same thing',
        'The details are generic aesthetic objects',
        'The final slide does not create a payoff',
      ],
      repeatPotential:
        'Can become a recurring series revealing five details behind a song, release or artist era.',
      slideBlueprint: [
        {
          slide: 1,
          purpose: 'Create curiosity with the strongest clue.',
          visualDirection:
            'Use one unusual or distinctive verified detail.',
          exampleText:
            'The first clue to understanding this song.',
        },
        {
          slide: 2,
          purpose: 'Reveal a creative ingredient.',
          visualDirection:
            'Show a process, environment, influence or recurring visual detail.',
          exampleText:
            'It started with this part of my world.',
        },
        {
          slide: 3,
          purpose: 'Reveal a tension or contrast.',
          visualDirection:
            'Use an image representing a different side of the same idea.',
          exampleText:
            'But the song was never only about one feeling.',
        },
        {
          slide: 4,
          purpose: 'Reveal how the artist shaped the idea.',
          visualDirection:
            'Show a verified creative action, tool or decision.',
          exampleText:
            'This is where it started becoming mine.',
        },
        {
          slide: 5,
          purpose: 'Connect the clues.',
          visualDirection:
            'Use the final song, artist or visual-world image.',
          exampleText:
            'Put every detail together and you get this.',
        },
      ],
    },
    {
      id: 'contrast-pair-slideshow',
      name: 'Contrast Pair Slideshow',
      viewerExperience:
        'The viewer compares two opposing sides of the artist, song, process or experience.',
      structure: [
        'Establish the first side clearly',
        'Introduce the contrasting side',
        'Alternate between the two when useful',
        'End by showing how the music contains or connects both sides',
      ],
      bestWhen: [
        'Two verified states, environments or perspectives exist',
        'The contrast adds meaning to the music',
        'The images can be paired clearly',
      ],
      avoidWhen: [
        'The contrast is manufactured',
        'The two sides are visually indistinguishable',
        'The meaning requires extensive explanation',
      ],
      repeatPotential:
        'Can become a recurring two-sides-of-the-song or artist-duality series.',
      slideBlueprint: [
        {
          slide: 1,
          purpose: 'Introduce the first side.',
          visualDirection:
            'Use the strongest image representing state or perspective A.',
          exampleText:
            'The side people usually see.',
        },
        {
          slide: 2,
          purpose: 'Introduce the contrasting side.',
          visualDirection:
            'Use a clearly different verified image representing state B.',
          exampleText:
            'The side that actually shaped the music.',
        },
        {
          slide: 3,
          purpose: 'Develop the first side.',
          visualDirection:
            'Show another detail that adds depth rather than repeating slide one.',
          exampleText:
            'One side learned how to stay composed.',
        },
        {
          slide: 4,
          purpose: 'Develop the second side.',
          visualDirection:
            'Show what exists underneath or behind the first impression.',
          exampleText:
            'The other side gave the song its weight.',
        },
        {
          slide: 5,
          purpose: 'Resolve the contrast.',
          visualDirection:
            'Use an image where both sides connect through the artist or song.',
          exampleText:
            'The music exists somewhere between both.',
        },
      ],
    },
    {
      id: 'process-in-five-frames',
      name: 'Process in Five Frames',
      viewerExperience:
        'The audience sees a creative process reduced to five understandable stages.',
      structure: [
        'Open with the starting material',
        'Show three distinct stages of development',
        'End with the finished result',
        'Use text to clarify decisions rather than describe obvious images',
      ],
      bestWhen: [
        'Verified process images exist',
        'The stages are visually distinct',
        'The artist wants to make creation understandable quickly',
      ],
      avoidWhen: [
        'The model assumes process images exist',
        'The stages are nearly identical',
        'The slideshow becomes a technical tutorial',
      ],
      repeatPotential:
        'Can become a recurring five-frames-behind-the-song series.',
      slideBlueprint: [
        {
          slide: 1,
          purpose: 'Show the raw starting point.',
          visualDirection:
            'Use a verified image of the first draft, idea, setup or empty project.',
          exampleText:
            'Every finished song starts looking unfinished.',
        },
        {
          slide: 2,
          purpose: 'Show the first creative action.',
          visualDirection:
            'Use an image of writing, recording, producing or planning.',
          exampleText:
            'The first decision gave it a direction.',
        },
        {
          slide: 3,
          purpose: 'Show experimentation.',
          visualDirection:
            'Use an image representing revision, alternatives or repeated attempts.',
          exampleText:
            'Then came the part nobody hears: changing everything.',
        },
        {
          slide: 4,
          purpose: 'Show the breakthrough.',
          visualDirection:
            'Use the stage where the final identity became recognisable.',
          exampleText:
            'This was the moment it finally sounded like me.',
        },
        {
          slide: 5,
          purpose: 'Reveal the completed result.',
          visualDirection:
            'Use the finished song, cover, final session or release image.',
          exampleText:
            'From an unfinished thought to this.',
        },
      ],
    },
  ],
},


]