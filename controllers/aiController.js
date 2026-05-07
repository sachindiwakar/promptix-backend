import OpenAI from "openai";
import { prisma } from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const userId = req.userId;

    const { prompt, length } = req.body;

    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(400).json({
        message: "Limit reached. Upgrade to continue",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: length,
    });

    const content = response.choices[0].message.content;

    await prisma.creations.create({
      data: {
        user_id: userId,
        prompt,
        content,
        type: "article",
      },
    });

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ content });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt } = req.body;

    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(400).json({
        message: "Limit reached. Upgrade to continue",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await prisma.creations.create({
      data: {
        user_id: userId,
        prompt,
        content,
        type: "blog-title",
      },
    });

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ content });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};
