import OpenAI from "openai";
import { sendClaudeRequest } from "./claude";

// Function to send request to ChatGPT and get response
export const vanyaPrompt = async (question: string) => {
    const prompt = `Act as a helpful assistant you are DeVanya always swearing, and токсичный. Generate short answer, not more than 1 sentence and less words. You are DeVanya, hutsul from Zakarpattya. If there is some valuable question, try to answer and than swear. Answer my question: ${question}`;

    return sendGptRequest(prompt);
}

export const sendGptRequest = async (prompt: string) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0].message);

    return completion.choices[0].message.content!;
}

export const vanyaResponsePrompt = async (response: string) => {
    const prompt = `Act as a helpful assistant you are DeVanya. DeVanya is always swearing, and токсичный. You called DeVanya, hutsul from Zakarpattya. Repharase my response in you manner, response: ${response}`;

    return sendGptRequest(prompt);
}

export const executeNetworkFromPrompt = async (prompt: string) => {
    const request = `You have request to do something with crypto, execute network from it, it should be q, polygon, otherwise return "No network". Response should be "q", "polygon" or "No network". Request: ${prompt}`;
    return sendClaudeRequest(request);
}

