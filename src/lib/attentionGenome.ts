export interface AttentionGene {
  id: string
  name: string
  purpose: string
  psychology: string
  viewerFeeling: string
  bestFor: string[]
  avoidWhen: string[]
  identitySignals: string[]
  audienceSignals: string[]
  compatibleMechanics: string[]
  commonMistakes: string[]
}

export const ATTENTION_GENOME: AttentionGene[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    purpose:
      'Make the viewer feel like they have found the artist before everyone else.',
    psychology:
      'People enjoy discovering hidden gems because it reinforces their taste, identity, and sense of being early.',
    viewerFeeling: "I'm early. I found this before everyone else.",
    bestFor: [
      'small artists',
      'new listeners',
      'awareness growth',
      'early-stage audience building',
      'new releases',
    ],
    avoidWhen: [
      'artist already has a large audience',
      'content is aimed at existing fans',
      'the idea depends on community history',
    ],
    identitySignals: [
      'underground',
      'emerging',
      'hidden gem',
      'early journey',
      'niche sound',
    ],
    audienceSignals: [
      'people who like finding artists early',
      'taste-driven listeners',
      'genre explorers',
      'fans who enjoy gatekeeping discoveries',
    ],
    compatibleMechanics: [
      'first listen',
      'found early framing',
      'hidden gem reveal',
      'recommendation',
      'gatekeep this artist',
      'before everyone finds this',
    ],
    commonMistakes: [
      'sounding desperate for attention',
      'overusing algorithm language',
      'pretending the artist is unknown when they are established',
    ],
  },

  {
    id: 'curiosity',
    name: 'Curiosity',
    purpose:
      'Create an unanswered question that makes the viewer want to stay for the payoff.',
    psychology:
      'Open loops hold attention because the brain wants missing information resolved.',
    viewerFeeling: 'I need to see where this goes.',
    bestFor: [
      'song reveals',
      'lyric moments',
      'unexpected drops',
      'before-and-after ideas',
      'story-led posts',
    ],
    avoidWhen: [
      'the payoff is weak',
      'the idea has no real reveal',
      'the hook exaggerates more than the content delivers',
    ],
    identitySignals: [
      'mystery',
      'contradiction',
      'hidden meaning',
      'unfinished story',
      'surprising detail',
    ],
    audienceSignals: [
      'viewers who like stories',
      'listeners who enjoy lyrical depth',
      'fans who replay to understand meaning',
    ],
    compatibleMechanics: [
      'wait for it',
      'lyric reveal',
      'reverse storytelling',
      'countdown',
      'before vs after',
      'hidden detail',
      'second half payoff',
    ],
    commonMistakes: [
      'using vague bait like “wait for it” without a real reason',
      'making the setup more interesting than the song',
      'delaying too long before the payoff',
    ],
  },

  {
    id: 'identity',
    name: 'Identity',
    purpose:
      'Make the viewer recognise themselves inside the artist, song, or message.',
    psychology:
      'People stop for content that reflects who they are, who they want to be, or what they quietly feel.',
    viewerFeeling: 'This is for people like me.',
    bestFor: [
      'brand building',
      'Identity Kit-led ideas',
      'artist philosophy',
      'audience psychology',
      'long-term fan connection',
    ],
    avoidWhen: [
      'the identity statement is too broad',
      'the artist has not provided enough identity context',
      'the idea becomes a generic motivational quote',
    ],
    identitySignals: [
      'worldview',
      'creative philosophy',
      'recurring themes',
      'listener transformation',
      'core belief',
    ],
    audienceSignals: [
      'overthinkers',
      'dreamers',
      'outsiders',
      'underground listeners',
      'people seeking meaning',
      'fans who define themselves through music',
    ],
    compatibleMechanics: [
      'this is for people who...',
      'viewer self-recognition',
      'identity statement',
      'POV',
      'manifesto line',
      'community label',
    ],
    commonMistakes: [
      'making the identity too vague',
      'using clichés like “be yourself”',
      'speaking about the artist without including the viewer',
    ],
  },

  {
    id: 'vulnerability',
    name: 'Vulnerability',
    purpose:
      'Create trust by showing something honest, human, or emotionally exposed.',
    psychology:
      'Honesty reduces emotional distance and makes viewers feel closer to the artist.',
    viewerFeeling: 'I trust this artist because they are being real.',
    bestFor: [
      'reflective artists',
      'emotional songs',
      'lyrical music',
      'behind-the-song content',
      'artist story content',
    ],
    avoidWhen: [
      'the artist tone is playful or high-energy',
      'the vulnerability feels forced',
      'the idea becomes trauma bait',
    ],
    identitySignals: [
      'emotional honesty',
      'confession',
      'self-reflection',
      'private thoughts',
      'lived experience',
    ],
    audienceSignals: [
      'listeners who value honesty',
      'fans who connect through meaning',
      'people going through similar emotions',
    ],
    compatibleMechanics: [
      'confession',
      'voice memo',
      'notebook reveal',
      'one-take performance',
      'story behind the lyric',
      'quiet room performance',
    ],
    commonMistakes: [
      'oversharing without linking back to the music',
      'making every idea heavy',
      'turning vulnerability into generic sadness',
    ],
  },

  {
    id: 'belonging',
    name: 'Belonging',
    purpose:
      'Make viewers feel like they are joining a small world, community, or movement.',
    psychology:
      'People engage when content makes them feel part of something shared.',
    viewerFeeling: 'These are my people.',
    bestFor: [
      'community building',
      'early fanbase growth',
      'repeat listeners',
      'fan culture',
      'artist worlds',
    ],
    avoidWhen: [
      'the artist has no community yet and the idea assumes one',
      'the CTA asks too much from cold viewers',
      'the idea feels forced or cult-like',
    ],
    identitySignals: [
      'community',
      'shared struggle',
      'shared taste',
      'listener identity',
      'fan world',
    ],
    audienceSignals: [
      'people looking for artists to grow with',
      'fans who comment',
      'fans who enjoy being early',
      'niche communities',
    ],
    compatibleMechanics: [
      'say hi if you found this',
      'tell me where this found you',
      'fan name idea',
      'community question',
      'small world invitation',
    ],
    commonMistakes: [
      'assuming too much fan loyalty too early',
      'asking for comments in a generic way',
      'making belonging sound like marketing',
    ],
  },

  {
    id: 'rebellion',
    name: 'Rebellion',
    purpose:
      'Challenge an expectation, industry norm, or common belief in a way that makes people stop.',
    psychology:
      'Contradiction interrupts patterns and makes viewers reassess what they believe.',
    viewerFeeling: "I haven't thought about it like that.",
    bestFor: [
      'contrarian artists',
      'strong opinions',
      'genre disruption',
      'industry observations',
      'artist philosophy',
    ],
    avoidWhen: [
      'the opinion is weak',
      'the artist does not genuinely believe it',
      'the post becomes negativity without purpose',
    ],
    identitySignals: [
      'against the grain',
      'anti-industry',
      'creative independence',
      'strong worldview',
      'misunderstood artist',
    ],
    audienceSignals: [
      'fans tired of generic music advice',
      'listeners who value originality',
      'people frustrated by the industry',
    ],
    compatibleMechanics: [
      'them vs me',
      'unpopular opinion',
      'myth vs reality',
      'industry lie',
      'contrarian statement',
      'expectation vs reality',
    ],
    commonMistakes: [
      'being controversial just for attention',
      'making the artist sound bitter',
      'not connecting the opinion back to the music',
    ],
  },

  {
    id: 'contrast',
    name: 'Contrast',
    purpose:
      'Highlight a sharp difference that makes the idea feel surprising or memorable.',
    psychology:
      'The brain notices tension between two opposing things.',
    viewerFeeling: "That's an interesting difference.",
    bestFor: [
      'before-and-after content',
      'artist contradictions',
      'visual storytelling',
      'split-screen ideas',
      'identity tension',
    ],
    avoidWhen: [
      'the two sides are not meaningfully different',
      'the contrast feels obvious',
      'the idea over-explains itself',
    ],
    identitySignals: [
      'calm outside, chaos inside',
      'soft sound, hard message',
      'confidence and doubt',
      'success and emptiness',
      'private vs public self',
    ],
    audienceSignals: [
      'viewers who relate to inner conflict',
      'people drawn to complexity',
      'fans who like layered artists',
    ],
    compatibleMechanics: [
      'split screen',
      'before vs after',
      'two versions of me',
      'public vs private',
      'expectation vs reality',
      'parallel timelines',
    ],
    commonMistakes: [
      'using contrast as a label instead of a visual mechanic',
      'making both sides too similar',
      'forgetting to connect the contrast to the song',
    ],
  },

  {
    id: 'credibility',
    name: 'Credibility',
    purpose:
      'Earn respect by showing skill, effort, taste, craft, or seriousness.',
    psychology:
      'People are more likely to care when they believe the artist is genuinely good or committed.',
    viewerFeeling: 'This artist knows what they are doing.',
    bestFor: [
      'rappers',
      'vocalists',
      'producers',
      'instrumentalists',
      'technical artists',
      'performance clips',
    ],
    avoidWhen: [
      'the idea becomes arrogant without proof',
      'the skill is not clearly demonstrated',
      'the post forgets emotional connection',
    ],
    identitySignals: [
      'craft',
      'wordplay',
      'technical skill',
      'discipline',
      'taste',
      'creative standards',
    ],
    audienceSignals: [
      'listeners who care about bars',
      'music nerds',
      'genre purists',
      'fans who respect craft',
    ],
    compatibleMechanics: [
      'bar breakdown',
      'one-take performance',
      'before/after mix',
      'skill proof',
      'studio detail',
      'reaction to own take',
    ],
    commonMistakes: [
      'telling people the artist is skilled instead of showing it',
      'making the idea feel like a flex with no emotional point',
      'over-explaining the craft',
    ],
  },

  {
    id: 'hope',
    name: 'Hope',
    purpose:
      'Make the viewer feel that progress, healing, or possibility is still available.',
    psychology:
      'Hope creates emotional energy by making the future feel reachable.',
    viewerFeeling: 'Maybe I can keep going too.',
    bestFor: [
      'motivational artists',
      'healing songs',
      'underdog stories',
      'listener transformation',
      'reflective content',
    ],
    avoidWhen: [
      'the tone becomes toxic positivity',
      'the artist ignores the difficulty of the situation',
      'the idea sounds like generic motivation',
    ],
    identitySignals: [
      'resilience',
      'faith',
      'survival',
      'growth',
      'inner strength',
      'listener transformation',
    ],
    audienceSignals: [
      'people needing encouragement',
      'fans in difficult seasons',
      'listeners looking for meaning',
    ],
    compatibleMechanics: [
      'message to younger self',
      'before and after',
      'one line that helped me',
      'quiet encouragement',
      'proof you kept going',
    ],
    commonMistakes: [
      'sounding preachy',
      'ignoring pain',
      'making hope feel fake or overly polished',
    ],
  },

  {
    id: 'humour',
    name: 'Humour',
    purpose:
      'Make the artist feel human, relatable, and entertaining without losing the music.',
    psychology:
      'Humour lowers resistance and makes promotion feel less like promotion.',
    viewerFeeling: 'This artist gets it.',
    bestFor: [
      'artist reality posts',
      'marketing struggles',
      'release day chaos',
      'small artist honesty',
      'self-aware promotion',
    ],
    avoidWhen: [
      'the artist tone is very serious',
      'the joke distracts from the music',
      'the humour feels copied from a trend',
    ],
    identitySignals: [
      'self-awareness',
      'awkward promotion',
      'artist struggle',
      'independent artist reality',
      'playfulness',
    ],
    audienceSignals: [
      'artists',
      'music fans',
      'people tired of polished promo',
      'viewers who enjoy self-aware content',
    ],
    compatibleMechanics: [
      'fake conversation',
      'text message skit',
      'caption took longer than song',
      'expectation vs reality',
      'timer',
      'awkward promo confession',
    ],
    commonMistakes: [
      'making the joke more memorable than the song',
      'using humour that does not fit the artist',
      'becoming too meme-like for the brand',
    ],
  },

  {
    id: 'participation',
    name: 'Participation',
    purpose:
      'Give the viewer a role inside the content instead of leaving them as a passive observer.',
    psychology:
      'People are more likely to engage when the post gives them a simple, meaningful action.',
    viewerFeeling: 'I can be part of this.',
    bestFor: [
      'comment prompts',
      'audience building',
      'song feedback',
      'playlist saves',
      'community growth',
    ],
    avoidWhen: [
      'the artist has no audience and the ask is too demanding',
      'the CTA feels desperate',
      'the question is generic',
    ],
    identitySignals: [
      'conversation',
      'community',
      'feedback',
      'shared ownership',
      'fan involvement',
    ],
    audienceSignals: [
      'people who like giving opinions',
      'early supporters',
      'fans who enjoy discovery',
      'listeners who want to help',
    ],
    compatibleMechanics: [
      'choose the lyric',
      'name this genre',
      'tell me where this found you',
      'playlist challenge',
      'duet this',
      'comment reply',
    ],
    commonMistakes: [
      'asking too much too early',
      'using generic “comment below” CTAs',
      'not making the viewer feel their action matters',
    ],
  },

  {
    id: 'transformation',
    name: 'Transformation',
    purpose:
      'Show change, progress, or evolution in a way that makes the journey visible.',
    psychology:
      'People are drawn to progress because it creates emotional payoff and narrative movement.',
    viewerFeeling: 'Look how far this has come.',
    bestFor: [
      'artist growth',
      'old vs new songs',
      'release journeys',
      'before and after content',
      'long-term brand building',
    ],
    avoidWhen: [
      'there is no clear before and after',
      'the post becomes generic self-improvement',
      'the change is not connected to the music',
    ],
    identitySignals: [
      'growth',
      'evolution',
      'creative journey',
      'old demos',
      'progress',
      'becoming',
    ],
    audienceSignals: [
      'fans who enjoy following journeys',
      'people who like underdog arcs',
      'listeners who value development',
    ],
    compatibleMechanics: [
      'old demo vs final song',
      'first version vs current version',
      'message to younger self',
      'progress timeline',
      'draft evolution',
      'before the release vs after',
    ],
    commonMistakes: [
      'making transformation too vague',
      'not showing the before state clearly',
      'turning the post into motivation instead of music content',
    ],
  },
]

export function getAttentionGeneById(id: string) {
  return ATTENTION_GENOME.find(gene => gene.id === id)
}

export function formatAttentionGenomeForPrompt() {
  return ATTENTION_GENOME.map(gene => {
    return `
${gene.name.toUpperCase()}

Purpose:
${gene.purpose}

Psychology:
${gene.psychology}

Viewer feeling:
${gene.viewerFeeling}

Best for:
${gene.bestFor.map(item => `- ${item}`).join('\n')}

Avoid when:
${gene.avoidWhen.map(item => `- ${item}`).join('\n')}

Identity signals:
${gene.identitySignals.map(item => `- ${item}`).join('\n')}

Audience signals:
${gene.audienceSignals.map(item => `- ${item}`).join('\n')}

Compatible mechanics:
${gene.compatibleMechanics.map(item => `- ${item}`).join('\n')}

Common mistakes:
${gene.commonMistakes.map(item => `- ${item}`).join('\n')}
`.trim()
  }).join('\n\n---\n\n')
}