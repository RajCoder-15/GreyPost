
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

        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({
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

        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch unread count"
        });
    }
});


router.patch("/read-all", isLoggedIn, async (req, res) => {
    try {
        await notificationModel.updateMany(
            {
                recipient: req.user._id,
                isRead: false
            },
            {
                $set: { isRead: true }
            }
        );

        res.status(200).json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notifications" });
    }
});

router.patch("/:notificationId/read", isLoggedIn, async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const notification = await notificationModel.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: req.user._id
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

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification" });
    }
});

module.exports = router;
