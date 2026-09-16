package com.kbase.service.impl;

import com.kbase.dto.ChatRequest;
import com.kbase.dto.ChatResponse;
import com.kbase.model.Document;
import com.kbase.model.Project;
import com.kbase.model.Role;
import com.kbase.model.User;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectMemberRepository;
import com.kbase.repository.ProjectRepository;
import com.kbase.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    private static final Pattern WORD_SPLITTER = Pattern.compile("[\\s,;:.?!()\"'\\[\\]{}]+");
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "for", "to",
            "what", "how", "where", "who", "when", "why", "of", "with", "as", "by", "from",
            "la", "va", "cua", "cac", "cho", "trong", "co", "nhu", "the_nao", "la_gi", "nhung"
    );

    @Override
    public ChatResponse askQuestion(ChatRequest request, User currentUser) {
        Long projectId = request.getProjectId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dự án với mã ID: " + projectId));

        checkProjectAccess(project, currentUser);

        List<Document> documents = documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        if (documents.isEmpty()) {
            return ChatResponse.builder()
                    .question(request.getQuestion())
                    .answer("Chưa có tài liệu nào được tải lên dự án '" + project.getName() + "'. Vui lòng tải lên tài liệu để tôi có thể phân tích và trả lời câu hỏi của bạn.")
                    .projectId(projectId)
                    .references(Collections.emptyList())
                    .build();
        }

        // Tách từ khóa câu hỏi
        String rawQuestion = request.getQuestion().toLowerCase();
        String[] rawTokens = WORD_SPLITTER.split(rawQuestion);
        Set<String> searchTerms = new HashSet<>();
        for (String t : rawTokens) {
            String token = t.trim();
            if (token.length() > 2 && !STOP_WORDS.contains(token)) {
                searchTerms.add(token);
            }
        }

        List<ScoredDoc> scoredDocs = new ArrayList<>();

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
                            if (snippet.length() > 0) snippet.append(" ... ");
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
                scoredDocs.add(new ScoredDoc(doc, score, snippet.toString()));
            }
        }

        scoredDocs.sort((a, b) -> Double.compare(b.score, a.score));

        List<ChatResponse.SourceReference> references = new ArrayList<>();
        StringBuilder answerBuilder = new StringBuilder();

        if (scoredDocs.isEmpty()) {
            answerBuilder.append("Tôi đã tra cứu qua ")
                    .append(documents.size())
                    .append(" tài liệu trong dự án '")
                    .append(project.getName())
                    .append("', nhưng không tìm thấy thông tin khớp trực tiếp cho câu hỏi: \"")
                    .append(request.getQuestion())
                    .append("\".\n\nDưới đây là một số tài liệu hiện có trong dự án bạn có thể tham khảo:\n");

            int count = 0;
            for (Document d : documents) {
                if (count++ >= 5) break;
                answerBuilder.append("• **").append(d.getTitle()).append("** (Định dạng: ").append(d.getFileCategory()).append(")\n");
            }
        } else {
            answerBuilder.append("Dựa trên các tài liệu trong dự án **").append(project.getName()).append("**, dưới đây là câu trả lời được tổng hợp:\n\n");

            int topCount = Math.min(scoredDocs.size(), 3);
            for (int i = 0; i < topCount; i++) {
                ScoredDoc sd = scoredDocs.get(i);
                references.add(ChatResponse.SourceReference.builder()
                        .documentId(sd.doc.getId())
                        .documentTitle(sd.doc.getTitle())
                        .originalFilename(sd.doc.getOriginalFilename())
                        .snippet(sd.snippet)
                        .score(Math.round(sd.score * 10.0) / 10.0)
                        .build());
            }

            // Tổng hợp thông tin từ tài liệu khớp nhất
            ScoredDoc topMatch = scoredDocs.get(0);
            answerBuilder.append("Thông tin quan trọng tìm thấy trong **[").append(topMatch.doc.getTitle()).append("]**:\n");
            answerBuilder.append("> ").append(topMatch.snippet.replaceAll("\n+", " ").trim()).append("\n\n");

            if (scoredDocs.size() > 1) {
                answerBuilder.append("Ngữ cảnh bổ sung từ **[").append(scoredDocs.get(1).doc.getTitle()).append("]**:\n");
                answerBuilder.append("> ").append(scoredDocs.get(1).snippet.replaceAll("\n+", " ").trim()).append("\n\n");
            }

            answerBuilder.append("Bạn có thể xem chi tiết hoặc tải về các tài liệu nguồn trích dẫn ở danh sách bên dưới.");
        }

        return ChatResponse.builder()
                .question(request.getQuestion())
                .answer(answerBuilder.toString())
                .projectId(projectId)
                .references(references)
                .build();
    }

    private int countOccurrences(String text, String term) {
        if (text == null || term == null || term.isEmpty()) return 0;
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(term, idx)) != -1) {
            count++;
            idx += term.length();
        }
        return count;
    }

    private String extractContextSnippet(String fullText, String term, int radius) {
        if (fullText == null || term == null) return "";
        int idx = fullText.toLowerCase().indexOf(term.toLowerCase());
        if (idx == -1) return "";

        int start = Math.max(0, idx - radius);
        int end = Math.min(fullText.length(), idx + term.length() + radius);

        String snippet = fullText.substring(start, end).trim();
        if (start > 0) snippet = "..." + snippet;
        if (end < fullText.length()) snippet = snippet + "...";
        return snippet;
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) return;

        throw new AccessDeniedException("Bạn không có quyền truy cập vào dự án này");
    }

    private record ScoredDoc(Document doc, double score, String snippet) {}
}
