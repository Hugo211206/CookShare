package com.cookshare.service;

import com.cookshare.entity.Favoris;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.FavoriRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FavoriService {

    private final FavoriRepository favoriRepository;
    private final RecetteService recetteService;
    private final UtilisateurService utilisateurService;

    public boolean toggleFavori(Long recetteId, Long auteurId) {
        Recette recette = recetteService.findRecetteByID(recetteId)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));

        Utilisateur auteur = utilisateurService.getUtilisateurById(auteurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (favoriRepository.existsByAuteurIdAndRecetteId(auteurId, recetteId)) {
            Favoris favori = favoriRepository.findByAuteurIdAndRecetteId(auteurId, recetteId)
                    .orElseThrow(() -> new RuntimeException("Favori non trouvé"));
            favoriRepository.delete(favori);
            return false;
        } else {
            Favoris favori = new Favoris();
            favori.setAuteur(auteur);
            favori.setRecette(recette);
            favoriRepository.save(favori);
            return true;
        }
    }


    public List<Favoris> getFavorisByAuteur(Long auteurId) {
        return favoriRepository.findByAuteurId(auteurId);
    }

    public Boolean isInFavoris(Long auteurId, Long recetteId) {
        return favoriRepository.existsByAuteurIdAndRecetteId(auteurId, recetteId);
    }
}