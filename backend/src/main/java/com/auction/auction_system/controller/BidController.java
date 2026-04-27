package com.auction.auction_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.auction.auction_system.model.Bid;
import com.auction.auction_system.repository.BidRepository;
import com.auction.auction_system.model.Product;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.service.BidService;

@RestController
@RequestMapping("/bids")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BidService bidService;

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private ProductRepository productRepo;
    
    @PostMapping("/place")
    public String placeBid(@RequestParam Long productId,
                           @RequestParam double amount,
                           @RequestParam Long userId) {   // keep for now
    
        return bidService.placeBid(userId, productId, amount);
    }

    @GetMapping("/product/{productId}")
    public List<Bid> getBidsByProduct(@PathVariable Long productId) {
        return bidRepo.findByProductIdOrderByAmountDesc(productId);
    }

    @GetMapping("/user/{userId}")
    public List<Bid> getBidsByUser(@PathVariable Long userId) {
        return bidRepo.findByUserIdOrderByBidTimeDesc(userId);
    }
    @GetMapping("/my-wins")
    public List<Product> getMyWins(@RequestParam Long userId) {
        return productRepo.findByWinnerUserId(userId);
    }
   
}