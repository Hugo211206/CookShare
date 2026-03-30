package com.cookshare.repository;

import com.cookshare.entity.ListeCourses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListeCoursesRepository extends JpaRepository<ListeCourses, Long> {

    List<ListeCourses> findByAuteurIdAndRecetteId(Long auteurId, Long recetteId);

    Optional<ListeCourses> findByAuteurIdAndRecetteIdAndIngredientId(
            Long auteurId, Long recetteId, Long ingredientId);

    Boolean existsByAuteurIdAndRecetteIdAndIngredientId(
            Long auteurId, Long recetteId, Long ingredientId);
}