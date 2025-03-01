export const FormatDepartmentCode = (code: string) => {
    // Replace non-alphanumeric characters with spaces and convert to uppercase
    return code
        .toUpperCase() // Convert to uppercase
        .replace(/[^A-Z0-9]/g, ' '); // Replace symbols with spaces
};