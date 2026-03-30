package com.cookshare.repository;

import com.cookshare.entity.Favoris;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriRepository extends JpaRepository<Favoris, Long> {

    Boolean existsByAuteurIdAndRecetteId(Long auteurId, Long recetteId);

    Optional<Favoris> findByAuteurIdAndRecetteId(Long auteurId, Long recetteId);

    List<Favoris> findByAuteurId(Long auteurId);
}