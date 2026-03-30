package com.cookshare.service;

import com.cookshare.entity.QuantiteIngredient;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Ingredient;
import com.cookshare.dto.IngredientDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class QuantiteIngredientService {

    private final IngredientService ingredientService;

    public List<QuantiteIngredient> creerQuantitesIngredients(
            Recette recette,
            List<IngredientDTO> ingredientsDTO) {

        List<QuantiteIngredient> quantites = new ArrayList<>();

        for (IngredientDTO dto : ingredientsDTO) {
            Ingredient ingredient = ingredientService.findIngredientById(dto.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingrédient non trouvé"));

            QuantiteIngredient quantite = new QuantiteIngredient();
            quantite.setRecette(recette);
            quantite.setIngredient(ingredient);
            quantite.setValeur(dto.getValeur());
            quantite.setUnite(dto.getUnite());

            quantites.add(quantite);
        }

        return quantites;
    }
}