export type ContentFormatGene = {
  id: string
  name: string
  bestFor: string[]
  psychology: string
  structure: string[]
  avoid: string[]
  exampleDirection: string
}

export const CONTENT_FORMAT_GENOME: ContentFormatGene[] = [
  {
    id: 'direct-performance',
    name: 'Direct Performance',
    bestFor: ['rappers', 'singers', 'bands', 'high-confidence artists'],
    psychology:
      'Works because the viewer can quickly judge the artist’s voice, delivery, confidence, and musical identity.',
    structure: [
      'Start with a strong visual or lyrical moment',
      'Keep the music central',
      'Use text to create curiosity before the performance lands',
      'End with a light invitation to listen or comment',
    ],
    avoid: [
      'Generic “new song out now” framing',
      'Overexplaining before the music starts',
      'Weak opening seconds',
    ],
    exampleDirection:
      'Perform the strongest 10–15 seconds of the song directly to camera with text that gives the viewer a reason to stay.',
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind the Scenes',
    bestFor: ['studio artists', 'producers', 'bands', 'songwriters'],
    psychology:
      'Creates closeness by making the audience feel like they are witnessing the journey before the finished result.',
    structure: [
      'Show the process before the polished outcome',
      'Reveal a small decision, struggle, or breakthrough',
      'Connect the moment back to the song',
      'Invite the viewer into the next step',
    ],
    avoid: [
      'Random studio clips with no context',
      'Too much explanation',
      'Making the process feel more important than the music',
    ],
    exampleDirection:
      'Show a real moment from the making of the song and explain why that moment changed the direction of the track.',
  },
  {
    id: 'text-on-screen-discovery',
    name: 'Text-on-Screen Discovery',
    bestFor: ['small artists', 'new releases', 'artists with simple footage'],
    psychology:
      'Uses curiosity and low-friction viewing to stop someone who does not know the artist yet.',
    structure: [
      'Open with a relatable or curiosity-driven statement',
      'Let the song play underneath',
      'Keep the visual simple and authentic',
      'Make the viewer feel early, lucky, or personally invited',
    ],
    avoid: [
      'Copying viral hooks too literally',
      'Text that feels desperate',
      'Text that does not match the song mood',
    ],
    exampleDirection:
      'Use simple footage with text that makes the viewer feel like they have discovered an artist before everyone else.',
  },
  {
    id: 'song-meaning',
    name: 'Song Meaning',
    bestFor: ['lyrical artists', 'emotional songs', 'story-led releases'],
    psychology:
      'Gives listeners a reason to care by connecting the song to a human truth, memory, or emotional situation.',
    structure: [
      'Begin with the emotion or situation behind the song',
      'Keep the explanation short',
      'Let the song prove the feeling',
      'End with a question or invitation to relate',
    ],
    avoid: [
      'Overexplaining every lyric',
      'Making the caption heavier than the song',
      'Turning vulnerability into a lecture',
    ],
    exampleDirection:
      'Share the emotional situation behind one lyric, then let the song play as the proof.',
  },
  {
    id: 'camera-roll-slideshow',
    name: 'Camera Roll / Slideshow',
    bestFor: ['faceless artists', 'introverted artists', 'visual artists', 'low-time creators'],
    psychology:
      'Works because it turns existing images into a world, making the artist feel more textured without needing heavy filming.',
    structure: [
      'Choose images that match the song mood',
      'Use text to give the slideshow a clear emotional angle',
      'Let the images build atmosphere',
      'End with the song or artist identity as the anchor',
    ],
    avoid: [
      'Random images with no emotional link',
      'Too many slides',
      'Overly polished visuals that feel disconnected from the artist',
    ],
    exampleDirection:
      'Use 5–7 camera roll images that feel like the world of the song, with text that explains what the listener is stepping into.',
  },
  {
    id: 'talking-to-camera',
    name: 'Talking to Camera',
    bestFor: ['founder-artists', 'storytellers', 'artists with strong opinions'],
    psychology:
      'Builds trust because the viewer hears the artist’s actual thoughts, not just the finished product.',
    structure: [
      'Start with a direct thought or tension',
      'Keep the point specific',
      'Connect it to the music or artist journey',
      'End by inviting response rather than demanding attention',
    ],
    avoid: [
      'Long intros',
      'Trying to sound like an influencer',
      'Talking about music without letting people hear any',
    ],
    exampleDirection:
      'Share one honest thought about the song, the journey, or the industry, then connect it back to the music.',
  },
  {
    id: 'live-moment',
    name: 'Live Moment',
    bestFor: ['performers', 'bands', 'artists with gig footage'],
    psychology:
      'Creates proof. Viewers can see that real people respond to the artist in real spaces.',
    structure: [
      'Open on the strongest crowd or performance moment',
      'Add context only if needed',
      'Let the energy carry the video',
      'Invite viewers to the next show or song',
    ],
    avoid: [
      'Poor audio without context',
      'Long clips before anything happens',
      'Posting live footage with no emotional framing',
    ],
    exampleDirection:
      'Use the strongest live moment as social proof, then frame it as a reason new listeners should pay attention.',
  },
  {
    id: 'creative-constraint',
    name: 'Creative Constraint',
    bestFor: ['bedroom artists', 'DIY creators', 'low-budget artists'],
    psychology:
      'Turns limitations into identity. The audience roots for the artist because the constraint becomes part of the story.',
    structure: [
      'Name the limitation honestly',
      'Show how the artist works around it',
      'Let the result prove the creativity',
      'Make the constraint feel like character, not weakness',
    ],
    avoid: [
      'Complaining without transformation',
      'Making the artist look helpless',
      'Using limitation as an excuse for low effort',
    ],
    exampleDirection:
      'Show how the artist creates something strong despite limited time, budget, space, or confidence.',
  },
]