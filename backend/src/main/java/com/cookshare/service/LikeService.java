package com.cookshare.service;


import com.cookshare.entity.Like;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.LikeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeService {

    private final LikeRepository likeRepository;
    private final RecetteService recetteService;
    private final UtilisateurService utilisateurService;
    private final NotificationService notificationService;


    public boolean LikerRecette (Long recetteId, Long auteurId) {
        Recette recette = recetteService.findRecetteByID(recetteId)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));

        Utilisateur auteur = utilisateurService.getUtilisateurById(auteurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (likeRepository.existsByAuteurIdAndRecetteId(auteurId, recetteId)) {
            Like like = likeRepository.findByAuteurIdAndRecetteId(auteurId, recetteId)
                    .orElseThrow(() -> new RuntimeException("Like non trouvé"));
            likeRepository.delete(like);
            return false;
        } else {
            Like like = new Like();
            like.setAuteur(auteur);
            like.setRecette(recette);
            likeRepository.save(like);
            notificationService.notifierLike(
                    recette.getAuteur().getId(),
                    auteur.getId(),
                    auteur.getPseudo(),
                    recette.getTitre(),
                    recetteId
            );
            return true;
        }
    }

    public Long countLikesByRecette(Long recetteId) {
        return likeRepository.countByRecetteId(recetteId);
    }

    public Boolean hasUserLikedRecette(Long utilisateurId, Long recetteId) {
        return likeRepository.existsByAuteurIdAndRecetteId(utilisateurId, recetteId);
    }

    public List<Like> findByAuteurId(Long auteurId) {
        return likeRepository.findByAuteurId(auteurId);
    }
}
