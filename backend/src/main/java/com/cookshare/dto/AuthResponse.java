package com.cookshare.dto;

import com.cookshare.entity.Utilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Utilisateur utilisateur;
}