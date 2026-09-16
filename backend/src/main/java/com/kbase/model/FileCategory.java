package com.kbase.model;

public enum FileCategory {
    DOCUMENT,
    SPREADSHEET,
    PRESENTATION,
    IMAGE,
    VIDEO,
    TEXT,
    OTHER;

    public static FileCategory fromFilename(String filename) {
        if (filename == null || !filename.contains(".")) {
            return OTHER;
        }
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return switch (ext) {
            case "pdf", "doc", "docx", "odt", "rtf" -> DOCUMENT;
            case "xls", "xlsx", "csv", "ods" -> SPREADSHEET;
            case "ppt", "pptx", "odp" -> PRESENTATION;
            case "jpg", "jpeg", "png", "gif", "svg", "bmp", "webp" -> IMAGE;
            case "mp4", "mov", "avi", "mkv", "webm" -> VIDEO;
            case "txt", "md", "json", "xml", "yaml", "yml", "log" -> TEXT;
            default -> OTHER;
        };
    }
}
