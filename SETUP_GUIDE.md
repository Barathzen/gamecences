# Enhanced Image Generation Setup Guide

## Overview
Your game now uses the best free Hugging Face models for high-quality image generation based on your story content. This system provides multiple models with automatic fallbacks and real-time configuration.

## 🚀 Quick Setup

### 1. Get Your Hugging Face API Key
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy your token

### 2. Configure Environment Variables
Create a `.env` file in your project root:

```env
# Required: Hugging Face API Key
HF_API_KEY=your_hugging_face_token_here
HF_TOKEN=your_hugging_face_token_here

# Required: Google Gemini API Key (for story generation)
API_KEY=your_google_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

## 🎨 Available Models

### FLUX.1-schnell (Default for Speed)
- **Best for**: Real-time generation, cyberpunk/sci-fi scenes
- **Quality**: High
- **Speed**: Fast (10-15 seconds)
- **Free Tier**: ✅ Unlimited

### Stable Diffusion 3.5 Large (Best Quality)
- **Best for**: Detailed, photorealistic images
- **Quality**: Ultra
- **Speed**: Medium (20-30 seconds)
- **Free Tier**: ✅ Limited daily usage

### Playground v2.5 (Best for Fantasy)
- **Best for**: Artistic, fantasy, aesthetic images
- **Quality**: High
- **Speed**: Medium (15-25 seconds)
- **Free Tier**: ✅ Good daily allowance

### SDXL Turbo (Fastest)
- **Best for**: Testing, rapid prototyping
- **Quality**: Medium
- **Speed**: Ultra-fast (5-10 seconds)
- **Free Tier**: ✅ Unlimited

## ⚙️ Real-Time Configuration

### Access Image Settings
1. Start a game adventure
2. Click the ⚙️ icon in the top-right corner
3. Configure your preferences:
   - **Priority**: Speed vs Quality balance
   - **Model**: Manual selection or auto-selection
   - **Enhancement Level**: Basic, Enhanced, or Premium prompts

### Priority Modes
- **Speed**: Prioritizes fast generation (FLUX.1-schnell)
- **Balanced**: Optimal model per story type
- **Quality**: Best possible images (SD 3.5 Large)

### Enhancement Levels
- **Basic**: Simple prompts, faster generation
- **Enhanced**: Style-specific prompts with quality modifiers
- **Premium**: Maximum quality with detailed prompts

## 📊 Model Selection Logic

### Automatic Selection (Recommended)
- **Cyberpunk/Sci-Fi**: FLUX.1-schnell
- **Fantasy**: Playground v2.5
- **General**: Stable Diffusion 3.5 Large

### Manual Override
You can manually select any model for any story type through the settings panel.

## 🛠️ Advanced Configuration

### Modify Model Parameters
Edit `services/imageService.ts` to adjust:
- Image dimensions
- Guidance scale
- Inference steps
- Scheduler types

### Add New Models
1. Find a compatible model on Hugging Face
2. Add it to `IMAGE_MODELS` in `imageService.ts`
3. Update the selection logic if needed

### Custom Style Prompts
Modify `STYLE_PROMPTS` in `imageService.ts` to customize the artistic style for each story genre.

## 🔧 Troubleshooting

### Model Loading Issues
- **503 Errors**: Model is loading (cold start) - retry in 30 seconds
- **Rate Limits**: Switch to a different model or wait
- **Authentication Errors**: Check your HF_API_KEY

### Image Quality Issues
- Try different enhancement levels
- Switch to higher quality models
- Check if the story prompt is clear and descriptive

### Performance Issues
- Use "Speed" priority for faster generation
- Enable auto-selection for optimal model routing
- Consider using SDXL Turbo for testing

## 📈 Usage Tips

### For Best Results
1. **Let auto-selection work**: It chooses the optimal model per story type
2. **Use Enhanced level**: Good balance of quality and speed
3. **Monitor the fallback system**: If one model fails, another takes over

### For Development/Testing
1. **Use Speed priority**: Faster iteration
2. **Enable Basic enhancement**: Simpler prompts
3. **Use SDXL Turbo**: Ultra-fast generation

### For Production/Showcase
1. **Use Quality priority**: Best possible images
2. **Enable Premium enhancement**: Maximum detail
3. **Use SD 3.5 Large**: Highest quality output

## 🎯 Model Recommendations by Story Type

| Story Type | Recommended Model | Priority | Enhancement |
|------------|------------------|----------|-------------|
| Cyberpunk | FLUX.1-schnell | Balanced | Enhanced |
| Fantasy | Playground v2.5 | Quality | Premium |
| Sci-Fi Noir | FLUX.1-schnell | Balanced | Enhanced |
| Horror/Dark | SD 3.5 Large | Quality | Enhanced |
| Adventure | Playground v2.5 | Balanced | Enhanced |

## 🔄 Fallback System

The system automatically handles failures:
1. **Primary model fails** → Try fallback models
2. **All models fail** → Use placeholder image
3. **Rate limited** → Automatically retry with different model

## 💡 Pro Tips

1. **Monitor console logs** to see which models are being used
2. **Experiment with manual selection** for different artistic styles
3. **Use the settings panel** to find your preferred configuration
4. **Save your favorite settings** by noting the configuration
5. **Test different enhancement levels** to find the sweet spot

## 🚀 Deployment Considerations

### Netlify Functions
- Ensure environment variables are set in Netlify dashboard
- Functions timeout after 10 seconds on free tier (upgrade for longer generation)

### Vercel
- Add environment variables in project settings
- Consider upgrading for longer function timeouts

### Self-hosted
- Ensure your server can handle the API calls
- Consider implementing request queuing for multiple users

---

**Happy Gaming! 🎮**

Your enhanced image generation system is now ready to create stunning visuals for your story adventures.
