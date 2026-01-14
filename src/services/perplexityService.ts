export interface PerplexityMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ClarificationResult {
    problemStatement: string;
    problemContext: string; // Deprecated but kept for type compatibility if needed, though we removed it from UI
    targetUsers: string;
    userPainPoints: string[];
    solutionDirection: string;
    keyFeatures: string[];
    assumptionsRisks: string;
    successMetrics: string[];
    technicalConsiderations: string;
    nextSteps: string[];
}

export async function generateClarificationWithPerplexity(
    apiKey: string,
    problemDescription: string
): Promise<ClarificationResult> {
    const url = 'https://api.perplexity.ai/chat/completions';

    const systemPrompt = `
    You are an expert product manager and problem solver. Your goal is to clarify a messy problem description into a structured, professional breakdown.
    
    You MUST output ONLY valid JSON.
    The JSON object must have the following keys:
    - problemStatement: A refined, detailed problem statement (>300 characters).
    - targetUsers: A specific description of who is affected.
    - userPainPoints: An array of strings describing specific frustrations.
    - solutionDirection: A high-level proposal for how to solve it.
    - keyFeatures: An array of strings listing core features.
    - assumptionsRisks: A text block describing assumptions and potential risks.
    - successMetrics: An array of strings listing specific metrics to measure success.
    - technicalConsiderations: A text block regarding technical implementation details.
    - nextSteps: An array of strings listing immediate next steps.

    Do not include "problemContext".
  `;

    const messages: PerplexityMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this problem: "${problemDescription}"` }
    ];

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'sonar-pro', // Updated to a valid model identifier
            messages: messages,
            temperature: 0.2 // Low temperature for more deterministic/structured output
        })
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Perplexity API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // improved JSON cleanup
        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedContent) as ClarificationResult;

    } catch (error) {
        console.error("Error calling Perplexity API:", error);
        throw error;
    }
}
