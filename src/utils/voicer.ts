import axios from "axios";

export const sendRequestToVoiceChecker = async (text: string) => {
    const request = {
        "data": {
            "id": 1,
            "type": "EXTRACT",
            "attributes": {
                "text": text,
            }
        }
    };
    const response = await axios.post('https://f5ed-149-88-20-203.ngrok-free.app/integrations/voice-cloning/generate-base64', request);
    const data = response.data.data.attributes.file;
    return data;
}
