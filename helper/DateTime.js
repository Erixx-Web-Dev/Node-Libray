

 const calDiffISODate = (s, e) => {
    const start = new Date(s).getTime();
    const end = new Date(e).getTime();
    const milliseconds = Math.abs(end - start).toString()
    const seconds = parseInt(milliseconds / 1000);
    const minutes = parseInt(seconds / 60);
    const hours = parseInt(minutes / 60);
    const days = parseInt(hours / 24);

    return { seconds, minutes, hours, days}
}

module.exports = {
    calDiffISODate
}