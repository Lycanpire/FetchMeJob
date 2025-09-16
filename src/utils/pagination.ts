export function getPaginationParams(currentPage: number, pageSize: number): { start: number; limit: number } {
    const start = (currentPage - 1) * pageSize;
    return { start, limit: pageSize };
}

export function hasNextPage(totalItems: number, currentPage: number, pageSize: number): boolean {
    return totalItems > currentPage * pageSize;
}