export function reorderLatinSquare<T>(arr: T[], latinSquare: number): T[] {
    const sliceAt = latinSquare % arr.length;
    return [...arr.slice(sliceAt), ...arr.slice(0, sliceAt)];
}
