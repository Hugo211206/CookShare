package com.cookshare.controller;

import com.cookshare.entity.Cuisine;
import com.cookshare.service.CuisineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuisines")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CuisineController {

    private final CuisineService cuisineService;

    @PostMapping
    public ResponseEntity<Cuisine> creerCuisine(@RequestBody Cuisine cuisine) {
        try {
            Cuisine nouvelleCuisine = cuisineService.creerCuisine(cuisine);
            return ResponseEntity.status(HttpStatus.CREATED).body(nouvelleCuisine);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping
    public ResponseEntity<List<Cuisine>> getAllCuisines() {
        List<Cuisine> cuisines = cuisineService.getAllCuisines();
        return ResponseEntity.ok(cuisines);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Cuisine> getCuisineById(@PathVariable Long id) {
        return cuisineService.getCuisineById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nom/{nom}")
    public ResponseEntity<Cuisine> getCuisineByNom(@PathVariable String nom) {
        return cuisineService.getCuisineByNom(nom)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cuisine> updateCuisine(
            @PathVariable Long id,
            @RequestBody Cuisine cuisineDetails) {
        try {
            Cuisine cuisineMiseAJour = cuisineService.updateCuisine(id, cuisineDetails);
            return ResponseEntity.ok(cuisineMiseAJour);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCuisine(@PathVariable Long id) {
        try {
            cuisineService.deleteCuisine(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}