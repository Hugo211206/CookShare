package com.cookshare.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessage {
    private String pseudo;
    private String contenu;
    private String timestamp;
}
