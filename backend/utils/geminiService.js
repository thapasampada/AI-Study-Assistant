import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables')
    process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Pinned model IDs (not the "-latest" aliases) so a new release can't silently change speed or behavior.
// Override in .env with GEMINI_MODEL / GEMINI_FALLBACK_MODEL to switch without editing code.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash'
const RETRYABLE_STATUS = [429, 500, 503, 504]
const MAX_RETRIES = 3

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Single entry point for all Gemini calls.
 * Retries temporary failures with exponential backoff and switches to a
 * fallback model after the second failed attempt.
 * @param {string} prompt
 * @returns {Promise<string>} generated text
 */
const generateText = async (prompt) => {
    let model = PRIMARY_MODEL

    for (let attempt = 0; ; attempt++) {
        try {
            const startedAt = Date.now()
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            })
            console.log(`Gemini ${model} responded in ${Date.now() - startedAt}ms`)
            return response.text
        } catch (error) {
            if (!RETRYABLE_STATUS.includes(error.status) || attempt >= MAX_RETRIES) {
                throw error
            }

            if (attempt === 1) model = FALLBACK_MODEL

            const delay = 1000 * 2 ** attempt + Math.random() * 500 // ~1s, 2s, 4s
            console.warn(
                `Gemini ${error.status}. Retry ${attempt + 1}/${MAX_RETRIES} with ${model} in ${Math.round(delay)}ms`
            )
            await sleep(delay)
        }
    }
}

/**
 * Wrap a Gemini error in a friendly message while keeping the HTTP status,
 * so controllers can tell "service busy" (503) from real failures.
 */
const toServiceError = (message, error) => {
    console.error('Gemini API error:', error)
    const err = new Error(message)
    err.status = error.status
    return err
}

/**
 * Read a "KEY: value" line, tolerating markdown like "**Q:** text".
 * Returns the value, or null if the line doesn't start with that key.
 */
const readField = (line, key) => {
    const match = line.trim().match(new RegExp(`^\\**\\s*${key}\\s*:\\**\\s*(.*)$`, 'i'))
    return match ? match[1].trim() : null
}

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashCards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium or hard]
    
    Separate each flashcard with "---"
    
    Text:
    ${text.substring(0, 15000)}`

    try {
        const generatedText = await generateText(prompt)

        const flashcards = []
        const cards = generatedText.split('---').filter((c) => c.trim())

        for (const card of cards) {
            let question = '', answer = '', difficulty = 'medium'

            for (const line of card.trim().split('\n')) {
                const q = readField(line, 'Q')
                const a = readField(line, 'A')
                const d = readField(line, 'D')

                if (q !== null) question = q
                else if (a !== null) answer = a
                else if (d !== null) {
                    const diff = d.toLowerCase()
                    if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty })
            }
        }

        return flashcards.slice(0, count)
    } catch (error) {
        throw toServiceError('Failed to generate flashcards', error)
    }
}

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQUiz = async (text, numQuestions = 5) => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]
    
    Separate questions with "---"
    
    Text:
    ${text.substring(0, 15000)}`

    try {
        const generatedText = await generateText(prompt)

        const questions = []
        const questionBlocks = generatedText.split('---').filter((q) => q.trim())

        for (const block of questionBlocks) {
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium'

            for (const line of block.trim().split('\n')) {
                const q = readField(line, 'Q')
                const o = readField(line, 'O\\d')
                const c = readField(line, 'C')
                const e = readField(line, 'E')
                const d = readField(line, 'D')

                if (q !== null) question = q
                else if (o !== null) options.push(o)
                else if (c !== null) correctAnswer = c
                else if (e !== null) explanation = e
                else if (d !== null) {
                    const diff = d.toLowerCase()
                    if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty })
            }
        }

        return questions.slice(0, numQuestions)
    } catch (error) {
        throw toServiceError('Failed to generate quiz', error)
    }
}

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points,
    keep the summary clear and structured.
    
    Text:
    ${text.substring(0, 20000)}`

    try {
        return await generateText(prompt)
    } catch (error) {
        throw toServiceError('Failed to generate summary', error)
    }
}

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n')

    const prompt = `Based on the following context from a document, analyze the context and answer the user's question.
    If the answer is not in the context say so.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:`

    try {
        return await generateText(prompt)
    } catch (error) {
        throw toServiceError('Failed to process chat request', error)
    }
}

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.
    
    Context:
    ${context.substring(0, 10000)}`

    try {
        return await generateText(prompt)
    } catch (error) {
        throw toServiceError('Failed to explain concept', error)
    }
}