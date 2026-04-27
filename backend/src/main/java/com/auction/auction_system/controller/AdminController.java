package com.auction.auction_system.controller;

import com.auction.auction_system.model.Product;
import com.auction.auction_system.model.User;
import com.auction.auction_system.model.Bid;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.repository.UserRepository;
import com.auction.auction_system.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private BidRepository bidRepo;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public String deleteUser(@PathVariable Long id) {
        List<Bid> bids = bidRepo.findByUserIdOrderByBidTimeDesc(id);
        if (bids != null) {
            bidRepo.deleteAll(bids);
        }
        userRepo.deleteById(id);
        return "User deleted successfully";
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public String deleteProduct(@PathVariable Long id) {
        List<Bid> bids = bidRepo.findByProductIdOrderByAmountDesc(id);
        if (bids != null) {
            bidRepo.deleteAll(bids);
        }
        productRepo.deleteById(id);
        return "Product deleted successfully";
    }
}
