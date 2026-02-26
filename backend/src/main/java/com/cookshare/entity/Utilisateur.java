package com.cookshare.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String prenom;

    @Column(nullable = false, unique = true, length = 50)
    private String nom;

    @Column(nullable = false, unique = true, length = 50)
    private String pseudo;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(length = 500)
    private String bio;

    @Column(name = "photo_profil_url")
    private String photoProfilUrl;

    @CreatedDate
    @Column(name = "creation_compte", nullable = false, updatable = false)
    private LocalDateTime creationCompte;

    @PrePersist
    protected void onCreate() {
        creationCompte = LocalDateTime.now();
    }

    @JsonIgnore
    @OneToMany(mappedBy = "auteur", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Recette> recettes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "auteur", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Commentaire> commentaires = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "auteur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>();

    public Utilisateur(String pseudo, String email, String motDePasse) {
        this.pseudo = pseudo;
        this.email = email;
        this.motDePasse = motDePasse;
        this.isVerified = false;
    }
}