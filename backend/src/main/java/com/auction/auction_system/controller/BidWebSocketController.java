package com.auction.auction_system.controller;
import com.auction.auction_system.model.Bid;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class BidWebSocketController {
	 @Autowired
	    private SimpMessagingTemplate messagingTemplate;

	    public void sendBidUpdate(Bid bid) {
	        messagingTemplate.convertAndSend("/topic/bids", bid);
	    }

	    public void sendUpdate(String topic, Object data) {
	        messagingTemplate.convertAndSend(topic, data);
	    }

	    public void sendUserNotification(Long userId, Map<String, Object> notification) {
	        messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
	    }
}
