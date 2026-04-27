package com.auction.auction_system.service;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.auction.auction_system.model.Bid;
import com.auction.auction_system.model.Product;
import com.auction.auction_system.model.User;
import com.auction.auction_system.repository.BidRepository;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.repository.UserRepository;
import com.auction.auction_system.controller.BidWebSocketController;
@Service

public class BidService {
	 @Autowired
	    private BidRepository bidRepo;

	    @Autowired
	    private ProductRepository productRepo;

	    @Autowired
	    private UserRepository userRepo;
	   
	    @Autowired
	    private BidWebSocketController webSocketController;


	    public String placeBid(Long userId, Long productId, double amount) {
	    	

	        Product product = productRepo.findById(productId).orElse(null);
	        User user = userRepo.findById(userId).orElse(null);

	        if (product == null || user == null) {
	            return "Invalid user or product";
	        }

	        // ❌ Owner cannot bid on their own product
	        if (userId.equals(product.getOwnerId())) {
	            return "Owner cannot bid on their own product";
	        }

	        LocalDateTime now = LocalDateTime.now();

	     // ❌ Auction ended
	     if (now.isAfter(product.getEndTime())) {

	         product.setClosed(true);
	         productRepo.save(product);

	         if (product.getWinnerUserId() == null) {
	             return "Auction ended. No bids placed.";
	         }

	         User winner = userRepo.findById(product.getWinnerUserId()).orElse(null);

	         return "Auction ended. Winner: " + (winner != null ? winner.getName() : "Unknown");
	     }

	     // ❌ Auction not started
	     if (now.isBefore(product.getStartTime())) {
	         return "Auction not started yet";
	     }

	     // ❌ Already closed
	     if (product.isClosed()) {
	         return "Auction already closed";
	     }

	     // ❌ Same user bidding again
	     if (user.getId().equals(product.getWinnerUserId())) {
	         return "You are already highest bidder";
	     }

	     // ❌ Lower bid
	     if (amount <= product.getCurrentHighestBid()) {
	         return "Bid must be higher than current highest bid (₹" + product.getCurrentHighestBid() + ")";
	     }

	     // ❌ Minimum increment check (only if there was a previous bid, otherwise amount must be >= basePrice)
	     double minNextBid = product.getCurrentHighestBid() == product.getBasePrice() && product.getWinnerUserId() == null ? product.getBasePrice() : product.getCurrentHighestBid() + 100;
	     
	     if (amount < minNextBid) {
	         return "Minimum next bid is ₹" + minNextBid;
	     }

	  // ✅ Identify previous winner
	     Long previousWinnerId = product.getWinnerUserId();

	  // ✅ Update product
	     product.setCurrentHighestBid(amount);
	     product.setWinnerUserId(userId);
	     productRepo.save(product);

	     // ✅ Save bid
	     Bid bid = new Bid();
	     bid.setUser(user);
	     bid.setProduct(product);
	     bid.setAmount(amount);
	     bid.setBidTime(LocalDateTime.now());

	     bidRepo.save(bid);

	     System.out.println(" Sending WebSocket update");

	     webSocketController.sendBidUpdate(bid);

	     // ✅ Send outbid notification
	     if (previousWinnerId != null && !previousWinnerId.equals(userId)) {
	         Map<String, Object> outbidNotif = new HashMap<>();
	         outbidNotif.put("type", "OUTBID");
	         outbidNotif.put("productName", product.getName());
	         outbidNotif.put("productId", product.getId());
	         webSocketController.sendUserNotification(previousWinnerId, outbidNotif);
	     }

	     return "Bid placed successfully!";

}
}
