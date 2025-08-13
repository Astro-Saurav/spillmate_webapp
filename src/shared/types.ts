// File: src/types.ts

/**
 * Defines the shape of a single chat message.
 */
export interface Message {
  /** A unique identifier for the message, useful for React keys. */
  id: string;
  /** The author of the message, either the user or the AI assistant. */
  role: 'user' | 'assistant';
  /** The text content of the message. */
  content: string;
}

export interface Conversation {
  /** A unique identifier for the entire conversation. */
  id: string;
  /** A short title for displaying in the chat history. */
  title: string;
  /** An array containing all the messages in this conversation. */
  messages: Message[];
}

export type BotState = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * Defines the possible moods derived from a conversation,
 * used for the bot's avatar emoji.
 */
export type MoodState = 'neutral' | 'positive' | 'negative';

/**
 * An interface to help TypeScript understand the browser's Speech Recognition API,
 * which can have different vendor prefixes (like `webkit`).
 */
export interface IWindow extends Window {
  /** Standard Speech Recognition API. */
  SpeechRecognition?: any;
  /** Vendor-prefixed version for browsers like Chrome. */
  webkitSpeechRecognition?: any;
}