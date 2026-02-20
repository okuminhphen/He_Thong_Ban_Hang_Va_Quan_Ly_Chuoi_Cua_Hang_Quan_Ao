import { Server } from "socket.io";
import db from "./models/index.js"; // Sequelize models

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        // --- JOIN ROOM ---
        socket.on("join", (conversationId) => {
            socket.join(conversationId);
        });

        // --- NHẬN TIN NHẮN ---
        socket.on("sendMessage", async (data) => {
            const { conversationId, senderId, message, senderRole } = data;
            if (!conversationId || !senderId || !message) return;

            try {
                // Lưu DB - Message model có field "message" và "senderRole"
                const newMessage = await db.Message.create({
                    conversationId,
                    senderId,
                    senderRole: senderRole || "user",
                    message: message, // Map content -> message field
                });

                // Emit tới đúng room
                io.to(conversationId).emit("newMessage", newMessage);
            } catch (error) {
                console.error("❌ Error saving message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });
};

export const getIO = () => io;
