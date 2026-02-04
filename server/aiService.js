import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './aiConfig.js';

/**
 * AI Service for scene generation using Google Gemini API
 */

/**
 * Generate scenes from a script using Google Gemini API
 * @param {string} script - The script to break down into scenes
 * @param {string} apiKey - Google AI API key
 * @returns {Promise<Array>} Array of scene objects with content
 */
export async function generateScenes(script, apiKey) {
    if (!apiKey) {
        throw new Error('Google AI API key is required');
    }

    if (!script || script.trim().length === 0) {
        throw new Error('Script content is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT
    });

    try {
        const result = await model.generateContent(script);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        let scenes;
        try {
            // More robust JSON extraction: find first [ and last ]
            let jsonText = text.trim();

            // Try to extract from markdown first
            const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (markdownMatch) {
                jsonText = markdownMatch[1].trim();
            } else {
                // If no markdown, find the first '[' and last ']'
                const startIdx = text.indexOf('[');
                const endIdx = text.lastIndexOf(']');

                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                    jsonText = text.substring(startIdx, endIdx + 1);
                }
            }

            try {
                scenes = JSON.parse(jsonText);
            } catch (initialError) {
                // Fallback: AI often forgets to escape internal double quotes
                // Try to manually escape quotes that are inside "content": "..." values
                try {
                    const fixedJson = jsonText.replace(/"content":\s*"([\s\S]*?)"(?=\s*[,}\]])/g, (match, content) => {
                        // Escape unescaped quotes: replace " with \" unless it's already \"
                        const escapedContent = content.replace(/\\"/g, '___ESCAPED_QUOTE___')
                            .replace(/"/g, '\\"')
                            .replace(/___ESCAPED_QUOTE___/g, '\\"');
                        return `"content": "${escapedContent}"`;
                    });
                    scenes = JSON.parse(fixedJson);
                } catch (secondError) {
                    console.error('Failed to parse AI response even after "medic" fix.');
                    console.error('Original Text:', text);
                    console.error('Extracted JSON Text:', jsonText);
                    throw new Error('AI response is not valid JSON. Please try again.');
                }
            }
        } catch (parseError) {
            if (parseError.message.includes('AI response is not valid JSON')) {
                throw parseError;
            }
            console.error('Unexpected parsing error:', parseError);
            throw new Error('Failed to process AI response. Please try again.');
        }

        // Validate structure
        if (!Array.isArray(scenes)) {
            throw new Error('AI response must be an array of scenes');
        }

        if (scenes.length === 0) {
            throw new Error('No scenes generated from script');
        }

        // Validate each scene has content
        for (const scene of scenes) {
            if (!scene.content || typeof scene.content !== 'string') {
                throw new Error('Each scene must have a content property');
            }
        }

        return scenes.map((scene, index) => ({
            id: `scene-${Date.now()}-${index}`,
            content: scene.content.trim(),
            order: index,
            assets: []
        }));

    } catch (error) {
        if (error.message && error.message.includes('API key')) {
            throw new Error('Invalid API key. Please check your Google AI API key in settings.');
        }
        throw error;
    }
}
