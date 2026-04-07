import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: '*', // In production, specify the exact origin
            methods: ['GET', 'POST', 'PATCH']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('🔌[socket]: User connected', socket.id);

        socket.on('join', (room: string) => {
            socket.join(room);
            console.log(`🔌[socket]: User ${socket.id} joined room ${room}`);
        });

        socket.on('joinGroup', (groupId: string) => {
            socket.join(`group_${groupId}`);
            console.log(`🔌[socket]: User ${socket.id} joined group room group_${groupId}`);
        });

        socket.on('joinOrder', (orderId: string) => {
            socket.join(`order_${orderId}`);
            console.log(`🔌[socket]: User ${socket.id} joined order room order_${orderId}`);
        });

        socket.on('runner:update_location', (data: { orderId: string, lat: number, lng: number }) => {
            io.to(`order_${data.orderId}`).emit('runner:location_updated', data);
        });

        socket.on('disconnect', () => {
            console.log('🔌[socket]: User disconnected', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

import { Notification } from './models/Notification';

export const emitOrderUpdate = async (order: any) => {
    if (!io) return;

    // Helper to create and emit notification
    const notify = async (userId: string, title: string, message: string) => {
        try {
            const notification = new Notification({
                userId,
                type: 'order_update',
                title,
                message,
                link: `/orders/${order._id}`
            });
            await notification.save();
            io.to(`user_${userId}`).emit('notification', notification);
        } catch (err) {
            console.error('Failed to save notification', err);
        }
    };

    // Emit to relevant rooms
    io.to(`user_${order.student}`).emit('orderUpdate', order);
    await notify(order.student.toString(), 'Order Update', `Your order "${order.title}" is now ${order.status}`);

    if (order.runner) {
        io.to(`user_${order.runner}`).emit('orderUpdate', order);
        await notify(order.runner.toString(), 'Delivery Task', `Order "${order.title}" status changed to ${order.status}`);
    }

    if (order.vendor) {
        io.to(`vendor_${order.vendor}`).emit('orderUpdate', order);
    }

    // Also notify all runners of a new/available order if status is pending
    if (order.status === 'pending') {
        io.to('runners').emit('newOrder', order);
    }
};

export const emitGroupUpdate = (group: any) => {
    if (!io) return;
    io.to(`group_${group._id}`).emit('groupUpdate', group);
};
