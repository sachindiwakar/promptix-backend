import OpenAI from "openai";
import { prisma } from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { PDFParse } from "pdf-parse";

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

export const generateImage = async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt, publish } = req.body;

    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(400).json({
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      },
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await prisma.creations.create({
      data: {
        user_id: userId,
        prompt,
        content: secure_url,
        type: "image",
        publish,
      },
    });

    res.json({ secure_url });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.userId;
    const { image } = req.file;

    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(400).json({
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          backgournd_removal: "remove_the_background",
        },
      ],
    });

    await prisma.creations.create({
      data: {
        user_id: userId,
        prompt: "Remove background from image",
        content: secure_url,
        type: "image",
      },
    });

    res.json({ secure_url });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = req.userId;
    const { object } = req.body;
    const { image } = req.file;

    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(400).json({
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await prisma.creations.create({
      data: {
        user_id: userId,
        prompt: `Removed ${object} from image`,
        content: imageUrl,
        type: "image",
      },
    });

    res.json({ imageUrl });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};

export const reviewResume = async (req, res) => {
  try {
    const userId = req.userId;
    const resume = req.file;

    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(400).json({
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      res
        .status(400)
        .json({ message: "Resume file size exceed allowed file size (5 MB)." });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const parser = new PDFParse({
      data: dataBuffer,
    });

    const pdfData = await parser.getText();

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await prisma.creations.create({
      data: {
        user_id: userId,
        prompt: "Review the uploaded resume.",
        content,
        type: "review-resume",
      },
    });

    res.json({ content });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      message: error.message,
    });
  }
};
