// frontend/src/utils/targetTimeService.js
import React from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost/mkffwebsystem/backend/api";
const TARGET_TIMES_ENDPOINT = `${API_BASE_URL}/target_times.php`;

// Default fallback thresholds
const DEFAULT_THRESHOLDS = {
    'Station1': 6, 'Station 1': 6,
    'Station2': 8, 'Station 2': 8,
    'Station3': 3, 'Station 3': 3,
    'Station4': 12, 'Station 4': 12,
    'Station5': 15, 'Station 5': 15,
    'Station6': 15, 'Station 6': 15,
    'Station7': 3, 'Station 7': 3,
    'Station8': 15, 'Station 8': 15,
    'Station9': 480, 'Station 9': 480,
    'Station10': 8, 'Station 10': 8,
    'Station11': 22, 'Station 11': 22,
    'Station12': 5, 'Station 12': 5,
    'Station13': 10, 'Station 13': 10,
    'Station14': 8, 'Station 14': 8,
    'Station15': 5, 'Station 15': 5
};

// Global cache for target times
let cachedThresholds = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache (much shorter for real-time feel)
let pollingInterval = null;

// Event listeners for real-time updates
const listeners = new Set();

// Start polling for target time changes
const startPolling = () => {
    if (pollingInterval) return; // Already polling
    
    pollingInterval = setInterval(async () => {
        try {
            const response = await axios.get(TARGET_TIMES_ENDPOINT);
            const newThresholds = response.data;
            
            // Check if thresholds actually changed
            if (JSON.stringify(newThresholds) !== JSON.stringify(cachedThresholds)) {
                cachedThresholds = newThresholds;
                lastFetchTime = Date.now();
                
                // Broadcast change to all tabs/windows
                localStorage.setItem('targetTimesUpdate', JSON.stringify({
                    thresholds: newThresholds,
                    timestamp: Date.now()
                }));
                
                // Notify all listeners of the change
                listeners.forEach(callback => {
                    try {
                        callback(newThresholds);
                    } catch (error) {
                        console.error('Error in target time listener:', error);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to poll target times:', error);
        }
    }, 3000); // Poll every 3 seconds for real-time updates
};

// Listen for localStorage changes (cross-tab updates)
window.addEventListener('storage', (e) => {
    if (e.key === 'targetTimesUpdate' && e.newValue) {
        try {
            const { thresholds, timestamp } = JSON.parse(e.newValue);
            
            // Only update if this is a newer change
            if (timestamp > lastFetchTime) {
                cachedThresholds = thresholds;
                lastFetchTime = timestamp;
                
                // Notify all listeners
                listeners.forEach(callback => {
                    try {
                        callback(thresholds);
                    } catch (error) {
                        console.error('Error in target time listener:', error);
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing localStorage target time update:', error);
        }
    }
});

// Stop polling when no listeners
const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
};

export const targetTimeService = {
    // Get current target times (with real-time polling)
    async getTargetTimes() {
        const now = Date.now();
        
        // Return cached data if still valid
        if (cachedThresholds && (now - lastFetchTime) < CACHE_DURATION) {
            return cachedThresholds;
        }

        try {
            const response = await axios.get(TARGET_TIMES_ENDPOINT);
            cachedThresholds = response.data;
            lastFetchTime = now;
            
            // Start polling if we have listeners
            if (listeners.size > 0) {
                startPolling();
            }
            
            return cachedThresholds;
        } catch (error) {
            console.warn('Failed to fetch target times, using defaults:', error);
            cachedThresholds = DEFAULT_THRESHOLDS;
            return DEFAULT_THRESHOLDS;
        }
    },

    // Get threshold for specific station
    async getThreshold(stationId) {
        const thresholds = await this.getTargetTimes();
        return thresholds[stationId] || thresholds[stationId.replace(' ', '')] || 10;
    },

    // Update target times and immediately notify all components
    async updateTargetTimes(newThresholds) {
        try {
            await axios.post(TARGET_TIMES_ENDPOINT, newThresholds, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            // Update cache immediately
            cachedThresholds = newThresholds;
            lastFetchTime = Date.now();
            
            // Broadcast to all tabs/windows immediately
            localStorage.setItem('targetTimesUpdate', JSON.stringify({
                thresholds: newThresholds,
                timestamp: lastFetchTime
            }));
            
            // Immediately notify all listeners for instant updates
            listeners.forEach(callback => {
                try {
                    callback(newThresholds);
                } catch (error) {
                    console.error('Error in target time listener:', error);
                }
            });
            
            return { success: true };
        } catch (error) {
            console.error('Failed to update target times:', error);
            throw error;
        }
    },

    // Force refresh cache
    async refreshCache() {
        cachedThresholds = null;
        lastFetchTime = 0;
        return await this.getTargetTimes();
    },

    // Subscribe to target time changes
    subscribe(callback) {
        listeners.add(callback);
        
        // Start polling when first listener is added
        if (listeners.size === 1) {
            startPolling();
        }
        
        // Return unsubscribe function
        return () => {
            listeners.delete(callback);
            
            // Stop polling when no more listeners
            if (listeners.size === 0) {
                stopPolling();
            }
        };
    },

    // Notify all listeners
    notifyListeners(newThresholds) {
        listeners.forEach(callback => {
            try {
                callback(newThresholds);
            } catch (error) {
                console.error('Error in target time listener:', error);
            }
        });
    },

    // Get default thresholds
    getDefaults() {
        return DEFAULT_THRESHOLDS;
    },

    // Check if station has delay based on dynamic thresholds
    async checkUnitDelay(stationId, updatedAt) {
        const threshold = await this.getThreshold(stationId);
        const lastUpdate = new Date(updatedAt).getTime();
        const minutesInStation = Math.max(0, (new Date().getTime() - lastUpdate) / (1000 * 60));
        
        if (minutesInStation > threshold * 3) {
            return { isDelayed: true, level: 'CRITICAL', minutes: minutesInStation, threshold };
        }
        if (minutesInStation > threshold) {
            return { isDelayed: true, level: 'MODERATE', minutes: minutesInStation, threshold };
        }
        return { isDelayed: false, level: 'NORMAL', minutes: minutesInStation, threshold };
    }
};

// React hook for using target times in components
export const useTargetTimes = () => {
    const [thresholds, setThresholds] = React.useState(DEFAULT_THRESHOLDS);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Initial load
        targetTimeService.getTargetTimes().then(data => {
            setThresholds(data);
            setLoading(false);
        }).catch(() => {
            setThresholds(DEFAULT_THRESHOLDS);
            setLoading(false);
        });

        // Subscribe to real-time changes
        const unsubscribe = targetTimeService.subscribe((newThresholds) => {
            setThresholds(newThresholds);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return { thresholds, loading, refresh: targetTimeService.refreshCache };
};

export default targetTimeService;