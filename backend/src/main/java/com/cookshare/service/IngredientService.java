package com.cookshare.service;


import com.cookshare.entity.Ingredient;
import com.cookshare.repository.IngredientRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public Ingredient createIngredient(Ingredient ingredient) {
        if (ingredientRepository.existsByNom(ingredient.getNom())) {
            throw new EntityExistsException("L'ingrédient " + ingredient.getNom() + " existe déjà");
        }
        return ingredientRepository.save(ingredient);
    }

    public Ingredient updateIngredient(Long id, Ingredient ingredientDetails) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingrédient non trouvé"));

        if (ingredientDetails.getNom() != null) {
            ingredient.setNom(ingredientDetails.getNom());
        }

        return ingredientRepository.save(ingredient);
    }

    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new RuntimeException("Ingrédient non trouvé");
        }
        ingredientRepository.deleteById(id);
    }

    public Optional<Ingredient> findIngredientByNom(String nom) {
        return ingredientRepository.findByNom(nom);
    }

    public List<Ingredient> findAll() {
        return ingredientRepository.findAll();
    }

    public Optional<Ingredient> findIngredientById(Long id) {
        return ingredientRepository.findById(id);
    }

    public List<Ingredient> searchIngredients(String nom) {
        return ingredientRepository.findByNomContainingIgnoreCase(nom);
    }
}
