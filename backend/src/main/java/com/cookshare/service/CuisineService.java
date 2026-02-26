package com.cookshare.service;

import com.cookshare.entity.Cuisine;
import com.cookshare.repository.CuisineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CuisineService {

    private final CuisineRepository cuisineRepository;

    public Cuisine creerCuisine(Cuisine cuisine) {
        if (cuisineRepository.existsByNom(cuisine.getNom())) {
            throw new RuntimeException("Cette cuisine existe déjà");
        }
        return cuisineRepository.save(cuisine);
    }

    public Optional<Cuisine> getCuisineById(Long id) {
        return cuisineRepository.findById(id);
    }

    public Optional<Cuisine> getCuisineByNom(String nom) {
        return cuisineRepository.findByNom(nom);
    }

    public List<Cuisine> getAllCuisines() {
        return cuisineRepository.findAll();
    }

    public Cuisine updateCuisine(Long id, Cuisine cuisineDetails) {
        Cuisine cuisine = cuisineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuisine non trouvée avec l'id : " + id));

        if (cuisineDetails.getNom() != null) {
            cuisine.setNom(cuisineDetails.getNom());
        }

        return cuisineRepository.save(cuisine);
    }


    public void deleteCuisine(Long id) {
        if (!cuisineRepository.existsById(id)) {
            throw new RuntimeException("Cuisine non trouvée avec l'id : " + id);
        }
        cuisineRepository.deleteById(id);
    }
}