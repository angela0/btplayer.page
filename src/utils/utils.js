export const canPlay = (item) => {
    item = item.toLowerCase();
    return item.endsWith(".mp4") || 
           item.endsWith(".mkv") ||
           item.endsWith(".mp3");
};

export const isPic = (item) => {
    item = item.toLowerCase();
    return item.endsWith(".png") ||
           item.endsWith(".webp") ||
           item.endsWith("jpg") ||
           item.endsWith("jpeg");
};

export const getHashMeta = (hash, key) => {
    let obj = JSON.parse(localStorage.getItem(hash));
    if (!obj) {
        return "";
    }
    return obj[key];
};
