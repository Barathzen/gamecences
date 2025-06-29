import { StoryCategory } from './types';

export const APP_TITLE = "gamecences";
export const PLACEHOLDER_IMAGE_URL = "https://picsum.photos/seed/cyberpunk/1024/768?grayscale";
export const LOADING_IMAGE_URL = "https://picsum.photos/seed/loading/1024/768?grayscale&blur=2";

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const IMAGEN_MODEL = "imagen-3.0-generate-002";

export const ADVENTURE_LEVEL_GOAL = 50;
export const ADVENTURE_COMPLETION_REWARD = 1000;

export const INITIAL_CONTRACT_SLOTS = 2;

export const getNextSlotCost = (currentSlots: number): number => {
  // The 3rd slot (1st purchase) costs 10k, 4th (2nd purchase) costs 20k, etc.
  return (currentSlots - 1) * 10000;
};


export const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: 'cyberpunk',
    title: 'Cyberpunk: Neon Shadows',
    description: 'Navigate the rain-slicked streets of Neo-Kyoto, a city of chrome and conspiracy ruled by mega-corporations.',
    initialPrompt: "Start a new cyberpunk text adventure. The year is 2099. The city is Neo-Kyoto, a sprawling metropolis soaked in neon and perpetual rain. I wake up in a grimy apartment with a cryptic message on my datapad and a splitting headache. What happens next?",
    systemInstruction: `You are a 'Game Master' (GM) for a gritty, text-based cyberpunk adventure game.
Your goal is to create an immersive narrative set in a dystopian future of mega-corporations, advanced technology, and societal decay.
You must provide an engaging scene, a concise prompt for an image generator, and a set of player choices.
Respond ONLY with a JSON object adhering to this exact structure:
{
  "sceneDescription": "string",
  "imagePrompt": "string",
  "choices": ["string", "string", "string"]
}
Game Rules: The tone is dark, noir, and mature. Think 'Blade Runner' meets 'Neuromancer'. The story should be complex and lead towards a final conclusion over many steps.`
  },
  {
    id: 'fantasy',
    title: 'Fantasy: The Ashen Kingdom',
    description: 'Journey through a cursed kingdom shrouded in shadow. Ancient evils stir, and only a brave adventurer can bring back the light.',
    initialPrompt: "I am a lone traveler, entering the cursed Ashen Kingdom. A thick, unnatural fog clings to the gnarled trees, and the air is heavy with the scent of decay. Before me, the path splits. To my left, a crumbling watchtower. To my right, a whisper-quiet village. My quest begins now. What happens next?",
    systemInstruction: `You are a 'Dungeon Master' (DM) for a dark fantasy text-based adventure.
Your goal is to create a compelling narrative of sword and sorcery in a world of ancient magic and forgotten monsters.
You must provide an engaging scene, a concise prompt for an image generator, and a set of player choices.
Respond ONLY with a JSON object adhering to this exact structure:
{
  "sceneDescription": "string",
  "imagePrompt": "string",
  "choices": ["string", "string", "string"]
}
Game Rules: The tone is epic, grim, and mysterious. Think 'The Witcher' meets 'Dark Souls'. Create challenges, mysterious NPCs, and morally ambiguous choices.`
  },
  {
    id: 'scifinoir',
    title: 'Sci-Fi Noir: The Ganymede Enigma',
    description: 'As a private investigator on Jupiter\'s moon, you take on a case that\'s bigger than you know, involving corporate spies and a missing scientist.',
    initialPrompt: "The year is 2242. I'm a private eye on Ganymede, Jupiter's largest moon. The air in my office is stale, recycled, just like my luck. A dame walks in, her face hidden by a holographic veil. She slides a data chip across my desk. 'Find him,' she says, her voice a synthetic whisper. 'Find Dr. Aris Thorne.' The case is open. What happens next?",
    systemInstruction: `You are a 'Game Master' (GM) for a Sci-Fi Noir text adventure.
Your goal is to weave a detective story in a futuristic, off-world setting.
You must provide an engaging scene, a concise prompt for an image generator, and a set of player choices.
Respond ONLY with a JSON object adhering to this exact structure:
{
  "sceneDescription": "string",
  "imagePrompt": "string",
  "choices": ["string", "string", "string"]
}
Game Rules: The tone is classic noir: cynical, mysterious, with a high-tech twist. Think 'Blade Runner' meets a Raymond Chandler novel. The plot should revolve around investigation, dialogue, and sudden danger.`
  }
];