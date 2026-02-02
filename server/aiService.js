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
            // Try to extract JSON from markdown code blocks if present
            const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : text.trim();

            scenes = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            throw new Error('AI response is not valid JSON. Please try again.');
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
            content: scene.content.trim(),
            order: index
        }));

    } catch (error) {
        if (error.message && error.message.includes('API key')) {
            throw new Error('Invalid API key. Please check your Google AI API key in settings.');
        }
        throw error;
    }
}
