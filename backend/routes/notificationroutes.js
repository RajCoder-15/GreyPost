
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const notificationModel = require("../models/notification");
const isLoggedIn = require("../middleware/authmiddleware");

router.get("/", isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.userid;

        const notifications = await notificationModel
            .find({ recipient: userId })
            .populate("sender", "username name profilepic")
            .populate("post", "content image")
            .populate("comment", "content")
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
});

router.get("/unread-count", isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.userid;

        const count = await notificationModel.countDocuments({
            recipient: userId,
            isRead: false
        });

        return res.status(200).json({ count });
    } catch (error) {
        console.error("Unread count error:", error);
        return res.status(500).json({
            message: "Failed to fetch unread count"
        });
    }
});

router.patch("/read-all", isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.userid;

        const result = await notificationModel.updateMany(
            {
                recipient: userId,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        return res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Mark all notifications error:", error);
        return res.status(500).json({
            message: "Failed to update notifications"
        });
    }
});

router.patch("/:notificationId/read", isLoggedIn, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userid;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const notification = await notificationModel.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: userId
            },
            {
                $set: { isRead: true }
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Mark notification error:", error);
        return res.status(500).json({
            message: "Failed to update notification"
        });
    }
});

module.exports = router;
