export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type BotState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type MoodState = 'neutral' | 'positive' | 'negative';

export interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
