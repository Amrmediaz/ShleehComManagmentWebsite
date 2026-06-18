/**
 * Uploads a single File object to the Shleeh CDN.
 * Returns the URL string on success, or null on failure.
 *
 * Based on the Flutter app pattern: images are uploaded first,
 * then the returned URL is stored in buldingImages[].path
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const fileUploadApiClient = {
    async uploadFile(file) {
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('file', file);

        console.log('[fileUploadApiClient] Uploading file:', file.name, file.size);
        const API_URL = import.meta.env.VITE_API_URL || 'https://shleeh.com';

        const response = await fetch(API_URL+`/api/Support/SaveFile`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // NOTE: Do NOT set Content-Type here — browser sets it with boundary automatically
            },
            body: formData,
        });

        let data;
        try {
            const text = await response.text();
            console.log('[fileUploadApiClient] Raw response:', text);
            // Some APIs return just a plain URL string, others return JSON
            try {
                data = JSON.parse(text);
                // Handle { url: "..." } or { path: "..." } or { data: "..." }
                return data?.url || data?.path || data?.data || data?.result || text;
            } catch {
                // Plain string URL returned directly
                return text.trim().replace(/^"|"$/g, ''); // strip surrounding quotes if any
            }
        } catch (err) {
            console.error('[fileUploadApiClient] Upload failed:', err);
            return null;
        }
    },

    /**
     * Uploads multiple files and returns an array of URL strings.
     * Null entries (failed uploads) are filtered out.
     */
    async uploadFiles(files) {
        const results = await Promise.all(files.map(f => this.uploadFile(f)));
        return results.filter(Boolean);
    },
};