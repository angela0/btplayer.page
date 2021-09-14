export const canPlay = (item) => {
    item = item.toLowerCase()
    if (item.endsWith(".mp4") || 
        item.endsWith(".mkv") ||
        item.endsWith(".mp3")) {
        return true;
    }
    return false;
}

export const getHashMeta = (hash, key) => {
    let obj = JSON.parse(localStorage.getItem(hash));
    if (!obj) {
        return "";
    }
    return obj[key];
}
