import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import chalk from 'chalk';
import ora from 'ora';
import prompt from 'prompt-sync';
import dotenv from 'dotenv';
dotenv.config();

const promptSync = prompt();

const API_KEY = process.env.API_KEY;
const MODEL_NAME = process.env.MODEL;
const GENERATION_CONFIG = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function runChat() {
    const spinner = ora('Initializing chat...').start();
    if (API_KEY === undefined) {
        spinner.stop();
        console.log(chalk.redBright('UNDEFINED API KEY'));
        process.exit(1);
    }
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const chat = model.startChat({
            generationConfig: GENERATION_CONFIG,
            safetySettings: SAFETY_SETTINGS,
            history: [],
        });

        spinner.stop();

        while (true) {
            const userInput = promptSync(chalk.green('You: '));
            if (userInput.toLowerCase() === 'exit') {
                console.log(chalk.yellow('Goodbye!'));
                process.exit(0);
            }
            const spinner = ora('Processing...').start();
            const result = await chat.sendMessage(userInput);
            if (result.error) {
                spinner.stop();
                console.error(chalk.red('Him Error:'), result.error.message);
                continue;
            }
            spinner.stop();
            const response = result.response.text();
            console.log(chalk.blue('Him:'), response);
        }

    } catch (error) {
        spinner.stop();
        console.error(chalk.red('An error occurred:'), error.message);
        process.exit(1);
    }
}

runChat();
