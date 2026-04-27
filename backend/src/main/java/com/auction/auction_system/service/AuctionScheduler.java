package com.auction.auction_system.service;

import com.auction.auction_system.model.Product;
import com.auction.auction_system.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionScheduler {
	@Autowired
    private ProductRepository productRepo;
	@Autowired
	private com.auction.auction_system.controller.BidWebSocketController webSocketController;

    // ⏱️ Runs every 10 seconds
    @Scheduled(fixedRate = 10000)
    public void closeExpiredAuctions() {

        List<Product> products = productRepo.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (Product product : products) {

            // If auction ended but not closed
            if (!product.isClosed() && now.isAfter(product.getEndTime())) {

                product.setClosed(true);
                productRepo.save(product);

                System.out.println("Auction closed for product: " + product.getName());
                webSocketController.sendUpdate("/topic/status", product);
            }
        }
    }

}
