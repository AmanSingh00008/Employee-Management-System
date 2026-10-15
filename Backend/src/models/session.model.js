import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        refreshTokenHash: {
            type: String,
            required: true,
        },

        ip: {
            type: String,
            default: null,
        },

        userAgent: {
            type: String,
            default: null,
        },

        revoked: {
            type: Boolean,
            default: false,
        },

        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    },
    {
        timestamps: true,
    }
);

// Auto-expire documents from MongoDB after expiresAt
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Session", sessionSchema);
