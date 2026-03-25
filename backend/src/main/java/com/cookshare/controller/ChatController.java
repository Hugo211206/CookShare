package com.cookshare.controller;

import com.cookshare.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{sessionId}")
    public void sendMessage(@DestinationVariable String sessionId, ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/chat/" + sessionId, message);
    }
}
