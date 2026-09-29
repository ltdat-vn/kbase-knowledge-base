package com.kbase.service.impl;

import com.kbase.ai.client.GeminiApiClient;
import com.kbase.ai.client.GeminiResponse;
import com.kbase.ai.fallback.LocalAiFallbackEngine;
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
import com.kbase.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatServiceImpl implements AiChatService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final GeminiApiClient geminiApiClient;
    private final RagContextBuilder ragContextBuilder;
    private final LocalAiFallbackEngine localAiFallbackEngine;

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
            if (!accessibleProjects.isEmpty()) {
                List<Long> pids = accessibleProjects.stream().map(Project::getId).toList();
                documents = documentRepository.findByProjectIdInOrderByCreatedAtDesc(pids);
            }
        }

        String scopeName = (project != null) ? "Dự án " + project.getName() : "Toàn bộ hệ thống KBase";
        Set<String> searchTerms = ragContextBuilder.extractSearchTerms(request.getQuestion());
        List<ScoredDocument> scoredDocs = ragContextBuilder.scoreDocuments(documents, searchTerms);

        List<ChatResponse.SourceReference> references = new ArrayList<>();
        int topCount = Math.min(scoredDocs.size(), 3);
        for (int i = 0; i < topCount; i++) {
            ScoredDocument sd = scoredDocs.get(i);
            String docTitle = sd.doc().getTitle();
            if (isAllProjects && sd.doc().getProject() != null) {
                docTitle = "[" + sd.doc().getProject().getName() + "] " + docTitle;
            }
            references.add(ChatResponse.SourceReference.builder()
                    .documentId(sd.doc().getId())
                    .documentTitle(docTitle)
                    .originalFilename(sd.doc().getOriginalFilename())
                    .snippet(sd.snippet())
                    .score(Math.round(sd.score() * 10.0) / 10.0)
                    .build());
        }

        // 1. ƯU TIÊN HÀNG ĐẦU: TRẢ LỜI BẰNG GOOGLE GEMINI AI NẾU CÓ API KEY
        if (geminiApiClient.hasValidApiKey()) {
            String contextText = ragContextBuilder.buildGeminiContext(project, documents, scoredDocs, accessibleProjects, searchTerms);
            GeminiResponse geminiResponse = geminiApiClient.generateAnswer(request.getQuestion(), contextText, scopeName);

            if (geminiResponse != null && geminiResponse.answer() != null && !geminiResponse.answer().isBlank()) {
                log.info("Trả lời câu hỏi thành công bằng Google Gemini model {}", geminiResponse.modelUsed());

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
                                .snippet("Tệp tài liệu: " + d.getOriginalFilename() + " (" + ragContextBuilder.getCategoryDisplayName(d.getFileCategory()) + ")")
                                .score(10.0)
                                .build());
                    }
                }

                return ChatResponse.builder()
                        .question(request.getQuestion())
                        .answer(geminiResponse.answer())
                        .modelUsed(geminiResponse.modelUsed())
                        .projectId(project != null ? project.getId() : 0L)
                        .references(references)
                        .build();
            }
        }

        // 2. CHẾ ĐỘ DỰ PHÒNG NỘI BỘ (FALLBACK)
        log.warn("Gemini không khả dụng hoặc chưa có key, chuyển sang bộ máy phân tích nội bộ (Local Fallback)");
        return localAiFallbackEngine.processFallback(
                request, currentUser, project, documents, accessibleProjects, scoredDocs, references, scopeName
        );
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) return;

        throw new AccessDeniedException("Bạn không có quyền truy cập vào dự án này");
    }
}
