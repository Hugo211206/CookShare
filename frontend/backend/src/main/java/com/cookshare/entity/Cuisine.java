package com.cookshare.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cuisines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuisine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @JsonIgnore
    @OneToMany(mappedBy = "cuisine", cascade = CascadeType.ALL)
    private List<Recette> recettes = new ArrayList<>();

    public Cuisine(String nom) {
        this.nom = nom;
    }
}