package com.cookshare.service;

import com.cookshare.dto.RecetteDTO;
import com.cookshare.entity.Cuisine;
import com.cookshare.entity.QuantiteIngredient;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.CuisineRepository;
import com.cookshare.repository.RecetteRepository;
import com.cookshare.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class RecetteService {

    private final RecetteRepository recetteRepository;
    private final UtilisateurService utilisateurService;
    private final CuisineService cuisineService;
    private final QuantiteIngredientService quantiteIngredientService;


    public Recette createRecette(RecetteDTO recetteDTO) {
        if (recetteDTO.getTitre() == null || recetteDTO.getTitre().isEmpty()) {
            throw new RuntimeException("Titre obligatoire");
        }

        Utilisateur auteur = utilisateurService.getUtilisateurById(recetteDTO.getAuteurId()).orElseThrow(() -> new RuntimeException("Auteur non trouvé"));

        Cuisine cuisine = null;
        if (recetteDTO.getCuisineId() != null) {
            cuisine = cuisineService.getCuisineById(recetteDTO.getCuisineId()).orElseThrow(() -> new RuntimeException("Cuisine non trouvé"));
        }

        Recette recette = new Recette();
        recette.setTitre(recetteDTO.getTitre());
        recette.setDescription(recetteDTO.getDescription());
        recette.setInstructions(recetteDTO.getInstructions());
        recette.setDifficulte(recetteDTO.getDifficulte());
        recette.setTypePlat(recetteDTO.getTypePlat());
        recette.setAuteur(auteur);
        recette.setCuisine(cuisine);

        if (recetteDTO.getIngredients() != null && !recetteDTO.getIngredients().isEmpty()) {
            List<QuantiteIngredient> quantites = quantiteIngredientService
                    .creerQuantitesIngredients(recette, recetteDTO.getIngredients());
            recette.setIngredients(quantites);
        }return recetteRepository.save(recette);
    }

    public Recette updateRecette(Long id, Recette recetteDetails) {
        Recette recette = recetteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));

        if (recetteDetails.getTitre() != null) {
            recette.setTitre(recetteDetails.getTitre());
        }
        if (recetteDetails.getDescription() != null) {
            recette.setDescription(recetteDetails.getDescription());
        }
        if (recetteDetails.getInstructions() != null) {
            recette.setInstructions(recetteDetails.getInstructions());
        }
        if (recetteDetails.getDifficulte() != null) {
            recette.setDifficulte(recetteDetails.getDifficulte());
        }
        if (recetteDetails.getTypePlat() != null) {
            recette.setTypePlat(recetteDetails.getTypePlat());
        }
        if (recetteDetails.getCuisine() != null) {
            recette.setCuisine(recetteDetails.getCuisine());
        }

        return recetteRepository.save(recette);
    }

    public void deleteRecette(Long id) {
        if (!recetteRepository.existsById(id)) {
            throw new RuntimeException("Recette non trouvée avec l'id : " + id);
        }
        recetteRepository.deleteById(id);
    }

    public List<Recette> findAllRecette() {
        return recetteRepository.findAll();
    }

    public Optional<Recette> findRecetteByID(Long id) {
        return recetteRepository.findById(id);
    }

    public List<Recette> findRecetteByAuteur(Utilisateur auteur) {
        return recetteRepository.findByAuteur(auteur);
    }

    public List<Recette> findByDifficulte (Recette.DifficulteEnum difficulte) {
        return recetteRepository.findByDifficulte(difficulte);
    }

    public List<Recette> findByTitreContaining(String titre) {
        return recetteRepository.findByTitreContaining(titre);
    }

    public List<Recette> findByCuisine(Cuisine cuisine) {
        return recetteRepository.findByCuisine(cuisine);
    }

    public List<Recette> findByTypePlate(Recette.TypePlat typePlat) {
        return recetteRepository.findByTypePlat(typePlat);
    }

    public List<Recette> OrderByDatePublicationDesc(Utilisateur utilisateur) {
        return recetteRepository.OrderByDatePublicationDesc();
    }

    public List<Recette> OrderByDatePublicationAsc(Utilisateur utilisateur) {
        return recetteRepository.OrderByDatePublicationAsc();
    }

    public List<Recette> findByAuteurOrderByDatePublicationDesc(Utilisateur auteur) {
        return recetteRepository.findByAuteurOrderByDatePublicationDesc(auteur);
    }

    public List<Recette> findByAuteurPseudo(String pseudo) {
        return recetteRepository.findByAuteurPseudoContainingIgnoreCase(pseudo);
    }

    public List<Recette> findByIngredient(String nom) {
        return recetteRepository.findByIngredientsIngredientNomContainingIgnoreCase(nom);
    }
}
