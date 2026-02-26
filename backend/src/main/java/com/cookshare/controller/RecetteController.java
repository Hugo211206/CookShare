package com.cookshare.controller;


import com.cookshare.dto.RecetteDTO;
import com.cookshare.entity.Recette;
import com.cookshare.service.CuisineService;
import com.cookshare.service.RecetteService;
import com.cookshare.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/recettes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RecetteController {

    private final RecetteService recetteService;
    private final UtilisateurService utilisateurService;
    private final CuisineService cuisineService;


    @PostMapping
    public ResponseEntity<Recette> creerRecette(@RequestBody RecetteDTO recetteDTO) {
        try {
            Recette nouvelleRecette = recetteService.createRecette(recetteDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouvelleRecette);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Recette>> listerRecette() {
        List<Recette> recettes = recetteService.findAllRecette();
        return new ResponseEntity<>(recettes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recette> getRecetteById(@PathVariable Long id) {
        return recetteService.findRecetteByID(id)
                .map(recette -> new ResponseEntity<>(recette, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recette> updateRecette(@PathVariable Long id, @RequestBody Recette recetteDetails) {
        try {
            Recette recetteMisAJour = recetteService.updateRecette(id, recetteDetails);
            return new ResponseEntity<>(recetteMisAJour, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Recette> deleteRecette(@PathVariable Long id) {
        try {
            recetteService.deleteRecette(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/auteur/{auteurId}")
    public ResponseEntity<List<Recette>> getRecettesByAuteur(@PathVariable Long auteurId) {
        return utilisateurService.getUtilisateurById(auteurId)
                .map(auteur -> {
                    List<Recette> recettes = recetteService.findRecetteByAuteur(auteur);
                    return ResponseEntity.ok(recettes);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Recette>> searchByTitre(@RequestParam String titre) {
        List<Recette> recettes = recetteService.findByTitreContaining(titre);
        return ResponseEntity.ok(recettes);
    }

    @GetMapping("/difficulte/{difficulte}")
    public ResponseEntity<List<Recette>> getRecettesByDifficulte(@PathVariable String difficulte) {
        try {
            Recette.DifficulteEnum difficultEnum = Recette.DifficulteEnum.valueOf(difficulte.toUpperCase());
            List<Recette> recettes = recetteService.findByDifficulte(difficultEnum);
            return ResponseEntity.ok(recettes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/type/{typePlat}")
    public ResponseEntity<List<Recette>> getRecettesByTypePlat(@PathVariable String typePlat) {
        try {
            Recette.TypePlat typePlatEnum = Recette.TypePlat.valueOf(typePlat.toUpperCase());
            List<Recette> recettes = recetteService.findByTypePlate(typePlatEnum);
            return ResponseEntity.ok(recettes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/cuisine/{cuisineId}")
    public ResponseEntity<List<Recette>> getRecettesByCuisine(@PathVariable Long cuisineId) {
        return cuisineService.getCuisineById(cuisineId)
                .map(cuisine -> {
                    List<Recette> recettes = recetteService.findByCuisine(cuisine);
                    return ResponseEntity.ok(recettes);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
