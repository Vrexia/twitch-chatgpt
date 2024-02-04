// Import modules
import OpenAI from "openai";

export class OpenAIOperations {
    constructor(file_context, openai_key, model_name, history_length) {
        this.messages = [{ role: "system", content: file_context }];
        this.openai = new OpenAI({
            apiKey: openai_key,
        });
        this.model_name = model_name;
        this.history_length = history_length;
    }

    check_history_length() {
        console.log(`Conversations in History: ${((this.messages.length / 2) - 1)}/${this.history_length}`);
        
        // Check if the total number of messages exceeds the allowed history length
        if (this.messages.length > ((this.history_length * 2) + 1)) {
            console.log('Message amount in history exceeded. Removing oldest user and agent messages.');

            // Preserve the most recent user message and the last agent response
            this.messages = [this.messages[0], this.messages[this.messages.length - 1]];
        }
    }

    async make_openai_call(text) {
        try {
            // Clear previous user messages
            this.messages = [{ role: "system", content: this.messages[0].content }];

            // Add user message to messages
            this.messages.push({ role: "user", content: text });

            // Check if message history is exceeded
            this.check_history_length();

            // Use await to get the response from OpenAI
            const response = await this.openai.chat.completions.create({
                model: this.model_name,
                messages: this.messages,
                temperature: 1,
                max_tokens: 75,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });

            // Check if response has choices
            if (response.choices) {
                let agent_response = response.choices[0].message.content;
                console.log(`Agent Response: ${agent_response}`);
                
                // Return the agent response
                return agent_response;
            } else {
                // Handle the case when no choices are returned
                throw new Error("No choices returned from OpenAI");
            }
        } catch (error) {
            // Handle any errors that may occur
            console.error(error);
            return "Sorry, something went wrong. Please try again later.";
        }
    }

    async handleUserPromptAndSendToChat(userPrompt) {
        try {
            // Make the OpenAI call
            const agentResponse = await this.make_openai_call(userPrompt);

            // Send the agent response to Twitch chat
            // Add your Twitch chat integration code here
            console.log("Sending response to Twitch chat:", agentResponse);

            // If you have Twitch chat integration code, replace the console.log with your code to send the response to Twitch chat
        } catch (error) {
            console.error(error);
        }
    }
}
