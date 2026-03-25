package com.cookshare.controller;

import com.cookshare.entity.ListeCourses;
import com.cookshare.service.ListeCoursesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/liste-courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ListeCoursesController {

    private final ListeCoursesService listeCoursesService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleIngredient(
            @RequestBody Map<String, Long> body) {
        try {
            Long auteurId = body.get("auteurId");
            Long recetteId = body.get("recetteId");
            Long ingredientId = body.get("ingredientId");

            boolean estAchete = listeCoursesService.toggleIngredient(auteurId, recetteId, ingredientId);

            return ResponseEntity.ok(Map.of(
                    "estAchete", estAchete,
                    "message", estAchete ? "Ingrédient acheté" : "Ingrédient non acheté"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recette/{recetteId}/auteur/{auteurId}")
    public ResponseEntity<List<ListeCourses>> getListeCourses(
            @PathVariable Long recetteId,
            @PathVariable Long auteurId) {
        List<ListeCourses> liste = listeCoursesService.getListeCourses(auteurId, recetteId);
        return ResponseEntity.ok(liste);
    }


    @DeleteMapping("/recette/{recetteId}/auteur/{auteurId}")
    public ResponseEntity<Void> resetListeCourses(
            @PathVariable Long recetteId,
            @PathVariable Long auteurId) {
        try {
            listeCoursesService.resetListeCourses(auteurId, recetteId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}