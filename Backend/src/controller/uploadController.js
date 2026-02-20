const uploadFunc = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ EM: "error upload", EC: 1, DT: [] });
    }
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    res.status(201).json({ EM: "upload thành công", EC: 0, DT: imageUrls });
};
export default { uploadFunc };

