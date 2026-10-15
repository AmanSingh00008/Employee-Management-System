
import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: [true, "Asset code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: String,
      enum: [
        "laptop",
        "desktop",
        "monitor",
        "keyboard",
        "mouse",
        "phone",
        "tablet",
        "other",
      ],
      required: true,
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    modelNumber: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    serialNumber: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },

    purchaseDate: {
      type: Date,
      default: null,
    },

    purchaseCost: {
      type: Number,
      min: 0,
      default: null,
    },

    status: {
      type: String,
      enum: ["available", "assigned", "maintenance", "retired", "lost"],
      default: "available",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

assetSchema.index({ category: 1, status: 1 });

export const Asset = mongoose.model("Asset", assetSchema);
