package com.kbase.repository;

import com.kbase.model.Document;
import com.kbase.model.FileCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Document> findByProjectIdAndFileCategoryOrderByCreatedAtDesc(Long projectId, FileCategory fileCategory);

    @Query("SELECT d FROM Document d WHERE d.project.id = :projectId AND " +
           "(LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.textContent) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Document> searchByProjectAndQuery(@Param("projectId") Long projectId, @Param("query") String query);

    long countByProjectId(Long projectId);

    @Query("SELECT SUM(d.fileSize) FROM Document d")
    Long getTotalStorageUsed();
}
