const db = require("../../config/db");
const sequelize = db.sequelize;

countDataRows = async (conditions, table, join) => {
    const count = await table.count({
        raw: true,
        where: conditions,
        include: join
    });
    return count;
};

findAllByConditions = async (conditions, table, select, join, order, group) => {
    const data = await table.findAll({
        raw: true,
        attributes: select,
        where: conditions,
        include: join,
        order: order,
        group: group
    });
    return data;
};

findAllLimitByConditions = async (conditions, table, select, join, order, page, limit) => {
    const data = await table.findAll({
        raw: true,
        attributes: select,
        where: conditions,
        include: join,
        limit: limit,
        offset: (page - 1) * limit,
        order: order
    });
    return data;
};

findOneByConditions = async (conditions, table, select, join) => {
    const data = await table.findOne({
        raw: true,
        attributes: select,
        where: conditions,
        include: join
    });
    return data;
};

getProvince = async (province_id) => {
    const data = await db.provinces.findOne({
        raw: true,
        attributes: [
            [sequelize.col('provinces.id'), 'province_id'],
            [sequelize.col('provinces.name'), 'province_name'],
            [sequelize.col('provinces.name_en'), 'province_name_en']
        ],
        where: { id: province_id }
    });
    return data;
};

getAmphure = async (amphure_id) => {
    const data = await db.amphures.findOne({
        raw: true,
        attributes: [
            [sequelize.col('amphures.id'), 'amphure_id'],
            [sequelize.col('amphures.name'), 'amphure_name'],
            [sequelize.col('amphures.name_en'), 'amphure_name_en']
        ],
        where: { id: amphure_id }
    });
    return data;
};

module.exports = {
    countDataRows,
    findAllLimitByConditions,
    findAllByConditions,
    findOneByConditions,
    getProvince,
    getAmphure
};