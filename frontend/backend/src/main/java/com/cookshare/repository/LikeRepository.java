package com.cookshare.repository;

import com.cookshare.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Integer> {

    Boolean existsByAuteurIdAndRecetteId(Long auteurId, Long recetteId);

    Optional<Like> findByAuteurIdAndRecetteId(Long auteurId, Long recetteId);

    List<Like> findByAuteurId(Long auteurId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.recette.id = :recetteId")
    Long countByRecetteId(Long recetteId);
}
