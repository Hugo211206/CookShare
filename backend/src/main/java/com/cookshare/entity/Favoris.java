package com.cookshare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "favoris", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"auteur_id", "recette_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favoris {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "auteur_id", nullable = false)
    private Utilisateur auteur;

    @ManyToOne
    @JoinColumn(name = "recette_id", nullable = false)
    private Recette recette;

    @Column(name = "date_sauvegarde", nullable = false)
    private LocalDateTime dateSauvegarde;

    @PrePersist
    protected void onCreate() {
        if (dateSauvegarde == null) {
            dateSauvegarde = LocalDateTime.now();
        }
    }
}