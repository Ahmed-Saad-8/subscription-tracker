import mongoose from "mongoose";

const FavoriteShema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
    },
    productid: {
      type: String,
      required: true,
    },
    favoriteStatus: {
      type: String,
      enum: ["added", "removed"],
    },
  },
  {
    collection: "favorite",
    timestamps: true,
  }
);

const Favorite = mongoose.model("Favorite", FavoriteShema);
export default Favorite;
