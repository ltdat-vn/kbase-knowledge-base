package com.kbase.repository;

import com.kbase.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerId(Long ownerId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner.id = :userId OR m.user.id = :userId ORDER BY p.updatedAt DESC")
    List<Project> findAccessibleProjects(@Param("userId") Long userId);

    @Query("SELECT p FROM Project p ORDER BY p.updatedAt DESC")
    List<Project> findAllOrderByUpdatedAtDesc();
}
