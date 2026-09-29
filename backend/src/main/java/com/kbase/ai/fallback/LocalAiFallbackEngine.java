package com.kbase.ai.fallback;

import com.kbase.ai.rag.RagContextBuilder;
import com.kbase.ai.rag.ScoredDocument;
import com.kbase.dto.ChatRequest;
import com.kbase.dto.ChatResponse;
import com.kbase.model.Document;
import com.kbase.model.Project;
import com.kbase.model.Role;
import com.kbase.model.User;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectMemberRepository;
import com.kbase.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LocalAiFallbackEngine {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final RagContextBuilder ragContextBuilder;

    public ChatResponse processFallback(ChatRequest request, User currentUser, Project project, 
                                        List<Document> documents, List<Project> accessibleProjects,
                                        List<ScoredDocument> scoredDocs, List<ChatResponse.SourceReference> references,
                                        String scopeName) {
        String question = request.getQuestion();

        // 1. Nhận diện câu hỏi danh sách/số lượng tài liệu
        if (isDocumentListQuery(question)) {
            return handleDocumentListQuery(request, project, documents, accessibleProjects);
        }

        // 2. Nhận diện câu hỏi tổng quan các dự án trong hệ thống
        if (isProjectOverviewQuery(question)) {
            return handleProjectOverviewQuery(request, currentUser, project);
        }

        // 3. Nhận diện câu hỏi chào hỏi
        if (isGreetingQuery(question)) {
            return handleGreetingQuery(request, project, accessibleProjects);
        }

        // 4. Nếu không có tài liệu nào trong phạm vi
        if (documents.isEmpty()) {
            return handleEmptyDocuments(request, project, accessibleProjects);
        }

        // 5. Fallback sang bộ máy phân tích nội bộ (Local RAG)
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
            ScoredDocument topMatch = scoredDocs.get(0);
            String docTitle = topMatch.doc().getTitle();
            answerBuilder.append("Dựa trên tài liệu **").append(docTitle).append("** trong không gian **").append(scopeName).append("**, dưới đây là các thông tin liên quan đến câu hỏi của bạn:\n\n");

            String cleanSnippet = topMatch.snippet().replace("●", "\n- ").replace("○", "\n  * ");
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
                ScoredDocument secondMatch = scoredDocs.get(1);
                answerBuilder.append("\n**Thông tin bổ sung từ tài liệu [").append(secondMatch.doc().getTitle()).append("]:**\n");
                String cleanSnippet2 = secondMatch.snippet().replace("●", "\n- ").replace("○", "\n  * ");
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
                .answer(cleanMarkdown(answerBuilder.toString()))
                .modelUsed("local-fallback")
                .projectId(project != null ? project.getId() : 0L)
                .references(references)
                .build();
    }

    public boolean isProjectOverviewQuery(String question) {
        if (question == null || question.isBlank()) return false;
        String q = removeAccents(question.toLowerCase().trim());

        if (q.contains("tai lieu") || q.contains("tep") || q.contains("file") || q.contains("document") || q.contains("van ban")) {
            return false;
        }

        boolean hasProjectKeyword = q.contains("du an") || q.contains("project") || q.contains("khong gian");
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

    public boolean isGreetingQuery(String question) {
        if (question == null || question.isBlank()) return false;
        String q = removeAccents(question.toLowerCase().trim());
        return q.matches("^(xin chao|chao|chao ban|hello|hi|hey|alo|halo)(\\s.*)?$") ||
               q.contains("ban la ai") ||
               q.contains("ban co the lam gi") ||
               q.contains("ban lam duoc gi") ||
               q.contains("chuc nang cua ban");
    }

    public boolean isDocumentListQuery(String question) {
        if (question == null || question.isBlank()) return false;
        String q = removeAccents(question.toLowerCase().trim());

        boolean hasDocKeyword = q.contains("tai lieu") || q.contains("tep tin") || q.contains("file") || q.contains("tep") || q.contains("van ban") || q.contains("document");
        if (!hasDocKeyword) return false;

        if (q.contains("noi ve") || q.contains("ve gi") || q.contains("nhu the nao") || q.contains("giai thich") || q.contains("huong dan su dung")) {
            return false;
        }

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

    public ChatResponse handleDocumentListQuery(ChatRequest request, Project project, List<Document> documents, List<Project> accessibleProjects) {
        StringBuilder sb = new StringBuilder();
        int count = documents.size();

        if (count == 0) {
            String msg = (project != null)
                    ? "Dự án '" + project.getName() + "' hiện tại chưa có tài liệu nào được tải lên.\n\n💡 Bạn có thể vào tab 'Tài liệu' để tải tệp lên dự án này."
                    : "Toàn bộ hệ thống hiện tại chưa có tài liệu nào được tải lên.\n\n💡 Hãy tải tài liệu vào các dự án để tôi có thể hỗ trợ bạn.";
            return ChatResponse.builder()
                    .question(request.getQuestion())
                    .answer(cleanMarkdown(msg))
                    .modelUsed("local-fallback")
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
            String categoryName = ragContextBuilder.getCategoryDisplayName(d.getFileCategory());
            String sizeStr = ragContextBuilder.formatFileSize(d.getFileSize());
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
                .answer(cleanMarkdown(sb.toString()))
                .modelUsed("local-fallback")
                .projectId(project != null ? project.getId() : 0L)
                .references(references)
                .build();
    }

    public ChatResponse handleProjectOverviewQuery(ChatRequest request, User currentUser, Project currentSelectedProject) {
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
                .answer(cleanMarkdown(sb.toString()))
                .modelUsed("local-fallback")
                .projectId(currentSelectedProject != null ? currentSelectedProject.getId() : 0L)
                .references(Collections.emptyList())
                .build();
    }

    public ChatResponse handleGreetingQuery(ChatRequest request, Project currentSelectedProject, List<Project> accessibleProjects) {
        StringBuilder sb = new StringBuilder();
        sb.append("Xin chào! Tôi là Trợ Lý AI KBase, sẵn sàng hỗ trợ bạn tra cứu và phân tích tài liệu kỹ thuật trong hệ thống.\n\n");

        if (currentSelectedProject == null) {
            long totalDocs = accessibleProjects.stream().mapToLong(p -> documentRepository.countByProjectId(p.getId())).sum();
            sb.append("🌐 Chế độ tra cứu hiện tại: **Bao quát toàn bộ hệ thống** (Đang kết nối qua ").append(accessibleProjects.size()).append(" dự án, tổng cộng ").append(totalDocs).append(" tài liệu).\n\n");
            sb.append("👉 Bạn có thể hỏi bất kỳ câu hỏi nào về các dự án hoặc nội dung của tất cả tài liệu trong hệ thống!\n");
            sb.append("💡 (Nếu muốn hỏi riêng một dự án cụ thể, bạn có thể chọn tên dự án ở menu góc trên bên phải khung chat).");
            return ChatResponse.builder()
                    .question(request.getQuestion())
                    .answer(cleanMarkdown(sb.toString()))
                    .modelUsed("local-fallback")
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
                .answer(cleanMarkdown(sb.toString()))
                .modelUsed("local-fallback")
                .projectId(currentSelectedProject.getId())
                .references(Collections.emptyList())
                .build();
    }

    public ChatResponse handleEmptyDocuments(ChatRequest request, Project currentSelectedProject, List<Project> accessibleProjects) {
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
                .answer(cleanMarkdown(sb.toString()))
                .modelUsed("local-fallback")
                .projectId(currentSelectedProject != null ? currentSelectedProject.getId() : 0L)
                .references(Collections.emptyList())
                .build();
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd').replace('Đ', 'D');
    }

    private String cleanMarkdown(String text) {
        if (text == null) return "";
        return text
                .replaceAll("(?m)^#{1,6}\\s*", "")
                .replaceAll("\\*\\*", "")
                .replaceAll("`", "")
                .replaceAll("(?m)^\\*\\s+", "- ")
                .trim();
    }
}
