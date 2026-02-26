package com.cookshare.repository;

import com.cookshare.entity.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire,Long> {

    List<Commentaire> findByRecetteId(Long recetteId);

    List<Commentaire> findByAuteurId(Long auteurId);

    @Query("SELECT COUNT(c) FROM Commentaire c WHERE c.recette.id = :recetteId")
    Long countByRecetteId(Long recetteId);


}
