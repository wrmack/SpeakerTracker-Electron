import { getRowsInEntitiesTable, getRowsInMembersTable, getRowsInGroupsTable } from "../../02-Models/models.js";

const getNumberOfRowsInEntitiesTable = async () => {
    return await getRowsInEntitiesTable()
}

const getNumberOfRowsInMembersTable = async () => {
    return await getRowsInMembersTable()
}

const getNumberOfRowsInGroupsTable = async () => {
    return await getRowsInGroupsTable()
}

export {
    getNumberOfRowsInEntitiesTable,
    getNumberOfRowsInMembersTable,
    getNumberOfRowsInGroupsTable
}