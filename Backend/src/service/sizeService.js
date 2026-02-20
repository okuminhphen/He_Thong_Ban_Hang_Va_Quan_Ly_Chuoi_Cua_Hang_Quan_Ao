import db from "../models/index.js";
const getAllSizes = async () => {
    try {
        let data = await db.Size.findAll({ attributes: ["id", "name"] });

        return {
            EM: "Get sizes success",
            EC: 0,
            DT: data,
        };
    } catch (e) {
        console.log(e);
        return {
            EM: "Failed to get sizes",
            EC: 1,
            DT: [],
        };
    }
};

const createSize = async (data) => {
    try {
        if (!data.name) {
            return {
                EM: "Missing size name",
                EC: 1,
                DT: "",
            };
        }

        let size = await db.Size.create({
            name: data.name,
        });

        return {
            EM: "Create size successfully",
            EC: 0,
            DT: size,
        };
    } catch (e) {
        console.log(e);
        return {
            EM: "Cannot create size",
            EC: 2,
            DT: "",
        };
    }
};

const updateSize = async (data) => {
    try {
        if (!data.id || !data.name) {
            return {
                EM: "Missing parameters",
                EC: 1,
                DT: "",
            };
        }

        let size = await db.Size.findByPk(data.id);
        if (!size) {
            return {
                EM: "Size not found",
                EC: 2,
                DT: "",
            };
        }

        await size.update({
            name: data.name,
        });

        return {
            EM: "Update size successfully",
            EC: 0,
            DT: size,
        };
    } catch (e) {
        console.log(e);
        return {
            EM: "Cannot update size",
            EC: 3,
            DT: "",
        };
    }
};

const deleteSize = async (id) => {
    try {
        let size = await db.Size.findByPk(id);

        if (!size) {
            return {
                EM: "Size not exist",
                EC: 1,
                DT: "",
            };
        }

        await size.destroy();

        return {
            EM: "Delete size successfully",
            EC: 0,
            DT: "",
        };
    } catch (e) {
        console.log(e);
        return {
            EM: "Cannot delete size",
            EC: 2,
            DT: "",
        };
    }
};
export default {
    getAllSizes,
    createSize,
    updateSize,
    deleteSize,
};
