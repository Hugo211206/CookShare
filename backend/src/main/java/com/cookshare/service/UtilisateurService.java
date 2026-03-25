package com.cookshare.service;

import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public Utilisateur updateUtilisateur(Long id, Utilisateur utilisateurDetails) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));

        if (utilisateurDetails.getPseudo() != null) {
            utilisateur.setPseudo(utilisateurDetails.getPseudo());
        }
        if (utilisateurDetails.getBio() != null) {
            utilisateur.setBio(utilisateurDetails.getBio());
        }
        if (utilisateurDetails.getPhotoProfilUrl() != null) {
            utilisateur.setPhotoProfilUrl(utilisateurDetails.getPhotoProfilUrl());
        }

        return utilisateurRepository.save(utilisateur);
    }

    public void deleteUtilisateur(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé avec l'id : " + id);
        }
        utilisateurRepository.deleteById(id);
    }

    public Optional<Utilisateur> getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id);
    }


    public Optional<Utilisateur> getUtilisateurByPseudo(String pseudo) {
        return utilisateurRepository.findByPseudo(pseudo);
    }

    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }
}