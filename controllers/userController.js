import { prisma } from "../config/db.js";

export const getUserCreations = async (req, res) => {
  try {
    const userId = req.userId;

    const creations = await prisma.creations.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({ creations });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await prisma.creations.findMany({
      where: {
        publish: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({ creations });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    const creation = await prisma.creations.findUnique({
      where: { id },
    });

    if (!creation) {
      return res.status(400).json({
        message: "Creation Not Found!",
      });
    }

    const currentLikes = creation.likes || [];
    const userIdStr = userId.toString();

    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);

      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];

      message = "Creation Liked";
    }

    await prisma.creations.update({
      where: { id },
      data: {
        likes: updatedLikes,
      },
    });

    res.status(200).json({
      message,
      likes: updatedLikes,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
