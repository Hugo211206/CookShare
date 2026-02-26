package com.cookshare.service;

import com.cookshare.entity.Ingredient;
import com.cookshare.entity.ListeCourses;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.ListeCoursesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ListeCoursesService {

    private final ListeCoursesRepository listeCoursesRepository;
    private final RecetteService recetteService;
    private final UtilisateurService utilisateurService;
    private final IngredientService ingredientService;

    public boolean toggleIngredient(Long auteurId, Long recetteId, Long ingredientId) {
        Utilisateur auteur = utilisateurService.getUtilisateurById(auteurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Recette recette = recetteService.findRecetteByID(recetteId)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));

        Ingredient ingredient = ingredientService.findIngredientById(ingredientId)
                .orElseThrow(() -> new RuntimeException("Ingrédient non trouvé"));

        if (listeCoursesRepository.existsByAuteurIdAndRecetteIdAndIngredientId(auteurId, recetteId, ingredientId)) {
            ListeCourses item = listeCoursesRepository
                    .findByAuteurIdAndRecetteIdAndIngredientId(auteurId, recetteId, ingredientId)
                    .orElseThrow(() -> new RuntimeException("Item non trouvé"));

            item.setEstAchete(!item.getEstAchete());
            listeCoursesRepository.save(item);
            return item.getEstAchete();
        } else {
            ListeCourses item = new ListeCourses();
            item.setAuteur(auteur);
            item.setRecette(recette);
            item.setIngredient(ingredient);
            item.setEstAchete(true);
            listeCoursesRepository.save(item);
            return true;
        }
    }


    public List<ListeCourses> getListeCourses(Long auteurId, Long recetteId) {
        return listeCoursesRepository.findByAuteurIdAndRecetteId(auteurId, recetteId);
    }


    public void resetListeCourses(Long auteurId, Long recetteId) {
        List<ListeCourses> items = listeCoursesRepository.findByAuteurIdAndRecetteId(auteurId, recetteId);
        listeCoursesRepository.deleteAll(items);
    }
}