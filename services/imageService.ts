import { StoryCategory } from '../types';

// Available free models on Hugging Face
export const IMAGE_MODELS = {
  FLUX_SCHNELL: {
    name: 'black-forest-labs/FLUX.1-schnell',
    endpoint: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
    description: 'Fast, high-quality text-to-image generation',
    bestFor: ['quick', 'general', 'real-time'],
    dimensions: { width: 1024, height: 768 },
    qualityLevel: 'high',
    speed: 'fast'
  },
  STABLE_DIFFUSION_35: {
    name: 'stabilityai/stable-diffusion-3.5-large',
    endpoint: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large',
    description: 'Latest Stable Diffusion with superior detail',
    bestFor: ['detailed', 'realistic', 'high-quality'],
    dimensions: { width: 1024, height: 768 },
    qualityLevel: 'ultra',
    speed: 'medium'
  },
  PLAYGROUND_V25: {
    name: 'playgroundai/playground-v2.5-1024px-aesthetic',
    endpoint: 'https://api-inference.huggingface.co/models/playgroundai/playground-v2.5-1024px-aesthetic',
    description: 'Artistic model optimized for aesthetic images',
    bestFor: ['artistic', 'fantasy', 'aesthetic'],
    dimensions: { width: 1024, height: 768 },
    qualityLevel: 'high',
    speed: 'medium'
  },
  SDXL_TURBO: {
    name: 'stabilityai/sdxl-turbo',
    endpoint: 'https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo',
    description: 'Ultra-fast SDXL with good quality',
    bestFor: ['speed', 'testing', 'rapid'],
    dimensions: { width: 1024, height: 768 },
    qualityLevel: 'medium',
    speed: 'ultra-fast'
  }
} as const;

export type ModelKey = keyof typeof IMAGE_MODELS;

// Enhanced prompt templates for different story genres
export const STYLE_PROMPTS = {
  cyberpunk: {
    prefix: "cyberpunk 2077 style, neon lights, dark futuristic cityscape, rain-soaked streets, holographic displays,",
    suffix: ", high contrast, cinematic lighting, blade runner aesthetic, photorealistic, 8k quality"
  },
  fantasy: {
    prefix: "epic fantasy art, dark medieval atmosphere, mystical fog, ancient architecture, magical elements,",
    suffix: ", dramatic lighting, oil painting style, detailed textures, high fantasy aesthetic"
  },
  scifinoir: {
    prefix: "film noir style, futuristic detective story, moody lighting, space station interior, holographic interfaces,",
    suffix: ", black and white with blue accents, dramatic shadows, retro-futuristic, cinematic composition"
  },
  default: {
    prefix: "detailed digital art, atmospheric scene, dramatic composition,",
    suffix: ", professional quality, detailed textures, cinematic lighting, 8k resolution"
  }
} as const;

// Quality enhancement settings
export const QUALITY_SETTINGS = {
  ultra: {
    guidance_scale: 7.5,
    num_inference_steps: 50,
    scheduler: "DPMSolverMultistepScheduler"
  },
  high: {
    guidance_scale: 7.0,
    num_inference_steps: 30,
    scheduler: "EulerAncestralDiscreteScheduler"
  },
  medium: {
    guidance_scale: 6.0,
    num_inference_steps: 20,
    scheduler: "EulerDiscreteScheduler"
  },
  fast: {
    guidance_scale: 5.0,
    num_inference_steps: 10,
    scheduler: "LCMScheduler"
  }
} as const;

// Model selection based on story category and requirements
export function selectOptimalModel(
  storyCategory: string, 
  priority: 'speed' | 'quality' | 'balanced' = 'balanced'
): ModelKey {
  const categoryLower = storyCategory.toLowerCase();
  
  switch (priority) {
    case 'speed':
      return 'FLUX_SCHNELL';
    
    case 'quality':
      if (categoryLower.includes('fantasy') || categoryLower.includes('medieval')) {
        return 'PLAYGROUND_V25';
      }
      return 'STABLE_DIFFUSION_35';
    
    case 'balanced':
    default:
      if (categoryLower.includes('cyberpunk') || categoryLower.includes('sci')) {
        return 'FLUX_SCHNELL';
      } else if (categoryLower.includes('fantasy')) {
        return 'PLAYGROUND_V25';
      } else {
        return 'STABLE_DIFFUSION_35';
      }
  }
}

// Enhanced prompt engineering
export function enhancePrompt(
  basePrompt: string, 
  storyCategory: string,
  enhancementLevel: 'basic' | 'enhanced' | 'premium' = 'enhanced'
): string {
  const categoryKey = storyCategory.toLowerCase() as keyof typeof STYLE_PROMPTS;
  const stylePrompt = STYLE_PROMPTS[categoryKey] || STYLE_PROMPTS.default;
  
  // Clean the base prompt
  const cleanPrompt = basePrompt
    .replace(/[^\w\s,.-]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  let enhancedPrompt = `${stylePrompt.prefix} ${cleanPrompt} ${stylePrompt.suffix}`;
  
  // Add quality modifiers based on enhancement level
  switch (enhancementLevel) {
    case 'premium':
      enhancedPrompt += ", masterpiece, award-winning photography, hyper-detailed, professional composition";
      break;
    case 'enhanced':
      enhancedPrompt += ", high quality, detailed, atmospheric";
      break;
    case 'basic':
    default:
      // No additional enhancement
      break;
  }
  
  // Add negative prompts to avoid common issues
  enhancedPrompt += " | negative: blurry, low quality, distorted, text, watermark, signature";
  
  return enhancedPrompt;
}

// Image generation with fallback system
export async function generateImageWithFallback(
  prompt: string,
  storyCategory: string,
  options: {
    priority?: 'speed' | 'quality' | 'balanced';
    enhancementLevel?: 'basic' | 'enhanced' | 'premium';
    retryCount?: number;
  } = {}
): Promise<string> {
  const {
    priority = 'balanced',
    enhancementLevel = 'enhanced',
    retryCount = 2
  } = options;
  
  const enhancedPrompt = enhancePrompt(prompt, storyCategory, enhancementLevel);
  const primaryModel = selectOptimalModel(storyCategory, priority);
  
  // Try primary model first
  try {
    return await generateImageWithModel(enhancedPrompt, primaryModel);
  } catch (error) {
    console.warn(`Primary model ${primaryModel} failed:`, error);
    
    // Fallback strategy
    const fallbackModels: ModelKey[] = ['FLUX_SCHNELL', 'SDXL_TURBO'];
    
    for (const fallbackModel of fallbackModels) {
      if (fallbackModel === primaryModel) continue;
      
      try {
        console.log(`Trying fallback model: ${fallbackModel}`);
        return await generateImageWithModel(enhancedPrompt, fallbackModel);
      } catch (fallbackError) {
        console.warn(`Fallback model ${fallbackModel} failed:`, fallbackError);
      }
    }
    
    throw new Error('All image generation models failed');
  }
}

// Core image generation function
async function generateImageWithModel(
  prompt: string,
  modelKey: ModelKey
): Promise<string> {
  const model = IMAGE_MODELS[modelKey];
  const HF_API_KEY = process.env.HF_API_KEY || process.env.HF_TOKEN;
  
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }
  
  // Split prompt and negative prompt
  const [positivePrompt, negativePrompt] = prompt.split(' | negative: ');
  
  const requestBody = {
    inputs: positivePrompt.trim(),
    parameters: {
      ...model.dimensions,
      guidance_scale: QUALITY_SETTINGS[model.qualityLevel as keyof typeof QUALITY_SETTINGS].guidance_scale,
      num_inference_steps: QUALITY_SETTINGS[model.qualityLevel as keyof typeof QUALITY_SETTINGS].num_inference_steps,
      negative_prompt: negativePrompt?.trim() || "blurry, low quality, distorted, text, watermark",
      seed: Math.floor(Math.random() * 1000000)
    }
  };
  
  const response = await fetch(model.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${HF_API_KEY}`,
      "X-Use-Cache": "false" // Ensure fresh generation
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model ${model.name} failed: ${errorText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString('base64');
  
  return `data:image/png;base64,${base64Image}`;
}

// Batch image generation for story previews
export async function generateImageBatch(
  prompts: { prompt: string; storyCategory: string }[],
  options: {
    priority?: 'speed' | 'quality' | 'balanced';
    maxConcurrent?: number;
  } = {}
): Promise<string[]> {
  const { priority = 'speed', maxConcurrent = 3 } = options;
  
  const results: string[] = [];
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < prompts.length; i += maxConcurrent) {
    const batch = prompts.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(({ prompt, storyCategory }) =>
      generateImageWithFallback(prompt, storyCategory, { priority, enhancementLevel: 'basic' })
        .catch(error => {
          console.error(`Batch generation failed for prompt: ${prompt}`, error);
          return null; // Return null for failed generations
        })
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter((result): result is string => result !== null));
    
    // Small delay between batches to be respectful to the API
    if (i + maxConcurrent < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
