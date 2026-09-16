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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatServiceImpl implements AiChatService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ObjectMapper objectMapper;

    @Value("${kbase.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${kbase.ai.gemini.model:gemini-3.6-flash}")
    private String geminiModel;

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

        // 1. Thử gọi Google Gemini nếu có API key
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            String contextText = buildGeminiContext(documents, scoredDocs);
            String geminiAnswer = callGeminiApi(request.getQuestion(), contextText, project.getName());
            if (geminiAnswer != null && !geminiAnswer.isBlank()) {
                log.info("Trả lời câu hỏi thành công bằng Google Gemini model {}", geminiModel);
                return ChatResponse.builder()
                        .question(request.getQuestion())
                        .answer(geminiAnswer)
                        .projectId(projectId)
                        .references(references)
                        .build();
            }
        }

        // 2. Fallback sang bộ máy phân tích nội bộ (Local RAG)
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
                .answer(cleanMarkdownFormatting(answerBuilder.toString()))
                .projectId(projectId)
                .references(references)
                .build();
    }

    private String buildGeminiContext(List<Document> allDocs, List<ScoredDoc> scoredDocs) {
        StringBuilder sb = new StringBuilder();
        if (!scoredDocs.isEmpty()) {
            int limit = Math.min(scoredDocs.size(), 3);
            for (int i = 0; i < limit; i++) {
                Document doc = scoredDocs.get(i).doc;
                sb.append("--- TÀI LIỆU: ").append(doc.getTitle()).append(" (Tên tệp: ").append(doc.getOriginalFilename()).append(") ---\n");
                if (doc.getTextContent() != null && !doc.getTextContent().isBlank()) {
                    String snippet = doc.getTextContent();
                    if (snippet.length() > 3000) snippet = snippet.substring(0, 3000) + "...";
                    sb.append(snippet).append("\n\n");
                } else if (doc.getSummary() != null) {
                    sb.append(doc.getSummary()).append("\n\n");
                }
            }
        } else {
            for (Document doc : allDocs) {
                sb.append("• ").append(doc.getTitle()).append(" - ").append(doc.getOriginalFilename());
                if (doc.getSummary() != null) sb.append(": ").append(doc.getSummary());
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    private String callGeminiApi(String question, String context, String projectName) {
        try {
            String prompt = String.format("""
                    Bạn là Trợ lý AI chuyên gia của hệ thống KBase.
                    Hãy trả lời câu hỏi của người dùng bằng Tiếng Việt một cách tự nhiên, rõ ràng, mạch lạc dựa trên ngữ cảnh tài liệu dự án "%s" dưới đây.
                    
                    Quy tắc trình bày:
                    1. TUYỆT ĐỐI KHÔNG sử dụng các ký hiệu markdown như '###', '##', '#', '**', '*', '`'.
                    2. Không dùng dấu thăng '#' để làm tiêu đề. Hãy xuống dòng và viết hoa chữ cái đầu tiêu đề bình thường.
                    3. Không dùng dấu sao kép '**' để in đậm.
                    4. Khi liệt kê các ý, dùng dấu gạch đầu dòng '-' đơn giản hoặc số thứ tự 1, 2, 3, tuyệt đối không dùng dấu sao '*'.
                    5. Dựa sát vào thông tin có trong ngữ cảnh tài liệu. Nếu tài liệu không đề cập đến nội dung câu hỏi, hãy nói rõ là tài liệu dự án hiện chưa có thông tin này.
                    
                    ---
                    [NGỮ CẢNH TÀI LIỆU DỰ ÁN]:
                    %s
                    ---
                    [CÂU HỎI]:
                    %s
                    """, projectName, context, question);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");
                if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                    return cleanMarkdownFormatting(textNode.asText());
                }
            } else {
                log.warn("Gemini API phản hồi mã lỗi: {}, nội dung: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Lỗi khi kết nối Google Gemini API, tự động chuyển về chế độ nội bộ: {}", e.getMessage());
        }
        return null;
    }

    private String cleanMarkdownFormatting(String text) {
        if (text == null) return "";
        return text
                .replaceAll("(?m)^#{1,6}\\s*", "")
                .replaceAll("\\*\\*", "")
                .replaceAll("`", "")
                .replaceAll("(?m)^\\*\\s+", "- ")
                .trim();
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
