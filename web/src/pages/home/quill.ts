export const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
  ],
} as const;

export const quillFormats = [
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
] as const;

