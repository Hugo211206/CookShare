package com.cookshare.repository;

import com.cookshare.entity.Cuisine;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecetteRepository extends JpaRepository<Recette, Long> {

    Optional<Recette> findRecetteById(Long id);

    List<Recette> findByAuteur(Utilisateur auteur);

    List<Recette> findByDifficulte(Recette.DifficulteEnum difficulte);

    List<Recette> findByTitreContaining(String titre);

    List<Recette> OrderByDatePublicationDesc();

    List<Recette> OrderByDatePublicationAsc();

    List<Recette> findByCuisine (Cuisine cuisine);

    List<Recette> findByTypePlat(Recette.TypePlat typePlat);

    List<Recette> findByAuteurOrderByDatePublicationDesc(Utilisateur auteur);


}
