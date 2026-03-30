package com.cookshare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "liste_courses", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"auteur_id", "recette_id", "ingredient_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListeCourses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "auteur_id", nullable = false)
    private Utilisateur auteur;

    @ManyToOne
    @JoinColumn(name = "recette_id", nullable = false)
    private Recette recette;

    @ManyToOne
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "est_achete", nullable = false)
    private Boolean estAchete = false;
}