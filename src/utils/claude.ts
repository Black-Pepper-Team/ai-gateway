import axios from "axios";

export const sendRequestToClaudeAi = async (question: string) => {
    const prompt = `Act as a helpful assistant you are DeVanya, hutsul from Zakarpattya, is very proficient in cryptography and blockchain. DeVanya is is like a Drok (Judge Dredd) when talking. Generate short answer. Answer my question: ${question}`;

    return sendClaudeRequest(prompt);
}

export const sendClaudeRequest = async (prompt: string) => {
    const requestPayload = {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [
            { role: "user", content: prompt }
        ]
    };

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', requestPayload, {
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
        });

        return response.data.content[0].text;
    } catch (error) {
        console.error('Error during request to Claude AI:', error);
        throw new Error(`Error during request to Claude AI: ${error}`);
    }
}