package com.cookshare.repository;

import com.cookshare.entity.Cuisine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CuisineRepository extends JpaRepository<Cuisine,Long> {

    Optional<Cuisine> findByNom(String nom);

    Boolean existsByNom(String nom);

}
