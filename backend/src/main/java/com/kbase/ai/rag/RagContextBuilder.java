package com.kbase.ai.rag;

import com.kbase.model.Document;
import com.kbase.model.FileCategory;
import com.kbase.model.Project;
import com.kbase.model.ProjectMember;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class RagContextBuilder {

    private final DocumentRepository documentRepository;
    private final ProjectMemberRepository projectMemberRepository;

    private static final Pattern WORD_SPLITTER = Pattern.compile("[\\s,;:.?!()\"'\\[\\]{}]+");
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "for", "to",
            "what", "how", "where", "who", "when", "why", "of", "with", "as", "by", "from",
            "la", "va", "cua", "cac", "cho", "trong", "co", "nhu", "the_nao", "la_gi", "nhung",
            "tai", "lieu", "tai_lieu", "file", "tep", "tep_tin", "du_an", "gom", "nhung_gi"
    );

    public Set<String> extractSearchTerms(String rawQuestion) {
        if (rawQuestion == null) return Collections.emptySet();
        String[] rawTokens = WORD_SPLITTER.split(rawQuestion.toLowerCase());
        Set<String> searchTerms = new HashSet<>();
        for (String t : rawTokens) {
            String token = t.trim();
            if (token.length() > 2 && !STOP_WORDS.contains(token)) {
                searchTerms.add(token);
            }
        }
        return searchTerms;
    }

    public List<ScoredDocument> scoreDocuments(List<Document> documents, Set<String> searchTerms) {
        List<ScoredDocument> scoredDocs = new ArrayList<>();

        for (Document doc : documents) {
            double score = 0.0;
            StringBuilder snippet = new StringBuilder();

            String title = doc.getTitle().toLowerCase();
            String summary = (doc.getSummary() != null) ? doc.getSummary().toLowerCase() : "";
            String filename = doc.getOriginalFilename().toLowerCase();
            String content = (doc.getTextContent() != null) ? doc.getTextContent().toLowerCase() : "";

            for (String term : searchTerms) {
                if (title.contains(term)) score += 5.0;
                if (filename.contains(term)) score += 3.0;
                if (summary.contains(term)) score += 4.0;

                int contentMatches = countOccurrences(content, term);
                if (contentMatches > 0) {
                    score += Math.min(contentMatches * 1.5, 15.0);
                    if (snippet.length() < 300) {
                        String matchContext = extractContextSnippet(doc.getTextContent(), term, 150);
                        if (!matchContext.isBlank()) {
                            if (!snippet.isEmpty()) snippet.append(" ... ");
                            snippet.append(matchContext);
                        }
                    }
                }
            }

            if (score > 0) {
                if (snippet.isEmpty()) {
                    if (doc.getSummary() != null && !doc.getSummary().isBlank()) {
                        snippet.append(doc.getSummary());
                    } else {
                        snippet.append("Tệp tin: ").append(doc.getOriginalFilename())
                               .append(" (").append(doc.getFileCategory()).append(")");
                    }
                }
                scoredDocs.add(new ScoredDocument(doc, score, snippet.toString()));
            }
        }

        scoredDocs.sort((a, b) -> Double.compare(b.score(), a.score()));
        return scoredDocs;
    }

    public String buildGeminiContext(Project project, List<Document> allDocs, List<ScoredDocument> scoredDocs, List<Project> accessibleProjects, Set<String> searchTerms) {
        StringBuilder sb = new StringBuilder();

        if (project != null) {
            sb.append("--- THÔNG TIN KHÔNG GIAN DỰ ÁN HIỆN TẠI ---\n");
            sb.append("- Tên dự án: ").append(project.getName()).append("\n");
            if (project.getDescription() != null && !project.getDescription().isBlank()) {
                sb.append("- Mô tả: ").append(project.getDescription()).append("\n");
            }
            sb.append("- Chủ dự án (Owner): ").append(project.getOwner().getFullName()).append(" (").append(project.getOwner().getEmail()).append(")\n");

            List<ProjectMember> members = projectMemberRepository.findByProjectId(project.getId());
            if (!members.isEmpty()) {
                sb.append("- Thành viên tham gia (").append(members.size()).append(" người):\n");
                for (ProjectMember m : members) {
                    sb.append("  + ").append(m.getUser().getFullName()).append(" (").append(m.getUser().getEmail()).append(") - Vai trò: ").append(m.getRole()).append("\n");
                }
            } else {
                sb.append("- Thành viên tham gia: Hiện chưa có thành viên nào khác ngoài Chủ dự án.\n");
            }
            sb.append("- Tổng số tài liệu hiện có trong dự án '").append(project.getName()).append("': ").append(allDocs.size()).append(" tài liệu.\n\n");
        } else {
            sb.append("--- PHẠM VI TRA CỨU: TOÀN BỘ HỆ THỐNG KBASE (TẤT CẢ DỰ ÁN) ---\n");
            sb.append("Người dùng hiện có quyền truy cập vào ").append(accessibleProjects.size()).append(" không gian dự án:\n");
            for (Project p : accessibleProjects) {
                long dCount = documentRepository.countByProjectId(p.getId());
                sb.append("- Dự án: ").append(p.getName()).append(" (Tổng số tài liệu: ").append(dCount).append(" tệp)");
                if (p.getDescription() != null && !p.getDescription().isBlank()) {
                    sb.append(" - ").append(p.getDescription());
                }
                sb.append("\n");
            }
            sb.append("- Tổng số tài liệu trên toàn bộ hệ thống: ").append(allDocs.size()).append(" tài liệu.\n\n");
        }

        if (!allDocs.isEmpty()) {
            String scopeTitle = (project != null) ? "DỰ ÁN '" + project.getName() + "'" : "TOÀN BỘ HỆ THỐNG";
            sb.append("--- DANH SÁCH CHI TIẾT TÀI LIỆU TRONG ").append(scopeTitle).append(" (Tổng cộng: ").append(allDocs.size()).append(" tài liệu) ---\n");
            for (int i = 0; i < allDocs.size(); i++) {
                Document doc = allDocs.get(i);
                String pName = (doc.getProject() != null) ? doc.getProject().getName() : "Chung";
                sb.append((i + 1)).append(". Tiêu đề: ").append(doc.getTitle())
                  .append(" | Tên tệp gốc: ").append(doc.getOriginalFilename())
                  .append(" | Dự án: ").append(pName)
                  .append(" | Định dạng: ").append(getCategoryDisplayName(doc.getFileCategory()))
                  .append(" | Dung lượng: ").append(formatFileSize(doc.getFileSize()));
                if (doc.getSummary() != null && !doc.getSummary().isBlank()) {
                    sb.append(" | Tóm tắt: ").append(doc.getSummary());
                }
                sb.append("\n");
            }
            sb.append("\n");
        } else {
            sb.append("--- DANH SÁCH TÀI LIỆU: Hiện chưa có tài liệu nào trong phạm vi này ---\n\n");
        }

        List<Document> docsWithContent = new ArrayList<>();
        if (!scoredDocs.isEmpty()) {
            int limit = Math.min(scoredDocs.size(), 3);
            for (int i = 0; i < limit; i++) {
                docsWithContent.add(scoredDocs.get(i).doc());
            }
        } else if (!allDocs.isEmpty() && allDocs.size() <= 3) {
            docsWithContent.addAll(allDocs);
        }

        if (!docsWithContent.isEmpty()) {
            sb.append("--- CHI TIẾT NỘI DUNG TÀI LIỆU LIÊN QUAN ĐẾN CÂU HỎI ---\n");
            for (Document doc : docsWithContent) {
                String pName = (doc.getProject() != null) ? doc.getProject().getName() : "Chung";
                sb.append("TÀI LIỆU: ").append(doc.getTitle()).append(" [Dự án: ").append(pName).append("] (Tệp: ").append(doc.getOriginalFilename()).append(")\n");
                if (doc.getTextContent() != null && !doc.getTextContent().isBlank()) {
                    String fullText = doc.getTextContent();
                    if (fullText.length() <= 70000) {
                        sb.append(fullText).append("\n\n");
                    } else {
                        sb.append("[PHẦN MỤC LỤC VÀ TỔNG QUAN TÀI LIỆU]:\n")
                          .append(fullText.substring(0, Math.min(fullText.length(), 6000)))
                          .append("\n[...]\n");

                        String relevant = extractRelevantSections(fullText, searchTerms, 60000);
                        if (!relevant.isBlank()) {
                            sb.append("[CÁC CHƯƠNG MỤC NỘI DUNG CHI TIẾT KHỚP VỚI CÂU HỎI]:\n")
                              .append(relevant)
                              .append("\n\n");
                        } else {
                            sb.append(fullText.substring(6000, Math.min(fullText.length(), 70000))).append("\n\n");
                        }
                    }
                } else if (doc.getSummary() != null) {
                    sb.append(doc.getSummary()).append("\n\n");
                }
            }
        }
        return sb.toString();
    }

    public String extractRelevantSections(String fullText, Set<String> searchTerms, int maxChars) {
        if (fullText == null || searchTerms == null || searchTerms.isEmpty()) {
            return "";
        }

        String lowerText = fullText.toLowerCase();
        List<int[]> ranges = new ArrayList<>();

        for (String term : searchTerms) {
            if (term.length() < 3) continue;
            int idx = 0;
            while ((idx = lowerText.indexOf(term, idx)) != -1) {
                int start = Math.max(0, idx - 1500);
                int end = Math.min(fullText.length(), idx + term.length() + 3500);
                ranges.add(new int[]{start, end});
                idx += term.length() + 300;
            }
        }

        if (ranges.isEmpty()) {
            return "";
        }

        ranges.sort(Comparator.comparingInt(a -> a[0]));

        List<int[]> merged = new ArrayList<>();
        int[] current = ranges.get(0);
        for (int i = 1; i < ranges.size(); i++) {
            int[] next = ranges.get(i);
            if (next[0] <= current[1] + 300) {
                current[1] = Math.max(current[1], next[1]);
            } else {
                merged.add(current);
                current = next;
            }
        }
        merged.add(current);

        StringBuilder sb = new StringBuilder();
        int totalChars = 0;
        for (int[] r : merged) {
            int len = r[1] - r[0];
            if (totalChars + len > maxChars) {
                int allowed = maxChars - totalChars;
                if (allowed > 500) {
                    sb.append(fullText, r[0], r[0] + allowed).append("\n[...]\n");
                }
                break;
            }
            sb.append(fullText, r[0], r[1]).append("\n[...]\n");
            totalChars += len;
        }

        return sb.toString().trim();
    }

    public int countOccurrences(String text, String term) {
        if (text == null || term == null || term.isEmpty()) return 0;
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(term, idx)) != -1) {
            count++;
            idx += term.length();
        }
        return count;
    }

    public String extractContextSnippet(String fullText, String term, int radius) {
        if (fullText == null || term == null || term.isBlank()) return "";
        int idx = fullText.toLowerCase().indexOf(term.toLowerCase());
        if (idx == -1) return "";

        int targetStart = Math.max(0, idx - radius);
        int start = targetStart;
        if (start > 0) {
            int lineBreak = fullText.lastIndexOf("\n", idx);
            int dotBreak = fullText.lastIndexOf(". ", idx);
            int bulletBreak = Math.max(fullText.lastIndexOf("●", idx), fullText.lastIndexOf("- "));
            int bestBreak = Math.max(lineBreak, Math.max(dotBreak >= 0 ? dotBreak + 2 : -1, bulletBreak));
            if (bestBreak >= targetStart - 60 && bestBreak <= idx) {
                start = bestBreak;
            }
        }

        int targetEnd = Math.min(fullText.length(), idx + term.length() + radius);
        int end = targetEnd;
        if (end < fullText.length()) {
            int lineBreak = fullText.indexOf("\n", idx + term.length());
            int dotBreak = fullText.indexOf(". ", idx + term.length());
            int bestBreak = -1;
            if (lineBreak >= 0 && dotBreak >= 0) bestBreak = Math.min(lineBreak, dotBreak + 1);
            else if (lineBreak >= 0) bestBreak = lineBreak;
            else if (dotBreak >= 0) bestBreak = dotBreak + 1;

            if (bestBreak >= idx && bestBreak <= targetEnd + 80) {
                end = bestBreak;
            }
        }

        String snippet = fullText.substring(start, end).trim();
        return snippet.replaceAll("^[.\\s,;]+", "");
    }

    public String getCategoryDisplayName(FileCategory category) {
        if (category == null) return "Khác";
        return switch (category) {
            case DOCUMENT -> "Tài liệu văn bản (Word, PDF)";
            case SPREADSHEET -> "Bảng tính (Excel)";
            case PRESENTATION -> "Thuyết trình (PowerPoint)";
            case IMAGE -> "Hình ảnh";
            case VIDEO -> "Video";
            case TEXT -> "Văn bản / Mã nguồn";
            default -> "Tệp tin khác";
        };
    }

    public String formatFileSize(Long bytes) {
        if (bytes == null || bytes <= 0) return "0 KB";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}
