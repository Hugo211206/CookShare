package com.cookshare.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recette")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Recette {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200, nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @Column(name = "instructions", length = 5000)
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulte")
    private DifficulteEnum difficulte;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_plat")
    private TypePlat typePlat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cuisine_id")
    private Cuisine cuisine;

    @CreatedDate
    @Column(name = "date_publication", updatable = false)
    private LocalDateTime datePublication;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Utilisateur auteur;

    @OneToMany(mappedBy = "recette", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Media> medias = new ArrayList<>();

    @OneToMany(mappedBy = "recette", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<QuantiteIngredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recette", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Commentaire> commentaires = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (datePublication == null) {
            datePublication = LocalDateTime.now();
        }
    }

    public enum DifficulteEnum {
        FACILE,
        MOYEN,
        DIFFICILE
    }

    public enum TypePlat {
        ENTREE,
        PLAT,
        DESSERT,
        SNACK
    }
}


