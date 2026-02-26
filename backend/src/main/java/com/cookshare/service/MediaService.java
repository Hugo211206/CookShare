package com.cookshare.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.cookshare.entity.Media;
import com.cookshare.entity.Recette;
import com.cookshare.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class MediaService {

    private final Cloudinary cloudinary;
    private final RecetteService recetteService;
    private final MediaRepository mediaRepository;

    public Media uploadImageForRecette(Long recetteId, MultipartFile file) throws IOException {

        Recette recette = recetteService.findRecetteByID(recetteId)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));


        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "cookshare/recettes"));

        String imageUrl = (String) uploadResult.get("secure_url");


        Media media = new Media();
        media.setUrl(imageUrl);
        media.setType(Media.TypeMedia.IMAGE);
        media.setRecette(recette);

        recette.getMedias().add(media);

        return media;
    }


    public void deleteMedia(Long mediaId) {

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new RuntimeException("Media non trouvé"));

        String url = media.getUrl();
        String publicId = extractPublicIdFromUrl(url);

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression sur Cloudinary", e);
        }

        mediaRepository.deleteById(mediaId);
    }

    private String extractPublicIdFromUrl(String url) {
        String[] parts = url.split("/upload/");
        if (parts.length < 2) {
            throw new RuntimeException("URL Cloudinary invalide");
        }

        String pathWithExtension = parts[1].substring(parts[1].indexOf("/") + 1);

        int lastDotIndex = pathWithExtension.lastIndexOf(".");
        if (lastDotIndex > 0) {
            return pathWithExtension.substring(0, lastDotIndex);
        }

        return pathWithExtension;
    }
}
