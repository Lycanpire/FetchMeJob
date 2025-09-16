"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasNextPage = exports.getPaginationParams = void 0;
function getPaginationParams(currentPage, pageSize) {
    const start = (currentPage - 1) * pageSize;
    return { start, limit: pageSize };
}
exports.getPaginationParams = getPaginationParams;
function hasNextPage(totalItems, currentPage, pageSize) {
    return totalItems > currentPage * pageSize;
}
exports.hasNextPage = hasNextPage;
