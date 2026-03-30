package com.cookshare.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String pseudo;
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
}