// app/api/generate-recipe/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { ingredients } = await req.json();

    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const apiKey = process.env.OPENROUTER_API_KEY; // Ensure this is set in your environment variables

    const response = await axios.post(
      apiUrl,
      {
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: `Generate a recipe using the following ingredients: ${ingredients.join(
              ", "
            )}.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      recipe: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error(
      "Error generating recipe:",
      error.response ? error.response.data : error.message
    );
    return NextResponse.json(
      { error: "Error generating recipe" },
      { status: 500 }
    );
  }
}
