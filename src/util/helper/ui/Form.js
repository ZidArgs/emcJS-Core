export function extractFormData(formEl) {
    const formData = new FormData(formEl);
    return Object.fromEntries(formData.entries());
}
