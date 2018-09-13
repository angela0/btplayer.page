export const canPlay = (item) => {
    if (item.endsWith(".mp4") || 
        item.endsWith(".mkv")) {
        return true;
    }
    return false;
}
