package com.cookshare.controller;


import com.cookshare.entity.Ingredient;
import com.cookshare.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/ingredient")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public Iterable<Ingredient> findAll() {
        return ingredientService.findAll();
    }

    @PostMapping
    public ResponseEntity<Ingredient> creerIngredient(@RequestBody Ingredient ingredient) {
        try {
            Ingredient nouveauIngredient = ingredientService.createIngredient(ingredient);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouveauIngredient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ingredient> modifierIngredient(
            @PathVariable Long id,
            @RequestBody Ingredient ingredientDetails) {
        try {
            Ingredient ingredientMisAJour = ingredientService.updateIngredient(id, ingredientDetails);
            return ResponseEntity.ok(ingredientMisAJour);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerIngredient(@PathVariable Long id) {
        try {
            ingredientService.deleteIngredient(id);
            return ResponseEntity.noContent().build();
        }  catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> findById(@PathVariable Long id) {
        return ingredientService.findIngredientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nom/{nom}")
    public ResponseEntity<Ingredient> findByNom(@PathVariable String nom) {
        return ingredientService.findIngredientByNom(nom)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
