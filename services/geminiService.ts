
import { GoogleGenAI, Type } from "@google/genai";
import { CourseContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const courseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A compelling and descriptive title for the course.'
    },
    introduction: {
      type: Type.STRING,
      description: 'An engaging introduction to the course topic. Should be 2-3 paragraphs. Use HTML p and strong tags for formatting.'
    },
    modules: {
      type: Type.ARRAY,
      description: 'An array of course modules. The total duration should be approximately 120 minutes.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'The title of this module.'
          },
          durationMinutes: {
            type: Type.INTEGER,
            description: 'The estimated duration of this module in minutes.'
          },
          sections: {
            type: Type.ARRAY,
            description: 'The sections within this module.',
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: 'The title of this section.'
                },
                content: {
                  type: Type.STRING,
                  description: 'Detailed didactic content for this section. Use HTML tags like <p>, <strong>, <em>, <ul>, <ol>, <li> and <code> for formatting. The content should include Tailwind CSS classes for styling, for example: `<p class=\"text-lg text-gray-300 mb-4\">`. Use classes like `text-cyan-400` for highlights, `bg-gray-800 p-4 rounded-md` for callouts. Be extensive and thorough.'
                },
                codeExample: {
                  type: Type.OBJECT,
                  description: 'An optional code example relevant to the section. Provide clean, well-commented code.',
                  properties: {
                    language: {
                      type: Type.STRING,
                      description: 'The programming language of the code snippet (e.g., javascript, python, html).'
                    },
                    code: {
                      type: Type.STRING,
                      description: 'The actual code snippet.'
                    }
                  }
                },
                imageSuggestion: {
                  type: Type.STRING,
                  description: 'An optional descriptive prompt for an illustrative image, e.g., "A diagram of the DOM tree".'
                }
              },
              required: ['title', 'content']
            }
          }
        },
        required: ['title', 'durationMinutes', 'sections']
      }
    }
  },
  required: ['title', 'introduction', 'modules']
};


export const generateCourseContent = async (topic: string): Promise<CourseContent> => {
  try {
    const systemInstruction = `You are a multi-agent AI system that creates comprehensive, 2-hour-long, didactic course websites from a single topic.
    1.  **Redator Agent**: You will first act as a content writer. Research the topic and structure a complete 2-hour lesson plan. The content must be didactic, educational, and avoid any quizzes or interactive questions for the student. The total course content should be very substantial.
    2.  **Designer Agent**: Next, as a UI/UX designer, you will format the content using HTML tags and appropriate Tailwind CSS classes to ensure it is visually appealing, professional, and highly readable. Use a dark mode theme with accent colors like cyan and teal.
    3.  **Developer Agent**: As a developer, you will provide clean, well-commented code examples where relevant to the topic.
    4.  **QA Agent**: Finally, as a QA agent, you will review the entire output to ensure it's coherent, accurate, and perfectly structured according to the required JSON schema.
    The final output must be a single, valid JSON object that strictly adheres to the provided schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a complete 2-hour course on the topic: "${topic}".`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: courseSchema,
            temperature: 0.7,
        },
    });
    
    const jsonText = response.text.trim();
    // The response should be a valid JSON string as per the schema
    const parsedContent = JSON.parse(jsonText);
    
    // Basic validation
    if (!parsedContent.title || !parsedContent.modules || parsedContent.modules.length === 0) {
        throw new Error("Generated content is missing required fields.");
    }

    return parsedContent as CourseContent;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate course content from AI model.");
  }
};
