package com.kbase.service.impl;

import com.kbase.dto.ChatRequest;
import com.kbase.dto.ChatResponse;
import com.kbase.model.Document;
import com.kbase.model.Project;
import com.kbase.model.ProjectMember;
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
import java.text.Normalizer;
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

    @Value("${kbase.ai.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    private static final List<String> GEMINI_CANDIDATE_MODELS = List.of(
            "gemini-3.8-flash",
            "gemini-flash-lite-latest",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3.7-flash",
            "gemini-flash-latest"
    );

    private static final Pattern WORD_SPLITTER = Pattern.compile("[\\s,;:.?!()\"'\\[\\]{}]+");
    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "in", "for", "to",
            "what", "how", "where", "who", "when", "why", "of", "with", "as", "by", "from",
            "la", "va", "cua", "cac", "cho", "trong", "co", "nhu", "the_nao", "la_gi", "nhung",
            "tai", "lieu", "tai_lieu", "file", "tep", "tep_tin", "du_an", "gom", "nhung_gi"
    );

    @Override
    public ChatResponse askQuestion(ChatRequest request, User currentUser) {
        Long projectId = request.getProjectId();
        boolean isAllProjects = (projectId == null || projectId <= 0);

        List<Project> accessibleProjects = (currentUser.getRole() == Role.ROLE_ADMIN)
                ? projectRepository.findAllOrderByUpdatedAtDesc()
                : projectRepository.findAccessibleProjects(currentUser.getId());

        Project project = null;
        List<Document> documents = new ArrayList<>();

        if (!isAllProjects) {
            project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dự án với mã ID: " + projectId));
            checkProjectAccess(project, currentUser);
            documents = documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        } else {
            // Chế độ bao quát toàn bộ hệ thống / tất cả dự án
            if (!accessibleProjects.isEmpty()) {
                List<Long> pids = accessibleProjects.stream().map(Project::getId).toList();
                documents = documentRepository.findByProjectIdInOrderByCreatedAtDesc(pids);
            }
        }

        String question = request.getQuestion();
        String scopeName = (project != null) ? "Dự án " + project.getName() : "Toàn bộ hệ thống KBase";

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
            String docTitle = sd.doc.getTitle();
            if (isAllProjects && sd.doc.getProject() != null) {
                docTitle = "[" + sd.doc.getProject().getName() + "] " + docTitle;
            }
            references.add(ChatResponse.SourceReference.builder()
                    .documentId(sd.doc.getId())
                    .documentTitle(docTitle)
                    .originalFilename(sd.doc.getOriginalFilename())
                    .snippet(sd.snippet)
                    .score(Math.round(sd.score * 10.0) / 10.0)
                    .build());
        }

        // =========================================================================
        // 1. ƯU TIÊN HÀNG ĐẦU: TRẢ LỜI BẰNG GOOGLE GEMINI AI NẾU CÓ API KEY
        // =========================================================================
        boolean hasValidGeminiKey = (geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.contains("your_gemini_api_key"));
        if (hasValidGeminiKey) {
            String contextText = buildGeminiContext(project, documents, scoredDocs, accessibleProjects, searchTerms);
            String geminiAnswer = callGeminiApi(request.getQuestion(), contextText, scopeName);
            if (geminiAnswer != null && !geminiAnswer.isBlank()) {
                log.info("Trả lời câu hỏi thành công bằng Google Gemini model {}", geminiModel);

                // Nếu chưa có references từ scoredDocs nhưng dự án có tài liệu, đính kèm tài liệu vào tham chiếu
                if (references.isEmpty() && !documents.isEmpty()) {
                    int refLimit = Math.min(documents.size(), 3);
                    for (int i = 0; i < refLimit; i++) {
                        Document d = documents.get(i);
                        String docTitle = d.getTitle();
                        if (isAllProjects && d.getProject() != null) {
                            docTitle = "[" + d.getProject().getName() + "] " + docTitle;
                        }
                        references.add(ChatResponse.SourceReference.builder()
                                .documentId(d.getId())
                                .documentTitle(docTitle)
                                .originalFilename(d.getOriginalFilename())
                                .snippet("Tệp tài liệu: " + d.getOriginalFilename() + " (" + getCategoryDisplayName(d.getFileCategory()) + ")")
                                .score(10.0)
                                .build());
                    }
                }

                return ChatResponse.builder()
                        .question(request.getQuestion())
                        .answer(geminiAnswer)
                        .projectId(project != null ? project.getId() : 0L)
                        .references(references)
                        .build();
            }
        }

        // =========================================================================
        // 2. CHẾ ĐỘ DỰ PHÒNG NỘI BỘ (FALLBACK KHI GEMINI CHƯA CÓ KEY HOẶC SỰ CỐ MẠNG)
        // =========================================================================
        log.warn("Gemini không khả dụng hoặc chưa có key, chuyển sang bộ máy phân tích nội bộ (Local Fallback)");

        // 2.1 Nhận diện câu hỏi danh sách/số lượng tài liệu (ưu tiên trước câu hỏi tổng quan dự án)
        if (isDocumentListQuery(question)) {
            return handleDocumentListQuery(request, project, documents, accessibleProjects);
        }

        // 2.2 Nhận diện câu hỏi tổng quan các dự án trong hệ thống
        if (isProjectOverviewQuery(question)) {
            return handleProjectOverviewQuery(request, currentUser, project);
        }

        // 2.3 Nhận diện câu hỏi chào hỏi
        if (isGreetingQuery(question)) {
            return handleGreetingQuery(request, project, accessibleProjects);
        }

        // 2.4 Nếu không có tài liệu nào trong phạm vi
        if (documents.isEmpty()) {
            return handleEmptyDocuments(request, project, accessibleProjects);
        }

        // 2.5 Fallback sang bộ máy phân tích nội bộ (Local RAG)
        StringBuilder answerBuilder = new StringBuilder();

        if (scoredDocs.isEmpty()) {
            answerBuilder.append("Tôi đã tra cứu qua ")
                    .append(documents.size())
                    .append(" tài liệu trong ")
                    .append(project != null ? "dự án '" + project.getName() + "'" : "toàn bộ hệ thống")
                    .append(", nhưng không tìm thấy thông tin khớp trực tiếp cho câu hỏi: \"")
                    .append(request.getQuestion())
                    .append("\".\n\nDưới đây là một số tài liệu bạn có thể tham khảo:\n");

            int count = 0;
            for (Document d : documents) {
                if (count++ >= 5) break;
                String pPrefix = (project == null && d.getProject() != null) ? "[" + d.getProject().getName() + "] " : "";
                answerBuilder.append("• **").append(pPrefix).append(d.getTitle()).append("** (Định dạng: ").append(d.getFileCategory()).append(")\n");
            }
        } else {
            ScoredDoc topMatch = scoredDocs.get(0);
            String docTitle = topMatch.doc.getTitle();
            answerBuilder.append("Dựa trên tài liệu **").append(docTitle).append("** trong không gian **").append(scopeName).append("**, dưới đây là các thông tin liên quan đến câu hỏi của bạn:\n\n");

            // Format snippet sạch sẽ, xử lý các dấu đầu dòng và ngắt câu rõ ràng
            String cleanSnippet = topMatch.snippet.replace("●", "\n- ").replace("○", "\n  * ");
            String[] lines = cleanSnippet.split("\n");
            for (String l : lines) {
                String trimmed = l.trim();
                if (!trimmed.isEmpty()) {
                    if (trimmed.startsWith("-") || trimmed.startsWith("*") || Character.isDigit(trimmed.charAt(0))) {
                        answerBuilder.append(trimmed).append("\n");
                    } else {
                        answerBuilder.append("- ").append(trimmed).append("\n");
                    }
                }
            }

            if (scoredDocs.size() > 1) {
                ScoredDoc secondMatch = scoredDocs.get(1);
                answerBuilder.append("\n**Thông tin bổ sung từ tài liệu [").append(secondMatch.doc.getTitle()).append("]:**\n");
                String cleanSnippet2 = secondMatch.snippet.replace("●", "\n- ").replace("○", "\n  * ");
                for (String l : cleanSnippet2.split("\n")) {
                    String trimmed = l.trim();
                    if (!trimmed.isEmpty()) {
                        answerBuilder.append("- ").append(trimmed).append("\n");
                    }
                }
            }

            answerBuilder.append("\n💡 Bạn có thể xem chi tiết tài liệu đính kèm bên dưới để đọc toàn bộ văn bản.");
        }

        return ChatResponse.builder()
                .question(request.getQuestion())
                .answer(cleanMarkdownFormatting(answerBuilder.toString()))
                .projectId(project != null ? project.getId() : 0L)
                .references(references)
                .build();
    }

    private String buildGeminiContext(Project project, List<Document> allDocs, List<ScoredDoc> scoredDocs, List<Project> accessibleProjects, Set<String> searchTerms) {
        StringBuilder sb = new StringBuilder();

        if (project != null) {
            // --- THÔNG TIN KHÔNG GIAN DỰ ÁN HIỆN TẠI ---
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
            // --- PHẠM VI TRA CỨU: TOÀN BỘ HỆ THỐNG KBASE (TẤT CẢ DỰ ÁN) ---
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

        // --- DANH SÁCH CHI TIẾT TÀI LIỆU ---
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

        // --- CHI TIẾT NỘI DUNG TÀI LIỆU (CHO CÂU HỎI VỀ KIẾN THỨC/NỘI DUNG) ---
        List<Document> docsWithContent = new ArrayList<>();
        if (!scoredDocs.isEmpty()) {
            int limit = Math.min(scoredDocs.size(), 3);
            for (int i = 0; i < limit; i++) {
                docsWithContent.add(scoredDocs.get(i).doc);
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
                        // Tài liệu lớn hơn 70.000 ký tự: Luôn lấy mục lục & trích xuất sâu các chương mục khớp từ khóa
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

    private String extractRelevantSections(String fullText, Set<String> searchTerms, int maxChars) {
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

    private String callGeminiApi(String question, String context, String projectName) {
        try {
            String prompt = String.format("""
                    Bạn là Trợ lý AI chuyên gia kỹ thuật cao cấp của hệ thống Quản lý tri thức KBase.
                    Nhiệm vụ: Hãy phân tích thấu đáo câu hỏi của người dùng và trả lời một cách CHUYÊN SÂU, TOÀN DIỆN, CHI TIẾT và CHÍNH XÁC dựa trên nội dung tài liệu và ngữ cảnh dưới đây.
                    
                    Ngữ cảnh không gian: %s
                    
                    Quy tắc trả lời:
                    1. Trả lời bằng Tiếng Việt tự nhiên, chuẩn mực kỹ thuật, đi thẳng vào trọng tâm câu hỏi.
                    2. Nếu người dùng hỏi về một tính năng, dịch vụ (Service), module hoặc quy trình (ví dụ: 'service auction', 'bidding', 'đấu giá', 'thanh toán', 'xác thực'):
                       - Hãy đọc kỹ toàn bộ các phần chức năng liên quan trong tài liệu được cung cấp.
                       - Trình bày chi tiết, có cấu trúc rõ ràng:
                         + Mục tiêu và vai trò của dịch vụ (Overview / Purpose).
                         + Các chức năng chính (Key Features / Sub-functions, ví dụ: Quản lý đấu giá, Đặt giá thầu Bidding, Thanh toán kết thúc phiên Auction Settlement...).
                         + Quy tắc nghiệp vụ (Business Rules, điều kiện tạo, kiểm tra tính hợp lệ, bước giá bid increment...).
                         + Vòng đời & trạng thái (Auction Lifecycle, các trạng thái diễn ra).
                       - Tuyệt đối không trả lời qua loa, chung chung hay dừng lại ở mức suy đoán nếu trong tài liệu đã có thông tin.
                    3. Nếu người dùng hỏi về số lượng tài liệu hoặc tổng quan dự án, hãy trả lời chính xác số lượng và tên các tài liệu đó.
                    4. Định dạng dễ đọc: Sử dụng tiêu đề phân mục in đậm hoặc viết hoa, gạch đầu dòng '-' hoặc số thứ tự '1.', '2.'. Tuyệt đối không dùng ký hiệu markdown thăng '#' làm tiêu đề.
                    
                    ---
                    [NGỮ CẢNH DỮ LIỆU KBASE]:
                    %s
                    ---
                    [CÂU HỎI CỦA NGƯỜI DÙNG]:
                    %s
                    """, projectName, context, question);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            List<String> modelsToTry = new ArrayList<>();
            if (geminiModel != null && !geminiModel.isBlank()) {
                modelsToTry.add(geminiModel.trim());
            }
            for (String cm : GEMINI_CANDIDATE_MODELS) {
                if (!modelsToTry.contains(cm)) {
                    modelsToTry.add(cm);
                }
            }

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(6))
                    .build();

            for (String currentModel : modelsToTry) {
                try {
                    String url = "https://generativelanguage.googleapis.com/v1beta/models/" + currentModel + ":generateContent?key=" + geminiApiKey;

                    HttpRequest httpRequest = HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .header("Content-Type", "application/json")
                            .timeout(Duration.ofSeconds(25))
                            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                            .build();

                    HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

                    if (response.statusCode() == 200) {
                        JsonNode rootNode = objectMapper.readTree(response.body());
                        JsonNode textNode = rootNode.at("/candidates/0/content/parts/0/text");
                        if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                            log.info("Trả lời câu hỏi thành công bằng Google Gemini model {}", currentModel);
                            return cleanMarkdownFormatting(textNode.asText());
                        }
                    } else {
                        log.warn("Gemini model {} phản hồi mã lỗi: {}, tự động chuyển model dự phòng...", currentModel, response.statusCode());
                    }
                } catch (Exception e) {
                    log.warn("Lỗi khi kết nối Google Gemini model {}: {}, thử model tiếp theo...", currentModel, e.getMessage());
                }
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
        snippet = snippet.replaceAll("^[.\\s,;]+", "");
        return snippet;
    }

    private boolean isProjectOverviewQuery(String question) {
        if (question == null || question.isBlank()) return false;
        String q = removeAccents(question.toLowerCase().trim());

        // Loại trừ nếu câu hỏi đang hỏi về tài liệu, tệp tin
        if (q.contains("tai lieu") || q.contains("tep") || q.contains("file") || q.contains("document") || q.contains("van ban")) {
            return false;
        }

        boolean hasProjectKeyword = q.contains("du an") || q.contains("project") || q.contains("khong gian");
        
        // Loại trừ các câu hỏi đang hỏi về thành viên, chủ dự án, hay con người cụ thể trong dự án
        if (hasProjectKeyword && (q.matches(".*\\bthanh vien\\b.*") || q.matches(".*\\bnguoi\\b.*") || q.matches(".*\\bchu\\b.*") || q.matches(".*\\bai\\b.*"))) {
            return false;
        }

        if (hasProjectKeyword) {
            return q.contains("bao nhieu") ||
                   q.contains("may du an") ||
                   q.contains("co may") ||
                   q.contains("may cai") ||
                   q.contains("danh sach") ||
                   q.contains("cac du an") ||
                   q.contains("nhung du an") ||
                   q.contains("co nhung") ||
                   q.contains("du an nao") ||
                   q.contains("tong so") ||
                   q.contains("so luong") ||
                   q.contains("ke ten") ||
                   q.contains("liet ke") ||
                   q.contains("hien co") ||
                   q.contains("cua toi") ||
                   q.contains("trong he thong") ||
                   q.contains("tat ca") ||
                   q.contains("list") ||
                   q.contains("how many") ||
                   q.contains("which") ||
                   q.contains("what");
        }

        return q.equals("co bao nhieu") ||
               q.contains("co bao nhieu project") ||
               q.contains("danh sach project");
    }

    private boolean isGreetingQuery(String question) {
        if (question == null || question.isBlank()) return false;
        String q = removeAccents(question.toLowerCase().trim());
        return q.matches("^(xin chao|chao|chao ban|hello|hi|hey|alo|halo)(\\s.*)?$") ||
               q.contains("ban la ai") ||
               q.contains("ban co the lam gi") ||
               q.contains("ban lam duoc gi") ||
               q.contains("chuc nang cua ban");
    }

    private boolean isDocumentListQuery(String question) {
        if (question == null || question.isBlank()) return false;
        String q = removeAccents(question.toLowerCase().trim());

        boolean hasDocKeyword = q.contains("tai lieu") || q.contains("tep tin") || q.contains("file") || q.contains("tep") || q.contains("van ban") || q.contains("document");
        if (!hasDocKeyword) return false;

        // Loại trừ nếu câu hỏi đang hỏi sâu về nội dung bên trong một tài liệu cụ thể
        if (q.contains("noi ve") || q.contains("ve gi") || q.contains("nhu the nao") || q.contains("giai thich") || q.contains("huong dan su dung")) {
            return false;
        }

        // Nhận diện câu hỏi liệt kê, số lượng, danh sách tài liệu
        return q.contains("gom nhung") ||
               q.contains("co nhung") ||
               q.contains("nhung tai lieu nao") ||
               q.contains("tai lieu nao") ||
               q.contains("file nao") ||
               q.contains("danh sach") ||
               q.contains("liet ke") ||
               q.contains("ke ten") ||
               q.contains("bao nhieu") ||
               q.contains("co may") ||
               q.contains("may tai lieu") ||
               q.contains("may file") ||
               q.contains("tai lieu gi") ||
               q.contains("file gi") ||
               q.contains("tep gi") ||
               q.contains("co tai lieu gi") ||
               q.contains("co file gi") ||
               q.contains("tat ca tai lieu") ||
               q.contains("cac tai lieu") ||
               q.contains("nhung tai lieu") ||
               q.contains("list") ||
               q.contains("what document") ||
               q.contains("which document") ||
               q.contains("how many document");
    }

    private ChatResponse handleDocumentListQuery(ChatRequest request, Project project, List<Document> documents, List<Project> accessibleProjects) {
        StringBuilder sb = new StringBuilder();
        int count = documents.size();

        if (count == 0) {
            String msg = (project != null)
                    ? "Dự án '" + project.getName() + "' hiện tại chưa có tài liệu nào được tải lên.\n\n💡 Bạn có thể vào tab 'Tài liệu' để tải tệp lên dự án này."
                    : "Toàn bộ hệ thống hiện tại chưa có tài liệu nào được tải lên.\n\n💡 Hãy tải tài liệu vào các dự án để tôi có thể hỗ trợ bạn.";
            return ChatResponse.builder()
                    .question(request.getQuestion())
                    .answer(cleanMarkdownFormatting(msg))
                    .projectId(project != null ? project.getId() : 0L)
                    .references(Collections.emptyList())
                    .build();
        }

        if (project != null) {
            sb.append("Dự án '").append(project.getName()).append("' hiện có ").append(count).append(" tài liệu được lưu trữ:\n\n");
        } else {
            sb.append("Toàn bộ hệ thống KBase hiện có ").append(count).append(" tài liệu được lưu trữ qua ")
              .append(accessibleProjects.size()).append(" dự án:\n\n");
        }

        List<ChatResponse.SourceReference> references = new ArrayList<>();

        for (int i = 0; i < documents.size(); i++) {
            Document d = documents.get(i);
            String categoryName = getCategoryDisplayName(d.getFileCategory());
            String sizeStr = formatFileSize(d.getFileSize());
            String projName = (d.getProject() != null) ? d.getProject().getName() : "Chung";

            sb.append(i + 1).append(". ").append(d.getTitle()).append("\n");
            if (project == null) {
                sb.append("   - Thuộc dự án: ").append(projName).append("\n");
            }
            sb.append("   - Tên tệp gốc: ").append(d.getOriginalFilename()).append("\n");
            sb.append("   - Phân loại: ").append(categoryName).append(" | Dung lượng: ").append(sizeStr).append("\n");
            if (d.getSummary() != null && !d.getSummary().isBlank()) {
                sb.append("   - Tóm tắt: ").append(d.getSummary()).append("\n");
            }
            sb.append("\n");

            references.add(ChatResponse.SourceReference.builder()
                    .documentId(d.getId())
                    .documentTitle((project == null ? "[" + projName + "] " : "") + d.getTitle())
                    .originalFilename(d.getOriginalFilename())
                    .snippet("Tệp: " + d.getOriginalFilename() + " (" + categoryName + ", " + sizeStr + ")")
                    .score(10.0)
                    .build());
        }

        sb.append("💡 Bạn có thể bấm vào các thẻ tài liệu trích dẫn bên dưới để xem nội dung hoặc tải tệp về máy.");

        return ChatResponse.builder()
                .question(request.getQuestion())
                .answer(cleanMarkdownFormatting(sb.toString()))
                .projectId(project != null ? project.getId() : 0L)
                .references(references)
                .build();
    }

    private String getCategoryDisplayName(com.kbase.model.FileCategory category) {
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

    private String formatFileSize(Long bytes) {
        if (bytes == null || bytes <= 0) return "0 KB";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'D');
    }

    private ChatResponse handleProjectOverviewQuery(ChatRequest request, User currentUser, Project currentSelectedProject) {
        List<Project> accessibleProjects = (currentUser.getRole() == Role.ROLE_ADMIN)
                ? projectRepository.findAllOrderByUpdatedAtDesc()
                : projectRepository.findAccessibleProjects(currentUser.getId());

        int totalProjects = accessibleProjects.size();
        StringBuilder sb = new StringBuilder();
        sb.append("Hiện tại bạn có quyền truy cập vào ").append(totalProjects).append(" không gian dự án trong hệ thống KBase:\n\n");

        for (int i = 0; i < accessibleProjects.size(); i++) {
            Project p = accessibleProjects.get(i);
            long docCount = documentRepository.countByProjectId(p.getId());
            int memberCount = projectMemberRepository.findByProjectId(p.getId()).size() + 1;

            sb.append(i + 1).append(". ").append(p.getName()).append("\n");
            if (p.getDescription() != null && !p.getDescription().isBlank()) {
                sb.append("   - Mô tả: ").append(p.getDescription()).append("\n");
            }
            sb.append("   - Số tài liệu: ").append(docCount).append(" tệp | Thành viên: ").append(memberCount).append(" người\n\n");
        }

        sb.append("💡 Lưu ý về phạm vi hỏi đáp của Trợ Lý AI:\n");
        if (currentSelectedProject == null) {
            sb.append("- Khung chat hiện đang ở chế độ **Bao quát toàn bộ hệ thống** (Tất cả dự án). Bạn có thể hỏi bất kỳ câu hỏi nào từ bất kỳ tài liệu nào trong tất cả các dự án trên!\n");
            sb.append("- Nếu bạn muốn thu hẹp phạm vi vào riêng một dự án, bạn có thể chọn dự án cụ thể ở menu góc trên bên phải khung chat nhé.");
        } else {
            sb.append("- Khung chat hiện tại đang chọn ngữ cảnh dự án: '").append(currentSelectedProject.getName()).append("'.\n");
            long currentDocCount = documentRepository.countByProjectId(currentSelectedProject.getId());
            if (currentDocCount == 0) {
                sb.append("- Dự án này hiện chưa có tài liệu nào tải lên. Bạn có thể chọn '🌐 Tất cả dự án' ở menu góc trên bên phải để tra cứu toàn bộ hệ thống nhé!");
            } else {
                sb.append("- Dự án này hiện có ").append(currentDocCount).append(" tài liệu. Bạn có thể hỏi bất kỳ câu hỏi nào về nội dung của các tài liệu trong dự án này.");
            }
        }

        return ChatResponse.builder()
                .question(request.getQuestion())
                .answer(cleanMarkdownFormatting(sb.toString()))
                .projectId(currentSelectedProject != null ? currentSelectedProject.getId() : 0L)
                .references(Collections.emptyList())
                .build();
    }

    private ChatResponse handleGreetingQuery(ChatRequest request, Project currentSelectedProject, List<Project> accessibleProjects) {
        StringBuilder sb = new StringBuilder();
        sb.append("Xin chào! Tôi là Trợ Lý AI KBase, sẵn sàng hỗ trợ bạn tra cứu và phân tích tài liệu kỹ thuật trong hệ thống.\n\n");

        if (currentSelectedProject == null) {
            long totalDocs = accessibleProjects.stream().mapToLong(p -> documentRepository.countByProjectId(p.getId())).sum();
            sb.append("🌐 Chế độ tra cứu hiện tại: **Bao quát toàn bộ hệ thống** (Đang kết nối qua ").append(accessibleProjects.size()).append(" dự án, tổng cộng ").append(totalDocs).append(" tài liệu).\n\n");
            sb.append("👉 Bạn có thể hỏi bất kỳ câu hỏi nào về các dự án hoặc nội dung của tất cả tài liệu trong hệ thống!\n");
            sb.append("💡 (Nếu muốn hỏi riêng một dự án cụ thể, bạn có thể chọn tên dự án ở menu góc trên bên phải khung chat).");
            return ChatResponse.builder()
                    .question(request.getQuestion())
                    .answer(cleanMarkdownFormatting(sb.toString()))
                    .projectId(0L)
                    .references(Collections.emptyList())
                    .build();
        }

        sb.append("Khung chat hiện tại đang chọn dự án: '").append(currentSelectedProject.getName()).append("'.\n");

        long currentDocCount = documentRepository.countByProjectId(currentSelectedProject.getId());
        if (currentDocCount == 0) {
            sb.append("Dự án này hiện chưa có tài liệu nào được tải lên.\n\n");
            sb.append("👉 Bạn có thể:\n");
            sb.append("1. Tải tài liệu (.pdf, .docx, .txt, ...) lên dự án này ở tab 'Tài liệu'.\n");

            List<Project> projectsWithDocs = accessibleProjects.stream()
                    .filter(p -> documentRepository.countByProjectId(p.getId()) > 0)
                    .toList();
            if (!projectsWithDocs.isEmpty()) {
                sb.append("2. Hoặc chọn '🌐 Tất cả dự án' (ở menu góc trên bên phải) để tôi tra cứu toàn bộ tài liệu trong hệ thống!\n");
            }
        } else {
            sb.append("Dự án này hiện có ").append(currentDocCount).append(" tài liệu. Bạn có thể đặt câu hỏi về các tài liệu này bất cứ lúc nào!");
        }

        return ChatResponse.builder()
                .question(request.getQuestion())
                .answer(cleanMarkdownFormatting(sb.toString()))
                .projectId(currentSelectedProject.getId())
                .references(Collections.emptyList())
                .build();
    }

    private ChatResponse handleEmptyDocuments(ChatRequest request, Project currentSelectedProject, List<Project> accessibleProjects) {
        StringBuilder sb = new StringBuilder();
        if (currentSelectedProject != null) {
            sb.append("Dự án '").append(currentSelectedProject.getName()).append("' hiện tại chưa có tài liệu nào được tải lên hệ thống.\n\n");
            sb.append("💡 Bạn có thể chọn chế độ '🌐 Tất cả dự án' ở góc trên bên phải khung chat để tôi tra cứu toàn bộ tài liệu hiện có trong hệ thống nhé!");
        } else {
            sb.append("Toàn bộ hệ thống hiện tại chưa có tài liệu nào được tải lên.\n\n");
            sb.append("💡 Hãy tải tài liệu (.pdf, .docx, .txt...) vào các dự án để tôi có thể phân tích và trả lời câu hỏi của bạn.");
        }

        return ChatResponse.builder()
                .question(request.getQuestion())
                .answer(cleanMarkdownFormatting(sb.toString()))
                .projectId(currentSelectedProject != null ? currentSelectedProject.getId() : 0L)
                .references(Collections.emptyList())
                .build();
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) return;

        throw new AccessDeniedException("Bạn không có quyền truy cập vào dự án này");
    }

    private record ScoredDoc(Document doc, double score, String snippet) {}
}
