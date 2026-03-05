import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Storage keys ─────────────────────────────────────────────────────────
const LS_USERS = "sss_users";
const LS_SESSION = "sss_session";
const LS_WISHLIST = "sss_wishlist";

// ── Simple hash (Web Crypto SHA-256 async, but we'll use XOR for sync) ───
// For a real app use bcrypt on a server; here we do a deterministic scramble
function pseudoHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0") + str.split("").reverse().join("").slice(0, 8);
}

// ── Load / save helpers ──────────────────────────────────────────────────
function loadUsers() { try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch { return []; } }
function saveUsers(u) { localStorage.setItem(LS_USERS, JSON.stringify(u)); }
function loadSession() { try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); } catch { return null; } }
function saveSession(s) { localStorage.setItem(LS_SESSION, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(LS_SESSION); }
function loadWishlist(uid) { try { const all = JSON.parse(localStorage.getItem(LS_WISHLIST) || "{}"); return all[uid] || []; } catch { return []; } }
function saveWishlist(uid, list) {
    try {
        const all = JSON.parse(localStorage.getItem(LS_WISHLIST) || "{}");
        all[uid] = list;
        localStorage.setItem(LS_WISHLIST, JSON.stringify(all));
    } catch { }
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ── Loyalty rules ────────────────────────────────────────────────────────
export const POINTS_PER_RUPEE = 0.1;   // ₹100 = 10 pts
export const RUPEES_PER_POINT = 0.5;   // 10 pts = ₹5

// ── Context ──────────────────────────────────────────────────────────────
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadSession);        // current user object
    const [wishlist, setWishlist] = useState(() => user ? loadWishlist(user.id) : []);
    const [authError, setAuthError] = useState("");

    // Sync wishlist → storage whenever it changes
    useEffect(() => {
        if (user) saveWishlist(user.id, wishlist);
    }, [wishlist, user]);

    // ── Sign Up ──────────────────────────────────────────────────────────
    const signup = useCallback(({ name, email, phone, password, referralCode }) => {
        const users = loadUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            setAuthError("An account with this email already exists.");
            return false;
        }
        const referrer = users.find(u => u.referralCode === referralCode?.trim().toUpperCase());
        const newUser = {
            id: generateId(),
            name, email, phone,
            passwordHash: pseudoHash(password),
            avatar: "",
            addresses: [],
            orders: [],
            savedEstimates: [],
            notifications: getDefaultNotifications(),
            loyaltyPoints: referrer ? 100 : 0,         // referral bonus
            loyaltyHistory: referrer ? [{ date: new Date().toISOString(), pts: 100, reason: "Referral signup bonus" }] : [],
            referralCode: generateReferralCode(name),
            referredBy: referrer?.id || null,
            createdAt: new Date().toISOString(),
        };
        // Give referrer 150 bonus points
        if (referrer) {
            const updated = users.map(u => u.id === referrer.id
                ? {
                    ...u,
                    loyaltyPoints: u.loyaltyPoints + 150,
                    loyaltyHistory: [...(u.loyaltyHistory || []), { date: new Date().toISOString(), pts: 150, reason: `Referral: ${name} signed up` }],
                    notifications: [...(u.notifications || []), { id: generateId(), type: "loyalty", title: "Referral Bonus! 🎉", message: `${name} joined using your code. You earned 150 points!`, read: false, time: new Date().toISOString() }]
                }
                : u);
            saveUsers([...updated, newUser]);
        } else {
            saveUsers([...users, newUser]);
        }
        saveSession(newUser);
        setUser(newUser);
        setWishlist([]);
        setAuthError("");
        return true;
    }, []);

    // ── Log In ───────────────────────────────────────────────────────────
    const login = useCallback(({ email, password }) => {
        const users = loadUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!found) { setAuthError("No account found with this email."); return false; }
        if (found.passwordHash !== pseudoHash(password)) { setAuthError("Incorrect password."); return false; }
        saveSession(found);
        setUser(found);
        setWishlist(loadWishlist(found.id));
        setAuthError("");
        return true;
    }, []);

    // ── Log Out ──────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        clearSession();
        setUser(null);
        setWishlist([]);
    }, []);

    // ── Update Profile ───────────────────────────────────────────────────
    const updateProfile = useCallback((fields) => {
        const users = loadUsers();
        const updated = { ...user, ...fields };
        saveUsers(users.map(u => u.id === user.id ? updated : u));
        saveSession(updated);
        setUser(updated);
    }, [user]);

    // ── Change Password ──────────────────────────────────────────────────
    const changePassword = useCallback(({ current, next }) => {
        if (pseudoHash(current) !== user.passwordHash) return false;
        updateProfile({ passwordHash: pseudoHash(next) });
        return true;
    }, [user, updateProfile]);

    // ── Addresses ────────────────────────────────────────────────────────
    const addAddress = useCallback((addr) => {
        const list = [...(user.addresses || [])];
        const newAddr = { ...addr, id: generateId(), isDefault: list.length === 0 };
        const updated = [...list, newAddr];
        updateProfile({ addresses: updated });
    }, [user, updateProfile]);

    const updateAddress = useCallback((id, fields) => {
        const updated = (user.addresses || []).map(a => a.id === id ? { ...a, ...fields } : a);
        updateProfile({ addresses: updated });
    }, [user, updateProfile]);

    const deleteAddress = useCallback((id) => {
        const filtered = (user.addresses || []).filter(a => a.id !== id);
        updateProfile({ addresses: filtered });
    }, [user, updateProfile]);

    const setDefaultAddress = useCallback((id) => {
        const updated = (user.addresses || []).map(a => ({ ...a, isDefault: a.id === id }));
        updateProfile({ addresses: updated });
    }, [user, updateProfile]);

    // ── Wishlist ─────────────────────────────────────────────────────────
    const toggleWishlist = useCallback((productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

    // ── Notifications ────────────────────────────────────────────────────
    const markNotificationRead = useCallback((id) => {
        const updated = (user.notifications || []).map(n => n.id === id ? { ...n, read: true } : n);
        updateProfile({ notifications: updated });
    }, [user, updateProfile]);

    const markAllRead = useCallback(() => {
        const updated = (user.notifications || []).map(n => ({ ...n, read: true }));
        updateProfile({ notifications: updated });
    }, [user, updateProfile]);

    // ── Loyalty ──────────────────────────────────────────────────────────
    const addPoints = useCallback((pts, reason) => {
        if (!user) return;
        const entry = { date: new Date().toISOString(), pts, reason };
        updateProfile({
            loyaltyPoints: (user.loyaltyPoints || 0) + pts,
            loyaltyHistory: [...(user.loyaltyHistory || []), entry],
        });
    }, [user, updateProfile]);

    // ── Saved Estimates ──────────────────────────────────────────────────
    const saveEstimate = useCallback((estimate) => {
        const list = [...(user.savedEstimates || [])];
        const existing = list.findIndex(e => e.id === estimate.id);
        const entry = { ...estimate, id: estimate.id || generateId(), savedAt: new Date().toISOString() };
        if (existing >= 0) list[existing] = entry; else list.unshift(entry);
        updateProfile({ savedEstimates: list });
    }, [user, updateProfile]);

    const deleteEstimate = useCallback((id) => {
        updateProfile({ savedEstimates: (user.savedEstimates || []).filter(e => e.id !== id) });
    }, [user, updateProfile]);

    const unreadCount = user ? (user.notifications || []).filter(n => !n.read).length : 0;

    return (
        <AuthContext.Provider value={{
            user, authError, setAuthError,
            signup, login, logout,
            updateProfile, changePassword,
            addAddress, updateAddress, deleteAddress, setDefaultAddress,
            wishlist, toggleWishlist, isWishlisted,
            markNotificationRead, markAllRead, unreadCount,
            addPoints,
            saveEstimate, deleteEstimate,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function generateReferralCode(name) {
    const prefix = (name || "SSS").replace(/\s+/g, "").slice(0, 4).toUpperCase();
    return prefix + Math.floor(1000 + Math.random() * 9000);
}

function getDefaultNotifications() {
    return [
        { id: generateId(), type: "offer", title: "Welcome to SSS Crackers! 🎉", message: "Explore our Diwali collection and get up to 40% off.", read: false, time: new Date().toISOString() },
        { id: generateId(), type: "loyalty", title: "Loyalty Points Active 🌟", message: "Earn 10 points for every ₹100 spent. Redeem for discounts!", read: false, time: new Date().toISOString() },
    ];
}
