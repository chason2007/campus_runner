const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    auth: {
        register: async (userData: any) => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');
            if (data.token) localStorage.setItem('token', data.token);
            return data;
        },
        login: async (email: string, password: string) => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            if (data.token) localStorage.setItem('token', data.token);
            return data;
        },
        updateProfile: async (data: any) => {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
            return result;
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    },
    orders: {
        create: async (orderData: any) => {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(orderData),
            });
            return response.json();
        },
        createCheckoutSession: async (orderId: string) => {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/create-checkout-session`, {
                method: 'POST',
                headers: getHeaders(),
            });
            return response.json();
        },
        getMine: async () => {
            const response = await fetch(`${API_BASE_URL}/orders/my`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        getAvailable: async () => {
            const response = await fetch(`${API_BASE_URL}/orders/available`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        updateStatus: async (orderId: string, status: string) => {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status }),
            });
            return response.json();
        },
        reportDispute: async (orderId: string, reason: string) => {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/dispute`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ reason }),
            });
            return response.json();
        }
    },
    vendors: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/vendors`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch vendors');
            return data;
        },
        getMe: async () => {
            const response = await fetch(`${API_BASE_URL}/vendors/me`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch vendor profile');
            return data;
        },
        getById: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch vendor');
            return data;
        },
        updateMenuAvailability: async (itemName: string, isAvailable: boolean) => {
            const response = await fetch(`${API_BASE_URL}/vendors/menu/availability`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ itemName, isAvailable }),
            });
            return response.json();
        }
    },
    runners: {
        getLeaderboard: async () => {
            const response = await fetch(`${API_BASE_URL}/runners/leaderboard`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        getStats: async () => {
            const response = await fetch(`${API_BASE_URL}/runners/stats`, {
                headers: getHeaders(),
            });
            return response.json();
        }
    },
    ratings: {
        create: async (ratingData: { orderId: string; score: number; comment?: string }) => {
            const response = await fetch(`${API_BASE_URL}/ratings`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(ratingData),
            });
            return response.json();
        },
        getForRunner: async (runnerId: string) => {
            const response = await fetch(`${API_BASE_URL}/ratings/runner/${runnerId}`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        getForVendor: async (vendorId: string) => {
            const response = await fetch(`${API_BASE_URL}/ratings/vendor/${vendorId}`, {
                headers: getHeaders(),
            });
            return response.json();
        }
    },
    admin: {
        getOrders: async (filters?: any) => {
            const params = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_BASE_URL}/admin/orders?${params}`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        getStats: async () => {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        refundOrder: async (orderId: string, adminResponse: string) => {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/refund`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ adminResponse }),
            });
            return response.json();
        },
        resolveDispute: async (orderId: string, adminResponse: string) => {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/resolve`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ adminResponse }),
            });
            return response.json();
        }
    },
    groupOrders: {
        create: async (vendorId: string, deliveryFee: number) => {
            const response = await fetch(`${API_BASE_URL}/group-orders`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ vendorId, deliveryFee }),
            });
            return response.json();
        },
        getByCode: async (code: string) => {
            const response = await fetch(`${API_BASE_URL}/group-orders/code/${code}`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        join: async (id: string, shareCode: string) => {
            const response = await fetch(`${API_BASE_URL}/group-orders/${id}/join`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ shareCode }),
            });
            return response.json();
        },
        updateItems: async (id: string, items: any[]) => {
            const response = await fetch(`${API_BASE_URL}/group-orders/${id}/items`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ items }),
            });
            return response.json();
        },
        lock: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/group-orders/${id}/lock`, {
                method: 'POST',
                headers: getHeaders(),
            });
            return response.json();
        },
        getById: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/group-orders/${id}`, {
                headers: getHeaders(),
            });
            return response.json();
        }
    },
    notifications: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                headers: getHeaders(),
            });
            return response.json();
        },
        markAsRead: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: getHeaders(),
            });
            return response.json();
        },
        markAllAsRead: async () => {
            const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: getHeaders(),
            });
            return response.json();
        }
    }
};
