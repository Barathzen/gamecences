import { AdventureStep, StoryCategory } from '../types';

const PROXY_ENDPOINT = '/.netlify/functions/proxy';

/**
 * A helper function to call our Netlify proxy function.
 * @param action The specific API action to perform.
 * @param payload The data required for that action.
 * @returns The JSON response from the proxy.
 */
async function callProxy(action: string, payload: object) {
  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || `Server request failed with status ${response.status}`);
  }

  return responseData;
}


/**
 * Generates the next step in the adventure by calling the proxy.
 */
export async function generateAdventureStep(
  promptContent: string,
  systemInstruction: string
): Promise<AdventureStep> {
  const data = await callProxy('generateAdventureStep', { promptContent, systemInstruction });
   if (
      data &&
      typeof data.sceneDescription === 'string' &&
      typeof data.imagePrompt === 'string' &&
      Array.isArray(data.choices) &&
      data.choices.every((choice: unknown) => typeof choice === 'string')
    ) {
      return data as AdventureStep;
    } else {
      console.error("Parsed JSON does not match AdventureStep structure:", data);
      throw new Error("Received invalid data structure for adventure step.");
    }
}

/**
 * Generates an image by calling the proxy.
 */
export async function generateAdventureImage(
  prompt: string, 
  storyCategory: string = 'default'
): Promise<string> {
  const { imageUrl } = await callProxy('generateAdventureImage', { prompt, storyCategory });
  if (typeof imageUrl !== 'string') {
    throw new Error("Received invalid data structure for image URL.");
  }
  return imageUrl;
}


/**
 * Generates a new, unique story category by calling the proxy.
 */
export async function generateNewStoryCategory(
  existingTitles: string[]
): Promise<StoryCategory> {
    const data = await callProxy('generateNewStoryCategory', { existingTitles });
     if (
      data &&
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      typeof data.description === 'string' &&
      typeof data.initialPrompt === 'string' &&
      typeof data.systemInstruction === 'string'
    ) {
      return data as StoryCategory;
    } else {
      console.error("Parsed JSON does not match StoryCategory structure:", data);
      throw new Error("Received invalid data structure for new story category.");
    }
}
