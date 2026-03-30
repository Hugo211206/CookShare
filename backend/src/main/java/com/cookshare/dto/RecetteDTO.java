package com.cookshare.dto;

import com.cookshare.entity.Recette;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecetteDTO {

    private String titre;
    private String description;
    private String instructions;

    private Recette.DifficulteEnum difficulte;
    private Recette.TypePlat typePlat;

    private Long auteurId;
    private Long cuisineId;

    private List<IngredientDTO> ingredients;
}