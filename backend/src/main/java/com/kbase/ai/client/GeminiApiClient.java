package com.kbase.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiApiClient {

    private final ObjectMapper objectMapper;

    @Value("${kbase.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${kbase.ai.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    private static final List<String> GEMINI_CANDIDATE_MODELS = List.of(
            "gemini-3.8-flash",
            "gemini-3-flash-preview",
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-flash-lite-latest",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-flash-latest"
    );

    public boolean hasValidApiKey() {
        return geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.contains("your_gemini_api_key");
    }

    public GeminiResponse generateAnswer(String question, String context, String projectName) {
        if (!hasValidApiKey()) {
            return null;
        }

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
                            return new GeminiResponse(cleanMarkdownFormatting(textNode.asText()), currentModel);
                        }
                    } else {
                        log.warn("Gemini model {} phản hồi mã lỗi: {}, tự động chuyển model dự phòng...", currentModel, response.statusCode());
                    }
                } catch (Exception e) {
                    log.warn("Lỗi khi kết nối Google Gemini model {}: {}, thử model tiếp theo...", currentModel, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi kết nối Google Gemini API: {}", e.getMessage());
        }
        return null;
    }

    public String cleanMarkdownFormatting(String text) {
        if (text == null) return "";
        return text
                .replaceAll("(?m)^#{1,6}\\s*", "")
                .replaceAll("\\*\\*", "")
                .replaceAll("`", "")
                .replaceAll("(?m)^\\*\\s+", "- ")
                .trim();
    }
}
