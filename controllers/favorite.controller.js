import Favorite from "../models/favorite.model.js";

export const addfavorite = async (req, res) => {
  try {
    const { userid, productid } = req.body;

    if (!userid || !productid) {
      return res.status(400).json({
        success: false,
        message: "userid and productid are required",
      });
    }

    // Check if favorite already exists
    let existingFavorite = await Favorite.findOne({ userid, productid });

    if (existingFavorite) {
      // If already added, you can ignore or return existing
      return res.status(200).json({
        success: true,
        message: "Favorite already exists",
        data: existingFavorite,
      });
    }

    // Create new favorite
    const newFavorite = await Favorite.create({
      userid,
      productid,
      favoriteStatus: "added",
    });

    res.status(201).json({
      success: true,
      message: "Favorite added successfully",
      data: newFavorite,
    });
  } catch (error) {
    console.error("Failed to add favorite:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getfavorits = async (req, res) => {
  try {
    const userId = req.headers["user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const favorites = await Favorite.find({
      userid: userId, // <-- FIXED HERE
      favoriteStatus: "added",
    });

    res.status(200).json({
      success: true,
      message: "User favorites fetched successfully",
      data: favorites,
    });
  } catch (error) {
    console.error("Failed to fetch favorites", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching favorites",
    });
  }
};

export const deletefavorite = async (req, res) => {
  const favoriteid = req.params.id;

  try {
    const favorite = await Favorite.findById(favoriteid);
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    // delete the specific favorite
    await Favorite.deleteOne({ _id: favoriteid });

    res.status(200).json({
      success: true,
      message: "Favorite successfully deleted",
    });
  } catch (error) {
    console.error("Failed to delete favorite", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting favorite",
    });
  }
};
