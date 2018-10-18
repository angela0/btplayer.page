export const canPlay = (item) => {
    if (item.endsWith(".mp4") || 
        item.endsWith(".mkv") ||
        item.endsWith(".mp3")) {
        return true;
    }
    return false;
}
