// Import modules
import OpenAI from "openai";

export class OpenAIOperations {
    constructor(file_context, openai_key, model_name, history_length) {
        this.messages = [{role: "system", content: file_context}];
        this.openai = new OpenAI({
            apiKey: openai_key,
        });
        this.model_name = model_name;
        this.history_length = history_length;
    }

    check_history_length() {
        // Use template literals to concatenate strings
        console.log(`Conversations in History: ${((this.messages.length / 2) -1)}/${this.history_length}`);
        if(this.messages.length > ((this.history_length * 2) + 1)) {
            console.log('Message amount in history exceeded. Removing oldest user and agent messages.');
            this.messages.splice(1,2);
        }
    }

async make_openai_call(text, maxTokens = 50) {
    try {
        // Add user message to messages
        this.messages.push({ role: "user", content: text });

        // Check if message history is exceeded
        this.check_history_length();

        // Use await to get the response from OpenAI
        const response = await this.openai.chat.completions.create({
            model: this.model_name,
            messages: this.messages,
            temperature: 1,
            max_tokens: maxTokens + 25, // Add extra tokens to ensure the last sentence is complete
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        // Check if response has choices
        if (response.choices) {
            let agent_response = response.choices[0].message.content;

            // Truncate the response to the last complete sentence within the token limit
            const sentences = agent_response.split(/[.!?]/);
            let truncatedResponse = sentences[0];
            let totalTokens = truncatedResponse.split(' ').length;
            for (let i = 1; i < sentences.length; i++) {
                if (totalTokens + sentences[i].split(' ').length <= maxTokens) {
                    truncatedResponse += sentences[i] + sentences[i].match(/[.!?]/) || '';
                    totalTokens += sentences[i].split(' ').length;
                } else {
                    break;
                }
            }

            console.log(`Agent Response: ${truncatedResponse}`);
            // Replace all messages with the latest assistant response
            this.messages = [{ role: "assistant", content: truncatedResponse }];
            return truncatedResponse;
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

    async make_openai_call_completion(text) {
        try {
            const response = await this.openai.completions.create({
              model: "gpt-3.5-turbo",
              prompt: text,
              temperature: 1,
              max_tokens: 50,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            });

            // Check if response has choices
            if (response.choices) {
                let agent_response = response.choices[0].text;
                console.log(`Agent Response: ${agent_response}`);
                return agent_response;
            } else {
                // Handle the case when no choices are returned
                throw new Error("No choices returned from openai");
            }
        } catch (error) {
            // Handle any errors that may occur
            console.error(error);
            return "Sorry, something went wrong. Please try again later.";
        }
    }
}
